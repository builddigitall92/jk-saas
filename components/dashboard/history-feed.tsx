"use client"

import { ArrowUpRight } from "lucide-react"

export function HistoryFeed() {
    return (
        <div className="col-span-4 flex flex-col gap-4">
            <div className="flex justify-between items-center mb-2 px-2">
                <h3 className="text-lg font-light text-white">Order History</h3>
                <div className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 cursor-pointer">
                    <ArrowUpRight className="w-3 h-3 text-white/50" />
                </div>
            </div>

            {/* Card 1 */}
            <div className="bg-[#161616] p-4 rounded-[1.5rem] border border-white/5 hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] text-white/30 font-mono">Order ID Inv-31982</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#00ff88] text-black text-[9px] font-bold">Delivered</span>
                </div>

                <div className="flex gap-3">
                    <div className="w-16 h-12 rounded-lg bg-black/20 flex items-center justify-center">
                        <span className="text-lg">🚁</span>
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-medium text-white">DJI Avata 2</h4>
                        <p className="text-[10px] text-white/40">FPV Drone</p>
                    </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center">
                    <div className="flex flex-col">
                        <span className="text-[9px] text-white/30">Order Date</span>
                        <span className="text-[10px] text-white/60">24 Dec 2024</span>
                    </div>
                    <div className="text-lg font-light text-white">$1,499</div>
                </div>
            </div>

            {/* Card 2 */}
            <div className="bg-[#161616] p-4 rounded-[1.5rem] border border-white/5 hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] text-white/30 font-mono">Order ID Inv-25982</span>
                    <span className="px-2 py-0.5 rounded-full bg-orange-500 text-black text-[9px] font-bold">In Transit</span>
                </div>

                <div className="flex gap-3">
                    <div className="w-16 h-12 rounded-lg bg-black/20 flex items-center justify-center">
                        <span className="text-lg">📸</span>
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-medium text-white">DJI Avata 3</h4>
                        <p className="text-[10px] text-white/40">FPV Drone</p>
                    </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center">
                    <div className="flex flex-col">
                        <span className="text-[9px] text-white/30">Order Date</span>
                        <span className="text-[10px] text-white/60">18 Dec 2024</span>
                    </div>
                    <div className="text-lg font-light text-white">$1,973</div>
                </div>
            </div>
        </div>
    )
}
