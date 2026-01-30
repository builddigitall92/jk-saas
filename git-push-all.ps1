# Push TOUS les changements sur GitHub
Set-Location $PSScriptRoot

Write-Host "=== Ajout de TOUS les fichiers modifiés ===" -ForegroundColor Green
git add .

Write-Host "`n=== Statut Git ===" -ForegroundColor Cyan
git status

Write-Host "`n=== Commit ===" -ForegroundColor Green
git commit -m "Mise à jour complète: popup récap hebdo + modifications billing + autres changements"

Write-Host "`n=== Push vers GitHub ===" -ForegroundColor Yellow
git push origin main

Write-Host "`n=== Terminé ! ===" -ForegroundColor Green
