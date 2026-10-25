@echo off
rem Double-click to open the admin panel. Works without PowerShell script permissions.
title Wedding Card - Admin
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed. Install the LTS version from https://nodejs.org and double-click this file again.
  pause
  exit /b 1
)
node server.mjs
pause
