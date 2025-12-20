import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, XCircle, Clock, TrendingUp } from 'lucide-react'

export function ChecksStats() {
  const stats = [
    {
      title: 'Checks Today',
      value: '8',
      icon: CheckCircle2,
      description: 'Completed',
      color: 'text-chart-2',
    },
    {
      title: 'Pass Rate',
      value: '94%',
      icon: TrendingUp,
      description: 'This week',
      color: 'text-chart-2',
    },
    {
      title: 'Failed Checks',
      value: '3',
      icon: XCircle,
      description: 'Require attention',
      color: 'text-destructive',
    },
    {
      title: 'Pending',
      value: '2',
      icon: Clock,
      description: 'Scheduled',
      color: 'text-chart-1',
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
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
