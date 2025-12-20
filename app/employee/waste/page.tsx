"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, ChevronLeft, Loader2, Package, Trash2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useStock, type StockWithProduct } from "@/lib/hooks/use-stock"
import { createClient } from "@/utils/supabase/client"

export default function WastePage() {
  const { stocks, loading, updateQuantity } = useStock()
  
  const [selectedStock, setSelectedStock] = useState<StockWithProduct | null>(null)
  const [wasteQuantity, setWasteQuantity] = useState("")
  const [wasteReason, setWasteReason] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
          Enregistrer un gaspillage
        </h1>
        <p className="text-sm text-muted-foreground">
          {selectedStock ? "Indiquez la quantité gaspillée" : "Sélectionnez un produit en stock"}
        </p>
      </div>

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
    </div>
  )
}
