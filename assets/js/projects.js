/*
  Project data. Every text field has an Indonesian (id) and English (en) version.

  group   'featured' | 'main' | 'lab'
  stack   skill keys used by the skills matrix (see window.PORTFOLIO_SKILLS)
  images  base path without the size suffix; files exist as <src>-1600.webp and <src>-800.webp
          (phone screenshots: <src>-780.webp and <src>-400.webp, marked with mobile: true)
  repo    GitHub URL, or null
  demo    path to a working demo inside this site, or null
*/
(function () {
  var IMG = 'assets/img/projects/';

  window.PORTFOLIO_PROJECTS = [
    {
      id: 'sipm-pb',
      name: 'SIPM-PB',
      group: 'featured',
      year: '2026',
      kind: { id: 'Kerja Praktik', en: 'Internship project' },
      title: {
        id: 'Sistem Informasi Pelaporan dan Monitoring Kawasan Perbatasan',
        en: 'Reporting and monitoring system for Indonesia’s border areas',
      },
      summary: {
        id: 'Sistem web untuk BNPP RI yang mencatat laporan dari kawasan perbatasan, mengikuti setiap laporan dari verifikasi sampai tindak lanjut, dan menyusun rekap yang siap dicetak untuk pimpinan.',
        en: 'A web system for BNPP RI that records field reports from border regions, follows each one from verification to follow-up, and produces printable recaps for decision makers.',
      },
      role: {
        id: 'Mengerjakan analisis kebutuhan, desain database, dan pengembangan aplikasi Laravel dari migrasi sampai tampilan dashboard.',
        en: 'Requirements analysis, database design and building the Laravel application, from migrations to the dashboard views.',
      },
      features: [
        { id: 'Dua peran: admin mengelola laporan, pengguna, wilayah, dan pengaturan; pengguna memantau statistik dan mencetak rekap.', en: 'Two roles: admins manage reports, users, territories and settings; users monitor statistics and print recaps.' },
        { id: 'Siklus laporan dengan prioritas, riwayat status (Baru, Tindak Lanjut, Selesai), dan catatan tindak lanjut beserta progresnya.', en: 'Report lifecycle with priority, status history (Baru, Tindak Lanjut, Selesai) and follow-up notes with progress.' },
        { id: 'Lokasi bertingkat provinsi, kabupaten/kota, kecamatan, dan desa dengan dropdown berantai dari data wilayah seluruh Indonesia.', en: 'Four-level location (province, regency, district, village) with cascading dropdowns backed by nationwide territory data.' },
        { id: 'Unggah dokumen dengan pratinjau di browser, cetak lembar laporan, serta rekap dan ekspor Excel/CSV.', en: 'Document upload with in-browser preview, printable report sheets, and recap with Excel/CSV export.' },
        { id: 'Dashboard grafik per status, provinsi, dan prioritas, notifikasi internal, serta audit log setiap perubahan.', en: 'Dashboard charts by status, province and priority, in-app notifications and an audit log of every change.' },
      ],
      build: [
        { id: 'Laravel 12 dengan pola MVC, policy laporan, dan middleware peran untuk rute khusus admin.', en: 'Laravel 12 MVC with a report policy and role middleware for admin-only routes.' },
        { id: 'Tampilan Blade dengan Tailwind CSS, Alpine.js untuk interaksi, dan Chart.js untuk grafik.', en: 'Blade views with Tailwind CSS, Alpine.js for interaction and Chart.js for charts.' },
        { id: 'Service audit log mencatat siapa mengubah apa beserta alamat IP-nya.', en: 'An activity-log service records who changed what, and from which IP.' },
      ],
      facts: [
        { value: '19', label: { id: 'migrasi database', en: 'database migrations' } },
        { value: '13', label: { id: 'model Eloquent', en: 'Eloquent models' } },
        { value: '11', label: { id: 'controller', en: 'controllers' } },
        { value: '541', label: { id: 'kabupaten/kota di data wilayah', en: 'regencies in the territory data' } },
      ],
      stack: ['php', 'laravel', 'blade', 'javascript', 'tailwind', 'sql', 'charts', 'git'],
      tags: ['Laravel', 'PHP', 'MySQL', 'Blade', 'Tailwind CSS', 'Alpine.js', 'Chart.js'],
      images: [
        { src: IMG + 'sipm-pb/dashboard', name: { id: 'Dashboard', en: 'Dashboard' } },
        { src: IMG + 'sipm-pb/reports', name: { id: 'Daftar laporan', en: 'Report list' } },
        { src: IMG + 'sipm-pb/detail', name: { id: 'Detail laporan', en: 'Report detail' } },
        { src: IMG + 'sipm-pb/recap', name: { id: 'Rekap dan ekspor', en: 'Recap and export' } },
        { src: IMG + 'sipm-pb/login', name: { id: 'Halaman masuk', en: 'Sign-in page' } },
        { src: IMG + 'sipm-pb/mobile', name: { id: 'Tampilan ponsel', en: 'Phone view' }, mobile: true },
      ],
      imageNote: {
        id: 'Tangkapan layar dari instalasi lokal dengan data contoh.',
        en: 'Screenshots from a local install with sample data.',
      },
      repo: 'https://github.com/deopatriap/Project-KP',
      demo: null,
    },

    {
      id: 'telueve',
      name: 'TelUEve',
      group: 'main',
      year: '2025',
      kind: { id: 'Proyek kuliah', en: 'Academic project' },
      title: { id: 'Platform manajemen event kampus', en: 'Campus event management platform' },
      summary: {
        id: 'Aplikasi event kampus dengan pendaftaran peserta, pencarian real-time, pengumuman, dan dashboard admin. Frontend Next.js berbicara dengan backend Node.js melalui REST dan gRPC.',
        en: 'A campus event app with attendee registration, real-time search, announcements and an admin dashboard. The Next.js frontend talks to a Node.js backend over REST and gRPC.',
      },
      role: {
        id: 'Mengembangkan fitur manajemen event, dokumentasi, dan pelaporan, serta memakai Git dan GitHub untuk kolaborasi tim.',
        en: 'Developed the event management, documentation and reporting features, using Git and GitHub for team collaboration.',
      },
      features: [
        { id: 'Daftar dan masuk dengan JWT, lalu mendaftar ke event dan melihat “pendaftaran saya”.', en: 'Sign up and sign in with JWT, then register for events and see “my registrations”.' },
        { id: 'Pencarian event real-time, filter kategori, pengurutan, dan paginasi.', en: 'Real-time event search, category filters, sorting and pagination.' },
        { id: 'Dashboard admin untuk event, pengguna, pendaftaran, pengumuman, dan statistik.', en: 'Admin dashboard for events, users, registrations, announcements and statistics.' },
        { id: 'Tampilan bertema dengan latar partikel 3D dan mode gelap.', en: 'A themed interface with a 3D particle background and dark mode.' },
      ],
      build: [
        { id: 'Next.js 14 (App Router), TypeScript, Tailwind CSS, react-three-fiber, dan Chart.js.', en: 'Next.js 14 (App Router), TypeScript, Tailwind CSS, react-three-fiber and Chart.js.' },
        { id: 'Express, gRPC dengan Protocol Buffers, Socket.IO, dan bcrypt untuk kata sandi.', en: 'Express, gRPC with Protocol Buffers, Socket.IO and bcrypt for passwords.' },
        { id: 'PostgreSQL dengan cadangan SQLite, dijalankan lewat Docker Compose.', en: 'PostgreSQL with a SQLite fallback, run through Docker Compose.' },
      ],
      stack: ['typescript', 'react', 'node', 'grpc', 'tailwind', 'sql', 'charts', 'docker', 'git'],
      tags: ['Next.js', 'TypeScript', 'Node.js', 'gRPC', 'PostgreSQL', 'Tailwind CSS', 'Docker'],
      images: [
        { src: IMG + 'telueve/home', name: { id: 'Beranda', en: 'Home' } },
        { src: IMG + 'telueve/events', name: { id: 'Daftar event', en: 'Event list' } },
        { src: IMG + 'telueve/detail', name: { id: 'Detail event', en: 'Event detail' } },
        { src: IMG + 'telueve/login', name: { id: 'Halaman masuk', en: 'Sign-in page' } },
      ],
      imageNote: {
        id: 'Tangkapan layar frontend asli yang dijalankan lokal dengan data event contoh.',
        en: 'Screenshots of the real frontend running locally with sample event data.',
      },
      repo: 'https://github.com/deopatriap/Telueve',
      demo: null,
    },

    {
      id: 'sipes',
      name: 'SIPES',
      group: 'main',
      year: '2026',
      kind: { id: 'Proyek tim', en: 'Team project' },
      title: { id: 'Sistem pelaporan masalah sampah', en: 'Waste reporting information system' },
      summary: {
        id: 'Warga melaporkan masalah kebersihan dengan foto dan lokasi GPS, lalu petugas memverifikasi, memproses, dan menutup setiap laporan.',
        en: 'Residents report cleanliness problems with a photo and GPS location; staff then verify, process and close each report.',
      },
      role: {
        id: 'Ikut dalam analisis kebutuhan dan desain sistem dalam sprint Scrum, serta mengembangkan modul pelaporan dan pemantauan laporan.',
        en: 'Took part in requirements analysis and system design in Scrum sprints, and developed the reporting and report-monitoring modules.',
      },
      features: [
        { id: 'Laporan dengan deskripsi, foto, dan lokasi dari tombol “Gunakan lokasi saya” (reverse geocoding OpenStreetMap).', en: 'Reports with description, photo and a location from the “Use my location” button (OpenStreetMap reverse geocoding).' },
        { id: 'Admin mengubah status: menunggu, diverifikasi, diproses, selesai, atau ditolak.', en: 'Admins move each report through pending, verified, in progress, done or rejected.' },
        { id: 'Dashboard pelapor, riwayat laporan, dan profil pengguna.', en: 'Reporter dashboard, report history and user profile.' },
      ],
      build: [
        { id: 'Laravel 13 dengan Blade dan Bootstrap 5.', en: 'Laravel 13 with Blade and Bootstrap 5.' },
        { id: 'Geolocation API browser dan Nominatim untuk alamat.', en: 'Browser Geolocation API and Nominatim for addresses.' },
        { id: 'Dikerjakan bersama tim dengan Agile Scrum di repositori bersama.', en: 'Built with the team using Agile Scrum in a shared repository.' },
      ],
      stack: ['php', 'laravel', 'blade', 'bootstrap', 'sql', 'git'],
      tags: ['Laravel', 'PHP', 'Bootstrap', 'MySQL', 'Agile Scrum'],
      images: [
        { src: IMG + 'sipes/home', name: { id: 'Beranda', en: 'Home' } },
        { src: IMG + 'sipes/admin', name: { id: 'Kelola laporan (admin)', en: 'Manage reports (admin)' } },
        { src: IMG + 'sipes/reports', name: { id: 'Laporan saya', en: 'My reports' } },
        { src: IMG + 'sipes/create', name: { id: 'Buat laporan', en: 'New report' } },
      ],
      imageNote: {
        id: 'Tangkapan layar dari instalasi lokal dengan laporan contoh; foto laporan diganti gambar penanda.',
        en: 'Screenshots from a local install with sample reports; report photos are placeholders.',
      },
      repo: 'https://github.com/deopatriap/SIPES',
      demo: null,
    },

    {
      id: 'gatherly',
      name: 'Gatherly',
      group: 'main',
      year: '2026',
      kind: { id: 'Praktikum UI Lanjut', en: 'Advanced UI lab work' },
      title: { id: 'Platform pencarian event komunitas', en: 'Community event discovery platform' },
      summary: {
        id: 'Aplikasi Vue untuk menemukan event: daftar event dengan pencarian dan filter kategori, halaman detail, dan dashboard penyelenggara. Dibangun bertahap per modul praktikum, dari sistem layout sampai komponen yang bisa dipakai ulang.',
        en: 'A Vue app for discovering events: a searchable list with category filters, detail pages and an organizer dashboard. Built module by module, from the layout system to reusable components.',
      },
      role: {
        id: 'Tugas praktikum: routing, sistem layout, dan memecah UI menjadi komponen yang bisa dipakai ulang.',
        en: 'Lab assignment: routing, the layout system and breaking the UI into reusable components.',
      },
      features: [
        { id: 'Pencarian event dan filter kategori secara langsung.', en: 'Live event search and category filters.' },
        { id: 'Rute bertingkat dengan breadcrumb otomatis dari meta rute.', en: 'Nested routes with breadcrumbs generated from route meta.' },
        { id: 'Dua layout: situs publik dan dashboard penyelenggara.', en: 'Two layouts: the public site and the organizer dashboard.' },
      ],
      build: [
        { id: 'Vue 3 dengan Composition API dan <script setup>, Vue Router, dan Pinia.', en: 'Vue 3 with the Composition API and <script setup>, Vue Router and Pinia.' },
        { id: 'Komponen seperti EventCard, SearchBar, CategoryFilter, AppButton, dan AppCard.', en: 'Components such as EventCard, SearchBar, CategoryFilter, AppButton and AppCard.' },
        { id: 'Dibangun dengan Vite; versi di sini memakai hash routing agar bisa di-hosting statis.', en: 'Built with Vite; the version here uses hash routing so it can be hosted as static files.' },
      ],
      stack: ['vue', 'javascript', 'git'],
      tags: ['Vue', 'Vue Router', 'Pinia', 'Vite', 'JavaScript'],
      images: [
        { src: IMG + 'gatherly/home', name: { id: 'Beranda', en: 'Home' } },
        { src: IMG + 'gatherly/events', name: { id: 'Daftar event', en: 'Event list' } },
        { src: IMG + 'gatherly/detail', name: { id: 'Detail event', en: 'Event detail' } },
        { src: IMG + 'gatherly/dashboard', name: { id: 'Dashboard penyelenggara', en: 'Organizer dashboard' } },
      ],
      imageNote: null,
      repo: 'https://github.com/deopatriap/Praktikum-UI-Lanjut',
      demo: 'projects/gatherly/index.html',
      tryThis: [
        { id: 'Buka Browse lalu cari “Workshop”.', en: 'Open Browse and search for “Workshop”.' },
        { id: 'Klik sebuah event untuk melihat detail dan breadcrumb-nya.', en: 'Open an event to see its detail page and breadcrumb.' },
        { id: 'Masuk ke Organizer Dashboard.', en: 'Visit the Organizer Dashboard.' },
      ],
    },

    {
      id: 'sql-lab',
      name: { id: 'Lab SQL Event Kampus', en: 'Campus Events SQL Lab' },
      short: { id: 'Lab SQL', en: 'SQL Lab' },
      group: 'lab',
      year: '2026',
      kind: { id: 'Eksperimen', en: 'Experiment' },
      title: { id: 'Workbench SQL dengan database sungguhan di browser', en: 'A SQL workbench with a real database in the browser' },
      summary: {
        id: 'Database event kampus yang ternormalisasi (gedung, penyelenggara, event, mahasiswa, pendaftaran) berjalan di SQLite yang dikompilasi ke WebAssembly. Pengunjung bisa menjelajah skema, menjalankan kueri tersimpan, menulis kueri sendiri, dan melihat hasilnya sebagai grafik.',
        en: 'A normalised campus-events database (venues, organisers, events, students, registrations) running on SQLite compiled to WebAssembly. Explore the schema, run saved queries, write your own and chart the results.',
      },
      role: null,
      features: [
        { id: 'Kueri tersimpan: JOIN, CTE, pivot, window function, dan subquery.', en: 'Saved queries: joins, CTEs, pivots, window functions and subqueries.' },
        { id: 'Hasil sebagai tabel atau grafik otomatis, plus ekspor CSV.', en: 'Results as a table or an automatic chart, plus CSV export.' },
        { id: 'Diagram relasi tabel dan penjelajah skema.', en: 'Table relationship diagram and schema browser.' },
      ],
      build: [
        { id: 'sql.js (SQLite WebAssembly) dan CodeMirror.', en: 'sql.js (SQLite on WebAssembly) and CodeMirror.' },
        { id: 'Skema dengan foreign key, CHECK, UNIQUE, dan indeks; data contoh dibuat deterministik.', en: 'Schema with foreign keys, CHECK, UNIQUE and indexes; deterministic sample data.' },
      ],
      stack: ['sql', 'javascript', 'charts'],
      tags: ['SQL', 'SQLite', 'WebAssembly', 'JavaScript'],
      images: [{ src: IMG + 'sql-lab/main', name: { id: 'Workbench', en: 'Workbench' } }],
      repo: null,
      demo: 'projects/sql-lab/index.html',
      tryThis: [
        { id: 'Pilih “Peringkat penyelenggara” lalu buka tab Grafik.', en: 'Pick “Organizer ranking”, then open the Chart tab.' },
        { id: 'Tulis kueri sendiri dan tekan Ctrl+Enter.', en: 'Write your own query and press Ctrl+Enter.' },
      ],
    },
    {
      id: 'waste-insights',
      name: { id: 'Analisis Laporan Sampah', en: 'Waste Report Insights' },
      short: { id: 'Analisis Sampah', en: 'Waste Insights' },
      group: 'lab',
      year: '2026',
      kind: { id: 'Eksperimen', en: 'Experiment' },
      title: { id: 'Notebook Python tentang laporan sampah di Tangerang Selatan', en: 'A Python notebook on waste reports in Tangerang Selatan' },
      summary: {
        id: 'Notebook yang mensimulasikan setahun laporan sampah di tujuh kecamatan Tangerang Selatan, lalu menjawab: dari mana laporan datang, masalah apa yang paling lama ditangani, dan kapan puncaknya. Python berjalan di browser lewat Pyodide.',
        en: 'A notebook that simulates a year of waste reports across Tangerang Selatan’s seven districts and asks where reports come from, which problems take longest to fix, and when they peak. Python runs in the browser through Pyodide.',
      },
      role: null,
      features: [
        { id: 'Sel Python yang bisa diedit dan dijalankan berurutan seperti Jupyter.', en: 'Editable Python cells that run in order, like Jupyter.' },
        { id: 'Grafik batang, heatmap kecamatan × kategori, dan tren bulanan.', en: 'Bar charts, a district × category heatmap and a monthly trend.' },
      ],
      build: [
        { id: 'Pyodide (CPython di WebAssembly) dan pustaka standar Python saja.', en: 'Pyodide (CPython on WebAssembly) and the Python standard library only.' },
        { id: 'Data dikirim sebagai JSON dan digambar sebagai SVG.', en: 'Data is passed as JSON and drawn as SVG.' },
      ],
      stack: ['python', 'charts'],
      tags: ['Python', 'Pyodide', 'WebAssembly'],
      images: [{ src: IMG + 'waste-insights/main', name: { id: 'Notebook', en: 'Notebook' } }],
      repo: null,
      demo: 'projects/waste-insights/index.html',
      tryThis: [
        { id: 'Ubah APP_USE untuk Setu menjadi 1.5 lalu jalankan semua sel.', en: 'Change Setu’s APP_USE to 1.5, then run all cells.' },
      ],
    },
    {
      id: 'sprint-board',
      name: { id: 'Papan Sprint', en: 'Sprint Board' },
      group: 'lab',
      year: '2026',
      kind: { id: 'Eksperimen', en: 'Experiment' },
      title: { id: 'Papan Scrum dengan story point dan burndown', en: 'A Scrum board with story points and a burndown chart' },
      summary: {
        id: 'Papan sprint untuk tim mahasiswa: geser story antarkolom, beri story point, dan lihat burndown serta beban kerja tim berubah. Data tersimpan di browser.',
        en: 'A sprint board for a student team: move stories between columns, estimate them in story points and watch the burndown and team load update. Saved in the browser.',
      },
      role: null,
      features: [
        { id: 'Drag and drop, plus tombol keyboard untuk memindahkan story.', en: 'Drag and drop, plus keyboard buttons to move stories.' },
        { id: 'Burndown chart dan grafik beban kerja per anggota.', en: 'Burndown chart and per-member workload chart.' },
      ],
      build: [
        { id: 'React 18 dengan useReducer, di-bundle dengan esbuild.', en: 'React 18 with useReducer, bundled with esbuild.' },
      ],
      stack: ['react', 'javascript', 'charts'],
      tags: ['React', 'JavaScript', 'esbuild', 'Agile Scrum'],
      images: [{ src: IMG + 'sprint-board/main', name: { id: 'Papan sprint', en: 'Sprint board' } }],
      repo: null,
      demo: 'projects/sprint-board/index.html',
      tryThis: [
        { id: 'Geser satu story ke kolom Selesai dan lihat burndown turun.', en: 'Drag a story into Done and watch the burndown drop.' },
      ],
    },
    {
      id: 'sponsor-pipeline',
      name: { id: 'Pipeline Sponsor', en: 'Sponsor Pipeline' },
      group: 'lab',
      year: '2026',
      kind: { id: 'Eksperimen', en: 'Experiment' },
      title: { id: 'Pelacak penggalangan dana untuk organisasi mahasiswa', en: 'Fundraising tracker for student organisations' },
      summary: {
        id: 'Lahir dari pengalaman di divisi sponsorship PMK: lacak setiap sponsor dari kontak pertama sampai dana diterima, lihat jarak ke target, dan ekspor daftarnya untuk bendahara.',
        en: 'Born from sponsorship work at PMK: track every sponsor from first contact to funds received, see the gap to the target, and export the list for the treasurer.',
      },
      role: null,
      features: [
        { id: 'Tahapan pipeline, progres menuju target dana, dan tanda tindak lanjut yang terlambat.', en: 'Pipeline stages, progress toward the fundraising target and overdue follow-up flags.' },
        { id: 'Tabel yang bisa diurutkan dan dicari, plus ekspor CSV.', en: 'Sortable, searchable table plus CSV export.' },
      ],
      build: [
        { id: 'TypeScript strict tanpa framework, dicek dengan tsc dan di-bundle dengan esbuild.', en: 'Strict TypeScript without a framework, checked with tsc and bundled with esbuild.' },
      ],
      stack: ['typescript', 'charts'],
      tags: ['TypeScript', 'esbuild', 'LocalStorage'],
      images: [{ src: IMG + 'sponsor-pipeline/main', name: { id: 'Pipeline', en: 'Pipeline' } }],
      repo: null,
      demo: 'projects/sponsor-pipeline/index.html',
      tryThis: [
        { id: 'Ubah tahap sebuah sponsor menjadi “Dana diterima” dan lihat progres target ikut berubah.', en: 'Move a sponsor to “Dana diterima” (funds received) and watch the target progress update.' },
        { id: 'Klik judul kolom “Nilai” untuk mengurutkan.', en: 'Click the “Nilai” (amount) column header to sort.' },
      ],
    },
  ];

  /* Technologies for the skills matrix, grouped. key matches project.stack */
  window.PORTFOLIO_SKILLS = [
    { group: 'backend', key: 'php', name: 'PHP' },
    { group: 'backend', key: 'laravel', name: 'Laravel' },
    { group: 'backend', key: 'node', name: 'Node.js + Express' },
    { group: 'backend', key: 'grpc', name: 'gRPC' },
    { group: 'frontend', key: 'blade', name: 'Blade' },
    { group: 'frontend', key: 'javascript', name: 'JavaScript' },
    { group: 'frontend', key: 'typescript', name: 'TypeScript' },
    { group: 'frontend', key: 'react', name: 'React / Next.js' },
    { group: 'frontend', key: 'vue', name: 'Vue' },
    { group: 'frontend', key: 'tailwind', name: 'Tailwind CSS' },
    { group: 'frontend', key: 'bootstrap', name: 'Bootstrap' },
    { group: 'data', key: 'sql', name: 'SQL (MySQL, PostgreSQL, SQLite)' },
    { group: 'data', key: 'python', name: 'Python' },
    { group: 'data', key: 'charts', name: { id: 'Visualisasi data', en: 'Data visualisation' } },
    { group: 'tools', key: 'git', name: 'Git + GitHub' },
    { group: 'tools', key: 'docker', name: 'Docker' },
  ];

  /* Bytes per language across Deo's own repositories (GitHub API, October 2026) */
  window.PORTFOLIO_LANGUAGES = [
    { name: 'Blade', bytes: 523468 },
    { name: 'PHP', bytes: 348878 },
    { name: 'TypeScript', bytes: 194667 },
    { name: 'JavaScript', bytes: 126756 },
    { name: 'Vue', bytes: 51892 },
    { name: 'CSS', bytes: 14271 },
    { name: 'HTML', bytes: 471 },
  ];

  /* Technologies shown as filter buttons */
  window.PORTFOLIO_FILTERS = ['Laravel', 'PHP', 'MySQL', 'Next.js', 'TypeScript', 'Vue', 'React', 'SQL', 'Python'];

  /* Timeline */
  window.PORTFOLIO_TIMELINE = [
    { date: { id: '2023', en: '2023' }, title: { id: 'Mulai kuliah Sistem Informasi', en: 'Started Information Systems' }, text: { id: 'S1 Sistem Informasi di Telkom University Jakarta.', en: 'Bachelor of Information Systems at Telkom University Jakarta.' } },
    { date: { id: 'Des 2025', en: 'Dec 2025' }, title: { id: 'TelUEve', en: 'TelUEve' }, text: { id: 'Platform event kampus dengan Next.js, Express, dan gRPC.', en: 'Campus event platform with Next.js, Express and gRPC.' }, project: 'telueve' },
    { date: { id: 'Apr–Jun 2026', en: 'Apr–Jun 2026' }, title: { id: 'SIPES', en: 'SIPES' }, text: { id: 'Proyek tim dengan Scrum: sistem pelaporan sampah berbasis Laravel.', en: 'Team project in Scrum: a Laravel waste-reporting system.' }, project: 'sipes' },
    { date: { id: 'Agu–Okt 2026', en: 'Aug–Oct 2026' }, title: { id: 'Kerja Praktik: SIPM-PB', en: 'Internship: SIPM-PB' }, text: { id: 'Sistem pelaporan dan monitoring kawasan perbatasan untuk BNPP RI.', en: 'Border-area reporting and monitoring system for BNPP RI.' }, project: 'sipm-pb' },
    { date: { id: 'Okt 2026', en: 'Oct 2026' }, title: { id: 'Gatherly', en: 'Gatherly' }, text: { id: 'Praktikum UI Lanjut dengan Vue 3.', en: 'Advanced UI lab work in Vue 3.' }, project: 'gatherly' },
    { date: { id: 'Sekarang', en: 'Now' }, title: { id: 'Semester 7', en: 'Semester 7' }, text: { id: 'Melanjutkan kuliah sambil terus membangun dan merapikan proyek.', en: 'Continuing my studies while building and refining projects.' } },
  ];
})();
