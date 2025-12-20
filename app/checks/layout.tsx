import { DashboardNav } from '@/components/dashboard-nav'

export default function ChecksLayout({
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
