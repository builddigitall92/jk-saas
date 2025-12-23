"use client"

import { Lightbulb, ArrowRight, Sparkles } from "lucide-react"

interface TipCardProps {
    tip?: string
    link?: string
}

const tips = [
    "Pensez aux menus anti-gaspi pour écouler vos surplus. Réduisez vos pertes jusqu'à 15%.",
    "Vérifiez les dates de péremption chaque matin pour anticiper les promotions.",
    "Utilisez la méthode FIFO (First In, First Out) pour optimiser la rotation des stocks.",
    "Les portions trop généreuses sont la première cause de gaspillage. Ajustez vos recettes.",
    "Transformez vos invendus en plats du jour créatifs pour limiter les pertes."
]

export function TipCard({ tip, link }: TipCardProps) {
    // Rotate tip based on day of year
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
    const selectedTip = tip || tips[dayOfYear % tips.length]

    return (
        <div className="group relative overflow-hidden rounded-[16px] border border-white/[0.08] shadow-xl shadow-black/20 transition-all duration-500 hover:border-pink-500/30 hover:shadow-pink-500/10">
            {/* Multi-layer gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-600/25 via-red-500/20 to-orange-500/25" />
            <div className="absolute inset-0 bg-gradient-to-tl from-rose-500/10 via-transparent to-fuchsia-500/10" />
            <div className="absolute inset-0 bg-[#1a1410]/60 backdrop-blur-sm" />

            {/* Animated shimmer effect */}
            <div className="absolute inset-0 opacity-30 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:300%_100%] group-hover:animate-shimmer" />

            {/* Top glow line */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-pink-500/50 to-transparent" />

            {/* Decorative sparkles */}
            <div className="absolute top-4 right-4 opacity-40 group-hover:opacity-70 transition-opacity">
                <Sparkles className="h-5 w-5 text-pink-300" />
            </div>
            <div className="absolute bottom-12 left-4 opacity-20 group-hover:opacity-40 transition-opacity">
                <Sparkles className="h-3 w-3 text-orange-300" />
            </div>

            {/* Content */}
            <div className="relative p-6">
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                    <div className="relative">
                        {/* Icon glow */}
                        <div className="absolute inset-0 bg-orange-500/40 rounded-xl blur-xl" />
                        <div className="relative h-11 w-11 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                            <Lightbulb className="h-5 w-5 text-white" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-white tracking-tight">Astuce Anti-Gaspillage</h3>
                        <p className="text-[11px] text-white/50 mt-0.5">Conseil du jour pour optimiser</p>
                    </div>
                </div>

                {/* Tip text */}
                <p className="text-sm text-white/85 leading-relaxed mb-5 font-light">
                    {selectedTip}
                </p>

                {/* CTA Button */}
                <button
                    onClick={() => link && window.open(link, '_blank')}
                    className="group/btn relative w-full overflow-hidden"
                >
                    {/* Button glow on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-orange-500/20 rounded-xl blur-xl opacity-0 group-hover/btn:opacity-100 transition-opacity" />

                    <div className="relative flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.12] hover:border-white/[0.25] transition-all">
                        <span className="text-sm font-semibold text-white">En savoir plus</span>
                        <ArrowRight className="h-4 w-4 text-white/70 group-hover/btn:text-white group-hover/btn:translate-x-0.5 transition-all" />
                    </div>
                </button>
            </div>
        </div>
    )
}
