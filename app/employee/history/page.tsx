"use client"

import { RoleNav } from "@/components/role-nav"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Package, Trash2, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function EmployeeHistoryPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      <RoleNav role="employee" />

      <main className="mx-auto max-w-5xl px-6 py-8">
        <Button onClick={() => router.back()} variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>

        <h2 className="text-4xl font-bold text-foreground mb-2">Mon Historique</h2>
        <p className="text-muted-foreground mb-8">Consultation facultative de vos actions passées</p>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-5 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-3 mb-2">
              <Package className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Cette semaine</span>
            </div>
            <p className="text-3xl font-bold text-primary">43</p>
            <p className="text-sm text-muted-foreground">Mises à jour de stock</p>
          </Card>

          <Card className="p-5 bg-destructive/5 border-destructive/20">
            <div className="flex items-center gap-3 mb-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              <span className="text-sm text-muted-foreground">Cette semaine</span>
            </div>
            <p className="text-3xl font-bold text-destructive">12</p>
            <p className="text-sm text-muted-foreground">Gaspillages enregistrés</p>
          </Card>

          <Card className="p-5 bg-accent/5 border-accent/20">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="h-5 w-5 text-accent" />
              <span className="text-sm text-muted-foreground">Cette semaine</span>
            </div>
            <p className="text-3xl font-bold text-accent">28</p>
            <p className="text-sm text-muted-foreground">Checks de service</p>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-xl font-bold text-foreground mb-4">Activités récentes</h3>
          <div className="space-y-3">
            {[
              { type: "stock", text: "Mise à jour : Frites +10kg", time: "Il y a 2h" },
              { type: "waste", text: "Gaspillage : Pain 500g", time: "Il y a 4h" },
              { type: "check", text: "Check service : Tout OK", time: "Il y a 6h" },
              { type: "stock", text: "Mise à jour : Canettes +24 unités", time: "Hier" },
              { type: "waste", text: "Gaspillage : Frites 2kg", time: "Hier" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                {item.type === "stock" && <Package className="h-4 w-4 text-primary" />}
                {item.type === "waste" && <Trash2 className="h-4 w-4 text-destructive" />}
                {item.type === "check" && <CheckCircle className="h-4 w-4 text-accent" />}
                <span className="flex-1 text-sm text-foreground">{item.text}</span>
                <span className="text-xs text-muted-foreground">{item.time}</span>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  )
}
