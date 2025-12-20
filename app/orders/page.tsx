import { OrdersList } from '@/components/orders-list'
import { CreateOrderButton } from '@/components/create-order-button'

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Supplier Orders
            </h1>
            <p className="mt-2 text-muted-foreground">
              Manage and track orders from your suppliers
            </p>
          </div>
          <CreateOrderButton />
        </div>

        <OrdersList />
      </div>
    </div>
  )
}
