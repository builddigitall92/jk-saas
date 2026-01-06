"use client"

import { Button } from "@/components/ui/button"
import {
  Shield,
  TrendingUp,
  Package,
  AlertTriangle,
  BarChart3,
  Users,
  ArrowRight,
  CheckCircle2,
  Zap,
  Clock,
  PieChart,
  Euro,
  Star,
  Building2,
  Check,
  X,
  HelpCircle,
  ChevronDown,
  Crown,
  Sparkles,
  Store,
  MessageCircle,
  Rocket,
  Target,
  Award,
  HeartHandshake,
  Play,
  Fingerprint,
  Brain,
  TrendingDown,
  ShieldCheck,
  Gauge,
  LineChart,
  Bell,
  Calculator,
  FileSpreadsheet,
  RefreshCw,
  Bot,
  ChevronRight,
  Menu,
  XIcon
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { PRICING_PLANS } from "@/lib/pricing-config"

// Animated counter
function AnimatedCounter({ value, suffix = "", prefix = "", duration = 2000 }: { 
  value: number; suffix?: string; prefix?: string; duration?: number 
}) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    const steps = 60
    const increment = value / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value, duration, isVisible])

  return <span ref={ref}>{prefix}{count.toLocaleString('fr-FR')}{suffix}</span>
}

// FAQ Item
function FAQItem({ question, answer, isOpen, onClick }: {
  question: string; answer: string; isOpen: boolean; onClick: () => void
}) {
  return (
    <div className="border border-cyan-500/20 rounded-2xl overflow-hidden bg-[#0a1d37]/50 backdrop-blur-sm">
      <button
        onClick={onClick}
        className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-cyan-500/5 transition-colors"
      >
        <span className="text-lg font-semibold text-white">{question}</span>
        <ChevronDown className={`h-5 w-5 text-cyan-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
        <p className="px-6 pb-6 text-gray-400 leading-relaxed">{answer}</p>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("annual")
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const features = [
    {
      icon: LineChart,
      title: "Visibilité temps réel",
      description: "Tableau de bord intelligent avec KPIs en direct. Fini les surprises.",
      gradient: "from-cyan-500 to-blue-600"
    },
    {
      icon: Bell,
      title: "Alertes prédictives",
      description: "Rupture imminente ? DLC proche ? Tu es prévenu 48h avant.",
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      icon: Calculator,
      title: "Marges optimisées",
      description: "Chaque commande calculée. Chaque perte évitée. +20% de marge nette.",
      gradient: "from-indigo-500 to-purple-600"
    },
    {
      icon: Brain,
      title: "IA intégrée",
      description: "Prévisions automatiques basées sur ton historique et la saisonnalité.",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      icon: RefreshCw,
      title: "Automatisation",
      description: "Commandes auto, inventaires simplifiés. Moins de tâches répétitives.",
      gradient: "from-cyan-500 to-teal-600"
    },
    {
      icon: Users,
      title: "Multi-établissement",
      description: "Gère tous tes points de vente depuis une seule interface.",
      gradient: "from-teal-500 to-emerald-600"
    }
  ]

  const stats = [
    { value: 20, suffix: "%", label: "Réduction des pertes" },
    { value: 6, suffix: "h", label: "Économisées / semaine" },
    { value: 35, suffix: "%", label: "Marges améliorées" },
    { value: 14, suffix: "j", label: "Essai gratuit" }
  ]

  const testimonials = [
    {
      quote: "On est passés de 'on espère que ça passe' à 'on sait exactement ce qu'on a'. Le changement est brutal.",
      author: "Marie L.",
      role: "Propriétaire, Restaurant Le Comptoir",
      result: "-35% de pertes",
      avatar: "ML"
    },
    {
      quote: "J'ai récupéré 6h par semaine. 6 heures. À ne plus vérifier des feuilles Excel qui mentent.",
      author: "Thomas D.",
      role: "Chef, Bistrot Moderne",
      result: "6h/semaine économisées",
      avatar: "TD"
    },
    {
      quote: "Le ROI est ridicule. Le coût de l'abonnement, on le rentabilise en évitant UNE rupture.",
      author: "Sophie M.",
      role: "Directrice, Café Central",
      result: "ROI en 2 semaines",
      avatar: "SM"
    }
  ]

  const faqs = [
    {
      question: "Et si je ne suis pas à l'aise avec la tech ?",
      answer: "C'est justement le point. On a conçu StockGuard pour des gens qui n'ont pas le temps d'apprendre un logiciel compliqué. Interface simple, prise en main en moins d'1 heure, et notre équipe te guide pas à pas si besoin."
    },
    {
      question: "Je peux annuler quand je veux ?",
      answer: "Oui. Sans engagement, sans frais cachés, sans période de préavis. Tu arrêtes quand tu veux, en un clic."
    },
    {
      question: "Ça va me prendre combien de temps à mettre en place ?",
      answer: "La plupart de nos clients sont opérationnels en moins de 2 heures. Import de tes données existantes, configuration de tes alertes, et c'est parti."
    },
    {
      question: "Et si ça ne fonctionne pas pour mon établissement ?",
      answer: "30 jours satisfait ou remboursé, sans condition. Si tu n'es pas convaincu, tu récupères ton argent. Point."
    }
  ]

  const plans = {
    starter: PRICING_PLANS.starter,
    pro: PRICING_PLANS.pro,
    premium: PRICING_PLANS.premium
  }

  return (
    <div className="min-h-dvh bg-[#02050b] text-white overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Grid pattern subtil */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.03)_1px,transparent_1px)] bg-[size:80px_80px]" />
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[1000px] h-[1000px] bg-cyan-600/10 rounded-full blur-[200px]" />
        <div className="absolute top-1/2 right-0 w-[800px] h-[800px] bg-blue-600/8 rounded-full blur-[180px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[150px]" />
      </div>

      {/* Navigation - Paradigm Style */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#02050b]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">StockGuard</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Fonctionnalités</a>
              <a href="#pricing" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Tarifs</a>
              <a href="#testimonials" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Témoignages</a>
              <a href="#contact" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Contact</a>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/5">
                  Connexion
                </Button>
              </Link>
              <Link href="/login">
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold px-6 shadow-lg shadow-cyan-500/30 border-0">
                  Démo gratuite
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-white/5 border border-white/10"
            >
              {isMobileMenuOpen ? <XIcon className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-white/10 pt-4 space-y-4">
              <a href="#features" className="block text-gray-400 hover:text-white py-2">Fonctionnalités</a>
              <a href="#pricing" className="block text-gray-400 hover:text-white py-2">Tarifs</a>
              <a href="#testimonials" className="block text-gray-400 hover:text-white py-2">Témoignages</a>
              <a href="#contact" className="block text-gray-400 hover:text-white py-2">Contact</a>
              <div className="flex flex-col gap-3 pt-4">
                <Link href="/login">
                  <Button variant="outline" className="w-full border-white/20 text-white">Connexion</Button>
                </Link>
                <Link href="/login">
                  <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white">Démo gratuite</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section - Paradigm Style */}
      <section className="relative min-h-screen flex items-center pt-20 pb-16 px-4 sm:px-6 overflow-hidden">
        {/* Decorative curved line */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg className="absolute bottom-0 left-0 right-0 w-full h-auto opacity-20" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="url(#hero-gradient)" d="M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,197.3C672,224,768,224,864,197.3C960,171,1056,117,1152,112C1248,107,1344,149,1392,170.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"/>
            <defs>
              <linearGradient id="hero-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.1"/>
                <stop offset="50%" stopColor="#0099cc" stopOpacity="0.2"/>
                <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.1"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Content */}
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-6">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <span className="text-sm font-medium text-cyan-400">Solution IA pour restaurants</span>
              </div>

              {/* Headline */}
              <h1 className="text-7xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.95] mb-4 sm:mb-6">
                <span className="text-white">Gestion de stock</span>
                <br />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  intelligente
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-lg md:text-xl text-gray-400 mb-6 sm:mb-8 max-w-xl leading-relaxed">
                La solution complète pour gérer votre inventaire, anticiper vos besoins et maximiser vos marges.
                <span className="text-white font-medium"> Conçue pour les restaurants.</span>
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Link href="/login">
                  <Button className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 hover:-translate-y-1 border-0 w-full sm:w-auto">
                    Démo Gratuite 14j
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="#pricing">
                  <Button variant="outline" className="h-14 px-8 text-lg font-semibold border-2 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 rounded-xl w-full sm:w-auto">
                    Voir les tarifs
                  </Button>
                </Link>
              </div>

              {/* Trust bullets */}
              <div className="flex flex-wrap gap-6 text-sm text-gray-400">
                {["Sans carte bancaire", "Setup en 2h", "Sans engagement"].map((text, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-cyan-400" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Laptop Mockup */}
            <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
              {/* Glow behind laptop */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 via-blue-500/20 to-transparent blur-[100px] scale-110" />
              
              {/* Laptop Frame */}
              <div className="relative">
                {/* Screen */}
                <div className="relative bg-gradient-to-br from-gray-900 to-gray-950 rounded-t-2xl border border-white/10 p-2 shadow-2xl">
                  {/* Browser bar */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded-t-lg mb-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="bg-gray-700/50 rounded-md px-3 py-1 text-xs text-gray-400 text-center">
                        app.stockguard.fr/dashboard
                      </div>
                    </div>
                  </div>
                  
                  {/* Dashboard Content */}
                  <div className="bg-[#0a1525] rounded-lg p-4 min-h-[300px] sm:min-h-[350px]">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                          <Gauge className="h-4 w-4 text-cyan-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm">Dashboard</p>
                          <p className="text-[10px] text-gray-500">Temps réel</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                        <span className="text-[10px] text-cyan-400 font-medium">Live</span>
                      </div>
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {[
                        { label: "Stock", value: "24,850€", change: "+2.3%", positive: true },
                        { label: "Alertes", value: "3", change: "actives", positive: false },
                        { label: "Marge", value: "68%", change: "+5pts", positive: true },
                        { label: "Économies", value: "1,240€", change: "ce mois", positive: true }
                      ].map((stat, i) => (
                        <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/5">
                          <p className="text-gray-500 text-[10px] mb-0.5">{stat.label}</p>
                          <p className="text-lg font-bold text-white">{stat.value}</p>
                          <p className={`text-[10px] ${stat.positive ? 'text-cyan-400' : 'text-amber-400'}`}>
                            {stat.change}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Mini chart */}
                    <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-white">Évolution du stock</p>
                        <span className="text-[10px] text-cyan-400">+12%</span>
                      </div>
                      <div className="flex items-end gap-1 h-12">
                        {[40, 55, 45, 70, 60, 80, 75, 90, 85, 95, 88, 100].map((h, i) => (
                          <div 
                            key={i} 
                            className="flex-1 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t opacity-80"
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Laptop base */}
                <div className="relative h-4 bg-gradient-to-b from-gray-800 to-gray-900 rounded-b-xl mx-8">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
                </div>
                <div className="h-2 bg-gradient-to-b from-gray-700 to-gray-800 rounded-b-3xl mx-4 shadow-xl" />

                {/* Floating notification */}
                <div className="absolute -right-4 top-1/4 bg-[#0a1525] border border-cyan-500/30 rounded-xl p-3 shadow-xl shadow-cyan-500/10 animate-bounce-slow hidden sm:block">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                      <Bell className="h-4 w-4 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white">Alerte stock</p>
                      <p className="text-[10px] text-gray-500">Tomates: 2j</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Band */}
      <section className="py-16 px-4 sm:px-6 border-y border-white/5 bg-[#0a1525]/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-gray-400 text-sm mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid - Paradigm Style */}
      <section id="features" className="py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-6">
              <Zap className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-medium text-cyan-400">Fonctionnalités</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Tout ce dont tu as <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">besoin</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Une suite d'outils puissants pour transformer ta gestion de stock.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <div 
                  key={i}
                  className="group p-8 rounded-2xl bg-[#0a1d37]/50 border border-cyan-500/10 hover:border-cyan-500/30 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2"
                >
                  <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 px-4 sm:px-6 bg-[#0a1525]/30">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-gray-500 text-sm mb-8 uppercase tracking-wider">Ils nous font confiance</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {["Restaurant Le Comptoir", "Bistrot Moderne", "Café Central", "La Belle Époque", "Le Gourmet"].map((name, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <Store className="h-5 w-5" />
                <span className="font-medium">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 sm:px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-6">
              <Crown className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-medium text-cyan-400">Tarification simple</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Choisis ton <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">plan</span>
            </h2>
            
            {/* Toggle */}
            <div className="inline-flex items-center gap-4 p-2 rounded-full bg-white/5 border border-white/10 mt-6">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                  billingPeriod === "monthly" 
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white" 
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Mensuel
              </button>
              <button
                onClick={() => setBillingPeriod("annual")}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                  billingPeriod === "annual" 
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white" 
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Annuel
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-400 text-black font-bold">-20%</span>
              </button>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="flex justify-center">
            <div className="max-w-lg w-full">
              <div className="relative group">
                {/* Glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
                
                <div className="relative bg-gradient-to-br from-[#0a1d37] to-[#061224] rounded-3xl border border-cyan-500/30 p-8 shadow-2xl">
                  {/* Badge */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
                      <Crown className="h-4 w-4" />
                      Premium
                    </div>
                  </div>

                  <div className="text-center pt-4 mb-8">
                    <p className="text-gray-400 mb-2">{plans.premium.tagline}</p>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-5xl font-black text-white">
                        {billingPeriod === "monthly" ? plans.premium.monthly.price : plans.premium.annual.price}€
                      </span>
                      <span className="text-gray-500">/{billingPeriod === "monthly" ? "mois" : "an"}</span>
                    </div>
                    {billingPeriod === "annual" && plans.premium.annual.savings && (
                      <p className="text-cyan-400 text-sm font-medium mt-2">
                        Économisez {plans.premium.annual.savings}
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plans.premium.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* AI Features */}
                  <div className="mb-8 p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20">
                    <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Brain className="h-3.5 w-3.5" />
                      IA intégrée
                    </p>
                    <ul className="space-y-2">
                      {plans.premium.aiFeatures.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Sparkles className="h-3.5 w-3.5 text-purple-400 shrink-0 mt-0.5" />
                          <span className="text-white text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link href="/login" className="block">
                    <Button className="w-full h-14 text-lg font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl shadow-lg shadow-cyan-500/30 border-0">
                      Commencer l'essai gratuit
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Guarantee */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
              <ShieldCheck className="h-6 w-6 text-cyan-400" />
              <span className="text-white font-medium">
                Garantie 30 jours satisfait ou remboursé
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 bg-[#0a1525]/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-6">
              <Star className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-medium text-cyan-400">Témoignages</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Ce qu'en disent nos <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">clients</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="p-8 rounded-2xl bg-[#0a1d37]/50 border border-cyan-500/10 hover:border-cyan-500/30 transition-all">
                {/* Result badge */}
                <div className="mb-4">
                  <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-semibold">
                    {t.result}
                  </span>
                </div>

                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 text-cyan-400 fill-cyan-400" />
                  ))}
                </div>

                <blockquote className="text-gray-300 mb-6 leading-relaxed">
                  "{t.quote}"
                </blockquote>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{t.avatar}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">{t.author}</p>
                    <p className="text-sm text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-6">
              <HelpCircle className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-medium text-cyan-400">FAQ</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Questions <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">fréquentes</span>
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

      {/* Founder Section */}
      <section className="py-24 px-4 sm:px-6 bg-gradient-to-b from-[#02050b] to-[#0a1d37]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full mx-auto mb-6 bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-cyan-500/30 ring-4 ring-cyan-500/20">
            <span className="text-3xl sm:text-4xl font-bold text-white">JK</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">Créé par un passionné</h3>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Fondateur SaaS • 10+ ans d'expérience en restauration • Expert en optimisation des coûts food
          </p>
          <div className="flex justify-center gap-4 mt-8">
            <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Une question ? <span className="text-cyan-400">Parlons-en.</span>
            </h2>
            <p className="text-xl text-gray-400">Notre équipe répond sous 24h.</p>
          </div>

          <div className="bg-[#0a1d37]/50 border border-cyan-500/20 rounded-3xl p-8 md:p-12 backdrop-blur-sm">
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Prénom</label>
                  <input 
                    type="text" 
                    className="w-full h-12 px-4 rounded-xl bg-white/5 border border-cyan-500/20 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                    placeholder="Jean"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input 
                    type="email" 
                    className="w-full h-12 px-4 rounded-xl bg-white/5 border border-cyan-500/20 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                    placeholder="jean@restaurant.fr"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                <textarea 
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-cyan-500/20 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors resize-none"
                  placeholder="Comment pouvons-nous t'aider ?"
                />
              </div>
              <Button className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold border-0">
                Envoyer
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            Prêt à <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">transformer</span> ta gestion ?
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Commence gratuitement pendant 14 jours. Sans carte bancaire. Sans engagement.
          </p>
          <Link href="/login">
            <Button className="h-16 px-12 text-lg font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-2xl shadow-2xl shadow-cyan-500/30 border-0">
              Commencer maintenant
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">StockGuard</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-gray-500">
              <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
              <a href="#" className="hover:text-white transition-colors">CGU</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} StockGuard. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
