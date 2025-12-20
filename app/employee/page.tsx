"use client"

import { RoleNav } from "@/components/role-nav"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Package, AlertTriangle, CheckCircle, TrendingDown, ShoppingCart, Zap, Clock, Star } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function EmployeePage() {
  const [ultraFastMode, setUltraFastMode] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <RoleNav role="employee" />

      <main className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-12">
        <div className="mb-8 animate-in fade-in slide-in-from-top duration-500">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-5xl font-bold text-foreground mb-3">Interface Employé</h2>
              <p className="text-muted-foreground text-xl">Actions rapides et efficaces pour le service quotidien</p>
            </div>
            <Button
              onClick={() => setUltraFastMode(!ultraFastMode)}
              className={`${
                ultraFastMode ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"
              } hover:scale-105 transition-all`}
            >
              <Zap className="h-5 w-5 mr-2" />
              Mode Ultra-Rapide
            </Button>
          </div>
        </div>

        <Card className="p-5 mb-8 bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/30 animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Prévision pour ce service</p>
              <p className="text-lg font-semibold text-foreground">
                Affluence élevée prévue à 12h30 - Préparer 20% de frites en plus
              </p>
            </div>
          </div>
        </Card>

        {ultraFastMode ? (
          <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
            <Link href="/employee/waste">
              <Card className="p-8 bg-gradient-to-br from-destructive/10 to-destructive/5 border-2 border-destructive/40 hover:border-destructive transition-all duration-200 cursor-pointer hover:scale-105">
                <Trash2 className="h-12 w-12 text-destructive mb-3" />
                <h3 className="text-2xl font-bold text-foreground">Gaspillage</h3>
              </Card>
            </Link>

            <Link href="/employee/stock-update">
              <Card className="p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/40 hover:border-primary transition-all duration-200 cursor-pointer hover:scale-105">
                <Package className="h-12 w-12 text-primary mb-3" />
                <h3 className="text-2xl font-bold text-foreground">Stock</h3>
              </Card>
            </Link>

            <Link href="/employee/alerts">
              <Card className="p-8 bg-gradient-to-br from-accent/10 to-accent/5 border-2 border-accent/40 hover:border-accent transition-all duration-200 cursor-pointer hover:scale-105">
                <AlertTriangle className="h-12 w-12 text-accent mb-3" />
                <h3 className="text-2xl font-bold text-foreground">Alertes</h3>
              </Card>
            </Link>

            <Link href="/employee/service-check">
              <Card className="p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/40 hover:border-primary transition-all duration-200 cursor-pointer hover:scale-105">
                <CheckCircle className="h-12 w-12 text-primary mb-3" />
                <h3 className="text-2xl font-bold text-foreground">Check</h3>
              </Card>
            </Link>
          </div>
        ) : (
          <>
            {/* Stats du jour */}
            <div className="grid sm:grid-cols-3 gap-6 mb-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Clients Prévus</p>
                    <p className="text-4xl font-bold text-primary">245</p>
                  </div>
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <ShoppingCart className="h-7 w-7 text-primary" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Gaspillage Aujourd'hui</p>
                    <p className="text-4xl font-bold text-destructive">8.20€</p>
                  </div>
                  <div className="h-14 w-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
                    <TrendingDown className="h-7 w-7 text-destructive" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Pic d'Affluence</p>
                    <p className="text-4xl font-bold text-accent">12h-14h</p>
                  </div>
                  <div className="h-14 w-14 rounded-2xl bg-accent/10 flex items-center justify-center">
                    <AlertTriangle className="h-7 w-7 text-accent" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Actions principales */}
            <div className="grid lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
              <Link href="/employee/waste">
                <Card className="p-8 bg-gradient-to-br from-card via-card to-destructive/5 border-2 border-border hover:border-destructive/50 transition-all duration-300 cursor-pointer group hover:scale-[1.02] hover:shadow-xl">
                  <div className="flex items-start gap-6">
                    <div className="h-20 w-20 rounded-2xl bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/20 transition-all duration-300 group-hover:scale-110">
                      <Trash2 className="h-10 w-10 text-destructive" strokeWidth={2} />
                    </div>

                    <div className="flex-1 space-y-3">
                      <h3 className="text-3xl font-bold text-foreground group-hover:text-destructive transition-colors">
                        Gaspillage
                      </h3>
                      <p className="text-muted-foreground text-lg">
                        Enregistrer rapidement le gaspillage avec sélection simple du produit et de la quantité
                      </p>
                      <div className="flex items-center gap-2 text-destructive font-semibold pt-2">
                        <span>Ouvrir le module</span>
                        <span className="group-hover:translate-x-2 transition-transform">→</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>

              <Link href="/employee/stock-update">
                <Card className="p-8 bg-gradient-to-br from-card via-card to-primary/5 border-2 border-border hover:border-primary/50 transition-all duration-300 cursor-pointer group hover:scale-[1.02] hover:shadow-xl">
                  <div className="flex items-start gap-6">
                    <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
                      <Package className="h-10 w-10 text-primary" strokeWidth={2} />
                    </div>

                    <div className="flex-1 space-y-3">
                      <h3 className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors">
                        Mise à Jour Stocks
                      </h3>
                      <p className="text-muted-foreground text-lg">
                        Ajouter vos achats et modifier les quantités restantes en temps réel
                      </p>
                      <div className="flex items-center gap-2 text-primary font-semibold pt-2">
                        <span>Ouvrir le module</span>
                        <span className="group-hover:translate-x-2 transition-transform">→</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>

              <Link href="/employee/alerts">
                <Card className="p-8 bg-gradient-to-br from-card via-card to-accent/5 border-2 border-border hover:border-accent/50 transition-all duration-300 cursor-pointer group hover:scale-[1.02] hover:shadow-xl">
                  <div className="flex items-start gap-6">
                    <div className="h-20 w-20 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-all duration-300 group-hover:scale-110">
                      <AlertTriangle className="h-10 w-10 text-accent" strokeWidth={2} />
                    </div>

                    <div className="flex-1 space-y-3">
                      <h3 className="text-3xl font-bold text-foreground group-hover:text-accent transition-colors">
                        Alertes de Rupture
                      </h3>
                      <p className="text-muted-foreground text-lg">
                        Consulter les stocks faibles et les alertes de rupture avec priorités
                      </p>
                      <div className="flex items-center gap-2 text-accent font-semibold pt-2">
                        <span>Ouvrir le module</span>
                        <span className="group-hover:translate-x-2 transition-transform">→</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>

              <Link href="/employee/service-check">
                <Card className="p-8 bg-gradient-to-br from-card via-card to-primary/5 border-2 border-border hover:border-primary/50 transition-all duration-300 cursor-pointer group hover:scale-[1.02] hover:shadow-xl">
                  <div className="flex items-start gap-6">
                    <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
                      <CheckCircle className="h-10 w-10 text-primary" strokeWidth={2} />
                    </div>

                    <div className="flex-1 space-y-3">
                      <h3 className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors">
                        Check Service
                      </h3>
                      <p className="text-muted-foreground text-lg">
                        Vérifier rapidement l'état du service, du stock et de l'hygiène
                      </p>
                      <div className="flex items-center gap-2 text-primary font-semibold pt-2">
                        <span>Ouvrir le module</span>
                        <span className="group-hover:translate-x-2 transition-transform">→</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>
          </>
        )}

        <Card className="mt-8 p-5 bg-primary/5 border-primary/20 animate-in fade-in duration-500 delay-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Star className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Excellent travail aujourd'hui</p>
              <p className="text-xs text-muted-foreground">Gaspillage réduit de 15% par rapport à hier</p>
            </div>
          </div>
        </Card>

        <div className="mt-6 text-center">
          <Link
            href="/employee/history"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
          >
            Consulter mon historique personnel
          </Link>
        </div>
      </main>
    </div>
  )
}
