"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  ShoppingCart, 
  Plus, 
  Clock, 
  Check, 
  Loader2, 
  Trash2, 
  X,
  Package,
  ArrowRight,
  CheckCircle
} from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { useStock } from "@/lib/hooks/use-stock"
import { useSuppliers } from "@/lib/hooks/use-suppliers"

interface OrderItem {
  id: string
  name: string
  quantity: number
  packageSize: number
  packageUnit: string
  unitPrice: number
}

interface Order {
  id: string
  supplier_name: string
  status: string
  total_amount: number
  notes: string
  created_at: string
  items: OrderItem[]
}

export default function ManagerOrdersPage() {
  const router = useRouter()
  const { stocks } = useStock()
  const { suppliers } = useSuppliers()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [validatedOrder, setValidatedOrder] = useState<Order | null>(null)
  
  const [supplierName, setSupplierName] = useState("")
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [notes, setNotes] = useState("")
  
  const [newItemName, setNewItemName] = useState("")
  const [newItemQty, setNewItemQty] = useState("")
  const [newItemPackageSize, setNewItemPackageSize] = useState("")
  const [newItemPackageUnit, setNewItemPackageUnit] = useState("kg")
  const [newItemPrice, setNewItemPrice] = useState("")

  const supabase = createClient()

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('establishment_id')
        .eq('id', user.id)
        .single()

      if (!profile?.establishment_id) return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('orders')
        .select('*')
        .eq('establishment_id', profile.establishment_id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ordersWithItems = (data || []).map((order: any) => ({
        ...order,
        items: order.notes ? parseOrderItems(order.notes) : []
      }))

      setOrders(ordersWithItems)
    } catch (err) {
      console.error('Erreur chargement commandes:', err)
    } finally {
      setLoading(false)
    }
  }

  const parseOrderItems = (notes: string): OrderItem[] => {
    try {
      const parsed = JSON.parse(notes)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const addItem = () => {
    if (!newItemName.trim() || !newItemQty || !newItemPrice) return

    const newItem: OrderItem = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      quantity: parseFloat(newItemQty),
      packageSize: parseFloat(newItemPackageSize) || 1,
      packageUnit: newItemPackageUnit,
      unitPrice: parseFloat(newItemPrice)
    }

    setOrderItems([...orderItems, newItem])
    setNewItemName("")
    setNewItemQty("")
    setNewItemPackageSize("")
    setNewItemPrice("")
  }

  const removeItem = (id: string) => {
    setOrderItems(orderItems.filter(item => item.id !== id))
  }

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  }

  const createOrder = async () => {
    if (!supplierName.trim() || orderItems.length === 0) {
      setErrorMessage("Veuillez remplir le nom du fournisseur et ajouter au moins un article")
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('establishment_id')
        .eq('id', user.id)
        .single()

      if (!profile?.establishment_id) throw new Error('Pas d\'établissement')

      const orderNumber = `CMD-${Date.now().toString().slice(-6)}`
      const total = calculateTotal()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('orders')
        .insert({
          establishment_id: profile.establishment_id,
          supplier_name: supplierName.trim(),
          order_number: orderNumber,
          status: 'pending',
          total_amount: total,
          notes: JSON.stringify(orderItems),
          created_by: user.id
        })

      if (error) throw error

      setSupplierName("")
      setOrderItems([])
      setNotes("")
      setErrorMessage(null)
      setIsDialogOpen(false)
      await fetchOrders()
    } catch (err: unknown) {
      console.error('Erreur création commande:', err)
      const errorMsg = err instanceof Error ? err.message : 'Erreur inconnue'
      setErrorMessage(`Erreur: ${errorMsg}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)
      
      if (newStatus === 'delivered') {
        const order = orders.find(o => o.id === orderId)
        if (order) {
          setValidatedOrder(order)
          setShowSuccessPopup(true)
        }
      }
      
      await fetchOrders()
    } catch (err) {
      console.error('Erreur mise à jour statut:', err)
    }
  }

  const goToStocks = () => {
    setShowSuccessPopup(false)
    router.push('/manager/stock')
  }

  const deleteOrder = async (orderId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet achat ?')) return
    
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('orders')
        .delete()
        .eq('id', orderId)
      
      if (error) throw error
      await fetchOrders()
    } catch (err) {
      console.error('Erreur suppression:', err)
      alert('Erreur lors de la suppression')
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return { label: "En attente", color: "orange", icon: Clock }
      case "confirmed":
        return { label: "Confirmée", color: "blue", icon: Check }
      case "delivered":
        return { label: "Livrée", color: "green", icon: CheckCircle }
      default:
        return { label: status, color: "orange", icon: Clock }
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
          </div>
          <p className="text-slate-400 text-sm">Chargement des achats...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between glass-animate-fade-up">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100 tracking-tight">Achats</h1>
          <p className="text-sm text-slate-400">Gérez vos achats fournisseurs</p>
        </div>

        <button className="glass-btn-primary" onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-5 w-5" />
          Nouvel Achat
        </button>
      </div>

      {/* Dialog création commande */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent 
          className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto border-0"
          style={{
            background: "linear-gradient(145deg, rgba(20, 27, 45, 0.98) 0%, rgba(15, 20, 35, 0.99) 100%)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(100, 130, 180, 0.2)",
            borderRadius: "20px",
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-white">Créer un Achat</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Fournisseur */}
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Nom du fournisseur</label>
              <input
                placeholder="Ex: Metro, Brake, Transgourmet..."
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                className="glass-search-input"
                list="suppliers-list"
              />
              <datalist id="suppliers-list">
                {suppliers.map(s => (
                  <option key={s.id} value={s.name} />
                ))}
              </datalist>
              {suppliers.length > 0 && (
                <p className="text-xs text-slate-500 mt-1">
                  {suppliers.length} fournisseur(s) enregistré(s)
                </p>
              )}
            </div>

            {/* Articles ajoutés */}
            {orderItems.length > 0 && (
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Articles ({orderItems.length})</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {orderItems.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex items-center justify-between p-3 rounded-xl"
                      style={{
                        background: "rgba(30, 41, 59, 0.5)",
                        border: "1px solid rgba(100, 130, 180, 0.15)",
                      }}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-white">{item.name}</p>
                        <p className="text-xs text-slate-500">
                          {item.quantity} colis × {item.packageSize} {item.packageUnit} = {(item.quantity * item.packageSize).toFixed(1)} {item.packageUnit}
                        </p>
                        <p className="text-xs text-blue-400">
                          {item.quantity} × {item.unitPrice.toFixed(2)}€/colis
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-green-400 text-lg">
                          {(item.quantity * item.unitPrice).toFixed(2)}€
                        </span>
                        <button 
                          className="glass-btn-icon w-8 h-8 hover:!bg-red-500/20 hover:!border-red-500/40 hover:text-red-400"
                          onClick={() => removeItem(item.id)}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-3 pt-3 border-t border-white/10">
                  <span className="font-medium text-slate-300">Total achat</span>
                  <span className="text-xl font-bold text-green-400">{calculateTotal().toFixed(2)}€</span>
                </div>
              </div>
            )}

            {/* Ajouter un article */}
            <div 
              className="p-4 rounded-xl"
              style={{
                background: "rgba(30, 41, 59, 0.4)",
                border: "1px solid rgba(100, 130, 180, 0.15)",
              }}
            >
              <p className="text-sm font-medium text-white mb-3">Ajouter un article</p>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Produit</label>
                  <input
                    placeholder="Ex: Frites surgelées, Pain burger..."
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="glass-search-input"
                    list="products-list"
                  />
                  <datalist id="products-list">
                    {stocks.map(s => (
                      <option key={s.id} value={s.product?.name || ''} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Nombre de colis / cartons</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Ex: 2"
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(e.target.value)}
                    className="glass-search-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Contenu par colis</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Ex: 5"
                      value={newItemPackageSize}
                      onChange={(e) => setNewItemPackageSize(e.target.value)}
                      className="glass-search-input"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Unité</label>
                    <select
                      value={newItemPackageUnit}
                      onChange={(e) => setNewItemPackageUnit(e.target.value)}
                      className="glass-search-input"
                    >
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="L">L</option>
                      <option value="pièces">pièces</option>
                      <option value="unités">unités</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Prix par colis (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 25.00"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    className="glass-search-input"
                  />
                </div>

                {newItemQty && newItemPrice && (
                  <div 
                    className="p-3 rounded-xl"
                    style={{
                      background: "rgba(59, 130, 246, 0.1)",
                      border: "1px solid rgba(59, 130, 246, 0.2)",
                    }}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Quantité totale :</span>
                        <span className="font-medium text-white">
                          {newItemPackageSize ? (parseFloat(newItemQty) * parseFloat(newItemPackageSize)).toFixed(1) : newItemQty} {newItemPackageUnit}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">
                          {newItemQty} colis × {parseFloat(newItemPrice).toFixed(2)}€
                        </span>
                        <span className="text-lg font-bold text-blue-400">
                          = {(parseFloat(newItemQty) * parseFloat(newItemPrice)).toFixed(2)}€
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <button 
                  className="glass-btn-secondary w-full justify-center"
                  onClick={addItem}
                  disabled={!newItemName.trim() || !newItemQty || !newItemPrice}
                >
                  <Plus className="h-4 w-4" />
                  Ajouter cet article
                </button>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div 
              className="p-3 rounded-xl text-sm"
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#f87171",
              }}
            >
              {errorMessage}
            </div>
          )}

          <div className="flex gap-3">
            <button className="glass-btn-secondary flex-1 justify-center" onClick={() => { setIsDialogOpen(false); setErrorMessage(null); }}>
              Annuler
            </button>
            <button 
              className="glass-btn-primary flex-1 justify-center"
              onClick={createOrder}
              disabled={!supplierName.trim() || orderItems.length === 0 || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Créer ({calculateTotal().toFixed(2)}€)
                </>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Popup de succès */}
      <Dialog open={showSuccessPopup} onOpenChange={setShowSuccessPopup}>
        <DialogContent 
          className="sm:max-w-[450px] border-0"
          style={{
            background: "linear-gradient(145deg, rgba(20, 27, 45, 0.98) 0%, rgba(15, 20, 35, 0.99) 100%)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(100, 130, 180, 0.2)",
            borderRadius: "20px",
          }}
        >
          <div className="text-center py-6">
            <div className="h-16 w-16 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Achat validé ! ✅</h2>
            <p className="text-slate-400 mb-6">
              L'achat de <span className="font-semibold text-white">{validatedOrder?.supplier_name}</span> a été validé.
              <br />
              Ajoutez maintenant les articles à votre stock.
            </p>

            {validatedOrder && validatedOrder.items.length > 0 && (
              <div 
                className="rounded-xl p-4 mb-6 text-left"
                style={{
                  background: "rgba(30, 41, 59, 0.5)",
                  border: "1px solid rgba(100, 130, 180, 0.15)",
                }}
              >
                <p className="text-xs text-slate-500 mb-2">Articles à ajouter :</p>
                <div className="space-y-2">
                  {validatedOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-white">{item.name}</span>
                      <span className="text-slate-400">
                        {(item.quantity * item.packageSize).toFixed(1)} {item.packageUnit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button 
                className="glass-btn-secondary flex-1 justify-center"
                onClick={() => setShowSuccessPopup(false)}
              >
                Plus tard
              </button>
              <button 
                className="glass-btn-primary flex-1 justify-center"
                onClick={goToStocks}
              >
                Aller aux Stocks
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 gap-4">
        {orders.length > 0 ? (
          orders.map((order, idx) => {
            const statusConfig = getStatusConfig(order.status)
            const StatusIcon = statusConfig.icon

            return (
              <div
                key={order.id}
                className="glass-stat-card glass-animate-fade-up"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`glass-stat-icon glass-stat-icon-${statusConfig.color}`}>
                      <ShoppingCart className="h-6 w-6" />
                    </div>

                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-white">{order.supplier_name || 'Fournisseur'}</h3>
                        <span 
                          className="px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1"
                          style={{
                            background: statusConfig.color === 'orange' ? 'rgba(251, 146, 60, 0.15)' : 
                                        statusConfig.color === 'blue' ? 'rgba(59, 130, 246, 0.15)' :
                                        'rgba(34, 197, 94, 0.15)',
                            color: statusConfig.color === 'orange' ? '#fb923c' : 
                                   statusConfig.color === 'blue' ? '#60a5fa' :
                                   '#4ade80',
                            border: `1px solid ${statusConfig.color === 'orange' ? 'rgba(251, 146, 60, 0.3)' : 
                                                 statusConfig.color === 'blue' ? 'rgba(59, 130, 246, 0.3)' :
                                                 'rgba(34, 197, 94, 0.3)'}`,
                          }}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig.label}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400">
                        {order.items.map(i => {
                          const totalQty = i.packageSize ? (i.quantity * i.packageSize) : i.quantity
                          const unit = i.packageUnit || 'unités'
                          return `${i.name} (${totalQty}${unit})`
                        }).join(' • ') || 'Aucun article'}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(order.created_at).toLocaleDateString('fr-FR', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-bold text-white">{Number(order.total_amount).toFixed(2)}€</p>
                    <div className="flex gap-2 mt-2">
                      {order.status === "pending" && (
                        <button 
                          className="glass-btn-secondary glass-btn-sm"
                          onClick={() => updateStatus(order.id, 'confirmed')}
                        >
                          <Check className="h-3 w-3" />
                          Confirmer
                        </button>
                      )}
                      {order.status === "confirmed" && (
                        <button 
                          className="glass-btn-success glass-btn-sm"
                          onClick={() => updateStatus(order.id, 'delivered')}
                        >
                          <Package className="h-3 w-3" />
                          Valider + Stock
                        </button>
                      )}
                      <button 
                        className="glass-btn-icon w-8 h-8 hover:!bg-red-500/20 hover:!border-red-500/40 hover:text-red-400"
                        onClick={() => deleteOrder(order.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="glass-stat-card glass-animate-fade-up">
            <div className="glass-empty-state">
              <div className="glass-empty-icon">
                <Package className="h-10 w-10" />
              </div>
              <p className="glass-empty-title">Aucun achat</p>
              <p className="glass-empty-desc">Créez votre premier achat fournisseur</p>
              <button className="glass-btn-primary" onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                Nouvel Achat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
