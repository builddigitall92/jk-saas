"use client"

import { CreditCard, Wifi } from "lucide-react"

interface BalanceCardProps {
    balance: number
    cardNumber?: string
    expiry?: string
}

export function BalanceCard({ balance, cardNumber = "1234", expiry = "12/26" }: BalanceCardProps) {
    return (
        <div className="relative rounded-2xl p-6 h-full overflow-hidden bg-gradient-to-br from-[#2a2520] to-[#1a1714] border border-white/[0.06] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.6)]">

            {/* Orange Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-500/20 to-transparent rounded-bl-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-600/10 to-transparent rounded-tr-full pointer-events-none" />

            {/* Card Header */}
            <div className="flex items-center justify-between mb-8">
                <span className="text-xs text-white/40 font-medium uppercase tracking-wider">Valeur Stock</span>
                <CreditCard className="w-5 h-5 text-orange-400/60" />
            </div>

            {/* Balance */}
            <div className="mb-8">
                <span className="text-3xl font-bold text-white tracking-tight">
                    {balance.toLocaleString('fr-FR')} €
                </span>
            </div>

            {/* Card Details */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-white/30 font-mono tracking-widest">●●●● ●●●● ●●●● {cardNumber}</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-white/30">{expiry}</span>
                    <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full bg-red-500/80" />
                        <div className="w-6 h-6 rounded-full bg-orange-400/80" />
                    </div>
                </div>
            </div>
        </div>
    )
}
