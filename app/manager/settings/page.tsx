"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Copy,
  Check,
  Building2,
  Users,
  Key,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Save,
  Package,
  Plus,
  Trash2,
  Loader2,
  X,
  ClipboardCheck,
  GripVertical,
  ThermometerSun,
  Utensils,
  CreditCard,
  Crown,
  ExternalLink,
  AlertTriangle,
  UserMinus,
  Sparkles,
  Zap,
  Shield
} from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { useAuth } from "@/lib/hooks/use-auth"
import { useSubscription } from "@/lib/hooks/use-subscription"
import { toast } from "sonner"
import Link from "next/link"

interface Establishment {
  id: string
  name: string
  code: string
  address: string | null
  phone: string | null
  email: string | null
}

interface TeamMember {
  id: string
  first_name: string | null
  last_name: string | null
  role: string
}

interface CheckItemTemplate {
  id: string
  item_code: string
  item_label: string
  icon: string
  is_active: boolean
  sort_order: number
}

const DEFAULT_CHECK_ITEMS = [
  { item_code: "stock-frites", item_label: "Stock frites suffisant", icon: "Package" },
  { item_code: "stock-pain", item_label: "Stock pain suffisant", icon: "Package" },
  { item_code: "stock-viande", item_label: "Stock viande suffisant", icon: "Package" },
  { item_code: "temp-frigo", item_label: "Température frigo OK", icon: "ThermometerSun" },
  { item_code: "proprete", item_label: "Propreté cuisine", icon: "ClipboardCheck" },
  { item_code: "materiel", item_label: "Matériel fonctionnel", icon: "Utensils" },
]

// Glass Card Component
function GlassCard({
  children,
  className = "",
  gradient = false,
  gradientColor = "cyan"
}: {
  children: React.ReactNode
  className?: string
  gradient?: boolean
  gradientColor?: "cyan" | "purple" | "emerald" | "orange" | "blue"
}) {
  const gradientColors = {
    cyan: "from-cyan-500/10 via-transparent to-transparent",
    purple: "from-purple-500/10 via-transparent to-transparent",
    emerald: "from-emerald-500/10 via-transparent to-transparent",
    orange: "from-orange-500/10 via-transparent to-transparent",
    blue: "from-blue-500/10 via-transparent to-transparent"
  }

  return (
    <div className={`
      relative overflow-hidden
      bg-white/[0.03] backdrop-blur-xl
      border border-white/[0.08]
      rounded-2xl
      shadow-[0_8px_32px_rgba(0,0,0,0.12)]
      hover:bg-white/[0.05] hover:border-white/[0.12]
      transition-all duration-300
      ${gradient ? `bg-gradient-to-br ${gradientColors[gradientColor]}` : ''}
      ${className}
    `}>
      {children}
    </div>
  )
}

export default function SettingsPage() {
  const { profile } = useAuth()
  const { subscription, currentPlan, isTrialing, isPastDue, openBillingPortal, loading: subLoading, trialDaysRemaining } = useSubscription()
  const [establishment, setEstablishment] = useState<Establishment | null>(null)
  const [openingPortal, setOpeningPortal] = useState(false)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editedEstablishment, setEditedEstablishment] = useState<Partial<Establishment>>({})

  // Gestion des items de check-in
  const [checkItems, setCheckItems] = useState<CheckItemTemplate[]>([])
  const [showAddCheckItem, setShowAddCheckItem] = useState(false)
  const [newCheckItem, setNewCheckItem] = useState({ item_label: "", icon: "Package" })
  const [savingCheckItem, setSavingCheckItem] = useState(false)
  const [deletingCheckItem, setDeletingCheckItem] = useState<string | null>(null)

  // Gestion de la suppression de membres
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null)
  const [isRemovingMember, setIsRemovingMember] = useState(false)

  useEffect(() => {
    loadData()
  }, [profile])

  async function loadData() {
    if (!profile?.establishment_id) return

    const supabase = createClient()

    // Charger l'établissement
    const { data: estData } = await supabase
      .from("establishments")
      .select("*")
      .eq("id", profile.establishment_id)
      .single()

    if (estData) {
      setEstablishment(estData)
      setEditedEstablishment(estData)
    }

    // Charger les membres de l'équipe
    const { data: teamData } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, role")
      .eq("establishment_id", profile.establishment_id)

    if (teamData) {
      setTeamMembers(teamData)
    }

    // Charger les items de check-in
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: checkItemsData } = await (supabase as any)
      .from("check_item_templates")
      .select("*")
      .eq("establishment_id", profile.establishment_id)
      .eq("is_active", true)
      .order("sort_order", { ascending: true })

    if (checkItemsData && checkItemsData.length > 0) {
      setCheckItems(checkItemsData)
    } else {
      // Initialiser avec les items par défaut si aucun n'existe
      await initializeDefaultCheckItems(profile.establishment_id)
    }

    setLoading(false)
  }

  async function initializeDefaultCheckItems(establishmentId: string) {
    const supabase = createClient()

    const itemsToInsert = DEFAULT_CHECK_ITEMS.map((item, index) => ({
      establishment_id: establishmentId,
      item_code: item.item_code,
      item_label: item.item_label,
      icon: item.icon,
      is_active: true,
      sort_order: index
    }))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from("check_item_templates")
      .insert(itemsToInsert)
      .select()

    if (data) {
      setCheckItems(data)
    }
  }

  async function addCheckItem() {
    if (!profile?.establishment_id || !newCheckItem.item_label.trim()) return

    setSavingCheckItem(true)
    const supabase = createClient()

    const itemCode = newCheckItem.item_label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("check_item_templates")
      .insert({
        establishment_id: profile.establishment_id,
        item_code: itemCode,
        item_label: newCheckItem.item_label.trim(),
        icon: newCheckItem.icon,
        is_active: true,
        sort_order: checkItems.length
      })
      .select()
      .single()

    if (!error && data) {
      setCheckItems([...checkItems, data])
      setNewCheckItem({ item_label: "", icon: "Package" })
      setShowAddCheckItem(false)
    }

    setSavingCheckItem(false)
  }

  async function deleteCheckItem(itemId: string) {
    setDeletingCheckItem(itemId)
    const supabase = createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("check_item_templates")
      .update({ is_active: false })
      .eq("id", itemId)

    if (!error) {
      setCheckItems(checkItems.filter(item => item.id !== itemId))
    }

    setDeletingCheckItem(null)
  }

  // Fonction pour retirer un membre de l'équipe via l'API
  async function handleRemoveMember() {
    if (!memberToRemove) return

    setIsRemovingMember(true)

    try {
      // Appeler l'API qui utilise le client admin (bypass RLS)
      const response = await fetch('/api/team/remove-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: memberToRemove.id })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la suppression')
      }

      console.log('Membre retiré:', result)

      // Mettre à jour la liste locale
      setTeamMembers(prev => prev.filter(m => m.id !== memberToRemove.id))
      setMemberToRemove(null)
    } catch (err) {
      console.error("Erreur lors de la suppression:", err)
    } finally {
      setIsRemovingMember(false)
    }
  }

  async function copyCode() {
    if (!establishment?.code) return

    await navigator.clipboard.writeText(establishment.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function regenerateCode() {
    if (!establishment?.id) return

    const supabase = createClient()

    // Générer un nouveau code
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("establishments")
      .update({ code: newCode })
      .eq("id", establishment.id)

    if (!error) {
      setEstablishment({ ...establishment, code: newCode })
    }
  }

  async function saveChanges() {
    if (!establishment?.id) return

    setSaving(true)
    const supabase = createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("establishments")
      .update({
        name: editedEstablishment.name,
        address: editedEstablishment.address,
        phone: editedEstablishment.phone,
        email: editedEstablishment.email,
      })
      .eq("id", establishment.id)

    if (!error) {
      setEstablishment({ ...establishment, ...editedEstablishment })
      toast.success("Enregistrement sauvegardé", {
        description: "Vos modifications ont été enregistrées avec succès.",
      })
    } else {
      toast.error("Erreur lors de la sauvegarde", {
        description: "Une erreur est survenue. Veuillez réessayer.",
      })
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mx-auto animate-pulse">
              <Shield className="w-8 h-8 text-cyan-400" />
            </div>
            <div className="absolute inset-0 rounded-2xl bg-cyan-500/20 blur-xl animate-pulse" />
          </div>
          <p className="text-white/60 text-sm">Chargement des paramètres...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      {/* Header avec gradient */}
      <div className="mb-8 lg:mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
              Paramètres
            </h1>
            <p className="text-sm sm:text-base text-white/50">
              Gérez votre établissement et configurez votre équipe
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Code d'invitation */}
        <GlassCard gradient gradientColor="cyan" className="group">
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Key className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Code d'invitation</h3>
                <p className="text-sm text-white/50">Partagez ce code avec vos employés</p>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl blur-lg opacity-50" />
                <div className="relative bg-[#0a0a0a]/80 border-2 border-dashed border-cyan-500/40 rounded-xl p-4 text-center">
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-mono font-black tracking-[0.3em] bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    {establishment?.code || "------"}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyCode}
                  className="h-11 w-11 border-white/10 bg-white/5 hover:bg-cyan-500/20 hover:border-cyan-500/30 transition-all"
                >
                  {copied ? (
                    <Check className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <Copy className="h-5 w-5 text-white/70" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={regenerateCode}
                  className="h-11 w-11 border-white/10 bg-white/5 hover:bg-cyan-500/20 hover:border-cyan-500/30 transition-all"
                  title="Générer un nouveau code"
                >
                  <RefreshCw className="h-5 w-5 text-white/70" />
                </Button>
              </div>
            </div>

            <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06]">
              <p className="font-medium text-white/80 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                Comment ça marche ?
              </p>
              <ol className="space-y-2 text-sm text-white/50">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <span>L'employé crée un compte sur l'application</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <span>Il choisit "Rejoindre une équipe"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <span>Il entre le code : <strong className="text-cyan-400">{establishment?.code}</strong></span>
                </li>
              </ol>
            </div>
          </div>
        </GlassCard>

        {/* Équipe */}
        <GlassCard gradient gradientColor="blue">
          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Équipe</h3>
                  <p className="text-sm text-white/50">{teamMembers.length} membre{teamMembers.length > 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 max-h-[280px] overflow-y-auto custom-scrollbar pr-1">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                      <span className="text-white font-semibold text-sm">
                        {member.first_name?.[0]}{member.last_name?.[0]}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-white truncate text-sm">
                        {member.first_name} {member.last_name}
                      </p>
                      <p className="text-xs text-white/40 capitalize">
                        {member.role === "manager" ? "Manager" : "Employé"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.id === profile?.id ? (
                      <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2.5 py-1 rounded-full font-medium">
                        Vous
                      </span>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMemberToRemove(member)}
                        className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8 p-0"
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {teamMembers.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.03] flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-white/30" />
                  </div>
                  <p className="text-white/40 text-sm">Aucun membre dans l'équipe</p>
                </div>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Abonnement */}
        <GlassCard gradient gradientColor="purple" className="lg:col-span-2">
          <div className="p-5 sm:p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Crown className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Abonnement</h3>
                <p className="text-sm text-white/50">Gérez votre plan et vos informations de facturation</p>
              </div>
            </div>

            {subLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Alerte si impayé */}
                {isPastDue && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-red-400">Paiement en retard</p>
                      <p className="text-sm text-white/50 mt-1">
                        Veuillez mettre à jour vos informations de paiement pour continuer à utiliser toutes les fonctionnalités.
                      </p>
                    </div>
                  </div>
                )}

                {/* Plan actuel */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-purple-500/10 via-transparent to-transparent border border-purple-500/20">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                        <Crown className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                      </div>
                      <div className="absolute -inset-1 rounded-2xl bg-purple-500/20 blur-lg -z-10" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-xl sm:text-2xl font-bold text-white">
                          {currentPlan?.name || 'Gratuit'}
                        </h3>
                        {isTrialing && (
                          <span className="text-xs bg-orange-500/20 text-orange-400 px-2.5 py-1 rounded-full font-medium">
                            Essai gratuit
                          </span>
                        )}
                        {subscription?.status && subscription.status !== 'active' && subscription.status !== 'trialing' && (
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            subscription.status === 'past_due' || subscription.status === 'unpaid'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {subscription.status === 'past_due' ? 'Impayé' :
                             subscription.status === 'canceled' ? 'Annulé' :
                             subscription.status}
                          </span>
                        )}
                      </div>
                      <p className="text-white/50">
                        {currentPlan?.price === 0
                          ? 'Plan gratuit'
                          : `${currentPlan?.price}€/mois`}
                      </p>
                      {subscription?.periodEnd && (
                        <p className="text-xs text-white/40 mt-1">
                          Prochain renouvellement: {subscription.periodEnd.toLocaleDateString('fr-FR')}
                        </p>
                      )}
                      {isTrialing && subscription?.trialEndsAt && (
                        <p className="text-xs text-orange-400 mt-1 font-medium">
                          Fin de l'essai: {subscription.trialEndsAt.toLocaleDateString('fr-FR')} ({trialDaysRemaining !== null ? `${trialDaysRemaining} jours restants` : ''})
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 lg:shrink-0">
                    {(() => {
                      const hasActiveSubscription = subscription?.plan && subscription.plan !== 'FREE'
                      const hasStripeAccount = subscription?.stripeCustomerId || subscription?.stripeSubscriptionId
                      const shouldShowManageButton = hasActiveSubscription || isTrialing || hasStripeAccount

                      return shouldShowManageButton ? (
                        <>
                          <Button
                            onClick={async (e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setOpeningPortal(true)
                              try {
                                await openBillingPortal()
                              } catch (error) {
                                const errorMessage = error instanceof Error ? error.message : String(error)
                                if (errorMessage.includes('customer') || errorMessage.includes('abonnement') || errorMessage.includes('Aucun') || errorMessage.includes('non trouvé')) {
                                  if (confirm('Vous n\'avez pas encore d\'abonnement actif. Souhaitez-vous vous abonner maintenant ?')) {
                                    window.location.href = '/pricing'
                                  }
                                } else {
                                  alert(`Erreur lors de l'ouverture du portail de paiement: ${errorMessage}. Veuillez réessayer.`)
                                }
                              } finally {
                                setOpeningPortal(false)
                              }
                            }}
                            disabled={openingPortal}
                            className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0 shadow-lg shadow-purple-500/25"
                            type="button"
                          >
                            {openingPortal ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="hidden sm:inline">Ouverture...</span>
                              </>
                            ) : (
                              <>
                                <CreditCard className="h-4 w-4" />
                                <span className="hidden sm:inline">Gérer l'abonnement</span>
                                <span className="sm:hidden">Gérer</span>
                              </>
                            )}
                          </Button>
                        </>
                      ) : (
                        <Link href="/pricing">
                          <Button className="w-full sm:w-auto gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0 shadow-lg shadow-purple-500/25">
                            <Crown className="h-4 w-4" />
                            S'abonner
                          </Button>
                        </Link>
                      )
                    })()}
                  </div>
                </div>

                {/* Info pour l'essai */}
                {isTrialing && subscription?.stripeSubscriptionId && (
                  <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0">
                        <AlertTriangle className="h-5 w-5 text-orange-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-orange-400 mb-1">
                          Période d'essai en cours
                        </p>
                        <p className="text-sm text-white/50 mb-3">
                          Vous pouvez annuler votre abonnement à tout moment depuis le portail Stripe.
                          {subscription?.trialEndsAt && (
                            <> L'essai se termine le <strong className="text-white/70">{subscription.trialEndsAt.toLocaleDateString('fr-FR')}</strong>.</>
                          )}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            setOpeningPortal(true)
                            try {
                              await openBillingPortal()
                            } catch (error) {
                              console.error('Erreur portail:', error)
                              alert('Erreur lors de l\'ouverture du portail.')
                            } finally {
                              setOpeningPortal(false)
                            }
                          }}
                          disabled={openingPortal}
                          className="gap-2 border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                        >
                          {openingPortal ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <ExternalLink className="h-3 w-3" />
                          )}
                          <span className="hidden sm:inline">Annuler l'essai</span>
                          <span className="sm:hidden">Annuler</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Info pour abonnement actif */}
                {!isTrialing && subscription?.stripeSubscriptionId && subscription?.plan !== 'FREE' && (
                  <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center shrink-0">
                        <CreditCard className="h-5 w-5 text-cyan-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-cyan-400 mb-1">
                          Abonnement actif
                        </p>
                        <p className="text-sm text-white/50 mb-3">
                          Gérez votre abonnement, mettez à jour votre moyen de paiement ou annulez depuis le portail client Stripe sécurisé.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            setOpeningPortal(true)
                            try {
                              await openBillingPortal()
                            } catch (error) {
                              console.error('Erreur portail:', error)
                              alert('Erreur lors de l\'ouverture du portail.')
                            } finally {
                              setOpeningPortal(false)
                            }
                          }}
                          disabled={openingPortal}
                          className="gap-2 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                        >
                          {openingPortal ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <ExternalLink className="h-3 w-3" />
                          )}
                          <span className="hidden sm:inline">Ouvrir le portail</span>
                          <span className="sm:hidden">Portail</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Features du plan */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {currentPlan?.features.slice(0, 8).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                      <Check className="h-4 w-4 text-purple-400 shrink-0" />
                      <span className="text-white/70">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Configuration du Check-in */}
        <GlassCard gradient gradientColor="emerald" className="lg:col-span-2">
          <div className="p-5 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <ClipboardCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Configuration du Check-in</h3>
                  <p className="text-sm text-white/50">Points à vérifier avant le service</p>
                </div>
              </div>
              <Button
                onClick={() => setShowAddCheckItem(true)}
                className="gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Ajouter un point</span>
                <span className="sm:hidden">Ajouter</span>
              </Button>
            </div>

            {/* Formulaire d'ajout */}
            {showAddCheckItem && (
              <div className="mb-6 p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-white flex items-center gap-2">
                    <Plus className="h-4 w-4 text-emerald-400" />
                    Nouveau point de contrôle
                  </h4>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowAddCheckItem(false)}
                    className="h-8 w-8 hover:bg-white/10"
                  >
                    <X className="h-4 w-4 text-white/60" />
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
                  <div className="flex-1">
                    <Label htmlFor="checkItemLabel" className="text-white/70 text-sm">Libellé du point</Label>
                    <Input
                      id="checkItemLabel"
                      value={newCheckItem.item_label}
                      onChange={(e) => setNewCheckItem({ ...newCheckItem, item_label: e.target.value })}
                      placeholder="Ex: Vérifier les dates de péremption"
                      className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500/50"
                    />
                  </div>

                  <div className="flex gap-3 items-end">
                    <div className="flex-1 sm:flex-initial sm:w-36">
                      <Label className="text-white/70 text-sm">Icône</Label>
                      <select
                        value={newCheckItem.icon}
                        onChange={(e) => setNewCheckItem({ ...newCheckItem, icon: e.target.value })}
                        className="w-full h-10 mt-1.5 rounded-lg border border-white/10 bg-white/5 text-white px-3"
                      >
                        <option value="Package">📦 Stock</option>
                        <option value="ThermometerSun">🌡️ Température</option>
                        <option value="ClipboardCheck">📋 Vérification</option>
                        <option value="Utensils">🍴 Matériel</option>
                      </select>
                    </div>

                    <Button
                      onClick={addCheckItem}
                      disabled={!newCheckItem.item_label.trim() || savingCheckItem}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white h-10 px-4"
                    >
                      {savingCheckItem ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Liste des items */}
            {checkItems.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {checkItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="hidden sm:flex text-white/20">
                        <GripVertical className="h-4 w-4" />
                      </div>
                      <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                        {item.icon === 'Package' && <Package className="h-5 w-5 text-emerald-400" />}
                        {item.icon === 'ThermometerSun' && <ThermometerSun className="h-5 w-5 text-emerald-400" />}
                        {item.icon === 'ClipboardCheck' && <ClipboardCheck className="h-5 w-5 text-emerald-400" />}
                        {item.icon === 'Utensils' && <Utensils className="h-5 w-5 text-emerald-400" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-white text-sm truncate">{item.item_label}</p>
                        <p className="text-xs text-white/40">Point #{index + 1}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0 h-8 w-8"
                      onClick={() => deleteCheckItem(item.id)}
                      disabled={deletingCheckItem === item.id}
                    >
                      {deletingCheckItem === item.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-4">
                  <ClipboardCheck className="h-8 w-8 text-white/20" />
                </div>
                <p className="text-white/40 mb-4">Aucun point de contrôle défini</p>
                <Button
                  onClick={() => setShowAddCheckItem(true)}
                  className="gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30"
                >
                  <Plus className="h-4 w-4" />
                  Créer votre premier point
                </Button>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Informations de l'établissement */}
        <GlassCard className="lg:col-span-2">
          <div className="p-5 sm:p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white/70" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Informations de l'établissement</h3>
                <p className="text-sm text-white/50">Modifiez les informations de votre établissement</p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white/70 text-sm">Nom de l'établissement</Label>
                <Input
                  id="name"
                  value={editedEstablishment.name || ""}
                  onChange={(e) => setEditedEstablishment({ ...editedEstablishment, name: e.target.value })}
                  placeholder="Ex: Le Burger Gourmet"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-cyan-500/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/70 text-sm flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={editedEstablishment.email || ""}
                  onChange={(e) => setEditedEstablishment({ ...editedEstablishment, email: e.target.value })}
                  placeholder="contact@restaurant.com"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-cyan-500/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white/70 text-sm flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  Téléphone
                </Label>
                <Input
                  id="phone"
                  value={editedEstablishment.phone || ""}
                  onChange={(e) => setEditedEstablishment({ ...editedEstablishment, phone: e.target.value })}
                  placeholder="+33 1 23 45 67 89"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-cyan-500/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-white/70 text-sm flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  Adresse
                </Label>
                <Input
                  id="address"
                  value={editedEstablishment.address || ""}
                  onChange={(e) => setEditedEstablishment({ ...editedEstablishment, address: e.target.value })}
                  placeholder="123 Rue de Paris, 75001 Paris"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-cyan-500/50"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={saveChanges}
                disabled={saving}
                className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-lg shadow-cyan-500/25"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="hidden sm:inline">Enregistrement...</span>
                    <span className="sm:hidden">Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span className="hidden sm:inline">Enregistrer les modifications</span>
                    <span className="sm:hidden">Enregistrer</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Modal de confirmation de suppression de membre */}
      {memberToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => !isRemovingMember && setMemberToRemove(null)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-md">
            <GlassCard className="p-6">
              {/* Bouton fermer */}
              <button
                onClick={() => !isRemovingMember && setMemberToRemove(null)}
                disabled={isRemovingMember}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-all disabled:opacity-50"
              >
                <X className="h-4 w-4 text-white/60" />
              </button>

              {/* Icône d'alerte */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center">
                    <AlertTriangle className="h-8 w-8 text-red-400" />
                  </div>
                  <div className="absolute -inset-2 rounded-2xl bg-red-500/10 blur-xl -z-10" />
                </div>
              </div>

              {/* Titre */}
              <h3 className="text-xl font-bold text-center text-white mb-2">
                Retirer ce membre ?
              </h3>

              {/* Description */}
              <p className="text-white/50 text-center mb-4">
                Vous êtes sur le point de retirer{' '}
                <span className="text-white font-semibold">
                  {memberToRemove.first_name} {memberToRemove.last_name}
                </span>{' '}
                de votre établissement.
              </p>

              {/* Info sur les conséquences */}
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6">
                <p className="text-sm text-red-400 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>
                    Cette personne sera <strong>immédiatement déconnectée</strong> de l'établissement
                    et ne pourra plus y accéder.
                  </span>
                </p>
              </div>

              {/* Boutons */}
              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={() => setMemberToRemove(null)}
                  disabled={isRemovingMember}
                  className="flex-1 border-white/10 text-white hover:bg-white/10"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleRemoveMember}
                  disabled={isRemovingMember}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                >
                  {isRemovingMember ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Suppression...
                    </>
                  ) : (
                    <>
                      <UserMinus className="h-4 w-4 mr-2" />
                      Retirer
                    </>
                  )}
                </Button>
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  )
}
