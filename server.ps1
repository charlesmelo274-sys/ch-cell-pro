$port = 3000
$baseDir = $PSScriptRoot
$dbFile = Join-Path $baseDir "database.json"

# Identifica o IP local na rede interna (Ethernet / Wi-Fi)
$localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { 
    $_.InterfaceAlias -notlike "*Loopback*" -and 
    $_.IPAddress -notlike "169.254*" -and
    $_.IPAddress -notlike "127.*"
} | Select-Object -ExpandProperty IPAddress -First 1)

if (-not $localIP) { $localIP = "192.168.247.83" }

$endpoint = [System.Net.IPEndPoint]::new([System.Net.IPAddress]::Any, $port)
$listener = [System.Net.Sockets.TcpListener]::new($endpoint)

try {
    $listener.Start()
} catch {
    Write-Host "Erro ao iniciar o servidor na porta $port`: $_" -ForegroundColor Red
    exit 1
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  CH CELL PRO - SERVIDOR CENTRAL (PC + CELULAR SINCRONIZADOS)" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  No seu Computador:            http://localhost:$port" -ForegroundColor Yellow
Write-Host "  No seu Celular (mesmo Wi-Fi): http://${localIP}:$port" -ForegroundColor Green
Write-Host "  Sincronizacao em tempo real:  /api/sync ativo com database.json" -ForegroundColor Magenta
Write-Host "==========================================================" -ForegroundColor Cyan

while ($true) {
    $client = $null
    try {
        $client = $listener.AcceptTcpClient()
        $client.ReceiveTimeout = 6000
        $client.SendTimeout = 6000

        $stream = $client.GetStream()
        $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::UTF8)
        $firstLine = $reader.ReadLine()

        if ([string]::IsNullOrWhiteSpace($firstLine)) {
            $client.Close()
            continue
        }

        $parts = $firstLine.Split(' ')
        if ($parts.Length -lt 2) {
            $client.Close()
            continue
        }

        $method = $parts[0].ToUpper()
        $rawUrl = $parts[1]

        # Lê cabeçalhos para obter Content-Length
        $contentLength = 0
        while ($true) {
            $headerLine = $reader.ReadLine()
            if ([string]::IsNullOrEmpty($headerLine)) { break }
            if ($headerLine.StartsWith("Content-Length:", [System.StringComparison]::OrdinalIgnoreCase)) {
                $contentLength = [int]($headerLine.Split(':')[1].Trim())
            }
        }

        # Remove query strings e âncoras
        $cleanUrl = $rawUrl.Split('?')[0].Split('#')[0].TrimStart('/')
        $cleanUrl = [System.Uri]::UnescapeDataString($cleanUrl)

        # CORS Headers padrão
        $corsHeaders = "Access-Control-Allow-Origin: *`r`n" +
                       "Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE`r`n" +
                       "Access-Control-Allow-Headers: *`r`n"

        # -------------------------------------------------------------
        # 1. TRATAMENTO CORS PRE-FLIGHT (OPTIONS)
        # -------------------------------------------------------------
        if ($method -eq "OPTIONS") {
            $res = "HTTP/1.1 200 OK`r`n" +
                   $corsHeaders +
                   "Content-Length: 0`r`n" +
                   "Connection: close`r`n`r`n"
            $bytes = [System.Text.Encoding]::ASCII.GetBytes($res)
            $stream.Write($bytes, 0, $bytes.Length)
            $stream.Flush()
            $client.Close()
            continue
        }

        # -------------------------------------------------------------
        # 2. ROTA DE SINCRONIZAÇÃO EM TEMPO REAL (/api/sync)
        # -------------------------------------------------------------
        if ($cleanUrl -eq "api/sync") {
            if ($method -eq "POST") {
                $body = ""
                if ($contentLength -gt 0) {
                    $buffer = New-Object char[] $contentLength
                    $readCount = 0
                    while ($readCount -lt $contentLength) {
                        $r = $reader.Read($buffer, $readCount, $contentLength - $readCount)
                        if ($r -le 0) { break }
                        $readCount += $r
                    }
                    $body = [string]::new($buffer, 0, $readCount)
                }

                if (-not [string]::IsNullOrWhiteSpace($body)) {
                    [System.IO.File]::WriteAllText($dbFile, $body, [System.Text.Encoding]::UTF8)
                }

                $nowMs = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
                $jsonRes = "{`"success`":true,`"timestamp`":$nowMs}"
                $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($jsonRes)

                $headerStr = "HTTP/1.1 200 OK`r`n" +
                             "Content-Type: application/json; charset=utf-8`r`n" +
                             "Content-Length: $($bodyBytes.Length)`r`n" +
                             $corsHeaders +
                             "Cache-Control: no-cache, no-store, must-revalidate`r`n" +
                             "Connection: close`r`n`r`n"
                $hBytes = [System.Text.Encoding]::ASCII.GetBytes($headerStr)
                $stream.Write($hBytes, 0, $hBytes.Length)
                $stream.Write($bodyBytes, 0, $bodyBytes.Length)
            } else {
                # GET /api/sync
                $dataJson = "{}"
                if ([System.IO.File]::Exists($dbFile)) {
                    $dataJson = [System.IO.File]::ReadAllText($dbFile, [System.Text.Encoding]::UTF8)
                }

                $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($dataJson)
                $headerStr = "HTTP/1.1 200 OK`r`n" +
                             "Content-Type: application/json; charset=utf-8`r`n" +
                             "Content-Length: $($bodyBytes.Length)`r`n" +
                             $corsHeaders +
                             "Cache-Control: no-cache, no-store, must-revalidate`r`n" +
                             "Connection: close`r`n`r`n"
                $hBytes = [System.Text.Encoding]::ASCII.GetBytes($headerStr)
                $stream.Write($hBytes, 0, $hBytes.Length)
                $stream.Write($bodyBytes, 0, $bodyBytes.Length)
            }
            $stream.Flush()
            $client.Close()
            continue
        }

        # -------------------------------------------------------------
        # 3. ROTA DE CHECAGEM RÁPIDA DE TIMESTAMP (/api/sync-timestamp)
        # -------------------------------------------------------------
        if ($cleanUrl -eq "api/sync-timestamp") {
            $ts = 0
            if ([System.IO.File]::Exists($dbFile)) {
                $ts = [DateTimeOffset]::new([System.IO.File]::GetLastWriteTimeUtc($dbFile)).ToUnixTimeMilliseconds()
            }
            $jsonRes = "{`"timestamp`":$ts}"
            $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($jsonRes)
            $headerStr = "HTTP/1.1 200 OK`r`n" +
                         "Content-Type: application/json; charset=utf-8`r`n" +
                         "Content-Length: $($bodyBytes.Length)`r`n" +
                         $corsHeaders +
                         "Cache-Control: no-cache, no-store, must-revalidate`r`n" +
                         "Connection: close`r`n`r`n"
            $hBytes = [System.Text.Encoding]::ASCII.GetBytes($headerStr)
            $stream.Write($hBytes, 0, $hBytes.Length)
            $stream.Write($bodyBytes, 0, $bodyBytes.Length)
            $stream.Flush()
            $client.Close()
            continue
        }

        # -------------------------------------------------------------
        # 4. ARQUIVOS ESTÁTICOS DO SISTEMA (HTML, JS, CSS, ETC)
        # -------------------------------------------------------------
        if ([string]::IsNullOrWhiteSpace($cleanUrl)) {
            $cleanUrl = "index.html"
        }

        $filePath = [System.IO.Path]::Combine($baseDir, $cleanUrl)

        if ([System.IO.File]::Exists($filePath)) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                ".js"   { "application/javascript; charset=utf-8" }
                ".json" { "application/json; charset=utf-8" }
                ".png"  { "image/png" }
                ".jpg"  { "image/jpeg" }
                ".jpeg" { "image/jpeg" }
                ".svg"  { "image/svg+xml" }
                ".webp" { "image/webp" }
                ".ico"  { "image/x-icon" }
                default { "application/octet-stream" }
            }

            $fileBytes = [System.IO.File]::ReadAllBytes($filePath)
            $headerStr = "HTTP/1.1 200 OK`r`n" +
                         "Content-Type: $mime`r`n" +
                         "Content-Length: $($fileBytes.Length)`r`n" +
                         $corsHeaders +
                         "Cache-Control: no-store, no-cache, must-revalidate, max-age=0`r`n" +
                         "Pragma: no-cache`r`n" +
                         "Expires: 0`r`n" +
                         "Connection: close`r`n`r`n"

            $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($headerStr)
            $stream.Write($headerBytes, 0, $headerBytes.Length)
            if ($method -ne "HEAD") {
                $stream.Write($fileBytes, 0, $fileBytes.Length)
            }
        } else {
            $notFound = [System.Text.Encoding]::UTF8.GetBytes("404 Nao Encontrado")
            $headerStr = "HTTP/1.1 404 Not Found`r`n" +
                         "Content-Type: text/plain; charset=utf-8`r`n" +
                         "Content-Length: $($notFound.Length)`r`n" +
                         $corsHeaders +
                         "Connection: close`r`n`r`n"
            $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($headerStr)
            $stream.Write($headerBytes, 0, $headerBytes.Length)
            if ($method -ne "HEAD") {
                $stream.Write($notFound, 0, $notFound.Length)
            }
        }

        $stream.Flush()
        $client.Close()
    } catch {
        if ($client) {
            try { $client.Close() } catch {}
        }
    }
}
