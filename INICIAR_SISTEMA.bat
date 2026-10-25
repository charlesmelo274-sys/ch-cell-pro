@echo off
title CH Cell Pro - Servidor Local e Celular
echo ==========================================================
echo   INICIANDO O SISTEMA CH CELL PRO
echo ==========================================================
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0iniciar_tudo.ps1"
pause
