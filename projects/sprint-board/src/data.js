export const SPRINT = {
  name: 'Sprint 7',
  goal: 'Mahasiswa bisa check-in ke event dengan kode QR',
  start: '2026-10-12',
  days: 10,
  today: 7, // hari kerja sprint saat demo dibekukan
};

export const COLUMNS = [
  { id: 'todo', name: 'Akan dikerjakan' },
  { id: 'progress', name: 'Sedang dikerjakan' },
  { id: 'review', name: 'Ditinjau' },
  { id: 'done', name: 'Selesai' },
];

export const TEAM = [
  { id: 'dp', name: 'Deo P.' },
  { id: 'rs', name: 'Rani S.' },
  { id: 'kh', name: 'Kevin H.' },
  { id: 'ml', name: 'Maya L.' },
];

export const LABELS = ['Backend', 'Frontend', 'Database', 'Desain', 'Dokumentasi'];

export const POINTS = [1, 2, 3, 5, 8, 13];

// doneDay: hari sprint saat story masuk Selesai (dipakai burndown)
export const SEED_STORIES = [
  { id: 'TE-31', title: 'Daftar event dengan pengecekan kuota', label: 'Backend', points: 5, assignee: 'dp', status: 'done', doneDay: 2 },
  { id: 'TE-32', title: 'Check-in dengan kode QR di lokasi', label: 'Backend', points: 8, assignee: 'kh', status: 'progress' },
  { id: 'TE-33', title: 'Ekspor laporan kehadiran ke PDF', label: 'Backend', points: 3, assignee: 'dp', status: 'review' },
  { id: 'TE-34', title: 'Grafik di dashboard penyelenggara', label: 'Frontend', points: 5, assignee: 'rs', status: 'done', doneDay: 4 },
  { id: 'TE-35', title: 'Email pengingat H-1 sebelum event', label: 'Backend', points: 3, assignee: 'kh', status: 'done', doneDay: 5 },
  { id: 'TE-36', title: 'Indeks pendaftaran per event dan mahasiswa', label: 'Database', points: 2, assignee: 'dp', status: 'done', doneDay: 1 },
  { id: 'TE-37', title: 'Desain ulang halaman detail event', label: 'Desain', points: 3, assignee: 'ml', status: 'done', doneDay: 3 },
  { id: 'TE-38', title: 'Penyelenggara hanya melihat event miliknya', label: 'Backend', points: 5, assignee: 'dp', status: 'progress' },
  { id: 'TE-39', title: 'Pencarian dan filter daftar event', label: 'Frontend', points: 3, assignee: 'rs', status: 'review' },
  { id: 'TE-40', title: 'Daftar tunggu saat kuota event penuh', label: 'Backend', points: 5, assignee: 'kh', status: 'todo' },
  { id: 'TE-41', title: 'Uji aksesibilitas formulir pendaftaran', label: 'Frontend', points: 2, assignee: 'ml', status: 'todo' },
  { id: 'TE-42', title: 'Dokumentasi API check-in', label: 'Dokumentasi', points: 1, assignee: 'rs', status: 'todo' },
];
