"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { 
  Users, 
  Loader2, 
  Mail,
  Phone,
  Calendar,
  Shield,
  UserCheck,
  UserX,
  Search,
  Building2,
} from "lucide-react"
import { createClient } from "@/utils/supabase/client"

interface TeamMember {
  id: string
  first_name: string | null
  last_name: string | null
  role: string
  is_active: boolean
  avatar_url?: string | null
  created_at: string
}

export default function ManagerTeamPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterRole, setFilterRole] = useState<"all" | "employee" | "manager">("all")
  const [establishment, setEstablishment] = useState<{ name: string } | null>(null)

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

        // Récupérer l'établissement
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: estab } = await (supabase as any)
          .from('establishments')
          .select('name')
          .eq('id', profile.establishment_id)
          .single()

        if (estab) {
          setEstablishment(estab)
        }

        // Récupérer tous les membres (sauf l'utilisateur actuel)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: members } = await (supabase as any)
          .from('profiles')
          .select('id, first_name, last_name, role, is_active, avatar_url, created_at')
          .eq('establishment_id', profile.establishment_id)
          .neq('id', user.id)
          .order('created_at', { ascending: false })

        if (members) {
          setTeamMembers(members)
        }
      } catch (err) {
        console.error('Erreur:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Écouter les changements en temps réel
    const channel = supabase
      .channel('team-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
        },
        () => {
          // Refetch des données quand un profil change
          fetchData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  // Filtrer les membres
  const filteredMembers = teamMembers.filter(member => {
    const fullName = `${member.first_name || ''} ${member.last_name || ''}`.toLowerCase()
    const matchesSearch = fullName.includes(searchQuery.toLowerCase())
    const matchesRole = filterRole === "all" || member.role === filterRole
    return matchesSearch && matchesRole
  })

  const activeCount = teamMembers.filter(m => m.is_active).length
  const employeeCount = teamMembers.filter(m => m.role === 'employee').length
  const managerCount = teamMembers.filter(m => m.role === 'manager' || m.role === 'admin').length

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getInitials = (firstName: string | null, lastName: string | null) => {
    return ((firstName?.[0] || '') + (lastName?.[0] || '')).toUpperCase() || '?'
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
          </div>
          <p className="text-slate-400 text-sm">Chargement de l'équipe...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="glass-animate-fade-up">
        <h1 className="text-2xl font-semibold text-slate-100 tracking-tight glass-title-black">
          Mon <span className="glow-cyan">Équipe</span>
        </h1>
        <p className="text-sm text-slate-400 flex items-center gap-2">
          <Building2 className="h-4 w-4 text-orange-400" />
          {establishment?.name || 'Mon établissement'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-stat-card glass-animate-fade-up glass-stagger-1">
          <div className="glass-stat-icon glass-stat-icon-cyan">
            <Users className="h-5 w-5" />
          </div>
          <p className="glass-stat-value glass-stat-value-cyan glass-title-black">{teamMembers.length}</p>
          <p className="glass-stat-label">
            <span className="glow-cyan">Membres</span> total
          </p>
        </div>
        <div className="glass-stat-card glass-animate-fade-up glass-stagger-2">
          <div className="glass-stat-icon glass-stat-icon-green">
            <UserCheck className="h-5 w-5" />
          </div>
          <p className="glass-stat-value glass-stat-value-green glass-title-black">{activeCount}</p>
          <p className="glass-stat-label">
            <span className="glow-green">Actifs</span>
          </p>
        </div>
        <div className="glass-stat-card glass-animate-fade-up glass-stagger-3">
          <div className="glass-stat-icon glass-stat-icon-blue">
            <Users className="h-5 w-5" />
          </div>
          <p className="glass-stat-value glass-stat-value-blue glass-title-black">{employeeCount}</p>
          <p className="glass-stat-label">
            <span className="glow-blue">Employés</span>
          </p>
        </div>
        <div className="glass-stat-card glass-animate-fade-up glass-stagger-4">
          <div className="glass-stat-icon glass-stat-icon-purple">
            <Shield className="h-5 w-5" />
          </div>
          <p className="glass-stat-value glass-stat-value-purple glass-title-black">{managerCount}</p>
          <p className="glass-stat-label">
            <span className="glow-purple">Managers</span>
          </p>
        </div>
      </div>

      {/* Filtres */}
      <div className="glass-stat-card glass-animate-fade-up glass-stagger-5">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Recherche */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Rechercher un membre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
            />
          </div>
          
          {/* Filtre par rôle */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterRole("all")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filterRole === "all"
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:border-slate-600/50'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilterRole("employee")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filterRole === "employee"
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:border-slate-600/50'
              }`}
            >
              Employés
            </button>
            <button
              onClick={() => setFilterRole("manager")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filterRole === "manager"
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:border-slate-600/50'
              }`}
            >
              Managers
            </button>
          </div>
        </div>
      </div>

      {/* Liste des membres */}
      <div className="glass-stat-card glass-animate-fade-up glass-stagger-6">
        <h2 className="font-semibold text-white mb-5 glass-title">
          Membres de l'<span className="glow-cyan">équipe</span>
          {filteredMembers.length !== teamMembers.length && (
            <span className="text-slate-500 text-sm font-normal ml-2">
              ({filteredMembers.length} sur {teamMembers.length})
            </span>
          )}
        </h2>
        
        {filteredMembers.length === 0 ? (
          <div className="glass-empty-state">
            <div className="glass-empty-icon">
              <Users className="h-10 w-10" />
            </div>
            <p className="glass-empty-title">
              {searchQuery ? (
                <>Aucun résultat pour "<span className="glow-cyan">{searchQuery}</span>"</>
              ) : (
                <>Aucun <span className="glow-cyan">membre</span></>
              )}
            </p>
            <p className="glass-empty-desc">
              {searchQuery ? 'Essayez avec un autre terme' : 'Invitez des membres à rejoindre votre équipe'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map((member, index) => {
              const fullName = `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'Sans nom'
              const isEmployee = member.role === 'employee'
              
              return (
                <div 
                  key={member.id} 
                  className="p-4 rounded-xl transition-all glass-animate-scale-in group hover:scale-[1.02]"
                  style={{
                    animationDelay: `${0.05 * index}s`,
                    background: 'linear-gradient(145deg, rgba(20, 27, 45, 0.8) 0%, rgba(15, 20, 35, 0.9) 100%)',
                    border: '1px solid rgba(100, 130, 180, 0.15)',
                  }}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative">
                      <div 
                        className="h-16 w-16 rounded-2xl overflow-hidden transition-all group-hover:shadow-lg"
                        style={{
                          border: isEmployee 
                            ? '2px solid rgba(59, 130, 246, 0.4)' 
                            : '2px solid rgba(168, 85, 247, 0.4)',
                          boxShadow: isEmployee
                            ? '0 0 20px rgba(59, 130, 246, 0.15)'
                            : '0 0 20px rgba(168, 85, 247, 0.15)',
                        }}
                      >
                        {member.avatar_url ? (
                          <Image 
                            src={member.avatar_url} 
                            alt={fullName}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div 
                            className="w-full h-full flex items-center justify-center text-white font-bold text-xl"
                            style={{
                              background: isEmployee
                                ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.4) 0%, rgba(37, 99, 235, 0.3) 100%)'
                                : 'linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(139, 92, 246, 0.3) 100%)',
                            }}
                          >
                            {getInitials(member.first_name, member.last_name)}
                          </div>
                        )}
                      </div>
                      
                      {/* Indicateur de statut */}
                      <div 
                        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{
                          background: member.is_active ? '#22c55e' : '#ef4444',
                          border: '2px solid #0f172a',
                        }}
                      >
                        {member.is_active ? (
                          <UserCheck className="h-2.5 w-2.5 text-white" />
                        ) : (
                          <UserX className="h-2.5 w-2.5 text-white" />
                        )}
                      </div>
                    </div>

                    {/* Infos */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">{fullName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span 
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{
                            background: isEmployee 
                              ? 'rgba(59, 130, 246, 0.15)' 
                              : 'rgba(168, 85, 247, 0.15)',
                            color: isEmployee ? '#60a5fa' : '#a78bfa',
                            border: isEmployee
                              ? '1px solid rgba(59, 130, 246, 0.3)'
                              : '1px solid rgba(168, 85, 247, 0.3)',
                          }}
                        >
                          {isEmployee ? 'Employé' : 'Manager'}
                        </span>
                        <span 
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{
                            background: member.is_active 
                              ? 'rgba(34, 197, 94, 0.15)' 
                              : 'rgba(239, 68, 68, 0.15)',
                            color: member.is_active ? '#4ade80' : '#f87171',
                            border: member.is_active
                              ? '1px solid rgba(34, 197, 94, 0.3)'
                              : '1px solid rgba(239, 68, 68, 0.3)',
                          }}
                        >
                          {member.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                        <Calendar className="h-3 w-3" />
                        <span>Depuis {formatDate(member.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

