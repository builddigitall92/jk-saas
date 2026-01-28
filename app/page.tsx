"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion"
import { 
  Shield, 
  Menu, 
  X, 
  ArrowRight, 
  Check, 
  Brain, 
  Calculator, 
  FileText, 
  TrendingUp,
  Star,
  ChevronRight,
  Package,
  AlertTriangle,
  BarChart3,
  Zap,
  Clock,
  Users,
  Sparkles,
  Play,
  CheckCircle,
  ShoppingCart,
  Receipt,
  PieChart,
  Bell,
  Settings,
  Eye,
  Target,
  Rocket,
  ChevronDown,
  ArrowUpRight,
  Layers,
  LineChart,
  RefreshCw,
  ShieldCheck,
  Timer,
  BadgeCheck,
  Gem,
  Crown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { PublicHeader } from "@/components/public-header"

// ============================================
// ANIMATION VARIANTS
// ============================================

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 }
  }
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { type: "spring", stiffness: 200, damping: 25 }
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.08, type: "spring", stiffness: 100, damping: 20 }
  }
}

const scaleIn = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { type: "spring", stiffness: 150, damping: 20 }
  }
}

const slideInLeft = {
  hidden: { x: -50, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 20 } }
}

const slideInRight = {
  hidden: { x: 50, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 20 } }
}

// ============================================
// COMPONENTS
// ============================================

// Animated Counter
function Counter({ value, suffix = "", duration = 2 }: { value: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const end = value
    const totalFrames = 60
    const counter = setInterval(() => {
      start += end / totalFrames
      if (start >= end) {
        setCount(end)
        clearInterval(counter)
      } else {
        setCount(Math.floor(start))
      }
    }, duration * 1000 / totalFrames)
    return () => clearInterval(counter)
  }, [isInView, value, duration])

  return <span ref={ref}>{count.toLocaleString('fr-FR')}{suffix}</span>
}

// Slide-In Button Component (CTA avec effet de vague)
function SlideInButton({
  children,
  icon: Icon = ArrowRight,
  className = "",
  variant = "primary",
  size = "default"
}: {
  children: React.ReactNode
  icon?: React.ElementType
  className?: string
  variant?: "primary" | "secondary" | "outline" | "purple"
  size?: "default" | "large" | "small"
}) {
  const baseClasses = "slide-in-button relative inline-flex items-center justify-center cursor-pointer overflow-hidden transition-all duration-300"

  const sizeClasses = {
    small: "h-11 px-6 text-sm rounded-lg gap-3",
    default: "h-12 sm:h-14 px-8 sm:px-10 text-base sm:text-lg rounded-xl gap-3",
    large: "h-14 sm:h-16 px-10 sm:px-12 text-lg sm:text-xl rounded-2xl gap-4"
  }

  const variantClasses = {
    primary: "bg-white text-[#050508] font-semibold shadow-lg shadow-white/20 hover:shadow-2xl hover:shadow-cyan-400/40",
    secondary: "bg-gradient-to-r from-[#00d4ff] to-[#00a8cc] text-[#050508] font-semibold shadow-lg shadow-[#00d4ff]/30 hover:shadow-2xl hover:shadow-[#00d4ff]/50",
    outline: "bg-transparent border-2 border-white/30 text-white font-semibold hover:border-[#00d4ff]",
    purple: "bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white font-semibold shadow-lg shadow-[#8b5cf6]/30 hover:shadow-2xl hover:shadow-[#8b5cf6]/50"
  }

  const fillColors = {
    primary: "from-cyan-400 via-cyan-300 to-cyan-400",
    secondary: "from-white via-[#e1f5fe] to-white",
    outline: "from-[#00d4ff] via-[#00b4d8] to-[#00d4ff]",
    purple: "from-[#a78bfa] via-[#c4b5fd] to-[#a78bfa]"
  }

  const textHoverColor = {
    primary: "group-hover:text-[#050508]",
    secondary: "group-hover:text-[#050508]",
    outline: "group-hover:text-[#050508]",
    purple: "group-hover:text-[#050508]"
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className} group`}
    >
      {/* Fond de remplissage qui slide de gauche à droite */}
      <span
        className={`absolute inset-0 w-0 group-hover:w-full bg-gradient-to-r ${fillColors[variant]} transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] z-[1]`}
      />

      {/* Vague brillante qui traverse */}
      <span
        className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-600 ease-[cubic-bezier(0.4,0,0.2,1)] delay-100 z-[1]"
      />

      {/* Texte qui slide vers la gauche */}
      <span className={`button-text relative z-[2] transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:-translate-x-full group-hover:opacity-0 ${textHoverColor[variant]}`}>
        {children}
      </span>

      {/* Icône qui apparaît depuis la droite */}
      <span className={`icon absolute z-[2] opacity-0 translate-x-5 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] ${textHoverColor[variant]}`}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
      </span>
    </motion.button>
  )
}

// Glass Card Component
function GlassCard({ children, className = "", hover = true }: { children: React.ReactNode; className?: string; hover?: boolean }) {
  return (
    <motion.div
      whileHover={hover ? { y: -8, scale: 1.02 } : {}}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`
        relative overflow-hidden
        bg-white/[0.03] backdrop-blur-xl
        border border-white/[0.08]
        rounded-2xl
        shadow-[0_8px_32px_rgba(0,0,0,0.12)]
        ${hover ? 'hover:bg-white/[0.06] hover:border-white/[0.15] hover:shadow-[0_20px_50px_rgba(0,212,255,0.1)]' : ''}
        transition-all duration-300
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}

// Pipeline Progress Component
function PipelineProgress() {
  const steps = [
    { icon: Package, label: "Stock", status: "complete", xp: "+50 XP" },
    { icon: Brain, label: "Prévision", status: "complete", xp: "+75 XP" },
    { icon: ShoppingCart, label: "Commande", status: "current", xp: "+100 XP" },
    { icon: Bell, label: "Alertes", status: "pending", xp: "+25 XP" }
  ]

  return (
    <div className="relative">
      {/* Progress Line */}
      <div className="absolute top-6 left-0 right-0 h-0.5 bg-white/10 hidden sm:block" />
      <motion.div 
        initial={{ width: 0 }}
        whileInView={{ width: "62%" }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
        className="absolute top-6 left-0 h-0.5 bg-gradient-to-r from-[#00d4ff] to-[#00d4ff]/50 hidden sm:block"
      />

      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + i * 0.15 }}
            className="flex sm:flex-col items-center gap-3 sm:gap-2 text-center"
          >
            <div className={`
              relative z-10 w-12 h-12 rounded-xl flex items-center justify-center
              ${step.status === 'complete' ? 'bg-[#00d4ff]/20 border-[#00d4ff]/50' : 
                step.status === 'current' ? 'bg-[#00d4ff]/30 border-[#00d4ff] animate-pulse' : 
                'bg-white/5 border-white/10'}
              border backdrop-blur-sm
            `}>
              <step.icon className={`w-5 h-5 ${step.status === 'pending' ? 'text-white/40' : 'text-[#00d4ff]'}`} />
              {step.status === 'complete' && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </div>
            <div className="text-left sm:text-center">
              <p className={`text-sm font-semibold ${step.status === 'pending' ? 'text-white/40' : 'text-white'}`}>
                {step.label}
              </p>
              <p className={`text-xs ${step.status === 'complete' ? 'text-emerald-400' : step.status === 'current' ? 'text-[#00d4ff]' : 'text-white/30'}`}>
                {step.xp}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Feature Tabs Component
function FeatureTabs() {
  const [activeTab, setActiveTab] = useState(0)
  
  const tabs = [
    {
      id: "inventaire",
      label: "Inventaire",
      icon: Package,
      title: "Suivi en Temps Réel",
      description: "Visualisez chaque produit, chaque mouvement, chaque alerte. Fini les surprises en cuisine.",
      features: ["Scan code-barres", "Alertes DLC automatiques", "Catégorisation intelligente", "Historique complet"],
      color: "#00d4ff"
    },
    {
      id: "previsions",
      label: "Prévisions IA",
      icon: Brain,
      title: "L'IA qui Anticipe",
      description: "Notre algorithme analyse vos ventes, la météo, les événements pour prédire vos besoins.",
      features: ["Prévisions 7 jours", "Saisonnalité intégrée", "Suggestions commandes", "Réduction pertes 30%"],
      color: "#8b5cf6"
    },
    {
      id: "rapports",
      label: "Rapports",
      icon: BarChart3,
      title: "Insights Actionnables",
      description: "Dashboards clairs, exports automatisés, KPIs personnalisables pour piloter votre marge.",
      features: ["Tableaux de bord live", "Export PDF/Excel", "Comparaison périodes", "Alertes personnalisées"],
      color: "#10b981"
    },
    {
      id: "pipeline",
      label: "Pipeline",
      icon: Layers,
      title: "Workflow Gamifié",
      description: "Transformez la gestion en jeu : débloquez des badges, suivez votre progression, motivez l'équipe.",
      features: ["Système XP", "Badges débloquables", "Classement équipe", "Défis quotidiens"],
      color: "#f59e0b"
    }
  ]

  const currentTab = tabs[activeTab]

  return (
    <div className="space-y-8">
      {/* Tab Buttons */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
        {tabs.map((tab, i) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(i)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              relative px-4 sm:px-6 py-3 rounded-xl font-normal text-sm
              transition-all duration-300 flex items-center gap-2
              ${activeTab === i 
                ? 'bg-white/10 border-white/20 text-white shadow-lg shadow-[#00d4ff]/10' 
                : 'bg-white/[0.03] border-white/[0.05] text-white/60 hover:text-white hover:bg-white/[0.06]'}
              border backdrop-blur-md
            `}
          >
            <tab.icon className="w-4 h-4" style={{ color: activeTab === i ? tab.color : 'currentColor' }} />
            <span className="hidden sm:inline">{tab.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <GlassCard className="p-6 sm:p-10" hover={false}>
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div 
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: `${currentTab.color}15`, color: currentTab.color }}
                >
                  <currentTab.icon className="w-3.5 h-3.5" />
                  {currentTab.label}
                </div>
                
                <h3 className="text-2xl sm:text-3xl font-normal text-white">
                  {currentTab.title}
                </h3>
                
                <p className="text-white/60 font-normal leading-relaxed">
                  {currentTab.description}
                </p>

                <ul className="space-y-3">
                  {currentTab.features.map((feature, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3 text-white/80 font-normal"
                    >
                      <div 
                        className="w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${currentTab.color}20` }}
                      >
                        <Check className="w-3 h-3" style={{ color: currentTab.color }} />
                      </div>
                      {feature}
                    </motion.li>
                  ))}
                </ul>

                <Link href="/login">
                  <SlideInButton variant="outline" size="small" icon={ArrowRight} className="variant-outline mt-4">
                    Découvrir
                  </SlideInButton>
                </Link>
              </div>

              {/* Visual Mockup */}
              <div className="relative">
                <div 
                  className="absolute inset-0 blur-[60px] opacity-30 rounded-full"
                  style={{ backgroundColor: currentTab.color }}
                />
                <div className="relative bg-[#0a0a0f]/80 backdrop-blur-xl rounded-2xl border border-white/10 p-4 sm:p-6">
                  {activeTab === 0 && <InventoryMockup />}
                  {activeTab === 1 && <PredictionMockup />}
                  {activeTab === 2 && <ReportsMockup />}
                  {activeTab === 3 && <PipelineMockup />}
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// Mini Mockups for Tabs
function InventoryMockup() {
  const items = [
    { name: "Tomates fraîches", qty: "12 kg", status: "ok" },
    { name: "Mozzarella", qty: "3 kg", status: "low" },
    { name: "Basilic", qty: "0.5 kg", status: "critical" },
    { name: "Farine T55", qty: "25 kg", status: "ok" }
  ]
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <span className="text-white/80 text-sm font-normal">Stock actuel</span>
        <span className="text-xs text-white/40">Mis à jour il y a 2 min</span>
      </div>
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5"
        >
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${
              item.status === 'ok' ? 'bg-emerald-400' : 
              item.status === 'low' ? 'bg-amber-400' : 'bg-red-400'
            }`} />
            <span className="text-white/80 text-sm font-normal">{item.name}</span>
          </div>
          <span className="text-white/60 text-sm">{item.qty}</span>
        </motion.div>
      ))}
    </div>
  )
}

function PredictionMockup() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/80 text-sm font-normal">Prévisions 7 jours</span>
        <span className="text-xs text-[#8b5cf6]">IA Active</span>
      </div>
      <div className="flex items-end gap-1.5 h-32">
        {[45, 60, 55, 80, 70, 90, 75].map((h, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${h}%` }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="flex-1 bg-gradient-to-t from-[#8b5cf6]/60 to-[#8b5cf6]/20 rounded-t-lg"
          />
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-white/40">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="p-3 rounded-lg bg-[#8b5cf6]/10 border border-[#8b5cf6]/20">
        <p className="text-[#8b5cf6] text-xs">💡 Pic prévu samedi : +40% commandes</p>
      </div>
    </div>
  )
}

function ReportsMockup() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "CA Mois", value: "24,850€", change: "+12%" },
          { label: "Marge", value: "68%", change: "+5pts" },
          { label: "Pertes", value: "2.1%", change: "-0.8%" },
          { label: "Rotation", value: "4.2j", change: "-0.5j" }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="p-3 rounded-lg bg-white/5 border border-white/5"
          >
            <p className="text-white/40 text-[10px] uppercase tracking-wider">{stat.label}</p>
            <p className="text-white font-semibold mt-1">{stat.value}</p>
            <p className="text-emerald-400 text-xs">{stat.change}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function PipelineMockup() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-white/80 text-sm font-normal">Votre progression</span>
        <span className="text-[#f59e0b] text-xs font-semibold">Level 12</span>
      </div>
      
      <div className="p-4 rounded-xl bg-gradient-to-r from-[#f59e0b]/10 to-transparent border border-[#f59e0b]/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-[#f59e0b]/20 flex items-center justify-center">
            <Crown className="w-5 h-5 text-[#f59e0b]" />
          </div>
          <div>
            <p className="text-white text-sm font-semibold">Stock Master</p>
            <p className="text-white/50 text-xs">2,450 / 3,000 XP</p>
          </div>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "82%" }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-full bg-gradient-to-r from-[#f59e0b] to-[#f59e0b]/60 rounded-full"
          />
        </div>
      </div>

      <div className="flex gap-2">
        {['🏆', '⭐', '🎯', '🔥'].map((badge, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 + i * 0.1, type: "spring" }}
            className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-lg"
          >
            {badge}
          </motion.div>
        ))}
        <div className="w-10 h-10 rounded-lg bg-white/5 border border-dashed border-white/20 flex items-center justify-center text-white/30">
          ?
        </div>
      </div>
    </div>
  )
}

// Testimonial Carousel
function TestimonialCard({ testimonial, isActive }: { testimonial: any; isActive: boolean }) {
  return (
    <GlassCard className={`p-6 sm:p-8 transition-all duration-500 ${isActive ? 'opacity-100 scale-100' : 'opacity-50 scale-95'}`} hover={false}>
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-4 h-4 text-[#f59e0b] fill-[#f59e0b]" />
        ))}
      </div>
      <p className="text-white/80 font-normal leading-relaxed mb-6 italic">
        "{testimonial.quote}"
      </p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00d4ff] to-[#8b5cf6] flex items-center justify-center text-white font-semibold text-sm">
          {testimonial.avatar}
        </div>
        <div>
          <p className="text-white font-semibold text-sm">{testimonial.name}</p>
          <p className="text-white/50 text-xs">{testimonial.role}</p>
        </div>
      </div>
    </GlassCard>
  )
}

// Logo Ticker
function LogoTicker() {
  const logos = ["Metro", "Sysco", "Brake", "Promocash", "Transgourmet", "Pomona"]
  
  return (
    <div className="relative overflow-hidden py-6">
      <div className="flex animate-scroll gap-12">
        {[...logos, ...logos].map((logo, i) => (
          <div key={i} className="flex items-center gap-2 text-white/30 hover:text-white/50 transition-colors whitespace-nowrap">
            <div className="w-6 h-6 rounded bg-white/10" />
            <span className="font-normal text-sm">{logo}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// FAQ ITEM COMPONENT
// ============================================
function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group"
    >
      <div className="relative overflow-hidden
        bg-white/[0.03] backdrop-blur-xl
        border border-white/[0.08]
        rounded-2xl
        shadow-[0_8px_32px_rgba(0,0,0,0.12)]
        transition-all duration-300
        hover:bg-white/[0.05] hover:border-white/[0.12]"
      >
        {/* Subtle glow on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#00d4ff]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-6 sm:px-8 py-6 flex items-center justify-between gap-4 text-left relative z-10"
        >
          <span className="text-white font-semibold text-base sm:text-lg pr-8">
            {question}
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex-shrink-0"
          >
            <ChevronDown className="w-5 h-5 text-white/50" />
          </motion.div>
        </button>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="px-6 sm:px-8 pb-6 pt-0 border-t border-white/[0.05] relative z-10">
                <p className="text-white/60 font-normal leading-relaxed text-sm sm:text-base pt-4">
                  {answer}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function LandingPage() {
  // Mobile menu state moved to PublicHeader component
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("annual")
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0])

  const testimonials = [
    { quote: "On a divisé par deux le temps d’inventaire. Tout est clair, rapide, et l’équipe est autonome dès le premier jour.", name: "Marie Laurent", role: "Propriétaire, Le Comptoir", avatar: "ML" },
    { quote: "Plus de surprises en plein service : alertes utiles, visibilité sur les niveaux, et des décisions d’achat beaucoup plus simples.", name: "Thomas Dubois", role: "Chef, Bistrot Moderne", avatar: "TD" },
    { quote: "Prise en main immédiate. En 10 minutes, tout le monde savait quoi faire — et on a réduit le gaspillage dès la première semaine.", name: "Sophie Martin", role: "Directrice, Café Central", avatar: "SM" }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const price = billingPeriod === "monthly" ? 199 : 1393

  return (
    <div className="min-h-screen bg-[#050508] text-white overflow-x-hidden font-normal">
      {/* Background Gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a12] via-[#050508] to-[#050508]" />
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-[#0f3460]/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#00d4ff]/5 rounded-full blur-[120px]" />
      </div>

      {/* Navigation - Header intelligent avec détection d'auth */}
      <PublicHeader variant="transparent" />

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-[100dvh] flex items-center pt-24 pb-16 px-4 overflow-hidden">
        <motion.div style={{ opacity: heroOpacity }} className="w-full">
          <div className="max-w-7xl mx-auto">
            <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="text-center max-w-4xl mx-auto">
              
              {/* Title */}
              <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal leading-[1.1] mb-6 tracking-tight">
                Rentabilisez chaque produit
                <br />
                <span className="bg-gradient-to-r from-[#00d4ff] via-[#e1f5fe] to-[#00d4ff] bg-clip-text text-transparent italic text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold inline-block leading-tight" style={{ fontFamily: "var(--font-editors-note)", letterSpacing: "-0.02em" }}>
                  de votre stock
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p variants={fadeInUp} className="text-base sm:text-lg md:text-xl text-white/60 font-normal max-w-2xl mx-auto mb-10 leading-relaxed">
                Suivi temps réel, prévisions IA, 0 perte. Boostez vos marges et simplifiez votre gestion avec notre plateforme tout-en-un.
              </motion.p>

              {/* CTAs */}
              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                {/* Bouton Essai Gratuit */}
                <Link href="/login">
                  <SlideInButton variant="primary" icon={ArrowRight} className="variant-primary">
                    Essai Gratuit 14 jours
                  </SlideInButton>
                </Link>

                {/* Bouton Contactez-nous */}
                <Link href="/contact">
                  <SlideInButton variant="outline" icon={ArrowRight} className="variant-outline">
                    Contactez-nous
                  </SlideInButton>
                </Link>
              </motion.div>

              {/* Trust Badges */}
              <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-6 sm:gap-10 text-sm text-white/50 font-normal">
                {[
                  { icon: Zap, text: "4-6 semaines déploiement" },
                  { icon: Eye, text: "Tarifs transparents" },
                  { icon: ShieldCheck, text: "Satisfait ou remboursé" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 group">
                    <div className="relative">
                      {/* Glow effect */}
                      <div className="absolute inset-0 bg-emerald-400 blur-md opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                      <item.icon className="relative w-4 h-4 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)] group-hover:drop-shadow-[0_0_12px_rgba(16,185,129,1)] transition-all duration-300" />
                    </div>
                    <span>{item.text}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-16 sm:mt-24 relative max-w-5xl mx-auto"
            >
              {/* Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#00d4ff]/20 via-[#8b5cf6]/10 to-[#00d4ff]/20 blur-[80px] rounded-full scale-110" />
              
              {/* Dashboard Preview */}
              <GlassCard className="p-1 sm:p-2" hover={false}>
                <div className="bg-[#0a0a0f] rounded-xl overflow-hidden">
                  {/* Browser Bar */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-[#0f0f14] border-b border-white/5">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                      <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                      <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="max-w-xs mx-auto bg-white/5 rounded-md px-3 py-1 text-xs text-white/40 text-center">
                        stockguard.digital
                      </div>
                    </div>
                  </div>
                  
                  {/* Dashboard Content */}
                  <div className="p-4 sm:p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-semibold">Tableau de bord</h3>
                        <p className="text-white/40 text-sm">Janvier 2026</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-emerald-400 text-xs">Sync</span>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      {[
                        { label: "Valeur Stock", value: "24,850€", change: "+12%", color: "emerald" },
                        { label: "Alertes", value: "3", change: "actives", color: "amber" },
                        { label: "Marge Moy.", value: "68%", change: "+5pts", color: "blue" },
                        { label: "Économies", value: "2,340€", change: "ce mois", color: "purple" }
                      ].map((stat, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8 + i * 0.1 }}
                          className="p-4 rounded-xl bg-white/[0.03] border border-white/5"
                        >
                          <p className="text-white/40 text-xs uppercase tracking-wider">{stat.label}</p>
                          <p className="text-white text-xl sm:text-2xl font-normal mt-1">{stat.value}</p>
                          <p className={`text-xs mt-1 ${
                            stat.color === 'emerald' ? 'text-emerald-400' : 
                            stat.color === 'amber' ? 'text-amber-400' : 
                            stat.color === 'blue' ? 'text-[#00d4ff]' : 'text-purple-400'
                          }`}>{stat.change}</p>
                        </motion.div>
                      ))}
                    </div>

                    {/* Chart Area */}
                    <div className="grid lg:grid-cols-3 gap-4">
                      <div className="lg:col-span-2 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <p className="text-white/60 text-sm mb-4">Évolution du stock</p>
                        <div className="flex items-end gap-1 h-24 sm:h-32">
                          {[35, 45, 30, 60, 45, 70, 55, 80, 65, 90, 75, 100].map((h, i) => (
                            <motion.div
                              key={i}
                              initial={{ height: 0 }}
                              animate={{ height: `${h}%` }}
                              transition={{ delay: 1 + i * 0.05, duration: 0.5 }}
                              className="flex-1 bg-gradient-to-t from-[#00d4ff]/60 to-[#00d4ff]/20 rounded-t"
                            />
                          ))}
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <p className="text-white/60 text-sm mb-4">Pipeline</p>
                        <PipelineProgress />
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Why Choose Section */}
      <section id="fonctionnalités" className="py-24 sm:py-32 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-16">
            <motion.p variants={fadeInUp} className="text-[#00d4ff] text-sm uppercase tracking-widest mb-4 font-normal">
              Pourquoi StockGuard
            </motion.p>
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl lg:text-5xl font-normal mb-4">
              Libérez le Potentiel de <span className="italic font-normal text-[#00d4ff]">Votre Restaurant</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-white/60 font-normal max-w-2xl mx-auto">
              Notre solution SaaS vous donne les outils et insights nécessaires pour piloter votre croissance et votre efficacité.
            </motion.p>
          </motion.div>

          {/* Features Grid */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
            {[
              { icon: Layers, title: "Intégration Fluide", desc: "Connectez-vous à vos systèmes existants (POS, comptabilité) sans friction." },
              { icon: Zap, title: "Productivité Décuplée", desc: "Automatisez les tâches répétitives et concentrez-vous sur l'essentiel : votre cuisine." },
              { icon: Users, title: "Support Premium", desc: "Une équipe dédiée disponible 24/7 pour résoudre vos problèmes rapidement." }
            ].map((feature, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <GlassCard className="p-6 sm:p-8 h-full">
                  <div className="w-12 h-12 rounded-xl bg-[#00d4ff]/10 flex items-center justify-center mb-6">
                    <feature.icon className="w-6 h-6 text-[#00d4ff]" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-white/60 font-normal leading-relaxed text-sm">{feature.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>

          {/* Feature Tabs */}
          <FeatureTabs />
        </div>
      </section>

      {/* Pricing Section */}
      <section id="tarifs" className="py-24 sm:py-32 px-4 relative z-10 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[#00d4ff]/15 blur-[150px] rounded-full" />
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-[#8b5cf6]/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-[#00d4ff]/10 blur-[100px] rounded-full" />
        </div>

        <div className="max-w-5xl mx-auto relative">
          {/* Header */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-16">
            <motion.p variants={fadeInUp} className="text-[#00d4ff] text-sm uppercase tracking-widest mb-4 font-normal">
              Tarifs
            </motion.p>
            <motion.h2 variants={fadeInUp} className="text-4xl sm:text-5xl lg:text-6xl font-normal mb-4">
              <span className="text-white/30">Pricing</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-white/60 font-normal max-w-xl mx-auto">
              Un seul plan Premium, toutes les fonctionnalités incluses
            </motion.p>
          </motion.div>

          {/* Pricing Cards Container - 3 cards */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
          >
            {/* Premium Mensuel */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: "spring", stiffness: 100, damping: 20 }}
              whileHover={{ scale: 1.05, y: -12 }}
              className="w-full cursor-pointer"
              style={{ willChange: "transform" }}
            >
              <motion.div 
                className="relative h-full p-[1px] rounded-3xl bg-gradient-to-b from-white/25 via-white/10 to-transparent overflow-hidden"
                whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 212, 255, 0.25)" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {/* Glass card inner */}
                <motion.div 
                  className="relative h-full bg-[#0a0c14]/80 backdrop-blur-xl rounded-3xl p-8 border border-white/[0.1]"
                  whileHover={{ borderColor: "rgba(0, 212, 255, 0.4)", backgroundColor: "rgba(10, 12, 20, 0.9)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  {/* Enhanced cyan glow on hover */}
                  <motion.div 
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-[#00d4ff]/20 blur-3xl rounded-full"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                  {/* Shimmer effect */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                  />
                  
                  <div className="relative z-10">
                    {/* Plan name */}
                    <p className="text-[#00d4ff] text-sm font-semibold mb-2">Premium</p>
                    
                    {/* Price */}
                    <div className="mb-4">
                      <span className="text-5xl font-normal text-white">199€</span>
                      <span className="text-white/40 text-lg font-normal">/mois</span>
                    </div>
                    
                    {/* Description */}
                    <p className="text-white/40 text-sm font-normal mb-8 leading-relaxed">
                      Le plan complet pour reprendre le contrôle du stock, réduire le gaspillage et protéger vos marges.
                    </p>
                    
                    {/* Features */}
                    <div className="space-y-4 mb-8">
                      {[
                        "Produits illimités",
                        "Multi-établissements",
                        "Alertes intelligentes (ruptures, dates, surstock)",
                        "Inventaires rapides & historiques",
                        "Suivi des pertes & des gaspillages",
                        "Suggestions d'achat basées sur vos usages",
                        "Tableau de bord temps réel (KPIs & tendances)",
                        "Accès équipe + rôles & permissions"
                      ].map((feature, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-white/70" />
                          </div>
                          <span className="text-white/70 text-sm font-normal">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* CTA Button */}
                    <Link href="/login" className="block">
                      <SlideInButton variant="outline" icon={ArrowRight} className="variant-outline w-full rounded-full">
                        Choisir ce plan
                      </SlideInButton>
                    </Link>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Premium Annuel - Featured */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, type: "spring", stiffness: 100, damping: 20 }}
              whileHover={{ scale: 1.05, y: -12 }}
              className="w-full cursor-pointer"
              style={{ willChange: "transform" }}
            >
              <motion.div 
                className="relative h-full p-[1px] rounded-3xl bg-gradient-to-b from-[#00d4ff]/50 via-[#00d4ff]/20 to-transparent overflow-hidden shadow-2xl shadow-[#00d4ff]/20"
                whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 212, 255, 0.4)" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {/* Enhanced animated border glow */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-[#00d4ff]/0 via-[#00d4ff]/50 to-[#00d4ff]/0"
                  animate={{ 
                    background: [
                      "linear-gradient(to right, rgba(0, 212, 255, 0), rgba(0, 212, 255, 0.5), rgba(0, 212, 255, 0))",
                      "linear-gradient(to right, rgba(0, 212, 255, 0), rgba(0, 212, 255, 0.7), rgba(0, 212, 255, 0))",
                      "linear-gradient(to right, rgba(0, 212, 255, 0), rgba(0, 212, 255, 0.5), rgba(0, 212, 255, 0))"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                
                {/* Glass card inner */}
                <motion.div 
                  className="relative h-full bg-[#0a0c14]/90 backdrop-blur-xl rounded-3xl p-8 border border-[#00d4ff]/20"
                  whileHover={{ borderColor: "rgba(0, 212, 255, 0.5)", backgroundColor: "rgba(10, 12, 20, 0.95)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  {/* Enhanced top glow */}
                  <motion.div 
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-40 bg-[#00d4ff]/30 blur-3xl rounded-full"
                    initial={{ opacity: 0.5 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                  
                  {/* Enhanced inner glow */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-br from-[#00d4ff]/15 via-transparent to-transparent rounded-3xl"
                    initial={{ opacity: 0.5 }}
                    whileHover={{ opacity: 0.8 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                  
                  {/* Shimmer effect */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                  />
                  
                  <div className="relative z-10">
                    {/* Best value badge */}
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[#00d4ff] text-sm font-semibold">Premium</p>
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
                        -41% économisé
                      </span>
                    </div>
                    
                    {/* Price */}
                    <div className="mb-4">
                      <span className="text-5xl font-normal text-white">1393€</span>
                      <span className="text-white/40 text-lg font-normal">/an</span>
                    </div>
                    
                    {/* Description */}
                    <p className="text-white/50 text-sm font-normal mb-8 leading-relaxed">
                      Le meilleur rapport qualité-prix pour piloter votre stock toute l’année, sans compromis.
                    </p>
                    
                    {/* Features */}
                    <div className="space-y-4 mb-8">
                      {[
                        "Produits illimités",
                        "Multi-établissements",
                        "Alertes intelligentes (ruptures, dates, surstock)",
                        "Inventaires rapides & historiques",
                        "Suivi des pertes & des gaspillages",
                        "Suggestions d'achat basées sur vos usages",
                        "Tableau de bord temps réel (KPIs & tendances)",
                        "Accès équipe + rôles & permissions"
                      ].map((feature, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full bg-[#00d4ff]/20 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-[#00d4ff]" />
                          </div>
                          <span className="text-white/80 text-sm font-normal">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* CTA Button */}
                    <Link href="/login" className="block">
                      <SlideInButton variant="secondary" icon={ArrowRight} className="variant-secondary w-full rounded-full">
                        Choisir ce plan
                      </SlideInButton>
                    </Link>

                    <p className="text-center text-white/30 text-xs mt-4 font-normal">
                      14 jours d'essai gratuit • Aucune carte requise
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Sur Mesure */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, type: "spring", stiffness: 100, damping: 20 }}
              whileHover={{ scale: 1.05, y: -12 }}
              className="w-full cursor-pointer"
              style={{ willChange: "transform" }}
            >
              <motion.div 
                className="relative h-full p-[1px] rounded-3xl bg-gradient-to-b from-[#8b5cf6]/50 via-[#8b5cf6]/20 to-transparent overflow-hidden shadow-xl shadow-[#8b5cf6]/10"
                whileHover={{ boxShadow: "0 25px 50px -12px rgba(139, 92, 246, 0.3)" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {/* Enhanced animated border glow */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-[#8b5cf6]/0 via-[#8b5cf6]/40 to-[#8b5cf6]/0"
                  animate={{ 
                    background: [
                      "linear-gradient(to right, rgba(139, 92, 246, 0), rgba(139, 92, 246, 0.4), rgba(139, 92, 246, 0))",
                      "linear-gradient(to right, rgba(139, 92, 246, 0), rgba(139, 92, 246, 0.6), rgba(139, 92, 246, 0))",
                      "linear-gradient(to right, rgba(139, 92, 246, 0), rgba(139, 92, 246, 0.4), rgba(139, 92, 246, 0))"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Glass card inner */}
                <motion.div 
                  className="relative h-full bg-[#0a0c14]/90 backdrop-blur-xl rounded-3xl p-8 border border-[#8b5cf6]/20"
                  whileHover={{ borderColor: "rgba(139, 92, 246, 0.5)", backgroundColor: "rgba(10, 12, 20, 0.95)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  {/* Enhanced top glow */}
                  <motion.div 
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-40 bg-[#8b5cf6]/25 blur-3xl rounded-full"
                    initial={{ opacity: 0.5 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />

                  {/* Enhanced inner glow */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/15 via-transparent to-transparent rounded-3xl"
                    initial={{ opacity: 0.5 }}
                    whileHover={{ opacity: 0.8 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                  
                  {/* Shimmer effect */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                  />

                  <div className="relative z-10">
                    {/* Plan name */}
                    <p className="text-[#8b5cf6] text-sm font-semibold mb-2">Sur Mesure</p>

                    {/* Price */}
                    <div className="mb-4">
                      <span className="text-5xl font-normal text-white">Devis</span>
                    </div>

                    {/* Description */}
                    <p className="text-white/40 text-sm font-normal mb-8 leading-relaxed">
                      Solution adaptée aux besoins spécifiques de votre établissement ou groupe.
                    </p>

                    {/* Features */}
                    <div className="space-y-4 mb-8">
                      {[
                        "Produits illimités",
                        "Multi-établissements",
                        "Alertes intelligentes (ruptures, dates, surstock)",
                        "Inventaires rapides & historiques",
                        "Suivi des pertes & des gaspillages",
                        "Suggestions d'achat basées sur vos usages",
                        "Tableau de bord temps réel (KPIs & tendances)",
                        "Accès équipe + rôles & permissions"
                      ].map((feature, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full bg-[#8b5cf6]/20 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-[#8b5cf6]" />
                          </div>
                          <span className="text-white/70 text-sm font-normal">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <Link href="/contact?subject=custom" className="block">
                      <SlideInButton variant="purple" icon={ArrowRight} className="variant-purple w-full rounded-full">
                        Contacter nous
                      </SlideInButton>
                    </Link>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="témoignages" className="py-24 sm:py-32 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-12">
            <motion.p variants={fadeInUp} className="text-[#00d4ff] text-sm uppercase tracking-widest mb-4 font-normal">
              Témoignages
            </motion.p>
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl lg:text-5xl font-normal">
              Ils nous font <span className="italic text-[#00d4ff] font-semibold">confiance</span>
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <TestimonialCard testimonial={t} isActive={true} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 sm:py-32 px-4 relative z-10 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#00d4ff]/10 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-4xl mx-auto relative">
          {/* Header */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-16">
            <motion.p variants={fadeInUp} className="text-[#00d4ff] text-sm uppercase tracking-widest mb-4 font-normal">
              FAQ
            </motion.p>
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl lg:text-5xl font-normal mb-4">
              Questions <span className="italic text-[#00d4ff] font-semibold">fréquentes</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-white/60 font-normal max-w-xl mx-auto">
              Tout ce que vous devez savoir sur StockGuard
            </motion.p>
          </motion.div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {[
              {
                question: "Comment fonctionne l'essai gratuit de 14 jours ?",
                answer: "Vous pouvez tester StockGuard pendant 14 jours sans carte bancaire. Accédez à toutes les fonctionnalités Premium, créez vos produits, invitez votre équipe, et testez la gestion complète. À la fin de l'essai, vous choisissez si vous souhaitez continuer ou arrêter, sans engagement."
              },
              {
                question: "Puis-je utiliser StockGuard sur plusieurs établissements ?",
                answer: "Oui, avec le plan Premium, vous pouvez gérer un nombre illimité d'établissements depuis un seul compte. Chaque établissement a son propre stock, ses statistiques et ses alertes, tout en restant centralisé dans votre tableau de bord principal."
              },
              {
                question: "StockGuard fonctionne-t-il hors ligne ?",
                answer: "StockGuard est une application web qui nécessite une connexion Internet pour synchroniser les données en temps réel. Cependant, vous pouvez consulter les dernières données chargées même avec une connexion limitée. Pour un usage optimal, une connexion Internet stable est recommandée."
              },
              {
                question: "Combien de membres d'équipe puis-je inviter ?",
                answer: "Avec le plan Premium, vous pouvez inviter un nombre illimité de membres d'équipe. Vous pouvez définir des rôles et permissions (gestionnaire, employé, visiteur) pour contrôler qui peut modifier le stock, consulter les statistiques ou gérer les commandes."
              },
              {
                question: "Comment fonctionnent les alertes intelligentes ?",
                answer: "StockGuard surveille automatiquement votre stock et vous alerte en cas de rupture, de dates de péremption approchantes, ou de surstock. Vous pouvez personnaliser les seuils d'alerte par produit et recevoir des notifications en temps réel sur l'application ou par email."
              },
              {
                question: "Que se passe-t-il si j'annule mon abonnement ?",
                answer: "Vous pouvez annuler votre abonnement à tout moment depuis votre compte. Vous gardez l'accès jusqu'à la fin de la période payée, puis vos données restent stockées pendant 30 jours. Après cette période, elles sont supprimées définitivement. Vous pouvez réactiver votre compte à tout moment."
              },
              {
                question: "Les données sont-elles sécurisées ?",
                answer: "Absolument. Toutes vos données sont chiffrées en transit (HTTPS) et au repos. Nous utilisons une infrastructure sécurisée et conformes au RGPD. Vos données sont hébergées en Europe et nous effectuons des sauvegardes quotidiennes. Nous ne vendons jamais vos données à des tiers."
              },
              {
                question: "Puis-je importer mes données existantes ?",
                answer: "Oui, vous pouvez importer vos produits via un fichier Excel ou CSV. Notre équipe peut aussi vous aider lors de l'onboarding pour migrer vos données rapidement. L'importation est simple et vous guide pas à pas pour mapper vos colonnes."
              }
            ].map((faq, i) => (
              <FAQItem key={i} question={faq.question} answer={faq.answer} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 sm:py-32 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <GlassCard className="p-8 sm:p-16 text-center relative overflow-hidden" hover={false}>
            <div className="absolute inset-0 bg-gradient-to-r from-[#00d4ff]/5 via-[#8b5cf6]/5 to-[#00d4ff]/5" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-normal mb-6">
                Prêt à <span className="text-[#00d4ff]">transformer</span> votre gestion ?
              </h2>
              <p className="text-white/60 font-normal max-w-xl mx-auto mb-10">
                Rejoignez les centaines de restaurateurs qui ont déjà optimisé leur stock avec StockGuard.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/login">
                  <SlideInButton variant="primary" icon={Rocket} className="variant-primary">
                    Commencer gratuitement
                  </SlideInButton>
                </Link>
                <Link href="/contact">
                  <SlideInButton variant="outline" icon={ArrowRight} className="variant-outline">
                    Nous contacter
                  </SlideInButton>
                </Link>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-[#0a1929]">
                  <Image src="/icon.svg" alt="StockGuard" width={32} height={32} className="w-full h-full" />
                </div>
                <span className="font-normal">StockGuard</span>
              </Link>
              <p className="text-white/40 text-sm font-normal leading-relaxed">
                La solution complète pour la gestion de stock des restaurants.
              </p>
            </div>
            
            {[
              { title: "Produit", links: ["Fonctionnalités", "Tarifs", "Intégrations", "Changelog"] },
              { title: "Entreprise", links: ["À propos", "Blog", "Carrières", "Contact"] },
              { title: "Légal", links: ["Mentions légales", "Confidentialité", "CGU", "Cookies"] }
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-semibold text-white mb-4 text-sm">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className="text-white/40 hover:text-white/70 transition-colors text-sm font-normal">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-white/30 text-xs font-normal">© {new Date().getFullYear()} StockGuard. Tous droits réservés.</p>
            <p className="text-white/30 text-xs font-normal">Fait avec ❤️ en France</p>
          </div>
        </div>
      </footer>

      {/* Custom Styles */}
      <style jsx global>{`
        @keyframes scroll {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .animate-scroll {
          animation: scroll 20s linear infinite;
          will-change: transform;
        }

        /* GPU Acceleration for animations */
        [data-framer-component] {
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
          perspective: 1000px;
        }

        /* Optimize motion components */
        [data-framer-motion] {
          will-change: transform, opacity;
        }

        /* Perspective for 3D pricing cards */
        .perspective-1000 {
          perspective: 1000px;
        }

        .rotate-y-\\[-8deg\\] {
          transform: rotateY(-8deg);
        }

        .rotate-y-\\[8deg\\] {
          transform: rotateY(8deg);
        }

        @media (max-width: 1024px) {
          .rotate-y-\\[-8deg\\],
          .rotate-y-\\[8deg\\] {
            transform: rotateY(0deg);
          }
        }

        /* Slide-in Button Animation */
        .slide-in-button {
          position: relative;
          display: inline-flex;
          align-items: center;
          cursor: pointer;
          overflow: hidden;
        }

        .slide-in-button .button-text {
          position: relative;
          z-index: 2;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .slide-in-button:hover .button-text {
          transform: translateX(-100%);
          opacity: 0;
        }

        .slide-in-button .icon {
          position: absolute;
          opacity: 0;
          transform: translateX(20px);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 2;
        }

        .slide-in-button:hover .icon {
          transform: translateX(0);
          opacity: 1;
        }

        .slide-in-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 0;
          height: 100%;
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1;
        }

        .slide-in-button:hover::before {
          width: 100%;
        }

        /* Variante Primary (blanc -> cyan) */
        .slide-in-button.variant-primary::before {
          background: linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%);
        }

        /* Variante Secondary (cyan -> blanc) */
        .slide-in-button.variant-secondary::before {
          background: linear-gradient(135deg, #ffffff 0%, #e0f7fa 100%);
        }

        /* Variante Outline (transparent -> cyan) */
        .slide-in-button.variant-outline::before {
          background: linear-gradient(135deg, #00d4ff 0%, #00b4d8 100%);
        }

        /* Variante Purple */
        .slide-in-button.variant-purple::before {
          background: linear-gradient(135deg, #a78bfa 0%, #c4b5fd 100%);
        }

        /* Custom durations for Tailwind */
        .duration-400 {
          transition-duration: 400ms;
        }
        .duration-600 {
          transition-duration: 600ms;
        }
      `}</style>
    </div>
  )
}
