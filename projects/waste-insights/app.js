(function () {
  'use strict';

  // Helpers available to every cell: Python sends chart specs to JavaScript as JSON
  var PRELUDE = [
    'import json',
    'from notebook import emit as _emit',
    '',
    'def show_bars(title, labels, values, unit=""):',
    '    _emit(json.dumps({"kind": "bars", "title": title, "labels": list(labels), "values": list(values), "unit": unit}))',
    '',
    'def show_line(title, labels, values, unit=""):',
    '    _emit(json.dumps({"kind": "line", "title": title, "labels": list(labels), "values": list(values), "unit": unit}))',
    '',
    'def show_table(columns, rows):',
    '    _emit(json.dumps({"kind": "table", "columns": list(columns), "rows": [list(r) for r in rows]}, default=str))',
    '',
    'def show_heatmap(title, rows, cols, values, unit=""):',
    '    _emit(json.dumps({"kind": "heatmap", "title": title, "rows": list(rows), "cols": list(cols), "values": [list(v) for v in values], "unit": unit}))',
  ].join('\n');

  var engine = document.getElementById('engine');
  var runAllBtn = document.getElementById('run-all');
  var pyodide = null;
  var cells = [];
  var activeOutput = null;
  var runCount = 0;
  var busy = false;

  /* ---------- build cells ---------- */
  var toc = [];
  document.querySelectorAll('[data-cell]').forEach(function (section, index) {
    var script = section.querySelector('script[type="text/x-python"]');
    var source = script.textContent.replace(/^\n/, '').replace(/\s+$/, '') + '\n';
    var original = source;
    toc.push('<a href="#' + section.id + '">' + (index + 1) + '</a>');

    var box = document.createElement('div');
    box.className = 'cell__box';
    box.innerHTML =
      '<div class="cell__bar">' +
        '<span class="cell__count" aria-label="Belum dijalankan">[ ]</span>' +
        '<span class="cell__lang">Python</span>' +
        '<button type="button" class="link" data-action="reset" hidden>Batalkan perubahan</button>' +
        '<button type="button" class="btn btn--small" data-action="run" disabled>Jalankan sel</button>' +
      '</div>' +
      '<div class="cell__code"></div>' +
      '<div class="cell__out" aria-live="polite"></div>';
    script.replaceWith(box);

    var cm = CodeMirror(box.querySelector('.cell__code'), {
      value: source,
      mode: 'python',
      lineNumbers: true,
      indentUnit: 4,
      viewportMargin: Infinity,
      extraKeys: {
        'Shift-Enter': function () { runCell(cell); },
        'Ctrl-Enter': function () { runCell(cell); },
      },
    });

    var cell = {
      index: index, section: section, cm: cm,
      out: box.querySelector('.cell__out'),
      count: box.querySelector('.cell__count'),
      runBtn: box.querySelector('[data-action="run"]'),
      resetBtn: box.querySelector('[data-action="reset"]'),
    };
    cm.on('change', function () { cell.resetBtn.hidden = cm.getValue() === original; });
    cell.runBtn.addEventListener('click', function () { runCell(cell); });
    cell.resetBtn.addEventListener('click', function () { cm.setValue(original); });
    cells.push(cell);
  });
  document.getElementById('toc').innerHTML = '<span>Sel</span>' + toc.join('');

  /* ---------- output ---------- */
  function appendText(text, cls) {
    if (!activeOutput) return;
    var last = activeOutput.lastElementChild;
    if (last && last.tagName === 'PRE' && last.className === (cls || 'stdout')) {
      last.textContent += text + '\n';
    } else {
      var pre = document.createElement('pre');
      pre.className = cls || 'stdout';
      pre.textContent = text + '\n';
      activeOutput.appendChild(pre);
    }
  }

  function emit(json) {
    if (!activeOutput) return;
    var spec = JSON.parse(json);
    var draw = NotebookCharts[spec.kind];
    if (draw) draw(activeOutput, spec);
  }

  /* ---------- running ---------- */
  function setBusy(on) {
    busy = on;
    runAllBtn.disabled = on || !pyodide;
    cells.forEach(function (c) { c.runBtn.disabled = on || !pyodide; });
  }

  function runCell(cell) {
    if (!pyodide || busy) return Promise.resolve(false);
    setBusy(true);
    cell.out.innerHTML = '';
    cell.section.classList.add('is-running');
    cell.count.textContent = '[*]';
    activeOutput = cell.out;
    var t0 = performance.now();

    return pyodide.runPythonAsync(cell.cm.getValue()).then(function () {
      runCount += 1;
      cell.count.textContent = '[' + runCount + ']';
      cell.count.setAttribute('aria-label', 'Dijalankan ke-' + runCount + ', ' + Math.round(performance.now() - t0) + ' ms');
      return true;
    }).catch(function (err) {
      runCount += 1;
      cell.count.textContent = '[' + runCount + ']';
      var msg = String(err.message || err);
      var lines = msg.trim().split('\n');
      var start = lines.findIndex(function (l) { return /File "<exec>"/.test(l); });
      appendText(start >= 0 ? lines.slice(start).join('\n') : msg, 'stderr');
      if (/NameError/.test(msg)) {
        appendText('Tips: jalankan sel di atasnya terlebih dahulu, atau tekan “Jalankan semua sel”.', 'hint');
      }
      return false;
    }).finally(function () {
      activeOutput = null;
      cell.section.classList.remove('is-running');
      setBusy(false);
    });
  }

  function runAll() {
    var chain = Promise.resolve(true);
    cells.forEach(function (c) {
      chain = chain.then(function (ok) { return ok ? runCell(c) : false; });
    });
    return chain;
  }
  runAllBtn.addEventListener('click', runAll);

  /* ---------- boot Pyodide ---------- */
  if (typeof loadPyodide !== 'function') {
    engine.textContent = 'Python gagal dimuat. Periksa koneksi internet lalu muat ulang.';
    engine.dataset.state = 'error';
    return;
  }

  loadPyodide({
    stdout: function (line) { appendText(line, 'stdout'); },
    stderr: function (line) { appendText(line, 'stderr'); },
  }).then(function (py) {
    pyodide = py;
    pyodide.registerJsModule('notebook', { emit: emit });
    return pyodide.runPythonAsync(PRELUDE);
  }).then(function () {
    var v = pyodide.runPython('import sys; sys.version.split()[0]');
    engine.textContent = 'Python ' + v + ' siap, berjalan di browser Anda';
    engine.dataset.state = 'ready';
    setBusy(false);
    runAll();
  }).catch(function (err) {
    engine.textContent = 'Python gagal dijalankan: ' + (err.message || err);
    engine.dataset.state = 'error';
  });
})();
