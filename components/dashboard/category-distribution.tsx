"use client"

import { Snowflake, Leaf, Wine, Box, PieChart } from "lucide-react"

interface Product {
    id: string
    name: string
    quantity?: number
    unit_price?: number
    category?: string
}

interface CategoryDistributionProps {
    products: Product[]
    loading?: boolean
}

const categoryConfig = [
    { key: 'surgele', name: 'Surgelés', icon: Snowflake, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/10', text: 'text-blue-400' },
    { key: 'frais', name: 'Produits Frais', icon: Leaf, color: 'from-green-500 to-emerald-500', bg: 'bg-green-500/10', text: 'text-green-400' },
    { key: 'boissons', name: 'Boissons', icon: Wine, color: 'from-purple-500 to-pink-500', bg: 'bg-purple-500/10', text: 'text-purple-400' },
    { key: 'sec', name: 'Sec & Épicerie', icon: Box, color: 'from-orange-500 to-red-500', bg: 'bg-orange-500/10', text: 'text-orange-400' },
]

export function CategoryDistribution({ products, loading = false }: CategoryDistributionProps) {
    // Calculate category values
    const categoryValues = categoryConfig.map(cat => {
        const matchingProducts = products.filter(p => {
            const category = (p.category || '').toLowerCase()
            if (cat.key === 'surgele') return category.includes('surgel') || category.includes('congel')
            if (cat.key === 'frais') return category.includes('frais') || category.includes('réfrig') || category.includes('légume') || category.includes('fruit')
            if (cat.key === 'boissons') return category.includes('boisson') || category.includes('vin') || category.includes('bière')
            if (cat.key === 'sec') return category.includes('sec') || category.includes('épice') || category.includes('conserve')
            return false
        })

        const value = matchingProducts.reduce((sum, p) => sum + ((p.quantity || 0) * (p.unit_price || 0)), 0)
        return { ...cat, value }
    })

    // Add "Autres" category for unmatched products
    const matchedIds = new Set(categoryValues.flatMap(cat =>
        products.filter(p => {
            const category = (p.category || '').toLowerCase()
            return category.includes('surgel') || category.includes('congel') ||
                category.includes('frais') || category.includes('réfrig') || category.includes('légume') || category.includes('fruit') ||
                category.includes('boisson') || category.includes('vin') || category.includes('bière') ||
                category.includes('sec') || category.includes('épice') || category.includes('conserve')
        }).map(p => p.id)
    ))

    const otherValue = products
        .filter(p => !matchedIds.has(p.id))
        .reduce((sum, p) => sum + ((p.quantity || 0) * (p.unit_price || 0)), 0)

    if (otherValue > 0) {
        categoryValues.push({
            key: 'autre',
            name: 'Autres',
            icon: Box,
            color: 'from-gray-500 to-gray-600',
            bg: 'bg-gray-500/10',
            text: 'text-gray-400',
            value: otherValue
        })
    }

    const totalValue = categoryValues.reduce((sum, cat) => sum + cat.value, 0)

    // Sort by value descending
    const sortedCategories = [...categoryValues].sort((a, b) => b.value - a.value)

    // Calculate donut segments
    let currentAngle = 0
    const donutSegments = sortedCategories.map((cat, index) => {
        const percentage = totalValue > 0 ? (cat.value / totalValue) * 100 : 0
        const angle = (percentage / 100) * 360
        const startAngle = currentAngle
        currentAngle += angle

        // Colors for donut
        const colors = ['#f97316', '#22c55e', '#a855f7', '#3b82f6', '#6b7280']

        return {
            ...cat,
            percentage,
            startAngle,
            endAngle: currentAngle,
            color: colors[index % colors.length]
        }
    })

    return (
        <div className="group relative overflow-hidden rounded-[16px] border border-white/[0.08] bg-gradient-to-br from-[#1a1410]/90 via-[#1f1612]/80 to-[#1a1410]/90 backdrop-blur-xl shadow-xl shadow-black/20 transition-all duration-500 hover:border-white/[0.12]">
            {/* Ambient glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,140,66,0.06),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative p-5">
                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                        <PieChart className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-white">Répartition par catégorie</h3>
                        <p className="text-xs text-white/40">Capital immobilisé par famille</p>
                    </div>
                </div>

                {/* Donut Chart + Legend */}
                <div className="flex items-center gap-6">
                    {/* Donut Chart */}
                    <div className="relative w-32 h-32 flex-shrink-0">
                        {loading ? (
                            <div className="w-full h-full rounded-full bg-white/10 animate-pulse" />
                        ) : (
                            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                {donutSegments.map((segment, index) => {
                                    const radius = 40
                                    const circumference = 2 * Math.PI * radius
                                    const strokeDasharray = (segment.percentage / 100) * circumference
                                    const strokeDashoffset = donutSegments
                                        .slice(0, index)
                                        .reduce((sum, s) => sum + (s.percentage / 100) * circumference, 0)

                                    return (
                                        <circle
                                            key={segment.key}
                                            cx="50"
                                            cy="50"
                                            r={radius}
                                            fill="none"
                                            stroke={segment.color}
                                            strokeWidth="12"
                                            strokeDasharray={`${strokeDasharray} ${circumference}`}
                                            strokeDashoffset={-strokeDashoffset}
                                            className="transition-all duration-500 hover:opacity-80"
                                        />
                                    )
                                })}
                                {/* Center circle */}
                                <circle cx="50" cy="50" r="28" fill="rgba(26,20,16,0.95)" />
                            </svg>
                        )}
                        {/* Center text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-lg font-bold text-white">
                                {loading ? '...' : `${Math.round(totalValue).toLocaleString('fr-FR')}`}
                            </span>
                            <span className="text-[10px] text-white/40">€ total</span>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex-1 space-y-2">
                        {sortedCategories.slice(0, 4).map((cat) => {
                            const Icon = cat.icon
                            const percentage = totalValue > 0 ? Math.round((cat.value / totalValue) * 100) : 0

                            return (
                                <div key={cat.key} className="flex items-center gap-2 group/item">
                                    <div className={`h-6 w-6 rounded-lg ${cat.bg} flex items-center justify-center flex-shrink-0`}>
                                        <Icon className={`h-3.5 w-3.5 ${cat.text}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-white/70 truncate">{cat.name}</span>
                                            <span className="text-xs font-bold text-white/50">{percentage}%</span>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden mt-1">
                                            <div
                                                className={`h-full rounded-full bg-gradient-to-r ${cat.color} transition-all duration-700 ease-out`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
