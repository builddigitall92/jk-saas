"use client"

import { MoreHorizontal } from "lucide-react"

interface StockHeatmapProps {
    loading?: boolean
}

export function StockHeatmap({ loading = false }: StockHeatmapProps) {
    // Simulated data - stock activity by day of week
    const days = ['Sam', 'Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven']
    const data = [
        { day: 'Sam', value: 8500, height: 85 },
        { day: 'Dim', value: 7200, height: 72 },
        { day: 'Lun', value: 6800, height: 68 },
        { day: 'Mar', value: 5400, height: 54 },
        { day: 'Mer', value: 4200, height: 42 },
        { day: 'Jeu', value: 3800, height: 38 },
        { day: 'Ven', value: 2100, height: 21 },
    ]

    // Color gradient based on value
    const getColor = (height: number) => {
        if (height >= 80) return 'bg-orange-500'
        if (height >= 60) return 'bg-orange-400'
        if (height >= 40) return 'bg-orange-300'
        if (height >= 20) return 'bg-orange-200'
        return 'bg-orange-100'
    }

    return (
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#1c1815] to-[#151210] h-full">
            <div className="p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-white/80">Répartition sorties stock</h3>
                    <button className="text-white/30 hover:text-white transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                    </button>
                </div>

                {/* Y-axis labels */}
                <div className="flex">
                    <div className="w-10 flex flex-col justify-between text-right pr-2 text-[10px] text-white/40 h-32">
                        <span>10k</span>
                        <span>8k</span>
                        <span>6k</span>
                        <span>4k</span>
                        <span>2k</span>
                        <span>0k</span>
                    </div>

                    {/* Chart */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="h-32 w-full bg-white/5 rounded animate-pulse" />
                        ) : (
                            <div className="h-32 flex items-end justify-between gap-1">
                                {data.map((item, index) => (
                                    <div key={item.day} className="flex-1 flex flex-col items-center">
                                        {/* Dot indicator */}
                                        <div
                                            className={`w-3 h-3 rounded-full ${getColor(item.height)} mb-1 shadow-lg`}
                                            style={{
                                                marginBottom: `${item.height}%`,
                                                boxShadow: `0 0 10px ${item.height >= 60 ? 'rgba(249,115,22,0.5)' : 'rgba(249,115,22,0.2)'}`
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* X-axis labels */}
                        <div className="flex justify-between mt-2">
                            {days.map(day => (
                                <span key={day} className="text-[10px] text-white/40 flex-1 text-center">
                                    {day}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
