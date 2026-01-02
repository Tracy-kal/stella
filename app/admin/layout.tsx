import type React from "react"
import { AdminNav } from "@/components/admin/admin-nav"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <main className="pb-20 pt-16 md:ml-64 md:pb-0 md:pt-0">{children}</main>
    </div>
  )
}
