# Configuration Stripe pour StockGuard

## Étapes de configuration

### 1. Créer un compte Stripe
1. Allez sur https://stripe.com
2. Créez un compte ou connectez-vous
3. Activez le mode Test pour commencer

### 2. Récupérer les clés API
1. Dans le Dashboard Stripe, allez dans **Developers** > **API keys**
2. Copiez :
   - **Publishable key** (commence par `pk_test_...`)
   - **Secret key** (commence par `sk_test_...`)

### 3. Créer les produits et prix
1. Allez dans **Products** > **Add product**
2. Créez 3 produits :
   - **Starter** : 20€/mois (facturation mensuelle) → Copiez le Price ID (`price_...`)
   - **Pro** : 80€/mois (facturation mensuelle) → Copiez le Price ID (`price_...`)
   - **Premium** : 110€/mois (facturation mensuelle) → Copiez le Price ID (`price_...`)
3. Pour chaque produit :
   - Mode : **Subscription**
   - Billing period : **Monthly**
   - Price : Montant en euros (ex: 20, 80, 110)
   - Copiez le **Price ID** et ajoutez-le dans `.env.local` (optionnel, des valeurs par défaut sont définies dans le code)

### 4. Configurer les webhooks
1. Allez dans **Developers** > **Webhooks**
2. Cliquez sur **Add endpoint**
3. URL : `https://votre-domaine.com/api/stripe/webhook`
   - Pour le développement local, utilisez Stripe CLI (voir ci-dessous)
   - Pour la production, utilisez l'URL de votre application déployée
4. Sélectionnez ces événements :
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copiez le **Signing secret** (`whsec_...`)

### 5. Configurer les variables d'environnement
1. Créez un fichier `.env.local` à la racine du projet (copiez `.env.local.example`)
2. Ajoutez les variables suivantes :
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   
   # Optionnel : Price IDs personnalisés
   STRIPE_STARTER_PRICE_ID=price_...
   STRIPE_PRO_PRICE_ID=price_...
   STRIPE_PREMIUM_PRICE_ID=price_...
   ```

### 6. Appliquer la migration de base de données
Exécutez la migration SQL pour ajouter les champs Stripe à la table `establishments` :
```sql
-- Le fichier est dans supabase/migrations/20250128_add_stripe_fields.sql
-- Appliquez-le via Supabase Dashboard > SQL Editor ou via Supabase CLI
```

## Test en local

### Utiliser Stripe CLI pour tester les webhooks localement

1. **Installer Stripe CLI** : https://stripe.com/docs/stripe-cli
2. **Se connecter** :
   ```bash
   stripe login
   ```
3. **Écouter les webhooks** (dans un terminal séparé) :
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   Cette commande vous donnera un webhook signing secret (`whsec_...`) à utiliser dans `.env.local`
4. **Déclencher des événements de test** :
   ```bash
   stripe trigger checkout.session.completed
   stripe trigger customer.subscription.created
   ```

### Tester avec des cartes de test

1. Utilisez les cartes de test Stripe :
   - Succès : `4242 4242 4242 4242`
   - Échec : `4000 0000 0000 0002`
   - Requiert authentification : `4000 0025 0000 3155`
2. Date d'expiration : N'importe quelle date future (ex: `12/34`)
3. CVC : N'importe quel 3 chiffres (ex: `123`)
4. Code postal : N'importe quel code postal valide

## Passer en production
1. Activez votre compte Stripe (vérification d'identité requise)
2. Remplacez toutes les clés `test` par les clés `live`
3. Créez de nouveaux webhooks pour la production
4. Mettez à jour les variables d'environnement

## Support
- Documentation Stripe : https://stripe.com/docs
- Dashboard Stripe : https://dashboard.stripe.com
