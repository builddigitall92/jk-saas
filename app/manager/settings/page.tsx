"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  UserMinus
} from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { useAuth } from "@/lib/hooks/use-auth"
import { useSubscription } from "@/lib/hooks/use-subscription"
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

      console.log('✅ Membre retiré:', result)

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
    }
    
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Paramètres</h1>
        <p className="text-muted-foreground mt-1">
          Gérez votre établissement et invitez votre équipe
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Code d'invitation */}
        <Card className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-orange-500" />
              Code d'invitation
            </CardTitle>
            <CardDescription>
              Partagez ce code avec vos employés pour qu'ils rejoignent votre établissement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-background border-2 border-dashed border-orange-500/30 rounded-lg p-4 text-center">
                <span className="text-3xl font-mono font-bold tracking-widest text-orange-500">
                  {establishment?.code || "------"}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={copyCode}
                  className="h-12 w-12"
                >
                  {copied ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={regenerateCode}
                  className="h-12 w-12"
                  title="Générer un nouveau code"
                >
                  <RefreshCw className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-2">Comment ça marche ?</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>L'employé crée un compte sur l'application</li>
                <li>Il choisit "Rejoindre une équipe"</li>
                <li>Il entre ce code : <strong className="text-orange-500">{establishment?.code}</strong></li>
                <li>Il est automatiquement ajouté à votre équipe</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Équipe */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Équipe ({teamMembers.length})
            </CardTitle>
            <CardDescription>
              Les membres de votre établissement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div 
                  key={member.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <span className="text-white font-medium">
                        {member.first_name?.[0]}{member.last_name?.[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {member.first_name} {member.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {member.role === "manager" ? "Manager" : "Employé"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.id === profile?.id ? (
                      <span className="text-xs bg-orange-500/10 text-orange-500 px-2 py-1 rounded">
                        Vous
                      </span>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMemberToRemove(member)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              {teamMembers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Aucun membre dans l'équipe</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Abonnement */}
        <Card className="lg:col-span-2 border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-purple-500" />
              Abonnement
            </CardTitle>
            <CardDescription>
              Gérez votre plan et vos informations de facturation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Alerte si impayé */}
                {isPastDue && (
                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                    <div>
                      <p className="font-semibold text-destructive">Paiement en retard</p>
                      <p className="text-sm text-muted-foreground">
                        Veuillez mettre à jour vos informations de paiement pour continuer à utiliser toutes les fonctionnalités.
                      </p>
                    </div>
                  </div>
                )}

                {/* Plan actuel */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-purple-500/10 flex items-center justify-center">
                      <Crown className="h-7 w-7 text-purple-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-foreground">
                          {currentPlan?.name || 'Gratuit'}
                        </h3>
                        {isTrialing && (
                          <span className="text-xs bg-orange-500/10 text-orange-500 px-2 py-1 rounded">
                            Essai gratuit
                          </span>
                        )}
                        {/* Badge de statut */}
                        {subscription?.status && subscription.status !== 'active' && subscription.status !== 'trialing' && (
                          <span className={`text-xs px-2 py-1 rounded ${
                            subscription.status === 'past_due' || subscription.status === 'unpaid' 
                              ? 'bg-red-500/10 text-red-500' 
                              : 'bg-amber-500/10 text-amber-500'
                          }`}>
                            {subscription.status === 'past_due' ? 'Impayé' : 
                             subscription.status === 'canceled' ? 'Annulé' : 
                             subscription.status}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {currentPlan?.price === 0 
                          ? 'Plan gratuit' 
                          : `${currentPlan?.price}€/mois`}
                      </p>
                      {subscription?.periodEnd && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Prochain renouvellement: {subscription.periodEnd.toLocaleDateString('fr-FR')}
                        </p>
                      )}
                      {isTrialing && subscription?.trialEndsAt && (
                        <p className="text-xs text-orange-500 mt-1 font-medium">
                          Fin de l'essai: {subscription.trialEndsAt.toLocaleDateString('fr-FR')} ({trialDaysRemaining !== null ? `${trialDaysRemaining} jours restants` : ''})
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {/* Bouton Gérer l'abonnement / Portail Stripe */}
                    {/* Afficher si : plan payant OU essai OU a un ID Stripe (même si plan = free) */}
                    {(() => {
                      const hasActiveSubscription = subscription?.plan && subscription.plan !== 'FREE'
                      const hasStripeAccount = subscription?.stripeCustomerId || subscription?.stripeSubscriptionId
                      const shouldShowManageButton = hasActiveSubscription || isTrialing || hasStripeAccount
                      
                      return shouldShowManageButton ? (
                        <>
                          <Button
                            variant="default"
                            onClick={async () => {
                              setOpeningPortal(true)
                              try {
                                await openBillingPortal()
                              } catch (error) {
                                console.error('Erreur portail:', error)
                                // Si pas de customer Stripe, rediriger vers pricing pour créer un abonnement
                                const errorMessage = error instanceof Error ? error.message : String(error)
                                if (errorMessage.includes('customer') || errorMessage.includes('abonnement') || errorMessage.includes('Aucun')) {
                                  if (confirm('Vous n\'avez pas encore d\'abonnement actif. Souhaitez-vous vous abonner maintenant ?')) {
                                    window.location.href = '/pricing'
                                  }
                                } else {
                                  alert('Erreur lors de l\'ouverture du portail de paiement. Veuillez réessayer.')
                                }
                              } finally {
                                setOpeningPortal(false)
                              }
                            }}
                            disabled={openingPortal}
                            className="gap-2 bg-purple-600 hover:bg-purple-700 text-white w-full"
                          >
                            {openingPortal ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Ouverture...
                              </>
                            ) : (
                              <>
                                <CreditCard className="h-4 w-4" />
                                {isTrialing ? 'Gérer ou annuler l\'essai' : 'Gérer mon abonnement'}
                              </>
                            )}
                          </Button>
                          {/* Bouton pour changer de plan */}
                          <Link href="/pricing">
                            <Button variant="outline" className="w-full gap-2 border-purple-500/30 text-purple-600 hover:bg-purple-500/10">
                              <Crown className="h-4 w-4" />
                              Changer de plan
                            </Button>
                          </Link>
                        </>
                      ) : (
                        /* Bouton pour s'abonner si pas d'abonnement */
                        <Link href="/pricing">
                          <Button className="w-full bg-purple-500 hover:bg-purple-600 gap-2">
                            <Crown className="h-4 w-4" />
                            S'abonner
                          </Button>
                        </Link>
                      )
                    })()}
                  </div>
                </div>

                {/* Info importante pour l'essai */}
                {isTrialing && subscription?.stripeSubscriptionId && (
                  <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold text-orange-600 dark:text-orange-400 mb-1">
                          Période d'essai en cours
                        </p>
                        <p className="text-sm text-muted-foreground mb-3">
                          Vous pouvez annuler votre abonnement à tout moment depuis le portail Stripe. 
                          {subscription?.trialEndsAt && (
                            <> L'essai se termine le <strong>{subscription.trialEndsAt.toLocaleDateString('fr-FR')}</strong>.</>
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
                          className="gap-2 border-orange-500/30 text-orange-600 hover:bg-orange-500/10"
                        >
                          {openingPortal ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <ExternalLink className="h-3 w-3" />
                          )}
                          Annuler l'essai ou l'abonnement
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Info pour les abonnements actifs */}
                {!isTrialing && subscription?.stripeSubscriptionId && subscription?.plan !== 'FREE' && (
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-start gap-3">
                      <CreditCard className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold text-blue-600 dark:text-blue-400 mb-1">
                          Abonnement actif
                        </p>
                        <p className="text-sm text-muted-foreground mb-3">
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
                          className="gap-2 border-blue-500/30 text-blue-600 hover:bg-blue-500/10"
                        >
                          {openingPortal ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <ExternalLink className="h-3 w-3" />
                          )}
                          Ouvrir le portail de gestion
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Features du plan */}
                <div className="grid gap-2 sm:grid-cols-2">
                  {currentPlan?.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-purple-500" />
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configuration du Check-in */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-green-500" />
                  Configuration du Check-in
                </CardTitle>
                <CardDescription>
                  Définissez les points à vérifier par vos employés avant le service
                </CardDescription>
              </div>
              <Button onClick={() => setShowAddCheckItem(true)} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Ajouter un point
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Formulaire d'ajout */}
            {showAddCheckItem && (
              <div className="mb-6 p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    <Plus className="h-4 w-4 text-green-500" />
                    Nouveau point de contrôle
                  </h4>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setShowAddCheckItem(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Label htmlFor="checkItemLabel">Libellé du point</Label>
                    <Input
                      id="checkItemLabel"
                      value={newCheckItem.item_label}
                      onChange={(e) => setNewCheckItem({ ...newCheckItem, item_label: e.target.value })}
                      placeholder="Ex: Vérifier les dates de péremption"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label>Icône</Label>
                    <select
                      value={newCheckItem.icon}
                      onChange={(e) => setNewCheckItem({ ...newCheckItem, icon: e.target.value })}
                      className="w-full h-10 mt-1 rounded-lg border border-border bg-background px-3"
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
                    className="bg-green-500 hover:bg-green-600"
                  >
                    {savingCheckItem ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Liste des items */}
            {checkItems.length > 0 ? (
              <div className="space-y-2">
                {checkItems.map((item, index) => (
                  <div 
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-muted-foreground">
                        <GripVertical className="h-4 w-4" />
                      </div>
                      <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                        {item.icon === 'Package' && <Package className="h-5 w-5 text-green-500" />}
                        {item.icon === 'ThermometerSun' && <ThermometerSun className="h-5 w-5 text-green-500" />}
                        {item.icon === 'ClipboardCheck' && <ClipboardCheck className="h-5 w-5 text-green-500" />}
                        {item.icon === 'Utensils' && <Utensils className="h-5 w-5 text-green-500" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{item.item_label}</p>
                        <p className="text-xs text-muted-foreground">Point #{index + 1}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
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
              <div className="text-center py-8">
                <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                <p className="text-muted-foreground mb-4">Aucun point de contrôle défini</p>
                <Button onClick={() => setShowAddCheckItem(true)} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer votre premier point
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informations de l'établissement */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-purple-500" />
              Informations de l'établissement
            </CardTitle>
            <CardDescription>
              Modifiez les informations de votre établissement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de l'établissement</Label>
                <Input
                  id="name"
                  value={editedEstablishment.name || ""}
                  onChange={(e) => setEditedEstablishment({ ...editedEstablishment, name: e.target.value })}
                  placeholder="Ex: Le Burger Gourmet"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={editedEstablishment.email || ""}
                  onChange={(e) => setEditedEstablishment({ ...editedEstablishment, email: e.target.value })}
                  placeholder="contact@restaurant.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">
                  <Phone className="h-4 w-4 inline mr-1" />
                  Téléphone
                </Label>
                <Input
                  id="phone"
                  value={editedEstablishment.phone || ""}
                  onChange={(e) => setEditedEstablishment({ ...editedEstablishment, phone: e.target.value })}
                  placeholder="+33 1 23 45 67 89"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Adresse
                </Label>
                <Input
                  id="address"
                  value={editedEstablishment.address || ""}
                  onChange={(e) => setEditedEstablishment({ ...editedEstablishment, address: e.target.value })}
                  placeholder="123 Rue de Paris, 75001 Paris"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button onClick={saveChanges} disabled={saving}>
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Enregistrer les modifications
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de confirmation de suppression de membre */}
      {memberToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !isRemovingMember && setMemberToRemove(null)}
          />
          
          {/* Modal */}
          <div className="relative w-full max-w-md rounded-2xl p-6 bg-background border shadow-xl">
            {/* Bouton fermer */}
            <button
              onClick={() => !isRemovingMember && setMemberToRemove(null)}
              disabled={isRemovingMember}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted transition-all disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Icône d'alerte */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </div>

            {/* Titre */}
            <h3 className="text-xl font-bold text-center mb-2">
              Retirer ce membre ?
            </h3>

            {/* Description */}
            <p className="text-muted-foreground text-center mb-4">
              Vous êtes sur le point de retirer{' '}
              <span className="text-foreground font-semibold">
                {memberToRemove.first_name} {memberToRemove.last_name}
              </span>{' '}
              de votre établissement.
            </p>

            {/* Info sur les conséquences */}
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6">
              <p className="text-sm text-red-600 dark:text-red-400 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  Cette personne sera <strong>immédiatement déconnectée</strong> de l'établissement 
                  et ne pourra plus y accéder.
                </span>
              </p>
            </div>

            {/* Boutons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setMemberToRemove(null)}
                disabled={isRemovingMember}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleRemoveMember}
                disabled={isRemovingMember}
                className="flex-1"
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
          </div>
        </div>
      )}
    </div>
  )
}
