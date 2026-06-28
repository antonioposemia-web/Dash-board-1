# Servidor local simples para o Dashboard de Notas.
# Uso: clique com o botao direito > "Executar com PowerShell"
#      ou rode no terminal:  powershell -ExecutionPolicy Bypass -File .\servidor.ps1
# Depois abra no navegador: http://localhost:8000

$porta = 8000
$raiz = $PSScriptRoot

$mime = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "application/javascript; charset=utf-8"
  ".csv"  = "text/csv; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".svg"  = "image/svg+xml"
  ".ico"  = "image/x-icon"
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$porta/")
$listener.Start()

Write-Host ""
Write-Host "Servidor rodando! Abra no navegador:" -ForegroundColor Green
Write-Host "  http://localhost:$porta" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pressione Ctrl+C nesta janela para parar o servidor." -ForegroundColor Yellow
Write-Host ""

try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $req = $ctx.Request
    $res = $ctx.Response

    $caminhoRel = [System.Uri]::UnescapeDataString($req.Url.AbsolutePath.TrimStart("/"))
    if ([string]::IsNullOrWhiteSpace($caminhoRel)) { $caminhoRel = "index.html" }

    $caminhoFull = Join-Path $raiz $caminhoRel

    if (Test-Path $caminhoFull -PathType Leaf) {
      $ext = [System.IO.Path]::GetExtension($caminhoFull).ToLower()
      $tipo = $mime[$ext]
      if (-not $tipo) { $tipo = "application/octet-stream" }
      $bytes = [System.IO.File]::ReadAllBytes($caminhoFull)
      $res.ContentType = $tipo
      $res.Headers.Add("Cache-Control", "no-store")
      $res.ContentLength64 = $bytes.Length
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $res.StatusCode = 404
      $msg = [System.Text.Encoding]::UTF8.GetBytes("404 - Arquivo nao encontrado: $caminhoRel")
      $res.OutputStream.Write($msg, 0, $msg.Length)
    }
    $res.OutputStream.Close()
  }
} finally {
  $listener.Stop()
}
