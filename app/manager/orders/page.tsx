'use client'

import { RoleNav } from '@/components/role-nav'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ShoppingCart, Plus, Package, Clock, CheckCircle, Truck } from 'lucide-react'
import { useState } from 'react'

const orders = [
  {
    id: 1,
    supplier: 'Agro Foods',
    items: ['Frites 50kg', 'Pain hamburger x200'],
    total: '457.50€',
    status: 'pending',
    date: '23 Nov 2024',
  },
  {
    id: 2,
    supplier: 'Fresh Bakery',
    items: ['Pain hot-dog x150', 'Pain bagnat x100'],
    total: '285.00€',
    status: 'confirmed',
    date: '22 Nov 2024',
  },
  {
    id: 3,
    supplier: 'Meat Express',
    items: ['Viande bœuf 30kg', 'Poulet 25kg'],
    total: '892.00€',
    status: 'delivered',
    date: '21 Nov 2024',
  },
]

export default function ManagerOrdersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'En attente', color: 'accent', icon: Clock }
      case 'confirmed':
        return { label: 'Confirmée', color: 'primary', icon: CheckCircle }
      case 'delivered':
        return { label: 'Livrée', color: 'primary', icon: Truck }
      default:
        return { label: status, color: 'muted', icon: Package }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <RoleNav role="manager" />
      
      <main className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-12">
        <div className="mb-8 flex items-center justify-between animate-in fade-in slide-in-from-top duration-500">
          <div>
            <h2 className="text-4xl font-bold text-foreground mb-2">
              Commandes Fournisseurs
            </h2>
            <p className="text-muted-foreground text-lg">
              Gérez vos commandes et fournisseurs
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="h-5 w-5" />
                Nouvelle Commande
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="text-foreground">Créer une Commande</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Remplissez les détails de votre commande fournisseur
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier" className="text-foreground">Fournisseur</Label>
                  <Select>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="Sélectionner un fournisseur" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="agro">Agro Foods</SelectItem>
                      <SelectItem value="fresh">Fresh Bakery</SelectItem>
                      <SelectItem value="meat">Meat Express</SelectItem>
                      <SelectItem value="veggie">Veggie Market</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label className="text-foreground">Articles</Label>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="item1" className="text-sm text-muted-foreground">Produit</Label>
                        <Input 
                          id="item1"
                          placeholder="Ex: Frites"
                          className="bg-background border-border text-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="qty1" className="text-sm text-muted-foreground">Quantité</Label>
                        <Input 
                          id="qty1"
                          placeholder="Ex: 50kg"
                          className="bg-background border-border text-foreground"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="item2" className="text-sm text-muted-foreground">Produit</Label>
                        <Input 
                          id="item2"
                          placeholder="Ex: Pain hamburger"
                          className="bg-background border-border text-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="qty2" className="text-sm text-muted-foreground">Quantité</Label>
                        <Input 
                          id="qty2"
                          placeholder="Ex: 200 unités"
                          className="bg-background border-border text-foreground"
                        />
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" className="w-full border-border hover:bg-primary/5">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un article
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-foreground">Notes (optionnel)</Label>
                  <Input 
                    id="notes"
                    placeholder="Instructions spéciales..."
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 border-border"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button 
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Créer la Commande
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          {orders.map((order) => {
            const statusConfig = getStatusConfig(order.status)
            const StatusIcon = statusConfig.icon
            
            return (
              <Card key={order.id} className="p-6 bg-card border-border hover:border-primary/30 transition-all duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                      order.status === 'delivered' ? 'bg-primary/10' : 
                      order.status === 'confirmed' ? 'bg-primary/10' : 'bg-accent/10'
                    }`}>
                      <ShoppingCart className={`h-6 w-6 ${
                        order.status === 'delivered' ? 'text-primary' : 
                        order.status === 'confirmed' ? 'text-primary' : 'text-accent'
                      }`} />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-foreground">
                          {order.supplier}
                        </h3>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                          order.status === 'delivered' ? 'bg-primary/10 text-primary' : 
                          order.status === 'confirmed' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
                        }`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig.label}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        {order.items.map((item, idx) => (
                          <p key={idx} className="text-sm text-muted-foreground">
                            • {item}
                          </p>
                        ))}
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        Commandé le {order.date}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                    <p className="text-2xl font-bold text-foreground">
                      {order.total}
                    </p>
                    
                    {order.status === 'pending' && (
                      <Button size="sm" variant="outline" className="border-border hover:bg-primary/5">
                        Modifier
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}
