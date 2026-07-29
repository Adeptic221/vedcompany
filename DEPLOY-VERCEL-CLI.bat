@echo off
chcp 65001 >nul
title VED - deploy cherez Vercel CLI
color 0B
cd /d "C:\Projects\vedcompany"
set PATH=C:\Program Files\nodejs;%PATH%

echo.
echo ========================================
echo   DEPLOY NA VERCEL (CLI, bez SMS)
echo ========================================
echo.

echo SHAG 1: Vhod v Vercel
echo ---------------------
echo Otkroetsya brauzer ili ssylka na pochtu.
echo Vyberite: GitHub (Continue with GitHub) - bez SMS!
echo.
pause

call npx vercel login --github
if errorlevel 1 (
  echo.
  echo Esli GitHub ne srabotal, probujem email:
  call npx vercel login
)

echo.
echo SHAG 2: Deploy na production
echo -----------------------------
echo.

set SYNC_CRON_SECRET=ved-sync-2026-Adeptic221-K7mN9pQ2
call npx vercel --prod --yes --env SYNC_CRON_SECRET=%SYNC_CRON_SECRET%

if errorlevel 1 (
  echo.
  echo Esli sprosit nastrojki - otvechajte tak:
  echo   Link to existing project? N
  echo   Project name: vedcompany
  echo   Directory: ./
  echo   Override settings? N
  echo.
  call npx vercel --prod
)

echo.
echo ========================================
echo   GOTOVO!
echo   Skopirujte URL iz vyvoda vyshe.
echo   Potom dobavte domen vedcompany.ru v Vercel.
echo ========================================
echo.
pause
