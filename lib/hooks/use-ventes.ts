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
