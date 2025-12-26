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
    price: 20,
    features: [
      '1 établissement',
      '5 employés',
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
    price: 80,
    features: [
      '3 établissements',
      '15 employés',
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
    price: 110,
    features: [
      'Établissements illimités',
      'Employés illimités',
      'Toutes les fonctionnalités',
      'API personnalisée',
      'Intégrations sur mesure',
      'Account manager dédié',
      'SLA garanti',
    ],
  }
} as const

type PlanId = keyof typeof PLANS

interface Subscription {
  plan: PlanId
  status: string
  periodEnd: Date | null
  trialEndsAt: Date | null
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // ============================================
        // OWNER CHECK - Premium automatique pour le propriétaire
        // ============================================
        const ownerStatus = FORCE_PREMIUM_ACCESS || isOwnerEmail(user.email)
        setIsOwner(ownerStatus)
        
        // Si mode owner activé ou email owner, donner directement le plan PREMIUM
        if (ownerStatus) {
          setSubscription({
            plan: 'PREMIUM',
            status: 'active',
            periodEnd: null,
            trialEndsAt: null,
            stripeCustomerId: null,
            stripeSubscriptionId: null,
          })
          setLoading(false)
          return
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profile } = await (supabase as any)
          .from('profiles')
          .select('establishment_id, role')
          .eq('id', user.id)
          .single()

        // Si c'est un admin, donner aussi le plan PREMIUM
        if (profile?.role === 'admin') {
          setIsOwner(true)
          setSubscription({
            plan: 'PREMIUM',
            status: 'active',
            periodEnd: null,
            trialEndsAt: null,
            stripeCustomerId: null,
            stripeSubscriptionId: null,
          })
          setLoading(false)
          return
        }

        if (!profile?.establishment_id) return

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: establishment } = await (supabase as any)
          .from('establishments')
          .select(`
            subscription_plan,
            subscription_status,
            subscription_period_end,
            trial_ends_at,
            stripe_customer_id,
            stripe_subscription_id
          `)
          .eq('id', profile.establishment_id)
          .single()

        if (establishment) {
          setSubscription({
            plan: (establishment.subscription_plan?.toUpperCase() || 'FREE') as PlanId,
            status: establishment.subscription_status || 'active',
            periodEnd: establishment.subscription_period_end 
              ? new Date(establishment.subscription_period_end) 
              : null,
            trialEndsAt: establishment.trial_ends_at 
              ? new Date(establishment.trial_ends_at) 
              : null,
            stripeCustomerId: establishment.stripe_customer_id,
            stripeSubscriptionId: establishment.stripe_subscription_id,
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

  const isTrialing = subscription?.trialEndsAt && new Date() < subscription.trialEndsAt
  const isPaid = subscription?.plan !== 'FREE' && subscription?.status === 'active'
  const isPastDue = subscription?.status === 'past_due'
  const isCanceled = subscription?.status === 'canceled'
  
  const currentPlan = subscription?.plan ? PLANS[subscription.plan] : PLANS.FREE
  
  const canAccessFeature = (requiredPlan: PlanId) => {
    const planOrder: PlanId[] = ['FREE', 'STARTER', 'PRO', 'PREMIUM']
    const currentIndex = planOrder.indexOf(subscription?.plan || 'FREE')
    const requiredIndex = planOrder.indexOf(requiredPlan)
    return currentIndex >= requiredIndex
  }

  const openBillingPortal = async () => {
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      })
      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      } else if (data.error) {
        throw new Error(data.error)
      }
    } catch (err) {
      console.error('Erreur ouverture portail:', err)
      throw err
    }
  }

  return {
    subscription,
    loading,
    error,
    isTrialing,
    isPaid,
    isPastDue,
    isCanceled,
    isOwner, // 🔑 True si propriétaire du SaaS (Premium gratuit)
    currentPlan,
    canAccessFeature,
    openBillingPortal,
  }
}
