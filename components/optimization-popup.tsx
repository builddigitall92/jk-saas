"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  X,
  Trophy,
  TrendingDown,
  ShoppingCart,
  Package,
  Trash2,
  Zap,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Bell,
  CheckCircle2,
} from "lucide-react"

interface OptimizationItem {
  icon: React.ReactNode
  title: string
  description: string
  href: string
  badge?: string
}

interface OptimizationPopupProps {
  // Données réelles à passer depuis le dashboard
  savingsAmount?: number
  savingsPercent?: number
  hasSignificantProgress?: boolean
  // Suggestions basées sur les données
  orderSuggestions?: Array<{ product: string; quantity: string }>
  reduceSuggestions?: Array<{ product: string; suggestion: string }>
  removeSuggestions?: Array<{ product: string; lossAmount: number }>
  quickWins?: Array<{ action: string; completed?: boolean }>
}

export function OptimizationPopup({
  savingsAmount = 327,
  savingsPercent = 18,
  hasSignificantProgress = true,
  orderSuggestions = [
    { product: "Frites surgelées", quantity: "12 kg" },
    { product: "Pain burger", quantity: "4 cartons" },
  ],
  reduceSuggestions = [
    { product: "Salade", suggestion: "Réduire de 10% le lundi" },
  ],
  removeSuggestions = [
    { product: "Milkshake fraise", lossAmount: 45 },
  ],
  quickWins = [
    { action: "Activer les alertes de péremption", completed: false },
    { action: "Check service avant le rush du soir", completed: false },
  ],
}: OptimizationPopupProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // Vérifier si déjà vu aujourd'hui
    const lastShown = localStorage.getItem("optimization-popup-last-shown")
    const today = new Date().toDateString()
    
    // Vérifier si l'utilisateur a désactivé le popup
    const isDisabled = localStorage.getItem("optimization-popup-disabled") === "true"
    
    if (!isDisabled && lastShown !== today) {
      // Délai pour laisser le dashboard se charger
      const timer = setTimeout(() => {
        setIsOpen(true)
        setIsAnimating(true)
        localStorage.setItem("optimization-popup-last-shown", today)
      }, 800)
      
      return () => clearTimeout(timer)
    }
  }, [])

  const handleClose = () => {
    setIsAnimating(false)
    setTimeout(() => setIsOpen(false), 300)
  }

  const handleDisable = () => {
    localStorage.setItem("optimization-popup-disabled", "true")
    handleClose()
  }

  if (!isOpen) return null

  // Plan d'optimisation personnalisé
  const optimizationPlan: OptimizationItem[] = [
    {
      icon: <ShoppingCart className="h-5 w-5 text-primary" />,
      title: "Quoi commander",
      description: orderSuggestions.map(s => `${s.product} – ${s.quantity}`).join(", "),
      href: "/manager/orders",
      badge: `${orderSuggestions.length} produits`,
    },
    {
      icon: <TrendingDown className="h-5 w-5 text-orange-500" />,
      title: "Quoi réduire",
      description: reduceSuggestions.map(s => `${s.product}: ${s.suggestion}`).join(". "),
      href: "/manager/forecasts",
    },
    {
      icon: <Trash2 className="h-5 w-5 text-destructive" />,
      title: "Quoi supprimer",
      description: removeSuggestions.map(s => `${s.product} – ${s.lossAmount}€ de pertes/mois`).join(", "),
      href: "/manager/reports",
      badge: "Économie possible",
    },
    {
      icon: <Zap className="h-5 w-5 text-accent" />,
      title: "Quick wins immédiats",
      description: quickWins.map(q => q.action).join(" • "),
      href: "/manager/stock",
      badge: `${quickWins.length} actions`,
    },
  ]

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Desktop Modal / Mobile Sheet */}
      <div 
        className={`fixed z-[10000] transition-all duration-300 ease-out
          /* Mobile: Sheet depuis le bas */
          inset-x-0 bottom-0 max-h-[90vh] rounded-t-3xl
          /* Desktop: Modal centré */
          md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 
          md:max-h-[85vh] md:w-full md:max-w-lg md:rounded-2xl
          ${isAnimating 
            ? "translate-y-0 md:translate-y-[-50%] opacity-100 scale-100" 
            : "translate-y-full md:translate-y-[-45%] opacity-0 scale-95"
          }
        `}
      >
        <div className="banking-card-ellipse overflow-hidden">
          {/* Header avec bouton fermer */}
          <div className="relative p-6 pb-4">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary/50 transition-colors"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>

            {/* Bloc de célébration */}
            {hasSignificantProgress ? (
              <div className="text-center">
                {/* Icône Trophy avec animation */}
                <div className="relative inline-flex items-center justify-center mb-4">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                  <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center">
                    <Trophy className="h-8 w-8 text-white" />
                  </div>
                  {/* Confettis décoratifs */}
                  <Sparkles className="absolute -top-2 -right-2 h-5 w-5 text-primary animate-bounce" />
                  <Sparkles className="absolute -bottom-1 -left-2 h-4 w-4 text-orange-400 animate-bounce delay-100" />
                </div>

                {/* Titre principal */}
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                  Bravo, vous avez économisé{" "}
                  <span className="text-primary">{savingsAmount}€</span>{" "}
                  cette semaine !
                </h2>

                {/* Sous-titre */}
                <p className="text-muted-foreground text-sm md:text-base">
                  C'est <span className="text-accent font-semibold">-{savingsPercent}%</span> de pertes par rapport au mois dernier.
                </p>

                {/* Mini graphique de progression */}
                <div className="mt-4 flex items-center justify-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/10">
                    <TrendingDown className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium text-accent">Pertes en baisse</span>
                  </div>
                </div>
              </div>
            ) : (
              /* État sans progrès notable */
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center">
                    <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  Voyons comment améliorer vos résultats cette semaine
                </h2>
                <p className="text-muted-foreground text-sm">
                  Voici votre plan d'optimisation personnalisé.
                </p>
              </div>
            )}
          </div>

          {/* Séparateur */}
          <div className="h-px bg-border mx-6" />

          {/* Plan d'optimisation */}
          <div className="p-6 pt-4 max-h-[40vh] md:max-h-[35vh] overflow-y-auto">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Plan d'optimisation personnalisé
            </h3>

            <div className="space-y-2">
              {optimizationPlan.map((item, idx) => (
                <Link 
                  key={idx} 
                  href={item.href}
                  onClick={handleClose}
                  className="flex items-center gap-4 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all group"
                >
                  <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      {item.badge && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>

          {/* Footer avec CTA */}
          <div className="p-6 pt-2 space-y-3">
            <Link href="/manager/reports" onClick={handleClose}>
              <Button className="w-full h-12 text-base font-semibold">
                Voir le plan complet
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleClose}
            >
              Aller au dashboard
            </Button>
            
            {/* Option pour désactiver */}
            <button
              onClick={handleDisable}
              className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              Ne plus afficher au démarrage
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
