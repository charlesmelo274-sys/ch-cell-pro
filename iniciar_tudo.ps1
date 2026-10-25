$baseDir = $PSScriptRoot

# Inicia o servidor local se ainda não estiver rodando
$serverRunning = Get-Process -Name "powershell" | Where-Object { $_.MainWindowTitle -like "*server.ps1*" }
if (-not $serverRunning) {
    Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass -NoProfile -File `"$baseDir\server.ps1`"" -WindowStyle Minimized
}

# Inicia o túnel Cloudflare seguro para celular
$cfExe = "$baseDir\cloudflared.exe"
if (Test-Path $cfExe) {
    Write-Host "Iniciando túnel seguro para acesso no celular..." -ForegroundColor Cyan
    & $cfExe tunnel --url http://localhost:3000
} else {
    Write-Host "Servidor ativo em http://localhost:3000" -ForegroundColor Green
}
