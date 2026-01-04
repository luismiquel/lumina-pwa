Write-Host "=== LUMINA LOCAL: RELEASE (local) ===" -ForegroundColor Cyan

Write-Host "`n[1/3] Clean..." -ForegroundColor Cyan
npm run clean
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "`n[2/3] Prod check (typecheck + build)..." -ForegroundColor Cyan
npm run prod:check
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "`n[3/3] Git status..." -ForegroundColor Cyan
git status

Write-Host "`nDONE ✅" -ForegroundColor Green
