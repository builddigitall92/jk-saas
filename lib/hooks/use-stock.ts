"use client"

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { Stock, Product, ProductCategory, StockUnit } from '@/lib/database.types'

export interface StockWithProduct extends Stock {
  product: Product | null
}

export function useStock() {
  const [stocks, setStocks] = useState<StockWithProduct[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchStocks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('stock')
        .select(`
          *,
          product:products(*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setStocks(data as StockWithProduct[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    }
  }, [supabase])

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

  const updateQuantity = async (stockId: string, newQuantity: number) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('stock')
        .update({ quantity: newQuantity })
        .eq('id', stockId)

      if (error) throw error
      
      // Mettre à jour localement pour une réponse rapide
      setStocks(prev => 
        prev.map(s => s.id === stockId ? { ...s, quantity: newQuantity } : s)
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour')
    }
  }

  const addStock = async (data: {
    product_id: string
    quantity: number
    unit_price: number
    expiry_date?: string | null
  }) => {
    try {
      // Récupérer l'establishment_id de l'utilisateur actuel
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Non authentifié')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('establishment_id')
        .eq('id', userData.user.id)
        .single()

      if (!profile?.establishment_id) throw new Error('Pas d\'établissement associé')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('stock')
        .insert({
          establishment_id: profile.establishment_id,
          product_id: data.product_id,
          quantity: data.quantity,
          unit_price: data.unit_price,
          expiry_date: data.expiry_date || null
        })

      if (error) throw error
      
      // Les subscriptions temps réel mettront à jour automatiquement
      // mais on peut aussi forcer un refresh
      await fetchStocks()
      
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de l\'ajout'
      setError(message)
      return { success: false, error: message }
    }
  }

  const deleteStock = async (stockId: string) => {
    try {
      const { error } = await supabase
        .from('stock')
        .delete()
        .eq('id', stockId)

      if (error) throw error
      setStocks(prev => prev.filter(s => s.id !== stockId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression')
    }
  }

  // Créer un produit ET ajouter du stock en une seule opération
  const addProductAndStock = async (
    productData: {
      name: string
      category: ProductCategory
      unit: StockUnit
      icon?: string
      min_stock_threshold?: number
    },
    stockData: {
      quantity: number
      unit_price: number
      expiry_date?: string | null
    }
  ) => {
    try {
      // Récupérer l'establishment_id de l'utilisateur actuel
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Non authentifié')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('establishment_id')
        .eq('id', userData.user.id)
        .single()

      if (!profile?.establishment_id) throw new Error('Pas d\'établissement associé')

      // 1. Créer le produit
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: newProduct, error: productError } = await (supabase as any)
        .from('products')
        .insert({
          establishment_id: profile.establishment_id,
          name: productData.name,
          category: productData.category,
          unit: productData.unit,
          icon: productData.icon || '📦',
          min_stock_threshold: productData.min_stock_threshold || 10,
          is_active: true
        })
        .select()
        .single()

      if (productError) throw productError

      // Ajouter le nouveau produit localement
      setProducts(prev => [...prev, newProduct as Product])

      // 2. Ajouter le stock
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: stockError } = await (supabase as any)
        .from('stock')
        .insert({
          establishment_id: profile.establishment_id,
          product_id: newProduct.id,
          quantity: stockData.quantity,
          unit_price: stockData.unit_price,
          expiry_date: stockData.expiry_date || null
        })

      if (stockError) throw stockError

      // Refresh les stocks
      await fetchStocks()

      return { success: true, product: newProduct }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la création'
      setError(message)
      return { success: false, error: message }
    }
  }

  // Initialisation et subscriptions temps réel
  useEffect(() => {
    let isMounted = true

    const initialize = async () => {
      setLoading(true)
      await Promise.all([fetchStocks(), fetchProducts()])
      if (isMounted) setLoading(false)
    }

    initialize()

    // Subscription temps réel sur la table stock
    const stockChannel = supabase
      .channel('stock-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stock'
        },
        async (payload) => {
          console.log('Stock change detected:', payload.eventType)
          
          if (payload.eventType === 'INSERT') {
            // Récupérer le stock avec le produit associé
            const { data } = await supabase
              .from('stock')
              .select('*, product:products(*)')
              .eq('id', payload.new.id)
              .single()
            
            if (data && isMounted) {
              setStocks(prev => [data as StockWithProduct, ...prev])
            }
          } else if (payload.eventType === 'UPDATE') {
            if (isMounted) {
              setStocks(prev => 
                prev.map(s => s.id === payload.new.id 
                  ? { ...s, ...payload.new } 
                  : s
                )
              )
            }
          } else if (payload.eventType === 'DELETE') {
            if (isMounted) {
              setStocks(prev => prev.filter(s => s.id !== payload.old.id))
            }
          }
        }
      )
      .subscribe()

    // Subscription temps réel sur la table products (pour sync manager <-> employé)
    const productsChannel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        async (payload) => {
          console.log('Product change detected:', payload.eventType)
          
          if (payload.eventType === 'INSERT') {
            if (isMounted) {
              setProducts(prev => [...prev, payload.new as Product])
            }
          } else if (payload.eventType === 'UPDATE') {
            if (isMounted) {
              // Si le produit est désactivé, le retirer de la liste
              if (payload.new.is_active === false) {
                setProducts(prev => prev.filter(p => p.id !== payload.new.id))
              } else {
                setProducts(prev => 
                  prev.map(p => p.id === payload.new.id ? payload.new as Product : p)
                )
              }
            }
          } else if (payload.eventType === 'DELETE') {
            if (isMounted) {
              setProducts(prev => prev.filter(p => p.id !== payload.old.id))
            }
          }
        }
      )
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(stockChannel)
      supabase.removeChannel(productsChannel)
    }
  }, [fetchStocks, fetchProducts, supabase])

  // Filtrer par catégorie
  const getByCategory = (category: ProductCategory) => 
    stocks.filter(s => s.product?.category === category)

  const getCategoryTotal = (category: ProductCategory) =>
    getByCategory(category).reduce((sum, s) => sum + Number(s.total_value || 0), 0)

  const getProductsByCategory = (category: ProductCategory) =>
    products.filter(p => p.category === category)

  const getTotalValue = () =>
    stocks.reduce((sum, s) => sum + Number(s.total_value || 0), 0)

  const getTotalItems = () => stocks.length

  const getLowStockAlerts = () =>
    stocks.filter(s => s.product && Number(s.quantity) <= Number(s.product.min_stock_threshold))

  return {
    stocks,
    products,
    loading,
    error,
    fetchStocks,
    fetchProducts,
    updateQuantity,
    addStock,
    addProductAndStock,
    deleteStock,
    getByCategory,
    getCategoryTotal,
    getProductsByCategory,
    getTotalValue,
    getTotalItems,
    getLowStockAlerts
  }
}
