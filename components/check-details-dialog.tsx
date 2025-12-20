'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle } from 'lucide-react'

interface CheckItem {
  category: string
  question: string
  passed: boolean
  notes?: string
}

interface ServiceCheck {
  id: string
  checkNumber: string
  area: 'kitchen' | 'dining' | 'storage' | 'restroom' | 'equipment'
  inspector: string
  date: string
  time: string
  status: 'passed' | 'failed' | 'pending'
  score: number
  items: CheckItem[]
}

interface CheckDetailsDialogProps {
  check: ServiceCheck
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CheckDetailsDialog({
  check,
  open,
  onOpenChange,
}: CheckDetailsDialogProps) {
  const getStatusColor = (status: ServiceCheck['status']) => {
    switch (status) {
      case 'passed':
        return 'bg-chart-2/10 text-chart-2'
      case 'failed':
        return 'bg-destructive/10 text-destructive'
      case 'pending':
        return 'bg-chart-1/10 text-chart-1'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getAreaLabel = (area: ServiceCheck['area']) => {
    return area.charAt(0).toUpperCase() + area.slice(1)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{check.checkNumber}</DialogTitle>
            <Badge variant="outline" className={getStatusColor(check.status)}>
              {check.status.charAt(0).toUpperCase() + check.status.slice(1)}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Area</p>
              <p className="text-base font-medium text-foreground">
                {getAreaLabel(check.area)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Inspector</p>
              <p className="text-base font-medium text-foreground">{check.inspector}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date & Time</p>
              <p className="text-base font-medium text-foreground">
                {new Date(check.date).toLocaleDateString()} at {check.time}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Score</p>
              <p className="text-base font-medium text-foreground">{check.score}%</p>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-medium text-foreground">
              Inspection Items
            </h3>
            <div className="space-y-2">
              {check.items.map((item, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-border p-4"
                >
                  <div className="flex items-start gap-3">
                    {item.passed ? (
                      <CheckCircle2 className="h-5 w-5 text-chart-2" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {item.question}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.category}
                      </p>
                      {item.notes && (
                        <p className="mt-2 text-sm text-foreground">
                          Note: {item.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                Overall Result
              </span>
              <span className="text-lg font-bold text-foreground">
                {check.items.filter((item) => item.passed).length}/{check.items.length} passed
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
