"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

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
  const supabase = createClient()

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profile } = await (supabase as any)
          .from('profiles')
          .select('establishment_id')
          .eq('id', user.id)
          .single()

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
    currentPlan,
    canAccessFeature,
    openBillingPortal,
  }
}
