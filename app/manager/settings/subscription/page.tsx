"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Check, CreditCard, Crown, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/hooks/use-auth"
import { PRICING_PLANS } from "@/lib/pricing-config"

const plans = [
  {
    id: "free",
    name: "Gratuit",
    price: "0€",
    priceId: null,
    period: "/mois",
    description: "Pour démarrer",
    features: [
      "1 établissement",
      "Gestion de stock basique",
      "5 produits max",
      "Support email",
    ],
  },
  {
    id: PRICING_PLANS.starter.id,
    name: PRICING_PLANS.starter.name,
    price: `${PRICING_PLANS.starter.price}€`,
    priceId: PRICING_PLANS.starter.priceId,
    period: PRICING_PLANS.starter.period,
    description: PRICING_PLANS.starter.description,
    features: PRICING_PLANS.starter.features,
  },
  {
    id: PRICING_PLANS.pro.id,
    name: PRICING_PLANS.pro.name,
    price: `${PRICING_PLANS.pro.price}€`,
    priceId: PRICING_PLANS.pro.priceId,
    period: PRICING_PLANS.pro.period,
    description: PRICING_PLANS.pro.description,
    features: PRICING_PLANS.pro.features,
    popular: true,
  },
  {
    id: PRICING_PLANS.premium.id,
    name: PRICING_PLANS.premium.name,
    price: `${PRICING_PLANS.premium.price}€`,
    priceId: PRICING_PLANS.premium.priceId,
    period: PRICING_PLANS.premium.period,
    description: PRICING_PLANS.premium.description,
    features: PRICING_PLANS.premium.features,
  },
]

export default function SubscriptionPage() {
  const { profile } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState("pro")
  const [loading, setLoading] = useState(false)

  // Plan actuel (à récupérer de la BDD)
  const currentPlan = profile?.subscription_plan || "free"

  const handleSubscribe = async (priceId: string | null) => {
    if (!priceId) return

    setLoading(true)
    try {
      // Appeler l'API pour créer une session Stripe Checkout
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { priceId }
      })

      if (error) throw error

      if (data?.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Erreur Stripe:', error)
      alert('Erreur lors de la création de la session de paiement')
    } finally {
      setLoading(false)
    }
  }

  const handleManageSubscription = async () => {
    setLoading(true)
    try {
      // Appeler l'API pour créer un portail de gestion Stripe
      const { data, error } = await supabase.functions.invoke('create-portal-session')

      if (error) throw error

      if (data?.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Erreur Stripe:', error)
      alert('Erreur lors de l\'accès au portail de gestion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-5">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/manager/settings" className="sg-icon-btn">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Gérer l'abonnement</h1>
          <p className="text-xs text-[var(--text-muted)]">Choisissez le plan adapté à vos besoins</p>
        </div>
      </div>

      {/* Current Plan Banner */}
      <div className="sg-card sg-card-glow mb-6">
        <div className="sg-card-body">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-[var(--text-muted)]">Votre abonnement actuel</p>
                <p className="text-xl font-bold text-[var(--text-primary)]">
                  Plan {plans.find(p => p.id === currentPlan)?.name}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {plans.find(p => p.id === currentPlan)?.price}
                <span className="text-sm text-[var(--text-muted)]">/mois</span>
              </p>
              {currentPlan !== "free" && (
                <button
                  onClick={handleManageSubscription}
                  disabled={loading}
                  className="text-xs text-orange-400 hover:underline mt-2"
                >
                  {loading ? "Chargement..." : "Gérer mon abonnement"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Plans Grid - Single Row */}
      <div className="grid grid-cols-4 gap-3">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlan
          
          return (
            <div
              key={plan.id}
              className={`sg-card cursor-pointer transition-all ${
                isCurrent ? "sg-card-glow ring-2 ring-orange-500/50" : ""
              } ${selectedPlan === plan.id ? "scale-[1.01]" : ""}`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              <div className="p-4">
                {plan.popular && (
                  <div className="flex justify-center -mt-2 mb-2">
                    <span className="sg-badge sg-badge-orange text-[10px] px-2 py-0.5">
                      <Crown className="h-2.5 w-2.5" />
                      Populaire
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-3">
                  <h3 className="text-sm font-bold text-[var(--text-primary)] mb-0.5">{plan.name}</h3>
                  <p className="text-[10px] text-[var(--text-muted)]">{plan.description}</p>
                </div>

                <div className="text-center mb-3">
                  <span className="text-2xl font-bold text-[var(--text-primary)]">{plan.price}</span>
                  <span className="text-xs text-[var(--text-muted)]">{plan.period}</span>
                </div>

                <ul className="space-y-1 mb-3">
                  {plan.features.slice(0, 4).map((feature, i) => (
                    <li key={i} className="flex items-center gap-1.5 text-[10px] text-[var(--text-secondary)]">
                      <Check className="h-3 w-3 text-green-400 flex-shrink-0" />
                      <span className="truncate">{feature}</span>
                    </li>
                  ))}
                  {plan.features.length > 4 && (
                    <li className="text-[10px] text-[var(--text-muted)] text-center">+{plan.features.length - 4} autres</li>
                  )}
                </ul>

                <button
                  onClick={() => plan.priceId && handleSubscribe(plan.priceId)}
                  disabled={isCurrent || loading || !plan.priceId}
                  className={`w-full py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    isCurrent
                      ? "bg-[var(--secondary)] text-[var(--text-muted)] cursor-default"
                      : "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-90 disabled:opacity-50"
                  }`}
                >
                  {loading && <Loader2 className="h-3 w-3 animate-spin" />}
                  {isCurrent ? "Plan actuel" : loading ? "..." : "Choisir ce plan"}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Payment Info */}
      <div className="sg-card mt-6">
        <div className="sg-card-body">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Paiement sécurisé</h3>
          <div className="flex items-center gap-4">
            <div className="h-10 w-16 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-[var(--text-primary)]">Paiement via Stripe</p>
              <p className="text-xs text-[var(--text-muted)]">Sécurisé et conforme PCI-DSS</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
