"use client"

import { ArrowUpRight } from "lucide-react"

export function InventoryChart() {
    return (
        <div className="col-span-8 bg-[#121212] rounded-[2rem] p-6 border border-white/5 relative overflow-hidden group">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-light text-white">Inventory Sales</h3>
                <div className="flex gap-2">
                    <div className="px-2 py-1 rounded bg-white/5 text-[10px] text-white/40 font-mono">+3.5%</div>
                    <div className="px-2 py-1 rounded bg-white/5 text-[10px] text-white/40 font-mono">+10.8%</div>
                </div>
            </div>

            {/* Chart Area */}
            <div className="h-40 flex items-end gap-2 px-2">
                {/* Y Axis */}
                <div className="flex flex-col justify-between h-full py-2 mr-2 text-[10px] text-white/20 font-mono">
                    <span>600k</span>
                    <span>400k</span>
                    <span>200k</span>
                    <span>Ok</span>
                </div>

                {/* Bars */}
                <div className="flex-1 flex items-end gap-[2px] h-full">
                    {/* Q1 Block */}
                    <div className="flex-1 h-[60%] bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-all rounded-t-sm relative group/bar">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-white/60 opacity-0 group-hover/bar:opacity-100 transition-opacity">Q1</div>
                    </div>
                    {/* Q2 Block */}
                    <div className="flex-1 h-[75%] bg-[#353535] hover:bg-[#454545] transition-all rounded-t-sm relative group/bar">
                        <span className="absolute top-2 right-2 text-[9px] text-white/30 font-mono">-17.4%</span>
                    </div>
                    {/* Q3 Block (Active) */}
                    <div className="flex-1 h-[45%] bg-[#00ff88] shadow-[0_0_20px_rgba(0,255,136,0.2)] hover:shadow-[0_0_30px_rgba(0,255,136,0.4)] transition-all rounded-t-sm relative group/bar">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-[#00ff88] font-bold opacity-0 group-hover/bar:opacity-100 transition-opacity">Q3</div>
                    </div>
                    {/* Q4 Block (Striped) */}
                    <div className="flex-1 h-[55%] bg-[repeating-linear-gradient(45deg,#2a2a2a,#2a2a2a_5px,#1a1a1a_5px,#1a1a1a_10px)] hover:opacity-80 transition-all rounded-t-sm border border-white/5">
                        <span className="absolute top-2 right-2 text-[9px] text-white/30 font-mono">+4.2%</span>
                    </div>
                </div>
            </div>

            {/* Bottom Labels */}
            <div className="flex justify-between px-10 mt-2 text-[10px] text-white/20 font-mono uppercase">
                <span>Q1</span>
                <span>Q2</span>
                <span>Q3</span>
                <span>Q4</span>
            </div>

            {/* Floating Action */}
            <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
                <ArrowUpRight className="w-4 h-4 text-white/40" />
            </div>
        </div>
    )
}
