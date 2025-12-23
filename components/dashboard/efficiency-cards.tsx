"use client"

import { TrendingUp, Activity } from "lucide-react"

export function EfficiencyCards() {
    return (
        <div className="col-span-4 flex flex-col gap-4">
            {/* Card 1: Valuation */}
            <div className="flex-1 bg-[#161616] rounded-[2rem] p-6 border border-white/5 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                        <span className="text-3xl font-light text-white tracking-tight">$ 563,427</span>
                        <span className="text-sm text-white/40 font-light mt-1">Inventory Valuation</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#00ff88]/10 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-[#00ff88]" />
                    </div>
                </div>
                {/* Background Glow */}
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-[#00ff88]/5 to-transparent rounded-tl-[100%] pointer-events-none" />
            </div>

            {/* Card 2: Efficiency */}
            <div className="flex-1 bg-[#161616] rounded-[2rem] p-6 border border-white/5 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                        <span className="text-3xl font-light text-white tracking-tight">65%</span>
                        <span className="text-sm text-white/40 font-light mt-1">Shipping Efficiency</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                        <Activity className="w-4 h-4 text-red-500" />
                    </div>
                </div>
                {/* Background Glow */}
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-red-500/5 to-transparent rounded-tl-[100%] pointer-events-none" />
            </div>
        </div>
    )
}
