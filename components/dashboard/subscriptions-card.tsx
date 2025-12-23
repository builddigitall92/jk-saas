"use client"

import { Plus, CreditCard, AlertCircle, MessageCircle } from "lucide-react"

interface Subscription {
    name: string
    dueDate: string
    amount: number
    status: "paid" | "pending" | "overdue"
}

interface SubscriptionsCardProps {
    subscriptions: Subscription[]
}

export function SubscriptionsCard({ subscriptions }: SubscriptionsCardProps) {
    const statusColors = {
        paid: { bg: "bg-green-500/20", text: "text-green-400", dot: "bg-green-400" },
        pending: { bg: "bg-orange-500/20", text: "text-orange-400", dot: "bg-orange-400" },
        overdue: { bg: "bg-red-500/20", text: "text-red-400", dot: "bg-red-400" },
    }

    const statusIcons = {
        paid: CreditCard,
        pending: AlertCircle,
        overdue: MessageCircle,
    }

    return (
        <div className="relative rounded-2xl p-5 h-full bg-[#1f1b17] border border-white/[0.04] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] transition-all duration-300 hover:scale-[1.01] hover:brightness-105">

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-white/80">Abonnements Fournisseurs</h3>
                <button className="w-6 h-6 rounded-full bg-white/5 hover:bg-orange-500/20 flex items-center justify-center transition-colors">
                    <Plus className="w-3 h-3 text-white/40" />
                </button>
            </div>

            {/* Subscriptions List */}
            <div className="space-y-3">
                {subscriptions.map((sub, i) => {
                    const colors = statusColors[sub.status]
                    const Icon = statusIcons[sub.status]

                    return (
                        <div key={i} className="flex items-center gap-3 group">
                            <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-white/80 truncate">{sub.name}</p>
                                <p className="text-[10px] text-white/30">Échéance {sub.dueDate}</p>
                            </div>
                            <span className={`text-sm font-medium ${colors.text}`}>
                                {sub.amount.toLocaleString('fr-FR')} €
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
