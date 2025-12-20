import { DashboardNav } from '@/components/dashboard-nav'

export default function StockLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <DashboardNav />
      {children}
    </>
  )
}
