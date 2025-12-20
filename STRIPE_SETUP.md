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
   - **Gratuit** : 0€/mois
   - **Pro** : 29€/mois → Copiez le Price ID (`price_...`)
   - **Enterprise** : 99€/mois → Copiez le Price ID (`price_...`)

### 4. Configurer les webhooks
1. Allez dans **Developers** > **Webhooks**
2. Cliquez sur **Add endpoint**
3. URL : `https://votre-projet.supabase.co/functions/v1/stripe-webhook`
4. Sélectionnez ces événements :
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copiez le **Signing secret** (`whsec_...`)

### 5. Configurer les variables d'environnement Supabase
1. Dans votre projet Supabase, allez dans **Settings** > **Edge Functions**
2. Ajoutez ces secrets :
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### 6. Mettre à jour les Price IDs
Dans `app/manager/settings/subscription/page.tsx`, remplacez :
```typescript
priceId: "price_pro_monthly"  // Remplacez par votre vrai Price ID
priceId: "price_enterprise_monthly"  // Remplacez par votre vrai Price ID
```

### 7. Déployer les Edge Functions
```bash
# Si vous avez Supabase CLI installé
supabase functions deploy create-checkout-session
supabase functions deploy create-portal-session
supabase functions deploy stripe-webhook
```

## Test en local
1. Utilisez les cartes de test Stripe :
   - Succès : `4242 4242 4242 4242`
   - Échec : `4000 0000 0000 0002`
2. Date d'expiration : N'importe quelle date future
3. CVC : N'importe quel 3 chiffres

## Passer en production
1. Activez votre compte Stripe (vérification d'identité requise)
2. Remplacez toutes les clés `test` par les clés `live`
3. Créez de nouveaux webhooks pour la production
4. Mettez à jour les variables d'environnement

## Support
- Documentation Stripe : https://stripe.com/docs
- Dashboard Stripe : https://dashboard.stripe.com
