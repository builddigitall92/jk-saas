"use client"

import { RoleNav } from "@/components/role-nav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Package, Plus, Trash2, Save, Check, Calendar, DollarSign } from "lucide-react"
import { useState, useEffect } from "react"
import { stockStore, type Stock } from "@/lib/stock-store"

export default function EmployeeStockUpdatePage() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newItemName, setNewItemName] = useState("")
  const [newItemQty, setNewItemQty] = useState("")
  const [newItemUnit, setNewItemUnit] = useState("kg")
  const [newItemPrice, setNewItemPrice] = useState("")
  const [newItemExpiryDate, setNewItemExpiryDate] = useState("")
  const [newItemCategory, setNewItemCategory] = useState<"surgele" | "frais" | "sec">("frais")
  const [showNotification, setShowNotification] = useState(false)

  useEffect(() => {
    setStocks(stockStore.getStocks())
    const unsubscribe = stockStore.subscribe(() => {
      console.log("[v0] Stock updated, refreshing employee view")
      setStocks([...stockStore.getStocks()])
    })
    return unsubscribe
  }, [])

  const handleAddStock = () => {
    if (newItemName && newItemQty && newItemPrice && newItemExpiryDate) {
      const newStock: Stock = {
        id: Date.now().toString(),
        name: newItemName,
        quantity: Number.parseFloat(newItemQty),
        unit: newItemUnit,
        price: Number.parseFloat(newItemPrice),
        expiryDate: newItemExpiryDate,
        category: newItemCategory,
        addedAt: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        addedBy: "employee",
      }
      stockStore.addStock(newStock)

      const audio = new Audio(
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE=",
      )
      audio.play().catch((e) => console.log("[v0] Audio play failed:", e))

      setShowNotification(true)
      setTimeout(() => setShowNotification(false), 3000)

      setNewItemName("")
      setNewItemQty("")
      setNewItemUnit("kg")
      setNewItemPrice("")
      setNewItemExpiryDate("")
      setNewItemCategory("frais")
      setIsAddDialogOpen(false)
    }
  }

  const handleAdjust = (id: string, delta: number) => {
    const stock = stocks.find((s) => s.id === id)
    if (stock) {
      stockStore.updateStock(id, {
        quantity: Math.max(0, stock.quantity + delta),
      })
    }
  }

  const handleQuantityChange = (id: string, value: string) => {
    const numValue = Number.parseFloat(value)
    if (!isNaN(numValue)) {
      stockStore.updateStock(id, { quantity: Math.max(0, numValue) })
    }
  }

  const handleDelete = (id: string) => {
    stockStore.deleteStock(id)
  }

  return (
    <div className="min-h-screen bg-background">
      <RoleNav role="employee" />

      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-5 duration-300">
          <div className="revolut-card p-4 flex items-center gap-3 bg-success/10 border-success/30">
            <div className="h-10 w-10 rounded-full bg-success flex items-center justify-center">
              <Check className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-success">Ajout validé ✓</p>
              <p className="text-sm text-muted-foreground">Article ajouté aux stocks</p>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12 py-6 md:py-8">
        <div className="mb-6 md:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top duration-500">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-2 md:mb-3">Mise à Jour des Stocks</h2>
            <p className="text-muted-foreground text-base md:text-xl">Ajoutez vos achats et modifiez les quantités</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground h-14 px-8 text-lg">
                  <Plus className="h-6 w-6" />
                  Ajouter Article
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="text-foreground text-2xl">Nouvel Article</DialogTitle>
                  <DialogDescription className="text-muted-foreground text-base">
                    Renseignez toutes les informations du produit
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Nom du produit</label>
                    <Input
                      placeholder="Ex: Frites, Pain, Canette Coca..."
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      className="h-12 text-base bg-background border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Catégorie</label>
                    <select
                      value={newItemCategory}
                      onChange={(e) => setNewItemCategory(e.target.value as "surgele" | "frais" | "sec")}
                      className="h-12 w-full rounded-lg border-2 border-border bg-background px-3 text-base font-medium text-foreground"
                    >
                      <option value="surgele">Surgelé</option>
                      <option value="frais">Frais</option>
                      <option value="sec">Sec</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Quantité</label>
                      <Input
                        type="number"
                        placeholder="Ex: 50"
                        value={newItemQty}
                        onChange={(e) => setNewItemQty(e.target.value)}
                        className="h-12 text-base bg-background border-border"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Unité</label>
                      <select
                        value={newItemUnit}
                        onChange={(e) => setNewItemUnit(e.target.value)}
                        className="h-12 w-full rounded-lg border-2 border-border bg-background px-3 text-base font-medium text-foreground"
                      >
                        <option value="kg">kg</option>
                        <option value="unités">unités</option>
                        <option value="L">Litres</option>
                        <option value="g">grammes</option>
                        <option value="canettes">canettes</option>
                        <option value="bouteilles">bouteilles</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Prix d'achat (€)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Ex: 89.50"
                      value={newItemPrice}
                      onChange={(e) => setNewItemPrice(e.target.value)}
                      className="h-12 text-base bg-background border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date de péremption
                    </label>
                    <Input
                      type="date"
                      value={newItemExpiryDate}
                      onChange={(e) => setNewItemExpiryDate(e.target.value)}
                      className="h-12 text-base bg-background border-border"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 border-border h-12 bg-transparent"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base"
                    onClick={handleAddStock}
                    disabled={!newItemName || !newItemQty || !newItemPrice || !newItemExpiryDate}
                  >
                    <Check className="h-5 w-5 mr-2" />
                    Ajouter
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground h-14 px-8 text-lg">
              <Save className="h-6 w-6" />
              Tout Enregistré ✓
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {stocks.map((stock) => (
            <Card
              key={stock.id}
              className="p-8 bg-gradient-to-br from-card to-card/50 border-2 border-border hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Package className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">{stock.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {stock.category === "surgele" ? "❄️ Surgelé" : stock.category === "frais" ? "🌿 Frais" : "🌾 Sec"}{" "}
                      • {stock.unit}
                    </p>
                    <p className="text-sm text-accent font-semibold mt-1">{stock.price.toFixed(2)} €</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3" />
                      Expire le: {new Date(stock.expiryDate).toLocaleDateString("fr-FR")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Ajouté à {stock.addedAt}</p>
                  </div>
                </div>

                <Button
                  size="icon"
                  variant="ghost"
                  className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(stock.id)}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-14 w-14 border-2 border-border hover:bg-destructive/10 hover:border-destructive/30 bg-transparent"
                  onClick={() => handleAdjust(stock.id, -1)}
                >
                  <span className="text-2xl font-bold">−</span>
                </Button>

                <Input
                  type="number"
                  value={stock.quantity}
                  onChange={(e) => handleQuantityChange(stock.id, e.target.value)}
                  className="h-14 text-center text-3xl font-bold bg-background border-2 border-border text-foreground"
                />

                <Button
                  size="icon"
                  className="h-14 w-14 bg-primary hover:bg-primary/90"
                  onClick={() => handleAdjust(stock.id, 1)}
                >
                  <span className="text-2xl font-bold">+</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {stocks.length === 0 && (
          <Card className="p-12 bg-card border-2 border-dashed border-border text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-muted-foreground mb-2">Aucun article ajouté</p>
            <p className="text-muted-foreground">Cliquez sur "Ajouter Article" pour commencer</p>
          </Card>
        )}
      </main>
    </div>
  )
}
