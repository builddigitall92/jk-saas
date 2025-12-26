"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Package,
  ShoppingCart,
  Truck,
  TrendingUp,
  TrendingDown,
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
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  Clock,
  AlertCircle,
  XCircle,
  CheckCircle,
  Archive,
  RotateCcw,
  Camera,
} from "lucide-react"
import { useRealtimeProducts } from "@/lib/hooks/use-realtime"
import { useAuth } from "@/lib/hooks/use-auth"
import { useStock } from "@/lib/hooks/use-stock"
import { useMenuItems } from "@/lib/hooks/use-menu-items"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"

// ============================================
// COMPOSANTS UI RÉUTILISABLES
// ============================================

// Icône avec effet de hover
function AnimatedIcon({ Icon, className = "" }: { Icon: React.ElementType; className?: string }) {
  return <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${className}`} />
}

// Badge de variation avec couleur
function VariationBadge({ value, suffix = "" }: { value: number; suffix?: string }) {
  const isPositive = value >= 0
  return (
    <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
      {isPositive ? (
        <TrendingUp className="w-4 h-4" />
      ) : (
        <TrendingDown className="w-4 h-4" />
      )}
      <span>{isPositive ? '+' : ''}{value}{suffix}</span>
      </div>
  )
}

// ============================================
// SECTION 1 - SANTÉ DU BUSINESS (Style Premium Badge)
// ============================================

// Type pour les cartes Business Health
type BusinessHealthType = 'revenue' | 'stockValue' | 'margin' | 'overstock';

// Mapping icônes Lucide par type de KPI
const businessHealthIcons: Record<BusinessHealthType, React.ElementType> = {
  revenue: Euro,
  stockValue: Package,
  margin: BarChart3,
  overstock: AlertTriangle,
};

// Configuration des variantes de style (comme les attention cards)
const businessHealthStyles: Record<BusinessHealthType, {
  cardBg: string;
  borderColor: string;
  hoverBorder: string;
  hoverShadow: string;
  glowGradient: string;
  iconBg: string;
  iconBorder: string;
  iconColor: string;
}> = {
  revenue: {
    cardBg: 'linear-gradient(145deg, rgba(10, 15, 25, 0.9) 0%, rgba(10, 10, 15, 0.95) 100%)',
    borderColor: 'rgba(59, 130, 246, 0.2)',
    hoverBorder: 'rgba(59, 130, 246, 0.4)',
    hoverShadow: '0 15px 40px rgba(59, 130, 246, 0.15), 0 0 30px rgba(59, 130, 246, 0.1)',
    glowGradient: 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.5) 0%, rgba(99, 102, 241, 0.3) 40%, transparent 70%)',
    iconBg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)',
    iconBorder: 'rgba(59, 130, 246, 0.3)',
    iconColor: '#60a5fa',
  },
  stockValue: {
    cardBg: 'linear-gradient(145deg, rgba(10, 18, 20, 0.9) 0%, rgba(10, 10, 15, 0.95) 100%)',
    borderColor: 'rgba(6, 182, 212, 0.2)',
    hoverBorder: 'rgba(6, 182, 212, 0.4)',
    hoverShadow: '0 15px 40px rgba(6, 182, 212, 0.15), 0 0 30px rgba(6, 182, 212, 0.1)',
    glowGradient: 'radial-gradient(ellipse at center, rgba(6, 182, 212, 0.5) 0%, rgba(20, 184, 166, 0.3) 40%, transparent 70%)',
    iconBg: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(6, 182, 212, 0.1) 100%)',
    iconBorder: 'rgba(6, 182, 212, 0.3)',
    iconColor: '#22d3ee',
  },
  margin: {
    cardBg: 'linear-gradient(145deg, rgba(10, 20, 15, 0.9) 0%, rgba(10, 10, 15, 0.95) 100%)',
    borderColor: 'rgba(34, 197, 94, 0.2)',
    hoverBorder: 'rgba(34, 197, 94, 0.4)',
    hoverShadow: '0 15px 40px rgba(34, 197, 94, 0.15), 0 0 30px rgba(34, 197, 94, 0.1)',
    glowGradient: 'radial-gradient(ellipse at center, rgba(34, 197, 94, 0.5) 0%, rgba(16, 185, 129, 0.3) 40%, transparent 70%)',
    iconBg: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%)',
    iconBorder: 'rgba(34, 197, 94, 0.3)',
    iconColor: '#4ade80',
  },
  overstock: {
    cardBg: 'linear-gradient(145deg, rgba(20, 15, 10, 0.9) 0%, rgba(10, 10, 12, 0.95) 100%)',
    borderColor: 'rgba(251, 146, 60, 0.2)',
    hoverBorder: 'rgba(251, 146, 60, 0.4)',
    hoverShadow: '0 15px 40px rgba(251, 146, 60, 0.15), 0 0 30px rgba(251, 146, 60, 0.1)',
    glowGradient: 'radial-gradient(ellipse at center, rgba(251, 146, 60, 0.5) 0%, rgba(239, 68, 68, 0.3) 40%, transparent 70%)',
    iconBg: 'linear-gradient(135deg, rgba(251, 146, 60, 0.2) 0%, rgba(251, 146, 60, 0.1) 100%)',
    iconBorder: 'rgba(251, 146, 60, 0.3)',
    iconColor: '#fb923c',
  },
};

function BusinessHealthSection({ 
  caMonth, 
  stockValue, 
  marginValue, 
  marginPercent,
  dormantStock,
  dormantCount,
  hasData
}: { 
  caMonth: number
  stockValue: number
  marginValue: number
  marginPercent: number
  dormantStock: number
  dormantCount: number
  hasData: boolean
}) {
  const kpis: {
    id: string;
    type: BusinessHealthType;
    label: string;
    value: string;
    variation: number | null;
    variationSuffix: string;
    isWarning?: boolean;
    noData?: boolean;
  }[] = [
    {
      id: "ca",
      type: "revenue",
      label: "CA du Mois",
      value: hasData && caMonth > 0 ? `${caMonth.toLocaleString('fr-FR')} €` : "-- €",
      variation: null, // Pas de variation sans historique de ventes
      variationSuffix: "%",
      noData: !hasData || caMonth === 0,
    },
    {
      id: "stock",
      type: "stockValue",
      label: "Valeur Totale Stock",
      value: stockValue > 0 ? `${stockValue.toLocaleString('fr-FR')} €` : "-- €",
      variation: null, // Pas de variation sans historique
      variationSuffix: "%",
      noData: stockValue === 0,
    },
    {
      id: "margin",
      type: "margin",
      label: "Marge Globale",
      value: hasData && marginValue > 0 ? `${marginValue.toLocaleString('fr-FR')} € (${marginPercent}%)` : "-- €",
      variation: null, // Pas de variation sans historique
      variationSuffix: "% pts",
      noData: !hasData || marginValue === 0,
    },
    {
      id: "dormant",
      type: "overstock",
      label: "Stock Dormant / Surstock",
      value: dormantStock > 0 ? `${dormantStock.toLocaleString('fr-FR')} €` : "0 €",
      variation: dormantCount > 0 ? dormantCount : null,
      variationSuffix: " réf.",
      isWarning: dormantCount > 0,
      noData: false,
    },
  ]

    return (
    <section className="animate-section" style={{ animationDelay: '0.1s' }}>
      <h2 className="text-lg font-semibold text-slate-200 mb-8 flex items-center gap-2">
        <Target className="w-5 h-5 text-blue-400" />
        Santé du Business
      </h2>
      <div className="grid grid-cols-4 gap-5">
        {kpis.map((kpi, index) => {
          const IconComponent = businessHealthIcons[kpi.type];
          const styles = businessHealthStyles[kpi.type];
          
          return (
            <div
              key={kpi.id}
              className="business-health-card group"
              style={{ 
                animationDelay: `${0.15 + index * 0.05}s`,
                ['--card-bg' as string]: styles.cardBg,
                ['--border-color' as string]: styles.borderColor,
                ['--hover-border' as string]: styles.hoverBorder,
                ['--hover-shadow' as string]: styles.hoverShadow,
                ['--glow-gradient' as string]: styles.glowGradient,
                ['--icon-bg' as string]: styles.iconBg,
                ['--icon-border' as string]: styles.iconBorder,
                ['--icon-color' as string]: styles.iconColor,
              }}
            >
              {/* Ligne lumineuse en haut (comme attention cards) */}
              <div className="business-health-topline" />
              
              {/* Badge Icon (style attention cards) */}
              <div className="business-health-icon">
                <IconComponent className="w-5 h-5" strokeWidth={2} />
              </div>
              
              {/* Glow radial en bas (comme attention cards) */}
              <div className="business-health-glow" />
              
              {/* Contenu de la carte */}
              <div className="relative z-10">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.12em] mb-2">
                  {kpi.label}
                </p>
                <p className="text-2xl font-bold text-white mb-2 tracking-tight leading-none">
                  {kpi.value}
                </p>
                {kpi.noData ? (
                  <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
                    <span className="text-xs">Aucune donnée</span>
                  </div>
                ) : kpi.variation !== null ? (
                  <div className={`flex items-center gap-1.5 text-sm font-medium ${
                    kpi.isWarning 
                      ? 'text-amber-400' 
                      : kpi.variation >= 0 
                        ? 'text-emerald-400' 
                        : 'text-red-400'
                  }`}>
                    {kpi.isWarning ? (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    ) : kpi.variation >= 0 ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" />
                    )}
                    <span className="text-xs font-medium">
                      {kpi.isWarning ? '' : kpi.variation >= 0 ? '+' : ''}
                      {kpi.variation}{kpi.variationSuffix}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
                    <span className="text-xs">--</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  )
}

// ============================================
// SECTION 2 - CE QUI DEMANDE VOTRE ATTENTION
// ============================================
// Type pour la sévérité des alertes
type AlertSeverity = 'none' | 'low' | 'medium' | 'high';
type AlertVariant = 'ruptures' | 'orders' | 'alerts' | 'feedbacks';

// Composant AttentionCard avec glassmorphism
function AttentionCard({ 
  title, 
  subtitle, 
  actionLabel, 
  severity = 'none',
  variant,
  icon: Icon,
  href,
  index = 0
}: {
  title: string;
  subtitle: string;
  actionLabel: string;
  severity?: AlertSeverity;
  variant: AlertVariant;
  icon: React.ElementType;
  href: string;
  index?: number;
}) {
  // Déterminer la classe de shake basée sur la sévérité
  const getShakeClass = () => {
    switch (severity) {
      case 'high': return 'attention-shake-high';
      case 'medium': return 'attention-shake-medium';
      case 'low': return 'attention-shake-low';
      default: return '';
    }
  };
  
  return (
    <Link
      href={href}
      className={`attention-card-glass attention-card-${variant} ${getShakeClass()} group`}
      style={{ animationDelay: `${0.25 + index * 0.08}s` }}
    >
      {/* Glow animé en arrière-plan */}
      <div className={`attention-glow attention-glow-${variant}`} />
      
      {/* Contenu de la card */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className={`attention-icon attention-icon-${variant}`}>
      <Icon className="w-5 h-5" />
    </div>
        </div>
        <h3 className="text-base font-bold text-white mb-1 tracking-tight">{title}</h3>
        <p className={`text-xl font-extrabold attention-count-${variant} mb-3`}>{subtitle}</p>
        <span className={`text-xs font-semibold attention-action-${variant} flex items-center gap-1.5 group-hover:gap-2.5 transition-all duration-300`}>
          {actionLabel}
          <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}

function AttentionSection({ 
  rupturesCount = 0, 
  expiringCount = 0 
}: { 
  rupturesCount?: number
  expiringCount?: number 
}) {
  // Calcul de la sévérité basé sur les données (exemple)
  const getSeverity = (
    count: number, 
    threshold: { low: number; medium: number; high: number },
    isCritical: boolean
  ): AlertSeverity => {
    // Si la carte n'est pas critique, jamais de shake
    if (!isCritical) return 'none';
    
    if (count >= threshold.high) return 'high';
    if (count >= threshold.medium) return 'medium';
    if (count >= threshold.low) return 'low';
    return 'none';
  };

  const alerts: {
    id: string;
    icon: React.ElementType;
    title: string;
    count: string;
    countValue: number;
    action: string;
    variant: AlertVariant;
    href: string;
    thresholds: { low: number; medium: number; high: number };
    isCritical: boolean; // Seules les cartes critiques peuvent shaker
  }[] = [
    {
      id: "ruptures",
      icon: XCircle,
      title: "Ruptures & Critiques",
      count: rupturesCount > 0 ? `${rupturesCount} produit${rupturesCount > 1 ? 's' : ''}` : "Aucune rupture",
      countValue: rupturesCount,
      action: "Actions critiques",
      variant: "ruptures",
      href: "/manager/alerts?filter=ruptures",
      thresholds: { low: 3, medium: 5, high: 8 },
      isCritical: true, // ⚠️ CRITIQUE - peut shaker
    },
    {
      id: "commandes",
      icon: Clock,
      title: "Commandes Fournisseurs",
      count: "À vérifier",
      countValue: 0,
      action: "Voir commandes",
      variant: "orders",
      href: "/manager/orders",
      thresholds: { low: 10, medium: 15, high: 20 }, // Seuils très hauts = pas de shake
      isCritical: false, // Pas critique - ne shake jamais
    },
    {
      id: "alertes",
      icon: AlertTriangle,
      title: "Alertes Critiques",
      count: expiringCount > 0 ? `${expiringCount} Péremption${expiringCount > 1 ? 's' : ''}` : "Aucune alerte",
      countValue: expiringCount,
      action: "Actions alertes",
      variant: "alerts",
      href: "/manager/alerts?filter=peremption",
      thresholds: { low: 2, medium: 4, high: 6 },
      isCritical: true, // ⚠️ CRITIQUE - peut shaker
    },
    {
      id: "feedback",
      icon: MessageSquare,
      title: "Incidents / Feedbacks",
      count: "À consulter",
      countValue: 0,
      action: "Voir feedbacks",
      variant: "feedbacks",
      href: "/manager/feedback",
      thresholds: { low: 10, medium: 15, high: 20 }, // Seuils très hauts = pas de shake
      isCritical: false, // Pas critique - ne shake jamais
    },
  ]
  
  return (
    <section className="animate-section" style={{ animationDelay: '0.2s' }}>
      <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-amber-400" />
        Ce qui demande votre attention
      </h2>
      <div className="grid grid-cols-4 gap-4">
        {alerts.map((alert, index) => (
          <AttentionCard
            key={alert.id}
            title={alert.title}
            subtitle={alert.count}
            actionLabel={alert.action}
            variant={alert.variant}
            severity={getSeverity(alert.countValue, alert.thresholds, alert.isCritical)}
            icon={alert.icon}
            href={alert.href}
            index={index}
          />
        ))}
      </div>
    </section>
  )
}

// ============================================
// COMPOSANT QUICK ACTION CARD
// ============================================
type QuickActionTheme = 'blue' | 'green' | 'purple' | 'orange' | 'teal'

interface QuickActionCardProps {
  label: string
  icon: React.ElementType
  theme: QuickActionTheme
  href: string
  index: number
}

function QuickActionCard({ label, icon: Icon, theme, href, index }: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className={`quick-action-card quick-action-card-${theme}`}
      style={{ animationDelay: `${0.4 + index * 0.08}s` }}
    >
      {/* Gradient background */}
      <div className="quick-action-card-bg" />
      
      {/* Starfield - Étoiles décoratives */}
      <div className="quick-action-starfield">
        {/* Étoiles à 4 branches */}
        <svg className="star star-1" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z" />
        </svg>
        <svg className="star star-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z" />
        </svg>
        <svg className="star star-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z" />
        </svg>
        <svg className="star star-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z" />
        </svg>
        {/* Petits points lumineux */}
        <div className="dot dot-1" />
        <div className="dot dot-2" />
        <div className="dot dot-3" />
        <div className="dot dot-4" />
        <div className="dot dot-5" />
        <div className="dot dot-6" />
      </div>
      
      {/* Contenu */}
      <div className="quick-action-content">
        <div className="quick-action-icon-wrapper">
          <Icon strokeWidth={1.5} />
        </div>
        <span className="quick-action-label">{label}</span>
        <ArrowUpRight className="quick-action-arrow" />
      </div>
    </Link>
  )
}

// ============================================
// SECTION 3 - BUSINESS TRENDS + ACTIONS RAPIDES
// ============================================
function TrendsAndActionsSection({ chartData, hasData }: { chartData: any[], hasData: boolean }) {
  const [period, setPeriod] = useState("30")
  const [chartKey, setChartKey] = useState(0)
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false)
  
  // Calculate totals for header display
  const totalCA = chartData.reduce((sum, d) => sum + d.ca, 0)
  const avgCA = hasData ? Math.round(totalCA / chartData.length) : 0
  
  const quickActions: Array<{ id: string; icon: React.ElementType; label: string; href: string; theme: QuickActionTheme }> = [
    { id: "entree", icon: Plus, label: "Ajouter Entrée/Sortie", href: "/manager/stock", theme: "blue" },
    { id: "commande", icon: ShoppingCart, label: "Créer Commande", href: "/manager/orders", theme: "green" },
    { id: "inventaire", icon: ClipboardList, label: "Lancer Inventaire", href: "/manager/stock", theme: "purple" },
    { id: "alertes", icon: Bell, label: "Consulter Alertes", href: "/manager/alerts", theme: "orange" },
    { id: "rapport", icon: FileText, label: "Générer Rapport", href: "/manager/reports", theme: "teal" },
  ]

  const handlePeriodChange = (value: string) => {
    setPeriod(value)
    setChartKey(prev => prev + 1) // Trigger chart re-animation
    setIsPeriodDropdownOpen(false)
  }

  const periodOptions = [
    { value: "7", label: "7 Jours" },
    { value: "15", label: "15 Jours" },
    { value: "30", label: "30 Jours" },
    { value: "90", label: "90 Jours" },
  ]

  const selectedPeriodLabel = periodOptions.find(opt => opt.value === period)?.label || "30 Jours"

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="business-trends-tooltip">
          <p className="text-sm font-semibold text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
              <span className="text-white/60">{entry.name}:</span>
              <span className="text-white font-medium">{entry.value.toLocaleString('fr-FR')} €</span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <section className="animate-section" style={{ animationDelay: '0.3s' }}>
      <div className="flex gap-6">
        {/* Graphique Business Trends - Reduced width from right */}
        <div className="business-trends-card flex-1 max-w-[72%]">
          {/* Ellipse lumineuse en haut gauche */}
          <div className="business-trends-ellipse" />
          
          {/* Ligne lumineuse animée */}
          <div className="business-trends-light-sweep" />
          
          {/* Lignes décoratives animées */}
          <div className="business-trends-animated-lines">
            <div className="animated-line line-1" />
            <div className="animated-line line-2" />
            <div className="animated-line line-3" />
          </div>
          
          {/* Header redesigné */}
          <div className="relative z-10 flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              {/* Icône Analytics */}
              <div className="business-trends-icon">
                <BarChart3 className="w-5 h-5 text-violet-300" />
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-1">Chiffre d'Affaires</h3>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-white tracking-tight">
                    {hasData ? `${avgCA.toLocaleString('fr-FR')} €` : '-- €'}
                  </span>
                  {/* Badge de variation - affiché seulement s'il y a des données */}
                  {hasData && avgCA > 0 ? (
                    <span className="business-trends-badge" style={{ opacity: 0.5 }}>
                      <span className="text-slate-400 text-xs">Estimé</span>
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500">Aucune donnée</span>
                  )}
                </div>
                <p className="text-xs text-white/40 mt-1">{hasData ? 'CA estimé sur la période' : 'Ajoutez des produits au menu'}</p>
              </div>
            </div>

            {/* Sélecteur de période - Style glassy avec dropdown personnalisé */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsPeriodDropdownOpen(!isPeriodDropdownOpen)}
                className="business-trends-period-select"
              >
                {selectedPeriodLabel}
                <ChevronDown className={`w-4 h-4 text-violet-300/70 transition-transform duration-200 ${isPeriodDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Menu déroulant personnalisé avec coins arrondis */}
              {isPeriodDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsPeriodDropdownOpen(false)}
                  />
                  <div className="business-trends-period-dropdown">
                    {periodOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handlePeriodChange(option.value)}
                        className={`business-trends-period-option ${period === option.value ? 'business-trends-period-option-active' : ''}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Légende minimaliste */}
          <div className="relative z-10 flex items-center gap-6 mb-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-400 shadow-lg shadow-violet-400/50" />
              <span className="text-white/50">Chiffre d'affaires</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50" />
              <span className="text-white/50">Marge</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
              <span className="text-white/50">Valeur de stock</span>
            </div>
          </div>

          {/* Graphique avec animation de dessin */}
          <div className="relative z-10 h-[200px] business-trends-chart-container" key={chartKey}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  {/* Gradient CA - Violet */}
                  <linearGradient id="colorCANew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.4} />
                    <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                  {/* Gradient Marge - Cyan */}
                  <linearGradient id="colorMargeNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.35} />
                    <stop offset="50%" stopColor="#06b6d4" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#0891b2" stopOpacity={0} />
                  </linearGradient>
                  {/* Gradient Stock - Vert */}
                  <linearGradient id="colorStockNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                    <stop offset="50%" stopColor="#10b981" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 92, 246, 0.08)" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255, 255, 255, 0.35)', fontSize: 10 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255, 255, 255, 0.35)', fontSize: 10 }}
                  tickFormatter={(value) => `${value / 1000}K`}
                  width={45}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="ca"
                  name="Chiffre d'affaires"
                  stroke="#a78bfa"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorCANew)"
                  className="business-trends-area"
                />
                <Area
                  type="monotone"
                  dataKey="marge"
                  name="Marge"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorMargeNew)"
                  className="business-trends-area"
                />
                <Area
                  type="monotone"
                  dataKey="stock"
                  name="Valeur de stock"
                  stroke="#34d399"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorStockNew)"
                  className="business-trends-area"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Actions Rapides - Redesigned with colored cards */}
        <div className="quick-actions-panel w-[320px] flex-shrink-0">
          <h3 className="quick-actions-title">Actions Rapides</h3>
          <div className="quick-actions-list">
            {quickActions.map((action, index) => (
              <QuickActionCard
                key={action.id}
                label={action.label}
                icon={action.icon}
                theme={action.theme}
                href={action.href}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ============================================
// SECTION 4 - TOP PRODUITS
// ============================================
function TopProductsSection({ 
  topMargin, 
  problematic,
  menuItems,
  stocks
}: { 
  topMargin: any[]
  problematic: any[]
  menuItems: any[]
  stocks: any[]
}) {
  // Formater les top marges depuis les données réelles
  const formattedTopMargin = topMargin.length > 0 
    ? topMargin.map(item => ({
        name: item.name,
        value: Number(item.selling_price) || 0,
        percent: Math.round(item.actual_margin_percent || 0)
      }))
    : [
        { name: "Aucun plat configuré", value: 0, percent: 0 },
      ]

  // Formater les produits problématiques
  const formattedProblematic = problematic.length > 0
    ? problematic.map((item: any) => ({
        name: item.name || 'Produit',
        value: item.value || (Number(item.selling_price) || 0),
        variation: item.type === 'Surstock' ? -15 : -(100 - (item.actual_margin_percent || 50)),
        type: item.type || 'Faible marge'
      }))
    : stocks
        .filter(s => Number(s.quantity) > 20)
        .slice(0, 5)
        .map(stock => ({
          name: stock.product?.name || 'Produit',
          value: (Number(stock.quantity) || 0) * (Number(stock.unit_price) || 0),
          variation: -10,
          type: 'Stock élevé'
        }))

  // Si pas de données, afficher un placeholder
  const hasData = menuItems.length > 0 || stocks.length > 0

  return (
    <section className="animate-section" style={{ animationDelay: '0.4s' }}>
      <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-cyan-400" />
        Top Produits
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Produits par Marge */}
        <div className="products-card">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Top 5 Produits par Marge
          </h3>
          <div className="space-y-1">
            {formattedTopMargin.length > 0 ? formattedTopMargin.map((product, index) => (
              <div
                key={`margin-${index}`}
                className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-white/5 transition-colors group"
              >
                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                  {product.name}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-emerald-400">
                    {product.value.toLocaleString('fr-FR')} €
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    product.percent >= 70 
                      ? 'text-emerald-400/70 bg-emerald-500/10' 
                      : product.percent >= 50 
                        ? 'text-yellow-400/70 bg-yellow-500/10'
                        : 'text-red-400/70 bg-red-500/10'
                  }`}>
                    ({product.percent}%)
                  </span>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-slate-400">
                <p>Aucune donnée de marge disponible</p>
                <p className="text-xs mt-1">Configurez vos plats dans le Menu</p>
              </div>
            )}
          </div>
        </div>

        {/* Top 5 Produits Problématiques */}
        <div className="products-card">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            Top 5 Produits Problématiques (Surstock/Rotation)
          </h3>
          <div className="space-y-1">
            {formattedProblematic.length > 0 ? formattedProblematic.map((product, index) => (
              <div
                key={`problem-${index}`}
                className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-white/5 transition-colors group"
              >
                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                  {product.name}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-red-400">
                    {product.value.toLocaleString('fr-FR')} €
                  </span>
                  <span className="text-xs text-red-400/70 bg-red-500/10 px-2 py-0.5 rounded-full">
                    ({product.variation.toFixed(1)}%)
                  </span>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-slate-400">
                <p>Aucun produit problématique</p>
                <p className="text-xs mt-1 text-emerald-400">✓ Tout est sous contrôle !</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}


// ============================================
// DASHBOARD PRINCIPAL
// ============================================
export default function ManagerDashboard() {
  const { products: realtimeProducts, loading: realtimeLoading } = useRealtimeProducts()
  const { profile, establishment } = useAuth()
  const { stocks, loading: stockLoading } = useStock()
  const { menuItems, loading: menuLoading } = useMenuItems()

  const loading = realtimeLoading || stockLoading || menuLoading

  // ============================================
  // CALCULS DES KPIs RÉELS
  // ============================================

  // Valeur totale du stock (basée sur les données réelles)
  const stockValue = stocks.reduce((sum, stock) => {
    const qty = Number(stock.quantity) || 0
    const unitPrice = Number(stock.unit_price) || 0
    return sum + (qty * unitPrice)
  }, 0)

  // Calcul des marges basé sur le menu
  const menuMarginData = menuItems.reduce((acc, item) => {
    const sellingPrice = Number(item.selling_price) || 0
    const costPrice = item.cost_price || 0
    const margin = sellingPrice - costPrice
    return {
      totalRevenue: acc.totalRevenue + sellingPrice,
      totalCost: acc.totalCost + costPrice,
      totalMargin: acc.totalMargin + margin,
      count: acc.count + 1
    }
  }, { totalRevenue: 0, totalCost: 0, totalMargin: 0, count: 0 })

  const marginValue = Math.round(menuMarginData.totalMargin * 100) // Estimation mensuelle
  const marginPercent = menuMarginData.totalRevenue > 0 
    ? Math.round((menuMarginData.totalMargin / menuMarginData.totalRevenue) * 100) 
    : 30

  // Stock dormant (produits avec faible rotation - quantité > seuil et pas de mouvement récent)
  const dormantStocks = stocks.filter(stock => {
    const qty = Number(stock.quantity) || 0
    return qty > 10 // Produits avec stock élevé (à affiner avec dates de mouvement)
  })
  const dormantStockValue = dormantStocks.reduce((sum, stock) => {
    const qty = Number(stock.quantity) || 0
    const unitPrice = Number(stock.unit_price) || 0
    return sum + (qty * unitPrice)
  }, 0)

  // Calcul CA estimé (basé sur les ventes potentielles du menu)
  const estimatedCA = menuItems.reduce((sum, item) => {
    const sellingPrice = Number(item.selling_price) || 0
    // Estimation: chaque plat vendu 50 fois par mois en moyenne
    return sum + (sellingPrice * 50)
  }, 0)

  // Alertes réelles
  const lowStockItems = stocks.filter(stock => {
    const qty = Number(stock.quantity) || 0
    const alertLevel = Number(stock.alert_threshold) || 5
    return qty <= alertLevel
  })

  const expiringItems = stocks.filter(stock => {
    if (!stock.expiry_date) return false
    const expiry = new Date(stock.expiry_date)
    const today = new Date()
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0
  })

  const expiredItems = stocks.filter(stock => {
    if (!stock.expiry_date) return false
    const expiry = new Date(stock.expiry_date)
    return expiry < new Date()
  })

  // Top produits par marge
  const topMarginProducts = [...menuItems]
    .filter(item => item.actual_margin_percent > 0)
    .sort((a, b) => b.actual_margin_percent - a.actual_margin_percent)
    .slice(0, 5)

  // Produits problématiques (faible marge ou surstock)
  const problematicProducts = [
    ...menuItems.filter(item => item.actual_margin_percent < 50 && item.actual_margin_percent > 0),
    ...dormantStocks.map(stock => ({
      name: stock.product?.name || 'Produit inconnu',
      value: (Number(stock.quantity) || 0) * (Number(stock.unit_price) || 0),
      type: 'Surstock'
    }))
  ].slice(0, 5)

  // Données du graphique (basées sur des estimations à partir des données réelles)
  // Si pas de données, afficher des valeurs à 0
  const hasRealData = menuItems.length > 0 || stocks.length > 0
  const chartData = Array.from({ length: 30 }, (_, i) => {
    const day = i + 1
    if (!hasRealData) {
      return {
        day: `J${day}`,
        ca: 0,
        marge: 0,
        stock: 0,
      }
    }
    const baseCA = estimatedCA > 0 ? (estimatedCA / 30) * (0.8 + Math.sin(day * 0.3) * 0.4) : 0
    const baseMarge = baseCA * (marginPercent / 100)
    const baseStock = stockValue * (0.9 + Math.sin(day * 0.15) * 0.2)
    return {
      day: `J${day}`,
      ca: Math.round(baseCA),
      marge: Math.round(baseMarge),
      stock: Math.round(baseStock),
    }
  })

  return (
    <>
      <style jsx global>{`
        /* Animations d'entrée */
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes chartDraw {
          from {
            opacity: 0;
            clip-path: inset(0 100% 0 0);
          }
          to {
            opacity: 1;
            clip-path: inset(0 0 0 0);
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.1);
          }
          50% {
            box-shadow: 0 0 30px rgba(59, 130, 246, 0.2);
          }
        }

        .animate-section {
          animation: fadeSlideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          opacity: 0;
        }

        .chart-animate {
          animation: chartDraw 1s cubic-bezier(0.4, 0, 0.2, 1) 0.5s forwards;
          opacity: 0;
        }

        /* KPI Cards */
        /* ============================================
           BUSINESS HEALTH CARDS - Style Gemme 2025
           ============================================ */
        
        /* ============================================
           BUSINESS HEALTH CARDS - Style Attention
           ============================================ */
        
        .business-health-card {
          position: relative;
          border-radius: 24px;
          padding: 20px 24px;
          overflow: hidden;
          background: var(--card-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--border-color);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: fadeSlideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          opacity: 0;
          min-height: 130px;
        }

        /* Ligne lumineuse en haut (comme attention cards) */
        .business-health-topline {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, 
            transparent 0%,
            rgba(255, 255, 255, 0.15) 30%,
            rgba(255, 255, 255, 0.25) 50%,
            rgba(255, 255, 255, 0.15) 70%,
            transparent 100%
          );
          pointer-events: none;
        }

        /* Hover state */
        .business-health-card:hover {
          transform: translateY(-3px);
          border-color: var(--hover-border);
          box-shadow: var(--hover-shadow);
        }

        /* Glow radial en bas (comme attention cards) */
        .business-health-glow {
          position: absolute;
          inset: auto -20% -40%;
          height: 80%;
          border-radius: 50%;
          background: var(--glow-gradient);
          filter: blur(30px);
          opacity: 0.6;
          pointer-events: none;
          animation: glow-pulse-attention 6s ease-in-out infinite;
          transition: opacity 0.4s ease;
        }

        .business-health-card:hover .business-health-glow {
          opacity: 0.9;
          animation-duration: 3s;
        }

        /* Badge Icon (style attention cards) */
        .business-health-icon {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--icon-bg);
          border: 1px solid var(--icon-border);
          color: var(--icon-color);
          margin-bottom: 16px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          z-index: 10;
        }

        .business-health-card:hover .business-health-icon {
          transform: scale(1.1);
        }

        /* Active/Click state */
        .business-health-card:active {
          transform: translateY(-2px) scale(0.98);
          transition: all 0.1s ease;
        }

        /* Attention Cards */
        /* ============================================
           ATTENTION CARDS - Glassmorphism Style
           ============================================ */
        
        /* Animations de shake subtil */
        @keyframes subtle-shake {
          0% { transform: translateX(0); }
          20% { transform: translateX(-2px); }
          40% { transform: translateX(2px); }
          60% { transform: translateX(-1px); }
          80% { transform: translateX(1px); }
          100% { transform: translateX(0); }
        }

        @keyframes medium-shake {
          0% { transform: translateX(0); }
          20% { transform: translateX(-3px); }
          40% { transform: translateX(3px); }
          60% { transform: translateX(-2px); }
          80% { transform: translateX(2px); }
          100% { transform: translateX(0); }
        }

        @keyframes intense-shake {
          0% { transform: translateX(0); }
          15% { transform: translateX(-4px); }
          30% { transform: translateX(4px); }
          45% { transform: translateX(-3px); }
          60% { transform: translateX(3px); }
          75% { transform: translateX(-2px); }
          90% { transform: translateX(2px); }
          100% { transform: translateX(0); }
        }

        @keyframes glow-pulse-attention {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.02); }
        }

        /* Card de base avec glassmorphism */
        .attention-card-glass {
          position: relative;
          border-radius: 24px;
          padding: 20px 24px;
          overflow: hidden;
          background: rgba(10, 12, 20, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: fadeSlideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          opacity: 0;
          min-height: 140px;
        }

        .attention-card-glass::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, 
            transparent 0%,
            rgba(255, 255, 255, 0.15) 30%,
            rgba(255, 255, 255, 0.25) 50%,
            rgba(255, 255, 255, 0.15) 70%,
            transparent 100%
          );
          pointer-events: none;
        }

        .attention-card-glass:hover {
          transform: translateY(-3px);
          border-color: rgba(255, 255, 255, 0.15);
        }

        /* Glow de base */
        .attention-glow {
          position: absolute;
          inset: auto -20% -40%;
          height: 80%;
          border-radius: 50%;
          filter: blur(30px);
          opacity: 0.6;
          pointer-events: none;
          animation: glow-pulse-attention 6s ease-in-out infinite;
          transition: opacity 0.4s ease;
        }

        .attention-card-glass:hover .attention-glow {
          opacity: 0.9;
          animation-duration: 3s;
        }

        /* === VARIANT: RUPTURES (Rouge → Orange) === */
        .attention-card-ruptures {
          background: linear-gradient(145deg, 
            rgba(20, 10, 10, 0.9) 0%,
            rgba(10, 8, 12, 0.95) 100%
          );
          border-color: rgba(239, 68, 68, 0.2);
        }

        .attention-card-ruptures:hover {
          border-color: rgba(239, 68, 68, 0.4);
          box-shadow: 0 15px 40px rgba(239, 68, 68, 0.15), 0 0 30px rgba(239, 68, 68, 0.1);
        }

        .attention-glow-ruptures {
          background: radial-gradient(ellipse at center, 
            rgba(239, 68, 68, 0.6) 0%, 
            rgba(249, 115, 22, 0.4) 40%,
            transparent 70%
          );
        }

        .attention-icon-ruptures {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #f87171;
        }

        .attention-count-ruptures { color: #f87171; }
        .attention-action-ruptures { color: rgba(248, 113, 113, 0.85); }

        /* === VARIANT: ORDERS (Orange/Jaune) === */
        .attention-card-orders {
          background: linear-gradient(145deg, 
            rgba(20, 15, 8, 0.9) 0%,
            rgba(10, 10, 12, 0.95) 100%
          );
          border-color: rgba(249, 115, 22, 0.2);
        }

        .attention-card-orders:hover {
          border-color: rgba(249, 115, 22, 0.4);
          box-shadow: 0 15px 40px rgba(249, 115, 22, 0.15), 0 0 30px rgba(249, 115, 22, 0.1);
        }

        .attention-glow-orders {
          background: radial-gradient(ellipse at center, 
            rgba(249, 115, 22, 0.6) 0%, 
            rgba(234, 179, 8, 0.4) 40%,
            transparent 70%
          );
        }

        .attention-icon-orders {
          background: linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(249, 115, 22, 0.1) 100%);
          border: 1px solid rgba(249, 115, 22, 0.3);
          color: #fb923c;
        }

        .attention-count-orders { color: #fb923c; }
        .attention-action-orders { color: rgba(251, 146, 60, 0.85); }

        /* === VARIANT: ALERTS (Rouge vif intense) === */
        .attention-card-alerts {
          background: linear-gradient(145deg, 
            rgba(25, 8, 8, 0.92) 0%,
            rgba(12, 8, 12, 0.95) 100%
          );
          border-color: rgba(245, 158, 11, 0.2);
        }

        .attention-card-alerts:hover {
          border-color: rgba(245, 158, 11, 0.45);
          box-shadow: 0 15px 40px rgba(245, 158, 11, 0.18), 0 0 35px rgba(245, 158, 11, 0.12);
        }

        .attention-glow-alerts {
          background: radial-gradient(ellipse at center, 
            rgba(245, 158, 11, 0.65) 0%, 
            rgba(239, 68, 68, 0.45) 40%,
            transparent 70%
          );
        }

        .attention-icon-alerts {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%);
          border: 1px solid rgba(245, 158, 11, 0.35);
          color: #fbbf24;
        }

        .attention-count-alerts { color: #fbbf24; }
        .attention-action-alerts { color: rgba(251, 191, 36, 0.85); }

        /* === VARIANT: FEEDBACKS (Bleu Cyan/Turquoise) === */
        .attention-card-feedbacks {
          background: linear-gradient(145deg, 
            rgba(8, 15, 25, 0.9) 0%,
            rgba(8, 10, 18, 0.95) 100%
          );
          border-color: rgba(59, 130, 246, 0.2);
        }

        .attention-card-feedbacks:hover {
          border-color: rgba(59, 130, 246, 0.4);
          box-shadow: 0 15px 40px rgba(59, 130, 246, 0.15), 0 0 30px rgba(6, 182, 212, 0.1);
        }

        .attention-glow-feedbacks {
          background: radial-gradient(ellipse at center, 
            rgba(59, 130, 246, 0.5) 0%, 
            rgba(6, 182, 212, 0.4) 40%,
            transparent 70%
          );
        }

        .attention-icon-feedbacks {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(6, 182, 212, 0.1) 100%);
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: #60a5fa;
        }

        .attention-count-feedbacks { color: #60a5fa; }
        .attention-action-feedbacks { color: rgba(96, 165, 250, 0.85); }

        /* === SHAKE ANIMATIONS PAR SÉVÉRITÉ === */
        .attention-shake-low {
          animation: fadeSlideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards,
                     subtle-shake 0.4s ease-in-out 15s infinite;
        }

        .attention-shake-medium {
          animation: fadeSlideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards,
                     medium-shake 0.5s ease-in-out 8s infinite;
        }

        .attention-shake-high {
          animation: fadeSlideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards,
                     intense-shake 0.6s ease-in-out 4s infinite;
        }

        /* Icône stylisée */
        .attention-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .attention-card-glass:hover .attention-icon {
          transform: scale(1.1);
        }

        /* ============================================
           BUSINESS TRENDS CARD - Style Purple Glassmorphism
           ============================================ */
        
        .business-trends-card {
          position: relative;
          overflow: hidden;
          border-radius: 24px;
          padding: 20px 24px;
          background: linear-gradient(135deg, 
            #0b1020 0%, 
            #12183a 25%,
            #1a1f4a 50%, 
            #20103a 75%,
            #1a0a30 100%
          );
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(139, 92, 246, 0.15);
          box-shadow: 
            0 20px 45px rgba(0, 0, 0, 0.6),
            0 0 80px rgba(139, 92, 246, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          animation: businessTrendsMount 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          opacity: 0;
          transform: translateY(15px);
        }
        
        @keyframes businessTrendsMount {
          0% {
            opacity: 0;
            transform: translateY(15px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .business-trends-card:hover {
          transform: translateY(-4px);
          border-color: rgba(139, 92, 246, 0.3);
          box-shadow: 
            0 28px 60px rgba(0, 0, 0, 0.7),
            0 0 100px rgba(139, 92, 246, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }
        
        /* Ellipse lumineuse en haut gauche */
        .business-trends-ellipse {
          position: absolute;
          top: -80px;
          left: -40px;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: radial-gradient(
            circle at center,
            rgba(139, 92, 246, 0.5) 0%,
            rgba(124, 58, 237, 0.3) 30%,
            rgba(109, 40, 217, 0.15) 50%,
            transparent 70%
          );
          filter: blur(40px);
          pointer-events: none;
          opacity: 0.7;
          animation: ellipsePulse 8s ease-in-out infinite;
        }
        
        @keyframes ellipsePulse {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 0.85;
            transform: scale(1.05);
          }
        }
        
        .business-trends-card:hover .business-trends-ellipse {
          opacity: 0.9;
          animation-duration: 4s;
        }
        
        /* Light sweep animation on mount */
        .business-trends-light-sweep {
          position: absolute;
          top: 0;
          left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(139, 92, 246, 0.08) 40%,
            rgba(167, 139, 250, 0.12) 50%,
            rgba(139, 92, 246, 0.08) 60%,
            transparent 100%
          );
          pointer-events: none;
          animation: lightSweep 2s ease-out 0.5s forwards;
        }
        
        @keyframes lightSweep {
          0% {
            left: -100%;
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          100% {
            left: 200%;
            opacity: 0;
          }
        }
        
        /* Animated decorative lines */
        .business-trends-animated-lines {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }
        
        .animated-line {
          position: absolute;
          height: 1px;
          background: linear-gradient(90deg, 
            transparent 0%,
            rgba(139, 92, 246, 0.3) 20%,
            rgba(167, 139, 250, 0.5) 50%,
            rgba(139, 92, 246, 0.3) 80%,
            transparent 100%
          );
          animation: linePulse 4s ease-in-out infinite;
        }
        
        .line-1 {
          top: 25%;
          left: 0;
          right: 0;
          opacity: 0.3;
          animation-delay: 0s;
        }
        
        .line-2 {
          top: 50%;
          left: 0;
          right: 0;
          opacity: 0.2;
          animation-delay: 1.3s;
        }
        
        .line-3 {
          top: 75%;
          left: 0;
          right: 0;
          opacity: 0.15;
          animation-delay: 2.6s;
        }
        
        @keyframes linePulse {
          0%, 100% {
            opacity: 0.1;
            transform: scaleX(0.8);
          }
          50% {
            opacity: 0.4;
            transform: scaleX(1);
          }
        }
        
        /* Icon style */
        .business-trends-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, 
            rgba(139, 92, 246, 0.25) 0%, 
            rgba(124, 58, 237, 0.15) 100%
          );
          border: 1px solid rgba(139, 92, 246, 0.3);
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.2);
          transition: all 0.3s ease;
        }
        
        .business-trends-card:hover .business-trends-icon {
          transform: scale(1.08);
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.35);
        }
        
        /* Variation badge */
        .business-trends-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 20px;
          background: rgba(34, 197, 94, 0.15);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #4ade80;
          font-size: 12px;
          font-weight: 600;
          animation: badgePop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.8s forwards;
          opacity: 0;
          transform: scale(0.8);
        }
        
        @keyframes badgePop {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        /* Period selector - glassy style with rounded corners */
        .business-trends-period-select {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          appearance: none;
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.25);
          border-radius: 20px;
          padding: 10px 16px;
          font-size: 13px;
          font-weight: 500;
          color: #e2e8f0;
          cursor: pointer;
          transition: all 0.25s ease;
          backdrop-filter: blur(8px);
          min-width: 120px;
        }
        
        .business-trends-period-select:hover {
          background: rgba(139, 92, 246, 0.18);
          border-color: rgba(139, 92, 246, 0.4);
        }
        
        .business-trends-period-select:focus {
          outline: none;
          border-color: rgba(139, 92, 246, 0.5);
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
        }
        
        /* Menu déroulant personnalisé avec coins arrondis */
        .business-trends-period-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          z-index: 50;
          min-width: 120px;
          background: linear-gradient(135deg, 
            rgba(26, 31, 74, 0.98) 0%, 
            rgba(32, 16, 58, 0.98) 100%
          );
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 18px;
          padding: 6px;
          box-shadow: 
            0 20px 40px rgba(0, 0, 0, 0.6),
            0 0 60px rgba(139, 92, 246, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
          animation: dropdownSlideIn 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        @keyframes dropdownSlideIn {
          0% {
            opacity: 0;
            transform: translateY(-8px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        /* Options du menu */
        .business-trends-period-option {
          display: block;
          width: 100%;
          padding: 10px 14px;
          font-size: 13px;
          font-weight: 500;
          color: #e2e8f0;
          text-align: left;
          background: transparent;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }
        
        .business-trends-period-option:hover {
          background: rgba(139, 92, 246, 0.15);
          color: #ffffff;
        }
        
        .business-trends-period-option-active {
          background: linear-gradient(135deg, 
            rgba(139, 92, 246, 0.25) 0%, 
            rgba(124, 58, 237, 0.2) 100%
          );
          color: #c4b5fd;
          font-weight: 600;
        }
        
        .business-trends-period-option-active::before {
          content: '';
          position: absolute;
          left: 8px;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #a78bfa;
          box-shadow: 0 0 8px rgba(167, 139, 250, 0.6);
        }
        
        /* Chart container with line drawing animation */
        .business-trends-chart-container {
          animation: chartReveal 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.3s forwards;
          opacity: 0;
        }
        
        @keyframes chartReveal {
          0% {
            opacity: 0;
            clip-path: inset(0 100% 0 0);
          }
          100% {
            opacity: 1;
            clip-path: inset(0 0 0 0);
          }
        }
        
        /* Area animation */
        .business-trends-area {
          animation: areaFadeIn 0.8s ease-out 0.5s forwards;
          opacity: 0;
        }
        
        @keyframes areaFadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        
        /* Tooltip glassy */
        .business-trends-tooltip {
          background: linear-gradient(145deg, 
            rgba(26, 31, 74, 0.95) 0%, 
            rgba(32, 16, 58, 0.95) 100%
          );
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(139, 92, 246, 0.25);
          border-radius: 14px;
          padding: 14px 18px;
          box-shadow: 
            0 15px 40px rgba(0, 0, 0, 0.5),
            0 0 30px rgba(139, 92, 246, 0.1);
          animation: tooltipPop 0.2s ease-out forwards;
        }
        
        @keyframes tooltipPop {
          0% {
            opacity: 0;
            transform: scale(0.95) translateY(5px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        /* Legacy trends-card kept for compatibility but hidden */
        .trends-card {
          display: none;
        }

        /* ============================================
           QUICK ACTIONS PANEL - Glassy Container
           ============================================ */
        .quick-actions-panel {
          background: rgba(8, 11, 20, 0.9);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          padding: 16px;
          animation: slideInRight 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          opacity: 0;
        }

        .quick-actions-title {
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 12px;
          letter-spacing: -0.01em;
        }

        .quick-actions-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        /* ============================================
           QUICK ACTION CARD - Cosmic Starfield Style
           ============================================ */
        .quick-action-card {
          position: relative;
          display: block;
          width: 100%;
          padding: 12px 14px;
          border-radius: 14px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: quickActionSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          opacity: 0;
          transform: translateX(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        @keyframes quickActionSlideIn {
          0% {
            opacity: 0;
            transform: translateX(12px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .quick-action-card-bg {
          position: absolute;
          inset: 0;
          transition: all 0.3s ease;
        }

        /* Starfield container */
        .quick-action-starfield {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        /* Étoiles à 4 branches */
        .star {
          position: absolute;
          opacity: 0.35;
          transition: all 0.3s ease;
        }

        .star-1 {
          width: 10px;
          height: 10px;
          top: 15%;
          right: 15%;
          animation: starTwinkle 3s ease-in-out infinite;
        }

        .star-2 {
          width: 7px;
          height: 7px;
          top: 50%;
          right: 30%;
          animation: starTwinkle 4s ease-in-out infinite 0.5s;
        }

        .star-3 {
          width: 6px;
          height: 6px;
          top: 30%;
          right: 50%;
          animation: starTwinkle 3.5s ease-in-out infinite 1s;
        }

        .star-4 {
          width: 8px;
          height: 8px;
          bottom: 25%;
          right: 10%;
          animation: starTwinkle 4.5s ease-in-out infinite 1.5s;
        }

        @keyframes starTwinkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1) rotate(0deg);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.1) rotate(15deg);
          }
        }

        /* Petits points lumineux */
        .dot {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5);
          animation: dotPulse 4s ease-in-out infinite;
        }

        .dot-1 {
          width: 3px;
          height: 3px;
          top: 30%;
          right: 10%;
          animation-delay: 0s;
        }

        .dot-2 {
          width: 2px;
          height: 2px;
          top: 60%;
          right: 45%;
          animation-delay: 0.7s;
        }

        .dot-3 {
          width: 2px;
          height: 2px;
          top: 20%;
          right: 70%;
          animation-delay: 1.4s;
        }

        .dot-4 {
          width: 3px;
          height: 3px;
          bottom: 35%;
          right: 25%;
          animation-delay: 2.1s;
        }

        .dot-5 {
          width: 2px;
          height: 2px;
          bottom: 45%;
          right: 60%;
          animation-delay: 2.8s;
        }

        .dot-6 {
          width: 2px;
          height: 2px;
          top: 55%;
          right: 80%;
          animation-delay: 3.5s;
        }

        @keyframes dotPulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.5);
          }
        }

        .quick-action-card:hover .star {
          opacity: 0.7;
        }

        .quick-action-card:hover .dot {
          opacity: 0.9;
        }

        .quick-action-content {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 10px;
        }

        .quick-action-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        
        .quick-action-icon-wrapper svg {
          width: 20px;
          height: 20px;
        }

        .quick-action-card:hover .quick-action-icon-wrapper {
          transform: scale(1.1);
        }

        .quick-action-label {
          font-size: 0.85rem;
          font-weight: 500;
          color: #ffffff;
          letter-spacing: -0.01em;
          transition: color 0.2s ease;
          flex: 1;
        }

        .quick-action-arrow {
          position: relative;
          top: auto;
          right: auto;
          width: 14px;
          height: 14px;
          color: rgba(255, 255, 255, 0.3);
          transition: all 0.25s ease;
          flex-shrink: 0;
        }

        .quick-action-card:hover .quick-action-arrow {
          color: rgba(255, 255, 255, 0.7);
          transform: translate(3px, -3px);
        }

        .quick-action-card:hover {
          transform: translateY(-3px);
          border-color: rgba(255, 255, 255, 0.15);
        }

        .quick-action-card:active {
          transform: translateY(-1px) scale(0.98);
        }

        /* ============================================
           QUICK ACTION CARD - Theme Colors (Cosmic Style)
           ============================================ */
        
        /* Blue Theme - Ajouter Entrée/Sortie */
        .quick-action-card-blue .quick-action-card-bg {
          background: linear-gradient(145deg, 
            #0f1729 0%, 
            #162036 40%, 
            #1a3050 70%,
            #1e3a5f 100%
          );
        }

        .quick-action-card-blue .quick-action-icon-wrapper svg {
          color: #5b9cf5;
        }
        
        .quick-action-card-blue .star {
          color: rgba(91, 156, 245, 0.6);
        }

        .quick-action-card-blue:hover {
          box-shadow: 
            0 12px 32px rgba(37, 99, 235, 0.25),
            inset 0 1px 0 rgba(91, 156, 245, 0.1);
        }

        /* Green Theme - Créer Commande */
        .quick-action-card-green .quick-action-card-bg {
          background: linear-gradient(145deg, 
            #0d1a14 0%, 
            #112820 40%, 
            #163828 70%,
            #1a4530 100%
          );
        }

        .quick-action-card-green .quick-action-icon-wrapper svg {
          color: #4ade80;
        }
        
        .quick-action-card-green .star {
          color: rgba(74, 222, 128, 0.6);
        }

        .quick-action-card-green:hover {
          box-shadow: 
            0 12px 32px rgba(34, 197, 94, 0.2),
            inset 0 1px 0 rgba(74, 222, 128, 0.1);
        }

        /* Purple Theme - Lancer Inventaire */
        .quick-action-card-purple .quick-action-card-bg {
          background: linear-gradient(145deg, 
            #150d24 0%, 
            #221638 40%, 
            #2e1a50 70%,
            #3d2268 100%
          );
        }

        .quick-action-card-purple .quick-action-icon-wrapper svg {
          color: #a78bfa;
        }
        
        .quick-action-card-purple .star {
          color: rgba(167, 139, 250, 0.6);
        }

        .quick-action-card-purple:hover {
          box-shadow: 
            0 12px 32px rgba(139, 92, 246, 0.25),
            inset 0 1px 0 rgba(167, 139, 250, 0.1);
        }

        /* Orange Theme - Consulter Alertes */
        .quick-action-card-orange .quick-action-card-bg {
          background: linear-gradient(145deg, 
            #1a120d 0%, 
            #2a1a10 40%, 
            #3d2415 70%,
            #4a2c18 100%
          );
        }

        .quick-action-card-orange .quick-action-icon-wrapper svg {
          color: #f59e0b;
        }
        
        .quick-action-card-orange .star {
          color: rgba(245, 158, 11, 0.6);
        }

        .quick-action-card-orange:hover {
          box-shadow: 
            0 12px 32px rgba(245, 158, 11, 0.2),
            inset 0 1px 0 rgba(245, 158, 11, 0.1);
        }

        /* Teal Theme - Générer Rapport */
        .quick-action-card-teal .quick-action-card-bg {
          background: linear-gradient(145deg, 
            #0d1a1d 0%, 
            #10252a 40%, 
            #143538 70%,
            #184548 100%
          );
        }

        .quick-action-card-teal .quick-action-icon-wrapper svg {
          color: #2dd4bf;
        }
        
        .quick-action-card-teal .star {
          color: rgba(45, 212, 191, 0.6);
        }

        .quick-action-card-teal:hover {
          box-shadow: 
            0 12px 32px rgba(20, 184, 166, 0.2),
            inset 0 1px 0 rgba(45, 212, 191, 0.1);
        }

        /* Products Card */
        .products-card {
          background: linear-gradient(145deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.85) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(100, 130, 180, 0.12);
          border-radius: 18px;
          padding: 20px 24px;
          transition: all 0.3s ease;
        }
        
        .products-card:hover {
          transform: translateY(-2px);
          border-color: rgba(100, 130, 180, 0.25);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        /* Module Card */
        .module-card {
          background: linear-gradient(145deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.7) 100%);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(100, 130, 180, 0.1);
          border-radius: 16px;
          padding: 20px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: fadeSlideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          opacity: 0;
        }

        .module-card:hover {
          transform: translateY(-3px);
          border-color: rgba(59, 130, 246, 0.3);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2), 0 0 25px rgba(59, 130, 246, 0.08);
        }

        .module-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          border: 1px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
          transition: all 0.3s ease;
        }

        .module-card:hover .module-icon {
          transform: scale(1.1) rotate(5deg);
        }

        /* Period Select */
        .period-select {
          appearance: none;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(100, 130, 180, 0.15);
          border-radius: 10px;
          padding: 8px 36px 8px 14px;
          font-size: 13px;
          color: #e2e8f0;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .period-select:hover {
          border-color: rgba(59, 130, 246, 0.4);
        }

        .period-select:focus {
          outline: none;
          border-color: rgba(59, 130, 246, 0.5);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        /* Chart Tooltip */
        .chart-tooltip {
          background: linear-gradient(145deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.99) 100%);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(100, 130, 180, 0.2);
          border-radius: 12px;
          padding: 14px 18px;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
        }

        /* Couleurs dynamiques */
        .bg-blue-500\\/15 { background: rgba(59, 130, 246, 0.15); }
        .bg-green-500\\/15 { background: rgba(34, 197, 94, 0.15); }
        .bg-purple-500\\/15 { background: rgba(168, 85, 247, 0.15); }
        .bg-orange-500\\/15 { background: rgba(249, 115, 22, 0.15); }
        .bg-cyan-500\\/15 { background: rgba(6, 182, 212, 0.15); }
        .bg-amber-500\\/15 { background: rgba(245, 158, 11, 0.15); }
        .bg-pink-500\\/15 { background: rgba(236, 72, 153, 0.15); }
        .bg-teal-500\\/15 { background: rgba(20, 184, 166, 0.15); }

        .border-blue-500\\/30 { border-color: rgba(59, 130, 246, 0.3); }
        .border-green-500\\/30 { border-color: rgba(34, 197, 94, 0.3); }
        .border-purple-500\\/30 { border-color: rgba(168, 85, 247, 0.3); }
        .border-orange-500\\/30 { border-color: rgba(249, 115, 22, 0.3); }
        .border-cyan-500\\/30 { border-color: rgba(6, 182, 212, 0.3); }
        .border-amber-500\\/30 { border-color: rgba(245, 158, 11, 0.3); }
        .border-pink-500\\/30 { border-color: rgba(236, 72, 153, 0.3); }
        .border-teal-500\\/30 { border-color: rgba(20, 184, 166, 0.3); }

        .text-blue-400 { color: #60a5fa; }
        .text-green-400 { color: #4ade80; }
        .text-purple-400 { color: #a78bfa; }
        .text-orange-400 { color: #fb923c; }
        .text-cyan-400 { color: #22d3ee; }
        .text-amber-400 { color: #fbbf24; }
        .text-pink-400 { color: #f472b6; }
        .text-teal-400 { color: #2dd4bf; }
        .text-red-400 { color: #f87171; }
        .text-emerald-400 { color: #34d399; }

        /* Responsive */
        @media (max-width: 1400px) {
          .grid-cols-4 {
            grid-template-columns: repeat(2, 1fr);
          }
          .grid-cols-\\[1fr_320px\\] {
            grid-template-columns: 1fr;
          }
          
          .business-trends-card {
            max-width: 100% !important;
          }
        }

        @media (max-width: 1200px) {
          section .flex.gap-6 {
            flex-direction: column;
          }
          
          .business-trends-card {
            max-width: 100% !important;
          }
          
          .quick-actions-panel {
            width: 100% !important;
          }
        }

        @media (max-width: 768px) {
          .grid-cols-4, .grid-cols-2 {
            grid-template-columns: 1fr;
          }
          
          .business-trends-card {
            padding: 20px;
            border-radius: 20px;
          }
          
          .business-trends-ellipse {
            width: 200px;
            height: 200px;
            top: -60px;
            left: -30px;
          }
        }
      `}</style>

      <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
        {/* Section 1 - Santé du Business */}
        <BusinessHealthSection 
          caMonth={Math.round(estimatedCA)}
          stockValue={Math.round(stockValue)}
          marginValue={marginValue}
          marginPercent={marginPercent}
          dormantStock={Math.round(dormantStockValue)}
          dormantCount={dormantStocks.length}
          hasData={menuItems.length > 0 || stocks.length > 0}
        />

        {/* Section 2 - Ce qui demande votre attention */}
        <AttentionSection 
          rupturesCount={lowStockItems.length}
          expiringCount={expiringItems.length + expiredItems.length}
        />

        {/* Section 3 - Business Trends + Actions Rapides */}
        <TrendsAndActionsSection chartData={chartData} hasData={menuItems.length > 0} />

        {/* Section 4 - Top Produits */}
        <TopProductsSection 
          topMargin={topMarginProducts}
          problematic={problematicProducts}
          menuItems={menuItems}
          stocks={stocks}
        />
      </div>
    </>
  )
}
