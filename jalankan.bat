@echo off
rem Menjalankan portofolio dari folder file ini, hanya bisa diakses dari komputer ini.
cd /d "%~dp0"
echo.
echo  Portofolio berjalan di http://localhost:8000
echo  Tutup jendela ini atau tekan Ctrl+C untuk berhenti.
echo.
start "" cmd /c "timeout /t 1 >nul & start http://localhost:8000"
python -m http.server 8000 --bind 127.0.0.1
