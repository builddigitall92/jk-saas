"use client"

import { useState, useEffect } from "react"
import { Trash2, Package, AlertTriangle, Check, Clock, ChevronRight, Loader2, X, Bell } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import { useAlerts } from "@/lib/hooks/use-alerts"

interface TaskStatus {
  checkInDone: boolean
  stockUpdated: boolean
  loading: boolean
}

const modules = [
  { title: "Gaspillage", icon: Trash2, href: "/employee/waste", color: "destructive" },
  { title: "Stock", icon: Package, href: "/employee/stock-update", color: "primary" },
  { title: "Alertes", icon: AlertTriangle, href: "/employee/alerts", color: "orange" },
  { title: "Check", icon: Check, href: "/employee/service-check", color: "accent" },
]

export default function EmployeePage() {
  const supabase = createClient()
  const { unreadCount } = useAlerts()
  const [status, setStatus] = useState<TaskStatus>({
    checkInDone: false,
    stockUpdated: false,
    loading: true
  })

  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? "Bonjour" : currentHour < 18 ? "Bon après-midi" : "Bonsoir"

  // Vérifier le statut des tâches du jour
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const today = new Date().toISOString().split('T')[0]

        // Vérifier le check-in
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: checkIn } = await (supabase as any)
          .from('service_checks')
          .select('id')
          .eq('performed_by', user.id)
          .eq('check_date', today)
          .limit(1)

        // Vérifier les mises à jour de stock
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: stockUpdate } = await (supabase as any)
          .from('stock')
          .select('id')
          .eq('added_by', user.id)
          .gte('created_at', `${today}T00:00:00`)
          .limit(1)

        setStatus({
          checkInDone: checkIn && checkIn.length > 0,
          stockUpdated: stockUpdate && stockUpdate.length > 0,
          loading: false
        })
      } catch (err) {
        console.error('Erreur:', err)
        setStatus(prev => ({ ...prev, loading: false }))
      }
    }

    fetchStatus()
  }, [])

  const allTasksDone = status.checkInDone && status.stockUpdated

  return (
    <div className="px-4 py-6 md:px-6 md:py-8">
      {/* Header */}
      <div className="mb-6 animate-fade-up">
        <h1 className="text-2xl font-bold text-foreground mb-2">{greeting} ! 👋</h1>
        <p className="text-muted-foreground">Prêt pour le service ?</p>
      </div>

      {/* Statut des tâches du jour */}
      <div className="banking-card p-4 mb-6 animate-fade-up delay-1">
        <h3 className="font-semibold text-foreground mb-3">Tâches du jour</h3>
        {status.loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-3">
            {/* Check-in */}
            <div className={`flex items-center gap-3 p-3 rounded-xl ${
              status.checkInDone ? 'bg-accent/10' : 'bg-orange-500/10'
            }`}>
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                status.checkInDone ? 'bg-accent/20' : 'bg-orange-500/20'
              }`}>
                {status.checkInDone ? (
                  <Check className="h-4 w-4 text-accent" />
                ) : (
                  <X className="h-4 w-4 text-orange-500" />
                )}
              </div>
              <div className="flex-1">
                <p className={`font-medium ${
                  status.checkInDone ? 'text-accent' : 'text-orange-500'
                }`}>
                  Check-in service
                </p>
                <p className="text-xs text-muted-foreground">
                  {status.checkInDone ? 'Complété aujourd\'hui' : 'À faire'}
                </p>
              </div>
              {!status.checkInDone && (
                <Link href="/employee/service-check">
                  <span className="text-xs font-medium text-orange-500 underline">Faire →</span>
                </Link>
              )}
            </div>

            {/* Inventaire */}
            <div className={`flex items-center gap-3 p-3 rounded-xl ${
              status.stockUpdated ? 'bg-accent/10' : 'bg-orange-500/10'
            }`}>
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                status.stockUpdated ? 'bg-accent/20' : 'bg-orange-500/20'
              }`}>
                {status.stockUpdated ? (
                  <Check className="h-4 w-4 text-accent" />
                ) : (
                  <X className="h-4 w-4 text-orange-500" />
                )}
              </div>
              <div className="flex-1">
                <p className={`font-medium ${
                  status.stockUpdated ? 'text-accent' : 'text-orange-500'
                }`}>
                  Mise à jour inventaire
                </p>
                <p className="text-xs text-muted-foreground">
                  {status.stockUpdated ? 'Mis à jour aujourd\'hui' : 'À faire'}
                </p>
              </div>
              {!status.stockUpdated && (
                <Link href="/employee/stock-update">
                  <span className="text-xs font-medium text-orange-500 underline">Faire →</span>
                </Link>
              )}
            </div>

            {/* Résumé */}
            {allTasksDone && (
              <div className="text-center py-2">
                <span className="badge-green">✓ Toutes les tâches complétées</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Alertes non lues */}
      {unreadCount > 0 && (
        <Link href="/employee/alerts">
          <div className="banking-card-glow p-4 mb-6 animate-fade-up delay-2 border-orange-500/30 cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <Bell className="h-6 w-6 text-orange-500" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-orange-500">
                  {unreadCount} alerte{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
                </p>
                <p className="text-xs text-muted-foreground">Appuyez pour voir</p>
              </div>
              <ChevronRight className="h-5 w-5 text-orange-500" />
            </div>
          </div>
        </Link>
      )}

      {/* Forecast */}
      <div className="banking-card p-4 mb-6 animate-fade-up delay-2">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Prévision du service</p>
            <p className="font-medium text-foreground">Affluence normale prévue</p>
          </div>
        </div>
      </div>

      {/* Modules */}
      <h2 className="text-sm font-medium text-muted-foreground mb-4 animate-fade-up delay-3">Actions rapides</h2>
      <div className="grid grid-cols-2 gap-4 animate-fade-up delay-3">
        {modules.map((module) => {
          const Icon = module.icon
          const showBadge = module.title === "Alertes" && unreadCount > 0
          const showCheckBadge = module.title === "Check" && status.checkInDone
          const showStockBadge = module.title === "Stock" && status.stockUpdated
          
          return (
            <Link key={module.href} href={module.href}>
              <div className="banking-card p-5 group cursor-pointer relative">
                <div className="flex items-center gap-4">
                  <div className={`h-14 w-14 rounded-xl flex items-center justify-center ${
                    module.color === "primary" ? "bg-primary/10 group-hover:bg-primary/20" :
                    module.color === "accent" ? "bg-accent/10 group-hover:bg-accent/20" :
                    module.color === "orange" ? "bg-orange-500/10 group-hover:bg-orange-500/20" :
                    "bg-destructive/10 group-hover:bg-destructive/20"
                  } transition-colors`}>
                    <Icon className={`h-7 w-7 ${
                      module.color === "primary" ? "text-primary" :
                      module.color === "accent" ? "text-accent" :
                      module.color === "orange" ? "text-orange-500" :
                      "text-destructive"
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{module.title}</p>
                    {showCheckBadge && (
                      <span className="text-xs text-accent">✓ Fait</span>
                    )}
                    {showStockBadge && (
                      <span className="text-xs text-accent">✓ Mis à jour</span>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                {/* Badge pour alertes */}
                {showBadge && (
                  <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-orange-500 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{unreadCount}</span>
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
