"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Radio, TrendingUp, TrendingDown, CheckCircle2, AlertCircle, Wallet, Target } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface SignalProvider {
  id: string
  user_id: string
  display_name: string
  description: string
  price: number
  success_rate: number
  total_signals: number
  is_active: boolean
}

interface Signal {
  id: string
  provider_id: string
  symbol: string
  signal_type: string
  entry_price: number
  take_profit: number
  stop_loss: number
  description: string
  is_active: boolean
  created_at: string
}

interface SignalSubscription {
  id: string
  provider_id: string
  is_active: boolean
  signal_providers: SignalProvider
}

interface UserData {
  balance_deposit: number
  balance_profit: number
  balance_bonus: number
}

export default function SignalsPage() {
  const [providers, setProviders] = useState<SignalProvider[]>([])
  const [subscriptions, setSubscriptions] = useState<SignalSubscription[]>([])
  const [activeSignals, setActiveSignals] = useState<Signal[]>([])
  const [userData, setUserData] = useState<UserData | null>(null)
  const [selectedProvider, setSelectedProvider] = useState<SignalProvider | null>(null)
  const [investAmount, setInvestAmount] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchProviders()
    fetchSubscriptions()
    fetchUserData()
    fetchActiveSignals()
  }, [])

  const fetchProviders = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("signal_providers")
      .select("*")
      .eq("is_active", true)
      .order("success_rate", { ascending: false })

    if (data) setProviders(data)
  }

  const fetchSubscriptions = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from("signal_subscriptions")
      .select("*, signal_providers(*)")
      .eq("user_id", user.id)
      .eq("is_active", true)

    if (data) setSubscriptions(data as SignalSubscription[])
  }

  const fetchActiveSignals = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Get user's subscribed provider IDs
    const { data: subs } = await supabase
      .from("signal_subscriptions")
      .select("provider_id")
      .eq("user_id", user.id)
      .eq("is_active", true)

    if (subs && subs.length > 0) {
      const providerIds = subs.map(s => s.provider_id)
      const { data: signals } = await supabase
        .from("signals")
        .select("*")
        .in("provider_id", providerIds)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(10)

      if (signals) setActiveSignals(signals)
    }
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

  const handleSubscribe = (provider: SignalProvider) => {
    setSelectedProvider(provider)
    setInvestAmount(provider.price.toString())
    setError(null)
    setSuccess(false)
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!selectedProvider) return
    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Please login to continue")

      if (selectedProvider.price > totalBalance) {
        throw new Error("Insufficient balance")
      }

      // Check if already subscribed
      const existingSub = subscriptions.find(s => s.provider_id === selectedProvider.id)
      if (existingSub) {
        throw new Error("You are already subscribed to this provider")
      }

      // Create subscription
      const { error: subError } = await supabase.from("signal_subscriptions").insert({
        user_id: user.id,
        provider_id: selectedProvider.id,
        is_active: true,
      })

      if (subError) throw subError

      // Deduct from balance
      const { error: updateError } = await supabase
        .from("users")
        .update({ balance_deposit: (userData?.balance_deposit || 0) - selectedProvider.price })
        .eq("id", user.id)

      if (updateError) throw updateError

      setSuccess(true)
      setIsDialogOpen(false)
      fetchProviders()
      fetchSubscriptions()
      fetchUserData()
      fetchActiveSignals()

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
            <h1 className="text-3xl font-bold text-foreground">Trading Signals</h1>
            <p className="mt-1 text-muted-foreground">Subscribe to premium signals from verified providers</p>
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
              <p className="text-foreground">Successfully subscribed to signal provider!</p>
            </CardContent>
          </Card>
        )}

        {/* Active Signals */}
        {activeSignals.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Active Signals
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeSignals.map((signal) => (
                <Card key={signal.id} className="border-primary/20">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg text-foreground">{signal.symbol}</span>
                      <Badge className={signal.signal_type === 'buy' ? 'bg-green-500' : 'bg-red-500'}>
                        {signal.signal_type === 'buy' ? (
                          <><TrendingUp className="h-3 w-3 mr-1" /> BUY</>
                        ) : (
                          <><TrendingDown className="h-3 w-3 mr-1" /> SELL</>
                        )}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Entry</p>
                        <p className="font-medium text-foreground">${signal.entry_price}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">TP</p>
                        <p className="font-medium text-green-500">${signal.take_profit}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">SL</p>
                        <p className="font-medium text-red-500">${signal.stop_loss}</p>
                      </div>
                    </div>
                    {signal.description && (
                      <p className="text-sm text-muted-foreground">{signal.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Active Subscriptions */}
        {subscriptions.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Your Subscriptions</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {subscriptions.map((sub) => (
                <Card key={sub.id} className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                        {sub.signal_providers?.display_name?.substring(0, 2).toUpperCase() || 'SP'}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{sub.signal_providers?.display_name}</p>
                        <p className="text-sm text-green-500">Active Subscription</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Available Providers */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Signal Providers</h2>
          {providers.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {providers.map((provider) => {
                const isSubscribed = subscriptions.some(s => s.provider_id === provider.id)
                return (
                  <Card key={provider.id} className={isSubscribed ? "opacity-60" : ""}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                          {provider.display_name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{provider.display_name}</CardTitle>
                          <p className="text-sm text-primary font-medium">${provider.price}/month</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {provider.description && (
                        <p className="text-sm text-muted-foreground">{provider.description}</p>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Accuracy</span>
                        <span className="font-medium text-green-500">{provider.success_rate}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Signals</span>
                        <span className="font-medium text-foreground">{provider.total_signals}</span>
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => handleSubscribe(provider)}
                        disabled={isSubscribed}
                      >
                        <Radio className="mr-2 h-4 w-4" />
                        {isSubscribed ? "Subscribed" : "Subscribe"}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Radio className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">No signal providers available at the moment.</p>
                <p className="text-sm text-muted-foreground">Check back soon for new opportunities.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Subscription Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Subscribe to {selectedProvider?.display_name}</DialogTitle>
              <DialogDescription>
                Confirm your subscription to receive trading signals from this provider.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {error && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subscription Price</span>
                  <span className="font-bold text-foreground">${selectedProvider?.price}/month</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Accuracy Rate</span>
                  <span className="font-medium text-green-500">{selectedProvider?.success_rate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Signals</span>
                  <span className="font-medium text-foreground">{selectedProvider?.total_signals}</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="text-muted-foreground">Your Balance</span>
                  <span className="font-medium text-foreground">${totalBalance.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : `Pay $${selectedProvider?.price}`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
