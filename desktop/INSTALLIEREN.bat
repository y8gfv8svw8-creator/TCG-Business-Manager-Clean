@echo off
chcp 65001 >nul
setlocal
title TCG Business Manager - Installation
cd /d "%~dp0"

echo ================================================
echo TCG Business Manager Market History 5.1.0
echo Installation wird vorbereitet...
echo ================================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo FEHLER: Node.js wurde nicht gefunden.
  echo Bitte Node.js LTS installieren und danach erneut starten.
  pause
  exit /b 1
)

where npm >nul 2>&1
if errorlevel 1 (
  echo FEHLER: npm wurde nicht gefunden.
  pause
  exit /b 1
)

echo [1/3] Electron und Abhaengigkeiten installieren...
call npm install
if errorlevel 1 goto :error

echo.
echo [2/3] Electron-Installationsskript freigeben und pruefen...
call npm approve-scripts electron >nul 2>&1
call npm rebuild electron
if errorlevel 1 goto :error

echo.
echo [3/3] Projektdateien pruefen...
call npm run check
if errorlevel 1 goto :error

echo.
echo ================================================
echo Installation erfolgreich abgeschlossen.
echo Jetzt STARTEN.bat doppelt anklicken.
echo ================================================
pause
exit /b 0

:error
echo.
echo ================================================
echo FEHLER: Installation nicht abgeschlossen.
echo Bitte einen Screenshot dieses Fensters senden.
echo ================================================
pause
exit /b 1
