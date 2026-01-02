"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, ArrowLeft } from "lucide-react"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error

      // Check if user is admin
      const { data: adminUser } = await supabase.from("admin_users").select("id").eq("id", data.user.id).single()

      if (!adminUser) {
        await supabase.auth.signOut()
        throw new Error("Access denied. Admin credentials required.")
      }

      router.push("/admin")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <img
          src="/image/pexels-michael-steinberg-95604-318820.jpg"
          alt="Background"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/85 to-background/95" />
      </div>

      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-white/80 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <Card className="backdrop-blur-xl bg-card/80 border-border/50 shadow-2xl">
          <CardHeader className="space-y-1">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-center text-2xl font-bold">Admin Login</CardTitle>
            <CardDescription className="text-center">Access the administration panel</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Admin Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@stellaonecapitals.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In as Admin"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
