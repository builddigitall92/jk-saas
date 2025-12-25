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
      price: 649,
      originalPrice: 720,
      discount: "~1 mois offert",
      savings: "71€",
      period: "/an",
      priceId: "price_starter_annual",
    },
    features: [
      "Gestion Stock de base : articles, catégories, mouvements simples, valeur de stock",
      "Menu & recettes : création manuelle avec calcul automatique du coût matière",
      "Rapports essentiels : valeur de stock, top 5 produits, alertes basiques",
      "Alertes automatiques de stock bas",
    ],
    aiFeatures: [
      "IA intégrée (version Light)",
      "Assistant texte dans Stock, Menu et Calculateur",
      "Limité en volume (requêtes/mois)",
      "Création de produits, recettes et estimations de marge",
    ],
    limits: {
      establishments: 1,
      users: 3,
    },
    excludedFeatures: [
      "Upload factures fournisseurs",
      "Prévisions intelligentes",
      "Multi-établissements",
    ],
    bullets: [
      "Arrête les Excel qui cassent en plein service",
      "Tu sais enfin ce que tu as en stock",
      "Premiers pas vers une vraie maîtrise du stock",
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
      "Stock avancé : historique complet des mouvements (ventes, pertes, corrections)",
      "Upload / lecture des factures fournisseurs pour mise à jour auto des coûts",
      "Recettes complètes, coûts matière multi-ingrédients",
      "Calculateur de marges avancé : marges par plat/catégorie, simulation de prix",
      "Prévisions : prévision de besoins, export CSV",
      "Rapports détaillés : bénéfices, pertes, gaspillage",
      "Top 5 produits rentables & problématiques (surstock, rotation lente)",
      "Gestion de l'équipe & feedbacks : rôles, journalisation, remontées",
      "Support email prioritaire",
    ],
    aiFeatures: [
      "IA avancée avec quota élargi",
      "Assistant dans Stock, Menu et Calculateur de marges",
      "Flux guidé : produit → recette → prix de vente → marge",
      "Recommandations d'ajustement de prix",
    ],
    limits: {
      establishments: 1,
      users: 10,
    },
    bullets: [
      "Automatise les commandes avant la rupture",
      "Réduis les pertes sans embaucher quelqu'un de plus",
      "Tu passes de pompier à pilote",
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
      "Intégrations externes (POS, compta…)",
      "Support prioritaire 24/7",
      "Onboarding personnalisé",
      "Account manager dédié",
    ],
    aiFeatures: [
      "IA étendue avec usage quasi-illimité",
      "Assistant dans Stock, Menu, Calculateur de marges",
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
