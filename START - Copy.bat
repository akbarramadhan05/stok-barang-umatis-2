@echo off
title Stokbar Umatis - Server Lokal
cd /d "%~dp0"

echo.
echo  ========================================
echo   Stokbar Umatis - Menjalankan server...
echo  ========================================
echo.
echo  Buka browser dan ketik:
echo.
echo      http://localhost:8080
echo.
echo  Tekan Ctrl+C untuk menghentikan server.
echo.

python -m http.server 8080

pause
