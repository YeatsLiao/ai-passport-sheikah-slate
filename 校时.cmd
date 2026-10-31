@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\sync_time.ps1" %*
set "sync_exit=%errorlevel%"
echo.
pause
exit /b %sync_exit%
