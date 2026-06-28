# ============================================================
#  Publicacao automatica no GitHub (GitHub Pages)
#  ------------------------------------------------------------
#  Observa esta pasta e, sempre que voce SALVAR um arquivo
#  (ex: notas_alunos.csv), envia as mudancas para o GitHub
#  sozinho. O site publico atualiza cerca de 1 minuto depois.
#
#  Como usar:
#    - Clique com o botao direito neste arquivo > "Executar com PowerShell"
#    - ou no terminal:  powershell -ExecutionPolicy Bypass -File .\publicar-auto.ps1
#    - Para parar: feche esta janela (ou Ctrl+C).
#
#  Reutilizavel: basta copiar este arquivo para a pasta de
#  qualquer outro projeto que use git + GitHub.
# ============================================================

$intervalo = 5  # segundos entre verificacoes
$raiz = $PSScriptRoot
Set-Location $raiz

# Confirma que a pasta e um repositorio git
git rev-parse --is-inside-work-tree *> $null
if ($LASTEXITCODE -ne 0) {
  Write-Host "ERRO: esta pasta nao e um repositorio git." -ForegroundColor Red
  Write-Host "Abra a pasta certa do projeto e tente novamente." -ForegroundColor Red
  Read-Host "Pressione Enter para fechar"
  exit 1
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host " Publicacao automatica ATIVADA" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host " Pasta observada: $raiz" -ForegroundColor Cyan
Write-Host " Salve um arquivo e ele sera enviado ao GitHub." -ForegroundColor Cyan
Write-Host " Feche esta janela para parar." -ForegroundColor Yellow
Write-Host ""

$pendente = $false

while ($true) {
  Start-Sleep -Seconds $intervalo

  $mudancas = git status --porcelain
  if ([string]::IsNullOrWhiteSpace($mudancas)) {
    $pendente = $false
    continue
  }

  # Debounce: espera um ciclo de estabilidade antes de publicar,
  # para nao enviar no meio de um salvamento.
  if (-not $pendente) {
    $pendente = $true
    continue
  }

  $carimbo = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  git add -A
  git commit -m "Atualizacao automatica - $carimbo" *> $null
  git push *> $null

  if ($LASTEXITCODE -eq 0) {
    Write-Host "[$carimbo] Enviado ao GitHub. O site atualiza em ~1 min." -ForegroundColor Green
  } else {
    Write-Host "[$carimbo] FALHA ao enviar (push)." -ForegroundColor Red
    Write-Host "           Verifique sua internet e o login do GitHub." -ForegroundColor Red
  }

  $pendente = $false
}
