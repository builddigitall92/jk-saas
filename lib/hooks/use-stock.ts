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
    supplier_id?: string | null
    supplier_name?: string | null
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

      // Utiliser le supplier_id fourni (déjà confirmé par l'IA)
      const finalSupplierId: string | null = data.supplier_id || null

      // Ajouter le stock
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: newStock, error } = await (supabase as any)
        .from('stock')
        .insert({
          establishment_id: profile.establishment_id,
          product_id: data.product_id,
          quantity: data.quantity,
          unit_price: data.unit_price,
          expiry_date: data.expiry_date || null,
          supplier_id: finalSupplierId,
          added_by: userData.user.id
        })
        .select()
        .single()

      if (error) throw error

      // Si un fournisseur est associé, créer automatiquement une facture
      if (finalSupplierId && newStock) {
        const totalAmount = Number(data.quantity) * Number(data.unit_price)
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: invoiceError } = await (supabase as any)
          .from('factures_fournisseurs')
          .insert({
            establishment_id: profile.establishment_id,
            fournisseur_id: finalSupplierId,
            montant_ttc: totalAmount,
            date_facture: new Date().toISOString().split('T')[0],
            created_by: userData.user.id
          })

        if (!invoiceError) {
          // Attendre un peu pour laisser le trigger s'exécuter
          await new Promise(resolve => setTimeout(resolve, 300))
          
          // Forcer la mise à jour des stats du fournisseur en recalculant depuis les factures
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: factures } = await (supabase as any)
            .from('factures_fournisseurs')
            .select('montant_ttc')
            .eq('fournisseur_id', finalSupplierId)
          
          if (factures) {
            const totalDepense = factures.reduce((sum: number, f: any) => sum + Number(f.montant_ttc || 0), 0)
            const nbFactures = factures.length
            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any)
              .from('suppliers')
              .update({
                total_depense: totalDepense,
                nb_factures: nbFactures
              })
              .eq('id', finalSupplierId)
          }
        }
      }
      
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
      supplier_id?: string | null
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

      // 2. Utiliser le supplier_id fourni (déjà confirmé par l'IA)
      const finalSupplierId: string | null = stockData.supplier_id || null

      // 3. Ajouter le stock
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: newStock, error: stockError } = await (supabase as any)
        .from('stock')
        .insert({
          establishment_id: profile.establishment_id,
          product_id: newProduct.id,
          quantity: stockData.quantity,
          unit_price: stockData.unit_price,
          expiry_date: stockData.expiry_date || null,
          supplier_id: finalSupplierId,
          added_by: userData.user.id
        })
        .select()
        .single()

      if (stockError) throw stockError

      // 4. Si un fournisseur est associé, créer automatiquement une facture
      if (finalSupplierId && newStock) {
        const totalAmount = Number(stockData.quantity) * Number(stockData.unit_price)
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: invoiceError } = await (supabase as any)
          .from('factures_fournisseurs')
          .insert({
            establishment_id: profile.establishment_id,
            fournisseur_id: finalSupplierId,
            montant_ttc: totalAmount,
            date_facture: new Date().toISOString().split('T')[0],
            created_by: userData.user.id
          })

        if (invoiceError) {
          console.error('Erreur création facture automatique:', invoiceError)
          // Ne pas faire échouer l'ajout de stock si la facture échoue
        } else {
          // Attendre un peu pour laisser le trigger s'exécuter
          await new Promise(resolve => setTimeout(resolve, 300))
          
          // Forcer la mise à jour des stats du fournisseur en recalculant depuis les factures
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: factures } = await (supabase as any)
            .from('factures_fournisseurs')
            .select('montant_ttc')
            .eq('fournisseur_id', finalSupplierId)
          
          if (factures) {
            const totalDepense = factures.reduce((sum: number, f: any) => sum + Number(f.montant_ttc || 0), 0)
            const nbFactures = factures.length
            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any)
              .from('suppliers')
              .update({
                total_depense: totalDepense,
                nb_factures: nbFactures
              })
              .eq('id', finalSupplierId)
          }
        }
        // Le trigger update_supplier_stats mettra à jour automatiquement les stats
      }

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

  // Trouver un produit existant par nom (insensible à la casse)
  const findProductByName = (name: string) => {
    const normalizedName = name.toLowerCase().trim()
    return products.find(p => p.name.toLowerCase().trim() === normalizedName)
  }

  // Trouver le stock existant pour un produit
  const findStockByProductId = (productId: string) => {
    return stocks.find(s => s.product_id === productId)
  }

  // Ajouter ou mettre à jour un stock existant
  const addOrUpdateStock = async (
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
      package_price?: number | null
      package_quantity?: number | null
      expiry_date?: string | null
    }
  ) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Non authentifié')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('establishment_id')
        .eq('id', userData.user.id)
        .single()

      if (!profile?.establishment_id) throw new Error('Pas d\'établissement associé')

      // Chercher si le produit existe déjà
      const existingProduct = findProductByName(productData.name)

      if (existingProduct) {
        // Produit existant → chercher le stock
        const existingStock = findStockByProductId(existingProduct.id)
        
        if (existingStock) {
          // Mettre à jour le stock existant (ajouter la quantité)
          const newQuantity = Number(existingStock.quantity) + stockData.quantity
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error: updateError } = await (supabase as any)
            .from('stock')
            .update({ 
              quantity: newQuantity,
              unit_price: stockData.unit_price,
              package_price: stockData.package_price,
              package_quantity: stockData.package_quantity,
              expiry_date: stockData.expiry_date || existingStock.expiry_date,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingStock.id)

          if (updateError) throw updateError

          await fetchStocks()
          return { success: true, product: existingProduct, updated: true, previousQuantity: existingStock.quantity, newQuantity }
        } else {
          // Pas de stock pour ce produit → créer un nouveau stock
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error: stockError } = await (supabase as any)
            .from('stock')
            .insert({
              establishment_id: profile.establishment_id,
              product_id: existingProduct.id,
              quantity: stockData.quantity,
              unit_price: stockData.unit_price,
              package_price: stockData.package_price,
              package_quantity: stockData.package_quantity,
              initial_quantity: stockData.quantity,
              expiry_date: stockData.expiry_date || null,
              added_by: userData.user.id
            })

          if (stockError) throw stockError
          await fetchStocks()
          return { success: true, product: existingProduct, updated: false }
        }
      } else {
        // Nouveau produit → créer produit + stock
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
        setProducts(prev => [...prev, newProduct as Product])

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: stockError } = await (supabase as any)
          .from('stock')
          .insert({
            establishment_id: profile.establishment_id,
            product_id: newProduct.id,
            quantity: stockData.quantity,
            unit_price: stockData.unit_price,
            package_price: stockData.package_price,
            package_quantity: stockData.package_quantity,
            initial_quantity: stockData.quantity,
            expiry_date: stockData.expiry_date || null,
            added_by: userData.user.id
          })

        if (stockError) throw stockError
        await fetchStocks()
        return { success: true, product: newProduct, updated: false }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de l\'ajout'
      setError(message)
      return { success: false, error: message }
    }
  }

  // Supprimer un produit (le désactiver)
  const deleteProduct = async (productId: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('products')
        .update({ is_active: false })
        .eq('id', productId)

      if (error) throw error
      setProducts(prev => prev.filter(p => p.id !== productId))
      // Aussi supprimer les stocks associés de la vue
      setStocks(prev => prev.filter(s => s.product_id !== productId))
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la suppression'
      setError(message)
      return { success: false, error: message }
    }
  }

  // Créer un nouveau produit (sans stock)
  const createProduct = async (productData: {
    name: string
    category: ProductCategory
    unit: StockUnit
    icon?: string
    min_stock_threshold?: number
  }) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Non authentifié')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('establishment_id')
        .eq('id', userData.user.id)
        .single()

      if (!profile?.establishment_id) throw new Error('Pas d\'établissement associé')

      // Vérifier si le produit existe déjà
      const existing = findProductByName(productData.name)
      if (existing) {
        return { success: false, error: 'Un produit avec ce nom existe déjà' }
      }

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
      setProducts(prev => [...prev, newProduct as Product])
      return { success: true, product: newProduct }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la création'
      setError(message)
      return { success: false, error: message }
    }
  }

  // Historique des mouvements de stock (les derniers ajouts)
  const getStockHistory = () => {
    return stocks
      .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
      .slice(0, 10)
  }

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
    addOrUpdateStock,
    deleteStock,
    deleteProduct,
    createProduct,
    findProductByName,
    findStockByProductId,
    getByCategory,
    getCategoryTotal,
    getProductsByCategory,
    getTotalValue,
    getTotalItems,
    getLowStockAlerts,
    getStockHistory
  }
}
