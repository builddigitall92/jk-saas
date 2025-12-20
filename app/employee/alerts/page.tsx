"use client"

import { AlertTriangle, AlertCircle, Clock, ChevronLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useAlerts } from "@/lib/hooks/use-alerts"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

export default function EmployeeAlertsPage() {
  const { alerts, loading, criticalCount } = useAlerts()

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: false, locale: fr })
    } catch {
      return ""
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="mb-6 animate-fade-up">
        <Link href="/employee" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft className="h-5 w-5" />
          <span>Retour</span>
        </Link>
        <h1 className="text-xl font-bold text-foreground mb-1">Alertes</h1>
        <p className="text-sm text-muted-foreground">Notifications importantes</p>
      </div>

      {/* Alerts */}
      <div className="space-y-3 animate-fade-up delay-1">
        {alerts.length === 0 ? (
          <div className="banking-card p-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Aucune alerte</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const isUrgent = alert.alert_type === "critical"
            const isWarning = alert.alert_type === "warning"

            return (
              <div
                key={alert.id}
                className={`banking-card p-4 ${
                  isUrgent ? "border-destructive/50" :
                  isWarning ? "border-orange-500/50" : "border-primary/50"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                    isUrgent ? "bg-destructive/20" :
                    isWarning ? "bg-orange-500/20" : "bg-primary/20"
                  }`}>
                    {isUrgent ? (
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    ) : isWarning ? (
                      <AlertCircle className="h-5 w-5 text-orange-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-semibold ${
                        isUrgent ? "text-destructive" :
                        isWarning ? "text-orange-500" : "text-primary"
                      }`}>{alert.title}</h3>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />{formatTime(alert.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{alert.message}</p>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Status */}
      <div className="banking-card p-4 mt-6 animate-fade-up delay-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-foreground">Statut Global</p>
            <p className="text-sm text-muted-foreground">{criticalCount} alerte{criticalCount > 1 ? 's' : ''} critique{criticalCount > 1 ? 's' : ''}</p>
          </div>
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
            criticalCount > 0 ? "bg-destructive/20" : "bg-accent/20"
          }`}>
            <span className={`text-xl font-bold ${criticalCount > 0 ? "text-destructive" : "text-accent"}`}>
              {criticalCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
