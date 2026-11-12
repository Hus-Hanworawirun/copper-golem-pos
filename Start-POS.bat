@echo off
title POS and Stock Accounting
cd /d "%~dp0"
echo ========================================================
echo   Starting POS & Stock Accounting System (Local App)
echo ========================================================
echo.
echo 1. Opening app at http://localhost:5001 ...
start http://localhost:5001
echo 2. Running Local Server (SQLite Database)...
echo.
echo [NOTE] Please do not close this window while using POS.
echo.
node server/index.js
pause
