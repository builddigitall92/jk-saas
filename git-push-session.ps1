# Enregistrer toute la session sur GitHub
# IMPORTANT: Fermer Cursor (ou le panneau Source Control) puis exécuter dans PowerShell :
#   cd C:\Users\JK\Documents\REPO\jk-saas-4
#   .\git-push-session.ps1

Set-Location $PSScriptRoot

# Fichiers modifiés (session)
git add `
  app/api/stripe/sync/route.ts `
  app/api/stripe/webhook/route.ts `
  app/api/stripe/sync-all/ `
  app/billing/block/page.tsx `
  app/manager/help/page.tsx `
  app/manager/layout.tsx `
  app/manager/settings/page.tsx `
  app/manager/settings/subscription/page.tsx `
  app/onboarding/page.tsx `
  app/page.tsx `
  lib/hooks/use-subscription.ts `
  lib/pricing-config.ts `
  lib/stripe.ts `
  middleware.ts `
  supabase/migrations/20250129_fix_subscription_status_default.sql `
  git-push-session.ps1

git status

git commit -m "feat: session complète - stockguard.digital, contact, portail Stripe, prix 199€/1393€

- Landing/onboarding: app.stockguard.fr -> stockguard.digital
- Aide: Chat Support + Contacter le Support -> /contact
- Gérer l'Abonnement (menu + recherche) -> portail Stripe /api/stripe/portal
- Prix: 199€/mois, 1393€/an (pricing-config, stripe, use-subscription)
- Settings: affichage 199€/mois ou 1393€/an selon billing_period
- Subscription page: handleManageSubscription via API Next.js
- Migration fix subscription_status default"

git push origin main

Write-Host "`n✅ Session enregistrée sur GitHub." -ForegroundColor Green
