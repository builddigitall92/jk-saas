"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Package, AlertCircle, Plus, Minus, Trash2, Snowflake, Leaf, Wheat, Calendar, Loader2, Check } from "lucide-react"
import { useState } from "react"
import { useStock, type StockWithProduct } from "@/lib/hooks/use-stock"
import type { ProductCategory } from "@/lib/database.types"
import { createClient } from "@/utils/supabase/client"
import { detectCategory, suggestIcon } from "@/lib/utils/auto-category"

export default function ManagerStockPage() {
  const { stocks, loading, updateQuantity, deleteStock, getByCategory, getCategoryTotal, fetchStocks } = useStock()
  const [activeTab, setActiveTab] = useState<ProductCategory>("surgele")
  
  // Dialog ajout stock
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Formulaire
  const [productName, setProductName] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>("surgele")
  const [selectedUnit, setSelectedUnit] = useState("pièces")
  const [packageQuantity, setPackageQuantity] = useState("")
  const [packagePrice, setPackagePrice] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [stockError, setStockError] = useState<string | null>(null)

  const supabase = createClient()

  const handleDelete = async (id: string) => {
    await deleteStock(id)
  }

  const handleAdjust = async (stock: StockWithProduct, delta: number) => {
    const newQty = Math.max(0, Number(stock.quantity) + delta)
    await updateQuantity(stock.id, newQty)
  }

  const isExpiringSoon = (expiryDate: string | null) => {
    if (!expiryDate) return false
    const today = new Date()
    const expiry = new Date(expiryDate)
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0
  }

  const isExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false
    const today = new Date()
    const expiry = new Date(expiryDate)
    return expiry < today
  }

  // Calculer le prix unitaire selon le type d'unité
  const isPackageUnit = (unit: string) => ['pièces', 'unités'].includes(unit)
  
  const calculateUnitPrice = () => {
    const qty = parseFloat(packageQuantity) || 0
    const price = parseFloat(packagePrice) || 0
    if (qty <= 0 || price <= 0) return 0
    
    if (isPackageUnit(selectedUnit)) {
      // Pour pièces/unités: prix du colis / quantité dans le colis
      return price / qty
    } else {
      // Pour kg/g/L: le prix saisi est directement le prix par unité
      return price
    }
  }

  const getTotalValue = () => {
    const qty = parseFloat(packageQuantity) || 0
    const price = parseFloat(packagePrice) || 0
    
    if (isPackageUnit(selectedUnit)) {
      return price // Le prix du colis est la valeur totale
    } else {
      return qty * price // Quantité × prix par unité
    }
  }

  // Ajouter un nouveau stock
  const handleAddStock = async () => {
    if (!productName.trim() || !packageQuantity || !packagePrice) {
      setStockError("Veuillez remplir tous les champs obligatoires")
      return
    }

    setIsSubmitting(true)
    setStockError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Non authentifié")

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('establishment_id')
        .eq('id', user.id)
        .single()

      if (!profile?.establishment_id) throw new Error("Pas d'établissement associé")

      const detectedCategory = detectCategory(productName) || selectedCategory
      const icon = suggestIcon(productName)
      const unitPrice = calculateUnitPrice()

      // Créer le produit
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: newProduct, error: productError } = await (supabase as any)
        .from('products')
        .insert({
          name: productName.trim(),
          category: detectedCategory,
          unit: selectedUnit,
          icon: icon,
          establishment_id: profile.establishment_id
        })
        .select('id')
        .single()

      if (productError) throw productError

      // Créer le stock (total_value est généré automatiquement)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: stockErr } = await (supabase as any)
        .from('stock')
        .insert({
          product_id: newProduct.id,
          establishment_id: profile.establishment_id,
          quantity: parseFloat(packageQuantity),
          unit_price: unitPrice,
          package_price: isPackageUnit(selectedUnit) ? parseFloat(packagePrice) : null,
          package_quantity: isPackageUnit(selectedUnit) ? parseFloat(packageQuantity) : null,
          initial_quantity: parseFloat(packageQuantity),
          expiry_date: expiryDate || null,
          added_by: user.id
        })

      if (stockErr) throw stockErr

      // Reset et fermer
      setProductName("")
      setPackageQuantity("")
      setPackagePrice("")
      setExpiryDate("")
      setStockError(null)
      setIsAddDialogOpen(false)
      await fetchStocks()
    } catch (err: unknown) {
      console.error('Erreur ajout stock:', err)
      const errorMsg = err instanceof Error ? err.message : 'Erreur inconnue'
      setStockError(`Erreur: ${errorMsg}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Suggestions de produits existants
  const existingProductNames = stocks.map(s => s.product?.name).filter(Boolean)

  const categoryStocks = getByCategory(activeTab)
  const tabs = [
    { id: "surgele" as ProductCategory, name: "Surgelé", icon: Snowflake },
    { id: "frais" as ProductCategory, name: "Frais", icon: Leaf },
    { id: "sec" as ProductCategory, name: "Sec", icon: Wheat },
  ]

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-up">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Stocks</h1>
          <p className="text-muted-foreground">Gestion des produits par catégorie</p>
        </div>
        <Button className="btn-primary" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-5 w-5 mr-2" />
          Ajouter un Stock
        </Button>
      </div>

      {/* Dialog ajout stock */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="banking-card border-border sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-foreground text-lg">Ajouter un Stock</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Nom du produit */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Nom du produit</label>
              <Input
                placeholder="Ex: Frites surgelées, Canettes Coca..."
                value={productName}
                onChange={(e) => {
                  setProductName(e.target.value)
                  // Auto-détecter la catégorie
                  const detected = detectCategory(e.target.value)
                  if (detected) setSelectedCategory(detected)
                }}
                className="h-11 rounded-lg"
                list="existing-products"
              />
              <datalist id="existing-products">
                {existingProductNames.map((name, i) => (
                  <option key={i} value={name || ''} />
                ))}
              </datalist>
            </div>

            {/* Catégorie */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Catégorie</label>
              <div className="grid grid-cols-3 gap-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = selectedCategory === tab.id
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSelectedCategory(tab.id)}
                      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? "bg-primary text-white"
                          : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.name}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Unité */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Type d'unité</label>
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="w-full h-11 px-3 rounded-lg bg-input border border-border text-sm"
              >
                <option value="pièces">Pièces / Unités</option>
                <option value="kg">Kilogrammes (kg)</option>
                <option value="g">Grammes (g)</option>
                <option value="L">Litres (L)</option>
              </select>
            </div>

            {/* Quantité et Prix */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  {isPackageUnit(selectedUnit) ? "Qté dans le colis" : "Quantité"}
                </label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder={isPackageUnit(selectedUnit) ? "Ex: 24" : "Ex: 5"}
                  value={packageQuantity}
                  onChange={(e) => setPackageQuantity(e.target.value)}
                  className="h-11 rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  {isPackageUnit(selectedUnit) ? "Prix du colis (€)" : `Prix par ${selectedUnit} (€)`}
                </label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder={isPackageUnit(selectedUnit) ? "Ex: 9.80" : "Ex: 4.50"}
                  value={packagePrice}
                  onChange={(e) => setPackagePrice(e.target.value)}
                  className="h-11 rounded-lg"
                />
              </div>
            </div>

            {/* Aperçu du calcul */}
            {packageQuantity && packagePrice && (
              <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Prix unitaire :</span>
                  <span className="font-bold text-accent">
                    {calculateUnitPrice().toFixed(2)}€ / {isPackageUnit(selectedUnit) ? 'pièce' : selectedUnit}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Valeur totale :</span>
                  <span className="font-bold text-primary">{getTotalValue().toFixed(2)}€</span>
                </div>
              </div>
            )}

            {/* Date d'expiration */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Date d'expiration (optionnel)</label>
              <Input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="h-11 rounded-lg"
              />
            </div>

            {/* Message d'erreur */}
            {stockError && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {stockError}
              </div>
            )}

            {/* Bouton valider */}
            <Button 
              className="w-full h-12 btn-primary" 
              onClick={handleAddStock}
              disabled={!productName.trim() || !packageQuantity || !packagePrice || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Ajouter au Stock
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const count = getByCategory(tab.id).length
          const total = getCategoryTotal(tab.id)
          return (
            <div key={tab.id} className="banking-card p-5 animate-fade-up delay-1">
              <div className="flex items-center justify-between mb-3">
                <Icon className="h-5 w-5 text-primary" />
                <span className="text-xs text-muted-foreground">{count} articles</span>
              </div>
              <p className="text-sm text-muted-foreground">{tab.name}</p>
              <p className="text-2xl font-bold text-foreground">{total.toFixed(0)}€</p>
            </div>
          )
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 animate-fade-up delay-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
                isActive
                  ? "bg-primary text-white"
                  : "bg-card text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.name}
            </button>
          )
        })}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 gap-4 animate-fade-up delay-3">
        {categoryStocks.map((stock) => (
          <div
            key={stock.id}
            className={`banking-card p-5 ${
              isExpired(stock.expiry_date)
                ? "border-destructive/50"
                : isExpiringSoon(stock.expiry_date)
                  ? "border-orange-500/50"
                  : ""
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                  {stock.product?.icon || <Package className="h-6 w-6 text-primary" />}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{stock.product?.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {stock.quantity} {stock.product?.unit}
                  </p>
                </div>
              </div>
              <Button
                size="icon-sm"
                variant="ghost"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => handleDelete(stock.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Valeur</span>
                <span className="font-semibold text-primary">{Number(stock.total_value || 0).toFixed(2)}€</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Expiration
                </span>
                <span className={`font-medium ${
                  isExpired(stock.expiry_date) ? "text-destructive" :
                  isExpiringSoon(stock.expiry_date) ? "text-orange-500" : "text-foreground"
                }`}>
                  {stock.expiry_date ? new Date(stock.expiry_date).toLocaleDateString("fr-FR") : "-"}
                </span>
              </div>

              {(isExpiringSoon(stock.expiry_date) || isExpired(stock.expiry_date)) && (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                  isExpired(stock.expiry_date)
                    ? "bg-destructive/10 text-destructive"
                    : "bg-orange-500/10 text-orange-500"
                }`}>
                  <AlertCircle className="h-4 w-4" />
                  {isExpired(stock.expiry_date) ? "Expiré" : "Expire bientôt"}
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleAdjust(stock, -1)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => handleAdjust(stock, 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {categoryStocks.length === 0 && (
          <div className="col-span-2 banking-card p-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Aucun produit dans cette catégorie</p>
            <Button className="btn-primary" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un Stock
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
