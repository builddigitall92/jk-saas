"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  Check, 
  Sparkles, 
  Zap,
  Crown,
  Loader2,
  ArrowRight,
  Shield,
  Brain,
  ShieldCheck,
  HelpCircle,
  ChevronDown
} from "lucide-react"
import Link from "next/link"
import { getStripe } from "@/lib/stripe-client"
import { PRICING_PLANS, type BillingPeriod } from "@/lib/pricing-config"

// FAQ Item Component
function FAQItem({ question, answer, isOpen, onClick }: {
  question: string; answer: string; isOpen: boolean; onClick: () => void
}) {
  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/[0.02] backdrop-blur-sm">
      <button
        onClick={onClick}
        className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-white/5 transition-colors"
      >
        <span className="text-lg font-semibold text-white">{question}</span>
        <ChevronDown className={`h-5 w-5 text-gray-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
        <p className="px-6 pb-6 text-gray-400 leading-relaxed">{answer}</p>
      </div>
    </div>
  )
}

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("annual")
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)

  const handleSubscribe = async (planId: string) => {
    setLoading(planId)

    // Convertir planId en majuscules pour l'API (STARTER, PRO, PREMIUM)
    const apiPlanId = planId.toUpperCase()

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: apiPlanId, billingType: billingPeriod }),
      })

      const data = await response.json()

      if (data.error) {
        if (response.status === 401) {
          window.location.href = `/login?redirect=/pricing&plan=${planId}`
          return
        }
        const errorMessage = data.error || 'Une erreur est survenue lors de la création du paiement'
        alert(errorMessage)
        console.error('Erreur checkout:', data)
        return
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        const stripe = await getStripe()
        if (stripe) {
          await stripe.redirectToCheckout({ sessionId: data.sessionId })
        }
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(null)
    }
  }

  const faqs = [
    {
      question: "Puis-je changer de plan à tout moment ?",
      answer: "Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements prennent effet immédiatement et sont proratisés."
    },
    {
      question: "Comment fonctionne l'essai gratuit ?",
      answer: "Vous avez 14 jours pour tester toutes les fonctionnalités du plan choisi. Aucune carte bancaire requise pour commencer. Vous ne serez facturé qu'à la fin de l'essai."
    },
    {
      question: "Quels moyens de paiement acceptez-vous ?",
      answer: "Nous acceptons les cartes Visa, Mastercard, American Express, ainsi que les prélèvements SEPA pour les entreprises européennes."
    },
    {
      question: "Puis-je annuler mon abonnement ?",
      answer: "Oui, vous pouvez annuler à tout moment depuis votre espace client. Vous conservez l'accès jusqu'à la fin de votre période de facturation."
    },
    {
      question: "Y a-t-il un engagement ?",
      answer: "Non, aucun engagement. L'abonnement annuel offre simplement une réduction. Vous pouvez annuler quand vous voulez, sans frais cachés."
    }
  ]

  const planOrder = ['premium'] as const
  const planIcons = {
    premium: Crown
  }
  const planColors = {
    premium: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', glow: 'shadow-amber-500/20' }
  }

  return (
    <div className="min-h-dvh bg-[#0a0a0a] text-white overflow-hidden">
      {/* Background Effects - s'étend sous notch iOS */}
      <div className="fixed inset-0 pointer-events-none bg-[#0a0a0a]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-emerald-600/10 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#0a0a0a]/80 border-b border-white/5 pt-[env(safe-area-inset-top)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight">STOCKGUARD</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/5">
                  Connexion
                </Button>
              </Link>
              <Link href="/login">
                <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-500/20">
                  Essai gratuit
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-6">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">14 jours d'essai gratuit</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6">
            <span className="text-white">Tarifs </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-300">simples et transparents</span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Commencez votre essai gratuit, évoluez selon vos besoins. 
            Sans engagement, annulable à tout moment.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 p-2 rounded-full bg-white/5 border border-white/10">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                billingPeriod === "monthly" 
                  ? "bg-white text-black" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBillingPeriod("annual")}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                billingPeriod === "annual" 
                  ? "bg-white text-black" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Annuel
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                billingPeriod === "annual"
                  ? "bg-emerald-500 text-white"
                  : "bg-emerald-500/80 text-white"
              }`}>
                -20%
              </span>
            </button>
          </div>

          {billingPeriod === "annual" && (
            <p className="text-sm text-emerald-400 mt-4 font-medium">
              💰 Économisez jusqu'à 3 mois en passant à l'annuel
            </p>
          )}
        </div>
      </section>

      {/* Plans */}
      <section id="pricing" className="relative pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center">
            <div className="max-w-md w-full">
              {planOrder.map((planKey) => {
                const plan = PRICING_PLANS[planKey]
                const Icon = planIcons[planKey]
                const colors = planColors[planKey]
                const pricing = billingPeriod === "monthly" ? plan.monthly : plan.annual

                return (
                  <div 
                    key={planKey}
                    className="relative rounded-3xl transition-all duration-300 premium-card-glow"
                  >
                    {/* Premium glow effects */}
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/15 to-amber-500/8 blur-2xl rounded-3xl animate-pulse-slow" />
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-orange-500/5 blur-xl rounded-3xl" />
                    <div className="absolute inset-0 rounded-3xl overflow-hidden">
                      <div className="absolute inset-0 premium-shimmer" />
                    </div>

                    <div className="relative p-8 rounded-3xl bg-gradient-to-br from-gray-900 to-gray-950 border-2 border-amber-500/50 shadow-2xl shadow-amber-500/20 premium-card-flicker">
                      {/* Premium badge */}
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10">
                        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg shadow-amber-500/50 premium-badge-flicker">
                          <Crown className="h-4 w-4" />
                          Plan Premium
                        </div>
                      </div>

                      {/* Annual savings badge */}
                      {billingPeriod === "annual" && pricing.discount && (
                        <div className="absolute -top-3 right-4">
                          <div className="bg-gradient-to-r from-amber-600 to-amber-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg">
                            {pricing.discount}
                          </div>
                        </div>
                      )}

                      {/* Header */}
                      <div className="mb-6 pt-2">
                        <div className="h-14 w-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
                          <Icon className="h-7 w-7 text-amber-400" />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                          {plan.tagline}
                        </span>
                        <h3 className="text-2xl font-bold text-white mt-2">{plan.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">{plan.target}</p>
                      </div>

                      {/* Price */}
                      <div className="mb-6">
                        <div className="flex items-baseline gap-2">
                          {billingPeriod === "annual" && pricing.originalPrice && (
                            <span className="text-xl font-medium text-gray-500 line-through">
                              {pricing.originalPrice}€
                            </span>
                          )}
                          <span className="text-5xl font-black text-amber-400">
                            {pricing.price}€
                          </span>
                          <span className="text-gray-500">{pricing.period}</span>
                        </div>
                        {billingPeriod === "annual" && pricing.savings && (
                          <p className="text-sm font-semibold mt-1 text-amber-400">
                            Économisez {pricing.savings}
                          </p>
                        )}
                        {billingPeriod === "monthly" && (
                          <p className="text-xs text-gray-500 mt-1">
                            ou {plan.annual.price}€/an
                          </p>
                        )}
                      </div>

                      {/* Limits */}
                      <div className="flex gap-4 mb-6 pb-6 border-b border-white/10">
                        <div className="flex-1 p-3 rounded-xl bg-amber-500/10">
                          <p className="text-2xl font-bold text-white">
                            {plan.limits.establishments === 'unlimited' ? '∞' : plan.limits.establishments}
                          </p>
                          <p className="text-xs text-gray-400">établissement{plan.limits.establishments !== 1 && plan.limits.establishments !== 'unlimited' ? 's' : ''}</p>
                        </div>
                        <div className="flex-1 p-3 rounded-xl bg-amber-500/10">
                          <p className="text-2xl font-bold text-white">
                            {plan.limits.users === 'unlimited' ? '∞' : plan.limits.users}
                          </p>
                          <p className="text-xs text-gray-400">utilisateur{typeof plan.limits.users === 'number' && plan.limits.users > 1 ? 's' : ''}</p>
                        </div>
                      </div>

                      {/* Features */}
                      <ul className="space-y-2.5 mb-4">
                        {plan.features.slice(0, 6).map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <Check className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
                            <span className="text-sm text-white">{feature}</span>
                          </li>
                        ))}
                        {plan.features.length > 6 && (
                          <li className="text-xs text-gray-500 pl-7">
                            + {plan.features.length - 6} autres fonctionnalités
                          </li>
                        )}
                      </ul>

                      {/* AI Features */}
                      <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-purple-500/15 to-blue-500/15 border border-purple-500/30">
                        <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Brain className="h-3.5 w-3.5" />
                          IA étendue
                        </p>
                        <ul className="space-y-2">
                          {plan.aiFeatures.slice(0, 3).map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Sparkles className="h-3.5 w-3.5 text-purple-400 shrink-0 mt-0.5" />
                              <span className="text-xs text-white">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* CTA */}
                      <Button
                        onClick={() => handleSubscribe(planKey)}
                        disabled={loading === planKey}
                        className="w-full h-12 font-bold shadow-lg transition-all bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-amber-500/30"
                      >
                        {loading === planKey ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            Essai gratuit 14 jours
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Guarantee */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <ShieldCheck className="h-6 w-6 text-emerald-400" />
              <span className="text-white font-medium">
                Garantie 30 jours satisfait ou remboursé
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison note */}
      <section className="py-16 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Tous les plans incluent
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { icon: Shield, text: "Données sécurisées" },
              { icon: Zap, text: "Mises à jour gratuites" },
              { icon: HelpCircle, text: "Support inclus" },
              { icon: ShieldCheck, text: "Sans engagement" }
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <item.icon className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-gray-300">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
              <HelpCircle className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-400">Questions fréquentes</span>
            </div>
            <h2 className="text-3xl font-bold text-white">
              Des questions ?
            </h2>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <FAQItem
                key={i}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFAQ === i}
                onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-6">
            Prêt à reprendre le <span className="text-emerald-400">contrôle</span> ?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Commencez gratuitement pendant 14 jours. Sans carte bancaire.
          </p>
          <Link href="/login">
            <Button className="h-14 px-10 text-lg font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl shadow-2xl shadow-emerald-500/30">
              Commencer maintenant
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">STOCKGUARD</span>
          </div>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} StockGuard. Tous droits réservés.
          </p>
        </div>
      </footer>

      {/* Premium Card Animations */}
      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%) translateY(-100%) rotate(45deg);
          }
          100% {
            transform: translateX(200%) translateY(200%) rotate(45deg);
          }
        }
        
        @keyframes flicker {
          0%, 100% { opacity: 1; filter: brightness(1); }
          25% { opacity: 0.95; filter: brightness(1.1); }
          50% { opacity: 1; filter: brightness(1.2); }
          75% { opacity: 0.98; filter: brightness(1.1); }
        }
        
        @keyframes price-flicker {
          0%, 100% { 
            text-shadow: 0 0 10px rgba(251, 191, 36, 0.5),
                         0 0 20px rgba(251, 191, 36, 0.3),
                         0 0 30px rgba(251, 191, 36, 0.2);
            filter: brightness(1);
          }
          25% { 
            text-shadow: 0 0 15px rgba(251, 191, 36, 0.7),
                         0 0 25px rgba(251, 191, 36, 0.5),
                         0 0 35px rgba(251, 191, 36, 0.3);
            filter: brightness(1.2);
          }
          50% { 
            text-shadow: 0 0 20px rgba(251, 191, 36, 0.8),
                         0 0 30px rgba(251, 191, 36, 0.6),
                         0 0 40px rgba(251, 191, 36, 0.4);
            filter: brightness(1.3);
          }
          75% { 
            text-shadow: 0 0 15px rgba(251, 191, 36, 0.7),
                         0 0 25px rgba(251, 191, 36, 0.5),
                         0 0 35px rgba(251, 191, 36, 0.3);
            filter: brightness(1.2);
          }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        
        .premium-shimmer {
          background: linear-gradient(
            45deg,
            transparent 30%,
            rgba(251, 191, 36, 0.1) 50%,
            transparent 70%
          );
          width: 200%;
          height: 200%;
          animation: shimmer 3s ease-in-out infinite;
        }
        
        .premium-card-flicker {
          animation: flicker 2s ease-in-out infinite;
        }
        
        .premium-price-flicker {
          animation: price-flicker 2.5s ease-in-out infinite;
        }
        
        .premium-card-glow:hover {
          transform: scale(1.02);
        }
        
        .premium-card-glow:hover .premium-shimmer {
          animation-duration: 1.5s;
        }
        
        @keyframes badge-flicker {
          0%, 100% { 
            box-shadow: 0 0 10px rgba(251, 191, 36, 0.5),
                        0 0 20px rgba(251, 191, 36, 0.3);
            filter: brightness(1);
          }
          50% { 
            box-shadow: 0 0 15px rgba(251, 191, 36, 0.8),
                        0 0 25px rgba(251, 191, 36, 0.6),
                        0 0 35px rgba(251, 191, 36, 0.4);
            filter: brightness(1.3);
          }
        }
        
        .premium-badge-flicker {
          animation: badge-flicker 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
