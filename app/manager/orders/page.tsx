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
  quantity: number      // Nombre de colis/unités commandés
  packageSize: number   // Contenu par colis (ex: 5 kg, 24 pièces)
  packageUnit: string   // Unité du contenu (kg, pièces, L...)
  unitPrice: number     // Prix par colis
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
  
  // Popup de succès après validation
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [validatedOrder, setValidatedOrder] = useState<Order | null>(null)
  
  // Formulaire nouvelle commande
  const [supplierName, setSupplierName] = useState("")
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [notes, setNotes] = useState("")
  
  // Ajout d'un article
  const [newItemName, setNewItemName] = useState("")
  const [newItemQty, setNewItemQty] = useState("")           // Nombre de colis
  const [newItemPackageSize, setNewItemPackageSize] = useState("")  // Contenu par colis
  const [newItemPackageUnit, setNewItemPackageUnit] = useState("kg") // Unité du contenu
  const [newItemPrice, setNewItemPrice] = useState("")       // Prix par colis

  const supabase = createClient()

  // Charger les commandes
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

      // Transformer les données
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

  // Parser les items depuis les notes (format JSON)
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

  // Ajouter un article à la commande
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

  // Supprimer un article
  const removeItem = (id: string) => {
    setOrderItems(orderItems.filter(item => item.id !== id))
  }

  // Calculer le total
  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  }

  // Créer la commande
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

      // Reset et refresh
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

  // Mettre à jour le statut
  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)
      
      // Si livré, afficher le popup de redirection
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

  // Rediriger vers les stocks
  const goToStocks = () => {
    setShowSuccessPopup(false)
    router.push('/manager/stock')
  }

  // Supprimer une commande
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
        return { label: "En attente", class: "badge-orange", icon: Clock }
      case "confirmed":
        return { label: "Confirmée", class: "badge-green", icon: Check }
      case "delivered":
        return { label: "Livrée", class: "badge-green", icon: CheckCircle }
      default:
        return { label: status, class: "badge-orange", icon: Clock }
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
          <h1 className="text-2xl font-bold text-foreground mb-2">Achats</h1>
          <p className="text-muted-foreground">Gérez vos achats fournisseurs</p>
        </div>

        <Button className="btn-primary" onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-5 w-5 mr-2" />
          Nouvel Achat
        </Button>
      </div>

      {/* Dialog création commande */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="banking-card border-border sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground text-lg">Créer un Achat</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Fournisseur */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Nom du fournisseur</label>
              <Input
                placeholder="Ex: Metro, Brake, Transgourmet..."
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                className="h-11 rounded-xl"
                list="suppliers-list"
              />
              <datalist id="suppliers-list">
                {suppliers.map(s => (
                  <option key={s.id} value={s.name} />
                ))}
              </datalist>
              {suppliers.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {suppliers.length} fournisseur(s) enregistré(s)
                </p>
              )}
            </div>

            {/* Articles ajoutés */}
            {orderItems.length > 0 && (
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Articles ({orderItems.length})</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} colis × {item.packageSize} {item.packageUnit} = {(item.quantity * item.packageSize).toFixed(1)} {item.packageUnit}
                        </p>
                        <p className="text-xs text-primary">
                          {item.quantity} × {item.unitPrice.toFixed(2)}€/colis
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary text-lg">
                          {(item.quantity * item.unitPrice).toFixed(2)}€
                        </span>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeItem(item.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-3 pt-3 border-t border-border">
                  <span className="font-medium text-foreground">Total achat</span>
                  <span className="text-xl font-bold text-primary">{calculateTotal().toFixed(2)}€</span>
                </div>
              </div>
            )}

            {/* Ajouter un article */}
            <div className="p-4 rounded-xl bg-secondary/20 border border-border">
              <p className="text-sm font-medium text-foreground mb-3">Ajouter un article</p>
              
              <div className="space-y-3">
                {/* Ligne 1: Produit */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Produit</label>
                  <Input
                    placeholder="Ex: Frites surgelées, Pain burger..."
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="h-10 rounded-lg"
                    list="products-list"
                  />
                  <datalist id="products-list">
                    {stocks.map(s => (
                      <option key={s.id} value={s.product?.name || ''} />
                    ))}
                  </datalist>
                </div>

                {/* Ligne 2: Nombre de colis */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Nombre de colis / cartons
                  </label>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Ex: 2"
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(e.target.value)}
                    className="h-10 rounded-lg"
                  />
                </div>

                {/* Ligne 3: Contenu par colis */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Contenu par colis</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Ex: 5"
                      value={newItemPackageSize}
                      onChange={(e) => setNewItemPackageSize(e.target.value)}
                      className="h-10 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Unité</label>
                    <select
                      value={newItemPackageUnit}
                      onChange={(e) => setNewItemPackageUnit(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm"
                    >
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="L">L</option>
                      <option value="pièces">pièces</option>
                      <option value="unités">unités</option>
                    </select>
                  </div>
                </div>

                {/* Ligne 4: Prix par colis */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Prix par colis (€)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 25.00"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    className="h-10 rounded-lg"
                  />
                </div>

                {/* Aperçu du calcul */}
                {newItemQty && newItemPrice && (
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Quantité totale :</span>
                        <span className="font-medium text-foreground">
                          {newItemPackageSize ? (parseFloat(newItemQty) * parseFloat(newItemPackageSize)).toFixed(1) : newItemQty} {newItemPackageUnit}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {newItemQty} colis × {parseFloat(newItemPrice).toFixed(2)}€
                        </span>
                        <span className="text-lg font-bold text-primary">
                          = {(parseFloat(newItemQty) * parseFloat(newItemPrice)).toFixed(2)}€
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bouton Ajouter */}
                <Button 
                  onClick={addItem}
                  disabled={!newItemName.trim() || !newItemQty || !newItemPrice}
                  className="w-full h-10"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter cet article
                </Button>
              </div>
            </div>
          </div>

          {/* Message d'erreur */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {errorMessage}
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => { setIsDialogOpen(false); setErrorMessage(null); }}>
              Annuler
            </Button>
            <Button 
              className="flex-1 btn-primary" 
              onClick={createOrder}
              disabled={!supplierName.trim() || orderItems.length === 0 || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Créer ({calculateTotal().toFixed(2)}€)
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Popup de succès - Redirection vers Stocks */}
      <Dialog open={showSuccessPopup} onOpenChange={setShowSuccessPopup}>
        <DialogContent className="banking-card border-border sm:max-w-[450px]">
          <div className="text-center py-6">
            <div className="h-16 w-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-accent" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Achat validé ! ✅</h2>
            <p className="text-muted-foreground mb-6">
              L'achat de <span className="font-semibold text-foreground">{validatedOrder?.supplier_name}</span> a été validé.
              <br />
              Ajoutez maintenant les articles à votre stock.
            </p>

            {validatedOrder && validatedOrder.items.length > 0 && (
              <div className="bg-secondary/30 rounded-xl p-4 mb-6 text-left">
                <p className="text-xs text-muted-foreground mb-2">Articles à ajouter :</p>
                <div className="space-y-2">
                  {validatedOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{item.name}</span>
                      <span className="text-muted-foreground">
                        {(item.quantity * item.packageSize).toFixed(1)} {item.packageUnit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowSuccessPopup(false)}
              >
                Plus tard
              </Button>
              <Button 
                className="flex-1 btn-primary"
                onClick={goToStocks}
              >
                Aller aux Stocks
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
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
                className="banking-card p-5 animate-fade-up"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                      order.status === "pending" ? "bg-orange-500/10" : "bg-accent/10"
                    }`}>
                      <ShoppingCart className={`h-6 w-6 ${
                        order.status === "pending" ? "text-primary" : "text-accent"
                      }`} />
                    </div>

                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-foreground">{order.supplier_name || 'Fournisseur'}</h3>
                        <span className={statusConfig.class}>
                          <StatusIcon className="h-3 w-3 inline mr-1" />
                          {statusConfig.label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.items.map(i => {
                          const totalQty = i.packageSize ? (i.quantity * i.packageSize) : i.quantity
                          const unit = i.packageUnit || 'unités'
                          return `${i.name} (${totalQty}${unit})`
                        }).join(' • ') || 'Aucun article'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(order.created_at).toLocaleDateString('fr-FR', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-bold text-foreground">{Number(order.total_amount).toFixed(2)}€</p>
                    <div className="flex gap-2 mt-2">
                      {order.status === "pending" && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateStatus(order.id, 'confirmed')}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Confirmer
                        </Button>
                      )}
                      {order.status === "confirmed" && (
                        <Button 
                          size="sm" 
                          className="bg-accent text-accent-foreground hover:bg-accent/90"
                          onClick={() => updateStatus(order.id, 'delivered')}
                        >
                          <Package className="h-3 w-3 mr-1" />
                          Valider + Stock
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteOrder(order.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="banking-card p-12 text-center animate-fade-up">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Aucun achat</h3>
            <p className="text-muted-foreground mb-4">
              Créez votre premier achat fournisseur
            </p>
            <Button className="btn-primary" onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvel Achat
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
