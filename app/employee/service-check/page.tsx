"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Check, ChevronLeft, X, Package, ThermometerSun, ClipboardCheck, Utensils, Sparkles, Loader2 } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"

interface CheckItemTemplate {
  id: string
  item_code: string
  item_label: string
  icon: string
}

type CheckStatus = "ok" | "manque" | null

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Package,
  ThermometerSun,
  ClipboardCheck,
  Utensils
}

export default function ServiceCheckPage() {
  const supabase = createClient()
  const [checkItems, setCheckItems] = useState<CheckItemTemplate[]>([])
  const [checks, setChecks] = useState<Record<string, CheckStatus>>({})
  const [inventoryDone, setInventoryDone] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [alreadyChecked, setAlreadyChecked] = useState(false)

  // Charger les items de check-in et vérifier si déjà fait
  useEffect(() => {
    const loadData = async () => {
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

        const today = new Date().toISOString().split('T')[0]

        // Vérifier si un check-in a déjà été fait aujourd'hui
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: existingCheck } = await (supabase as any)
          .from('service_checks')
          .select('*')
          .eq('performed_by', user.id)
          .eq('check_date', today)
          .single()

        if (existingCheck) {
          setAlreadyChecked(true)
          setShowSuccess(true)
          setLoading(false)
          return
        }

        // Charger les items de check-in configurés
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: items } = await (supabase as any)
          .from('check_item_templates')
          .select('*')
          .eq('establishment_id', profile.establishment_id)
          .eq('is_active', true)
          .order('sort_order', { ascending: true })

        if (items && items.length > 0) {
          setCheckItems(items)
        } else {
          // Items par défaut si aucun n'est configuré
          setCheckItems([
            { id: '1', item_code: "stock-frites", item_label: "Stock frites suffisant", icon: "Package" },
            { id: '2', item_code: "stock-pain", item_label: "Stock pain suffisant", icon: "Package" },
            { id: '3', item_code: "stock-viande", item_label: "Stock viande suffisant", icon: "Package" },
            { id: '4', item_code: "temp-frigo", item_label: "Température frigo OK", icon: "ThermometerSun" },
            { id: '5', item_code: "proprete", item_label: "Propreté cuisine", icon: "ClipboardCheck" },
            { id: '6', item_code: "materiel", item_label: "Matériel fonctionnel", icon: "Utensils" },
          ])
        }
      } catch (err) {
        console.error('Erreur chargement:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleCheck = (id: string, status: CheckStatus) => {
    setChecks(prev => ({ ...prev, [id]: status }))
  }

  const allChecked = checkItems.every(item => checks[item.id])
  const hasIssues = Object.values(checks).some(status => status === "manque")

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('establishment_id, first_name, last_name')
        .eq('id', user.id)
        .single()

      if (!profile?.establishment_id) return

      const today = new Date().toISOString().split('T')[0]
      
      // Créer le rapport des problèmes
      const issues = checkItems
        .filter(item => checks[item.id] === "manque")
        .map(item => item.item_label)
      
      const notes = hasIssues 
        ? `Problèmes signalés: ${issues.join(", ")}`
        : "Tous les points vérifiés OK"

      // Sauvegarder le check-in avec le statut inventaire
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('service_checks')
        .insert({
          establishment_id: profile.establishment_id,
          performed_by: user.id,
          check_date: today,
          shift: 'morning',
          is_complete: true,
          has_issues: hasIssues,
          inventory_done: inventoryDone,
          notes: notes
        })

      if (error) throw error

      // Si il y a des problèmes, créer une alerte pour le manager
      if (hasIssues) {
        const employeeName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Un employé'

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('alerts')
          .insert({
            establishment_id: profile.establishment_id,
            alert_type: 'warning',
            category: 'service',
            title: 'Problème signalé au check-in',
            message: `${employeeName} a signalé: ${issues.join(", ")}`,
            is_read: false,
            is_dismissed: false
          })
      }

      setShowSuccess(true)
    } catch (err) {
      console.error('Erreur sauvegarde:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (showSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center animate-success-pop">
          <div className={`h-24 w-24 rounded-full mx-auto mb-6 flex items-center justify-center ${
            hasIssues ? "bg-primary/20" : "bg-accent/20"
          }`}>
            {hasIssues ? (
              <ClipboardCheck className="h-12 w-12 text-primary" />
            ) : (
              <Sparkles className="h-12 w-12 text-accent" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {alreadyChecked ? "Déjà effectué" : hasIssues ? "Rapport envoyé" : "Parfait !"}
          </h2>
          <p className="text-muted-foreground">
            {alreadyChecked 
              ? "Vous avez déjà fait le check-in aujourd'hui" 
              : hasIssues 
                ? "Les problèmes ont été signalés au manager" 
                : "Tout est prêt pour le service"}
          </p>
          <Link href="/employee">
            <Button className="mt-6 btn-primary">Retour</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="mb-6 animate-fade-up">
        <Link href="/employee" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft className="h-5 w-5" />
          <span>Retour</span>
        </Link>
        <h1 className="text-xl font-bold text-foreground mb-1">Check Service</h1>
        <p className="text-sm text-muted-foreground">Vérifiez l'état avant ouverture</p>
      </div>

      {/* Progress */}
      <div className="mb-6 animate-fade-up delay-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Progression</span>
          <span className="text-sm font-medium text-foreground">
            {Object.keys(checks).filter(k => checks[k]).length}/{checkItems.length}
          </span>
        </div>
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill-orange"
            style={{ width: `${(Object.keys(checks).filter(k => checks[k]).length / checkItems.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Check Items */}
      <div className="space-y-3 animate-fade-up delay-2">
        {checkItems.map((item) => {
          const Icon = iconMap[item.icon] || Package
          const status = checks[item.id]
          
          return (
            <div
              key={item.id}
              className={`banking-card p-4 transition-all ${
                status === "ok" ? "border-accent/50" :
                status === "manque" ? "border-destructive/50" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                  status === "ok" ? "bg-accent/20" :
                  status === "manque" ? "bg-destructive/20" : "bg-secondary"
                }`}>
                  <Icon className={`h-6 w-6 ${
                    status === "ok" ? "text-accent" :
                    status === "manque" ? "text-destructive" : "text-muted-foreground"
                  }`} />
                </div>
                <p className="flex-1 font-medium text-foreground">{item.item_label}</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCheck(item.id, "ok")}
                    className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${
                      status === "ok"
                        ? "bg-accent text-white"
                        : "bg-secondary hover:bg-accent/20 text-muted-foreground hover:text-accent"
                    }`}
                  >
                    <Check className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleCheck(item.id, "manque")}
                    className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${
                      status === "manque"
                        ? "bg-destructive text-white"
                        : "bg-secondary hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                    }`}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Inventaire fait */}
      <div className="mt-6 animate-fade-up delay-3">
        <div 
          onClick={() => setInventoryDone(!inventoryDone)}
          className={`banking-card p-4 cursor-pointer transition-all ${
            inventoryDone ? "border-accent/50 bg-accent/5" : ""
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
              inventoryDone ? "bg-accent/20" : "bg-secondary"
            }`}>
              <Package className={`h-6 w-6 ${
                inventoryDone ? "text-accent" : "text-muted-foreground"
              }`} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">Inventaire fait</p>
              <p className="text-xs text-muted-foreground">Cochez si vous avez mis à jour le stock</p>
            </div>
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${
              inventoryDone 
                ? "bg-accent text-white" 
                : "bg-secondary text-muted-foreground"
            }`}>
              <Check className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Submit */}
      {allChecked && (
        <div className="mt-6 animate-fade-up">
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className={`w-full h-14 text-lg ${hasIssues ? "btn-primary" : "bg-accent hover:bg-green-500 text-white"}`}
          >
            {saving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <ClipboardCheck className="h-5 w-5 mr-2" />
                {hasIssues ? "Envoyer le rapport" : "Valider le check"}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
