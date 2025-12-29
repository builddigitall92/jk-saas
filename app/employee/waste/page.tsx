"use client"

import { useState, useEffect, useCallback } from "react"
import { Check, ChevronLeft, Loader2, Package, Trash2, AlertCircle, X, History, Plus, Minus, TrendingDown, Euro, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useStock, type StockWithProduct } from "@/lib/hooks/use-stock"
import { createClient } from "@/utils/supabase/client"

interface WasteLog {
  id: string
  product_id: string
  quantity: number
  unit: string
  estimated_cost: number
  reason: string | null
  created_at: string
  product: {
    name: string
    icon: string | null
  } | null
}

// Composant GlassTile
function GlassTile({ 
  children, 
  className = "", 
  onClick,
  active = false,
}: { 
  children: React.ReactNode
  className?: string
  onClick?: () => void
  active?: boolean
}) {
  const baseClass = `
    relative rounded-2xl p-4 transition-all duration-300
    ${active 
      ? 'bg-gradient-to-br from-red-500/20 to-orange-500/10 border-red-500/40 shadow-lg shadow-red-500/10' 
      : 'bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/30 hover:border-slate-600/50'
    }
    border backdrop-blur-sm
  `

  if (onClick) {
    return (
      <button onClick={onClick} className={`${baseClass} w-full text-left ${className}`}>
        {children}
      </button>
    )
  }

  return (
    <div className={`${baseClass} ${className}`}>
      {children}
    </div>
  )
}

export default function WastePage() {
  const { stocks, loading, updateQuantity, fetchStocks } = useStock()
  
  const [selectedStock, setSelectedStock] = useState<StockWithProduct | null>(null)
  const [wasteQuantity, setWasteQuantity] = useState("")
  const [wasteReason, setWasteReason] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [wasteLogs, setWasteLogs] = useState<WasteLog[]>([])
  const [loadingWasteLogs, setLoadingWasteLogs] = useState(true)
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new')

  // Fonction pour charger l'historique des gaspillages
  const fetchWasteLogs = useCallback(async () => {
    try {
      setLoadingWasteLogs(true)
      const supabase = createClient()
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        setLoadingWasteLogs(false)
        return
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('establishment_id')
        .eq('id', userData.user.id)
        .single()

      if (!profile?.establishment_id) {
        setLoadingWasteLogs(false)
        return
      }

      // Récupérer les gaspillages des 30 derniers jours
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: logs, error } = await (supabase as any)
        .from('waste_logs')
        .select(`
          *,
          product:products(name, icon)
        `)
        .eq('establishment_id', profile.establishment_id)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Erreur lors du chargement des gaspillages:', error)
        setWasteLogs([])
        setLoadingWasteLogs(false)
        return
      }

      if (logs && logs.length > 0) {
        setWasteLogs(logs.map((log: any) => ({
          id: log.id,
          product_id: log.product_id,
          quantity: Number(log.quantity),
          unit: log.unit,
          estimated_cost: Number(log.estimated_cost) || 0,
          reason: log.reason,
          created_at: log.created_at,
          product: log.product
        })))
      } else {
        setWasteLogs([])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des gaspillages:', error)
      setWasteLogs([])
    } finally {
      setLoadingWasteLogs(false)
    }
  }, [])

  // Charger l'historique des gaspillages au montage
  useEffect(() => {
    fetchWasteLogs()

    // Mise à jour en temps réel
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const channel = (supabase as any)
      .channel('waste-logs-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'waste_logs' },
        () => { 
          fetchWasteLogs() 
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [fetchWasteLogs])

  // Supprimer un gaspillage et restaurer le stock
  const handleDeleteWaste = async (wasteLog: WasteLog) => {
    if (!confirm(`Supprimer ce gaspillage ? Le stock sera restauré.`)) {
      return
    }

    setWasteLogs(prev => prev.filter(w => w.id !== wasteLog.id))

    try {
      const supabase = createClient()
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Non authentifié')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('establishment_id')
        .eq('id', userData.user.id)
        .single()

      if (!profile?.establishment_id) throw new Error('Pas d\'établissement associé')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: stockData } = await (supabase as any)
        .from('stock')
        .select('*, product:products(*)')
        .eq('product_id', wasteLog.product_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stock = stockData as StockWithProduct | null

      if (!stock) {
        if (profile?.establishment_id) {
          const unitPrice = wasteLog.estimated_cost > 0 && wasteLog.quantity > 0
            ? wasteLog.estimated_cost / wasteLog.quantity
            : 0

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any)
            .from('stock')
            .insert({
              establishment_id: profile.establishment_id,
              product_id: wasteLog.product_id,
              quantity: wasteLog.quantity,
              unit_price: unitPrice,
              added_by: userData.user.id
            })
        }
      } else {
        const newQuantity = Number(stock.quantity) + wasteLog.quantity
        await updateQuantity(stock.id, newQuantity)
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: deleteError } = await (supabase as any)
        .from('waste_logs')
        .delete()
        .eq('id', wasteLog.id)
        .eq('establishment_id', profile.establishment_id)

      if (deleteError) {
        await fetchWasteLogs()
        throw deleteError
      }

      await fetchStocks()
      await fetchWasteLogs()

    } catch (error) {
      console.error('Erreur lors de la suppression du gaspillage:', error)
      await fetchWasteLogs()
    }
  }

  // Quantités prédéfinies basées sur l'unité du produit
  const getQuantityOptions = (stock: StockWithProduct) => {
    const unit = stock.product?.unit || 'unités'
    const currentQty = Number(stock.quantity)
    
    if (unit === 'kg') {
      return ['0.1', '0.25', '0.5', '1', '2'].filter(q => parseFloat(q) <= currentQty)
    } else if (unit === 'g') {
      return ['50', '100', '200', '500'].filter(q => parseFloat(q) <= currentQty)
    } else if (unit === 'L') {
      return ['0.25', '0.5', '1', '2'].filter(q => parseFloat(q) <= currentQty)
    } else {
      return ['1', '2', '3', '5', '10'].filter(q => parseFloat(q) <= currentQty)
    }
  }

  const handleSave = async () => {
    if (!selectedStock || !wasteQuantity) return
    
    const qty = parseFloat(wasteQuantity)
    if (qty <= 0 || qty > Number(selectedStock.quantity)) return
    
    setIsSubmitting(true)
    
    try {
      const supabase = createClient()
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Non authentifié')
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('establishment_id')
        .eq('id', userData.user.id)
        .single()
      
      if (!profile?.establishment_id) throw new Error('Pas d\'établissement')
      
      const estimatedCost = qty * Number(selectedStock.unit_price || 0)
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('waste_logs')
        .insert({
          establishment_id: profile.establishment_id,
          product_id: selectedStock.product_id,
          quantity: qty,
          unit: selectedStock.product?.unit || 'unités',
          estimated_cost: estimatedCost,
          reason: wasteReason || null,
          logged_by: userData.user.id
        })
      
      const newQuantity = Number(selectedStock.quantity) - qty
      await updateQuantity(selectedStock.id, Math.max(0, newQuantity))
      
      await fetchStocks()
      
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        setSelectedStock(null)
        setWasteQuantity("")
        setWasteReason("")
      }, 2000)
      
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du gaspillage:', error)
    }
    
    setIsSubmitting(false)
  }

  // Calculs pour les stats
  const totalWasteCost = wasteLogs.reduce((sum, w) => sum + w.estimated_cost, 0)
  const todayWaste = wasteLogs.filter(w => {
    const today = new Date().toDateString()
    return new Date(w.created_at).toDateString() === today
  })
  const todayWasteCost = todayWaste.reduce((sum, w) => sum + w.estimated_cost, 0)

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-red-400" />
          </div>
          <p className="text-slate-400 text-sm">Chargement...</p>
        </div>
      </div>
    )
  }

  if (showSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="h-20 w-20 rounded-2xl bg-red-500/20 border border-red-500/30 mx-auto mb-6 flex items-center justify-center animate-pulse">
            <Check className="h-10 w-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Enregistré !</h2>
          <p className="text-slate-400">Le gaspillage a été enregistré et le stock mis à jour</p>
        </div>
      </div>
    )
  }

  // Filtrer les stocks qui ont une quantité > 0
  const availableStocks = stocks.filter(s => Number(s.quantity) > 0)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <Link href="/employee" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors">
          <ChevronLeft className="h-5 w-5" />
          <span>Retour</span>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-400" />
              </div>
              Gaspillage
            </h1>
            <p className="text-slate-400 mt-1">Déclarer les pertes et suivre le gâchis</p>
          </div>
          <button
            onClick={() => { fetchWasteLogs(); fetchStocks(); }}
            className="p-2.5 rounded-xl bg-slate-800/50 border border-white/10 text-slate-400 hover:text-orange-400 hover:border-orange-500/30 hover:bg-orange-500/10 transition-all"
            title="Actualiser"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassTile>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Aujourd'hui</p>
              <p className="text-xl font-bold text-red-400">{todayWaste.length}</p>
            </div>
          </div>
        </GlassTile>
        <GlassTile>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
              <Euro className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Perte du jour</p>
              <p className="text-xl font-bold text-orange-400">{todayWasteCost.toFixed(2)}€</p>
            </div>
          </div>
        </GlassTile>
        <GlassTile>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <History className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Ce mois</p>
              <p className="text-xl font-bold text-amber-400">{wasteLogs.length}</p>
            </div>
          </div>
        </GlassTile>
        <GlassTile>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-500/20 border border-slate-500/30 flex items-center justify-center">
              <Euro className="h-5 w-5 text-slate-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Perte totale</p>
              <p className="text-xl font-bold text-white">{totalWasteCost.toFixed(2)}€</p>
            </div>
          </div>
        </GlassTile>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('new')}
          className={`flex-1 p-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'new'
              ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/30'
              : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:border-slate-600/50'
          }`}
        >
          <Plus className="h-5 w-5" />
          Nouveau gaspillage
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 p-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'history'
              ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/30'
              : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:border-slate-600/50'
          }`}
        >
          <History className="h-5 w-5" />
          Historique ({wasteLogs.length})
        </button>
      </div>

      {/* Tab: Historique */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {loadingWasteLogs ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-red-400" />
            </div>
          ) : wasteLogs.length === 0 ? (
            <GlassTile className="text-center py-12">
              <Trash2 className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-2 font-medium">Aucun gaspillage enregistré</p>
              <p className="text-sm text-slate-500">Les gaspillages des 30 derniers jours apparaîtront ici</p>
            </GlassTile>
          ) : (
            wasteLogs.map((waste, index) => (
              <GlassTile key={waste.id} className="hover:scale-[1.01]" style={{ animationDelay: `${index * 0.05}s` }}>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-2xl">
                    {waste.product?.icon || <Package className="h-6 w-6 text-red-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{waste.product?.name || 'Produit inconnu'}</p>
                    <p className="text-sm text-slate-400">
                      -{waste.quantity} {waste.unit}
                      {waste.reason && <span className="text-slate-500"> • {waste.reason}</span>}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(waste.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Perte</p>
                    <p className="font-bold text-red-400">{waste.estimated_cost.toFixed(2)}€</p>
                  </div>
                  <button
                    onClick={() => handleDeleteWaste(waste)}
                    className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40 transition-all"
                    title="Supprimer et restaurer le stock"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </GlassTile>
            ))
          )}
        </div>
      )}

      {/* Tab: Nouveau gaspillage */}
      {activeTab === 'new' && (
        <>
          {!selectedStock ? (
            <>
              {availableStocks.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-slate-400 mb-2">Sélectionnez le produit gaspillé :</p>
                  {availableStocks.map((stock, index) => (
                    <GlassTile
                      key={stock.id}
                      onClick={() => setSelectedStock(stock)}
                      className="hover:border-red-500/40 hover:scale-[1.01]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-slate-700/50 border border-slate-600/50 flex items-center justify-center text-2xl">
                          {stock.product?.icon || <Package className="h-6 w-6 text-slate-400" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-white">{stock.product?.name}</p>
                          <p className="text-sm text-slate-400">
                            En stock: <span className="text-orange-400 font-medium">{Number(stock.quantity)} {stock.product?.unit}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500">Valeur</p>
                          <p className="font-semibold text-white">{Number(stock.total_value || 0).toFixed(2)}€</p>
                        </div>
                      </div>
                    </GlassTile>
                  ))}
                </div>
              ) : (
                <GlassTile className="text-center py-12">
                  <Package className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 mb-2 font-medium">Aucun produit en stock</p>
                  <p className="text-sm text-slate-500 mb-4">Ajoutez d'abord du stock pour pouvoir enregistrer du gaspillage</p>
                  <Link 
                    href="/employee/stock"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/20 text-orange-400 font-medium hover:bg-orange-500/30 transition-all"
                  >
                    Aller aux stocks
                  </Link>
                </GlassTile>
              )}
            </>
          ) : (
            <div className="space-y-5">
              {/* Selected Product */}
              <GlassTile active>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-3xl">
                    {selectedStock.product?.icon || <Package className="h-7 w-7 text-red-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-white">{selectedStock.product?.name}</p>
                    <p className="text-sm text-slate-400">
                      En stock: <span className="text-orange-400 font-medium">{Number(selectedStock.quantity)} {selectedStock.product?.unit}</span>
                    </p>
                  </div>
                  <button 
                    onClick={() => { setSelectedStock(null); setWasteQuantity(""); setWasteReason(""); }}
                    className="px-4 py-2 rounded-xl bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 transition-all text-sm font-medium"
                  >
                    Changer
                  </button>
                </div>
              </GlassTile>

              {/* Quantity Options */}
              <div>
                <p className="text-sm text-slate-400 mb-3 font-medium">Quantité gaspillée</p>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {getQuantityOptions(selectedStock).map((qty) => (
                    <button
                      key={qty}
                      onClick={() => setWasteQuantity(qty)}
                      className={`p-4 rounded-xl font-semibold transition-all ${
                        wasteQuantity === qty
                          ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/30"
                          : "bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:border-red-500/40"
                      }`}
                    >
                      {qty} {selectedStock.product?.unit}
                    </button>
                  ))}
                </div>
                
                {/* Custom quantity input */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={Number(selectedStock.quantity)}
                      placeholder="Autre quantité..."
                      value={wasteQuantity}
                      onChange={(e) => setWasteQuantity(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all"
                    />
                  </div>
                  <span className="text-slate-400 font-medium">{selectedStock.product?.unit}</span>
                </div>
                
                {/* Warning if quantity too high */}
                {parseFloat(wasteQuantity) > Number(selectedStock.quantity) && (
                  <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Quantité supérieure au stock disponible
                  </p>
                )}
              </div>

              {/* Reason */}
              <div>
                <p className="text-sm text-slate-400 mb-3 font-medium">Raison (optionnel)</p>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {['Périmé', 'Tombé', 'Mauvaise qualité', 'Erreur préparation'].map((reason) => (
                    <button
                      key={reason}
                      onClick={() => setWasteReason(reason)}
                      className={`p-3 rounded-xl text-sm font-medium transition-all ${
                        wasteReason === reason
                          ? "bg-orange-500/20 text-orange-400 border-2 border-orange-500/50"
                          : "bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:border-orange-500/30"
                      }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Autre raison..."
                  value={wasteReason}
                  onChange={(e) => setWasteReason(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-all"
                />
              </div>

              {/* Summary & Save Button */}
              {wasteQuantity && parseFloat(wasteQuantity) > 0 && parseFloat(wasteQuantity) <= Number(selectedStock.quantity) && (
                <div className="pt-4">
                  <GlassTile className="border-red-500/30 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-2xl">
                        {selectedStock.product?.icon || <Trash2 className="h-6 w-6 text-red-400" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white">{selectedStock.product?.name}</p>
                        <p className="text-red-400 font-medium">
                          -{wasteQuantity} {selectedStock.product?.unit}
                        </p>
                        {wasteReason && (
                          <p className="text-xs text-slate-500">Raison: {wasteReason}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Perte estimée</p>
                        <p className="font-bold text-red-400 text-lg">
                          {(parseFloat(wasteQuantity) * Number(selectedStock.unit_price || 0)).toFixed(2)}€
                        </p>
                      </div>
                    </div>
                  </GlassTile>
                  <button 
                    onClick={handleSave} 
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-xl text-white font-bold bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 transition-all shadow-lg shadow-red-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Check className="h-5 w-5" />
                        Enregistrer le gaspillage
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
