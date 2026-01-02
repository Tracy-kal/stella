"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Copy, Upload, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Transaction {
  id: string
  type: string
  status: string
  amount: number
  crypto_type: string
  transaction_hash: string
  created_at: string
}

export default function DepositsPage() {
  const [selectedCrypto, setSelectedCrypto] = useState("BTC")
  const [amount, setAmount] = useState("")
  const [transactionHash, setTransactionHash] = useState("")
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deposits, setDeposits] = useState<Transaction[]>([])
  const [copied, setCopied] = useState(false)

  const cryptoOptions = [
    { symbol: "BTC", name: "Bitcoin", address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", network: "Bitcoin Network" },
    { symbol: "ETH", name: "Ethereum", address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", network: "Ethereum (ERC20)" },
    { symbol: "USDT", name: "Tether", address: "TYASr7W9xxxxxxxxxxxxxxxxxxxxxxxxxx", network: "Tron (TRC20)" },
    { symbol: "SOL", name: "Solana", address: "7dHbWXmcixxxxxxxxxxxxxxxxxxxxxxxxxx", network: "Solana Network" },
  ]

  const selectedCryptoData = cryptoOptions.find((c) => c.symbol === selectedCrypto)

  useEffect(() => {
    fetchDeposits()
  }, [])

  const fetchDeposits = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .eq("type", "deposit")
      .order("created_at", { ascending: false })
      .limit(10)

    if (data) setDeposits(data)
  }

  const copyToClipboard = () => {
    if (selectedCryptoData) {
      navigator.clipboard.writeText(selectedCryptoData.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB")
        return
      }
      setProofFile(file)
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Please login to continue")

      if (!amount || parseFloat(amount) < 100) {
        throw new Error("Minimum deposit amount is $100")
      }

      let proofUrl = null

      // Upload proof file if provided
      if (proofFile) {
        const fileExt = proofFile.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from("deposit-proofs")
          .upload(fileName, proofFile)

        if (uploadError) {
          console.error("Upload error:", uploadError)
          // Continue without proof if upload fails
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from("deposit-proofs")
            .getPublicUrl(fileName)
          proofUrl = publicUrl
        }
      }

      // Create deposit record
      const { error: insertError } = await supabase.from("transactions").insert({
        user_id: user.id,
        type: "deposit",
        status: "pending",
        amount: parseFloat(amount),
        crypto_type: selectedCrypto,
        wallet_address: selectedCryptoData?.address,
        transaction_hash: transactionHash || null,
        admin_notes: proofUrl ? `Proof: ${proofUrl}` : null,
      })

      if (insertError) throw insertError

      setSuccess(true)
      setAmount("")
      setTransactionHash("")
      setProofFile(null)
      fetchDeposits()

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-destructive" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Make a Deposit</h1>
          <p className="mt-1 text-muted-foreground">Fund your account with cryptocurrency</p>
        </div>

        {success && (
          <Card className="border-green-500/50 bg-green-500/5">
            <CardContent className="flex items-center gap-3 p-4">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium text-foreground">Deposit Submitted Successfully!</p>
                <p className="text-sm text-muted-foreground">Your deposit is pending admin approval.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="flex items-center gap-3 p-4">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-foreground">{error}</p>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Deposit Information</CardTitle>
              <CardDescription>Select cryptocurrency and enter deposit details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="crypto">Select Cryptocurrency</Label>
                  <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                    <SelectTrigger id="crypto">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {cryptoOptions.map((crypto) => (
                        <SelectItem key={crypto.symbol} value={crypto.symbol}>
                          {crypto.name} ({crypto.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (USD)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount (min $100)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="100"
                    required
                  />
                </div>
              </div>

              {selectedCryptoData && (
                <div className="space-y-4 border-t border-border pt-6">
                  <div className="flex items-center justify-center">
                    <div className="h-48 w-48 bg-white p-2 rounded-lg flex items-center justify-center">
                      <div className="text-center text-muted-foreground text-sm">
                        <p className="font-bold text-lg text-foreground">{selectedCryptoData.symbol}</p>
                        <p>QR Code</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Network</Label>
                    <Input value={selectedCryptoData.network} readOnly className="bg-muted" />
                  </div>

                  <div className="space-y-2">
                    <Label>Wallet Address</Label>
                    <div className="flex gap-2">
                      <Input value={selectedCryptoData.address} readOnly className="font-mono text-sm bg-muted" />
                      <Button type="button" size="icon" variant="outline" onClick={copyToClipboard}>
                        {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 bg-yellow-500/5 border border-yellow-500/20 p-4 rounded-lg">
                    <p className="text-sm font-medium text-foreground">⚠️ Important Instructions:</p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Send only <strong>{selectedCryptoData.symbol}</strong> to this address</li>
                      <li>• Network: <strong>{selectedCryptoData.network}</strong></li>
                      <li>• Minimum deposit: <strong>$100</strong></li>
                      <li>• Deposits are usually confirmed within 10-30 minutes</li>
                    </ul>
                  </div>
                </div>
              )}

              <div className="space-y-4 border-t border-border pt-6">
                <h3 className="font-semibold text-foreground">Payment Confirmation</h3>

                <div className="space-y-2">
                  <Label htmlFor="txHash">Transaction Hash (Optional)</Label>
                  <Input
                    id="txHash"
                    placeholder="Enter your transaction hash"
                    value={transactionHash}
                    onChange={(e) => setTransactionHash(e.target.value)}
                    className="font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proof">Upload Payment Proof (Optional)</Label>
                  <div className="flex items-center gap-4">
                    <label
                      htmlFor="proof"
                      className="flex-1 cursor-pointer border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors"
                    >
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        {proofFile ? proofFile.name : "Click to upload screenshot or receipt"}
                      </p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, PDF up to 5MB</p>
                      <input
                        id="proof"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Deposit"}
              </Button>
            </CardContent>
          </Card>
        </form>

        {/* Deposit History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Deposits</CardTitle>
          </CardHeader>
          <CardContent>
            {deposits.length > 0 ? (
              <div className="space-y-4">
                {deposits.map((deposit) => (
                  <div key={deposit.id} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(deposit.status)}
                      <div>
                        <p className="font-medium text-foreground">{deposit.crypto_type} Deposit</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(deposit.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">${deposit.amount.toFixed(2)}</p>
                      <p className={`text-sm capitalize ${deposit.status === 'approved' ? 'text-green-500' :
                          deposit.status === 'rejected' ? 'text-destructive' : 'text-yellow-500'
                        }`}>{deposit.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-4">No deposits yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
