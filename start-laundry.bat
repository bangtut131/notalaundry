@echo off
echo ===================================================
echo   Memulai Sistem Nota Laundry Terlengkap (Lokal)
echo ===================================================

cd /d "%~dp0"

echo [1/3] Mengecek dependensi (npm install)...
call npm install

echo [2/3] Menjalankan server Next.js...
start http://localhost:3000

echo [3/3] Server sedang berjalan... Jangan tutup jendela ini!
call npm run dev

pause
