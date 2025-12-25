"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  Search,
  Plus,
  Filter,
  ChefHat,
  TrendingUp,
  TrendingDown,
  Star,
  AlertTriangle,
  Flame,
  Coffee,
  Pizza,
  Sandwich,
  Wine,
  IceCream,
  Salad,
  Beef,
  Fish,
  X,
  ChevronRight,
  BarChart3,
  DollarSign,
  Package,
  Percent,
  ArrowUpRight,
  Sparkles,
  Eye,
  Edit3,
  Trash2,
  MoreVertical,
  Grid3X3,
  List,
  Archive,
  Check,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useMenuItems, type MenuItemWithIngredients } from "@/lib/hooks/use-menu-items"
import type { Product, ProductCategory, StockUnit } from "@/lib/database.types"
import { AIAssistant } from "@/components/ai-assistant/AIAssistant"

// ============================================
// TYPES & CONSTANTS
// ============================================

type MenuCategory = 'all' | 'pizza' | 'burger' | 'plat' | 'entree' | 'dessert' | 'boisson' | 'autre'
type ViewMode = 'grid' | 'list'
type MarginFilter = 'all' | 'low' | 'medium' | 'high'
type PopularityFilter = 'all' | 'top' | 'normal' | 'low'

const MENU_CATEGORIES: { id: MenuCategory; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'all', label: 'Tous', icon: Grid3X3, color: 'slate' },
  { id: 'pizza', label: 'Pizzas', icon: Pizza, color: 'red' },
  { id: 'burger', label: 'Burgers', icon: Sandwich, color: 'amber' },
  { id: 'plat', label: 'Plats', icon: Beef, color: 'orange' },
  { id: 'entree', label: 'Entrées', icon: Salad, color: 'green' },
  { id: 'dessert', label: 'Desserts', icon: IceCream, color: 'pink' },
  { id: 'boisson', label: 'Boissons', icon: Coffee, color: 'cyan' },
  { id: 'autre', label: 'Autres', icon: ChefHat, color: 'purple' },
]

const getCategoryIcon = (category: string | null): React.ElementType => {
  const cat = MENU_CATEGORIES.find(c => c.id === category?.toLowerCase())
  return cat?.icon || ChefHat
}

const getCategoryColor = (category: string | null): string => {
  const cat = MENU_CATEGORIES.find(c => c.id === category?.toLowerCase())
  return cat?.color || 'slate'
}

// ============================================
// WIZARD STEPS COMPONENT
// ============================================

interface WizardStep {
  id: number
  title: string
  description: string
}

const WIZARD_STEPS: WizardStep[] = [
  { id: 1, title: 'Informations', description: 'Nom, catégorie, TVA' },
  { id: 2, title: 'Recette', description: 'Ingrédients & quantités' },
  { id: 3, title: 'Tarification', description: 'Prix de vente & marges' },
]

// ============================================
// CREATE MENU ITEM WIZARD
// ============================================

interface CreateMenuItemWizardProps {
  isOpen: boolean
  onClose: () => void
  products: Product[]
  onCreateItem: (data: {
    name: string
    category: string
    description?: string
    selling_price: number
    target_margin_percent: number
    icon?: string
    ingredients: { product_id: string; quantity: number; unit: string }[]
  }) => Promise<{ success: boolean; error?: string; data?: unknown }>
  onAddIngredient: (data: { menu_item_id: string; product_id: string; quantity: number; unit: string }) => Promise<{ success: boolean; error?: string }>
}

function CreateMenuItemWizard({ isOpen, onClose, products, onCreateItem, onAddIngredient }: CreateMenuItemWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Step 1: Info
  const [name, setName] = useState('')
  const [category, setCategory] = useState<string>('plat')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('🍽️')
  
  // Step 2: Recette
  const [ingredients, setIngredients] = useState<{ product_id: string; quantity: number; unit: string; product?: Product }[]>([])
  const [searchIngredient, setSearchIngredient] = useState('')
  
  // Step 3: Prix
  const [sellingPrice, setSellingPrice] = useState('')
  const [targetMargin, setTargetMargin] = useState(70)

  // Calcul du coût des ingrédients
  const ingredientsCost = useMemo(() => {
    return ingredients.reduce((sum, ing) => {
      const product = products.find(p => p.id === ing.product_id)
      // Estimation basique - en réalité on récupérerait le prix depuis le stock
      return sum + (ing.quantity * 0.01) // placeholder
    }, 0)
  }, [ingredients, products])

  const calculatedMargin = useMemo(() => {
    const price = parseFloat(sellingPrice) || 0
    if (price === 0) return 0
    return ((price - ingredientsCost) / price) * 100
  }, [sellingPrice, ingredientsCost])

  const suggestedPrice = useMemo(() => {
    if (ingredientsCost === 0) return 0
    return Math.round((ingredientsCost / (1 - targetMargin / 100)) * 100) / 100
  }, [ingredientsCost, targetMargin])

  const filteredProducts = useMemo(() => {
    if (!searchIngredient.trim()) return products.slice(0, 10)
    return products.filter(p => 
      p.name.toLowerCase().includes(searchIngredient.toLowerCase())
    ).slice(0, 10)
  }, [products, searchIngredient])

  const addIngredient = (product: Product) => {
    if (ingredients.find(i => i.product_id === product.id)) return
    setIngredients([...ingredients, {
      product_id: product.id,
      quantity: 100,
      unit: product.unit === 'kg' ? 'g' : product.unit === 'L' ? 'ml' : product.unit,
      product
    }])
    setSearchIngredient('')
  }

  const removeIngredient = (productId: string) => {
    setIngredients(ingredients.filter(i => i.product_id !== productId))
  }

  const updateIngredientQuantity = (productId: string, quantity: number) => {
    setIngredients(ingredients.map(i => 
      i.product_id === productId ? { ...i, quantity } : i
    ))
  }

  const handleNext = () => {
    if (currentStep === 1 && !name.trim()) {
      setError('Le nom est obligatoire')
      return
    }
    if (currentStep === 2 && ingredients.length === 0) {
      setError('Ajoutez au moins un ingrédient')
      return
    }
    setError(null)
    setCurrentStep(currentStep + 1)
  }

  const handleBack = () => {
    setError(null)
    setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async () => {
    if (!sellingPrice || parseFloat(sellingPrice) <= 0) {
      setError('Le prix de vente est obligatoire')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await onCreateItem({
        name: name.trim(),
        category,
        description: description.trim() || undefined,
        selling_price: parseFloat(sellingPrice),
        target_margin_percent: targetMargin,
        icon,
        ingredients: ingredients.map(i => ({
          product_id: i.product_id,
          quantity: i.quantity,
          unit: i.unit
        }))
      })

      if (!result.success) {
        setError(result.error || 'Erreur lors de la création')
        return
      }

      // Ajouter les ingrédients
      const menuItemId = (result.data as { id: string })?.id
      if (menuItemId) {
        for (const ing of ingredients) {
          await onAddIngredient({
            menu_item_id: menuItemId,
            product_id: ing.product_id,
            quantity: ing.quantity,
            unit: ing.unit
          })
        }
      }

      // Reset & fermer
      resetForm()
      onClose()
    } catch (err) {
      setError('Erreur inattendue')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setCurrentStep(1)
    setName('')
    setCategory('plat')
    setDescription('')
    setIcon('🍽️')
    setIngredients([])
    setSellingPrice('')
    setTargetMargin(70)
    setError(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="menu-wizard-dialog">
        <DialogHeader>
          <DialogTitle className="menu-wizard-title">
            <ChefHat className="w-5 h-5 text-emerald-400" />
            Créer un item de menu
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="menu-wizard-steps">
          {WIZARD_STEPS.map((step, index) => (
            <div 
              key={step.id}
              className={`menu-wizard-step ${currentStep === step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}
            >
              <div className="menu-wizard-step-indicator">
                {currentStep > step.id ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span>{step.id}</span>
                )}
              </div>
              <div className="menu-wizard-step-content">
                <span className="menu-wizard-step-title">{step.title}</span>
                <span className="menu-wizard-step-desc">{step.description}</span>
              </div>
              {index < WIZARD_STEPS.length - 1 && (
                <div className={`menu-wizard-step-line ${currentStep > step.id ? 'completed' : ''}`} />
              )}
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="menu-wizard-error">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Step Content */}
        <div className="menu-wizard-content">
          {/* Step 1: Informations */}
          {currentStep === 1 && (
            <div className="menu-wizard-form">
              <div className="menu-form-group">
                <label>Nom du plat *</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Pizza Margherita, Burger Classic..."
                  className="menu-form-input"
                />
              </div>

              <div className="menu-form-group">
                <label>Catégorie</label>
                <div className="menu-category-selector">
                  {MENU_CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      className={`menu-category-btn ${category === cat.id ? 'active' : ''}`}
                      onClick={() => setCategory(cat.id)}
                    >
                      <cat.icon className="w-4 h-4" />
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="menu-form-group">
                <label>Description (optionnel)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description courte du plat..."
                  className="menu-form-textarea"
                  rows={2}
                />
              </div>

              <div className="menu-form-group">
                <label>Icône</label>
                <div className="menu-icon-selector">
                  {['🍕', '🍔', '🥗', '🍖', '🍰', '☕', '🍺', '🍽️', '🍜', '🥘', '🌮', '🍣'].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      className={`menu-icon-btn ${icon === emoji ? 'active' : ''}`}
                      onClick={() => setIcon(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Recette */}
          {currentStep === 2 && (
            <div className="menu-wizard-form">
              <div className="menu-form-group">
                <label>Rechercher un ingrédient</label>
                <div className="menu-ingredient-search">
                  <Search className="w-4 h-4 text-slate-400" />
                  <Input
                    value={searchIngredient}
                    onChange={(e) => setSearchIngredient(e.target.value)}
                    placeholder="Tapez pour rechercher..."
                    className="menu-form-input"
                  />
                </div>
                
                {searchIngredient && filteredProducts.length > 0 && (
                  <div className="menu-ingredient-dropdown">
                    {filteredProducts.map(product => (
                      <button
                        key={product.id}
                        type="button"
                        className="menu-ingredient-option"
                        onClick={() => addIngredient(product)}
                        disabled={ingredients.some(i => i.product_id === product.id)}
                      >
                        <span className="menu-ingredient-option-icon">{product.icon || '📦'}</span>
                        <span className="menu-ingredient-option-name">{product.name}</span>
                        <span className="menu-ingredient-option-unit">{product.unit}</span>
                        {ingredients.some(i => i.product_id === product.id) && (
                          <Check className="w-4 h-4 text-emerald-400" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="menu-ingredients-list">
                <label>Ingrédients ajoutés ({ingredients.length})</label>
                {ingredients.length === 0 ? (
                  <div className="menu-ingredients-empty">
                    <Package className="w-8 h-8 text-slate-600" />
                    <span>Aucun ingrédient ajouté</span>
                    <span className="text-xs text-slate-500">Recherchez et ajoutez des ingrédients depuis votre stock</span>
                  </div>
                ) : (
                  <div className="menu-ingredients-items">
                    {ingredients.map(ing => (
                      <div key={ing.product_id} className="menu-ingredient-item">
                        <div className="menu-ingredient-item-info">
                          <span className="menu-ingredient-item-icon">{ing.product?.icon || '📦'}</span>
                          <span className="menu-ingredient-item-name">{ing.product?.name}</span>
                        </div>
                        <div className="menu-ingredient-item-qty">
                          <Input
                            type="number"
                            value={ing.quantity}
                            onChange={(e) => updateIngredientQuantity(ing.product_id, parseFloat(e.target.value) || 0)}
                            className="menu-ingredient-qty-input"
                            min={0}
                          />
                          <span className="menu-ingredient-item-unit">{ing.unit}</span>
                        </div>
                        <button
                          type="button"
                          className="menu-ingredient-remove"
                          onClick={() => removeIngredient(ing.product_id)}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {ingredients.length > 0 && (
                <div className="menu-cost-preview">
                  <div className="menu-cost-preview-row">
                    <span>Coût matière estimé</span>
                    <span className="menu-cost-preview-value">{ingredientsCost.toFixed(2)} €</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Tarification */}
          {currentStep === 3 && (
            <div className="menu-wizard-form">
              <div className="menu-pricing-summary">
                <div className="menu-pricing-item-preview">
                  <span className="menu-pricing-item-icon">{icon}</span>
                  <div>
                    <h4>{name}</h4>
                    <span>{ingredients.length} ingrédient{ingredients.length > 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="menu-pricing-cost">
                  <span>Coût matière</span>
                  <span className="menu-pricing-cost-value">{ingredientsCost.toFixed(2)} €</span>
                </div>
              </div>

              <div className="menu-form-group">
                <label>Prix de vente TTC *</label>
                <div className="menu-price-input-wrapper">
                  <Input
                    type="number"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    placeholder="0.00"
                    className="menu-form-input menu-price-input"
                    min={0}
                    step={0.01}
                  />
                  <span className="menu-price-currency">€</span>
                </div>
                {suggestedPrice > 0 && (
                  <p className="menu-price-suggestion">
                    💡 Pour {targetMargin}% de marge, prix suggéré : <strong>{suggestedPrice.toFixed(2)} €</strong>
                    <button 
                      type="button"
                      className="menu-apply-suggestion"
                      onClick={() => setSellingPrice(suggestedPrice.toString())}
                    >
                      Appliquer
                    </button>
                  </p>
                )}
              </div>

              <div className="menu-form-group">
                <label>Marge cible : {targetMargin}%</label>
                <input
                  type="range"
                  min={30}
                  max={90}
                  value={targetMargin}
                  onChange={(e) => setTargetMargin(parseInt(e.target.value))}
                  className="menu-margin-slider"
                />
                <div className="menu-margin-labels">
                  <span>30%</span>
                  <span>60%</span>
                  <span>90%</span>
                </div>
              </div>

              {parseFloat(sellingPrice) > 0 && (
                <div className="menu-pricing-result">
                  <div className="menu-pricing-result-row">
                    <span>Prix de vente</span>
                    <span>{parseFloat(sellingPrice).toFixed(2)} €</span>
                  </div>
                  <div className="menu-pricing-result-row">
                    <span>Coût matière</span>
                    <span>- {ingredientsCost.toFixed(2)} €</span>
                  </div>
                  <div className="menu-pricing-result-divider" />
                  <div className="menu-pricing-result-row total">
                    <span>Marge brute</span>
                    <span className={calculatedMargin >= targetMargin ? 'text-emerald-400' : calculatedMargin >= 50 ? 'text-amber-400' : 'text-red-400'}>
                      {(parseFloat(sellingPrice) - ingredientsCost).toFixed(2)} € ({calculatedMargin.toFixed(1)}%)
                    </span>
                  </div>
                  {calculatedMargin < 50 && (
                    <div className="menu-pricing-warning">
                      <AlertTriangle className="w-4 h-4" />
                      Attention : marge faible
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="menu-wizard-actions">
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="menu-wizard-btn-back"
            >
              Retour
            </Button>
          )}
          <div className="flex-1" />
          {currentStep < 3 ? (
            <Button
              onClick={handleNext}
              className="menu-wizard-btn-next"
            >
              Continuer
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="menu-wizard-btn-submit"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Créer l'item
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// MENU ITEM CARD COMPONENT
// ============================================

interface MenuItemCardProps {
  item: MenuItemWithIngredients
  viewMode: ViewMode
  onView: (item: MenuItemWithIngredients) => void
  onEdit: (item: MenuItemWithIngredients) => void
  onDelete: (id: string) => void
}

function MenuItemCard({ item, viewMode, onView, onEdit, onDelete }: MenuItemCardProps) {
  const [showActions, setShowActions] = useState(false)
  const CategoryIcon = getCategoryIcon(item.category)
  const categoryColor = getCategoryColor(item.category)

  const marginStatus = item.actual_margin_percent >= 70 ? 'high' : item.actual_margin_percent >= 50 ? 'medium' : 'low'
  const marginStatusColor = marginStatus === 'high' ? 'emerald' : marginStatus === 'medium' ? 'amber' : 'red'

  // Déterminer le statut popularité (simulé pour le moment)
  const popularityScore = Math.random() > 0.7 ? 'top' : Math.random() > 0.3 ? 'normal' : 'low'

  if (viewMode === 'list') {
    return (
      <div className="menu-item-row" onClick={() => onView(item)}>
        <div className="menu-item-row-icon">
          <span>{item.icon || '🍽️'}</span>
        </div>
        <div className="menu-item-row-info">
          <h4>{item.name}</h4>
          <span className={`menu-item-category menu-item-category-${categoryColor}`}>
            <CategoryIcon className="w-3 h-3" />
            {item.category || 'Autre'}
          </span>
        </div>
        <div className="menu-item-row-price">
          <span className="menu-item-price-value">{Number(item.selling_price).toFixed(2)} €</span>
        </div>
        <div className="menu-item-row-cost">
          <span className="menu-item-cost-value">{item.cost_price.toFixed(2)} €</span>
        </div>
        <div className="menu-item-row-margin">
          <span className={`menu-item-margin-badge menu-item-margin-${marginStatusColor}`}>
            {item.actual_margin_percent.toFixed(0)}%
          </span>
        </div>
        <div className="menu-item-row-popularity">
          {popularityScore === 'top' && (
            <span className="menu-item-badge-top">
              <Flame className="w-3 h-3" />
              Top
            </span>
          )}
          {item.actual_margin_percent < 50 && (
            <span className="menu-item-badge-warning">
              <AlertTriangle className="w-3 h-3" />
            </span>
          )}
        </div>
        <div className="menu-item-row-actions">
          <button onClick={(e) => { e.stopPropagation(); onEdit(item); }}>
            <Edit3 className="w-4 h-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="text-red-400">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="menu-item-card"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={() => onView(item)}
    >
      {/* Badges */}
      <div className="menu-item-badges">
        {popularityScore === 'top' && (
          <span className="menu-item-badge menu-item-badge-top">
            <Flame className="w-3 h-3" />
            Best-seller
          </span>
        )}
        {item.actual_margin_percent < 50 && (
          <span className="menu-item-badge menu-item-badge-warning">
            <AlertTriangle className="w-3 h-3" />
            Marge basse
          </span>
        )}
      </div>

      {/* Header */}
      <div className="menu-item-card-header">
        <div className="menu-item-icon-wrapper">
          <span className="menu-item-icon">{item.icon || '🍽️'}</span>
        </div>
        <div className="menu-item-card-info">
          <h3 className="menu-item-name">{item.name}</h3>
          <span className={`menu-item-category menu-item-category-${categoryColor}`}>
            <CategoryIcon className="w-3 h-3" />
            {item.category || 'Autre'}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="menu-item-stats">
        <div className="menu-item-stat">
          <span className="menu-item-stat-label">Prix</span>
          <span className="menu-item-stat-value">{Number(item.selling_price).toFixed(2)} €</span>
        </div>
        <div className="menu-item-stat">
          <span className="menu-item-stat-label">Coût</span>
          <span className="menu-item-stat-value text-slate-400">{item.cost_price.toFixed(2)} €</span>
        </div>
        <div className="menu-item-stat">
          <span className="menu-item-stat-label">Marge</span>
          <span className={`menu-item-stat-value text-${marginStatusColor}-400`}>
            {item.margin_amount.toFixed(2)} €
          </span>
        </div>
      </div>

      {/* Margin Bar */}
      <div className="menu-item-margin-bar-container">
        <div className="menu-item-margin-bar">
          <div 
            className={`menu-item-margin-bar-fill bg-${marginStatusColor}-500`}
            style={{ width: `${Math.min(100, item.actual_margin_percent)}%` }}
          />
        </div>
        <span className={`menu-item-margin-percent text-${marginStatusColor}-400`}>
          {item.actual_margin_percent.toFixed(0)}%
        </span>
      </div>

      {/* Ingredients count */}
      <div className="menu-item-ingredients-count">
        <Package className="w-3.5 h-3.5 text-slate-500" />
        <span>{item.ingredients.length} ingrédient{item.ingredients.length > 1 ? 's' : ''}</span>
      </div>

      {/* Hover Actions */}
      {showActions && (
        <div className="menu-item-actions">
          <button onClick={(e) => { e.stopPropagation(); onView(item); }} className="menu-item-action-btn">
            <Eye className="w-4 h-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="menu-item-action-btn">
            <Edit3 className="w-4 h-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="menu-item-action-btn menu-item-action-delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

// ============================================
// MENU ITEM DETAIL MODAL
// ============================================

interface MenuItemDetailProps {
  item: MenuItemWithIngredients | null
  isOpen: boolean
  onClose: () => void
  onUpdatePrice: (id: string, price: number) => Promise<void>
  getSuggestedPrice: (cost: number, margin: number) => number
  getQuickWins: (item: MenuItemWithIngredients) => Array<{
    type: string
    description: string
    impact: number
    action: string
  }>
}

function MenuItemDetail({ item, isOpen, onClose, onUpdatePrice, getSuggestedPrice, getQuickWins }: MenuItemDetailProps) {
  const [activeTab, setActiveTab] = useState<'recipe' | 'margin' | 'history'>('recipe')
  const [editingPrice, setEditingPrice] = useState(false)
  const [newPrice, setNewPrice] = useState('')

  if (!item) return null

  const quickWins = getQuickWins(item)
  const marginTargets = [65, 70, 75]

  const handleSavePrice = async () => {
    const price = parseFloat(newPrice)
    if (price > 0) {
      await onUpdatePrice(item.id, price)
      setEditingPrice(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="menu-detail-dialog">
        <DialogHeader>
          <DialogTitle className="menu-detail-title">
            <span className="menu-detail-icon">{item.icon || '🍽️'}</span>
            <div>
              <h2>{item.name}</h2>
              <span className="menu-detail-category">{item.category || 'Autre'}</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Summary Cards */}
        <div className="menu-detail-summary">
          <div className="menu-detail-summary-card">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="menu-detail-summary-label">Prix de vente</span>
              {editingPrice ? (
                <div className="menu-detail-price-edit">
                  <Input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="menu-detail-price-input"
                    autoFocus
                  />
                  <button onClick={handleSavePrice} className="menu-detail-price-save">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditingPrice(false)} className="menu-detail-price-cancel">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <span 
                  className="menu-detail-summary-value cursor-pointer hover:text-emerald-400"
                  onClick={() => { setNewPrice(item.selling_price.toString()); setEditingPrice(true); }}
                >
                  {Number(item.selling_price).toFixed(2)} €
                  <Edit3 className="w-3 h-3 ml-1 inline opacity-50" />
                </span>
              )}
            </div>
          </div>
          <div className="menu-detail-summary-card">
            <Package className="w-5 h-5 text-cyan-400" />
            <div>
              <span className="menu-detail-summary-label">Coût matière</span>
              <span className="menu-detail-summary-value">{item.cost_price.toFixed(2)} €</span>
            </div>
          </div>
          <div className="menu-detail-summary-card">
            <Percent className="w-5 h-5 text-amber-400" />
            <div>
              <span className="menu-detail-summary-label">Marge brute</span>
              <span className={`menu-detail-summary-value ${
                item.actual_margin_percent >= 70 ? 'text-emerald-400' : 
                item.actual_margin_percent >= 50 ? 'text-amber-400' : 'text-red-400'
              }`}>
                {item.margin_amount.toFixed(2)} € ({item.actual_margin_percent.toFixed(0)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="menu-detail-tabs">
          <button 
            className={`menu-detail-tab ${activeTab === 'recipe' ? 'active' : ''}`}
            onClick={() => setActiveTab('recipe')}
          >
            <ChefHat className="w-4 h-4" />
            Recette
          </button>
          <button 
            className={`menu-detail-tab ${activeTab === 'margin' ? 'active' : ''}`}
            onClick={() => setActiveTab('margin')}
          >
            <TrendingUp className="w-4 h-4" />
            Marge & Prix
          </button>
          <button 
            className={`menu-detail-tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <BarChart3 className="w-4 h-4" />
            Performance
          </button>
        </div>

        {/* Tab Content */}
        <div className="menu-detail-content">
          {activeTab === 'recipe' && (
            <div className="menu-detail-recipe">
              <h4>Ingrédients ({item.ingredients.length})</h4>
              <div className="menu-detail-ingredients">
                {item.ingredients.map(ing => (
                  <div key={ing.id} className="menu-detail-ingredient">
                    <span className="menu-detail-ingredient-icon">{ing.product?.icon || '📦'}</span>
                    <span className="menu-detail-ingredient-name">{ing.product?.name || 'Ingrédient'}</span>
                    <span className="menu-detail-ingredient-qty">{Number(ing.quantity)} {ing.unit}</span>
                    <span className="menu-detail-ingredient-cost">~{(Number(ing.quantity) * 0.01).toFixed(2)} €</span>
                  </div>
                ))}
              </div>
              <div className="menu-detail-cost-total">
                <span>Coût total de la recette</span>
                <span>{item.cost_price.toFixed(2)} €</span>
              </div>
            </div>
          )}

          {activeTab === 'margin' && (
            <div className="menu-detail-margin">
              {/* Price Suggestions */}
              <div className="menu-detail-price-suggestions">
                <h4>Prix conseillés selon marge cible</h4>
                <div className="menu-detail-price-grid">
                  {marginTargets.map(target => {
                    const suggested = getSuggestedPrice(item.cost_price, target)
                    const isCurrentClose = Math.abs(Number(item.selling_price) - suggested) < 0.5
                    return (
                      <div 
                        key={target}
                        className={`menu-detail-price-option ${isCurrentClose ? 'active' : ''}`}
                      >
                        <span className="menu-detail-price-target">{target}%</span>
                        <span className="menu-detail-price-suggested">{suggested.toFixed(2)} €</span>
                        {!isCurrentClose && (
                          <button 
                            className="menu-detail-price-apply"
                            onClick={() => onUpdatePrice(item.id, suggested)}
                          >
                            Appliquer
                          </button>
                        )}
                        {isCurrentClose && <Check className="w-4 h-4 text-emerald-400" />}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Quick Wins */}
              {quickWins.length > 0 && (
                <div className="menu-detail-quickwins">
                  <h4>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Quick Wins
                  </h4>
                  <div className="menu-detail-quickwins-list">
                    {quickWins.map((win, index) => (
                      <div key={index} className="menu-detail-quickwin">
                        <div className="menu-detail-quickwin-info">
                          <span className="menu-detail-quickwin-desc">{win.description}</span>
                          <span className="menu-detail-quickwin-action">{win.action}</span>
                        </div>
                        <span className="menu-detail-quickwin-impact">+{win.impact.toFixed(0)} €/mois</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="menu-detail-history">
              <div className="menu-detail-history-placeholder">
                <BarChart3 className="w-12 h-12 text-slate-600" />
                <h4>Historique des ventes</h4>
                <p>Les statistiques de performance apparaîtront ici une fois les ventes enregistrées.</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function ManagerMenuPage() {
  const { 
    menuItems, 
    products, 
    loading, 
    createMenuItem, 
    updateMenuItem,
    deleteMenuItem, 
    addIngredient,
    getSuggestedPrice,
    getQuickWins,
    getCategories,
    getAverageMargin,
    getLowMarginItems
  } = useMenuItems()

  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<MenuCategory>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [marginFilter, setMarginFilter] = useState<MarginFilter>('all')
  const [showFilters, setShowFilters] = useState(false)
  
  // Dialogs
  const [isCreateWizardOpen, setIsCreateWizardOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MenuItemWithIngredients | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false)

  // Filtered items
  const filteredItems = useMemo(() => {
    let items = [...menuItems]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      items = items.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
      )
    }

    // Category filter
    if (activeCategory !== 'all') {
      items = items.filter(item => item.category?.toLowerCase() === activeCategory)
    }

    // Margin filter
    if (marginFilter === 'low') {
      items = items.filter(item => item.actual_margin_percent < 50)
    } else if (marginFilter === 'medium') {
      items = items.filter(item => item.actual_margin_percent >= 50 && item.actual_margin_percent < 70)
    } else if (marginFilter === 'high') {
      items = items.filter(item => item.actual_margin_percent >= 70)
    }

    return items
  }, [menuItems, searchQuery, activeCategory, marginFilter])

  // Stats
  const stats = useMemo(() => ({
    total: menuItems.length,
    avgMargin: getAverageMargin(),
    lowMarginCount: getLowMarginItems(50).length,
    categories: getCategories().length
  }), [menuItems, getAverageMargin, getLowMarginItems, getCategories])

  // Handlers
  const handleViewItem = (item: MenuItemWithIngredients) => {
    setSelectedItem(item)
    setIsDetailOpen(true)
  }

  const handleEditItem = (item: MenuItemWithIngredients) => {
    setSelectedItem(item)
    // TODO: Ouvrir le wizard en mode édition
  }

  const handleDeleteItem = async (id: string) => {
    if (confirm('Supprimer cet item du menu ?')) {
      await deleteMenuItem(id)
    }
  }

  const handleUpdatePrice = async (id: string, price: number) => {
    await updateMenuItem(id, { selling_price: price })
    if (selectedItem?.id === id) {
      setSelectedItem({ ...selectedItem, selling_price: price })
    }
  }

  const handleCreateItem = async (data: Parameters<typeof createMenuItem>[0] & { ingredients: Array<{ product_id: string; quantity: number; unit: string }> }) => {
    const { ingredients, ...itemData } = data
    return await createMenuItem(itemData)
  }

  if (loading) {
    return (
      <div className="menu-page-loading">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        <span>Chargement du menu...</span>
      </div>
    )
  }

  return (
    <div className="menu-page">
      {/* Header */}
      <div className="menu-page-header">
        <div className="menu-page-header-left">
          <div className="menu-page-title-wrapper">
            <div className="menu-page-icon">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <h1 className="menu-page-title">Menu</h1>
              <p className="menu-page-subtitle">Gérez vos plats, recettes et tarifs</p>
            </div>
          </div>
        </div>
        <div className="menu-page-header-right">
          <button 
            className="ai-trigger-btn"
            onClick={() => setIsAIAssistantOpen(true)}
          >
            <Sparkles className="w-4 h-4" />
            Créer avec l'IA
          </button>
          <Link href="/manager/menu/grille-tarifaire" className="menu-header-link">
            <BarChart3 className="w-4 h-4" />
            Grille tarifaire
          </Link>
          <Button onClick={() => setIsCreateWizardOpen(true)} className="menu-create-btn">
            <Plus className="w-4 h-4" />
            Créer un item
          </Button>
        </div>
      </div>

      {/* AI Assistant */}
      <AIAssistant
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        mode="menu"
      />

      {/* Stats Cards */}
      <div className="menu-stats-grid">
        <div className="menu-stat-card">
          <div className="menu-stat-card-icon menu-stat-card-icon-blue">
            <ChefHat className="w-5 h-5" />
          </div>
          <div className="menu-stat-card-content">
            <span className="menu-stat-card-value">{stats.total}</span>
            <span className="menu-stat-card-label">Items au menu</span>
          </div>
        </div>
        <div className="menu-stat-card">
          <div className="menu-stat-card-icon menu-stat-card-icon-emerald">
            <Percent className="w-5 h-5" />
          </div>
          <div className="menu-stat-card-content">
            <span className="menu-stat-card-value">{stats.avgMargin.toFixed(0)}%</span>
            <span className="menu-stat-card-label">Marge moyenne</span>
          </div>
        </div>
        <div className="menu-stat-card">
          <div className="menu-stat-card-icon menu-stat-card-icon-amber">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="menu-stat-card-content">
            <span className="menu-stat-card-value">{stats.lowMarginCount}</span>
            <span className="menu-stat-card-label">Marges basses</span>
          </div>
        </div>
        <div className="menu-stat-card">
          <div className="menu-stat-card-icon menu-stat-card-icon-purple">
            <Grid3X3 className="w-5 h-5" />
          </div>
          <div className="menu-stat-card-content">
            <span className="menu-stat-card-value">{stats.categories}</span>
            <span className="menu-stat-card-label">Catégories</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="menu-toolbar">
        <div className="menu-search-wrapper">
          <Search className="menu-search-icon" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un plat..."
            className="menu-search-input"
          />
          {searchQuery && (
            <button className="menu-search-clear" onClick={() => setSearchQuery('')}>
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="menu-categories-scroll">
          {MENU_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`menu-category-chip ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <cat.icon className="w-4 h-4" />
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        <div className="menu-toolbar-actions">
          <button 
            className={`menu-filter-btn ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" />
            Filtres
            {marginFilter !== 'all' && <span className="menu-filter-badge">1</span>}
          </button>
          <div className="menu-view-toggle">
            <button 
              className={`menu-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button 
              className={`menu-view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="menu-filters-panel">
          <div className="menu-filter-group">
            <label>Niveau de marge</label>
            <div className="menu-filter-options">
              {[
                { id: 'all', label: 'Tous' },
                { id: 'low', label: '< 50%', color: 'red' },
                { id: 'medium', label: '50-70%', color: 'amber' },
                { id: 'high', label: '> 70%', color: 'emerald' },
              ].map(opt => (
                <button
                  key={opt.id}
                  className={`menu-filter-option ${marginFilter === opt.id ? 'active' : ''}`}
                  onClick={() => setMarginFilter(opt.id as MarginFilter)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Menu Items Grid/List */}
      {filteredItems.length === 0 ? (
        <div className="menu-empty-state">
          <ChefHat className="w-16 h-16 text-slate-600" />
          <h3>Aucun item trouvé</h3>
          <p>
            {menuItems.length === 0 
              ? "Commencez par créer votre premier item de menu" 
              : "Essayez de modifier vos filtres de recherche"}
          </p>
          {menuItems.length === 0 && (
            <Button onClick={() => setIsCreateWizardOpen(true)} className="menu-empty-btn">
              <Plus className="w-4 h-4" />
              Créer mon premier plat
            </Button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="menu-items-grid">
          {filteredItems.map(item => (
            <MenuItemCard
              key={item.id}
              item={item}
              viewMode={viewMode}
              onView={handleViewItem}
              onEdit={handleEditItem}
              onDelete={handleDeleteItem}
            />
          ))}
        </div>
      ) : (
        <div className="menu-items-list">
          <div className="menu-list-header">
            <span className="menu-list-col-icon"></span>
            <span className="menu-list-col-name">Nom</span>
            <span className="menu-list-col-price">Prix</span>
            <span className="menu-list-col-cost">Coût</span>
            <span className="menu-list-col-margin">Marge</span>
            <span className="menu-list-col-status">Statut</span>
            <span className="menu-list-col-actions"></span>
          </div>
          {filteredItems.map(item => (
            <MenuItemCard
              key={item.id}
              item={item}
              viewMode={viewMode}
              onView={handleViewItem}
              onEdit={handleEditItem}
              onDelete={handleDeleteItem}
            />
          ))}
        </div>
      )}

      {/* Create Wizard */}
      <CreateMenuItemWizard
        isOpen={isCreateWizardOpen}
        onClose={() => setIsCreateWizardOpen(false)}
        products={products}
        onCreateItem={handleCreateItem}
        onAddIngredient={addIngredient}
      />

      {/* Detail Modal */}
      <MenuItemDetail
        item={selectedItem}
        isOpen={isDetailOpen}
        onClose={() => { setIsDetailOpen(false); setSelectedItem(null); }}
        onUpdatePrice={handleUpdatePrice}
        getSuggestedPrice={getSuggestedPrice}
        getQuickWins={getQuickWins}
      />
    </div>
  )
}

