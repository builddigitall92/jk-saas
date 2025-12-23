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
  Smartphone,
  ChefHat,
  Euro,
  Leaf,
  Star,
  Building2,
  ShoppingCart,
  Check,
  X,
  HelpCircle,
  ChevronDown,
  Crown,
  Sparkles,
  Store
} from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useLandingStats } from "@/lib/hooks/use-landing-stats"
import { PRICING_PLANS, type BillingPeriod } from "@/lib/pricing-config"

// Composant FAQ Item
function FAQItem({ question, answer, isOpen, onClick }: {
  question: string
  answer: string
  isOpen: boolean
  onClick: () => void
}) {
  return (
    <div className="banking-card overflow-hidden">
      <button
        onClick={onClick}
        className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-secondary/50 transition-colors"
      >
        <span className="text-lg font-semibold text-foreground">{question}</span>
        <ChevronDown className={`h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
        <p className="px-6 pb-6 text-muted-foreground leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  )
}

// Composant FAQ Section
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: "Comment fonctionne l'essai gratuit de 14 jours ?",
      answer: "Vous avez accès à toutes les fonctionnalités du plan Pro pendant 14 jours, sans aucun engagement ni carte bancaire requise. À la fin de l'essai, vous pouvez choisir le plan qui vous convient ou continuer gratuitement avec des fonctionnalités limitées."
    },
    {
      question: "Puis-je changer de plan à tout moment ?",
      answer: "Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Si vous passez à un plan supérieur, vous ne payez que la différence au prorata. Si vous passez à un plan inférieur, le crédit sera appliqué sur vos prochaines factures."
    },
    {
      question: "Qu'est-ce qui est inclus dans le support prioritaire ?",
      answer: "Le support prioritaire du plan Premium inclut un accès 24/7 à notre équipe par téléphone et chat, un temps de réponse garanti sous 2 heures, et un account manager dédié pour vous accompagner dans l'optimisation de votre utilisation de StockGuard."
    },
    {
      question: "Comment fonctionne la gestion multi-sites ?",
      answer: "Avec les plans Pro et Premium, vous pouvez gérer plusieurs établissements depuis un seul compte. Chaque site a son propre inventaire et ses propres fournisseurs, mais vous avez une vue consolidée de tous vos restaurants pour analyser les performances globales."
    },
    {
      question: "StockGuard s'intègre-t-il avec ma caisse enregistreuse ?",
      answer: "Le plan Premium inclut des intégrations via API avec les principales solutions de caisse du marché. Nous pouvons également développer des connecteurs personnalisés selon vos besoins spécifiques."
    },
    {
      question: "Mes données sont-elles sécurisées ?",
      answer: "Absolument. Vos données sont hébergées sur des serveurs sécurisés en Europe, avec chiffrement SSL/TLS. Nous effectuons des sauvegardes quotidiennes et nous sommes conformes au RGPD. Vous restez propriétaire de vos données et pouvez les exporter à tout moment."
    },
    {
      question: "Proposez-vous une formation à l'utilisation ?",
      answer: "Oui ! Tous les plans incluent un accès à notre centre d'aide et nos tutoriels vidéo. Le plan Premium inclut en plus une formation personnalisée pour votre équipe, en présentiel ou en visioconférence."
    },
    {
      question: "Puis-je annuler mon abonnement à tout moment ?",
      answer: "Oui, vous pouvez annuler votre abonnement à tout moment depuis votre espace client. Il n'y a aucun frais d'annulation et vous conservez l'accès jusqu'à la fin de votre période de facturation en cours."
    }
  ]

  return (
    <section id="faq" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary mb-6">
            <HelpCircle className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">FAQ</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Questions fréquentes
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tout ce que vous devez savoir pour démarrer avec StockGuard.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            Vous avez d'autres questions ?
          </p>
          <Link href="/login">
            <Button variant="outline" className="btn-outline">
              Contactez notre équipe
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

// Fonction pour formater les nombres
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toLocaleString('fr-FR')
}

// Fonction pour formater les montants en euros
function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return (amount / 1000000).toFixed(1) + 'M€'
  }
  if (amount >= 1000) {
    return (amount / 1000).toFixed(1) + 'k€'
  }
  return amount.toLocaleString('fr-FR') + '€'
}

export default function LandingPage() {
  const { stats, loading } = useLandingStats()
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly")

  const features = [
    {
      icon: Package,
      title: "Gestion des stocks",
      description: "Suivez vos stocks en temps réel avec des alertes automatiques pour éviter les ruptures."
    },
    {
      icon: AlertTriangle,
      title: "Réduction du gaspillage",
      description: "Identifiez les produits à risque et optimisez vos rotations pour minimiser les pertes."
    },
    {
      icon: TrendingUp,
      title: "Prévisions intelligentes",
      description: "Anticipez vos besoins grâce à l'analyse de vos données historiques et tendances."
    },
    {
      icon: BarChart3,
      title: "Rapports détaillés",
      description: "Visualisez vos performances avec des tableaux de bord clairs et exploitables."
    },
    {
      icon: Users,
      title: "Gestion fournisseurs",
      description: "Centralisez vos contacts et suivez vos commandes en un seul endroit."
    },
    {
      icon: Smartphone,
      title: "Interface mobile",
      description: "Vos employés accèdent aux fonctionnalités essentielles depuis leur smartphone."
    }
  ]

  const benefits = [
    {
      icon: Euro,
      value: `${stats.costReduction}%`,
      label: "Réduction des coûts",
      description: "sur les pertes alimentaires"
    },
    {
      icon: Clock,
      value: `${stats.timeSaved}h`,
      label: "Temps économisé",
      description: "par jour en gestion"
    },
    {
      icon: Leaf,
      value: `${stats.wasteReduction}%`,
      label: "Moins de gaspillage",
      description: "en moyenne"
    },
    {
      icon: Zap,
      value: "24/7",
      label: "Visibilité totale",
      description: "sur vos opérations"
    }
  ]

  const testimonials = [
    {
      quote: "StockGuard a transformé la façon dont nous gérons notre restaurant. Fini les surprises en fin de mois !",
      author: "Marie L.",
      role: "Propriétaire, La Belle Époque",
      rating: 5
    },
    {
      quote: "L'interface est intuitive et mes employés l'ont adoptée immédiatement. Un vrai gain de temps.",
      author: "Thomas D.",
      role: "Chef cuisinier, Le Bistrot Moderne",
      rating: 5
    },
    {
      quote: "Les prévisions nous permettent de commander juste ce qu'il faut. Notre marge a augmenté de 18%.",
      author: "Sophie M.",
      role: "Gérante, Café Central",
      rating: 5
    }
  ]

  // Stats live pour le dashboard preview
  const liveStats = [
    {
      label: "Produits gérés",
      value: loading ? "..." : formatNumber(stats.products),
      trend: "+12%",
      trendColor: "text-accent"
    },
    {
      label: "Valeur stock",
      value: loading ? "..." : formatCurrency(stats.totalStockValue),
      trend: "Optimisé",
      trendColor: "text-accent"
    },
    {
      label: "Fournisseurs",
      value: loading ? "..." : formatNumber(stats.suppliers),
      trend: "Actifs",
      trendColor: "text-muted-foreground"
    },
    {
      label: "Gaspillage",
      value: `-${stats.wasteReduction}%`,
      trend: "vs mois dernier",
      trendColor: "text-accent"
    }
  ]

  // Stats globales pour la section "confiance"
  const globalStats = [
    {
      icon: Building2,
      value: stats.establishments,
      label: "Établissements"
    },
    {
      icon: Package,
      value: stats.products,
      label: "Produits suivis"
    },
    {
      icon: ShoppingCart,
      value: stats.deliveredOrders,
      label: "Commandes livrées"
    },
    {
      icon: CheckCircle2,
      value: stats.resolvedAlerts,
      label: "Alertes résolues"
    }
  ]

  return (
    <div className="min-h-screen banking-bg">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="StockGuard Logo"
                width={40}
                height={40}
                className="rounded-xl"
              />
              <span className="text-xl font-bold text-foreground">StockGuard</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Fonctionnalités</a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Tarifs</a>
              <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">Témoignages</a>
              <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  Connexion
                </Button>
              </Link>
              <Link href="/login">
                <Button className="btn-primary">
                  Commencer
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-up">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Solution #1 pour la restauration</span>
            </div>

            {/* Main Title */}
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 animate-fade-up delay-1">
              Maîtrisez vos stocks,
              <span className="block mt-2 bg-gradient-to-r from-primary via-orange-400 to-primary bg-clip-text text-transparent relative">
                <span className="relative z-10">maximisez vos marges</span>
                {/* Glows animés */}
                <div className="landing-glow-1" />
                <div className="landing-glow-2" />
                <div className="landing-glow-3" />
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up delay-2">
              StockGuard est la solution complète pour les restaurateurs qui veulent
              réduire le gaspillage, optimiser leurs commandes et gagner en rentabilité.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up delay-3">
              <Link href="/login">
                <Button className="btn-primary btn-hover-lift landing-cta-glow h-14 px-8 text-lg">
                  <ChefHat className="h-5 w-5 mr-2" />
                  Démarrer gratuitement
                </Button>
              </Link>
              <a href="#features">
                <Button variant="outline" className="btn-outline btn-hover-lift h-14 px-8 text-lg">
                  Découvrir les fonctionnalités
                </Button>
              </a>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 mt-12 text-muted-foreground animate-fade-up delay-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-sm">Essai gratuit 14 jours</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-sm">Sans engagement</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-sm">Support inclus</span>
              </div>
            </div>
          </div>

          {/* Hero Image / Dashboard Preview - LIVE DATA */}
          <div className="mt-20 relative animate-fade-up delay-5">
            <div className="banking-card-glow p-2 rounded-2xl">
              <div className="banking-card p-6 rounded-xl">
                {/* Mock Dashboard Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                      <PieChart className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Dashboard StockGuard</p>
                      <p className="text-xs text-muted-foreground">Données en temps réel</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="status-dot status-dot-green" />
                    <span className="badge-green">En ligne</span>
                  </div>
                </div>

                {/* Live Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {liveStats.map((stat, index) => (
                    <div key={stat.label} className="banking-card p-4 rounded-xl">
                      <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
                      <p className={`text-2xl font-bold text-foreground ${loading ? 'animate-pulse' : ''}`}>
                        {stat.value}
                      </p>
                      <p className={`text-xs ${stat.trendColor}`}>{stat.trend}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -left-4 top-1/3 banking-card p-4 rounded-xl shadow-2xl animate-float landing-shake hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Commande validée</p>
                  <p className="text-xs text-muted-foreground">
                    {loading ? "..." : `${stats.deliveredOrders} livrées`}
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute -right-4 top-1/2 banking-card p-4 rounded-xl shadow-2xl animate-float-delayed landing-shake hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Alertes résolues</p>
                  <p className="text-xs text-muted-foreground">
                    {loading ? "..." : `${stats.resolvedAlerts} traitées`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Stats Banner */}
      {(stats.establishments > 0 || stats.products > 0) && (
        <section className="py-12 px-6 border-y border-border bg-secondary/20">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {globalStats.map((stat) => {
                const Icon = stat.icon
                return (
                  <div key={stat.label} className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Icon className="h-5 w-5 text-primary" />
                      <span className={`text-3xl font-bold text-foreground ${loading ? 'animate-pulse' : ''}`}>
                        {loading ? "..." : formatNumber(stat.value)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary mb-6">
              <Package className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Fonctionnalités</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Tout ce qu'il vous faut
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Une suite d'outils pensée pour simplifier la gestion quotidienne de votre établissement.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="banking-card landing-card-slide p-6 group cursor-default hover:scale-[1.02] transition-all duration-300"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="landing-icon-glow h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-all duration-300 relative">
                    <Icon className="h-7 w-7 text-primary relative z-10" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-24 px-6 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary mb-6">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Résultats</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Des résultats concrets
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Nos utilisateurs constatent des améliorations significatives dès les premières semaines.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => {
              const Icon = benefit.icon
              return (
                <div
                  key={benefit.label}
                  className="banking-card-featured landing-card-slide p-8 text-center hover:scale-105 transition-all duration-300"
                >
                  <div className="landing-icon-glow h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 relative">
                    <Icon className="h-8 w-8 text-primary relative z-10" />
                  </div>
                  <p className="text-4xl font-bold text-primary mb-2">
                    {benefit.value}
                  </p>
                  <p className="text-lg font-semibold text-foreground mb-1">
                    {benefit.label}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary mb-6">
              <Star className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Témoignages</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Ils nous font confiance
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Découvrez ce que nos clients disent de StockGuard.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.author}
                className="landing-testimonial-card landing-card-slide p-8"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-primary fill-primary" />
                  ))}
                </div>

                <blockquote className="text-foreground text-lg mb-6 leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>

                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center">
                    <span className="text-white font-bold">
                      {testimonial.author.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary mb-6">
              <Euro className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Tarifs</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Des tarifs adaptés à votre activité
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Choisissez le plan qui correspond à vos besoins. Essai gratuit de 14 jours sur tous les plans.
            </p>

            {/* Billing Period Toggle */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${billingPeriod === "monthly"
                    ? "bg-primary text-white shadow-lg scale-105"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  }`}
              >
                Mensuel
              </button>
              <button
                onClick={() => setBillingPeriod("annual")}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 relative ${billingPeriod === "annual"
                    ? "bg-primary text-white shadow-lg scale-105"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  }`}
              >
                Annuel
                <span className="absolute -top-2 -right-2 bg-accent text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                  -17%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto items-start">
            {/* Starter Plan */}
            <div className="landing-pricing-card landing-card-slide p-8 relative" style={{ animationDelay: '0s' }}>
              <div className="mb-6">
                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-4">
                  <Store className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">{PRICING_PLANS.starter.name}</h3>
                <p className="text-muted-foreground text-sm">{PRICING_PLANS.starter.description}</p>
              </div>

              <div className="mb-6">
                <div className="relative inline-block">
                  <span className="text-3xl line-through text-muted-foreground mr-2">
                    {PRICING_PLANS.starter[billingPeriod].originalPrice}€
                  </span>
                  <span className="text-5xl font-bold text-foreground transition-all duration-300">
                    {PRICING_PLANS.starter[billingPeriod].price}€
                  </span>
                  <span className="text-muted-foreground">{PRICING_PLANS.starter[billingPeriod].period}</span>
                  <div className="absolute -top-3 -right-16">
                    <span className="landing-promo-badge">{PRICING_PLANS.starter[billingPeriod].discount}</span>
                  </div>
                </div>
                {billingPeriod === "annual" && (
                  <p className="text-sm text-accent mt-2 font-medium">Soit {PRICING_PLANS.starter.monthly.price}€/mois</p>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {PRICING_PLANS.starter.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
                {PRICING_PLANS.starter.excludedFeatures?.map((feature, i) => (
                  <li key={`excluded-${i}`} className="flex items-start gap-3 text-muted-foreground">
                    <X className="h-5 w-5 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/login" className="block">
                <Button variant="outline" className="w-full btn-outline btn-hover-lift h-12">
                  Commencer l'essai gratuit
                </Button>
              </Link>
            </div>

            {/* Pro Plan - Featured */}
            <div className="landing-pricing-card-featured landing-card-slide p-8 relative scale-105 z-10" style={{ animationDelay: '0.15s' }}>
              {/* Popular Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="bg-primary text-white px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Le plus populaire
                </div>
              </div>

              <div className="mb-6 pt-2">
                <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                  <Crown className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">{PRICING_PLANS.pro.name}</h3>
                <p className="text-primary text-sm font-medium">{PRICING_PLANS.pro.description}</p>
              </div>

              <div className="mb-6">
                <div className="relative inline-block">
                  <span className="text-3xl line-through text-muted-foreground mr-2">
                    {PRICING_PLANS.pro[billingPeriod].originalPrice}€
                  </span>
                  <span className="text-5xl font-bold text-primary transition-all duration-300">
                    {PRICING_PLANS.pro[billingPeriod].price}€
                  </span>
                  <span className="text-muted-foreground">{PRICING_PLANS.pro[billingPeriod].period}</span>
                  <div className="absolute -top-3 -right-16">
                    <span className="landing-promo-badge">{PRICING_PLANS.pro[billingPeriod].discount}</span>
                  </div>
                </div>
                {billingPeriod === "annual" && (
                  <p className="text-sm text-primary mt-2 font-medium">Soit {PRICING_PLANS.pro.monthly.price}€/mois</p>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {PRICING_PLANS.pro.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-foreground">{i < 2 ? <strong>{feature}</strong> : feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/login" className="block">
                <Button className="w-full btn-primary btn-hover-lift h-12 text-base">
                  Commencer l'essai gratuit
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Premium Plan */}
            <div className="landing-pricing-card landing-card-slide p-8 relative" style={{ animationDelay: '0.3s' }}>
              <div className="mb-6">
                <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
                  <Building2 className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">{PRICING_PLANS.premium.name}</h3>
                <p className="text-muted-foreground text-sm">{PRICING_PLANS.premium.description}</p>
              </div>

              <div className="mb-6">
                <div className="relative inline-block">
                  <span className="text-3xl line-through text-muted-foreground mr-2">
                    {PRICING_PLANS.premium[billingPeriod].originalPrice}€
                  </span>
                  <span className="text-5xl font-bold text-foreground transition-all duration-300">
                    {PRICING_PLANS.premium[billingPeriod].price}€
                  </span>
                  <span className="text-muted-foreground">{PRICING_PLANS.premium[billingPeriod].period}</span>
                  <div className="absolute -top-3 -right-16">
                    <span className="landing-promo-badge">{PRICING_PLANS.premium[billingPeriod].discount}</span>
                  </div>
                </div>
                {billingPeriod === "annual" && (
                  <p className="text-sm text-accent mt-2 font-medium">Soit {PRICING_PLANS.premium.monthly.price}€/mois</p>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {PRICING_PLANS.premium.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-foreground">{i < 2 ? <strong>{feature}</strong> : feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/login" className="block">
                <Button variant="outline" className="w-full btn-outline h-12">
                  Contacter l'équipe commerciale
                </Button>
              </Link>
            </div>
          </div>

          {/* Pricing Note */}
          <p className="text-center text-muted-foreground mt-12 text-sm">
            Tous les prix sont HT. Essai gratuit de 14 jours sans engagement ni carte bancaire requise.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="banking-card-glow p-12 text-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />

            <div className="relative">
              <div className="h-20 w-20 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-8">
                <Shield className="h-10 w-10 text-white" strokeWidth={1.5} />
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Prêt à transformer votre gestion ?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
                Rejoignez {stats.establishments > 0 ? `les ${stats.establishments} établissements` : 'les restaurateurs'} qui ont déjà optimisé leur rentabilité avec StockGuard.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/login">
                  <Button className="btn-primary h-14 px-8 text-lg">
                    Créer mon compte gratuit
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
              </div>

              <p className="text-sm text-muted-foreground mt-6">
                14 jours d'essai gratuit • Sans carte bancaire • Annulation à tout moment
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="StockGuard Logo"
                width={40}
                height={40}
                className="rounded-xl"
              />
              <span className="text-xl font-bold text-foreground">StockGuard</span>
            </div>

            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Confidentialité</a>
              <a href="#" className="hover:text-foreground transition-colors">Conditions d'utilisation</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>

            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} StockGuard. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
