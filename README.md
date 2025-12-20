# 🍽️ StockGuard - Gestion intelligente pour restaurants

![StockGuard](public/logo.png)

StockGuard est une solution SaaS complète de gestion de stocks et d'optimisation des marges pour les restaurants et établissements de restauration.

## ✨ Fonctionnalités principales

### 📦 Gestion des stocks
- Suivi en temps réel des inventaires
- Alertes automatiques de rupture de stock
- Gestion des catégories (Surgelés, Frais, Boissons, Sec)
- Interface employé mobile-friendly pour mise à jour rapide

### 🔄 Synchronisation temps réel
- Tous les changements sont synchronisés instantanément
- Employés et managers voient les mêmes données en direct
- Powered by Supabase Realtime

### 📊 Analytics & Prévisions
- Rapports détaillés avec graphiques
- Prévisions intelligentes basées sur l'historique
- Calculateur de marges avancé
- Suivi du gaspillage et optimisation

### 👥 Gestion d'équipe
- Checklist quotidienne configurable
- Système d'alertes et feedbacks
- Gestion des fournisseurs
- Support multi-utilisateurs

### 💳 Abonnements Stripe
- 3 plans tarifaires (Starter, Pro, Premium)
- Paiement sécurisé via Stripe
- Gestion des abonnements intégrée
- Webhooks pour synchronisation automatique

### 🎨 Interface moderne
- Design dark/light mode
- Animations fluides et effets glassmorphism
- Typographie SF Pro
- Responsive mobile & desktop

## 🚀 Technologies utilisées

- **Frontend**: Next.js 15 (App Router)
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Paiement**: Stripe (Checkout + Portal + Webhooks)
- **Styling**: Tailwind CSS + CSS Animations
- **Deployment**: Vercel (recommended)
- **Language**: TypeScript

## 📋 Prérequis

- Node.js 18+
- pnpm (ou npm/yarn)
- Compte Supabase
- Compte Stripe (optionnel pour les paiements)

## 🛠️ Installation

1. **Cloner le repository**
```bash
git clone [URL_DU_REPO]
cd SaasRestau
```

2. **Installer les dépendances**
```bash
pnpm install
```

3. **Configurer les variables d'environnement**

Créer un fichier `.env.local` :
```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_supabase

# Optionnel - Pour Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

4. **Configurer la base de données**

Se connecter à Supabase et exécuter les migrations SQL dans le dossier `supabase/migrations/`

5. **Lancer en développement**
```bash
pnpm dev
```

L'application sera accessible sur `http://localhost:3000`

## 📦 Structure du projet

```
SaasRestau/
├── app/
│   ├── (auth)/
│   │   └── login/           # Page de connexion
│   ├── employee/            # Interface employé
│   │   ├── stock-update/    # Mise à jour stocks
│   │   ├── waste/           # Gaspillage
│   │   ├── service-check/   # Checklist
│   │   └── alerts/          # Alertes
│   ├── manager/             # Interface manager
│   │   ├── stock/           # Gestion stocks
│   │   ├── orders/          # Commandes/Achats
│   │   ├── suppliers/       # Fournisseurs
│   │   ├── forecasts/       # Prévisions
│   │   ├── reports/         # Rapports
│   │   ├── calculator/      # Calculateur
│   │   ├── feedback/        # Feedbacks équipe
│   │   └── settings/        # Paramètres
│   │       ├── subscription/
│   │       └── checklist/
│   └── page.tsx             # Landing page
├── components/
│   ├── ui/                  # Composants UI réutilisables
│   ├── dashboard-modals.tsx # Modals dashboard
│   └── ...
├── lib/
│   ├── hooks/
│   │   ├── use-auth.ts      # Hook authentification
│   │   ├── use-realtime.ts  # Hooks temps réel
│   │   └── ...
│   └── supabase.ts          # Client Supabase
├── supabase/
│   ├── functions/           # Edge Functions
│   │   ├── create-checkout-session/
│   │   ├── create-portal-session/
│   │   └── stripe-webhook/
│   └── migrations/          # Migrations SQL
└── utils/                   # Utilitaires
```

## 💳 Configuration Stripe (optionnel)

Pour activer les paiements, suivre les instructions détaillées dans `STRIPE_SETUP.md`

Résumé :
1. Créer un compte Stripe
2. Récupérer les clés API
3. Créer les produits et prix
4. Configurer les webhooks
5. Déployer les Edge Functions

## 🗄️ Schéma de base de données

Principales tables :
- `profiles` - Utilisateurs (managers/employés)
- `establishments` - Établissements
- `products` - Produits en stock
- `orders` - Commandes fournisseurs
- `suppliers` - Fournisseurs
- `waste_records` - Suivi gaspillage
- `checklist_items` - Éléments de checklist
- `alerts` - Alertes système

Voir `supabase/migrations/` pour le schéma complet.

## 🎨 Personnalisation

### Thème
Les couleurs principales sont définies dans `app/globals.css` :
- Orange primaire : `#ff8c42`
- Arrière-plan sombre : `#0d0b09`
- Cartes : `#1c1714`

### Animations
Toutes les animations CSS sont dans `app/globals.css` avec le préfixe :
- `sg-*` pour les composants dashboard
- `landing-*` pour la landing page

## 📱 Fonctionnalités par rôle

### Manager
✅ Vue complète du dashboard  
✅ Gestion des stocks, commandes, fournisseurs  
✅ Prévisions et calculateur de marges  
✅ Rapports détaillés  
✅ Configuration de la checklist  
✅ Gestion de l'abonnement  

### Employé
✅ Mise à jour rapide des stocks  
✅ Déclaration du gaspillage  
✅ Checklist de service  
✅ Consultation des alertes  

## 🚀 Déploiement

### Vercel (recommandé)
```bash
vercel deploy
```

### Variables d'environnement à configurer sur Vercel
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Edge Functions Supabase
```bash
supabase functions deploy create-checkout-session
supabase functions deploy create-portal-session
supabase functions deploy stripe-webhook
```

## 🔒 Sécurité

- RLS (Row Level Security) activé sur toutes les tables Supabase
- Authentification JWT via Supabase Auth
- Validation côté serveur pour toutes les actions critiques
- Webhooks Stripe sécurisés avec signature

## 📝 Licence

Ce projet est sous licence MIT.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📧 Support

Pour toute question, contactez [votre-email]

---

Fait avec ❤️ pour les restaurateurs qui veulent optimiser leur rentabilité.
