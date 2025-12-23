"use client"

import { Building2, MapPin, Star, Leaf } from "lucide-react"

interface EstablishmentCardProps {
    name?: string
    location?: string
    rating?: number
    ecoScore?: string
}

export function EstablishmentCard({
    name = "Mon Établissement",
    location = "Localisation non définie",
    rating = 4.8,
    ecoScore = "A+"
}: EstablishmentCardProps) {
    return (
        <div className="group relative overflow-hidden rounded-[16px] border border-white/[0.08] bg-gradient-to-br from-[#1a1410]/90 via-[#1f1612]/80 to-[#1a1410]/90 backdrop-blur-xl shadow-xl shadow-black/20 transition-all duration-500 hover:border-white/[0.12] hover:shadow-2xl h-full">
            {/* Ambient glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,140,66,0.06),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative p-5 h-full flex flex-col">
                {/* Header inline */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
                        <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-base font-bold text-white truncate">{name}</p>
                        <div className="flex items-center gap-1.5 text-white/50">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span className="text-xs truncate">{location}</span>
                        </div>
                    </div>
                </div>

                {/* Badges row - compact */}
                <div className="flex items-center gap-2 mt-auto">
                    {/* Rating badge */}
                    <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <div>
                            <p className="text-[10px] text-yellow-400/70 uppercase tracking-wider">Note</p>
                            <p className="text-sm font-bold text-yellow-400">{rating}</p>
                        </div>
                    </div>

                    {/* Eco Score badge */}
                    <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
                        <Leaf className="h-4 w-4 text-green-400" />
                        <div>
                            <p className="text-[10px] text-green-400/70 uppercase tracking-wider">Éco</p>
                            <p className="text-sm font-bold text-green-400">{ecoScore}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
