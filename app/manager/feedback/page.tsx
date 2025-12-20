"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  Check, 
  X, 
  Loader2, 
  Bell,
  ClipboardCheck,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  Send
} from "lucide-react"
import { createClient } from "@/utils/supabase/client"

interface Employee {
  id: string
  first_name: string | null
  last_name: string | null
  role: string
  is_active: boolean
}

interface EmployeeStatus {
  employee: Employee
  hasCheckedIn: boolean
  hasUpdatedStock: boolean
  lastCheckIn: string | null
  lastStockUpdate: string | null
}

export default function ManagerFeedbackPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [employees, setEmployees] = useState<EmployeeStatus[]>([])
  const [sendingAlert, setSendingAlert] = useState<string | null>(null)
  const [alertSent, setAlertSent] = useState<Record<string, boolean>>({})

  // Charger les employés et leur statut
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profile } = await (supabase as any)
          .from('profiles')
          .select('establishment_id')
          .eq('id', user.id)
          .single()

        if (!profile?.establishment_id) return

        // Récupérer les employés de l'établissement
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: employeesData } = await (supabase as any)
          .from('profiles')
          .select('*')
          .eq('establishment_id', profile.establishment_id)
          .eq('role', 'employee')
          .eq('is_active', true)

        if (!employeesData) return

        // Date d'aujourd'hui
        const today = new Date().toISOString().split('T')[0]

        // Pour chaque employé, vérifier son statut
        const employeeStatuses: EmployeeStatus[] = await Promise.all(
          employeesData.map(async (emp: Employee) => {
            // Vérifier le check-in d'aujourd'hui (avec le statut inventory_done)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: checkIns } = await (supabase as any)
              .from('service_checks')
              .select('*, inventory_done')
              .eq('performed_by', emp.id)
              .gte('check_date', today)
              .order('created_at', { ascending: false })
              .limit(1)

            const hasCheckIn = checkIns && checkIns.length > 0
            const inventoryMarkedDone = hasCheckIn && checkIns[0]?.inventory_done === true

            // Vérifier les mises à jour de stock d'aujourd'hui
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: stockUpdates } = await (supabase as any)
              .from('stock')
              .select('*')
              .eq('added_by', emp.id)
              .gte('created_at', `${today}T00:00:00`)
              .order('created_at', { ascending: false })
              .limit(1)

            const hasStockUpdate = stockUpdates && stockUpdates.length > 0

            return {
              employee: emp,
              hasCheckedIn: hasCheckIn,
              hasUpdatedStock: inventoryMarkedDone || hasStockUpdate,
              lastCheckIn: checkIns?.[0]?.created_at || null,
              lastStockUpdate: stockUpdates?.[0]?.created_at || null
            }
          })
        )

        setEmployees(employeeStatuses)
      } catch (err) {
        console.error('Erreur:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Envoyer une alerte à un employé
  const sendAlert = async (employeeId: string, employeeName: string, missingTasks: string[]) => {
    setSendingAlert(employeeId)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('establishment_id')
        .eq('id', user.id)
        .single()

      if (!profile?.establishment_id) return

      const taskList = missingTasks.join(' et ')
      
      // Créer l'alerte
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('alerts')
        .insert({
          establishment_id: profile.establishment_id,
          alert_type: 'warning',
          category: 'system',
          title: `Rappel: ${taskList}`,
          message: `${employeeName}, n'oubliez pas de faire ${taskList.toLowerCase()} aujourd'hui.`,
          is_read: false,
          is_dismissed: false
        })

      setAlertSent(prev => ({ ...prev, [employeeId]: true }))
    } catch (err) {
      console.error('Erreur envoi alerte:', err)
    } finally {
      setSendingAlert(null)
    }
  }

  // Statistiques
  const totalEmployees = employees.length
  const checkedInCount = employees.filter(e => e.hasCheckedIn).length
  const stockUpdatedCount = employees.filter(e => e.hasUpdatedStock).length
  const allTasksDone = employees.filter(e => e.hasCheckedIn && e.hasUpdatedStock).length

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <h1 className="text-2xl font-bold text-foreground mb-2">Suivi Employés</h1>
        <p className="text-muted-foreground">Check-in et inventaire quotidien</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6 animate-fade-up delay-1">
        <div className="banking-card p-5">
          <Users className="h-5 w-5 text-primary mb-3" />
          <p className="text-2xl font-bold text-foreground">{totalEmployees}</p>
          <p className="text-sm text-muted-foreground">Employés actifs</p>
        </div>
        <div className="banking-card p-5">
          <ClipboardCheck className="h-5 w-5 text-accent mb-3" />
          <p className="text-2xl font-bold text-foreground">{checkedInCount}/{totalEmployees}</p>
          <p className="text-sm text-muted-foreground">Check-in fait</p>
        </div>
        <div className="banking-card p-5">
          <Package className="h-5 w-5 text-primary mb-3" />
          <p className="text-2xl font-bold text-foreground">{stockUpdatedCount}/{totalEmployees}</p>
          <p className="text-sm text-muted-foreground">Inventaire fait</p>
        </div>
        <div className="banking-card-featured p-5">
          <CheckCircle className="h-5 w-5 text-accent mb-3" />
          <p className="text-2xl font-bold text-accent">{allTasksDone}/{totalEmployees}</p>
          <p className="text-sm text-muted-foreground">Tout complété</p>
        </div>
      </div>

      {/* Liste des employés */}
      <div className="banking-card p-5 animate-fade-up delay-2">
        <h2 className="font-semibold text-foreground mb-5">Statut des employés aujourd'hui</h2>
        
        {employees.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium text-foreground mb-1">Aucun employé</p>
            <p className="text-sm text-muted-foreground">
              Ajoutez des employés dans les paramètres
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {employees.map((status) => {
              const missingTasks: string[] = []
              if (!status.hasCheckedIn) missingTasks.push("le check-in")
              if (!status.hasUpdatedStock) missingTasks.push("l'inventaire")
              const allDone = status.hasCheckedIn && status.hasUpdatedStock
              const employeeName = `${status.employee.first_name || ''} ${status.employee.last_name || ''}`.trim() || 'Employé'

              return (
                <div 
                  key={status.employee.id} 
                  className={`flex items-center justify-between p-4 rounded-xl transition-colors ${
                    allDone 
                      ? 'bg-accent/10 border border-accent/20' 
                      : 'bg-secondary/30 border border-orange-500/20'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                      allDone ? 'bg-accent/20' : 'bg-orange-500/20'
                    }`}>
                      {allDone ? (
                        <CheckCircle className="h-6 w-6 text-accent" />
                      ) : (
                        <AlertTriangle className="h-6 w-6 text-orange-500" />
                      )}
                    </div>

                    {/* Infos */}
                    <div>
                      <p className="font-semibold text-foreground">{employeeName}</p>
                      <div className="flex items-center gap-4 mt-1">
                        {/* Check-in status */}
                        <div className={`flex items-center gap-1 text-xs ${
                          status.hasCheckedIn ? 'text-accent' : 'text-orange-500'
                        }`}>
                          {status.hasCheckedIn ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                          Check-in
                        </div>

                        {/* Stock status */}
                        <div className={`flex items-center gap-1 text-xs ${
                          status.hasUpdatedStock ? 'text-accent' : 'text-orange-500'
                        }`}>
                          {status.hasUpdatedStock ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                          Inventaire
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    {allDone ? (
                      <span className="badge-green flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Complété
                      </span>
                    ) : (
                      <>
                        {alertSent[status.employee.id] ? (
                          <span className="text-sm text-accent flex items-center gap-1">
                            <Check className="h-4 w-4" />
                            Alerte envoyée
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-orange-500/50 text-orange-500 hover:bg-orange-500/10"
                            onClick={() => sendAlert(status.employee.id, employeeName, missingTasks)}
                            disabled={sendingAlert === status.employee.id}
                          >
                            {sendingAlert === status.employee.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Bell className="h-4 w-4 mr-1" />
                                Rappeler
                              </>
                            )}
                          </Button>
                        )}
                        <span className="badge-orange flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          En attente
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="banking-card p-5 mt-5 bg-secondary/20 animate-fade-up delay-3">
        <div className="flex items-start gap-3">
          <Bell className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <h3 className="font-semibold text-foreground mb-1">Comment ça marche ?</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>Check-in</strong> : L'employé doit faire un contrôle de service dans l'app</li>
              <li>• <strong>Inventaire</strong> : L'employé doit mettre à jour le stock au moins une fois</li>
              <li>• <strong>Rappeler</strong> : Envoie une notification à l'employé pour lui rappeler ses tâches</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
