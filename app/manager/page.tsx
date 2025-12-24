"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Package,
  ShoppingCart,
  Truck,
  TrendingUp,
  BarChart3,
  Calculator,
  MessageSquare,
  AlertTriangle,
  Euro,
  Target,
  Calendar,
  ClipboardList,
  Boxes,
  PieChart,
  Bell,
  Zap,
  FileText,
  Users,
  Settings,
  Globe,
  RefreshCw,
} from "lucide-react"
import { useRealtimeProducts } from "@/lib/hooks/use-realtime"
import { useAuth } from "@/lib/hooks/use-auth"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

// Composant GlassTile
function GlassTile({ 
  children, 
  className = "", 
  badge,
  badgeType,
  animationDelay = 0,
  mini = false,
  href,
}: { 
  children: React.ReactNode
  className?: string
  badge?: string
  badgeType?: "new" | "beta" | "pro"
  animationDelay?: number
  mini?: boolean
  href?: string
}) {
  const baseStyles: React.CSSProperties = {
    position: "relative",
    background: "linear-gradient(145deg, rgba(20, 27, 45, 0.92) 0%, rgba(15, 20, 35, 0.95) 50%, rgba(12, 17, 30, 0.98) 100%)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid rgba(100, 130, 180, 0.15)",
    borderRadius: mini ? "16px" : "20px",
    padding: mini ? "18px 20px" : "24px",
    overflow: "hidden",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 4px 24px rgba(0, 0, 0, 0.25), 0 1px 3px rgba(0, 0, 0, 0.15)",
    animation: `glassEnter 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${animationDelay}s forwards`,
    opacity: 0,
  }

  const getBadgeStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: "absolute",
      top: "20px",
      right: "20px",
      padding: "5px 12px",
      fontSize: "10px",
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      borderRadius: "20px",
      backdropFilter: "blur(8px)",
      zIndex: 2,
    }
    
    if (badgeType === "new") {
      return { ...base, background: "linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.15) 100%)", border: "1px solid rgba(34, 197, 94, 0.4)", color: "#4ade80" }
    }
    if (badgeType === "beta") {
      return { ...base, background: "linear-gradient(135deg, rgba(251, 146, 60, 0.2) 0%, rgba(234, 88, 12, 0.15) 100%)", border: "1px solid rgba(251, 146, 60, 0.4)", color: "#fb923c" }
    }
    if (badgeType === "pro") {
      return { ...base, background: "linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(139, 92, 246, 0.15) 100%)", border: "1px solid rgba(168, 85, 247, 0.4)", color: "#a78bfa" }
    }
    return { ...base, background: "rgba(30, 41, 59, 0.8)", border: "1px solid rgba(100, 130, 180, 0.25)", color: "rgba(203, 213, 225, 0.9)" }
  }

  const content = (
    <>
      {/* Reflet diagonal */}
      <div 
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "50%",
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(120, 160, 220, 0.04) 30%, transparent 60%)",
          pointerEvents: "none",
          borderRadius: mini ? "16px 16px 0 0" : "20px 20px 0 0",
        }}
      />
      
      {/* Ligne lumineuse */}
      <div 
        style={{
          position: "absolute",
          top: 0,
          left: "20px",
          right: "20px",
          height: "1px",
          background: "linear-gradient(90deg, transparent 0%, rgba(120, 160, 220, 0.3) 20%, rgba(180, 200, 255, 0.4) 50%, rgba(120, 160, 220, 0.3) 80%, transparent 100%)",
          pointerEvents: "none",
        }}
      />
      
      {/* Badge */}
      {badge && <span style={getBadgeStyle()}>{badge}</span>}
      
      {/* Contenu */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {children}
      </div>
    </>
  )

  if (href) {
    return (
      <Link 
        href={href} 
        className={`group block hover:translate-y-[-3px] hover:border-[rgba(100,150,220,0.35)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.35),0_0_30px_rgba(59,130,246,0.08)] ${className}`}
        style={baseStyles}
      >
        {content}
      </Link>
    )
  }

  return (
    <div 
      className={`group hover:translate-y-[-3px] hover:border-[rgba(100,150,220,0.35)] ${className}`}
      style={baseStyles}
    >
      {content}
    </div>
  )
}

// Icône colorée
function TileIcon({ Icon, color }: { Icon: React.ElementType; color: string }) {
  const colors: Record<string, { bg: string; border: string; text: string }> = {
    blue: { bg: "linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.15) 100%)", border: "rgba(59, 130, 246, 0.3)", text: "#60a5fa" },
    green: { bg: "linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.15) 100%)", border: "rgba(34, 197, 94, 0.3)", text: "#4ade80" },
    orange: { bg: "linear-gradient(135deg, rgba(251, 146, 60, 0.2) 0%, rgba(234, 88, 12, 0.15) 100%)", border: "rgba(251, 146, 60, 0.3)", text: "#fb923c" },
    purple: { bg: "linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(139, 92, 246, 0.15) 100%)", border: "rgba(168, 85, 247, 0.3)", text: "#a78bfa" },
    cyan: { bg: "linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(8, 145, 178, 0.15) 100%)", border: "rgba(6, 182, 212, 0.3)", text: "#22d3ee" },
    pink: { bg: "linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(219, 39, 119, 0.15) 100%)", border: "rgba(236, 72, 153, 0.3)", text: "#f472b6" },
  }
  const c = colors[color] || colors.blue
  
  return (
    <div style={{
      width: "44px",
      height: "44px",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "16px",
      background: c.bg,
      border: `1px solid ${c.border}`,
      color: c.text,
    }}>
      <Icon className="w-5 h-5" />
    </div>
  )
}

// Titre coloré
function TileTitle({ children, color }: { children: React.ReactNode; color: string }) {
  const colors: Record<string, string> = {
    blue: "#60a5fa",
    green: "#4ade80",
    orange: "#fb923c",
    purple: "#a78bfa",
    cyan: "#22d3ee",
    pink: "#f472b6",
    white: "#f1f5f9",
  }
  
  return (
    <h3 style={{
      fontSize: "17px",
      fontWeight: 600,
      marginBottom: "8px",
      letterSpacing: "-0.01em",
      color: colors[color] || colors.blue,
    }}>
      {children}
    </h3>
  )
}

// Mot clé coloré
function K({ children, c }: { children: React.ReactNode; c: string }) {
  const colors: Record<string, string> = {
    b: "#60a5fa",
    g: "#4ade80",
    o: "#fb923c",
    p: "#a78bfa",
    c: "#22d3ee",
    pk: "#f472b6",
  }
  
  return (
    <span 
      className="group-hover:drop-shadow-[0_0_8px_currentColor] transition-all duration-300"
      style={{ color: colors[c] || colors.b, fontWeight: 500 }}
    >
      {children}
    </span>
  )
}

export default function ManagerDashboard() {
  const { products, loading } = useRealtimeProducts()
  const { profile, establishment } = useAuth()

  // Calculate KPIs
  const stockValue = products.reduce((sum, p: any) => sum + ((p.quantity || 0) * (p.unit_price || 0)), 0)
  const marginData = products.reduce((acc, p: any) => {
    const qty = p.quantity || 0
    const buyPrice = p.unit_price || 0
    const sellPrice = p.selling_price || (buyPrice * 1.35)
    return {
      revenue: acc.revenue + (qty * sellPrice),
      cost: acc.cost + (qty * buyPrice)
    }
  }, { revenue: 0, cost: 0 })
  const marginValue = Math.round(marginData.revenue - marginData.cost)

  // Chart data
  const revenueData = [
    { month: "Jan", revenue: 125000, margin: 42000 },
    { month: "Fév", revenue: 138000, margin: 45000 },
    { month: "Mar", revenue: 146000, margin: 48000 },
    { month: "Avr", revenue: 142000, margin: 44000 },
    { month: "Mai", revenue: 158000, margin: 52000 },
    { month: "Juin", revenue: 165000, margin: 55000 },
    { month: "Juil", revenue: 172000, margin: 58000 },
    { month: "Août", revenue: Math.round(marginData.revenue) || 180000, margin: marginValue || 60000 },
  ]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-tooltip">
          <p className="text-sm font-semibold text-white mb-2">{label} 2025</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
              <span className="text-slate-400">{entry.name}:</span>
              <span className="text-white font-medium">€{entry.value.toLocaleString('fr-FR')}</span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  // Tiles data
  const featureTiles = [
    {
      id: "stocks",
      href: "/manager/stock",
      icon: Package,
      iconColor: "blue",
      title: "Gestion des Stocks",
      titleColor: "blue",
      description: <>Gérez votre <K c="b">inventaire</K> en temps réel. Suivez les <K c="g">entrées</K> et <K c="o">sorties</K> de marchandises.</>,
      badge: "PREVIEW",
      stat: stockValue.toLocaleString('fr-FR') + ' €',
      statLabel: "Valeur totale",
    },
    {
      id: "orders",
      href: "/manager/orders",
      icon: ShoppingCart,
      iconColor: "green",
      title: "Commandes",
      titleColor: "green",
      description: <>Créez et suivez vos <K c="g">commandes</K> fournisseurs. <K c="b">Automatisez</K> vos réapprovisionnements.</>,
      badge: "PREVIEW",
    },
    {
      id: "suppliers",
      href: "/manager/suppliers",
      icon: Truck,
      iconColor: "purple",
      title: "Fournisseurs",
      titleColor: "purple",
      description: <>Gérez vos <K c="p">partenaires</K> commerciaux. Comparez les <K c="b">prix</K> et délais de livraison.</>,
      badge: "PREVIEW",
    },
    {
      id: "forecasts",
      href: "/manager/forecasts",
      icon: TrendingUp,
      iconColor: "cyan",
      title: "Prévisions",
      titleColor: "cyan",
      description: <>Anticipez vos <K c="c">besoins</K> grâce à l'<K c="b">analyse</K> prédictive. Évitez les <K c="o">ruptures</K>.</>,
      badge: "NOUVEAU",
      badgeType: "new" as const,
    },
    {
      id: "reports",
      href: "/manager/reports",
      icon: BarChart3,
      iconColor: "orange",
      title: "Rapports",
      titleColor: "orange",
      description: <>Visualisez vos <K c="o">performances</K> avec des tableaux de bord <K c="b">détaillés</K>.</>,
      badge: "PREVIEW",
    },
    {
      id: "calculator",
      href: "/manager/calculator",
      icon: Calculator,
      iconColor: "pink",
      title: "Calculateur",
      titleColor: "pink",
      description: <>Calculez vos <K c="pk">marges</K> et <K c="g">rentabilité</K> par produit ou catégorie.</>,
      badge: "PRO",
      badgeType: "pro" as const,
    },
    {
      id: "alerts",
      href: "/manager/alerts",
      icon: Bell,
      iconColor: "orange",
      title: "Alertes",
      titleColor: "orange",
      description: <>Recevez des <K c="o">notifications</K> en temps réel sur les <K c="c">seuils</K> critiques.</>,
      badge: "PREVIEW",
    },
    {
      id: "margins",
      href: "/manager/margins",
      icon: PieChart,
      iconColor: "green",
      title: "Analyse Marges",
      titleColor: "green",
      description: <>Optimisez vos <K c="g">marges</K> par produit. Identifiez les <K c="o">opportunités</K> de gains.</>,
      badge: "BETA",
      badgeType: "beta" as const,
      stat: marginValue > 0 ? marginValue.toLocaleString('fr-FR') + ' €' : '5 000 €',
      statLabel: "Marge estimée",
    },
    {
      id: "feedback",
      href: "/manager/feedback",
      icon: MessageSquare,
      iconColor: "cyan",
      title: "Feedbacks",
      titleColor: "cyan",
      description: <>Collectez les <K c="c">retours</K> de votre équipe. Améliorez vos <K c="b">processus</K>.</>,
      badge: "PREVIEW",
    },
  ]

  // Quick action tiles
  const quickActions = [
    {
      id: "new-stock",
      icon: Boxes,
      iconColor: "blue",
      title: "Ajouter Stock",
      titleColor: "blue",
      description: <>Enregistrer une <K c="b">nouvelle entrée</K> de marchandise</>,
    },
    {
      id: "new-order",
      icon: ClipboardList,
      iconColor: "green",
      title: "Créer Commande",
      titleColor: "green",
      description: <>Passer une <K c="g">commande</K> fournisseur</>,
    },
    {
      id: "check-alerts",
      icon: AlertTriangle,
      iconColor: "orange",
      title: "Voir Alertes",
      titleColor: "orange",
      description: <>Consulter les <K c="o">alertes</K> en cours</>,
    },
    {
      id: "daily-report",
      icon: FileText,
      iconColor: "purple",
      title: "Rapport du Jour",
      titleColor: "purple",
      description: <>Générer le <K c="p">rapport</K> quotidien</>,
    },
  ]

  return (
    <>
      <style jsx global>{`
        @keyframes glassEnter {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
      
      <div className="p-6 space-y-8">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-100 mb-2 tracking-tight">Bienvenue sur StockGuard</h1>
          <p className="text-sm text-slate-400">
            Gérez votre <K c="b">établissement</K> avec nos outils <K c="g">intelligents</K>. 
            Utilisez nos modules ou commencez de zéro.
          </p>
        </div>

        {/* Main Chart */}
        <GlassTile animationDelay={0}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold text-white">Revenue & Marges</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="w-2 h-2 rounded-full" style={{ background: "#3b82f6" }} />
                  <span>Revenue</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="w-2 h-2 rounded-full" style={{ background: "#22c55e" }} />
                  <span>Marge</span>
                </div>
              </div>
            </div>
          </div>

          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorMargin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(148, 163, 184, 0.6)', fontSize: 12 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(148, 163, 184, 0.6)', fontSize: 12 }}
                  tickFormatter={(value) => `${value / 1000}K`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
                <Area
                  type="monotone"
                  dataKey="margin"
                  name="Marge"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorMargin)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassTile>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Actions Rapides</h2>
          <div className="grid grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <GlassTile key={action.id} mini animationDelay={0.05 + index * 0.05} className="cursor-pointer">
                <TileIcon Icon={action.icon} color={action.iconColor} />
                <TileTitle color={action.titleColor}>{action.title}</TileTitle>
                <p className="text-[13px] leading-relaxed text-slate-400/85">{action.description}</p>
              </GlassTile>
            ))}
          </div>
        </div>

        {/* Feature Modules */}
        <div>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-2">Modules Disponibles</h2>
            <p className="text-sm text-slate-400">
              Explorez nos <K c="b">fonctionnalités</K> pour optimiser votre gestion.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-5">
            {featureTiles.map((tile, index) => (
              <GlassTile
                key={tile.id}
                href={tile.href}
                badge={tile.badge}
                badgeType={tile.badgeType}
                animationDelay={0.25 + index * 0.05}
              >
                <TileIcon Icon={tile.icon} color={tile.iconColor} />
                <TileTitle color={tile.titleColor}>{tile.title}</TileTitle>
                <p className="text-[13px] leading-relaxed text-slate-400/85">{tile.description}</p>
                
                {tile.stat && (
                  <div className="mt-4 pt-4 border-t border-white/[0.06]">
                    <p className="text-xs text-slate-500 uppercase tracking-wide">{tile.statLabel}</p>
                    <p className="text-2xl font-bold text-slate-100 mt-1">{tile.stat}</p>
                  </div>
                )}
              </GlassTile>
            ))}
          </div>
        </div>

        {/* Bottom Info */}
        <GlassTile animationDelay={0.7}>
          <div className="flex items-start gap-4">
            <TileIcon Icon={Zap} color="cyan" />
            <div>
              <TileTitle color="white">Conseil du Jour</TileTitle>
              <p className="text-[13px] leading-relaxed text-slate-400/85">
                Analysez régulièrement vos <K c="g">marges</K> par catégorie de produit. 
                Un produit à forte <K c="b">rotation</K> mais faible marge peut impacter 
                significativement votre <K c="o">rentabilité</K> globale.
              </p>
            </div>
          </div>
        </GlassTile>
      </div>
    </>
  )
}
