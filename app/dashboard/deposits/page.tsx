"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Copy, Upload, CheckCircle2, Clock, XCircle, AlertCircle, Wallet } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface CryptoAddress {
  id: string
  crypto_symbol: string
  crypto_name: string
  wallet_address: string
  network: string
  is_active: boolean
}

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
  const [cryptoAddresses, setCryptoAddresses] = useState<CryptoAddress[]>([])
  const [selectedCrypto, setSelectedCrypto] = useState("")
  const [amount, setAmount] = useState("")
  const [transactionHash, setTransactionHash] = useState("")
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deposits, setDeposits] = useState<Transaction[]>([])
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  const selectedCryptoData = cryptoAddresses.find((c) => c.crypto_symbol === selectedCrypto)

  useEffect(() => {
    fetchCryptoAddresses()
    fetchDeposits()
  }, [])

  const fetchCryptoAddresses = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("crypto_addresses")
      .select("*")
      .eq("is_active", true)
      .order("crypto_symbol", { ascending: true })

    if (data && data.length > 0) {
      setCryptoAddresses(data)
      setSelectedCrypto(data[0].crypto_symbol)
    }
    setLoading(false)
  }

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
      navigator.clipboard.writeText(selectedCryptoData.wallet_address)
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
          throw new Error("Failed to upload proof. Please try again.")
        }

        const { data: urlData } = supabase.storage.from("deposit-proofs").getPublicUrl(fileName)
        proofUrl = urlData.publicUrl
      }

      // Create deposit transaction
      const { error: insertError } = await supabase.from("transactions").insert({
        user_id: user.id,
        type: "deposit",
        status: "pending",
        amount: parseFloat(amount),
        crypto_type: selectedCrypto,
        transaction_hash: transactionHash || null,
        proof_url: proofUrl,
      })

      if (insertError) throw insertError

      // Create notification for user
      await supabase.from("notifications").insert({
        user_id: user.id,
        type: "deposit",
        title: "Deposit Submitted",
        message: `Your deposit of $${parseFloat(amount).toFixed(2)} in ${selectedCrypto} has been submitted and is pending verification.`,
      })

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // No crypto addresses configured
  if (cryptoAddresses.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Make a Deposit</h1>
            <p className="mt-1 text-muted-foreground">Fund your account with cryptocurrency</p>
          </div>

          <Card className="border-yellow-500/50 bg-yellow-500/5">
            <CardContent className="flex items-start gap-3 p-6">
              <AlertCircle className="h-6 w-6 flex-shrink-0 text-yellow-500 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Deposits Currently Unavailable</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Deposit addresses have not been configured yet. Please check back later or contact support.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Still show deposit history */}
          <Card>
            <CardHeader>
              <CardTitle>Deposit History</CardTitle>
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
                <p className="font-medium text-foreground">Deposit Submitted!</p>
                <p className="text-sm text-muted-foreground">Your deposit is pending verification. Processing time: 24-48 hours.</p>
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
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                Deposit Details
              </CardTitle>
              <CardDescription>Select cryptocurrency and send funds to the address below</CardDescription>
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
                      {cryptoAddresses.map((crypto) => (
                        <SelectItem key={crypto.id} value={crypto.crypto_symbol}>
                          {crypto.crypto_name} ({crypto.crypto_symbol})
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

              {/* Wallet Address Display */}
              <div className="space-y-2">
                <Label>Deposit Address ({selectedCryptoData?.network})</Label>
                <div className="flex gap-2">
                  <Input
                    value={selectedCryptoData?.wallet_address || ""}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button type="button" variant="outline" onClick={copyToClipboard}>
                    {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Send only {selectedCryptoData?.crypto_symbol} to this address. Sending other coins may result in permanent loss.
                </p>
              </div>

              {/* Transaction Hash */}
              <div className="space-y-2">
                <Label htmlFor="hash">Transaction Hash (Optional)</Label>
                <Input
                  id="hash"
                  placeholder="Enter transaction hash for faster verification"
                  value={transactionHash}
                  onChange={(e) => setTransactionHash(e.target.value)}
                  className="font-mono"
                />
              </div>

              {/* Proof Upload */}
              <div className="space-y-2">
                <Label htmlFor="proof">Payment Proof (Optional)</Label>
                <label
                  htmlFor="proof"
                  className="flex cursor-pointer flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors"
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    {proofFile ? proofFile.name : "Click to upload screenshot of payment"}
                  </p>
                  <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                  <input
                    id="proof"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm font-medium text-foreground">Important:</p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>• Minimum deposit: <strong>$100</strong></li>
                  <li>• Verification time: <strong>24-48 hours</strong></li>
                  <li>• Upload proof for faster processing</li>
                  <li>• Double-check the network before sending</li>
                </ul>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : "Submit Deposit"}
              </Button>
            </CardContent>
          </Card>
        </form>

        {/* Deposit History */}
        <Card>
          <CardHeader>
            <CardTitle>Deposit History</CardTitle>
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
