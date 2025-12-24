"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
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
  avatar_url?: string | null
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

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: employeesData } = await (supabase as any)
          .from('profiles')
          .select('id, first_name, last_name, role, is_active, avatar_url')
          .eq('establishment_id', profile.establishment_id)
          .eq('role', 'employee')
          .eq('is_active', true)

        if (!employeesData) return

        const today = new Date().toISOString().split('T')[0]

        const employeeStatuses: EmployeeStatus[] = await Promise.all(
          employeesData.map(async (emp: Employee) => {
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

  const totalEmployees = employees.length
  const checkedInCount = employees.filter(e => e.hasCheckedIn).length
  const stockUpdatedCount = employees.filter(e => e.hasUpdatedStock).length
  const allTasksDone = employees.filter(e => e.hasCheckedIn && e.hasUpdatedStock).length

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-pink-400" />
          </div>
          <p className="text-slate-400 text-sm">Chargement du suivi...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="glass-animate-fade-up">
        <h1 className="text-2xl font-semibold text-slate-100 tracking-tight glass-title-black">
          Suivi <span className="glow-cyan">Employés</span>
        </h1>
        <p className="text-sm text-slate-400">
          <span className="glow-blue">Check-in</span> et <span className="glow-purple">inventaire</span> quotidien
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-stat-card glass-animate-fade-up glass-stagger-1">
          <div className="glass-stat-icon glass-stat-icon-cyan">
            <Users className="h-5 w-5" />
          </div>
          <p className="glass-stat-value glass-stat-value-cyan glass-title-black">{totalEmployees}</p>
          <p className="glass-stat-label">
            <span className="glow-cyan">Employés</span> actifs
          </p>
        </div>
        <div className="glass-stat-card glass-animate-fade-up glass-stagger-2">
          <div className="glass-stat-icon glass-stat-icon-blue">
            <ClipboardCheck className="h-5 w-5" />
          </div>
          <p className="glass-stat-value glass-stat-value-blue glass-title-black">{checkedInCount}/{totalEmployees}</p>
          <p className="glass-stat-label">
            <span className="glow-blue">Check-in</span> fait
          </p>
        </div>
        <div className="glass-stat-card glass-animate-fade-up glass-stagger-3">
          <div className="glass-stat-icon glass-stat-icon-purple">
            <Package className="h-5 w-5" />
          </div>
          <p className="glass-stat-value glass-stat-value-purple glass-title-black">{stockUpdatedCount}/{totalEmployees}</p>
          <p className="glass-stat-label">
            <span className="glow-purple">Inventaire</span> fait
          </p>
        </div>
        <div className="glass-stat-card glass-animate-fade-up glass-stagger-4" style={{ borderColor: 'rgba(34, 197, 94, 0.3)' }}>
          <div className="glass-stat-icon glass-stat-icon-green">
            <CheckCircle className="h-5 w-5" />
          </div>
          <p className="glass-stat-value glass-stat-value-green glass-title-black">{allTasksDone}/{totalEmployees}</p>
          <p className="glass-stat-label">
            Tout <span className="glow-green">complété</span>
          </p>
        </div>
      </div>

      {/* Liste des employés */}
      <div className="glass-stat-card glass-animate-fade-up glass-stagger-5">
        <h2 className="font-semibold text-white mb-5 glass-title">
          Statut des <span className="glow-cyan">employés</span> aujourd'hui
        </h2>
        
        {employees.length === 0 ? (
          <div className="glass-empty-state">
            <div className="glass-empty-icon">
              <Users className="h-10 w-10" />
            </div>
            <p className="glass-empty-title">Aucun <span className="glow-cyan">employé</span></p>
            <p className="glass-empty-desc">
              Ajoutez des <span className="text-cyan-400">employés</span> dans les paramètres
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {employees.map((status, index) => {
              const missingTasks: string[] = []
              if (!status.hasCheckedIn) missingTasks.push("le check-in")
              if (!status.hasUpdatedStock) missingTasks.push("l'inventaire")
              const allDone = status.hasCheckedIn && status.hasUpdatedStock
              const employeeName = `${status.employee.first_name || ''} ${status.employee.last_name || ''}`.trim() || 'Employé'

              return (
                <div 
                  key={status.employee.id} 
                  className="flex items-center justify-between p-4 rounded-xl transition-all glass-animate-scale-in"
                  style={{
                    animationDelay: `${0.1 * index}s`,
                    background: allDone 
                      ? 'rgba(34, 197, 94, 0.08)' 
                      : 'rgba(251, 146, 60, 0.08)',
                    border: allDone 
                      ? '1px solid rgba(34, 197, 94, 0.25)' 
                      : '1px solid rgba(251, 146, 60, 0.25)',
                  }}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar avec photo de profil */}
                    <div className="relative">
                      <div 
                        className="h-12 w-12 rounded-xl overflow-hidden"
                        style={{
                          border: allDone 
                            ? '2px solid rgba(34, 197, 94, 0.5)' 
                            : '2px solid rgba(251, 146, 60, 0.5)',
                          boxShadow: allDone 
                            ? '0 0 15px rgba(34, 197, 94, 0.2)' 
                            : '0 0 15px rgba(251, 146, 60, 0.2)',
                        }}
                      >
                        {status.employee.avatar_url ? (
                          <Image 
                            src={status.employee.avatar_url} 
                            alt={employeeName}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div 
                            className="w-full h-full flex items-center justify-center text-white font-bold text-sm"
                            style={{
                              background: allDone 
                                ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.4) 0%, rgba(22, 163, 74, 0.3) 100%)' 
                                : 'linear-gradient(135deg, rgba(251, 146, 60, 0.4) 0%, rgba(234, 88, 12, 0.3) 100%)',
                            }}
                          >
                            {(status.employee.first_name?.[0] || '') + (status.employee.last_name?.[0] || '') || '?'}
                          </div>
                        )}
                      </div>
                      {/* Badge de statut */}
                      <div 
                        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{
                          background: allDone ? '#22c55e' : '#fb923c',
                          border: '2px solid #0f172a',
                        }}
                      >
                        {allDone ? (
                          <Check className="h-3 w-3 text-white" />
                        ) : (
                          <Clock className="h-3 w-3 text-white" />
                        )}
                      </div>
                    </div>

                    {/* Infos */}
                    <div>
                      <p className="font-semibold text-white glass-title">{employeeName}</p>
                      <div className="flex items-center gap-4 mt-1">
                        {/* Check-in status */}
                        <div className={`flex items-center gap-1 text-xs font-medium ${
                          status.hasCheckedIn ? 'text-green-400' : 'text-orange-400'
                        }`}>
                          {status.hasCheckedIn ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                          <span className={status.hasCheckedIn ? 'glow-green' : 'glow-orange'}>Check-in</span>
                        </div>

                        {/* Stock status */}
                        <div className={`flex items-center gap-1 text-xs font-medium ${
                          status.hasUpdatedStock ? 'text-green-400' : 'text-orange-400'
                        }`}>
                          {status.hasUpdatedStock ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                          <span className={status.hasUpdatedStock ? 'glow-green' : 'glow-orange'}>Inventaire</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    {allDone ? (
                      <span className="glass-badge-glow glass-badge-glow-green">
                        <Check className="h-3 w-3" />
                        Complété
                      </span>
                    ) : (
                      <>
                        {alertSent[status.employee.id] ? (
                          <span className="text-sm text-green-400 flex items-center gap-1">
                            <Check className="h-4 w-4" />
                            <span className="glow-green">Alerte envoyée</span>
                          </span>
                        ) : (
                          <button
                            className="glass-btn-secondary glass-btn-sm"
                            style={{
                              borderColor: 'rgba(251, 146, 60, 0.4)',
                              color: '#fb923c',
                            }}
                            onClick={() => sendAlert(status.employee.id, employeeName, missingTasks)}
                            disabled={sendingAlert === status.employee.id}
                          >
                            {sendingAlert === status.employee.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Bell className="h-4 w-4" />
                                <span className="glow-orange">Rappeler</span>
                              </>
                            )}
                          </button>
                        )}
                        <span className="glass-badge-glow glass-badge-glow-orange">
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
      <div 
        className="glass-stat-card glass-animate-fade-up glass-stagger-6"
        style={{
          background: 'linear-gradient(145deg, rgba(20, 27, 45, 0.6) 0%, rgba(30, 41, 59, 0.4) 100%)',
        }}
      >
        <div className="flex items-start gap-3">
          <div className="glass-stat-icon glass-stat-icon-pink w-10 h-10">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white mb-2 glass-title">
              Comment ça <span className="glow-pink">marche</span> ?
            </h3>
            <ul className="text-sm text-slate-400 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span><span className="glow-blue font-medium">Check-in</span> : L'employé doit faire un contrôle de service dans l'app</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span><span className="glow-purple font-medium">Inventaire</span> : L'employé doit mettre à jour le <span className="text-cyan-400">stock</span> au moins une fois</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-400 mt-0.5">•</span>
                <span><span className="glow-orange font-medium">Rappeler</span> : Envoie une <span className="text-pink-400">notification</span> à l'employé pour lui rappeler ses tâches</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
