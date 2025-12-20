'use client'

import { RoleNav } from '@/components/role-nav'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Trash2, Plus } from 'lucide-react'
import { useState } from 'react'

const products = [
  { id: 'fries', name: 'Frites', icon: '🍟' },
  { id: 'bread', name: 'Pain', icon: '🍞' },
  { id: 'meat', name: 'Viande', icon: '🥩' },
  { id: 'sauce', name: 'Sauce', icon: '🥫' },
  { id: 'drink', name: 'Boisson', icon: '🥤' },
]

const quantities = ['200g', '300g', '500g', '1kg', '1 unité', '5 unités', '10 unités']

const todayWaste = [
  { time: '14:30', product: 'Frites', qty: '500g', cost: '4.00€' },
  { time: '12:15', product: 'Pain', qty: '3 unités', cost: '2.40€' },
  { time: '11:20', product: 'Sauce', qty: '200g', cost: '1.80€' },
]

export default function EmployeeWastePage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [selectedQty, setSelectedQty] = useState<string | null>(null)

  const handleSubmit = () => {
    if (selectedProduct && selectedQty) {
      setIsDialogOpen(false)
      setSelectedProduct(null)
      setSelectedQty(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <RoleNav role="employee" />
      
      <main className="mx-auto max-w-4xl px-6 py-8 sm:px-8">
        <div className="mb-8 flex items-center justify-between animate-in fade-in slide-in-from-top duration-500">
          <div>
            <h2 className="text-4xl font-bold text-foreground mb-2">
              Gaspillage
            </h2>
            <p className="text-muted-foreground text-lg">
              Enregistrement ultra simple
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground h-14 px-8 text-lg">
                <Plus className="h-6 w-6" />
                Ajouter Gaspillage
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-foreground text-2xl">Nouveau Gaspillage</DialogTitle>
                <DialogDescription className="text-muted-foreground text-base">
                  Sélectionnez le produit et la quantité
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-foreground">Produit</p>
                  <div className="grid grid-cols-2 gap-3">
                    {products.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => setSelectedProduct(product.id)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedProduct === product.id
                            ? 'border-destructive bg-destructive/10'
                            : 'border-border hover:border-destructive/30 bg-background'
                        }`}
                      >
                        <div className="text-3xl mb-2">{product.icon}</div>
                        <p className="font-semibold text-foreground">{product.name}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-foreground">Quantité</p>
                  <div className="grid grid-cols-3 gap-2">
                    {quantities.map((qty) => (
                      <button
                        key={qty}
                        onClick={() => setSelectedQty(qty)}
                        className={`p-3 rounded-lg border-2 transition-all font-semibold ${
                          selectedQty === qty
                            ? 'border-destructive bg-destructive/10 text-destructive'
                            : 'border-border hover:border-destructive/30 bg-background text-foreground'
                        }`}
                      >
                        {qty}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 border-border h-12"
                  onClick={() => {
                    setIsDialogOpen(false)
                    setSelectedProduct(null)
                    setSelectedQty(null)
                  }}
                >
                  Annuler
                </Button>
                <Button 
                  className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground h-12 text-base"
                  onClick={handleSubmit}
                  disabled={!selectedProduct || !selectedQty}
                >
                  Confirmer
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="p-6 bg-card border-border animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-xl font-bold text-foreground mb-6">
            Gaspillage d'Aujourd'hui
          </h3>
          
          <div className="space-y-3">
            {todayWaste.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-background border border-border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <Trash2 className="h-6 w-6 text-destructive" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{item.product}</p>
                    <p className="text-sm text-muted-foreground">{item.qty}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-destructive">{item.cost}</p>
                  <p className="text-sm text-muted-foreground">{item.time}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-foreground">Total du jour</span>
              <span className="text-2xl font-bold text-destructive">8.20€</span>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
