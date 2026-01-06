# 🚀 Guide d'Intégration Stripe - StockGuard

## ✅ État actuel de l'intégration

L'intégration Stripe est **déjà largement implémentée** dans votre projet. Voici ce qui est en place :

### 📦 Composants installés
- ✅ `stripe` (v20.1.0) - SDK Stripe côté serveur
- ✅ `@stripe/stripe-js` (v8.6.0) - SDK Stripe côté client

### 🔧 Fichiers de configuration
- ✅ `lib/stripe.ts` - Configuration Stripe serveur avec plans (FREE, STARTER, PRO, PREMIUM)
- ✅ `lib/stripe-client.ts` - Client Stripe côté client
- ✅ `lib/pricing-config.ts` - Configuration des prix et plans pour l'UI

### 🛣️ Routes API
- ✅ `/api/stripe/checkout` - Création de sessions de paiement
- ✅ `/api/stripe/portal` - Accès au portail client Stripe
- ✅ `/api/stripe/webhook` - Gestion des événements Stripe

### 📄 Pages
- ✅ `/pricing` - Page de tarification avec intégration Stripe
- ✅ `/manager/settings/subscription` - Gestion des abonnements

### 🎣 Hooks React
- ✅ `lib/hooks/use-subscription.ts` - Hook pour gérer les abonnements

### 🗄️ Base de données
- ✅ Migration SQL créée : `supabase/migrations/20250128_add_stripe_fields.sql`

---

## 🔨 Étapes pour finaliser l'intégration

### 1. Appliquer la migration SQL

Exécutez la migration dans Supabase :

```sql
-- Via Supabase Dashboard > SQL Editor
-- Ou via Supabase CLI : supabase db push
```

Le fichier se trouve dans : `supabase/migrations/20250128_add_stripe_fields.sql`

### 2. Configurer Stripe Dashboard

#### A. Créer les produits et prix dans Stripe

1. Connectez-vous à [Stripe Dashboard](https://dashboard.stripe.com)
2. Allez dans **Products** > **Add product**

**Pour chaque plan (Starter, Pro, Premium) :**

**Plan Starter :**
- Nom : `Starter`
- Description : `Pour les petits établissements`
- Prix mensuel : `60€/mois` → Copiez le Price ID (`price_...`)
- Prix annuel : `580€/an` → Copiez le Price ID (`price_...`)

**Plan Pro :**
- Nom : `Pro`
- Description : `Pour les établissements en croissance`
- Prix mensuel : `120€/mois` → Copiez le Price ID (`price_...`)
- Prix annuel : `1199€/an` → Copiez le Price ID (`price_...`)

**Plan Premium :**
- Nom : `Premium`
- Description : `Pour groupes et multi-sites`
- Prix mensuel : `199€/mois` → Copiez le Price ID (`price_...`)
- Prix annuel : `1393€/an` → Copiez le Price ID (`price_...`)

#### B. Configurer les webhooks

1. Allez dans **Developers** > **Webhooks**
2. Cliquez sur **Add endpoint**
3. URL de production : `https://votre-domaine.com/api/stripe/webhook`
4. URL de développement : Utilisez Stripe CLI (voir ci-dessous)
5. Sélectionnez ces événements :
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
6. Copiez le **Signing secret** (`whsec_...`)

### 3. Configurer les variables d'environnement

Créez ou mettez à jour votre fichier `.env.local` :

```env
# =============================================
# STRIPE - Clés API
# =============================================
# Remplacez les valeurs ci-dessous par vos vraies clés depuis le dashboard Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# =============================================
# STRIPE - Price IDs Mensuel
# =============================================
STRIPE_STARTER_PRICE_ID_MONTHLY=price_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PRO_PRICE_ID_MONTHLY=price_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PREMIUM_PRICE_ID_MONTHLY=price_xxxxxxxxxxxxxxxxxxxxx

# =============================================
# STRIPE - Price IDs Annuel
# =============================================
STRIPE_STARTER_PRICE_ID_ANNUAL=price_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PRO_PRICE_ID_ANNUAL=price_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PREMIUM_PRICE_ID_ANNUAL=price_xxxxxxxxxxxxxxxxxxxxx

# =============================================
# APPLICATION
# =============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**⚠️ Important :** Les Price IDs sont optionnels. Si non définis, le code utilisera les valeurs par défaut dans `lib/stripe.ts`.

### 4. Tester l'intégration en local

#### A. Installer Stripe CLI

```bash
# Windows (avec Chocolatey)
choco install stripe

# macOS (avec Homebrew)
brew install stripe/stripe-cli/stripe

# Linux
# Voir : https://stripe.com/docs/stripe-cli
```

#### B. Se connecter à Stripe

```bash
stripe login
```

#### C. Écouter les webhooks localement

Dans un terminal séparé :

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Cette commande vous donnera un **webhook signing secret** (`whsec_...`) à utiliser dans `.env.local` pour le développement.

#### D. Tester avec des cartes de test

Utilisez ces cartes de test Stripe :

| Scénario | Numéro de carte | Date d'expiration | CVC |
|----------|----------------|------------------|-----|
| ✅ Paiement réussi | `4242 4242 4242 4242` | N'importe quelle date future | N'importe quel 3 chiffres |
| ❌ Paiement refusé | `4000 0000 0000 0002` | N'importe quelle date future | N'importe quel 3 chiffres |
| 🔐 Authentification requise | `4000 0025 0000 3155` | N'importe quelle date future | N'importe quel 3 chiffres |

### 5. Tester le flux complet

1. **Démarrer l'application :**
   ```bash
   pnpm dev
   ```

2. **Tester le checkout :**
   - Allez sur `/pricing`
   - Cliquez sur "Essai gratuit 14 jours"
   - Connectez-vous si nécessaire
   - Utilisez une carte de test
   - Vérifiez que vous êtes redirigé vers la page de succès

3. **Vérifier les webhooks :**
   - Dans le terminal Stripe CLI, vous devriez voir les événements
   - Vérifiez dans Supabase que l'établissement a été mis à jour avec :
     - `stripe_customer_id`
     - `stripe_subscription_id`
     - `subscription_plan`
     - `subscription_status`

---

## 🔄 Flux de paiement

### 1. Utilisateur clique sur "S'abonner"
```
/pricing → handleSubscribe() → /api/stripe/checkout
```

### 2. Création de la session Stripe
```
API vérifie l'authentification
→ Récupère ou crée le customer Stripe
→ Crée une session de checkout
→ Retourne l'URL de checkout
```

### 3. Redirection vers Stripe
```
Utilisateur → Stripe Checkout → Paiement
```

### 4. Webhook Stripe
```
Stripe → /api/stripe/webhook → Mise à jour de la base de données
```

### 5. Redirection après paiement
```
Stripe → /manager/settings?success=true
```

---

## 📊 Structure des données

### Table `establishments` (après migration)

| Colonne | Type | Description |
|---------|------|-------------|
| `stripe_customer_id` | VARCHAR(255) | ID du client Stripe |
| `stripe_subscription_id` | VARCHAR(255) | ID de l'abonnement actif |
| `subscription_plan` | VARCHAR(50) | Plan actuel : `free`, `starter`, `pro`, `premium` |
| `subscription_status` | VARCHAR(50) | Statut : `active`, `trialing`, `past_due`, `canceled` |
| `subscription_period_end` | TIMESTAMPTZ | Date de fin de période |
| `trial_ends_at` | TIMESTAMPTZ | Date de fin de l'essai |

---

## 🎯 Utilisation dans le code

### Hook `useSubscription`

```typescript
import { useSubscription } from '@/lib/hooks/use-subscription'

function MyComponent() {
  const { 
    subscription,      // Données de l'abonnement
    loading,           // État de chargement
    isPaid,            // true si plan payant actif
    isTrialing,        // true si en période d'essai
    currentPlan,        // Plan actuel
    canAccessFeature,  // Vérifier l'accès à une fonctionnalité
    openBillingPortal  // Ouvrir le portail client
  } = useSubscription()

  if (loading) return <div>Chargement...</div>
  
  if (!canAccessFeature('PRO')) {
    return <div>Fonctionnalité réservée au plan Pro</div>
  }

  return <div>Contenu Pro</div>
}
```

### Créer un checkout

```typescript
const handleSubscribe = async (planId: string) => {
  const response = await fetch('/api/stripe/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      planId: planId.toUpperCase(), // STARTER, PRO, PREMIUM
      billingType: 'monthly' // ou 'annual'
    }),
  })

  const data = await response.json()
  
  if (data.url) {
    window.location.href = data.url
  }
}
```

---

## 🐛 Dépannage

### Problème : "Stripe non configuré"
**Solution :** Vérifiez que `STRIPE_SECRET_KEY` est défini dans `.env.local`

### Problème : "Non authentifié"
**Solution :** L'utilisateur doit être connecté pour créer un checkout

### Problème : Webhooks non reçus
**Solution :** 
1. Vérifiez que Stripe CLI est en cours d'exécution
2. Vérifiez que `STRIPE_WEBHOOK_SECRET` correspond au secret donné par Stripe CLI
3. Vérifiez les logs dans le terminal Stripe CLI

### Problème : Customer ID invalide
**Solution :** Le code gère automatiquement les customer IDs invalides en créant un nouveau customer

---

## 🚀 Passer en production

1. **Activer votre compte Stripe** (vérification d'identité requise)
2. **Remplacer les clés de test par les clés live :**
   - `pk_test_...` → `pk_live_...`
   - `sk_test_...` → `sk_live_...`
3. **Créer de nouveaux webhooks pour la production :**
   - URL : `https://votre-domaine.com/api/stripe/webhook`
   - Copier le nouveau `whsec_...`
4. **Mettre à jour les variables d'environnement** sur votre plateforme de déploiement (Vercel, etc.)
5. **Tester avec une vraie carte** (en mode test Stripe)

---

## 📚 Ressources

- [Documentation Stripe](https://stripe.com/docs)
- [Stripe Dashboard](https://dashboard.stripe.com)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Cartes de test Stripe](https://stripe.com/docs/testing)

---

## ✅ Checklist finale

- [ ] Migration SQL appliquée
- [ ] Produits créés dans Stripe Dashboard
- [ ] Price IDs copiés dans `.env.local`
- [ ] Webhooks configurés
- [ ] Variables d'environnement configurées
- [ ] Test avec carte de test réussi
- [ ] Webhooks reçus et traités
- [ ] Base de données mise à jour après paiement
- [ ] Portail client accessible
- [ ] Prêt pour la production

---

**🎉 Félicitations ! Votre intégration Stripe est maintenant complète !**

