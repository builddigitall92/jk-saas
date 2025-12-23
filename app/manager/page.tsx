"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Plus,
  TrendingUp,
  AlertTriangle,
  Package,
  Truck,
  Snowflake,
  Leaf,
  Wine,
  Box,
  ChevronDown,
  ExternalLink,
  RefreshCw,
  Calculator,
  Sparkles,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRealtimeProducts, useRealtimeSuppliers } from "@/lib/hooks/use-realtime"
import { AddObjectiveModal, AddReportDataModal } from "@/components/dashboard-modals"
import { WelcomeHero } from "@/components/dashboard/welcome-hero"
import { AlertsCard } from "@/components/dashboard/alerts-card"
import { DailyTasksCard } from "@/components/dashboard/daily-tasks-card"
import { EstablishmentCard } from "@/components/dashboard/establishment-card"
import { TipCard } from "@/components/dashboard/tip-card"
import { useAuth } from "@/lib/hooks/use-auth"

// Types
interface StockCategory {
  id: string
  name: string
  category: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  status: "ok" | "warning" | "critical"
}

export default function ManagerDashboard() {
  const { products, loading: productsLoading } = useRealtimeProducts()
  const { suppliers, loading: suppliersLoading } = useRealtimeSuppliers()
  const { profile, establishment } = useAuth()

  const [showObjectiveModal, setShowObjectiveModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [stockTotal, setStockTotal] = useState(0)
  const [stockPercentage, setStockPercentage] = useState(0)
  const [stockFilter, setStockFilter] = useState<'all' | 'surgele' | 'frais' | 'sec'>('all')
  const [showStockFilter, setShowStockFilter] = useState(false)
  const [stockCategories, setStockCategories] = useState<StockCategory[]>([
    { id: "1", name: "Surgelés", category: "Congélateur", value: 0, icon: Snowflake, status: "ok" },
    { id: "2", name: "Produits Frais", category: "Réfrigérateur", value: 0, icon: Leaf, status: "ok" },
    { id: "3", name: "Boissons", category: "Cave & Bar", value: 0, icon: Wine, status: "ok" },
    { id: "4", name: "Sec & Épicerie", category: "Stockage", value: 0, icon: Box, status: "ok" },
  ])

  const loading = productsLoading || suppliersLoading

  // Recalculer les données quand les products changent (realtime)
  useEffect(() => {
    if (products && products.length > 0) {
      const filteredProducts = stockFilter === 'all'
        ? products
        : products.filter(p => {
          const cat = ((p as any).category || '').toLowerCase()
          if (stockFilter === 'surgele') return cat.includes('surgel') || cat.includes('congel')
          if (stockFilter === 'frais') return cat.includes('frais') || cat.includes('réfrig')
          if (stockFilter === 'sec') return cat.includes('sec') || cat.includes('épice') || cat.includes('boisson')
          return true
        })

      const total = filteredProducts.reduce((sum, p: any) => sum + ((p.quantity || 0) * (p.unit_price || 0)), 0)
      setStockTotal(total)

      const stockOk = filteredProducts.filter((p: any) => (p.quantity || 0) > (p.min_quantity || 0)).length
      const percentage = filteredProducts.length > 0 ? Math.round((stockOk / filteredProducts.length) * 100) : 0
      setStockPercentage(percentage)

      const categories: Record<string, number> = {}
      products.forEach((p: any) => {
        const cat = p.category || 'Autre'
        categories[cat] = (categories[cat] || 0) + ((p.quantity || 0) * (p.unit_price || 0))
      })

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
  }, [products, stockFilter])

  const addObjective = (objective: any) => {
    console.log('Nouvel objectif:', objective)
  }

  const addReportData = (data: any) => {
    console.log('Nouvelle donnée rapport:', data)
  }

  const refreshData = () => {
    window.location.reload()
  }

  const lowStockCount = products.filter((p: any) => (p.quantity || 0) <= (p.min_quantity || 0)).length

  return (
    <div className="p-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Tableau de bord</h1>
          <p className="text-sm text-white/40 mt-1">Vue d&apos;ensemble de vos opérations</p>
        </div>
        <button
          onClick={refreshData}
          className="group h-11 w-11 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-orange-500/30 flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10"
          title="Actualiser"
        >
          <RefreshCw className={`h-5 w-5 text-white/50 group-hover:text-orange-400 transition-colors ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Main Layout */}
      <div className="space-y-6">

        {/* ROW 1: Welcome + Establishment */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4">
          <WelcomeHero
            userName={profile?.first_name || "Manager"}
            establishmentId={profile?.establishment_id || undefined}
          />
          <EstablishmentCard
            name={establishment?.name || "Mon Établissement"}
            location={establishment?.address || "Localisation non définie"}
          />
        </div>

        {/* ROW 2: Stock + Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
          {/* Stock Card */}
          <Link href="/manager/stock" className="group block relative overflow-hidden rounded-[20px] border border-white/[0.08] shadow-2xl shadow-black/30 transition-all duration-500 hover:border-orange-500/30 hover:shadow-orange-500/10 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-[#1f1814] via-[#1a1410] to-[#151210]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,140,66,0.12),transparent_60%)]" />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0f0d0b] to-transparent" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%)] bg-[length:250%_100%] group-hover:animate-shimmer" />

            <div className="relative p-6">
              {/* Header */}
              <div className="flex items-center gap-2 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-orange-500/40 rounded-full blur-xl" />
                  <div className="relative px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/25 to-red-500/20 border border-orange-500/30 flex items-center gap-2">
                    <Package className="h-4 w-4 text-orange-400" />
                    <span className="text-sm font-bold text-orange-400">Stock</span>
                  </div>
                </div>

                <div className="relative ml-2">
                  <button
                    onClick={(e) => { e.preventDefault(); setShowStockFilter(!showStockFilter) }}
                    className="px-3 py-2 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center gap-1.5 text-xs text-white/60 hover:bg-white/[0.08] hover:border-white/[0.15] transition-all"
                  >
                    {stockFilter === 'all' ? 'Valeur Totale' : stockFilter === 'surgele' ? 'Surgelé' : stockFilter === 'frais' ? 'Frais' : 'Sec'}
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${showStockFilter ? 'rotate-180' : ''}`} />
                  </button>
                  {showStockFilter && (
                    <div className="absolute top-full left-0 mt-2 w-40 rounded-xl bg-[rgba(26,20,16,0.98)] backdrop-blur-xl border border-white/[0.1] shadow-2xl z-20 overflow-hidden animate-fade-up">
                      <div className="p-1.5">
                        {[
                          { key: 'all', label: 'Tout', emoji: '📊' },
                          { key: 'surgele', label: 'Surgelé', emoji: '🧊' },
                          { key: 'frais', label: 'Frais', emoji: '🥬' },
                          { key: 'sec', label: 'Sec', emoji: '📦' }
                        ].map(item => (
                          <button
                            key={item.key}
                            onClick={(e) => { e.preventDefault(); setStockFilter(item.key as any); setShowStockFilter(false) }}
                            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all flex items-center gap-2.5 ${stockFilter === item.key
                                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold shadow-lg'
                                : 'text-white/60 hover:bg-white/[0.08] hover:text-white'
                              }`}
                          >
                            <span className="text-base">{item.emoji}</span>
                            <span>{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="ml-auto opacity-30 group-hover:opacity-60 transition-opacity">
                  <ExternalLink className="h-4 w-4 text-white" />
                </div>
              </div>

              {/* Value Display */}
              <div className="mb-8">
                <p className="text-xs text-white/40 uppercase tracking-wider mb-2 font-medium">Valeur Totale</p>
                <div className="flex items-baseline gap-3">
                  <div className="relative">
                    <div className="absolute -inset-2 bg-gradient-to-r from-orange-500/20 to-transparent blur-xl opacity-60" />
                    <span className="relative text-5xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent tracking-tight">
                      {loading ? "..." : stockTotal.toLocaleString()}
                    </span>
                    <span className="relative text-2xl font-semibold text-white/60 ml-1">€</span>
                  </div>
                  {stockPercentage > 0 && (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${stockPercentage >= 80 ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                        stockPercentage >= 50 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                          'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                      {stockPercentage >= 80 ? '↑' : '↓'} {stockPercentage}%
                    </span>
                  )}
                </div>
              </div>

              {/* Category bars */}
              <div className="space-y-4 mb-5">
                {stockCategories.map((cat) => {
                  const Icon = cat.icon
                  const percentage = stockTotal > 0 ? Math.round((cat.value / stockTotal) * 100) : 0
                  const colors = {
                    '1': { bar: 'from-blue-500 to-cyan-500', text: 'text-blue-400', bg: 'bg-blue-500/10' },
                    '2': { bar: 'from-green-500 to-emerald-500', text: 'text-green-400', bg: 'bg-green-500/10' },
                    '3': { bar: 'from-purple-500 to-pink-500', text: 'text-purple-400', bg: 'bg-purple-500/10' },
                    '4': { bar: 'from-orange-500 to-red-500', text: 'text-orange-400', bg: 'bg-orange-500/10' }
                  }
                  const color = colors[cat.id as keyof typeof colors] || colors['4']

                  return (
                    <div key={cat.id} className="group/cat">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`h-8 w-8 rounded-lg ${color.bg} flex items-center justify-center group-hover/cat:scale-110 transition-transform`}>
                            <Icon className={`h-4 w-4 ${color.text}`} />
                          </div>
                          <span className="text-sm text-white/70 font-medium">{cat.name}</span>
                        </div>
                        <span className="text-sm font-bold text-white/50">{percentage}%</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-white/[0.05] overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${color.bar} transition-all duration-700 ease-out shadow-lg`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Low stock warning */}
              {lowStockCount > 0 && stockTotal > 0 && (
                <div className="relative overflow-hidden p-4 rounded-xl border border-red-500/30 bg-gradient-to-r from-red-500/10 to-transparent">
                  <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
                  <div className="relative flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-red-400">{lowStockCount} produits en rupture imminente</p>
                      <p className="text-xs text-red-400/60">Nécessite une action rapide</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Link>

          {/* Alerts Card */}
          <AlertsCard products={products} />
        </div>

        {/* ROW 3: Tasks + Actions + Tip */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_0.8fr] gap-6">
          {/* Daily Tasks Card */}
          <DailyTasksCard />

          {/* Actions Rapides */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Actions rapides</h3>
              <Sparkles className="h-4 w-4 text-orange-400/50" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/manager/stock" className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[rgba(255,140,66,0.08)] to-[rgba(26,20,16,0.4)] backdrop-blur-xl border border-white/[0.06] p-4 hover:border-orange-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform duration-300 mb-2">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-sm font-bold text-white">Entrée Stock</p>
                  <p className="text-xs text-white/40">Ajouter des produits</p>
                </div>
              </Link>

              <Link href="/manager/suppliers" className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[rgba(59,130,246,0.08)] to-[rgba(26,20,16,0.4)] backdrop-blur-xl border border-white/[0.06] p-4 hover:border-blue-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300 mb-2">
                    <Truck className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-sm font-bold text-white">Fournisseur</p>
                  <p className="text-xs text-white/40">Gérer les contacts</p>
                </div>
              </Link>

              <Link href="/manager/orders" className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[rgba(34,197,94,0.08)] to-[rgba(26,20,16,0.4)] backdrop-blur-xl border border-white/[0.06] p-4 hover:border-green-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/10 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform duration-300 mb-2">
                    <Plus className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-sm font-bold text-white">Commande</p>
                  <p className="text-xs text-white/40">Passer une commande</p>
                </div>
              </Link>

              <Link href="/manager/calculator" className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[rgba(168,85,247,0.08)] to-[rgba(26,20,16,0.4)] backdrop-blur-xl border border-white/[0.06] p-4 hover:border-purple-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300 mb-2">
                    <Calculator className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-sm font-bold text-white">Calculer</p>
                  <p className="text-xs text-white/40">Marges & coûts</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Tip Card */}
          <TipCard />
        </div>
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
