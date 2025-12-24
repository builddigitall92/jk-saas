# 🔧 Configuration Variables d'Environnement Vercel

## ❌ Erreur actuelle :

```
Error: supabaseKey is required.
Failed to collect page data for /api/stripe/webhook
```

## ✅ Solution : Ajouter les variables manquantes

### Variables REQUISES (minimum pour que l'app fonctionne) :

#### 1. `NEXT_PUBLIC_SUPABASE_URL`
- **Où trouver** : Supabase Dashboard → Settings → API → Project URL
- **Exemple** : `https://xxxxxxxxxxxxx.supabase.co`
- **Environments** : ✅ Production ✅ Preview ✅ Development

#### 2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Où trouver** : Supabase Dashboard → Settings → API → anon public key
- **Exemple** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Environments** : ✅ Production ✅ Preview ✅ Development

### Variables OPTIONNELLES (pour Stripe/paiements) :

#### 3. `SUPABASE_SERVICE_ROLE_KEY` ⚠️ IMPORTANT pour webhook Stripe
- **Où trouver** : Supabase Dashboard → Settings → API → service_role key
- **⚠️ ATTENTION** : Cette clé a des permissions admin, ne l'exposez JAMAIS au client
- **Exemple** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Environments** : ✅ Production ✅ Preview ✅ Development
- **Note** : Si tu n'utilises pas Stripe, tu peux laisser cette variable vide, mais le webhook Stripe ne fonctionnera pas

#### 4. `STRIPE_SECRET_KEY`
- **Où trouver** : Stripe Dashboard → Developers → API keys → Secret key
- **Exemple** : `sk_test_...` ou `sk_live_...`
- **Environments** : ✅ Production ✅ Preview ✅ Development

#### 5. `STRIPE_WEBHOOK_SECRET`
- **Où trouver** : Stripe Dashboard → Developers → Webhooks → [Ton webhook] → Signing secret
- **Exemple** : `whsec_...`
- **Environments** : ✅ Production ✅ Preview ✅ Development

#### 6. `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **Où trouver** : Stripe Dashboard → Developers → API keys → Publishable key
- **Exemple** : `pk_test_...` ou `pk_live_...`
- **Environments** : ✅ Production ✅ Preview ✅ Development

#### 7. `NEXT_PUBLIC_APP_URL`
- **Valeur** : L'URL de ton app Vercel
- **Exemple** : `https://jk-saas.vercel.app`
- **Environments** : ✅ Production ✅ Preview ✅ Development

## 📋 Checklist de configuration

### Étape 1 : Variables Supabase (REQUISES)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` ajoutée sur Vercel
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` ajoutée sur Vercel
- [ ] Les deux variables activées pour Production, Preview ET Development

### Étape 2 : Variables Stripe (OPTIONNELLES mais recommandées)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` ajoutée (pour webhook Stripe)
- [ ] `STRIPE_SECRET_KEY` ajoutée (si tu utilises Stripe)
- [ ] `STRIPE_WEBHOOK_SECRET` ajoutée (si tu utilises Stripe)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` ajoutée (si tu utilises Stripe)
- [ ] `NEXT_PUBLIC_APP_URL` ajoutée

### Étape 3 : Redéploiement
- [ ] Redéploiement effectué après avoir ajouté les variables

## 🎯 Configuration rapide (5 minutes)

1. **Va sur** : https://vercel.com/dashboard
2. **Sélectionne** ton projet **jk-saas**
3. **Clique** sur **Settings** → **Environment Variables**
4. **Ajoute** chaque variable une par une :
   - Clique sur **Add New**
   - Colle la **Key** et la **Value**
   - Active **Production**, **Preview** ET **Development**
   - Clique **Save**
5. **Redéploie** : Deployments → 3 points (...) → Redeploy

## ⚠️ Important

- **NE JAMAIS** utiliser "Reference Secret" pour ces variables
- **COLLER DIRECTEMENT** les valeurs dans le champ "Value"
- **ACTIVER** pour tous les environnements (Production, Preview, Development)

## 🎉 Après configuration

Une fois toutes les variables ajoutées et le redéploiement effectué, le build devrait fonctionner !

