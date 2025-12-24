# 🚨 GUIDE URGENT - Fix Vercel en 3 minutes

## Le problème que tu vois :

```
❌ "NEXT_PUBLIC_SUPABASE_URL" references Secret "supabase_url", which does not exist.
```

## ✅ Solution en 3 étapes :

### 📍 ÉTAPE 1 : Supprimer la variable mal configurée (1 min)

1. **Ouvre** : https://vercel.com/dashboard
2. **Clique** sur ton projet **jk-saas**
3. **Clique** sur **Settings** (en haut à droite)
4. **Clique** sur **Environment Variables** (menu de gauche)
5. **Trouve** `NEXT_PUBLIC_SUPABASE_URL` dans la liste
6. **Clique** sur l'icône 🗑️ (poubelle) pour la **SUPPRIMER**
7. **Fais pareil** pour `NEXT_PUBLIC_SUPABASE_ANON_KEY` si elle existe

### 📍 ÉTAPE 2 : Récupérer tes valeurs Supabase (1 min)

1. **Ouvre** : https://supabase.com/dashboard
2. **Sélectionne** ton projet
3. **Clique** sur **Settings** (menu de gauche)
4. **Clique** sur **API**
5. **Copie** ces 2 valeurs :
   - **Project URL** → Exemple : `https://abcdefgh.supabase.co`
   - **anon public** key → Exemple : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 📍 ÉTAPE 3 : Ajouter les variables correctement (1 min)

1. **Retourne** sur Vercel > Settings > Environment Variables
2. **Clique** sur **Add New**

#### Variable 1 :
- **Key** : `NEXT_PUBLIC_SUPABASE_URL`
- **Value** : Colle ton URL Supabase (ex: `https://abcdefgh.supabase.co`)
- **Environments** : ✅ Production ✅ Preview ✅ Development
- **Clique** **Save**

#### Variable 2 :
- **Key** : `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value** : Colle ta clé anon (ex: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
- **Environments** : ✅ Production ✅ Preview ✅ Development
- **Clique** **Save**

### 📍 ÉTAPE 4 : Redéployer (30 sec)

1. **Retourne** sur la page principale du projet Vercel
2. **Clique** sur l'onglet **Deployments**
3. **Clique** sur les **3 points** (...) du dernier déploiement
4. **Clique** sur **Redeploy**
5. **Confirme** avec **Redeploy**

## 🎉 C'est fait !

Le build devrait maintenant fonctionner. Attends 2-3 minutes pour que le déploiement se termine.

---

## 💡 Si tu ne trouves pas tes valeurs Supabase :

Tu peux aussi les trouver dans ton fichier local `.env.local` :
1. Ouvre ton projet dans VS Code
2. Cherche le fichier `.env.local` (il peut être caché)
3. Ouvre-le et copie les valeurs de :
   - `NEXT_PUBLIC_SUPABASE_URL=...`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`

---

## ❓ Si ça ne marche toujours pas :

Partage-moi :
1. Le message d'erreur exact
2. Les logs de build depuis Vercel (Deployments > Build Logs)

