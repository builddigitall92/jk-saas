'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckDetailsDialog } from '@/components/check-details-dialog'

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

const mockChecks: ServiceCheck[] = [
  {
    id: '1',
    checkNumber: 'CHK-001',
    area: 'kitchen',
    inspector: 'John Smith',
    date: '2025-11-19',
    time: '09:30',
    status: 'passed',
    score: 95,
    items: [
      { category: 'Cleanliness', question: 'Floors are clean and dry', passed: true },
      { category: 'Cleanliness', question: 'Surfaces sanitized', passed: true },
      { category: 'Temperature', question: 'Refrigerators at correct temp', passed: true },
      { category: 'Temperature', question: 'Freezers at correct temp', passed: true },
      { category: 'Equipment', question: 'All equipment functioning', passed: true },
      { category: 'Safety', question: 'Fire extinguisher accessible', passed: true },
    ],
  },
  {
    id: '2',
    checkNumber: 'CHK-002',
    area: 'dining',
    inspector: 'Sarah Johnson',
    date: '2025-11-19',
    time: '11:00',
    status: 'passed',
    score: 100,
    items: [
      { category: 'Cleanliness', question: 'Tables cleaned', passed: true },
      { category: 'Cleanliness', question: 'Floors swept', passed: true },
      { category: 'Organization', question: 'Condiments stocked', passed: true },
      { category: 'Maintenance', question: 'Chairs in good condition', passed: true },
    ],
  },
  {
    id: '3',
    checkNumber: 'CHK-003',
    area: 'storage',
    inspector: 'Mike Brown',
    date: '2025-11-18',
    time: '15:45',
    status: 'failed',
    score: 70,
    items: [
      { category: 'Organization', question: 'Items properly labeled', passed: false, notes: 'Some boxes missing labels' },
      { category: 'Organization', question: 'FIFO system followed', passed: true },
      { category: 'Temperature', question: 'Storage temp appropriate', passed: true },
      { category: 'Cleanliness', question: 'Area clean and organized', passed: false, notes: 'Needs reorganization' },
      { category: 'Safety', question: 'No pest signs', passed: true },
    ],
  },
  {
    id: '4',
    checkNumber: 'CHK-004',
    area: 'equipment',
    inspector: 'John Smith',
    date: '2025-11-18',
    time: '13:30',
    status: 'passed',
    score: 90,
    items: [
      { category: 'Maintenance', question: 'Fryers cleaned', passed: true },
      { category: 'Maintenance', question: 'Grills maintained', passed: true },
      { category: 'Safety', question: 'Guards in place', passed: true },
      { category: 'Functionality', question: 'All equipment operational', passed: true },
    ],
  },
]

export function ServiceChecksList() {
  const [selectedCheck, setSelectedCheck] = useState<ServiceCheck | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

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

  const filterChecks = (checks: ServiceCheck[]) => {
    if (activeTab === 'all') return checks
    return checks.filter((check) => check.status === activeTab)
  }

  const handleViewDetails = (check: ServiceCheck) => {
    setSelectedCheck(check)
    setDetailsDialogOpen(true)
  }

  const filteredChecks = filterChecks(mockChecks)

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Checks</TabsTrigger>
          <TabsTrigger value="passed">Passed</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <div className="space-y-4">
            {filteredChecks.map((check) => (
              <Card key={check.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {check.checkNumber}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {getAreaLabel(check.area)} • {check.inspector}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={getStatusColor(check.status)}
                      >
                        {check.status.charAt(0).toUpperCase() + check.status.slice(1)}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(check)}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="text-sm font-medium text-foreground">
                        {new Date(check.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Time</p>
                      <p className="text-sm font-medium text-foreground">
                        {check.time}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Score</p>
                      <p className="text-sm font-medium text-foreground">
                        {check.score}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Items</p>
                      <p className="text-sm font-medium text-foreground">
                        {check.items.filter((item) => item.passed).length}/{check.items.length} passed
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredChecks.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">
                    No checks found for this filter
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {selectedCheck && (
        <CheckDetailsDialog
          check={selectedCheck}
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
        />
      )}
    </>
  )
}
