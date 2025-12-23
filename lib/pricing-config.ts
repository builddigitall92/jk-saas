// Configuration centralisée des prix d'abonnement
export type BillingPeriod = 'monthly' | 'annual'

interface PricingData {
  price: number
  originalPrice: number
  discount: string
  period: string
  priceId: string
}

interface PlanConfig {
  id: string
  name: string
  description: string
  popular?: boolean
  features: string[]
  excludedFeatures?: string[]
  monthly: PricingData
  annual: PricingData
}

export const PRICING_PLANS: Record<string, PlanConfig> = {
  starter: {
    id: "starter",
    name: "Starter",
    description: "Pour démarrer et tester",
    monthly: {
      price: 20,
      originalPrice: 30,
      discount: "-33%",
      period: "/mois",
      priceId: "price_starter_monthly",
    },
    annual: {
      price: 200,
      originalPrice: 240,
      discount: "-17%",
      period: "/an",
      priceId: "price_starter_annual",
    },
    features: [
      "1 établissement",
      "5 utilisateurs max",
      "Gestion stocks & gaspillage",
      "Alertes automatiques",
      "Checklist employés",
      "Rapports basiques",
    ],
    excludedFeatures: [
      "Prévisions & calculateur",
      "Multi-sites",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    description: "Tout ce qu'il faut pour piloter vos marges",
    popular: true,
    monthly: {
      price: 80,
      originalPrice: 100,
      discount: "-20%",
      period: "/mois",
      priceId: "price_pro_monthly",
    },
    annual: {
      price: 800,
      originalPrice: 960,
      discount: "-17%",
      period: "/an",
      priceId: "price_pro_annual",
    },
    features: [
      "Jusqu'à 3 établissements",
      "Utilisateurs illimités",
      "Toutes fonctionnalités Starter",
      "Prévisions intelligentes",
      "Calculateur de marges",
      "Gestion fournisseurs",
      "Rapports détaillés",
      "Support email prioritaire",
    ],
  },
  premium: {
    id: "premium",
    name: "Premium",
    description: "Pour chaînes et groupes multi-sites",
    monthly: {
      price: 110,
      originalPrice: 150,
      discount: "-27%",
      period: "/mois",
      priceId: "price_premium_monthly",
    },
    annual: {
      price: 1100,
      originalPrice: 1320,
      discount: "-17%",
      period: "/an",
      priceId: "price_premium_annual",
    },
    features: [
      "Établissements illimités",
      "Utilisateurs illimités",
      "Toutes les fonctionnalités Pro",
      "Vue consolidée multi-sites",
      "Intégrations API avancées",
      "Support prioritaire 24/7",
      "Account manager dédié",
      "Formation sur-mesure",
    ],
  },
} as const

export type PlanId = keyof typeof PRICING_PLANS
