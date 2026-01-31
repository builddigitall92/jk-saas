"use client"

import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
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
  Plus,
  Snowflake,
  Coffee,
  ArrowUpRight,
  HelpCircle,
  ChevronDown,
  MousePointerClick
} from "lucide-react"
import { useStock, type StockWithProduct } from "@/lib/hooks/use-stock"
import { useSuppliers } from "@/lib/hooks/use-suppliers"
import { createClient } from "@/utils/supabase/client"
import { AIAssistant } from "@/components/ai-assistant/AIAssistant"

// --- TYPES ---
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

// --- UTILS ---
const formatCurrency = (val: number) => 
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val)

const getStockIcon = (name: string = "") => {
  const n = name.toLowerCase()
  if (n.includes("glace") || n.includes("surgelé") || n.includes("ice")) return <Snowflake className="h-6 w-6 text-cyan-400" />
  if (n.includes("café") || n.includes("thé")) return <Coffee className="h-6 w-6 text-amber-400" />
  if (n.includes("boisson") || n.includes("jus")) return <Coffee className="h-6 w-6 text-purple-400" />
  return <Package className="h-6 w-6 text-white" />
}

export default function CalculatorPage() {
  // --- STATE & HOOKS ---
  const { stocks, loading: stocksLoading, fetchStocks } = useStock()
  const { suppliers, loading: suppliersLoading } = useSuppliers()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStockId, setSelectedStockId] = useState<string | null>(null)
  
  const [editingField, setEditingField] = useState<string | null>(null)
  const [tempValue, setTempValue] = useState("")
  
  const [simulatedUsage, setSimulatedUsage] = useState<Record<string, number>>({})
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false)
  const [showHelp, setShowHelp] = useState(true)

  const loading = stocksLoading || suppliersLoading

  // --- DERIVED DATA ---
  const filteredStocks = useMemo(() => {
    if (!searchQuery) return stocks
    const search = searchQuery.toLowerCase()
    return stocks.filter(s => 
      s.product?.name?.toLowerCase().includes(search) ||
      s.product?.category?.toLowerCase().includes(search)
    )
  }, [stocks, searchQuery])

  const totalStats = useMemo(() => {
    let totalValue = 0
    let totalSimulatedUsed = 0
    let marginSum = 0
    let marginCount = 0
    
    stocks.forEach(stock => {
      const unitPrice = Number(stock.unit_price) || 0
      const remainingValue = Number(stock.quantity) * unitPrice
      const usedValue = (simulatedUsage[stock.id] || 0) * unitPrice
      const sellingPrice = Number(stock.selling_price) || 0
      
      totalValue += remainingValue
      totalSimulatedUsed += usedValue
      
      if (sellingPrice > 0 && unitPrice > 0) {
        const pct = ((sellingPrice - unitPrice) / sellingPrice) * 100
        marginSum += pct
        marginCount++
      }
    })
    
    const averageMargin = marginCount > 0 ? marginSum / marginCount : 0
    
    return {
      totalValue,
      totalSimulatedUsed,
      stockCount: stocks.length,
      averageMargin
    }
  }, [stocks, simulatedUsage])

  // --- ACTIONS ---
  const updateStockField = async (stockId: string, field: string, value: number | string | null) => {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('stock')
      .update({ [field]: value })
      .eq('id', stockId)
    
    toast.success("Mise à jour effectuée", {
      description: `Le champ ${field} a été mis à jour avec succès.`
    })

    await fetchStocks()
    setEditingField(null)
    setTempValue("")
  }

  const calculateStock = (stock: StockWithProduct, usedQty: number = 0): StockCalculation => {
    const currentQty = Number(stock.quantity)
    const unit = stock.product?.unit || 'unités'
    const unitPrice = Number(stock.unit_price) || 0
    
    let pricePerGram = 0
    let pricePerMl = 0
    if (unit === 'kg') pricePerGram = unitPrice / 1000
    else if (unit === 'g') pricePerGram = unitPrice
    else if (unit === 'L') pricePerMl = unitPrice / 1000
    
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
      unitPrice, pricePerGram, pricePerMl, usedValue, remainingValue,
      usedQuantity, remainingQuantity, marginPercent, marginAmount
    }
  }

  const getSupplierName = (supplierId: string | null) => {
    if (!supplierId) return "Non défini"
    return suppliers.find(s => s.id === supplierId)?.name || "Non défini"
  }

  // --- RENDER HELPERS ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0e27]">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-t-2 border-l-2 border-violet-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-t-2 border-l-2 border-pink-500 animate-spin delay-150"></div>
          </div>
          <p className="text-white/60 font-semibold tracking-widest animate-pulse">CHARGEMENT DU CALCULATEUR...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen nucleus-bg text-white font-sans selection:bg-pink-500/30">
      
      {/* --- HEADER --- */}
      <header className="sticky top-0 z-50 border-b border-white/5">
        <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500/20 to-pink-500/20 border border-white/10">
              <Calculator className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white leading-none">
                Calculateur de Stock
              </h1>
              <p className="text-xs text-white/40 font-semibold tracking-wide mt-1">
                GÉREZ VOS MARGES EN TEMPS RÉEL
              </p>
            </div>
            {!showHelp && (
              <button
                onClick={() => setShowHelp(true)}
                className="ml-2 p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-violet-400 transition-colors"
                title="Afficher l'aide"
              >
                <HelpCircle className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {/* Metric 1 */}
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors cursor-pointer group">
              <div className="h-10 w-10 rounded-full bg-violet-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Package className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <div className="text-2xl font-bold leading-none tabular-nums text-white">
                  {totalStats.stockCount}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">
                  Articles Actifs
                </div>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors cursor-pointer group">
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Euro className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold leading-none tabular-nums text-white flex items-end gap-1">
                  {totalStats.totalValue.toFixed(0)}<span className="text-sm font-semibold opacity-60 mb-1">.{(totalStats.totalValue % 1).toFixed(2).substring(2)}€</span>
                </div>
                <div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold flex items-center gap-1">
                  Valeur Totale <ArrowUpRight className="h-3 w-3 text-green-500" />
                </div>
              </div>
            </div>

            {/* Metric 3 - Marge moyenne */}
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors cursor-pointer group">
              <div className="h-10 w-10 rounded-full bg-violet-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <div className="text-2xl font-bold leading-none tabular-nums text-white flex items-end gap-1">
                  {totalStats.averageMargin > 0 ? `${totalStats.averageMargin.toFixed(1)}%` : "—"}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">
                  Marge moyenne
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* --- SEARCH BAR FLOATING --- */}
        <div className="px-6 pb-6 pt-2">
          <div className="relative max-w-2xl mx-auto">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-violet-400 transition-colors" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un produit, une catégorie..." 
                className="w-full h-12 bg-white/5 border border-white/10 rounded-full pl-12 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:bg-white/10 focus:border-violet-500/50 transition-all shadow-lg backdrop-blur-md"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* --- HELP SECTION --- */}
      <AnimatePresence>
        {showHelp && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-6 mt-4 overflow-hidden"
          >
            <div className="max-w-[1600px] mx-auto p-4 rounded-xl bg-gradient-to-r from-violet-500/10 via-transparent to-pink-500/10 border border-white/10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-violet-500/20 border border-violet-500/30">
                    <HelpCircle className="h-5 w-5 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-2">Comment utiliser le Calculateur ?</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-white/70">
                      <div className="flex items-start gap-2">
                        <MousePointerClick className="h-4 w-4 text-violet-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-white/90">Cliquez sur une carte</span>
                          <p className="mt-0.5">Pour voir les détails et simuler l&apos;utilisation du stock</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Edit3 className="h-4 w-4 text-pink-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-white/90">Modifiez le prix de vente</span>
                          <p className="mt-0.5">Pour calculer automatiquement votre marge bénéficiaire</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Sparkles className="h-4 w-4 text-violet-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-white/90">Utilisez l&apos;Assistant IA</span>
                          <p className="mt-0.5">En bas à droite pour des recommandations personnalisées</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setShowHelp(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- CONTENT GRID --- */}
      <main className="p-6 pb-32 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredStocks.map((stock, index) => {
              const calc = calculateStock(stock, simulatedUsage[stock.id] || 0)
              const unit = stock.product?.unit || 'unités'
              const isSelected = selectedStockId === stock.id

              return (
                <motion.div
                  key={stock.id}
                  layoutId={stock.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  onClick={() => setSelectedStockId(isSelected ? null : stock.id)}
                  className={`relative group rounded-2xl p-5 border transition-all duration-300 cursor-pointer overflow-hidden ${
                    isSelected 
                      ? 'bg-white/10 border-violet-500/50 shadow-[0_0_40px_rgba(139,92,246,0.2)]' 
                      : 'glass-card-nucleus hover:-translate-y-1'
                  }`}
                >
                  {/* Selection Indicator */}
                  {isSelected && <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-violet-500 to-pink-500" />}

                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/10 to-pink-500/10 border border-white/5 flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.2)]">
                        {getStockIcon(stock.product?.name)}
                      </div>
                      <div>
                        <h3 className="font-bold text-[15px] text-white tracking-tight truncate max-w-[140px]">
                          {stock.product?.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/60 font-semibold">
                             {unit}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Data Grid */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="p-3 rounded-lg bg-black/20 border border-white/5 text-center">
                      <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1 font-semibold">Prix/u</div>
                      <div className="text-sm font-bold text-white tabular-nums">
                        {calc.unitPrice.toFixed(2)}€
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-black/20 border border-white/5 text-center">
                      <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1 font-semibold">Stock</div>
                      <div className="text-sm font-bold text-white tabular-nums">
                        {Number(stock.quantity)}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-black/20 border border-white/5 text-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent opacity-50"></div>
                      <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1 relative z-10 font-semibold">Valeur</div>
                      <div className="text-sm font-bold text-white tabular-nums relative z-10">
                        {calc.remainingValue.toFixed(0)}€
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 border-t border-white/5 space-y-4">
                          
                          {/* Simulation Input */}
                          <div className="space-y-2">
                            <label className="text-[11px] uppercase tracking-wider text-violet-300 font-semibold flex items-center gap-2">
                              <Sparkles className="h-3 w-3" /> Simuler Utilisation
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                max={Number(stock.quantity)}
                                value={simulatedUsage[stock.id] || ""}
                                onChange={(e) => setSimulatedUsage(prev => ({ ...prev, [stock.id]: parseFloat(e.target.value) || 0 }))}
                                onClick={(e) => e.stopPropagation()}
                                placeholder="0"
                                className="flex-1 h-9 rounded-lg bg-white/5 border border-white/10 px-3 text-sm text-white focus:border-pink-500/50 focus:bg-white/10 outline-none transition-all"
                              />
                              <div className="h-9 px-3 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-xs text-white/60">
                                -{((simulatedUsage[stock.id] || 0) * calc.unitPrice).toFixed(2)}€
                              </div>
                            </div>
                          </div>

                          {/* Pricing & Margin */}
                          <div className="space-y-2">
                            <label className="text-[11px] uppercase tracking-wider text-white/40 font-semibold">Prix de Vente</label>
                            <div className="flex items-center gap-2">
                               {editingField === `${stock.id}-selling_price` ? (
                                <div className="flex items-center gap-2 flex-1">
                                  <input
                                    type="number"
                                    autoFocus
                                    value={tempValue}
                                    onChange={(e) => setTempValue(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex-1 h-9 rounded-lg bg-white/10 border border-violet-500/50 px-3 text-sm text-white outline-none"
                                  />
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      updateStockField(stock.id, 'selling_price', parseFloat(tempValue) || null)
                                    }}
                                    className="h-9 w-9 flex items-center justify-center rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                  >
                                    <Check className="h-4 w-4" />
                                  </button>
                                </div>
                               ) : (
                                 <div 
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setEditingField(`${stock.id}-selling_price`)
                                    setTempValue(String(stock.selling_price || ''))
                                  }}
                                  className="flex-1 h-9 flex items-center justify-between px-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 cursor-text group/edit"
                                 >
                                   <span className="text-sm text-white font-bold">{stock.selling_price ? `${Number(stock.selling_price).toFixed(2)}€` : 'Non défini'}</span>
                                   <Edit3 className="h-3 w-3 text-white/20 group-hover/edit:text-white/60" />
                                 </div>
                               )}
                            </div>
                            
                            {calc.marginPercent > 0 && (
                              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gradient-to-r from-violet-500/10 to-pink-500/10 border border-white/5">
                                <span className="text-xs text-white/60 font-semibold">Marge</span>
                                <span className={`text-sm font-bold ${calc.marginPercent >= 60 ? 'text-green-400' : 'text-orange-400'}`}>
                                  {calc.marginPercent.toFixed(0)}%
                                </span>
                              </div>
                            )}
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Footer */}
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] text-white/40 font-semibold">
                      <Building2 className="h-3 w-3" />
                      <span className="truncate max-w-[100px]">{getSupplierName(stock.supplier_id)}</span>
                    </div>
                    {!isSelected && stock.selling_price && (
                      <div className="text-[10px] text-green-400/80 font-bold px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
                         Marge {(calc.marginPercent).toFixed(0)}%
                      </div>
                    )}
                  </div>

                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
        
        {/* Empty State */}
        {filteredStocks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 opacity-0 animate-[fadeIn_0.5s_forwards]">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 relative">
              <div className="absolute inset-0 rounded-full border border-white/10 animate-[ping_3s_infinite_opacity-20]"></div>
              <Search className="h-10 w-10 text-white/20" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Aucun produit trouvé</h3>
            <p className="text-white/40 max-w-sm text-center font-semibold">
              Essayez une autre recherche ou ajoutez de nouveaux produits à votre inventaire.
            </p>
          </div>
        )}
      </main>

      {/* --- FAB (Floating Action Button) --- */}
      <div className="fixed bottom-[calc(var(--mobile-nav-height,70px)+16px)] lg:bottom-8 right-4 lg:right-8 z-40 group">
        <button 
          onClick={() => setIsAIAssistantOpen(true)}
          className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 shadow-[0_8px_32px_rgba(236,72,153,0.4)] flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all duration-300"
        >
          <Sparkles className="h-5 w-5 lg:h-6 lg:w-6 group-hover:rotate-90 transition-transform duration-300" />
        </button>
        {/* Tooltip - hidden on mobile */}
        <div className="hidden lg:block absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none translate-y-2 group-hover:translate-y-0">
          <div className="bg-black/90 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-2xl min-w-[280px]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">Assistant IA</h4>
                <p className="text-white/50 text-xs">Optimisez vos marges</p>
              </div>
            </div>
            <div className="space-y-2 text-xs text-white/70">
              <div className="flex items-start gap-2">
                <span className="text-violet-400">•</span>
                <span>Analysez la rentabilité de vos produits</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-pink-400">•</span>
                <span>Obtenez des recommandations de prix</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-violet-400">•</span>
                <span>Simulez différents scénarios</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/10 text-[10px] text-white/40 font-semibold">
              Cliquez pour ouvrir l&apos;assistant
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant Modal */}
      <AIAssistant
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        mode="margin"
      />
    </div>
  )
}
