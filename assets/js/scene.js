/*
  Hero: the real SIPM-PB schema (taken from the project's Laravel migrations)
  as floating tables, with a "query tour" that types sample SQL and lights up
  the JOIN path it touches. three.js is loaded through the import map in
  index.html with a dynamic import, so this file stays a classic script.
*/
(function () {
  'use strict';

  var canvas = document.getElementById('schema');
  if (!canvas) return;
  var stage = document.getElementById('stage');
  var hero = document.getElementById('top');
  var tip = document.getElementById('stage-tip');
  var consoleEl = document.getElementById('console');
  var sqlEl = document.getElementById('q-sql');
  var resultEl = document.getElementById('q-result');
  var qName = document.getElementById('q-name');
  var inspector = document.getElementById('inspector');

  var P = window.Portfolio || { t: function (k) { return k; }, L: function (v) { return typeof v === 'string' ? v : v.id; }, lang: function () { return 'id'; }, onLang: function () {} };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var small = window.matchMedia('(max-width: 1000px)');

  /* ------------------------------------------------------------------
     Schema data
  ------------------------------------------------------------------- */
  // [column, type, key]
  var TABLES = [
    { id: 'reports', pos: [0, 1.0, -2.6], cols: [
      ['id', 'bigint', 'PK'], ['report_number', 'varchar'], ['title', 'varchar'], ['priority', 'enum'], ['status', 'enum'],
      ['province_id', 'bigint', 'FK'], ['regency_id', 'bigint', 'FK'], ['district_id', 'bigint', 'FK'], ['village_id', 'bigint', 'FK'],
      ['user_id', 'bigint', 'FK'], ['latitude', 'decimal'], ['longitude', 'decimal']] },
    { id: 'report_follow_ups', pos: [6.0, 2.0, -8.4], cols: [
      ['id', 'bigint', 'PK'], ['report_id', 'bigint', 'FK'], ['user_id', 'bigint', 'FK'], ['title', 'varchar'],
      ['progress_percentage', 'int'], ['follow_up_date', 'date']] },
    { id: 'report_documents', pos: [6.6, 0.6, -3.4], cols: [
      ['id', 'bigint', 'PK'], ['report_id', 'bigint', 'FK'], ['follow_up_id', 'bigint', 'FK'], ['uploaded_by', 'bigint', 'FK'],
      ['original_name', 'varchar'], ['file_type', 'varchar']] },
    { id: 'report_status_histories', pos: [0.4, 2.2, -9.8], cols: [
      ['id', 'bigint', 'PK'], ['report_id', 'bigint', 'FK'], ['user_id', 'bigint', 'FK'],
      ['previous_status', 'varchar'], ['new_status', 'varchar']] },
    { id: 'users', pos: [4.6, 1.4, 2.0], cols: [
      ['id', 'bigint', 'PK'], ['role_id', 'bigint', 'FK'], ['name', 'varchar'], ['username', 'varchar'], ['email', 'varchar'],
      ['position', 'varchar'], ['is_active', 'bool']] },
    { id: 'roles', pos: [-0.2, 2.0, 4.8], cols: [['id', 'bigint', 'PK'], ['name', 'varchar'], ['slug', 'varchar']] },
    { id: 'activity_logs', pos: [7.4, 0.4, 7.0], cols: [
      ['id', 'bigint', 'PK'], ['user_id', 'bigint', 'FK'], ['action', 'varchar'], ['module', 'varchar'], ['subject_id', 'bigint']] },
    { id: 'notifications', pos: [2.6, -0.2, 8.8], cols: [
      ['id', 'bigint', 'PK'], ['user_id', 'bigint', 'FK'], ['title', 'varchar'], ['is_read', 'bool']] },
    { id: 'provinces', pos: [-6.0, 2.4, -9.6], cols: [['id', 'bigint', 'PK'], ['code', 'varchar'], ['name', 'varchar']] },
    { id: 'regencies', pos: [-6.6, 1.6, -5.4], cols: [
      ['id', 'bigint', 'PK'], ['province_id', 'bigint', 'FK'], ['code', 'varchar'], ['name', 'varchar'], ['type', 'enum']] },
    { id: 'districts', pos: [-5.8, 0.8, -1.0], cols: [
      ['id', 'bigint', 'PK'], ['regency_id', 'bigint', 'FK'], ['code', 'varchar'], ['name', 'varchar']] },
    { id: 'villages', pos: [-6.4, 0.0, 3.8], cols: [
      ['id', 'bigint', 'PK'], ['district_id', 'bigint', 'FK'], ['code', 'varchar'], ['name', 'varchar'], ['type', 'enum']] },
  ];

  // [table, fk column, referenced table]
  var RELATIONS = [
    ['reports', 'province_id', 'provinces'], ['reports', 'regency_id', 'regencies'],
    ['reports', 'district_id', 'districts'], ['reports', 'village_id', 'villages'], ['reports', 'user_id', 'users'],
    ['report_follow_ups', 'report_id', 'reports'], ['report_follow_ups', 'user_id', 'users'],
    ['report_documents', 'report_id', 'reports'], ['report_documents', 'follow_up_id', 'report_follow_ups'],
    ['report_documents', 'uploaded_by', 'users'],
    ['report_status_histories', 'report_id', 'reports'], ['report_status_histories', 'user_id', 'users'],
    ['users', 'role_id', 'roles'],
    ['regencies', 'province_id', 'provinces'], ['districts', 'regency_id', 'regencies'], ['villages', 'district_id', 'districts'],
    ['activity_logs', 'user_id', 'users'], ['notifications', 'user_id', 'users'],
  ];

  // Sample queries. Results reflect the sample data used for the project screenshots.
  var QUERIES = [
    {
      title: { id: 'laporan per provinsi', en: 'reports per province' },
      sql: 'SELECT p.name, COUNT(r.id) AS total\nFROM reports r\nJOIN provinces p ON p.id = r.province_id\nGROUP BY p.name\nORDER BY total DESC;',
      rels: [['reports', 'province_id']],
      result: { cols: ['name', 'total'], rows: [['Kalimantan Barat', 9], ['Nusa Tenggara Timur', 8], ['Kalimantan Utara', 7]], n: 10, ms: 3.8 },
    },
    {
      title: { id: 'lokasi lengkap laporan', en: 'full report location' },
      sql: 'SELECT r.report_number, d.name AS kecamatan,\n       g.name AS kabupaten, p.name AS provinsi\nFROM reports r\nJOIN districts d ON d.id = r.district_id\nJOIN regencies g ON g.id = r.regency_id\nJOIN provinces p ON p.id = r.province_id;',
      rels: [['reports', 'district_id'], ['reports', 'regency_id'], ['reports', 'province_id']],
      result: { cols: ['report_number', 'kecamatan', 'provinsi'], rows: [['BNPP/LP/2026/09/0010', 'Tarakan Barat', 'Kalimantan Utara'], ['BNPP/LP/2026/10/0016', 'Sebatik', 'Kalimantan Utara'], ['BNPP/LP/2026/10/0018', 'Kota Atambua', 'Nusa Tenggara Timur']], n: 50, ms: 5.1 },
    },
    {
      title: { id: 'riwayat status laporan', en: 'report status history' },
      sql: "SELECT h.new_status, u.name, h.created_at\nFROM report_status_histories h\nJOIN users u ON u.id = h.user_id\nWHERE h.report_id = 10\nORDER BY h.created_at;",
      rels: [['report_status_histories', 'user_id'], ['report_status_histories', 'report_id']],
      result: { cols: ['new_status', 'name', 'created_at'], rows: [['Baru', 'Administrator', '2026-09-05'], ['Tindak Lanjut', 'Administrator', '2026-09-07'], ['Selesai', 'Administrator', '2026-09-14']], n: 3, ms: 1.2 },
    },
    {
      title: { id: 'progres tindak lanjut', en: 'follow-up progress' },
      sql: 'SELECT r.title, f.progress_percentage,\n       COUNT(d.id) AS dokumen\nFROM report_follow_ups f\nJOIN reports r ON r.id = f.report_id\nLEFT JOIN report_documents d ON d.follow_up_id = f.id\nGROUP BY f.id;',
      rels: [['report_follow_ups', 'report_id'], ['report_documents', 'follow_up_id']],
      result: { cols: ['title', 'progress', 'dokumen'], rows: [['Jalan penghubung ke PLBN rusak', 25, 0], ['Pos lintas batas terendam banjir', 60, 0], ['Patok batas negara bergeser', 100, 0]], n: 33, ms: 2.4 },
    },
    {
      title: { id: 'aktivitas per pengguna', en: 'activity per user' },
      sql: 'SELECT u.name, ro.name AS role, COUNT(a.id) AS aksi\nFROM activity_logs a\nJOIN users u ON u.id = a.user_id\nJOIN roles ro ON ro.id = u.role_id\nGROUP BY u.id\nORDER BY aksi DESC;',
      rels: [['activity_logs', 'user_id'], ['users', 'role_id']],
      result: { cols: ['name', 'role', 'aksi'], rows: [['Administrator SIPM-PB', 'Admin System', 124], ['User BNPP RI', 'User', 37]], n: 2, ms: 1.6 },
    },
  ];

  /* ------------------------------------------------------------------
     Constants
  ------------------------------------------------------------------- */
  var W = 3.2, T = 0.16, HEADER = 0.62, ROW = 0.34, PAD = 0.16;
  var PX = 200; // texture pixels per world unit
  var C = {
    night: 0x0b1424,
    body: 0x1a2a4d,
    edge: 0x3b5296,
    edgeHot: 0x8299ff,
    edgeQuery: 0xf2b43c,
    rel: 0x4c66f0,
    relHot: 0x8fa3ff,
    amber: 0xf2b43c,
  };
  function depthOf(t) { return HEADER + t.cols.length * ROW + PAD; }

  function fallback() {
    stage.classList.add('is-fallback');
  }

  function hasWebGL() {
    try {
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) { return false; }
  }
  if (!hasWebGL()) { fallback(); return; }

  var fontsReady = document.fonts && document.fonts.load
    ? Promise.all([document.fonts.load('600 30px "JetBrains Mono"'), document.fonts.load('400 24px "JetBrains Mono"')]).catch(function () {})
    : Promise.resolve();

  Promise.all([import('three'), import('three/addons/geometries/RoundedBoxGeometry.js'), fontsReady])
    .then(function (m) { init(m[0], m[1].RoundedBoxGeometry); })
    .catch(function (err) { console.warn('3D scene unavailable:', err && err.message); fallback(); });

  /* ================================================================== */
  function init(THREE, RoundedBoxGeometry) {
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (e) { fallback(); return; }
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    var maxAniso = renderer.capabilities.getMaxAnisotropy();

    var scene = new THREE.Scene();
    scene.fog = new THREE.Fog(C.night, 30, 80);
    var camera = new THREE.PerspectiveCamera(28, 1, 0.1, 500);
    var root = new THREE.Group();
    scene.add(root);

    scene.add(new THREE.AmbientLight(0x9fb0e0, 0.9));
    var key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(6, 14, 10);
    scene.add(key);
    var rim = new THREE.DirectionalLight(0x5c7cff, 1.2);
    rim.position.set(-10, 4, -8);
    scene.add(rim);

    /* ---------- floor ---------- */
    var FLOOR_Y = -2.6;
    var grid = new THREE.GridHelper(120, 60, 0x2a3b66, 0x18243f);
    grid.position.y = FLOOR_Y;
    grid.material.transparent = true;
    grid.material.opacity = 0.85;
    root.add(grid);

    var glowTex = radialTexture(THREE, 'rgba(255,255,255,1)', 'rgba(255,255,255,0)');

    /* ---------- tables ---------- */
    var tables = {};
    var pickables = [];

    TABLES.forEach(function (def, index) {
      var D = depthOf(def);
      var group = new THREE.Group();

      var bodyMat = new THREE.MeshStandardMaterial({ color: C.body, roughness: 0.55, metalness: 0.2, transparent: true });
      var body = new THREE.Mesh(new RoundedBoxGeometry(W, T, D, 3, 0.07), bodyMat);
      body.userData.table = def.id;
      group.add(body);

      var tex = new THREE.CanvasTexture(drawTable(def, D));
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = maxAniso;
      var topMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
      var top = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.1, D - 0.1), topMat);
      top.rotation.x = -Math.PI / 2;
      top.position.y = T / 2 + 0.004;
      top.userData.table = def.id;
      group.add(top);

      var edgeMat = new THREE.LineBasicMaterial({ color: C.edge, transparent: true });
      var edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(W, T, D)), edgeMat);
      group.add(edges);

      var halo = new THREE.Mesh(
        new THREE.PlaneGeometry(W * 2.1, D * 1.7),
        new THREE.MeshBasicMaterial({ map: glowTex, color: 0x3b57f0, transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending })
      );
      halo.rotation.x = -Math.PI / 2;
      halo.position.set(def.pos[0], FLOOR_Y + 0.02, def.pos[2]);
      root.add(halo);

      group.position.set(def.pos[0], def.pos[1], def.pos[2]);
      root.add(group);

      tables[def.id] = {
        def: def, D: D, index: index, group: group, halo: halo,
        mats: { body: bodyMat, top: topMat, edge: edgeMat },
        rels: [], lift: 0, dim: 0, heat: 0, query: 0,
      };
      pickables.push(body, top);
    });

    /* ---------- relations ---------- */
    var relations = [];
    var dotGeo = new THREE.SphereGeometry(0.07, 12, 8);
    var packetGeo = new THREE.SphereGeometry(0.075, 12, 8);

    RELATIONS.forEach(function (r, i) {
      var from = tables[r[0]], to = tables[r[2]];
      var row = colIndex(from.def, r[1]);
      var dx = to.def.pos[0] - from.def.pos[0];
      var s0 = dx >= 0 ? 1 : -1, s3 = -s0;
      if (Math.abs(dx) < W * 0.75) { s0 = 1; s3 = 1; }
      var p0 = anchor(from, row, s0);
      var p3 = anchor(to, 0, s3);
      var reach = Math.max(1.1, p0.distanceTo(p3) * 0.28);
      var curve = new THREE.CubicBezierCurve3(
        p0, p0.clone().add(new THREE.Vector3(s0 * reach, 0.3, 0)),
        p3.clone().add(new THREE.Vector3(s3 * reach, 0.3, 0)), p3
      );

      var mat = new THREE.MeshBasicMaterial({ color: C.rel, transparent: true, opacity: 0.5 });
      var tubeGeo = new THREE.TubeGeometry(curve, 56, 0.022, 6, false);
      var tube = new THREE.Mesh(tubeGeo, mat);
      root.add(tube);

      var glowMat = new THREE.MeshBasicMaterial({ color: C.amber, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
      var glow = new THREE.Mesh(new THREE.TubeGeometry(curve, 56, 0.09, 8, false), glowMat);
      root.add(glow);

      var endA = new THREE.Mesh(dotGeo, mat); endA.position.copy(p0);
      var endB = new THREE.Mesh(dotGeo, mat); endB.position.copy(p3);
      root.add(endA, endB);

      // Packets: a bright core plus an additive sprite glow
      var packets = [];
      for (var k = 0; k < 3; k++) {
        var core = new THREE.Mesh(packetGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true }));
        var spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: C.rel, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
        spr.scale.set(0.7, 0.7, 1);
        core.add(spr);
        core.visible = false;
        root.add(core);
        packets.push({ core: core, sprite: spr, offset: k / 3 });
      }

      var rel = {
        key: r[0] + '.' + r[1], from: from, to: to, curve: curve, mat: mat, glowMat: glowMat,
        tube: tube, ends: [endA, endB], packets: packets, indexCount: tubeGeo.index.count,
        phase: (i * 0.137) % 1, speed: 0.07 + ((i * 7) % 5) * 0.012, hot: 0, query: 0,
      };
      from.rels.push(rel);
      to.rels.push(rel);
      relations.push(rel);
    });
    var relByKey = {};
    relations.forEach(function (r) { relByKey[r.key] = r; });

    function colIndex(def, name) {
      for (var i = 0; i < def.cols.length; i++) if (def.cols[i][0] === name) return i;
      return 0;
    }
    function anchor(tb, row, side) {
      var z = -tb.D / 2 + HEADER + (row + 0.5) * ROW;
      return new THREE.Vector3(tb.def.pos[0] + side * (W / 2), tb.def.pos[1] + T / 2, tb.def.pos[2] + z);
    }

    /* ---------- framing ---------- */
    var bounds = new THREE.Box3();
    TABLES.forEach(function (t) {
      var D = depthOf(t);
      bounds.expandByPoint(new THREE.Vector3(t.pos[0] - W / 2 - 1, t.pos[1], t.pos[2] - D / 2));
      bounds.expandByPoint(new THREE.Vector3(t.pos[0] + W / 2 + 1, t.pos[1], t.pos[2] + D / 2));
    });
    var center = bounds.getCenter(new THREE.Vector3());
    root.position.set(-center.x, -center.y * 0.5, -center.z);

    var corners = [];
    TABLES.forEach(function (t) {
      var D = depthOf(t);
      [-1, 1].forEach(function (sx) { [-1, 1].forEach(function (sz) {
        corners.push(new THREE.Vector3(t.pos[0] + sx * (W / 2 + 0.5), t.pos[1], t.pos[2] + sz * D / 2).add(root.position));
      }); });
    });

    var BASE_THETA = -0.14, SWAY = reduceMotion ? 0 : 0.14;
    var view = { theta: BASE_THETA, phi: 0.74, dragTheta: 0, dragPhi: 0, radius: 30, target: new THREE.Vector3(), targetGoal: new THREE.Vector3() };
    var fitBox = { left: -0.95, right: 1.0, top: 0.9, bottom: -0.55 };

    function placeCamera(radius, theta, phi, target) {
      camera.position.set(
        target.x + radius * Math.sin(phi) * Math.sin(theta),
        target.y + radius * Math.cos(phi),
        target.z + radius * Math.sin(phi) * Math.cos(theta)
      );
      camera.lookAt(target);
      camera.updateMatrixWorld();
    }
    // Fit against a box the size of fitBox, centred on the screen; the view offset
    // set in resize() then moves the drawing to where fitBox actually sits.
    function fits(radius, theta) {
      placeCamera(radius, theta, view.phi, new THREE.Vector3());
      var hw = (fitBox.right - fitBox.left) / 2, hh = (fitBox.top - fitBox.bottom) / 2;
      var v = new THREE.Vector3();
      for (var i = 0; i < corners.length; i++) {
        v.copy(corners[i]).project(camera);
        if (Math.abs(v.x) > hw || Math.abs(v.y) > hh || v.z > 1) return false;
      }
      return true;
    }
    function fitRadius() {
      var lo = 5, hi = 300;
      for (var i = 0; i < 24; i++) {
        var mid = (lo + hi) / 2;
        if (fits(mid, BASE_THETA - SWAY) && fits(mid, BASE_THETA + SWAY)) hi = mid; else lo = mid;
      }
      return hi;
    }
    function resize() {
      var w = stage.clientWidth, h = stage.clientHeight;
      if (!w || !h) return;
      var compact = small.matches;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compact ? 1.5 : 1.75));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // keep the bottom of the stage free for the query console
      // phones: a more top-down view and a tighter crop so the tables read at a useful size
      view.phi = compact ? 0.52 : 0.74;
      fitBox = compact
        ? { left: -1.3, right: 1.3, top: 0.92, bottom: -0.12 }
        : { left: -0.98, right: 1.16, top: 0.86, bottom: -0.74 };
      camera.clearViewOffset();
      camera.near = 0.1; camera.far = 1000; camera.updateProjectionMatrix();
      view.radius = fitRadius();
      camera.near = view.radius * 0.2;
      camera.far = view.radius * 4;
      scene.fog.near = view.radius * 0.95;
      scene.fog.far = view.radius * 2.1;
      var sx = (fitBox.left + fitBox.right) / 2, sy = (fitBox.top + fitBox.bottom) / 2;
      camera.setViewOffset(w, h, -sx * w / 2, sy * h / 2, w, h);
      camera.updateProjectionMatrix();
      wake();
    }

    /* ---------- interaction ---------- */
    var pointer = new THREE.Vector2();
    var raycaster = new THREE.Raycaster();
    var hovered = null;
    var selected = null;
    var pointerIn = false;
    var drag = null;

    canvas.tabIndex = 0;
    canvas.addEventListener('pointerdown', function (e) {
      drag = { x: e.clientX, y: e.clientY, theta: view.dragTheta, phi: view.dragPhi, moved: false };
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', function (e) {
      var r = canvas.getBoundingClientRect();
      pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      pointerIn = true;
      if (drag) {
        var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (Math.abs(dx) + Math.abs(dy) > 4) { drag.moved = true; canvas.classList.add('is-dragging'); }
        view.dragTheta = drag.theta - dx * 0.006;
        view.dragPhi = clamp(drag.phi - dy * 0.004, -0.4, 0.42);
      }
      wake();
    });
    canvas.addEventListener('pointerup', function () {
      var click = drag && !drag.moved;
      drag = null;
      canvas.classList.remove('is-dragging');
      if (click) {
        if (hovered) select(hovered);
        else if (selected) select(null);
      }
    });
    canvas.addEventListener('pointercancel', function () { drag = null; canvas.classList.remove('is-dragging'); });
    canvas.addEventListener('pointerleave', function () { pointerIn = false; wake(); });
    canvas.addEventListener('keydown', function (e) {
      var ids = TABLES.map(function (t) { return t.id; });
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        var i = selected ? ids.indexOf(selected.def.id) : -1;
        i = (i + (e.key === 'ArrowRight' ? 1 : -1) + ids.length) % ids.length;
        select(tables[ids[i]]);
      } else if (e.key === 'Escape' && selected) {
        select(null);
      }
    });

    function updateHover() {
      var next = null;
      if (pointerIn && !(drag && drag.moved)) {
        raycaster.setFromCamera(pointer, camera);
        var hit = raycaster.intersectObjects(pickables, false)[0];
        if (hit) next = tables[hit.object.userData.table];
      }
      if (next !== hovered) {
        hovered = next;
        canvas.classList.toggle('is-pointing', !!hovered);
        if (hovered) {
          tip.innerHTML = hovered.def.id + ' <span>' + P.t('inspector.columns', { n: hovered.def.cols.length }) + '</span>';
        }
        tip.classList.toggle('is-visible', !!hovered);
      }
    }

    var tmp = new THREE.Vector3();
    function placeTip() {
      if (!hovered) return;
      hovered.group.getWorldPosition(tmp);
      tmp.y += T;
      tmp.z -= hovered.D / 2;
      tmp.project(camera);
      tip.style.left = ((tmp.x * 0.5 + 0.5) * stage.clientWidth) + 'px';
      tip.style.top = ((-tmp.y * 0.5 + 0.5) * stage.clientHeight) + 'px';
    }

    /* ---------- inspector ---------- */
    var resumeAfterInspect = false;
    function select(tb) {
      selected = tb;
      if (tb) {
        if (!tour.paused) { resumeAfterInspect = true; setPaused(true); }
        renderInspector(tb);
        inspector.hidden = false;
        var p = tb.def.pos;
        view.targetGoal.set(p[0] + root.position.x, 0, p[2] + root.position.z).multiplyScalar(0.35);
      } else {
        inspector.hidden = true;
        view.targetGoal.set(0, 0, 0);
        if (resumeAfterInspect) { resumeAfterInspect = false; setPaused(false); }
      }
      wake();
    }
    function renderInspector(tb) {
      var def = tb.def;
      document.getElementById('inspector-name').textContent = def.id;
      document.getElementById('inspector-count').textContent = P.t('inspector.columns', { n: def.cols.length });
      document.getElementById('inspector-cols').innerHTML = def.cols.map(function (c) {
        var k = c[2] ? '<span class="key key--' + c[2].toLowerCase() + '">' + c[2] + '</span>' : '<span class="key"></span>';
        return '<li>' + k + '<span>' + c[0] + '</span><span class="type">' + c[1] + '</span></li>';
      }).join('');
      var refs = [], refBy = [];
      tb.rels.forEach(function (r) {
        if (r.from === tb && refs.indexOf(r.to.def.id) === -1) refs.push(r.to.def.id);
        if (r.to === tb && refBy.indexOf(r.from.def.id) === -1) refBy.push(r.from.def.id);
      });
      var btns = function (list) {
        return list.length ? list.map(function (id) { return '<button type="button" data-table="' + id + '">' + id + '</button>'; }).join('') : '<span>' + P.t('inspector.none') + '</span>';
      };
      document.getElementById('inspector-rels').innerHTML =
        '<div><dt>' + P.t('inspector.refs') + '</dt><dd>' + btns(refs) + '</dd></div>' +
        '<div><dt>' + P.t('inspector.refby') + '</dt><dd>' + btns(refBy) + '</dd></div>';
    }
    inspector.addEventListener('click', function (e) {
      var b = e.target.closest('[data-table]');
      if (b) select(tables[b.getAttribute('data-table')]);
    });
    document.getElementById('inspector-close').addEventListener('click', function () { select(null); canvas.focus({ preventScroll: true }); });

    /* ---------- query tour ---------- */
    var tour = { i: 0, phase: 'idle', t0: 0, chars: 0, paused: reduceMotion, timer: 0, active: {} };
    var TYPE_CPS = 42;

    function setPaused(p) {
      tour.paused = p;
      consoleEl.classList.toggle('is-paused', p);
      var btn = document.getElementById('q-pause');
      btn.setAttribute('aria-label', P.t(p ? 'console.play' : 'console.pause'));
      if (!p && tour.phase === 'hold') tour.t0 = performance.now();
      wake();
    }
    function startQuery(i) {
      tour.i = (i + QUERIES.length) % QUERIES.length;
      var q = QUERIES[tour.i];
      tour.phase = reduceMotion ? 'done' : 'typing';
      tour.t0 = performance.now();
      tour.chars = reduceMotion ? q.sql.length : 0;
      tour.active = {};
      q.rels.forEach(function (r) { tour.active[r[0] + '.' + r[1]] = true; });
      qName.textContent = P.L(q.title);
      consoleEl.classList.remove('is-done');
      consoleEl.classList.toggle('is-running', !reduceMotion);
      resultEl.innerHTML = '';
      renderSQL();
      if (reduceMotion) finishQuery();
      wake();
    }
    function finishQuery() {
      var q = QUERIES[tour.i];
      tour.phase = 'hold';
      tour.t0 = performance.now();
      consoleEl.classList.remove('is-running');
      consoleEl.classList.add('is-done');
      var r = q.result;
      var ms = P.lang() === 'id' ? String(r.ms).replace('.', ',') : String(r.ms);
      resultEl.innerHTML =
        '<p class="console__status"><b>✓</b> ' + P.t('console.rows', { n: r.n, ms: ms }) + ' <i>(' + P.t('console.note') + ')</i></p>' +
        '<table class="console__table"><thead><tr>' + r.cols.map(function (c) { return '<th>' + c + '</th>'; }).join('') + '</tr></thead><tbody>' +
        r.rows.map(function (row, ri) {
          return '<tr style="animation-delay:' + (ri * 80) + 'ms">' + row.map(function (v) {
            return '<td' + (typeof v === 'number' ? ' class="num"' : '') + '>' + v + '</td>';
          }).join('') + '</tr>';
        }).join('') + '</tbody></table>';
    }

    var KW = /\b(SELECT|FROM|JOIN|LEFT|ON|WHERE|GROUP|BY|ORDER|DESC|ASC|AS|AND|LIMIT)\b/g;
    function highlight(s) {
      s = s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
      return s
        .replace(/('[^']*'?)/g, '\u0001s$1\u0002')
        .replace(KW, '\u0001k$1\u0002')
        .replace(/\b(COUNT|SUM|AVG)\b/g, '\u0001f$1\u0002')
        .replace(/\b(\d+)\b/g, '\u0001n$1\u0002')
        .replace(/([(),;=*])/g, '\u0001p$1\u0002')
        .replace(/\u0001(\w)/g, '<span class="$1">').replace(/\u0002/g, '</span>');
    }
    function renderSQL() {
      var q = QUERIES[tour.i];
      var text = q.sql.slice(0, tour.chars);
      sqlEl.innerHTML = highlight(text) + (tour.phase === 'typing' ? '<span class="console__caret"></span>' : '');
    }

    function tickTour(now) {
      if (tour.phase === 'idle') return false;
      var q = QUERIES[tour.i];
      if (tour.phase === 'typing') {
        var target = Math.min(q.sql.length, Math.floor(((now - tour.t0) / 1000) * TYPE_CPS));
        if (target !== tour.chars) { tour.chars = target; renderSQL(); }
        if (tour.chars >= q.sql.length) {
          tour.phase = 'running';
          tour.t0 = now;
          renderSQL();
          resultEl.innerHTML = '<p class="console__status">' + P.t('console.running') + '</p>';
        }
        return true;
      }
      if (tour.phase === 'running') {
        if (now - tour.t0 > 650) finishQuery();
        return true;
      }
      if (tour.phase === 'hold') {
        if (!tour.paused && now - tour.t0 > 5200) startQuery(tour.i + 1);
        return !tour.paused;
      }
      return false;
    }

    document.getElementById('q-next').addEventListener('click', function () { startQuery(tour.i + 1); });
    document.getElementById('q-prev').addEventListener('click', function () { startQuery(tour.i - 1); });
    document.getElementById('q-pause').addEventListener('click', function () { resumeAfterInspect = false; setPaused(!tour.paused); });

    // Tables mentioned in the typed SQL light up as the query is written
    function queryTables() {
      if (tour.phase === 'idle') return {};
      var typed = QUERIES[tour.i].sql.slice(0, tour.chars);
      var on = {};
      TABLES.forEach(function (t) {
        if (new RegExp('\\b' + t.id + '\\b').test(typed)) on[t.id] = true;
      });
      return on;
    }

    /* ---------- animation loop ---------- */
    var start = performance.now();
    var last = start;
    var running = false;
    var visible = true;
    var scrollP = 0;

    var COL = { edgeQuery: new THREE.Color(C.edgeQuery), relHot: new THREE.Color(C.relHot), amber: new THREE.Color(C.amber) };
    function easeOut(x) { return 1 - Math.pow(1 - x, 3); }
    function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
    function approach(cur, goal, k) { return cur + (goal - cur) * k; }

    function frame(now) {
      running = false;
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      var t = (now - start) / 1000;
      var k = Math.min(1, dt * 7);
      var anim = !reduceMotion;

      var tourBusy = tickTour(now);

      // camera
      var sway = reduceMotion ? 0 : Math.sin(t * 0.14) * SWAY;
      view.theta = approach(view.theta, BASE_THETA + sway + view.dragTheta + scrollP * 0.5, k);
      view.target.lerp(view.targetGoal, k * 0.6);
      var radius = view.radius * (1 + scrollP * 0.35);
      var phi = clamp(view.phi + view.dragPhi - scrollP * 0.28, 0.25, 1.25);
      placeCamera(radius, view.theta, phi, view.target);

      updateHover();
      var focus = hovered || selected;
      var inQuery = queryTables();
      var querying = !focus && tour.phase !== 'idle';

      // tables
      TABLES.forEach(function (def) {
        var tb = tables[def.id];
        var intro = reduceMotion ? 1 : easeOut(clamp((t - 0.2 - tb.index * 0.055) / 0.9, 0, 1));
        if (intro < 1) anim = true;
        var related = focus ? (focus === tb || focus.rels.some(function (r) { return r.from === tb || r.to === tb; })) : true;
        var queried = querying && inQuery[def.id];
        var goalLift = (focus === tb ? 0.5 : 0) + (queried ? 0.28 : 0);
        var goalDim = focus ? (related ? 0 : 1) : (querying && tour.chars > 0 ? (queried ? 0 : 0.55) : 0);
        tb.lift = approach(tb.lift, goalLift, k);
        tb.dim = approach(tb.dim, goalDim, k);
        tb.query = approach(tb.query, queried ? 1 : 0, k);
        if (Math.abs(goalLift - tb.lift) > 0.002 || Math.abs(goalDim - tb.dim) > 0.002) anim = true;

        tb.group.position.y = def.pos[1] - (1 - intro) * 4 + tb.lift;
        var a = intro * (1 - tb.dim * 0.7);
        tb.mats.top.opacity = a;
        tb.mats.body.opacity = a;
        tb.mats.edge.opacity = intro * (1 - tb.dim * 0.5);
        if (focus === tb) tb.mats.edge.color.setHex(C.edgeHot);
        else tb.mats.edge.color.setHex(C.edge).lerp(COL.edgeQuery, tb.query);
        tb.halo.material.opacity = intro * (0.12 + 0.3 * tb.query + (focus === tb ? 0.25 : 0)) * (1 - tb.dim * 0.6);
        tb.halo.material.color.setHex(tb.query > 0.5 ? C.amber : 0x3b57f0);
      });

      // relations
      relations.forEach(function (rel, i) {
        var intro = reduceMotion ? 1 : clamp((t - 1.0 - i * 0.03) / 0.7, 0, 1);
        if (intro < 1) anim = true;
        rel.tube.geometry.setDrawRange(0, Math.floor(rel.indexCount * easeOut(intro) / 3) * 3);
        rel.ends[0].visible = intro > 0;
        rel.ends[1].visible = intro >= 1;

        var hot = focus ? (rel.from === focus || rel.to === focus) : false;
        var q = querying && tour.active[rel.key] && inQuery[rel.from.def.id] && inQuery[rel.to.def.id];
        rel.hot = approach(rel.hot, hot ? 1 : 0, k);
        rel.query = approach(rel.query, q ? 1 : 0, k);

        var dimmed = (focus && !hot) || (querying && tour.chars > 0 && !q);
        rel.mat.color.setHex(C.rel).lerp(COL.relHot, rel.hot).lerp(COL.amber, rel.query);
        rel.mat.opacity = dimmed ? 0.14 : 0.5 + 0.5 * Math.max(rel.hot, rel.query);
        rel.glowMat.opacity = 0.22 * rel.query;

        // packets: three fast amber packets on queried paths, one slow blue packet elsewhere
        var count = q ? 3 : (hot ? 2 : 1);
        rel.packets.forEach(function (pk, n) {
          var show = intro >= 1 && !reduceMotion && n < count && !(dimmed && !hot);
          pk.core.visible = show;
          if (!show) return;
          var speed = q ? 0.32 : rel.speed;
          var u = ((t * speed) + rel.phase + pk.offset) % 1;
          rel.curve.getPointAt(u, pk.core.position);
          var color = q ? C.amber : (hot ? C.relHot : C.rel);
          pk.sprite.material.color.setHex(color);
          pk.sprite.material.opacity = q ? 0.9 : 0.55;
          pk.core.material.color.setHex(q ? 0xffe2a6 : 0xdfe6ff);
        });
      });

      renderer.render(scene, camera);
      placeTip();

      if ((anim || tourBusy || drag) && visible) schedule();
    }

    function schedule() {
      if (running) return;
      running = true;
      requestAnimationFrame(frame);
    }
    function wake() { if (visible) schedule(); }

    // Scroll: the schema pulls back and turns as the hero leaves the screen
    function onScroll() {
      var r = hero.getBoundingClientRect();
      scrollP = clamp(-r.top / Math.max(1, r.height), 0, 1);
      wake();
    }
    window.addEventListener('scroll', onScroll, { passive: true });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting && !document.hidden;
        if (visible) { last = performance.now(); schedule(); }
      }).observe(stage);
    }
    document.addEventListener('visibilitychange', function () {
      visible = !document.hidden;
      if (visible) { last = performance.now(); schedule(); }
    });

    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(stage);
    else window.addEventListener('resize', resize);

    P.onLang(function () {
      qName.textContent = P.L(QUERIES[tour.i].title);
      if (tour.phase === 'hold') finishQuery();
      if (selected) renderInspector(selected);
      setPaused(tour.paused);
    });

    resize();
    setPaused(tour.paused);
    // Start the tour after the schema has assembled
    setTimeout(function () { startQuery(0); }, reduceMotion ? 0 : 1700);
    schedule();
  }

  /* ------------------------------------------------------------------
     Canvas texture for the top face of a table
  ------------------------------------------------------------------- */
  function drawTable(t, D) {
    var c = document.createElement('canvas');
    var w = Math.round((W - 0.1) * PX), h = Math.round((D - 0.1) * PX);
    c.width = w; c.height = h;
    var g = c.getContext('2d');
    var s = PX / 160; // font scale relative to the 160px/unit design

    g.fillStyle = '#132240';
    g.fillRect(0, 0, w, h);

    var head = (HEADER - 0.05) * PX, row = ROW * PX;
    g.fillStyle = '#24386e';
    g.fillRect(0, 0, w, head);
    g.fillStyle = '#f2b43c';
    g.fillRect(0, head - 3 * s, w, 3 * s);

    g.textBaseline = 'middle';
    g.fillStyle = '#ffffff';
    g.font = '600 ' + Math.round(30 * s) + 'px "JetBrains Mono", Consolas, monospace';
    g.fillText(t.id, 22 * s, head / 2);

    t.cols.forEach(function (col, i) {
      var y = head + i * row;
      if (i > 0) {
        g.fillStyle = '#21325a';
        g.fillRect(14 * s, y, w - 28 * s, 2 * s);
      }
      var mid = y + row / 2 + 1;
      if (col[2]) {
        g.font = '600 ' + Math.round(17 * s) + 'px "JetBrains Mono", Consolas, monospace';
        g.fillStyle = col[2] === 'FK' ? '#8299ff' : '#f2b43c';
        g.fillText(col[2], 20 * s, mid);
      }
      g.font = '400 ' + Math.round(24 * s) + 'px "JetBrains Mono", Consolas, monospace';
      g.fillStyle = '#dfe6f5';
      g.fillText(col[0], 68 * s, mid);
      g.font = '400 ' + Math.round(19 * s) + 'px "JetBrains Mono", Consolas, monospace';
      g.fillStyle = '#6f7d9b';
      var tw = g.measureText(col[1]).width;
      g.fillText(col[1], w - 20 * s - tw, mid);
    });
    return c;
  }

  function radialTexture(THREE, inner, outer) {
    var c = document.createElement('canvas');
    c.width = c.height = 128;
    var g = c.getContext('2d');
    var grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, inner);
    grd.addColorStop(1, outer);
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
    var tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }
})();
