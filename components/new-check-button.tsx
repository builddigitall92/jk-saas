'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { NewCheckDialog } from '@/components/new-check-dialog'

export function NewCheckButton() {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setDialogOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        New Check
      </Button>
      <NewCheckDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  )
}
