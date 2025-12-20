"use client"

import { useState, useEffect } from 'react'

export interface LandingStats {
  establishments: number
  products: number
  suppliers: number
  deliveredOrders: number
  resolvedAlerts: number
  totalStockValue: number
  totalStockQuantity: number
  wasteReduction: number
  timeSaved: number
  costReduction: number
}

const defaultStats: LandingStats = {
  establishments: 0,
  products: 0,
  suppliers: 0,
  deliveredOrders: 0,
  resolvedAlerts: 0,
  totalStockValue: 0,
  totalStockQuantity: 0,
  wasteReduction: 28,
  timeSaved: 2,
  costReduction: 22
}

export function useLandingStats() {
  const [stats, setStats] = useState<LandingStats>(defaultStats)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/stats')
        if (!response.ok) throw new Error('Failed to fetch stats')
        const data = await response.json()
        setStats(data)
      } catch (err) {
        console.error('Error fetching landing stats:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, loading, error }
}
