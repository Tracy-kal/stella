"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, TrendingUp, TrendingDown, Target } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface SignalProvider {
  id: string
  display_name: string
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
  signal_providers?: SignalProvider
}

export default function AdminSignalsPage() {
  const [signals, setSignals] = useState<Signal[]>([])
  const [providers, setProviders] = useState<SignalProvider[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSignal, setEditingSignal] = useState<Signal | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    provider_id: "",
    symbol: "",
    signal_type: "buy",
    entry_price: "",
    take_profit: "",
    stop_loss: "",
    description: "",
  })

  useEffect(() => {
    fetchSignals()
    fetchProviders()
  }, [])

  const fetchSignals = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("signals")
      .select("*, signal_providers(id, display_name)")
      .order("created_at", { ascending: false })

    if (data) setSignals(data)
  }

  const fetchProviders = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("signal_providers")
      .select("id, display_name")
      .eq("is_active", true)

    if (data) setProviders(data)
  }

  const handleOpenDialog = (signal?: Signal) => {
    if (signal) {
      setEditingSignal(signal)
      setFormData({
        provider_id: signal.provider_id,
        symbol: signal.symbol,
        signal_type: signal.signal_type,
        entry_price: signal.entry_price.toString(),
        take_profit: signal.take_profit.toString(),
        stop_loss: signal.stop_loss.toString(),
        description: signal.description || "",
      })
    } else {
      setEditingSignal(null)
      setFormData({
        provider_id: providers[0]?.id || "",
        symbol: "",
        signal_type: "buy",
        entry_price: "",
        take_profit: "",
        stop_loss: "",
        description: "",
      })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const supabase = createClient()

      const signalData = {
        provider_id: formData.provider_id,
        symbol: formData.symbol.toUpperCase(),
        signal_type: formData.signal_type,
        entry_price: parseFloat(formData.entry_price),
        take_profit: parseFloat(formData.take_profit),
        stop_loss: parseFloat(formData.stop_loss),
        description: formData.description,
      }

      if (editingSignal) {
        await supabase
          .from("signals")
          .update(signalData)
          .eq("id", editingSignal.id)
      } else {
        await supabase.from("signals").insert({
          ...signalData,
          is_active: true,
        })

        // Update total_signals count for the provider
        const { data: provider } = await supabase
          .from("signal_providers")
          .select("total_signals")
          .eq("id", formData.provider_id)
          .single()

        if (provider) {
          await supabase
            .from("signal_providers")
            .update({ total_signals: provider.total_signals + 1 })
            .eq("id", formData.provider_id)
        }
      }

      setIsDialogOpen(false)
      fetchSignals()
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleActive = async (signal: Signal) => {
    const supabase = createClient()
    await supabase
      .from("signals")
      .update({ is_active: !signal.is_active })
      .eq("id", signal.id)
    fetchSignals()
  }

  const handleDelete = async (signal: Signal) => {
    if (!confirm("Are you sure you want to delete this signal?")) return
    const supabase = createClient()
    await supabase.from("signals").delete().eq("id", signal.id)
    fetchSignals()
  }

  const popularSymbols = ["BTC/USD", "ETH/USD", "EUR/USD", "GBP/USD", "XAU/USD", "SPX500", "AAPL", "TSLA"]

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Trading Signals</h1>
            <p className="mt-1 text-muted-foreground">Create and manage trading signals for subscribers</p>
          </div>
          <Button onClick={() => handleOpenDialog()} disabled={providers.length === 0}>
            <Plus className="mr-2 h-4 w-4" />
            Add Signal
          </Button>
        </div>

        {providers.length === 0 && (
          <Card className="border-yellow-500/50 bg-yellow-500/5">
            <CardContent className="p-4">
              <p className="text-foreground">⚠️ You need to create a Signal Provider first before adding signals.</p>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Target className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Signals</p>
                  <p className="text-2xl font-bold">{signals.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <TrendingUp className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Buy Signals</p>
                  <p className="text-2xl font-bold">{signals.filter(s => s.signal_type === 'buy').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <TrendingDown className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Sell Signals</p>
                  <p className="text-2xl font-bold">{signals.filter(s => s.signal_type === 'sell').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Signals Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Signals</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Entry</TableHead>
                  <TableHead>TP</TableHead>
                  <TableHead>SL</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {signals.map((signal) => (
                  <TableRow key={signal.id}>
                    <TableCell className="font-medium">{signal.symbol}</TableCell>
                    <TableCell>
                      <Badge className={signal.signal_type === 'buy' ? 'bg-green-500' : 'bg-red-500'}>
                        {signal.signal_type === 'buy' ? (
                          <><TrendingUp className="h-3 w-3 mr-1" /> BUY</>
                        ) : (
                          <><TrendingDown className="h-3 w-3 mr-1" /> SELL</>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>${signal.entry_price}</TableCell>
                    <TableCell className="text-green-500">${signal.take_profit}</TableCell>
                    <TableCell className="text-red-500">${signal.stop_loss}</TableCell>
                    <TableCell>{signal.signal_providers?.display_name || '-'}</TableCell>
                    <TableCell>
                      <Switch
                        checked={signal.is_active}
                        onCheckedChange={() => handleToggleActive(signal)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleOpenDialog(signal)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(signal)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {signals.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No signals found. Click "Add Signal" to create one.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSignal ? "Edit Signal" : "Create New Signal"}</DialogTitle>
              <DialogDescription>
                {editingSignal ? "Update the signal details." : "Create a trading signal for subscribers."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="provider">Signal Provider</Label>
                <Select value={formData.provider_id} onValueChange={(v) => setFormData({ ...formData, provider_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.display_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="symbol">Symbol</Label>
                  <Select value={formData.symbol} onValueChange={(v) => setFormData({ ...formData, symbol: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select or type" />
                    </SelectTrigger>
                    <SelectContent>
                      {popularSymbols.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Signal Type</Label>
                  <Select value={formData.signal_type} onValueChange={(v) => setFormData({ ...formData, signal_type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buy">BUY</SelectItem>
                      <SelectItem value="sell">SELL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="entry">Entry Price</Label>
                  <Input
                    id="entry"
                    type="number"
                    step="0.0001"
                    placeholder="0.00"
                    value={formData.entry_price}
                    onChange={(e) => setFormData({ ...formData, entry_price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tp">Take Profit</Label>
                  <Input
                    id="tp"
                    type="number"
                    step="0.0001"
                    placeholder="0.00"
                    value={formData.take_profit}
                    onChange={(e) => setFormData({ ...formData, take_profit: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sl">Stop Loss</Label>
                  <Input
                    id="sl"
                    type="number"
                    step="0.0001"
                    placeholder="0.00"
                    value={formData.stop_loss}
                    onChange={(e) => setFormData({ ...formData, stop_loss: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Additional notes about this signal..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : editingSignal ? "Update Signal" : "Create Signal"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
