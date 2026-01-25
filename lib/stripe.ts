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
export type BillingType = 'monthly' | 'annual'

// Plans simplifiés : FREE et PREMIUM uniquement
export const PLANS = {
  FREE: {
    id: 'free',
    name: 'Gratuit',
    description: 'Essai gratuit de 14 jours',
    price: 0,
    priceIdMonthly: null,
    priceIdAnnual: null,
    features: [
      'Toutes les fonctionnalités Premium',
      'Essai de 14 jours',
      'Sans carte bancaire',
    ],
    limits: {
      establishments: -1,
      employees: -1,
      products: -1,
    }
  },
  PREMIUM: {
    id: 'premium',
    name: 'Premium',
    description: 'Accès complet à StockGuard',
    price: 99,
    priceIdMonthly: process.env.STRIPE_PREMIUM_PRICE_ID_MONTHLY || 'price_premium_monthly',
    priceIdAnnual: process.env.STRIPE_PREMIUM_PRICE_ID_ANNUAL || 'price_premium_annual',
    features: [
      'Gestion de stock complète',
      'Menu & recettes',
      'Rapports détaillés',
      'Alertes automatiques',
      'Prévisions intelligentes',
      'Multi-établissements',
      'Support prioritaire',
      'IA intégrée',
    ],
    limits: {
      establishments: -1,
      employees: -1,
      products: -1,
    }
  }
} as const

export type PlanId = keyof typeof PLANS

// Récupérer le plan à partir du price ID Stripe
// Tous les plans payants sont mappés vers PREMIUM
export function getPlanFromPriceId(priceId: string): PlanId {
  // Si c'est le price ID premium, retourner PREMIUM
  if (priceId === PLANS.PREMIUM.priceIdMonthly || priceId === PLANS.PREMIUM.priceIdAnnual) {
    return 'PREMIUM'
  }
  
  // Pour tous les autres price IDs (anciens plans starter, pro, etc.), retourner PREMIUM
  // Cela permet de gérer les abonnements existants
  if (priceId && priceId !== '') {
    return 'PREMIUM'
  }
  
  return 'FREE'
}

// Récupérer le Price ID selon le plan et le type de facturation
export function getPriceIdForPlan(planId: PlanId, billingType: BillingType): string | null {
  const plan = PLANS[planId]
  if (!plan) return null
  
  if (billingType === 'monthly') {
    return plan.priceIdMonthly
  } else {
    return plan.priceIdAnnual
  }
}

// Vérifier si un plan a accès à une fonctionnalité
export function hasFeatureAccess(currentPlan: PlanId, requiredPlan: PlanId): boolean {
  // Avec seulement FREE et PREMIUM :
  // - PREMIUM a accès à tout
  // - FREE a accès uniquement aux features FREE
  if (currentPlan === 'PREMIUM') return true
  return requiredPlan === 'FREE'
}
