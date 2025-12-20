# 📦 Créer un nouveau repository GitHub pour StockGuard

## Étape 1 : Créer le repository sur GitHub

1. **Aller sur GitHub**
   - Va sur https://github.com
   - Clique sur le bouton **"New"** (en vert) ou **"+"** en haut à droite puis **"New repository"**

2. **Configurer le repository**
   ```
   Repository name: StockGuard
   Description: Solution SaaS de gestion de stocks et optimisation des marges pour restaurants
   Visibility: ✅ Public (ou Private selon ton choix)
   
   ⚠️ NE PAS cocher :
   - Add a README file
   - Add .gitignore
   - Choose a license
   
   (On a déjà ces fichiers localement)
   ```

3. **Créer le repository**
   - Clique sur **"Create repository"**
   - GitHub va te montrer des instructions

## Étape 2 : Lier ton projet local au nouveau repository

### Option A : Si tu veux GARDER l'historique Git actuel

```bash
cd "c:\Users\JK\Documents\REPO\SaasRestau"

# Ajouter le nouveau remote
git remote add github https://github.com/TON_USERNAME/StockGuard.git

# Ou si tu veux remplacer l'ancien remote
git remote set-url origin https://github.com/TON_USERNAME/StockGuard.git

# Vérifier les remotes
git remote -v

# Pousser vers le nouveau repository
git push -u github SAAS

# Ou si tu as remplacé origin
git push -u origin SAAS
```

### Option B : Si tu veux un NOUVEAU départ (recommandé pour un repo propre)

```bash
cd "c:\Users\JK\Documents\REPO\SaasRestau"

# Supprimer l'ancien remote
git remote remove origin

# Ajouter le nouveau remote
git remote add origin https://github.com/TON_USERNAME/StockGuard.git

# Renommer la branche en main (standard GitHub)
git branch -M main

# Pousser vers le nouveau repository
git push -u origin main
```

### Option C : Créer un repository complètement frais

```bash
# Créer un nouveau dossier
cd "c:\Users\JK\Documents\REPO"
mkdir StockGuard-New
cd StockGuard-New

# Copier tous les fichiers SAUF .git
xcopy "c:\Users\JK\Documents\REPO\SaasRestau\*" . /E /H /C /I /Y /EXCLUDE:c:\Users\JK\Documents\REPO\SaasRestau\.git

# Initialiser un nouveau Git
git init
git add .
git commit -m "Initial commit: Complete StockGuard SaaS application"

# Lier au nouveau repository GitHub
git remote add origin https://github.com/TON_USERNAME/StockGuard.git
git branch -M main
git push -u origin main
```

## Étape 3 : Vérifier sur GitHub

1. Rafraîchir la page de ton repository GitHub
2. Tu devrais voir tous tes fichiers
3. Le README.md s'affiche automatiquement

## Étape 4 : Configurer les secrets (pour déploiement)

### Sur GitHub (Settings > Secrets and variables > Actions)

Ajouter ces secrets si tu veux déployer automatiquement :
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
STRIPE_SECRET_KEY (optionnel)
```

## Étape 5 : Déployer sur Vercel (optionnel)

1. **Aller sur Vercel**
   - https://vercel.com
   - Connecte-toi avec GitHub

2. **Import Project**
   - Clique sur **"Add New"** > **"Project"**
   - Sélectionne ton repository **StockGuard**

3. **Configurer**
   ```
   Framework Preset: Next.js
   Root Directory: ./
   Build Command: pnpm build (ou npm run build)
   Output Directory: .next
   ```

4. **Variables d'environnement**
   Ajouter :
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

5. **Deploy**
   - Clique sur **"Deploy"**
   - Vercel va builder et déployer automatiquement
   - Tu auras une URL : `https://stock-guard.vercel.app`

## 🎯 Résumé rapide

```bash
# Dans ton projet actuel
cd "c:\Users\JK\Documents\REPO\SaasRestau"

# Créer le repo sur GitHub, puis :
git remote add origin https://github.com/TON_USERNAME/StockGuard.git
git branch -M main
git push -u origin main
```

## 📝 Notes importantes

1. **Remplace `TON_USERNAME`** par ton vrai username GitHub
2. Si tu as des erreurs de permissions, configure SSH ou utilise un Personal Access Token
3. Pour la sécurité, **NE JAMAIS** commit les fichiers `.env` (déjà dans .gitignore)
4. Le fichier `STRIPE_SETUP.md` contient les instructions pour Stripe

## 🔐 Configuration SSH (si besoin)

Si tu veux utiliser SSH au lieu de HTTPS :

```bash
# Générer une clé SSH
ssh-keygen -t ed25519 -C "ton-email@example.com"

# Copier la clé publique
cat ~/.ssh/id_ed25519.pub

# Aller sur GitHub > Settings > SSH and GPG keys > New SSH key
# Coller la clé

# Utiliser l'URL SSH
git remote set-url origin git@github.com:TON_USERNAME/StockGuard.git
```

## ✅ Checklist finale

- [ ] Repository créé sur GitHub
- [ ] Code poussé vers GitHub
- [ ] README visible sur la page du repo
- [ ] .env ajouté au .gitignore
- [ ] Variables d'environnement configurées sur Vercel (si déploiement)
- [ ] Application déployée et fonctionnelle

---

Bonne chance avec ton nouveau repository ! 🚀
