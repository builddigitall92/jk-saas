'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, AlertTriangle, ShoppingCart, TrendingDown } from 'lucide-react'

export function StatsCards() {
  const stats = [
    {
      title: 'Articles Totaux',
      value: '247',
      icon: Package,
      description: 'En stock',
    },
    {
      title: 'Alertes Stock Bas',
      value: '12',
      icon: AlertTriangle,
      description: 'Besoin de réapprovisionnement',
      alert: true,
    },
    {
      title: 'Commandes en Attente',
      value: '5',
      icon: ShoppingCart,
      description: 'Depuis les fournisseurs',
    },
    {
      title: 'Gaspillage Cette Semaine',
      value: '342€',
      icon: TrendingDown,
      description: 'Suivre et réduire',
    },
  ]

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card 
          key={stat.title} 
          className="group relative overflow-hidden border-border/50 bg-card transition-all duration-500 hover:scale-105 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 animate-in fade-in zoom-in-95"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
              {stat.title}
            </CardTitle>
            <div className={`rounded-lg p-2.5 shadow-lg transition-all duration-300 group-hover:scale-110 ${
              stat.alert 
                ? 'bg-destructive/10 text-destructive group-hover:shadow-destructive/30' 
                : 'bg-primary/10 text-primary group-hover:shadow-primary/30'
            }`}>
              <stat.icon className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-4xl font-bold tracking-tight text-foreground transition-all group-hover:text-primary">
              {stat.value}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
