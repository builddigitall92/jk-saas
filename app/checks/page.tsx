import { ServiceChecksList } from '@/components/service-checks-list'
import { ChecksStats } from '@/components/checks-stats'
import { NewCheckButton } from '@/components/new-check-button'

export default function ChecksPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Service Quality Checks
            </h1>
            <p className="mt-2 text-muted-foreground">
              Perform and track quality control inspections
            </p>
          </div>
          <NewCheckButton />
        </div>

        <ChecksStats />
        <ServiceChecksList />
      </div>
    </div>
  )
}
