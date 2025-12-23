"use client"

import { Plus } from "lucide-react"

interface SavingsCardProps {
    current: number
    target: number
    label?: string
}

export function SavingsCard({ current, target, label = "Objectif Stock" }: SavingsCardProps) {
    const percentage = Math.round((current / target) * 100)
    const circumference = 2 * Math.PI * 45
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
        <div className="relative rounded-2xl p-5 h-full bg-[#1f1b17] border border-white/[0.04] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] transition-all duration-300 hover:scale-[1.01] hover:brightness-105">

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-white/80">{label}</h3>
                <button className="w-6 h-6 rounded-full bg-white/5 hover:bg-orange-500/20 flex items-center justify-center transition-colors">
                    <Plus className="w-3 h-3 text-white/40" />
                </button>
            </div>

            {/* Donut Chart */}
            <div className="flex items-center gap-4">
                <div className="relative w-24 h-24">
                    <svg className="w-full h-full -rotate-90">
                        {/* Background Circle */}
                        <circle
                            cx="48"
                            cy="48"
                            r="45"
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth="6"
                            fill="none"
                        />
                        {/* Progress Circle */}
                        <circle
                            cx="48"
                            cy="48"
                            r="45"
                            stroke="url(#orangeGradient)"
                            strokeWidth="6"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-1000 ease-out"
                        />
                        <defs>
                            <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#f97316" />
                                <stop offset="100%" stopColor="#ea580c" />
                            </linearGradient>
                        </defs>
                    </svg>
                    {/* Center Text */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold text-white">{percentage}%</span>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex flex-col gap-2">
                    <div>
                        <span className="text-[10px] text-white/30 block">Objectif</span>
                        <span className="text-sm font-semibold text-white">{target.toLocaleString('fr-FR')} €</span>
                    </div>
                    <div>
                        <span className="text-[10px] text-white/30 block">Atteint</span>
                        <span className="text-sm font-semibold text-orange-400">{current.toLocaleString('fr-FR')} €</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
