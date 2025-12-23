"use client"

import { LucideIcon } from "lucide-react"
import Link from "next/link"

interface HFKPICardProps {
    label: string
    value: string | number
    subtext?: string
    trend?: {
        value: number
        positive: boolean
    }
    icon: LucideIcon
    href?: string
}

export function HFKPICard({
    label,
    value,
    subtext,
    trend,
    icon: Icon,
    href
}: HFKPICardProps) {
    const CardContent = () => (
        <>
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1c1815] to-[#151210]" />

            {/* Subtle radial glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,140,66,0.08),transparent_70%)]" />

            {/* Content */}
            <div className="relative p-5">
                {/* Header with icon */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#2a2420] to-[#1a1614] flex items-center justify-center border border-white/[0.06]">
                        <Icon className="h-4 w-4 text-orange-400" />
                    </div>
                    <span className="text-sm font-medium text-white/70">{label}</span>
                </div>

                {/* Value + Trend */}
                <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-white">
                        {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
                    </span>
                    {trend && (
                        <span className={`text-sm font-semibold ${trend.positive ? 'text-green-400' : 'text-red-400'}`}>
                            {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
                        </span>
                    )}
                </div>

                {/* Subtext */}
                {subtext && (
                    <p className="text-xs text-white/40 mt-1.5">{subtext}</p>
                )}
            </div>
        </>
    )

    if (href) {
        return (
            <Link
                href={href}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.06] transition-all duration-300 hover:border-orange-500/30 hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-0.5"
            >
                <CardContent />
            </Link>
        )
    }

    return (
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06]">
            <CardContent />
        </div>
    )
}
