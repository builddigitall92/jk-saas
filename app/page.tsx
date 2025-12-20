"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Shield, Users, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-16 animate-revolut-fade-in">
          <div className="inline-flex items-center justify-center gap-3 mb-6 animate-float">
            <Shield className="h-16 w-16 text-primary icon-glow" strokeWidth={1.5} />
          </div>
          <h1 className="text-6xl font-bold text-foreground mb-4 tracking-tight">StockGuard</h1>
          <p className="text-xl text-muted-foreground">Système de gestion de stock et réduction du gaspillage</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card
            className="revolut-card p-8 border-2 border-border hover:border-primary/50 cursor-pointer group animate-revolut-slide-up"
            onClick={() => router.push("/manager")}
            style={{ animationDelay: "0.2s" }}
          >
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="h-24 w-24 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
                <Shield className="h-12 w-12 text-primary group-hover:icon-glow transition-all" strokeWidth={1.5} />
              </div>

              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-foreground">Patron</h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Gérez les stocks, commandes, prévisions et rapports financiers
                </p>
              </div>

              <Button className="revolut-button w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-lg group-hover:gap-4 transition-all duration-300">
                Accéder
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </Card>

          <Card
            className="revolut-card p-8 border-2 border-border hover:border-accent/50 cursor-pointer group animate-revolut-slide-up"
            onClick={() => router.push("/employee")}
            style={{ animationDelay: "0.3s" }}
          >
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="h-24 w-24 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-all duration-300 group-hover:scale-110">
                <Users className="h-12 w-12 text-accent group-hover:icon-glow transition-all" strokeWidth={1.5} />
              </div>

              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-foreground">Employé</h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Enregistrez le gaspillage, mettez à jour les stocks et vérifiez le service
                </p>
              </div>

              <Button className="revolut-button w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90 h-12 text-lg group-hover:gap-4 transition-all duration-300">
                Accéder
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </Card>
        </div>

        <div
          className="text-center mt-12 text-sm text-muted-foreground animate-revolut-fade-in"
          style={{ animationDelay: "0.5s" }}
        >
          Sélectionnez votre rôle pour commencer
        </div>
      </div>
    </div>
  )
}
