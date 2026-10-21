# Portofolio Deopatria Paskah

Portofolio satu halaman untuk Deopatria Paskah, mahasiswa Sistem Informasi Telkom University Jakarta.
Semuanya HTML, CSS, dan JavaScript statis, jadi bisa di-hosting gratis dan setiap demo berjalan di browser pengunjung.
Bahasa utama Indonesia, dengan tombol EN untuk versi Inggris.

## Isi

```
index.html                    halaman portofolio
assets/
  css/style.css               desain dan tata letak
  js/i18n.js                  semua teks antarmuka (ID dan EN)
  js/projects.js              data proyek, keahlian, bahasa GitHub, dan lini waktu: ubah di sini
  js/main.js                  filter, galeri, drawer detail, modal demo, matriks keahlian
  js/scene.js                 hero 3D: skema database SIPM-PB + tur kueri SQL (three.js)
  img/projects/               tangkapan layar asli setiap proyek (WebP, 800 dan 1600 px)
  CV_Deopatria_Paskah.pdf     CV yang bisa diunduh
projects/
  gatherly/                   build Vue dari repo Praktikum-UI-Lanjut (demo live)
  sql-lab/                    SQL + SQLite WebAssembly
  waste-insights/             Python (Pyodide)
  sprint-board/               React + esbuild
  sponsor-pipeline/           TypeScript + esbuild
```

Kode sumber proyek utama ada di repo masing-masing:
[Project-KP (SIPM-PB)](https://github.com/deopatriap/Project-KP),
[Telueve](https://github.com/deopatriap/Telueve),
[SIPES](https://github.com/deopatriap/SIPES),
[Praktikum-UI-Lanjut (Gatherly)](https://github.com/deopatriap/Praktikum-UI-Lanjut).

## Menjalankan secara lokal

Di Windows, klik dua kali `jalankan.bat`. Atau buka terminal **di folder ini** (bukan folder lain), lalu buka http://localhost:8000:

```bash
python -m http.server 8000 --bind 127.0.0.1
```

Kalau yang muncul "Directory listing" berisi file pribadi, berarti perintah dijalankan dari folder yang salah:
hentikan dengan Ctrl+C, pindah ke folder ini, lalu jalankan lagi.

Butuh koneksi internet untuk font dan pustaka CDN (three.js, sql.js, Pyodide, CodeMirror).

## Memperbarui tangkapan layar

Gambar di `assets/img/projects/` diambil dari instalasi lokal setiap proyek dengan data contoh.
Untuk menggantinya, simpan gambar baru dengan nama yang sama (`nama-1600.webp` dan `nama-800.webp`).

## Membangun ulang demo React dan TypeScript

File hasil build (`dist/app.js`) sudah disertakan, jadi ini hanya perlu setelah mengubah kode sumbernya:

```bash
cd projects/sprint-board && npm install && npm run build
cd projects/sponsor-pipeline && npm install && npm run build
```

Gatherly dibangun dari repo Praktikum-UI-Lanjut dengan `npx vite build --base=./`, setelah
`createWebHistory` diganti `createWebHashHistory` di `src/router/index.js` agar bisa berjalan dari subfolder statis.

## Hosting gratis

- **GitHub Pages**: push folder ini ke repo bernama `deopatriap.github.io`, situs aktif di https://deopatriap.github.io.
  Untuk nama repo lain, aktifkan Pages di Settings → Pages (branch `main`, folder `/`).
- **Netlify** atau **Vercel**: seret folder ini ke dashboard, atau impor repo. Tidak perlu perintah build.

## Pustaka (semua gratis dan open source)

three.js (MIT), sql.js (MIT), Pyodide (MPL-2.0), CodeMirror 5 (MIT), React (MIT), Vue (MIT), esbuild (MIT), TypeScript (Apache-2.0).
Font dari Google Fonts: Archivo, JetBrains Mono, IBM Plex, Source Sans 3, Figtree, DM Sans (SIL Open Font License).
