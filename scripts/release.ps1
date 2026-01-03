$ErrorActionPreference = "Stop"

Write-Host "=== LUMINA LOCAL: RELEASE (local) ===" -ForegroundColor Cyan

Write-Host "`n[1/3] Clean..." -ForegroundColor Yellow
npm run clean

Write-Host "`n[2/3] Prod check (typecheck + build)..." -ForegroundColor Yellow
npm run prod:check

Write-Host "`n[3/3] Git status..." -ForegroundColor Yellow
git status

Write-Host "`nDONE ✅" -ForegroundColor Green
