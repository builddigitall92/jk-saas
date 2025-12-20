import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'

type Product = Database['public']['Tables']['products']['Row']

export function useRealtimeProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Charger les produits initiaux
    async function loadProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (!error && data) {
        setProducts(data)
      }
      setLoading(false)
    }

    loadProducts()

    // S'abonner aux changements en temps réel
    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setProducts(prev => [payload.new as Product, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setProducts(prev => 
              prev.map(p => p.id === payload.new.id ? payload.new as Product : p)
            )
          } else if (payload.eventType === 'DELETE') {
            setProducts(prev => prev.filter(p => p.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { products, loading }
}

export function useRealtimeSuppliers() {
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSuppliers() {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (!error && data) {
        setSuppliers(data)
      }
      setLoading(false)
    }

    loadSuppliers()

    const channel = supabase
      .channel('suppliers-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'suppliers' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setSuppliers(prev => [payload.new, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setSuppliers(prev => 
              prev.map(s => s.id === payload.new.id ? payload.new : s)
            )
          } else if (payload.eventType === 'DELETE') {
            setSuppliers(prev => prev.filter(s => s.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { suppliers, loading }
}

export function useRealtimeWaste() {
  const [wasteRecords, setWasteRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadWaste() {
      const { data, error } = await supabase
        .from('waste_records')
        .select('*, product:products(name), user:profiles(first_name, last_name)')
        .order('created_at', { ascending: false })
      
      if (!error && data) {
        setWasteRecords(data)
      }
      setLoading(false)
    }

    loadWaste()

    const channel = supabase
      .channel('waste-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'waste_records' },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const { data } = await supabase
              .from('waste_records')
              .select('*, product:products(name), user:profiles(first_name, last_name)')
              .eq('id', payload.new.id)
              .single()
            
            if (data) {
              setWasteRecords(prev => [data, ...prev])
            }
          } else if (payload.eventType === 'UPDATE') {
            const { data } = await supabase
              .from('waste_records')
              .select('*, product:products(name), user:profiles(first_name, last_name)')
              .eq('id', payload.new.id)
              .single()
            
            if (data) {
              setWasteRecords(prev => 
                prev.map(w => w.id === data.id ? data : w)
              )
            }
          } else if (payload.eventType === 'DELETE') {
            setWasteRecords(prev => prev.filter(w => w.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { wasteRecords, loading }
}

export function useRealtimeChecklist() {
  const [checklistItems, setChecklistItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadChecklist() {
      const { data, error } = await supabase
        .from('checklist_items')
        .select('*')
        .order('order', { ascending: true })
      
      if (!error && data) {
        setChecklistItems(data)
      }
      setLoading(false)
    }

    loadChecklist()

    const channel = supabase
      .channel('checklist-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'checklist_items' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setChecklistItems(prev => [...prev, payload.new])
          } else if (payload.eventType === 'UPDATE') {
            setChecklistItems(prev => 
              prev.map(item => item.id === payload.new.id ? payload.new : item)
            )
          } else if (payload.eventType === 'DELETE') {
            setChecklistItems(prev => prev.filter(item => item.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { checklistItems, loading }
}
