"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  ArrowLeft, 
  Check, 
  X, 
  CreditCard, 
  Crown, 
  Loader2, 
  Sparkles, 
  Shield, 
  Brain,
  Calendar,
  Building2,
  Users,
  Download,
  ExternalLink,
  ChevronRight,
  Receipt
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/hooks/use-auth"
import { PRICING_PLANS, type BillingPeriod } from "@/lib/pricing-config"

export default function SubscriptionPage() {
  const { profile } = useAuth()
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("annual")
  const [loading, setLoading] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  // Plan actuel
  const currentPlan = profile?.subscription_plan || "free"
  const currentBillingPeriod = profile?.billing_period || "monthly"

  // Données de facturation simulées (à remplacer par des vraies données)
  const invoices = [
    { id: "INV-2024-001", date: "25/12/2024", amount: 120, plan: "Pro", period: "Mensuel", status: "Payé" },
    { id: "INV-2024-002", date: "25/11/2024", amount: 120, plan: "Pro", period: "Mensuel", status: "Payé" },
    { id: "INV-2024-003", date: "25/10/2024", amount: 120, plan: "Pro", period: "Mensuel", status: "Payé" },
  ]

  // Configuration des plans avec les nouveaux prix
  const plans = [
    {
      id: "free",
      name: "Gratuit",
      description: "Pour découvrir",
      target: "Essai limité",
      price: 0,
      period: "/mois",
      priceId: null,
      icon: Shield,
      color: "slate",
      limits: { establishments: 1, users: 1 },
      features: [
        "1 établissement",
        "1 utilisateur",
        "3 produits max",
        "Gestion de stock basique",
      ],
      aiFeatures: [],
      excludedFeatures: [
        "Assistant IA",
        "Alertes automatiques",
        "Rapports détaillés",
      ],
    },
    {
      id: PRICING_PLANS.premium.id,
      name: PRICING_PLANS.premium.name,
      description: PRICING_PLANS.premium.description,
      target: PRICING_PLANS.premium.target,
      price: billingPeriod === "monthly" 
        ? PRICING_PLANS.premium.monthly.price 
        : PRICING_PLANS.premium.annual.price,
      originalPrice: billingPeriod === "annual" 
        ? PRICING_PLANS.premium.annual.originalPrice 
        : undefined,
      period: billingPeriod === "monthly" ? "/mois" : "/an",
      discount: billingPeriod === "annual" 
        ? PRICING_PLANS.premium.annual.discount 
        : undefined,
      priceId: billingPeriod === "monthly" 
        ? PRICING_PLANS.premium.monthly.priceId 
        : PRICING_PLANS.premium.annual.priceId,
      icon: Sparkles,
      color: "amber",
      limits: PRICING_PLANS.premium.limits,
      features: PRICING_PLANS.premium.features,
      aiFeatures: PRICING_PLANS.premium.aiFeatures,
    },
  ]

  const currentPlanData = plans.find(p => p.id === currentPlan)

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
      amber: { 
        bg: "from-amber-500/20 to-amber-600/10", 
        border: "border-amber-500/30", 
        text: "text-amber-400",
        gradient: "from-amber-500 to-amber-600"
      },
    }
    return colors[color] || colors.blue
  }

  const getAnnualSavings = (planId: string) => {
    if (planId === 'premium') return 995
    return 0
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
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

      {/* =====================================================
          SECTION 1: RÉSUMÉ ABONNEMENT ACTUEL
          ===================================================== */}
      <div 
        className="relative overflow-hidden rounded-2xl p-6"
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

        <div className="relative z-10">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Abonnement actuel
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Plan */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                {currentPlanData?.icon && <currentPlanData.icon className="h-6 w-6 text-white" />}
              </div>
              <div>
                <p className="text-xs text-slate-500">Plan</p>
                <p className="text-lg font-bold text-white">
                  {currentPlanData?.name || 'Gratuit'}
                </p>
              </div>
            </div>

            {/* Mode */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800/50 border border-white/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-slate-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Mode</p>
                <p className="text-lg font-bold text-white capitalize">
                  {currentBillingPeriod === 'annual' ? 'Annuel' : 'Mensuel'}
                </p>
              </div>
            </div>

            {/* Prix */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800/50 border border-white/10 flex items-center justify-center">
                <Receipt className="h-6 w-6 text-slate-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Prix</p>
                <p className="text-lg font-bold text-white">
                  {currentPlanData?.price || 0}€{currentPlanData?.period || '/mois'}
                </p>
              </div>
            </div>

            {/* Limites */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800/50 border border-white/10 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-slate-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Inclus</p>
                <p className="text-sm font-medium text-white">
                  {currentPlanData?.limits?.establishments === 'unlimited' 
                    ? '∞ établissements' 
                    : `${currentPlanData?.limits?.establishments || 1} établissement${(currentPlanData?.limits?.establishments || 1) > 1 ? 's' : ''}`}
                  {' · '}
                  {currentPlanData?.limits?.users === 'unlimited' 
                    ? '∞ utilisateurs' 
                    : `${currentPlanData?.limits?.users || 1} utilisateur${(currentPlanData?.limits?.users || 1) > 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          {currentPlan !== "free" && (
            <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap gap-3">
              <button
                onClick={handleManageSubscription}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white transition-all text-sm"
              >
                <CreditCard className="h-4 w-4" />
                Gérer le paiement
                <ExternalLink className="h-3 w-3 opacity-50" />
              </button>
              {currentBillingPeriod === 'monthly' && (
                <button
                  onClick={() => setBillingPeriod('annual')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 transition-all text-sm font-medium"
                >
                  <Sparkles className="h-4 w-4" />
                  Passer en annuel – économisez {getAnnualSavings(currentPlan)}€/an
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          SECTION 2: CHOIX DE PLAN
          ===================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100">Changer de plan</h2>
          
          {/* Billing Toggle */}
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
              <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                jusqu'à 3 mois offerts
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map((plan) => {
            const isCurrent = plan.id === currentPlan
            const colors = getColorClasses(plan.color)
            const Icon = plan.icon
            const isUpgrade = plans.findIndex(p => p.id === plan.id) > plans.findIndex(p => p.id === currentPlan)
            
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
                {plan.popular && !isCurrent && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      Recommandé
                    </span>
                  </div>
                )}

                {/* Current Badge */}
                {isCurrent && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      Plan actuel
                    </span>
                  </div>
                )}

                {/* Discount Badge */}
                {plan.discount && billingPeriod === "annual" && !isCurrent && (
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {plan.discount}
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
                  <p className="text-xs text-slate-500 mb-4">{plan.target}</p>

                  {/* Price */}
                  <div className="mb-5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-white">{plan.price}€</span>
                      <span className="text-sm text-slate-500">{plan.period}</span>
                    </div>
                    {plan.originalPrice && plan.originalPrice > plan.price && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-slate-500 line-through">{plan.originalPrice}€</span>
                        <span className="text-xs text-emerald-400">
                          -{plan.originalPrice - plan.price}€
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 mb-4">
                    {plan.features.slice(0, 4).map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{feature}</span>
                      </li>
                    ))}
                    {plan.features.length > 4 && (
                      <li className="text-xs text-slate-500 pl-6">
                        +{plan.features.length - 4} autres fonctionnalités
                      </li>
                    )}
                  </ul>

                  {/* AI Features */}
                  {plan.aiFeatures && plan.aiFeatures.length > 0 && (
                    <div className="mb-4 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                      <p className="text-xs font-semibold text-purple-400 mb-2 flex items-center gap-1.5">
                        <Brain className="h-3.5 w-3.5" />
                        IA incluse
                      </p>
                      <p className="text-xs text-slate-400 line-clamp-2">
                        {plan.aiFeatures[0]}
                      </p>
                    </div>
                  )}

                  {/* Excluded Features */}
                  {plan.excludedFeatures?.slice(0, 2).map((feature, i) => (
                    <li key={`ex-${i}`} className="flex items-start gap-2 text-sm text-slate-500 list-none">
                      <X className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
                      <span className="line-through">{feature}</span>
                    </li>
                  ))}

                  {/* Button */}
                  <button
                    onClick={() => plan.priceId && handleSubscribe(plan.priceId, plan.id)}
                    disabled={isCurrent || loading || !plan.priceId}
                    className={`w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 mt-4 ${
                      isCurrent
                        ? "bg-slate-800/50 text-slate-500 cursor-default border border-slate-700/50"
                        : isUpgrade
                          ? `bg-gradient-to-r ${colors.gradient} text-white hover:opacity-90 shadow-lg disabled:opacity-50`
                          : "bg-slate-800/50 text-slate-300 border border-white/10 hover:bg-slate-800"
                    }`}
                  >
                    {loadingPlan === plan.id && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isCurrent 
                      ? "Plan actuel" 
                      : loadingPlan === plan.id 
                        ? "Redirection..." 
                        : isUpgrade 
                          ? `Passer à ${plan.name}`
                          : "Rétrograder"
                    }
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* =====================================================
          SECTION 3: HISTORIQUE & FACTURATION
          ===================================================== */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Historique des factures */}
        <div 
          className="relative overflow-hidden rounded-2xl p-5"
          style={{
            background: "linear-gradient(145deg, rgba(20, 27, 45, 0.92) 0%, rgba(15, 20, 35, 0.95) 100%)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(100, 130, 180, 0.15)",
          }}
        >
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-400" />
            Historique des factures
          </h3>

          {invoices.length > 0 ? (
            <div className="space-y-2">
              {invoices.map((invoice) => (
                <div 
                  key={invoice.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-white/5 hover:bg-slate-800/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                      <Receipt className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{invoice.id}</p>
                      <p className="text-xs text-slate-500">{invoice.date} · {invoice.plan} {invoice.period}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">{invoice.amount}€</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                        {invoice.status}
                      </span>
                    </div>
                    <button className="w-8 h-8 rounded-lg bg-slate-800/50 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all opacity-0 group-hover:opacity-100">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Receipt className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Aucune facture pour le moment</p>
            </div>
          )}
        </div>

        {/* Mode de paiement */}
        <div 
          className="relative overflow-hidden rounded-2xl p-5"
          style={{
            background: "linear-gradient(145deg, rgba(20, 27, 45, 0.92) 0%, rgba(15, 20, 35, 0.95) 100%)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(100, 130, 180, 0.15)",
          }}
        >
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-purple-400" />
            Mode de paiement
          </h3>

          <div className="p-4 rounded-xl bg-slate-800/30 border border-white/5 mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">VISA</span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">•••• •••• •••• 4242</p>
                <p className="text-xs text-slate-500">Expire 12/2025</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleManageSubscription}
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-medium bg-slate-800/50 border border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            Modifier le mode de paiement
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
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
            <Shield className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">Paiement 100% sécurisé</h3>
            <p className="text-xs text-slate-400">
              Transactions chiffrées via <span className="text-blue-400 font-medium">Stripe</span> · Conforme PCI-DSS · Annulation à tout moment · Sans engagement
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
