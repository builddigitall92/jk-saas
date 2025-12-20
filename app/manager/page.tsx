"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Check,
  AlertTriangle,
  Package,
  Truck,
  Users,
  ArrowUpRight,
  Snowflake,
  Leaf,
  Wine,
  Box,
  ChevronDown,
  ExternalLink,
  RefreshCw,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRealtimeProducts, useRealtimeSuppliers } from "@/lib/hooks/use-realtime"
import { AddObjectiveModal, AddReportDataModal } from "@/components/dashboard-modals"

// Types
interface StockCategory {
  id: string
  name: string
  category: string
  value: number
  icon: any
  status: "ok" | "warning" | "critical"
}

interface Supplier {
  id: string
  name: string
  lastOrder: string
  totalSpent: number
  status: "active" | "pending" | "inactive"
}

// Donut Chart
function DonutChart({ percentage, size = 100 }: { percentage: number; size?: number }) {
  const strokeWidth = 10
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="sg-donut" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" className="sg-donut-bg" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" className="sg-donut-ring" strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} />
      </svg>
      <div className="sg-donut-center">
        <span className="text-xl font-bold text-[var(--text-primary)]">{percentage}%</span>
      </div>
    </div>
  )
}

// Bar Chart
function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const maxValue = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="flex items-end gap-1.5 h-20">
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center gap-1">
          <div className="sg-bar w-full min-h-[3px]" style={{ height: `${(item.value / maxValue) * 100}%` }} />
          <span className="text-[9px] text-[var(--text-muted)]">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

export default function ManagerDashboard() {
  const { products, loading: productsLoading } = useRealtimeProducts()
  const { suppliers, loading: suppliersLoading } = useRealtimeSuppliers()
  
  const [showObjectiveModal, setShowObjectiveModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [stockTotal, setStockTotal] = useState(0)
  const [stockPercentage, setStockPercentage] = useState(0)
  const [ordersTotal, setOrdersTotal] = useState(0)
  const [stockCategories, setStockCategories] = useState<StockCategory[]>([
    { id: "1", name: "Surgelés", category: "Congélateur", value: 0, icon: Snowflake, status: "ok" },
    { id: "2", name: "Produits Frais", category: "Réfrigérateur", value: 0, icon: Leaf, status: "ok" },
    { id: "3", name: "Boissons", category: "Cave & Bar", value: 0, icon: Wine, status: "ok" },
    { id: "4", name: "Sec & Épicerie", category: "Stockage", value: 0, icon: Box, status: "ok" },
  ])
  const [reportData, setReportData] = useState([
    { label: "Jan", value: 0 },
    { label: "Fév", value: 0 },
    { label: "Mar", value: 0 },
    { label: "Avr", value: 0 },
    { label: "Mai", value: 0 },
  ])

  const loading = productsLoading || suppliersLoading

  // Recalculer les données quand les products changent (realtime)
  useEffect(() => {
    if (products && products.length > 0) {
      // Calculer la valeur totale du stock
      const total = products.reduce((sum, p) => sum + ((p.quantity || 0) * (p.unit_price || 0)), 0)
      setStockTotal(total)
      
      // Calculer le pourcentage de stock (basé sur les seuils min)
      const stockOk = products.filter(p => (p.quantity || 0) > (p.min_quantity || 0)).length
      const percentage = products.length > 0 ? Math.round((stockOk / products.length) * 100) : 0
      setStockPercentage(percentage)
      
      // Regrouper par catégorie
      const categories: Record<string, number> = {}
      products.forEach(p => {
        const cat = p.category || 'Autre'
        categories[cat] = (categories[cat] || 0) + ((p.quantity || 0) * (p.unit_price || 0))
      })
      
      // Mettre à jour les catégories de stock
      setStockCategories(prev => prev.map(cat => {
        const matchingCat = Object.entries(categories).find(([key]) => 
          key.toLowerCase().includes(cat.name.toLowerCase().substring(0, 4))
        )
        return {
          ...cat,
          value: matchingCat ? matchingCat[1] : 0,
          status: matchingCat && matchingCat[1] > 0 ? "ok" : "warning" as const
        }
      }))
    } else {
      setStockTotal(0)
      setStockPercentage(0)
    }
  }, [products])

  // Charger le total des commandes
  useEffect(() => {
    async function fetchOrders() {
      const { data: orders } = await supabase.from('orders').select('*')
      if (orders) {
        const total = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
        setOrdersTotal(total)
      }
    }
    fetchOrders()
  }, [])

  const addObjective = (objective: any) => {
    console.log('Nouvel objectif:', objective)
    // TODO: Sauvegarder dans Supabase
  }

  const addReportData = (data: any) => {
    setReportData(prev => [...prev, data])
    // TODO: Sauvegarder dans Supabase
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ok": case "active": return "sg-status-positive"
      case "warning": case "pending": return "sg-status-warning"
      case "critical": case "inactive": return "sg-status-negative"
      default: return ""
    }
  }

  const refreshData = () => {
    window.location.reload()
  }

  return (
    <div className="p-5">
      {/* Header compact */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Dashboard</h1>
        <button onClick={refreshData} className="sg-icon-btn" title="Actualiser">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Grille de Cartes */}
      <div className="sg-dashboard-grid">
        
        {/* Carte 1: Stock - Style Hero */}
        <Link href="/manager/stock" className="sg-card-glass sg-animate-fade-in block">
          <div className="sg-card-body">
            {/* Header avec pills */}
            <div className="flex items-center gap-2 mb-6">
              <div className="sg-pill">
                <div className="sg-pill-icon">
                  <Package className="h-3 w-3 text-white" />
                </div>
                <span>Stock</span>
              </div>
              <div className="sg-pill">
                Valeur Totale
                <ChevronDown className="h-3 w-3 ml-1" />
              </div>
              <div className="sg-pill ml-auto !p-2">
                <ExternalLink className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Valeur géante */}
            <div className="mb-4">
              <div className="sg-value-hero">
                {loading ? "..." : stockPercentage}<span>%</span>
              </div>
            </div>

            {/* Texte descriptif */}
            <div className="mb-5">
              <p className="text-[var(--text-primary)] font-semibold text-sm mb-1">
                {stockTotal > 0 ? `€${stockTotal.toLocaleString()} en stock` : "Aucun produit en stock"}
              </p>
              <p className="text-[var(--text-muted)] text-xs">
                {stockTotal > 0 
                  ? "Cliquez pour gérer votre inventaire" 
                  : "Ajoutez vos premiers produits pour commencer"}
              </p>
            </div>

            {/* Images pilules */}
            <div className="flex gap-3">
              <div className="sg-image-pill h-14 w-24 bg-gradient-to-br from-orange-600/40 to-red-600/30 flex items-center justify-center">
                <Snowflake className="h-6 w-6 text-white/80" />
              </div>
              <div className="sg-image-pill h-14 w-24 bg-gradient-to-br from-green-600/40 to-emerald-600/30 flex items-center justify-center">
                <Leaf className="h-6 w-6 text-white/80" />
              </div>
            </div>
          </div>
        </Link>

        {/* Carte 2: Budget / Achats */}
        <Link href="/manager/orders" className="sg-card sg-animate-fade-in block">
          <div className="sg-card-body">
            <div className="flex items-center justify-between mb-3">
              <span className="sg-card-title">Budget Achats</span>
              <ArrowUpRight className="h-4 w-4 text-[var(--text-muted)]" />
            </div>

            <div className="mb-4">
              <p className="text-[10px] text-[var(--text-muted)]">Total dépensé</p>
              <p className="sg-card-value">€ {loading ? "..." : ordersTotal.toLocaleString()}</p>
            </div>

            <div className="space-y-2">
              {stockCategories.slice(0, 4).map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.id} className="flex items-center gap-2.5 group">
                    <div className={`sg-checkbox ${item.value > 0 ? "checked" : ""}`}>
                      {item.value > 0 && <Check className="h-2.5 w-2.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[var(--text-primary)] group-hover:text-[#ff8c42] transition-colors">{item.name}</p>
                    </div>
                    <span className="text-xs text-[var(--text-muted)]">€{item.value.toLocaleString()}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </Link>

        {/* Carte 3: Rapport */}
        <div className="sg-card sg-animate-fade-in">
          <div className="sg-card-body">
            <div className="flex items-center justify-between mb-3">
              <span className="sg-card-title">Rapport</span>
              <button onClick={() => setShowReportModal(true)} className="sg-icon-btn !w-7 !h-7">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <BarChart data={reportData} />

            <div className="flex items-center gap-3 mt-3 text-[10px]">
              <div className="flex items-center gap-1">
                {stockTotal > 0 ? (
                  <>
                    <TrendingUp className="h-3 w-3 sg-text-positive" />
                    <span className="sg-text-positive">Actif</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-3 w-3 sg-text-negative" />
                    <span className="sg-text-negative">Aucune donnée</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Carte 4: Détail Stock */}
        <Link href="/manager/stock" className="sg-card sg-card-glow sg-animate-fade-in block">
          <div className="sg-card-body">
            <div className="flex items-center justify-between mb-3">
              <span className="sg-card-title">Détail Stock</span>
              <ArrowUpRight className="h-4 w-4 text-[var(--text-muted)]" />
            </div>

            <div className="mb-4">
              <p className="text-[10px] text-[var(--text-muted)]">Valeur totale</p>
              <p className="sg-card-value">€ {loading ? "..." : stockTotal.toLocaleString()}</p>
            </div>

            <div className="space-y-2">
              {stockCategories.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.id} className="flex items-center gap-2.5 group">
                    <div className={`sg-checkbox ${item.value > 0 ? "checked" : ""}`}>
                      {item.value > 0 ? <Check className="h-2.5 w-2.5" /> : <AlertTriangle className="h-2.5 w-2.5 text-amber-400" />}
                    </div>
                    <div className="h-7 w-7 rounded-lg bg-[var(--secondary)] flex items-center justify-center group-hover:bg-[#ff8c42]/20 transition-colors">
                      <Icon className="h-3.5 w-3.5 text-[var(--text-muted)] group-hover:text-[#ff8c42] transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[var(--text-primary)] group-hover:text-[#ff8c42] transition-colors">{item.name}</p>
                      <p className="text-[9px] text-[var(--text-muted)]">{item.category}</p>
                    </div>
                    <span className="text-xs text-[var(--text-muted)]">€{item.value.toLocaleString()}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </Link>

        {/* Carte 5: Fournisseurs */}
        <Link href="/manager/suppliers" className="sg-card sg-animate-fade-in block">
          <div className="sg-card-body">
            <div className="flex items-center justify-between mb-3">
              <span className="sg-card-title">Fournisseurs ({suppliers.length})</span>
              <ArrowUpRight className="h-4 w-4 text-[var(--text-muted)]" />
            </div>

            {suppliers.length > 0 ? (
              <div className="space-y-2">
                {suppliers.slice(0, 3).map((sup: any) => (
                  <div key={sup.id} className="flex items-center gap-2.5 group">
                    <div className={`sg-status-dot ${getStatusColor('active')}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[var(--text-primary)] group-hover:text-[#ff8c42] transition-colors">{sup.name}</p>
                      <p className="text-[9px] text-[var(--text-muted)]">Actif</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-xs text-[var(--text-muted)]">Aucun fournisseur</p>
                <p className="text-[10px] text-[var(--text-muted)]">Cliquez pour en ajouter</p>
              </div>
            )}

            {/* Alerte */}
            {stockTotal === 0 && (
              <div className="mt-4 pt-3 border-t border-[var(--border)]">
                <div className="flex items-center gap-2.5 bg-[rgba(239,68,68,0.08)] rounded-xl p-2.5 border border-[rgba(239,68,68,0.12)]">
                  <div className="h-8 w-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-[var(--text-primary)] font-medium">Stock vide</p>
                    <p className="text-[9px] text-[var(--text-muted)]">Ajoutez des produits</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Link>

        {/* Carte 6: Objectifs */}
        <div className="sg-card sg-animate-fade-in">
          <div className="sg-card-body">
            <div className="flex items-center justify-between mb-3">
              <span className="sg-card-title">Objectifs</span>
              <button onClick={() => setShowObjectiveModal(true)} className="sg-icon-btn !w-7 !h-7">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-3">
              <DonutChart percentage={stockPercentage} size={90} />
              <div>
                <p className="text-[10px] text-[var(--text-muted)]">Stock optimal</p>
                <p className="text-base font-bold text-[var(--text-primary)]">100%</p>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">Atteint</p>
                <p className="text-sm font-semibold sg-text-accent">{stockPercentage}%</p>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border)]">
              <p className="text-[10px] text-[var(--text-muted)] mb-1">Conseil</p>
              <p className="text-[11px] text-[var(--text-secondary)] italic leading-relaxed">
                {stockTotal > 0 
                  ? '"Surveillez vos niveaux de stock pour éviter les ruptures."'
                  : '"Commencez par ajouter vos produits dans la section Stocks."'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Rapides */}
      <div className="mt-5 grid grid-cols-4 gap-3">
        <Link href="/manager/stock" className="sg-card sg-card-hover-effect">
          <div className="p-3 flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-orange-500/20 flex items-center justify-center group-hover:bg-orange-500/30 transition-all">
              <Package className="h-4 w-4 text-orange-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-[var(--text-primary)]">Stocks</p>
              <p className="text-[9px] text-[var(--text-muted)]">Inventaire</p>
            </div>
            <ArrowUpRight className="h-3.5 w-3.5 text-[var(--text-muted)]" />
          </div>
        </Link>

        <Link href="/manager/orders" className="sg-card sg-card-hover-effect">
          <div className="p-3 flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-blue-500/20 flex items-center justify-center transition-all">
              <Truck className="h-4 w-4 text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-[var(--text-primary)]">Achats</p>
              <p className="text-[9px] text-[var(--text-muted)]">Fournisseurs</p>
            </div>
            <ArrowUpRight className="h-3.5 w-3.5 text-[var(--text-muted)]" />
          </div>
        </Link>

        <Link href="/manager/reports" className="sg-card sg-card-hover-effect">
          <div className="p-3 flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-green-500/20 flex items-center justify-center transition-all">
              <TrendingUp className="h-4 w-4 text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-[var(--text-primary)]">Rapports</p>
              <p className="text-[9px] text-[var(--text-muted)]">Analyses</p>
            </div>
            <ArrowUpRight className="h-3.5 w-3.5 text-[var(--text-muted)]" />
          </div>
        </Link>

        <Link href="/manager/feedback" className="sg-card sg-card-hover-effect">
          <div className="p-3 flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-purple-500/20 flex items-center justify-center transition-all">
              <Users className="h-4 w-4 text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-[var(--text-primary)]">Équipe</p>
              <p className="text-[9px] text-[var(--text-muted)]">Feedbacks</p>
            </div>
            <ArrowUpRight className="h-3.5 w-3.5 text-[var(--text-muted)]" />
          </div>
        </Link>
      </div>

      {/* Modals */}
      <AddObjectiveModal 
        isOpen={showObjectiveModal} 
        onClose={() => setShowObjectiveModal(false)}
        onAdd={addObjective}
      />
      <AddReportDataModal 
        isOpen={showReportModal} 
        onClose={() => setShowReportModal(false)}
        onAdd={addReportData}
      />
    </div>
  )
}
