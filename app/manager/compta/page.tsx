"use client"

import { useState, useMemo, useEffect } from "react"
import {
  Receipt,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Circle,
  FileText,
  Download,
  Calendar,
  Euro,
  Percent,
  Shield,
  Calculator,
  ChevronDown,
  ChevronRight,
  Info,
  Loader2,
  Lock,
  Sparkles,
  Building2,
  Clock,
  PieChart,
  Target,
  ShoppingCart,
  ArrowRight,
  Package,
  RefreshCw,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"
import { useCompta } from "@/lib/hooks/use-compta"
import { useSubscription } from "@/lib/hooks/use-subscription"

// Types pour le composant
type SeuilNiveau = 'vert' | 'jaune' | 'rouge'
type Trimestre = 1 | 2 | 3 | 4

interface ChecklistItem {
  id: string
  label: string
  checked: boolean
  required: boolean
}

// Helpers
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

const formatPercent = (value: number): string => {
  return `${Math.round(value)}%`
}

const getTrimestreLabel = (t: number, annee: number): string => {
  const mois: Record<number, string> = {
    1: 'Janvier → Mars',
    2: 'Avril → Juin', 
    3: 'Juillet → Septembre',
    4: 'Octobre → Décembre'
  }
  return `${mois[t]} ${annee}`
}

const getNiveauColor = (niveau: SeuilNiveau) => {
  switch (niveau) {
    case 'vert': return { bg: 'from-emerald-500/20 to-emerald-600/10', text: 'text-emerald-400', border: 'border-emerald-500/30', icon: '🟢' }
    case 'jaune': return { bg: 'from-amber-500/20 to-amber-600/10', text: 'text-amber-400', border: 'border-amber-500/30', icon: '🟡' }
    case 'rouge': return { bg: 'from-red-500/20 to-red-600/10', text: 'text-red-400', border: 'border-red-500/30', icon: '🔴' }
  }
}

const getConfianceBadge = (confiance: number) => {
  if (confiance >= 0.9) return { label: 'Excellente', color: 'text-emerald-400 bg-emerald-500/15', icon: '🟢' }
  if (confiance >= 0.75) return { label: 'Bonne', color: 'text-amber-400 bg-amber-500/15', icon: '🟡' }
  return { label: 'À vérifier', color: 'text-red-400 bg-red-500/15', icon: '🔴' }
}

// Composant Badge de confiance
function ConfidenceBadge({ confiance }: { confiance: number }) {
  const badge = getConfianceBadge(confiance)
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${badge.color}`}>
      <span>{badge.icon}</span>
      <span>{formatPercent(confiance * 100)}</span>
    </span>
  )
}

// Composant Carte KPI
function KPICard({ 
  icon: Icon, 
  label, 
  value, 
  subvalue, 
  variant = 'default',
  trend,
  isPro,
  isLocked
}: { 
  icon: React.ElementType
  label: string
  value: string
  subvalue?: string
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'amber'
  trend?: { value: number; label: string }
  isPro?: boolean
  isLocked?: boolean
}) {
  const variants = {
    default: { bg: 'from-slate-500/20 to-slate-600/10', text: 'text-white', border: 'border-slate-500/30', iconBg: 'bg-slate-500/20' },
    success: { bg: 'from-emerald-500/20 to-emerald-600/10', text: 'text-emerald-400', border: 'border-emerald-500/30', iconBg: 'bg-emerald-500/20' },
    warning: { bg: 'from-amber-500/20 to-amber-600/10', text: 'text-amber-400', border: 'border-amber-500/30', iconBg: 'bg-amber-500/20' },
    danger: { bg: 'from-red-500/20 to-red-600/10', text: 'text-red-400', border: 'border-red-500/30', iconBg: 'bg-red-500/20' },
    amber: { bg: 'from-amber-600/20 to-orange-600/10', text: 'text-amber-400', border: 'border-amber-500/30', iconBg: 'bg-amber-500/20' },
  }
  const v = variants[variant]

  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${v.bg} border ${v.border} backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}>
      {isPro && (
        <div className="absolute top-2 right-2">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white">PRO</span>
        </div>
      )}
      {isLocked && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
          <div className="flex flex-col items-center gap-2">
            <Lock className="w-6 h-6 text-slate-400" />
            <span className="text-xs text-slate-400">Plan Pro requis</span>
          </div>
        </div>
      )}
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${v.iconBg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${v.text}`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend.value >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend.value >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}</span>
          </div>
        )}
      </div>
      <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-bold ${v.text}`}>{value}</p>
      {subvalue && <p className="text-xs text-slate-500 mt-1">{subvalue}</p>}
    </div>
  )
}

// Composant Checklist
function ChecklistSection({ 
  items, 
  onToggle, 
  allChecked,
  isPro 
}: { 
  items: ChecklistItem[]
  onToggle: (id: string) => void
  allChecked: boolean
  isPro: boolean
}) {
  const progress = items.filter(i => i.checked).length
  const total = items.length
  
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-900/30 to-orange-900/20 border border-amber-500/20 backdrop-blur-xl p-6">
      {!isPro && (
        <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
          <div className="flex flex-col items-center gap-3 text-center px-6">
            <Lock className="w-8 h-8 text-amber-400" />
            <p className="text-sm text-slate-300 font-medium">Checklist & Export Pro</p>
            <p className="text-xs text-slate-400">Disponible avec le plan Pro</p>
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-amber-400" />
          Vérifications Requises
        </h3>
        <span className={`px-3 py-1 rounded-full text-sm font-bold ${allChecked ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>
          {progress}/{total}
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="w-full h-2 bg-slate-700/50 rounded-full mb-5 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
          style={{ width: `${(progress / total) * 100}%` }}
        />
      </div>
      
      <div className="space-y-3">
        {items.map((item) => (
          <label 
            key={item.id}
            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
              item.checked 
                ? 'bg-emerald-500/10 border border-emerald-500/30' 
                : 'bg-slate-800/30 border border-slate-600/20 hover:bg-slate-700/30'
            }`}
          >
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
              item.checked 
                ? 'bg-emerald-500 text-white' 
                : 'bg-slate-700 border border-slate-500'
            }`}>
              {item.checked && <CheckCircle2 className="w-4 h-4" />}
            </div>
            <span className={`text-sm flex-1 ${item.checked ? 'text-emerald-300' : 'text-slate-300'}`}>
              {item.label}
            </span>
            <input 
              type="checkbox" 
              checked={item.checked}
              onChange={() => onToggle(item.id)}
              className="sr-only"
            />
          </label>
        ))}
      </div>
    </div>
  )
}

// Composant Alerte Seuil
function SeuilAlertCard({ 
  niveau, 
  caCumule, 
  seuil, 
  caRestant,
  isPro
}: { 
  niveau: SeuilNiveau
  caCumule: number
  seuil: number
  caRestant: number
  isPro: boolean
}) {
  const colors = getNiveauColor(niveau)
  
  const getMessage = () => {
    switch (niveau) {
      case 'vert': return "Période tranquille jusqu'à fin d'année"
      case 'jaune': return `Attention : ${formatCurrency(caRestant)} restants avant le seuil`
      case 'rouge': return "Bascule SARL recommandée sous 30 jours"
    }
  }
  
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${colors.bg} border ${colors.border} backdrop-blur-xl`}>
      {!isPro && (
        <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
          <div className="flex flex-col items-center gap-2">
            <Lock className="w-6 h-6 text-amber-400" />
            <span className="text-xs text-slate-400">Plan Pro requis</span>
          </div>
        </div>
      )}
      
      <div className="flex items-start gap-4">
        <div className="text-3xl">{colors.icon}</div>
        <div className="flex-1">
          <h4 className={`text-sm font-semibold ${colors.text} uppercase tracking-wider mb-1`}>
            Alerte Seuil CA {new Date().getFullYear()}
          </h4>
          <p className="text-white text-lg font-bold mb-2">
            {formatCurrency(caCumule)} / {formatCurrency(seuil)}
          </p>
          <p className="text-sm text-slate-300">{getMessage()}</p>
          
          {/* Progress bar */}
          <div className="mt-3 w-full h-3 bg-slate-700/50 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                niveau === 'vert' ? 'bg-emerald-500' :
                niveau === 'jaune' ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(100, (caCumule / seuil) * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Composant Simulateur CFE
function CFESimulator({ 
  caCumule, 
  estimerCFE,
  isPro 
}: { 
  caCumule: number
  estimerCFE: (ca: number) => number
  isPro: boolean
}) {
  const [caSimule, setCaSimule] = useState(caCumule || 50000)
  const cfeEstime = estimerCFE(caSimule)
  const impactMarge = caSimule > 0 ? (cfeEstime / caSimule) * 100 : 0
  
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-900/30 to-purple-900/20 border border-violet-500/20 backdrop-blur-xl p-6">
      {!isPro && (
        <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
          <div className="flex flex-col items-center gap-3 text-center px-6">
            <Lock className="w-8 h-8 text-violet-400" />
            <p className="text-sm text-slate-300 font-medium">Simulateur CFE Pro</p>
            <p className="text-xs text-slate-400">Disponible avec le plan Pro</p>
          </div>
        </div>
      )}
      
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
          <Calculator className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">🔮 CFE Estimé {new Date().getFullYear() + 1}</h3>
          <p className="text-xs text-slate-400">Cotisation Foncière des Entreprises</p>
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm text-slate-400 mb-2">
          CA supposé {new Date().getFullYear() + 1}
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="0"
            max="200000"
            step="1000"
            value={caSimule}
            onChange={(e) => setCaSimule(Number(e.target.value))}
            className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
          />
          <span className="text-lg font-bold text-violet-400 min-w-[100px] text-right">
            {formatCurrency(caSimule)}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-slate-800/50">
          <p className="text-xs text-slate-400 mb-1">CFE Estimé</p>
          <p className="text-2xl font-bold text-violet-400">{formatCurrency(cfeEstime)}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-800/50">
          <p className="text-xs text-slate-400 mb-1">Impact marges</p>
          <p className={`text-2xl font-bold ${impactMarge < 2 ? 'text-emerald-400' : impactMarge < 4 ? 'text-amber-400' : 'text-red-400'}`}>
            -{impactMarge.toFixed(1)}%
          </p>
        </div>
      </div>
      
      {caSimule >= 77700 && (
        <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <p className="text-sm text-amber-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            À {formatCurrency(caSimule)} : SARL = +15% net recommandé
          </p>
        </div>
      )}
    </div>
  )
}

// Composant principal de la page
export default function ComptaPage() {
  const { 
    factures, 
    stats, 
    currentSynthese, 
    currentTrimestre,
    loading,
    calculerSynthese,
    saveSynthese,
    updateChecklist,
    estimerCFE,
    SEUIL_CA_SERVICES
  } = useCompta()
  
  const { subscription, canAccessFeature, loading: subLoading } = useSubscription()
  
  const isPro = canAccessFeature('PRO')
  
  // État local
  const [selectedTrimestre, setSelectedTrimestre] = useState<Trimestre>(currentTrimestre.numero as Trimestre)
  const [selectedAnnee, setSelectedAnnee] = useState(currentTrimestre.annee)
  const [isTrimestreOpen, setIsTrimestreOpen] = useState(false)
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: 'periode', label: `Période ${getTrimestreLabel(selectedTrimestre, selectedAnnee)} correcte`, checked: false, required: true },
    { id: 'factures', label: `Factures manquantes vérifiées (${stats.couvertureMoyenne.toFixed(0)}% couvert)`, checked: false, required: true },
    { id: 'ajustements', label: 'Ajustements manuels effectués si besoin', checked: false, required: true },
    { id: 'confirmation', label: 'Je confirme : déclaration URSSAF manuelle', checked: false, required: true },
  ])
  
  // Calcul de la synthèse pour la période sélectionnée
  const synthesePeriode = useMemo(() => {
    const debut = new Date(selectedAnnee, (selectedTrimestre - 1) * 3, 1)
    const fin = new Date(selectedAnnee, selectedTrimestre * 3, 0)
    return calculerSynthese(debut, fin)
  }, [selectedTrimestre, selectedAnnee, calculerSynthese])
  
  // Update checklist label when data changes
  useEffect(() => {
    setChecklist(prev => prev.map(item => {
      if (item.id === 'periode') {
        return { ...item, label: `Période ${getTrimestreLabel(selectedTrimestre, selectedAnnee)} correcte` }
      }
      if (item.id === 'factures') {
        return { ...item, label: `Factures manquantes vérifiées (${synthesePeriode.couverture.toFixed(0)}% couvert)` }
      }
      return item
    }))
  }, [selectedTrimestre, selectedAnnee, synthesePeriode.couverture])
  
  const handleChecklistToggle = (id: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ))
  }
  
  const allChecked = checklist.every(item => item.checked)
  
  const handleExport = async (type: 'pdf' | 'csv') => {
    if (!allChecked || !isPro) return
    
    // Sauvegarder la synthèse
    const debut = new Date(selectedAnnee, (selectedTrimestre - 1) * 3, 1)
    const fin = new Date(selectedAnnee, selectedTrimestre * 3, 0)
    
    try {
      await saveSynthese(debut, fin, selectedTrimestre, selectedAnnee, {
        periode: true,
        factures: true,
        ajustements: true,
        confirmation: true
      })
      
      // Créer le fichier d'export
      const filename = `URSSAF_Preparatoire_T${selectedTrimestre}_${selectedAnnee}.${type}`
      const content = type === 'csv' 
        ? generateCSV(synthesePeriode, selectedTrimestre, selectedAnnee)
        : generatePDFContent(synthesePeriode, selectedTrimestre, selectedAnnee)
      
      // Download
      const blob = new Blob([content], { type: type === 'csv' ? 'text/csv' : 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Erreur export:', err)
    }
  }
  
  // Générer CSV
  const generateCSV = (synthese: ReturnType<typeof calculerSynthese>, trimestre: number, annee: number): string => {
    const lines = [
      'SYNTHÈSE PRÉPARATOIRE URSSAF',
      `Période;T${trimestre} ${annee}`,
      `Généré le;${new Date().toLocaleDateString('fr-FR')}`,
      '',
      'RÉSUMÉ',
      `CA Estimé HT;${synthese.caEstime.toFixed(2)} €`,
      `CA Encaissé HT;${synthese.caEncaisse.toFixed(2)} €`,
      `TVA Estimée;${synthese.tvaEstimee.toFixed(2)} €`,
      `Couverture;${synthese.couverture.toFixed(1)}%`,
      `Confiance OCR;${(synthese.confiance * 100).toFixed(1)}%`,
      `Nombre de factures;${synthese.nbFactures}`,
      '',
      'DÉTAIL FACTURES',
      'Date;Fournisseur;N° Facture;HT;TVA;TTC;Encaissé'
    ]
    
    synthese.factures.forEach(f => {
      lines.push(`${f.date_facture};${f.fournisseur_nom || ''};${f.numero_facture || ''};${Number(f.prix_ht).toFixed(2)};${Number(f.tva_montant).toFixed(2)};${Number(f.prix_ttc).toFixed(2)};${f.encaisse ? 'Oui' : 'Non'}`)
    })
    
    lines.push('')
    lines.push('DISCLAIMER')
    lines.push('Ce document est une synthèse préparatoire basée sur les données disponibles.')
    lines.push('La déclaration URSSAF reste sous la responsabilité de l\'utilisateur final.')
    
    return lines.join('\n')
  }
  
  // Générer contenu PDF (simplifié - texte)
  const generatePDFContent = (synthese: ReturnType<typeof calculerSynthese>, trimestre: number, annee: number): string => {
    return `
SYNTHÈSE PRÉPARATOIRE URSSAF
============================
Période: T${trimestre} ${annee}
Généré le: ${new Date().toLocaleDateString('fr-FR')}

RÉSUMÉ
------
CA Estimé HT: ${formatCurrency(synthese.caEstime)}
CA Encaissé HT: ${formatCurrency(synthese.caEncaisse)}
TVA Estimée: ${formatCurrency(synthese.tvaEstimee)}
Couverture: ${synthese.couverture.toFixed(1)}%
Confiance OCR: ${(synthese.confiance * 100).toFixed(1)}%
Nombre de factures: ${synthese.nbFactures}

⚠️ DISCLAIMER
Ce document est une synthèse préparatoire basée sur les données disponibles.
La déclaration URSSAF reste sous la responsabilité de l'utilisateur final.
StockGuard ne fournit pas de conseil fiscal ou juridique.
    `.trim()
  }
  
  if (loading || subLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
          </div>
          <p className="text-slate-400 text-sm">Chargement de la comptabilité...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* CSS personnalisé pour le module compta */}
      <style jsx global>{`
        /* ============================================
           COMPTA MODULE - Glassy Amber/Orange Theme
           ============================================ */
        
        .compta-card {
          position: relative;
          overflow: hidden;
          border-radius: 24px;
          padding: 24px;
          background: linear-gradient(145deg, 
            rgba(139, 69, 19, 0.15) 0%,
            rgba(210, 105, 30, 0.08) 50%,
            rgba(10, 10, 15, 0.95) 100%
          );
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(210, 105, 30, 0.2);
          box-shadow: 
            0 20px 50px rgba(0, 0, 0, 0.5),
            0 0 60px rgba(139, 69, 19, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .compta-card:hover {
          transform: translateY(-4px);
          border-color: rgba(210, 105, 30, 0.35);
          box-shadow: 
            0 28px 70px rgba(0, 0, 0, 0.6),
            0 0 80px rgba(139, 69, 19, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }
        
        .compta-card-glow {
          position: absolute;
          top: -100px;
          right: -100px;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: radial-gradient(
            circle at center,
            rgba(210, 105, 30, 0.3) 0%,
            rgba(139, 69, 19, 0.15) 40%,
            transparent 70%
          );
          filter: blur(60px);
          pointer-events: none;
          animation: glowPulse 6s ease-in-out infinite;
        }
        
        @keyframes glowPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        
        .compta-header-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 30px;
          background: linear-gradient(135deg, 
            rgba(139, 69, 19, 0.25) 0%, 
            rgba(210, 105, 30, 0.15) 100%
          );
          border: 1px solid rgba(210, 105, 30, 0.3);
          font-size: 12px;
          font-weight: 600;
          color: #d2691e;
        }
        
        .compta-trimestre-select {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 16px;
          background: rgba(139, 69, 19, 0.15);
          border: 1px solid rgba(210, 105, 30, 0.25);
          color: white;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .compta-trimestre-select:hover {
          background: rgba(139, 69, 19, 0.25);
          border-color: rgba(210, 105, 30, 0.4);
        }
        
        .compta-trimestre-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          z-index: 50;
          min-width: 200px;
          background: linear-gradient(145deg, 
            rgba(26, 20, 15, 0.98) 0%,
            rgba(15, 12, 10, 0.98) 100%
          );
          backdrop-filter: blur(20px);
          border: 1px solid rgba(210, 105, 30, 0.3);
          border-radius: 16px;
          padding: 6px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
        }
        
        .compta-trimestre-option {
          display: block;
          width: 100%;
          padding: 10px 14px;
          text-align: left;
          font-size: 14px;
          color: #e2e8f0;
          background: transparent;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .compta-trimestre-option:hover {
          background: rgba(210, 105, 30, 0.15);
        }
        
        .compta-trimestre-option.active {
          background: linear-gradient(135deg, rgba(210, 105, 30, 0.25) 0%, rgba(139, 69, 19, 0.2) 100%);
          color: #d2691e;
          font-weight: 600;
        }
        
        .compta-export-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border-radius: 14px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .compta-export-btn-primary {
          background: linear-gradient(135deg, #8b4513 0%, #d2691e 100%);
          border: none;
          color: white;
          box-shadow: 0 4px 20px rgba(139, 69, 19, 0.4);
        }
        
        .compta-export-btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(139, 69, 19, 0.5);
        }
        
        .compta-export-btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .compta-export-btn-secondary {
          background: rgba(139, 69, 19, 0.15);
          border: 1px solid rgba(210, 105, 30, 0.3);
          color: #d2691e;
        }
        
        .compta-export-btn-secondary:hover:not(:disabled) {
          background: rgba(139, 69, 19, 0.25);
          border-color: rgba(210, 105, 30, 0.5);
        }
        
        .compta-disclaimer {
          padding: 16px 20px;
          background: linear-gradient(135deg, 
            rgba(251, 146, 60, 0.1) 0%,
            rgba(139, 69, 19, 0.05) 100%
          );
          border-top: 2px solid rgba(251, 146, 60, 0.3);
          border-radius: 0 0 20px 20px;
          margin: 24px -24px -24px -24px;
        }
        
        .shimmer-bg {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.05) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          background-size: 200% 100%;
          animation: shimmer 2s ease-in-out infinite;
        }
        
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-100 tracking-tight flex items-center gap-3">
              <Receipt className="h-7 w-7 text-amber-400" />
              Synthèse Préparatoire
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Préparez votre déclaration URSSAF en 5 minutes
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Sélecteur de trimestre */}
            <div className="relative">
              <button 
                onClick={() => setIsTrimestreOpen(!isTrimestreOpen)}
                className="compta-trimestre-select"
              >
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>T{selectedTrimestre} {selectedAnnee}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isTrimestreOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isTrimestreOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsTrimestreOpen(false)} />
                  <div className="compta-trimestre-dropdown">
                    {[1, 2, 3, 4].map((t) => (
                      <button
                        key={t}
                        className={`compta-trimestre-option ${selectedTrimestre === t ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedTrimestre(t as Trimestre)
                          setIsTrimestreOpen(false)
                        }}
                      >
                        T{t} - {getTrimestreLabel(t, selectedAnnee)}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            
            <span className="compta-header-badge">
              <Shield className="w-4 h-4" />
              Auto-Entrepreneur
            </span>
          </div>
        </div>

        {/* Carte Synthèse Principale */}
        <div className="compta-card">
          <div className="compta-card-glow" />
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Période</p>
                <h2 className="text-xl font-bold text-white">
                  {getTrimestreLabel(selectedTrimestre, selectedAnnee)}
                </h2>
              </div>
              <ConfidenceBadge confiance={synthesePeriode.confiance} />
            </div>
            
            {/* KPIs Grid */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <KPICard 
                icon={Euro}
                label="CA Estimé"
                value={formatCurrency(synthesePeriode.caEstime)}
                subvalue={`${synthesePeriode.nbFactures} factures`}
                variant="amber"
              />
              <KPICard 
                icon={Percent}
                label="Couverture"
                value={formatPercent(synthesePeriode.couverture)}
                subvalue="Factures validées"
                variant={synthesePeriode.couverture >= 90 ? 'success' : synthesePeriode.couverture >= 70 ? 'warning' : 'danger'}
              />
              <KPICard 
                icon={Receipt}
                label="TVA Estimée"
                value={formatCurrency(synthesePeriode.tvaEstimee)}
                subvalue="20% du CA HT"
                variant="default"
              />
              <KPICard 
                icon={Target}
                label="Seuil 2025"
                value={formatCurrency(stats.caRestant)}
                subvalue="Restants avant seuil"
                variant={stats.alerteSeuil === 'vert' ? 'success' : stats.alerteSeuil === 'jaune' ? 'warning' : 'danger'}
              />
            </div>
            
            {/* Boutons Export */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => handleExport('pdf')}
                disabled={!allChecked || !isPro}
                className="compta-export-btn compta-export-btn-primary"
              >
                <FileText className="w-4 h-4" />
                Préparer Document URSSAF
              </button>
              <button 
                onClick={() => handleExport('csv')}
                disabled={!allChecked || !isPro}
                className="compta-export-btn compta-export-btn-secondary"
              >
                <Download className="w-4 h-4" />
                Exporter CSV
              </button>
              {!allChecked && isPro && (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Complétez la checklist pour exporter
                </span>
              )}
            </div>
            
            {/* Disclaimer */}
            <div className="compta-disclaimer">
              <p className="text-xs text-amber-700 dark:text-amber-300/80 flex items-start gap-2">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  📄 StockGuard fournit une synthèse financière préparatoire basée sur les données disponibles.
                  <strong className="block mt-1">La déclaration URSSAF reste sous la responsabilité de l'utilisateur final.</strong>
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Section Achats (depuis Stock) */}
        <div className="compta-card">
          <div className="compta-card-glow" style={{ background: 'radial-gradient(circle at center, rgba(6, 182, 212, 0.3) 0%, rgba(6, 182, 212, 0.1) 40%, transparent 70%)' }} />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/30 flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Achats Marchandises</h3>
                  <p className="text-sm text-slate-400">Intégrés automatiquement depuis Stock</p>
                </div>
              </div>
              
              <Link 
                href="/manager/stock"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium hover:bg-cyan-500/20 transition-colors"
              >
                <Package className="w-4 h-4" />
                Voir dans Stock
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            
            {/* KPIs Achats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/30">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Achats HT Période</p>
                <p className="text-2xl font-bold text-cyan-400">{formatCurrency(stats.totalAchatsHT)}</p>
                <p className="text-xs text-slate-500 mt-1">{stats.nbFacturesAchats} factures</p>
              </div>
              
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/30">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">TVA Déductible</p>
                <p className="text-2xl font-bold text-amber-400">{formatCurrency(stats.totalTVADeductible)}</p>
                <p className="text-xs text-slate-500 mt-1">Estimation sur factures</p>
              </div>
              
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30">
                <p className="text-xs text-emerald-300 uppercase tracking-wider mb-1">CA Net Estimé</p>
                <p className="text-2xl font-bold text-emerald-400">{formatCurrency(stats.caNetEstime)}</p>
                <p className="text-xs text-emerald-300/60 mt-1">CA - Achats</p>
              </div>
              
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/30">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">TVA Nette</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(stats.tvaEstimee - stats.totalTVADeductible)}</p>
                <p className="text-xs text-slate-500 mt-1">Collectée - Déductible</p>
              </div>
            </div>
            
            {/* Dernière facture intégrée */}
            {stats.derniereFactureAchat && (
              <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">Dernière facture intégrée</p>
                      <p className="text-xs text-slate-400">
                        {stats.dernierFournisseur} • {new Date(stats.derniereFactureAchat).toLocaleDateString('fr-FR', { 
                          day: 'numeric', 
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Intégré
                  </span>
                </div>
              </div>
            )}
            
            {/* Info intégration auto */}
            <div className="mt-4 p-3 rounded-xl bg-slate-800/30 border border-slate-700/20">
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <Info className="w-4 h-4 text-cyan-400" />
                <span>
                  <strong className="text-cyan-400">Intégration automatique</strong> : chaque facture validée dans Stock est automatiquement comptabilisée ici.
                  Données estimées basées sur factures intégrées.
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Grid 2 colonnes : Checklist + Alertes */}
        <div className="grid grid-cols-2 gap-6">
          {/* Checklist */}
          <ChecklistSection 
            items={checklist}
            onToggle={handleChecklistToggle}
            allChecked={allChecked}
            isPro={isPro}
          />
          
          {/* Alertes Seuils CA */}
          <SeuilAlertCard 
            niveau={stats.alerteSeuil}
            caCumule={stats.caCumule}
            seuil={SEUIL_CA_SERVICES}
            caRestant={stats.caRestant}
            isPro={isPro}
          />
        </div>

        {/* Simulateur CFE */}
        <CFESimulator 
          caCumule={stats.caCumule}
          estimerCFE={estimerCFE}
          isPro={isPro}
        />

        {/* Section Factures récentes (aperçu) */}
        <div className="compta-card">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                Factures du Trimestre
              </h3>
              <span className="px-3 py-1 rounded-full text-sm bg-slate-700/50 text-slate-300">
                {synthesePeriode.nbFactures} factures
              </span>
            </div>
            
            {synthesePeriode.factures.length > 0 ? (
              <div className="space-y-2">
                {synthesePeriode.factures.slice(0, 5).map((facture) => (
                  <div 
                    key={facture.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        facture.encaisse ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {facture.encaisse ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{facture.fournisseur_nom || 'Fournisseur inconnu'}</p>
                        <p className="text-xs text-slate-400">{new Date(facture.date_facture).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">{formatCurrency(Number(facture.prix_ht))} HT</p>
                      <p className="text-xs text-slate-400">TVA: {formatCurrency(Number(facture.tva_montant))}</p>
                    </div>
                  </div>
                ))}
                
                {synthesePeriode.factures.length > 5 && (
                  <p className="text-center text-sm text-slate-400 py-2">
                    + {synthesePeriode.factures.length - 5} autres factures
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-800/50 flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-slate-500" />
                </div>
                <p className="text-slate-400 mb-2">Aucune facture pour cette période</p>
                <p className="text-xs text-slate-500">
                  Les factures scannées dans l'onglet Stock apparaîtront ici
                </p>
              </div>
            )}
            
            {/* Disclaimer footer */}
            <div className="compta-disclaimer">
              <p className="text-xs text-amber-700 dark:text-amber-300/80 flex items-center gap-2">
                <Info className="w-4 h-4 flex-shrink-0" />
                📄 Document préparatoire uniquement. Déclaration manuelle URSSAF requise.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

