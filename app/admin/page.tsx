import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, TrendingUp, ArrowDownToLine, ArrowUpFromLine, DollarSign } from "lucide-react"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/admin/login")

  const { data: adminUser } = await supabase.from("admin_users").select("*").eq("id", user.id).single()
  if (!adminUser) redirect("/")

  // Fetch statistics
  const { count: totalUsers } = await supabase.from("users").select("*", { count: "exact", head: true })
  const { count: activeUsers } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("account_status", "active")
  const { count: blockedUsers } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("account_status", "blocked")

  const { count: activeInvestments } = await supabase
    .from("investments")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")

  const { count: pendingDeposits } = await supabase
    .from("transactions")
    .select("*", { count: "exact", head: true })
    .eq("type", "deposit")
    .eq("status", "pending")

  const { count: pendingWithdrawals } = await supabase
    .from("transactions")
    .select("*", { count: "exact", head: true })
    .eq("type", "withdrawal")
    .eq("status", "pending")

  const { data: totalDepositsData } = await supabase
    .from("transactions")
    .select("amount")
    .eq("type", "deposit")
    .eq("status", "approved")

  const totalDeposits = totalDepositsData?.reduce((sum, t) => sum + Number(t.amount), 0) || 0

  const { data: recentUsers } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)

  const { data: pendingDepositsData } = await supabase
    .from("transactions")
    .select("*, users(full_name, email)")
    .eq("type", "deposit")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Welcome back, {adminUser.full_name}</p>
        </div>

        {/* Statistics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalUsers || 0}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                {activeUsers || 0} active, {blockedUsers || 0} blocked
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Investments</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{activeInvestments || 0}</div>
              <p className="mt-1 text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Deposits</CardTitle>
              <ArrowDownToLine className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{pendingDeposits || 0}</div>
              <p className="mt-1 text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Withdrawals</CardTitle>
              <ArrowUpFromLine className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{pendingWithdrawals || 0}</div>
              <p className="mt-1 text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>
        </div>

        {/* Total Deposits Card */}
        <Card className="border-primary bg-primary/5">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Deposits (Approved)</p>
              <p className="mt-1 text-4xl font-bold text-foreground">${totalDeposits.toFixed(2)}</p>
            </div>
            <DollarSign className="h-16 w-16 text-primary opacity-20" />
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Users */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
            </CardHeader>
            <CardContent>
              {recentUsers && recentUsers.length > 0 ? (
                <div className="space-y-4">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between border-b border-border pb-4">
                      <div>
                        <p className="font-medium text-foreground">{user.full_name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm capitalize text-foreground">{user.account_status}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground">No users yet</p>
              )}
            </CardContent>
          </Card>

          {/* Pending Deposits */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Deposits</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingDepositsData && pendingDepositsData.length > 0 ? (
                <div className="space-y-4">
                  {pendingDepositsData.map((deposit) => (
                    <div key={deposit.id} className="flex items-center justify-between border-b border-border pb-4">
                      <div>
                        <p className="font-medium text-foreground">{deposit.users?.full_name}</p>
                        <p className="text-sm text-muted-foreground">{deposit.crypto_type || "Crypto"}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">${deposit.amount}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(deposit.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground">No pending deposits</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
