"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Package, AlertCircle, Plus, Minus, Trash2, Snowflake, Leaf, Wheat, Calendar, Loader2, Check, Sparkles, History, Settings, X, ChevronDown, ChevronUp, Truck } from "lucide-react"
import { useState, useEffect } from "react"
import { useStock, type StockWithProduct } from "@/lib/hooks/use-stock"
import { useSuppliers } from "@/lib/hooks/use-suppliers"
import type { ProductCategory, StockUnit, Product } from "@/lib/database.types"
import { detectCategory, suggestIcon, suggestUnit } from "@/lib/utils/auto-category"
import { AIAssistant } from "@/components/ai-assistant/AIAssistant"

const ALL_UNITS: StockUnit[] = ['kg', 'g', 'L', 'unités', 'pièces']

export default function EmployeeStockPage() {
  const {
    stocks,
    products,
    loading,
    updateQuantity,
    deleteStock,
    deleteProduct,
    createProduct,
    addOrUpdateStock,
    getByCategory,
    getCategoryTotal,
    getStockHistory,
    findProductByName
  } = useStock()

  const { suppliers } = useSuppliers()

  const [activeTab, setActiveTab] = useState<ProductCategory>("surgele")
  const [activeSection, setActiveSection] = useState<'stock' | 'ingredients' | 'history'>('stock')

  // Dialog ajout stock
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false)

  // Dialog ajout ingrédient
  const [isAddIngredientOpen, setIsAddIngredientOpen] = useState(false)
  const [isSubmittingIngredient, setIsSubmittingIngredient] = useState(false)

  // Formulaire stock
  const [productName, setProductName] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>("surgele")
  const [selectedUnit, setSelectedUnit] = useState<StockUnit>("pièces")
  const [packageQuantity, setPackageQuantity] = useState("")
  const [packagePrice, setPackagePrice] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null)
  const [stockError, setStockError] = useState<string | null>(null)
  const [stockSuccess, setStockSuccess] = useState<string | null>(null)


  // Formulaire ingrédient
  const [newIngredient, setNewIngredient] = useState({
    name: "",
    category: "frais" as ProductCategory,
    unit: "kg" as StockUnit,
    icon: "📦",
    min_stock_threshold: 10
  })
  const [ingredientError, setIngredientError] = useState<string | null>(null)

  // Produit existant détecté
  const [detectedProduct, setDetectedProduct] = useState<Product | null>(null)
  const [showHistoryPanel, setShowHistoryPanel] = useState(true)
  // Flag pour savoir si l'utilisateur a manuellement choisi une catégorie
  const [userSelectedCategory, setUserSelectedCategory] = useState(false)

  // Détecter si le produit existe déjà
  useEffect(() => {
    if (productName.trim().length >= 3) {
      const existing = findProductByName(productName)
      setDetectedProduct(existing || null)

      if (existing) {
        // Utiliser la catégorie et l'unité du produit existant
        setSelectedCategory(existing.category as ProductCategory)
        setSelectedUnit(existing.unit as StockUnit)
        setUserSelectedCategory(false) // Reset car on utilise celle du produit existant
      } else if (!userSelectedCategory) {
        // Auto-détecter la catégorie SEULEMENT si l'utilisateur n'a pas fait de choix manuel
        const detected = detectCategory(productName)
        if (detected) setSelectedCategory(detected)
      }
    } else {
      setDetectedProduct(null)
    }
  }, [productName, findProductByName, userSelectedCategory])

  // Auto-détection pour les ingrédients
  useEffect(() => {
    if (newIngredient.name.length >= 3) {
      const detected = detectCategory(newIngredient.name)
      const icon = suggestIcon(newIngredient.name)
      const unit = suggestUnit(newIngredient.name, detected) as StockUnit

      setNewIngredient(prev => ({
        ...prev,
        category: detected,
        icon: icon,
        unit: unit
      }))
    }
  }, [newIngredient.name])

  const handleDelete = async (id: string) => {
    await deleteStock(id)
  }

  const handleDeleteIngredient = async (productId: string) => {
    await deleteProduct(productId)
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
    setStockSuccess(null)

    try {
      const icon = suggestIcon(productName)
      const unitPrice = calculateUnitPrice()

      const result = await addOrUpdateStock(
        {
          name: productName.trim(),
          category: selectedCategory,
          unit: selectedUnit,
          icon: icon,
          min_stock_threshold: 10
        },
        {
          quantity: parseFloat(packageQuantity),
          unit_price: unitPrice,
          package_price: isPackageUnit(selectedUnit) ? parseFloat(packagePrice) : null,
          package_quantity: isPackageUnit(selectedUnit) ? parseFloat(packageQuantity) : null,
          expiry_date: expiryDate || null,
          supplier_id: selectedSupplierId
        }
      )

      if (result.success) {
        if (result.updated) {
          setStockSuccess(`Stock mis à jour ! ${result.previousQuantity} → ${result.newQuantity} ${selectedUnit}`)
        } else {
          setStockSuccess("Stock ajouté avec succès !")
        }

        // Reset après un délai
        setTimeout(() => {
          setProductName("")
          setPackageQuantity("")
          setPackagePrice("")
          setExpiryDate("")
          setSelectedSupplierId(null)
          setStockSuccess(null)
          setUserSelectedCategory(false)
          setIsAddDialogOpen(false)
        }, 1500)
      } else {
        setStockError(result.error || "Erreur lors de l'ajout")
      }
    } catch (err: unknown) {
      console.error('Erreur ajout stock:', err)
      const errorMsg = err instanceof Error ? err.message : 'Erreur inconnue'
      setStockError(`Erreur: ${errorMsg}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddIngredient = async () => {
    if (!newIngredient.name.trim()) {
      setIngredientError("Veuillez entrer un nom d'ingrédient")
      return
    }

    setIsSubmittingIngredient(true)
    setIngredientError(null)

    try {
      const result = await createProduct(newIngredient)

      if (result.success) {
        setNewIngredient({
          name: "",
          category: "frais",
          unit: "kg",
          icon: "📦",
          min_stock_threshold: 10
        })
        setIsAddIngredientOpen(false)
      } else {
        setIngredientError(result.error || "Erreur lors de la création")
      }
    } catch (err: unknown) {
      console.error('Erreur ajout ingrédient:', err)
      const errorMsg = err instanceof Error ? err.message : 'Erreur inconnue'
      setIngredientError(`Erreur: ${errorMsg}`)
    } finally {
      setIsSubmittingIngredient(false)
    }
  }

  const getCategoryIcon = (category: ProductCategory) => {
    switch (category) {
      case 'surgele': return <Snowflake className="h-4 w-4 text-cyan-400" />
      case 'frais': return <Leaf className="h-4 w-4 text-green-500" />
      case 'sec': return <Wheat className="h-4 w-4 text-amber-500" />
    }
  }

  const getCategoryLabel = (category: ProductCategory) => {
    switch (category) {
      case 'surgele': return 'Surgelé'
      case 'frais': return 'Frais'
      case 'sec': return 'Sec'
    }
  }

  const existingProductNames = products.map(p => p.name).filter(Boolean)
  const categoryStocks = getByCategory(activeTab)
  const stockHistory = getStockHistory()

  const tabs = [
    { id: "surgele" as ProductCategory, name: "Surgelé", icon: Snowflake, color: "cyan" },
    { id: "frais" as ProductCategory, name: "Frais", icon: Leaf, color: "green" },
    { id: "sec" as ProductCategory, name: "Sec", icon: Wheat, color: "orange" },
  ]

  const sectionTabs = [
    { id: 'stock' as const, name: 'Stocks', icon: Package },
    { id: 'ingredients' as const, name: 'Ingrédients', icon: Settings },
    { id: 'history' as const, name: 'Historique', icon: History },
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
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-animate-fade-up">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100 tracking-tight">Stocks</h1>
          <p className="text-sm text-slate-400">Gestion des produits et ingrédients</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="ai-trigger-btn"
            onClick={() => setIsAIAssistantOpen(true)}
          >
            <Sparkles className="h-4 w-4" />
            Assistant IA
          </button>
          {activeSection === 'stock' && (
            <button
              className="glass-btn-primary"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="h-5 w-5" />
              Ajouter un Stock
            </button>
          )}
          {activeSection === 'ingredients' && (
            <button
              className="glass-btn-primary"
              onClick={() => setIsAddIngredientOpen(true)}
            >
              <Plus className="h-5 w-5" />
              Nouvel Ingrédient
            </button>
          )}
        </div>
      </div>

      {/* AI Assistant */}
      <AIAssistant
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        mode="stock"
      />

      {/* Section Tabs */}
      <div className="glass-tabs glass-animate-fade-up">
        {sectionTabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeSection === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`glass-tab ${isActive ? 'glass-tab-active' : ''}`}
            >
              <Icon className="h-4 w-4" />
              {tab.name}
            </button>
          )
        })}
      </div>

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
                onChange={(e) => setProductName(e.target.value)}
                className="glass-search-input"
                list="existing-products"
              />
              <datalist id="existing-products">
                {existingProductNames.map((name, i) => (
                  <option key={i} value={name || ''} />
                ))}
              </datalist>

              {/* Indicateur produit existant */}
              {detectedProduct && (
                <div
                  className="mt-2 p-3 rounded-xl text-sm flex items-center gap-2"
                  style={{
                    background: "rgba(34, 197, 94, 0.1)",
                    border: "1px solid rgba(34, 197, 94, 0.3)",
                    color: "#4ade80",
                  }}
                >
                  <Check className="h-4 w-4" />
                  <span>Produit existant détecté ! Le stock sera mis à jour automatiquement.</span>
                </div>
              )}
            </div>

            {/* Catégorie - désactivé si produit existant */}
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
                      onClick={() => {
                        if (!detectedProduct) {
                          setSelectedCategory(tab.id)
                          setUserSelectedCategory(true)
                        }
                      }}
                      disabled={!!detectedProduct}
                      className={`glass-tab flex-1 ${isActive ? 'glass-tab-active' : ''} ${detectedProduct ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.name}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Unité - désactivé si produit existant */}
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Type d'unité</label>
              <select
                value={selectedUnit}
                onChange={(e) => !detectedProduct && setSelectedUnit(e.target.value as StockUnit)}
                disabled={!!detectedProduct}
                className={`glass-search-input ${detectedProduct ? 'opacity-50 cursor-not-allowed' : ''}`}
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

            {/* Sélection du fournisseur */}
            <div>
              <label className="text-sm text-slate-400 mb-2 block flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Fournisseur (optionnel)
              </label>
              <select
                value={selectedSupplierId || ""}
                onChange={(e) => setSelectedSupplierId(e.target.value || null)}
                className="glass-search-input"
              >
                <option value="">-- Aucun fournisseur --</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Message de succès */}
            {stockSuccess && (
              <div
                className="p-3 rounded-xl text-sm flex items-center gap-2"
                style={{
                  background: "rgba(34, 197, 94, 0.1)",
                  border: "1px solid rgba(34, 197, 94, 0.3)",
                  color: "#4ade80",
                }}
              >
                <Check className="h-4 w-4" />
                {stockSuccess}
              </div>
            )}

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
                  {detectedProduct ? 'Mettre à jour le Stock' : 'Ajouter au Stock'}
                </>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog ajout ingrédient */}
      <Dialog open={isAddIngredientOpen} onOpenChange={setIsAddIngredientOpen}>
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
            <DialogTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-orange-500" />
              Nouvel Ingrédient
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Nom */}
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Nom de l'ingrédient</label>
              <input
                placeholder="Ex: Cannettes Coca-Cola, Salade Iceberg..."
                value={newIngredient.name}
                onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                className="glass-search-input"
              />
              {newIngredient.name.length >= 3 && (
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-orange-500" />
                  Catégorie détectée: <span className="font-medium text-orange-400">{getCategoryLabel(newIngredient.category)}</span>
                </p>
              )}
            </div>

            {/* Catégorie */}
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Catégorie</label>
              <div className="glass-tabs w-full">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = newIngredient.category === tab.id
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setNewIngredient({ ...newIngredient, category: tab.id })}
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
              <label className="text-sm text-slate-400 mb-2 block">Unité de mesure</label>
              <select
                value={newIngredient.unit}
                onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value as StockUnit })}
                className="glass-search-input"
              >
                {ALL_UNITS.map((unit) => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>

            {/* Icône et Seuil */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Icône</label>
                <div className="flex items-center gap-2">
                  <span className="text-2xl bg-slate-800 rounded-lg p-2">{newIngredient.icon}</span>
                  <input
                    value={newIngredient.icon}
                    onChange={(e) => setNewIngredient({ ...newIngredient, icon: e.target.value })}
                    className="glass-search-input w-20 text-center text-xl"
                    maxLength={2}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Seuil d'alerte</label>
                <input
                  type="number"
                  value={newIngredient.min_stock_threshold}
                  onChange={(e) => setNewIngredient({ ...newIngredient, min_stock_threshold: parseInt(e.target.value) || 0 })}
                  className="glass-search-input"
                />
              </div>
            </div>

            {/* Message d'erreur */}
            {ingredientError && (
              <div
                className="p-3 rounded-xl text-sm"
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#f87171",
                }}
              >
                {ingredientError}
              </div>
            )}

            {/* Bouton */}
            <button
              className="glass-btn-primary w-full justify-center py-3"
              onClick={handleAddIngredient}
              disabled={!newIngredient.name.trim() || isSubmittingIngredient}
            >
              {isSubmittingIngredient ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Créer l'ingrédient
                </>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* SECTION: STOCKS */}
      {activeSection === 'stock' && (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
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

          {/* Tabs catégories */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {categoryStocks.map((stock, index) => (
              <div
                key={stock.id}
                className={`glass-stat-card glass-animate-scale-in ${isExpired(stock.expiry_date)
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
                    <span className={`font-medium ${isExpired(stock.expiry_date) ? "text-red-400" :
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
        </>
      )}

      {/* SECTION: INGRÉDIENTS */}
      {activeSection === 'ingredients' && (
        <div className="space-y-6">
          {/* Info banner */}
          <div
            className="p-4 rounded-xl flex items-start gap-3"
            style={{
              background: "rgba(251, 146, 60, 0.1)",
              border: "1px solid rgba(251, 146, 60, 0.2)",
            }}
          >
            <Sparkles className="h-5 w-5 text-orange-400 mt-0.5" />
            <div>
              <p className="text-sm text-orange-300 font-medium">Gestion des ingrédients</p>
              <p className="text-xs text-slate-400 mt-1">
                Définissez vos ingrédients ici. Quand vous ajouterez du stock avec un nom existant,
                le stock sera automatiquement mis à jour au lieu de créer un doublon.
              </p>
            </div>
          </div>

          {/* Liste des ingrédients par catégorie */}
          {products.length > 0 ? (
            <div className="space-y-6">
              {(['surgele', 'frais', 'sec'] as ProductCategory[]).map((category) => {
                const categoryProducts = products.filter(p => p.category === category)
                if (categoryProducts.length === 0) return null

                return (
                  <div key={category}>
                    <h4 className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-3">
                      {getCategoryIcon(category)}
                      {getCategoryLabel(category)} ({categoryProducts.length})
                    </h4>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {categoryProducts.map((product) => (
                        <div
                          key={product.id}
                          className="glass-stat-card group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{product.icon}</span>
                              <div>
                                <p className="font-medium text-sm text-white">{product.name}</p>
                                <p className="text-xs text-slate-500">
                                  {product.unit} • Seuil: {Number(product.min_stock_threshold)}
                                </p>
                              </div>
                            </div>
                            <button
                              className="glass-btn-icon w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity hover:!bg-red-500/20 hover:!border-red-500/40 hover:text-red-400"
                              onClick={() => handleDeleteIngredient(product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="glass-stat-card glass-animate-fade-up">
              <div className="glass-empty-state">
                <div className="glass-empty-icon">
                  <Package className="h-10 w-10" />
                </div>
                <p className="glass-empty-title">Aucun ingrédient défini</p>
                <p className="glass-empty-desc">Créez votre premier ingrédient pour commencer</p>
                <button className="glass-btn-primary" onClick={() => setIsAddIngredientOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Nouvel Ingrédient
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION: HISTORIQUE */}
      {activeSection === 'history' && (
        <div className="space-y-4">
          {/* Panel historique */}
          <div className="glass-stat-card">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setShowHistoryPanel(!showHistoryPanel)}
            >
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-blue-400" />
                <h3 className="font-semibold text-white">Derniers mouvements de stock</h3>
              </div>
              {showHistoryPanel ? (
                <ChevronUp className="h-5 w-5 text-slate-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-slate-400" />
              )}
            </div>

            {showHistoryPanel && (
              <div className="mt-4 space-y-2">
                {stockHistory.length > 0 ? (
                  stockHistory.map((stock) => (
                    <div
                      key={stock.id}
                      className="flex items-center justify-between p-3 rounded-xl"
                      style={{
                        background: "rgba(30, 41, 59, 0.5)",
                        border: "1px solid rgba(100, 130, 180, 0.1)",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{stock.product?.icon || "📦"}</span>
                        <div>
                          <p className="font-medium text-sm text-white">{stock.product?.name}</p>
                          <p className="text-xs text-slate-500">
                            {stock.quantity} {stock.product?.unit} • {Number(stock.total_value || 0).toFixed(2)}€
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400">
                          {new Date(stock.updated_at || stock.created_at).toLocaleDateString("fr-FR")}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(stock.updated_at || stock.created_at).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <History className="h-12 w-12 mx-auto text-slate-600 mb-2" />
                    <p className="text-slate-500 text-sm">Aucun mouvement de stock</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Statistiques historique */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <div className="glass-stat-card">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-slate-400">Total produits</span>
              </div>
              <p className="text-2xl font-bold text-white">{products.length}</p>
              <p className="text-xs text-slate-500 mt-1">ingrédients définis</p>
            </div>
            <div className="glass-stat-card">
              <div className="flex items-center gap-2 mb-2">
                <History className="h-4 w-4 text-green-400" />
                <span className="text-sm text-slate-400">Total stocks</span>
              </div>
              <p className="text-2xl font-bold text-white">{stocks.length}</p>
              <p className="text-xs text-slate-500 mt-1">entrées en stock</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
