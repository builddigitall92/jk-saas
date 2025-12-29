import { Suspense } from "react"
import { Bell } from "lucide-react"
import EmployeeAlertsClient from "./EmployeeAlertsClient"

export default function EmployeeAlertsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6">
          <div className="flex items-center gap-3 text-slate-400">
            <div className="w-10 h-10 rounded-xl bg-slate-800/50 border border-white/10 flex items-center justify-center">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <p className="text-white font-semibold">Alertes</p>
              <p className="text-sm">Chargement...</p>
            </div>
          </div>
        </div>
      }
    >
      <EmployeeAlertsClient />
    </Suspense>
  )
}
