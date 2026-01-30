"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { 
  Check, 
  ArrowRight, 
  Shield, 
  Loader2,
  Sparkles,
  Crown,
  Zap,
  Clock,
  HelpCircle,
  ChevronDown,
  X,
  CheckCircle
} from "lucide-react"
import Link from "next/link"
import { getStripe } from "@/lib/stripe-client"
import { PublicHeader } from "@/components/public-header"
import { createClient } from "@/utils/supabase/client"

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 }
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
}

// Slide-In Button Component
function SlideInButton({
  children,
  icon: Icon = ArrowRight,
  className = "",
  variant = "primary",
  disabled = false,
  onClick,
}: {
  children: React.ReactNode
  icon?: React.ElementType
  className?: string
  variant?: "primary" | "secondary" | "outline"
  disabled?: boolean
  onClick?: () => void
}) {
  const variantClasses = {
    primary: "bg-white text-[#050508] font-semibold shadow-lg shadow-white/20 hover:shadow-2xl hover:shadow-cyan-400/40",
    secondary: "bg-gradient-to-r from-[#00d4ff] to-[#00a8cc] text-[#050508] font-semibold shadow-lg shadow-[#00d4ff]/30 hover:shadow-2xl hover:shadow-[#00d4ff]/50",
    outline: "bg-transparent border-2 border-white/30 text-white font-semibold hover:border-[#00d4ff]"
  }

  const fillColors = {
    primary: "from-cyan-400 via-cyan-300 to-cyan-400",
    secondary: "from-white via-[#e1f5fe] to-white",
    outline: "from-[#00d4ff] via-[#00b4d8] to-[#00d4ff]"
  }

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      disabled={disabled}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center cursor-pointer overflow-hidden transition-all duration-300 h-14 px-8 text-base rounded-full gap-3 ${variantClasses[variant]} ${className} group disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <span className={`absolute inset-0 w-0 group-hover:w-full bg-gradient-to-r ${fillColors[variant]} transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] z-[1]`} />
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-600 ease-[cubic-bezier(0.4,0,0.2,1)] delay-100 z-[1]" />
      <span className="relative z-[2] transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:-translate-x-full group-hover:opacity-0">
        {children}
      </span>
      <span className="icon absolute z-[2] opacity-0 translate-x-5 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]">
        {disabled ? <Loader2 className="w-5 h-5 animate-spin" /> : <Icon className="w-5 h-5" />}
      </span>
    </motion.button>
  )
}

// FAQ Item Component
function FAQItem({ question, answer, isOpen, onClick }: {
  question: string; answer: string; isOpen: boolean; onClick: () => void
}) {
  return (
    <motion.div 
      className="relative p-[1px] rounded-2xl bg-gradient-to-b from-white/10 via-white/5 to-transparent overflow-hidden"
      whileHover={{ scale: 1.01 }}
    >
      <div className="bg-[#0a0c14]/80 backdrop-blur-xl rounded-2xl overflow-hidden">
        <button
          onClick={onClick}
          className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-white/5 transition-colors"
        >
          <span className="text-lg font-medium text-white">{question}</span>
          <ChevronDown className={`h-5 w-5 text-[#00d4ff] shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
          <p className="px-6 pb-6 text-white/60 leading-relaxed">{answer}</p>
        </div>
      </div>
    </motion.div>
  )
}

// Pricing Content Component
function PricingContent() {
  const [loading, setLoading] = useState<string | null>(null)
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("annual")
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false)

  const searchParams = useSearchParams()

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
      setAuthLoading(false)
      if (searchParams.get("onboarding") === "complete") {
        setShowWelcomeBanner(true)
      }
    }
    checkAuth()
  }, [searchParams])

  const handleSubscribe = async (planType: "monthly" | "annual") => {
    setLoading(planType)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: 'PREMIUM', billingType: planType }),
      })

      const data = await response.json()

      if (data.error) {
        if (response.status === 401) {
          window.location.href = `/login?redirect=/pricing`
          return
        }
        alert(data.error)
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

  const features = [
    "Produits illimités",
    "Multi-établissements",
    "Alertes intelligentes (ruptures, dates, surstock)",
    "Inventaires rapides & historiques",
    "Suivi des pertes & des gaspillages",
    "Suggestions d'achat basées sur vos usages",
    "Tableau de bord temps réel (KPIs & tendances)",
    "Accès équipe + rôles & permissions",
    "Support prioritaire"
  ]

  const faqs = [
    {
      question: "Puis-je changer de plan à tout moment ?",
      answer: "Oui, vous pouvez passer du mensuel à l'annuel à tout moment. Les changements prennent effet immédiatement et sont proratisés."
    },
    {
      question: "Comment fonctionne l'essai gratuit ?",
      answer: "Vous avez 14 jours pour tester toutes les fonctionnalités Premium. Une carte bancaire est requise pour démarrer l'essai. Vous ne serez facturé qu'à la fin de l'essai si vous décidez de continuer."
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
      answer: "Non, aucun engagement. L'abonnement annuel offre simplement une réduction de 41%. Vous pouvez annuler quand vous voulez, sans frais cachés."
    }
  ]

  return (
    <div className="min-h-screen bg-[#050508] text-white overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[#00d4ff]/10 blur-[150px] rounded-full" />
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#8b5cf6]/8 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-[#00d4ff]/8 blur-[100px] rounded-full" />
      </div>

      {/* Header */}
      <PublicHeader variant="solid" />

      {/* Welcome Banner */}
      {showWelcomeBanner && (
        <div className="fixed top-[72px] left-0 right-0 z-40 bg-gradient-to-r from-[#00d4ff] to-[#00a8cc] text-[#050508] py-3 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm sm:text-base font-medium">
                Votre compte est créé ! Choisissez votre plan pour commencer.
              </p>
            </div>
            <button onClick={() => setShowWelcomeBanner(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors shrink-0">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className={`relative z-10 px-4 ${showWelcomeBanner ? 'pt-44' : 'pt-32'} pb-16`}>
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={staggerContainer}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.p variants={fadeInUp} className="text-[#00d4ff] text-sm uppercase tracking-widest mb-4">
            Tarifs
          </motion.p>
          <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl lg:text-6xl font-normal mb-6">
            <span className="text-white">Un plan simple,</span>
            <br />
            <span className="text-white/30">zéro surprise</span>
          </motion.h1>
          <motion.p variants={fadeInUp} className="text-white/60 text-lg max-w-2xl mx-auto mb-10">
            Toutes les fonctionnalités incluses. Choisissez simplement la durée qui vous convient.
          </motion.p>

          {/* Billing Toggle */}
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 p-1.5 rounded-full bg-white/5 border border-white/10">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                billingPeriod === "monthly" 
                  ? "bg-white text-[#050508]" 
                  : "text-white/60 hover:text-white"
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBillingPeriod("annual")}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                billingPeriod === "annual" 
                  ? "bg-white text-[#050508]" 
                  : "text-white/60 hover:text-white"
              }`}
            >
              Annuel
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                billingPeriod === "annual" ? "bg-emerald-500 text-white" : "bg-emerald-500/20 text-emerald-400"
              }`}>
                -41%
              </span>
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Pricing Cards */}
      <section className="relative z-10 px-4 pb-24">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
          >
            {/* Monthly Card */}
            <motion.div
              whileHover={{ scale: 1.03, y: -8 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`relative cursor-pointer ${billingPeriod === "monthly" ? "order-1" : "order-2 md:order-1"}`}
              onClick={() => setBillingPeriod("monthly")}
            >
              <div className={`relative h-full p-[1px] rounded-3xl overflow-hidden transition-all duration-300 ${
                billingPeriod === "monthly" 
                  ? "bg-gradient-to-b from-[#00d4ff]/50 via-[#00d4ff]/20 to-transparent shadow-2xl shadow-[#00d4ff]/20" 
                  : "bg-gradient-to-b from-white/20 via-white/10 to-transparent"
              }`}>
                {/* Animated border for selected */}
                {billingPeriod === "monthly" && (
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-[#00d4ff]/0 via-[#00d4ff]/50 to-[#00d4ff]/0"
                    animate={{ 
                      opacity: [0.5, 0.8, 0.5]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}

                <div className={`relative h-full backdrop-blur-xl rounded-3xl p-8 border transition-all duration-300 ${
                  billingPeriod === "monthly" 
                    ? "bg-[#0a0c14]/90 border-[#00d4ff]/30" 
                    : "bg-[#0a0c14]/70 border-white/10"
                }`}>
                  {/* Glow effect */}
                  {billingPeriod === "monthly" && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-40 bg-[#00d4ff]/20 blur-3xl rounded-full" />
                  )}

                  <div className="relative z-10">
                    <p className={`text-sm font-semibold mb-2 ${billingPeriod === "monthly" ? "text-[#00d4ff]" : "text-white/50"}`}>
                      Premium Mensuel
                    </p>
                    
                    <div className="mb-4">
                      <span className="text-5xl font-normal text-white">199€</span>
                      <span className="text-white/40 text-lg">/mois</span>
                    </div>
                    
                    <p className="text-white/50 text-sm mb-8 leading-relaxed">
                      Flexibilité maximale, sans engagement de durée.
                    </p>

                    <div className="space-y-3 mb-8">
                      {features.slice(0, 5).map((feature, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                            billingPeriod === "monthly" ? "bg-[#00d4ff]/20" : "bg-white/10"
                          }`}>
                            <Check className={`w-3 h-3 ${billingPeriod === "monthly" ? "text-[#00d4ff]" : "text-white/50"}`} />
                          </div>
                          <span className="text-white/70 text-sm">{feature}</span>
                        </div>
                      ))}
                      <p className="text-white/40 text-xs pl-8">+ {features.length - 5} autres fonctionnalités</p>
                    </div>

                    <SlideInButton 
                      variant={billingPeriod === "monthly" ? "secondary" : "outline"}
                      onClick={() => handleSubscribe("monthly")}
                      disabled={loading === "monthly" || authLoading}
                      className="w-full"
                    >
                      {loading === "monthly" ? "Chargement..." : isAuthenticated ? "Choisir ce plan" : "Essai gratuit 14 jours"}
                    </SlideInButton>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Annual Card - Featured */}
            <motion.div
              whileHover={{ scale: 1.03, y: -8 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`relative cursor-pointer ${billingPeriod === "annual" ? "order-1" : "order-1 md:order-2"}`}
              onClick={() => setBillingPeriod("annual")}
            >
              <div className={`relative h-full p-[1px] rounded-3xl overflow-hidden transition-all duration-300 ${
                billingPeriod === "annual" 
                  ? "bg-gradient-to-b from-[#00d4ff]/50 via-[#00d4ff]/20 to-transparent shadow-2xl shadow-[#00d4ff]/30" 
                  : "bg-gradient-to-b from-white/20 via-white/10 to-transparent"
              }`}>
                {/* Best value badge */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                  <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 text-white text-xs font-bold shadow-lg shadow-emerald-500/30 flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5" />
                    Meilleur rapport qualité-prix
                  </span>
                </div>

                {/* Animated border for selected */}
                {billingPeriod === "annual" && (
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-[#00d4ff]/0 via-[#00d4ff]/60 to-[#00d4ff]/0"
                    animate={{ 
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}

                <div className={`relative h-full backdrop-blur-xl rounded-3xl p-8 border transition-all duration-300 ${
                  billingPeriod === "annual" 
                    ? "bg-[#0a0c14]/90 border-[#00d4ff]/40" 
                    : "bg-[#0a0c14]/70 border-white/10"
                }`}>
                  {/* Enhanced glow effect */}
                  {billingPeriod === "annual" && (
                    <>
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-48 bg-[#00d4ff]/25 blur-3xl rounded-full" />
                      <div className="absolute inset-0 bg-gradient-to-br from-[#00d4ff]/10 via-transparent to-transparent rounded-3xl" />
                    </>
                  )}

                  <div className="relative z-10 pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <p className={`text-sm font-semibold ${billingPeriod === "annual" ? "text-[#00d4ff]" : "text-white/50"}`}>
                        Premium Annuel
                      </p>
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
                        Économisez 995€
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <span className="text-white/40 text-lg line-through mr-2">2388€</span>
                      <span className="text-5xl font-normal text-white">1393€</span>
                      <span className="text-white/40 text-lg">/an</span>
                    </div>
                    
                    <p className="text-white/50 text-sm mb-8 leading-relaxed">
                      Le meilleur rapport qualité-prix. 4 mois offerts !
                    </p>

                    <div className="space-y-3 mb-8">
                      {features.slice(0, 5).map((feature, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                            billingPeriod === "annual" ? "bg-[#00d4ff]/20" : "bg-white/10"
                          }`}>
                            <Check className={`w-3 h-3 ${billingPeriod === "annual" ? "text-[#00d4ff]" : "text-white/50"}`} />
                          </div>
                          <span className={`text-sm ${billingPeriod === "annual" ? "text-white/80" : "text-white/70"}`}>{feature}</span>
                        </div>
                      ))}
                      <p className="text-white/40 text-xs pl-8">+ {features.length - 5} autres fonctionnalités</p>
                    </div>

                    <SlideInButton 
                      variant={billingPeriod === "annual" ? "secondary" : "outline"}
                      onClick={() => handleSubscribe("annual")}
                      disabled={loading === "annual" || authLoading}
                      className="w-full"
                    >
                      {loading === "annual" ? "Chargement..." : isAuthenticated ? "Choisir ce plan" : "Essai gratuit 14 jours"}
                    </SlideInButton>

                    <p className="text-center text-white/30 text-xs mt-4">
                      14 jours d'essai gratuit • Carte bancaire requise
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Trust badges */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-6 sm:gap-10 mt-12 text-sm text-white/40"
          >
            {[
              { icon: Shield, text: "Paiement sécurisé" },
              { icon: Zap, text: "Activation instantanée" },
              { icon: Clock, text: "Annulation à tout moment" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <item.icon className="w-4 h-4 text-[#00d4ff]" />
                <span>{item.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* All Features Section */}
      <section className="relative z-10 px-4 py-20 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl font-normal mb-4">
              Tout est inclus
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-white/50">
              Un seul plan, toutes les fonctionnalités. Pas de surprise.
            </motion.p>
          </motion.div>

          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {features.map((feature, i) => (
              <motion.div 
                key={i}
                variants={fadeInUp}
                className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[#00d4ff]/30 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#00d4ff]/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-[#00d4ff]" />
                </div>
                <span className="text-white/80 text-sm">{feature}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/20 mb-6">
              <HelpCircle className="h-4 w-4 text-[#00d4ff]" />
              <span className="text-sm font-medium text-[#00d4ff]">Questions fréquentes</span>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl font-normal">
              Des questions ?
            </motion.h2>
          </motion.div>
          
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-4"
          >
            {faqs.map((faq, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <FAQItem
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openFAQ === i}
                  onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 px-4 py-20 border-t border-white/5">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl font-normal mb-6">
            Prêt à reprendre le <span className="text-[#00d4ff]">contrôle</span> ?
          </h2>
          <p className="text-xl text-white/50 mb-8">
            Commencez gratuitement pendant 14 jours. Carte bancaire requise.
          </p>
          <SlideInButton
            variant="secondary"
            onClick={() => handleSubscribe(billingPeriod)}
            disabled={loading !== null}
            className="mx-auto"
          >
            {loading !== null ? "Chargement..." : "Commencer l'essai gratuit"}
          </SlideInButton>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-4 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00d4ff] to-[#0891b2] flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold tracking-tight">STOCKGUARD</span>
          </Link>
          <p className="text-sm text-white/40">
            © {new Date().getFullYear()} StockGuard. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  )
}

// Page wrapper avec Suspense
export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#00d4ff]" />
      </div>
    }>
      <PricingContent />
    </Suspense>
  )
}
