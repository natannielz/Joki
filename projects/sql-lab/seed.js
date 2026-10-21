/*
  Database event kampus: skema + data contoh yang deterministik.
  Semua orang dan acara di sini fiktif. "Hari ini" dikunci agar pembagian
  event lampau/mendatang tidak berubah di setiap kunjungan.
*/
(function () {
  'use strict';

  var TODAY = '2026-10-21';
  var STUDENTS = 180;

  var SCHEMA = [
    "CREATE TABLE faculties (",
    "  id    INTEGER PRIMARY KEY,",
    "  code  TEXT NOT NULL UNIQUE,",
    "  name  TEXT NOT NULL",
    ");",
    "",
    "CREATE TABLE venues (",
    "  id        INTEGER PRIMARY KEY,",
    "  name      TEXT NOT NULL,",
    "  building  TEXT NOT NULL,",
    "  capacity  INTEGER NOT NULL CHECK (capacity > 0)",
    ");",
    "",
    "CREATE TABLE organizers (",
    "  id    INTEGER PRIMARY KEY,",
    "  name  TEXT NOT NULL,",
    "  kind  TEXT NOT NULL CHECK (kind IN ('Ormawa', 'Fakultas', 'Laboratorium', 'Pusat Karier'))",
    ");",
    "",
    "CREATE TABLE students (",
    "  id          INTEGER PRIMARY KEY,",
    "  nim         TEXT NOT NULL UNIQUE,",
    "  name        TEXT NOT NULL,",
    "  faculty_id  INTEGER NOT NULL REFERENCES faculties(id),",
    "  cohort      INTEGER NOT NULL CHECK (cohort BETWEEN 2019 AND 2026)",
    ");",
    "",
    "CREATE TABLE events (",
    "  id            INTEGER PRIMARY KEY,",
    "  title         TEXT NOT NULL,",
    "  category      TEXT NOT NULL CHECK (category IN ('Seminar', 'Workshop', 'Kompetisi', 'Karier', 'Komunitas')),",
    "  organizer_id  INTEGER NOT NULL REFERENCES organizers(id),",
    "  venue_id      INTEGER NOT NULL REFERENCES venues(id),",
    "  starts_at     TEXT NOT NULL,  -- ISO 8601, waktu lokal",
    "  quota         INTEGER NOT NULL CHECK (quota > 0),",
    "  fee           INTEGER NOT NULL DEFAULT 0 CHECK (fee >= 0)",
    ");",
    "",
    "CREATE TABLE registrations (",
    "  id             INTEGER PRIMARY KEY,",
    "  event_id       INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,",
    "  student_id     INTEGER NOT NULL REFERENCES students(id),",
    "  registered_at  TEXT NOT NULL,",
    "  status         TEXT NOT NULL CHECK (status IN ('terdaftar', 'hadir', 'tidak_hadir', 'batal')),",
    "  UNIQUE (event_id, student_id)",
    ");",
    "",
    "CREATE INDEX idx_registrations_event   ON registrations(event_id);",
    "CREATE INDEX idx_registrations_student ON registrations(student_id);",
    "CREATE INDEX idx_events_starts_at      ON events(starts_at);",
  ].join('\n');

  var FACULTIES = [
    ['IF', 'Informatika'], ['SI', 'Sistem Informasi'], ['TI', 'Teknik Industri'],
    ['EB', 'Ekonomi dan Bisnis'], ['KB', 'Komunikasi dan Bisnis'], ['IK', 'Industri Kreatif'],
  ];

  var VENUES = [
    ['Auditorium', 'Gedung A', 220], ['Ruang Kuliah 3.01', 'Gedung B', 90], ['Lab Komputer 2', 'Gedung C', 40],
    ['Ruang Inovasi', 'Gedung C', 60], ['Plaza Kampus', 'Area terbuka', 300],
  ];

  var ORGANIZERS = [
    ['Himpunan Mahasiswa Sistem Informasi', 'Ormawa'], ['Fakultas Informatika', 'Fakultas'],
    ['Lab Enterprise System', 'Laboratorium'], ['Pusat Pengembangan Karier', 'Pusat Karier'],
    ['Badan Eksekutif Mahasiswa', 'Ormawa'], ['Lab Data Science', 'Laboratorium'],
  ];

  // title, category, organizer, venue, starts_at, quota, fee
  var EVENTS = [
    ['Kelas Kilat Git dan GitHub', 'Workshop', 3, 3, '2026-08-27 13:00', 40, 0],
    ['Klinik Desain Database', 'Workshop', 1, 4, '2026-09-03 10:00', 60, 0],
    ['Public Speaking untuk Mahasiswa Teknik', 'Seminar', 5, 2, '2026-09-10 15:30', 90, 0],
    ['Hackathon Smart Campus', 'Kompetisi', 2, 5, '2026-09-19 08:00', 150, 25000],
    ['Laravel untuk Pemula', 'Workshop', 1, 3, '2026-09-24 13:00', 40, 15000],
    ['Seminar Keamanan Siber', 'Seminar', 2, 1, '2026-10-01 09:00', 220, 0],
    ['Persiapan CV dan Wawancara', 'Karier', 4, 2, '2026-10-08 13:30', 90, 0],
    ['Literasi Digital untuk Perangkat Desa', 'Komunitas', 5, 4, '2026-10-15 09:00', 60, 0],
    ['Analisis Data dengan Python', 'Workshop', 6, 3, '2026-10-28 13:00', 40, 20000],
    ['Kompetisi Studi Kasus Bisnis', 'Kompetisi', 5, 1, '2026-11-05 08:30', 120, 50000],
    ['Bootcamp UI dan UX', 'Workshop', 1, 4, '2026-11-12 10:00', 60, 25000],
    ['Career Day: Bertemu Perusahaan', 'Karier', 4, 5, '2026-11-20 09:00', 300, 0],
    ['Seminar Sistem E-Government', 'Seminar', 3, 2, '2026-12-03 13:00', 90, 0],
    ['Konser Amal Akhir Tahun', 'Komunitas', 5, 5, '2026-12-12 18:30', 300, 30000],
  ];

  var FIRST = ['Adit', 'Bagas', 'Citra', 'Dewi', 'Eka', 'Fajar', 'Gita', 'Hana', 'Indra', 'Joshua', 'Kevin', 'Lestari',
    'Maria', 'Nadia', 'Oktavia', 'Putri', 'Rizky', 'Sinta', 'Teguh', 'Udin', 'Vina', 'Wahyu', 'Yohana', 'Zaki',
    'Ayu', 'Bima', 'Clara', 'Daniel', 'Elisa', 'Farhan'];
  var LAST = ['Pratama', 'Saputra', 'Wijaya', 'Siregar', 'Nugroho', 'Hutapea', 'Lestari', 'Simanjuntak', 'Kurniawan',
    'Hidayat', 'Purba', 'Santoso', 'Situmorang', 'Rahmawati', 'Gunawan', 'Tambunan', 'Setiawan', 'Manurung'];

  // PRNG kecil (mulberry32) agar setiap kunjungan mendapat data yang sama
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function q(s) { return "'" + String(s).replace(/'/g, "''") + "'"; }
  function pad(n, w) { n = String(n); while (n.length < w) n = '0' + n; return n; }
  function addDays(iso, days) {
    var d = new Date(iso.replace(' ', 'T') + ':00Z');
    d = new Date(d.getTime() + days * 86400000);
    return d.toISOString().slice(0, 16).replace('T', ' ');
  }

  function buildSeed() {
    var r = rng(20260821);
    var out = [];

    out.push('INSERT INTO faculties (id, code, name) VALUES ' +
      FACULTIES.map(function (f, i) { return '(' + (i + 1) + ', ' + q(f[0]) + ', ' + q(f[1]) + ')'; }).join(', ') + ';');
    out.push('INSERT INTO venues (id, name, building, capacity) VALUES ' +
      VENUES.map(function (v, i) { return '(' + (i + 1) + ', ' + q(v[0]) + ', ' + q(v[1]) + ', ' + v[2] + ')'; }).join(', ') + ';');
    out.push('INSERT INTO organizers (id, name, kind) VALUES ' +
      ORGANIZERS.map(function (o, i) { return '(' + (i + 1) + ', ' + q(o[0]) + ', ' + q(o[1]) + ')'; }).join(', ') + ';');

    // Mahasiswa: lebih banyak dari Sistem Informasi dan Informatika
    var facultyWeights = [0.22, 0.3, 0.12, 0.14, 0.12, 0.1];
    var students = [];
    var used = {};
    for (var i = 1; i <= STUDENTS; i++) {
      var name;
      do { name = FIRST[Math.floor(r() * FIRST.length)] + ' ' + LAST[Math.floor(r() * LAST.length)]; } while (used[name]);
      used[name] = true;
      var x = r(), acc = 0, fac = 1;
      for (var k = 0; k < facultyWeights.length; k++) { acc += facultyWeights[k]; if (x <= acc) { fac = k + 1; break; } }
      var cohort = 2022 + Math.floor(r() * 5);
      students.push('(' + i + ', ' + q('1' + pad(fac, 2) + String(cohort).slice(2) + pad(i, 4)) + ', ' + q(name) + ', ' + fac + ', ' + cohort + ')');
    }
    out.push('INSERT INTO students (id, nim, name, faculty_id, cohort) VALUES ' + students.join(',\n  ') + ';');

    out.push('INSERT INTO events (id, title, category, organizer_id, venue_id, starts_at, quota, fee) VALUES ' +
      EVENTS.map(function (e, i) {
        return '(' + (i + 1) + ', ' + q(e[0]) + ', ' + q(e[1]) + ', ' + e[2] + ', ' + e[3] + ', ' + q(e[4]) + ', ' + e[5] + ', ' + e[6] + ')';
      }).join(',\n  ') + ';');

    var regs = [];
    var id = 1;
    EVENTS.forEach(function (e, ei) {
      var past = e[4] < TODAY;
      var fill = Math.min(e[5], 120) * (0.55 + r() * 0.5);
      var target = Math.max(8, Math.min(Math.round(fill), 120));
      var taken = {};
      for (var n = 0; n < target; n++) {
        var sid;
        do { sid = 1 + Math.floor(r() * STUDENTS); } while (taken[sid]);
        taken[sid] = true;
        var x = r();
        var status = past
          ? (x < 0.74 ? 'hadir' : x < 0.93 ? 'tidak_hadir' : 'batal')
          : (x < 0.9 ? 'terdaftar' : 'batal');
        var at = addDays(e[4], -(1 + Math.floor(r() * 20)));
        regs.push('(' + (id++) + ', ' + (ei + 1) + ', ' + sid + ', ' + q(at) + ', ' + q(status) + ')');
      }
    });
    out.push('INSERT INTO registrations (id, event_id, student_id, registered_at, status) VALUES ' + regs.join(',\n  ') + ';');

    return out.join('\n\n');
  }

  var QUERIES = [
    {
      name: 'Event mendatang dan sisa kursi',
      note: 'JOIN, LEFT JOIN, GROUP BY',
      view: 'chart',
      sql: [
        "-- Kursi tersisa untuk setiap event yang belum berlangsung",
        "SELECT e.title,",
        "       e.starts_at,",
        "       v.name AS venue,",
        "       e.quota - COUNT(r.id) AS sisa_kursi,",
        "       COUNT(r.id) AS terdaftar",
        "FROM events e",
        "JOIN venues v ON v.id = e.venue_id",
        "LEFT JOIN registrations r",
        "       ON r.event_id = e.id AND r.status = 'terdaftar'",
        "WHERE e.starts_at >= '" + TODAY + "'",
        "GROUP BY e.id",
        "ORDER BY e.starts_at;",
      ].join('\n'),
    },
    {
      name: 'Tingkat kehadiran event lampau',
      note: 'Agregasi bersyarat',
      view: 'chart',
      sql: [
        "SELECT e.title,",
        "       ROUND(100.0 * SUM(r.status = 'hadir')",
        "             / NULLIF(SUM(r.status IN ('hadir', 'tidak_hadir')), 0), 1) AS persen_hadir,",
        "       SUM(r.status = 'hadir') AS hadir,",
        "       SUM(r.status = 'tidak_hadir') AS tidak_hadir",
        "FROM events e",
        "JOIN registrations r ON r.event_id = e.id",
        "WHERE e.starts_at < '" + TODAY + "'",
        "GROUP BY e.id",
        "ORDER BY persen_hadir DESC;",
      ].join('\n'),
    },
    {
      name: 'Mahasiswa paling aktif',
      note: 'CTE, ORDER BY, LIMIT',
      view: 'chart',
      sql: [
        "WITH kehadiran AS (",
        "  SELECT student_id, COUNT(*) AS event_dihadiri",
        "  FROM registrations",
        "  WHERE status = 'hadir'",
        "  GROUP BY student_id",
        ")",
        "SELECT s.name, k.event_dihadiri, f.code AS fakultas, s.nim",
        "FROM kehadiran k",
        "JOIN students s  ON s.id = k.student_id",
        "JOIN faculties f ON f.id = s.faculty_id",
        "ORDER BY k.event_dihadiri DESC, s.name",
        "LIMIT 10;",
      ].join('\n'),
    },
    {
      name: 'Pendaftaran per fakultas dan kategori',
      note: 'Pivot dengan SUM(CASE ...)',
      view: 'table',
      sql: [
        "SELECT f.name AS fakultas,",
        "       SUM(CASE WHEN e.category = 'Seminar'   THEN 1 ELSE 0 END) AS seminar,",
        "       SUM(CASE WHEN e.category = 'Workshop'  THEN 1 ELSE 0 END) AS workshop,",
        "       SUM(CASE WHEN e.category = 'Kompetisi' THEN 1 ELSE 0 END) AS kompetisi,",
        "       SUM(CASE WHEN e.category = 'Karier'    THEN 1 ELSE 0 END) AS karier,",
        "       SUM(CASE WHEN e.category = 'Komunitas' THEN 1 ELSE 0 END) AS komunitas,",
        "       COUNT(*) AS total",
        "FROM registrations r",
        "JOIN students s  ON s.id = r.student_id",
        "JOIN faculties f ON f.id = s.faculty_id",
        "JOIN events e    ON e.id = r.event_id",
        "WHERE r.status <> 'batal'",
        "GROUP BY f.id",
        "ORDER BY total DESC;",
      ].join('\n'),
    },
    {
      name: 'Peringkat penyelenggara',
      note: 'Window function: RANK, SUM OVER',
      view: 'chart',
      sql: [
        "SELECT o.name AS penyelenggara,",
        "       SUM(r.status = 'hadir') AS peserta_hadir,",
        "       RANK() OVER (ORDER BY SUM(r.status = 'hadir') DESC) AS peringkat,",
        "       ROUND(100.0 * SUM(r.status = 'hadir')",
        "             / SUM(SUM(r.status = 'hadir')) OVER (), 1) AS persen,",
        "       COUNT(DISTINCT e.id) AS jumlah_event",
        "FROM organizers o",
        "JOIN events e ON e.organizer_id = o.id",
        "LEFT JOIN registrations r ON r.event_id = e.id",
        "GROUP BY o.id",
        "ORDER BY peringkat;",
      ].join('\n'),
    },
    {
      name: 'Mahasiswa yang belum pernah hadir',
      note: 'Subquery NOT EXISTS',
      view: 'table',
      sql: [
        "SELECT s.nim, s.name, f.code AS fakultas, s.cohort AS angkatan",
        "FROM students s",
        "JOIN faculties f ON f.id = s.faculty_id",
        "WHERE NOT EXISTS (",
        "  SELECT 1 FROM registrations r",
        "  WHERE r.student_id = s.id AND r.status = 'hadir'",
        ")",
        "ORDER BY s.cohort, s.name;",
      ].join('\n'),
    },
    {
      name: 'Keterisian gedung',
      note: 'Agregasi bertingkat',
      view: 'chart',
      sql: [
        "SELECT v.name AS gedung,",
        "       ROUND(AVG(1.0 * x.hadir / v.capacity) * 100, 1) AS rata_keterisian_persen,",
        "       v.capacity AS kapasitas,",
        "       COUNT(*) AS event_terlaksana",
        "FROM (",
        "  SELECT e.venue_id, e.id, SUM(r.status = 'hadir') AS hadir",
        "  FROM events e",
        "  JOIN registrations r ON r.event_id = e.id",
        "  WHERE e.starts_at < '" + TODAY + "'",
        "  GROUP BY e.id",
        ") x",
        "JOIN venues v ON v.id = x.venue_id",
        "GROUP BY v.id",
        "ORDER BY rata_keterisian_persen DESC;",
      ].join('\n'),
    },
    {
      name: 'Daftarkan mahasiswa baru',
      note: 'INSERT dan constraint UNIQUE',
      view: 'table',
      sql: [
        "-- Jalankan sekali: mahasiswa baru ditambahkan dan didaftarkan ke event 9.",
        "-- Jalankan lagi: constraint UNIQUE pada nim menolak data ganda.",
        "INSERT INTO students (nim, name, faculty_id, cohort)",
        "VALUES ('102230999', 'Deopatria Paskah', 2, 2023);",
        "",
        "INSERT INTO registrations (event_id, student_id, registered_at, status)",
        "VALUES (9, (SELECT id FROM students WHERE nim = '102230999'),",
        "        datetime('now'), 'terdaftar');",
        "",
        "SELECT r.id, s.nim, s.name, e.title, r.status",
        "FROM registrations r",
        "JOIN students s ON s.id = r.student_id",
        "JOIN events e   ON e.id = r.event_id",
        "WHERE s.nim = '102230999';",
      ].join('\n'),
    },
  ];

  window.SQL_LAB = { schema: SCHEMA, buildSeed: buildSeed, queries: QUERIES, today: TODAY };
})();
