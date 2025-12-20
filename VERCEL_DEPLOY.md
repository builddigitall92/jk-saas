# 🚀 Guide de déploiement Vercel pour jk-saas

## ⚠️ Erreurs courantes et solutions

### 1. Variables d'environnement manquantes

**Symptôme** : Build échoue avec des erreurs liées à Supabase ou des variables undefined

**Solution** :

1. **Aller sur le Dashboard Vercel**
   - https://vercel.com/dashboard
   - Sélectionne ton projet `jk-saas`

2. **Settings > Environment Variables**

3. **Ajouter ces variables** (pour tous les environnements : Production, Preview, Development) :

```
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
```

4. **Optionnel - Pour Stripe** (si tu utilises les paiements) :
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
```

5. **Redeploy** après avoir ajouté les variables

### 2. Erreur "Module not found"

**Solution** :
```bash
# Vérifie que toutes les dépendances sont dans package.json
# Vercel installe automatiquement avec pnpm
```

### 3. Erreur TypeScript

**Note** : Le projet a `ignoreBuildErrors: true` dans next.config.mjs, donc les erreurs TypeScript ne bloquent pas le build.

### 4. Erreur de build Next.js

**Vérifications** :
- ✅ Node.js version : Vercel utilise automatiquement la bonne version (16+)
- ✅ pnpm détecté : Le projet utilise pnpm (détecté automatiquement)
- ✅ Build command : `next build` (par défaut, pas besoin de configurer)

## 📋 Checklist de déploiement

### Avant de déployer :
- [ ] Variables d'environnement configurées sur Vercel
- [ ] `.env.local` existe localement (mais n'est PAS commité - c'est normal)
- [ ] Build fonctionne localement : `pnpm build`

### Configuration Vercel :

1. **Import Project** depuis GitHub
   - Repository : `builddigitall92/jk-saas`
   - Framework Preset : **Next.js** (détecté automatiquement)
   - Root Directory : `./` (par défaut)
   - Build Command : `next build` (par défaut)
   - Output Directory : `.next` (par défaut)

2. **Environment Variables**
   - Production, Preview, Development : Toutes les mêmes variables

3. **Deploy**

## 🔍 Comment voir les logs d'erreur

1. **Dashboard Vercel** > Ton projet
2. Onglet **"Deployments"**
3. Clique sur le dernier déploiement (celui qui a échoué)
4. Section **"Build Logs"** ou **"Function Logs"**

## 🛠️ Commandes utiles

### Test local du build production :
```bash
pnpm build
pnpm start
```

### Vérifier les variables d'environnement nécessaires :
Les variables utilisées dans le code :
- `NEXT_PUBLIC_SUPABASE_URL` (app/lib/supabase.ts, utils/supabase/*.ts)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (app/lib/supabase.ts, utils/supabase/*.ts)
- `SUPABASE_SERVICE_ROLE_KEY` (supabase functions - optionnel)
- `STRIPE_SECRET_KEY` (supabase functions - optionnel)
- `STRIPE_WEBHOOK_SECRET` (supabase functions - optionnel)

## 📝 Configuration recommandée Vercel

### Build & Development Settings :
- **Framework Preset** : Next.js
- **Build Command** : `next build` (ou laisser vide pour auto-détection)
- **Output Directory** : `.next` (ou laisser vide pour auto-détection)
- **Install Command** : `pnpm install` (auto-détecté)

### Environment Variables (Production) :
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

### Environment Variables (Preview & Development) :
Mêmes variables que Production (pour tester)

## 🔗 URLs importantes

- **Dashboard Vercel** : https://vercel.com/dashboard
- **Ton projet** : https://vercel.com/[ton-compte]/jk-saas
- **Documentation Vercel** : https://vercel.com/docs

## ❓ Si ça ne fonctionne toujours pas

Partage avec moi :
1. Les logs d'erreur complets depuis Vercel
2. Le message d'erreur exact
3. La section qui échoue (Build, Install, Deploy)

Je pourrai t'aider à résoudre le problème spécifique !
