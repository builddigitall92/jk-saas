import type { ProductCategory } from '@/lib/database.types'

// Mots-clés pour la catégorisation automatique des produits
const CATEGORY_KEYWORDS: Record<ProductCategory, string[]> = {
  surgele: [
    'surgelé', 'surgelée', 'surgelés', 'surgelées',
    'congelé', 'congelée', 'congelés', 'congelées',
    'frozen', 'glace', 'glacé',
    'frites surgelées', 'nuggets', 'bâtonnets',
    'poisson pané', 'cordon bleu'
  ],
  frais: [
    'frais', 'fraîche', 'fraîches',
    'salade', 'laitue', 'tomate', 'oignon', 'légume',
    'viande', 'steak', 'poulet', 'boeuf', 'porc', 'agneau',
    'lait', 'crème', 'yaourt', 'yogourt', 'beurre',
    'fromage', 'cheddar', 'emmental', 'mozzarella',
    'oeuf', 'œuf', 'oeufs', 'œufs',
    'jambon', 'bacon', 'saucisse',
    'pain', 'baguette', 'brioche',
    'fruit', 'pomme', 'banane', 'orange',
    'herbe', 'persil', 'ciboulette', 'basilic'
  ],
  sec: [
    'sec', 'sèche', 'secs', 'sèches',
    'cannette', 'canette', 'boîte', 'boite',
    'soda', 'coca', 'cola', 'fanta', 'sprite', 'pepsi', 'orangina',
    'bouteille', 'eau', 'jus',
    'sauce', 'ketchup', 'mayonnaise', 'moutarde', 'vinaigrette',
    'huile', 'vinaigre',
    'conserve', 'bocal',
    'farine', 'sucre', 'sel', 'poivre', 'épice',
    'pâtes', 'riz', 'semoule', 'nouilles',
    'café', 'thé', 'chocolat',
    'chips', 'biscuit', 'cookie',
    'serviette', 'gobelet', 'emballage', 'barquette',
    'papier', 'aluminium', 'film'
  ]
}

// Unités suggérées par catégorie
export const SUGGESTED_UNITS: Record<ProductCategory, string[]> = {
  surgele: ['kg', 'g', 'unités', 'pièces', 'sachets'],
  frais: ['kg', 'g', 'unités', 'pièces', 'L', 'cl', 'portions'],
  sec: ['unités', 'pièces', 'L', 'cl', 'kg', 'g', 'cartons', 'packs']
}

// Icônes suggérées par type de produit
export const SUGGESTED_ICONS: Record<string, string> = {
  // Surgelés
  'frite': '🍟',
  'nugget': '🍗',
  'poisson': '🐟',
  'glace': '🍦',
  'steak': '🥩',
  'viande': '🥩',
  
  // Frais
  'salade': '🥗',
  'laitue': '🥬',
  'tomate': '🍅',
  'oignon': '🧅',
  'fromage': '🧀',
  'oeuf': '🥚',
  'pain': '🍞',
  'lait': '🥛',
  'beurre': '🧈',
  'poulet': '🍗',
  'jambon': '🥓',
  'bacon': '🥓',
  'fruit': '🍎',
  
  // Sec
  'cannette': '🥫',
  'soda': '🥤',
  'coca': '🥤',
  'eau': '💧',
  'bouteille': '🍾',
  'sauce': '🥫',
  'ketchup': '🍅',
  'huile': '🫒',
  'farine': '🌾',
  'sucre': '🍬',
  'sel': '🧂',
  'pâtes': '🍝',
  'riz': '🍚',
  'café': '☕',
  'thé': '🍵',
  'chips': '🥔',
  'emballage': '📦',
  'serviette': '🧻',
  
  // Défaut
  'default': '📦'
}

/**
 * Détecte automatiquement la catégorie d'un produit basé sur son nom
 */
export function detectCategory(productName: string): ProductCategory {
  const nameLower = productName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  
  // Vérifier chaque catégorie
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      const keywordNormalized = keyword.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      if (nameLower.includes(keywordNormalized)) {
        return category as ProductCategory
      }
    }
  }
  
  // Par défaut: frais (plus courant en restauration)
  return 'frais'
}

/**
 * Suggère une icône basée sur le nom du produit
 */
export function suggestIcon(productName: string): string {
  const nameLower = productName.toLowerCase()
  
  for (const [keyword, icon] of Object.entries(SUGGESTED_ICONS)) {
    if (nameLower.includes(keyword)) {
      return icon
    }
  }
  
  return SUGGESTED_ICONS.default
}

/**
 * Suggère une unité basée sur la catégorie et le nom
 */
export function suggestUnit(productName: string, category: ProductCategory): string {
  const nameLower = productName.toLowerCase()
  
  // Cas spécifiques
  if (nameLower.includes('cannette') || nameLower.includes('bouteille') || nameLower.includes('boîte')) {
    return 'unités'
  }
  if (nameLower.includes('litre') || nameLower.includes('sauce') || nameLower.includes('huile')) {
    return 'L'
  }
  if (nameLower.includes('kg') || nameLower.includes('kilo')) {
    return 'kg'
  }
  if (nameLower.includes('gramme') || nameLower.includes(' g ')) {
    return 'g'
  }
  if (nameLower.includes('portion')) {
    return 'portions'
  }
  
  // Par catégorie
  switch (category) {
    case 'surgele':
      return 'kg'
    case 'frais':
      return nameLower.includes('pain') ? 'unités' : 'kg'
    case 'sec':
      return 'unités'
    default:
      return 'unités'
  }
}
