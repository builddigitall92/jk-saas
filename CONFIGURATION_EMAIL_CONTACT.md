# 📧 Configuration de la réception des emails de contact

Ce guide explique comment configurer la réception des emails depuis le formulaire de contact.

## 🚀 Option 1 : Resend (Recommandé - Gratuit jusqu'à 3000 emails/mois)

### Étape 1 : Créer un compte Resend

1. Allez sur [https://resend.com](https://resend.com)
2. Créez un compte gratuit
3. Vérifiez votre email

### Étape 2 : Obtenir votre clé API

1. Dans le dashboard Resend, allez dans **API Keys**
2. Cliquez sur **Create API Key**
3. Donnez un nom (ex: "StockGuard Production")
4. Copiez la clé (elle commence par `re_...`)

### Étape 3 : Configurer votre domaine (Optionnel mais recommandé)

Pour envoyer depuis votre propre domaine (ex: `contact@stockguard.app`) :

1. Allez dans **Domains** dans Resend
2. Cliquez sur **Add Domain**
3. Ajoutez votre domaine (ex: `stockguard.app`)
4. Ajoutez les enregistrements DNS indiqués dans votre registrar
5. Attendez la vérification (quelques minutes)

**Note** : Sans domaine vérifié, vous pouvez utiliser `onboarding@resend.dev` pour tester, mais c'est limité.

### Étape 4 : Configurer les variables d'environnement

Ajoutez dans votre fichier `.env.local` :

```env
RESEND_API_KEY=re_votre_cle_api_ici
CONTACT_EMAIL=votre-email@example.com
```

**Pour Vercel** (production) :
1. Allez sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet
3. **Settings** > **Environment Variables**
4. Ajoutez :
   - `RESEND_API_KEY` = votre clé Resend
   - `CONTACT_EMAIL` = votre email où recevoir les messages
5. Sélectionnez tous les environnements (Production, Preview, Development)
6. **Save** et **Redeploy**

### Étape 5 : Installer la dépendance

```bash
pnpm add resend
```

### Étape 6 : Modifier l'adresse d'envoi dans le code

Dans `app/api/contact/route.ts`, remplacez :
- `contact@votre-domaine.com` par votre domaine vérifié (ex: `contact@stockguard.app`)
- Ou utilisez `onboarding@resend.dev` pour les tests

## 🔄 Option 2 : Supabase (Si vous utilisez déjà Supabase)

### Étape 1 : Créer la table dans Supabase

1. Allez sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. **SQL Editor** > Créez une nouvelle requête :

```sql
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optionnel : Créer une politique RLS pour la lecture (admin seulement)
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Seuls les admins peuvent lire les messages"
ON contact_messages FOR SELECT
USING (auth.jwt() ->> 'role' = 'admin');
```

### Étape 2 : Configurer les variables d'environnement

Dans `.env.local` :

```env
USE_SUPABASE_CONTACT=true
```

### Étape 3 : Consulter les messages

Les messages seront stockés dans la table `contact_messages` de Supabase. Vous pouvez :
- Les consulter dans **Table Editor** de Supabase
- Créer un dashboard admin pour les afficher
- Configurer un trigger Supabase pour recevoir des notifications email

## 🧪 Option 3 : Mode développement (Logs uniquement)

Si aucune variable d'environnement n'est configurée, les messages seront simplement loggés dans la console du serveur.

Utile pour tester localement sans configurer de service d'email.

## 📋 Checklist de configuration

- [ ] Compte Resend créé (Option 1)
- [ ] Clé API Resend obtenue
- [ ] Domaine vérifié sur Resend (optionnel)
- [ ] Variable `RESEND_API_KEY` ajoutée dans `.env.local`
- [ ] Variable `CONTACT_EMAIL` ajoutée dans `.env.local`
- [ ] Variables ajoutées sur Vercel (si déployé)
- [ ] Dépendance `resend` installée (`pnpm add resend`)
- [ ] Adresse d'envoi modifiée dans `app/api/contact/route.ts`
- [ ] Test du formulaire de contact

## 🧪 Tester le formulaire

1. Allez sur `/contact`
2. Remplissez le formulaire
3. Soumettez
4. Vérifiez :
   - Vous recevez un email de notification
   - Le client reçoit un email de confirmation
   - Le message s'affiche correctement dans les deux emails

## 🔒 Sécurité

- ✅ Validation des champs côté serveur
- ✅ Validation de l'email
- ✅ Protection contre les spams (rate limiting recommandé - à ajouter)
- ✅ Pas d'exposition de la clé API côté client

## 🐛 Dépannage

### "RESEND_API_KEY is not defined"
- Vérifiez que la variable est bien dans `.env.local`
- Redémarrez le serveur de développement
- Sur Vercel, vérifiez que la variable est bien configurée

### "Domain not verified"
- Utilisez `onboarding@resend.dev` pour tester
- Ou vérifiez votre domaine dans Resend

### Les emails ne sont pas reçus
- Vérifiez les spams
- Vérifiez que `CONTACT_EMAIL` est correct
- Consultez les logs Resend dans le dashboard

## 📚 Ressources

- [Documentation Resend](https://resend.com/docs)
- [Guide Supabase](https://supabase.com/docs)
