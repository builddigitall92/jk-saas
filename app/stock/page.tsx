import { StockList } from '@/components/stock-list'
import { AddStockButton } from '@/components/add-stock-button'

export default function StockPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Stock Management
            </h1>
            <p className="mt-2 text-muted-foreground">
              Track inventory levels and expiration dates
            </p>
          </div>
          <AddStockButton />
        </div>

        <StockList />
      </div>
    </div>
  )
}
