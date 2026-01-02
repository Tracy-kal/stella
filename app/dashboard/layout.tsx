import type React from "react"
import { DashboardNav } from "@/components/user/dashboard-nav"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main className="pb-20 pt-16 md:ml-64 md:pb-0 md:pt-0">{children}</main>
    </div>
  )
}
