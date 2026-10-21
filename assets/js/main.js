(function () {
  'use strict';

  var projects = window.PORTFOLIO_PROJECTS || [];
  var skills = window.PORTFOLIO_SKILLS || [];
  var languages = window.PORTFOLIO_LANGUAGES || [];
  var filters = window.PORTFOLIO_FILTERS || [];
  var timeline = window.PORTFOLIO_TIMELINE || [];
  var dict = window.I18N || { id: {} };

  var byId = {};
  projects.forEach(function (p) { byId[p.id] = p; });

  var $ = function (id) { return document.getElementById(id); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==================================================================
     Language
  ================================================================== */
  var lang = 'id';
  try { if (localStorage.getItem('dp-lang') === 'en') lang = 'en'; } catch (e) { /* storage blocked */ }
  var langListeners = [];

  function t(key, vars) {
    var s = (dict[lang] && dict[lang][key]) || dict.id[key] || key;
    if (vars) s = s.replace(/\{(\w+)\}/g, function (_, k) { return vars[k] != null ? vars[k] : ''; });
    return s;
  }
  // Pick the current-language value of a bilingual field
  function L(v) {
    if (v == null) return '';
    if (typeof v === 'string') return v;
    return v[lang] || v.id || '';
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function num(n, digits) {
    return new Intl.NumberFormat(lang === 'id' ? 'id-ID' : 'en-US', { maximumFractionDigits: digits || 0, minimumFractionDigits: digits || 0 }).format(n);
  }

  function applyStatic() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = t(el.getAttribute('data-i18n')); });
    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(',').forEach(function (pair) {
        var parts = pair.split(':');
        el.setAttribute(parts[0].trim(), t(parts[1].trim()));
      });
    });
    document.title = t('meta.title');
  }

  function setLang(next) {
    lang = next;
    try { localStorage.setItem('dp-lang', lang); } catch (e) { /* ignore */ }
    applyStatic();
    renderAll();
    langListeners.forEach(function (fn) { fn(lang); });
  }

  $('lang-toggle').addEventListener('click', function () { setLang(lang === 'id' ? 'en' : 'id'); });

  /* ==================================================================
     Markup helpers
  ================================================================== */
  function img(image, sizes, extra) {
    var base = image.src;
    var set = image.mobile
      ? base + '-400.webp 400w, ' + base + '-780.webp 780w'
      : base + '-800.webp 800w, ' + base + '-1600.webp 1600w';
    var w = image.mobile ? 400 : 800;
    var h = image.mobile ? 866 : 500;
    return '<img src="' + base + (image.mobile ? '-400' : '-800') + '.webp" srcset="' + set + '" sizes="' + sizes + '" width="' + w + '" height="' + h + '" alt="' + esc(extra || '') + '" loading="lazy" decoding="async">';
  }

  function frame(p, image, sizes) {
    return '<div class="frame">' +
      '<div class="frame__bar"><span class="frame__dots" aria-hidden="true"><i></i><i></i><i></i></span>' +
      '<span class="frame__url" aria-hidden="true">' + esc(p.id) + ' / ' + esc(L(image.name).toLowerCase()) + '</span></div>' +
      img(image, sizes, L(p.name) + ': ' + L(image.name)) +
      '</div>';
  }

  function tagsHTML(p, limit) {
    var list = limit ? p.tags.slice(0, limit) : p.tags;
    return '<div class="tags">' + list.map(function (tag) {
      return '<button type="button" class="chip" data-tag="' + esc(tag) + '">' + esc(tag) + '</button>';
    }).join('') + '</div>';
  }

  function actionsHTML(p, opts) {
    opts = opts || {};
    var out = [];
    if (p.demo) {
      out.push('<button type="button" class="btn btn--small btn--demo" data-demo="' + p.id + '">' + esc(t('card.demo')) + '</button>');
    }
    if (p.repo) {
      out.push('<a class="btn btn--small ' + (p.demo ? 'btn--ghost' : '') + '" href="' + esc(p.repo) + '" target="_blank" rel="noopener">' +
        '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5.5 4.5 2 8l3.5 3.5M10.5 4.5 14 8l-3.5 3.5"/></svg>' +
        esc(t('card.code')) + '<span class="sr-only"> (GitHub)</span></a>');
    }
    if (!opts.noDetails) {
      out.push('<button type="button" class="btn btn--small btn--ghost" data-open="' + p.id + '">' + esc(t('card.details')) + '<span class="sr-only">: ' + esc(L(p.name)) + '</span></button>');
    }
    return '<div class="actions">' + out.join('') + '</div>';
  }

  function factsHTML(p) {
    if (!p.facts) return '';
    return '<dl class="facts">' + p.facts.map(function (f) {
      return '<div><dt>' + esc(f.value) + '</dt><dd>' + esc(L(f.label)) + '</dd></div>';
    }).join('') + '</dl>';
  }

  /* ==================================================================
     Filters
  ================================================================== */
  var state = { filter: 'all' };

  function matches(p) { return state.filter === 'all' || p.tags.indexOf(state.filter) !== -1; }

  function renderFilters() {
    var html = '<button type="button" class="chip" data-filter="all" aria-pressed="' + (state.filter === 'all') + '">' + esc(t('filters.all')) +
      ' <span class="chip__n">' + projects.length + '</span></button>';
    filters.forEach(function (f) {
      var n = projects.filter(function (p) { return p.tags.indexOf(f) !== -1; }).length;
      if (!n) return;
      html += '<button type="button" class="chip" data-filter="' + esc(f) + '" aria-pressed="' + (state.filter === f) + '">' + esc(f) +
        ' <span class="chip__n">' + n + '</span></button>';
    });
    $('filters').innerHTML = html;
  }

  function applyFilter() {
    var shown = 0;
    projects.forEach(function (p) {
      var ok = matches(p);
      if (ok) shown++;
      var node = document.querySelector('[data-project="' + p.id + '"]');
      if (node) node.hidden = !ok;
    });
    ['main', 'lab'].forEach(function (g) {
      var any = projects.some(function (p) { return p.group === g && matches(p); });
      $('group-' + g).hidden = !any;
    });
    document.querySelectorAll('#filters [data-filter]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-filter') === state.filter));
    });
    var status = $('filter-status');
    if (state.filter === 'all') {
      status.textContent = t('filters.showing.all', { total: projects.length });
    } else {
      status.innerHTML = esc(t('filters.showing', { n: shown, total: projects.length, tag: state.filter })) +
        '<button type="button" data-filter="all">' + esc(t('filters.reset')) + '</button>';
    }
  }

  function setFilter(tag, scroll) {
    state.filter = tag;
    applyFilter();
    if (scroll) {
      var top = $('filters').getBoundingClientRect().top;
      if (top < 0 || top > window.innerHeight * 0.6) {
        $('projects').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    }
  }

  /* ==================================================================
     Featured case study
  ================================================================== */
  var featured = projects.filter(function (p) { return p.group === 'featured'; })[0];
  var caseIndex = 0;

  function renderFeatured() {
    var p = featured;
    if (!p) return;
    var first = p.images[caseIndex] || p.images[0];
    $('featured').innerHTML =
      '<article class="case" data-project="' + p.id + '" aria-labelledby="case-name">' +
        '<div class="case__gallery">' +
          '<button type="button" class="case__shot' + (first.mobile ? ' is-mobile' : '') + '" id="case-shot" data-gallery="' + p.id + '" data-index="' + caseIndex + '" aria-label="' + esc(t('case.open', { name: L(first.name) })) + '">' +
            frame(p, first.mobile ? p.images[0] : first, '(max-width: 1000px) 100vw, 720px') +
            '<div class="case__phone"><div class="phone">' + (first.mobile ? img(first, '260px', L(p.name) + ': ' + L(first.name)) : '') + '</div></div>' +
          '</button>' +
          '<div class="case__tabs" role="tablist" aria-label="' + esc(t('case.gallery')) + '">' +
            p.images.map(function (im, i) {
              return '<button type="button" role="tab" class="' + (im.mobile ? 'is-mobile' : '') + '" data-case-tab="' + i + '" aria-selected="' + (i === caseIndex) + '">' +
                img(im, '120px', '') + '<span>' + esc(L(im.name)) + '</span></button>';
            }).join('') +
          '</div>' +
          (p.imageNote ? '<p class="case__note">' + esc(L(p.imageNote)) + '</p>' : '') +
        '</div>' +
        '<div class="case__body">' +
          '<p class="case__kind">' + esc(L(p.kind)) + ', ' + esc(p.year) + '</p>' +
          '<h3 class="case__name" id="case-name">' + esc(L(p.name)) + '</h3>' +
          '<p class="case__title">' + esc(L(p.title)) + '</p>' +
          '<p class="case__summary">' + esc(L(p.summary)) + '</p>' +
          '<p class="case__role"><b>' + esc(t('case.role')) + '</b>' + esc(L(p.role)) + '</p>' +
          factsHTML(p) +
          tagsHTML(p) +
          actionsHTML(p) +
        '</div>' +
      '</article>';
  }

  function showCaseImage(i) {
    var p = featured;
    var im = p.images[i];
    if (!im) return;
    caseIndex = i;
    var shot = $('case-shot');
    document.querySelectorAll('[data-case-tab]').forEach(function (b) {
      b.setAttribute('aria-selected', String(+b.getAttribute('data-case-tab') === i));
    });
    var swap = function () {
      shot.dataset.index = i;
      shot.setAttribute('aria-label', t('case.open', { name: L(im.name) }));
      shot.classList.toggle('is-mobile', !!im.mobile);
      if (im.mobile) {
        shot.querySelector('.phone').innerHTML = img(im, '260px', L(p.name) + ': ' + L(im.name));
      } else {
        shot.querySelector('.frame').outerHTML = frame(p, im, '(max-width: 1000px) 100vw, 720px');
      }
      var newImg = shot.querySelector(im.mobile ? '.phone img' : '.frame img');
      newImg.loading = 'eager';
      var done = function () { shot.classList.remove('is-swapping'); };
      if (newImg.complete) done(); else { newImg.addEventListener('load', done, { once: true }); newImg.addEventListener('error', done, { once: true }); }
    };
    if (reduceMotion) { swap(); return; }
    shot.classList.add('is-swapping');
    setTimeout(swap, 160);
  }

  /* ==================================================================
     Cards and experiments
  ================================================================== */
  function renderMain() {
    $('main-grid').innerHTML = projects.filter(function (p) { return p.group === 'main'; }).map(function (p) {
      return '<article class="card" data-project="' + p.id + '" aria-labelledby="card-' + p.id + '">' +
        '<button type="button" class="card__media" data-gallery="' + p.id + '" data-index="0" aria-label="' + esc(t('case.open', { name: L(p.name) })) + '">' +
          frame(p, p.images[0], '(max-width: 680px) 100vw, (max-width: 1080px) 50vw, 400px') +
          (p.demo ? '<span class="card__badge">' + esc(t('card.live')) + '</span>' : '') +
          (p.images.length > 1 ? '<span class="card__count">' + esc(t('card.images', { n: p.images.length })) + '</span>' : '') +
        '</button>' +
        '<div class="card__body">' +
          '<p class="card__kind">' + esc(L(p.kind)) + ', ' + esc(p.year) + '</p>' +
          '<h4 class="card__name" id="card-' + p.id + '">' + esc(L(p.name)) + '</h4>' +
          '<p class="card__title">' + esc(L(p.title)) + '</p>' +
          tagsHTML(p, 5) +
          actionsHTML(p) +
        '</div>' +
      '</article>';
    }).join('');
  }

  function renderLabs() {
    $('lab-list').innerHTML = projects.filter(function (p) { return p.group === 'lab'; }).map(function (p) {
      return '<article class="lab" data-project="' + p.id + '" aria-labelledby="lab-' + p.id + '">' +
        '<button type="button" class="lab__media" data-demo="' + p.id + '" aria-label="' + esc(t('card.demo') + ': ' + L(p.name)) + '">' +
          img(p.images[0], '(max-width: 560px) 100vw, 320px', '') +
        '</button>' +
        '<div class="lab__body">' +
          '<h4 class="lab__name" id="lab-' + p.id + '">' + esc(L(p.name)) + '</h4>' +
          '<p class="lab__title">' + esc(L(p.title)) + '</p>' +
          tagsHTML(p, 4) +
          actionsHTML(p) +
        '</div>' +
      '</article>';
    }).join('');
  }

  /* ==================================================================
     Dialog helpers (scroll lock + focus return)
  ================================================================== */
  var returnFocus = new WeakMap();
  function openDialog(dlg, trigger) {
    if (trigger) returnFocus.set(dlg, trigger);
    if (!dlg.open) dlg.showModal();
    document.body.classList.add('is-locked');
  }
  function onDialogClose(dlg, extra) {
    dlg.addEventListener('close', function () {
      if (!document.querySelector('dialog[open]')) document.body.classList.remove('is-locked');
      if (extra) extra();
      var tr = returnFocus.get(dlg);
      if (tr && document.body.contains(tr)) tr.focus();
    });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  }

  /* ==================================================================
     Drawer
  ================================================================== */
  var drawer = $('drawer');
  var drawerProject = null;
  onDialogClose(drawer, function () { drawerProject = null; });
  $('drawer-close').addEventListener('click', function () { drawer.close(); });

  function renderDrawer(p) {
    var shots = p.images.map(function (im, i) {
      return '<button type="button" class="' + (im.mobile ? 'is-mobile' : '') + '" data-gallery="' + p.id + '" data-index="' + i + '">' +
        img(im, i === 0 ? '(max-width: 780px) 100vw, 680px' : '(max-width: 780px) 50vw, 340px', '') +
        '<span>' + esc(L(im.name)) + '</span></button>';
    }).join('');
    var list = function (arr) { return '<ul class="d-list">' + arr.map(function (x) { return '<li>' + esc(L(x)) + '</li>'; }).join('') + '</ul>'; };

    $('drawer-content').innerHTML =
      '<p class="d-kind">' + esc(L(p.kind)) + ', ' + esc(p.year) + '</p>' +
      '<h2 class="d-name" id="drawer-title">' + esc(L(p.name)) + '</h2>' +
      '<p class="d-title">' + esc(L(p.title)) + '</p>' +
      '<div class="d-shots">' + shots + '</div>' +
      (p.imageNote ? '<p class="d-note">' + esc(L(p.imageNote)) + '</p>' : '') +
      '<p class="d-summary">' + esc(L(p.summary)) + '</p>' +
      (p.role ? '<h3>' + esc(t('case.role')) + '</h3><p>' + esc(L(p.role)) + '</p>' : '') +
      '<h3>' + esc(t('case.features')) + '</h3>' + list(p.features) +
      '<h3>' + esc(t('case.build')) + '</h3>' + list(p.build) +
      (p.facts ? '<h3>' + esc(t('case.facts')) + '</h3>' + factsHTML(p) : '') +
      '<h3>' + esc(t('case.stack')) + '</h3>' + tagsHTML(p) +
      actionsHTML(p, { noDetails: true });
  }

  function openDrawer(id, trigger) {
    var p = byId[id];
    if (!p) return;
    drawerProject = p;
    renderDrawer(p);
    openDialog(drawer, trigger);
    drawer.scrollTop = 0;
    $('drawer-close').focus();
  }

  /* ==================================================================
     Lightbox
  ================================================================== */
  var lightbox = $('lightbox');
  var lb = { p: null, i: 0 };
  onDialogClose(lightbox);

  function showLightbox() {
    var im = lb.p.images[lb.i];
    var big = im.src + (im.mobile ? '-780' : '-1600') + '.webp';
    var el = $('lightbox-img');
    el.src = big;
    el.alt = L(lb.p.name) + ': ' + L(im.name);
    $('lightbox-caption').textContent = L(lb.p.name) + ': ' + L(im.name);
    $('lightbox-count').textContent = t('gallery.count', { i: lb.i + 1, n: lb.p.images.length });
    $('lightbox-prev').hidden = $('lightbox-next').hidden = lb.p.images.length < 2;
  }
  function openLightbox(id, index, trigger) {
    var p = byId[id];
    if (!p) return;
    lb.p = p; lb.i = index || 0;
    showLightbox();
    openDialog(lightbox, trigger);
  }
  function stepLightbox(d) {
    var n = lb.p.images.length;
    lb.i = (lb.i + d + n) % n;
    showLightbox();
  }
  $('lightbox-close').addEventListener('click', function () { lightbox.close(); });
  $('lightbox-prev').addEventListener('click', function () { stepLightbox(-1); });
  $('lightbox-next').addEventListener('click', function () { stepLightbox(1); });
  lightbox.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); stepLightbox(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); stepLightbox(1); }
  });
  (function swipe() {
    var x0 = null;
    var stage = lightbox.querySelector('.lightbox__stage');
    stage.addEventListener('pointerdown', function (e) { x0 = e.clientX; });
    stage.addEventListener('pointerup', function (e) {
      if (x0 === null) return;
      var dx = e.clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 50 && lb.p.images.length > 1) stepLightbox(dx < 0 ? 1 : -1);
    });
  })();

  /* ==================================================================
     Demo preview
  ================================================================== */
  var preview = $('preview');
  var pv = { p: null, device: 'desktop' };
  var DEVICES = {
    desktop: { w: 1280, h: 800, chrome: 36 },
    tablet: { w: 820, h: 1180, chrome: 0 },
    mobile: { w: 390, h: 844, chrome: 0 },
  };
  var frameEl = $('preview-frame');
  var deviceEl = $('device');

  onDialogClose(preview, function () {
    frameEl.src = 'about:blank';
    pv.p = null;
  });
  $('preview-close').addEventListener('click', function () { preview.close(); });

  function layoutDevice() {
    if (!pv.p) return;
    var d = DEVICES[pv.device];
    var stage = $('preview-stage');
    var pad = window.innerWidth < 600 ? 0 : 48;
    var availW = stage.clientWidth - pad;
    var availH = stage.clientHeight - pad;
    var border = pv.device === 'desktop' ? 2 : pv.device === 'tablet' ? 20 : 22;
    var fullW = d.w + border;
    var fullH = d.h + d.chrome + border;
    var s = Math.min(1, availW / fullW, availH / fullH);
    deviceEl.dataset.device = pv.device;
    deviceEl.style.width = fullW + 'px';
    deviceEl.style.height = fullH + 'px';
    deviceEl.style.position = 'absolute';
    deviceEl.style.left = '50%';
    deviceEl.style.top = '50%';
    deviceEl.style.transform = 'translate(-50%, -50%) scale(' + s.toFixed(4) + ')';
    deviceEl.querySelector('.device__screen').style.height = d.h + 'px';
  }

  function setDevice(name) {
    pv.device = name;
    document.querySelectorAll('#preview-devices [data-device]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-device') === name));
    });
    layoutDevice();
  }

  function openPreview(id, trigger) {
    var p = byId[id];
    if (!p || !p.demo) return;
    pv.p = p;
    $('preview-title').textContent = L(p.name);
    $('preview-kind').textContent = L(p.title);
    var demoUrl = new URL(p.demo, location.href);
    $('preview-url').textContent = (demoUrl.host ? demoUrl.host : '') + demoUrl.pathname.replace(/index\.html$/, '');
    $('preview-newtab').href = p.demo;
    frameEl.title = t('preview.title') + ': ' + L(p.name);
    var tries = p.tryThis || [];
    $('preview-try').hidden = !tries.length;
    $('preview-try-list').innerHTML = tries.map(function (x) { return '<li>' + esc(L(x)) + '</li>'; }).join('');
    $('preview-loading').classList.remove('is-done');
    openDialog(preview, trigger);
    setDevice(window.innerWidth < 700 ? 'mobile' : 'desktop');
    frameEl.src = p.demo;
    $('preview-close').focus();
  }
  frameEl.addEventListener('load', function () {
    if (frameEl.src && frameEl.src !== 'about:blank') $('preview-loading').classList.add('is-done');
  });
  $('preview-devices').addEventListener('click', function (e) {
    var b = e.target.closest('[data-device]');
    if (b) setDevice(b.getAttribute('data-device'));
  });
  $('preview-reload').addEventListener('click', function () {
    if (!pv.p) return;
    $('preview-loading').classList.remove('is-done');
    frameEl.src = pv.p.demo + (pv.p.demo.indexOf('?') === -1 ? '?r=' : '&r=') + Date.now();
  });
  window.addEventListener('resize', layoutDevice);

  /* ==================================================================
     Skills matrix
  ================================================================== */
  function renderMatrix() {
    var cols = projects.filter(function (p) { return p.group !== 'lab'; }).concat(projects.filter(function (p) { return p.group === 'lab'; }));
    var firstLab = cols.findIndex(function (p) { return p.group === 'lab'; });
    var groups = ['backend', 'frontend', 'data', 'tools'];
    var maxCount = cols.length;

    var head = '<thead><tr><th class="mx__corner" scope="col">' + esc(t('skills.tech')) + '</th>' +
      cols.map(function (p, ci) {
        return '<th scope="col" class="mx__proj' + (p.group === 'lab' ? ' mx__proj--lab' : '') + (ci === firstLab ? ' mx__proj--split' : '') + '" data-col="' + ci + '">' +
          '<button type="button" data-open="' + p.id + '">' + esc(L(p.short || p.name)) + '</button></th>';
      }).join('') +
      '<th class="mx__total" scope="col"><span class="sr-only">' + esc(t('skills.count', { n: '' })) + '</span></th></tr></thead>';

    var body = groups.map(function (g) {
      var rows = skills.filter(function (s) { return s.group === g; });
      return '<tbody><tr class="mx__group"><th colspan="' + (cols.length + 2) + '" scope="rowgroup">' + esc(t('skills.group.' + g)) + '</th></tr>' +
        rows.map(function (s) {
          var count = 0;
          var cells = cols.map(function (p, ci) {
            var on = p.stack.indexOf(s.key) !== -1;
            if (on) count++;
            var label = t(on ? 'skills.used' : 'skills.notused', { skill: L(s.name), project: L(p.short || p.name) });
            return '<td class="mx__cell' + (on ? ' is-on' : '') + (ci === firstLab ? ' mx__proj--split' : '') + '" data-col="' + ci + '" title="' + esc(label) + '"><span aria-label="' + esc(label) + '" role="img"></span></td>';
          }).join('');
          return '<tr><th scope="row" class="mx__skill">' + esc(L(s.name)) + '</th>' + cells +
            '<td class="mx__total"><span class="mx__bar"><i style="width:' + Math.round((count / maxCount) * 64) + 'px"></i>' + esc(t('skills.count', { n: count })) + '</span></td></tr>';
        }).join('') + '</tbody>';
    }).join('');

    $('matrix-body').innerHTML = '<table class="mx">' + head + body + '</table>';
  }

  // Row and column highlight
  (function matrixHover() {
    var box = $('matrix-body');
    var clear = function () { box.querySelectorAll('.is-hot, .is-col').forEach(function (n) { n.classList.remove('is-hot', 'is-col'); }); };
    box.addEventListener('pointerover', function (e) {
      clear();
      var cell = e.target.closest('td, th');
      if (!cell) return;
      var row = cell.closest('tr');
      if (row && !row.classList.contains('mx__group') && row.parentNode.tagName === 'TBODY') row.classList.add('is-hot');
      var col = cell.getAttribute('data-col');
      if (col !== null) box.querySelectorAll('[data-col="' + col + '"]').forEach(function (n) { n.classList.add('is-col'); });
    });
    box.addEventListener('pointerleave', clear);
  })();

  /* ==================================================================
     GitHub languages
  ================================================================== */
  function renderLanguages() {
    var total = languages.reduce(function (s, l) { return s + l.bytes; }, 0);
    var max = Math.max.apply(null, languages.map(function (l) { return l.bytes; }));
    $('langs').innerHTML = languages.map(function (l) {
      var pct = (l.bytes / total) * 100;
      var label = pct < 0.1 ? '<0,1%' : num(pct, 1) + '%';
      if (lang === 'en' && pct < 0.1) label = '<0.1%';
      return '<li title="' + esc(num(l.bytes) + ' byte') + '"><span>' + esc(l.name) + '</span>' +
        '<span class="langs__bar" style="width:' + Math.max(0.6, (l.bytes / max) * 100).toFixed(1) + '%"></span>' +
        '<span class="langs__pct">' + label + '</span></li>';
    }).join('');
  }

  /* ==================================================================
     Timeline
  ================================================================== */
  function renderTimeline() {
    $('timeline').innerHTML = timeline.map(function (item, i) {
      var cls = item.project ? 'is-project' : (i === timeline.length - 1 ? 'is-now' : '');
      var title = item.project
        ? '<button type="button" data-open="' + item.project + '">' + esc(L(item.title)) + '</button>'
        : esc(L(item.title));
      return '<li class="' + cls + '"><p class="timeline__date">' + esc(L(item.date)) + '</p>' +
        '<p class="timeline__title">' + title + '</p><p class="timeline__text">' + esc(L(item.text)) + '</p></li>';
    }).join('');
  }

  /* ==================================================================
     Render all + events
  ================================================================== */
  function renderAll() {
    renderFilters();
    renderFeatured();
    renderMain();
    renderLabs();
    applyFilter();
    renderMatrix();
    renderLanguages();
    renderTimeline();
    if (drawerProject && drawer.open) renderDrawer(drawerProject);
    if (lb.p && lightbox.open) showLightbox();
    if (pv.p && preview.open) {
      $('preview-title').textContent = L(pv.p.name);
      $('preview-kind').textContent = L(pv.p.title);
      $('preview-try-list').innerHTML = (pv.p.tryThis || []).map(function (x) { return '<li>' + esc(L(x)) + '</li>'; }).join('');
    }
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-open], [data-demo], [data-gallery], [data-tag], [data-filter], [data-case-tab]');
    if (!el) return;
    if (el.hasAttribute('data-case-tab')) {
      showCaseImage(+el.getAttribute('data-case-tab'));
    } else if (el.hasAttribute('data-demo')) {
      if (drawer.open) drawer.close();
      openPreview(el.getAttribute('data-demo'), el);
    } else if (el.hasAttribute('data-gallery')) {
      openLightbox(el.getAttribute('data-gallery'), +el.getAttribute('data-index') || 0, el);
    } else if (el.hasAttribute('data-open')) {
      openDrawer(el.getAttribute('data-open'), el);
    } else if (el.hasAttribute('data-filter')) {
      setFilter(el.getAttribute('data-filter'), false);
    } else if (el.hasAttribute('data-tag')) {
      if (drawer.open) drawer.close();
      setFilter(el.getAttribute('data-tag'), true);
    }
  });

  // Keyboard: arrow keys move between case-study tabs
  document.addEventListener('keydown', function (e) {
    var tab = e.target.closest && e.target.closest('[data-case-tab]');
    if (!tab || (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft')) return;
    var n = featured.images.length;
    var i = (+tab.getAttribute('data-case-tab') + (e.key === 'ArrowRight' ? 1 : -1) + n) % n;
    showCaseImage(i);
    document.querySelector('[data-case-tab="' + i + '"]').focus();
  });

  /* ==================================================================
     Navigation: tone over the dark hero, active section, mobile sheet
  ================================================================== */
  var nav = $('nav');
  function updateNavTone() {
    var heroBottom = $('top').getBoundingClientRect().bottom;
    var contact = $('contact').getBoundingClientRect();
    var navH = nav.offsetHeight;
    var overDark = heroBottom > navH || (contact.top < navH && contact.bottom > navH);
    nav.dataset.tone = overDark ? 'dark' : 'light';
    nav.dataset.scrolled = String(window.scrollY > 8);
  }
  window.addEventListener('scroll', updateNavTone, { passive: true });
  window.addEventListener('resize', updateNavTone);

  if ('IntersectionObserver' in window) {
    var links = document.querySelectorAll('.nav__links a');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + en.target.id)); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['projects', 'skills', 'journey', 'contact'].forEach(function (id) { io.observe($(id)); });
  }

  var sheet = $('sheet');
  function openSheet() {
    sheet.hidden = false;
    $('menu-open').setAttribute('aria-expanded', 'true');
    document.body.classList.add('is-locked');
    $('menu-close').focus();
  }
  function closeSheet() {
    sheet.hidden = true;
    $('menu-open').setAttribute('aria-expanded', 'false');
    if (!document.querySelector('dialog[open]')) document.body.classList.remove('is-locked');
    $('menu-open').focus();
  }
  $('menu-open').addEventListener('click', openSheet);
  $('menu-close').addEventListener('click', closeSheet);
  sheet.addEventListener('click', function (e) { if (e.target.closest('a')) closeSheet(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !sheet.hidden) closeSheet(); });

  /* ==================================================================
     Contact
  ================================================================== */
  $('copy-email').addEventListener('click', function () {
    var email = this.getAttribute('data-email');
    var status = $('copy-status');
    var done = function () {
      status.textContent = t('contact.copied');
      setTimeout(function () { status.textContent = ''; }, 2600);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(done, function () { status.textContent = email; });
    } else {
      status.textContent = email;
    }
  });
  $('year').textContent = new Date().getFullYear();

  /* ==================================================================
     Public API for scene.js
  ================================================================== */
  window.Portfolio = {
    t: t,
    L: L,
    lang: function () { return lang; },
    onLang: function (fn) { langListeners.push(fn); },
  };

  applyStatic();
  renderAll();
  updateNavTone();
})();
