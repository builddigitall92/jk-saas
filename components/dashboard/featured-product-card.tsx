"use client"

import Image from "next/image"
import { Package, TrendingUp, ExternalLink } from "lucide-react"
import Link from "next/link"

interface Product {
    id: string
    name: string
    quantity?: number
    unit_price?: number
    category?: string
    image_url?: string
}

interface FeaturedProductCardProps {
    products: Product[]
    loading?: boolean
}

export function FeaturedProductCard({ products, loading = false }: FeaturedProductCardProps) {
    // Find product with highest value that needs to be sold (FIFO/priority logic)
    const featuredProduct = products.length > 0
        ? products.reduce((best, p) => {
            const pValue = (p.quantity || 0) * (p.unit_price || 0)
            const bestValue = (best.quantity || 0) * (best.unit_price || 0)
            return pValue > bestValue ? p : best
        }, products[0])
        : null

    const productValue = featuredProduct
        ? (featuredProduct.quantity || 0) * (featuredProduct.unit_price || 0)
        : 0

    return (
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#1c1815] to-[#151210] h-full">
            {/* Radial glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,140,66,0.1),transparent_70%)]" />

            <div className="relative p-5 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-white/80">Produit à écouler en priorité</h3>
                    <Link href="/manager/stock" className="text-white/30 hover:text-orange-400 transition-colors">
                        <ExternalLink className="h-4 w-4" />
                    </Link>
                </div>

                {/* Featured product */}
                <div className="flex-1 flex flex-col items-center justify-center">
                    {loading ? (
                        <div className="w-32 h-32 rounded-full bg-white/10 animate-pulse" />
                    ) : featuredProduct ? (
                        <>
                            {/* Product image circle */}
                            <div className="relative w-36 h-36 mb-4">
                                {/* Glow effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full blur-xl" />

                                {/* Image container */}
                                <div className="relative w-full h-full rounded-full bg-gradient-to-br from-[#2a2420] to-[#1a1614] border-2 border-orange-500/30 flex items-center justify-center overflow-hidden">
                                    {featuredProduct.image_url ? (
                                        <Image
                                            src={featuredProduct.image_url}
                                            alt={featuredProduct.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <Package className="h-12 w-12 text-orange-400/50" />
                                    )}
                                </div>

                                {/* Price badge */}
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 shadow-lg shadow-orange-500/30">
                                    <span className="text-sm font-bold text-white">
                                        {productValue.toLocaleString('fr-FR')} €
                                    </span>
                                </div>
                            </div>

                            {/* Product name */}
                            <h4 className="text-base font-bold text-white mt-2">{featuredProduct.name}</h4>
                            <p className="text-xs text-white/50">
                                Qté: {featuredProduct.quantity || 0} • {featuredProduct.category || 'Non catégorisé'}
                            </p>
                        </>
                    ) : (
                        <div className="text-center">
                            <Package className="h-12 w-12 text-white/20 mx-auto mb-2" />
                            <p className="text-sm text-white/40">Aucun produit</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
