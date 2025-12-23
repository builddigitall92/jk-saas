"use client"

import { Package, ArrowUpCircle, ArrowDownCircle, Settings2 } from "lucide-react"

interface StockMovement {
    id: string
    productName: string
    productImage?: string
    date: string
    type: 'entry' | 'exit' | 'adjustment'
    quantity: number
    origin: string
    status: 'validated' | 'pending' | 'cancelled'
    value: number
}

interface StockMovementsTableProps {
    movements?: StockMovement[]
    loading?: boolean
}

// Mock data for demo
const mockMovements: StockMovement[] = [
    {
        id: '1',
        productName: 'Filet de Bœuf',
        date: '23-Dec-2024',
        type: 'entry',
        quantity: 15,
        origin: 'Metro',
        status: 'pending',
        value: 285.00
    },
    {
        id: '2',
        productName: 'Saumon Frais',
        date: '23-Dec-2024',
        type: 'entry',
        quantity: 8,
        origin: 'Pomona',
        status: 'validated',
        value: 156.00
    },
    {
        id: '3',
        productName: 'Tomates Bio',
        date: '22-Dec-2024',
        type: 'exit',
        quantity: 25,
        origin: 'Vente',
        status: 'validated',
        value: 62.50
    },
    {
        id: '4',
        productName: 'Crème Fraîche',
        date: '22-Dec-2024',
        type: 'adjustment',
        quantity: -3,
        origin: 'Inventaire',
        status: 'cancelled',
        value: 12.00
    },
    {
        id: '5',
        productName: 'Huile d\'Olive',
        date: '21-Dec-2024',
        type: 'entry',
        quantity: 10,
        origin: 'Transgourmet',
        status: 'pending',
        value: 89.00
    }
]

export function StockMovementsTable({ movements = mockMovements, loading = false }: StockMovementsTableProps) {
    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'entry':
                return <ArrowDownCircle className="h-4 w-4 text-green-400" />
            case 'exit':
                return <ArrowUpCircle className="h-4 w-4 text-red-400" />
            default:
                return <Settings2 className="h-4 w-4 text-yellow-400" />
        }
    }

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'entry': return 'Entrée'
            case 'exit': return 'Sortie'
            default: return 'Ajustement'
        }
    }

    const getStatusBadge = (status: string) => {
        const styles = {
            validated: 'bg-green-500/20 text-green-400 border-green-500/30',
            pending: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
            cancelled: 'bg-red-500/20 text-red-400 border-red-500/30'
        }
        const labels = {
            validated: 'Validé',
            pending: 'En attente',
            cancelled: 'Annulé'
        }
        return (
            <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${styles[status as keyof typeof styles]}`}>
                {labels[status as keyof typeof labels]}
            </span>
        )
    }

    return (
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#1c1815] to-[#151210]">
            <div className="p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-white/80">Derniers mouvements</h3>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/[0.06]">
                                <th className="text-left py-3 px-2 text-xs font-medium text-white/40">Produit</th>
                                <th className="text-left py-3 px-2 text-xs font-medium text-white/40">Date</th>
                                <th className="text-left py-3 px-2 text-xs font-medium text-white/40">Mvt</th>
                                <th className="text-left py-3 px-2 text-xs font-medium text-white/40">Qté</th>
                                <th className="text-left py-3 px-2 text-xs font-medium text-white/40">Origine</th>
                                <th className="text-left py-3 px-2 text-xs font-medium text-white/40">Statut</th>
                                <th className="text-right py-3 px-2 text-xs font-medium text-white/40">Valeur</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="border-b border-white/[0.04] animate-pulse">
                                        <td className="py-3 px-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-white/10" />
                                                <div className="w-20 h-3 bg-white/10 rounded" />
                                            </div>
                                        </td>
                                        <td className="py-3 px-2"><div className="w-16 h-3 bg-white/10 rounded" /></td>
                                        <td className="py-3 px-2"><div className="w-12 h-3 bg-white/10 rounded" /></td>
                                        <td className="py-3 px-2"><div className="w-8 h-3 bg-white/10 rounded" /></td>
                                        <td className="py-3 px-2"><div className="w-16 h-3 bg-white/10 rounded" /></td>
                                        <td className="py-3 px-2"><div className="w-14 h-4 bg-white/10 rounded" /></td>
                                        <td className="py-3 px-2 text-right"><div className="w-12 h-3 bg-white/10 rounded ml-auto" /></td>
                                    </tr>
                                ))
                            ) : (
                                movements.map((movement) => (
                                    <tr
                                        key={movement.id}
                                        className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors cursor-pointer group"
                                    >
                                        <td className="py-3 px-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2a2420] to-[#1a1614] border border-white/[0.08] flex items-center justify-center overflow-hidden">
                                                    {movement.productImage ? (
                                                        <img src={movement.productImage} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package className="h-3.5 w-3.5 text-orange-400/50" />
                                                    )}
                                                </div>
                                                <span className="text-sm text-white group-hover:text-orange-400 transition-colors">
                                                    {movement.productName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-2 text-xs text-white/60">{movement.date}</td>
                                        <td className="py-3 px-2">
                                            <div className="flex items-center gap-1.5">
                                                {getTypeIcon(movement.type)}
                                                <span className="text-xs text-white/60">{getTypeLabel(movement.type)}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-2 text-xs text-white/80">
                                            {movement.type === 'exit' || movement.quantity < 0 ? '-' : '+'}{Math.abs(movement.quantity)}
                                        </td>
                                        <td className="py-3 px-2">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#2a2420] to-[#1a1614] border border-white/[0.08] flex items-center justify-center text-[8px] text-white/60">
                                                    {movement.origin.charAt(0)}
                                                </div>
                                                <span className="text-xs text-white/60">{movement.origin}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-2">{getStatusBadge(movement.status)}</td>
                                        <td className="py-3 px-2 text-right text-sm font-semibold text-orange-400">
                                            {movement.value.toLocaleString('fr-FR')} €
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
