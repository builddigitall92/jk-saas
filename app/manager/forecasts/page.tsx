"use client"

import { useState, useMemo, useEffect } from "react"
import { 
  TrendingUp, 
  Package, 
  Euro, 
  Calendar,
  Loader2,
  Target,
  ShoppingCart,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Minus,
  RefreshCw
} from "lucide-react"
import { ResponsiveContainer, XAxis, YAxis, Tooltip, LineChart, Line, Legend } from "recharts"
import { useVentes } from "@/lib/hooks/use-ventes"
import { createClient } from "@/utils/supabase/client"

interface DailyStats {
  date: string
  ca: number
  nbVentes: number
  benefice: number
}

interface ProductStats {
  menuItemId: string
  name: string
  icon: string
  totalQuantity: number
  totalCA: number
  totalBenefice: number
  avgQuantityPerDay: number
  projectedMonthly: number
  projectedMonthlyCA: number
  trend: 'up' | 'down' | 'stable'
  trendPercent: number
}

export default function ManagerForecastsPage() {
  const { ventes, stats, loading, refresh, fetchHistorique } = useVentes()
  const [allVentes, setAllVentes] = useState<any[]>([])
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([])
  const [productStats, setProductStats] = useState<ProductStats[]>([])
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Récupérer l'historique des 30 derniers jours
  useEffect(() => {
    const loadHistorique = async () => {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 30)
      
      const historique = await fetchHistorique(startDate, endDate)
      console.log('📊 Historique chargé:', historique.length, 'ventes')
      setAllVentes(historique)
      setLastRefresh(new Date())
    }
    
    loadHistorique()
  }, [fetchHistorique, ventes]) // Se rafraîchit quand ventes change

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refresh()
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)
    const historique = await fetchHistorique(startDate, endDate)
    setAllVentes(historique)
    setLastRefresh(new Date())
    setIsRefreshing(false)
  }

  // Fonction pour convertir une quantité vers l'unité du stock
  const convertQuantity = (quantity: number, fromUnit: string | null, toUnit: string): number => {
    if (!fromUnit) return quantity
    
    const from = fromUnit.toLowerCase()
    const to = toUnit.toLowerCase()
    
    if (from === to) return quantity
    
    // Conversions masse
    if (from === 'g' && to === 'kg') return quantity / 1000
    if (from === 'kg' && to === 'g') return quantity * 1000
    
    // Conversions volume
    if (from === 'ml' && to === 'l') return quantity / 1000
    if (from === 'l' && to === 'ml') return quantity * 1000
    if (from === 'cl' && to === 'l') return quantity / 100
    if (from === 'l' && to === 'cl') return quantity * 100
    if (from === 'cl' && to === 'ml') return quantity * 10
    if (from === 'ml' && to === 'cl') return quantity / 10
    
    return quantity
  }

  // Fonction pour calculer le coût réel d'un menu item à partir de ses ingrédients
  const calculateMenuItemCost = async (menuItem: any): Promise<number> => {
    if (!menuItem || !menuItem.ingredients || menuItem.ingredients.length === 0) {
      console.log(`[GPAO Forecast] Pas d'ingrédients pour ${menuItem?.name}`)
      return 0
    }

    const supabase = createClient()
    let totalCost = 0

    console.log(`[GPAO Forecast] Calcul coût pour "${menuItem.name}" - ${menuItem.ingredients.length} ingrédient(s)`)

    for (const ingredient of menuItem.ingredients) {
      console.log(`[GPAO Forecast] Ingrédient:`, ingredient)
      
      if (!ingredient.product_id) {
        console.log(`[GPAO Forecast] Pas de product_id pour cet ingrédient`)
        continue
      }

      // Récupérer le prix unitaire du stock (le plus récent)
      const { data: stockData } = await supabase
        .from('stock')
        .select('unit_price, product:products(unit)')
        .eq('product_id', ingredient.product_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (!stockData) {
        console.log(`[GPAO Forecast] Pas de stock trouvé pour product_id: ${ingredient.product_id}`)
        continue
      }

      const unitPrice = Number(stockData.unit_price) || 0
      const stockUnit = (stockData.product as { unit: string } | null)?.unit || 'unités'
      const ingredientUnit = ingredient.unit || stockUnit
      const ingredientQuantity = Number(ingredient.quantity) || 0

      // Convertir la quantité vers l'unité du stock
      const convertedQuantity = convertQuantity(ingredientQuantity, ingredientUnit, stockUnit)

      // Calculer le coût de cet ingrédient
      const ingredientCost = unitPrice * convertedQuantity
      totalCost += ingredientCost

      console.log(`[GPAO Forecast] ${ingredient.product?.name || 'Produit'}: ${ingredientQuantity}${ingredientUnit} × ${unitPrice}€/${stockUnit} = ${ingredientCost.toFixed(2)}€`)
    }

    console.log(`[GPAO Forecast] Coût total: ${totalCost.toFixed(2)}€`)
    return Math.round(totalCost * 100) / 100
  }

  // Calculer les statistiques quotidiennes
  useEffect(() => {
    if (allVentes.length === 0) {
      setDailyStats([])
      setProductStats([])
      return
    }

    // Calculer les coûts réels pour toutes les ventes
    const calculateStats = async () => {
      // Grouper par jour
      const dailyMap = new Map<string, { ca: number; nbVentes: number; benefice: number }>()
      const productMap = new Map<string, {
        name: string
        icon: string
        totalQuantity: number
        totalCA: number
        totalBenefice: number
        firstWeekQty: number
        lastWeekQty: number
      }>()

      const now = new Date()
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(now.getDate() - 7)
      const fourteenDaysAgo = new Date()
      fourteenDaysAgo.setDate(now.getDate() - 14)

      // Calculer les coûts pour toutes les ventes en parallèle
      const costPromises = allVentes.map(async (vente) => {
        const costPrice = vente.menu_item 
          ? await calculateMenuItemCost(vente.menu_item)
          : 0
        return { vente, costPrice }
      })

      const ventesWithCosts = await Promise.all(costPromises)

      ventesWithCosts.forEach(({ vente, costPrice }) => {
        const date = new Date(vente.created_at).toISOString().split('T')[0]
        const venteDate = new Date(vente.created_at)
        
        // Stats quotidiennes
        const existing = dailyMap.get(date) || { ca: 0, nbVentes: 0, benefice: 0 }
        
        // Calcul du bénéfice réel : Prix de vente - Coût réel
        const sellingPrice = Number(vente.unit_price) || 0
        const beneficeParUnite = sellingPrice - costPrice
        const benefice = beneficeParUnite * vente.quantity
        
        console.log(`[BENEFICE] ${vente.menu_item?.name}: Prix=${sellingPrice}€ - Coût=${costPrice}€ = Bénéfice/unité=${beneficeParUnite.toFixed(2)}€ × ${vente.quantity} = ${benefice.toFixed(2)}€`)
        
        dailyMap.set(date, {
          ca: existing.ca + Number(vente.total_price),
          nbVentes: existing.nbVentes + 1,
          benefice: existing.benefice + benefice
        })

        // Stats produits
        if (vente.menu_item) {
          const menuItemId = vente.menu_item_id
          const existingProduct = productMap.get(menuItemId) || {
            name: vente.menu_item.name,
            icon: vente.menu_item.icon || '🍽️',
            totalQuantity: 0,
            totalCA: 0,
            totalBenefice: 0,
            firstWeekQty: 0,
            lastWeekQty: 0
          }

          existingProduct.totalQuantity += vente.quantity
          existingProduct.totalCA += Number(vente.total_price)
          existingProduct.totalBenefice += benefice

          // Calculer les tendances (semaine dernière vs semaine d'avant)
          if (venteDate >= sevenDaysAgo) {
            existingProduct.lastWeekQty += vente.quantity
          } else if (venteDate >= fourteenDaysAgo && venteDate < sevenDaysAgo) {
            existingProduct.firstWeekQty += vente.quantity
          }

          productMap.set(menuItemId, existingProduct)
        }
      })

      // Convertir en tableau pour les stats quotidiennes
      const dailyArray: DailyStats[] = Array.from(dailyMap.entries()).map(([date, stats]) => ({
        date,
        ...stats
      })).sort((a, b) => a.date.localeCompare(b.date))

      setDailyStats(dailyArray)

      // Calculer les stats produits avec projections
      const daysWithSales = dailyArray.length || 1
      const productArray: ProductStats[] = Array.from(productMap.entries()).map(([menuItemId, stats]) => {
        const avgQuantityPerDay = stats.totalQuantity / daysWithSales
        const daysInMonth = 30
        const projectedMonthly = avgQuantityPerDay * daysInMonth
        const avgPricePerUnit = stats.totalQuantity > 0 ? stats.totalCA / stats.totalQuantity : 0
        const projectedMonthlyCA = projectedMonthly * avgPricePerUnit

        // Calculer la tendance
      let trend: 'up' | 'down' | 'stable' = 'stable'
      let trendPercent = 0
      if (stats.firstWeekQty > 0) {
        trendPercent = ((stats.lastWeekQty - stats.firstWeekQty) / stats.firstWeekQty) * 100
        if (trendPercent > 5) trend = 'up'
        else if (trendPercent < -5) trend = 'down'
      } else if (stats.lastWeekQty > 0) {
        trend = 'up'
        trendPercent = 100
      }

        return {
          menuItemId,
          name: stats.name,
          icon: stats.icon,
          totalQuantity: stats.totalQuantity,
          totalCA: stats.totalCA,
          totalBenefice: stats.totalBenefice,
          avgQuantityPerDay,
          projectedMonthly,
          projectedMonthlyCA,
          trend,
          trendPercent
        }
      }).sort((a, b) => b.totalCA - a.totalCA)

      setProductStats(productArray)
    }

    calculateStats()
  }, [allVentes])

  // Statistiques globales
  const globalStats = useMemo(() => {
    const totalCA = dailyStats.reduce((sum, d) => sum + d.ca, 0)
    const totalBenefice = dailyStats.reduce((sum, d) => sum + d.benefice, 0)
    const totalVentes = dailyStats.reduce((sum, d) => sum + d.nbVentes, 0)
    const avgCAPerDay = dailyStats.length > 0 ? totalCA / dailyStats.length : 0
    const avgBeneficePerDay = dailyStats.length > 0 ? totalBenefice / dailyStats.length : 0
    const avgVentesPerDay = dailyStats.length > 0 ? totalVentes / dailyStats.length : 0
    const marginPercent = totalCA > 0 ? (totalBenefice / totalCA) * 100 : 0

    // Projections mensuelles basées sur la moyenne
    // Utiliser le bénéfice réel moyen par jour au lieu d'une marge en pourcentage
    const projectedMonthlyCA = avgCAPerDay * 30
    const projectedMonthlyBenefice = avgBeneficePerDay * 30

    // Jour actuel du mois
    const today = new Date()
    const dayOfMonth = today.getDate()
    const daysInCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
    const daysRemaining = daysInCurrentMonth - dayOfMonth

    // CA du mois en cours (depuis le 1er)
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const currentMonthCA = dailyStats
      .filter(d => new Date(d.date) >= startOfMonth)
      .reduce((sum, d) => sum + d.ca, 0)

    // Projection fin de mois
    const projectedEndOfMonthCA = currentMonthCA + (avgCAPerDay * daysRemaining)

    return {
      totalCA,
      totalBenefice,
      totalVentes,
      avgCAPerDay,
      avgVentesPerDay,
      marginPercent,
      projectedMonthlyCA,
      projectedMonthlyBenefice,
      currentMonthCA,
      projectedEndOfMonthCA,
      daysRemaining
    }
  }, [dailyStats])

  // Données pour le graphique d'évolution
  const chartData = useMemo(() => {
    // Prendre les 14 derniers jours
    return dailyStats.slice(-14).map(d => ({
      date: new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      ca: d.ca,
      ventes: d.nbVentes
    }))
  }, [dailyStats])

  // Données pour le graphique des produits
  const productChartData = useMemo(() => {
    return productStats.slice(0, 8).map(p => ({
      name: p.name.length > 12 ? p.name.substring(0, 12) + '...' : p.name,
      ca: p.totalCA,
      projection: p.projectedMonthlyCA
    }))
  }, [productStats])

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
          <p className="text-sm text-slate-400">Basées sur vos ventes des 30 derniers jours</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading || isRefreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 transition-colors disabled:opacity-50"
            title="Rafraîchir les données"
          >
            <RefreshCw className={`h-4 w-4 text-blue-400 ${(loading || isRefreshing) ? 'animate-spin' : ''}`} />
            <span className="text-sm text-blue-300 font-medium">Actualiser</span>
          </button>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-300">
              {allVentes.length} ventes • Màj: {lastRefresh.toLocaleTimeString('fr-FR')}
            </span>
          </div>
        </div>
      </div>

      {/* Debug info */}
      <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 glass-animate-fade-up">
        <p className="text-sm text-slate-300">
          <strong className="text-blue-400">Debug:</strong> {allVentes.length} vente(s) sur 30 jours | {ventes.length} vente(s) aujourd'hui
          {allVentes.length > 0 && (
            <span className="ml-4 text-slate-400">
              Dernière: {new Date(allVentes[0]?.created_at).toLocaleString('fr-FR')}
            </span>
          )}
        </p>
      </div>

      {allVentes.length === 0 ? (
        <div className="glass-stat-card glass-animate-fade-up">
          <div className="glass-empty-state">
            <div className="glass-empty-icon">
              <ShoppingCart className="h-10 w-10" />
            </div>
            <p className="glass-empty-title">Aucune vente enregistrée</p>
            <p className="glass-empty-desc">
              Enregistrez vos ventes pour voir les prévisions basées sur vos données réelles
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats principales */}
          <div className="grid grid-cols-4 gap-4">
            <div className="glass-stat-card glass-animate-fade-up glass-stagger-1" style={{ borderColor: "rgba(59, 130, 246, 0.3)" }}>
              <div className="glass-stat-icon glass-stat-icon-blue">
                <Euro className="h-6 w-6" />
              </div>
              <p className="glass-stat-label mt-2">CA (30j)</p>
              <p className="glass-stat-value glass-stat-value-blue">{globalStats.totalCA.toFixed(2)}€</p>
              <p className="text-xs text-slate-500 mt-1">
                Moy: {globalStats.avgCAPerDay.toFixed(2)}€/jour
              </p>
            </div>
            
            <div className="glass-stat-card glass-animate-fade-up glass-stagger-2">
              <div className="glass-stat-icon glass-stat-icon-green">
                <TrendingUp className="h-6 w-6" />
              </div>
              <p className="glass-stat-label mt-2">Bénéfice (30j)</p>
              <p className="glass-stat-value glass-stat-value-green">{globalStats.totalBenefice.toFixed(2)}€</p>
              <p className="text-xs text-slate-500 mt-1">
                Marge: {globalStats.marginPercent.toFixed(1)}%
              </p>
            </div>
            
            <div className="glass-stat-card glass-animate-fade-up glass-stagger-3">
              <div className="glass-stat-icon glass-stat-icon-purple">
                <Target className="h-6 w-6" />
              </div>
              <p className="glass-stat-label mt-2">Projection Mois</p>
              <p className="glass-stat-value glass-stat-value-purple">{globalStats.projectedEndOfMonthCA.toFixed(2)}€</p>
              <p className="text-xs text-slate-500 mt-1">
                {globalStats.daysRemaining} jours restants
              </p>
            </div>
            
            <div className="glass-stat-card glass-animate-fade-up glass-stagger-4">
              <div className="glass-stat-icon glass-stat-icon-orange">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <p className="glass-stat-label mt-2">Ventes/jour</p>
              <p className="glass-stat-value glass-stat-value-orange">{globalStats.avgVentesPerDay.toFixed(1)}</p>
              <p className="text-xs text-slate-500 mt-1">
                Total: {globalStats.totalVentes} ventes
              </p>
            </div>
          </div>

          {/* Graphique d'évolution du CA */}
          {chartData.length > 0 && (
            <div className="glass-stat-card glass-animate-fade-up glass-stagger-5">
              <div className="mb-5">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-400" />
                  Évolution du CA (14 derniers jours)
                </h3>
                <p className="text-sm text-slate-400">Chiffre d'affaires quotidien</p>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: "11px" }} />
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
                      name === 'ca' ? `${value.toFixed(2)}€` : value,
                      name === 'ca' ? 'CA' : 'Ventes'
                    ]}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="ca" 
                    name="CA" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ventes" 
                    name="Nb Ventes" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    dot={{ fill: '#22c55e', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top produits avec projections */}
          <div className="glass-stat-card glass-animate-fade-up glass-stagger-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-400" />
                  Prévisions par Produit
                </h3>
                <p className="text-sm text-slate-400">Basées sur les ventes réelles</p>
              </div>
            </div>

            {productStats.length > 0 ? (
              <div className="space-y-3">
                {/* En-tête */}
                <div className="grid grid-cols-7 gap-4 px-4 py-2 text-xs text-slate-500 font-medium">
                  <div className="col-span-2">Produit</div>
                  <div className="text-center">Vendus (30j)</div>
                  <div className="text-center">CA Réel</div>
                  <div className="text-center">Tendance</div>
                  <div className="text-center">Moy/jour</div>
                  <div className="text-center">Projection Mois</div>
                </div>
                
                {productStats.map((product, index) => (
                  <div 
                    key={product.menuItemId} 
                    className="grid grid-cols-7 gap-4 items-center p-4 rounded-xl transition-all"
                    style={{
                      background: "rgba(30, 41, 59, 0.4)",
                      border: "1px solid rgba(100, 130, 180, 0.1)",
                      animationDelay: `${0.05 * index}s`
                    }}
                  >
                    {/* Produit */}
                    <div className="col-span-2 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center text-xl">
                        {product.icon}
                      </div>
                      <div>
                        <p className="font-medium text-white">{product.name}</p>
                        <p className="text-xs text-slate-500">
                          Bénéfice: {product.totalBenefice.toFixed(2)}€
                        </p>
                      </div>
                    </div>
                    
                    {/* Quantité vendue */}
                    <div className="text-center">
                      <p className="font-bold text-white">{product.totalQuantity}</p>
                      <p className="text-xs text-slate-500">unités</p>
                    </div>
                    
                    {/* CA Réel */}
                    <div className="text-center">
                      <p className="font-bold text-blue-400">{product.totalCA.toFixed(2)}€</p>
                    </div>
                    
                    {/* Tendance */}
                    <div className="text-center">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        product.trend === 'up' 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : product.trend === 'down'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                      }`}>
                        {product.trend === 'up' && <ArrowUp className="h-3 w-3" />}
                        {product.trend === 'down' && <ArrowDown className="h-3 w-3" />}
                        {product.trend === 'stable' && <Minus className="h-3 w-3" />}
                        {Math.abs(product.trendPercent).toFixed(0)}%
                      </div>
                    </div>
                    
                    {/* Moyenne par jour */}
                    <div className="text-center">
                      <p className="font-bold text-white">{product.avgQuantityPerDay.toFixed(1)}</p>
                      <p className="text-xs text-slate-500">/jour</p>
                    </div>
                    
                    {/* Projection mensuelle */}
                    <div className="text-center">
                      <p className="font-bold text-purple-400">{product.projectedMonthlyCA.toFixed(2)}€</p>
                      <p className="text-xs text-slate-500">{product.projectedMonthly.toFixed(0)} unités</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-empty-state">
                <div className="glass-empty-icon">
                  <Package className="h-10 w-10" />
                </div>
                <p className="glass-empty-title">Aucun produit vendu</p>
                <p className="glass-empty-desc">
                  Les statistiques apparaîtront une fois que vous aurez enregistré des ventes
                </p>
              </div>
            )}
          </div>

          {/* Résumé prévisionnel */}
          <div 
            className="p-5 rounded-xl glass-animate-fade-up"
            style={{
              background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(34, 197, 94, 0.1) 100%)",
              border: "1px solid rgba(59, 130, 246, 0.2)",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">📊 Prévisions basées sur vos données réelles</p>
                <p className="text-slate-200">
                  Avec une moyenne de <span className="font-bold text-blue-400">{globalStats.avgVentesPerDay.toFixed(1)} ventes/jour</span> et 
                  un CA moyen de <span className="font-bold text-blue-400">{globalStats.avgCAPerDay.toFixed(2)}€/jour</span>,
                  vous devriez atteindre <span className="font-bold text-purple-400">{globalStats.projectedEndOfMonthCA.toFixed(2)}€</span> d'ici la fin du mois.
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Bénéfice projeté</p>
                <p className="text-2xl font-bold text-green-400">
                  {globalStats.projectedMonthlyBenefice.toFixed(2)}€
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
