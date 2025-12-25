"use client"

import { useState } from "react"
import { RoleNav } from "@/components/role-nav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DollarSign, ArrowLeft, TrendingUp, TrendingDown, AlertTriangle, Shield, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { AIAssistant } from "@/components/ai-assistant/AIAssistant"

const products = [
  { name: "Tacos Poulet", cost: 2.4, price: 7.5, margin: 68, trend: "stable", sales: 142 },
  {
    name: "Burger Classic",
    cost: 1.8,
    price: 6.5,
    margin: 72,
    trend: "down",
    sales: 98,
    alert: "Marge en baisse de 12%",
  },
  { name: "Menu Enfant", cost: 2.1, price: 5.9, margin: 64, trend: "up", sales: 67 },
  { name: "Wrap Végé", cost: 1.95, price: 6.9, margin: 72, trend: "up", sales: 54 },
  { name: "Frites Large", cost: 0.85, price: 3.5, margin: 76, trend: "stable", sales: 203 },
  { name: "Boisson 50cl", cost: 0.45, price: 2.5, margin: 82, trend: "stable", sales: 287 },
]

export default function MarginsPage() {
  const router = useRouter()
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <RoleNav role="manager" />

      <main className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-12">
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
            <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <Shield className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground">Coûts & Marges en Temps Réel</h2>
              <p className="text-muted-foreground">Vous savez enfin ce que vous gagnez</p>
            </div>
          </div>
          <button 
            className="ai-trigger-btn"
            onClick={() => setIsAIAssistantOpen(true)}
          >
            <Sparkles className="h-4 w-4" />
            <span>Optimiser avec l'IA</span>
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Marge Moyenne</p>
            </div>
            <p className="text-3xl font-bold text-primary">72%</p>
            <p className="text-xs text-muted-foreground mt-1">Tous produits confondus</p>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
              <p className="text-sm text-muted-foreground">Meilleure Marge</p>
            </div>
            <p className="text-3xl font-bold text-foreground">Boisson 50cl</p>
            <p className="text-xs text-muted-foreground mt-1">82% de marge</p>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-sm text-muted-foreground">Bénéfice Estimé</p>
            </div>
            <p className="text-3xl font-bold text-foreground">+2 847€</p>
            <p className="text-xs text-muted-foreground mt-1">Cette semaine</p>
          </Card>
        </div>

        <Card className="p-6 mb-6 bg-destructive/5 border-2 border-destructive/50">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-destructive/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground mb-2">
                La marge de votre Burger Classic a baissé de 12% cette semaine
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Coût matière en hausse. Votre fournisseur a augmenté ses prix.
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="px-4 py-2 bg-primary/10 border border-primary/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Suggestion</p>
                  <p className="text-sm font-semibold text-primary">Augmenter le prix de 0,50€ = +340€/mois</p>
                </div>
                <div className="px-4 py-2 bg-accent/10 border border-accent/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Alternative</p>
                  <p className="text-sm font-semibold text-accent">Changer de fournisseur = économie de 0,30€/unité</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-3">
          {products.map((product, index) => (
            <Card key={index} className="p-5 bg-card border-border hover:border-primary/30 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">{product.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Coût : {product.cost.toFixed(2)}€</span>
                      <span>•</span>
                      <span>Vente : {product.price.toFixed(2)}€</span>
                      <span>•</span>
                      <span>{product.sales} ventes/sem</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {product.alert && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-destructive/10 border border-destructive/30 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <span className="text-xs font-medium text-destructive">{product.alert}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {product.trend === "up" && <TrendingUp className="h-5 w-5 text-primary" />}
                    {product.trend === "down" && <TrendingDown className="h-5 w-5 text-destructive" />}
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{product.margin}%</p>
                      <p className="text-xs text-muted-foreground">marge</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* AI Assistant */}
        <AIAssistant
          isOpen={isAIAssistantOpen}
          onClose={() => setIsAIAssistantOpen(false)}
          mode="margin"
        />
      </main>
    </div>
  )
}
