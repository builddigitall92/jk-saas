"use client"

import { Plus } from "lucide-react"

interface ReportData {
    label: string
    value: number
}

interface ReportCardProps {
    data: ReportData[]
    maxValue?: number
}

export function ReportCard({ data, maxValue }: ReportCardProps) {
    const max = maxValue || Math.max(...data.map(d => d.value))

    return (
        <div className="relative rounded-2xl p-5 h-full bg-[#1f1b17] border border-white/[0.04] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] transition-all duration-300 hover:scale-[1.01] hover:brightness-105">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-medium text-white/80">Rapports</h3>
                <button className="w-6 h-6 rounded-full bg-white/5 hover:bg-orange-500/20 flex items-center justify-center transition-colors">
                    <Plus className="w-3 h-3 text-white/40" />
                </button>
            </div>

            {/* Y-Axis Labels */}
            <div className="flex mb-2">
                <div className="w-8 flex flex-col justify-between text-right pr-2 text-[9px] text-white/20 font-mono h-24">
                    <span>120</span>
                    <span>90</span>
                    <span>60</span>
                    <span>30</span>
                </div>

                {/* Bars */}
                <div className="flex-1 flex items-end gap-2 h-24">
                    {data.map((item, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center">
                            <div
                                className="w-full rounded-t bg-gradient-to-t from-orange-600 to-orange-400 transition-all duration-500 ease-out hover:from-orange-500 hover:to-orange-300"
                                style={{ height: `${(item.value / max) * 100}%` }}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* X-Axis Labels */}
            <div className="flex ml-8 gap-2">
                {data.map((item, i) => (
                    <span key={i} className="flex-1 text-center text-[9px] text-white/30">{item.label}</span>
                ))}
            </div>
        </div>
    )
}
