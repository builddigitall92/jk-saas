"use client"

import { DialogTrigger } from "@/components/ui/dialog"

import { RoleNav } from "@/components/role-nav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  TrendingUp,
  AlertTriangle,
  Package,
  ShoppingCart,
  BarChart3,
  Camera,
  DollarSign,
  Lightbulb,
  Activity,
  Target,
  Calendar,
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
    <div className="p-8">
      <div className="mb-8 animate-revolut-slide-up">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold text-foreground mb-2">Tableau de Bord</h2>
            <p className="text-muted-foreground text-lg">Votre coach business silencieux</p>
          </div>
          <div className="revolut-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-semibold text-primary">En temps réel</span>
          </div>
        </div>
      </div>

      <Card className="revolut-card p-6 mb-8 border-2 border-primary/30 hover:border-primary/50 animate-revolut-fade-in">
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
                className="text-muted/20"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${(87 / 100) * 352} 352`}
                className="text-primary progress-animated"
                strokeLinecap="round"
                style={{
                  filter: "drop-shadow(0 0 8px rgba(255, 140, 66, 0.6))",
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-3xl font-bold text-foreground">87</p>
              <p className="text-xs text-muted-foreground">/100</p>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-foreground mb-4">Score de Gestion</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-sm text-muted-foreground">
                  Gestion stocks: <strong className="text-foreground">92%</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-success" />
                <span className="text-sm text-muted-foreground">
                  Rentabilité: <strong className="text-foreground">85%</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-chart-4" />
                <span className="text-sm text-muted-foreground">
                  Prévisions: <strong className="text-foreground">88%</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-chart-2" />
                <span className="text-sm text-muted-foreground">
                  Anti-gaspillage: <strong className="text-foreground">83%</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Stocks Card */}
        <Card
          className="revolut-card lg:col-span-1 p-6 border-border animate-revolut-slide-up"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Valeur du Stock</p>
              <h2 className="text-3xl font-bold text-foreground">22 450€</h2>
            </div>
            <Package className="h-6 w-6 text-primary icon-glow" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm text-muted-foreground">Surgelé: 8 450€</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success" />
              <span className="text-sm text-muted-foreground">Frais: 9 200€</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-chart-4" />
              <span className="text-sm text-muted-foreground">Sec: 4 800€</span>
            </div>
          </div>
        </Card>

        {/* Gaspillage Card */}
        <Card
          className="revolut-card lg:col-span-1 p-6 border-border animate-revolut-slide-up"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Gaspillage du jour</p>
              <h2 className="text-3xl font-bold text-destructive">- 42€</h2>
            </div>
            <AlertTriangle className="h-6 w-6 text-destructive icon-glow" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Frites</span>
              <span className="text-sm font-semibold text-destructive">- 18€</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Pain</span>
              <span className="text-sm font-semibold text-destructive">- 12€</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Autre</span>
              <span className="text-sm font-semibold text-destructive">- 12€</span>
            </div>
          </div>
        </Card>

        {/* Graphique Card */}
        <Card
          className="revolut-card lg:col-span-1 p-6 border-border animate-revolut-slide-up"
          style={{ animationDelay: "0.3s" }}
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Évolution Gaspillage</p>
              <h2 className="text-2xl font-bold text-success">-15%</h2>
            </div>
            <BarChart3 className="h-6 w-6 text-primary icon-glow" />
          </div>
          <div className="flex items-end justify-between gap-2 h-32">
            {[45, 52, 38, 41, 35, 48, 33].map((value, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-primary rounded-t-lg transition-all duration-500 hover:bg-primary/80 progress-animated"
                  style={{
                    height: `${(value / 60) * 100}%`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
                <span className="text-xs text-muted-foreground">{["L", "M", "M", "J", "V", "S", "D"][i]}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Commandes Card */}
        <Card
          className="revolut-card lg:col-span-1 p-6 border-border animate-revolut-slide-up"
          style={{ animationDelay: "0.4s" }}
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Commandes en cours</p>
              <h2 className="text-3xl font-bold text-foreground">3</h2>
            </div>
            <ShoppingCart className="h-6 w-6 text-primary icon-glow" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Fournisseur A</span>
              <span className="text-xs px-2 py-1 rounded-full bg-chart-4/20 text-chart-4">En attente</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Fournisseur B</span>
              <span className="text-xs px-2 py-1 rounded-full bg-success/20 text-success">Confirmé</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Fournisseur C</span>
              <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">En livraison</span>
            </div>
          </div>
        </Card>

        {/* Prévisions Card */}
        <Card
          className="revolut-card lg:col-span-1 p-6 border-border animate-revolut-slide-up"
          style={{ animationDelay: "0.5s" }}
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Prévisions Demain</p>
              <h2 className="text-3xl font-bold text-foreground">245</h2>
              <p className="text-sm text-muted-foreground">clients attendus</p>
            </div>
            <Target className="h-6 w-6 text-success icon-glow" />
          </div>
          <div className="relative h-20 flex items-center justify-center">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                className="text-muted/30"
              />
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${(75 / 100) * 201} 201`}
                className="text-primary progress-animated"
                strokeLinecap="round"
                style={{
                  filter: "drop-shadow(0 0 4px rgba(255, 140, 66, 0.5))",
                }}
              />
            </svg>
            <div className="absolute text-center">
              <p className="text-xl font-bold text-foreground">75%</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">Fiabilité de la prévision</p>
        </Card>

        {/* Actions Rapides Card */}
        <Card
          className="revolut-card lg:col-span-1 p-6 border-border animate-revolut-slide-up"
          style={{ animationDelay: "0.6s" }}
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Actions Rapides</p>
            </div>
            <Lightbulb className="h-6 w-6 text-primary icon-glow" />
          </div>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="revolut-button w-full justify-start text-left hover:bg-primary/10 hover:text-primary hover:border-primary bg-transparent"
              onClick={() => router.push("/manager/stock")}
            >
              <Package className="h-4 w-4 mr-2" />
              Voir les stocks
            </Button>
            <Button
              variant="outline"
              className="revolut-button w-full justify-start text-left hover:bg-primary/10 hover:text-primary hover:border-primary bg-transparent"
              onClick={() => router.push("/manager/forecasts")}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Prévisions
            </Button>
            <Button
              variant="outline"
              className="revolut-button w-full justify-start text-left hover:bg-primary/10 hover:text-primary hover:border-primary bg-transparent"
              onClick={() => router.push("/manager/orders")}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Commander
            </Button>
          </div>
        </Card>
      </div>

      <Dialog open={showPerformanceDialog} onOpenChange={setShowPerformanceDialog}>
        <DialogContent className="revolut-popup sm:max-w-lg bg-card border-primary/30">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center animate-bounce-subtle icon-glow">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <span className="revolut-badge inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold mb-2">
                  Performance hebdomadaire
                </span>
                <DialogTitle className="text-2xl font-bold text-foreground">
                  Grâce à cette application, vous avez généré
                </DialogTitle>
              </div>
            </div>
            <DialogDescription className="text-5xl font-bold text-success mt-4 animate-revolut-scale-in">
              +482€
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-muted/30 rounded-xl border border-primary/20 animate-shimmer">
              <p className="text-sm text-muted-foreground mb-2">Prévisions pour demain</p>
              <div className="flex justify-between items-center">
                <span className="text-foreground font-semibold">245 clients attendus</span>
                <span className="text-success font-semibold">+32€ économies prévues</span>
              </div>
            </div>
            <Button
              onClick={() => setShowPerformanceDialog(false)}
              className="revolut-button w-full bg-primary hover:bg-primary/90"
            >
              Continuer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Actions Rapides</p>
            </div>
            <Lightbulb className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start text-left hover:bg-primary/10 hover:text-primary hover:border-primary bg-transparent"
              onClick={() => router.push("/manager/stock")}
            >
              <Package className="h-4 w-4 mr-2" />
              Voir les stocks
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-left hover:bg-primary/10 hover:text-primary hover:border-primary bg-transparent"
              onClick={() => router.push("/manager/forecasts")}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Prévisions
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-left hover:bg-primary/10 hover:text-primary hover:border-primary bg-transparent"
              onClick={() => router.push("/manager/orders")}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Commander
            </Button>
          </div>
        </Card>
      </main>
    </div>
  )
}
