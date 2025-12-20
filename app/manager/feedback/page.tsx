"use client"

import { RoleNav } from "@/components/role-nav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Shield, TrendingUp, Users, CheckCircle, Heart, Sparkles } from "lucide-react"
import Link from "next/link"

const feedbackHistory = [
  {
    employeeName: "Jean Dupont",
    date: "18 Déc 2024",
    time: "18:30",
    type: "positive",
    context: "Service clôturé sans anomalie",
    serviceStatus: "OK",
    issuesReported: 0,
    wasteReported: false,
  },
  {
    employeeName: "Marie Martin",
    date: "18 Déc 2024",
    time: "17:45",
    type: "honesty",
    context: "Pertes déclarées honnêtement",
    serviceStatus: "Avec pertes",
    issuesReported: 0,
    wasteReported: true,
  },
  {
    employeeName: "Sophie Bernard",
    date: "18 Déc 2024",
    time: "16:20",
    type: "rush",
    context: "Rush hour géré efficacement",
    serviceStatus: "OK",
    issuesReported: 0,
    wasteReported: false,
  },
  {
    employeeName: "Lucas Petit",
    date: "17 Déc 2024",
    time: "19:15",
    type: "responsible",
    context: "Fin de service confirmée",
    serviceStatus: "OK",
    issuesReported: 1,
    wasteReported: false,
  },
]

const feedbackStats = {
  totalFeedbacks: 127,
  positiveFeedbacks: 98,
  honestyRate: 89,
  avgResponseTime: "2.3 min",
}

export default function ManagerFeedbackPage() {
  return (
    <div className="min-h-screen bg-background">
      <RoleNav role="manager" />

      <main className="mx-auto max-w-7xl px-6 py-8 sm:px-8">
        {/* Header avec retour */}
        <div className="flex items-center gap-4 mb-8 animate-in fade-in slide-in-from-top duration-500">
          <Link href="/manager">
            <Button
              variant="outline"
              className="gap-2 border-2 border-primary/20 hover:border-primary hover:bg-primary/10 transition-all duration-300 group bg-transparent"
            >
              <ArrowLeft className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
              <Shield className="h-5 w-5 text-primary group-hover:rotate-12 transition-transform" />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-foreground">Feedbacks Employés</h1>
            <p className="text-muted-foreground text-lg">Suivi des retours positifs automatiques</p>
          </div>
        </div>

        {/* Stats globales */}
        <div className="grid md:grid-cols-4 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="p-6 bg-card border-border hover:border-primary/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Feedbacks</p>
              <CheckCircle className="h-5 w-5 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground">{feedbackStats.totalFeedbacks}</p>
            <p className="text-xs text-primary mt-1">Ce mois-ci</p>
          </Card>

          <Card className="p-6 bg-card border-border hover:border-primary/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Taux Positif</p>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground">
              {Math.round((feedbackStats.positiveFeedbacks / feedbackStats.totalFeedbacks) * 100)}%
            </p>
            <p className="text-xs text-primary mt-1">+5% vs mois dernier</p>
          </Card>

          <Card className="p-6 bg-card border-border hover:border-primary/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Taux Honnêteté</p>
              <Heart className="h-5 w-5 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground">{feedbackStats.honestyRate}%</p>
            <p className="text-xs text-primary mt-1">Déclarations complètes</p>
          </Card>

          <Card className="p-6 bg-card border-border hover:border-primary/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Temps Moyen</p>
              <Users className="h-5 w-5 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground">{feedbackStats.avgResponseTime}</p>
            <p className="text-xs text-primary mt-1">Clôture service</p>
          </Card>
        </div>

        {/* Historique des feedbacks */}
        <Card className="p-6 bg-card border-border animate-in fade-in slide-in-from-bottom-6 duration-500 delay-100">
          <h2 className="text-2xl font-bold text-foreground mb-6">Historique Récent</h2>

          <div className="space-y-4">
            {feedbackHistory.map((feedback, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-5 bg-background border-2 border-border rounded-lg hover:border-primary/30 transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {feedback.type === "positive" && <Sparkles className="h-6 w-6 text-primary" />}
                  {feedback.type === "honesty" && <Heart className="h-6 w-6 text-primary" />}
                  {feedback.type === "rush" && <TrendingUp className="h-6 w-6 text-primary" />}
                  {feedback.type === "responsible" && <CheckCircle className="h-6 w-6 text-primary" />}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-lg font-bold text-foreground">{feedback.employeeName}</p>
                      <p className="text-sm text-muted-foreground">
                        {feedback.date} à {feedback.time}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                        Feedback Déclenché
                      </span>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3 mt-3">
                    <div className="p-3 bg-card border border-border rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Contexte</p>
                      <p className="text-sm font-medium text-foreground">{feedback.context}</p>
                    </div>
                    <div className="p-3 bg-card border border-border rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">État Service</p>
                      <p className="text-sm font-medium text-foreground">{feedback.serviceStatus}</p>
                    </div>
                    <div className="p-3 bg-card border border-border rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Pertes Déclarées</p>
                      <p className="text-sm font-medium text-foreground">{feedback.wasteReported ? "Oui" : "Non"}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Note d'information */}
        <Card className="p-6 bg-primary/5 border-primary/20 mt-6 animate-in fade-in duration-500 delay-200">
          <div className="flex gap-3">
            <Sparkles className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-bold text-foreground mb-2">À propos des Feedbacks</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Les feedbacks positifs sont déclenchés automatiquement pour encourager les bons comportements. Les
                messages vus par les employés ne sont jamais négatifs et valorisent l'honnêteté. Cette vue vous permet
                de suivre l'engagement de votre équipe sans créer de surveillance oppressante.
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
