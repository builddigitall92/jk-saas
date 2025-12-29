"use client"

import { useState, useEffect } from "react"
import { Check, ChevronLeft, X, Package, ThermometerSun, ClipboardCheck, Utensils, Sparkles, Loader2, AlertTriangle, CheckCircle2, Clock } from "lucide-react"
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

// Composant GlassTile
function GlassTile({ 
  children, 
  className = "", 
  onClick,
  status,
}: { 
  children: React.ReactNode
  className?: string
  onClick?: () => void
  status?: 'ok' | 'issue' | 'default'
}) {
  const statusStyles = {
    ok: 'bg-gradient-to-br from-emerald-500/20 to-green-500/10 border-emerald-500/40',
    issue: 'bg-gradient-to-br from-red-500/20 to-orange-500/10 border-red-500/40',
    default: 'bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/30 hover:border-orange-500/40'
  }

  const baseClass = `
    relative rounded-2xl p-4 transition-all duration-300 border backdrop-blur-sm
    ${statusStyles[status || 'default']}
  `

  if (onClick) {
    return (
      <button onClick={onClick} className={`${baseClass} w-full text-left ${className}`}>
        {children}
      </button>
    )
  }

  return (
    <div className={`${baseClass} ${className}`}>
      {children}
    </div>
  )
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
  const [hasIssues, setHasIssues] = useState(false)

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
          setHasIssues(existingCheck.has_issues)
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
  const currentHasIssues = Object.values(checks).some(status => status === "manque")
  const completedCount = Object.keys(checks).filter(k => checks[k]).length
  const progressPercent = checkItems.length > 0 ? (completedCount / checkItems.length) * 100 : 0

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
      
      const notes = currentHasIssues 
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
          has_issues: currentHasIssues,
          inventory_done: inventoryDone,
          notes: notes
        })

      if (error) throw error

      // Si il y a des problèmes, créer une alerte pour le manager
      if (currentHasIssues) {
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

      setHasIssues(currentHasIssues)
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
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-green-400" />
          </div>
          <p className="text-slate-400 text-sm">Chargement...</p>
        </div>
      </div>
    )
  }

  if (showSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className={`h-20 w-20 rounded-2xl mx-auto mb-6 flex items-center justify-center ${
            hasIssues 
              ? "bg-orange-500/20 border border-orange-500/30" 
              : "bg-emerald-500/20 border border-emerald-500/30"
          }`}>
            {hasIssues ? (
              <AlertTriangle className="h-10 w-10 text-orange-400" />
            ) : (
              <Sparkles className="h-10 w-10 text-emerald-400" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {alreadyChecked ? "Déjà effectué !" : hasIssues ? "Rapport envoyé" : "Parfait !"}
          </h2>
          <p className="text-slate-400 mb-6">
            {alreadyChecked 
              ? "Vous avez déjà fait le check-in aujourd'hui. Revenez demain !" 
              : hasIssues 
                ? "Les problèmes ont été signalés au manager. Merci pour votre vigilance !" 
                : "Tout est prêt pour le service. Excellente journée !"}
          </p>
          <Link 
            href="/employee"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-500/30"
          >
            <ChevronLeft className="h-5 w-5" />
            Retour au dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <Link href="/employee" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors">
          <ChevronLeft className="h-5 w-5" />
          <span>Retour</span>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                <ClipboardCheck className="h-5 w-5 text-green-400" />
              </div>
              Check-in Service
            </h1>
            <p className="text-slate-400 mt-1">Vérifiez l'état avant ouverture</p>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Clock className="h-4 w-4" />
            <span className="text-sm">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <GlassTile>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-300">Progression</span>
            {allChecked && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium border border-emerald-500/30">
                Terminé
              </span>
            )}
          </div>
          <span className="text-sm font-bold text-orange-400">
            {completedCount}/{checkItems.length}
          </span>
        </div>
        <div className="h-3 rounded-full bg-slate-700/50 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              progressPercent === 100 
                ? 'bg-gradient-to-r from-emerald-500 to-green-400' 
                : 'bg-gradient-to-r from-orange-500 to-red-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {currentHasIssues && (
          <p className="mt-3 text-sm text-orange-400 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Des problèmes ont été identifiés - ils seront signalés au manager
          </p>
        )}
      </GlassTile>

      {/* Check Items */}
      <div className="space-y-3">
        {checkItems.map((item, index) => {
          const Icon = iconMap[item.icon] || Package
          const status = checks[item.id]
          
          return (
            <GlassTile
              key={item.id}
              status={status === "ok" ? "ok" : status === "manque" ? "issue" : "default"}
              className="hover:scale-[1.01]"
            >
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all ${
                  status === "ok" 
                    ? "bg-emerald-500/20 border border-emerald-500/30" 
                    : status === "manque" 
                      ? "bg-red-500/20 border border-red-500/30" 
                      : "bg-slate-700/50 border border-slate-600/50"
                }`}>
                  <Icon className={`h-6 w-6 ${
                    status === "ok" ? "text-emerald-400" :
                    status === "manque" ? "text-red-400" : "text-slate-400"
                  }`} />
                </div>
                <p className="flex-1 font-medium text-white">{item.item_label}</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCheck(item.id, "ok")}
                    className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all ${
                      status === "ok"
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                        : "bg-slate-700/50 text-slate-400 hover:bg-emerald-500/20 hover:text-emerald-400 border border-slate-600/50 hover:border-emerald-500/40"
                    }`}
                  >
                    <Check className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleCheck(item.id, "manque")}
                    className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all ${
                      status === "manque"
                        ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                        : "bg-slate-700/50 text-slate-400 hover:bg-red-500/20 hover:text-red-400 border border-slate-600/50 hover:border-red-500/40"
                    }`}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </GlassTile>
          )
        })}
      </div>

      {/* Inventaire fait */}
      <GlassTile 
        onClick={() => setInventoryDone(!inventoryDone)}
        status={inventoryDone ? "ok" : "default"}
        className="cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all ${
            inventoryDone 
              ? "bg-emerald-500/20 border border-emerald-500/30" 
              : "bg-slate-700/50 border border-slate-600/50"
          }`}>
            <Package className={`h-6 w-6 ${
              inventoryDone ? "text-emerald-400" : "text-slate-400"
            }`} />
          </div>
          <div className="flex-1">
            <p className="font-medium text-white">Inventaire fait</p>
            <p className="text-xs text-slate-500">Cochez si vous avez mis à jour le stock</p>
          </div>
          <div className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all ${
            inventoryDone 
              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" 
              : "bg-slate-700/50 text-slate-400 border border-slate-600/50"
          }`}>
            <Check className="h-5 w-5" />
          </div>
        </div>
      </GlassTile>

      {/* Summary */}
      {allChecked && (
        <GlassTile className={currentHasIssues ? 'border-orange-500/40' : 'border-emerald-500/40'}>
          <div className="flex items-center gap-4 mb-4">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
              currentHasIssues 
                ? "bg-orange-500/20 border border-orange-500/30" 
                : "bg-emerald-500/20 border border-emerald-500/30"
            }`}>
              {currentHasIssues ? (
                <AlertTriangle className="h-6 w-6 text-orange-400" />
              ) : (
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              )}
            </div>
            <div>
              <p className="font-semibold text-white">
                {currentHasIssues ? 'Problèmes détectés' : 'Tout est en ordre !'}
              </p>
              <p className="text-sm text-slate-400">
                {currentHasIssues 
                  ? `${Object.values(checks).filter(v => v === 'manque').length} point(s) à signaler`
                  : 'Tous les points sont validés'
                }
              </p>
            </div>
          </div>
          
          {/* Issues list */}
          {currentHasIssues && (
            <div className="mb-4 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <p className="text-sm text-orange-300 mb-2 font-medium">Points signalés :</p>
              <ul className="space-y-1">
                {checkItems
                  .filter(item => checks[item.id] === "manque")
                  .map(item => (
                    <li key={item.id} className="text-sm text-orange-400 flex items-center gap-2">
                      <X className="h-3 w-3" />
                      {item.item_label}
                    </li>
                  ))
                }
              </ul>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={saving}
            className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
              currentHasIssues 
                ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg shadow-orange-500/30" 
                : "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 shadow-lg shadow-emerald-500/30"
            } text-white disabled:opacity-50`}
          >
            {saving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <ClipboardCheck className="h-5 w-5" />
                {currentHasIssues ? "Envoyer le rapport" : "Valider le check-in"}
              </>
            )}
          </button>
        </GlassTile>
      )}
    </div>
  )
}
