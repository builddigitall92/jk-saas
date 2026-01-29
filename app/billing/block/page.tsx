"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Shield,
  ArrowRight,
  CreditCard,
  RefreshCw,
  XCircle,
  Clock,
  HelpCircle,
  LogOut,
  AlertTriangle,
  Package,
  Brain,
  BarChart3,
  Users,
  Bell,
  Sparkles,
  Lock,
  Check,
  Zap,
  ChevronRight,
  ShieldCheck
} from "lucide-react"
import { createClient } from "@/utils/supabase/client"

// ============================================
// TYPES
// ============================================

type BlockReason = "expired" | "payment_failed" | "canceled" | "no_subscription"

interface BlockInfo {
  reason: BlockReason
  title: string
  description: string
  icon: React.ReactNode
  accentColor: string
  glowColor: string
}

// ============================================
// ANIMATION VARIANTS
// ============================================

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, type: "spring", stiffness: 80, damping: 18 }
  })
}

const scaleIn = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 120, damping: 20 }
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.3 }
  }
}

const featureItem = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
}

// ============================================
// DATA
// ============================================

const blockReasons: Record<BlockReason, BlockInfo> = {
  expired: {
    reason: "expired",
    title: "Votre abonnement a expiré",
    description: "Votre période d'abonnement est terminée. Renouvelez pour continuer à piloter votre établissement.",
    icon: <Clock className="h-8 w-8" />,
    accentColor: "#f59e0b",
    glowColor: "rgba(245, 158, 11, 0.15)"
  },
  payment_failed: {
    reason: "payment_failed",
    title: "Échec du paiement",
    description: "Le paiement n'a pas abouti. Mettez à jour vos informations pour retrouver l'accès.",
    icon: <XCircle className="h-8 w-8" />,
    accentColor: "#ef4444",
    glowColor: "rgba(239, 68, 68, 0.15)"
  },
  canceled: {
    reason: "canceled",
    title: "Abonnement annulé",
    description: "Votre abonnement est annulé. Réactivez-le pour retrouver toutes vos données.",
    icon: <AlertTriangle className="h-8 w-8" />,
    accentColor: "#f59e0b",
    glowColor: "rgba(245, 158, 11, 0.15)"
  },
  no_subscription: {
    reason: "no_subscription",
    title: "Activez votre accès",
    description: "Choisissez un plan pour débloquer toute la puissance de StockGuard.",
    icon: <Shield className="h-8 w-8" />,
    accentColor: "#00d4ff",
    glowColor: "rgba(0, 212, 255, 0.15)"
  }
}

const lockedFeatures = [
  { icon: Package, label: "Gestion des stocks", desc: "Suivi temps réel" },
  { icon: Brain, label: "Intelligence IA", desc: "Prévisions & suggestions" },
  { icon: BarChart3, label: "Tableau de bord", desc: "KPIs & tendances" },
  { icon: Users, label: "Gestion d'équipe", desc: "Rôles & permissions" },
  { icon: Bell, label: "Alertes intelligentes", desc: "Ruptures & DLC" },
  { icon: Sparkles, label: "Rapports financiers", desc: "Pertes & bénéfices" },
]

// ============================================
// FLOATING ORB COMPONENT
// ============================================

function FloatingOrb({ color, size, x, y, delay }: {
  color: string; size: number; x: string; y: string; delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 2, ease: "easeOut" }}
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        left: x,
        top: y,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: "blur(60px)",
      }}
    >
      <motion.div
        animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
        transition={{ duration: 8 + delay, repeat: Infinity, ease: "easeInOut" }}
        className="w-full h-full"
      />
    </motion.div>
  )
}

// ============================================
// LOCKED FEATURE CARD
// ============================================

function LockedFeatureCard({ icon: Icon, label, desc, index }: {
  icon: React.ElementType; label: string; desc: string; index: number
}) {
  return (
    <motion.div
      variants={featureItem}
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative overflow-hidden rounded-2xl cursor-default"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: "radial-gradient(circle at 50% 50%, rgba(0,212,255,0.06), transparent 70%)" }}
      />

      <div className="relative p-4 flex items-center gap-4">
        <div className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, rgba(0,212,255,0.1), rgba(0,168,204,0.05))",
            border: "1px solid rgba(0,212,255,0.15)"
          }}
        >
          <Icon className="w-5 h-5 text-[#00d4ff]/70 group-hover:text-[#00d4ff] transition-colors" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">{label}</p>
          <p className="text-xs text-white/30 group-hover:text-white/50 transition-colors">{desc}</p>
        </div>
        <Lock className="w-4 h-4 text-white/15 group-hover:text-[#00d4ff]/40 transition-colors flex-shrink-0" />
      </div>
    </motion.div>
  )
}

// ============================================
// PARTICLE FIELD
// ============================================

function ParticleField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-[#00d4ff]/20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

// ============================================
// MAIN PAGE
// ============================================

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

        const status = (establishment?.subscription_status || 'none').toLowerCase()
        const plan = (establishment?.subscription_plan || 'free').toLowerCase()
        const hasStripeSubscription = !!establishment?.stripe_subscription_id

        const hasValidStatus = status === 'active' || status === 'trialing'
        const isPaidPlan = plan !== 'free' && plan !== ''
        const hasValidAccess = hasValidStatus && (isPaidPlan || hasStripeSubscription)

        if (hasValidAccess) {
          window.location.replace("/manager")
          return
        }

        if (!establishment?.subscription_status || status === "inactive" || status === "none" || !establishment?.subscription_plan || plan === "free") {
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
      const response = await fetch("/api/stripe/portal", { method: "POST" })
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        window.location.href = "/pricing"
      }
    } catch {
      window.location.href = "/pricing"
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  // ============================================
  // LOADING STATE
  // ============================================

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-[#050508] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-5"
        >
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00d4ff] to-[#0088cc] flex items-center justify-center shadow-lg shadow-[#00d4ff]/20">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <motion.div
              className="absolute -inset-2 rounded-2xl border border-[#00d4ff]/30"
              animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <div className="flex items-center gap-2">
            <motion.div className="w-1.5 h-1.5 rounded-full bg-[#00d4ff]"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
            />
            <motion.div className="w-1.5 h-1.5 rounded-full bg-[#00d4ff]"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
            />
            <motion.div className="w-1.5 h-1.5 rounded-full bg-[#00d4ff]"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
            />
          </div>
        </motion.div>
      </div>
    )
  }

  const currentBlock = blockReasons[blockReason]

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-dvh bg-[#050508] text-white overflow-hidden relative">
      {/* ========== BACKGROUND ========== */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:80px_80px]" />
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#050508_70%)]" />
        {/* Orbs */}
        <FloatingOrb color={currentBlock.glowColor} size={700} x="10%" y="-10%" delay={0} />
        <FloatingOrb color="rgba(0,212,255,0.08)" size={500} x="70%" y="60%" delay={0.5} />
        <FloatingOrb color="rgba(139,92,246,0.06)" size={400} x="-5%" y="70%" delay={1} />
        {/* Particles */}
        <ParticleField />
      </div>

      {/* ========== HEADER ========== */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: "linear-gradient(180deg, rgba(5,5,8,0.95) 0%, rgba(5,5,8,0.8) 100%)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.04)"
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0088cc] flex items-center justify-center shadow-lg shadow-[#00d4ff]/20 group-hover:shadow-[#00d4ff]/40 transition-shadow">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white/90 group-hover:text-white transition-colors">
                StockGuard
              </span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </motion.header>

      {/* ========== MAIN CONTENT ========== */}
      <main className="relative z-10 min-h-dvh flex items-center justify-center px-4 pt-24 pb-12">
        <div className="max-w-5xl w-full">
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-center">

            {/* ========== LEFT: STATUS & CTA (3 cols) ========== */}
            <div className="lg:col-span-3 space-y-8">

              {/* Status badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
              >
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide uppercase"
                  style={{
                    background: `linear-gradient(135deg, ${currentBlock.glowColor}, transparent)`,
                    border: `1px solid ${currentBlock.accentColor}30`,
                    color: currentBlock.accentColor,
                  }}
                >
                  <span className="relative flex h-2 w-2">
                    <span
                      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                      style={{ background: currentBlock.accentColor }}
                    />
                    <span
                      className="relative inline-flex rounded-full h-2 w-2"
                      style={{ background: currentBlock.accentColor }}
                    />
                  </span>
                  {blockReason === "no_subscription" ? "Accès limité" : "Action requise"}
                </div>
              </motion.div>

              {/* Icon + Title */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 80 }}
                className="space-y-4"
              >
                <div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${currentBlock.accentColor}20, ${currentBlock.accentColor}05)`,
                    border: `1px solid ${currentBlock.accentColor}25`,
                    color: currentBlock.accentColor,
                  }}
                >
                  {currentBlock.icon}
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold leading-[1.1] tracking-tight">
                  {currentBlock.title.split(' ').map((word, i, arr) => (
                    i === arr.length - 1 ? (
                      <span key={i}>
                        <br className="hidden sm:block" />
                        <span style={{ color: currentBlock.accentColor }}>{word}</span>
                      </span>
                    ) : (
                      <span key={i}>{word} </span>
                    )
                  ))}
                </h1>

                <p className="text-lg sm:text-xl text-white/45 leading-relaxed max-w-md">
                  {currentBlock.description}
                </p>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 80 }}
                className="space-y-4"
              >
                {blockReason === "payment_failed" ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleManageSubscription}
                      disabled={loading}
                      className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 h-14 px-10 text-base font-semibold rounded-2xl overflow-hidden transition-all duration-300"
                      style={{
                        background: "linear-gradient(135deg, #00d4ff, #0088cc)",
                        boxShadow: "0 0 40px rgba(0,212,255,0.25), 0 4px 20px rgba(0,0,0,0.3)",
                        color: "#050508",
                      }}
                    >
                      <span className="absolute inset-0 w-0 group-hover:w-full bg-gradient-to-r from-white/30 via-white/10 to-white/30 transition-all duration-500" />
                      <span className="relative flex items-center gap-3">
                        {loading ? (
                          <RefreshCw className="h-5 w-5 animate-spin" />
                        ) : (
                          <CreditCard className="h-5 w-5" />
                        )}
                        Mettre à jour le paiement
                      </span>
                    </motion.button>
                    <p className="text-sm text-white/30 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      Paiement sécurisé via Stripe
                    </p>
                  </>
                ) : blockReason === "canceled" || blockReason === "expired" ? (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleManageSubscription}
                      disabled={loading}
                      className="group relative inline-flex items-center justify-center gap-3 h-14 px-10 text-base font-semibold rounded-2xl overflow-hidden transition-all duration-300"
                      style={{
                        background: "linear-gradient(135deg, #00d4ff, #0088cc)",
                        boxShadow: "0 0 40px rgba(0,212,255,0.25), 0 4px 20px rgba(0,0,0,0.3)",
                        color: "#050508",
                      }}
                    >
                      <span className="absolute inset-0 w-0 group-hover:w-full bg-gradient-to-r from-white/30 via-white/10 to-white/30 transition-all duration-500" />
                      <span className="relative flex items-center gap-3">
                        {loading ? (
                          <RefreshCw className="h-5 w-5 animate-spin" />
                        ) : (
                          <Zap className="h-5 w-5" />
                        )}
                        Réactiver
                      </span>
                    </motion.button>
                    <Link href="/pricing">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-flex items-center justify-center gap-2 h-14 px-8 text-base font-semibold rounded-2xl border border-white/10 text-white/70 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all duration-300"
                      >
                        Voir les plans
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </Link>
                  </div>
                ) : (
                  <>
                    <Link href="/pricing">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 h-14 px-10 text-base font-semibold rounded-2xl overflow-hidden transition-all duration-300"
                        style={{
                          background: "linear-gradient(135deg, #00d4ff, #0088cc)",
                          boxShadow: "0 0 40px rgba(0,212,255,0.25), 0 4px 20px rgba(0,0,0,0.3)",
                          color: "#050508",
                        }}
                      >
                        <span className="absolute inset-0 w-0 group-hover:w-full bg-gradient-to-r from-white/30 via-white/10 to-white/30 transition-all duration-500" />
                        <span className="relative flex items-center gap-3">
                          <Sparkles className="h-5 w-5" />
                          Choisir un plan
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </motion.button>
                    </Link>
                    <p className="text-sm text-white/30 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      14 jours d&apos;essai gratuit &bull; Sans engagement
                    </p>
                  </>
                )}
              </motion.div>

              {/* Security banner */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, type: "spring", stiffness: 80 }}
                className="flex items-start gap-4 p-5 rounded-2xl"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/80 mb-1">Vos données sont en sécurité</p>
                  <p className="text-xs text-white/35 leading-relaxed">
                    Toutes vos données sont préservées. Réabonnez-vous pour retrouver votre historique complet, vos recettes et votre équipe.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* ========== RIGHT: LOCKED FEATURES (2 cols) ========== */}
            <motion.div
              className="lg:col-span-2"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <div className="relative">
                {/* Card glow */}
                <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />

                <div
                  className="relative rounded-3xl p-6 sm:p-8 space-y-5"
                  style={{
                    background: "linear-gradient(170deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    backdropFilter: "blur(20px)",
                  }}
                >
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center">
                      <Lock className="w-4 h-4 text-[#00d4ff]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white/90">Fonctionnalités verrouillées</h3>
                      <p className="text-[11px] text-white/30">Débloquez tout avec un abonnement</p>
                    </div>
                  </div>

                  {/* Feature list */}
                  <div className="space-y-2.5">
                    {lockedFeatures.map((feature, i) => (
                      <LockedFeatureCard
                        key={i}
                        icon={feature.icon}
                        label={feature.label}
                        desc={feature.desc}
                        index={i}
                      />
                    ))}
                  </div>

                  {/* Bottom stats */}
                  <motion.div
                    variants={featureItem}
                    className="pt-4 mt-4"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-xl font-bold text-[#00d4ff]">9+</p>
                        <p className="text-[10px] text-white/30 mt-0.5">Fonctionnalités</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-emerald-400">24/7</p>
                        <p className="text-[10px] text-white/30 mt-0.5">Temps réel</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-purple-400">IA</p>
                        <p className="text-[10px] text-white/30 mt-0.5">Intégrée</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ========== HELP LINK ========== */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center mt-12"
          >
            <a
              href="mailto:support@stockguard.fr"
              className="inline-flex items-center gap-2 text-sm text-white/25 hover:text-white/50 transition-colors"
            >
              <HelpCircle className="h-4 w-4" />
              Besoin d&apos;aide ? Contactez le support
            </a>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
