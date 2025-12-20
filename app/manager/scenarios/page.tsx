"use client"

import { RoleNav } from "@/components/role-nav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Lightbulb, ArrowLeft, TrendingUp, TrendingDown, Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Slider } from "@/components/ui/slider"

export default function ScenariosPage() {
  const router = useRouter()
  const [portionReduction, setPortionReduction] = useState([10])
  const [priceIncrease, setPriceIncrease] = useState([0.5])

  const portionImpact = Math.round(portionReduction[0] * 28)
  const priceImpact = Math.round(priceIncrease[0] * 680)

  return (
    <div className="min-h-screen bg-background">
      <RoleNav role="manager" />

      <main className="mx-auto max-w-6xl px-6 py-8 sm:px-8 lg:px-12">
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => router.push("/manager")}
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-xl border-2 hover:bg-primary/10 hover:border-primary/50 transition-all group"
          >
            <ArrowLeft className="h-5 w-5 group-hover:scale-110 transition-transform" />
          </Button>
          <div className="flex items-center gap-3 flex-1">
            <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Shield className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground">Scénarios Business "Et si..."</h2>
              <p className="text-muted-foreground">Testez vos décisions avant de les appliquer</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card className="p-6 bg-card border-2 border-border hover:border-primary/50 transition-all">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Lightbulb className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Réduire les portions</h3>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Réduction</span>
                <span className="text-2xl font-bold text-primary">{portionReduction[0]}%</span>
              </div>
              <Slider
                value={portionReduction}
                onValueChange={setPortionReduction}
                max={25}
                min={5}
                step={5}
                className="mb-4"
              />
            </div>

            <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold text-primary">Impact Financier</span>
              </div>
              <p className="text-3xl font-bold text-foreground">+{portionImpact}€/mois</p>
              <p className="text-sm text-muted-foreground mt-2">Économie sur les coûts matière première</p>
            </div>
          </Card>

          <Card className="p-6 bg-card border-2 border-border hover:border-accent/50 transition-all">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <Lightbulb className="h-5 w-5 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Augmenter les prix</h3>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Augmentation</span>
                <span className="text-2xl font-bold text-accent">+{priceIncrease[0].toFixed(2)}€</span>
              </div>
              <Slider
                value={priceIncrease}
                onValueChange={setPriceIncrease}
                max={2}
                min={0.25}
                step={0.25}
                className="mb-4"
              />
            </div>

            <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-accent" />
                <span className="text-sm font-semibold text-accent">Impact Financier</span>
              </div>
              <p className="text-3xl font-bold text-foreground">+{priceImpact}€/mois</p>
              <p className="text-sm text-muted-foreground mt-2">Augmentation du chiffre d'affaires</p>
            </div>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 bg-card border-2 border-border hover:border-destructive/50 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-destructive" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Fermer le lundi</h3>
            </div>

            <p className="text-muted-foreground mb-4">
              Le lundi est votre jour le moins rentable. Analyse de l'impact d'une fermeture.
            </p>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-lg">
                <span className="text-sm text-muted-foreground">CA moyen lundi</span>
                <span className="text-sm font-semibold text-foreground">380€</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-lg">
                <span className="text-sm text-muted-foreground">Coûts fixes/jour</span>
                <span className="text-sm font-semibold text-foreground">260€</span>
              </div>
            </div>

            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-5 w-5 text-destructive" />
                <span className="text-sm font-semibold text-destructive">Impact Financier</span>
              </div>
              <p className="text-3xl font-bold text-foreground">-120€/semaine</p>
              <p className="text-sm text-muted-foreground mt-2">Mais économie sur les charges fixes</p>
            </div>
          </Card>

          <Card className="p-6 bg-card border-2 border-border hover:border-primary/50 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Changer de fournisseur</h3>
            </div>

            <p className="text-muted-foreground mb-4">
              Comparaison avec un fournisseur alternatif offrant de meilleurs tarifs.
            </p>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-lg">
                <span className="text-sm text-muted-foreground">Économie pain</span>
                <span className="text-sm font-semibold text-primary">-15%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-lg">
                <span className="text-sm text-muted-foreground">Économie frites</span>
                <span className="text-sm font-semibold text-primary">-12%</span>
              </div>
            </div>

            <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold text-primary">Impact Financier</span>
              </div>
              <p className="text-3xl font-bold text-foreground">+450€/mois</p>
              <p className="text-sm text-muted-foreground mt-2">Réduction des coûts d'approvisionnement</p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
