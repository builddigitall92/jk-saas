"use client"

import { ReactNode } from "react"
import { LucideIcon, Plus } from "lucide-react"

interface DashCardProps {
    title: string
    icon?: LucideIcon
    children: ReactNode
    className?: string
    glowColor?: "orange" | "none"
    action?: boolean
}

export function DashCard({
    title,
    icon: Icon,
    children,
    className = "",
    glowColor = "none",
    action = false
}: DashCardProps) {

    const glowStyles = {
        orange: "before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-orange-500/10 before:to-transparent before:pointer-events-none",
        none: ""
    }

    return (
        <div
            className={`
        relative rounded-2xl p-5
        bg-[#1f1b17] 
        border border-white/[0.04]
        shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)]
        transition-all duration-300 ease-out
        hover:scale-[1.01] hover:brightness-105 hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.6)]
        ${glowStyles[glowColor]}
        ${className}
      `}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    {Icon && <Icon className="w-4 h-4 text-white/40" />}
                    <h3 className="text-sm font-medium text-white/80">{title}</h3>
                </div>
                {action && (
                    <button className="w-6 h-6 rounded-full bg-white/5 hover:bg-orange-500/20 flex items-center justify-center transition-colors">
                        <Plus className="w-3 h-3 text-white/40 hover:text-orange-400" />
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="relative">
                {children}
            </div>
        </div>
    )
}
