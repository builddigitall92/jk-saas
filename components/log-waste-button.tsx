'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { LogWasteDialog } from '@/components/log-waste-dialog'

export function LogWasteButton() {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setDialogOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        Log Waste
      </Button>
      <LogWasteDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  )
}
