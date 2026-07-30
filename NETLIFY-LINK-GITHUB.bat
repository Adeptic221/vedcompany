@echo off
chcp 65001 >nul
title VED - podklyuchit GitHub k Netlify
color 0B
echo.
echo ========================================
echo   Pochemu sajt ne obnovlyaetsya
echo ========================================
echo.
echo Sajt byl zagruzhen cherez "Netlify Drop",
echo a NE iz GitHub. Push na GitHub ne obnovlyaet sajt.
echo.
echo Nuzhno ODIN RAZ podklyuchit repozitorij GitHub.
echo.
echo Otkroetsya Netlify v brauzere:
echo   1. Vojdite cherez GitHub (Adeptic221)
echo   2. Project configuration -^> Build and deploy
echo   3. Link repository -^> Adeptic221/vedcompany
echo   4. Branch: main, Build: npm run build
echo   5. Deploy site (ili avtomaticheski posle link)
echo.
pause
start "" "https://app.netlify.com/projects/dashing-eclair-d67cad/configuration/deploys"
echo.
echo Posle podklyucheniya repozitoriya vse push na GitHub
echo budut avtomaticheski obnovlyat vedcompany.ru
echo.
pause
