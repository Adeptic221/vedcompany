@echo off
chcp 65001 >nul
title VED - zapusk sajta
cd /d "C:\Projects\vedcompany"
set PATH=C:\Program Files\nodejs;%PATH%

echo.
echo === VED: ustanovka i zapusk sajta ===
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo Oshibka: Node.js ne najden. Perezapustite kompyuter posle ustanovki Node.js.
  pause
  exit /b 1
)

if not exist "node_modules\next\package.json" (
  echo Udalyayu starye fajly i skachivayu pakety...
  echo Eto mozhet zanyat 3-5 minut. Ne zakryvayte okno.
  echo.
  if exist "node_modules" rmdir /s /q "node_modules" 2>nul
  if exist "package-lock.json" del /f /q "package-lock.json" 2>nul
  call npm cache clean --force
  call npm install
  if errorlevel 1 (
    echo.
    echo Oshibka pri ustanovke.
    echo Poprobujte: pravyj kliki po fajlu - Zapusk ot imeni administratora
    pause
    exit /b 1
  )
)

if not exist "node_modules\.bin\next.cmd" (
  echo Oshibka: pakety ustanovleny nepolnostyu. Udalyayu i povtoryayu...
  rmdir /s /q "node_modules" 2>nul
  del /f /q "package-lock.json" 2>nul
  call npm install
  if errorlevel 1 (
    echo Oshibka povtornoj ustanovki. Proverite internet.
    pause
    exit /b 1
  )
)

echo.
echo Zapuskayu sajt...
echo Otkrojte v brauzere: http://localhost:3000
echo Chtoby ostanovit - zakrojte eto okno
echo.
call npm run dev
pause
