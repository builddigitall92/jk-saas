'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, Edit, AlertTriangle } from 'lucide-react'
import { EditStockDialog } from '@/components/edit-stock-dialog'

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

const mockStockData: StockItem[] = [
  {
    id: '1',
    name: 'French Fries (Frozen)',
    category: 'Frozen',
    quantity: 15,
    unit: 'kg',
    minQuantity: 20,
    expirationDate: '2025-12-15',
    supplier: 'Sysco',
  },
  {
    id: '2',
    name: 'Burger Buns',
    category: 'Bakery',
    quantity: 120,
    unit: 'units',
    minQuantity: 50,
    expirationDate: '2025-11-25',
    supplier: 'Local Bakery',
  },
  {
    id: '3',
    name: 'Ground Beef',
    category: 'Meat',
    quantity: 25,
    unit: 'kg',
    minQuantity: 30,
    expirationDate: '2025-11-22',
    supplier: 'Premium Meats',
  },
  {
    id: '4',
    name: 'Lettuce',
    category: 'Produce',
    quantity: 8,
    unit: 'kg',
    minQuantity: 10,
    expirationDate: '2025-11-21',
    supplier: 'Fresh Farm',
  },
  {
    id: '5',
    name: 'Tomatoes',
    category: 'Produce',
    quantity: 12,
    unit: 'kg',
    minQuantity: 8,
    expirationDate: '2025-11-23',
    supplier: 'Fresh Farm',
  },
  {
    id: '6',
    name: 'Cheese Slices',
    category: 'Dairy',
    quantity: 200,
    unit: 'slices',
    minQuantity: 150,
    expirationDate: '2025-12-01',
    supplier: 'Dairy Co',
  },
]

export function StockList() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const filteredStock = mockStockData.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const isLowStock = (item: StockItem) => item.quantity < item.minQuantity

  const getDaysUntilExpiration = (expirationDate: string) => {
    const today = new Date()
    const expDate = new Date(expirationDate)
    const diffTime = expDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const isExpiringSoon = (expirationDate: string) => {
    const days = getDaysUntilExpiration(expirationDate)
    return days <= 7
  }

  const handleEditClick = (item: StockItem) => {
    setSelectedItem(item)
    setEditDialogOpen(true)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search stock items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                    Item
                  </th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                    Category
                  </th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                    Quantity
                  </th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                    Expiration
                  </th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                    Supplier
                  </th>
                  <th className="pb-3 text-right text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredStock.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0">
                    <td className="py-4 text-sm font-medium text-foreground">
                      {item.name}
                    </td>
                    <td className="py-4 text-sm text-muted-foreground">
                      {item.category}
                    </td>
                    <td className="py-4 text-sm text-foreground">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-4">
                      {isLowStock(item) && (
                        <Badge variant="outline" className="gap-1 bg-destructive/10 text-destructive">
                          <AlertTriangle className="h-3 w-3" />
                          Low Stock
                        </Badge>
                      )}
                      {!isLowStock(item) && (
                        <Badge variant="outline" className="bg-chart-2/10 text-chart-2">
                          In Stock
                        </Badge>
                      )}
                    </td>
                    <td className="py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-foreground">
                          {new Date(item.expirationDate).toLocaleDateString()}
                        </span>
                        {isExpiringSoon(item.expirationDate) && (
                          <Badge variant="outline" className="w-fit bg-destructive/10 text-destructive text-xs">
                            {getDaysUntilExpiration(item.expirationDate)} days left
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-4 text-sm text-muted-foreground">
                      {item.supplier}
                    </td>
                    <td className="py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {selectedItem && (
        <EditStockDialog
          item={selectedItem}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}
    </>
  )
}
