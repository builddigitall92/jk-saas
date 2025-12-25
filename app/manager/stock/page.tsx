"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Package, AlertCircle, Plus, Minus, Trash2, Snowflake, Leaf, Wheat, Calendar, Loader2, Check, Search, Sparkles } from "lucide-react"
import { useState } from "react"
import { useStock, type StockWithProduct } from "@/lib/hooks/use-stock"
import type { ProductCategory } from "@/lib/database.types"
import { createClient } from "@/utils/supabase/client"
import { detectCategory, suggestIcon } from "@/lib/utils/auto-category"
import { AIAssistant } from "@/components/ai-assistant/AIAssistant"

export default function ManagerStockPage() {
  const { stocks, loading, updateQuantity, deleteStock, getByCategory, getCategoryTotal, fetchStocks } = useStock()
  const [activeTab, setActiveTab] = useState<ProductCategory>("surgele")
  
  // Dialog ajout stock
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false)
  
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

  const isPackageUnit = (unit: string) => ['pièces', 'unités'].includes(unit)
  
  const calculateUnitPrice = () => {
    const qty = parseFloat(packageQuantity) || 0
    const price = parseFloat(packagePrice) || 0
    if (qty <= 0 || price <= 0) return 0
    
    if (isPackageUnit(selectedUnit)) {
      return price / qty
    } else {
      return price
    }
  }

  const getTotalValue = () => {
    const qty = parseFloat(packageQuantity) || 0
    const price = parseFloat(packagePrice) || 0
    
    if (isPackageUnit(selectedUnit)) {
      return price
    } else {
      return qty * price
    }
  }

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

  const existingProductNames = stocks.map(s => s.product?.name).filter(Boolean)

  const categoryStocks = getByCategory(activeTab)
  const tabs = [
    { id: "surgele" as ProductCategory, name: "Surgelé", icon: Snowflake, color: "cyan" },
    { id: "frais" as ProductCategory, name: "Frais", icon: Leaf, color: "green" },
    { id: "sec" as ProductCategory, name: "Sec", icon: Wheat, color: "orange" },
  ]

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
          </div>
          <p className="text-slate-400 text-sm">Chargement des stocks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between glass-animate-fade-up">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100 tracking-tight">Stocks</h1>
          <p className="text-sm text-slate-400">Gestion des produits par catégorie</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            className="ai-trigger-btn"
            onClick={() => setIsAIAssistantOpen(true)}
          >
            <Sparkles className="h-4 w-4" />
            Assistant IA
          </button>
          <button 
            className="glass-btn-primary"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="h-5 w-5" />
            Ajouter un Stock
          </button>
        </div>
      </div>

      {/* AI Assistant */}
      <AIAssistant
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        mode="stock"
      />

      {/* Dialog ajout stock */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent 
          className="sm:max-w-[500px] border-0"
          style={{
            background: "linear-gradient(145deg, rgba(20, 27, 45, 0.98) 0%, rgba(15, 20, 35, 0.99) 100%)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(100, 130, 180, 0.2)",
            borderRadius: "20px",
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-white">Ajouter un Stock</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Nom du produit */}
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Nom du produit</label>
              <input
                placeholder="Ex: Frites surgelées, Canettes Coca..."
                value={productName}
                onChange={(e) => {
                  setProductName(e.target.value)
                  const detected = detectCategory(e.target.value)
                  if (detected) setSelectedCategory(detected)
                }}
                className="glass-search-input"
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
              <label className="text-sm text-slate-400 mb-2 block">Catégorie</label>
              <div className="glass-tabs w-full">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = selectedCategory === tab.id
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSelectedCategory(tab.id)}
                      className={`glass-tab flex-1 ${isActive ? 'glass-tab-active' : ''}`}
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
              <label className="text-sm text-slate-400 mb-2 block">Type d'unité</label>
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="glass-search-input"
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
                <label className="text-sm text-slate-400 mb-2 block">
                  {isPackageUnit(selectedUnit) ? "Qté dans le colis" : "Quantité"}
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder={isPackageUnit(selectedUnit) ? "Ex: 24" : "Ex: 5"}
                  value={packageQuantity}
                  onChange={(e) => setPackageQuantity(e.target.value)}
                  className="glass-search-input"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-2 block">
                  {isPackageUnit(selectedUnit) ? "Prix du colis (€)" : `Prix par ${selectedUnit} (€)`}
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder={isPackageUnit(selectedUnit) ? "Ex: 9.80" : "Ex: 4.50"}
                  value={packagePrice}
                  onChange={(e) => setPackagePrice(e.target.value)}
                  className="glass-search-input"
                />
              </div>
            </div>

            {/* Aperçu du calcul */}
            {packageQuantity && packagePrice && (
              <div 
                className="p-4 rounded-xl"
                style={{
                  background: "rgba(59, 130, 246, 0.1)",
                  border: "1px solid rgba(59, 130, 246, 0.2)",
                }}
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Prix unitaire :</span>
                  <span className="font-bold text-blue-400">
                    {calculateUnitPrice().toFixed(2)}€ / {isPackageUnit(selectedUnit) ? 'pièce' : selectedUnit}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-slate-400">Valeur totale :</span>
                  <span className="font-bold text-green-400">{getTotalValue().toFixed(2)}€</span>
                </div>
              </div>
            )}

            {/* Date d'expiration */}
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Date d'expiration (optionnel)</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="glass-search-input"
              />
            </div>

            {/* Message d'erreur */}
            {stockError && (
              <div 
                className="p-3 rounded-xl text-sm"
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#f87171",
                }}
              >
                {stockError}
              </div>
            )}

            {/* Bouton valider */}
            <button 
              className="glass-btn-primary w-full justify-center py-3"
              onClick={handleAddStock}
              disabled={!productName.trim() || !packageQuantity || !packagePrice || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Ajouter au Stock
                </>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {tabs.map((tab, index) => {
          const Icon = tab.icon
          const count = getByCategory(tab.id).length
          const total = getCategoryTotal(tab.id)
          return (
            <div 
              key={tab.id} 
              className={`glass-stat-card glass-animate-fade-up glass-stagger-${index + 1}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`glass-stat-icon glass-stat-icon-${tab.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs text-slate-500">{count} articles</span>
              </div>
              <p className="text-sm text-slate-400 mb-1">{tab.name}</p>
              <p className={`glass-stat-value glass-stat-value-${tab.color}`}>{total.toFixed(0)}€</p>
            </div>
          )
        })}
      </div>

      {/* Tabs */}
      <div className="glass-tabs glass-animate-fade-up glass-stagger-4">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`glass-tab ${isActive ? 'glass-tab-active' : ''}`}
            >
              <Icon className="h-4 w-4" />
              {tab.name}
            </button>
          )
        })}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 gap-4">
        {categoryStocks.map((stock, index) => (
          <div
            key={stock.id}
            className={`glass-stat-card glass-animate-scale-in ${
              isExpired(stock.expiry_date)
                ? "!border-red-500/40"
                : isExpiringSoon(stock.expiry_date)
                  ? "!border-orange-500/40"
                  : ""
            }`}
            style={{ animationDelay: `${0.1 * (index % 4)}s` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center text-2xl">
                  {stock.product?.icon || <Package className="h-6 w-6 text-blue-400" />}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{stock.product?.name}</h3>
                  <p className="text-sm text-slate-400">
                    {stock.quantity} {stock.product?.unit}
                  </p>
                </div>
              </div>
              <button
                className="glass-btn-icon w-8 h-8 hover:!bg-red-500/20 hover:!border-red-500/40 hover:text-red-400"
                onClick={() => handleDelete(stock.id)}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Valeur</span>
                <span className="font-semibold text-green-400">{Number(stock.total_value || 0).toFixed(2)}€</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Expiration
                </span>
                <span className={`font-medium ${
                  isExpired(stock.expiry_date) ? "text-red-400" :
                  isExpiringSoon(stock.expiry_date) ? "text-orange-400" : "text-slate-300"
                }`}>
                  {stock.expiry_date ? new Date(stock.expiry_date).toLocaleDateString("fr-FR") : "-"}
                </span>
              </div>

              {(isExpiringSoon(stock.expiry_date) || isExpired(stock.expiry_date)) && (
                <div 
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                  style={{
                    background: isExpired(stock.expiry_date) ? "rgba(239, 68, 68, 0.1)" : "rgba(251, 146, 60, 0.1)",
                    border: `1px solid ${isExpired(stock.expiry_date) ? "rgba(239, 68, 68, 0.3)" : "rgba(251, 146, 60, 0.3)"}`,
                    color: isExpired(stock.expiry_date) ? "#f87171" : "#fb923c",
                  }}
                >
                  <AlertCircle className="h-4 w-4" />
                  {isExpired(stock.expiry_date) ? "Expiré" : "Expire bientôt"}
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  className="glass-btn-secondary flex-1 py-2 text-sm"
                  onClick={() => handleAdjust(stock, -1)}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <button
                  className="glass-btn-primary flex-1 py-2 text-sm"
                  onClick={() => handleAdjust(stock, 1)}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {categoryStocks.length === 0 && (
          <div className="col-span-2 glass-stat-card glass-animate-fade-up">
            <div className="glass-empty-state">
              <div className="glass-empty-icon">
                <Package className="h-10 w-10" />
              </div>
              <p className="glass-empty-title">Aucun produit dans cette catégorie</p>
              <p className="glass-empty-desc">Commencez par ajouter votre premier produit</p>
              <button className="glass-btn-primary" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                Ajouter un Stock
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
