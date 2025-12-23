"use client"

import { ArrowUpRight, CheckCircle2, AlertTriangle, Clock, ArrowRight } from "lucide-react"

export function PipelineCard() {
    return (
        <div className="col-span-4 relative group h-full">
            {/* Card Container */}
            <div className="absolute inset-0 bg-[#00ff88] rounded-[2rem] p-6 text-black overflow-hidden transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_20px_40px_-10px_rgba(0,255,136,0.3)]">

                {/* Texture/Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,black_1px,transparent_1px)] bg-[length:8px_8px]" />
                <div className="absolute right-0 bottom-0 w-32 h-32 bg-gradient-to-tl from-black/20 to-transparent rounded-tl-[100%]" />

                {/* Header */}
                <div className="relative flex justify-between items-start mb-8">
                    <h2 className="text-xl font-medium tracking-tight">Orders Pipeline</h2>
                    <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center cursor-pointer hover:bg-black/20 transition-colors">
                        <ArrowUpRight className="w-4 h-4" />
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="relative grid grid-cols-4 gap-2 mb-8">
                    <div className="flex flex-col">
                        <span className="text-3xl font-bold mb-1">1</span>
                        <span className="text-[10px] font-medium opacity-60 uppercase tracking-wider">Over Due</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-3xl font-bold mb-1">3</span>
                        <span className="text-[10px] font-medium opacity-60 uppercase tracking-wider">Returns</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-3xl font-bold mb-1">14</span>
                        <span className="text-[10px] font-medium opacity-60 uppercase tracking-wider">In Progress</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-3xl font-bold mb-1">94</span>
                        <span className="text-[10px] font-medium opacity-60 uppercase tracking-wider">Completed</span>
                    </div>
                </div>

                {/* Progress Visualization */}
                <div className="relative h-16 w-full flex items-end justify-between gap-1 overflow-visible">
                    {/* Decorative bars */}
                    <div className="flex-1 h-full bg-black/5 rounded-t-lg relative overflow-hidden group-hover:h-[110%] transition-all duration-500 delay-75">
                        <div className="absolute bottom-0 w-full h-[30%] bg-black/10" />
                    </div>
                    <div className="flex-1 h-[60%] bg-black/10 rounded-t-lg relative overflow-hidden group-hover:h-[80%] transition-all duration-500 delay-100">
                        <div className="absolute bottom-0 w-full h-[60%] bg-black/10" />
                    </div>
                    <div className="flex-1 h-[40%] bg-black/5 rounded-t-lg group-hover:h-[50%] transition-all duration-500 delay-150" />

                    {/* Main gradient bar */}
                    <div className="flex-[2] h-[80%] bg-gradient-to-t from-black/20 to-black/5 rounded-t-xl group-hover:h-[90%] transition-all duration-500 overflow-hidden">
                        <div className="w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(0,0,0,0.05)_2px,rgba(0,0,0,0.05)_4px)]" />
                    </div>
                </div>

            </div>
        </div>
    )
}
