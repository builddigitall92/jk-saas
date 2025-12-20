'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function RecentActivity() {
  const activities = [
    {
      id: 1,
      type: 'alerte',
      message: 'Le stock de frites est bas',
      time: 'Il y a 2 minutes',
      status: 'warning',
    },
    {
      id: 2,
      type: 'commande',
      message: 'Commande #1234 reçue de Sysco',
      time: 'Il y a 1 heure',
      status: 'success',
    },
    {
      id: 3,
      type: 'gaspillage',
      message: '3kg de laitue expirée enregistrée',
      time: 'Il y a 3 heures',
      status: 'info',
    },
    {
      id: 4,
      type: 'contrôle',
      message: 'Contrôle de service terminé - Cuisine',
      time: 'Il y a 5 heures',
      status: 'success',
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'warning':
        return 'bg-destructive/10 text-destructive border-destructive/20'
      case 'success':
        return 'bg-primary/10 text-primary border-primary/20'
      case 'info':
        return 'bg-accent/10 text-accent-foreground border-accent/20'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <Card className="group mt-8 border-border/50 bg-card transition-all duration-500 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20">
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      
      <CardHeader className="relative">
        <CardTitle className="text-xl font-semibold transition-colors group-hover:text-primary">
          Activité Récente
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className="space-y-5">
          {activities.map((activity, index) => (
            <div
              key={activity.id}
              className="flex items-start justify-between gap-4 border-b border-border/40 pb-5 last:border-0 last:pb-0 transition-all hover:translate-x-2 animate-in fade-in slide-in-from-left duration-500"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-relaxed text-foreground">
                  {activity.message}
                </p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
              <Badge variant="outline" className={`${getStatusColor(activity.status)} font-medium transition-all hover:scale-110`}>
                {activity.type}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
