'use client'

import { RoleNav } from '@/components/role-nav'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, TrendingDown, DollarSign, Package, Trash2, ShoppingCart } from 'lucide-react'
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Pie, PieChart, Cell } from 'recharts'

const revenueData = [
  { month: 'Jan', revenue: 12400, costs: 8200 },
  { month: 'Fév', revenue: 13200, costs: 8500 },
  { month: 'Mar', revenue: 14100, costs: 8900 },
  { month: 'Avr', revenue: 13800, costs: 8700 },
  { month: 'Mai', revenue: 15200, costs: 9100 },
  { month: 'Juin', revenue: 16500, costs: 9800 },
]

const wasteByCategory = [
  { name: 'Frites', value: 420, color: '#0A714A' },
  { name: 'Pain', value: 285, color: '#F4C20D' },
  { name: 'Viande', value: 520, color: '#DC2626' },
  { name: 'Légumes', value: 180, color: '#0D8F5E' },
]

export default function ManagerReportsPage() {
  return (
    <div className="min-h-screen bg-background">
      <RoleNav role="manager" />
      
      <main className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-12">
        <div className="mb-8 animate-in fade-in slide-in-from-top duration-500">
          <h2 className="text-4xl font-bold text-foreground mb-2">
            Rapports Financiers
          </h2>
          <p className="text-muted-foreground text-lg">
            Analyse des performances et coûts
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="waste" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              Gaspillage
            </TabsTrigger>
            <TabsTrigger value="purchases" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Achats
            </TabsTrigger>
          </TabsList>

          {/* Vue d'ensemble */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="p-6 bg-card border-border">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Chiffre d'Affaires</p>
                    <p className="text-3xl font-bold text-foreground">16 500€</p>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-sm text-primary">+8.6%</span>
                    </div>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card border-border">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Coûts Stocks</p>
                    <p className="text-3xl font-bold text-foreground">9 800€</p>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className="h-4 w-4 text-accent" />
                      <span className="text-sm text-accent">+7.6%</span>
                    </div>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Package className="h-5 w-5 text-accent" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card border-border">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Pertes Gaspillage</p>
                    <p className="text-3xl font-bold text-destructive">1 385€</p>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingDown className="h-4 w-4 text-primary" />
                      <span className="text-sm text-primary">-12.3%</span>
                    </div>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <Trash2 className="h-5 w-5 text-destructive" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card border-border">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Marge Brute</p>
                    <p className="text-3xl font-bold text-primary">6 700€</p>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-sm text-primary">+10.2%</span>
                    </div>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-6 bg-card border-border animate-in fade-in slide-in-from-bottom-6 duration-500 delay-100">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-foreground mb-1">
                  Évolution sur 6 Mois
                </h3>
                <p className="text-sm text-muted-foreground">
                  Revenus vs Coûts des stocks
                </p>
              </div>
              
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={revenueData}>
                  <XAxis 
                    dataKey="month" 
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
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#0A714A" 
                    strokeWidth={3}
                    name="Revenus"
                    dot={{ fill: '#0A714A', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="costs" 
                    stroke="#F4C20D" 
                    strokeWidth={3}
                    name="Coûts"
                    dot={{ fill: '#F4C20D', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          {/* Gaspillage */}
          <TabsContent value="waste" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="p-6 bg-card border-border">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-foreground mb-1">
                    Répartition du Gaspillage
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Par catégorie (ce mois)
                  </p>
                </div>
                
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={wasteByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {wasteByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1E1E1E', 
                        border: '1px solid #333',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6 bg-card border-border">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-foreground mb-1">
                    Détails par Catégorie
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Coûts mensuels du gaspillage
                  </p>
                </div>

                <div className="space-y-4">
                  {wasteByCategory.map((item) => (
                    <div key={item.name} className="flex items-center justify-between p-4 bg-background border border-border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="h-10 w-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${item.color}20` }}
                        >
                          <Trash2 className="h-5 w-5" style={{ color: item.color }} />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.name === 'Frites' ? '52.5 kg' : 
                             item.name === 'Pain' ? '356 unités' :
                             item.name === 'Viande' ? '26 kg' : '18 kg'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-foreground">{item.value}€</p>
                        <p className="text-sm text-destructive">-8.3%</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">Total Économisé</span>
                    <span className="text-2xl font-bold text-primary">1 247€</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    vs mois dernier grâce à StockGuard
                  </p>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Achats */}
          <TabsContent value="purchases" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-6 bg-card border-border">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Commandes (Mois)</p>
                    <p className="text-4xl font-bold text-foreground">28</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <ShoppingCart className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Moyenne : 9.3€ par commande
                </p>
              </Card>

              <Card className="p-6 bg-card border-border">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Fournisseurs Actifs</p>
                    <p className="text-4xl font-bold text-foreground">8</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Package className="h-6 w-6 text-accent" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Partenaires vérifiés
                </p>
              </Card>

              <Card className="p-6 bg-card border-border">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Délai Moyen</p>
                    <p className="text-4xl font-bold text-primary">1.8j</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Livraison rapide
                </p>
              </Card>
            </div>

            <Card className="p-6 bg-card border-border">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-foreground mb-1">
                  Top Fournisseurs
                </h3>
                <p className="text-sm text-muted-foreground">
                  Par volume d'achat ce mois
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'Agro Foods', amount: '3 245€', items: 'Frites, Pommes de terre' },
                  { name: 'Meat Express', amount: '2 890€', items: 'Viandes, Poulet' },
                  { name: 'Fresh Bakery', amount: '1 725€', items: 'Pains variés' },
                  { name: 'Veggie Market', amount: '985€', items: 'Légumes frais' },
                ].map((supplier, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-background border border-border rounded-lg hover:border-primary/30 transition-all">
                    <div>
                      <p className="font-semibold text-foreground mb-1">{supplier.name}</p>
                      <p className="text-sm text-muted-foreground">{supplier.items}</p>
                    </div>
                    <p className="text-xl font-bold text-primary">{supplier.amount}</p>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
