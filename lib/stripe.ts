import Stripe from 'stripe'

// Vérification des variables d'environnement
const stripeSecretKey = process.env.STRIPE_SECRET_KEY

// Créer l'instance Stripe seulement si la clé est définie
export const stripe = stripeSecretKey 
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    })
  : null

// Helper pour vérifier si Stripe est configuré
export const isStripeConfigured = () => !!stripeSecretKey

// Type de facturation
export type BillingType = 'monthly' | 'annual' | 'lifetime'

// Helper pour obtenir le Price ID selon le type de facturation
function getPriceId(planKey: string, billingType: BillingType): string | null {
  const envKey = `STRIPE_${planKey}_PRICE_ID_${billingType.toUpperCase()}`
  return process.env[envKey] || null
}

// Plans d'abonnement
export const PLANS = {
  FREE: {
    id: 'free',
    name: 'Gratuit',
    description: 'Pour découvrir StockGuard',
    price: 0,
    priceIdMonthly: null,
    priceIdLifetime: null,
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
    priceIdMonthly: getPriceId('STARTER', 'monthly') || 'price_1SkrloCF3gPATsYiVAYHP0Tp',
    priceIdAnnual: getPriceId('STARTER', 'annual') || 'price_1SlD5Q2EccmTZDWQW0TLg6el',
    priceIdLifetime: getPriceId('STARTER', 'lifetime') || 'price_1SkrphCF3gPATsYiv6fjVt7P',
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
    priceIdMonthly: getPriceId('PRO', 'monthly') || 'price_1SkrnmCF3gPATsYizbk82ioU',
    priceIdAnnual: getPriceId('PRO', 'annual') || 'price_1SlD5d2EccmTZDWQX6L7wZwz',
    priceIdLifetime: getPriceId('PRO', 'lifetime') || 'price_1SkrpLCF3gPATsYi4dTrUVB8',
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
    priceIdMonthly: getPriceId('PREMIUM', 'monthly') || 'price_1Skro7CF3gPATsYiYfarUPwH',
    priceIdAnnual: getPriceId('PREMIUM', 'annual') || 'price_1SlD5r2EccmTZDWQj8XNefir',
    priceIdLifetime: getPriceId('PREMIUM', 'lifetime') || 'price_1SkrovCF3gPATsYivmiVD5er',
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
    if (plan.priceIdMonthly === priceId || plan.priceIdAnnual === priceId || plan.priceIdLifetime === priceId) {
      return planId as PlanId
    }
  }
  return 'FREE'
}

// Récupérer le Price ID selon le plan et le type de facturation
export function getPriceIdForPlan(planId: PlanId, billingType: BillingType): string | null {
  const plan = PLANS[planId]
  if (!plan) return null
  
  if (billingType === 'monthly') {
    return plan.priceIdMonthly
  } else if (billingType === 'annual') {
    return plan.priceIdAnnual
  } else {
    return plan.priceIdLifetime
  }
}

// Vérifier si un plan a accès à une fonctionnalité
export function hasFeatureAccess(currentPlan: PlanId, requiredPlan: PlanId): boolean {
  const planOrder: PlanId[] = ['FREE', 'STARTER', 'PRO', 'PREMIUM']
  return planOrder.indexOf(currentPlan) >= planOrder.indexOf(requiredPlan)
}
