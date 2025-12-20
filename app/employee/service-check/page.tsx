"use client"

import { RoleNav } from "@/components/role-nav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PositiveFeedbackDialog } from "@/components/positive-feedback-dialog"
import { CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react"
import { useState } from "react"

const checkItems = [
  { id: "fries", label: "Frites disponibles", category: "Stock" },
  { id: "bread", label: "Pain hamburger", category: "Stock" },
  { id: "hotdog", label: "Pain hot-dog", category: "Stock" },
  { id: "meat", label: "Viande disponible", category: "Stock" },
  { id: "veggies", label: "Légumes frais", category: "Hygiène" },
  { id: "sauces", label: "Sauces complètes", category: "Matériel" },
  { id: "cleanliness", label: "Propreté cuisine", category: "Hygiène" },
  { id: "equipment", label: "Équipements fonctionnels", category: "Matériel" },
]

const previousChecks = [
  {
    time: "14:30",
    status: "ok",
    issues: 0,
    note: "Service OK, tout est en ordre",
  },
  {
    time: "12:15",
    status: "issues",
    issues: 2,
    note: "Manque 2 pains hot-dog, commande effectuée",
  },
]

export default function EmployeeServiceCheckPage() {
  const [checkStatus, setCheckStatus] = useState<Record<string, "ok" | "missing" | null>>(
    checkItems.reduce((acc, item) => ({ ...acc, [item.id]: null }), {}),
  )
  const [notes, setNotes] = useState("")
  const [showResult, setShowResult] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPositiveFeedback, setShowPositiveFeedback] = useState(false)

  const handleCheck = (id: string, status: "ok" | "missing") => {
    setCheckStatus((prev) => ({
      ...prev,
      [id]: prev[id] === status ? null : status,
    }))
  }

  const handleSubmit = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      setShowResult(true)
      setIsSubmitting(false)
    }, 1000)
  }

  const allChecked = Object.values(checkStatus).every((status) => status !== null)
  const issuesCount = Object.values(checkStatus).filter((status) => status === "missing").length
  const isAllOk = issuesCount === 0

  return (
    <div className="min-h-screen bg-background">
      <RoleNav role="employee" />

      <main className="mx-auto max-w-4xl px-6 py-8 sm:px-8">
        <div className="mb-8 animate-in fade-in slide-in-from-top duration-500">
          <h2 className="text-4xl font-bold text-foreground mb-2">Check du Service</h2>
          <p className="text-muted-foreground text-lg">Vérification rapide de l'état du service</p>
        </div>

        {/* Formulaire de check */}
        <Card className="p-6 bg-card border-border mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-xl font-bold text-foreground mb-6">
            Nouveau Check - {new Date().toLocaleDateString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </h3>

          <div className="space-y-6">
            {["Stock", "Hygiène", "Matériel"].map((category) => (
              <div key={category}>
                <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                  {category}
                </h4>
                <div className="space-y-2">
                  {checkItems
                    .filter((item) => item.category === category)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 bg-background border border-border rounded-lg"
                      >
                        <span className="text-foreground font-medium">{item.label}</span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={checkStatus[item.id] === "ok" ? "default" : "outline"}
                            className={`gap-2 ${
                              checkStatus[item.id] === "ok"
                                ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                                : "border-border hover:bg-primary/10"
                            }`}
                            onClick={() => handleCheck(item.id, "ok")}
                          >
                            <CheckCircle className="h-4 w-4" />
                            OK
                          </Button>
                          <Button
                            size="sm"
                            variant={checkStatus[item.id] === "missing" ? "default" : "outline"}
                            className={`gap-2 ${
                              checkStatus[item.id] === "missing"
                                ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                : "border-border hover:bg-destructive/10"
                            }`}
                            onClick={() => handleCheck(item.id, "missing")}
                          >
                            <XCircle className="h-4 w-4" />
                            Manque
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Notes (optionnel)</label>
              <Textarea
                placeholder="Ex: Manque 2 pains, commande en cours..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px] bg-background border-border text-foreground resize-none"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!allChecked || isSubmitting}
              className="w-full h-14 text-lg bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
            >
              {isSubmitting ? "Enregistrement..." : "Valider le Check"}
            </Button>
          </div>
        </Card>

        {/* Résultat */}
        <Dialog open={showResult} onOpenChange={setShowResult}>
          <DialogContent className="bg-card border-border sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-foreground text-2xl text-center">Check Enregistré</DialogTitle>
              <DialogDescription className="text-center">
                <div
                  className={`inline-flex h-20 w-20 rounded-full items-center justify-center mt-4 mb-4 ${
                    isAllOk ? "bg-primary/10" : "bg-accent/10"
                  }`}
                >
                  {isAllOk ? (
                    <CheckCircle className="h-10 w-10 text-primary" />
                  ) : (
                    <AlertCircle className="h-10 w-10 text-accent" />
                  )}
                </div>
                <p className={`text-2xl font-bold mb-2 ${isAllOk ? "text-primary" : "text-accent"}`}>
                  {isAllOk
                    ? "Service OK"
                    : `${issuesCount} Problème${issuesCount > 1 ? "s" : ""} Détecté${issuesCount > 1 ? "s" : ""}`}
                </p>
                <p className="text-muted-foreground">
                  {isAllOk ? "Tout est en ordre pour le service" : "Les alertes ont été transmises au patron"}
                </p>
              </DialogDescription>
            </DialogHeader>

            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12"
              onClick={() => {
                setShowResult(false)
                setTimeout(() => {
                  setShowPositiveFeedback(true)
                }, 300)
              }}
            >
              Clôturer le Service
            </Button>
          </DialogContent>
        </Dialog>

        <PositiveFeedbackDialog
          open={showPositiveFeedback}
          onClose={() => {
            setShowPositiveFeedback(false)
            setCheckStatus(checkItems.reduce((acc, item) => ({ ...acc, [item.id]: null }), {}))
            setNotes("")
          }}
          feedbackType={isAllOk ? "positive" : "honesty"}
        />

        {/* Historique */}
        <Card className="p-6 bg-card border-border animate-in fade-in slide-in-from-bottom-6 duration-500 delay-100">
          <h3 className="text-xl font-bold text-foreground mb-4">Checks Précédents</h3>

          <div className="space-y-3">
            {previousChecks.map((check, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-4 p-4 rounded-lg border-2 ${
                  check.status === "ok" ? "bg-primary/5 border-primary/20" : "bg-accent/5 border-accent/20"
                }`}
              >
                <div
                  className={`h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    check.status === "ok" ? "bg-primary/10" : "bg-accent/10"
                  }`}
                >
                  {check.status === "ok" ? (
                    <CheckCircle className="h-6 w-6 text-primary" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-accent" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <p className={`font-bold ${check.status === "ok" ? "text-primary" : "text-accent"}`}>
                      {check.status === "ok" ? "Service OK" : `${check.issues} problème(s)`}
                    </p>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{check.time}</span>
                    </div>
                  </div>
                  <p className="text-sm text-foreground">{check.note}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  )
}
