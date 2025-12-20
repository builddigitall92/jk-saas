"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Calculator,
  Search,
  Package,
  Loader2,
  Edit3,
  Check,
  X,
  Euro,
  Building2,
  Scale,
  Minus,
  TrendingUp,
  Info,
} from "lucide-react"
import { useStock, type StockWithProduct } from "@/lib/hooks/use-stock"
import { useSuppliers } from "@/lib/hooks/use-suppliers"
import { createClient } from "@/utils/supabase/client"

interface StockCalculation {
  unitPrice: number           // Prix par unité (pièce, kg, L)
  pricePerGram: number        // Prix au gramme (si applicable)
  pricePerMl: number          // Prix au ml (si applicable)
  usedValue: number           // Valeur utilisée en €
  remainingValue: number      // Valeur restante en €
  usedQuantity: number        // Quantité utilisée
  remainingQuantity: number   // Quantité restante
  marginPercent: number       // Marge si prix de vente défini
  marginAmount: number        // Marge en €
}

export default function CalculatorPage() {
  const { stocks, loading: stocksLoading, fetchStocks } = useStock()
  const { suppliers, loading: suppliersLoading } = useSuppliers()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStock, setSelectedStock] = useState<StockWithProduct | null>(null)
  
  // États d'édition
  const [editingField, setEditingField] = useState<string | null>(null)
  const [tempValue, setTempValue] = useState("")
  
  // Simulation d'utilisation
  const [simulatedUsage, setSimulatedUsage] = useState<Record<string, number>>({})

  const loading = stocksLoading || suppliersLoading

  // Filtrer les stocks
  const filteredStocks = useMemo(() => {
    if (!searchQuery) return stocks
    const search = searchQuery.toLowerCase()
    return stocks.filter(s => 
      s.product?.name?.toLowerCase().includes(search) ||
      s.product?.category?.toLowerCase().includes(search)
    )
  }, [stocks, searchQuery])

  // Vérifier si c'est une unité de type "colis" (pièces/unités) ou "poids/volume" (kg/g/L)
  const isPackageUnit = (unit: string) => {
    return unit === 'pièces' || unit === 'unités'
  }

  // Calculs pour un stock donné
  const calculateStock = (stock: StockWithProduct, usedQty: number = 0): StockCalculation => {
    const currentQty = Number(stock.quantity)
    const unit = stock.product?.unit || 'unités'
    
    // Le unit_price stocké EST déjà le prix par unité (calculé à l'ajout du stock)
    // - Pour pièces/unités : c'est le prix par pièce (prix colis / qté colis)
    // - Pour kg/g/L : c'est le prix par kg/g/L (saisi directement)
    const unitPrice = Number(stock.unit_price) || 0
    
    // Prix au gramme / ml (pour kg/L uniquement)
    let pricePerGram = 0
    let pricePerMl = 0
    if (unit === 'kg') {
      pricePerGram = unitPrice / 1000
    } else if (unit === 'g') {
      pricePerGram = unitPrice
    } else if (unit === 'L') {
      pricePerMl = unitPrice / 1000
    }
    
    // Quantités
    const usedQuantity = usedQty
    const remainingQuantity = currentQty
    
    // Valeurs en €
    const usedValue = usedQuantity * unitPrice
    const remainingValue = remainingQuantity * unitPrice
    
    // Marge si prix de vente défini
    const sellingPrice = Number(stock.selling_price) || 0
    let marginPercent = 0
    let marginAmount = 0
    if (sellingPrice > 0 && unitPrice > 0) {
      marginAmount = sellingPrice - unitPrice
      marginPercent = (marginAmount / sellingPrice) * 100
    }
    
    return {
      unitPrice,
      pricePerGram,
      pricePerMl,
      usedValue,
      remainingValue,
      usedQuantity,
      remainingQuantity,
      marginPercent,
      marginAmount
    }
  }
  

  // Stats globales
  const totalStats = useMemo(() => {
    let totalValue = 0
    let totalSimulatedUsed = 0
    
    stocks.forEach(stock => {
      const calc = calculateStock(stock, simulatedUsage[stock.id] || 0)
      // Valeur totale = quantité × prix unitaire
      totalValue += calc.remainingValue
      // Valeur simulée utilisée
      totalSimulatedUsed += calc.usedValue
    })
    
    return {
      totalValue,
      totalSimulatedUsed,
      stockCount: stocks.length
    }
  }, [stocks, simulatedUsage])

  // Mise à jour d'un champ du stock
  const updateStockField = async (stockId: string, field: string, value: number | string | null) => {
    const supabase = createClient()
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('stock')
      .update({ [field]: value })
      .eq('id', stockId)
    
    await fetchStocks()
    setEditingField(null)
    setTempValue("")
  }

  // Formater le prix
  const formatPrice = (price: number) => {
    if (price < 0.01 && price > 0) {
      return price.toFixed(4)
    }
    return price.toFixed(2)
  }

  // Obtenir le nom du fournisseur
  const getSupplierName = (supplierId: string | null) => {
    if (!supplierId) return "Non défini"
    const supplier = suppliers.find(s => s.id === supplierId)
    return supplier?.name || "Non défini"
  }

  // Obtenir l'unité de base pour affichage
  const getBaseUnit = (unit: string) => {
    switch (unit) {
      case 'kg': return 'g'
      case 'L': return 'ml'
      default: return unit
    }
  }

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
          <h1 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-3">
            <Calculator className="h-7 w-7 text-primary" />
            Calculateur de Stock
          </h1>
          <p className="text-muted-foreground">
            Calculez automatiquement les prix unitaires et la valeur de votre stock
          </p>
        </div>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-3 gap-4 mb-6 animate-fade-up delay-1">
        <div className="banking-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Articles en stock</p>
              <p className="text-xl font-bold text-foreground">{totalStats.stockCount}</p>
            </div>
          </div>
        </div>
        <div className="banking-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Euro className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valeur totale en stock</p>
              <p className="text-xl font-bold text-accent">{totalStats.totalValue.toFixed(2)}€</p>
            </div>
          </div>
        </div>
        {totalStats.totalSimulatedUsed > 0 && (
          <div className="banking-card p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Minus className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Simulation utilisée</p>
                <p className="text-xl font-bold text-orange-500">{totalStats.totalSimulatedUsed.toFixed(2)}€</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Barre de recherche */}
      <div className="relative mb-6 animate-fade-up delay-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Rechercher un produit..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border focus:border-primary transition-colors"
        />
      </div>

      {/* Liste des stocks avec calculateur */}
      <div className="space-y-4 animate-fade-up delay-3">
        {filteredStocks.length > 0 ? (
          filteredStocks.map((stock) => {
            const calc = calculateStock(stock, simulatedUsage[stock.id] || 0)
            const unit = stock.product?.unit || 'unités'
            const isSelected = selectedStock?.id === stock.id
            
            return (
              <div 
                key={stock.id} 
                className={`banking-card-ellipse p-5 cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedStock(isSelected ? null : stock)}
              >
                {/* Ligne principale */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                    {stock.product?.icon || <Package className="h-7 w-7 text-primary" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground text-lg">{stock.product?.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {getSupplierName(stock.supplier_id)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Scale className="h-3 w-3" />
                        {unit}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{calc.remainingValue.toFixed(2)}€</p>
                    <p className="text-sm text-muted-foreground">en stock</p>
                  </div>
                </div>

                {/* Grille de calculs */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {/* Prix unitaire */}
                  <div className="p-3 rounded-lg bg-primary/10 text-center">
                    <p className="text-xs text-muted-foreground mb-1">
                      Prix {isPackageUnit(unit) ? 'par pièce' : `par ${unit}`}
                    </p>
                    <p className="font-bold text-primary text-lg">{formatPrice(calc.unitPrice)}€</p>
                    {(unit === 'kg' || unit === 'L') && (
                      <p className="text-xs text-muted-foreground">
                        {formatPrice(unit === 'kg' ? calc.pricePerGram : calc.pricePerMl)}€/{getBaseUnit(unit)}
                      </p>
                    )}
                  </div>

                  {/* Quantité en stock */}
                  <div className="p-3 rounded-lg bg-secondary/30 text-center">
                    <p className="text-xs text-muted-foreground mb-1">En stock</p>
                    <p className="font-bold text-foreground text-lg">{Number(stock.quantity)} {unit}</p>
                  </div>

                  {/* Valeur en stock */}
                  <div className="p-3 rounded-lg bg-accent/10 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Valeur en stock</p>
                    <p className="font-bold text-accent text-lg">{calc.remainingValue.toFixed(2)}€</p>
                  </div>

                  {/* Fournisseur */}
                  <div className="p-3 rounded-lg bg-secondary/30 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Fournisseur</p>
                    {editingField === `${stock.id}-supplier_id` ? (
                      <div className="flex items-center gap-1">
                        <select
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          className="h-8 text-xs rounded px-1 flex-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="">Aucun</option>
                          {suppliers.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                        <Button size="icon-sm" variant="ghost" onClick={(e) => {
                          e.stopPropagation()
                          updateStockField(stock.id, 'supplier_id', tempValue || null)
                        }}>
                          <Check className="h-3 w-3 text-accent" />
                        </Button>
                      </div>
                    ) : (
                      <p 
                        className="font-medium text-foreground cursor-pointer hover:text-primary flex items-center justify-center gap-1 text-sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingField(`${stock.id}-supplier_id`)
                          setTempValue(stock.supplier_id || '')
                        }}
                      >
                        {getSupplierName(stock.supplier_id)}
                        <Edit3 className="h-3 w-3 opacity-50" />
                      </p>
                    )}
                  </div>
                </div>

                {/* Section détaillée (si sélectionné) */}
                {isSelected && (
                  <div className="pt-4 border-t border-border space-y-4 animate-fade-up">
                    {/* Simulateur d'utilisation */}
                    <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/20">
                      <div className="flex items-center gap-2 mb-3">
                        <Info className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium text-foreground">Simuler une utilisation</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="text-xs text-muted-foreground mb-1 block">Quantité à utiliser</label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              max={Number(stock.quantity)}
                              value={simulatedUsage[stock.id] || ""}
                              onChange={(e) => setSimulatedUsage(prev => ({
                                ...prev,
                                [stock.id]: parseFloat(e.target.value) || 0
                              }))}
                              placeholder="0"
                              className="w-32"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span className="text-muted-foreground">{unit}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground mb-1">Valeur utilisée</p>
                          <p className="text-lg font-bold text-orange-500">
                            {((simulatedUsage[stock.id] || 0) * calc.unitPrice).toFixed(2)}€
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground mb-1">Il restera</p>
                          <p className="text-lg font-bold text-primary">
                            {(calc.remainingValue - (simulatedUsage[stock.id] || 0) * calc.unitPrice).toFixed(2)}€
                          </p>
                        </div>
                      </div>
                      
                      {/* Message clair */}
                      {simulatedUsage[stock.id] > 0 && (
                        <div className="mt-3 p-3 rounded-lg bg-secondary/50 text-sm">
                          <p className="text-foreground">
                            📊 Vous utilisez <span className="font-bold text-orange-500">{simulatedUsage[stock.id]} {unit}</span> 
                            {' '}({((simulatedUsage[stock.id] || 0) * calc.unitPrice).toFixed(2)}€), 
                            il restera <span className="font-bold text-primary">
                              {(Number(stock.quantity) - (simulatedUsage[stock.id] || 0)).toFixed(2)} {unit}
                            </span> 
                            {' '}({(calc.remainingValue - (simulatedUsage[stock.id] || 0) * calc.unitPrice).toFixed(2)}€ en stock)
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Prix de vente et marge */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="p-4 rounded-xl bg-secondary/30">
                        <p className="text-xs text-muted-foreground mb-2">Prix de vente unitaire</p>
                        {editingField === `${stock.id}-selling_price` ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              step="0.01"
                              value={tempValue}
                              onChange={(e) => setTempValue(e.target.value)}
                              className="flex-1"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                            <Button size="sm" onClick={(e) => {
                              e.stopPropagation()
                              updateStockField(stock.id, 'selling_price', parseFloat(tempValue) || null)
                            }}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={(e) => {
                              e.stopPropagation()
                              setEditingField(null)
                            }}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div 
                            className="flex items-center justify-between cursor-pointer hover:bg-secondary/50 p-2 rounded-lg -m-2"
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingField(`${stock.id}-selling_price`)
                              setTempValue(String(stock.selling_price || ''))
                            }}
                          >
                            <span className="text-xl font-bold text-foreground">
                              {stock.selling_price ? `${Number(stock.selling_price).toFixed(2)}€` : 'Non défini'}
                            </span>
                            <Edit3 className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4 rounded-xl bg-accent/10">
                        <p className="text-xs text-muted-foreground mb-2">Marge par unité</p>
                        {calc.marginPercent > 0 ? (
                          <div>
                            <span className={`text-xl font-bold ${calc.marginPercent >= 60 ? 'text-accent' : calc.marginPercent >= 40 ? 'text-orange-500' : 'text-destructive'}`}>
                              {calc.marginPercent.toFixed(1)}%
                            </span>
                            <span className="text-sm text-muted-foreground ml-2">
                              ({calc.marginAmount.toFixed(2)}€/unité)
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Définir un prix de vente</span>
                        )}
                      </div>
                    </div>

                    {/* CA et Bénéfice potentiel */}
                    {stock.selling_price && Number(stock.selling_price) > 0 && (
                      <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-sm font-medium text-foreground flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            Calculer mon CA
                          </p>
                        </div>
                        
                        {/* Quantité éditable */}
                        <div className="mb-4 p-3 rounded-lg bg-background/50">
                          <label className="text-xs text-muted-foreground mb-2 block">
                            Quantité à vendre ({unit})
                          </label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              step="1"
                              min="0"
                              value={simulatedUsage[`sales-${stock.id}`] ?? Number(stock.quantity)}
                              onChange={(e) => setSimulatedUsage(prev => ({
                                ...prev,
                                [`sales-${stock.id}`]: parseFloat(e.target.value) || 0
                              }))}
                              className="flex-1 text-lg font-bold text-center"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span className="text-muted-foreground">{unit}</span>
                            {(simulatedUsage[`sales-${stock.id}`] !== undefined && 
                              simulatedUsage[`sales-${stock.id}`] !== Number(stock.quantity)) && (
                              <Button 
                                size="sm" 
                                className="bg-accent hover:bg-accent/80"
                                onClick={async (e) => {
                                  e.stopPropagation()
                                  await updateStockField(stock.id, 'quantity', simulatedUsage[`sales-${stock.id}`])
                                  setSimulatedUsage(prev => {
                                    const newState = { ...prev }
                                    delete newState[`sales-${stock.id}`]
                                    return newState
                                  })
                                }}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Confirmer
                              </Button>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Stock actuel : {Number(stock.quantity)} {unit}
                          </p>
                        </div>

                        {/* CA et Bénéfice calculés */}
                        {(() => {
                          const qtyToSell = simulatedUsage[`sales-${stock.id}`] ?? Number(stock.quantity)
                          const ca = Number(stock.selling_price) * qtyToSell
                          const benefice = calc.marginAmount * qtyToSell
                          
                          return (
                            <div className="grid grid-cols-2 gap-4">
                              <div className="text-center p-3 rounded-lg bg-background/50">
                                <p className="text-xs text-muted-foreground mb-1">Chiffre d'affaires</p>
                                <p className="text-2xl font-bold text-primary">
                                  {ca.toFixed(2)}€
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {qtyToSell} × {Number(stock.selling_price).toFixed(2)}€
                                </p>
                              </div>
                              <div className="text-center p-3 rounded-lg bg-background/50">
                                <p className="text-xs text-muted-foreground mb-1">Bénéfice brut</p>
                                <p className={`text-2xl font-bold ${calc.marginPercent >= 60 ? 'text-accent' : calc.marginPercent >= 40 ? 'text-orange-500' : 'text-destructive'}`}>
                                  {benefice.toFixed(2)}€
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {qtyToSell} × {calc.marginAmount.toFixed(2)}€
                                </p>
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <div className="banking-card p-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-2">Aucun produit en stock</p>
            <p className="text-sm text-muted-foreground">
              Ajoutez des produits dans l'onglet Stock pour utiliser le calculateur
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
