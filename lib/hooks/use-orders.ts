"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { Order, Supplier } from '@/lib/database.types'

export interface OrderWithSupplier extends Order {
  supplier: Supplier
}

export function useOrders() {
  const [orders, setOrders] = useState<OrderWithSupplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          supplier:suppliers(*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data as OrderWithSupplier[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const pendingOrders = orders.filter(o => o.status === 'pending')
  const confirmedOrders = orders.filter(o => o.status === 'confirmed')
  const deliveredOrders = orders.filter(o => o.status === 'delivered')

  return {
    orders,
    loading,
    error,
    fetchOrders,
    pendingOrders,
    confirmedOrders,
    deliveredOrders
  }
}
