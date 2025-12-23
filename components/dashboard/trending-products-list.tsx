"use client"

import { Package, MoreHorizontal } from "lucide-react"
import Link from "next/link"

interface Product {
    id: string
    name: string
    quantity?: number
    unit_price?: number
    category?: string
    image_url?: string
}

interface TrendingProductsListProps {
    products: Product[]
    loading?: boolean
}

export function TrendingProductsList({ products, loading = false }: TrendingProductsListProps) {
    // Get top 4 products by value
    const topProducts = [...products]
        .map(p => ({
            ...p,
            value: (p.quantity || 0) * (p.unit_price || 0)
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 4)

    return (
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#1c1815] to-[#151210] h-full">
            <div className="p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-white/80">Produits à forte rotation</h3>
                    <button className="text-white/30 hover:text-white transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                    </button>
                </div>

                {/* Products list */}
                <div className="space-y-3">
                    {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3 animate-pulse">
                                <div className="w-10 h-10 rounded-full bg-white/10" />
                                <div className="flex-1">
                                    <div className="h-3 w-24 bg-white/10 rounded mb-1" />
                                    <div className="h-2 w-16 bg-white/10 rounded" />
                                </div>
                                <div className="h-4 w-16 bg-white/10 rounded" />
                            </div>
                        ))
                    ) : topProducts.length > 0 ? (
                        topProducts.map((product, index) => (
                            <Link
                                key={product.id}
                                href={`/manager/stock?product=${product.id}`}
                                className="flex items-center gap-3 group"
                            >
                                {/* Product image */}
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2a2420] to-[#1a1614] border border-white/[0.08] flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {product.image_url ? (
                                        <img
                                            src={product.image_url}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <Package className="h-4 w-4 text-orange-400/50" />
                                    )}
                                </div>

                                {/* Product info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate group-hover:text-orange-400 transition-colors">
                                        {product.name}
                                    </p>
                                    <p className="text-xs text-white/40">
                                        Qté: {product.quantity || 0}
                                    </p>
                                </div>

                                {/* Value */}
                                <span className="text-sm font-bold text-orange-400">
                                    {product.value.toLocaleString('fr-FR')} €
                                </span>
                            </Link>
                        ))
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-sm text-white/40">Aucun produit</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
