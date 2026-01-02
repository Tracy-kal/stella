"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Copy } from "lucide-react"

export default function DepositsPage() {
  const [selectedCrypto, setSelectedCrypto] = useState("BTC")
  const [amount, setAmount] = useState("")

  const cryptoOptions = [
    { symbol: "BTC", name: "Bitcoin", address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh" },
    { symbol: "ETH", name: "Ethereum", address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb" },
    { symbol: "USDT", name: "Tether (TRC20)", address: "TYASr3QxxxxxxxxxxxxxxxxxxxxxxxxxX" },
    { symbol: "SOL", name: "Solana", address: "7dHbWXmcixxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" },
  ]

  const selectedCryptoData = cryptoOptions.find((c) => c.symbol === selectedCrypto)

  const copyToClipboard = () => {
    if (selectedCryptoData) {
      navigator.clipboard.writeText(selectedCryptoData.address)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Make a Deposit</h1>
          <p className="mt-1 text-muted-foreground">Fund your account with cryptocurrency</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Deposit Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            {selectedCryptoData && (
              <div className="space-y-4 border-t border-border pt-6">
                <div className="flex items-center justify-center">
                  <div className="h-48 w-48 bg-muted"></div>
                </div>
                <div className="space-y-2">
                  <Label>Wallet Address</Label>
                  <div className="flex gap-2">
                    <Input value={selectedCryptoData.address} readOnly className="font-mono text-sm" />
                    <Button size="icon" variant="outline" onClick={copyToClipboard}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 bg-muted/50 p-4">
                  <p className="text-sm font-medium text-foreground">Important Instructions:</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Send only {selectedCryptoData.symbol} to this address</li>
                    <li>• Minimum deposit: $100</li>
                    <li>• Deposits are usually confirmed within 10-30 minutes</li>
                    <li>• After sending, submit your transaction details below</li>
                  </ul>
                </div>
              </div>
            )}

            <Button className="w-full">Submit Deposit</Button>
          </CardContent>
        </Card>

        {/* Deposit History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Deposits</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-sm text-muted-foreground">No deposits yet</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
