"use client"

import { AlertTriangle, Bell, ShieldAlert, Package, CheckCircle2 } from "lucide-react"

interface Product {
    id: string
    name: string
    quantity?: number
    min_quantity?: number
    min_stock_threshold?: number
    category?: string
    unit_price?: number
}

interface Alert {
    id: string
    title: string
    description: string
    severity: 'critical' | 'warning' | 'info'
}

interface AlertsCardProps {
    products?: Product[]
}

export function AlertsCard({ products = [] }: AlertsCardProps) {
    // Générer les alertes basées sur les produits réels
    const alerts: Alert[] = []

    // Vérifier d'abord s'il y a du stock réel (valeur totale > 0)
    const hasRealStock = products && products.length > 0 && products.some((p: any) => {
        const quantity = p.quantity || 0
        const unitPrice = p.unit_price || 0
        return quantity > 0 && unitPrice > 0
    })

    // Ne générer des alertes que s'il y a du stock réel dans le système
    if (hasRealStock && products && products.length > 0) {
        products.forEach((product: any) => {
            const quantity = product.quantity || 0
            const minThreshold = product.min_quantity || product.min_stock_threshold || 0

            // Ne créer des alertes que si un seuil minimum est défini
            if (minThreshold > 0) {
                // Alerte critique : stock à 0 ou en dessous du seuil
                if (quantity <= 0) {
                    alerts.push({
                        id: `critical-${product.id}`,
                        title: 'Rupture de Stock',
                        description: `${product.name} : 0 restant (seuil: ${minThreshold})`,
                        severity: 'critical'
                    })
                } else if (quantity <= minThreshold) {
                    alerts.push({
                        id: `warning-${product.id}`,
                        title: 'Stock Critique',
                        description: `${product.name} : ${quantity} restants (seuil: ${minThreshold})`,
                        severity: 'critical'
                    })
                } else if (quantity <= minThreshold * 1.5) {
                    // Alerte warning : stock bas (entre seuil et 1.5x seuil)
                    alerts.push({
                        id: `low-${product.id}`,
                        title: 'Stock Bas',
                        description: `${product.name} : ${quantity} restants`,
                        severity: 'warning'
                    })
                }
            }
        })
    }

    // Limiter à 5 alertes max
    const displayedAlerts = alerts.slice(0, 5)

    const getSeverityConfig = (severity: string) => {
        switch (severity) {
            case 'critical':
                return {
                    gradient: 'from-red-500/15 via-red-500/10 to-transparent',
                    border: 'border-red-500/30 hover:border-red-500/50',
                    iconBg: 'from-red-500 to-rose-600',
                    textColor: 'text-red-400',
                    bar: 'bg-gradient-to-b from-red-500 to-rose-600',
                    glow: 'shadow-red-500/10',
                    pulse: true
                }
            case 'warning':
                return {
                    gradient: 'from-yellow-500/15 via-yellow-500/10 to-transparent',
                    border: 'border-yellow-500/30 hover:border-yellow-500/50',
                    iconBg: 'from-yellow-500 to-orange-500',
                    textColor: 'text-yellow-400',
                    bar: 'bg-gradient-to-b from-yellow-500 to-orange-500',
                    glow: 'shadow-yellow-500/10',
                    pulse: false
                }
            default:
                return {
                    gradient: 'from-blue-500/15 via-blue-500/10 to-transparent',
                    border: 'border-blue-500/30 hover:border-blue-500/50',
                    iconBg: 'from-blue-500 to-cyan-500',
                    textColor: 'text-blue-400',
                    bar: 'bg-gradient-to-b from-blue-500 to-cyan-500',
                    glow: 'shadow-blue-500/10',
                    pulse: false
                }
        }
    }

    return (
        <div className="group relative overflow-hidden rounded-[16px] border border-white/[0.08] bg-gradient-to-br from-[#1a1410]/90 via-[#1f1612]/80 to-[#1a1410]/90 backdrop-blur-xl shadow-xl shadow-black/20 transition-all duration-500 hover:border-white/[0.12]">
            {/* Danger glow for critical alerts */}
            {displayedAlerts.some(a => a.severity === 'critical') && (
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(239,68,68,0.08),transparent_60%)] animate-pulse" />
            )}

            <div className="relative p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-white tracking-tight">Alertes en cours</h3>
                            {displayedAlerts.length > 0 && (
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30">
                                    <Bell className="h-3 w-3 text-red-400 animate-pulse" />
                                    <span className="text-xs font-bold text-red-400">{displayedAlerts.length}</span>
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-white/40 mt-0.5">
                            {displayedAlerts.length > 0
                                ? "Ce qu'il faut surveiller en priorité"
                                : "État du stock en temps réel"}
                        </p>
                    </div>
                </div>

                {/* Alerts list */}
                <div className="space-y-3">
                    {displayedAlerts.length > 0 ? (
                        displayedAlerts.map((alert, index) => {
                            const config = getSeverityConfig(alert.severity)

                            return (
                                <div
                                    key={alert.id}
                                    className={`relative overflow-hidden rounded-xl border ${config.border} transition-all duration-300 hover:scale-[1.02] cursor-pointer group/alert ${config.glow} shadow-lg`}
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    {/* Background gradient */}
                                    <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient}`} />

                                    {/* Left color bar */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${config.bar} ${config.pulse ? 'animate-pulse' : ''}`} />

                                    <div className="relative p-4 pl-5">
                                        <div className="flex items-start gap-3">
                                            {/* Icon with gradient background */}
                                            <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${config.iconBg} flex items-center justify-center shadow-lg flex-shrink-0`}>
                                                {alert.severity === 'critical' ? (
                                                    <ShieldAlert className="h-4 w-4 text-white" />
                                                ) : (
                                                    <Package className="h-4 w-4 text-white" />
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="text-sm font-semibold text-white">
                                                        {alert.title}
                                                    </p>
                                                    {config.pulse && (
                                                        <span className="flex h-2 w-2">
                                                            <span className="animate-ping absolute h-2 w-2 rounded-full bg-red-400 opacity-75" />
                                                            <span className="relative rounded-full h-2 w-2 bg-red-500" />
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-white/60">
                                                    {alert.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <div className="text-center py-8">
                            <div className="h-14 w-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="h-7 w-7 text-green-400" />
                            </div>
                            <p className="text-sm font-medium text-green-400">Aucune alerte</p>
                            <p className="text-xs text-white/40 mt-1">Tous les stocks sont à niveau 👍</p>
                        </div>
                    )}
                </div>

                {/* Show more link if there are more alerts */}
                {alerts.length > 5 && (
                    <div className="mt-4 pt-3 border-t border-white/[0.06]">
                        <button className="w-full text-center text-xs text-white/40 hover:text-orange-400 transition-colors font-medium">
                            Voir les {alerts.length - 5} autres alertes →
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
