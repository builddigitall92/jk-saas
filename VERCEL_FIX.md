# 🔧 Fix Vercel - Erreur "Environment Variable references Secret"

## ❌ L'erreur que tu vois :

```
"NEXT_PUBLIC_SUPABASE_URL" references Secret "supabase_url", which does not exist.
```

## 🎯 Solution rapide (5 minutes)

### Étape 1 : Supprimer la variable mal configurée

1. Va sur **Vercel Dashboard** : https://vercel.com/dashboard
2. Sélectionne ton projet **jk-saas**
3. Va dans **Settings** (en haut)
4. Clique sur **Environment Variables** (menu de gauche)
5. **Trouve** `NEXT_PUBLIC_SUPABASE_URL` dans la liste
6. **Supprime-la** (icône poubelle)
7. **Fais pareil** pour `NEXT_PUBLIC_SUPABASE_ANON_KEY` si elle existe aussi

### Étape 2 : Récupérer tes vraies valeurs Supabase

1. Va sur **Supabase Dashboard** : https://supabase.com/dashboard
2. Sélectionne ton projet
3. Va dans **Settings** > **API**
4. **Copie ces 2 valeurs** :
   - **Project URL** (ex: `https://xxxxx.supabase.co`)
   - **anon public** key (ex: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### Étape 3 : Ajouter les variables correctement sur Vercel

1. **Retourne sur Vercel** > Settings > Environment Variables
2. Clique sur **Add New**

3. **Première variable** :
   - **Key** : `NEXT_PUBLIC_SUPABASE_URL`
   - **Value** : Colle ton URL Supabase (ex: `https://xxxxx.supabase.co`)
   - **Environments** : ✅ Production ✅ Preview ✅ Development
   - Clique **Save**

4. **Deuxième variable** :
   - **Key** : `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value** : Colle ta clé anon (ex: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - **Environments** : ✅ Production ✅ Preview ✅ Development
   - Clique **Save**

### Étape 4 : Variables optionnelles (si tu utilises Stripe)

Si tu veux activer les paiements Stripe, ajoute aussi :

- **Key** : `STRIPE_SECRET_KEY`
- **Value** : `sk_test_...` (depuis Stripe Dashboard)
- **Environments** : ✅ Production ✅ Preview ✅ Development

- **Key** : `SUPABASE_SERVICE_ROLE_KEY`
- **Value** : Service role key depuis Supabase (Settings > API > service_role)
- **Environments** : ✅ Production ✅ Preview ✅ Development

- **Key** : `STRIPE_WEBHOOK_SECRET`
- **Value** : `whsec_...` (depuis Stripe Dashboard > Webhooks)
- **Environments** : ✅ Production ✅ Preview ✅ Development

- **Key** : `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **Value** : `pk_test_...` (depuis Stripe Dashboard)
- **Environments** : ✅ Production ✅ Preview ✅ Development

- **Key** : `NEXT_PUBLIC_APP_URL`
- **Value** : `https://jk-saas.vercel.app` (ton URL Vercel)
- **Environments** : ✅ Production ✅ Preview ✅ Development

### Étape 5 : Redéployer

1. Retourne sur la page principale du projet Vercel
2. Va dans l'onglet **Deployments**
3. Clique sur les **3 points** (...) du dernier déploiement
4. Clique sur **Redeploy**
5. Confirme avec **Redeploy**

## ✅ Checklist

- [ ] Variable `NEXT_PUBLIC_SUPABASE_URL` supprimée (si elle référençait un secret)
- [ ] Variable `NEXT_PUBLIC_SUPABASE_URL` recréée avec la vraie valeur
- [ ] Variable `NEXT_PUBLIC_SUPABASE_ANON_KEY` supprimée (si elle référençait un secret)
- [ ] Variable `NEXT_PUBLIC_SUPABASE_ANON_KEY` recréée avec la vraie valeur
- [ ] Toutes les variables sont activées pour Production, Preview ET Development
- [ ] Redéploiement effectué

## 🎉 C'est tout !

Le build devrait maintenant fonctionner. Si tu as encore des erreurs, partage-moi les nouveaux logs.

## 💡 Astuce

Tu peux aussi trouver tes variables Supabase dans ton fichier `.env.local` local (si tu l'as créé) :
- Ouvre `.env.local` dans ton projet
- Copie les valeurs de `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 📋 Liste complète des variables nécessaires

### Variables REQUISES (minimum pour que l'app fonctionne) :

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Variables OPTIONNELLES (pour Stripe/paiements) :

```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=https://jk-saas.vercel.app
```

### Variables OPTIONNELLES (IDs Stripe - ont des valeurs par défaut) :

```
STRIPE_STARTER_PRICE_ID=price_1SgN5HCF3gPATsYiLda8sBcz
STRIPE_PRO_PRICE_ID=price_1SgN5WCF3gPATsYiRnTOv9fz
STRIPE_PREMIUM_PRICE_ID=price_1SgN7VCF3gPATsYi1yMMN3Op
```

