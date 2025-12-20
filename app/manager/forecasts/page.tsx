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
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function ManagerForecastsPage() {
  const { stocks, loading } = useStock()
  
  // Quantités de vente prévues par produit
  const [salesForecast, setSalesForecast] = useState<Record<string, number>>({})
  
  // Produits avec prix de vente défini
  const productsWithPrice = useMemo(() => {
    return stocks.filter(s => s.selling_price && Number(s.selling_price) > 0)
  }, [stocks])

  // Calculer les stats pour un produit
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

  // Stats totales
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

  // Données pour le graphique
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

  // Réinitialiser les prévisions aux quantités stock
  const resetToStock = () => {
    setSalesForecast({})
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
          <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-3">
            <TrendingUp className="h-7 w-7 text-primary" />
            Prévisions de Ventes
          </h1>
          <p className="text-muted-foreground">Simulez vos ventes et anticipez votre CA</p>
        </div>
        {Object.keys(salesForecast).length > 0 && (
          <Button variant="outline" onClick={resetToStock}>
            Réinitialiser au stock
          </Button>
        )}
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-4 gap-4 mb-6 animate-fade-up delay-1">
        <div className="banking-card-glow p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Euro className="h-6 w-6 text-primary" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">CA Prévisionnel</p>
          <p className="text-3xl font-bold text-primary">{totalStats.totalCA.toFixed(2)}€</p>
        </div>
        
        <div className="banking-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-accent" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Bénéfice Prévu</p>
          <p className="text-3xl font-bold text-accent">{totalStats.totalBenefice.toFixed(2)}€</p>
        </div>
        
        <div className="banking-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Target className="h-6 w-6 text-orange-500" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Marge Moyenne</p>
          <p className={`text-3xl font-bold ${totalStats.marginPercent >= 60 ? 'text-accent' : totalStats.marginPercent >= 40 ? 'text-orange-500' : 'text-destructive'}`}>
            {totalStats.marginPercent.toFixed(1)}%
          </p>
        </div>
        
        <div className="banking-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center">
              <Package className="h-6 w-6 text-foreground" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Valeur Stock</p>
          <p className="text-3xl font-bold text-foreground">{totalStats.totalStockValue.toFixed(2)}€</p>
        </div>
      </div>

      {/* Graphique CA par produit */}
      {chartData.length > 0 && (
        <div className="banking-card p-5 mb-6 animate-fade-up delay-2">
          <div className="mb-5">
            <h3 className="font-semibold text-foreground">CA par produit</h3>
            <p className="text-sm text-muted-foreground">Top 8 produits par chiffre d'affaires prévu</p>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#8A8A8A" style={{ fontSize: "11px" }} />
              <YAxis stroke="#8A8A8A" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1A1614",
                  border: "1px solid #2A2420",
                  borderRadius: "10px",
                }}
                labelStyle={{ color: "#F5F5F5" }}
                formatter={(value: number, name: string) => [
                  `${value.toFixed(2)}€`,
                  name === 'ca' ? 'CA' : 'Bénéfice'
                ]}
              />
              <Bar dataKey="ca" name="CA" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.margin >= 60 ? '#22C55E' : entry.margin >= 40 ? '#FF6B00' : '#EF4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Liste des produits avec simulation */}
      <div className="banking-card p-5 animate-fade-up delay-3">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Simulateur de ventes
            </h3>
            <p className="text-sm text-muted-foreground">Ajustez les quantités pour prévoir votre CA</p>
          </div>
        </div>

        {productsWithPrice.length > 0 ? (
          <div className="space-y-3">
            {/* En-tête */}
            <div className="grid grid-cols-7 gap-4 px-4 py-2 text-xs text-muted-foreground font-medium">
              <div className="col-span-2">Produit</div>
              <div className="text-center">Prix vente</div>
              <div className="text-center">Marge</div>
              <div className="text-center">Qté à vendre</div>
              <div className="text-center">CA</div>
              <div className="text-center">Bénéfice</div>
            </div>
            
            {productsWithPrice.map((stock) => {
              const stats = getProductStats(stock)
              const unit = stock.product?.unit || 'unités'
              const hasCustomForecast = salesForecast[stock.id] !== undefined
              
              return (
                <div 
                  key={stock.id} 
                  className={`grid grid-cols-7 gap-4 items-center p-4 rounded-xl transition-all ${
                    hasCustomForecast ? 'bg-primary/5 border border-primary/20' : 'bg-secondary/30'
                  }`}
                >
                  {/* Produit */}
                  <div className="col-span-2 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl">
                      {stock.product?.icon || <Package className="h-5 w-5 text-primary" />}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{stock.product?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Stock: {stats.quantity} {unit}
                      </p>
                    </div>
                  </div>
                  
                  {/* Prix vente */}
                  <div className="text-center">
                    <p className="font-bold text-foreground">{stats.sellingPrice.toFixed(2)}€</p>
                    <p className="text-xs text-muted-foreground">/{unit}</p>
                  </div>
                  
                  {/* Marge */}
                  <div className="text-center">
                    <p className={`font-bold ${stats.marginPercent >= 60 ? 'text-accent' : stats.marginPercent >= 40 ? 'text-orange-500' : 'text-destructive'}`}>
                      {stats.marginPercent.toFixed(0)}%
                    </p>
                    <p className="text-xs text-muted-foreground">{stats.marginPerUnit.toFixed(2)}€/u</p>
                  </div>
                  
                  {/* Quantité à vendre */}
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => setSalesForecast(prev => ({
                        ...prev,
                        [stock.id]: Math.max(0, (prev[stock.id] ?? stats.quantity) - 1)
                      }))}
                      className="h-8 w-8 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <Input
                      type="number"
                      min="0"
                      value={stats.forecastQty}
                      onChange={(e) => setSalesForecast(prev => ({
                        ...prev,
                        [stock.id]: parseFloat(e.target.value) || 0
                      }))}
                      className="w-16 h-8 text-center text-sm font-bold"
                    />
                    <button
                      onClick={() => setSalesForecast(prev => ({
                        ...prev,
                        [stock.id]: (prev[stock.id] ?? stats.quantity) + 1
                      }))}
                      className="h-8 w-8 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* CA */}
                  <div className="text-center">
                    <p className="font-bold text-primary text-lg">{stats.potentialCA.toFixed(2)}€</p>
                  </div>
                  
                  {/* Bénéfice */}
                  <div className="text-center">
                    <p className={`font-bold text-lg ${stats.marginPercent >= 60 ? 'text-accent' : stats.marginPercent >= 40 ? 'text-orange-500' : 'text-destructive'}`}>
                      {stats.potentialBenefice.toFixed(2)}€
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-2">Aucun produit avec prix de vente</p>
            <p className="text-sm text-muted-foreground">
              Définissez des prix de vente dans le Calculateur pour voir les prévisions
            </p>
          </div>
        )}
      </div>

      {/* Résumé en bas */}
      {productsWithPrice.length > 0 && (
        <div className="mt-6 p-5 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 animate-fade-up delay-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Résumé des prévisions</p>
              <p className="text-foreground">
                En vendant <span className="font-bold text-primary">{totalStats.totalProducts} produits</span>, 
                vous générez un CA de <span className="font-bold text-primary">{totalStats.totalCA.toFixed(2)}€</span> 
                pour un bénéfice de <span className="font-bold text-accent">{totalStats.totalBenefice.toFixed(2)}€</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">ROI sur stock</p>
              <p className="text-2xl font-bold text-primary">
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
