"use client"

import { Package, TrendingUp, PiggyBank, AlertTriangle } from "lucide-react"
import { KPICard } from "./kpi-card"

interface Product {
    id: string
    name: string
    quantity?: number
    unit_price?: number
    selling_price?: number
    min_quantity?: number
}

interface KPIBandeauProps {
    products: Product[]
    loading?: boolean
}

export function KPIBandeau({ products, loading = false }: KPIBandeauProps) {
    // KPI 1: Valeur Stock
    const stockValue = products.reduce((sum, p) => sum + ((p.quantity || 0) * (p.unit_price || 0)), 0)

    // Generate fake historical data for sparkline (simulating 7-day evolution)
    const stockHistory = [
        stockValue * 0.92,
        stockValue * 0.95,
        stockValue * 0.88,
        stockValue * 0.94,
        stockValue * 0.97,
        stockValue * 0.99,
        stockValue
    ]

    // KPI 2: Prévision (simulated projection at -15% in 30 days)
    const forecastValue = Math.round(stockValue * 0.85)
    const forecastTrend = -15
    const forecastHistory = [
        stockValue,
        stockValue * 0.97,
        stockValue * 0.94,
        stockValue * 0.91,
        stockValue * 0.88,
        stockValue * 0.86,
        forecastValue
    ]

    // KPI 3: Marge estimée
    const marginData = products.reduce((acc, p) => {
        const qty = p.quantity || 0
        const buyPrice = p.unit_price || 0
        const sellPrice = p.selling_price || (buyPrice * 1.35) // Default 35% markup if no selling price
        const potentialRevenue = qty * sellPrice
        const cost = qty * buyPrice
        return {
            revenue: acc.revenue + potentialRevenue,
            cost: acc.cost + cost
        }
    }, { revenue: 0, cost: 0 })

    const marginValue = Math.round(marginData.revenue - marginData.cost)
    const marginPercentage = marginData.cost > 0
        ? Math.round(((marginData.revenue - marginData.cost) / marginData.cost) * 100)
        : 0

    const marginHistory = [
        marginValue * 0.88,
        marginValue * 0.92,
        marginValue * 0.90,
        marginValue * 0.95,
        marginValue * 0.98,
        marginValue * 0.96,
        marginValue
    ]

    // KPI 4: Alertes en cours
    const alerts = products.reduce((acc, p) => {
        const qty = p.quantity || 0
        const minQty = p.min_quantity || 0

        if (minQty > 0) {
            if (qty <= 0 || qty <= minQty) {
                acc.critical++
            } else if (qty <= minQty * 1.5) {
                acc.warning++
            }
        }
        return acc
    }, { critical: 0, warning: 0 })

    const totalAlerts = alerts.critical + alerts.warning
    const alertsSubtext = totalAlerts > 0
        ? `${alerts.critical} critiques · ${alerts.warning} à surveiller`
        : 'Tous les niveaux sont OK'

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Valeur Stock */}
            <KPICard
                label="Valeur Stock"
                value={`${stockValue.toLocaleString('fr-FR')} €`}
                subtext={`Mise à jour à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}
                icon={Package}
                accentColor="orange"
                miniChart={stockHistory}
                href="/manager/stock"
                loading={loading}
            />

            {/* KPI 2: Prévision */}
            <KPICard
                label="Prévision"
                value={`${forecastValue.toLocaleString('fr-FR')} €`}
                subtext="Projection à 30 jours"
                trend={{ value: Math.abs(forecastTrend), positive: forecastTrend > 0 }}
                icon={TrendingUp}
                accentColor="blue"
                miniChart={forecastHistory}
                href="/manager/forecasts"
                loading={loading}
            />

            {/* KPI 3: Marge estimée */}
            <KPICard
                label="Marge estimée"
                value={`${marginValue.toLocaleString('fr-FR')} €`}
                subtext={`Marge moyenne: ${marginPercentage}%`}
                icon={PiggyBank}
                accentColor="green"
                miniChart={marginHistory}
                href="/manager/margins"
                loading={loading}
            />

            {/* KPI 4: Alertes en cours */}
            <KPICard
                label="Alertes en cours"
                value={totalAlerts}
                subtext={alertsSubtext}
                icon={AlertTriangle}
                accentColor={totalAlerts > 0 ? (alerts.critical > 0 ? 'red' : 'orange') : 'green'}
                href="/manager/alerts"
                loading={loading}
            />
        </div>
    )
}
