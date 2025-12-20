import Stripe from 'stripe'

// Vérification des variables d'environnement
const stripeSecretKey = process.env.STRIPE_SECRET_KEY

// Créer l'instance Stripe seulement si la clé est définie
export const stripe = stripeSecretKey 
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2025-05-28.basil',
      typescript: true,
    })
  : null

// Helper pour vérifier si Stripe est configuré
export const isStripeConfigured = () => !!stripeSecretKey

// Plans d'abonnement
export const PLANS = {
  FREE: {
    id: 'free',
    name: 'Gratuit',
    description: 'Pour découvrir StockGuard',
    price: 0,
    priceId: null,
    features: [
      '1 établissement',
      '2 employés max',
      'Gestion de stock basique',
      'Alertes par email',
    ],
    limits: {
      establishments: 1,
      employees: 2,
      products: 50,
    }
  },
  STARTER: {
    id: 'starter',
    name: 'Starter',
    description: 'Pour les petits établissements',
    price: 20,
    priceId: process.env.STRIPE_STARTER_PRICE_ID || 'price_1SgN5HCF3gPATsYiLda8sBcz',
    features: [
      '1 établissement',
      '5 employés',
      'Gestion de stock complète',
      'Alertes temps réel',
      'Rapports mensuels',
      'Support email',
    ],
    limits: {
      establishments: 1,
      employees: 5,
      products: 200,
    }
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    description: 'Pour les établissements en croissance',
    price: 80,
    priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_1SgN5WCF3gPATsYiRnTOv9fz',
    features: [
      '3 établissements',
      '15 employés',
      'Toutes les fonctionnalités',
      'Prévisions IA',
      'Rapports avancés',
      'Support prioritaire',
      'Export données',
    ],
    limits: {
      establishments: 3,
      employees: 15,
      products: 1000,
    }
  },
  PREMIUM: {
    id: 'premium',
    name: 'Premium',
    description: 'Pour les chaînes de restaurants',
    price: 110,
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID || 'price_1SgN7VCF3gPATsYi1yMMN3Op',
    features: [
      'Établissements illimités',
      'Employés illimités',
      'Toutes les fonctionnalités',
      'API personnalisée',
      'Intégrations sur mesure',
      'Account manager dédié',
      'SLA garanti',
    ],
    limits: {
      establishments: -1, // illimité
      employees: -1,
      products: -1,
    }
  }
} as const

export type PlanId = keyof typeof PLANS

// Récupérer le plan à partir du price ID Stripe
export function getPlanFromPriceId(priceId: string): PlanId {
  for (const [planId, plan] of Object.entries(PLANS)) {
    if (plan.priceId === priceId) {
      return planId as PlanId
    }
  }
  return 'FREE'
}

// Vérifier si un plan a accès à une fonctionnalité
export function hasFeatureAccess(currentPlan: PlanId, requiredPlan: PlanId): boolean {
  const planOrder: PlanId[] = ['FREE', 'STARTER', 'PRO', 'PREMIUM']
  return planOrder.indexOf(currentPlan) >= planOrder.indexOf(requiredPlan)
}
