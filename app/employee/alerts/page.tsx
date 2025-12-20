'use client'

import { RoleNav } from '@/components/role-nav'
import { Card } from '@/components/ui/card'
import { AlertTriangle, AlertCircle, Clock } from 'lucide-react'

const alerts = [
  { 
    type: 'critical', 
    title: 'Rupture Imminente', 
    message: 'Pain hot-dog : seulement 12 unités restantes',
    time: 'Il y a 5 min'
  },
  { 
    type: 'warning', 
    title: 'Stock Bas', 
    message: 'Frites : 15.5 kg restants (seuil critique atteint)',
    time: 'Il y a 15 min'
  },
  { 
    type: 'warning', 
    title: 'Expiration Proche', 
    message: 'Laitue : expire dans 2 jours',
    time: 'Il y a 1h'
  },
  { 
    type: 'info', 
    title: 'Forte Affluence Prévue', 
    message: 'Demain 12h-14h : +35% de clients attendus',
    time: 'Il y a 2h'
  },
]

export default function EmployeeAlertsPage() {
  return (
    <div className="min-h-screen bg-background">
      <RoleNav role="employee" />
      
      <main className="mx-auto max-w-4xl px-6 py-8 sm:px-8">
        <div className="mb-8 animate-in fade-in slide-in-from-top duration-500">
          <h2 className="text-4xl font-bold text-foreground mb-2">
            Alertes de Rupture
          </h2>
          <p className="text-muted-foreground text-lg">
            Notifications importantes du jour
          </p>
        </div>

        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {alerts.map((alert, idx) => {
            const isUrgent = alert.type === 'critical'
            const isWarning = alert.type === 'warning'
            
            return (
              <Card 
                key={idx} 
                className={`p-6 border-2 transition-all duration-300 ${
                  isUrgent 
                    ? 'bg-destructive/5 border-destructive/30 hover:border-destructive/50' 
                    : isWarning 
                    ? 'bg-accent/5 border-accent/30 hover:border-accent/50'
                    : 'bg-primary/5 border-primary/30 hover:border-primary/50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isUrgent 
                      ? 'bg-destructive/10' 
                      : isWarning 
                      ? 'bg-accent/10'
                      : 'bg-primary/10'
                  }`}>
                    {isUrgent ? (
                      <AlertTriangle className="h-6 w-6 text-destructive" />
                    ) : isWarning ? (
                      <AlertCircle className="h-6 w-6 text-accent" />
                    ) : (
                      <AlertTriangle className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className={`text-xl font-bold ${
                        isUrgent 
                          ? 'text-destructive' 
                          : isWarning 
                          ? 'text-accent'
                          : 'text-primary'
                      }`}>
                        {alert.title}
                      </h3>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">{alert.time}</span>
                      </div>
                    </div>
                    <p className="text-foreground text-base leading-relaxed">
                      {alert.message}
                    </p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        <Card className="mt-8 p-6 bg-card border-border animate-in fade-in slide-in-from-bottom-6 duration-500 delay-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-1">
                Statut Global
              </h3>
              <p className="text-muted-foreground">
                2 alertes critiques à traiter
              </p>
            </div>
            <div className="h-16 w-16 rounded-xl bg-destructive/10 flex items-center justify-center">
              <span className="text-3xl font-bold text-destructive">2</span>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
