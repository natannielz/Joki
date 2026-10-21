(function () {
  'use strict';

  var CDN = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/';
  var MAX_ROWS = 500;
  var MAX_BARS = 24;
  var LAB = window.SQL_LAB;

  var $ = function (id) { return document.getElementById(id); };
  var runBtn = $('run'), resetBtn = $('reset'), csvBtn = $('csv');
  var statusEl = $('status'), gridEl = $('grid'), chartEl = $('chart'), tipEl = $('tip');

  var db = null;
  var SQL = null;
  var lastResult = null;
  var view = 'table';
  var fmt = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 });

  var editor = CodeMirror.fromTextArea($('sql'), {
    mode: 'text/x-sqlite',
    lineNumbers: true,
    indentUnit: 2,
    tabSize: 2,
    viewportMargin: Infinity,
    extraKeys: { 'Ctrl-Enter': function () { run(); }, 'Cmd-Enter': function () { run(); } },
  });
  editor.setValue(LAB.queries[0].sql);

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function setStatus(text, kind) {
    statusEl.textContent = text;
    statusEl.className = 'status' + (kind ? ' status--' + kind : '');
  }

  /* ---------- database ---------- */
  function createDatabase() {
    if (db) db.close();
    db = new SQL.Database();
    db.run('PRAGMA foreign_keys = ON;');
    db.exec(LAB.schema);
    db.exec(LAB.buildSeed());
    renderSchema();
  }

  function renderSchema() {
    var tables = db.exec("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")[0].values.map(function (r) { return r[0]; });
    $('schema').innerHTML = tables.map(function (t) {
      var info = db.exec('PRAGMA table_info(' + t + ')')[0].values;
      var fks = (db.exec('PRAGMA foreign_key_list(' + t + ')')[0] || { values: [] }).values;
      var fkMap = {};
      fks.forEach(function (f) { fkMap[f[3]] = f[2]; });
      var count = db.exec('SELECT COUNT(*) FROM ' + t)[0].values[0][0];
      var cols = info.map(function (c) {
        var key = c[5] ? '<span class="key key--pk" title="Primary key">PK</span>'
          : fkMap[c[1]] ? '<span class="key key--fk" title="Merujuk ke ' + esc(fkMap[c[1]]) + '">FK</span>' : '<span class="key"></span>';
        var ref = fkMap[c[1]] ? '<span class="col__ref">→ ' + esc(fkMap[c[1]]) + '</span>' : '';
        return '<li>' + key + '<button type="button" class="col__name" data-insert="' + esc(c[1]) + '">' + esc(c[1]) + '</button>' +
          ref + '<span class="col__type">' + esc(c[2].toLowerCase()) + '</span></li>';
      }).join('');
      return '<details class="table"' + (t === 'events' || t === 'registrations' ? ' open' : '') + '>' +
        '<summary><span class="table__name">' + esc(t) + '</span><span class="table__count">' + fmt.format(count) + ' baris</span></summary>' +
        '<ul class="cols">' + cols + '</ul>' +
        '<button type="button" class="table__peek" data-peek="' + esc(t) + '">Lihat 25 baris pertama</button>' +
        '</details>';
    }).join('');
  }

  /* ---------- running ---------- */
  function run(preferredView) {
    if (!db) return;
    var sql = editor.getValue().trim();
    if (!sql) {
      setStatus('Tulis kueri dulu, atau pilih dari Kueri tersimpan.', 'warn');
      return;
    }
    var t0 = performance.now();
    try {
      var results = db.exec(sql);
      var ms = (performance.now() - t0).toFixed(1).replace('.', ',');
      var changed = db.getRowsModified();
      if (results.length) {
        var res = results[results.length - 1];
        lastResult = res;
        var n = res.values.length;
        var msg = fmt.format(n) + ' baris dalam ' + ms + ' ms';
        if (results.length > 1) msg += ' (hasil terakhir dari ' + results.length + ' pernyataan)';
        if (n > MAX_ROWS) msg += '. Menampilkan ' + MAX_ROWS + ' baris pertama.';
        setStatus(msg, 'ok');
      } else {
        lastResult = null;
        setStatus('Selesai dalam ' + ms + ' ms. ' + changed + ' baris berubah.', 'ok');
      }
      if (/\b(create|drop|alter|insert|update|delete)\b/i.test(sql)) renderSchema();
    } catch (err) {
      lastResult = null;
      setStatus('Galat SQLite: ' + err.message, 'error');
      if (/\b(create|drop|alter|insert|update|delete)\b/i.test(sql)) renderSchema();
    }
    csvBtn.disabled = !lastResult || !lastResult.values.length;
    if (preferredView) setView(preferredView); else renderView();
  }

  function setView(v) {
    view = v;
    $('tab-table').setAttribute('aria-selected', String(v === 'table'));
    $('tab-chart').setAttribute('aria-selected', String(v === 'chart'));
    gridEl.hidden = v !== 'table';
    chartEl.hidden = v !== 'chart';
    renderView();
  }
  function renderView() {
    if (view === 'table') renderTable(); else renderChart();
  }

  function renderTable() {
    var res = lastResult;
    if (!res) { gridEl.innerHTML = ''; return; }
    var head = '<tr>' + res.columns.map(function (c) { return '<th scope="col">' + esc(c) + '</th>'; }).join('') + '</tr>';
    var body = res.values.slice(0, MAX_ROWS).map(function (row) {
      return '<tr>' + row.map(function (v) {
        if (v === null) return '<td class="null">NULL</td>';
        return typeof v === 'number' ? '<td class="num">' + fmt.format(v) + '</td>' : '<td>' + esc(v) + '</td>';
      }).join('') + '</tr>';
    }).join('');
    gridEl.innerHTML = '<table><thead>' + head + '</thead><tbody>' + body + '</tbody></table>';
    gridEl.scrollTop = 0;
  }

  /* ---------- chart: first text column as label, first number column as value ---------- */
  function renderChart() {
    var res = lastResult;
    if (!res || !res.values.length) {
      chartEl.innerHTML = '<p class="chart__empty">Jalankan kueri yang menghasilkan baris untuk melihat grafiknya.</p>';
      return;
    }
    var first = res.values[0];
    var li = first.findIndex(function (v) { return typeof v === 'string'; });
    var vi = first.findIndex(function (v, i) { return typeof v === 'number' && i !== li; });
    if (li === -1 || vi === -1) {
      chartEl.innerHTML = '<p class="chart__empty">Grafik butuh satu kolom teks sebagai label dan satu kolom angka sebagai nilai. Hasil ini tidak memilikinya, jadi lihat di tab Tabel.</p>';
      return;
    }
    var rows = res.values.slice(0, MAX_BARS);
    var vals = rows.map(function (r) { return typeof r[vi] === 'number' ? r[vi] : 0; });
    var max = Math.max.apply(null, vals.concat([0])) || 1;

    var W = Math.max(320, chartEl.clientWidth - 40);
    var labelW = Math.min(300, Math.max(120, W * 0.36));
    var valueW = 70;
    var plotW = W - labelW - valueW;
    var rowH = 30, barH = 16;
    var H = rows.length * rowH + 8;

    var bars = rows.map(function (r, i) {
      var v = vals[i];
      var w = Math.max(2, (v / max) * plotW);
      var y = i * rowH + 4;
      var label = String(r[li]);
      var short = label.length > 40 ? label.slice(0, 38) + '…' : label;
      var rad = Math.min(4, w / 2), yb = y + (rowH - barH) / 2, x0 = labelW;
      var path = 'M' + x0 + ',' + yb + 'h' + (w - rad) + 'a' + rad + ',' + rad + ' 0 0 1 ' + rad + ',' + rad +
        'v' + (barH - 2 * rad) + 'a' + rad + ',' + rad + ' 0 0 1 ' + (-rad) + ',' + rad + 'h' + (-(w - rad)) + 'z';
      var details = res.columns.map(function (c, ci) {
        var x = r[ci];
        return esc(c) + ': ' + esc(x === null ? 'NULL' : typeof x === 'number' ? fmt.format(x) : x);
      }).join('<br>');
      return '<g class="bar" tabindex="0" data-tip="' + esc(details) + '" aria-label="' + esc(label + ': ' + fmt.format(v)) + '">' +
        '<rect x="0" y="' + y + '" width="' + W + '" height="' + rowH + '" fill="transparent"/>' +
        '<text x="' + (labelW - 10) + '" y="' + (y + rowH / 2) + '" text-anchor="end" dominant-baseline="middle" class="bar__label">' + esc(short) + '</text>' +
        '<path d="' + path + '" class="bar__mark"/>' +
        '<text x="' + (x0 + w + 6) + '" y="' + (y + rowH / 2) + '" dominant-baseline="middle" class="bar__value">' + fmt.format(v) + '</text>' +
        '</g>';
    }).join('');

    chartEl.innerHTML =
      '<p class="chart__title">' + esc(res.columns[vi]) + ' per ' + esc(res.columns[li]) +
      (res.values.length > MAX_BARS ? ' <span>(' + MAX_BARS + ' baris pertama)</span>' : '') + '</p>' +
      '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Grafik batang ' + esc(res.columns[vi]) + '">' +
      '<line x1="' + (labelW + 0.5) + '" x2="' + (labelW + 0.5) + '" y1="0" y2="' + H + '" class="axis"/>' + bars + '</svg>';
  }

  // Tooltip for chart bars
  chartEl.addEventListener('pointermove', function (e) {
    var g = e.target.closest('.bar');
    if (!g) { tipEl.hidden = true; return; }
    tipEl.innerHTML = g.getAttribute('data-tip');
    tipEl.hidden = false;
    var r = tipEl.getBoundingClientRect();
    tipEl.style.left = Math.min(window.innerWidth - r.width - 8, e.clientX + 14) + 'px';
    tipEl.style.top = Math.max(8, e.clientY - r.height - 10) + 'px';
  });
  chartEl.addEventListener('pointerleave', function () { tipEl.hidden = true; });

  $('tab-table').addEventListener('click', function () { setView('table'); });
  $('tab-chart').addEventListener('click', function () { setView('chart'); });
  window.addEventListener('resize', function () { if (view === 'chart') renderChart(); });

  function exportCsv() {
    if (!lastResult) return;
    var cell = function (v) {
      if (v === null) return '';
      var s = String(v);
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    var lines = [lastResult.columns.map(cell).join(',')].concat(lastResult.values.map(function (r) { return r.map(cell).join(','); }));
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8' }));
    a.download = 'hasil-kueri.csv';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 0);
  }

  /* ---------- saved queries ---------- */
  $('saved').innerHTML = LAB.queries.map(function (q, i) {
    return '<li><button type="button" class="saved__item' + (i === 0 ? ' is-active' : '') + '" data-query="' + i + '">' +
      '<span class="saved__name">' + esc(q.name) + '</span><span class="saved__note">' + esc(q.note) + '</span></button></li>';
  }).join('');

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-query], [data-insert], [data-peek]');
    if (!t) return;
    if (t.hasAttribute('data-query')) {
      var q = LAB.queries[+t.getAttribute('data-query')];
      editor.setValue(q.sql);
      document.querySelectorAll('.saved__item').forEach(function (b) { b.classList.toggle('is-active', b === t); });
      run(q.view);
      if (window.matchMedia('(max-width: 900px)').matches) document.querySelector('.work').scrollIntoView({ behavior: 'smooth' });
    } else if (t.hasAttribute('data-insert')) {
      editor.replaceSelection(t.getAttribute('data-insert'));
      editor.focus();
    } else if (t.hasAttribute('data-peek')) {
      editor.setValue('SELECT *\nFROM ' + t.getAttribute('data-peek') + '\nLIMIT 25;');
      document.querySelectorAll('.saved__item').forEach(function (b) { b.classList.remove('is-active'); });
      run('table');
    }
  });

  runBtn.addEventListener('click', function () { run(); });
  csvBtn.addEventListener('click', exportCsv);
  resetBtn.addEventListener('click', function () {
    if (!SQL) return;
    createDatabase();
    lastResult = null;
    renderView();
    csvBtn.disabled = true;
    setStatus('Database dikembalikan ke data contoh awal.', 'ok');
  });

  /* ---------- boot ---------- */
  if (typeof initSqlJs !== 'function') {
    setStatus('sql.js gagal dimuat. Periksa koneksi internet lalu muat ulang halaman.', 'error');
    $('engine').textContent = 'SQLite tidak tersedia';
    return;
  }
  initSqlJs({ locateFile: function (file) { return CDN + file; } }).then(function (lib) {
    SQL = lib;
    createDatabase();
    var version = db.exec('SELECT sqlite_version()')[0].values[0][0];
    $('engine').textContent = 'SQLite ' + version + ' di WebAssembly, berjalan di browser Anda';
    runBtn.disabled = false;
    run(LAB.queries[0].view);
  }).catch(function (err) {
    setStatus('SQLite gagal dijalankan: ' + err.message + '. Muat ulang halaman untuk mencoba lagi.', 'error');
    $('engine').textContent = 'SQLite tidak tersedia';
  });
})();
