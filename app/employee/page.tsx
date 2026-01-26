"use client"

import { useState, useEffect } from "react"
import { 
  Flame, 
  Boxes, 
  BellRing, 
  ClipboardCheck, 
  Clock, 
  Loader2, 
  X, 
  Sparkles, 
  Building2, 
  MapPin, 
  CheckCircle2,
  TrendingUp,
  Calendar,
  Target,
  Zap,
  ShoppingBag,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/utils/supabase/client"
import { useNotifications } from "@/lib/hooks/use-notifications"

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

// Composant GlassTile adapté
function GlassTile({ 
  children, 
  className = "", 
  animationDelay = 0,
  href,
  onClick,
}: { 
  children: React.ReactNode
  className?: string
  animationDelay?: number
  href?: string
  onClick?: () => void
}) {
  const baseStyles: React.CSSProperties = {
    position: "relative",
    background: "linear-gradient(145deg, rgba(20, 27, 45, 0.92) 0%, rgba(15, 20, 35, 0.95) 50%, rgba(12, 17, 30, 0.98) 100%)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid rgba(100, 130, 180, 0.15)",
    borderRadius: "20px",
    padding: "24px",
    overflow: "hidden",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 4px 24px rgba(0, 0, 0, 0.25), 0 1px 3px rgba(0, 0, 0, 0.15)",
    animation: `glassEnter 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${animationDelay}s forwards`,
    opacity: 0,
  }

  const content = (
    <>
      {/* Reflet diagonal */}
      <div 
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "50%",
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(120, 160, 220, 0.04) 30%, transparent 60%)",
          pointerEvents: "none",
          borderRadius: "20px 20px 0 0",
        }}
      />
      
      {/* Ligne lumineuse */}
      <div 
        style={{
          position: "absolute",
          top: 0,
          left: "20px",
          right: "20px",
          height: "1px",
          background: "linear-gradient(90deg, transparent 0%, rgba(251, 146, 60, 0.3) 20%, rgba(255, 180, 120, 0.4) 50%, rgba(251, 146, 60, 0.3) 80%, transparent 100%)",
          pointerEvents: "none",
        }}
      />
      
      {/* Contenu */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {children}
      </div>
    </>
  )

  if (href) {
    return (
      <Link 
        href={href} 
        className={`group block hover:translate-y-[-3px] hover:border-[rgba(251,146,60,0.35)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.35),0_0_30px_rgba(251,146,60,0.08)] ${className}`}
        style={baseStyles}
      >
        {content}
      </Link>
    )
  }

  if (onClick) {
    return (
      <button 
        onClick={onClick}
        className={`group block w-full text-left hover:translate-y-[-3px] hover:border-[rgba(251,146,60,0.35)] ${className}`}
        style={baseStyles}
      >
        {content}
      </button>
    )
  }

  return (
    <div 
      className={`group hover:translate-y-[-3px] hover:border-[rgba(251,146,60,0.35)] ${className}`}
      style={baseStyles}
    >
      {content}
    </div>
  )
}

// Icône colorée
function TileIcon({ Icon, color }: { Icon: React.ElementType; color: string }) {
  const colors: Record<string, { bg: string; border: string; text: string }> = {
    blue: { bg: "linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.15) 100%)", border: "rgba(59, 130, 246, 0.3)", text: "#60a5fa" },
    green: { bg: "linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.15) 100%)", border: "rgba(34, 197, 94, 0.3)", text: "#4ade80" },
    orange: { bg: "linear-gradient(135deg, rgba(251, 146, 60, 0.2) 0%, rgba(234, 88, 12, 0.15) 100%)", border: "rgba(251, 146, 60, 0.3)", text: "#fb923c" },
    red: { bg: "linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.15) 100%)", border: "rgba(239, 68, 68, 0.3)", text: "#f87171" },
    purple: { bg: "linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(139, 92, 246, 0.15) 100%)", border: "rgba(168, 85, 247, 0.3)", text: "#a78bfa" },
    cyan: { bg: "linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(8, 145, 178, 0.15) 100%)", border: "rgba(6, 182, 212, 0.3)", text: "#22d3ee" },
    pink: { bg: "linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(219, 39, 119, 0.15) 100%)", border: "rgba(236, 72, 153, 0.3)", text: "#f472b6" },
    amber: { bg: "linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.15) 100%)", border: "rgba(245, 158, 11, 0.3)", text: "#fbbf24" },
  }
  const c = colors[color] || colors.orange
  
  return (
    <div style={{
      width: "44px",
      height: "44px",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "16px",
      background: c.bg,
      border: `1px solid ${c.border}`,
      color: c.text,
      transition: "all 0.3s ease",
    }} className="group-hover:scale-110">
      <Icon className="w-5 h-5" />
    </div>
  )
}

// Titre coloré
function TileTitle({ children, color }: { children: React.ReactNode; color: string }) {
  const colors: Record<string, string> = {
    blue: "#60a5fa",
    green: "#4ade80",
    orange: "#fb923c",
    red: "#f87171",
    purple: "#a78bfa",
    cyan: "#22d3ee",
    pink: "#f472b6",
    amber: "#fbbf24",
    white: "#f1f5f9",
  }
  
  return (
    <h3 style={{
      fontSize: "17px",
      fontWeight: 600,
      marginBottom: "8px",
      letterSpacing: "-0.01em",
      color: colors[color] || colors.orange,
    }}>
      {children}
    </h3>
  )
}

// Mot clé coloré
function K({ children, c }: { children: React.ReactNode; c: string }) {
  const colors: Record<string, string> = {
    b: "#60a5fa",
    g: "#4ade80",
    o: "#fb923c",
    r: "#f87171",
    p: "#a78bfa",
    c: "#22d3ee",
    pk: "#f472b6",
    a: "#fbbf24",
  }
  
  return (
    <span 
      className="group-hover:drop-shadow-[0_0_8px_currentColor] transition-all duration-300"
      style={{ color: colors[c] || colors.o, fontWeight: 500 }}
    >
      {children}
    </span>
  )
}

const modules = [
  {
    id: "ventes",
    title: "Ventes",
    description: <>Enregistrer les <K c="g">ventes</K> et suivre le <K c="o">chiffre d'affaires</K>.</>,
    icon: ShoppingBag,
    iconColor: "green",
    titleColor: "green",
    href: "/employee/ventes",
  },
  {
    id: "waste",
    title: "Gaspillage",
    description: <>Déclarer les <K c="r">pertes</K> et réduire le <K c="o">gâchis</K> quotidien.</>,
    icon: Flame,
    iconColor: "red",
    titleColor: "red",
    href: "/employee/waste",
  },
  {
    id: "stock",
    title: "Stock",
    description: <>Mettre à jour l'<K c="c">inventaire</K> en <K c="g">temps réel</K>.</>,
    icon: Boxes,
    iconColor: "cyan",
    titleColor: "cyan",
    href: "/employee/stock",
  },
  {
    id: "alerts",
    title: "Alertes",
    description: <>Consulter les <K c="o">notifications</K> importantes.</>,
    icon: BellRing,
    iconColor: "amber",
    titleColor: "amber",
    href: "/employee/alerts",
    hasBadge: true,
  },
  {
    id: "checkin",
    title: "Check-in",
    description: <>Valider le <K c="g">contrôle</K> du service.</>,
    icon: ClipboardCheck,
    iconColor: "green",
    titleColor: "green",
    href: "/employee/service-check",
  },
]

export default function EmployeePage() {
  const supabase = createClient()
  const { unreadCount } = useNotifications()
  const [status, setStatus] = useState<TaskStatus>({
    checkInDone: false,
    stockUpdated: false,
    loading: true
  })
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [establishment, setEstablishment] = useState<Establishment | null>(null)
  const [showWelcome, setShowWelcome] = useState(false)

  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? "Bonjour" : currentHour < 18 ? "Bon après-midi" : "Bonsoir"
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })
  const currentTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

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

        // Check-in : id + inventory_done pour "Mise à jour inventaire"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: checkIn } = await (supabase as any)
          .from('service_checks')
          .select('id, inventory_done')
          .eq('performed_by', user.id)
          .eq('check_date', today)
          .limit(1)

        // Mise à jour stock : soit entrée dans stock aujourd'hui, soit inventaire fait au check-in
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: stockUpdate } = await (supabase as any)
          .from('stock')
          .select('id')
          .eq('added_by', user.id)
          .gte('created_at', `${today}T00:00:00`)
          .limit(1)

        const hasCheckIn = checkIn && checkIn.length > 0
        const inventoryDoneInCheckIn = hasCheckIn && (checkIn[0]?.inventory_done === true)
        const hasStockUpdate = stockUpdate && stockUpdate.length > 0

        setStatus({
          checkInDone: hasCheckIn,
          stockUpdated: hasStockUpdate || inventoryDoneInCheckIn,
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
    <>
      <style jsx global>{`
        @keyframes glassEnter {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

      {/* Popup de bienvenue - uniquement à la connexion - 100% responsive */}
      {showWelcome && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 sm:p-6">
          <div 
            className="relative w-full max-w-[calc(100vw-32px)] sm:max-w-md mx-auto text-center overflow-hidden"
            style={{
              background: "linear-gradient(145deg, rgba(20, 27, 45, 0.98) 0%, rgba(15, 20, 35, 0.99) 100%)",
              border: "1px solid rgba(251, 146, 60, 0.2)",
              borderRadius: "20px",
              padding: "clamp(20px, 5vw, 32px)",
              boxShadow: "0 25px 50px rgba(0, 0, 0, 0.5), 0 0 40px rgba(251, 146, 60, 0.1)",
            }}
          >
            {/* Glow effect */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-red-500/20 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <div className="relative h-20 w-20 rounded-2xl mx-auto mb-5 shadow-xl shadow-orange-500/30">
                {userProfile?.avatar_url ? (
                  <Image src={userProfile.avatar_url} alt="Avatar" fill className="rounded-2xl object-cover" />
                ) : (
                  <div className="h-full w-full rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                    <span className="text-2xl font-black text-white">{getInitials()}</span>
                  </div>
                )}
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">
                {greeting}, {userName} ! 👋
              </h2>
              <p className="text-slate-400 mb-2 capitalize">{currentDate}</p>
              {establishment && <p className="text-orange-400 font-semibold mb-4">{establishment.name}</p>}
              
              <div className="flex items-center justify-center gap-2 mb-6">
                <Sparkles className="h-4 w-4 text-orange-500 animate-pulse" />
                <span className="text-orange-400 font-semibold text-sm">
                  {allTasksDone ? "Toutes les tâches sont faites !" : `${tasksCompleted}/2 tâches complétées`}
                </span>
              </div>
              
              <button
                onClick={() => setShowWelcome(false)}
                className="w-full py-3.5 sm:py-3 rounded-xl text-white font-bold hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 min-h-[48px] text-base"
                style={{
                  background: "linear-gradient(135deg, #fb923c 0%, #ea580c 50%, #dc2626 100%)",
                  boxShadow: "0 4px 20px rgba(251, 146, 60, 0.4)",
                }}
              >
                C'est parti ! 🚀
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Header Section */}
        <div className="mb-2">
          <h1 className="text-2xl font-semibold text-slate-100 mb-1 tracking-tight">
            {greeting}, <span className="text-orange-400">{userName}</span> !
          </h1>
          <p className="text-sm text-slate-400 capitalize">{currentDate}</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <GlassTile animationDelay={0}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/10 border border-orange-500/30 flex items-center justify-center">
                <Target className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Tâches</p>
                <p className="text-2xl font-bold text-white">{tasksCompleted}/2</p>
              </div>
            </div>
          </GlassTile>
          
          <GlassTile animationDelay={0.05}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 flex items-center justify-center">
                <BellRing className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Alertes</p>
                <p className={`text-2xl font-bold ${unreadCount > 0 ? 'text-amber-400' : 'text-white'}`}>{unreadCount}</p>
              </div>
            </div>
          </GlassTile>
          
          <GlassTile animationDelay={0.1}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 border border-emerald-500/30 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Statut</p>
                <p className={`text-lg font-bold ${allTasksDone ? 'text-emerald-400' : 'text-orange-400'}`}>
                  {allTasksDone ? 'Prêt ✓' : 'En cours'}
                </p>
              </div>
            </div>
          </GlassTile>
          
          <GlassTile animationDelay={0.15}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-500/30 flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Heure</p>
                <p className="text-2xl font-bold text-white">{currentTime}</p>
              </div>
            </div>
          </GlassTile>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Modules Section */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-white mb-4">Modules</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {modules.map((module, index) => {
                const Icon = module.icon
                const isCompleted = (module.id === "checkin" && status.checkInDone) || (module.id === "stock" && status.stockUpdated)
                
                return (
                  <GlassTile key={module.id} href={module.href} animationDelay={0.2 + index * 0.05}>
                    <div className="flex items-start justify-between">
                      <TileIcon Icon={Icon} color={module.iconColor} />
                      {isCompleted && (
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        </div>
                      )}
                      {module.hasBadge && unreadCount > 0 && (
                        <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center animate-pulse">
                          <span className="text-[10px] font-bold text-white">{unreadCount}</span>
                        </div>
                      )}
                    </div>
                    <TileTitle color={module.titleColor}>{module.title}</TileTitle>
                    <p className="text-[13px] leading-relaxed text-slate-400/85">{module.description}</p>
                  </GlassTile>
                )
              })}
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-4">
            {/* Tâches du jour */}
            <GlassTile animationDelay={0.4}>
              <div className="flex items-center justify-between mb-4">
                <TileTitle color="white">Tâches du jour</TileTitle>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  allTasksDone 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                }`}>
                  {tasksCompleted}/2
                </span>
              </div>

              {status.loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-orange-400" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className={`flex items-center gap-3 p-3 rounded-xl border ${
                    status.checkInDone 
                      ? 'bg-emerald-500/10 border-emerald-500/30' 
                      : 'bg-orange-500/10 border-orange-500/30'
                  }`}>
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      status.checkInDone ? 'bg-emerald-500/20' : 'bg-orange-500/20'
                    }`}>
                      {status.checkInDone 
                        ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> 
                        : <X className="h-5 w-5 text-orange-400" />
                      }
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">Check-in service</p>
                      <p className="text-xs text-slate-400">{status.checkInDone ? '✓ Complété' : 'À faire'}</p>
                    </div>
                  </div>
                  
                  <div className={`flex items-center gap-3 p-3 rounded-xl border ${
                    status.stockUpdated 
                      ? 'bg-emerald-500/10 border-emerald-500/30' 
                      : 'bg-orange-500/10 border-orange-500/30'
                  }`}>
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      status.stockUpdated ? 'bg-emerald-500/20' : 'bg-orange-500/20'
                    }`}>
                      {status.stockUpdated 
                        ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> 
                        : <X className="h-5 w-5 text-orange-400" />
                      }
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">Mise à jour inventaire</p>
                      <p className="text-xs text-slate-400">{status.stockUpdated ? '✓ Complété' : 'À faire'}</p>
                    </div>
                  </div>
                </div>
              )}

              {allTasksDone && (
                <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center">
                  <p className="text-emerald-400 font-semibold text-sm">🎉 Excellent travail !</p>
                </div>
              )}
            </GlassTile>

            {/* Établissement */}
            <GlassTile animationDelay={0.45}>
              <TileTitle color="white">Mon établissement</TileTitle>
              <div className="space-y-3 mt-4">
                <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-xl">
                  <div className="h-9 w-9 rounded-lg bg-blue-500/15 border border-blue-500/25 flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide">Entreprise</p>
                    <p className="font-semibold text-white text-sm truncate">{establishment?.name || 'Non défini'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-xl">
                  <div className="h-9 w-9 rounded-lg bg-purple-500/15 border border-purple-500/25 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-purple-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide">Adresse</p>
                    <p className="font-medium text-slate-300 text-sm truncate">{establishment?.address || 'Non définie'}</p>
                  </div>
                </div>
              </div>
            </GlassTile>
          </div>
        </div>

        {/* Conseil du Jour */}
        <GlassTile animationDelay={0.5}>
          <div className="flex items-start gap-4">
            <TileIcon Icon={Zap} color="cyan" />
            <div>
              <TileTitle color="white">Conseil du Jour</TileTitle>
              <p className="text-[13px] leading-relaxed text-slate-400/85">
                Pensez à effectuer votre <K c="g">check-in</K> dès votre arrivée. 
                Une mise à jour régulière du <K c="c">stock</K> permet d'éviter les 
                <K c="r"> ruptures</K> et d'optimiser les <K c="o">commandes</K>.
              </p>
            </div>
          </div>
        </GlassTile>
      </div>
    </>
  )
}
