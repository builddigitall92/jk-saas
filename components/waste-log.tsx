'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface WasteEntry {
  id: string
  itemName: string
  quantity: number
  unit: string
  reason: 'expired' | 'damaged' | 'overproduction' | 'contamination' | 'other'
  estimatedCost: number
  date: string
  notes: string
}

const mockWasteData: WasteEntry[] = [
  {
    id: '1',
    itemName: 'Lettuce',
    quantity: 3,
    unit: 'kg',
    reason: 'expired',
    estimatedCost: 10.5,
    date: '2025-11-19',
    notes: 'Past expiration date',
  },
  {
    id: '2',
    itemName: 'Burger Buns',
    quantity: 20,
    unit: 'units',
    reason: 'expired',
    estimatedCost: 8,
    date: '2025-11-18',
    notes: 'Mold found',
  },
  {
    id: '3',
    itemName: 'French Fries',
    quantity: 5,
    unit: 'kg',
    reason: 'overproduction',
    estimatedCost: 22.5,
    date: '2025-11-18',
    notes: 'Made too much during slow period',
  },
  {
    id: '4',
    itemName: 'Tomatoes',
    quantity: 2,
    unit: 'kg',
    reason: 'damaged',
    estimatedCost: 8,
    date: '2025-11-17',
    notes: 'Bruised during delivery',
  },
  {
    id: '5',
    itemName: 'Ground Beef',
    quantity: 1,
    unit: 'kg',
    reason: 'expired',
    estimatedCost: 12,
    date: '2025-11-17',
    notes: 'Expired overnight',
  },
  {
    id: '6',
    itemName: 'Cheese Slices',
    quantity: 50,
    unit: 'slices',
    reason: 'contamination',
    estimatedCost: 25,
    date: '2025-11-16',
    notes: 'Cross contamination',
  },
]

export function WasteLog() {
  const [searchQuery, setSearchQuery] = useState('')
  const [reasonFilter, setReasonFilter] = useState<string>('all')

  const filteredWaste = mockWasteData.filter((entry) => {
    const matchesSearch =
      entry.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.notes.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesReason = reasonFilter === 'all' || entry.reason === reasonFilter
    return matchesSearch && matchesReason
  })

  const getReasonColor = (reason: WasteEntry['reason']) => {
    switch (reason) {
      case 'expired':
        return 'bg-destructive/10 text-destructive'
      case 'damaged':
        return 'bg-chart-4/10 text-chart-4'
      case 'overproduction':
        return 'bg-chart-1/10 text-chart-1'
      case 'contamination':
        return 'bg-chart-5/10 text-chart-5'
      case 'other':
        return 'bg-muted text-muted-foreground'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const totalCost = filteredWaste.reduce(
    (sum, entry) => sum + entry.estimatedCost,
    0
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Waste Log</CardTitle>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search waste entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={reasonFilter} onValueChange={setReasonFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by reason" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reasons</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="damaged">Damaged</SelectItem>
              <SelectItem value="overproduction">Overproduction</SelectItem>
              <SelectItem value="contamination">Contamination</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {filteredWaste.length > 0 && (
          <div className="mt-4 rounded-lg bg-muted p-3">
            <p className="text-sm text-muted-foreground">
              Showing {filteredWaste.length} entries • Total cost:{' '}
              <span className="font-semibold text-foreground">
                ${totalCost.toFixed(2)}
              </span>
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredWaste.map((entry) => (
            <div
              key={entry.id}
              className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-foreground">{entry.itemName}</h3>
                  <Badge variant="outline" className={getReasonColor(entry.reason)}>
                    {entry.reason.charAt(0).toUpperCase() + entry.reason.slice(1)}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {entry.quantity} {entry.unit} • {entry.notes}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(entry.date).toLocaleDateString()}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-lg font-semibold text-foreground">
                  ${entry.estimatedCost.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">Estimated cost</p>
              </div>
            </div>
          ))}
          {filteredWaste.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No waste entries found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
