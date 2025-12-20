import { WasteLog } from '@/components/waste-log'
import { WasteStats } from '@/components/waste-stats'
import { LogWasteButton } from '@/components/log-waste-button'

export default function WastePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Waste Management
            </h1>
            <p className="mt-2 text-muted-foreground">
              Track and reduce food waste in your restaurant
            </p>
          </div>
          <LogWasteButton />
        </div>

        <WasteStats />
        <WasteLog />
      </div>
    </div>
  )
}
