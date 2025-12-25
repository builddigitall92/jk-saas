"use client"

import { useState, useMemo, useEffect } from "react"
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
  Sparkles,
} from "lucide-react"
import { useStock, type StockWithProduct } from "@/lib/hooks/use-stock"
import { useSuppliers } from "@/lib/hooks/use-suppliers"
import { createClient } from "@/utils/supabase/client"
import { AIAssistant } from "@/components/ai-assistant/AIAssistant"

interface StockCalculation {
  unitPrice: number
  pricePerGram: number
  pricePerMl: number
  usedValue: number
  remainingValue: number
  usedQuantity: number
  remainingQuantity: number
  marginPercent: number
  marginAmount: number
}

export default function CalculatorPage() {
  const { stocks, loading: stocksLoading, fetchStocks } = useStock()
  const { suppliers, loading: suppliersLoading } = useSuppliers()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStock, setSelectedStock] = useState<StockWithProduct | null>(null)
  
  const [editingField, setEditingField] = useState<string | null>(null)
  const [tempValue, setTempValue] = useState("")
  
  const [simulatedUsage, setSimulatedUsage] = useState<Record<string, number>>({})
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false)

  const loading = stocksLoading || suppliersLoading

  const filteredStocks = useMemo(() => {
    if (!searchQuery) return stocks
    const search = searchQuery.toLowerCase()
    return stocks.filter(s => 
      s.product?.name?.toLowerCase().includes(search) ||
      s.product?.category?.toLowerCase().includes(search)
    )
  }, [stocks, searchQuery])

  const isPackageUnit = (unit: string) => {
    return unit === 'pièces' || unit === 'unités'
  }

  const calculateStock = (stock: StockWithProduct, usedQty: number = 0): StockCalculation => {
    const currentQty = Number(stock.quantity)
    const unit = stock.product?.unit || 'unités'
    
    const unitPrice = Number(stock.unit_price) || 0
    
    let pricePerGram = 0
    let pricePerMl = 0
    if (unit === 'kg') {
      pricePerGram = unitPrice / 1000
    } else if (unit === 'g') {
      pricePerGram = unitPrice
    } else if (unit === 'L') {
      pricePerMl = unitPrice / 1000
    }
    
    const usedQuantity = usedQty
    const remainingQuantity = currentQty
    
    const usedValue = usedQuantity * unitPrice
    const remainingValue = remainingQuantity * unitPrice
    
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

  const totalStats = useMemo(() => {
    let totalValue = 0
    let totalSimulatedUsed = 0
    
    stocks.forEach(stock => {
      const calc = calculateStock(stock, simulatedUsage[stock.id] || 0)
      totalValue += calc.remainingValue
      totalSimulatedUsed += calc.usedValue
    })
    
    return {
      totalValue,
      totalSimulatedUsed,
      stockCount: stocks.length
    }
  }, [stocks, simulatedUsage])

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

  const formatPrice = (price: number) => {
    if (price < 0.01 && price > 0) {
      return price.toFixed(4)
    }
    return price.toFixed(2)
  }

  const getSupplierName = (supplierId: string | null) => {
    if (!supplierId) return "Non défini"
    const supplier = suppliers.find(s => s.id === supplierId)
    return supplier?.name || "Non défini"
  }

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
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
          </div>
          <p className="text-slate-400 text-sm">Chargement du calculateur...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between glass-animate-fade-up">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100 tracking-tight flex items-center gap-3">
            <Calculator className="h-7 w-7 text-blue-400" />
            Calculateur de Stock
          </h1>
          <p className="text-sm text-slate-400">
            Calculez automatiquement les prix unitaires et la valeur de votre stock
          </p>
        </div>
        <button 
          className="ai-trigger-btn"
          onClick={() => setIsAIAssistantOpen(true)}
        >
          <Sparkles className="h-4 w-4" />
          <span>Analyser mes marges</span>
        </button>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-stat-card glass-animate-fade-up glass-stagger-1">
          <div className="flex items-center gap-3">
            <div className="glass-stat-icon glass-stat-icon-blue">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="glass-stat-label">Articles en stock</p>
              <p className="text-xl font-bold text-white">{totalStats.stockCount}</p>
            </div>
          </div>
        </div>
        <div className="glass-stat-card glass-animate-fade-up glass-stagger-2">
          <div className="flex items-center gap-3">
            <div className="glass-stat-icon glass-stat-icon-green">
              <Euro className="h-5 w-5" />
            </div>
            <div>
              <p className="glass-stat-label">Valeur totale en stock</p>
              <p className="glass-stat-value glass-stat-value-green">{totalStats.totalValue.toFixed(2)}€</p>
            </div>
          </div>
        </div>
        {totalStats.totalSimulatedUsed > 0 && (
          <div className="glass-stat-card glass-animate-fade-up glass-stagger-3">
            <div className="flex items-center gap-3">
              <div className="glass-stat-icon glass-stat-icon-orange">
                <Minus className="h-5 w-5" />
              </div>
              <div>
                <p className="glass-stat-label">Simulation utilisée</p>
                <p className="glass-stat-value glass-stat-value-orange">{totalStats.totalSimulatedUsed.toFixed(2)}€</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Barre de recherche */}
      <div className="glass-search glass-animate-fade-up glass-stagger-4">
        <Search className="glass-search-icon h-4 w-4" />
        <input
          type="text"
          placeholder="Rechercher un produit..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="glass-search-input pl-10"
        />
      </div>

      {/* Liste des stocks avec calculateur */}
      <div className="space-y-4">
        {filteredStocks.length > 0 ? (
          filteredStocks.map((stock, index) => {
            const calc = calculateStock(stock, simulatedUsage[stock.id] || 0)
            const unit = stock.product?.unit || 'unités'
            const isSelected = selectedStock?.id === stock.id
            
            return (
              <div 
                key={stock.id} 
                className={`glass-stat-card cursor-pointer transition-all glass-animate-fade-up ${isSelected ? 'ring-2 ring-blue-500/50' : ''}`}
                style={{ animationDelay: `${0.1 * (index % 5)}s` }}
                onClick={() => setSelectedStock(isSelected ? null : stock)}
              >
                {/* Ligne principale */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center text-2xl">
                    {stock.product?.icon || <Package className="h-7 w-7 text-blue-400" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg">{stock.product?.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
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
                    <p className="text-2xl font-bold text-blue-400">{calc.remainingValue.toFixed(2)}€</p>
                    <p className="text-sm text-slate-400">en stock</p>
                  </div>
                </div>

                {/* Grille de calculs */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {/* Prix unitaire */}
                  <div 
                    className="p-3 rounded-xl text-center"
                    style={{
                      background: "rgba(59, 130, 246, 0.1)",
                      border: "1px solid rgba(59, 130, 246, 0.2)",
                    }}
                  >
                    <p className="text-xs text-slate-400 mb-1">
                      Prix {isPackageUnit(unit) ? 'par pièce' : `par ${unit}`}
                    </p>
                    <p className="font-bold text-blue-400 text-lg">{formatPrice(calc.unitPrice)}€</p>
                    {(unit === 'kg' || unit === 'L') && (
                      <p className="text-xs text-slate-500">
                        {formatPrice(unit === 'kg' ? calc.pricePerGram : calc.pricePerMl)}€/{getBaseUnit(unit)}
                      </p>
                    )}
                  </div>

                  {/* Quantité en stock */}
                  <div 
                    className="p-3 rounded-xl text-center"
                    style={{
                      background: "rgba(30, 41, 59, 0.4)",
                      border: "1px solid rgba(100, 130, 180, 0.1)",
                    }}
                  >
                    <p className="text-xs text-slate-400 mb-1">En stock</p>
                    <p className="font-bold text-white text-lg">{Number(stock.quantity)} {unit}</p>
                  </div>

                  {/* Valeur en stock */}
                  <div 
                    className="p-3 rounded-xl text-center"
                    style={{
                      background: "rgba(34, 197, 94, 0.1)",
                      border: "1px solid rgba(34, 197, 94, 0.2)",
                    }}
                  >
                    <p className="text-xs text-slate-400 mb-1">Valeur en stock</p>
                    <p className="font-bold text-green-400 text-lg">{calc.remainingValue.toFixed(2)}€</p>
                  </div>

                  {/* Fournisseur */}
                  <div 
                    className="p-3 rounded-xl text-center"
                    style={{
                      background: "rgba(30, 41, 59, 0.4)",
                      border: "1px solid rgba(100, 130, 180, 0.1)",
                    }}
                  >
                    <p className="text-xs text-slate-400 mb-1">Fournisseur</p>
                    {editingField === `${stock.id}-supplier_id` ? (
                      <div className="flex items-center gap-1">
                        <select
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          className="h-8 text-xs rounded px-1 flex-1 bg-slate-800 border border-slate-600 text-white"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="">Aucun</option>
                          {suppliers.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                        <button 
                          className="glass-btn-icon w-6 h-6"
                          onClick={(e) => {
                            e.stopPropagation()
                            updateStockField(stock.id, 'supplier_id', tempValue || null)
                          }}
                        >
                          <Check className="h-3 w-3 text-green-400" />
                        </button>
                      </div>
                    ) : (
                      <p 
                        className="font-medium text-white cursor-pointer hover:text-blue-400 flex items-center justify-center gap-1 text-sm"
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
                  <div className="pt-4 border-t border-white/10 space-y-4 glass-animate-fade-up">
                    {/* Simulateur d'utilisation */}
                    <div 
                      className="p-4 rounded-xl"
                      style={{
                        background: "rgba(251, 146, 60, 0.08)",
                        border: "1px solid rgba(251, 146, 60, 0.2)",
                      }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Info className="h-4 w-4 text-orange-400" />
                        <span className="text-sm font-medium text-white">Simuler une utilisation</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="text-xs text-slate-400 mb-1 block">Quantité à utiliser</label>
                          <div className="flex items-center gap-2">
                            <input
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
                              className="w-32 h-10 px-3 rounded-lg bg-slate-800/50 border border-slate-600/30 text-white"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span className="text-slate-400">{unit}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-400 mb-1">Valeur utilisée</p>
                          <p className="text-lg font-bold text-orange-400">
                            {((simulatedUsage[stock.id] || 0) * calc.unitPrice).toFixed(2)}€
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-400 mb-1">Il restera</p>
                          <p className="text-lg font-bold text-blue-400">
                            {(calc.remainingValue - (simulatedUsage[stock.id] || 0) * calc.unitPrice).toFixed(2)}€
                          </p>
                        </div>
                      </div>
                      
                      {simulatedUsage[stock.id] > 0 && (
                        <div 
                          className="mt-3 p-3 rounded-lg text-sm"
                          style={{
                            background: "rgba(30, 41, 59, 0.4)",
                          }}
                        >
                          <p className="text-slate-200">
                            📊 Vous utilisez <span className="font-bold text-orange-400">{simulatedUsage[stock.id]} {unit}</span> 
                            {' '}({((simulatedUsage[stock.id] || 0) * calc.unitPrice).toFixed(2)}€), 
                            il restera <span className="font-bold text-blue-400">
                              {(Number(stock.quantity) - (simulatedUsage[stock.id] || 0)).toFixed(2)} {unit}
                            </span> 
                            {' '}({(calc.remainingValue - (simulatedUsage[stock.id] || 0) * calc.unitPrice).toFixed(2)}€ en stock)
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Prix de vente et marge */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div 
                        className="p-4 rounded-xl"
                        style={{
                          background: "rgba(30, 41, 59, 0.4)",
                          border: "1px solid rgba(100, 130, 180, 0.1)",
                        }}
                      >
                        <p className="text-xs text-slate-400 mb-2">Prix de vente unitaire</p>
                        {editingField === `${stock.id}-selling_price` ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              step="0.01"
                              value={tempValue}
                              onChange={(e) => setTempValue(e.target.value)}
                              className="flex-1 h-10 px-3 rounded-lg bg-slate-800/50 border border-slate-600/30 text-white"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                            <button 
                              className="glass-btn-success glass-btn-sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                updateStockField(stock.id, 'selling_price', parseFloat(tempValue) || null)
                              }}
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button 
                              className="glass-btn-secondary glass-btn-sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingField(null)
                              }}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div 
                            className="flex items-center justify-between cursor-pointer hover:bg-white/5 p-2 rounded-lg -m-2"
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingField(`${stock.id}-selling_price`)
                              setTempValue(String(stock.selling_price || ''))
                            }}
                          >
                            <span className="text-xl font-bold text-white">
                              {stock.selling_price ? `${Number(stock.selling_price).toFixed(2)}€` : 'Non défini'}
                            </span>
                            <Edit3 className="h-4 w-4 text-slate-500" />
                          </div>
                        )}
                      </div>
                      
                      <div 
                        className="p-4 rounded-xl"
                        style={{
                          background: "rgba(34, 197, 94, 0.1)",
                          border: "1px solid rgba(34, 197, 94, 0.2)",
                        }}
                      >
                        <p className="text-xs text-slate-400 mb-2">Marge par unité</p>
                        {calc.marginPercent > 0 ? (
                          <div>
                            <span className={`text-xl font-bold ${calc.marginPercent >= 60 ? 'text-green-400' : calc.marginPercent >= 40 ? 'text-orange-400' : 'text-red-400'}`}>
                              {calc.marginPercent.toFixed(1)}%
                            </span>
                            <span className="text-sm text-slate-400 ml-2">
                              ({calc.marginAmount.toFixed(2)}€/unité)
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">Définir un prix de vente</span>
                        )}
                      </div>
                    </div>

                    {/* CA et Bénéfice potentiel */}
                    {stock.selling_price && Number(stock.selling_price) > 0 && (
                      <div 
                        className="p-4 rounded-xl"
                        style={{
                          background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(34, 197, 94, 0.1) 100%)",
                          border: "1px solid rgba(59, 130, 246, 0.2)",
                        }}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-sm font-medium text-white flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-blue-400" />
                            Calculer mon CA
                          </p>
                        </div>
                        
                        {/* Quantité éditable */}
                        <div 
                          className="mb-4 p-3 rounded-lg"
                          style={{
                            background: "rgba(15, 23, 42, 0.5)",
                          }}
                        >
                          <label className="text-xs text-slate-400 mb-2 block">
                            Quantité à vendre ({unit})
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              step="1"
                              min="0"
                              value={simulatedUsage[`sales-${stock.id}`] ?? Number(stock.quantity)}
                              onChange={(e) => setSimulatedUsage(prev => ({
                                ...prev,
                                [`sales-${stock.id}`]: parseFloat(e.target.value) || 0
                              }))}
                              className="flex-1 text-lg font-bold text-center h-10 px-3 rounded-lg bg-slate-800/50 border border-slate-600/30 text-white"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span className="text-slate-400">{unit}</span>
                            {(simulatedUsage[`sales-${stock.id}`] !== undefined && 
                              simulatedUsage[`sales-${stock.id}`] !== Number(stock.quantity)) && (
                              <button 
                                className="glass-btn-success"
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
                                <Check className="h-4 w-4" />
                                Confirmer
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
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
                              <div 
                                className="text-center p-3 rounded-lg"
                                style={{ background: "rgba(15, 23, 42, 0.5)" }}
                              >
                                <p className="text-xs text-slate-400 mb-1">Chiffre d'affaires</p>
                                <p className="text-2xl font-bold text-blue-400">
                                  {ca.toFixed(2)}€
                                </p>
                                <p className="text-xs text-slate-500">
                                  {qtyToSell} × {Number(stock.selling_price).toFixed(2)}€
                                </p>
                              </div>
                              <div 
                                className="text-center p-3 rounded-lg"
                                style={{ background: "rgba(15, 23, 42, 0.5)" }}
                              >
                                <p className="text-xs text-slate-400 mb-1">Bénéfice brut</p>
                                <p className={`text-2xl font-bold ${calc.marginPercent >= 60 ? 'text-green-400' : calc.marginPercent >= 40 ? 'text-orange-400' : 'text-red-400'}`}>
                                  {benefice.toFixed(2)}€
                                </p>
                                <p className="text-xs text-slate-500">
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
          <div className="glass-stat-card glass-animate-fade-up">
            <div className="glass-empty-state">
              <div className="glass-empty-icon">
                <Package className="h-10 w-10" />
              </div>
              <p className="glass-empty-title">Aucun produit en stock</p>
              <p className="glass-empty-desc">
                Ajoutez des produits dans l'onglet Stock pour utiliser le calculateur
              </p>
            </div>
          </div>
        )}
      </div>

      {/* AI Assistant */}
      <AIAssistant
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        mode="margin"
      />
    </div>
  )
}
