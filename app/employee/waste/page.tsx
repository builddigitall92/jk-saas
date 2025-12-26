"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, ChevronLeft, Loader2, Package, Trash2, AlertCircle, X, History } from "lucide-react"
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
          console.log('Changement détecté dans waste_logs, rechargement...')
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
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ce gaspillage ? Le stock sera restauré.`)) {
      return
    }

    // Mettre à jour le state local immédiatement pour un feedback visuel
    setWasteLogs(prev => prev.filter(w => w.id !== wasteLog.id))

    try {
      const supabase = createClient()
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Non authentifié')

      // Récupérer le profil pour avoir l'establishment_id
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('establishment_id')
        .eq('id', userData.user.id)
        .single()

      if (!profile?.establishment_id) throw new Error('Pas d\'établissement associé')

      // 1. Trouver le stock correspondant au produit (requête directe pour avoir les données à jour)
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
        // Si le stock n'existe plus, on crée une nouvelle entrée de stock
        if (profile?.establishment_id) {
          // Récupérer le prix unitaire depuis le gaspillage (estimated_cost / quantity)
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
        // 2. Restaurer le stock (ajouter la quantité gaspillée)
        const newQuantity = Number(stock.quantity) + wasteLog.quantity
        await updateQuantity(stock.id, newQuantity)
      }

      // 3. Supprimer l'entrée de gaspillage
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: deleteError, data: deleteData } = await (supabase as any)
        .from('waste_logs')
        .delete()
        .eq('id', wasteLog.id)
        .eq('establishment_id', profile.establishment_id)
        .select()

      if (deleteError) {
        console.error('Erreur lors de la suppression:', deleteError)
        alert(`Erreur lors de la suppression: ${deleteError.message}`)
        // Recharger les données en cas d'erreur
        await fetchWasteLogs()
        throw deleteError
      }

      if (!deleteData || deleteData.length === 0) {
        console.error('Aucune ligne supprimée - vérifier les permissions RLS')
        alert('La suppression a échoué. Vérifiez que vous avez les permissions nécessaires.')
        // Recharger pour restaurer l'état
        await fetchWasteLogs()
        return
      }

      console.log('Gaspillage supprimé avec succès:', deleteData)

      // 4. Recharger les données de stock
      await fetchStocks()
      
      // 5. Recharger immédiatement l'historique des gaspillages
      // La suppression est confirmée par deleteData, donc on peut recharger directement
      await fetchWasteLogs()

    } catch (error) {
      console.error('Erreur lors de la suppression du gaspillage:', error)
      // Recharger les données en cas d'erreur pour restaurer l'état
      await fetchWasteLogs()
      alert('Erreur lors de la suppression. Veuillez réessayer.')
    }
  }

  // Quantités prédéfinies basées sur l'unité du produit
  const getQuantityOptions = (stock: StockWithProduct) => {
    const unit = stock.product?.unit || 'unités'
    const currentQty = Number(stock.quantity)
    
    if (unit === 'kg') {
      return ['0.1', '0.2', '0.5', '1', '2'].filter(q => parseFloat(q) <= currentQty)
    } else if (unit === 'g') {
      return ['50', '100', '200', '500'].filter(q => parseFloat(q) <= currentQty)
    } else if (unit === 'L') {
      return ['0.25', '0.5', '1', '2'].filter(q => parseFloat(q) <= currentQty)
    } else {
      // unités, pièces
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
      
      // Récupérer l'utilisateur et son établissement
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Non authentifié')
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('establishment_id')
        .eq('id', userData.user.id)
        .single()
      
      if (!profile?.establishment_id) throw new Error('Pas d\'établissement')
      
      // 1. Enregistrer le gaspillage dans la table waste_logs
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
      
      // 2. Mettre à jour le stock (soustraire la quantité gaspillée)
      const newQuantity = Number(selectedStock.quantity) - qty
      await updateQuantity(selectedStock.id, Math.max(0, newQuantity))
      
      // Recharger les données
      await fetchStocks()
      
      // Afficher le succès
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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (showSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center animate-success-pop">
          <div className="h-24 w-24 rounded-full bg-accent/20 mx-auto mb-6 flex items-center justify-center">
            <Check className="h-12 w-12 text-accent" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Enregistré !</h2>
          <p className="text-muted-foreground">Le stock a été mis à jour</p>
        </div>
      </div>
    )
  }

  // Filtrer les stocks qui ont une quantité > 0
  const availableStocks = stocks.filter(s => Number(s.quantity) > 0)

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="mb-6 animate-fade-up">
        <Link href="/employee" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft className="h-5 w-5" />
          <span>Retour</span>
        </Link>
        <h1 className="text-xl font-bold text-foreground mb-1 flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-destructive" />
          Gaspillage
        </h1>
        <p className="text-sm text-muted-foreground">
          Enregistrez un gaspillage ou consultez l'historique
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 animate-fade-up delay-1">
        <button
          onClick={() => setActiveTab('new')}
          className={`flex-1 p-3 rounded-xl font-medium transition-all ${
            activeTab === 'new'
              ? 'bg-primary text-primary-foreground'
              : 'banking-card hover:border-primary/50'
          }`}
        >
          <Trash2 className="h-4 w-4 inline mr-2" />
          Nouveau gaspillage
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 p-3 rounded-xl font-medium transition-all ${
            activeTab === 'history'
              ? 'bg-primary text-primary-foreground'
              : 'banking-card hover:border-primary/50'
          }`}
        >
          <History className="h-4 w-4 inline mr-2" />
          Historique ({wasteLogs.length})
        </button>
      </div>

      {/* Tab: Historique */}
      {activeTab === 'history' && (
        <div className="space-y-3 animate-fade-up delay-2">
          {loadingWasteLogs ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : wasteLogs.length === 0 ? (
            <div className="banking-card p-12 text-center">
              <Trash2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-2">Aucun gaspillage enregistré</p>
              <p className="text-sm text-muted-foreground">Les gaspillages des 30 derniers jours apparaîtront ici</p>
            </div>
          ) : (
            wasteLogs.map((waste) => (
              <div
                key={waste.id}
                className="banking-card p-4 animate-fade-up"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center text-2xl">
                    {waste.product?.icon || <Package className="h-6 w-6 text-destructive" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{waste.product?.name || 'Produit inconnu'}</p>
                    <p className="text-sm text-muted-foreground">
                      {waste.quantity} {waste.unit}
                      {waste.reason && ` • ${waste.reason}`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(waste.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Perte</p>
                    <p className="font-bold text-destructive">{waste.estimated_cost.toFixed(2)}€</p>
                  </div>
                  <button
                    onClick={() => handleDeleteWaste(waste)}
                    className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                    title="Supprimer et restaurer le stock"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
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
            <div className="space-y-3 animate-fade-up delay-1">
              {availableStocks.map((stock) => (
                <button
                  key={stock.id}
                  onClick={() => setSelectedStock(stock)}
                  className="w-full banking-card p-4 text-left transition-all hover:border-destructive/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                      {stock.product?.icon || <Package className="h-6 w-6 text-primary" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{stock.product?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        En stock: <span className="text-primary font-medium">{Number(stock.quantity)} {stock.product?.unit}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Valeur</p>
                      <p className="font-semibold text-foreground">{Number(stock.total_value || 0).toFixed(2)}€</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="banking-card p-12 text-center animate-fade-up delay-1">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-2">Aucun produit en stock</p>
              <p className="text-sm text-muted-foreground">Ajoutez d'abord du stock pour pouvoir enregistrer du gaspillage</p>
              <Link href="/employee/stock-update">
                <Button className="mt-4" variant="outline">
                  Aller aux stocks
                </Button>
              </Link>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-5 animate-slide-right">
          {/* Selected Product */}
          <div className="banking-card-glow p-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center text-3xl">
                {selectedStock.product?.icon || <Package className="h-7 w-7 text-primary" />}
              </div>
              <div className="flex-1">
                <p className="font-bold text-foreground">{selectedStock.product?.name}</p>
                <p className="text-sm text-muted-foreground">
                  En stock: <span className="text-primary font-medium">{Number(selectedStock.quantity)} {selectedStock.product?.unit}</span>
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedStock(null)} className="text-muted-foreground">
                Changer
              </Button>
            </div>
          </div>

          {/* Quantity Options */}
          <div>
            <p className="text-sm text-muted-foreground mb-3">Quantité gaspillée</p>
            <div className="grid grid-cols-3 gap-3 mb-3">
              {getQuantityOptions(selectedStock).map((qty) => (
                <button
                  key={qty}
                  onClick={() => setWasteQuantity(qty)}
                  className={`p-4 rounded-xl font-semibold transition-all ${
                    wasteQuantity === qty
                      ? "bg-destructive text-white"
                      : "banking-card hover:border-destructive/50"
                  }`}
                >
                  {qty} {selectedStock.product?.unit}
                </button>
              ))}
            </div>
            
            {/* Custom quantity input */}
            <div className="flex items-center gap-2">
              <Input
                type="number"
                step="0.01"
                min="0"
                max={Number(selectedStock.quantity)}
                placeholder="Autre quantité..."
                value={wasteQuantity}
                onChange={(e) => setWasteQuantity(e.target.value)}
                className="flex-1"
              />
              <span className="text-muted-foreground">{selectedStock.product?.unit}</span>
            </div>
            
            {/* Warning if quantity too high */}
            {parseFloat(wasteQuantity) > Number(selectedStock.quantity) && (
              <p className="text-destructive text-sm mt-2 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                Quantité supérieure au stock disponible
              </p>
            )}
          </div>

          {/* Reason (optional) */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Raison (optionnel)</p>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {['Périmé', 'Tombé', 'Mauvaise qualité', 'Erreur préparation'].map((reason) => (
                <button
                  key={reason}
                  onClick={() => setWasteReason(reason)}
                  className={`p-3 rounded-xl text-sm font-medium transition-all ${
                    wasteReason === reason
                      ? "bg-secondary text-foreground border-2 border-primary"
                      : "banking-card hover:border-primary/50"
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
            <Input
              type="text"
              placeholder="Autre raison..."
              value={wasteReason}
              onChange={(e) => setWasteReason(e.target.value)}
            />
          </div>

          {/* Summary & Save Button */}
          {wasteQuantity && parseFloat(wasteQuantity) > 0 && parseFloat(wasteQuantity) <= Number(selectedStock.quantity) && (
            <div className="pt-4 animate-fade-up">
              <div className="banking-card p-4 mb-4 border-destructive/30">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center text-2xl">
                    {selectedStock.product?.icon || "📦"}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{selectedStock.product?.name}</p>
                    <p className="text-destructive font-medium">
                      -{wasteQuantity} {selectedStock.product?.unit}
                    </p>
                    {wasteReason && (
                      <p className="text-xs text-muted-foreground">Raison: {wasteReason}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Perte estimée</p>
                    <p className="font-bold text-destructive">
                      {(parseFloat(wasteQuantity) * Number(selectedStock.unit_price || 0)).toFixed(2)}€
                    </p>
                  </div>
                </div>
              </div>
              <Button 
                onClick={handleSave} 
                disabled={isSubmitting}
                className="w-full h-14 text-lg bg-destructive hover:bg-red-600 text-white"
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    Enregistrer le gaspillage
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
          )}
        </>
      )}
    </div>
  )
}
