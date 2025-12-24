# ⚡ Configuration rapide Vercel - 2 minutes

## 🎯 Les problèmes courants

### ❌ Erreur 1 : "Environment Variable references Secret"
```
"NEXT_PUBLIC_SUPABASE_URL" references Secret "supabase_url", which does not exist.
```

**Solution** : Voir le fichier `VERCEL_FIX.md` pour la solution détaillée.

**Résumé rapide** :
1. Supprime la variable qui référence un secret inexistant
2. Recrée-la avec la vraie valeur (pas un secret)
3. Redéploie

### ❌ Erreur 2 : Variables manquantes
Le build échoue car les variables d'environnement Supabase ne sont pas configurées sur Vercel.

## ✅ Solution en 3 étapes

### Étape 1 : Trouve tes variables Supabase

1. Va sur https://supabase.com/dashboard
2. Sélectionne ton projet
3. Va dans **Settings** > **API**
4. Copie ces 2 valeurs :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Étape 2 : Configure sur Vercel

1. Va sur https://vercel.com/dashboard
2. Sélectionne ton projet **jk-saas**
3. Clique sur **Settings** (en haut)
4. Clique sur **Environment Variables** (dans le menu de gauche)
5. Clique sur **Add New**

6. **Ajoute la première variable** :
   - Key: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://xxx.supabase.co` (ton URL Supabase)
   - Environments: ✅ Production ✅ Preview ✅ Development
   - Clique **Save**

7. **Ajoute la deuxième variable** :
   - Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (ta clé anon)
   - Environments: ✅ Production ✅ Preview ✅ Development
   - Clique **Save**

### Étape 3 : Redéploie

1. Retourne sur la page principale du projet
2. Va dans l'onglet **Deployments**
3. Clique sur les **3 points** (...) du dernier déploiement
4. Clique sur **Redeploy**
5. Confirme avec **Redeploy**

## 🎉 C'est tout !

Le build devrait maintenant fonctionner. Si ça ne marche toujours pas, partage-moi les nouveaux logs d'erreur.

## 📝 Checklist rapide

- [ ] Variables copiées depuis Supabase Dashboard
- [ ] `NEXT_PUBLIC_SUPABASE_URL` ajoutée sur Vercel (tous environnements)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` ajoutée sur Vercel (tous environnements)
- [ ] Redéploiement effectué

---

💡 **Astuce** : Tu peux trouver tes variables dans ton fichier `.env.local` local aussi !
