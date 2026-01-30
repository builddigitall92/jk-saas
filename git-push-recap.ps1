# Push récap hebdomadaire sur GitHub
Set-Location $PSScriptRoot

git add components/weekly-recap-popup.tsx lib/hooks/use-weekly-recap.ts app/manager/page.tsx app/manager/layout.tsx
git status
git commit -m "Popup récap hebdo: cards gradient, responsive, CA/gaspillage/projection 6 mois"
git push origin main
