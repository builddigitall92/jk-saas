'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { CreateOrderDialog } from '@/components/create-order-dialog'

export function CreateOrderButton() {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setDialogOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        New Order
      </Button>
      <CreateOrderDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  )
}
