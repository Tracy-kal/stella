"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  ArrowDownToLine,
  ArrowUpFromLine,
  Settings,
  LogOut,
  Shield,
  Menu,
  X,
  MessageSquare,
  FileText,
  Radio,
  UserCog,
} from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function AdminNav() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/investments", label: "Investments", icon: TrendingUp },
    { href: "/admin/trades", label: "Trades", icon: UserCog },
    { href: "/admin/deposits", label: "Deposits", icon: ArrowDownToLine },
    { href: "/admin/withdrawals", label: "Withdrawals", icon: ArrowUpFromLine },
    { href: "/admin/signals", label: "Signals", icon: Radio },
    { href: "/admin/kyc", label: "KYC", icon: Shield },
    { href: "/admin/support", label: "Support", icon: MessageSquare },
    { href: "/admin/blog", label: "Blog", icon: FileText },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ]

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-border bg-card md:block">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center gap-2 border-b border-border px-6">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold text-foreground">Admin Panel</span>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3",
                      isActive && "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary",
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </nav>
          <div className="border-t border-border p-4">
            <Button variant="ghost" className="w-full justify-start gap-3 text-destructive" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-card px-4 md:hidden">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-bold text-foreground">Admin</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background md:hidden" style={{ top: "64px" }}>
          <nav className="flex flex-col gap-2 p-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3",
                      isActive && "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary",
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-destructive"
              onClick={() => {
                setMobileMenuOpen(false)
                handleLogout()
              }}
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          </nav>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border bg-card py-2 md:hidden">
        {[
          { href: "/admin", icon: LayoutDashboard },
          { href: "/admin/users", icon: Users },
          { href: "/admin/deposits", icon: ArrowDownToLine },
          { href: "/admin/withdrawals", icon: ArrowUpFromLine },
        ].map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-12 w-12", isActive && "bg-primary/10 text-primary hover:bg-primary/20")}
              >
                <item.icon className="h-5 w-5" />
              </Button>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
