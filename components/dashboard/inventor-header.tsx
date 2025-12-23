"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, RefreshCw, Bell, User } from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"

export function InventorHeader() {
    const { profile } = useAuth()
    const userName = profile?.first_name || "Manager"
    const date = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

    const [activeTab, setActiveTab] = useState("Overview")
    const tabs = ["Overview", "Orders", "Inventory Suppliers", "Sales", "Settings"]

    const refreshDashboard = () => {
        window.location.reload()
    }

    return (
        <div className="flex flex-col gap-6 mb-8">
            {/* Top Thin Bar */}
            <div className="flex items-center justify-between py-2 text-white/50 text-xs tracking-wider">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full border border-green-400/50 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
                    </div>
                    <span className="font-semibold text-white tracking-widest">STOCKGUARD</span>
                    <span className="px-1.5 py-0.5 rounded bg-white/5 text-[10px]">HUB</span>
                </div>

                {/* Center Tabs */}
                <div className="flex items-center gap-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`relative text-xs transition-colors duration-300 ${activeTab === tab ? "text-white font-medium" : "text-white/40 hover:text-white/70"
                                }`}
                        >
                            {activeTab === tab && (
                                <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-green-400 shadow-[0_0_5px_rgba(74,222,128,0.8)]" />
                            )}
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Right User */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10 flex items-center justify-center overflow-hidden">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-3 h-3 text-white/50" />
                            )}
                        </div>
                        <span>{userName}</span>
                    </div>
                </div>
            </div>

            {/* Hello Block */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-4xl font-light text-white mb-2 tracking-tight">
                        Hello, <span className="font-normal text-white">{userName}</span>
                    </h1>
                    <p className="text-white/40 text-sm font-light tracking-wide">
                        Its {date}
                    </p>
                </div>

                <button
                    onClick={refreshDashboard}
                    className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all duration-300 backdrop-blur-md"
                >
                    <RefreshCw className="w-3.5 h-3.5 text-white/50 group-hover:text-green-400 transition-colors" />
                    <span className="text-xs text-white/60 group-hover:text-white transition-colors">Refresh Dashboard</span>
                </button>
            </div>
        </div>
    )
}
