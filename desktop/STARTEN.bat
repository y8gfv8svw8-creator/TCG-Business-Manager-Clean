@echo off
chcp 65001 >nul
setlocal
title TCG Business Manager
cd /d "%~dp0"

if not exist "node_modules\electron\dist\electron.exe" (
  echo Electron ist noch nicht vollstaendig installiert.
  echo Bitte zuerst INSTALLIEREN.bat doppelt anklicken.
  pause
  exit /b 1
)

call npm start
if errorlevel 1 (
  echo.
  echo Der Business Manager konnte nicht gestartet werden.
  pause
)
