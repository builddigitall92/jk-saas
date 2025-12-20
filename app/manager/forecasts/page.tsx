'use client'

import { RoleNav } from '@/components/role-nav'
import { Card } from '@/components/ui/card'
import { Users, TrendingUp, Package, AlertTriangle, Calendar } from 'lucide-react'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'

const trafficData = [
  { day: 'Lun', clients: 245 },
  { day: 'Mar', clients: 198 },
  { day: 'Mer', clients: 223 },
  { day: 'Jeu', clients: 267 },
  { day: 'Ven', clients: 312 },
  { day: 'Sam', clients: 289 },
  { day: 'Dim', clients: 254 },
]

export default function ManagerForecastsPage() {
  return (
    <div className="min-h-screen bg-background">
      <RoleNav role="manager" />
      
      <main className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-12">
        <div className="mb-8 animate-in fade-in slide-in-from-top duration-500">
          <h2 className="text-4xl font-bold text-foreground mb-2">
            Prévisions Clients
          </h2>
          <p className="text-muted-foreground text-lg">
            Anticipez vos besoins en stock
          </p>
        </div>

        {/* Prévision principale */}
        <Card className="p-8 bg-gradient-to-br from-primary/10 to-accent/5 border-primary/30 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-6">
              <div className="h-20 w-20 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Calendar className="h-10 w-10 text-primary" />
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-2">Demain • Vendredi 24 Nov</p>
                <p className="text-5xl font-bold text-foreground mb-3">287 clients</p>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span className="text-primary font-semibold">+35% vs moyenne</span>
                </div>
              </div>
            </div>

            <div className="bg-primary/10 px-6 py-4 rounded-xl border border-primary/20">
              <p className="text-sm text-muted-foreground mb-2">Pic d'affluence attendu</p>
              <p className="text-2xl font-bold text-foreground">12h - 14h</p>
            </div>
          </div>
        </Card>

        {/* Recommandations */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-6 duration-500 delay-200">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Frites</h3>
                <p className="text-sm text-muted-foreground">Quantité recommandée</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">À préparer/commander</span>
                  <span className="text-3xl font-bold text-primary">68 kg</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stock actuel</span>
                    <span className="text-foreground font-medium">45.5 kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Besoin supplémentaire</span>
                    <span className="text-primary font-semibold">22.5 kg</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-accent/10 border border-accent/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Commande recommandée</p>
                  <p className="text-xs text-muted-foreground mt-1">Stock actuel insuffisant pour demain</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Pain</h3>
                <p className="text-sm text-muted-foreground">Quantité recommandée</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">Hamburger</span>
                  <span className="text-2xl font-bold text-primary">165</span>
                </div>
                <div className="text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-foreground">Stock : 78 unités</span>
                    <span className="text-accent font-semibold">Suffisant</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">Hot-dog</span>
                  <span className="text-2xl font-bold text-primary">95</span>
                </div>
                <div className="text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-foreground">Stock : 33 unités</span>
                    <span className="text-destructive font-semibold">Commander 62</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Risque de rupture</p>
                  <p className="text-xs text-muted-foreground mt-1">Pain hot-dog insuffisant</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Graphique fréquentation */}
        <Card className="p-6 bg-card border-border animate-in fade-in slide-in-from-bottom-8 duration-500 delay-300">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-foreground mb-1">
              Fréquentation des 7 Derniers Jours
            </h3>
            <p className="text-sm text-muted-foreground">
              Analyse des tendances hebdomadaires
            </p>
          </div>
          
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={trafficData}>
              <XAxis 
                dataKey="day" 
                stroke="#666"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#666"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1E1E1E', 
                  border: '1px solid #333',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar 
                dataKey="clients" 
                fill="#0A714A"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Alertes */}
        <div className="grid md:grid-cols-2 gap-4 mt-6 animate-in fade-in slide-in-from-bottom-10 duration-500 delay-400">
          <div className="flex gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0" />
            <div>
              <p className="font-semibold text-foreground mb-1">Risque de Rupture</p>
              <p className="text-sm text-muted-foreground">Pain hot-dog et frites nécessitent une commande urgente</p>
            </div>
          </div>

          <div className="flex gap-3 p-4 bg-accent/10 border border-accent/30 rounded-lg">
            <TrendingUp className="h-6 w-6 text-accent flex-shrink-0" />
            <div>
              <p className="font-semibold text-foreground mb-1">Forte Affluence</p>
              <p className="text-sm text-muted-foreground">Préparez 35% de stock supplémentaire pour demain midi</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
