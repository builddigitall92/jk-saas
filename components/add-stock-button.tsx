'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { AddStockDialog } from '@/components/add-stock-dialog'

export function AddStockButton() {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setDialogOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        Add Item
      </Button>
      <AddStockDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  )
}
