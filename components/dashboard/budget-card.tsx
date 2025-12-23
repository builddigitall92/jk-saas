"use client"

import { Check, Wallet } from "lucide-react"
import { DashCard } from "./dash-card"

interface BudgetItem {
    name: string
    amount: number
    checked?: boolean
}

interface BudgetCardProps {
    total: number
    items: BudgetItem[]
}

export function BudgetCard({ total, items }: BudgetCardProps) {
    return (
        <div className="relative rounded-2xl p-5 h-full bg-[#1f1b17] border border-white/[0.04] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] transition-all duration-300 hover:scale-[1.01] hover:brightness-105">

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-white/40" />
                    <h3 className="text-sm font-medium text-white/80">Budget</h3>
                </div>
            </div>

            {/* Total */}
            <div className="mb-6">
                <span className="text-[10px] text-white/30 uppercase tracking-wider">Cash</span>
                <div className="text-2xl font-bold text-white">{total.toLocaleString('fr-FR')} €</div>
            </div>

            {/* Items List */}
            <div className="space-y-3">
                {items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 group">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${item.checked
                                ? 'bg-orange-500/20 border-orange-500/50'
                                : 'bg-white/5 border-white/10'
                            }`}>
                            {item.checked && <Check className="w-3 h-3 text-orange-400" />}
                        </div>
                        <span className="flex-1 text-sm text-white/60">{item.name}</span>
                        <span className="text-sm text-white/40">{item.amount.toLocaleString('fr-FR')} €</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
