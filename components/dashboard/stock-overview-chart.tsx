"use client"

import { useState } from "react"
import { BarChart3, TrendingUp, Package, ChevronDown } from "lucide-react"

interface Product {
    id: string
    name: string
    quantity?: number
    unit_price?: number
    category?: string
    created_at?: string
}

interface StockOverviewChartProps {
    products: Product[]
    loading?: boolean
}

type ViewMode = 'value' | 'quantity' | 'rotation'
type Period = '7d' | '30d' | '90d'

export function StockOverviewChart({ products, loading = false }: StockOverviewChartProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('value')
    const [period, setPeriod] = useState<Period>('30d')
    const [showPeriodDropdown, setShowPeriodDropdown] = useState(false)

    // Calculate data based on view mode
    const stockValue = products.reduce((sum, p) => sum + ((p.quantity || 0) * (p.unit_price || 0)), 0)
    const stockQuantity = products.reduce((sum, p) => sum + (p.quantity || 0), 0)

    // Generate simulated historical data for the chart
    const periodDays = period === '7d' ? 7 : period === '30d' ? 30 : 90
    const chartData = Array.from({ length: periodDays }, (_, i) => {
        const dayFactor = 0.85 + (Math.random() * 0.3) // Random variation between 85% and 115%
        const trendFactor = 1 + ((i / periodDays) * 0.1) // Slight upward trend

        if (viewMode === 'value') {
            return Math.round(stockValue * dayFactor * trendFactor * (0.8 + (i / periodDays) * 0.2))
        } else if (viewMode === 'quantity') {
            return Math.round(stockQuantity * dayFactor * trendFactor * (0.8 + (i / periodDays) * 0.2))
        } else {
            // Days of inventory simulation
            return Math.round(15 + Math.random() * 20) // 15-35 days
        }
    })

    // Find max value for scaling
    const maxValue = Math.max(...chartData, 1)

    // Get labels for period
    const getLabels = () => {
        const now = new Date()
        if (period === '7d') {
            return Array.from({ length: 7 }, (_, i) => {
                const date = new Date(now)
                date.setDate(date.getDate() - (6 - i))
                return date.toLocaleDateString('fr-FR', { weekday: 'short' })
            })
        } else if (period === '30d') {
            return Array.from({ length: 6 }, (_, i) => {
                const date = new Date(now)
                date.setDate(date.getDate() - (25 - i * 5))
                return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
            })
        } else {
            return Array.from({ length: 4 }, (_, i) => {
                const date = new Date(now)
                date.setMonth(date.getMonth() - (3 - i))
                return date.toLocaleDateString('fr-FR', { month: 'short' })
            })
        }
    }

    const labels = getLabels()
    const displayData = period === '7d'
        ? chartData
        : period === '30d'
            ? [chartData[0], chartData[5], chartData[10], chartData[15], chartData[20], chartData[29]]
            : [chartData[0], chartData[30], chartData[60], chartData[89]]

    const formatValue = (val: number) => {
        if (viewMode === 'value') {
            return `${val.toLocaleString('fr-FR')} €`
        } else if (viewMode === 'quantity') {
            return `${val.toLocaleString('fr-FR')} unités`
        } else {
            return `${val} jours`
        }
    }

    return (
        <div className="group relative overflow-hidden rounded-[20px] border border-white/[0.08] shadow-2xl shadow-black/30 transition-all duration-500 hover:border-white/[0.12]">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1f1814] via-[#1a1410] to-[#151210]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,140,66,0.08),transparent_60%)]" />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0f0d0b] to-transparent" />

            <div className="relative p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                            <BarChart3 className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Vue globale stock</h3>
                            <p className="text-xs text-white/40">Évolution sur {period === '7d' ? '7 jours' : period === '30d' ? '30 jours' : '90 jours'}</p>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2">
                        {/* View Mode Toggles */}
                        <div className="flex items-center rounded-lg bg-white/[0.05] border border-white/[0.08] p-1">
                            {[
                                { key: 'value', label: '€', icon: null },
                                { key: 'quantity', label: 'Qté', icon: Package },
                                { key: 'rotation', label: 'Rotation', icon: TrendingUp }
                            ].map((mode) => (
                                <button
                                    key={mode.key}
                                    onClick={() => setViewMode(mode.key as ViewMode)}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === mode.key
                                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                                            : 'text-white/50 hover:text-white hover:bg-white/[0.05]'
                                        }`}
                                >
                                    {mode.label}
                                </button>
                            ))}
                        </div>

                        {/* Period Selector */}
                        <div className="relative">
                            <button
                                onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-xs text-white/60 hover:bg-white/[0.08] hover:border-white/[0.15] transition-all"
                            >
                                {period === '7d' ? '7 jours' : period === '30d' ? '30 jours' : '90 jours'}
                                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showPeriodDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            {showPeriodDropdown && (
                                <div className="absolute top-full right-0 mt-2 w-32 rounded-xl bg-[rgba(26,20,16,0.98)] backdrop-blur-xl border border-white/[0.1] shadow-2xl z-20 overflow-hidden animate-fade-up">
                                    <div className="p-1.5">
                                        {(['7d', '30d', '90d'] as Period[]).map((p) => (
                                            <button
                                                key={p}
                                                onClick={() => { setPeriod(p); setShowPeriodDropdown(false) }}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${period === p
                                                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold'
                                                        : 'text-white/60 hover:bg-white/[0.08] hover:text-white'
                                                    }`}
                                            >
                                                {p === '7d' ? '7 jours' : p === '30d' ? '30 jours' : '90 jours'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Current Value Display */}
                <div className="mb-6">
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-1">
                        {viewMode === 'value' ? 'Valeur actuelle' : viewMode === 'quantity' ? 'Quantité totale' : 'Rotation moyenne'}
                    </p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-white">
                            {loading ? '...' : formatValue(displayData[displayData.length - 1])}
                        </span>
                    </div>
                </div>

                {/* Chart */}
                <div className="relative h-48">
                    {loading ? (
                        <div className="h-full w-full bg-white/5 rounded-lg animate-pulse" />
                    ) : (
                        <>
                            {/* Y-axis labels */}
                            <div className="absolute left-0 top-0 bottom-6 w-16 flex flex-col justify-between text-[10px] text-white/40">
                                <span>{Math.round(maxValue).toLocaleString('fr-FR')}</span>
                                <span>{Math.round(maxValue * 0.5).toLocaleString('fr-FR')}</span>
                                <span>0</span>
                            </div>

                            {/* Chart area */}
                            <div className="ml-16 h-full flex items-end gap-2">
                                {displayData.map((value, index) => {
                                    const height = (value / maxValue) * 100
                                    return (
                                        <div
                                            key={index}
                                            className="flex-1 flex flex-col items-center group/bar"
                                        >
                                            {/* Tooltip */}
                                            <div className="opacity-0 group-hover/bar:opacity-100 transition-opacity mb-1 px-2 py-1 rounded-lg bg-white/10 text-[10px] text-white whitespace-nowrap">
                                                {formatValue(value)}
                                            </div>

                                            {/* Bar */}
                                            <div className="w-full flex-1 flex items-end">
                                                <div
                                                    className="w-full rounded-t-lg bg-gradient-to-t from-orange-500 to-orange-400 transition-all duration-500 hover:from-orange-400 hover:to-yellow-400 shadow-lg shadow-orange-500/20"
                                                    style={{ height: `${height}%` }}
                                                />
                                            </div>

                                            {/* X-axis label */}
                                            <span className="mt-2 text-[10px] text-white/40">
                                                {labels[index]}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
