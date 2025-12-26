"use client"

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { MenuItem, MenuItemIngredient, Product, InsertMenuItem, InsertMenuItemIngredient, UpdateMenuItem } from '@/lib/database.types'

export interface MenuItemIngredientWithProduct extends MenuItemIngredient {
  product: Product | null
}

export interface MenuItemWithIngredients extends MenuItem {
  ingredients: MenuItemIngredientWithProduct[]
  cost_price: number
  actual_margin_percent: number
  margin_amount: number
  product: Product | null
}

export function useMenuItems() {
  const [menuItems, setMenuItems] = useState<MenuItemWithIngredients[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  /**
   * Calcul GPAO - Conversion de quantité vers l'unité du stock
   * 
   * Principe : Convertir la quantité de l'ingrédient (ex: 200g) vers l'unité du stock (ex: kg)
   * pour pouvoir multiplier par le prix unitaire du stock.
   * 
   * Exemple : 200g vers kg = 200 / 1000 = 0,2 kg
   */
  const convertQuantity = useCallback((quantity: number, fromUnit: string | null, toUnit: string): number => {
    if (!fromUnit) return quantity
    
    // Normaliser les unités (insensible à la casse)
    const from = fromUnit.toLowerCase()
    const to = toUnit.toLowerCase()
    
    if (from === to) return quantity
    
    // === CONVERSIONS MASSE ===
    // g → kg : diviser par 1000
    if (from === 'g' && to === 'kg') {
      return quantity / 1000
    }
    // kg → g : multiplier par 1000
    if (from === 'kg' && to === 'g') {
      return quantity * 1000
    }
    
    // === CONVERSIONS VOLUME ===
    // ml → L : diviser par 1000
    if (from === 'ml' && to === 'l') {
      return quantity / 1000
    }
    // L → ml : multiplier par 1000
    if (from === 'l' && to === 'ml') {
      return quantity * 1000
    }
    // cl → L : diviser par 100
    if (from === 'cl' && to === 'l') {
      return quantity / 100
    }
    // L → cl : multiplier par 100
    if (from === 'l' && to === 'cl') {
      return quantity * 100
    }
    // cl → ml : multiplier par 10
    if (from === 'cl' && to === 'ml') {
      return quantity * 10
    }
    // ml → cl : diviser par 10
    if (from === 'ml' && to === 'cl') {
      return quantity / 10
    }
    
    // === UNITÉS IDENTIQUES OU INCOMPATIBLES ===
    // pièces, unités : pas de conversion possible entre unités différentes
    return quantity
  }, [])

  /**
   * Récupérer le prix unitaire d'un produit depuis le stock
   * 
   * Retourne le prix dans l'unité de base du stock (€/kg, €/L, €/pièce)
   * Le prix n'est PAS divisé - c'est le prix tel qu'enregistré dans le stock.
   */
  const getProductUnitPrice = useCallback(async (productId: string): Promise<{ price: number; baseUnit: string }> => {
    const { data } = await supabase
      .from('stock')
      .select('unit_price, product:products(unit)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    if (!data) {
      console.warn(`[GPAO] Pas de stock trouvé pour le produit ${productId}`)
      return { price: 0, baseUnit: 'unités' }
    }
    
    const unit = (data.product as { unit: string } | null)?.unit || 'unités'
    const unitPrice = Number(data.unit_price) || 0
    
    console.log(`[GPAO] Stock trouvé: ${unitPrice}€/${unit}`)
    
    return {
      price: unitPrice,
      baseUnit: unit
    }
  }, [supabase])

  /**
   * Calcul GPAO - Coût matière d'un item de menu
   * 
   * Pour chaque ingrédient :
   * 1. Récupérer le prix unitaire du stock (€/kg, €/L, €/pièce)
   * 2. Convertir la quantité de l'ingrédient vers l'unité du stock
   * 3. Multiplier : Coût = Prix unitaire × Quantité convertie
   * 
   * Exemple : Produit à 1,79€/kg, utilisation de 200g
   * → Prix : 1,79€/kg
   * → Quantité : 200g = 0,2 kg (conversion g → kg)
   * → Coût : 1,79 × 0,2 = 0,358€
   */
  const calculateCosts = useCallback(async (
    menuItem: MenuItem, 
    ingredients: MenuItemIngredientWithProduct[]
  ): Promise<{ cost_price: number; actual_margin_percent: number; margin_amount: number }> => {
    let totalCost = 0
    
    console.log(`[GPAO] === Calcul coût pour "${menuItem.name}" ===`)
    
    for (const ing of ingredients) {
      if (ing.product) {
        const { price: basePrice, baseUnit } = await getProductUnitPrice(ing.product_id)
        const ingredientUnit = ing.unit || baseUnit
        const ingredientQuantity = Number(ing.quantity) || 0
        
        // Convertir la quantité de l'ingrédient dans l'unité de base du produit
        const convertedQuantity = convertQuantity(ingredientQuantity, ingredientUnit, baseUnit)
        
        // Calculer le coût
        const ingredientCost = basePrice * convertedQuantity
        
        console.log(`[GPAO] ${ing.product.name}: ${ingredientQuantity}${ingredientUnit} → ${convertedQuantity.toFixed(4)}${baseUnit} × ${basePrice}€/${baseUnit} = ${ingredientCost.toFixed(4)}€`)
        
        totalCost += ingredientCost
      }
    }
    
    const sellingPrice = Number(menuItem.selling_price)
    const marginAmount = sellingPrice - totalCost
    const marginPercent = sellingPrice > 0 ? (marginAmount / sellingPrice) * 100 : 0
    
    console.log(`[GPAO] Total: ${totalCost.toFixed(2)}€ | Prix vente: ${sellingPrice}€ | Marge: ${marginAmount.toFixed(2)}€ (${marginPercent.toFixed(1)}%)`)
    
    return {
      cost_price: Math.round(totalCost * 100) / 100,
      actual_margin_percent: Math.round(marginPercent * 10) / 10,
      margin_amount: Math.round(marginAmount * 100) / 100
    }
  }, [getProductUnitPrice, convertQuantity])

  const fetchMenuItems = useCallback(async () => {
    try {
      // Récupérer les items du menu
      const { data: items, error: itemsError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (itemsError) throw itemsError

      // Récupérer tous les ingrédients avec leurs produits
      const { data: ingredients, error: ingError } = await supabase
        .from('menu_item_ingredients')
        .select(`
          *,
          product:products(*)
        `)

      if (ingError) throw ingError

      // Assembler les données avec calculs de coûts
      const itemsWithDetails: MenuItemWithIngredients[] = await Promise.all(
        (items || []).map(async (item) => {
          const itemIngredients = (ingredients || [])
            .filter(ing => ing.menu_item_id === item.id) as MenuItemIngredientWithProduct[]
          
          const costs = await calculateCosts(item, itemIngredients)
          
          // Récupérer le produit principal (premier ingrédient)
          const firstIngredient = itemIngredients[0]
          const product = firstIngredient?.product || null
          
          return {
            ...item,
            ingredients: itemIngredients,
            product,
            ...costs
          }
        })
      )

      setMenuItems(itemsWithDetails)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    }
  }, [supabase, calculateCosts])

  const fetchProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      setProducts(data as Product[])
    } catch (err) {
      console.error('Erreur lors du chargement des produits:', err)
    }
  }, [supabase])

  // Créer un nouvel item de menu
  const createMenuItem = async (data: Omit<InsertMenuItem, 'establishment_id'>) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Non authentifié')

      const { data: profile } = await supabase
        .from('profiles')
        .select('establishment_id')
        .eq('id', userData.user.id)
        .single()

      if (!profile?.establishment_id) throw new Error('Pas d\'établissement associé')

      const { data: newItem, error } = await supabase
        .from('menu_items')
        .insert({
          ...data,
          establishment_id: profile.establishment_id
        })
        .select()
        .single()

      if (error) throw error
      
      await fetchMenuItems()
      return { success: true, data: newItem }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la création'
      setError(message)
      return { success: false, error: message }
    }
  }

  // Mettre à jour un item de menu
  const updateMenuItem = async (id: string, data: UpdateMenuItem) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update(data)
        .eq('id', id)

      if (error) throw error
      
      await fetchMenuItems()
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la mise à jour'
      setError(message)
      return { success: false, error: message }
    }
  }

  // Supprimer un item de menu
  const deleteMenuItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setMenuItems(prev => prev.filter(item => item.id !== id))
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la suppression'
      setError(message)
      return { success: false, error: message }
    }
  }

  // Ajouter un ingrédient à un item de menu
  const addIngredient = async (data: InsertMenuItemIngredient) => {
    try {
      const { error } = await supabase
        .from('menu_item_ingredients')
        .insert(data)

      if (error) throw error
      
      await fetchMenuItems()
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de l\'ajout'
      setError(message)
      return { success: false, error: message }
    }
  }

  // Mettre à jour la quantité d'un ingrédient
  const updateIngredientQuantity = async (id: string, quantity: number) => {
    try {
      const { error } = await supabase
        .from('menu_item_ingredients')
        .update({ quantity })
        .eq('id', id)

      if (error) throw error
      
      await fetchMenuItems()
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la mise à jour'
      setError(message)
      return { success: false, error: message }
    }
  }

  // Supprimer un ingrédient
  const deleteIngredient = async (id: string) => {
    try {
      const { error } = await supabase
        .from('menu_item_ingredients')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      await fetchMenuItems()
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la suppression'
      setError(message)
      return { success: false, error: message }
    }
  }

  // Calculer le prix suggéré pour atteindre une marge cible
  const getSuggestedPrice = (costPrice: number, targetMarginPercent: number): number => {
    if (targetMarginPercent >= 100) return costPrice * 10 // Protection
    return Math.round((costPrice / (1 - targetMarginPercent / 100)) * 100) / 100
  }

  // Calculer l'impact mensuel d'un changement de prix (estimation basée sur 30 ventes/jour)
  const getMonthlyImpact = (priceDifference: number, dailySales: number = 30): number => {
    return Math.round(priceDifference * dailySales * 30 * 100) / 100
  }

  // Générer des suggestions d'optimisation (Quick Wins)
  const getQuickWins = (menuItem: MenuItemWithIngredients) => {
    const wins: Array<{
      type: 'reduce_ingredient' | 'increase_price' | 'change_supplier'
      description: string
      impact: number
      action: string
    }> = []

    // Suggestion: augmenter le prix de 0.20€ à 0.50€
    const priceIncreases = [0.20, 0.30, 0.50]
    for (const increase of priceIncreases) {
      const newMargin = ((Number(menuItem.selling_price) + increase - menuItem.cost_price) / (Number(menuItem.selling_price) + increase)) * 100
      const monthlyImpact = getMonthlyImpact(increase)
      
      if (newMargin > menuItem.actual_margin_percent && newMargin <= 80) {
        wins.push({
          type: 'increase_price',
          description: `Augmenter le prix de ${increase.toFixed(2)}€`,
          impact: monthlyImpact,
          action: `Marge passe de ${menuItem.actual_margin_percent.toFixed(0)}% à ${newMargin.toFixed(0)}%`
        })
        break // Prendre seulement la première suggestion viable
      }
    }

    // Suggestions sur les ingrédients (réduire de 10%)
    for (const ing of menuItem.ingredients.slice(0, 2)) {
      if (ing.product && Number(ing.quantity) > 10) {
        const reduction = Math.round(Number(ing.quantity) * 0.1)
        // Estimation grossière de l'économie
        const savingsEstimate = Math.round(menuItem.cost_price * 0.03 * 100) / 100
        const monthlyImpact = getMonthlyImpact(savingsEstimate)
        
        wins.push({
          type: 'reduce_ingredient',
          description: `Réduire ${ing.product.name} de ${reduction}${ing.unit || 'g'}`,
          impact: monthlyImpact,
          action: `Économie estimée: ~${savingsEstimate.toFixed(2)}€/portion`
        })
      }
    }

    return wins.slice(0, 3) // Max 3 suggestions
  }

  // Filtrer par catégorie
  const getByCategory = (category: string) =>
    menuItems.filter(item => item.category === category)

  // Obtenir les catégories uniques
  const getCategories = () => {
    const categories = new Set(menuItems.map(item => item.category).filter(Boolean))
    return Array.from(categories) as string[]
  }

  // Stats globales
  const getAverageMargin = () => {
    if (menuItems.length === 0) return 0
    const total = menuItems.reduce((sum, item) => sum + item.actual_margin_percent, 0)
    return Math.round(total / menuItems.length * 10) / 10
  }

  const getLowMarginItems = (threshold: number = 60) =>
    menuItems.filter(item => item.actual_margin_percent < threshold)

  // Initialisation
  useEffect(() => {
    let isMounted = true

    const initialize = async () => {
      setLoading(true)
      await Promise.all([fetchMenuItems(), fetchProducts()])
      if (isMounted) setLoading(false)
    }

    initialize()

    return () => {
      isMounted = false
    }
  }, [fetchMenuItems, fetchProducts])

  return {
    menuItems,
    products,
    loading,
    error,
    fetchMenuItems,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    addIngredient,
    updateIngredientQuantity,
    deleteIngredient,
    getSuggestedPrice,
    getMonthlyImpact,
    getQuickWins,
    getByCategory,
    getCategories,
    getAverageMargin,
    getLowMarginItems
  }
}
