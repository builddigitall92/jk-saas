'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface CheckItem {
  category: string
  question: string
  passed: boolean
  notes: string
}

interface NewCheckDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const checkTemplates = {
  kitchen: [
    { category: 'Cleanliness', question: 'Floors are clean and dry' },
    { category: 'Cleanliness', question: 'Surfaces sanitized' },
    { category: 'Temperature', question: 'Refrigerators at correct temp' },
    { category: 'Temperature', question: 'Freezers at correct temp' },
    { category: 'Equipment', question: 'All equipment functioning' },
    { category: 'Safety', question: 'Fire extinguisher accessible' },
  ],
  dining: [
    { category: 'Cleanliness', question: 'Tables cleaned' },
    { category: 'Cleanliness', question: 'Floors swept' },
    { category: 'Organization', question: 'Condiments stocked' },
    { category: 'Maintenance', question: 'Chairs in good condition' },
  ],
  storage: [
    { category: 'Organization', question: 'Items properly labeled' },
    { category: 'Organization', question: 'FIFO system followed' },
    { category: 'Temperature', question: 'Storage temp appropriate' },
    { category: 'Cleanliness', question: 'Area clean and organized' },
    { category: 'Safety', question: 'No pest signs' },
  ],
  restroom: [
    { category: 'Cleanliness', question: 'Toilets clean' },
    { category: 'Cleanliness', question: 'Sinks clean' },
    { category: 'Supplies', question: 'Soap dispensers filled' },
    { category: 'Supplies', question: 'Paper towels stocked' },
  ],
  equipment: [
    { category: 'Maintenance', question: 'Fryers cleaned' },
    { category: 'Maintenance', question: 'Grills maintained' },
    { category: 'Safety', question: 'Guards in place' },
    { category: 'Functionality', question: 'All equipment operational' },
  ],
}

export function NewCheckDialog({ open, onOpenChange }: NewCheckDialogProps) {
  const [area, setArea] = useState<keyof typeof checkTemplates | ''>('')
  const [inspector, setInspector] = useState('')
  const [items, setItems] = useState<CheckItem[]>([])

  const handleAreaChange = (value: string) => {
    setArea(value as keyof typeof checkTemplates)
    const template = checkTemplates[value as keyof typeof checkTemplates] || []
    setItems(
      template.map((item) => ({
        ...item,
        passed: false,
        notes: '',
      }))
    )
  }

  const handleItemToggle = (index: number) => {
    const newItems = [...items]
    newItems[index].passed = !newItems[index].passed
    setItems(newItems)
  }

  const handleNotesChange = (index: number, notes: string) => {
    const newItems = [...items]
    newItems[index].notes = notes
    setItems(newItems)
  }

  const calculateScore = () => {
    if (items.length === 0) return 0
    const passedCount = items.filter((item) => item.passed).length
    return Math.round((passedCount / items.length) * 100)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('[v0] Creating service check:', {
      area,
      inspector,
      items,
      score: calculateScore(),
    })
    // TODO: Implement actual save logic
    onOpenChange(false)
    setArea('')
    setInspector('')
    setItems([])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>New Service Quality Check</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="check-area">Area</Label>
            <Select value={area} onValueChange={handleAreaChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select area to inspect" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kitchen">Kitchen</SelectItem>
                <SelectItem value="dining">Dining Area</SelectItem>
                <SelectItem value="storage">Storage</SelectItem>
                <SelectItem value="restroom">Restroom</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="check-inspector">Inspector Name</Label>
            <Input
              id="check-inspector"
              placeholder="e.g., John Smith"
              value={inspector}
              onChange={(e) => setInspector(e.target.value)}
              required
            />
          </div>

          {items.length > 0 && (
            <div className="space-y-3">
              <Label>Checklist Items</Label>
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="space-y-2 rounded-lg border border-border p-4"
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={`item-${index}`}
                        checked={item.passed}
                        onCheckedChange={() => handleItemToggle(index)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <label
                          htmlFor={`item-${index}`}
                          className="text-sm font-medium leading-none text-foreground"
                        >
                          {item.question}
                        </label>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {item.category}
                        </p>
                      </div>
                    </div>
                    {!item.passed && (
                      <Textarea
                        placeholder="Add notes about the issue..."
                        value={item.notes}
                        onChange={(e) => handleNotesChange(index, e.target.value)}
                        rows={2}
                        className="mt-2"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {items.length > 0 && (
            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  Inspection Score
                </span>
                <span className="text-lg font-bold text-foreground">
                  {calculateScore()}%
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {items.filter((item) => item.passed).length} of {items.length} items
                passed
              </p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!area || !inspector || items.length === 0}>
              Complete Check
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
