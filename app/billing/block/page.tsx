"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { 
  AlertTriangle, 
  CreditCard, 
  RefreshCw, 
  Shield, 
  ArrowRight,
  XCircle,
  Clock,
  HelpCircle,
  LogOut
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"

type BlockReason = "expired" | "payment_failed" | "canceled" | "no_subscription"

interface BlockInfo {
  reason: BlockReason
  title: string
  description: string
  icon: React.ReactNode
}

const blockReasons: Record<BlockReason, BlockInfo> = {
  expired: {
    reason: "expired",
    title: "Votre abonnement a expiré",
    description: "Votre période d'abonnement est terminée. Renouvelez maintenant pour continuer à utiliser StockGuard.",
    icon: <Clock className="h-16 w-16 text-amber-400" />
  },
  payment_failed: {
    reason: "payment_failed",
    title: "Problème de paiement",
    description: "Le paiement de votre abonnement a échoué. Veuillez mettre à jour vos informations de paiement.",
    icon: <XCircle className="h-16 w-16 text-red-400" />
  },
  canceled: {
    reason: "canceled",
    title: "Abonnement annulé",
    description: "Votre abonnement a été annulé. Réabonnez-vous pour retrouver l'accès à toutes les fonctionnalités.",
    icon: <AlertTriangle className="h-16 w-16 text-amber-400" />
  },
  no_subscription: {
    reason: "no_subscription",
    title: "Abonnement requis",
    description: "Vous n'avez pas d'abonnement actif. Choisissez un plan pour accéder à StockGuard.",
    icon: <Shield className="h-16 w-16 text-slate-400" />
  }
}

export default function BillingBlockPage() {
  const [loading, setLoading] = useState(false)
  const [blockReason, setBlockReason] = useState<BlockReason>("no_subscription")
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          window.location.href = "/login"
          return
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("establishment_id")
          .eq("id", user.id)
          .single()

        if (!profile?.establishment_id) {
          setBlockReason("no_subscription")
          setIsLoading(false)
          return
        }

        const { data: establishment } = await supabase
          .from("establishments")
          .select("subscription_status, subscription_plan, stripe_subscription_id")
          .eq("id", profile.establishment_id)
          .single()

        // Normaliser les valeurs
        const status = (establishment?.subscription_status || 'none').toLowerCase()
        const plan = (establishment?.subscription_plan || 'free').toLowerCase()
        const hasStripeSubscription = !!establishment?.stripe_subscription_id
        
        // Vérifier si l'accès est valide (même logique que le middleware)
        const hasValidStatus = status === 'active' || status === 'trialing'
        const isPaidPlan = plan !== 'free' && plan !== ''
        const hasValidAccess = hasValidStatus && (isPaidPlan || hasStripeSubscription)
        
        console.log('[BillingBlock] Vérification:', { status, plan, hasStripeSubscription, hasValidAccess })
        
        // Si l'accès est valide, rediriger vers le dashboard
        if (hasValidAccess) {
          console.log('[BillingBlock] Accès valide, redirection vers /manager')
          window.location.replace("/manager")
          return
        }
        
        // Déterminer la raison du blocage
        if (!establishment?.subscription_status || !establishment?.subscription_plan || plan === "free") {
          setBlockReason("no_subscription")
        } else if (status === "canceled" || status === "incomplete_expired") {
          setBlockReason("canceled")
        } else if (status === "past_due" || status === "unpaid") {
          setBlockReason("payment_failed")
        } else {
          setBlockReason("expired")
        }
      } catch (error) {
        console.error("Erreur lors de la vérification:", error)
        setBlockReason("no_subscription")
      } finally {
        setIsLoading(false)
      }
    }

    checkSubscriptionStatus()
  }, [])

  const handleManageSubscription = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
      })
      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      } else if (data.error) {
        // Si pas de customer Stripe, rediriger vers pricing
        window.location.href = "/pricing"
      }
    } catch (error) {
      console.error("Erreur:", error)
      window.location.href = "/pricing"
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  const currentBlock = blockReasons[blockReason]

  return (
    <div className="min-h-dvh bg-[#0a0a0a] text-white overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-red-600/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#0a0a0a]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">StockGuard</span>
            </Link>
            <Button 
              variant="ghost" 
              className="text-gray-400 hover:text-white"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 min-h-dvh flex items-center justify-center px-4 pt-20">
        <div className="max-w-lg w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/5 border border-white/10 mb-6">
              {currentBlock.icon}
            </div>
            <h1 className="text-3xl font-bold mb-4">{currentBlock.title}</h1>
            <p className="text-gray-400 text-lg leading-relaxed">
              {currentBlock.description}
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            {blockReason === "payment_failed" ? (
              <>
                <Button
                  onClick={handleManageSubscription}
                  disabled={loading}
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl shadow-lg shadow-cyan-500/20"
                >
                  {loading ? (
                    <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <CreditCard className="h-5 w-5 mr-2" />
                  )}
                  Mettre à jour le moyen de paiement
                </Button>
                <p className="text-center text-sm text-gray-500">
                  Vous serez redirigé vers le portail de paiement sécurisé Stripe
                </p>
              </>
            ) : blockReason === "canceled" || blockReason === "expired" ? (
              <>
                <Button
                  onClick={handleManageSubscription}
                  disabled={loading}
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl shadow-lg shadow-cyan-500/20"
                >
                  {loading ? (
                    <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-5 w-5 mr-2" />
                  )}
                  Réactiver mon abonnement
                </Button>
                <Link href="/pricing" className="block">
                  <Button
                    variant="outline"
                    className="w-full h-12 text-base font-medium border-white/20 text-white hover:bg-white/5"
                  >
                    Voir les autres plans
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/pricing" className="block">
                  <Button
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl shadow-lg shadow-cyan-500/20"
                  >
                    Choisir un plan
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
                <p className="text-center text-sm text-gray-500">
                  Essai gratuit de 14 jours • Sans carte bancaire
                </p>
              </>
            )}
          </div>

          {/* Help link */}
          <div className="mt-8 text-center">
            <a 
              href="mailto:support@stockguard.fr" 
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              <HelpCircle className="h-4 w-4" />
              Besoin d'aide ? Contactez le support
            </a>
          </div>

          {/* Info box */}
          <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10">
            <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4 text-cyan-400" />
              Vos données sont en sécurité
            </h3>
            <p className="text-sm text-gray-400">
              Même si votre abonnement est inactif, toutes vos données sont préservées. 
              Réabonnez-vous pour retrouver votre historique complet.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

