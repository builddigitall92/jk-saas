import { DashboardNav } from '@/components/dashboard-nav'

export default function OrdersLayout({
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
