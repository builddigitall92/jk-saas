'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

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

interface OrderDetailsDialogProps {
  order: Order
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OrderDetailsDialog({
  order,
  open,
  onOpenChange,
}: OrderDetailsDialogProps) {
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

  const handleStatusUpdate = (newStatus: Order['status']) => {
    console.log('[v0] Updating order status:', order.id, newStatus)
    // TODO: Implement actual status update logic
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{order.orderNumber}</DialogTitle>
            <Badge variant="outline" className={getStatusColor(order.status)}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Supplier</p>
              <p className="text-base font-medium text-foreground">{order.supplier}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Order Date</p>
              <p className="text-base font-medium text-foreground">
                {new Date(order.orderDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expected Delivery</p>
              <p className="text-base font-medium text-foreground">
                {new Date(order.expectedDelivery).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-base font-medium text-foreground">
                ${order.totalAmount.toFixed(2)}
              </p>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-medium text-foreground">Order Items</h3>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {item.itemName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} {item.unit} × ${item.unitPrice.toFixed(2)}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    ${(item.quantity * item.unitPrice).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {order.status !== 'delivered' && order.status !== 'cancelled' && (
            <div>
              <h3 className="mb-3 text-sm font-medium text-foreground">
                Update Status
              </h3>
              <div className="flex gap-2">
                {order.status === 'pending' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusUpdate('confirmed')}
                  >
                    Mark as Confirmed
                  </Button>
                )}
                {order.status === 'confirmed' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusUpdate('shipped')}
                  >
                    Mark as Shipped
                  </Button>
                )}
                {order.status === 'shipped' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusUpdate('delivered')}
                  >
                    Mark as Delivered
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive"
                  onClick={() => handleStatusUpdate('cancelled')}
                >
                  Cancel Order
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
