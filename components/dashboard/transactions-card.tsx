"use client"

import { Plus } from "lucide-react"

interface Transaction {
    name: string
    date: string
    amount: number
    type: "in" | "out"
    avatar?: string
}

interface TransactionsCardProps {
    transactions: Transaction[]
}

export function TransactionsCard({ transactions }: TransactionsCardProps) {
    return (
        <div className="relative rounded-2xl p-5 h-full bg-[#1f1b17] border border-white/[0.04] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] transition-all duration-300 hover:scale-[1.01] hover:brightness-105">

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-white/80">Derniers Mouvements</h3>
                <button className="w-6 h-6 rounded-full bg-white/5 hover:bg-orange-500/20 flex items-center justify-center transition-colors">
                    <Plus className="w-3 h-3 text-white/40" />
                </button>
            </div>

            {/* Transactions List */}
            <div className="space-y-3">
                {transactions.map((tx, i) => (
                    <div key={i} className="flex items-center gap-3 group">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-sm font-bold text-white/60 border border-white/[0.06]">
                            {tx.avatar || tx.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white/80 truncate">{tx.name}</p>
                            <p className="text-[10px] text-white/30">{tx.date}</p>
                        </div>
                        <span className={`text-sm font-semibold ${tx.type === 'in' ? 'text-green-400' : 'text-red-400'}`}>
                            {tx.type === 'in' ? '+' : '-'} {tx.amount.toLocaleString('fr-FR')} €
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}
