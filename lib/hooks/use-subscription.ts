"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

// ============================================
// MODE OWNER - Accès Premium automatique pour le propriétaire du SaaS
// ============================================
// Mettre à true pour avoir accès Premium automatique (développement/owner)
const FORCE_PREMIUM_ACCESS = true

// Emails avec accès Premium automatique (backup)
const OWNER_EMAILS = [
  'admin@stockguard.fr',
  'owner@stockguard.fr',
]

// Statuts d'abonnement autorisés
const ALLOWED_STATUSES = ['active', 'trialing']

// Vérifier si c'est un owner (accès Premium gratuit)
const isOwnerEmail = (email: string | undefined): boolean => {
  if (!email) return false
  return OWNER_EMAILS.some(ownerEmail => 
    email.toLowerCase() === ownerEmail.toLowerCase()
  )
}

// Plans définis localement pour éviter l'import côté serveur
const PLANS = {
  FREE: {
    id: 'free',
    name: 'Gratuit',
    description: 'Pour découvrir StockGuard',
    price: 0,
    features: [
      '1 établissement',
      '2 employés max',
      'Gestion de stock basique',
      'Alertes par email',
    ],
  },
  STARTER: {
    id: 'starter',
    name: 'Starter',
    description: 'Pour les petits établissements',
    price: 60,
    features: [
      '1 établissement',
      '3 employés',
      'Gestion de stock complète',
      'Alertes temps réel',
      'Rapports mensuels',
      'Support email',
    ],
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    description: 'Pour les établissements en croissance',
    price: 120,
    features: [
      '1 établissement',
      '7 employés',
      'Toutes les fonctionnalités',
      'Prévisions IA',
      'Rapports avancés',
      'Support prioritaire',
      'Export données',
    ],
  },
  PREMIUM: {
    id: 'premium',
    name: 'Premium',
    description: 'Pour les chaînes de restaurants',
    price: 199,
    features: [
      'Tout Pro inclus',
      'Multi-établissements : gestion centralisée de plusieurs sites',
      'Recettes partagées avec prix localisés par site',
      'Automatisations : alertes marge sous seuil, surstock, ruptures',
      'Suggestions de commandes fournisseurs',
      'Support prioritaire 24/7',
      'Onboarding personnalisé',
      'Account manager dédié',
    ],
  }
} as const

type PlanId = keyof typeof PLANS
type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'unpaid' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'none'

interface Subscription {
  plan: PlanId
  status: SubscriptionStatus
  periodEnd: Date | null
  trialEndsAt: Date | null
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  hasUsedTrial: boolean
}

interface SubscriptionState {
  subscription: Subscription | null
  loading: boolean
  error: string | null
  // États calculés
  isOwner: boolean
  isTrialing: boolean
  isPaid: boolean
  isPastDue: boolean
  isCanceled: boolean
  isBlocked: boolean
  hasValidAccess: boolean
  trialDaysRemaining: number | null
  // Plan actuel
  currentPlan: typeof PLANS[PlanId]
  // Actions
  canAccessFeature: (requiredPlan: PlanId) => boolean
  openBillingPortal: () => Promise<void>
  redirectToCheckout: (planId?: string) => void
}

export function useSubscription(): SubscriptionState {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setLoading(false)
          return
        }

        // ============================================
        // OWNER CHECK - Premium automatique pour le propriétaire
        // ============================================
        const ownerStatus = FORCE_PREMIUM_ACCESS || isOwnerEmail(user.email)
        setIsOwner(ownerStatus)
        
        // Note: On ne donne plus automatiquement PREMIUM aux owners
        // Il faut vérifier s'ils ont vraiment un abonnement Stripe actif

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profile } = await (supabase as any)
          .from('profiles')
          .select('establishment_id, role')
          .eq('id', user.id)
          .single()

        if (!profile?.establishment_id) {
          setSubscription({
            plan: 'FREE',
            status: 'none',
            periodEnd: null,
            trialEndsAt: null,
            stripeCustomerId: null,
            stripeSubscriptionId: null,
            hasUsedTrial: false,
          })
          setLoading(false)
          return
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: establishment } = await (supabase as any)
          .from('establishments')
          .select(`
            subscription_plan,
            subscription_status,
            subscription_period_end,
            trial_ends_at,
            stripe_customer_id,
            stripe_subscription_id,
            has_used_trial
          `)
          .eq('id', profile.establishment_id)
          .single()

        if (establishment) {
          // Normaliser les valeurs en minuscules pour comparaison
          const rawStatus = (establishment.subscription_status || 'none').toLowerCase()
          const rawPlan = (establishment.subscription_plan || 'free').toLowerCase()
          
          console.log('[useSubscription] Données brutes:', {
            rawStatus,
            rawPlan,
            stripeSubscriptionId: establishment.stripe_subscription_id,
            stripeCustomerId: establishment.stripe_customer_id
          })
          
          // Vérifier si abonnement Stripe actif
          const hasActiveStripeSubscription = establishment.stripe_subscription_id && 
            (rawStatus === 'active' || rawStatus === 'trialing')
          
          // Déterminer le plan (convertir en majuscules pour le type PlanId)
          let plan: PlanId = 'FREE'
          if (hasActiveStripeSubscription) {
            plan = (rawPlan.toUpperCase() || 'PREMIUM') as PlanId
          } else if (ownerStatus) {
            plan = 'FREE' // Owner sans abonnement = Essai gratuit
          } else {
            plan = (rawPlan.toUpperCase() || 'FREE') as PlanId
          }
          
          // Déterminer le statut
          let status: SubscriptionStatus = 'none'
          if (hasActiveStripeSubscription) {
            status = rawStatus as SubscriptionStatus
          } else if (ownerStatus) {
            status = 'trialing' // Essai pour owner
          } else {
            status = rawStatus as SubscriptionStatus
          }
          
          console.log('[useSubscription] Résultat:', { plan, status, hasActiveStripeSubscription })

          setSubscription({
            plan,
            status,
            periodEnd: establishment.subscription_period_end 
              ? new Date(establishment.subscription_period_end) 
              : null,
            trialEndsAt: establishment.trial_ends_at 
              ? new Date(establishment.trial_ends_at) 
              : null,
            stripeCustomerId: establishment.stripe_customer_id,
            stripeSubscriptionId: establishment.stripe_subscription_id,
            hasUsedTrial: establishment.has_used_trial || false,
          })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()
  }, [])

  // Calcul des états dérivés
  const isTrialing = subscription?.status === 'trialing'
  const isPaid = subscription?.plan !== 'FREE' && subscription?.status === 'active'
  const isPastDue = subscription?.status === 'past_due' || subscription?.status === 'unpaid'
  const isCanceled = subscription?.status === 'canceled' || subscription?.status === 'incomplete_expired'
  
  // Accès bloqué si statut non autorisé
  const isBlocked = subscription ? !ALLOWED_STATUSES.includes(subscription.status) && subscription.plan !== 'FREE' : false
  
  // Accès valide si actif, en essai, ou owner
  const hasValidAccess = isOwner || 
    (subscription?.status === 'active' && subscription?.plan !== 'FREE') || 
    subscription?.status === 'trialing'

  // Jours restants d'essai
  const trialDaysRemaining = subscription?.trialEndsAt 
    ? Math.max(0, Math.ceil((new Date(subscription.trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : null
  
  const currentPlan = subscription?.plan ? PLANS[subscription.plan] : PLANS.FREE
  
  const canAccessFeature = (requiredPlan: PlanId) => {
    if (isOwner) return true
    const planOrder: PlanId[] = ['FREE', 'STARTER', 'PRO', 'PREMIUM']
    const currentIndex = planOrder.indexOf(subscription?.plan || 'FREE')
    const requiredIndex = planOrder.indexOf(requiredPlan)
    return currentIndex >= requiredIndex
  }

  const openBillingPortal = async () => {
    try {
      console.log('Appel API /api/stripe/portal...')
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `Erreur HTTP ${response.status}` }))
        throw new Error(errorData.error || `Erreur HTTP ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Réponse API:', data)
      
      if (data.url) {
        console.log('Redirection vers:', data.url)
        window.location.href = data.url
      } else if (data.error) {
        throw new Error(data.error)
      } else {
        throw new Error('Aucune URL de portail reçue')
      }
    } catch (err) {
      console.error('Erreur ouverture portail:', err)
      throw err
    }
  }

  const redirectToCheckout = (planId: string = 'PREMIUM') => {
    window.location.href = `/pricing?plan=${planId.toLowerCase()}`
  }

  return {
    subscription,
    loading,
    error,
    isOwner,
    isTrialing,
    isPaid,
    isPastDue,
    isCanceled,
    isBlocked,
    hasValidAccess,
    trialDaysRemaining,
    currentPlan,
    canAccessFeature,
    openBillingPortal,
    redirectToCheckout,
  }
}
