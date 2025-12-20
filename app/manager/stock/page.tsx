"use client"

import { RoleNav } from "@/components/role-nav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, AlertCircle, Plus, Minus, Trash2, Snowflake, Leaf, Wheat, Calendar, DollarSign } from "lucide-react"
import { useState, useEffect } from "react"
import { stockStore, type Stock } from "@/lib/stock-store"

export default function ManagerStockPage() {
  const [stocks, setStocks] = useState<Stock[]>([])

  useEffect(() => {
    setStocks(stockStore.getStocks())
    const unsubscribe = stockStore.subscribe(() => {
      console.log("[v0] Stock updated, refreshing manager view")
      setStocks([...stockStore.getStocks()])
    })
    return unsubscribe
  }, [])

  const getCategoryStocks = (category: "surgele" | "frais" | "sec") => {
    return stocks.filter((stock) => stock.category === category)
  }

  const getCategoryTotal = (category: "surgele" | "frais" | "sec") => {
    return getCategoryStocks(category).reduce((sum, stock) => sum + stock.price, 0)
  }

  const handleDelete = (id: string) => {
    stockStore.deleteStock(id)
  }

  const handleAdjust = (id: string, delta: number) => {
    const stock = stocks.find((s) => s.id === id)
    if (stock) {
      stockStore.updateStock(id, {
        quantity: Math.max(0, stock.quantity + delta),
      })
    }
  }

  const isExpiringSoon = (expiryDate: string) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0
  }

  const isExpired = (expiryDate: string) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    return expiry < today
  }

  const CategoryTab = ({
    category,
    icon: Icon,
    title,
    color,
  }: {
    category: "surgele" | "frais" | "sec"
    icon: any
    title: string
    color: string
  }) => {
    const categoryStocks = getCategoryStocks(category)
    const total = getCategoryTotal(category)

    return (
      <TabsContent value={category} className="space-y-6">
        <div className="grid gap-6">
          {/* Stats Overview */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Card className="p-6 bg-card border-border">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Articles</p>
                  <p className="text-4xl font-bold text-foreground">{categoryStocks.length}</p>
                </div>
                <div className={`h-12 w-12 rounded-xl ${color} flex items-center justify-center`}>
                  <Icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Valeur Totale</p>
                  <p className="text-4xl font-bold text-foreground">{total.toFixed(2)}€</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-accent" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Alertes</p>
                  <p className="text-4xl font-bold text-destructive">
                    {categoryStocks.filter((s) => isExpiringSoon(s.expiryDate) || isExpired(s.expiryDate)).length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
              </div>
            </Card>
          </div>

          {/* Products List */}
          <div className="grid lg:grid-cols-2 gap-4">
            {categoryStocks.map((stock) => (
              <Card
                key={stock.id}
                className={`p-6 bg-card border-2 transition-all duration-300 ${
                  isExpired(stock.expiryDate)
                    ? "border-destructive/50 bg-destructive/5"
                    : isExpiringSoon(stock.expiryDate)
                      ? "border-accent/50 bg-accent/5"
                      : "border-border hover:border-primary/30"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-xl ${color} flex items-center justify-center`}>
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{stock.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {stock.quantity} {stock.unit}
                      </p>
                    </div>
                  </div>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(stock.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Prix d'achat</span>
                    <span className="font-semibold text-accent">{stock.price.toFixed(2)} €</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Date d'expiration
                    </span>
                    <span
                      className={`font-semibold ${
                        isExpired(stock.expiryDate)
                          ? "text-destructive"
                          : isExpiringSoon(stock.expiryDate)
                            ? "text-accent"
                            : "text-foreground"
                      }`}
                    >
                      {new Date(stock.expiryDate).toLocaleDateString("fr-FR")}
                    </span>
                  </div>

                  {(isExpiringSoon(stock.expiryDate) || isExpired(stock.expiryDate)) && (
                    <div
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                        isExpired(stock.expiryDate) ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent"
                      }`}
                    >
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {isExpired(stock.expiryDate) ? "Produit expiré" : "Expire bientôt"}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-border hover:bg-destructive/10 hover:border-destructive/30 bg-transparent"
                      onClick={() => handleAdjust(stock.id, -1)}
                    >
                      <Minus className="h-4 w-4 mr-1" />
                      Retirer
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-primary hover:bg-primary/90"
                      onClick={() => handleAdjust(stock.id, 1)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {categoryStocks.length === 0 && (
              <Card className="p-12 bg-card border-2 border-dashed border-border text-center lg:col-span-2">
                <Icon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-xl text-muted-foreground mb-2">Aucun produit {title.toLowerCase()}</p>
                <p className="text-muted-foreground">Les employés peuvent ajouter des produits depuis leur interface</p>
              </Card>
            )}
          </div>
        </div>
      </TabsContent>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <RoleNav role="manager" />

      <main className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-12">
        <div className="mb-8 animate-in fade-in slide-in-from-top duration-500">
          <h2 className="text-4xl font-bold text-foreground mb-2">Gestion des Stocks</h2>
          <p className="text-muted-foreground text-lg">Organisés par catégorie</p>
        </div>

        <Tabs defaultValue="surgele" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger
              value="surgele"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Snowflake className="h-4 w-4 mr-2" />
              Surgelé
            </TabsTrigger>
            <TabsTrigger
              value="frais"
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
            >
              <Leaf className="h-4 w-4 mr-2" />
              Frais
            </TabsTrigger>
            <TabsTrigger
              value="sec"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Wheat className="h-4 w-4 mr-2" />
              Sec
            </TabsTrigger>
          </TabsList>

          <CategoryTab category="surgele" icon={Snowflake} title="Surgelé" color="bg-blue-500/10" />
          <CategoryTab category="frais" icon={Leaf} title="Frais" color="bg-green-500/10" />
          <CategoryTab category="sec" icon={Wheat} title="Sec" color="bg-amber-500/10" />
        </Tabs>
      </main>
    </div>
  )
}
