"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle2, Clock, XCircle, Lock, Wallet, Shield, FileText } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface UserData {
    balance_deposit: number
    balance_profit: number
    balance_bonus: number
    can_withdraw: boolean
    completed_trades: number
    required_trades: number
    withdrawal_code?: string
    kyc_status?: string
    tax_code?: string
    mfi_code?: string
}

interface Transaction {
    id: string
    type: string
    status: string
    amount: number
    crypto_type: string
    wallet_address: string
    created_at: string
}

export default function WithdrawalsPage() {
    const [userData, setUserData] = useState<UserData | null>(null)
    const [withdrawals, setWithdrawals] = useState<Transaction[]>([])
    const [selectedCrypto, setSelectedCrypto] = useState("BTC")
    const [amount, setAmount] = useState("")
    const [walletAddress, setWalletAddress] = useState("")
    const [withdrawalCode, setWithdrawalCode] = useState("")
    const [taxCode, setTaxCode] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const cryptoOptions = [
        { symbol: "BTC", name: "Bitcoin", network: "Bitcoin Network" },
        { symbol: "ETH", name: "Ethereum", network: "Ethereum (ERC20)" },
        { symbol: "USDT", name: "Tether", network: "Tron (TRC20)" },
        { symbol: "SOL", name: "Solana", network: "Solana Network" },
    ]

    useEffect(() => {
        fetchUserData()
        fetchWithdrawals()
    }, [])

    const fetchUserData = async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
            .from("users")
            .select("balance_deposit, balance_profit, balance_bonus, can_withdraw, completed_trades, required_trades, withdrawal_code, kyc_status, tax_code, mfi_code")
            .eq("id", user.id)
            .single()

        if (data) setUserData(data)
    }

    const fetchWithdrawals = async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
            .from("transactions")
            .select("*")
            .eq("user_id", user.id)
            .eq("type", "withdrawal")
            .order("created_at", { ascending: false })
            .limit(10)

        if (data) setWithdrawals(data)
    }

    const totalBalance = userData
        ? (userData.balance_deposit || 0) + (userData.balance_profit || 0) + (userData.balance_bonus || 0)
        : 0

    const kycApproved = userData?.kyc_status === 'approved'
    const tradesCompleted = (userData?.completed_trades || 0) >= 2
    const canWithdrawFlag = userData?.can_withdraw !== false
    const canWithdraw = kycApproved && tradesCompleted && canWithdrawFlag

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)
        setSuccess(false)

        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Please login to continue")

            // Check KYC
            if (!kycApproved) {
                throw new Error("Please complete KYC verification before withdrawing.")
            }

            // Check trades
            if (!tradesCompleted) {
                throw new Error("You need to complete at least 2 trades before withdrawing.")
            }

            // Check withdraw flag
            if (!canWithdrawFlag) {
                throw new Error("Withdrawals are currently disabled on your account.")
            }

            const withdrawAmount = parseFloat(amount)

            if (!withdrawAmount || withdrawAmount < 50) {
                throw new Error("Minimum withdrawal amount is $50")
            }

            if (withdrawAmount > totalBalance) {
                throw new Error("Insufficient balance")
            }

            if (!walletAddress) {
                throw new Error("Please enter your wallet address")
            }

            // Check withdrawal code if required
            if (userData?.withdrawal_code && userData.withdrawal_code !== withdrawalCode) {
                throw new Error("Invalid withdrawal code")
            }

            // Check tax/MFI code if required
            if (userData?.tax_code && userData.tax_code !== taxCode) {
                throw new Error("Invalid Tax/MFI code. Please enter the correct code to proceed.")
            }

            // Create withdrawal request
            const { error: insertError } = await supabase.from("transactions").insert({
                user_id: user.id,
                type: "withdrawal",
                status: "pending",
                amount: withdrawAmount,
                crypto_type: selectedCrypto,
                wallet_address: walletAddress,
            })

            if (insertError) throw insertError

            setSuccess(true)
            setAmount("")
            setWalletAddress("")
            setWithdrawalCode("")
            setTaxCode("")
            fetchWithdrawals()

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
                    <h1 className="text-3xl font-bold text-foreground">Withdraw Funds</h1>
                    <p className="mt-1 text-muted-foreground">Request a withdrawal to your crypto wallet</p>
                </div>

                {/* KYC Requirement Alert */}
                {!kycApproved && (
                    <Card className="border-blue-500/50 bg-blue-500/5">
                        <CardContent className="flex items-start gap-3 p-4">
                            <Shield className="h-5 w-5 flex-shrink-0 text-blue-500 mt-0.5" />
                            <div className="flex-1">
                                <p className="font-medium text-foreground">KYC Verification Required</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    You must complete identity verification (KYC) before you can withdraw funds.
                                </p>
                            </div>
                            <Button size="sm" asChild>
                                <Link href="/dashboard/kyc">Verify Now</Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Trade Requirement Alert */}
                {kycApproved && !tradesCompleted && (
                    <Card className="border-yellow-500/50 bg-yellow-500/5">
                        <CardContent className="flex items-start gap-3 p-4">
                            <Lock className="h-5 w-5 flex-shrink-0 text-yellow-500 mt-0.5" />
                            <div>
                                <p className="font-medium text-foreground">Trade Requirement</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Complete at least 2 trades to unlock withdrawals.
                                    <br />
                                    <strong>Progress: {userData?.completed_trades || 0}/2 trades completed</strong>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Admin Restriction Alert */}
                {kycApproved && tradesCompleted && !canWithdrawFlag && (
                    <Card className="border-destructive/50 bg-destructive/5">
                        <CardContent className="flex items-start gap-3 p-4">
                            <Lock className="h-5 w-5 flex-shrink-0 text-destructive mt-0.5" />
                            <div>
                                <p className="font-medium text-foreground">Withdrawal Restricted</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Withdrawals have been disabled on your account by an administrator.
                                    Please contact support for assistance.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Tax/MFI Code Info */}
                {userData?.tax_code && (
                    <Card className="border-orange-500/50 bg-orange-500/5">
                        <CardContent className="flex items-start gap-3 p-4">
                            <FileText className="h-5 w-5 flex-shrink-0 text-orange-500 mt-0.5" />
                            <div>
                                <p className="font-medium text-foreground">Tax/MFI Code Required</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    A tax clearance or MFI verification code is required for this withdrawal.
                                    Please contact support if you haven't received your code.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {success && (
                    <Card className="border-green-500/50 bg-green-500/5">
                        <CardContent className="flex items-center gap-3 p-4">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            <div>
                                <p className="font-medium text-foreground">Withdrawal Request Submitted!</p>
                                <p className="text-sm text-muted-foreground">Your request is pending admin approval. Processing time: 24-48 hours.</p>
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

                {/* Status Overview */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <Wallet className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Balance</p>
                                    <p className="text-xl font-bold text-foreground">${totalBalance.toFixed(2)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <Shield className={`h-5 w-5 ${kycApproved ? 'text-green-500' : 'text-yellow-500'}`} />
                                <div>
                                    <p className="text-sm text-muted-foreground">KYC</p>
                                    <p className={`text-lg font-bold ${kycApproved ? 'text-green-500' : 'text-yellow-500'}`}>
                                        {kycApproved ? 'Verified' : 'Pending'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className={`h-5 w-5 ${tradesCompleted ? 'text-green-500' : 'text-yellow-500'}`} />
                                <div>
                                    <p className="text-sm text-muted-foreground">Trades</p>
                                    <p className="text-lg font-bold text-foreground">{userData?.completed_trades || 0}/2</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                {canWithdraw ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                ) : (
                                    <Lock className="h-5 w-5 text-destructive" />
                                )}
                                <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <p className={`text-lg font-bold ${canWithdraw ? 'text-green-500' : 'text-destructive'}`}>
                                        {canWithdraw ? 'Unlocked' : 'Locked'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Withdrawal Form */}
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Withdrawal Request</CardTitle>
                            <CardDescription>Enter the amount and wallet address for your withdrawal</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="crypto">Select Cryptocurrency</Label>
                                    <Select value={selectedCrypto} onValueChange={setSelectedCrypto} disabled={!canWithdraw}>
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
                                        placeholder="Enter amount (min $50)"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        min="50"
                                        max={totalBalance}
                                        disabled={!canWithdraw}
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Available: ${totalBalance.toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="wallet">Your {selectedCrypto} Wallet Address</Label>
                                <Input
                                    id="wallet"
                                    placeholder={`Enter your ${selectedCrypto} wallet address`}
                                    value={walletAddress}
                                    onChange={(e) => setWalletAddress(e.target.value)}
                                    className="font-mono"
                                    disabled={!canWithdraw}
                                    required
                                />
                            </div>

                            {userData?.withdrawal_code && (
                                <div className="space-y-2">
                                    <Label htmlFor="code">Withdrawal Code</Label>
                                    <Input
                                        id="code"
                                        placeholder="Enter your withdrawal code"
                                        value={withdrawalCode}
                                        onChange={(e) => setWithdrawalCode(e.target.value)}
                                        disabled={!canWithdraw}
                                        required
                                    />
                                </div>
                            )}

                            {userData?.tax_code && (
                                <div className="space-y-2">
                                    <Label htmlFor="taxCode">Tax/MFI Verification Code</Label>
                                    <Input
                                        id="taxCode"
                                        placeholder="Enter your Tax/MFI code"
                                        value={taxCode}
                                        onChange={(e) => setTaxCode(e.target.value)}
                                        disabled={!canWithdraw}
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Enter the tax clearance or MFI code provided to you. Contact support if you need assistance.
                                    </p>
                                </div>
                            )}

                            <div className="space-y-2 bg-muted/50 p-4 rounded-lg">
                                <p className="text-sm font-medium text-foreground">Withdrawal Requirements:</p>
                                <ul className="space-y-1 text-sm text-muted-foreground">
                                    <li className="flex items-center gap-2">
                                        {kycApproved ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-destructive" />}
                                        KYC Verification
                                    </li>
                                    <li className="flex items-center gap-2">
                                        {tradesCompleted ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-destructive" />}
                                        Minimum 2 trades completed
                                    </li>
                                    <li>• Minimum withdrawal: <strong>$50</strong></li>
                                    <li>• Processing time: <strong>24-48 hours</strong></li>
                                </ul>
                            </div>

                            <Button type="submit" className="w-full" size="lg" disabled={!canWithdraw || isSubmitting}>
                                {isSubmitting ? "Processing..." : canWithdraw ? "Submit Withdrawal Request" : "Withdrawal Locked"}
                            </Button>
                        </CardContent>
                    </Card>
                </form>

                {/* Withdrawal History */}
                <Card>
                    <CardHeader>
                        <CardTitle>Withdrawal History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {withdrawals.length > 0 ? (
                            <div className="space-y-4">
                                {withdrawals.map((withdrawal) => (
                                    <div key={withdrawal.id} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-3">
                                            {getStatusIcon(withdrawal.status)}
                                            <div>
                                                <p className="font-medium text-foreground">{withdrawal.crypto_type} Withdrawal</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(withdrawal.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-foreground">${withdrawal.amount.toFixed(2)}</p>
                                            <p className={`text-sm capitalize ${withdrawal.status === 'approved' ? 'text-green-500' :
                                                    withdrawal.status === 'rejected' ? 'text-destructive' : 'text-yellow-500'
                                                }`}>{withdrawal.status}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-sm text-muted-foreground py-4">No withdrawals yet</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
