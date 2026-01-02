"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Users, TrendingUp, CheckCircle2, AlertCircle, Wallet } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface CopyExpert {
  id: string
  user_id: string
  display_name: string
  bio: string
  total_followers: number
  success_rate: number
  total_profit: number
  is_active: boolean
}

interface CopySubscription {
  id: string
  expert_id: string
  is_active: boolean
  amount_invested: number
  current_profit: number
  copy_experts: CopyExpert
}

interface UserData {
  balance_deposit: number
  balance_profit: number
  balance_bonus: number
}

export default function CopyTradingPage() {
  const [experts, setExperts] = useState<CopyExpert[]>([])
  const [subscriptions, setSubscriptions] = useState<CopySubscription[]>([])
  const [userData, setUserData] = useState<UserData | null>(null)
  const [selectedExpert, setSelectedExpert] = useState<CopyExpert | null>(null)
  const [investAmount, setInvestAmount] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchExperts()
    fetchSubscriptions()
    fetchUserData()
  }, [])

  const fetchExperts = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("copy_experts")
      .select("*")
      .eq("is_active", true)
      .order("success_rate", { ascending: false })

    if (data) setExperts(data)
  }

  const fetchSubscriptions = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from("copy_subscriptions")
      .select("*, copy_experts(*)")
      .eq("user_id", user.id)
      .eq("is_active", true)

    if (data) setSubscriptions(data as CopySubscription[])
  }

  const fetchUserData = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from("users")
      .select("balance_deposit, balance_profit, balance_bonus")
      .eq("id", user.id)
      .single()

    if (data) setUserData(data)
  }

  const totalBalance = userData
    ? (userData.balance_deposit || 0) + (userData.balance_profit || 0) + (userData.balance_bonus || 0)
    : 0

  const handleCopyTrader = (expert: CopyExpert) => {
    setSelectedExpert(expert)
    setInvestAmount("")
    setError(null)
    setSuccess(false)
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!selectedExpert) return
    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Please login to continue")

      const amount = parseFloat(investAmount)
      if (!amount || amount < 100) {
        throw new Error("Minimum investment amount is $100")
      }

      if (amount > totalBalance) {
        throw new Error("Insufficient balance")
      }

      // Check if already subscribed
      const existingSub = subscriptions.find(s => s.expert_id === selectedExpert.id)
      if (existingSub) {
        throw new Error("You are already copying this trader")
      }

      // Create subscription
      const { error: subError } = await supabase.from("copy_subscriptions").insert({
        user_id: user.id,
        expert_id: selectedExpert.id,
        is_active: true,
      })

      if (subError) throw subError

      // Deduct from balance
      const { error: updateError } = await supabase
        .from("users")
        .update({ balance_deposit: (userData?.balance_deposit || 0) - amount })
        .eq("id", user.id)

      if (updateError) throw updateError

      // Update expert followers
      await supabase
        .from("copy_experts")
        .update({ total_followers: selectedExpert.total_followers + 1 })
        .eq("id", selectedExpert.id)

      setSuccess(true)
      setIsDialogOpen(false)
      fetchExperts()
      fetchSubscriptions()
      fetchUserData()

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Copy Trading</h1>
            <p className="mt-1 text-muted-foreground">Follow expert traders and copy their strategies automatically</p>
          </div>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 flex items-center gap-3">
              <Wallet className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <p className="text-xl font-bold text-foreground">${totalBalance.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {success && (
          <Card className="border-green-500/50 bg-green-500/5">
            <CardContent className="flex items-center gap-3 p-4">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <p className="text-foreground">Successfully started copying trader!</p>
            </CardContent>
          </Card>
        )}

        {/* Active Subscriptions */}
        {subscriptions.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Your Active Copies</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {subscriptions.map((sub) => (
                <Card key={sub.id} className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                        {sub.copy_experts?.display_name?.substring(0, 2).toUpperCase() || 'CT'}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{sub.copy_experts?.display_name}</CardTitle>
                        <p className="text-sm text-green-500">Active</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Success Rate</span>
                      <span className="font-medium text-green-500">{sub.copy_experts?.success_rate}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Your Profit</span>
                      <span className="font-medium text-green-500">+${(sub.current_profit || 0).toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Available Experts */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Top Traders</h2>
          {experts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {experts.map((expert) => {
                const isSubscribed = subscriptions.some(s => s.expert_id === expert.id)
                return (
                  <Card key={expert.id} className={isSubscribed ? "opacity-60" : ""}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                          {expert.display_name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{expert.display_name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{expert.total_followers} followers</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {expert.bio && (
                        <p className="text-sm text-muted-foreground">{expert.bio}</p>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Success Rate</span>
                        <span className="font-medium text-green-500">{expert.success_rate}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Profit Generated</span>
                        <span className="font-medium text-foreground">${expert.total_profit.toLocaleString()}</span>
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => handleCopyTrader(expert)}
                        disabled={isSubscribed}
                      >
                        <Users className="mr-2 h-4 w-4" />
                        {isSubscribed ? "Already Copying" : "Copy Trader"}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">No expert traders available at the moment.</p>
                <p className="text-sm text-muted-foreground">Check back soon for new opportunities.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Investment Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Copy {selectedExpert?.display_name}</DialogTitle>
              <DialogDescription>
                Enter the amount you want to invest with this trader. Minimum $100.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {error && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="amount">Investment Amount (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount (min $100)"
                  value={investAmount}
                  onChange={(e) => setInvestAmount(e.target.value)}
                  min="100"
                  max={totalBalance}
                />
                <p className="text-xs text-muted-foreground">
                  Available balance: ${totalBalance.toFixed(2)}
                </p>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-1">
                <p><strong>Success Rate:</strong> {selectedExpert?.success_rate}%</p>
                <p><strong>Total Followers:</strong> {selectedExpert?.total_followers}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : "Start Copying"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
