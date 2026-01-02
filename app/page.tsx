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
  Bot
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Switch } from "@/components/ui/switch"
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

export default function LandingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("annual")
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const features = [
    {
      icon: LineChart,
      title: "Visibilité en temps réel",
      description: "Fini de deviner. Tu sais exactement ce que tu as, où c'est, et quand ça expire.",
      color: "emerald"
    },
    {
      icon: Bell,
      title: "Alertes avant les problèmes",
      description: "Rupture imminente ? DLC proche ? Tu es prévenu avant que ça devienne une crise.",
      color: "amber"
    },
    {
      icon: Calculator,
      title: "Marges protégées",
      description: "Chaque commande optimisée. Chaque perte évitée. Ton argent reste où il doit être.",
      color: "emerald"
    },
    {
      icon: RefreshCw,
      title: "Automatisation intelligente",
      description: "Les tâches répétitives ? Le logiciel s'en charge. Toi, tu gères ce qui compte vraiment.",
      color: "amber"
    }
  ]

  const painPoints = [
    { before: "Excel qui plante en plein service", after: "Dashboard temps réel, toujours à jour" },
    { before: "Commandes au feeling", after: "Prévisions basées sur tes données" },
    { before: "Découvrir les ruptures trop tard", after: "Alertes 48h avant le problème" },
    { before: "Perdre du temps à compter", after: "Inventaire automatisé" }
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
      answer: "Oui. Sans engagement, sans frais cachés, sans période de préavis. Tu arrêtes quand tu veux, en un clic. Mais honnêtement, personne ne le fait une fois qu'ils ont vu la différence."
    },
    {
      question: "Ça va me prendre combien de temps à mettre en place ?",
      answer: "La plupart de nos clients sont opérationnels en moins de 2 heures. Import de tes données existantes, configuration de tes alertes, et c'est parti. On n'est pas là pour te faire perdre du temps."
    },
    {
      question: "Et si ça ne fonctionne pas pour mon établissement ?",
      answer: "Peu probable, mais on prend le risque : 30 jours satisfait ou remboursé, sans condition. Si tu n'es pas convaincu, tu récupères ton argent. Point."
    },
    {
      question: "C'est vraiment utile si j'ai un petit établissement ?",
      answer: "Surtout si tu as un petit établissement. Moins de marge d'erreur = plus besoin de contrôle. Un restaurant qui perd 200€/semaine en gaspillage, c'est 10 000€/an dans la poubelle. StockGuard coûte moins que ça."
    }
  ]

  // Utiliser les données de pricing-config.ts (source unique de vérité)
  const plans = {
    starter: PRICING_PLANS.starter,
    pro: PRICING_PLANS.pro,
    premium: PRICING_PLANS.premium
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-emerald-600/10 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#0a0a0a]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-base sm:text-xl font-black tracking-tight">STOCKGUARD</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Fonctionnalités</a>
              <a href="#pricing" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Tarifs</a>
              <a href="#testimonials" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Témoignages</a>
              <a href="#faq" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">FAQ</a>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/login">
                <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/5 px-2 sm:px-4 text-sm sm:text-base">
                  Connexion
                </Button>
              </Link>
              <Link href="/login">
                <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 sm:px-6 text-sm sm:text-base shadow-lg shadow-emerald-500/20 whitespace-nowrap">
                  Essai gratuit
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - HackerRank Style */}
      <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-10 lg:gap-16 items-center">
            {/* Left Column - Content */}
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-4 sm:mb-6">
                <Fingerprint className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400" />
                <span className="text-xs sm:text-sm font-medium text-emerald-400">La tour de contrôle de ton stock</span>
              </div>

              {/* Headline */}
              <h1 className="text-7xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[1.05] mb-6 w-full">
                <span className="text-gray-300">
                  Ton stock mérite mieux qu'un
                </span>
                <br />
                <span className="relative">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-300">Excel fatigué</span>
                  <div className="absolute -inset-1 bg-emerald-500/20 blur-xl -z-10" />
                </span>
              </h1>

              {/* Sub-headline */}
              <p className="text-base sm:text-lg text-gray-400 mb-8 leading-relaxed w-full lg:max-w-2xl">
                StockGuard surveille tes niveaux, anticipe tes ruptures et protège tes marges 
                <span className="text-white font-medium"> pendant que tu t'occupes du service</span>.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8">
                <Link href="/login" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 hover:-translate-y-1">
                    Commencer maintenant
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="#contact" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-semibold border-white/20 hover:bg-white/5 text-white rounded-xl">
                    <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Nous contacter
                  </Button>
                </Link>
              </div>

              {/* Trust bullets */}
              <div className="space-y-3">
                {[
                  "Moins de ruptures, plus de sérénité",
                  "Mise en place en quelques heures, pas en semaines",
                  "Sans engagement, annulable à tout moment"
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Check className="h-3 w-3 text-emerald-400" />
                    </div>
                    <span className="text-gray-400 text-sm">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Dashboard Mockup with Glow */}
            <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
              {/* Glow effect behind */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-amber-500/10 blur-[80px] scale-110" />
              
              {/* Dashboard card */}
              <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-950/90 rounded-3xl border border-white/10 p-6 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                      <Gauge className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Dashboard</p>
                      <p className="text-xs text-gray-500">Temps réel</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-emerald-400 font-medium">Live</span>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { label: "Valeur stock", value: "24,850€", change: "+2.3%", positive: true },
                    { label: "Alertes", value: "3", change: "à traiter", positive: false },
                    { label: "Marge moyenne", value: "68%", change: "+5pts", positive: true },
                    { label: "Ruptures évitées", value: "12", change: "ce mois", positive: true }
                  ].map((stat, i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/5">
                      <p className="text-gray-500 text-xs mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      <p className={`text-xs ${stat.positive ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {stat.change}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Mini chart placeholder */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-white">Évolution du stock</p>
                    <span className="text-xs text-emerald-400">+12% cette semaine</span>
                  </div>
                  <div className="flex items-end gap-1 h-16">
                    {[40, 55, 45, 70, 60, 80, 75, 90, 85, 95].map((h, i) => (
                      <div 
                        key={i} 
                        className="flex-1 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t opacity-80"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Floating notification */}
                <div className="absolute -right-4 top-1/3 bg-gray-900 border border-amber-500/30 rounded-xl p-3 shadow-xl animate-pulse">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white">Alerte stock</p>
                      <p className="text-xs text-gray-500">Tomates: 2j restants</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof - Trusted Restaurants */}
      <section className="py-16 px-6 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-gray-500 text-sm mb-2 uppercase tracking-wider">Ils nous font confiance</p>
            <p className="text-2xl font-bold text-white">Des établissements reconnus</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                name: "Restaurant Le Comptoir",
                rating: 4.8,
                reviews: 234,
                type: "Restaurant français",
                city: "Paris"
              },
              {
                name: "Bistrot Moderne",
                rating: 4.7,
                reviews: 189,
                type: "Bistrot",
                city: "Lyon"
              },
              {
                name: "Café Central",
                rating: 4.9,
                reviews: 312,
                type: "Café-Restaurant",
                city: "Marseille"
              },
              {
                name: "La Belle Époque",
                rating: 4.6,
                reviews: 156,
                type: "Brasserie",
                city: "Toulouse"
              },
              {
                name: "Le Gourmet",
                rating: 4.9,
                reviews: 278,
                type: "Restaurant gastronomique",
                city: "Bordeaux"
              }
            ].map((restaurant, i) => (
              <div 
                key={i}
                className="group p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300"
              >
                {/* Restaurant name */}
                <h3 className="font-bold text-white text-lg mb-2 group-hover:text-emerald-400 transition-colors">
                  {restaurant.name}
                </h3>
                
                {/* Type & City */}
                <p className="text-xs text-gray-500 mb-3">
                  {restaurant.type} · {restaurant.city}
                </p>
                
                {/* Google Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    {/* Google logo / icon */}
                    <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <span className="text-blue-400 text-[8px] font-bold">G</span>
                    </div>
                    <span className="text-white font-bold text-sm">{restaurant.rating}</span>
                  </div>
                  
                  {/* Stars */}
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, j) => (
                      <Star 
                        key={j} 
                        className={`h-3 w-3 ${
                          j < Math.floor(restaurant.rating) 
                            ? 'text-amber-400 fill-amber-400' 
                            : 'text-gray-600'
                        }`} 
                      />
                    ))}
                  </div>
                </div>
                
                {/* Reviews count */}
                <p className="text-xs text-gray-500">
                  {restaurant.reviews} avis Google
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before/After - Pain Points */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">
              <span className="text-gray-400">Du chaos</span>
              <span className="text-white"> → </span>
              <span className="text-emerald-400">au contrôle</span>
            </h2>
            <p className="text-xl text-gray-400">La différence entre gérer à l'aveugle et piloter en toute sérénité.</p>
          </div>

          <div className="space-y-4">
            {painPoints.map((point, i) => (
              <div key={i} className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 p-5 rounded-xl bg-red-500/5 border border-red-500/20">
                  <X className="h-5 w-5 text-red-400 shrink-0" />
                  <span className="text-gray-300">{point.before}</span>
                </div>
                <div className="flex items-center gap-4 p-5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <Check className="h-5 w-5 text-emerald-400 shrink-0" />
                  <span className="text-white">{point.after}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features - Comment ça t'aide */}
      <section id="features" className="py-24 px-6 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
              <Brain className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-400">Comment ça t'aide</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Tu reprends le <span className="text-emerald-400">contrôle</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Pas de fonctionnalités gadgets. Que des outils qui te font gagner du temps et de l'argent.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <div 
                  key={i}
                  className="group p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300"
                >
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-5 ${
                    feature.color === 'emerald' 
                      ? 'bg-emerald-500/10 group-hover:bg-emerald-500/20' 
                      : 'bg-amber-500/10 group-hover:bg-amber-500/20'
                  } transition-colors`}>
                    <Icon className={`h-7 w-7 ${feature.color === 'emerald' ? 'text-emerald-400' : 'text-amber-400'}`} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pre-Pricing Band */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Choisis ton <span className="text-emerald-400">rythme de croissance</span>
          </h2>
          <p className="text-xl text-gray-400">
            Tous les plans sont sans engagement. Upgrade possible à tout moment.
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 relative">
        {/* Background glow for pricing */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-12">
            {/* Badge annuel */}
            {billingPeriod === "annual" && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-6 animate-pulse">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-400">Économisez jusqu'à 3 mois avec l'abonnement annuel</span>
              </div>
            )}
            
            {/* Toggle */}
            <div className="inline-flex items-center gap-4 p-2 rounded-full bg-white/5 border border-white/10">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                  billingPeriod === "monthly" 
                    ? "bg-white text-black" 
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Mensuel
              </button>
              <button
                onClick={() => setBillingPeriod("annual")}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
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
            
            {/* Tag par établissement */}
            <p className="text-sm text-gray-500 mt-4">Prix par établissement</p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-start">
            {/* Starter */}
            <div className="group relative rounded-3xl bg-white/[0.02] border border-white/10 p-8 hover:border-white/20 transition-all duration-300">
              {/* Promo badge - annual only */}
              {billingPeriod === "annual" && plans.starter.annual.discount && (
                <div className="absolute -top-3 right-4">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg shadow-blue-500/30">
                    {plans.starter.annual.discount}
                  </div>
                </div>
              )}
              
              <div className="mb-6">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{plans.starter.tagline}</span>
                <h3 className="text-2xl font-bold text-white mt-2">{plans.starter.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{plans.starter.target}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  {billingPeriod === "annual" && plans.starter.annual.originalPrice && (
                    <span className="text-xl font-medium text-gray-500 line-through">
                      {plans.starter.annual.originalPrice}€
                    </span>
                  )}
                  <span className="text-5xl font-black text-white">
                    {billingPeriod === "monthly" ? plans.starter.monthly.price : plans.starter.annual.price}€
                  </span>
                  <span className="text-gray-500">{billingPeriod === "monthly" ? "/mois" : "/an"}</span>
                </div>
                {billingPeriod === "annual" && plans.starter.annual.savings && (
                  <p className="text-sm text-blue-400 font-semibold mt-1">
                    Économisez {plans.starter.annual.savings}
                  </p>
                )}
              </div>

              {/* Psychological bullets */}
              <div className="space-y-3 mb-6 pb-6 border-b border-white/10">
                {plans.starter.bullets.map((bullet, i) => (
                  <p key={i} className="text-sm text-gray-400 italic">"{bullet}"</p>
                ))}
              </div>

              <ul className="space-y-2.5 mb-4">
                {plans.starter.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* AI Features - Highlighted */}
              <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20">
                <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Brain className="h-3.5 w-3.5" />
                  IA incluse
                </p>
                <ul className="space-y-2">
                  {plans.starter.aiFeatures.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-purple-400 shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-xs">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link href="/login" className="block">
                <Button className="w-full h-12 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold shadow-lg shadow-emerald-500/30">
                  {plans.starter.cta}
                </Button>
              </Link>
            </div>

            {/* Pro - Highlighted */}
            <div className="group relative rounded-3xl p-8 transition-all duration-300 scale-105 z-10">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-amber-500/10 blur-xl rounded-3xl" />
              
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-950 rounded-3xl border-2 border-emerald-500/50 p-8 shadow-2xl shadow-emerald-500/20">
                {/* Popular badge */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/30">
                    <Crown className="h-4 w-4" />
                    Recommandé
                  </div>
                </div>

                {/* Promo badge - annual only */}
                {billingPeriod === "annual" && plans.pro.annual.discount && (
                  <div className="absolute -top-3 right-4 z-10">
                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold shadow-lg shadow-emerald-500/30">
                      {plans.pro.annual.discount}
                    </div>
                  </div>
                )}

                <div className="mb-6 pt-2">
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">{plans.pro.tagline}</span>
                  <h3 className="text-2xl font-bold text-white mt-2">{plans.pro.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{plans.pro.target}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    {billingPeriod === "annual" && plans.pro.annual.originalPrice && (
                      <span className="text-xl font-medium text-gray-500 line-through">
                        {plans.pro.annual.originalPrice}€
                      </span>
                    )}
                    <span className="text-5xl font-black text-emerald-400">
                      {billingPeriod === "monthly" ? plans.pro.monthly.price : plans.pro.annual.price}€
                    </span>
                    <span className="text-gray-500">{billingPeriod === "monthly" ? "/mois" : "/an"}</span>
                  </div>
                  {billingPeriod === "annual" && plans.pro.annual.savings && (
                    <p className="text-sm text-emerald-400 font-semibold mt-1">
                      Économisez {plans.pro.annual.savings}
                    </p>
                  )}
                </div>

                {/* Psychological bullets */}
                <div className="space-y-3 mb-6 pb-6 border-b border-emerald-500/20">
                  {plans.pro.bullets.map((bullet, i) => (
                    <p key={i} className="text-sm text-emerald-300/80 italic">"{bullet}"</p>
                  ))}
                </div>

                <ul className="space-y-2.5 mb-4">
                  {plans.pro.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-white text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* AI Features - Highlighted */}
                <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-purple-500/15 to-blue-500/15 border border-purple-500/30">
                  <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Brain className="h-3.5 w-3.5" />
                    IA avancée
                  </p>
                  <ul className="space-y-2">
                    {plans.pro.aiFeatures.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Sparkles className="h-3.5 w-3.5 text-purple-400 shrink-0 mt-0.5" />
                        <span className="text-white text-xs">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link href="/login" className="block">
                  <Button className="w-full h-12 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold shadow-lg shadow-emerald-500/30">
                    {plans.pro.cta}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Premium */}
            <div className="group relative rounded-3xl bg-white/[0.02] border border-white/10 p-8 hover:border-amber-500/30 transition-all duration-300">
              {/* Promo badge - annual only */}
              {billingPeriod === "annual" && plans.premium.annual.discount && (
                <div className="absolute -top-3 right-4">
                  <div className="bg-gradient-to-r from-amber-600 to-amber-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg shadow-amber-500/30">
                    {plans.premium.annual.discount}
                  </div>
                </div>
              )}
              
              <div className="mb-6">
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">{plans.premium.tagline}</span>
                <h3 className="text-2xl font-bold text-white mt-2">{plans.premium.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{plans.premium.target}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  {billingPeriod === "annual" && plans.premium.annual.originalPrice && (
                    <span className="text-xl font-medium text-gray-500 line-through">
                      {plans.premium.annual.originalPrice}€
                    </span>
                  )}
                  <span className="text-5xl font-black text-amber-400">
                    {billingPeriod === "monthly" ? plans.premium.monthly.price : plans.premium.annual.price}€
                  </span>
                  <span className="text-gray-500">{billingPeriod === "monthly" ? "/mois" : "/an"}</span>
                </div>
                {billingPeriod === "annual" && plans.premium.annual.savings && (
                  <p className="text-sm text-amber-400 font-semibold mt-1">
                    Économisez {plans.premium.annual.savings}
                  </p>
                )}
              </div>

              {/* Psychological bullets */}
              <div className="space-y-3 mb-6 pb-6 border-b border-white/10">
                {plans.premium.bullets.map((bullet, i) => (
                  <p key={i} className="text-sm text-amber-300/70 italic">"{bullet}"</p>
                ))}
              </div>

              <ul className="space-y-2.5 mb-4">
                {plans.premium.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* AI Features - Highlighted */}
              <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Brain className="h-3.5 w-3.5" />
                  IA étendue
                </p>
                <ul className="space-y-2">
                  {plans.premium.aiFeatures.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-xs">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link href="/login" className="block">
                <Button className="w-full h-12 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold shadow-lg shadow-amber-500/30">
                  {plans.premium.cta}
                </Button>
              </Link>
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

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
              <Star className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-400">Ce qu'ils en disent</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Des restaurateurs <span className="text-emerald-400">comme toi</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                {/* Result badge */}
                <div className="mb-4">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
                    {t.result}
                  </span>
                </div>

                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 text-emerald-400 fill-emerald-400" />
                  ))}
                </div>

                <blockquote className="text-gray-300 mb-6 leading-relaxed">
                  "{t.quote}"
                </blockquote>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
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
      <section id="faq" className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
              <HelpCircle className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-400">Questions fréquentes</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Et si... <span className="text-gray-400">?</span>
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

      {/* Contact Section */}
      <section id="contact" className="py-24 px-6 bg-white/[0.01]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black mb-4">
              Une question ? <span className="text-emerald-400">Parlons-en.</span>
            </h2>
            <p className="text-xl text-gray-400">
              Notre équipe répond sous 24h.
            </p>
          </div>

          <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 md:p-12">
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Prénom</label>
                  <input 
                    type="text" 
                    className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    placeholder="Jean"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input 
                    type="email" 
                    className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    placeholder="jean@restaurant.fr"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                <textarea 
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors resize-none"
                  placeholder="Comment pouvons-nous t'aider ?"
                />
              </div>
              <Button className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
                Envoyer
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Prêt à reprendre le <span className="text-emerald-400">contrôle</span> ?
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Commence gratuitement pendant 14 jours. Sans carte bancaire. Sans engagement.
          </p>
          <Link href="/login">
            <Button className="h-16 px-12 text-lg font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-2xl shadow-2xl shadow-emerald-500/30">
              Commencer maintenant
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black">STOCKGUARD</span>
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
    </div>
  )
}
