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
  Trash2,
  X,
  AlertTriangle,
  MoreVertical,
  UserMinus,
  RefreshCw,
  Sparkles,
} from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { AIAssistant } from "@/components/ai-assistant/AIAssistant"

interface TeamMember {
  id: string
  first_name: string | null
  last_name: string | null
  role: string
  is_active: boolean
  avatar_url?: string | null
  created_at: string
  email?: string | null
  is_online?: boolean
  last_seen?: string
}

export default function ManagerTeamPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterRole, setFilterRole] = useState<"all" | "employee" | "manager">("all")
  const [establishment, setEstablishment] = useState<{ name: string } | null>(null)
  const [currentEstablishmentId, setCurrentEstablishmentId] = useState<string | null>(null)
  
  // États pour la suppression
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)
  const [removeError, setRemoveError] = useState<string | null>(null)
  
  // Assistant IA
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false)

  // Fonction pour charger les membres avec leur statut de présence
  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/presence')
      const data = await response.json()

      if (response.ok && data.members) {
        // Filtrer pour exclure l'utilisateur actuel
        const { data: { user } } = await supabase.auth.getUser()
        const filteredMembers = data.members.filter((m: TeamMember) => m.id !== user?.id)
        console.log('Membres chargés:', filteredMembers.length)
        setTeamMembers(filteredMembers)
      }
    } catch (err) {
      console.error('Erreur:', err)
    }
  }

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

        if (!profile?.establishment_id) {
          console.log('Manager sans établissement')
          setLoading(false)
          return
        }

        setCurrentEstablishmentId(profile.establishment_id)

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

        // Récupérer les membres avec leur statut de présence
        await fetchMembers()
      } catch (err) {
        console.error('Erreur:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Rafraîchir les statuts de présence toutes les 10 secondes
    const presenceInterval = setInterval(() => {
      fetchMembers()
    }, 10000)

    return () => clearInterval(presenceInterval)
  }, [supabase])

  // Fonction pour retirer un membre de l'établissement via l'API
  const handleRemoveMember = async () => {
    if (!memberToRemove) return
    
    setIsRemoving(true)
    setRemoveError(null)
    
    const memberIdToRemove = memberToRemove.id
    
    try {
      console.log('🔄 Tentative de suppression du membre via API:', memberIdToRemove)
      
      // Appeler l'API qui utilise le client admin (bypass RLS)
      const response = await fetch('/api/team/remove-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: memberIdToRemove })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        console.error('❌ Erreur API:', result.error)
        throw new Error(result.error || 'Erreur lors de la suppression')
      }
      
      console.log('✅ Membre retiré avec succès:', result)
      
      // Mettre à jour la liste locale
      setTeamMembers(prev => {
        const newList = prev.filter(m => m.id !== memberIdToRemove)
        console.log('Liste mise à jour:', newList.length, 'membres restants')
        return newList
      })
      
      setMemberToRemove(null)
      
    } catch (err) {
      console.error('Erreur lors de la suppression:', err)
      setRemoveError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setIsRemoving(false)
    }
  }

  // Fonction pour rafraîchir manuellement la liste
  const handleRefresh = async () => {
    await fetchMembers()
  }

  // Filtrer les membres
  const filteredMembers = teamMembers.filter(member => {
    const fullName = `${member.first_name || ''} ${member.last_name || ''}`.toLowerCase()
    const matchesSearch = fullName.includes(searchQuery.toLowerCase())
    const matchesRole = filterRole === "all" || member.role === filterRole
    return matchesSearch && matchesRole
  })

  const onlineCount = teamMembers.filter(m => m.is_online).length
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
      <div className="glass-animate-fade-up flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100 tracking-tight glass-title-black">
            Mon <span className="glow-cyan">Équipe</span>
          </h1>
          <p className="text-sm text-slate-400 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-orange-400" />
            {establishment?.name || 'Mon établissement'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            className="ai-trigger-btn"
            onClick={() => setIsAIAssistantOpen(true)}
          >
            <Sparkles className="h-4 w-4" />
            Assistant IA
          </button>
          <button
            onClick={handleRefresh}
            className="p-2.5 rounded-xl bg-slate-800/50 border border-white/10 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-cyan-500/10 transition-all"
            title="Rafraîchir la liste"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
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
          <p className="glass-stat-value glass-stat-value-green glass-title-black">{onlineCount}</p>
          <p className="glass-stat-label">
            <span className="glow-green">En ligne</span>
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
                      
                      {/* Indicateur de présence en ligne */}
                      <div 
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${member.is_online ? 'animate-pulse' : ''}`}
                        style={{
                          background: member.is_online ? '#22c55e' : '#64748b',
                          border: '2px solid #0f172a',
                        }}
                        title={member.is_online ? 'En ligne' : 'Hors ligne'}
                      />
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
                          className="text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1"
                          style={{
                            background: member.is_online 
                              ? 'rgba(34, 197, 94, 0.15)' 
                              : 'rgba(100, 116, 139, 0.15)',
                            color: member.is_online ? '#4ade80' : '#94a3b8',
                            border: member.is_online
                              ? '1px solid rgba(34, 197, 94, 0.3)'
                              : '1px solid rgba(100, 116, 139, 0.3)',
                          }}
                        >
                          <span 
                            className={`w-1.5 h-1.5 rounded-full ${member.is_online ? 'bg-green-400 animate-pulse' : 'bg-slate-400'}`}
                          />
                          {member.is_online ? 'En ligne' : 'Hors ligne'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                        <Calendar className="h-3 w-3" />
                        <span>Depuis {formatDate(member.created_at)}</span>
                      </div>
                    </div>

                    {/* Bouton supprimer */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setMemberToRemove(member)
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40"
                      title="Retirer de l'équipe"
                    >
                      <UserMinus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* AI Assistant */}
      <AIAssistant
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        mode="team"
      />

      {/* Modal de confirmation de suppression */}
      {memberToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !isRemoving && setMemberToRemove(null)}
          />
          
          {/* Modal */}
          <div 
            className="relative w-full max-w-md rounded-2xl p-6 animate-in zoom-in-95 duration-200"
            style={{
              background: 'linear-gradient(145deg, rgba(20, 27, 45, 0.98) 0%, rgba(15, 20, 35, 0.99) 100%)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 100px rgba(239, 68, 68, 0.1)',
            }}
          >
            {/* Bouton fermer */}
            <button
              onClick={() => !isRemoving && setMemberToRemove(null)}
              disabled={isRemoving}
              className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800/50 border border-white/10 text-slate-400 hover:text-white hover:bg-slate-800 transition-all disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Icône d'alerte */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </div>
            </div>

            {/* Titre */}
            <h3 className="text-xl font-bold text-white text-center mb-2">
              Retirer ce membre ?
            </h3>

            {/* Description */}
            <p className="text-slate-400 text-center mb-4">
              Vous êtes sur le point de retirer{' '}
              <span className="text-white font-semibold">
                {memberToRemove.first_name} {memberToRemove.last_name}
              </span>{' '}
              de votre établissement.
            </p>

            {/* Info sur les conséquences */}
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6">
              <p className="text-sm text-red-300 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  Cette personne sera <strong>immédiatement déconnectée</strong> de l'établissement 
                  et ne pourra plus y accéder. Elle devra être ré-invitée pour rejoindre à nouveau l'équipe.
                </span>
              </p>
            </div>

            {/* Erreur */}
            {removeError && (
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 mb-4">
                <p className="text-sm text-red-400">{removeError}</p>
              </div>
            )}

            {/* Boutons */}
            <div className="flex gap-3">
              <button
                onClick={() => setMemberToRemove(null)}
                disabled={isRemoving}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-800/50 border border-white/10 text-slate-300 font-medium hover:bg-slate-800 transition-all disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleRemoveMember}
                disabled={isRemoving}
                className="flex-1 py-3 px-4 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isRemoving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Suppression...
                  </>
                ) : (
                  <>
                    <UserMinus className="h-4 w-4" />
                    Retirer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

