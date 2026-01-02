import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Wallet, TrendingUp, BarChart3, AlertCircle, CheckCircle2, Clock, ArrowUpRight, ArrowDownRight, Shield, FileText } from "lucide-react"
import { TradingViewWidgetWrapper } from "@/components/tradingview-wrapper"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: userData } = await supabase.from("users").select("*").eq("id", user.id).single()

  const { data: investments } = await supabase
    .from("investments")
    .select("*, investment_plans(*)")
    .eq("user_id", user.id)
    .eq("status", "active")

  const { data: recentTransactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  // Check if user has made any deposit
  const { data: deposits } = await supabase
    .from("transactions")
    .select("id")
    .eq("user_id", user.id)
    .eq("type", "deposit")
    .limit(1)

  const hasDeposited = deposits && deposits.length > 0

  const totalBalance =
    (userData?.balance_deposit || 0) + (userData?.balance_profit || 0) + (userData?.balance_bonus || 0)
  const activeInvestments = investments?.length || 0
  const completedTrades = userData?.completed_trades || 0
  const kycApproved = userData?.kyc_status === 'approved'

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome back, {userData?.full_name || 'Trader'}</h1>
            <p className="mt-1 text-muted-foreground">Here's an overview of your account</p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/dashboard/deposits">Deposit</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/withdrawals">Withdraw</Link>
            </Button>
          </div>
        </div>

        {/* Alerts Section */}
        <div className="space-y-3">
          {/* Trading Restriction - Always show if trading is disabled */}
          {!userData?.can_trade && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="flex items-start gap-3 p-4">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-destructive" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">Trading Restricted</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Contact support or make a deposit to activate trading on your account.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Withdrawal Restriction - Show only after deposit has been made */}
          {hasDeposited && (completedTrades < 2 || !userData?.can_withdraw) && (
            <Card className="border-yellow-500/50 bg-yellow-500/5">
              <CardContent className="flex items-start gap-3 p-4">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-500" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">Withdrawal Locked</p>
                  {completedTrades < 2 ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Complete at least 2 trades to unlock withdrawals. Progress: {completedTrades}/2
                    </p>
                  ) : !userData?.can_withdraw ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Withdrawals have been temporarily disabled on your account. Contact support for assistance.
                    </p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          )}

          {/* KYC Alert - Show if not approved */}
          {!kycApproved && (
            <Card className="border-blue-500/50 bg-blue-500/5">
              <CardContent className="flex items-start gap-3 p-4">
                <Shield className="h-5 w-5 flex-shrink-0 text-blue-500" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">Complete Your Verification</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Verify your identity to unlock full account features including withdrawals.
                  </p>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/dashboard/kyc">Verify Now</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Balance Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
              <Wallet className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">${totalBalance.toFixed(2)}</div>
              <p className="mt-1 text-xs text-muted-foreground">Available funds</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Deposit</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">${(userData?.balance_deposit || 0).toFixed(2)}</div>
              <p className="mt-1 text-xs text-muted-foreground">Main balance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Profit</CardTitle>
              <BarChart3 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">${(userData?.balance_profit || 0).toFixed(2)}</div>
              <p className="mt-1 text-xs text-muted-foreground">Trading earnings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Bonus</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">${(userData?.balance_bonus || 0).toFixed(2)}</div>
              <p className="mt-1 text-xs text-muted-foreground">Rewards & bonuses</p>
            </CardContent>
          </Card>
        </div>

        {/* TradingView Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Live Market Chart
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <TradingViewWidgetWrapper />
          </CardContent>
        </Card>

        {/* Stats Row */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Investments</p>
                  <p className="mt-1 text-3xl font-bold text-foreground">{activeInvestments}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed Trades</p>
                  <p className="mt-1 text-3xl font-bold text-foreground">
                    {completedTrades}/{userData?.required_trades || 2}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">KYC Status</p>
                  <p className={`mt-1 text-xl font-bold capitalize ${kycApproved ? 'text-green-500' : 'text-yellow-500'}`}>
                    {userData?.kyc_status || 'Pending'}
                  </p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${kycApproved ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
                  <Shield className={`h-6 w-6 ${kycApproved ? 'text-green-500' : 'text-yellow-500'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-5">
            <Button asChild className="w-full">
              <Link href="/dashboard/deposits">Make Deposit</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/investments">Invest Now</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/copy-trading">Copy Experts</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/signals">Signals</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/withdrawals">Withdraw</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Active Investments - Prioritized */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Active Investments</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/investments">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {investments && investments.length > 0 ? (
              <div className="space-y-4">
                {investments.map((investment) => (
                  <div key={investment.id} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10">
                        <TrendingUp className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{investment.investment_plans?.name || 'Investment'}</p>
                        <p className="text-sm text-muted-foreground">
                          Started {new Date(investment.start_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">${investment.amount.toFixed(2)}</p>
                      <p className="text-sm text-green-500">+${investment.current_return.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">No active investments</p>
                <Button className="mt-4" asChild>
                  <Link href="/dashboard/investments">Start Investing</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions && recentTransactions.length > 0 ? (
              <div className="space-y-4">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 flex items-center justify-center rounded-lg ${tx.type === 'deposit' ? 'bg-green-500/10' :
                          tx.type === 'withdrawal' ? 'bg-red-500/10' : 'bg-primary/10'
                        }`}>
                        {tx.type === 'deposit' ? (
                          <ArrowDownRight className="h-5 w-5 text-green-500" />
                        ) : tx.type === 'withdrawal' ? (
                          <ArrowUpRight className="h-5 w-5 text-red-500" />
                        ) : (
                          <TrendingUp className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium capitalize text-foreground">{tx.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${tx.type === 'deposit' || tx.type === 'profit' ? 'text-green-500' : 'text-foreground'}`}>
                        {tx.type === 'deposit' || tx.type === 'profit' ? '+' : '-'}${tx.amount.toFixed(2)}
                      </p>
                      <p className={`text-sm capitalize ${tx.status === 'approved' ? 'text-green-500' :
                          tx.status === 'pending' ? 'text-yellow-500' : 'text-muted-foreground'
                        }`}>{tx.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-4">No transactions yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
