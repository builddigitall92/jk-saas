"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Check, X, CreditCard, Crown, Loader2, Sparkles, Shield, Zap } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/hooks/use-auth"
import { PRICING_PLANS, type BillingPeriod } from "@/lib/pricing-config"

export default function SubscriptionPage() {
  const { profile } = useAuth()
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly")
  const [loading, setLoading] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  // Plan actuel
  const currentPlan = profile?.subscription_plan || "free"

  const plans = [
    {
      id: "free",
      name: "Gratuit",
      description: "Pour découvrir",
      price: 0,
      period: "/mois",
      priceId: null,
      icon: Shield,
      color: "slate",
      features: [
        "1 établissement",
        "3 produits max",
        "Gestion de stock basique",
        "Support email",
      ],
      excludedFeatures: [
        "Alertes automatiques",
        "Rapports détaillés",
        "Multi-utilisateurs",
      ],
    },
    {
      id: PRICING_PLANS.starter.id,
      name: PRICING_PLANS.starter.name,
      description: PRICING_PLANS.starter.description,
      price: billingPeriod === "monthly" ? PRICING_PLANS.starter.monthly.price : PRICING_PLANS.starter.annual.price,
      originalPrice: billingPeriod === "monthly" ? PRICING_PLANS.starter.monthly.originalPrice : PRICING_PLANS.starter.annual.originalPrice,
      period: billingPeriod === "monthly" ? "/mois" : "/an",
      discount: billingPeriod === "monthly" ? PRICING_PLANS.starter.monthly.discount : PRICING_PLANS.starter.annual.discount,
      priceId: billingPeriod === "monthly" ? PRICING_PLANS.starter.monthly.priceId : PRICING_PLANS.starter.annual.priceId,
      icon: Zap,
      color: "blue",
      features: PRICING_PLANS.starter.features,
      excludedFeatures: PRICING_PLANS.starter.excludedFeatures,
    },
    {
      id: PRICING_PLANS.pro.id,
      name: PRICING_PLANS.pro.name,
      description: PRICING_PLANS.pro.description,
      price: billingPeriod === "monthly" ? PRICING_PLANS.pro.monthly.price : PRICING_PLANS.pro.annual.price,
      originalPrice: billingPeriod === "monthly" ? PRICING_PLANS.pro.monthly.originalPrice : PRICING_PLANS.pro.annual.originalPrice,
      period: billingPeriod === "monthly" ? "/mois" : "/an",
      discount: billingPeriod === "monthly" ? PRICING_PLANS.pro.monthly.discount : PRICING_PLANS.pro.annual.discount,
      priceId: billingPeriod === "monthly" ? PRICING_PLANS.pro.monthly.priceId : PRICING_PLANS.pro.annual.priceId,
      icon: Crown,
      color: "purple",
      popular: true,
      features: PRICING_PLANS.pro.features,
    },
    {
      id: PRICING_PLANS.premium.id,
      name: PRICING_PLANS.premium.name,
      description: PRICING_PLANS.premium.description,
      price: billingPeriod === "monthly" ? PRICING_PLANS.premium.monthly.price : PRICING_PLANS.premium.annual.price,
      originalPrice: billingPeriod === "monthly" ? PRICING_PLANS.premium.monthly.originalPrice : PRICING_PLANS.premium.annual.originalPrice,
      period: billingPeriod === "monthly" ? "/mois" : "/an",
      discount: billingPeriod === "monthly" ? PRICING_PLANS.premium.monthly.discount : PRICING_PLANS.premium.annual.discount,
      priceId: billingPeriod === "monthly" ? PRICING_PLANS.premium.monthly.priceId : PRICING_PLANS.premium.annual.priceId,
      icon: Sparkles,
      color: "cyan",
      features: PRICING_PLANS.premium.features,
    },
  ]

  const handleSubscribe = async (priceId: string | null, planId: string) => {
    if (!priceId) return

    setLoadingPlan(planId)
    setLoading(true)
    try {
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
      setLoadingPlan(null)
    }
  }

  const handleManageSubscription = async () => {
    setLoading(true)
    try {
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

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; gradient: string }> = {
      slate: { 
        bg: "from-slate-500/20 to-slate-600/10", 
        border: "border-slate-500/30", 
        text: "text-slate-400",
        gradient: "from-slate-500 to-slate-600"
      },
      blue: { 
        bg: "from-blue-500/20 to-blue-600/10", 
        border: "border-blue-500/30", 
        text: "text-blue-400",
        gradient: "from-blue-500 to-blue-600"
      },
      purple: { 
        bg: "from-purple-500/20 to-purple-600/10", 
        border: "border-purple-500/30", 
        text: "text-purple-400",
        gradient: "from-purple-500 to-purple-600"
      },
      cyan: { 
        bg: "from-cyan-500/20 to-cyan-600/10", 
        border: "border-cyan-500/30", 
        text: "text-cyan-400",
        gradient: "from-cyan-500 to-cyan-600"
      },
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <Link 
          href="/manager/settings" 
          className="w-10 h-10 rounded-xl bg-slate-800/50 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Gérer l'abonnement</h1>
          <p className="text-sm text-slate-400">Choisissez le plan adapté à vos besoins</p>
        </div>
      </div>

      {/* Current Plan Banner */}
      <div 
        className="relative overflow-hidden rounded-2xl p-5"
        style={{
          background: "linear-gradient(145deg, rgba(20, 27, 45, 0.92) 0%, rgba(15, 20, 35, 0.95) 100%)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(100, 130, 180, 0.15)",
        }}
      >
        {/* Reflet */}
        <div 
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "50%",
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(120, 160, 220, 0.04) 30%, transparent 60%)",
            pointerEvents: "none",
            borderRadius: "16px 16px 0 0",
          }}
        />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Crown className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Votre abonnement actuel</p>
              <p className="text-xl font-bold text-white">
                Plan {plans.find(p => p.id === currentPlan)?.name}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-white">
              {plans.find(p => p.id === currentPlan)?.price}€
              <span className="text-sm text-slate-400 font-normal">/mois</span>
            </p>
            {currentPlan !== "free" && (
              <button
                onClick={handleManageSubscription}
                disabled={loading}
                className="text-sm text-blue-400 hover:text-blue-300 hover:underline mt-1 transition-colors"
              >
                {loading ? "Chargement..." : "Gérer mon abonnement →"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center">
        <div 
          className="inline-flex items-center gap-3 p-1.5 rounded-xl"
          style={{
            background: "linear-gradient(145deg, rgba(20, 27, 45, 0.9) 0%, rgba(15, 20, 35, 0.95) 100%)",
            border: "1px solid rgba(100, 130, 180, 0.15)",
          }}
        >
          <button
            onClick={() => setBillingPeriod("monthly")}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              billingPeriod === "monthly"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Mensuel
          </button>
          <button
            onClick={() => setBillingPeriod("annual")}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              billingPeriod === "annual"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Annuel
            <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
              -17%
            </span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-4 gap-4">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlan
          const colors = getColorClasses(plan.color)
          const Icon = plan.icon
          
          return (
            <div
              key={plan.id}
              className={`relative overflow-hidden rounded-2xl transition-all hover:translate-y-[-2px] ${
                plan.popular ? "ring-2 ring-purple-500/50" : ""
              }`}
              style={{
                background: "linear-gradient(145deg, rgba(20, 27, 45, 0.92) 0%, rgba(15, 20, 35, 0.95) 100%)",
                backdropFilter: "blur(16px)",
                border: isCurrent 
                  ? "1px solid rgba(59, 130, 246, 0.5)" 
                  : "1px solid rgba(100, 130, 180, 0.15)",
                boxShadow: isCurrent ? "0 0 30px rgba(59, 130, 246, 0.15)" : undefined,
              }}
            >
              {/* Reflet */}
              <div 
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "50%",
                  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(120, 160, 220, 0.04) 30%, transparent 60%)",
                  pointerEvents: "none",
                  borderRadius: "16px 16px 0 0",
                }}
              />

              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute top-4 right-4 z-10">
                  <span className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    Populaire
                  </span>
                </div>
              )}

              {/* Current Badge */}
              {isCurrent && (
                <div className="absolute top-4 right-4 z-10">
                  <span className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    Actuel
                  </span>
                </div>
              )}

              <div className="relative z-10 p-5">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.bg} ${colors.border} border flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${colors.text}`} />
                </div>

                {/* Name & Description */}
                <h3 className={`text-lg font-semibold ${colors.text} mb-1`}>{plan.name}</h3>
                <p className="text-xs text-slate-500 mb-4">{plan.description}</p>

                {/* Price */}
                <div className="mb-5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white">{plan.price}€</span>
                    <span className="text-sm text-slate-500">{plan.period}</span>
                  </div>
                  {plan.originalPrice && plan.originalPrice > plan.price && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-slate-500 line-through">{plan.originalPrice}€</span>
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                        {plan.discount}
                      </span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-5">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {plan.excludedFeatures?.map((feature, i) => (
                    <li key={`ex-${i}`} className="flex items-start gap-2 text-sm text-slate-500">
                      <X className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
                      <span className="line-through">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Button */}
                <button
                  onClick={() => plan.priceId && handleSubscribe(plan.priceId, plan.id)}
                  disabled={isCurrent || loading || !plan.priceId}
                  className={`w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                    isCurrent
                      ? "bg-slate-800/50 text-slate-500 cursor-default border border-slate-700/50"
                      : `bg-gradient-to-r ${colors.gradient} text-white hover:opacity-90 shadow-lg disabled:opacity-50`
                  }`}
                >
                  {loadingPlan === plan.id && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isCurrent ? "Plan actuel" : loadingPlan === plan.id ? "Redirection..." : "Choisir ce plan"}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Payment Security */}
      <div 
        className="relative overflow-hidden rounded-2xl p-5"
        style={{
          background: "linear-gradient(145deg, rgba(20, 27, 45, 0.92) 0%, rgba(15, 20, 35, 0.95) 100%)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(100, 130, 180, 0.15)",
        }}
      >
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">Paiement 100% sécurisé</h3>
            <p className="text-xs text-slate-400">
              Transactions chiffrées via <span className="text-blue-400 font-medium">Stripe</span> · Conforme PCI-DSS · Annulation à tout moment
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
