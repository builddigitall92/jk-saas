"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Search,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  AlertTriangle,
  Check,
  X,
  Edit3,
  Save,
  RotateCcw,
  ChefHat,
  Sparkles,
  Calculator,
  BarChart3,
  Target,
  Flame,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useMenuItems, type MenuItemWithIngredients } from "@/lib/hooks/use-menu-items"
import { AIAssistant } from "@/components/ai-assistant/AIAssistant"

// ============================================
// TYPES
// ============================================

type SortField = 'name' | 'price' | 'cost' | 'margin' | 'margin_percent'
type SortDirection = 'asc' | 'desc'

interface PriceChange {
  id: string
  originalPrice: number
  newPrice: number
}

// ============================================
// PRICE ROW COMPONENT
// ============================================

interface PriceRowProps {
  item: MenuItemWithIngredients
  targetMargins: number[]
  getSuggestedPrice: (cost: number, margin: number) => number
  pendingChange: PriceChange | undefined
  onPriceChange: (id: string, originalPrice: number, newPrice: number) => void
  onCancelChange: (id: string) => void
}

function PriceRow({ 
  item, 
  targetMargins, 
  getSuggestedPrice, 
  pendingChange, 
  onPriceChange,
  onCancelChange 
}: PriceRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')

  const currentPrice = pendingChange?.newPrice ?? Number(item.selling_price)
  const hasChange = pendingChange !== undefined

  // Recalculate margin with current/new price
  const currentMarginAmount = currentPrice - item.cost_price
  const currentMarginPercent = currentPrice > 0 ? (currentMarginAmount / currentPrice) * 100 : 0

  const marginStatus = currentMarginPercent >= 70 ? 'high' : currentMarginPercent >= 50 ? 'medium' : 'low'
  const marginColor = marginStatus === 'high' ? 'emerald' : marginStatus === 'medium' ? 'amber' : 'red'

  const handleStartEdit = () => {
    setEditValue(currentPrice.toFixed(2))
    setIsEditing(true)
  }

  const handleSaveEdit = () => {
    const newPrice = parseFloat(editValue)
    if (newPrice > 0 && newPrice !== Number(item.selling_price)) {
      onPriceChange(item.id, Number(item.selling_price), newPrice)
    }
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditValue('')
  }

  const handleApplySuggested = (price: number) => {
    if (price !== Number(item.selling_price)) {
      onPriceChange(item.id, Number(item.selling_price), price)
    }
  }

  return (
    <tr className={`tarif-row ${hasChange ? 'tarif-row-changed' : ''}`}>
      {/* Item Info */}
      <td className="tarif-cell-item">
        <div className="tarif-item-info">
          <span className="tarif-item-icon">{item.icon || '🍽️'}</span>
          <div>
            <span className="tarif-item-name">{item.name}</span>
            <span className="tarif-item-category">{item.category || 'Autre'}</span>
          </div>
        </div>
      </td>

      {/* Coût matière */}
      <td className="tarif-cell-cost">
        <span className="tarif-cost">{item.cost_price.toFixed(2)} €</span>
      </td>

      {/* Prix actuel (éditable) */}
      <td className="tarif-cell-price">
        {isEditing ? (
          <div className="tarif-price-edit">
            <Input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="tarif-price-input"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEdit()
                if (e.key === 'Escape') handleCancelEdit()
              }}
            />
            <button onClick={handleSaveEdit} className="tarif-price-btn-save">
              <Check className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleCancelEdit} className="tarif-price-btn-cancel">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="tarif-price-display" onClick={handleStartEdit}>
            <span className={`tarif-price ${hasChange ? 'tarif-price-changed' : ''}`}>
              {currentPrice.toFixed(2)} €
            </span>
            {hasChange && (
              <span className="tarif-price-original">
                (était {Number(item.selling_price).toFixed(2)} €)
              </span>
            )}
            <Edit3 className="tarif-price-edit-icon" />
          </div>
        )}
      </td>

      {/* Marge actuelle */}
      <td className="tarif-cell-margin">
        <div className="tarif-margin">
          <span className={`tarif-margin-amount text-${marginColor}-400`}>
            {currentMarginAmount.toFixed(2)} €
          </span>
          <span className={`tarif-margin-percent tarif-margin-${marginStatus}`}>
            {currentMarginPercent.toFixed(0)}%
          </span>
        </div>
      </td>

      {/* Prix suggérés pour différentes marges cibles */}
      {targetMargins.map(target => {
        const suggestedPrice = getSuggestedPrice(item.cost_price, target)
        const isCurrentPrice = Math.abs(currentPrice - suggestedPrice) < 0.05
        const diff = suggestedPrice - currentPrice

        return (
          <td key={target} className="tarif-cell-suggested">
            <button
              className={`tarif-suggested-btn ${isCurrentPrice ? 'tarif-suggested-active' : ''}`}
              onClick={() => handleApplySuggested(suggestedPrice)}
              disabled={isCurrentPrice}
            >
              <span className="tarif-suggested-price">{suggestedPrice.toFixed(2)} €</span>
              {!isCurrentPrice && (
                <span className={`tarif-suggested-diff ${diff > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {diff > 0 ? '+' : ''}{diff.toFixed(2)}
                </span>
              )}
              {isCurrentPrice && <Check className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
          </td>
        )
      })}

      {/* Actions */}
      <td className="tarif-cell-actions">
        {hasChange && (
          <button 
            className="tarif-undo-btn"
            onClick={() => onCancelChange(item.id)}
            title="Annuler la modification"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </td>
    </tr>
  )
}

// ============================================
// SIMULATION PANEL
// ============================================

interface SimulationPanelProps {
  items: MenuItemWithIngredients[]
  pendingChanges: PriceChange[]
  getSuggestedPrice: (cost: number, margin: number) => number
}

function SimulationPanel({ items, pendingChanges, getSuggestedPrice }: SimulationPanelProps) {
  // Calculate current vs new totals
  const currentStats = useMemo(() => {
    const totalMargin = items.reduce((sum, item) => sum + item.margin_amount, 0)
    const avgMarginPercent = items.length > 0 
      ? items.reduce((sum, item) => sum + item.actual_margin_percent, 0) / items.length 
      : 0
    return { totalMargin, avgMarginPercent }
  }, [items])

  const newStats = useMemo(() => {
    let totalMargin = 0
    let totalMarginPercent = 0

    items.forEach(item => {
      const change = pendingChanges.find(c => c.id === item.id)
      const price = change?.newPrice ?? Number(item.selling_price)
      const marginAmount = price - item.cost_price
      const marginPercent = price > 0 ? (marginAmount / price) * 100 : 0
      totalMargin += marginAmount
      totalMarginPercent += marginPercent
    })

    const avgMarginPercent = items.length > 0 ? totalMarginPercent / items.length : 0
    return { totalMargin, avgMarginPercent }
  }, [items, pendingChanges])

  const marginDiff = newStats.totalMargin - currentStats.totalMargin
  const avgDiff = newStats.avgMarginPercent - currentStats.avgMarginPercent

  // Estimate monthly impact (assuming 30 sales per item per month)
  const monthlyImpact = marginDiff * 30

  if (pendingChanges.length === 0) {
    return null
  }

  return (
    <div className="tarif-simulation-panel">
      <div className="tarif-simulation-header">
        <Calculator className="w-5 h-5 text-cyan-400" />
        <h3>Simulation des modifications</h3>
        <span className="tarif-simulation-count">{pendingChanges.length} changement{pendingChanges.length > 1 ? 's' : ''}</span>
      </div>

      <div className="tarif-simulation-grid">
        <div className="tarif-simulation-stat">
          <span className="tarif-simulation-label">Marge moyenne</span>
          <div className="tarif-simulation-values">
            <span className="tarif-simulation-old">{currentStats.avgMarginPercent.toFixed(1)}%</span>
            <TrendingUp className="w-4 h-4 text-slate-500" />
            <span className={`tarif-simulation-new ${avgDiff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {newStats.avgMarginPercent.toFixed(1)}%
            </span>
            <span className={`tarif-simulation-diff ${avgDiff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              ({avgDiff >= 0 ? '+' : ''}{avgDiff.toFixed(1)}%)
            </span>
          </div>
        </div>

        <div className="tarif-simulation-stat">
          <span className="tarif-simulation-label">Impact mensuel estimé</span>
          <span className={`tarif-simulation-impact ${monthlyImpact >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {monthlyImpact >= 0 ? '+' : ''}{monthlyImpact.toFixed(0)} €/mois
          </span>
        </div>
      </div>
    </div>
  )
}

// ============================================
// MAIN PAGE
// ============================================

export default function GrilleTarifairePage() {
  const { 
    menuItems, 
    loading, 
    updateMenuItem,
    getSuggestedPrice,
    getAverageMargin,
    getLowMarginItems
  } = useMenuItems()

  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [pendingChanges, setPendingChanges] = useState<PriceChange[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [filterLowMargin, setFilterLowMargin] = useState(false)
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false)

  const targetMargins = [65, 70, 75]

  // Filtered & sorted items
  const filteredItems = useMemo(() => {
    let items = [...menuItems]

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      items = items.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
      )
    }

    // Filter low margin
    if (filterLowMargin) {
      items = items.filter(item => item.actual_margin_percent < 60)
    }

    // Sort
    items.sort((a, b) => {
      let aVal: string | number = 0
      let bVal: string | number = 0

      switch (sortField) {
        case 'name':
          aVal = a.name.toLowerCase()
          bVal = b.name.toLowerCase()
          break
        case 'price':
          aVal = Number(a.selling_price)
          bVal = Number(b.selling_price)
          break
        case 'cost':
          aVal = a.cost_price
          bVal = b.cost_price
          break
        case 'margin':
          aVal = a.margin_amount
          bVal = b.margin_amount
          break
        case 'margin_percent':
          aVal = a.actual_margin_percent
          bVal = b.actual_margin_percent
          break
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal)
      }

      return sortDirection === 'asc' 
        ? (aVal as number) - (bVal as number) 
        : (bVal as number) - (aVal as number)
    })

    return items
  }, [menuItems, searchQuery, sortField, sortDirection, filterLowMargin])

  // Handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handlePriceChange = (id: string, originalPrice: number, newPrice: number) => {
    setPendingChanges(prev => {
      const existing = prev.find(c => c.id === id)
      if (existing) {
        // Update existing change
        if (newPrice === existing.originalPrice) {
          // Back to original, remove change
          return prev.filter(c => c.id !== id)
        }
        return prev.map(c => c.id === id ? { ...c, newPrice } : c)
      }
      // Add new change
      return [...prev, { id, originalPrice, newPrice }]
    })
  }

  const handleCancelChange = (id: string) => {
    setPendingChanges(prev => prev.filter(c => c.id !== id))
  }

  const handleCancelAll = () => {
    setPendingChanges([])
  }

  const handleSaveAll = async () => {
    if (pendingChanges.length === 0) return

    setIsSaving(true)
    try {
      for (const change of pendingChanges) {
        await updateMenuItem(change.id, { selling_price: change.newPrice })
      }
      setPendingChanges([])
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleApplyToAll = (targetMargin: number) => {
    const newChanges: PriceChange[] = []
    
    filteredItems.forEach(item => {
      const suggestedPrice = getSuggestedPrice(item.cost_price, targetMargin)
      if (Math.abs(Number(item.selling_price) - suggestedPrice) >= 0.05) {
        newChanges.push({
          id: item.id,
          originalPrice: Number(item.selling_price),
          newPrice: suggestedPrice
        })
      }
    })

    setPendingChanges(newChanges)
  }

  // Stats
  const avgMargin = getAverageMargin()
  const lowMarginCount = getLowMarginItems(60).length

  if (loading) {
    return (
      <div className="tarif-page-loading">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        <span>Chargement...</span>
      </div>
    )
  }

  return (
    <div className="tarif-page">
      {/* Header */}
      <div className="tarif-page-header">
        <div className="tarif-page-header-left">
          <Link href="/manager/menu" className="tarif-back-link">
            <ArrowLeft className="w-4 h-4" />
            Retour au menu
          </Link>
          <div className="tarif-page-title-wrapper">
            <div className="tarif-page-icon">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="tarif-page-title">Grille Tarifaire</h1>
              <p className="tarif-page-subtitle">Optimisez vos prix et marges</p>
            </div>
          </div>
        </div>

        <div className="tarif-page-header-right">
          <button 
            className="ai-trigger-btn"
            onClick={() => setIsAIAssistantOpen(true)}
          >
            <Sparkles className="h-4 w-4" />
            <span>Analyser avec l'IA</span>
          </button>
          {pendingChanges.length > 0 && (
            <>
              <Button 
                variant="outline" 
                onClick={handleCancelAll}
                className="tarif-cancel-btn"
              >
                <X className="w-4 h-4" />
                Annuler tout
              </Button>
              <Button 
                onClick={handleSaveAll}
                disabled={isSaving}
                className="tarif-save-btn"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Enregistrer ({pendingChanges.length})
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="tarif-quick-stats">
        <div className="tarif-quick-stat">
          <Percent className="w-5 h-5 text-emerald-400" />
          <div>
            <span className="tarif-quick-stat-value">{avgMargin.toFixed(0)}%</span>
            <span className="tarif-quick-stat-label">Marge moyenne</span>
          </div>
        </div>
        <div className="tarif-quick-stat">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <div>
            <span className="tarif-quick-stat-value">{lowMarginCount}</span>
            <span className="tarif-quick-stat-label">Marges &lt; 60%</span>
          </div>
        </div>
        <div className="tarif-quick-stat">
          <ChefHat className="w-5 h-5 text-cyan-400" />
          <div>
            <span className="tarif-quick-stat-value">{menuItems.length}</span>
            <span className="tarif-quick-stat-label">Items au menu</span>
          </div>
        </div>
      </div>

      {/* Simulation Panel */}
      <SimulationPanel 
        items={menuItems}
        pendingChanges={pendingChanges}
        getSuggestedPrice={getSuggestedPrice}
      />

      {/* Toolbar */}
      <div className="tarif-toolbar">
        <div className="tarif-search-wrapper">
          <Search className="tarif-search-icon" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher..."
            className="tarif-search-input"
          />
        </div>

        <div className="tarif-toolbar-actions">
          <button 
            className={`tarif-filter-btn ${filterLowMargin ? 'active' : ''}`}
            onClick={() => setFilterLowMargin(!filterLowMargin)}
          >
            <AlertTriangle className="w-4 h-4" />
            Marges basses
          </button>

          <div className="tarif-apply-all">
            <span className="tarif-apply-all-label">Appliquer à tous :</span>
            {targetMargins.map(margin => (
              <button
                key={margin}
                className="tarif-apply-margin-btn"
                onClick={() => handleApplyToAll(margin)}
              >
                {margin}%
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="tarif-table-container">
        <table className="tarif-table">
          <thead>
            <tr>
              <th className="tarif-th-item" onClick={() => handleSort('name')}>
                Produit
                {sortField === 'name' && (
                  <span className="tarif-sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th className="tarif-th-cost" onClick={() => handleSort('cost')}>
                Coût
                {sortField === 'cost' && (
                  <span className="tarif-sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th className="tarif-th-price" onClick={() => handleSort('price')}>
                Prix actuel
                {sortField === 'price' && (
                  <span className="tarif-sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th className="tarif-th-margin" onClick={() => handleSort('margin_percent')}>
                Marge
                {sortField === 'margin_percent' && (
                  <span className="tarif-sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              {targetMargins.map(margin => (
                <th key={margin} className="tarif-th-suggested">
                  <Target className="w-3.5 h-3.5" />
                  {margin}%
                </th>
              ))}
              <th className="tarif-th-actions"></th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(item => (
              <PriceRow
                key={item.id}
                item={item}
                targetMargins={targetMargins}
                getSuggestedPrice={getSuggestedPrice}
                pendingChange={pendingChanges.find(c => c.id === item.id)}
                onPriceChange={handlePriceChange}
                onCancelChange={handleCancelChange}
              />
            ))}
          </tbody>
        </table>

        {filteredItems.length === 0 && (
          <div className="tarif-empty">
            <ChefHat className="w-12 h-12 text-slate-600" />
            <p>Aucun item trouvé</p>
          </div>
        )}
      </div>

      {/* AI Assistant */}
      <AIAssistant
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        mode="margin"
      />
    </div>
  )
}

