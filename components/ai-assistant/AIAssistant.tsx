"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  X,
  Send,
  Sparkles,
  Package,
  ChefHat,
  Loader2,
  Check,
  AlertTriangle,
  RefreshCw,
  Bot,
  User,
  Lightbulb,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useStock } from "@/lib/hooks/use-stock"
import { useMenuItems } from "@/lib/hooks/use-menu-items"
import type { ProductCategory, StockUnit } from "@/lib/database.types"

// ============================================
// TYPES
// ============================================

type AssistantMode = 'stock' | 'menu' | 'margin'
type ProductType = 'fresh' | 'frozen' | 'dry' | 'drink' | 'other'

interface Message {
  id: string
  role: 'assistant' | 'user'
  content: string
  timestamp: Date
  options?: string[]
  isConfirmation?: boolean
}

interface StockContext {
  name: string | null
  productType: ProductType | null
  purchaseUnit: StockUnit | null
  // Pour les packs/cartons
  isPackaged: boolean
  unitsPerPack: number | null
  numberOfPacks: number | null
  // Quantité finale
  totalQuantity: number | null
  totalPrice: number | null
  unitCost: number | null // Coût par unité de base (par g, ml, ou pièce)
  supplier: string | null
  category: ProductCategory | null
  existingProductId: string | null
}

interface RecipeContext {
  menuItemName: string | null
  menuItemId: string | null
  isNewItem: boolean
  ingredients: RecipeIngredient[]
  sellingPrice: number | null
  totalFoodCost: number
}

interface RecipeIngredient {
  stockItemId: string | null
  name: string
  quantityUsed: number
  unit: string
  costPerUnit: number
  costInRecipe: number
  // Context from stock creation
  stockContext?: StockContext
}

interface MarginContext {
  productName: string | null
  productId: string | null
  costPrice: number | null        // Prix d'achat unitaire
  currentSellingPrice: number | null  // Prix de vente actuel
  newSellingPrice: number | null   // Nouveau prix de vente proposé
  targetMarginPercent: number | null  // Marge cible en %
  quantitySold: number | null     // Quantité vendue par période
  period: 'day' | 'week' | 'month'  // Période de référence
  // Calculated values
  currentMarginPercent: number
  currentMarginAmount: number
  currentProfit: number           // Bénéfice actuel sur la période
  suggestedPrice: number | null   // Prix suggéré pour la marge cible
  potentialProfit: number         // Bénéfice potentiel avec nouveau prix
  breakEvenQuantity: number       // Seuil de rentabilité
}

type ConversationPhase = 
  // Stock phases
  | 'stock_init'
  | 'stock_name'
  | 'stock_existing_choice'
  | 'stock_type'
  | 'stock_unit'
  | 'stock_is_packaged'
  | 'stock_pack_details'
  | 'stock_quantity'
  | 'stock_price'
  | 'stock_restock_quantity'
  | 'stock_supplier'
  | 'stock_category'
  | 'stock_confirm'
  | 'stock_link_menu'
  | 'stock_menu_name'
  | 'stock_menu_quantity'
  | 'stock_menu_price'
  | 'stock_menu_confirm'
  // Menu phases
  | 'menu_init'
  | 'menu_dish_name'
  | 'menu_ingredient_name'
  | 'menu_ingredient_existing'
  | 'menu_ingredient_type'
  | 'menu_ingredient_unit'
  | 'menu_ingredient_packaged'
  | 'menu_ingredient_pack_details'
  | 'menu_ingredient_quantity'
  | 'menu_ingredient_price'
  | 'menu_recipe_quantity'
  | 'menu_more_ingredients'
  | 'menu_selling_price'
  | 'menu_confirm'
  // Margin phases
  | 'margin_init'
  | 'margin_select_product'
  | 'margin_has_product'
  | 'margin_cost_price'
  | 'margin_selling_price'
  | 'margin_target_margin'
  | 'margin_quantity_sold'
  | 'margin_analysis'
  | 'margin_optimize'
  | 'margin_apply_changes'
  // Menu analysis phases
  | 'margin_menu_analysis'
  | 'margin_menu_item_detail'
  | 'margin_menu_optimize_item'
  | 'margin_menu_summary'
  // Done
  | 'done'

// ============================================
// CONSTANTS
// ============================================

const PRODUCT_TYPES: { id: ProductType; label: string; emoji: string; examples: string }[] = [
  { id: 'fresh', label: 'Frais', emoji: '🥬', examples: 'salade, viande fraîche, lait' },
  { id: 'frozen', label: 'Surgelé', emoji: '❄️', examples: 'frites, steaks surgelés, glaces' },
  { id: 'dry', label: 'Sec / Épicerie', emoji: '🌾', examples: 'pâtes, riz, farine, huile' },
  { id: 'drink', label: 'Boisson', emoji: '🥤', examples: 'sodas, bières, jus, eau' },
  { id: 'other', label: 'Autre', emoji: '📦', examples: 'emballages, produits d\'entretien' },
]

const STOCK_CATEGORIES: { id: ProductCategory; label: string }[] = [
  { id: 'frais', label: 'Frais' },
  { id: 'surgele', label: 'Surgelés' },
  { id: 'sec', label: 'Sec / Épicerie' },
]

// ============================================
// HELPERS
// ============================================

const generateId = () => Math.random().toString(36).substring(2, 9)

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value)

const formatNumber = (value: number, decimals: number = 2) =>
  new Intl.NumberFormat('fr-FR', { maximumFractionDigits: decimals }).format(value)

const mapTypeToCategory = (type: ProductType): ProductCategory => {
  switch (type) {
    case 'fresh': return 'frais'
    case 'frozen': return 'surgele'
    case 'dry': return 'sec'
    case 'drink': return 'frais'
    default: return 'sec'
  }
}

const getBaseUnit = (unit: StockUnit): string => {
  switch (unit) {
    case 'kg': return 'g'
    case 'L': return 'ml'
    default: return unit
  }
}

const getConversionFactor = (unit: StockUnit): number => {
  switch (unit) {
    case 'kg': return 1000 // 1 kg = 1000 g
    case 'L': return 1000  // 1 L = 1000 ml
    default: return 1
  }
}

// Parse numbers from French/English formats
const parseNumber = (input: string): number | null => {
  const cleaned = input.replace(/[^\d.,]/g, '').replace(',', '.')
  const num = parseFloat(cleaned)
  return isNaN(num) ? null : num
}

// Extract all numbers from a string
const extractNumbers = (input: string): number[] => {
  const matches = input.match(/\d+([.,]\d+)?/g) || []
  return matches.map(m => parseFloat(m.replace(',', '.')))
}

// Detect if user is talking about packs
const detectPackaging = (input: string): boolean => {
  const packKeywords = ['pack', 'carton', 'caisse', 'boîte', 'boite', 'palette', 'lot', 'de']
  return packKeywords.some(kw => input.toLowerCase().includes(kw))
}

// ============================================
// MAIN COMPONENT
// ============================================

interface AIAssistantProps {
  isOpen: boolean
  onClose: () => void
  mode: AssistantMode
}

export function AIAssistant({ isOpen, onClose, mode }: AIAssistantProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Hooks
  const { addProductAndStock, products, fetchStocks } = useStock()
  const { createMenuItem, addIngredient, updateMenuItem, products: menuProducts, fetchMenuItems, menuItems } = useMenuItems()

  // State
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [phase, setPhase] = useState<ConversationPhase>(
    mode === 'stock' ? 'stock_init' : mode === 'menu' ? 'menu_init' : 'margin_init'
  )
  
  // Context
  const [stockCtx, setStockCtx] = useState<StockContext>({
    name: null,
    productType: null,
    purchaseUnit: null,
    isPackaged: false,
    unitsPerPack: null,
    numberOfPacks: null,
    totalQuantity: null,
    totalPrice: null,
    unitCost: null,
    supplier: null,
    category: null,
    existingProductId: null,
  })
  
  const [recipeCtx, setRecipeCtx] = useState<RecipeContext>({
    menuItemName: null,
    menuItemId: null,
    isNewItem: true,
    ingredients: [],
    sellingPrice: null,
    totalFoodCost: 0,
  })

  const [currentIngredient, setCurrentIngredient] = useState<Partial<RecipeIngredient & { stockContext?: Partial<StockContext> }>>({})
  
  const [marginCtx, setMarginCtx] = useState<MarginContext>({
    productName: null,
    productId: null,
    costPrice: null,
    currentSellingPrice: null,
    newSellingPrice: null,
    targetMarginPercent: null,
    quantitySold: null,
    period: 'week',
    currentMarginPercent: 0,
    currentMarginAmount: 0,
    currentProfit: 0,
    suggestedPrice: null,
    potentialProfit: 0,
    breakEvenQuantity: 0,
  })
  
  // Menu analysis state
  const [menuAnalysisIndex, setMenuAnalysisIndex] = useState(0)

  // Scroll & Focus
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100)
  }, [isOpen, messages])

  // Initialize
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      if (mode === 'stock') {
        ask(
          "Salut ! 👋 Je suis là pour t'aider à gérer ton stock intelligemment.\n\n**Quel produit veux-tu ajouter ?**\n\n_Dis-moi simplement le nom (ex: \"steak haché\", \"Coca-Cola\", \"farine\")_"
        )
        setPhase('stock_name')
      } else if (mode === 'menu') {
        ask(
          "Salut ! 👋 Je vais t'aider à créer une recette complète pour ton menu.\n\n**Quel plat ou boisson veux-tu créer ?**\n\n_Ex: \"Burger Classique\", \"Pizza Margherita\", \"Mojito\"..._"
        )
        setPhase('menu_dish_name')
      } else if (mode === 'margin') {
        ask(
          "Salut ! 📊 Je suis ton assistant pour **analyser et optimiser tes marges**.\n\n" +
          "Je peux t'aider à :\n" +
          "• 🍽️ Analyser tout ton menu (ingrédients + marges)\n" +
          "• 📦 Analyser un produit spécifique\n" +
          "• 🧮 Faire un calcul rapide\n\n" +
          "**Que veux-tu faire ?**",
          ['🍽️ Analyser mon menu', '📦 Analyser un produit', '🧮 Calcul rapide']
        )
        setPhase('margin_select_product')
      }
    }
  }, [isOpen])

  // ============================================
  // MESSAGE HELPERS
  // ============================================

  const ask = (content: string, options?: string[]) => {
    setMessages(prev => [...prev, {
      id: generateId(),
      role: 'assistant',
      content,
      timestamp: new Date(),
      options,
    }])
  }

  const userSays = (content: string) => {
    setMessages(prev => [...prev, {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
    }])
  }

  // ============================================
  // STOCK FLOW - INTELLIGENT LOGIC
  // ============================================

  const processStockFlow = async (input: string) => {
    const trimmed = input.trim()
    const lowerInput = trimmed.toLowerCase()

    switch (phase) {
      case 'stock_name': {
        // Check for existing product
        const existing = products.find(p => 
          p.name.toLowerCase() === lowerInput ||
          p.name.toLowerCase().includes(lowerInput) ||
          lowerInput.includes(p.name.toLowerCase())
        )

        if (existing) {
          setStockCtx({ ...stockCtx, name: existing.name, existingProductId: existing.id })
          ask(
            `J'ai trouvé **"${existing.name}"** dans ton stock existant.\n\nTu veux :\n• **Réapprovisionner** ce produit (ajouter du stock)\n• **Créer un nouveau** produit différent`,
            ['Réapprovisionner', 'Créer un nouveau']
          )
          setPhase('stock_existing_choice')
        } else {
          setStockCtx({ ...stockCtx, name: trimmed })
          ask(
            `Parfait, on ajoute **"${trimmed}"** ! 📦\n\n**De quel type de produit s'agit-il ?**`,
            PRODUCT_TYPES.map(t => `${t.emoji} ${t.label}`)
          )
          setPhase('stock_type')
        }
        break
      }

      case 'stock_existing_choice': {
        if (lowerInput.includes('réappro') || lowerInput.includes('ajouter') || lowerInput.includes('stock')) {
          // Restocking existing product - smart flow
          const existing = products.find(p => p.id === stockCtx.existingProductId)
          if (existing) {
            const productType = existing.category === 'frais' ? 'fresh' : existing.category === 'surgele' ? 'frozen' : 'dry'
            
            setStockCtx({
              ...stockCtx,
              productType,
              purchaseUnit: existing.unit,
              category: existing.category,
            })
            
            // Intelligent question based on product type
            const unitLabel = existing.unit === 'kg' ? 'kilos' 
              : existing.unit === 'L' ? 'litres' 
              : existing.unit === 'g' ? 'grammes' 
              : 'unités'
            
            ask(
              `Parfait ! On réapprovisionne **"${existing.name}"** 📦\n\n` +
              `La dernière fois, tu l'achetais en ${unitLabel}.\n\n` +
              `**Combien as-tu acheté cette fois-ci ?**\n\n` +
              `_Ex: "10 kg à 85€", "3 packs de 24 à 45€", "500g pour 12€"..._`
            )
            setPhase('stock_restock_quantity')
          }
        } else {
          // Create new product
          setStockCtx({ ...stockCtx, existingProductId: null, name: null })
          ask(
            `D'accord, on crée un nouveau produit.\n\n**Comment veux-tu l'appeler ?**`
          )
          setPhase('stock_name')
        }
        break
      }
      
      case 'stock_restock_quantity': {
        // Smart parsing: detect if it's "quantity at price" or "packs of units at price"
        const numbers = extractNumbers(input)
        const hasPackKeyword = detectPackaging(input)
        
        if (hasPackKeyword && numbers.length >= 3) {
          // Format: "3 packs de 24 à 45€"
          const [packs, unitsPerPack, price] = numbers
          const totalUnits = packs * unitsPerPack
          const unitCost = price / totalUnits
          
          setStockCtx({
            ...stockCtx,
            isPackaged: true,
            numberOfPacks: packs,
            unitsPerPack,
            totalQuantity: totalUnits,
            totalPrice: price,
            unitCost,
            purchaseUnit: 'pièces',
          })
          
          ask(
            `Compris ! 📊\n\n` +
            `• ${packs} packs × ${unitsPerPack} = **${totalUnits} unités**\n` +
            `• Prix total : ${formatCurrency(price)}\n` +
            `• Coût unitaire : **${formatCurrency(unitCost)}/unité**\n\n` +
            `**Chez quel fournisseur ?** _(ou "aucun")_`
          )
          setPhase('stock_supplier')
        } else if (numbers.length >= 2) {
          // Format: "10 kg à 85€" or "500g pour 12€"
          const [qty, price] = numbers
          const unit = stockCtx.purchaseUnit || 'pièces'
          const unitCost = price / qty
          
          setStockCtx({
            ...stockCtx,
            isPackaged: false,
            totalQuantity: qty,
            totalPrice: price,
            unitCost,
          })
          
          ask(
            `Parfait ! 📊\n\n` +
            `• Quantité : **${formatNumber(qty, 0)} ${unit}**\n` +
            `• Prix total : ${formatCurrency(price)}\n` +
            `• Coût unitaire : **${formatCurrency(unitCost)}/${unit}**\n\n` +
            `**Chez quel fournisseur ?** _(ou "aucun")_`
          )
          setPhase('stock_supplier')
        } else if (numbers.length === 1) {
          // Only quantity, need price
          const qty = numbers[0]
          setStockCtx({ ...stockCtx, totalQuantity: qty })
          
          ask(
            `OK, ${formatNumber(qty, 0)} ${stockCtx.purchaseUnit || 'unités'}.\n\n` +
            `**Tu as payé combien au total ?**\n\n` +
            `_En euros (ex: 45, 89.90, 125)_`
          )
          setPhase('stock_price')
        } else {
          ask(
            `Je n'ai pas compris. Donne-moi la quantité et le prix.\n\n` +
            `_Ex: "10 kg à 85€", "3 packs de 24 à 45€", "24 unités pour 36€"_`
          )
        }
        break
      }

      case 'stock_type': {
        const type = PRODUCT_TYPES.find(t => 
          lowerInput.includes(t.label.toLowerCase()) ||
          lowerInput.includes(t.id) ||
          (t.id === 'fresh' && lowerInput.includes('frais')) ||
          (t.id === 'frozen' && (lowerInput.includes('surgel') || lowerInput.includes('❄️'))) ||
          (t.id === 'dry' && (lowerInput.includes('sec') || lowerInput.includes('épicerie'))) ||
          (t.id === 'drink' && (lowerInput.includes('boisson') || lowerInput.includes('🥤'))) ||
          (t.id === 'other' && lowerInput.includes('autre'))
        )

        if (!type) {
          ask(
            "Hmm, je n'ai pas compris. Quel type correspond le mieux ?",
            PRODUCT_TYPES.map(t => `${t.emoji} ${t.label}`)
          )
          return
        }

        setStockCtx({ ...stockCtx, productType: type.id, category: mapTypeToCategory(type.id) })

        // Intelligent next question based on product type
        if (type.id === 'drink') {
          ask(
            `🥤 **Les boissons** - Comment achètes-tu **"${stockCtx.name}"** ?\n\n` +
            `• **Pack/carton** → ex: "3 packs de 24 canettes"\n` +
            `• **À l'unité** → bouteilles ou canettes individuelles\n` +
            `• **En volume** → fûts, bag-in-box`,
            ['En pack/carton', 'À l\'unité', 'En volume (litres)']
          )
          setPhase('stock_is_packaged')
        } else if (type.id === 'frozen') {
          ask(
            `❄️ **Produit surgelé** - En quelle unité achètes-tu **"${stockCtx.name}"** ?\n\n` +
            `_Les surgelés sont souvent en kg ou en pièces_`,
            ['Kilos (kg)', 'Grammes (g)', 'Pièces/Unités', 'Cartons']
          )
          setPhase('stock_unit')
        } else if (type.id === 'fresh') {
          ask(
            `🥬 **Produit frais** - En quelle unité ?\n\n` +
            `_Ex: viande au kg, légumes au kg ou à la pièce..._`,
            ['Kilos (kg)', 'Grammes (g)', 'Pièces/Unités', 'Litres (L)']
          )
          setPhase('stock_unit')
        } else if (type.id === 'dry') {
          ask(
            `🌾 **Épicerie/Sec** - En quelle unité ?\n\n` +
            `_Pâtes/riz au kg, huiles au litre, bocaux à la pièce..._`,
            ['Kilos (kg)', 'Grammes (g)', 'Litres (L)', 'Pièces/Unités']
          )
          setPhase('stock_unit')
        } else {
          ask(
            `📦 **Autre produit** - Comment l'achètes-tu ?`,
            ['Kilos (kg)', 'Grammes (g)', 'Litres (L)', 'Pièces/Unités', 'Cartons/Packs']
          )
          setPhase('stock_unit')
        }
        break
      }

      case 'stock_unit': {
        let unit: StockUnit | null = null
        let isPackaged = false
        
        if (lowerInput.includes('kilo') || lowerInput.includes('kg')) unit = 'kg'
        else if (lowerInput.includes('gramme') || lowerInput.includes(' g')) unit = 'g'
        else if (lowerInput.includes('litre') || lowerInput.includes(' l')) unit = 'L'
        else if (lowerInput.includes('carton') || lowerInput.includes('pack')) {
          unit = 'pièces'
          isPackaged = true
        }
        else if (lowerInput.includes('pièce') || lowerInput.includes('unité')) unit = 'pièces'

        if (!unit) {
          ask(
            "Hmm, je n'ai pas bien compris. Choisis parmi :",
            ['Kilos (kg)', 'Grammes (g)', 'Litres (L)', 'Pièces/Unités']
          )
          return
        }

        setStockCtx({ ...stockCtx, purchaseUnit: unit, isPackaged })

        // If they selected cartons/packs, go to pack details
        if (isPackaged) {
          ask(
            `**Décris ton achat :**\n\n_Ex: "3 cartons de 24", "2 packs de 6", "1 caisse de 12"_`
          )
          setPhase('stock_pack_details')
          return
        }

        // Smart question about quantity based on unit
        const unitLabel = unit === 'kg' ? 'kilos' 
          : unit === 'g' ? 'grammes' 
          : unit === 'L' ? 'litres' 
          : 'pièces'
        
        const examples = unit === 'kg' ? '10, 25, 5.5' 
          : unit === 'g' ? '500, 1000, 250' 
          : unit === 'L' ? '5, 10, 20'
          : '50, 100, 24'

        ask(
          `**Combien de ${unitLabel} as-tu acheté ?**\n\n_Juste le nombre (ex: ${examples})_`
        )
        setPhase('stock_quantity')
        break
      }

      case 'stock_is_packaged': {
        if (lowerInput.includes('pack') || lowerInput.includes('carton')) {
          setStockCtx({ ...stockCtx, isPackaged: true })
          ask(
            `**Décris-moi ton achat en détail :**\n\n_Ex: "3 packs de 24 canettes", "2 cartons de 6 bouteilles", "1 caisse de 12"..._`
          )
          setPhase('stock_pack_details')
        } else if (lowerInput.includes('unité') || lowerInput.includes('bouteille') || lowerInput.includes('canette')) {
          setStockCtx({ ...stockCtx, isPackaged: false, purchaseUnit: 'pièces' })
          ask(
            `**Combien d'unités (bouteilles/canettes) as-tu acheté ?**\n\n_Juste le nombre (ex: 48, 24, 12)_`
          )
          setPhase('stock_quantity')
        } else if (lowerInput.includes('litre') || lowerInput.includes('fût') || lowerInput.includes('bib')) {
          setStockCtx({ ...stockCtx, isPackaged: false, purchaseUnit: 'L' })
          ask(
            `**Combien de litres as-tu acheté ?**\n\n_Juste le nombre (ex: 20, 30, 50)_`
          )
          setPhase('stock_quantity')
        } else if (lowerInput.includes('vrac')) {
          ask(
            `**En quelle unité ?**`,
            ['Kilos (kg)', 'Grammes (g)', 'Litres (L)', 'Pièces/Unités']
          )
          setPhase('stock_unit')
        } else {
          ask(
            "Je n'ai pas compris. Tu achètes en pack/carton ou en vrac ?",
            ['En pack/carton', 'En vrac']
          )
        }
        break
      }

      case 'stock_pack_details': {
        // Parse "3 packs de 24" or "2 cartons de 6"
        const numbers = extractNumbers(input)
        
        if (numbers.length >= 2) {
          const [packs, unitsPerPack] = numbers
          const totalUnits = packs * unitsPerPack
          
          setStockCtx({
            ...stockCtx,
            numberOfPacks: packs,
            unitsPerPack: unitsPerPack,
            totalQuantity: totalUnits,
            purchaseUnit: 'pièces',
          })

          ask(
            `Compris ! 📦\n\n• **${packs} pack${packs > 1 ? 's' : ''}** de **${unitsPerPack} unités**\n• = **${totalUnits} unités au total**\n\n**Quel est le prix TOTAL que tu as payé pour tout ça ?**\n\n_En euros (ex: 45, 89.90, 125)_`
          )
          setPhase('stock_price')
        } else if (numbers.length === 1) {
          // Only got one number, ask for clarification
          ask(
            `J'ai compris ${numbers[0]}, mais j'ai besoin de plus de détails.\n\n**C'est ${numbers[0]} packs de combien d'unités chacun ?**\n\n_Ex: "de 24", "de 6 bouteilles"..._`
          )
        } else {
          ask(
            `Je n'ai pas compris. Dis-moi le nombre de packs ET le nombre d'unités par pack.\n\n_Ex: "3 packs de 24", "2 cartons de 6"_`
          )
        }
        break
      }

      case 'stock_quantity': {
        const quantity = parseNumber(input)
        
        if (!quantity || quantity <= 0) {
          ask(`Je n'ai pas compris la quantité. Donne-moi juste un nombre.\n\n_Ex: 10, 25, 100..._`)
          return
        }

        setStockCtx({ ...stockCtx, totalQuantity: quantity })

        const unit = stockCtx.purchaseUnit || 'unités'
        ask(
          `Noté : **${formatNumber(quantity, quantity % 1 === 0 ? 0 : 2)} ${unit}** ✓\n\n**Quel est le prix TOTAL que tu as payé ?**\n\n_En euros (ex: 45, 89.90, 125)_`
        )
        setPhase('stock_price')
        break
      }

      case 'stock_price': {
        const price = parseNumber(input)
        
        if (!price || price <= 0) {
          ask(`Je n'ai pas compris le prix. Donne-moi juste un nombre en euros.\n\n_Ex: 45, 89.90, 125_`)
          return
        }

        // Calculate unit cost intelligently
        const totalQty = stockCtx.totalQuantity || 1
        const unitCost = price / totalQty
        
        setStockCtx({ ...stockCtx, totalPrice: price, unitCost })

        // Build smart summary
        const unit = stockCtx.purchaseUnit || 'unités'
        let summary = `Prix total : **${formatCurrency(price)}** ✓\n\n`
        
        if (stockCtx.isPackaged && stockCtx.numberOfPacks && stockCtx.unitsPerPack) {
          const costPerPack = price / stockCtx.numberOfPacks
          summary += `📊 **Calculs automatiques :**\n`
          summary += `• Coût par pack : ${formatCurrency(costPerPack)}\n`
          summary += `• Coût par unité : ${formatCurrency(unitCost)}\n\n`
        } else {
          summary += `📊 **Coût unitaire :** ${formatCurrency(unitCost)}/${unit === 'pièces' ? 'unité' : unit}\n\n`
        }

        ask(
          summary + `**Chez quel fournisseur as-tu acheté ?**\n\n_Tu peux répondre "aucun" ou donner le nom_`
        )
        setPhase('stock_supplier')
        break
      }

      case 'stock_supplier': {
        const skipWords = ['aucun', 'non', 'pas', 'skip', 'passer', 'rien', 'je sais pas']
        const hasSupplier = !skipWords.some(w => lowerInput.includes(w))
        
        if (hasSupplier && trimmed.length > 1) {
          setStockCtx({ ...stockCtx, supplier: trimmed })
        }

        // Suggest category based on product type
        const suggestedCategory = STOCK_CATEGORIES.find(c => c.id === stockCtx.category)
        
        ask(
          `**Dans quelle catégorie ranger "${stockCtx.name}" ?**\n\n_Je suggère : ${suggestedCategory?.label || 'Sec'}_`,
          STOCK_CATEGORIES.map(c => c.label)
        )
        setPhase('stock_category')
        break
      }

      case 'stock_category': {
        const category = STOCK_CATEGORIES.find(c => 
          lowerInput.includes(c.label.toLowerCase()) ||
          lowerInput.includes(c.id)
        )
        
        const finalCategory = category?.id || stockCtx.category || 'sec'
        setStockCtx({ ...stockCtx, category: finalCategory })

        // Build final confirmation with ALL details
        const unit = stockCtx.purchaseUnit || 'unités'
        const qty = stockCtx.totalQuantity || 0
        const price = stockCtx.totalPrice || 0
        const unitCost = stockCtx.unitCost || 0
        const type = PRODUCT_TYPES.find(t => t.id === stockCtx.productType)
        const cat = STOCK_CATEGORIES.find(c => c.id === finalCategory)

        let summary = `📋 **Récapitulatif complet :**\n\n`
        summary += `• **Produit :** ${stockCtx.name}\n`
        summary += `• **Type :** ${type?.emoji} ${type?.label}\n`
        summary += `• **Catégorie :** ${cat?.label}\n`
        
        if (stockCtx.isPackaged && stockCtx.numberOfPacks && stockCtx.unitsPerPack) {
          summary += `• **Quantité :** ${stockCtx.numberOfPacks} packs × ${stockCtx.unitsPerPack} = **${qty} unités**\n`
        } else {
          summary += `• **Quantité :** ${formatNumber(qty, 0)} ${unit}\n`
        }
        
        summary += `• **Prix payé :** ${formatCurrency(price)}\n`
        summary += `• **Coût unitaire :** ${formatCurrency(unitCost)}/${unit === 'pièces' ? 'unité' : unit}\n`
        
        if (stockCtx.supplier) {
          summary += `• **Fournisseur :** ${stockCtx.supplier}\n`
        }

        summary += `\n**Tu confirmes ?**`

        ask(summary, ['✅ Confirmer', '❌ Annuler'])
        setPhase('stock_confirm')
        break
      }

      case 'stock_confirm': {
        if (lowerInput.includes('annuler') || lowerInput.includes('non') || lowerInput.includes('❌')) {
          ask("Pas de problème, j'annule tout. Tu peux recommencer quand tu veux ! 👋")
          setPhase('done')
          return
        }

        if (lowerInput.includes('confirmer') || lowerInput.includes('oui') || lowerInput.includes('✅')) {
          setIsProcessing(true)
          
          try {
            const result = await addProductAndStock(
              {
                name: stockCtx.name!,
                category: stockCtx.category!,
                unit: stockCtx.purchaseUnit!,
                icon: PRODUCT_TYPES.find(t => t.id === stockCtx.productType)?.emoji,
              },
              {
                quantity: stockCtx.totalQuantity!,
                unit_price: stockCtx.unitCost!,
              }
            )

            if (result.success) {
              await fetchStocks()
              
              ask(
                `✅ **"${stockCtx.name}" ajouté au stock avec succès !**\n\n` +
                `Tu utilises ce produit dans un plat de ton menu ?\n\n` +
                `_Si oui, dis-moi le nom du plat. Sinon, réponds "non"._`
              )
              setPhase('stock_link_menu')
            } else {
              ask(`❌ Erreur : ${result.error}\n\nVeux-tu réessayer ?`, ['Réessayer', 'Annuler'])
            }
          } catch (err) {
            ask("❌ Une erreur s'est produite. Veux-tu réessayer ?", ['Réessayer', 'Annuler'])
          } finally {
            setIsProcessing(false)
          }
        }
        break
      }

      case 'stock_link_menu': {
        const skipWords = ['non', 'pas', 'skip', 'aucun', 'passer']
        if (skipWords.some(w => lowerInput.includes(w))) {
          ask(
            `Parfait ! "${stockCtx.name}" est maintenant dans ton stock. 🎉\n\n` +
            `_Tu peux fermer cette fenêtre ou ajouter un autre produit._`
          )
          setPhase('done')
          return
        }

        // User wants to link to menu
        setRecipeCtx({
          ...recipeCtx,
          menuItemName: trimmed,
          ingredients: [{
            stockItemId: stockCtx.existingProductId,
            name: stockCtx.name!,
            quantityUsed: 0,
            unit: getBaseUnit(stockCtx.purchaseUnit!),
            costPerUnit: stockCtx.unitCost! / getConversionFactor(stockCtx.purchaseUnit!),
            costInRecipe: 0,
          }],
        })

        const baseUnit = getBaseUnit(stockCtx.purchaseUnit!)
        const unitLabel = baseUnit === 'g' ? 'grammes' : baseUnit === 'ml' ? 'millilitres' : baseUnit

        ask(
          `Super ! On va lier **"${stockCtx.name}"** au plat **"${trimmed}"**.\n\n` +
          `**Combien de ${unitLabel} utilises-tu pour UNE portion de "${trimmed}" ?**\n\n` +
          `_Juste le nombre (ex: 150, 30, 200)_`
        )
        setPhase('stock_menu_quantity')
        break
      }

      case 'stock_menu_quantity': {
        const quantity = parseNumber(input)
        
        if (!quantity || quantity <= 0) {
          ask(`Donne-moi juste un nombre.\n\n_Ex: 150, 30, 200..._`)
          return
        }

        // Calculate cost in recipe
        const costPerUnit = (stockCtx.unitCost || 0) / getConversionFactor(stockCtx.purchaseUnit!)
        const costInRecipe = quantity * costPerUnit
        const baseUnit = getBaseUnit(stockCtx.purchaseUnit!)

        const updatedIngredients = [{
          stockItemId: stockCtx.existingProductId,
          name: stockCtx.name!,
          quantityUsed: quantity,
          unit: baseUnit,
          costPerUnit,
          costInRecipe,
        }]

        setRecipeCtx({
          ...recipeCtx,
          ingredients: updatedIngredients,
          totalFoodCost: costInRecipe,
        })

        ask(
          `Noté : **${quantity} ${baseUnit}** de "${stockCtx.name}" par portion\n\n` +
          `📊 Coût de cet ingrédient : **${formatCurrency(costInRecipe)}** par plat\n\n` +
          `**À combien vends-tu "${recipeCtx.menuItemName}" TTC ?**\n\n` +
          `_Prix en euros (ex: 12.90, 15, 8.50)_`
        )
        setPhase('stock_menu_price')
        break
      }

      case 'stock_menu_price': {
        const price = parseNumber(input)
        
        if (!price || price <= 0) {
          ask(`Donne-moi un prix en euros.\n\n_Ex: 12.90, 15, 8.50_`)
          return
        }

        const foodCost = recipeCtx.totalFoodCost
        const marginAmount = price - foodCost
        const marginPercent = (marginAmount / price) * 100

        setRecipeCtx({ ...recipeCtx, sellingPrice: price })

        const marginEmoji = marginPercent >= 70 ? '🟢' : marginPercent >= 50 ? '🟡' : '🔴'
        
        let msg = `📊 **Analyse de "${recipeCtx.menuItemName}" :**\n\n`
        msg += `• Coût matière : ${formatCurrency(foodCost)}\n`
        msg += `• Prix de vente : ${formatCurrency(price)}\n`
        msg += `• **Marge brute : ${formatCurrency(marginAmount)} (${marginPercent.toFixed(0)}%)** ${marginEmoji}\n\n`

        if (marginPercent < 60) {
          const suggestedPrice = foodCost / 0.3 // 70% margin
          msg += `⚠️ **Attention** : Ta marge est faible !\n`
          msg += `💡 Pour 70% de marge, vends à **${formatCurrency(suggestedPrice)}**\n\n`
        }

        msg += `**On crée ce plat dans le Menu ?**`

        ask(msg, ['✅ Créer le plat', '💡 Optimiser le prix', '❌ Annuler'])
        setPhase('stock_menu_confirm')
        break
      }

      case 'stock_menu_confirm': {
        if (lowerInput.includes('annuler') || lowerInput.includes('❌')) {
          ask("OK, je n'ajoute pas au menu. Le produit reste dans ton stock. 👍")
          setPhase('done')
          return
        }

        if (lowerInput.includes('optimiser') || lowerInput.includes('💡')) {
          const foodCost = recipeCtx.totalFoodCost
          const price70 = foodCost / 0.3
          const price65 = foodCost / 0.35
          
          ask(
            `💡 **Prix suggérés pour maximiser ta marge :**\n\n` +
            `• Pour **70% de marge** → ${formatCurrency(price70)}\n` +
            `• Pour **65% de marge** → ${formatCurrency(price65)}\n\n` +
            `Quel prix veux-tu appliquer ?`,
            [`${formatCurrency(price70)} (70%)`, `${formatCurrency(price65)} (65%)`, 'Garder mon prix']
          )
          return
        }

        // Handle price selection from suggestions
        const priceMatch = parseNumber(input)
        if (priceMatch && priceMatch !== recipeCtx.sellingPrice) {
          setRecipeCtx({ ...recipeCtx, sellingPrice: priceMatch })
        }

        if (lowerInput.includes('créer') || lowerInput.includes('✅') || lowerInput.includes('garder') || priceMatch) {
          setIsProcessing(true)
          
          try {
            const finalPrice = priceMatch || recipeCtx.sellingPrice!
            
            const result = await createMenuItem({
              name: recipeCtx.menuItemName!,
              category: 'plat',
              selling_price: finalPrice,
              target_margin_percent: 70,
            })

            if (result.success && result.data) {
              const menuItemId = (result.data as { id: string }).id
              
              const product = products.find(p => p.name === stockCtx.name)
              if (product && recipeCtx.ingredients[0]) {
                await addIngredient({
                  menu_item_id: menuItemId,
                  product_id: product.id,
                  quantity: recipeCtx.ingredients[0].quantityUsed,
                  unit: recipeCtx.ingredients[0].unit,
                })
              }

              await fetchMenuItems()
              
              const margin = ((finalPrice - recipeCtx.totalFoodCost) / finalPrice) * 100
              
              ask(
                `✅ **"${recipeCtx.menuItemName}" créé dans le Menu !**\n\n` +
                `• Prix : ${formatCurrency(finalPrice)}\n` +
                `• Marge : ${margin.toFixed(0)}%\n\n` +
                `Tu peux ajouter d'autres ingrédients depuis l'onglet Menu. 🎉`
              )
            } else {
              ask(`❌ Erreur : ${result.error}`)
            }
          } catch (err) {
            ask("❌ Une erreur s'est produite.")
          } finally {
            setIsProcessing(false)
          }
          
          setPhase('done')
        }
        break
      }
    }
  }

  // ============================================
  // MENU FLOW - INTELLIGENT LOGIC
  // ============================================

  const processMenuFlow = async (input: string) => {
    const trimmed = input.trim()
    const lowerInput = trimmed.toLowerCase()

    switch (phase) {
      case 'menu_dish_name': {
        setRecipeCtx({
          ...recipeCtx,
          menuItemName: trimmed,
          isNewItem: true,
          ingredients: [],
          totalFoodCost: 0,
        })

        ask(
          `Parfait ! On crée la recette de **"${trimmed}"** 🍽️\n\n` +
          `**Quel est le PREMIER ingrédient ?**\n\n` +
          `_Ex: steak haché, fromage, pain, tomates..._`
        )
        setPhase('menu_ingredient_name')
        break
      }

      case 'menu_ingredient_name': {
        // Smart search: check for exact match, partial match, or similar names
        const exactMatch = products.find(p => p.name.toLowerCase() === lowerInput)
        const partialMatch = products.find(p => 
          p.name.toLowerCase().includes(lowerInput) ||
          lowerInput.includes(p.name.toLowerCase())
        )
        const existing = exactMatch || partialMatch

        if (existing) {
          // Get the unit cost from the stock if available
          const baseUnit = getBaseUnit(existing.unit)
          const unitLabel = baseUnit === 'g' ? 'grammes' 
            : baseUnit === 'ml' ? 'millilitres' 
            : existing.unit === 'pièces' ? 'unité(s)'
            : baseUnit

          // Calculate cost per base unit
          // Note: existing.unit_price should be per purchase unit (kg, L, etc.)
          // We need to convert to base unit (g, ml) for recipe calculations
          
          setCurrentIngredient({
            stockItemId: existing.id,
            name: existing.name,
            unit: baseUnit,
            costPerUnit: 0, // Will be calculated based on stock data
            stockContext: {
              purchaseUnit: existing.unit,
            },
          })

          ask(
            `✅ **"${existing.name}"** trouvé dans ton stock !\n\n` +
            `**Quelle quantité utilises-tu pour UNE portion de "${recipeCtx.menuItemName}" ?**\n\n` +
            `_En ${unitLabel} (ex: 150, 30, 2, 0.5...)_`
          )
          setPhase('menu_recipe_quantity')
        } else {
          setCurrentIngredient({ name: trimmed, stockContext: {} })
          
          ask(
            `🆕 **"${trimmed}"** n'est pas dans ton stock.\n\n` +
            `On va l'ajouter en même temps que la recette !\n\n` +
            `**Quel type de produit est-ce ?**`,
            PRODUCT_TYPES.map(t => `${t.emoji} ${t.label}`)
          )
          setPhase('menu_ingredient_type')
        }
        break
      }

      case 'menu_ingredient_type': {
        const type = PRODUCT_TYPES.find(t => 
          lowerInput.includes(t.label.toLowerCase())
        )

        if (!type) {
          ask("Choisis le type :", PRODUCT_TYPES.map(t => `${t.emoji} ${t.label}`))
          return
        }

        setCurrentIngredient({
          ...currentIngredient,
          stockContext: { ...currentIngredient.stockContext, productType: type.id },
        })

        if (type.id === 'drink') {
          ask(
            `Tu achètes "${currentIngredient.name}" **en pack ou à l'unité** ?`,
            ['En pack/carton', 'À l\'unité', 'Au litre']
          )
          setPhase('menu_ingredient_packaged')
        } else {
          ask(
            `**En quelle unité achètes-tu "${currentIngredient.name}" ?**`,
            ['Kilos (kg)', 'Grammes (g)', 'Litres (L)', 'Pièces']
          )
          setPhase('menu_ingredient_unit')
        }
        break
      }

      case 'menu_ingredient_unit': {
        let unit: StockUnit | null = null
        
        if (lowerInput.includes('kilo') || lowerInput.includes('kg')) unit = 'kg'
        else if (lowerInput.includes('gramme') || lowerInput.includes(' g')) unit = 'g'
        else if (lowerInput.includes('litre') || lowerInput.includes(' l')) unit = 'L'
        else if (lowerInput.includes('pièce') || lowerInput.includes('unité')) unit = 'pièces'

        if (!unit) {
          ask("Choisis : Kilos, Grammes, Litres, ou Pièces")
          return
        }

        setCurrentIngredient({
          ...currentIngredient,
          unit: getBaseUnit(unit),
          stockContext: { ...currentIngredient.stockContext, purchaseUnit: unit, isPackaged: false },
        })

        ask(
          `**Combien de ${unit} as-tu acheté et à quel prix ?**\n\n` +
          `_Dis-moi les deux en une fois (ex: "10 kg à 85€", "500g pour 12€")_`
        )
        setPhase('menu_ingredient_quantity')
        break
      }

      case 'menu_ingredient_packaged': {
        if (lowerInput.includes('pack') || lowerInput.includes('carton')) {
          setCurrentIngredient({
            ...currentIngredient,
            stockContext: { ...currentIngredient.stockContext, isPackaged: true, purchaseUnit: 'pièces' },
          })
          ask(
            `**Décris ton achat :**\n\n` +
            `_Ex: "3 packs de 24 à 45€", "2 cartons de 6 pour 18€"_`
          )
          setPhase('menu_ingredient_pack_details')
        } else if (lowerInput.includes('unité')) {
          setCurrentIngredient({
            ...currentIngredient,
            unit: 'pièces',
            stockContext: { ...currentIngredient.stockContext, isPackaged: false, purchaseUnit: 'pièces' },
          })
          ask(
            `**Combien d'unités as-tu acheté et à quel prix ?**\n\n` +
            `_Ex: "24 bouteilles à 36€", "48 canettes pour 40€"_`
          )
          setPhase('menu_ingredient_quantity')
        } else {
          setCurrentIngredient({
            ...currentIngredient,
            unit: 'ml',
            stockContext: { ...currentIngredient.stockContext, isPackaged: false, purchaseUnit: 'L' },
          })
          ask(
            `**Combien de litres as-tu acheté et à quel prix ?**\n\n` +
            `_Ex: "20L à 50€", "30 litres pour 75€"_`
          )
          setPhase('menu_ingredient_quantity')
        }
        break
      }

      case 'menu_ingredient_pack_details': {
        const numbers = extractNumbers(input)
        
        if (numbers.length >= 3) {
          const [packs, unitsPerPack, price] = numbers
          const totalUnits = packs * unitsPerPack
          const unitCost = price / totalUnits

          setCurrentIngredient({
            ...currentIngredient,
            costPerUnit: unitCost,
            unit: 'pièces',
            stockContext: {
              ...currentIngredient.stockContext,
              numberOfPacks: packs,
              unitsPerPack: unitsPerPack,
              totalQuantity: totalUnits,
              totalPrice: price,
              unitCost: unitCost,
            },
          })

          ask(
            `Compris ! ${packs} packs × ${unitsPerPack} = **${totalUnits} unités** à ${formatCurrency(price)}\n` +
            `📊 Coût unitaire : **${formatCurrency(unitCost)}/unité**\n\n` +
            `**Combien d'unités utilises-tu pour UNE portion de "${recipeCtx.menuItemName}" ?**\n\n` +
            `_Ex: 1, 2, 0.5 (si tu sers un demi)_`
          )
          setPhase('menu_recipe_quantity')
        } else if (numbers.length === 2) {
          ask(
            `J'ai besoin du nombre de packs, d'unités par pack, ET du prix.\n\n` +
            `_Ex: "3 packs de 24 à 45€"_`
          )
        } else {
          ask(`Donne-moi le détail complet.\n\n_Ex: "3 packs de 24 à 45€"_`)
        }
        break
      }

      case 'menu_ingredient_quantity': {
        const numbers = extractNumbers(input)
        
        if (numbers.length >= 2) {
          const [qty, price] = numbers
          const purchaseUnit = currentIngredient.stockContext?.purchaseUnit || 'pièces'
          const unitCost = price / qty

          setCurrentIngredient({
            ...currentIngredient,
            costPerUnit: unitCost / getConversionFactor(purchaseUnit),
            stockContext: {
              ...currentIngredient.stockContext,
              totalQuantity: qty,
              totalPrice: price,
              unitCost: unitCost,
            },
          })

          const baseUnit = getBaseUnit(purchaseUnit)
          const unitLabel = baseUnit === 'g' ? 'grammes' : baseUnit === 'ml' ? 'millilitres' : baseUnit

          ask(
            `Parfait ! ${formatNumber(qty, 0)} ${purchaseUnit} à ${formatCurrency(price)}\n` +
            `📊 Coût : **${formatCurrency(unitCost)}/${purchaseUnit}**\n\n` +
            `**Combien de ${unitLabel} pour UNE portion de "${recipeCtx.menuItemName}" ?**\n\n` +
            `_Juste le nombre_`
          )
          setPhase('menu_recipe_quantity')
        } else {
          ask(`Donne-moi la quantité ET le prix.\n\n_Ex: "10 kg à 85€", "500g pour 12€"_`)
        }
        break
      }

      case 'menu_recipe_quantity': {
        const quantity = parseNumber(input)
        
        if (!quantity || quantity < 0) {
          ask(`Je n'ai pas compris. Donne-moi juste un nombre.\n\n_Ex: 150, 30, 2, 0.5_`)
          return
        }

        // Calculate cost per base unit
        let costPerUnit = currentIngredient.costPerUnit || 0
        
        // If we have stock context from creating a new product, use that
        if (currentIngredient.stockContext?.unitCost && currentIngredient.stockContext?.purchaseUnit) {
          costPerUnit = currentIngredient.stockContext.unitCost / 
                        getConversionFactor(currentIngredient.stockContext.purchaseUnit)
        }
        
        // If cost is still 0 and we have an existing product, we need to estimate
        // For now, we'll set a placeholder and let the user know
        const hasCost = costPerUnit > 0
        
        const costInRecipe = quantity * costPerUnit
        const unit = currentIngredient.unit || 'g'
        const unitLabel = unit === 'g' ? 'grammes' 
          : unit === 'ml' ? 'ml' 
          : unit === 'pièces' ? 'unité(s)' 
          : unit

        const newIngredient: RecipeIngredient = {
          stockItemId: currentIngredient.stockItemId || null,
          name: currentIngredient.name!,
          quantityUsed: quantity,
          unit,
          costPerUnit,
          costInRecipe,
        }

        // Add to context
        const updatedIngredients = [...recipeCtx.ingredients, newIngredient]
        const newTotalCost = updatedIngredients.reduce((sum, ing) => sum + ing.costInRecipe, 0)

        setRecipeCtx({
          ...recipeCtx,
          ingredients: updatedIngredients,
          totalFoodCost: newTotalCost,
        })

        // If new product, create it in stock
        if (!currentIngredient.stockItemId && currentIngredient.stockContext?.totalQuantity) {
          const ctx = currentIngredient.stockContext
          try {
            const result = await addProductAndStock(
              {
                name: currentIngredient.name!,
                category: mapTypeToCategory(ctx.productType || 'other'),
                unit: ctx.purchaseUnit!,
              },
              {
                quantity: ctx.totalQuantity,
                unit_price: ctx.unitCost!,
              }
            )
            if (result.success) {
              await fetchStocks()
            }
          } catch (err) {
            console.error('Error creating product:', err)
          }
        }

        // Reset current ingredient
        setCurrentIngredient({})

        // Build response
        let response = `✅ **"${newIngredient.name}"** ajouté !\n\n`
        response += `• Quantité : **${quantity} ${unitLabel}** par portion\n`
        
        if (hasCost) {
          response += `• Coût : **${formatCurrency(costInRecipe)}**\n\n`
          response += `📊 **Coût matière cumulé : ${formatCurrency(newTotalCost)}**\n\n`
        } else {
          response += `• _(Coût à calculer - prix non disponible)_\n\n`
        }
        
        response += `**Ajouter un autre ingrédient ?**`

        ask(response, ['➕ Oui, ajouter', '✓ Non, passer au prix'])
        setPhase('menu_more_ingredients')
        break
      }

      case 'menu_more_ingredients': {
        const wantsMore = lowerInput.includes('ajouter') || 
                          lowerInput.includes('oui') || 
                          lowerInput.includes('➕') ||
                          lowerInput.includes('autre') ||
                          lowerInput.includes('suivant')
        
        if (wantsMore) {
          ask(
            `**Quel est l'ingrédient suivant ?**\n\n` +
            `_Donne-moi le nom (ex: fromage, salade, sauce...)_`
          )
          setPhase('menu_ingredient_name')
        } else {
          const ingredientCount = recipeCtx.ingredients.length
          const totalCost = recipeCtx.totalFoodCost
          
          ask(
            `Parfait ! **${ingredientCount} ingrédient${ingredientCount > 1 ? 's' : ''}** pour "${recipeCtx.menuItemName}"\n\n` +
            `📊 Coût matière estimé : **${formatCurrency(totalCost)}**\n\n` +
            `**À combien vends-tu ce plat TTC ?**\n\n` +
            `_Prix en euros (ex: 12.90, 15, 8.50)_`
          )
          setPhase('menu_selling_price')
        }
        break
      }

      case 'menu_selling_price': {
        const price = parseNumber(input)
        
        if (!price || price <= 0) {
          ask(`Je n'ai pas compris le prix. Donne-moi un nombre en euros.\n\n_Ex: 12.90, 15, 8.50_`)
          return
        }

        const foodCost = recipeCtx.totalFoodCost
        const marginAmount = price - foodCost
        const marginPercent = foodCost > 0 ? (marginAmount / price) * 100 : 100
        const foodCostPercent = foodCost > 0 ? (foodCost / price) * 100 : 0

        setRecipeCtx({ ...recipeCtx, sellingPrice: price })

        // Detailed margin analysis
        const marginEmoji = marginPercent >= 70 ? '🟢 Excellente' 
          : marginPercent >= 60 ? '🟡 Correcte' 
          : marginPercent >= 50 ? '🟠 Moyenne'
          : '🔴 Faible'

        // Build detailed summary
        let summary = `📋 **Récapitulatif : "${recipeCtx.menuItemName}"**\n\n`
        
        if (recipeCtx.ingredients.length > 0) {
          summary += `**📝 Ingrédients (${recipeCtx.ingredients.length}) :**\n`
          recipeCtx.ingredients.forEach(ing => {
            const costDisplay = ing.costInRecipe > 0 
              ? formatCurrency(ing.costInRecipe) 
              : '_à calculer_'
            summary += `  • ${ing.name}: ${ing.quantityUsed} ${ing.unit} → ${costDisplay}\n`
          })
          summary += `\n`
        }
        
        summary += `**💰 Analyse financière :**\n`
        summary += `  • Coût matière : ${formatCurrency(foodCost)} (${foodCostPercent.toFixed(0)}% du prix)\n`
        summary += `  • Prix de vente : ${formatCurrency(price)}\n`
        summary += `  • **Marge brute : ${formatCurrency(marginAmount)} (${marginPercent.toFixed(0)}%)** ${marginEmoji}\n\n`

        if (marginPercent < 60) {
          const price70 = foodCost / 0.3
          const price65 = foodCost / 0.35
          summary += `⚠️ **Attention : Marge en dessous de 60%**\n`
          summary += `💡 Pour améliorer ta rentabilité :\n`
          summary += `  • 70% de marge → ${formatCurrency(price70)}\n`
          summary += `  • 65% de marge → ${formatCurrency(price65)}\n\n`
        } else if (marginPercent >= 75) {
          summary += `💪 **Excellente marge !** Tu es bien positionné.\n\n`
        }

        summary += `**On crée ce plat ?**`

        ask(summary, ['✅ Créer', '💡 Modifier le prix', '❌ Annuler'])
        setPhase('menu_confirm')
        break
      }

      case 'menu_confirm': {
        if (lowerInput.includes('annuler') || lowerInput.includes('❌') || lowerInput.includes('non')) {
          ask(
            "Pas de problème ! 👋 La création est annulée.\n\n" +
            "_Tu peux recommencer quand tu veux avec le bouton reset._"
          )
          setPhase('done')
          return
        }

        if (lowerInput.includes('modifier') || lowerInput.includes('💡') || lowerInput.includes('prix')) {
          const foodCost = recipeCtx.totalFoodCost
          const price75 = foodCost / 0.25
          const price70 = foodCost / 0.3
          const price65 = foodCost / 0.35
          
          ask(
            `💡 **Prix suggérés selon la marge souhaitée :**\n\n` +
            `• Pour **75% de marge** → ${formatCurrency(price75)}\n` +
            `• Pour **70% de marge** → ${formatCurrency(price70)}\n` +
            `• Pour **65% de marge** → ${formatCurrency(price65)}\n\n` +
            `**Quel prix veux-tu appliquer ?**\n\n` +
            `_Tu peux aussi entrer un prix personnalisé_`,
            [formatCurrency(price70), formatCurrency(price65), `Garder ${formatCurrency(recipeCtx.sellingPrice || 0)}`]
          )
          return
        }

        // Handle price selection from suggestions
        const priceMatch = parseNumber(input)
        if (priceMatch && priceMatch > 0 && priceMatch !== recipeCtx.sellingPrice) {
          setRecipeCtx({ ...recipeCtx, sellingPrice: priceMatch })
        }

        const shouldCreate = lowerInput.includes('créer') || 
                            lowerInput.includes('✅') || 
                            lowerInput.includes('garder') ||
                            lowerInput.includes('oui') ||
                            priceMatch

        if (shouldCreate) {
          setIsProcessing(true)
          
          try {
            const finalPrice = priceMatch || recipeCtx.sellingPrice!
            
            // Create the menu item
            const result = await createMenuItem({
              name: recipeCtx.menuItemName!,
              category: 'plat',
              selling_price: finalPrice,
              target_margin_percent: 70,
            })

            if (result.success && result.data) {
              const menuItemId = (result.data as { id: string }).id
              
              // Add all ingredients to the recipe
              let addedIngredients = 0
              for (const ing of recipeCtx.ingredients) {
                const product = products.find(p => 
                  p.name.toLowerCase() === ing.name.toLowerCase() ||
                  p.id === ing.stockItemId
                )
                if (product) {
                  await addIngredient({
                    menu_item_id: menuItemId,
                    product_id: product.id,
                    quantity: ing.quantityUsed,
                    unit: ing.unit,
                  })
                  addedIngredients++
                }
              }

              await fetchMenuItems()
              
              const margin = recipeCtx.totalFoodCost > 0 
                ? ((finalPrice - recipeCtx.totalFoodCost) / finalPrice) * 100 
                : 100
              
              const marginEmoji = margin >= 70 ? '🟢' : margin >= 60 ? '🟡' : '🔴'
              
              ask(
                `🎉 **"${recipeCtx.menuItemName}" créé avec succès !**\n\n` +
                `📊 **Résumé :**\n` +
                `• ${addedIngredients} ingrédient${addedIngredients > 1 ? 's' : ''} lié${addedIngredients > 1 ? 's' : ''}\n` +
                `• Prix de vente : ${formatCurrency(finalPrice)}\n` +
                `• Marge : ${margin.toFixed(0)}% ${marginEmoji}\n\n` +
                `Retrouve-le dans l'onglet **Menu** ! 🍽️`
              )
            } else {
              ask(`❌ Une erreur s'est produite : ${result.error}\n\nVeux-tu réessayer ?`, ['Réessayer', 'Annuler'])
            }
          } catch (err) {
            ask("❌ Une erreur inattendue s'est produite. Veux-tu réessayer ?", ['Réessayer', 'Annuler'])
          } finally {
            setIsProcessing(false)
          }
          
          setPhase('done')
        }
        break
      }
    }
  }

  // ============================================
  // MARGIN FLOW - INTELLIGENT LOGIC
  // ============================================

  const processMarginFlow = async (input: string) => {
    const trimmed = input.trim()
    const lowerInput = trimmed.toLowerCase()

    switch (phase) {
      case 'margin_select_product': {
        const wantsMenu = lowerInput.includes('menu') || lowerInput.includes('🍽️')
        const wantsProduct = lowerInput.includes('produit') || lowerInput.includes('📦')
        
        if (wantsMenu) {
          // Analyser tout le menu
          setIsProcessing(true)
          try {
            await fetchMenuItems()
          } finally {
            setIsProcessing(false)
          }
          setPhase('margin_menu_analysis')
          // The actual analysis will happen in the next phase handler
          return
        }
        
        if (wantsProduct) {
          if (products.length === 0) {
            ask(
              "Tu n'as pas encore de produits en stock.\n\n" +
              "On va faire un **calcul rapide** à la place !\n\n" +
              "**Quel est le nom du produit que tu veux analyser ?**"
            )
            setPhase('margin_has_product')
          } else {
            const productList = products.slice(0, 8).map(p => p.name).join(', ')
            ask(
              `**Quel produit veux-tu analyser ?**\n\n` +
              `_Produits en stock : ${productList}${products.length > 8 ? '...' : ''}_`
            )
            setPhase('margin_has_product')
          }
        } else {
          // Calcul rapide
          ask(
            "Parfait, on fait un **calcul rapide** ! 🧮\n\n" +
            "**Quel est le nom de ton produit ?**\n\n" +
            "_Ex: \"Burger Classique\", \"Pizza Margherita\"..._"
          )
          setPhase('margin_has_product')
        }
        break
      }

      case 'margin_has_product': {
        // Check if product exists in stock
        const existing = products.find(p => 
          p.name.toLowerCase().includes(lowerInput) ||
          lowerInput.includes(p.name.toLowerCase())
        )

        if (existing) {
          setMarginCtx({
            ...marginCtx,
            productName: existing.name,
            productId: existing.id,
          })
          
          ask(
            `✅ Produit trouvé : **"${existing.name}"**\n\n` +
            `**Quel est ton prix d'achat unitaire (coût) ?**\n\n` +
            `_En euros, par unité (ex: 2.50, 1.80)_`
          )
          setPhase('margin_cost_price')
        } else {
          setMarginCtx({
            ...marginCtx,
            productName: trimmed,
            productId: null,
          })
          
          ask(
            `OK, on analyse **"${trimmed}"** 📊\n\n` +
            `**Quel est ton coût d'achat (prix fournisseur) par unité ?**\n\n` +
            `_En euros (ex: 2.50, 1.80, 0.45)_`
          )
          setPhase('margin_cost_price')
        }
        break
      }

      case 'margin_cost_price': {
        const cost = parseNumber(input)
        
        if (!cost || cost <= 0) {
          ask("Je n'ai pas compris. Donne-moi le coût en euros.\n\n_Ex: 2.50, 1.80, 0.45_")
          return
        }

        setMarginCtx({ ...marginCtx, costPrice: cost })

        ask(
          `Coût d'achat : **${formatCurrency(cost)}** ✓\n\n` +
          `**À combien vends-tu "${marginCtx.productName}" TTC ?**\n\n` +
          `_Prix de vente en euros (ex: 7.50, 12.90)_`
        )
        setPhase('margin_selling_price')
        break
      }

      case 'margin_selling_price': {
        const price = parseNumber(input)
        
        if (!price || price <= 0) {
          ask("Je n'ai pas compris. Donne-moi le prix de vente en euros.\n\n_Ex: 7.50, 12.90_")
          return
        }

        const cost = marginCtx.costPrice || 0
        const marginAmount = price - cost
        const marginPercent = (marginAmount / price) * 100

        setMarginCtx({
          ...marginCtx,
          currentSellingPrice: price,
          currentMarginAmount: marginAmount,
          currentMarginPercent: marginPercent,
        })

        const marginEmoji = marginPercent >= 70 ? '🟢' : marginPercent >= 60 ? '🟡' : marginPercent >= 50 ? '🟠' : '🔴'
        const marginStatus = marginPercent >= 70 ? 'Excellente' : marginPercent >= 60 ? 'Bonne' : marginPercent >= 50 ? 'Moyenne' : 'Faible'

        ask(
          `📊 **Analyse instantanée de "${marginCtx.productName}" :**\n\n` +
          `• Coût : ${formatCurrency(cost)}\n` +
          `• Prix de vente : ${formatCurrency(price)}\n` +
          `• **Marge : ${formatCurrency(marginAmount)} (${marginPercent.toFixed(1)}%)** ${marginEmoji} ${marginStatus}\n\n` +
          `**Combien en vends-tu par semaine environ ?**\n\n` +
          `_Juste un nombre (ex: 50, 100, 200)_`
        )
        setPhase('margin_quantity_sold')
        break
      }

      case 'margin_quantity_sold': {
        const qty = parseNumber(input)
        
        if (!qty || qty < 0) {
          ask("Donne-moi une estimation du nombre de ventes par semaine.\n\n_Ex: 50, 100, 200_")
          return
        }

        const cost = marginCtx.costPrice || 0
        const price = marginCtx.currentSellingPrice || 0
        const marginAmount = marginCtx.currentMarginAmount
        const marginPercent = marginCtx.currentMarginPercent
        
        const weeklyRevenue = price * qty
        const weeklyCost = cost * qty
        const weeklyProfit = marginAmount * qty
        const monthlyProfit = weeklyProfit * 4.33

        // Calculate break-even
        const breakEven = cost > 0 ? Math.ceil(cost / marginAmount) : 0

        setMarginCtx({
          ...marginCtx,
          quantitySold: qty,
          currentProfit: weeklyProfit,
          breakEvenQuantity: breakEven,
        })

        const marginEmoji = marginPercent >= 70 ? '🟢' : marginPercent >= 60 ? '🟡' : '🔴'

        let analysis = `📈 **Analyse complète de "${marginCtx.productName}" :**\n\n`
        analysis += `**💰 Par unité :**\n`
        analysis += `• Coût : ${formatCurrency(cost)}\n`
        analysis += `• Prix : ${formatCurrency(price)}\n`
        analysis += `• Marge : ${formatCurrency(marginAmount)} (${marginPercent.toFixed(1)}%) ${marginEmoji}\n\n`
        
        analysis += `**📊 Par semaine (${qty} ventes) :**\n`
        analysis += `• Chiffre d'affaires : ${formatCurrency(weeklyRevenue)}\n`
        analysis += `• Coût total : ${formatCurrency(weeklyCost)}\n`
        analysis += `• **Bénéfice : ${formatCurrency(weeklyProfit)}**\n\n`
        
        analysis += `**📅 Projection mensuelle :**\n`
        analysis += `• **Bénéfice estimé : ${formatCurrency(monthlyProfit)}**/mois\n\n`

        if (marginPercent < 65) {
          const targetPrice70 = cost / 0.3
          const targetPrice65 = cost / 0.35
          const additionalProfit70 = (targetPrice70 - price) * qty * 4.33
          
          analysis += `💡 **Optimisation suggérée :**\n`
          analysis += `• Prix à ${formatCurrency(targetPrice70)} = 70% de marge (+${formatCurrency(additionalProfit70)}/mois)\n`
          analysis += `• Prix à ${formatCurrency(targetPrice65)} = 65% de marge\n\n`
        }

        analysis += `**Que veux-tu faire ?**`

        ask(analysis, ['💡 Optimiser le prix', '🎯 Définir une marge cible', '✅ Terminer'])
        setPhase('margin_analysis')
        break
      }

      case 'margin_analysis': {
        if (lowerInput.includes('terminer') || lowerInput.includes('✅')) {
          ask(
            `Parfait ! 🎉 N'hésite pas à revenir pour d'autres analyses.\n\n` +
            `_Clique sur ↻ pour analyser un autre produit._`
          )
          setPhase('done')
          return
        }

        if (lowerInput.includes('optimiser') || lowerInput.includes('💡')) {
          const cost = marginCtx.costPrice || 0
          const price75 = cost / 0.25
          const price70 = cost / 0.3
          const price65 = cost / 0.35
          const qty = marginCtx.quantitySold || 0
          
          const profit75 = (price75 - cost) * qty * 4.33
          const profit70 = (price70 - cost) * qty * 4.33
          const profit65 = (price65 - cost) * qty * 4.33

          ask(
            `💡 **Prix optimisés pour "${marginCtx.productName}" :**\n\n` +
            `| Marge | Prix | Bénéfice/mois |\n` +
            `|-------|------|---------------|\n` +
            `| 75%   | ${formatCurrency(price75)} | ${formatCurrency(profit75)} |\n` +
            `| 70%   | ${formatCurrency(price70)} | ${formatCurrency(profit70)} |\n` +
            `| 65%   | ${formatCurrency(price65)} | ${formatCurrency(profit65)} |\n\n` +
            `**Quel prix veux-tu appliquer ?**\n\n` +
            `_Tu peux aussi entrer un prix personnalisé_`,
            [formatCurrency(price70), formatCurrency(price65), 'Prix personnalisé']
          )
          setPhase('margin_optimize')
          return
        }

        if (lowerInput.includes('cible') || lowerInput.includes('🎯')) {
          ask(
            `🎯 **Quelle marge veux-tu atteindre ?**\n\n` +
            `_En pourcentage (ex: 70, 65, 75)_`,
            ['75%', '70%', '65%', '60%']
          )
          setPhase('margin_target_margin')
          return
        }

        // Default: ask what they want
        ask(
          "Que veux-tu faire ?",
          ['💡 Optimiser le prix', '🎯 Définir une marge cible', '✅ Terminer']
        )
        break
      }

      case 'margin_target_margin': {
        const target = parseNumber(input)
        
        if (!target || target <= 0 || target >= 100) {
          ask("Donne-moi un pourcentage entre 1 et 99.\n\n_Ex: 70, 65, 75_")
          return
        }

        const cost = marginCtx.costPrice || 0
        const targetPrice = cost / (1 - target / 100)
        const currentPrice = marginCtx.currentSellingPrice || 0
        const qty = marginCtx.quantitySold || 0
        
        const currentProfit = (currentPrice - cost) * qty * 4.33
        const newProfit = (targetPrice - cost) * qty * 4.33
        const profitDiff = newProfit - currentProfit

        setMarginCtx({
          ...marginCtx,
          targetMarginPercent: target,
          suggestedPrice: targetPrice,
          newSellingPrice: targetPrice,
          potentialProfit: newProfit,
        })

        const changeType = targetPrice > currentPrice ? '📈 Augmentation' : '📉 Réduction'
        const changeAmount = Math.abs(targetPrice - currentPrice)

        ask(
          `🎯 **Pour atteindre ${target}% de marge :**\n\n` +
          `• Prix actuel : ${formatCurrency(currentPrice)}\n` +
          `• **Prix conseillé : ${formatCurrency(targetPrice)}**\n` +
          `• ${changeType} de ${formatCurrency(changeAmount)}\n\n` +
          `**Impact mensuel :**\n` +
          `• Bénéfice actuel : ${formatCurrency(currentProfit)}/mois\n` +
          `• Bénéfice après changement : ${formatCurrency(newProfit)}/mois\n` +
          `• **Différence : ${profitDiff >= 0 ? '+' : ''}${formatCurrency(profitDiff)}**/mois\n\n` +
          `**Appliquer ce prix ?**`,
          ['✅ Appliquer', '🔄 Autre marge', '❌ Annuler']
        )
        setPhase('margin_apply_changes')
        break
      }

      case 'margin_optimize': {
        const newPrice = parseNumber(input)
        
        if (lowerInput.includes('personnalisé') || lowerInput.includes('custom')) {
          ask("**Entre ton prix personnalisé en euros :**")
          return
        }
        
        if (!newPrice || newPrice <= 0) {
          ask("Donne-moi un prix en euros.\n\n_Ex: 8.50, 12.90_")
          return
        }

        const cost = marginCtx.costPrice || 0
        const currentPrice = marginCtx.currentSellingPrice || 0
        const qty = marginCtx.quantitySold || 0
        
        const newMarginAmount = newPrice - cost
        const newMarginPercent = (newMarginAmount / newPrice) * 100
        const newProfit = newMarginAmount * qty * 4.33
        const currentProfit = marginCtx.currentProfit * 4.33
        const profitDiff = newProfit - currentProfit

        setMarginCtx({
          ...marginCtx,
          newSellingPrice: newPrice,
          potentialProfit: newProfit,
        })

        const marginEmoji = newMarginPercent >= 70 ? '🟢' : newMarginPercent >= 60 ? '🟡' : '🔴'

        ask(
          `📊 **Simulation avec prix à ${formatCurrency(newPrice)} :**\n\n` +
          `• Nouvelle marge : ${formatCurrency(newMarginAmount)} (${newMarginPercent.toFixed(1)}%) ${marginEmoji}\n` +
          `• Changement : ${newPrice > currentPrice ? '+' : ''}${formatCurrency(newPrice - currentPrice)} par unité\n\n` +
          `**Impact mensuel :**\n` +
          `• Bénéfice actuel : ${formatCurrency(currentProfit)}/mois\n` +
          `• Nouveau bénéfice : ${formatCurrency(newProfit)}/mois\n` +
          `• **Différence : ${profitDiff >= 0 ? '+' : ''}${formatCurrency(profitDiff)}**/mois\n\n` +
          `**Appliquer ce prix ?**`,
          ['✅ Appliquer', '🔄 Autre prix', '❌ Annuler']
        )
        setPhase('margin_apply_changes')
        break
      }

      case 'margin_apply_changes': {
        if (lowerInput.includes('annuler') || lowerInput.includes('❌')) {
          ask(
            "OK, aucun changement appliqué.\n\n" +
            "_Tu peux analyser un autre produit avec ↻_"
          )
          setPhase('done')
          return
        }

        if (lowerInput.includes('retour') || lowerInput.includes('🔙')) {
          // Go back to menu item detail if we came from there
          if (marginCtx.productId && menuItems.length > 0) {
            const options = menuItems.slice(0, 4).map(item => item.name)
            options.push('✅ Terminer')
            ask(
              "**Quel plat veux-tu analyser ?**",
              options
            )
            setPhase('margin_menu_item_detail')
          } else {
            ask("**Entre un nouveau prix en euros :**")
            setPhase('margin_optimize')
          }
          return
        }

        if (lowerInput.includes('autre') || lowerInput.includes('🔄')) {
          if (lowerInput.includes('marge')) {
            ask(
              `🎯 **Quelle marge veux-tu atteindre ?**\n\n` +
              `_En pourcentage (ex: 70, 65, 75)_`,
              ['75%', '70%', '65%', '60%']
            )
            setPhase('margin_target_margin')
          } else {
            ask("**Entre un nouveau prix en euros :**")
            setPhase('margin_optimize')
          }
          return
        }

        if (lowerInput.includes('appliquer') || lowerInput.includes('✅')) {
          const newPrice = marginCtx.newSellingPrice || marginCtx.suggestedPrice
          const profit = marginCtx.potentialProfit
          const cost = marginCtx.costPrice || 0
          const marginPercent = newPrice ? ((newPrice - cost) / newPrice) * 100 : 0

          // If we have a menu item ID, update the price in the database
          if (marginCtx.productId && newPrice) {
            setIsProcessing(true)
            try {
              const result = await updateMenuItem(marginCtx.productId, {
                selling_price: newPrice
              })
              
              if (result.success) {
                await fetchMenuItems() // Refresh the data
                
                ask(
                  `✅ **Prix mis à jour avec succès !**\n\n` +
                  `**"${marginCtx.productName}"**\n` +
                  `• Nouveau prix : **${formatCurrency(newPrice)}**\n` +
                  `• Marge : **${marginPercent.toFixed(1)}%**\n\n` +
                  `Le changement est maintenant effectif dans ton menu ! 🎉\n\n` +
                  `Tu veux analyser un autre plat ?`,
                  ['🔍 Analyser un autre plat', '✓ Terminer']
                )
              } else {
                ask(
                  `❌ Erreur lors de la mise à jour : ${result.error}\n\n` +
                  `Tu veux réessayer ?`,
                  ['🔄 Réessayer', '❌ Annuler']
                )
              }
            } catch (err) {
              ask(
                `❌ Une erreur s'est produite.\n\n` +
                `Tu veux réessayer ?`,
                ['🔄 Réessayer', '❌ Annuler']
              )
            } finally {
              setIsProcessing(false)
            }
          } else {
            // No menu item ID, just show recommendation
            ask(
              `✅ **Recommandation enregistrée !**\n\n` +
              `**"${marginCtx.productName}"**\n` +
              `• Prix conseillé : **${formatCurrency(newPrice || 0)}**\n` +
              `• Marge : **${marginPercent.toFixed(1)}%**\n` +
              `• Bénéfice estimé : **${formatCurrency(profit)}/mois**\n\n` +
              `💡 _N'oublie pas de mettre à jour ton menu avec ce nouveau prix !_\n\n` +
              `Tu veux analyser un autre produit ?`,
              ['📊 Analyser un autre', '✓ Terminer']
            )
          }
          setPhase('done')
        }
        break
      }

      // ============================================
      // MENU ANALYSIS PHASES
      // ============================================

      case 'margin_menu_analysis': {
        // This phase is triggered after fetching menu items
        // Display actual menu analysis with real data
        
        if (menuItems.length === 0) {
          ask(
            "🍽️ Tu n'as pas encore de plats dans ton menu.\n\n" +
            "**Va d'abord créer des plats** dans l'onglet Menu, puis reviens ici pour analyser tes marges !\n\n" +
            "_Tu veux faire un calcul rapide à la place ?_",
            ['🧮 Calcul rapide', '❌ Fermer']
          )
          setPhase('margin_select_product')
          return
        }

        // Calculate global stats
        const totalItems = menuItems.length
        const avgMargin = menuItems.reduce((sum, item) => sum + item.actual_margin_percent, 0) / totalItems
        const lowMarginItems = menuItems.filter(item => item.actual_margin_percent < 60)
        const highMarginItems = menuItems.filter(item => item.actual_margin_percent >= 70)
        const noIngredientItems = menuItems.filter(item => item.ingredients.length === 0)
        
        // Build summary
        let summary = `🍽️ **Analyse de ton menu (${totalItems} plats)**\n\n`
        
        // Global stats
        const avgMarginEmoji = avgMargin >= 70 ? '🟢' : avgMargin >= 60 ? '🟡' : '🔴'
        summary += `📊 **Statistiques globales :**\n`
        summary += `• Marge moyenne : **${avgMargin.toFixed(1)}%** ${avgMarginEmoji}\n`
        summary += `• Plats à forte marge (≥70%) : **${highMarginItems.length}**\n`
        summary += `• Plats à faible marge (<60%) : **${lowMarginItems.length}**\n`
        if (noIngredientItems.length > 0) {
          summary += `• ⚠️ Plats sans ingrédients : **${noIngredientItems.length}**\n`
        }
        summary += `\n`

        // Top 5 best margins
        const sortedByMargin = [...menuItems].sort((a, b) => b.actual_margin_percent - a.actual_margin_percent)
        summary += `🏆 **Top marges :**\n`
        sortedByMargin.slice(0, 3).forEach((item, i) => {
          const emoji = item.actual_margin_percent >= 70 ? '🟢' : item.actual_margin_percent >= 60 ? '🟡' : '🔴'
          summary += `${i + 1}. ${item.name} → **${item.actual_margin_percent.toFixed(0)}%** ${emoji}\n`
        })
        summary += `\n`

        // Items needing attention
        if (lowMarginItems.length > 0) {
          summary += `⚠️ **À optimiser :**\n`
          lowMarginItems.slice(0, 3).forEach(item => {
            const suggestedPrice = item.cost_price / 0.3 // For 70% margin
            summary += `• ${item.name}: ${item.actual_margin_percent.toFixed(0)}% → suggéré ${formatCurrency(suggestedPrice)}\n`
          })
          summary += `\n`
        }

        summary += `**Veux-tu analyser un plat en détail ?**`

        // Build options with actual menu items
        const options = menuItems.slice(0, 4).map(item => item.name)
        options.push('✅ Terminer')

        ask(summary, options)
        setPhase('margin_menu_item_detail')
        break
      }

      case 'margin_menu_item_detail': {
        if (lowerInput.includes('terminer') || lowerInput.includes('✅')) {
          ask(
            "Parfait ! 🎉 Tu peux consulter la **Grille Tarifaire** pour modifier tes prix.\n\n" +
            "_Clique sur ↻ pour une nouvelle analyse._"
          )
          setPhase('done')
          return
        }

        // Find the selected menu item
        const selectedItem = menuItems.find(item => 
          item.name.toLowerCase() === lowerInput ||
          item.name.toLowerCase().includes(lowerInput) ||
          lowerInput.includes(item.name.toLowerCase())
        )

        if (!selectedItem) {
          // Item not found, ask again
          const options = menuItems.slice(0, 4).map(item => item.name)
          options.push('✅ Terminer')
          ask(
            `Je n'ai pas trouvé ce plat. Choisis parmi :\n\n` +
            menuItems.map(item => `• ${item.name}`).join('\n'),
            options
          )
          return
        }

        // Set context for this item
        setMarginCtx({
          ...marginCtx,
          productName: selectedItem.name,
          productId: selectedItem.id,
          costPrice: selectedItem.cost_price,
          currentSellingPrice: Number(selectedItem.selling_price),
          currentMarginPercent: selectedItem.actual_margin_percent,
          currentMarginAmount: selectedItem.margin_amount,
        })

        // Build detailed analysis
        const marginEmoji = selectedItem.actual_margin_percent >= 70 ? '🟢 Excellente' 
          : selectedItem.actual_margin_percent >= 60 ? '🟡 Correcte' 
          : selectedItem.actual_margin_percent >= 50 ? '🟠 Moyenne'
          : '🔴 Faible'

        let detail = `🔍 **Analyse détaillée : "${selectedItem.name}"**\n\n`

        // Ingredients section
        if (selectedItem.ingredients.length > 0) {
          detail += `📝 **Ingrédients (${selectedItem.ingredients.length}) :**\n`
          selectedItem.ingredients.forEach(ing => {
            const productName = ing.product?.name || 'Inconnu'
            const unit = ing.unit || 'g'
            detail += `• ${productName}: **${ing.quantity}${unit}**\n`
          })
          detail += `\n`
        } else {
          detail += `⚠️ **Aucun ingrédient défini !**\n`
          detail += `_Ajoute les ingrédients dans l'onglet Menu pour calculer le coût réel._\n\n`
        }

        // Financial analysis
        detail += `💰 **Analyse financière :**\n`
        detail += `• Coût matière : **${formatCurrency(selectedItem.cost_price)}**\n`
        detail += `• Prix de vente : **${formatCurrency(Number(selectedItem.selling_price))}**\n`
        detail += `• Marge : **${formatCurrency(selectedItem.margin_amount)} (${selectedItem.actual_margin_percent.toFixed(1)}%)** ${marginEmoji}\n\n`

        // Suggestions
        if (selectedItem.actual_margin_percent < 65) {
          const price70 = selectedItem.cost_price / 0.3
          const price65 = selectedItem.cost_price / 0.35
          const priceDiff = price70 - Number(selectedItem.selling_price)
          
          detail += `💡 **Optimisation suggérée :**\n`
          detail += `• Pour 70% de marge → **${formatCurrency(price70)}** (+${formatCurrency(priceDiff)})\n`
          detail += `• Pour 65% de marge → **${formatCurrency(price65)}**\n\n`
        } else if (selectedItem.actual_margin_percent >= 75) {
          detail += `💪 **Excellente marge !** Ce plat est très rentable.\n\n`
        }

        detail += `**Que veux-tu faire ?**`

        ask(detail, ['💡 Optimiser ce prix', '🔍 Analyser un autre plat', '✅ Terminer'])
        setPhase('margin_menu_optimize_item')
        break
      }

      case 'margin_menu_optimize_item': {
        // Handle options from previous phase
        if (lowerInput.includes('terminer') || lowerInput.includes('✅')) {
          ask(
            "Parfait ! 🎉 Tu peux modifier tes prix dans la **Grille Tarifaire**.\n\n" +
            "_Clique sur ↻ pour une nouvelle analyse._"
          )
          setPhase('done')
          return
        }

        if (lowerInput.includes('autre') || lowerInput.includes('🔍')) {
          // Go back to menu item selection
          const options = menuItems.slice(0, 4).map(item => item.name)
          options.push('✅ Terminer')
          ask(
            "**Quel autre plat veux-tu analyser ?**",
            options
          )
          setPhase('margin_menu_item_detail')
          return
        }

        if (lowerInput.includes('optimiser') || lowerInput.includes('💡')) {
          // Show optimization options
          const cost = marginCtx.costPrice || 0
          const currentPrice = marginCtx.currentSellingPrice || 0
          
          const price75 = cost / 0.25
          const price70 = cost / 0.3
          const price65 = cost / 0.35

          ask(
            `💡 **Prix suggérés pour "${marginCtx.productName}" :**\n\n` +
            `Prix actuel : ${formatCurrency(currentPrice)}\n\n` +
            `| Marge | Prix suggéré | Différence |\n` +
            `|-------|--------------|------------|\n` +
            `| 75%   | ${formatCurrency(price75)} | ${price75 > currentPrice ? '+' : ''}${formatCurrency(price75 - currentPrice)} |\n` +
            `| 70%   | ${formatCurrency(price70)} | ${price70 > currentPrice ? '+' : ''}${formatCurrency(price70 - currentPrice)} |\n` +
            `| 65%   | ${formatCurrency(price65)} | ${price65 > currentPrice ? '+' : ''}${formatCurrency(price65 - currentPrice)} |\n\n` +
            `**Quel prix veux-tu appliquer ?**`,
            [formatCurrency(price70), formatCurrency(price65), '🔙 Retour']
          )
          setPhase('margin_apply_changes')
          return
        }

        // If user typed a price directly, handle it
        const newPrice = parseNumber(input)
        if (newPrice && newPrice > 0) {
          const cost = marginCtx.costPrice || 0
          const newMarginAmount = newPrice - cost
          const newMarginPercent = (newMarginAmount / newPrice) * 100
          const marginEmoji = newMarginPercent >= 70 ? '🟢' : newMarginPercent >= 60 ? '🟡' : '🔴'

          setMarginCtx({
            ...marginCtx,
            newSellingPrice: newPrice,
            potentialProfit: newMarginAmount,
          })

          ask(
            `📊 **Simulation à ${formatCurrency(newPrice)} :**\n\n` +
            `• Coût matière : ${formatCurrency(cost)}\n` +
            `• Nouvelle marge : **${formatCurrency(newMarginAmount)} (${newMarginPercent.toFixed(1)}%)** ${marginEmoji}\n\n` +
            `**Appliquer ce prix ?**`,
            ['✅ Appliquer', '🔄 Autre prix', '🔙 Retour']
          )
          setPhase('margin_apply_changes')
          return
        }

        // Default: show options again
        ask(
          "**Que veux-tu faire ?**",
          ['💡 Optimiser ce prix', '🔍 Analyser un autre plat', '✅ Terminer']
        )
        break
      }

      case 'margin_menu_summary': {
        // Final summary after menu analysis
        if (lowerInput.includes('autre') || lowerInput.includes('analyser')) {
          ask(
            "**Quel autre plat veux-tu analyser ?**\n\n" +
            "_Donne-moi le nom du plat_"
          )
          setPhase('margin_menu_item_detail')
        } else {
          ask(
            "Parfait ! Tu peux consulter la **Grille Tarifaire** pour voir toutes les marges.\n\n" +
            "_Clique sur ↻ pour une nouvelle analyse._"
          )
          setPhase('done')
        }
        break
      }

      default: {
        // Handle done state or unknown
        if (lowerInput.includes('autre plat') || lowerInput.includes('🔍')) {
          // Go back to menu item selection
          if (menuItems.length > 0) {
            const options = menuItems.slice(0, 4).map(item => item.name)
            options.push('✅ Terminer')
            ask(
              "**Quel plat veux-tu analyser ?**",
              options
            )
            setPhase('margin_menu_item_detail')
          } else {
            handleReset()
          }
        } else if (lowerInput.includes('autre') || lowerInput.includes('analyser') || lowerInput.includes('📊')) {
          handleReset()
        } else {
          ask(
            "Tu peux analyser un autre produit en cliquant sur ↻\n\n" +
            "_Ou ferme cette fenêtre pour revenir au calculateur._"
          )
        }
        break
      }
    }
  }

  // ============================================
  // MAIN HANDLER
  // ============================================

  const handleSend = async () => {
    const userInput = inputValue.trim()
    if (!userInput || isProcessing) return

    userSays(userInput)
    setInputValue('')

    setIsProcessing(true)
    try {
      if (mode === 'stock') {
        await processStockFlow(userInput)
      } else if (mode === 'menu') {
        await processMenuFlow(userInput)
      } else if (mode === 'margin') {
        await processMarginFlow(userInput)
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleOptionClick = (option: string) => {
    setInputValue(option)
    setTimeout(() => handleSend(), 50)
  }

  const handleReset = () => {
    setMessages([])
    setPhase(mode === 'stock' ? 'stock_init' : mode === 'menu' ? 'menu_init' : 'margin_init')
    setStockCtx({
      name: null, productType: null, purchaseUnit: null, isPackaged: false,
      unitsPerPack: null, numberOfPacks: null, totalQuantity: null,
      totalPrice: null, unitCost: null, supplier: null, category: null, existingProductId: null,
    })
    setRecipeCtx({
      menuItemName: null, menuItemId: null, isNewItem: true,
      ingredients: [], sellingPrice: null, totalFoodCost: 0,
    })
    setMarginCtx({
      productName: null, productId: null, costPrice: null, currentSellingPrice: null,
      newSellingPrice: null, targetMarginPercent: null, quantitySold: null, period: 'week',
      currentMarginPercent: 0, currentMarginAmount: 0, currentProfit: 0,
      suggestedPrice: null, potentialProfit: 0, breakEvenQuantity: 0,
    })
    setCurrentIngredient({})
    setMenuAnalysisIndex(0)
    
    // Re-initialize after a tick
    setTimeout(() => {
      if (mode === 'stock') {
        ask(
          "Salut ! 👋 Je suis là pour t'aider à gérer ton stock intelligemment.\n\n**Quel produit veux-tu ajouter ?**\n\n_Dis-moi simplement le nom (ex: \"steak haché\", \"Coca-Cola\", \"farine\")_"
        )
        setPhase('stock_name')
      } else if (mode === 'menu') {
        ask(
          "Salut ! 👋 Je vais t'aider à créer une recette complète pour ton menu.\n\n**Quel plat ou boisson veux-tu créer ?**\n\n_Ex: \"Burger Classique\", \"Pizza Margherita\", \"Mojito\"..._"
        )
        setPhase('menu_dish_name')
      } else if (mode === 'margin') {
        ask(
          "Salut ! 📊 Je suis ton assistant pour **analyser et optimiser tes marges**.\n\n" +
          "Je peux t'aider à :\n" +
          "• 🍽️ Analyser tout ton menu (ingrédients + marges)\n" +
          "• 📦 Analyser un produit spécifique\n" +
          "• 🧮 Faire un calcul rapide\n\n" +
          "**Que veux-tu faire ?**",
          ['🍽️ Analyser mon menu', '📦 Analyser un produit', '🧮 Calcul rapide']
        )
        setPhase('margin_select_product')
      }
    }, 100)
  }

  if (!isOpen) return null

  return (
    <div className="ai-assistant-overlay" onClick={onClose}>
      <div className="ai-assistant-panel" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="ai-assistant-header">
          <div className="ai-assistant-header-left">
            <div className="ai-assistant-avatar">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3>Assistant IA</h3>
              <span>
                {mode === 'stock' ? 'Stock & Menu' : mode === 'menu' ? 'Création de recette' : 'Marges & Bénéfices'}
              </span>
            </div>
          </div>
          <div className="ai-assistant-header-actions">
            <button onClick={handleReset} className="ai-assistant-reset-btn" title="Recommencer">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="ai-assistant-close-btn">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="ai-assistant-messages">
          {messages.map(message => (
            <div key={message.id} className={`ai-message ai-message-${message.role}`}>
              <div className="ai-message-avatar">
                {message.role === 'assistant' ? (
                  <Bot className="w-4 h-4" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>
              <div className="ai-message-content">
                <div 
                  className="ai-message-text"
                  dangerouslySetInnerHTML={{ 
                    __html: message.content
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/_(.*?)_/g, '<em>$1</em>')
                      .replace(/\n/g, '<br/>')
                  }}
                />
                {message.options && message.options.length > 0 && (
                  <div className="ai-message-options">
                    {message.options.map((option, idx) => (
                      <button
                        key={idx}
                        className="ai-option-btn"
                        onClick={() => handleOptionClick(option)}
                        disabled={isProcessing}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isProcessing && (
            <div className="ai-message ai-message-assistant">
              <div className="ai-message-avatar">
                <Bot className="w-4 h-4" />
              </div>
              <div className="ai-message-content">
                <div className="ai-typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="ai-assistant-input-area">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={phase === 'done' ? "✓ Terminé - Clique sur ↻ pour recommencer" : "Tape ta réponse..."}
            className="ai-assistant-input"
            disabled={isProcessing || phase === 'done'}
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isProcessing || phase === 'done'}
            className="ai-assistant-send-btn"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AIAssistant
