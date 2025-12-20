import { DashboardNav } from '@/components/dashboard-nav'

export default function WasteLayout({
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
