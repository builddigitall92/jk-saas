"use client"

import { LucideIcon } from "lucide-react"
import Link from "next/link"

interface KPICardProps {
    label: string
    value: string | number
    subtext?: string
    trend?: {
        value: number
        positive: boolean
    }
    icon: LucideIcon
    href?: string
    miniChart?: number[] // Array of values for sparkline
    accentColor?: 'orange' | 'blue' | 'green' | 'red' | 'purple'
    loading?: boolean
}

export function KPICard({
    label,
    value,
    subtext,
    trend,
    icon: Icon,
    href,
    miniChart,
    accentColor = 'orange',
    loading = false
}: KPICardProps) {
    const colorMap = {
        orange: {
            gradient: 'from-orange-500 to-red-600',
            bg: 'bg-orange-500/10',
            border: 'hover:border-orange-500/30',
            text: 'text-orange-400',
            glow: 'shadow-orange-500/10',
            chart: '#f97316'
        },
        blue: {
            gradient: 'from-blue-500 to-cyan-600',
            bg: 'bg-blue-500/10',
            border: 'hover:border-blue-500/30',
            text: 'text-blue-400',
            glow: 'shadow-blue-500/10',
            chart: '#3b82f6'
        },
        green: {
            gradient: 'from-green-500 to-emerald-600',
            bg: 'bg-green-500/10',
            border: 'hover:border-green-500/30',
            text: 'text-green-400',
            glow: 'shadow-green-500/10',
            chart: '#22c55e'
        },
        red: {
            gradient: 'from-red-500 to-rose-600',
            bg: 'bg-red-500/10',
            border: 'hover:border-red-500/30',
            text: 'text-red-400',
            glow: 'shadow-red-500/10',
            chart: '#ef4444'
        },
        purple: {
            gradient: 'from-purple-500 to-pink-600',
            bg: 'bg-purple-500/10',
            border: 'hover:border-purple-500/30',
            text: 'text-purple-400',
            glow: 'shadow-purple-500/10',
            chart: '#a855f7'
        }
    }

    const colors = colorMap[accentColor]

    // Generate sparkline path from data
    const generateSparkline = (data: number[]) => {
        if (!data || data.length < 2) return ''
        const max = Math.max(...data)
        const min = Math.min(...data)
        const range = max - min || 1
        const width = 80
        const height = 30
        const padding = 2

        const points = data.map((val, i) => {
            const x = (i / (data.length - 1)) * width
            const y = height - padding - ((val - min) / range) * (height - padding * 2)
            return `${x},${y}`
        })

        return `M ${points.join(' L ')}`
    }

    const CardWrapper = href ? Link : 'div'
    const wrapperProps = href ? { href } : {}

    return (
        <CardWrapper
            {...wrapperProps as any}
            className={`group relative overflow-hidden rounded-[16px] border border-white/[0.08] bg-gradient-to-br from-[#1a1410]/90 via-[#1f1612]/80 to-[#1a1410]/90 backdrop-blur-xl shadow-xl shadow-black/20 transition-all duration-500 hover:border-white/[0.12] hover:shadow-2xl ${colors.border} ${href ? 'cursor-pointer hover:-translate-y-1' : ''}`}
        >
            {/* Ambient glow */}
            <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,140,66,0.06),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

            {/* Shimmer effect on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%)] bg-[length:250%_100%] group-hover:animate-shimmer" />

            <div className="relative p-5">
                {/* Header row */}
                <div className="flex items-center justify-between mb-3">
                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-lg ${colors.glow} group-hover:scale-105 transition-transform duration-300`}>
                        <Icon className="h-5 w-5 text-white" />
                    </div>

                    {/* Mini Chart */}
                    {miniChart && miniChart.length > 1 && (
                        <div className="w-20 h-8 opacity-60 group-hover:opacity-100 transition-opacity">
                            <svg width="80" height="30" className="overflow-visible">
                                <defs>
                                    <linearGradient id={`gradient-${accentColor}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor={colors.chart} stopOpacity="0.3" />
                                        <stop offset="100%" stopColor={colors.chart} stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                {/* Area fill */}
                                <path
                                    d={`${generateSparkline(miniChart)} L 80,30 L 0,30 Z`}
                                    fill={`url(#gradient-${accentColor})`}
                                />
                                {/* Line */}
                                <path
                                    d={generateSparkline(miniChart)}
                                    fill="none"
                                    stroke={colors.chart}
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                    )}
                </div>

                {/* Label */}
                <p className="text-xs text-white/50 uppercase tracking-wider font-medium mb-1">{label}</p>

                {/* Value */}
                <div className="flex items-baseline gap-2">
                    {loading ? (
                        <div className="h-8 w-24 bg-white/10 rounded animate-pulse" />
                    ) : (
                        <span className="text-2xl font-bold text-white tracking-tight">
                            {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
                        </span>
                    )}

                    {/* Trend badge */}
                    {trend && !loading && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${trend.positive
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                            {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
                        </span>
                    )}
                </div>

                {/* Subtext */}
                {subtext && (
                    <p className="text-xs text-white/40 mt-1.5">{subtext}</p>
                )}
            </div>
        </CardWrapper>
    )
}
