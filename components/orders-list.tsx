'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Eye } from 'lucide-react'
import { OrderDetailsDialog } from '@/components/order-details-dialog'

interface OrderItem {
  itemName: string
  quantity: number
  unit: string
  unitPrice: number
}

interface Order {
  id: string
  orderNumber: string
  supplier: string
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  orderDate: string
  expectedDelivery: string
  items: OrderItem[]
  totalAmount: number
}

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-001',
    supplier: 'Sysco',
    status: 'confirmed',
    orderDate: '2025-11-18',
    expectedDelivery: '2025-11-22',
    items: [
      { itemName: 'French Fries (Frozen)', quantity: 50, unit: 'kg', unitPrice: 4.5 },
      { itemName: 'Onion Rings', quantity: 20, unit: 'kg', unitPrice: 6.0 },
    ],
    totalAmount: 345,
  },
  {
    id: '2',
    orderNumber: 'ORD-002',
    supplier: 'Premium Meats',
    status: 'shipped',
    orderDate: '2025-11-17',
    expectedDelivery: '2025-11-20',
    items: [
      { itemName: 'Ground Beef', quantity: 40, unit: 'kg', unitPrice: 12.0 },
      { itemName: 'Chicken Breast', quantity: 30, unit: 'kg', unitPrice: 9.5 },
    ],
    totalAmount: 765,
  },
  {
    id: '3',
    orderNumber: 'ORD-003',
    supplier: 'Fresh Farm',
    status: 'pending',
    orderDate: '2025-11-19',
    expectedDelivery: '2025-11-21',
    items: [
      { itemName: 'Lettuce', quantity: 15, unit: 'kg', unitPrice: 3.5 },
      { itemName: 'Tomatoes', quantity: 20, unit: 'kg', unitPrice: 4.0 },
    ],
    totalAmount: 132.5,
  },
  {
    id: '4',
    orderNumber: 'ORD-004',
    supplier: 'Dairy Co',
    status: 'delivered',
    orderDate: '2025-11-15',
    expectedDelivery: '2025-11-18',
    items: [
      { itemName: 'Cheese Slices', quantity: 500, unit: 'slices', unitPrice: 0.5 },
      { itemName: 'Milk', quantity: 10, unit: 'L', unitPrice: 2.5 },
    ],
    totalAmount: 275,
  },
  {
    id: '5',
    orderNumber: 'ORD-005',
    supplier: 'Local Bakery',
    status: 'delivered',
    orderDate: '2025-11-16',
    expectedDelivery: '2025-11-19',
    items: [
      { itemName: 'Burger Buns', quantity: 200, unit: 'units', unitPrice: 0.4 },
    ],
    totalAmount: 80,
  },
]

export function OrdersList() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-chart-4/10 text-chart-4'
      case 'confirmed':
        return 'bg-chart-1/10 text-chart-1'
      case 'shipped':
        return 'bg-chart-3/10 text-chart-3'
      case 'delivered':
        return 'bg-chart-2/10 text-chart-2'
      case 'cancelled':
        return 'bg-destructive/10 text-destructive'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const filterOrders = (orders: Order[]) => {
    if (activeTab === 'all') return orders
    return orders.filter((order) => order.status === activeTab)
  }

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order)
    setDetailsDialogOpen(true)
  }

  const filteredOrders = filterOrders(mockOrders)

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
          <TabsTrigger value="shipped">Shipped</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {order.orderNumber}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {order.supplier}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={getStatusColor(order.status)}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(order)}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Order Date</p>
                      <p className="text-sm font-medium text-foreground">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Expected Delivery
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {new Date(order.expectedDelivery).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Amount</p>
                      <p className="text-sm font-medium text-foreground">
                        ${order.totalAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-xs text-muted-foreground">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''} ordered
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredOrders.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">
                    No orders found for this filter
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {selectedOrder && (
        <OrderDetailsDialog
          order={selectedOrder}
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
        />
      )}
    </>
  )
}
