"use client"

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { Vente, VenteWithMenuItem, InsertVente, MenuItem, Product } from '@/lib/database.types'

export interface MenuItemWithProduct extends MenuItem {
    product: Product | null
}

export interface VentesStats {
    totalJour: number
    nbVentesJour: number
    totalMois: number
    nbVentesMois: number
}

export function useVentes() {
    const [ventes, setVentes] = useState<VenteWithMenuItem[]>([])
    const [menuItems, setMenuItems] = useState<MenuItemWithProduct[]>([])
    const [stats, setStats] = useState<VentesStats>({
        totalJour: 0,
        nbVentesJour: 0,
        totalMois: 0,
        nbVentesMois: 0
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    // Récupérer les ventes du jour
    const fetchVentesJour = useCallback(async () => {
        try {
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            const { data, error: fetchError } = await supabase
                .from('ventes')
                .select(`
          *,
          menu_item:menu_items(
            *,
            ingredients:menu_item_ingredients(
              product:products(*)
            )
          )
        `)
                .gte('created_at', today.toISOString())
                .order('created_at', { ascending: false })

            if (fetchError) throw fetchError

            // Transformer les données pour inclure le produit principal
            const ventesWithProducts = (data || []).map((vente: any) => {
                const menuItem = vente.menu_item
                if (menuItem && menuItem.ingredients && menuItem.ingredients.length > 0) {
                    const firstIngredient = menuItem.ingredients[0]
                    return {
                        ...vente,
                        menu_item: {
                            ...menuItem,
                            product: firstIngredient?.product || null
                        }
                    }
                }
                return vente
            })

            setVentes(ventesWithProducts as VenteWithMenuItem[])

            // Calculer les stats du jour
            const totalJour = (data || []).reduce((sum, v) => sum + Number(v.total_price), 0)
            const nbVentesJour = (data || []).length

            setStats(prev => ({
                ...prev,
                totalJour,
                nbVentesJour
            }))
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors du chargement des ventes')
        }
    }, [supabase])

    // Récupérer les menus actifs pour les boutons de vente rapide avec leurs produits associés
    const fetchMenuItems = useCallback(async () => {
        try {
            const { data: menuItemsData, error: fetchError } = await supabase
                .from('menu_items')
                .select('*')
                .eq('is_active', true)
                .order('name')

            if (fetchError) throw fetchError

            // Pour chaque menu, récupérer le premier ingrédient et son produit associé
            const menuItemsWithProducts = await Promise.all(
                (menuItemsData || []).map(async (menuItem) => {
                    // Récupérer le premier ingrédient du menu
                    const { data: ingredientData } = await supabase
                        .from('menu_item_ingredients')
                        .select(`
                            product_id,
                            product:products(*)
                        `)
                        .eq('menu_item_id', menuItem.id)
                        .limit(1)
                        .single()

                    const product = ingredientData?.product as Product | null || null

                    return {
                        ...menuItem,
                        product
                    } as MenuItemWithProduct
                })
            )

            setMenuItems(menuItemsWithProducts)
        } catch (err) {
            console.error('Erreur lors du chargement des menus:', err)
        }
    }, [supabase])

    // Fonction helper pour convertir les unités
    const convertToStockUnit = (quantity: number, fromUnit: string, toUnit: string): number => {
        if (fromUnit === toUnit) return quantity
        
        const from = fromUnit.toLowerCase()
        const to = toUnit.toLowerCase()
        
        // Conversions masse
        if (from === 'g' && to === 'kg') return quantity / 1000
        if (from === 'kg' && to === 'g') return quantity * 1000
        
        // Conversions volume
        if ((from === 'ml' || from === 'cl') && to === 'l') {
            return from === 'ml' ? quantity / 1000 : quantity / 100
        }
        if (from === 'l' && (to === 'ml' || to === 'cl')) {
            return to === 'ml' ? quantity * 1000 : quantity * 100
        }
        if (from === 'cl' && to === 'ml') return quantity * 10
        if (from === 'ml' && to === 'cl') return quantity / 10
        
        return quantity
    }

    // Restaurer le stock pour tous les ingrédients d'un menu_item (lors de la suppression d'une vente)
    const restoreStockFromSale = async (menuItemId: string, saleQuantity: number, establishmentId: string): Promise<void> => {
        // Récupérer tous les ingrédients du menu_item
        const { data: ingredients, error: ingredientsError } = await supabase
            .from('menu_item_ingredients')
            .select(`
                product_id,
                quantity,
                unit,
                product:products(*)
            `)
            .eq('menu_item_id', menuItemId)

        if (ingredientsError) {
            console.error('Erreur lors de la récupération des ingrédients:', ingredientsError)
            return
        }

        if (!ingredients || ingredients.length === 0) {
            console.warn('Aucun ingrédient trouvé pour ce menu_item')
            return
        }

        // Pour chaque ingrédient, restaurer le stock
        for (const ingredient of ingredients) {
            const productId = ingredient.product_id
            const ingredientQuantity = Number(ingredient.quantity) || 0
            const ingredientUnit = ingredient.unit || 'unités'
            
            // Quantité totale à restaurer = quantité par portion × nombre de portions vendues
            const totalQuantityToRestore = ingredientQuantity * saleQuantity

            // Récupérer tous les lots de stock pour ce produit (LIFO: Last In First Out pour la restauration)
            const { data: allStocks, error: stockError } = await supabase
                .from('stock')
                .select(`
                    *,
                    product:products(*)
                `)
                .eq('product_id', productId)
                .eq('establishment_id', establishmentId)
                .order('created_at', { ascending: false }) // Les plus récents en premier (LIFO)

            if (stockError) {
                console.warn(`Erreur lors de la récupération du stock pour le produit ${productId}:`, stockError.message)
                continue
            }

            if (!allStocks || allStocks.length === 0) {
                // Si aucun stock n'existe, créer une nouvelle entrée de stock
                const { data: productData } = await supabase
                    .from('products')
                    .select('*')
                    .eq('id', productId)
                    .single()

                if (productData) {
                    const stockUnit = (productData as Product).unit || 'unités'
                    const quantityToRestoreInStockUnit = convertToStockUnit(
                        totalQuantityToRestore,
                        ingredientUnit,
                        stockUnit
                    )

                    // Créer une nouvelle entrée de stock
                    const { error: insertError } = await supabase
                        .from('stock')
                        .insert({
                            establishment_id: establishmentId,
                            product_id: productId,
                            quantity: quantityToRestoreInStockUnit,
                            unit_price: 0, // Prix par défaut, peut être mis à jour plus tard
                            initial_quantity: quantityToRestoreInStockUnit
                        })

                    if (insertError) {
                        console.error(`Erreur lors de la création du stock pour ${productId}:`, insertError)
                    } else {
                        console.log(`Stock restauré (nouveau lot): ${productId} - ${quantityToRestoreInStockUnit} ${stockUnit}`)
                    }
                }
                continue
            }

            // Récupérer l'unité du produit depuis le premier lot
            const firstStock = allStocks[0]
            const stockUnit = (firstStock.product as Product)?.unit || 'unités'

            // Convertir la quantité de l'ingrédient vers l'unité du stock
            let remainingToRestore = convertToStockUnit(
                totalQuantityToRestore,
                ingredientUnit,
                stockUnit
            )

            // Restaurer le stock en utilisant la stratégie LIFO (dans les lots les plus récents)
            for (const stockItem of allStocks) {
                if (remainingToRestore <= 0) break

                const currentStockQuantity = Number(stockItem.quantity) || 0
                const quantityToRestoreToThisLot = remainingToRestore
                const newQuantity = currentStockQuantity + quantityToRestoreToThisLot

                // Mettre à jour le stock de ce lot
                const { error: updateError } = await supabase
                    .from('stock')
                    .update({ quantity: newQuantity })
                    .eq('id', stockItem.id)

                if (updateError) {
                    console.error(`Erreur lors de la restauration du stock pour ${productId} (lot ${stockItem.id}):`, updateError)
                } else {
                    console.log(`Stock restauré: ${productId} - ${quantityToRestoreToThisLot} ${stockUnit} au lot ${stockItem.id} (nouveau stock: ${newQuantity})`)
                }

                remainingToRestore = 0 // On restaure tout dans le premier lot disponible
                break
            }

            // Si il reste encore de la quantité à restaurer après avoir rempli tous les lots, créer un nouveau lot
            if (remainingToRestore > 0) {
                const { error: insertError } = await supabase
                    .from('stock')
                    .insert({
                        establishment_id: establishmentId,
                        product_id: productId,
                        quantity: remainingToRestore,
                        unit_price: 0, // Prix par défaut
                        initial_quantity: remainingToRestore
                    })

                if (insertError) {
                    console.error(`Erreur lors de la création d'un nouveau lot de stock pour ${productId}:`, insertError)
                } else {
                    console.log(`Stock restauré (nouveau lot): ${productId} - ${remainingToRestore} ${stockUnit}`)
                }
            }
        }
    }

    // Déduire le stock pour tous les ingrédients d'un menu_item
    const deductStockFromSale = async (menuItemId: string, saleQuantity: number, establishmentId: string): Promise<void> => {
        // Récupérer tous les ingrédients du menu_item
        const { data: ingredients, error: ingredientsError } = await supabase
            .from('menu_item_ingredients')
            .select(`
                product_id,
                quantity,
                unit,
                product:products(*)
            `)
            .eq('menu_item_id', menuItemId)

        if (ingredientsError) {
            console.error('Erreur lors de la récupération des ingrédients:', ingredientsError)
            return
        }

        if (!ingredients || ingredients.length === 0) {
            console.warn('Aucun ingrédient trouvé pour ce menu_item')
            return
        }

        // Pour chaque ingrédient, déduire le stock
        for (const ingredient of ingredients) {
            const productId = ingredient.product_id
            const ingredientQuantity = Number(ingredient.quantity) || 0
            const ingredientUnit = ingredient.unit || 'unités'
            
            // Quantité totale à déduire = quantité par portion × nombre de portions vendues
            const totalQuantityToDeduct = ingredientQuantity * saleQuantity

            // Récupérer tous les lots de stock pour ce produit (FIFO: First In First Out)
            const { data: allStocks, error: stockError } = await supabase
                .from('stock')
                .select(`
                    *,
                    product:products(*)
                `)
                .eq('product_id', productId)
                .eq('establishment_id', establishmentId)
                .gt('quantity', 0) // Seulement les lots avec du stock disponible
                .order('created_at', { ascending: true }) // Les plus anciens en premier (FIFO)

            if (stockError || !allStocks || allStocks.length === 0) {
                console.warn(`Stock introuvable pour le produit ${productId}:`, stockError?.message)
                continue
            }

            // Récupérer l'unité du produit depuis le premier lot
            const firstStock = allStocks[0]
            const stockUnit = (firstStock.product as Product)?.unit || 'unités'

            // Convertir la quantité de l'ingrédient vers l'unité du stock
            let remainingToDeduct = convertToStockUnit(
                totalQuantityToDeduct,
                ingredientUnit,
                stockUnit
            )

            // Déduire le stock en utilisant la stratégie FIFO
            for (const stockItem of allStocks) {
                if (remainingToDeduct <= 0) break

                const currentStockQuantity = Number(stockItem.quantity) || 0
                if (currentStockQuantity <= 0) continue

                const quantityToDeductFromThisLot = Math.min(remainingToDeduct, currentStockQuantity)
                const newQuantity = Math.max(0, currentStockQuantity - quantityToDeductFromThisLot)

                // Mettre à jour le stock de ce lot
                const { error: updateError } = await supabase
                    .from('stock')
                    .update({ quantity: newQuantity })
                    .eq('id', stockItem.id)

                if (updateError) {
                    console.error(`Erreur lors de la mise à jour du stock pour ${productId} (lot ${stockItem.id}):`, updateError)
                } else {
                    console.log(`Stock déduit: ${productId} - ${quantityToDeductFromThisLot} ${stockUnit} du lot ${stockItem.id} (nouveau stock: ${newQuantity})`)
                }

                remainingToDeduct -= quantityToDeductFromThisLot
            }

            if (remainingToDeduct > 0) {
                console.warn(`Stock insuffisant pour le produit ${productId}. Il manque ${remainingToDeduct} ${stockUnit}`)
            }
        }
    }

    // Enregistrer une nouvelle vente
    const enregistrerVente = async (menuItemId: string, quantity: number): Promise<{ success: boolean; error?: string }> => {
        try {
            // Récupérer le prix du menu
            const menuItem = menuItems.find(m => m.id === menuItemId)
            if (!menuItem) {
                throw new Error('Menu introuvable')
            }

            // Récupérer l'utilisateur et son établissement
            const { data: userData } = await supabase.auth.getUser()
            if (!userData.user) throw new Error('Non authentifié')

            const { data: profile } = await supabase
                .from('profiles')
                .select('establishment_id')
                .eq('id', userData.user.id)
                .single()

            if (!profile?.establishment_id) throw new Error("Pas d'établissement associé")

            const unitPrice = Number(menuItem.selling_price)
            const totalPrice = unitPrice * quantity

            const venteData: InsertVente = {
                establishment_id: profile.establishment_id,
                menu_item_id: menuItemId,
                quantity,
                unit_price: unitPrice,
                total_price: totalPrice,
                sold_by: userData.user.id
            }

            const { error: insertError } = await supabase
                .from('ventes')
                .insert(venteData)

            if (insertError) throw insertError

            // Déduire le stock pour tous les ingrédients du menu_item
            await deductStockFromSale(menuItemId, quantity, profile.establishment_id)

            // Rafraîchir les ventes
            await fetchVentesJour()

            return { success: true }
        } catch (err) {
            const message = err instanceof Error ? err.message : "Erreur lors de l'enregistrement"
            setError(message)
            return { success: false, error: message }
        }
    }

    // Supprimer une vente
    const supprimerVente = async (venteId: string): Promise<{ success: boolean; error?: string }> => {
        try {
            // Récupérer les informations de la vente avant de la supprimer
            const { data: venteData, error: fetchError } = await supabase
                .from('ventes')
                .select('menu_item_id, quantity, establishment_id')
                .eq('id', venteId)
                .single()

            if (fetchError) throw fetchError

            if (!venteData) {
                throw new Error('Vente introuvable')
            }

            // Restaurer le stock avant de supprimer la vente
            await restoreStockFromSale(
                venteData.menu_item_id,
                venteData.quantity,
                venteData.establishment_id
            )

            // Supprimer la vente
            const { error: deleteError } = await supabase
                .from('ventes')
                .delete()
                .eq('id', venteId)

            if (deleteError) throw deleteError

            // Rafraîchir les ventes et les stats
            await Promise.all([fetchVentesJour(), fetchStatsMois()])

            return { success: true }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erreur lors de la suppression'
            setError(message)
            return { success: false, error: message }
        }
    }

    // Récupérer l'historique des ventes sur une période
    const fetchHistorique = async (startDate: Date, endDate: Date): Promise<VenteWithMenuItem[]> => {
        try {
            const { data, error: fetchError } = await supabase
                .from('ventes')
                .select(`
          *,
          menu_item:menu_items(
            *,
            ingredients:menu_item_ingredients(
              *,
              product:products(*)
            )
          )
        `)
                .gte('created_at', startDate.toISOString())
                .lte('created_at', endDate.toISOString())
                .order('created_at', { ascending: false })

            if (fetchError) throw fetchError

            // Transformer les données pour inclure le produit principal
            const ventesWithProducts = (data || []).map((vente: any) => {
                const menuItem = vente.menu_item
                if (menuItem && menuItem.ingredients && menuItem.ingredients.length > 0) {
                    const firstIngredient = menuItem.ingredients[0]
                    return {
                        ...vente,
                        menu_item: {
                            ...menuItem,
                            product: firstIngredient?.product || null
                        }
                    }
                }
                return vente
            })

            return ventesWithProducts as VenteWithMenuItem[]
        } catch (err) {
            console.error('Erreur lors du chargement de l\'historique:', err)
            return []
        }
    }

    // Calculer les stats du mois
    const fetchStatsMois = useCallback(async () => {
        try {
            const startOfMonth = new Date()
            startOfMonth.setDate(1)
            startOfMonth.setHours(0, 0, 0, 0)

            const { data, error: fetchError } = await supabase
                .from('ventes')
                .select('total_price')
                .gte('created_at', startOfMonth.toISOString())

            if (fetchError) throw fetchError

            const totalMois = (data || []).reduce((sum, v) => sum + Number(v.total_price), 0)
            const nbVentesMois = (data || []).length

            setStats(prev => ({
                ...prev,
                totalMois,
                nbVentesMois
            }))
        } catch (err) {
            console.error('Erreur lors du calcul des stats mois:', err)
        }
    }, [supabase])

    // Initialisation
    useEffect(() => {
        let isMounted = true

        const initialize = async () => {
            setLoading(true)
            await Promise.all([
                fetchVentesJour(),
                fetchMenuItems(),
                fetchStatsMois()
            ])
            if (isMounted) setLoading(false)
        }

        initialize()

        // Abonnement realtime aux nouvelles ventes
        const channel = supabase
            .channel('ventes_changes')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'ventes' },
                () => {
                    fetchVentesJour()
                    fetchStatsMois()
                }
            )
            .subscribe()

        return () => {
            isMounted = false
            supabase.removeChannel(channel)
        }
    }, [fetchVentesJour, fetchMenuItems, fetchStatsMois, supabase])

    return {
        ventes,
        menuItems,
        stats,
        loading,
        error,
        enregistrerVente,
        supprimerVente,
        fetchHistorique,
        refresh: fetchVentesJour
    }
}
