"use client"

import { Activity, CheckCircle2, AlertCircle, Cloud, RefreshCw, Cpu, Clock } from "lucide-react"

interface Service {
    name: string
    status: 'operational' | 'unstable' | 'down'
    lastCheck?: string
    icon?: 'api' | 'sync' | 'iot'
}

interface ServiceStatusCardProps {
    services?: Service[]
}

const mockServices: Service[] = [
    {
        name: 'API Commandes',
        status: 'operational',
        lastCheck: 'Il y a 2 min',
        icon: 'api'
    },
    {
        name: 'Synchronisation Stock',
        status: 'operational',
        lastCheck: 'Il y a 5 min',
        icon: 'sync'
    },
    {
        name: 'Capteurs IoT',
        status: 'unstable',
        lastCheck: 'Il y a 15 min',
        icon: 'iot'
    }
]

export function ServiceStatusCard({ services = mockServices }: ServiceStatusCardProps) {
    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'operational':
                return {
                    icon: CheckCircle2,
                    color: 'text-green-400',
                    bg: 'from-green-500/10 to-emerald-500/5',
                    border: 'border-green-500/20 hover:border-green-500/40',
                    dot: 'bg-green-400',
                    dotGlow: 'shadow-green-400/50',
                    label: 'Opérationnel',
                    pulse: true
                }
            case 'unstable':
                return {
                    icon: AlertCircle,
                    color: 'text-yellow-400',
                    bg: 'from-yellow-500/10 to-orange-500/5',
                    border: 'border-yellow-500/20 hover:border-yellow-500/40',
                    dot: 'bg-yellow-400',
                    dotGlow: 'shadow-yellow-400/50',
                    label: 'Instable',
                    pulse: false,
                    shake: true
                }
            default:
                return {
                    icon: Activity,
                    color: 'text-red-400',
                    bg: 'from-red-500/10 to-rose-500/5',
                    border: 'border-red-500/20 hover:border-red-500/40',
                    dot: 'bg-red-400',
                    dotGlow: 'shadow-red-400/50',
                    label: 'Hors ligne',
                    pulse: false
                }
        }
    }

    const getServiceIcon = (iconType?: string) => {
        switch (iconType) {
            case 'api':
                return Cloud
            case 'sync':
                return RefreshCw
            case 'iot':
                return Cpu
            default:
                return Activity
        }
    }

    return (
        <div className="group relative overflow-hidden rounded-[16px] border border-white/[0.08] bg-gradient-to-br from-[#1a1410]/90 via-[#1f1612]/80 to-[#1a1410]/90 backdrop-blur-xl shadow-xl shadow-black/20 transition-all duration-500 hover:border-white/[0.12]">
            <div className="relative p-6">
                {/* Header */}
                <div className="mb-5">
                    <h3 className="text-lg font-semibold text-white tracking-tight">Statut des services</h3>
                    <p className="text-xs text-white/40 mt-0.5">L&apos;infra qui travaille pendant que tu gères le reste</p>
                </div>

                {/* Services list */}
                <div className="space-y-2.5">
                    {services.map((service, index) => {
                        const config = getStatusConfig(service.status)
                        const ServiceIcon = getServiceIcon(service.icon)

                        return (
                            <div
                                key={index}
                                className={`relative overflow-hidden rounded-xl border ${config.border} transition-all duration-300 hover:scale-[1.01] cursor-default`}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                {/* Background gradient */}
                                <div className={`absolute inset-0 bg-gradient-to-r ${config.bg}`} />

                                <div className="relative p-3.5">
                                    <div className="flex items-center gap-3">
                                        {/* Service icon */}
                                        <div className={`h-9 w-9 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center ${config.shake ? 'animate-wiggle' : ''}`}>
                                            <ServiceIcon className={`h-4 w-4 ${config.color}`} />
                                        </div>

                                        {/* Service info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="text-sm font-medium text-white">
                                                    {service.name}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {/* Status dot with glow */}
                                                <div className="relative">
                                                    <div className={`h-2 w-2 rounded-full ${config.dot} ${config.dotGlow} shadow-lg ${config.pulse ? 'animate-pulse' : ''}`} />
                                                </div>

                                                <span className={`text-xs font-medium ${config.color}`}>
                                                    {config.label}
                                                </span>

                                                {service.lastCheck && (
                                                    <>
                                                        <span className="text-xs text-white/20">•</span>
                                                        <div className="flex items-center gap-1 text-xs text-white/40">
                                                            <Clock className="h-3 w-3" />
                                                            <span>{service.lastCheck}</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Status icon */}
                                        <config.icon className={`h-5 w-5 ${config.color} opacity-60`} />
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
