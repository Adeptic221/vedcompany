@echo off
cd /d "C:\Projects\vedcompany"
set PATH=C:\Program Files\nodejs;%PATH%
echo Sinhronizaciya kataloga s Autohome...
curl -s -H "Authorization: Bearer %SYNC_CRON_SECRET%" http://localhost:3000/api/cron/sync-cars
echo.
pause