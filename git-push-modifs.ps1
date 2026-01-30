# Enregistrer les modifs sur GitHub - Gaspillage catégories + suppression prix
Set-Location $PSScriptRoot
git add app/employee/stock/page.tsx app/employee/waste/page.tsx app/manager/layout.tsx app/manager/waste/
git status
git commit -m "Gaspillage: catégories comme stocks, suppression des prix (Manager + Employé)"
git push origin main
