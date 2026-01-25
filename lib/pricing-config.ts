// Configuration centralisée des prix d'abonnement
// SOURCE UNIQUE DE VÉRITÉ pour tous les prix
// PLANS DISPONIBLES : FREE (gratuit) et PREMIUM (payant)

export type BillingPeriod = 'monthly' | 'annual'

interface PricingData {
  price: number
  originalPrice?: number
  discount: string
  period: string
  priceId: string
  savings?: string
}

interface PlanConfig {
  id: string
  name: string
  description: string
  tagline: string
  popular?: boolean
  target: string
  features: string[]
  aiFeatures: string[]
  limits: {
    establishments: number | 'unlimited'
    users: number | 'unlimited'
  }
  excludedFeatures?: string[]
  monthly: PricingData
  annual: PricingData
  bullets: string[]
  cta: string
}

// Prix officiels - Un seul plan payant : PREMIUM
export const PRICING_PLANS: Record<string, PlanConfig> = {
  premium: {
    id: "premium",
    name: "Premium",
    description: "Accès complet à toutes les fonctionnalités",
    tagline: "Tout StockGuard, sans limite",
    popular: true,
    target: "Restaurants, brasseries, dark kitchens, chaînes",
    monthly: {
      price: 99,
      discount: "",
      period: "/mois",
      priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY_PRICE_ID || "price_premium_monthly",
    },
    annual: {
      price: 990,
      originalPrice: 1188,
      discount: "2 mois offerts",
      savings: "198€",
      period: "/an",
      priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_ANNUAL_PRICE_ID || "price_premium_annual",
    },
    features: [
      "Gestion de stock complète",
      "Menu & recettes avec calcul automatique du coût matière",
      "Rapports détaillés : bénéfices, pertes, gaspillage",
      "Alertes automatiques : stock bas, produits expirant",
      "Prévisions intelligentes basées sur l'historique",
      "Gestion de l'équipe : rôles manager/employé",
      "Commandes fournisseurs",
      "Multi-établissements",
      "Support prioritaire",
    ],
    aiFeatures: [
      "IA intégrée",
      "Assistant dans Stock, Menu et Calculateur",
      "Recommandations d'achats automatiques",
      "Détection d'anomalies de marges",
    ],
    limits: {
      establishments: 'unlimited',
      users: 'unlimited',
    },
    bullets: [
      "Fini les Excel qui plantent en plein service",
      "Tu sais enfin ce que tu as en stock, en temps réel",
      "Pilotage multi-sites possible",
    ],
    cta: "Commencer maintenant",
  },
} as const

export type PlanId = keyof typeof PRICING_PLANS | 'free'

// Helper functions
export const getPlanPrice = (planId: string, period: BillingPeriod): number => {
  if (planId === 'free') return 0
  const plan = PRICING_PLANS[planId]
  return plan ? plan[period].price : 0
}

export const getPlanSavings = (planId: string): string => {
  if (planId === 'free') return ''
  const plan = PRICING_PLANS[planId]
  return plan?.annual.savings || ''
}

export const formatPrice = (price: number): string => {
  return price.toLocaleString('fr-FR')
}

export const getAnnualDiscount = (): string => {
  return "2 mois offerts"
}

// Configuration de l'essai gratuit
export const TRIAL_CONFIG = {
  durationDays: 14,
  features: [
    "Toutes les fonctionnalités Premium",
    "Sans carte bancaire",
    "Annulation à tout moment",
  ],
}
