"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  Check, 
  Sparkles, 
  Building2, 
  Users, 
  Zap,
  Crown,
  Loader2,
  ArrowRight
} from "lucide-react"
import Link from "next/link"
import { getStripe } from "@/lib/stripe-client"

const plans = [
  {
    id: 'FREE',
    name: 'Gratuit',
    description: 'Pour découvrir StockGuard',
    price: 0,
    period: '',
    icon: Sparkles,
    color: 'text-muted-foreground',
    bgColor: 'bg-secondary',
    features: [
      '1 établissement',
      '2 employés max',
      'Gestion de stock basique',
      'Alertes par email',
    ],
    cta: 'Commencer gratuitement',
    popular: false,
  },
  {
    id: 'STARTER',
    name: 'Starter',
    description: 'Pour les petits établissements',
    price: 20,
    period: '/mois',
    icon: Building2,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    features: [
      '1 établissement',
      '5 employés',
      'Gestion de stock complète',
      'Alertes temps réel',
      'Rapports mensuels',
      'Support email',
    ],
    cta: 'Essai gratuit 14 jours',
    popular: false,
  },
  {
    id: 'PRO',
    name: 'Pro',
    description: 'Pour les établissements en croissance',
    price: 80,
    period: '/mois',
    icon: Zap,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    features: [
      '3 établissements',
      '15 employés',
      'Toutes les fonctionnalités',
      'Prévisions IA',
      'Rapports avancés',
      'Support prioritaire',
      'Export données',
    ],
    cta: 'Essai gratuit 14 jours',
    popular: true,
  },
  {
    id: 'PREMIUM',
    name: 'Premium',
    description: 'Pour les chaînes de restaurants',
    price: 110,
    period: '/mois',
    icon: Crown,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    features: [
      'Établissements illimités',
      'Employés illimités',
      'Toutes les fonctionnalités',
      'API personnalisée',
      'Intégrations sur mesure',
      'Account manager dédié',
      'SLA garanti',
    ],
    cta: 'Essai gratuit 14 jours',
    popular: false,
  },
]

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (planId: string) => {
    if (planId === 'FREE') {
      window.location.href = '/login'
      return
    }

    setLoading(planId)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })

      const data = await response.json()

      if (data.error) {
        // Si pas authentifié, rediriger vers login
        if (response.status === 401) {
          window.location.href = `/login?redirect=/pricing&plan=${planId}`
          return
        }
        throw new Error(data.error)
      }

      // Rediriger vers Stripe Checkout
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

  return (
    <div className="min-h-screen banking-bg">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-foreground">StockGuard</span>
          </Link>
          <Link href="/login">
            <Button variant="outline">Se connecter</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Tarifs simples et transparents
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Commencez gratuitement, évoluez selon vos besoins. 
            <span className="text-orange-500 font-medium"> 14 jours d'essai gratuit</span> sur tous les plans payants.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {plans.map((plan) => {
              const Icon = plan.icon
              return (
                <div 
                  key={plan.id}
                  className={`relative banking-card p-6 flex flex-col ${
                    plan.popular ? 'border-orange-500 ring-2 ring-orange-500/20' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        POPULAIRE
                      </span>
                    </div>
                  )}

                  {/* Header */}
                  <div className="mb-6">
                    <div className={`h-12 w-12 rounded-xl ${plan.bgColor} flex items-center justify-center mb-4`}>
                      <Icon className={`h-6 w-6 ${plan.color}`} />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-foreground">
                        {plan.price === 0 ? 'Gratuit' : `${plan.price}€`}
                      </span>
                      {plan.period && (
                        <span className="text-muted-foreground">{plan.period}</span>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <Check className={`h-4 w-4 ${plan.color}`} />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading === plan.id}
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                        : ''
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {loading === plan.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        {plan.cta}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 border-t border-border">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            Questions fréquentes
          </h2>
          
          <div className="space-y-4">
            <div className="banking-card p-5">
              <h3 className="font-semibold text-foreground mb-2">
                Puis-je changer de plan à tout moment ?
              </h3>
              <p className="text-sm text-muted-foreground">
                Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. 
                Les changements prennent effet immédiatement et sont proratisés.
              </p>
            </div>
            
            <div className="banking-card p-5">
              <h3 className="font-semibold text-foreground mb-2">
                Comment fonctionne l'essai gratuit ?
              </h3>
              <p className="text-sm text-muted-foreground">
                Vous avez 14 jours pour tester toutes les fonctionnalités du plan choisi. 
                Aucune carte bancaire requise pour commencer. Vous ne serez facturé qu'à la fin de l'essai.
              </p>
            </div>
            
            <div className="banking-card p-5">
              <h3 className="font-semibold text-foreground mb-2">
                Quels moyens de paiement acceptez-vous ?
              </h3>
              <p className="text-sm text-muted-foreground">
                Nous acceptons les cartes Visa, Mastercard, American Express, ainsi que les prélèvements SEPA 
                pour les entreprises européennes.
              </p>
            </div>
            
            <div className="banking-card p-5">
              <h3 className="font-semibold text-foreground mb-2">
                Puis-je annuler mon abonnement ?
              </h3>
              <p className="text-sm text-muted-foreground">
                Oui, vous pouvez annuler à tout moment depuis votre espace client. 
                Vous conservez l'accès jusqu'à la fin de votre période de facturation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 StockGuard. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}
