Set-Location "C:\Users\lm42\lumina-pure-local"

Write-Host "Renombrando cualquier .js dentro de src a .bak..." -ForegroundColor Cyan

Get-ChildItem -Recurse -Force -File .\src -Filter *.js | ForEach-Object {
  Rename-Item $_.FullName ($_.FullName + ".bak") -Force
}

Write-Host "Comprobando que no quedan .js en src..." -ForegroundColor Cyan
$left = Get-ChildItem -Recurse -Force -File .\src -Filter *.js
if ($left.Count -gt 0) {
  Write-Host "Aun quedan .js:" -ForegroundColor Red
  $left | Select-Object FullName
  exit 1
}

Write-Host "OK: No quedan .js en src. Ejecutando build..." -ForegroundColor Green
npm run build
