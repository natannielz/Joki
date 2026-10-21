/*
  Tiny SVG chart helpers for the notebook output: horizontal bars, a line,
  and a plain table. One series per chart, so the title names it and no
  legend is needed. Every mark has a hover tooltip; tables carry the values.
*/
(function () {
  'use strict';

  var C = {
    mark: '#16884f',
    surface: '#ffffff',
    grid: '#e6e8e4',
    axis: '#c9cdc6',
    text: '#1d2420',
    muted: '#5f6862',
  };
  var FONT = '13px "Source Sans 3", "Segoe UI", sans-serif';
  var NS = 'http://www.w3.org/2000/svg';

  var tip = null;
  var measureCtx = document.createElement('canvas').getContext('2d');

  function textWidth(s, font) {
    measureCtx.font = font || FONT;
    return measureCtx.measureText(s).width;
  }

  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  // Indonesian number format; dp = fixed decimals so 11 and 11,6 line up as 11,0 and 11,6
  function fmt(v, unit, dp) {
    return v.toLocaleString('id-ID', { minimumFractionDigits: dp || 0, maximumFractionDigits: dp || 0 }) + (unit || '');
  }

  // Clean tick step (1, 2 or 5 × 10^n) giving about five gridlines
  function niceStep(max) {
    var raw = Math.max(max, 1) / 5;
    var p = Math.pow(10, Math.floor(Math.log10(raw)));
    var steps = [1, 2, 5, 10];
    for (var i = 0; i < steps.length; i++) if (steps[i] * p >= raw) return steps[i] * p;
    return 10 * p;
  }

  function showTip(html, x, y) {
    if (!tip) tip = document.getElementById('tip');
    tip.innerHTML = html;
    tip.hidden = false;
    var r = tip.getBoundingClientRect();
    var left = Math.min(window.innerWidth - r.width - 8, Math.max(8, x - r.width / 2));
    var top = y - r.height - 12;
    if (top < 8) top = y + 16;
    tip.style.left = left + 'px';
    tip.style.top = top + 'px';
  }
  function hideTip() { if (tip) tip.hidden = true; }

  function frame(container, title) {
    var fig = document.createElement('figure');
    fig.className = 'chart';
    var cap = document.createElement('figcaption');
    cap.textContent = title;
    fig.appendChild(cap);
    container.appendChild(fig);
    return fig;
  }

  // Redraw on resize so text stays at its real size
  function responsive(fig, draw) {
    draw();
    if ('ResizeObserver' in window) {
      var lastW = fig.clientWidth;
      new ResizeObserver(function () {
        if (Math.abs(fig.clientWidth - lastW) > 4) { lastW = fig.clientWidth; draw(); }
      }).observe(fig);
    }
  }

  /* ---------- horizontal bars ---------- */
  function bars(container, spec) {
    var fig = frame(container, spec.title);
    responsive(fig, function () {
      var old = fig.querySelector('svg');
      if (old) old.remove();

      var W = Math.max(280, fig.clientWidth);
      var rowH = 34, barH = 18, top = 4;
      var dp = spec.values.some(function (v) { return v % 1 !== 0; }) ? 1 : 0;
      var labelW = Math.max.apply(null, spec.labels.map(function (l) { return textWidth(l); })) + 14;
      var valueW = Math.max.apply(null, spec.values.map(function (v) { return textWidth(fmt(v, spec.unit, dp)); })) + 12;
      var plotW = Math.max(60, W - labelW - valueW);
      var max = Math.max.apply(null, spec.values) || 1;
      var H = top + spec.labels.length * rowH + 4;

      var svg = el('svg', { width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': spec.title });
      el('line', { x1: labelW + 0.5, x2: labelW + 0.5, y1: 0, y2: H, stroke: C.axis, 'stroke-width': 1 }, svg);

      spec.labels.forEach(function (label, i) {
        var v = spec.values[i];
        var y = top + i * rowH;
        var w = Math.max(2, (v / max) * plotW);
        var g = el('g', { class: 'bar', tabindex: '0', 'aria-label': label + ': ' + fmt(v, spec.unit, dp) }, svg);
        el('rect', { x: 0, y: y, width: W, height: rowH, fill: 'transparent' }, g); // hit target
        var label_ = el('text', { x: labelW - 10, y: y + rowH / 2, 'text-anchor': 'end', 'dominant-baseline': 'middle', fill: C.text, style: 'font:' + FONT }, g);
        label_.textContent = label;
        var x0 = labelW + 1, yb = y + (rowH - barH) / 2, r = Math.min(4, w / 2);
        el('path', {
          d: 'M' + x0 + ',' + yb + 'h' + (w - r) + 'a' + r + ',' + r + ' 0 0 1 ' + r + ',' + r +
             'v' + (barH - 2 * r) + 'a' + r + ',' + r + ' 0 0 1 ' + (-r) + ',' + r + 'h' + (-(w - r)) + 'z',
          fill: C.mark,
        }, g);
        var val = el('text', { x: x0 + w + 6, y: y + rowH / 2, 'dominant-baseline': 'middle', fill: C.muted, style: 'font:' + FONT }, g);
        val.textContent = fmt(v, spec.unit, dp);

        var show = function (e) {
          var b = g.getBoundingClientRect();
          showTip('<b>' + label + '</b><br>' + fmt(v, spec.unit, dp), e && e.clientX ? e.clientX : b.left + labelW + w, b.top + 2);
          g.classList.add('is-hover');
        };
        var hide = function () { hideTip(); g.classList.remove('is-hover'); };
        g.addEventListener('pointermove', show);
        g.addEventListener('pointerleave', hide);
        g.addEventListener('focus', function () { show(null); });
        g.addEventListener('blur', hide);
      });
      fig.appendChild(svg);
    });
  }

  /* ---------- line ---------- */
  function line(container, spec) {
    var fig = frame(container, spec.title);
    responsive(fig, function () {
      var old = fig.querySelector('svg');
      if (old) old.remove();

      var W = Math.max(300, fig.clientWidth);
      var H = 260;
      var pad = { l: 40, r: 44, t: 14, b: 30 };
      var plotW = W - pad.l - pad.r, plotH = H - pad.t - pad.b;
      var dataMax = Math.max.apply(null, spec.values);
      var step = niceStep(dataMax);
      var ticks = Math.max(1, Math.ceil((dataMax * 1.04) / step));
      var max = step * ticks;
      var n = spec.values.length;
      var x = function (i) { return pad.l + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW); };
      var y = function (v) { return pad.t + plotH - (v / max) * plotH; };

      var svg = el('svg', { width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': spec.title });

      for (var t = 0; t <= ticks; t++) {
        var tv = step * t;
        var ty = Math.round(y(tv)) + 0.5;
        el('line', { x1: pad.l, x2: W - pad.r, y1: ty, y2: ty, stroke: t === 0 ? C.axis : C.grid, 'stroke-width': 1 }, svg);
        var tl = el('text', { x: pad.l - 8, y: ty, 'text-anchor': 'end', 'dominant-baseline': 'middle', fill: C.muted, style: 'font:12px "Source Sans 3", sans-serif' }, svg);
        tl.textContent = fmt(Math.round(tv));
      }
      var every = W < 480 ? 2 : 1;
      spec.labels.forEach(function (l, i) {
        if (i % every) return;
        var xl = el('text', { x: x(i), y: H - 8, 'text-anchor': 'middle', fill: C.muted, style: 'font:12px "Source Sans 3", sans-serif' }, svg);
        xl.textContent = l;
      });

      var d = spec.values.map(function (v, i) { return (i ? 'L' : 'M') + x(i).toFixed(1) + ',' + y(v).toFixed(1); }).join('');
      el('path', { d: d, fill: 'none', stroke: C.mark, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, svg);

      // End marker + direct label at the end of the line
      var li = n - 1;
      el('circle', { cx: x(li), cy: y(spec.values[li]), r: 4, fill: C.mark, stroke: C.surface, 'stroke-width': 2 }, svg);
      var endLabel = el('text', { x: x(li) + 8, y: y(spec.values[li]), 'dominant-baseline': 'middle', fill: C.text, style: 'font:600 13px "Source Sans 3", sans-serif' }, svg);
      endLabel.textContent = fmt(spec.values[li], spec.unit);

      // Hover: crosshair + focus dot + tooltip
      var cross = el('line', { y1: pad.t, y2: pad.t + plotH, stroke: C.axis, 'stroke-width': 1, visibility: 'hidden' }, svg);
      var dot = el('circle', { r: 5, fill: C.mark, stroke: C.surface, 'stroke-width': 2, visibility: 'hidden' }, svg);
      var hit = el('rect', { x: pad.l - 10, y: 0, width: plotW + 20, height: H, fill: 'transparent', tabindex: '0', 'aria-label': spec.title + '. Use left and right arrow keys to read values.' }, svg);
      var current = -1;

      function focusAt(i, clientX, clientY) {
        current = i;
        var px = x(i), py = y(spec.values[i]);
        cross.setAttribute('x1', px); cross.setAttribute('x2', px); cross.setAttribute('visibility', 'visible');
        dot.setAttribute('cx', px); dot.setAttribute('cy', py); dot.setAttribute('visibility', 'visible');
        var b = svg.getBoundingClientRect();
        showTip('<b>' + spec.labels[i] + '</b><br>' + fmt(spec.values[i], spec.unit), clientX || b.left + px, clientY || b.top + py);
      }
      function clear() {
        current = -1;
        cross.setAttribute('visibility', 'hidden');
        dot.setAttribute('visibility', 'hidden');
        hideTip();
      }
      hit.addEventListener('pointermove', function (e) {
        var b = svg.getBoundingClientRect();
        var rel = e.clientX - b.left - pad.l;
        var i = Math.max(0, Math.min(n - 1, Math.round((rel / plotW) * (n - 1))));
        var py = b.top + y(spec.values[i]);
        focusAt(i, b.left + x(i), py);
      });
      hit.addEventListener('pointerleave', clear);
      hit.addEventListener('blur', clear);
      hit.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          var i = current < 0 ? n - 1 : current + (e.key === 'ArrowRight' ? 1 : -1);
          focusAt(Math.max(0, Math.min(n - 1, i)));
        }
      });

      fig.appendChild(svg);
    });
  }

  /* ---------- table ---------- */
  function table(container, spec) {
    var wrap = document.createElement('div');
    wrap.className = 'table-wrap';
    var html = '<table><thead><tr>' + spec.columns.map(function (c) { return '<th scope="col">' + c + '</th>'; }).join('') + '</tr></thead><tbody>';
    html += spec.rows.map(function (r) {
      return '<tr>' + r.map(function (v, i) {
        var numeric = i > 0 && /^[\d.,%\s-]+$/.test(String(v));
        return '<td' + (numeric ? ' class="num"' : '') + '>' + String(v).replace(/</g, '&lt;') + '</td>';
      }).join('') + '</tr>';
    }).join('');
    wrap.innerHTML = html + '</tbody></table>';
    container.appendChild(wrap);
  }

  /* ---------- heatmap (one green hue, light to dark = low to high) ---------- */
  var RAMP = ['#e8f5ec', '#c2e4cd', '#8ccca4', '#4dab78', '#1c8a52', '#0d5f37'];

  function hexToRgb(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  function rampColor(t) {
    t = Math.max(0, Math.min(1, t));
    var pos = t * (RAMP.length - 1);
    var i = Math.min(RAMP.length - 2, Math.floor(pos));
    var f = pos - i;
    var a = hexToRgb(RAMP[i]), b = hexToRgb(RAMP[i + 1]);
    return 'rgb(' + a.map(function (v, k) { return Math.round(v + (b[k] - v) * f); }).join(',') + ')';
  }

  function heatmap(container, spec) {
    var flat = [];
    spec.values.forEach(function (row) { row.forEach(function (v) { if (v !== null) flat.push(v); }); });
    var min = Math.min.apply(null, flat), max = Math.max.apply(null, flat);
    var span = max - min || 1;
    var fig = frame(container, spec.title);

    var wrap = document.createElement('div');
    wrap.className = 'heat';
    wrap.style.gridTemplateColumns = 'minmax(110px, auto) repeat(' + spec.cols.length + ', minmax(64px, 1fr))';
    var html = '<span class="heat__corner"></span>' + spec.cols.map(function (c) { return '<span class="heat__col">' + c + '</span>'; }).join('');
    spec.rows.forEach(function (r, i) {
      html += '<span class="heat__row">' + r + '</span>';
      spec.cols.forEach(function (c, j) {
        var v = spec.values[i][j];
        if (v === null) {
          html += '<span class="heat__cell heat__cell--empty" title="' + r + ', ' + c + ': tidak ada data">–</span>';
          return;
        }
        var t = (v - min) / span;
        var label = r + ', ' + c + ': ' + fmt(v, spec.unit, 1);
        html += '<span class="heat__cell" tabindex="0" style="background:' + rampColor(t) + ';color:' + (t > 0.55 ? '#fff' : '#1d2420') + '" data-tip="' + label + '" aria-label="' + label + '">' + fmt(v, '', 1) + '</span>';
      });
    });
    wrap.innerHTML = html;
    fig.appendChild(wrap);

    var legend = document.createElement('div');
    legend.className = 'heat__legend';
    legend.innerHTML = '<span>' + fmt(min, spec.unit, 1) + '</span><i style="background:linear-gradient(90deg,' + RAMP.join(',') + ')"></i><span>' + fmt(max, spec.unit, 1) + '</span>';
    fig.appendChild(legend);

    wrap.addEventListener('pointerover', function (e) {
      var cell = e.target.closest('[data-tip]');
      if (!cell) { hideTip(); return; }
      var b = cell.getBoundingClientRect();
      showTip(cell.getAttribute('data-tip'), b.left + b.width / 2, b.top);
    });
    wrap.addEventListener('pointerleave', hideTip);
    wrap.addEventListener('focusin', function (e) {
      var cell = e.target.closest('[data-tip]');
      if (!cell) return;
      var b = cell.getBoundingClientRect();
      showTip(cell.getAttribute('data-tip'), b.left + b.width / 2, b.top);
    });
    wrap.addEventListener('focusout', hideTip);
  }

  window.NotebookCharts = { bars: bars, line: line, table: table, heatmap: heatmap };
})();
