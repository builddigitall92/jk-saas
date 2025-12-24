"use client"

import { useState, useMemo } from "react"
import { 
  TrendingUp, 
  Package, 
  Euro, 
  Calculator,
  Loader2,
  ChevronDown,
  ChevronUp,
  Target,
  ShoppingCart
} from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts"
import { useStock, type StockWithProduct } from "@/lib/hooks/use-stock"

export default function ManagerForecastsPage() {
  const { stocks, loading } = useStock()
  
  const [salesForecast, setSalesForecast] = useState<Record<string, number>>({})
  
  const productsWithPrice = useMemo(() => {
    return stocks.filter(s => s.selling_price && Number(s.selling_price) > 0)
  }, [stocks])

  const getProductStats = (stock: StockWithProduct) => {
    const unitPrice = Number(stock.unit_price) || 0
    const sellingPrice = Number(stock.selling_price) || 0
    const quantity = Number(stock.quantity) || 0
    const forecastQty = salesForecast[stock.id] ?? quantity
    
    const marginPerUnit = sellingPrice - unitPrice
    const marginPercent = sellingPrice > 0 ? (marginPerUnit / sellingPrice) * 100 : 0
    
    const potentialCA = sellingPrice * forecastQty
    const potentialBenefice = marginPerUnit * forecastQty
    const stockValue = unitPrice * quantity
    
    return {
      unitPrice,
      sellingPrice,
      quantity,
      forecastQty,
      marginPerUnit,
      marginPercent,
      potentialCA,
      potentialBenefice,
      stockValue
    }
  }

  const totalStats = useMemo(() => {
    let totalCA = 0
    let totalBenefice = 0
    let totalStockValue = 0
    let totalProducts = 0
    
    productsWithPrice.forEach(stock => {
      const stats = getProductStats(stock)
      totalCA += stats.potentialCA
      totalBenefice += stats.potentialBenefice
      totalStockValue += stats.stockValue
      totalProducts++
    })
    
    const marginPercent = totalCA > 0 ? (totalBenefice / totalCA) * 100 : 0
    
    return {
      totalCA,
      totalBenefice,
      totalStockValue,
      totalProducts,
      marginPercent
    }
  }, [productsWithPrice, salesForecast])

  const chartData = useMemo(() => {
    return productsWithPrice.map(stock => {
      const stats = getProductStats(stock)
      return {
        name: stock.product?.name?.substring(0, 10) || 'Produit',
        ca: stats.potentialCA,
        benefice: stats.potentialBenefice,
        margin: stats.marginPercent
      }
    }).sort((a, b) => b.ca - a.ca).slice(0, 8)
  }, [productsWithPrice, salesForecast])

  const resetToStock = () => {
    setSalesForecast({})
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
          </div>
          <p className="text-slate-400 text-sm">Chargement des prévisions...</p>
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
            <TrendingUp className="h-7 w-7 text-blue-400" />
            Prévisions de Ventes
          </h1>
          <p className="text-sm text-slate-400">Simulez vos ventes et anticipez votre CA</p>
        </div>
        {Object.keys(salesForecast).length > 0 && (
          <button className="glass-btn-secondary" onClick={resetToStock}>
            Réinitialiser au stock
          </button>
        )}
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-stat-card glass-animate-fade-up glass-stagger-1" style={{ borderColor: "rgba(59, 130, 246, 0.3)" }}>
          <div className="glass-stat-icon glass-stat-icon-blue">
            <Euro className="h-6 w-6" />
          </div>
          <p className="glass-stat-label mt-2">CA Prévisionnel</p>
          <p className="glass-stat-value glass-stat-value-blue">{totalStats.totalCA.toFixed(2)}€</p>
        </div>
        
        <div className="glass-stat-card glass-animate-fade-up glass-stagger-2">
          <div className="glass-stat-icon glass-stat-icon-green">
            <TrendingUp className="h-6 w-6" />
          </div>
          <p className="glass-stat-label mt-2">Bénéfice Prévu</p>
          <p className="glass-stat-value glass-stat-value-green">{totalStats.totalBenefice.toFixed(2)}€</p>
        </div>
        
        <div className="glass-stat-card glass-animate-fade-up glass-stagger-3">
          <div className="glass-stat-icon glass-stat-icon-orange">
            <Target className="h-6 w-6" />
          </div>
          <p className="glass-stat-label mt-2">Marge Moyenne</p>
          <p className={`glass-stat-value ${totalStats.marginPercent >= 60 ? 'glass-stat-value-green' : totalStats.marginPercent >= 40 ? 'glass-stat-value-orange' : 'text-red-400'}`}>
            {totalStats.marginPercent.toFixed(1)}%
          </p>
        </div>
        
        <div className="glass-stat-card glass-animate-fade-up glass-stagger-4">
          <div className="glass-stat-icon glass-stat-icon-purple">
            <Package className="h-6 w-6" />
          </div>
          <p className="glass-stat-label mt-2">Valeur Stock</p>
          <p className="glass-stat-value glass-stat-value-purple">{totalStats.totalStockValue.toFixed(2)}€</p>
        </div>
      </div>

      {/* Graphique CA par produit */}
      {chartData.length > 0 && (
        <div className="glass-stat-card glass-animate-fade-up glass-stagger-5">
          <div className="mb-5">
            <h3 className="font-semibold text-white">CA par produit</h3>
            <p className="text-sm text-slate-400">Top 8 produits par chiffre d'affaires prévu</p>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: "11px" }} />
              <YAxis stroke="#64748b" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(20, 27, 45, 0.95)",
                  border: "1px solid rgba(100, 130, 180, 0.2)",
                  borderRadius: "12px",
                  backdropFilter: "blur(12px)",
                }}
                labelStyle={{ color: "#f1f5f9" }}
                formatter={(value: number, name: string) => [
                  `${value.toFixed(2)}€`,
                  name === 'ca' ? 'CA' : 'Bénéfice'
                ]}
              />
              <Bar dataKey="ca" name="CA" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.margin >= 60 ? '#22c55e' : entry.margin >= 40 ? '#fb923c' : '#ef4444'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Liste des produits avec simulation */}
      <div className="glass-stat-card glass-animate-fade-up glass-stagger-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold text-white flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-400" />
              Simulateur de ventes
            </h3>
            <p className="text-sm text-slate-400">Ajustez les quantités pour prévoir votre CA</p>
          </div>
        </div>

        {productsWithPrice.length > 0 ? (
          <div className="space-y-3">
            {/* En-tête */}
            <div className="grid grid-cols-7 gap-4 px-4 py-2 text-xs text-slate-500 font-medium">
              <div className="col-span-2">Produit</div>
              <div className="text-center">Prix vente</div>
              <div className="text-center">Marge</div>
              <div className="text-center">Qté à vendre</div>
              <div className="text-center">CA</div>
              <div className="text-center">Bénéfice</div>
            </div>
            
            {productsWithPrice.map((stock, index) => {
              const stats = getProductStats(stock)
              const unit = stock.product?.unit || 'unités'
              const hasCustomForecast = salesForecast[stock.id] !== undefined
              
              return (
                <div 
                  key={stock.id} 
                  className="grid grid-cols-7 gap-4 items-center p-4 rounded-xl transition-all"
                  style={{
                    background: hasCustomForecast 
                      ? "rgba(59, 130, 246, 0.08)" 
                      : "rgba(30, 41, 59, 0.4)",
                    border: hasCustomForecast 
                      ? "1px solid rgba(59, 130, 246, 0.25)" 
                      : "1px solid rgba(100, 130, 180, 0.1)",
                    animationDelay: `${0.05 * index}s`
                  }}
                >
                  {/* Produit */}
                  <div className="col-span-2 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center text-xl">
                      {stock.product?.icon || <Package className="h-5 w-5 text-blue-400" />}
                    </div>
                    <div>
                      <p className="font-medium text-white">{stock.product?.name}</p>
                      <p className="text-xs text-slate-500">
                        Stock: {stats.quantity} {unit}
                      </p>
                    </div>
                  </div>
                  
                  {/* Prix vente */}
                  <div className="text-center">
                    <p className="font-bold text-white">{stats.sellingPrice.toFixed(2)}€</p>
                    <p className="text-xs text-slate-500">/{unit}</p>
                  </div>
                  
                  {/* Marge */}
                  <div className="text-center">
                    <p className={`font-bold ${stats.marginPercent >= 60 ? 'text-green-400' : stats.marginPercent >= 40 ? 'text-orange-400' : 'text-red-400'}`}>
                      {stats.marginPercent.toFixed(0)}%
                    </p>
                    <p className="text-xs text-slate-500">{stats.marginPerUnit.toFixed(2)}€/u</p>
                  </div>
                  
                  {/* Quantité à vendre */}
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => setSalesForecast(prev => ({
                        ...prev,
                        [stock.id]: Math.max(0, (prev[stock.id] ?? stats.quantity) - 1)
                      }))}
                      className="glass-btn-icon w-8 h-8"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={stats.forecastQty}
                      onChange={(e) => setSalesForecast(prev => ({
                        ...prev,
                        [stock.id]: parseFloat(e.target.value) || 0
                      }))}
                      className="w-16 h-8 text-center text-sm font-bold rounded-lg bg-slate-800/50 border border-slate-600/30 text-white"
                    />
                    <button
                      onClick={() => setSalesForecast(prev => ({
                        ...prev,
                        [stock.id]: (prev[stock.id] ?? stats.quantity) + 1
                      }))}
                      className="glass-btn-icon w-8 h-8"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* CA */}
                  <div className="text-center">
                    <p className="font-bold text-blue-400 text-lg">{stats.potentialCA.toFixed(2)}€</p>
                  </div>
                  
                  {/* Bénéfice */}
                  <div className="text-center">
                    <p className={`font-bold text-lg ${stats.marginPercent >= 60 ? 'text-green-400' : stats.marginPercent >= 40 ? 'text-orange-400' : 'text-red-400'}`}>
                      {stats.potentialBenefice.toFixed(2)}€
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="glass-empty-state">
            <div className="glass-empty-icon">
              <Calculator className="h-10 w-10" />
            </div>
            <p className="glass-empty-title">Aucun produit avec <span className="text-blue-400">prix</span> de vente</p>
            <p className="glass-empty-desc">
              Définissez des prix de vente dans le Calculateur pour voir les prévisions
            </p>
          </div>
        )}
      </div>

      {/* Résumé en bas */}
      {productsWithPrice.length > 0 && (
        <div 
          className="p-5 rounded-xl glass-animate-fade-up"
          style={{
            background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(34, 197, 94, 0.1) 100%)",
            border: "1px solid rgba(59, 130, 246, 0.2)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 mb-1">Résumé des prévisions</p>
              <p className="text-slate-200">
                En vendant <span className="font-bold text-blue-400">{totalStats.totalProducts} produits</span>, 
                vous générez un CA de <span className="font-bold text-blue-400">{totalStats.totalCA.toFixed(2)}€</span> 
                pour un bénéfice de <span className="font-bold text-green-400">{totalStats.totalBenefice.toFixed(2)}€</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">ROI sur stock</p>
              <p className="text-2xl font-bold text-blue-400">
                {totalStats.totalStockValue > 0 
                  ? ((totalStats.totalBenefice / totalStats.totalStockValue) * 100).toFixed(0)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
