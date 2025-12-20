'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface StockItem {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  minQuantity: number
  expirationDate: string
  supplier: string
}

interface EditStockDialogProps {
  item: StockItem
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditStockDialog({ item, open, onOpenChange }: EditStockDialogProps) {
  const [formData, setFormData] = useState({
    name: item.name,
    category: item.category,
    quantity: item.quantity.toString(),
    unit: item.unit,
    minQuantity: item.minQuantity.toString(),
    expirationDate: item.expirationDate,
    supplier: item.supplier,
  })

  useEffect(() => {
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity.toString(),
      unit: item.unit,
      minQuantity: item.minQuantity.toString(),
      expirationDate: item.expirationDate,
      supplier: item.supplier,
    })
  }, [item])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('[v0] Updating stock item:', item.id, formData)
    // TODO: Implement actual update logic
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Stock Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Item Name</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Frozen">Frozen</SelectItem>
                <SelectItem value="Bakery">Bakery</SelectItem>
                <SelectItem value="Meat">Meat</SelectItem>
                <SelectItem value="Produce">Produce</SelectItem>
                <SelectItem value="Dairy">Dairy</SelectItem>
                <SelectItem value="Beverages">Beverages</SelectItem>
                <SelectItem value="Condiments">Condiments</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-quantity">Quantity</Label>
              <Input
                id="edit-quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-unit">Unit</Label>
              <Select
                value={formData.unit}
                onValueChange={(value) => setFormData({ ...formData, unit: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="g">g</SelectItem>
                  <SelectItem value="L">L</SelectItem>
                  <SelectItem value="mL">mL</SelectItem>
                  <SelectItem value="units">units</SelectItem>
                  <SelectItem value="boxes">boxes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-minQuantity">Minimum Quantity Alert</Label>
            <Input
              id="edit-minQuantity"
              type="number"
              value={formData.minQuantity}
              onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-expirationDate">Expiration Date</Label>
            <Input
              id="edit-expirationDate"
              type="date"
              value={formData.expirationDate}
              onChange={(e) =>
                setFormData({ ...formData, expirationDate: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-supplier">Supplier</Label>
            <Input
              id="edit-supplier"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
