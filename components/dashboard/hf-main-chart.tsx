"use client"

import { useState } from "react"
import { BarChart3, ChevronDown } from "lucide-react"

interface Product {
    id: string
    name: string
    quantity?: number
    unit_price?: number
    category?: string
    created_at?: string
}

interface HFMainChartProps {
    products: Product[]
    loading?: boolean
}

type Period = '1W' | '1M' | '6M' | '1Y'

export function HFMainChart({ products, loading = false }: HFMainChartProps) {
    const [period, setPeriod] = useState<Period>('1M')

    // Calculate current stock value
    const stockValue = products.reduce((sum, p) => sum + ((p.quantity || 0) * (p.unit_price || 0)), 0)

    // Generate monthly data (simulated for demo)
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
    const currentMonth = new Date().getMonth()

    const chartData = months.map((month, index) => {
        // Simulate varying stock values throughout the year
        const variation = 0.7 + (Math.sin((index + currentMonth) / 3) * 0.3) + (Math.random() * 0.1)
        const value = Math.round(stockValue * variation)
        const maxValue = stockValue * 1.2
        const heightPercent = (value / maxValue) * 100

        return {
            month,
            value,
            heightPercent,
            isCurrentMonth: index === currentMonth
        }
    })

    const maxValue = Math.max(...chartData.map(d => d.value), 1)

    return (
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#1c1815] to-[#151210] h-full">
            <div className="p-5 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-semibold text-white/80">Vue globale du stock</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-2 h-2 rounded-full bg-orange-500" />
                            <span className="text-xs text-white/50">
                                {stockValue.toLocaleString('fr-FR')} €
                            </span>
                        </div>
                    </div>

                    {/* Period toggle */}
                    <div className="flex items-center rounded-lg bg-white/[0.03] p-0.5">
                        {(['1W', '1M', '6M', '1Y'] as Period[]).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${period === p
                                        ? 'bg-white/[0.08] text-white'
                                        : 'text-white/40 hover:text-white/60'
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chart area */}
                <div className="flex-1 flex">
                    {/* Y-axis */}
                    <div className="w-10 flex flex-col justify-between text-right pr-2 py-2">
                        <span className="text-[10px] text-white/40">{Math.round(maxValue / 1000)}k</span>
                        <span className="text-[10px] text-white/40">{Math.round(maxValue * 0.8 / 1000)}k</span>
                        <span className="text-[10px] text-white/40">{Math.round(maxValue * 0.6 / 1000)}k</span>
                        <span className="text-[10px] text-white/40">{Math.round(maxValue * 0.4 / 1000)}k</span>
                        <span className="text-[10px] text-white/40">{Math.round(maxValue * 0.2 / 1000)}k</span>
                        <span className="text-[10px] text-white/40">0</span>
                    </div>

                    {/* Bars */}
                    <div className="flex-1 flex flex-col">
                        {loading ? (
                            <div className="flex-1 w-full bg-white/5 rounded animate-pulse" />
                        ) : (
                            <div className="flex-1 flex items-end gap-[3px] px-1">
                                {chartData.map((data, index) => (
                                    <div
                                        key={data.month}
                                        className="flex-1 flex flex-col items-center group"
                                    >
                                        {/* Tooltip on hover */}
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-1 px-2 py-1 rounded bg-white/10 backdrop-blur text-[10px] text-white whitespace-nowrap pointer-events-none">
                                            {data.value.toLocaleString('fr-FR')} €
                                        </div>

                                        {/* Bar */}
                                        <div className="w-full flex-1 flex items-end">
                                            <div
                                                className={`w-full rounded-t transition-all duration-500 ${data.isCurrentMonth
                                                        ? 'bg-gradient-to-t from-orange-600 to-orange-400'
                                                        : 'bg-gradient-to-t from-orange-600/60 to-orange-400/40 hover:from-orange-600/80 hover:to-orange-400/60'
                                                    }`}
                                                style={{ height: `${data.heightPercent}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* X-axis labels */}
                        <div className="flex gap-[3px] px-1 mt-2">
                            {chartData.map((data) => (
                                <span
                                    key={data.month}
                                    className={`flex-1 text-center text-[9px] ${data.isCurrentMonth ? 'text-orange-400' : 'text-white/40'
                                        }`}
                                >
                                    {data.month}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
