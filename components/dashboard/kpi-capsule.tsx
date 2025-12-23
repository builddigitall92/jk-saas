"use client"

import { ReactNode } from "react"
import { LucideIcon } from "lucide-react"

interface CapsuleProps {
    label: string
    value: string | number
    subtext?: string
    icon?: LucideIcon
    variant?: "light" | "dark" | "texture"
    delay?: number
}

export function KPICapsule({ label, value, subtext, icon: Icon, variant = "dark", delay = 0 }: CapsuleProps) {

    // Variant styles
    const bgStyle = {
        light: "bg-[#e0e0e0] text-black", // Almost white
        dark: "bg-[#1a1a1a] text-white border border-white/5",
        texture: "bg-[#161616] text-white border border-white/5 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:4px_4px]"
    }

    return (
        <div
            className={`relative rounded-[2rem] p-6 flex flex-col justify-between overflow-hidden transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-2xl ${bgStyle[variant]}`}
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <span className={`text-[10px] font-bold uppercase tracking-widest opacity-60`}>
                    {label}
                </span>
                {Icon && <Icon className="w-4 h-4 opacity-40" />}
            </div>

            {/* Value (Center) */}
            <div className="flex-1 flex items-center justify-center my-2">
                <span className="text-3xl font-bold tracking-tight">
                    {value}
                </span>
            </div>

            {/* Subtext/Footer */}
            {subtext && (
                <div className="text-[10px] font-medium opacity-50 text-center">
                    {subtext}
                </div>
            )}

            {/* Light Variant Decoration */}
            {variant === 'light' && (
                <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/20 rounded-full blur-xl" />
            )}
            {/* Dark Variant Decoration */}
            {variant === 'dark' && (
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            )}
        </div>
    )
}
