"use client"

import { Search, Filter, Download, MoreHorizontal } from "lucide-react"

export function SuppliersTable() {
    return (
        <div className="col-span-8 bg-[#121212] rounded-[2rem] p-6 border border-white/5 h-full min-h-[400px]">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-light text-white">Manage Suppliers</h3>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                    <input
                        type="text"
                        placeholder="Search"
                        className="pl-9 pr-4 py-2 rounded-full bg-white/5 border border-white/5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-white/10 w-48"
                    />
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                {['Product', 'Supplier', 'Category', 'Stage'].map(f => (
                    <button key={f} className="px-4 py-2 rounded-full bg-[#1a1a1a] border border-white/5 text-[10px] text-white/60 hover:text-white hover:bg-[#252525] transition-colors whitespace-nowrap">
                        {f}
                    </button>
                ))}
                <div className="ml-auto flex gap-2">
                    <button className="px-3 py-2 rounded-full border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-colors flex items-center gap-2 text-[10px]">
                        <Filter className="w-3 h-3" /> Filter
                    </button>
                    <button className="px-3 py-2 rounded-full border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-colors flex items-center gap-2 text-[10px]">
                        <Download className="w-3 h-3" /> Export
                    </button>
                </div>
            </div>

            {/* Table Rows */}
            <div className="space-y-3">
                {/* Row 1 */}
                <div className="flex items-center p-3 rounded-2xl hover:bg-white/[0.02] border border-transparent hover:border-white/5 transition-all group cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mr-4">
                        <span className="text-lg">🚁</span>
                    </div>
                    <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                        <div className="flex flex-col">
                            <span className="text-xs font-medium text-white">DJI Avata 2</span>
                            <span className="text-[10px] text-white/30">FPV Drone</span>
                        </div>
                        <div className="col-span-1 text-[10px] text-white/40">TR Tech Ltd.</div>
                        <div className="col-span-1 text-[10px] text-white/40">Electronics</div>
                        <div className="col-span-1 text-[10px] text-white">$1,499</div>
                        <div className="col-span-1 flex justify-end">
                            <span className="px-2 py-1 rounded-full bg-[#00ff88]/10 text-[#00ff88] text-[9px] border border-[#00ff88]/20">High Demand</span>
                        </div>
                    </div>
                </div>

                {/* Row 2 */}
                <div className="flex items-center p-3 rounded-2xl hover:bg-white/[0.02] border border-transparent hover:border-white/5 transition-all group cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mr-4">
                        <span className="text-lg">📸</span>
                    </div>
                    <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                        <div className="flex flex-col">
                            <span className="text-xs font-medium text-white">GoPro Hero 11</span>
                            <span className="text-[10px] text-white/30">Action Cam</span>
                        </div>
                        <div className="col-span-1 text-[10px] text-white/40">CamStore Inc.</div>
                        <div className="col-span-1 text-[10px] text-white/40">Electronics</div>
                        <div className="col-span-1 text-[10px] text-white">$399</div>
                        <div className="col-span-1 flex justify-end">
                            <span className="px-2 py-1 rounded-full bg-orange-500/10 text-orange-400 text-[9px] border border-orange-500/20">Low Stock</span>
                        </div>
                    </div>
                </div>

                {/* Row 3 */}
                <div className="flex items-center p-3 rounded-2xl hover:bg-white/[0.02] border border-transparent hover:border-white/5 transition-all group cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mr-4">
                        <span className="text-lg">🔋</span>
                    </div>
                    <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                        <div className="flex flex-col">
                            <span className="text-xs font-medium text-white">LiPo Battery</span>
                            <span className="text-[10px] text-white/30">6S 1500mAh</span>
                        </div>
                        <div className="col-span-1 text-[10px] text-white/40">PowerHouse</div>
                        <div className="col-span-1 text-[10px] text-white/40">Accessories</div>
                        <div className="col-span-1 text-[10px] text-white">$45</div>
                        <div className="col-span-1 flex justify-end">
                            <span className="px-2 py-1 rounded-full bg-white/5 text-white/40 text-[9px] border border-white/10">Stable</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
