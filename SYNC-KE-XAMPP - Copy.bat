@echo off
title Sync Stokbar Umatis ke XAMPP
cd /d "%~dp0"

set "SRC=%~dp0"
set "DST=C:\Users\Akbar\Downloads\Untitled Folder\htdocs\stok-barang-umatis"

echo.
echo  Menyalin file terbaru ke folder XAMPP...
echo  Dari: %SRC%
echo  Ke:   %DST%
echo.

if not exist "%DST%" mkdir "%DST%"

robocopy "%SRC%" "%DST%" /E /XD .git .vscode /NFL /NDL /NJH /NJS

echo.
echo  Selesai! Buka di browser:
echo.
echo      http://localhost/stok-barang-umatis/login.html
echo.
echo  Tes API database:
echo      http://localhost/stok-barang-umatis/api/index.php?action=ping
echo.
pause
