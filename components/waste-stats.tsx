import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingDown, DollarSign, Package, AlertTriangle } from 'lucide-react'

export function WasteStats() {
  const stats = [
    {
      title: 'This Week',
      value: '$342',
      icon: DollarSign,
      description: 'Total waste cost',
      trend: '-12%',
    },
    {
      title: 'This Month',
      value: '$1,456',
      icon: TrendingDown,
      description: 'Monthly waste',
      trend: '-8%',
    },
    {
      title: 'Items Wasted',
      value: '24',
      icon: Package,
      description: 'This week',
    },
    {
      title: 'Top Reason',
      value: 'Expired',
      icon: AlertTriangle,
      description: '62% of waste',
    },
  ]

  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
              {stat.trend && (
                <span className="ml-2 text-chart-2">{stat.trend}</span>
              )}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
