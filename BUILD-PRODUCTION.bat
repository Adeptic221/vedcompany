@echo off
chcp 65001 >nul
cd /d "C:\Projects\vedcompany"
set PATH=C:\Program Files\nodejs;%PATH%
echo Sobiraem proizvodstvennuyu versiyu...
call npm run build
if errorlevel 1 (
  echo Oshibka sborki!
  pause
  exit /b 1
)
echo.
echo Gotovo! Dlya deploy:
echo - Vercel: zagruzite proekt na GitHub i podklyuchite k vercel.com
echo - Smotrite fajl DEPLOY.txt
echo.
pause