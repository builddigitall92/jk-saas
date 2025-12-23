"use client"

import { useState, useEffect } from "react"
import { Flame, Boxes, BellRing, ClipboardCheck, Clock, ChevronRight, Loader2, X, Bell, Sparkles, Building2, MapPin, Home, Settings, Menu, LayoutDashboard, Camera, User, Package, Check, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/utils/supabase/client"
import { useAlerts } from "@/lib/hooks/use-alerts"

interface TaskStatus {
  checkInDone: boolean
  stockUpdated: boolean
  loading: boolean
}

interface UserProfile {
  first_name: string
  last_name: string
  role: string
  avatar_url?: string
}

interface Establishment {
  name: string
  address: string
}

const modules = [
  {
    title: "Gaspillage",
    description: "Déclarer les pertes et réduire le gâchis",
    icon: Flame,
    href: "/employee/waste",
    gradient: "from-rose-500 via-red-500 to-orange-500",
    glow: "shadow-[0_0_30px_rgba(244,63,94,0.4)]"
  },
  {
    title: "Stock",
    description: "Mettre à jour l'inventaire en temps réel",
    icon: Boxes,
    href: "/employee/stock-update",
    gradient: "from-orange-400 via-amber-500 to-yellow-500",
    glow: "shadow-[0_0_30px_rgba(251,146,60,0.4)]"
  },
  {
    title: "Alertes",
    description: "Consulter les notifications importantes",
    icon: BellRing,
    href: "/employee/alerts",
    gradient: "from-amber-400 via-yellow-500 to-lime-500",
    glow: "shadow-[0_0_30px_rgba(250,204,21,0.4)]"
  },
  {
    title: "Check-in",
    description: "Valider le contrôle du service",
    icon: ClipboardCheck,
    href: "/employee/service-check",
    gradient: "from-emerald-400 via-green-500 to-teal-500",
    glow: "shadow-[0_0_30px_rgba(34,197,94,0.4)]"
  },
]

const sidebarItems = [
  { title: "Tableau de bord", icon: LayoutDashboard, href: "/employee", active: true },
  { title: "Stock", icon: Boxes, href: "/employee/stock-update" },
  { title: "Gaspillage", icon: Flame, href: "/employee/waste" },
  { title: "Alertes", icon: BellRing, href: "/employee/alerts" },
  { title: "Check-in", icon: ClipboardCheck, href: "/employee/service-check" },
]

export default function EmployeePage() {
  const supabase = createClient()
  const { unreadCount } = useAlerts()
  const [status, setStatus] = useState<TaskStatus>({
    checkInDone: false,
    stockUpdated: false,
    loading: true
  })
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [establishment, setEstablishment] = useState<Establishment | null>(null)
  const [showWelcome, setShowWelcome] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? "Bonjour" : currentHour < 18 ? "Bon après-midi" : "Bonsoir"
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })

  // Obtenir les initiales
  const getInitials = () => {
    if (!userProfile) return "?"
    const first = userProfile.first_name?.charAt(0) || ""
    const last = userProfile.last_name?.charAt(0) || ""
    return (first + last).toUpperCase() || "?"
  }

  // Vérifier si c'est la première visite de la session
  useEffect(() => {
    const hasSeenWelcome = sessionStorage.getItem('employee_welcome_shown')
    if (!hasSeenWelcome) {
      setShowWelcome(true)
      sessionStorage.setItem('employee_welcome_shown', 'true')
    }
  }, [])

  // Récupérer le profil utilisateur et l'établissement
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profile } = await (supabase as any)
          .from('profiles')
          .select('first_name, last_name, role, establishment_id, avatar_url')
          .eq('id', user.id)
          .single()

        if (profile) {
          setUserProfile(profile)

          // Récupérer l'établissement
          if (profile.establishment_id) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: estab } = await (supabase as any)
              .from('establishments')
              .select('name, address')
              .eq('id', profile.establishment_id)
              .single()

            if (estab) {
              setEstablishment(estab)
            }
          }
        }
      } catch (err) {
        console.error('Erreur profil:', err)
      }
    }

    fetchData()
  }, [])

  // Vérifier le statut des tâches du jour
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const today = new Date().toISOString().split('T')[0]

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: checkIn } = await (supabase as any)
          .from('service_checks')
          .select('id')
          .eq('performed_by', user.id)
          .eq('check_date', today)
          .limit(1)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: stockUpdate } = await (supabase as any)
          .from('stock')
          .select('id')
          .eq('added_by', user.id)
          .gte('created_at', `${today}T00:00:00`)
          .limit(1)

        setStatus({
          checkInDone: checkIn && checkIn.length > 0,
          stockUpdated: stockUpdate && stockUpdate.length > 0,
          loading: false
        })
      } catch (err) {
        console.error('Erreur:', err)
        setStatus(prev => ({ ...prev, loading: false }))
      }
    }

    fetchStatus()
  }, [])

  const allTasksDone = status.checkInDone && status.stockUpdated
  const userName = userProfile?.first_name || "Employé"
  const fullName = userProfile ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() : "Employé"
  const tasksCompleted = (status.checkInDone ? 1 : 0) + (status.stockUpdated ? 1 : 0)

  return (
    <div className="min-h-screen bg-background flex relative overflow-hidden">
      {/* Animated Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/8 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-primary/8 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Popup de bienvenue - uniquement à la connexion */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
          <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-3xl p-8 max-w-md mx-4 text-center shadow-2xl shadow-orange-500/10">
            <div className="relative h-20 w-20 rounded-full mx-auto mb-5 shadow-xl shadow-orange-500/30">
              {userProfile?.avatar_url ? (
                <Image src={userProfile.avatar_url} alt="Avatar" fill className="rounded-full object-cover" />
              ) : (
                <div className="h-full w-full rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <span className="text-2xl font-black text-white">{getInitials()}</span>
                </div>
              )}
            </div>
            <h2 className="text-2xl font-black text-foreground mb-2" style={{ fontFamily: 'var(--font-sf-pro)' }}>
              {greeting}, {userName} ! 👋
            </h2>
            <p className="text-muted-foreground mb-2 capitalize">{currentDate}</p>
            {establishment && <p className="text-primary font-bold mb-4">{establishment.name}</p>}
            <div className="flex items-center justify-center gap-2 mb-5">
              <Sparkles className="h-4 w-4 text-orange-500 animate-pulse" />
              <span className="text-orange-500 font-bold text-sm">
                {allTasksDone ? "Toutes les tâches sont faites !" : `${tasksCompleted}/2 tâches complétées`}
              </span>
            </div>
            <button
              onClick={() => setShowWelcome(false)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 via-red-500 to-rose-500 text-white font-black hover:scale-[1.02] hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300"
              style={{ fontFamily: 'var(--font-sf-pro)' }}
            >
              C'est parti ! 🚀
            </button>
          </div>
        </div>
      )}

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="h-10 w-10 rounded-xl bg-secondary/80 flex items-center justify-center">
            <Menu className="h-5 w-5 text-foreground" />
          </button>
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <Package className="h-4 w-4 text-white" />
          </div>
          <span className="font-black text-foreground text-sm" style={{ fontFamily: 'var(--font-sf-pro)' }}>StockGuard</span>
        </div>
        {unreadCount > 0 && (
          <Link href="/employee/alerts">
            <div className="relative">
              <div className="h-9 w-9 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Bell className="h-4 w-4 text-orange-500" />
              </div>
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            </div>
          </Link>
        )}
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && <div className="lg:hidden fixed inset-0 z-40 bg-black/60" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar - Compact */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-56 bg-card/95 backdrop-blur-xl border-r border-border/50 flex flex-col transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-black text-foreground text-sm" style={{ fontFamily: 'var(--font-sf-pro)' }}>StockGuard</h1>
                <p className="text-[10px] text-muted-foreground">Espace Employé</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden h-7 w-7 rounded-lg bg-secondary/80 flex items-center justify-center">
              <X className="h-4 w-4 text-foreground" />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-3">
          <ul className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link href={item.href} onClick={() => setSidebarOpen(false)}>
                    <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all ${item.active ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-secondary/80 hover:text-foreground'}`}>
                      <Icon className="h-4 w-4" />
                      <span className="font-semibold text-sm">{item.title}</span>
                      {item.title === "Alertes" && unreadCount > 0 && (
                        <span className="ml-auto h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{unreadCount}</span>
                      )}
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="p-3 border-t border-border/50">
          <Link href="/employee/settings" onClick={() => setSidebarOpen(false)}>
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-all">
              <Settings className="h-4 w-4" />
              <span className="font-semibold text-sm">Paramètres</span>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row pt-14 lg:pt-0 min-h-screen">
        {/* Centre - Contenu principal */}
        <div className="flex-1 p-4 lg:p-6 overflow-auto">
          {/* Welcome Header */}
          <div className="mb-5">
            <h1 className="text-2xl lg:text-3xl font-black text-foreground" style={{ fontFamily: 'var(--font-sf-pro)' }}>
              Bienvenue, {userName} !
            </h1>
            <p className="text-muted-foreground capitalize text-sm">{currentDate}</p>
          </div>

          {/* Stats Cards Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            {modules.map((module) => {
              const Icon = module.icon
              const showBadge = module.title === "Alertes" && unreadCount > 0
              const isCompleted = (module.title === "Check-in" && status.checkInDone) || (module.title === "Stock" && status.stockUpdated)

              return (
                <Link key={module.href} href={module.href}>
                  <div className={`relative bg-card/90 border border-border/50 rounded-2xl p-4 group cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300 ${isCompleted ? 'ring-1 ring-green-500/50' : ''}`}>
                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${module.gradient} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <p className="font-black text-foreground text-sm" style={{ fontFamily: 'var(--font-sf-pro)' }}>{module.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{module.description}</p>
                    {isCompleted && (
                      <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                    {showBadge && (
                      <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center animate-pulse">
                        <span className="text-[10px] font-bold text-white">{unreadCount}</span>
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Tâches du jour */}
            <div className="bg-card/90 border border-border/50 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-foreground" style={{ fontFamily: 'var(--font-sf-pro)' }}>Tâches du jour</h3>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${allTasksDone ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                  {tasksCompleted}/2
                </span>
              </div>

              {status.loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className={`flex items-center gap-3 p-3 rounded-xl border ${status.checkInDone ? 'bg-green-500/10 border-green-500/30' : 'bg-orange-500/10 border-orange-500/30'}`}>
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${status.checkInDone ? 'bg-green-500/20' : 'bg-orange-500/20'}`}>
                      {status.checkInDone ? <CheckCircle2 className="h-5 w-5 text-green-400" /> : <X className="h-5 w-5 text-orange-400" />}
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm">Check-in service</p>
                      <p className="text-xs text-muted-foreground">{status.checkInDone ? '✓ Complété' : 'À faire'}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-3 p-3 rounded-xl border ${status.stockUpdated ? 'bg-green-500/10 border-green-500/30' : 'bg-orange-500/10 border-orange-500/30'}`}>
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${status.stockUpdated ? 'bg-green-500/20' : 'bg-orange-500/20'}`}>
                      {status.stockUpdated ? <CheckCircle2 className="h-5 w-5 text-green-400" /> : <X className="h-5 w-5 text-orange-400" />}
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm">Mise à jour inventaire</p>
                      <p className="text-xs text-muted-foreground">{status.stockUpdated ? '✓ Complété' : 'À faire'}</p>
                    </div>
                  </div>
                </div>
              )}

              {allTasksDone && (
                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-center">
                  <p className="text-green-400 font-bold text-sm">🎉 Excellent travail !</p>
                </div>
              )}
            </div>

            {/* Prévision & Infos */}
            <div className="space-y-4">
              {/* Prévision */}
              <div className="bg-gradient-to-r from-primary/15 to-primary/5 border border-primary/30 rounded-2xl p-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Prévision du service</p>
                  <p className="font-black text-foreground" style={{ fontFamily: 'var(--font-sf-pro)' }}>Affluence normale prévue</p>
                </div>
              </div>

              {/* Infos entreprise */}
              <div className="bg-card/90 border border-border/50 rounded-2xl p-4">
                <h3 className="font-black text-foreground mb-3" style={{ fontFamily: 'var(--font-sf-pro)' }}>Mon établissement</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl">
                    <div className="h-9 w-9 rounded-lg bg-primary/15 flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground">Entreprise</p>
                      <p className="font-bold text-foreground text-sm truncate">{establishment?.name || 'Non défini'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl">
                    <div className="h-9 w-9 rounded-lg bg-primary/15 flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground">Adresse</p>
                      <p className="font-medium text-foreground text-sm truncate">{establishment?.address || 'Non définie'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panneau droit - Résumé */}
        <aside className="hidden lg:flex flex-col w-64 bg-card/90 border-l border-border/50 p-4">
          {/* Profil */}
          <div className="flex items-center gap-3 mb-5">
            <div className="relative h-12 w-12 rounded-xl overflow-hidden shadow-lg shadow-orange-500/20">
              {userProfile?.avatar_url ? (
                <Image src={userProfile.avatar_url} alt="Avatar" fill className="object-cover" />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <span className="text-lg font-black text-white">{getInitials()}</span>
                </div>
              )}
            </div>
            <div>
              <h3 className="font-black text-foreground text-sm" style={{ fontFamily: 'var(--font-sf-pro)' }}>{fullName}</h3>
              <p className="text-xs text-muted-foreground capitalize">{userProfile?.role || 'Employé'}</p>
            </div>
          </div>

          {/* Résumé */}
          <div className="flex-1">
            <h4 className="font-black text-foreground mb-3 text-sm" style={{ fontFamily: 'var(--font-sf-pro)' }}>Résumé du jour</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                <span className="text-xs text-muted-foreground">Tâches</span>
                <span className="font-black text-foreground text-sm">{tasksCompleted}/2</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                <span className="text-xs text-muted-foreground">Alertes</span>
                <span className={`font-black text-sm ${unreadCount > 0 ? 'text-orange-400' : 'text-foreground'}`}>{unreadCount}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                <span className="text-xs text-muted-foreground">Statut</span>
                <span className={`font-black text-sm ${allTasksDone ? 'text-green-400' : 'text-orange-400'}`}>{allTasksDone ? 'Prêt' : 'En cours'}</span>
              </div>
            </div>
          </div>

          {/* Heure */}
          <div className="mt-4 p-4 bg-gradient-to-br from-primary/15 to-primary/5 rounded-2xl text-center">
            <p className="text-[10px] text-muted-foreground mb-1">Heure actuelle</p>
            <p className="text-3xl font-black text-foreground" style={{ fontFamily: 'var(--font-sf-pro)' }}>
              {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
