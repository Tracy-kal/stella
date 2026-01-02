"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  TrendingUp,
  Wallet,
  Users,
  Radio,
  BarChart3,
  Settings,
  LogOut,
  Home,
  Menu,
  X,
} from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function DashboardNav() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/trade", label: "Trade", icon: TrendingUp },
    { href: "/dashboard/portfolio", label: "Portfolio", icon: BarChart3 },
    { href: "/dashboard/deposits", label: "Deposits", icon: Wallet },
    { href: "/dashboard/copy-trading", label: "Copy Trading", icon: Users },
    { href: "/dashboard/signals", label: "Signals", icon: Radio },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
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
            <div className="flex h-8 w-8 items-center justify-center bg-primary">
              <span className="font-mono text-sm font-bold text-primary-foreground">S1</span>
            </div>
            <span className="font-bold text-foreground">StellaOne</span>
          </div>
          <nav className="flex-1 space-y-1 p-4">
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
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center bg-primary">
            <span className="font-mono text-sm font-bold text-primary-foreground">S1</span>
          </div>
          <span className="font-bold text-foreground">StellaOne</span>
        </Link>
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
          { href: "/dashboard", icon: Home },
          { href: "/dashboard/trade", icon: TrendingUp },
          { href: "/dashboard/portfolio", icon: BarChart3 },
          { href: "/dashboard/deposits", icon: Wallet },
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
