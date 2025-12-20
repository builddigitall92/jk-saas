"use client"

import { RoleNav } from "@/components/role-nav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Package,
  ShoppingCart,
  BarChart3,
  Camera,
  DollarSign,
  Lightbulb,
  Activity,
  Heart,
  Target,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

const lossData = [
  { day: "Lun", loss: 45 },
  { day: "Mar", loss: 52 },
  { day: "Mer", loss: 38 },
  { day: "Jeu", loss: 61 },
  { day: "Ven", loss: 73 },
  { day: "Sam", loss: 55 },
  { day: "Dim", loss: 42 },
]

const anomalies = [
  {
    title: "Consommation de frites anormale détectée",
    description: "Mardi soir : +18% vs moyenne habituelle",
    severity: "warning",
  },
  {
    title: "Portions de pain réduites",
    description: "Économie de 23€ cette semaine grâce aux ajustements",
    severity: "success",
  },
  {
    title: "Pic de commandes inhabituelles",
    description: "Samedi 20h : +45% par rapport au samedi précédent",
    severity: "info",
  },
]

export default function ManagerDashboard() {
  const router = useRouter()
  const [weeklyPerformance] = useState<"positive" | "negative">("positive")
  const [chartData] = useState([
    { day: "Lun", gaspillage: 45 },
    { day: "Mar", gaspillage: 52 },
    { day: "Mer", gaspillage: 38 },
    { day: "Jeu", gaspillage: 41 },
    { day: "Ven", gaspillage: 35 },
    { day: "Sam", gaspillage: 48 },
    { day: "Dim", gaspillage: 33 },
  ])

  const [showPerformanceDialog, setShowPerformanceDialog] = useState(true)

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="revolut-card p-8 mb-6 border border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="relative">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-muted/30"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(87 / 100) * 352} 352`}
                  className="text-primary transition-all duration-1000"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-4xl font-bold text-foreground">87</p>
                  <p className="text-xs text-muted-foreground">/100</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-foreground mb-2">Score de gestion</h3>
              <p className="text-muted-foreground text-base mb-3">Excellente performance cette semaine</p>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm text-primary font-semibold">+5 points vs semaine dernière</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-primary/5 rounded-xl border border-primary/20">
              <p className="text-2xl font-bold text-primary">92%</p>
              <p className="text-xs text-muted-foreground mt-1">Gestion stocks</p>
            </div>
            <div className="text-center p-4 bg-accent/5 rounded-xl border border-accent/20">
              <p className="text-2xl font-bold text-accent">85%</p>
              <p className="text-xs text-muted-foreground mt-1">Rentabilité</p>
            </div>
            <div className="text-center p-4 bg-blue-500/5 rounded-xl border border-blue-500/20">
              <p className="text-2xl font-bold text-blue-500">88%</p>
              <p className="text-xs text-muted-foreground mt-1">Prévisions</p>
            </div>
            <div className="text-center p-4 bg-green-500/5 rounded-xl border border-green-500/20">
              <p className="text-2xl font-bold text-green-500">83%</p>
              <p className="text-xs text-muted-foreground mt-1">Anti-gaspillage</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pop-up de performance */}
      <Dialog open={showPerformanceDialog} onOpenChange={setShowPerformanceDialog}>
        <DialogContent className="revolut-popup sm:max-w-lg bg-card border-border">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold mb-2">
                  Performance hebdomadaire
                </span>
                <DialogTitle className="text-3xl font-bold text-foreground">
                  Grâce à cette application, vous avez généré +482€
                </DialogTitle>
              </div>
            </div>
            <DialogDescription className="text-base text-muted-foreground pt-2">
              Cette semaine, StockGuard vous a aidé à économiser et optimiser vos opérations
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="text-center space-y-3">
              <p className="text-4xl font-bold text-primary">
                {weeklyPerformance === "positive" ? "+482 €" : "-317 €"}
              </p>

              <p className="text-lg text-foreground">
                {weeklyPerformance === "positive"
                  ? "Grâce à cette application, vous avez généré cette économie cette semaine"
                  : "Cette semaine, vous avez perdu"}
              </p>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {weeklyPerformance === "positive"
                  ? "Meilleure gestion des portions, baisse du gaspillage et commandes optimisées."
                  : "Causes principales : surconsommation, commandes excessives, baisse de marge."}
              </p>
            </div>

            {/* Prévisions pour demain */}
            <div className="bg-background/60 rounded-lg p-4 space-y-3 border border-primary/10">
              <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Prévisions pour demain
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-card/50 rounded p-3 space-y-1">
                  <p className="text-xs text-muted-foreground">Clients attendus</p>
                  <p className="text-2xl font-bold text-primary">127</p>
                </div>

                <div className="bg-card/50 rounded p-3 space-y-1">
                  <p className="text-xs text-muted-foreground">Économies prévues</p>
                  <p className="text-2xl font-bold text-primary">+65€</p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setShowPerformanceDialog(false)}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Continuer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Carte de performance hebdomadaire existante - simplifiée */}
      <Card className="group hover:shadow-xl transition-all duration-300 border-primary/20 bg-gradient-to-br from-card/50 to-background">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">
                {weeklyPerformance === "positive" ? "Excellente semaine" : "Semaine difficile"}
              </span>
            </div>

            <p className="text-2xl font-semibold text-foreground mb-3">
              {weeklyPerformance === "positive"
                ? "Grâce à cette application, vous avez généré +482 €"
                : "Cette semaine : -317 €"}
            </p>

            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              {weeklyPerformance === "positive"
                ? "Meilleure gestion des portions, baisse du gaspillage et commandes optimisées."
                : "Causes principales : surconsommation, commandes excessives, baisse de marge."}
            </p>

            {weeklyPerformance === "positive" ? (
              <Dialog>
                <DialogTrigger asChild>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/30 cursor-pointer hover:bg-primary/20 transition-all">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span className="text-lg font-semibold text-primary">À ce rythme : +1 930 € par mois</span>
                  </div>
                </DialogTrigger>
                <DialogContent className="revolut-popup sm:max-w-md bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="text-2xl text-primary flex items-center gap-2">
                      <TrendingUp className="h-6 w-6" />
                      Projection mensuelle
                    </DialogTitle>
                    <DialogDescription className="text-base text-muted-foreground pt-4">
                      Si vous maintenez ce rythme, voici vos économies projetées :
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <span className="text-muted-foreground">Ce mois</span>
                      <span className="text-2xl font-bold text-primary">+1 930 €</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <span className="text-muted-foreground">Dans 3 mois</span>
                      <span className="text-2xl font-bold text-primary">+5 790 €</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <span className="text-muted-foreground">Sur 1 an</span>
                      <span className="text-2xl font-bold text-primary">+23 160 €</span>
                    </div>
                    <p className="text-sm text-muted-foreground italic pt-2">
                      Ces projections sont basées sur vos performances actuelles et peuvent varier.
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <Button
                onClick={() => router.push("/manager/reports")}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                Voir comment corriger
              </Button>
            )}
          </div>

          <div
            className={`h-24 w-24 rounded-2xl flex items-center justify-center ${
              weeklyPerformance === "positive" ? "bg-primary/20" : "bg-destructive/20"
            }`}
          >
            {weeklyPerformance === "positive" ? (
              <TrendingUp className="h-12 w-12 text-primary" />
            ) : (
              <TrendingDown className="h-12 w-12 text-destructive" />
            )}
          </div>
        </div>
      </Card>

      <RoleNav role="manager" />

      <main className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-12">
        <div className="mb-8 animate-slide-up">
          <h2 className="text-4xl font-bold text-foreground mb-2">Tableau de Bord</h2>
          <p className="text-muted-foreground text-lg">Votre coach business silencieux</p>
        </div>

        <Card className="revolut-card p-6 mb-8 border-2 border-primary/30 hover:border-primary/50">
          <div className="flex items-start gap-4 mb-4">
            <div className="h-14 w-14 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Target className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-foreground mb-2">Décision du jour</h3>
              <p className="text-sm text-muted-foreground mb-4">Recommandation basée sur vos données en temps réel</p>
            </div>
          </div>

          <div className="bg-card/50 rounded-xl p-5 border border-primary/20">
            <p className="text-lg font-semibold text-foreground mb-3">
              Commander 15 kg de frites supplémentaires pour le week-end
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Basé sur : afflux prévu de +28% samedi, stock actuel insuffisant pour tenir jusqu'à lundi
            </p>
            <div className="flex items-center gap-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    Commander maintenant
                  </Button>
                </DialogTrigger>
                <DialogContent className="revolut-popup sm:max-w-md bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="text-2xl text-primary">Confirmer la commande</DialogTitle>
                    <DialogDescription className="text-base text-muted-foreground pt-4">
                      Vous êtes sur le point de commander 15 kg de frites auprès de votre fournisseur habituel.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Produit</span>
                        <span className="font-semibold text-foreground">Frites surgelées</span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Quantité</span>
                        <span className="font-semibold text-foreground">15 kg</span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Prix unitaire</span>
                        <span className="font-semibold text-foreground">2.80 €/kg</span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <span className="text-sm font-semibold text-foreground">Total</span>
                        <span className="text-xl font-bold text-primary">42.00 €</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1 bg-primary hover:bg-primary/90">Confirmer</Button>
                      <Button variant="outline" className="flex-1 bg-transparent">
                        Annuler
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button size="sm" variant="outline">
                Plus tard
              </Button>
              <Button size="sm" variant="ghost">
                Ignorer
              </Button>
            </div>
          </div>
        </Card>

        <div className="mb-8 animate-fade-in-scale">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <Activity className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">Détection intelligente des anomalies</h3>
              <p className="text-sm text-muted-foreground">
                Le système analyse automatiquement vos habitudes de consommation
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {anomalies.map((anomaly, index) => (
              <Dialog key={index}>
                <DialogTrigger asChild>
                  <Card
                    className={`revolut-card p-5 border-2 cursor-pointer ${
                      anomaly.severity === "warning"
                        ? "border-accent/40 hover:border-accent"
                        : anomaly.severity === "success"
                          ? "border-primary/40 hover:border-primary"
                          : "border-blue-500/40 hover:border-blue-500"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          anomaly.severity === "warning"
                            ? "bg-accent/20"
                            : anomaly.severity === "success"
                              ? "bg-primary/20"
                              : "bg-blue-500/20"
                        }`}
                      >
                        {anomaly.severity === "warning" && <AlertTriangle className="h-5 w-5 text-accent" />}
                        {anomaly.severity === "success" && <TrendingUp className="h-5 w-5 text-primary" />}
                        {anomaly.severity === "info" && <Activity className="h-5 w-5 text-blue-500" />}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground mb-1">{anomaly.title}</p>
                        <p className="text-sm text-muted-foreground">{anomaly.description}</p>
                      </div>
                    </div>
                  </Card>
                </DialogTrigger>
                <DialogContent className="revolut-popup sm:max-w-md bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="text-2xl">{anomaly.title}</DialogTitle>
                    <DialogDescription className="text-base text-muted-foreground pt-4">
                      {anomaly.description}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Action recommandée :</p>
                      <p className="text-foreground">
                        {anomaly.severity === "warning"
                          ? "Surveillez la consommation et ajustez les portions si nécessaire."
                          : anomaly.severity === "success"
                            ? "Continuez sur cette lancée ! Vos ajustements portent leurs fruits."
                            : "Préparez-vous à une affluence similaire les prochains samedis."}
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8 animate-in fade-in slide-in-from-bottom duration-500 delay-100">
          {/* Photo → Stock */}
          <Card className="p-6 bg-card border-border hover:border-primary/50 transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-start gap-4 mb-4">
              <div className="h-14 w-14 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Camera className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-1">Prenez une photo. C'est fait.</h3>
                <p className="text-sm text-muted-foreground">Une photo suffit pour mettre votre stock à jour</p>
              </div>
            </div>
            <div className="bg-muted/30 border border-border rounded-lg p-8 flex items-center justify-center mb-4">
              <div className="text-center">
                <Camera className="h-16 w-16 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Scanner une facture ou un bon de livraison</p>
              </div>
            </div>
            <Button
              onClick={() => router.push("/manager/photo-stock")}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Prendre une photo
            </Button>
          </Card>

          {/* Coût & Marge */}
          <Card className="p-6 bg-card border-border hover:border-accent/50 transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-start gap-4 mb-4">
              <div className="h-14 w-14 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                <DollarSign className="h-7 w-7 text-accent" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-1">Vous savez enfin ce que vous gagnez</h3>
                <p className="text-sm text-muted-foreground">Coût réel et marge exacte par produit</p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-lg">
                <span className="text-sm font-medium text-foreground">Tacos Poulet</span>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">Marge : 68%</p>
                  <p className="text-xs text-muted-foreground">Coût : 2,40€ • Vente : 7,50€</p>
                </div>
              </div>

              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-semibold text-destructive">
                    La marge de votre burger a baissé de 12% cette semaine
                  </span>
                </div>
                <p className="text-xs text-muted-foreground ml-6">
                  Suggestion : Augmenter le prix de 0,50€ = +340€ par mois
                </p>
              </div>
            </div>

            <Button
              onClick={() => router.push("/manager/margins")}
              variant="outline"
              className="w-full border-2 hover:bg-accent/5 hover:border-accent/50"
            >
              Voir toutes les marges
            </Button>
          </Card>
        </div>

        <Card className="p-6 mb-8 bg-card border-border animate-in fade-in slide-in-from-bottom-6 duration-500 delay-250">
          <div className="flex items-start gap-4 mb-6">
            <div className="h-14 w-14 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="h-7 w-7 text-blue-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-1">Et si...</h3>
              <p className="text-muted-foreground">Testez vos décisions avant de les appliquer</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Button
              onClick={() => router.push("/manager/scenarios")}
              variant="outline"
              className="h-auto p-5 border-2 hover:bg-primary/5 hover:border-primary/50 flex-col items-start gap-2 group transition-all duration-300"
            >
              <p className="font-semibold text-foreground">Réduire les portions de 10%</p>
              <p className="text-sm text-muted-foreground">Impact estimé : +280€/mois</p>
            </Button>

            <Button
              onClick={() => router.push("/manager/scenarios")}
              variant="outline"
              className="h-auto p-5 border-2 hover:bg-accent/5 hover:border-accent/50 flex-col items-start gap-2 group transition-all duration-300"
            >
              <p className="font-semibold text-foreground">Augmenter un prix de 0,50€</p>
              <p className="text-sm text-muted-foreground">Impact estimé : +340€/mois</p>
            </Button>

            <Button
              onClick={() => router.push("/manager/scenarios")}
              variant="outline"
              className="h-auto p-5 border-2 hover:bg-blue-500/5 hover:border-blue-500/50 flex-col items-start gap-2 group transition-all duration-300"
            >
              <p className="font-semibold text-foreground">Fermer le lundi</p>
              <p className="text-sm text-muted-foreground">Impact estimé : -120€/semaine</p>
            </Button>

            <Button
              onClick={() => router.push("/manager/scenarios")}
              variant="outline"
              className="h-auto p-5 border-2 hover:bg-primary/5 hover:border-primary/50 flex-col items-start gap-2 group transition-all duration-300"
            >
              <p className="font-semibold text-foreground">Changer de fournisseur</p>
              <p className="text-sm text-muted-foreground">Impact estimé : +450€/mois</p>
            </Button>
          </div>
        </Card>

        {/* Actions rapides */}
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 delay-300">
          <h3 className="text-2xl font-bold text-foreground mb-4">Actions Rapides</h3>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={() => router.push("/manager/stock")}
              className="h-auto p-6 bg-primary hover:bg-primary/90 text-primary-foreground flex-col items-start gap-3 group hover:scale-105 transition-all duration-300"
            >
              <Package className="h-8 w-8 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <p className="font-bold text-lg mb-1">Gérer les</p>
                <p className="text-sm opacity-90">stocks</p>
              </div>
            </Button>

            <Button
              onClick={() => router.push("/manager/forecasts")}
              className="h-auto p-6 bg-accent hover:bg-accent/90 text-accent-foreground flex-col items-start gap-3 group hover:scale-105 transition-all duration-300"
            >
              <BarChart3 className="h-8 w-8 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <p className="font-bold text-lg mb-1">Voir les</p>
                <p className="text-sm opacity-90">prévisions</p>
              </div>
            </Button>

            <Button
              onClick={() => router.push("/manager/orders")}
              variant="outline"
              className="h-auto p-6 border-2 border-border hover:border-primary/50 hover:bg-primary/5 flex-col items-start gap-3 group hover:scale-105 transition-all duration-300"
            >
              <ShoppingCart className="h-8 w-8 mb-2 text-primary group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <p className="font-bold text-lg mb-1">Créer une</p>
                <p className="text-sm text-muted-foreground">commande</p>
              </div>
            </Button>

            <Button
              onClick={() => router.push("/manager/reports")}
              variant="outline"
              className="h-auto p-6 border-2 border-border hover:border-accent/50 hover:bg-accent/5 flex-col items-start gap-3 group hover:scale-105 transition-all duration-300"
            >
              <BarChart3 className="h-8 w-8 mb-2 text-accent group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <p className="font-bold text-lg mb-1">Rapports</p>
                <p className="text-sm text-muted-foreground">financiers</p>
              </div>
            </Button>
          </div>
        </div>

        {/* Feedbacks Employés */}
        <Card className="mt-8 p-6 bg-primary/5 border-primary/20 hover:border-primary/40 transition-all duration-300 animate-in fade-in duration-500 delay-350">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Heart className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-1">Feedbacks Positifs Employés</h3>
                <p className="text-sm text-muted-foreground">
                  Suivez l'engagement de votre équipe • 98 feedbacks ce mois-ci
                </p>
              </div>
            </div>
            <Button
              onClick={() => router.push("/manager/feedback")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Voir les feedbacks
            </Button>
          </div>
        </Card>
      </main>
    </div>
  )
}
