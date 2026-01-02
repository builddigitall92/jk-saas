// Configuration centralisée des prix d'abonnement
// SOURCE UNIQUE DE VÉRITÉ pour tous les prix
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

// Prix officiels par établissement
export const PRICING_PLANS: Record<string, PlanConfig> = {
  starter: {
    id: "starter",
    name: "Starter",
    description: "Pour démarrer et maîtriser les bases",
    tagline: "Premiers pas vers la maîtrise du stock",
    target: "Petits restos, snacks, food trucks",
    monthly: {
      price: 60,
      discount: "",
      period: "/mois",
      priceId: "price_starter_monthly",
    },
    annual: {
      price: 580,
      originalPrice: 720,
      discount: "~2 mois offerts",
      savings: "140€",
      period: "/an",
      priceId: "price_starter_annual",
    },
    features: [
      "Gestion Stock complète : articles par catégories (surgelé, frais, sec), suivi des quantités",
      "Menu & recettes : création de plats avec calcul automatique du coût matière",
      "Rapports essentiels : valeur de stock, top produits, alertes d'expiration",
      "Alertes automatiques : stock bas, produits expirant bientôt",
      "Suivi du gaspillage : enregistrement des pertes avec coûts",
    ],
    aiFeatures: [
      "IA intégrée (version Light)",
      "Assistant texte dans Stock, Menu et Calculateur",
      "50 requêtes/mois",
      "Création de produits, recettes et estimations de marge",
    ],
    limits: {
      establishments: 1,
      users: 3,
    },
    excludedFeatures: [
      "Prévisions intelligentes",
      "Calculateur de marges avancé",
      "Multi-établissements",
    ],
    bullets: [
      "Fini les Excel qui plantent en plein service",
      "Tu sais enfin ce que tu as en stock, en temps réel",
      "Les alertes te préviennent avant les problèmes",
    ],
    cta: "Commencer avec Starter",
  },
  pro: {
    id: "pro",
    name: "Pro",
    description: "Tout ce qu'il faut pour piloter vos marges",
    tagline: "Le choix des équipes sérieuses",
    target: "Restaurants établis, brasseries",
    popular: true,
    monthly: {
      price: 120,
      discount: "",
      period: "/mois",
      priceId: "price_pro_monthly",
    },
    annual: {
      price: 1199,
      originalPrice: 1440,
      discount: "~2 mois offerts",
      savings: "241€",
      period: "/an",
      priceId: "price_pro_annual",
    },
    features: [
      "Tout Starter inclus",
      "Stock avancé : historique complet des mouvements (ajouts, retraits, corrections)",
      "Recettes complètes : coûts matière multi-ingrédients avec calcul automatique",
      "Prévisions intelligentes : prévision des besoins basée sur l'historique",
      "Rapports détaillés : bénéfices, pertes, gaspillage, évolution dans le temps",
      "Top produits : identification des plus rentables et des problèmes (surstock, rotation)",
      "Gestion de l'équipe : rôles manager/employé, feedbacks, historique des actions",
      "Commandes fournisseurs : création et suivi des commandes",
      "Support email prioritaire",
    ],
    aiFeatures: [
      "IA avancée avec quota élargi",
      "Assistant dans Stock et Menu",
      "300 requêtes/mois",
      "Flux guidé : produit → recette → prix de vente",
      "Recommandations d'optimisation",
    ],
    limits: {
      establishments: 1,
      users: 7,
    },
    bullets: [
      "Les prévisions t'aident à commander au bon moment",
      "Réduis les pertes sans embaucher quelqu'un de plus",
      "Tu passes de pompier à pilote de ton stock",
    ],
    cta: "Commencer avec Pro",
  },
  premium: {
    id: "premium",
    name: "Premium",
    description: "Pour groupes et multi-sites",
    tagline: "Pour les opérations à grande échelle",
    target: "Groupes, dark kitchens, chaînes",
    monthly: {
      price: 200,
      discount: "",
      period: "/mois",
      priceId: "price_premium_monthly",
    },
    annual: {
      price: 1799,
      originalPrice: 2400,
      discount: ">3 mois offerts",
      savings: "601€",
      period: "/an",
      priceId: "price_premium_annual",
    },
    features: [
      "Tout Pro inclus",
      "Multi-établissements : gestion centralisée de plusieurs sites",
      "Recettes partagées avec prix localisés par site",
      "Automatisations : alertes marge sous seuil, surstock, ruptures",
      "Suggestions de commandes fournisseurs",
      "Support prioritaire 24/7",
      "Onboarding personnalisé",
      "Account manager dédié",
    ],
    aiFeatures: [
      "IA étendue avec usage quasi-illimité",
      "Assistant dans Stock, Menu, Calculateur de marges",
      "800 requêtes/mois",
      "Recommandations d'achats automatiques",
      "Détection d'anomalies de marges",
      "Menu engineering avancé",
    ],
    limits: {
      establishments: 'unlimited',
      users: 'unlimited',
    },
    bullets: [
      "Standards d'enseigne, pas de restaurant isolé",
      "Pilotage multi-sites en temps réel",
      "Un interlocuteur dédié qui connaît ton business",
    ],
    cta: "Commencer avec Premium",
  },
} as const

export type PlanId = keyof typeof PRICING_PLANS

// Helper functions
export const getPlanPrice = (planId: PlanId, period: BillingPeriod): number => {
  return PRICING_PLANS[planId][period].price
}

export const getPlanSavings = (planId: PlanId): string => {
  return PRICING_PLANS[planId].annual.savings || ''
}

export const formatPrice = (price: number): string => {
  return price.toLocaleString('fr-FR')
}

export const getAnnualDiscount = (): string => {
  return "jusqu'à 3 mois offerts"
}
