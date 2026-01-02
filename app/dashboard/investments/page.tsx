"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { TrendingUp, CheckCircle2, Clock, AlertCircle, Wallet } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface InvestmentPlan {
    id: string
    name: string
    plan_type: string
    min_amount: number
    max_amount: number
    roi_percentage: number
    duration_days: number
    description: string
    features: string[]
    is_active: boolean
}

interface Investment {
    id: string
    plan_id: string
    amount: number
    expected_return: number
    current_return: number
    status: string
    start_date: string
    end_date: string
    investment_plans: InvestmentPlan
}

interface UserData {
    balance_deposit: number
    balance_profit: number
    balance_bonus: number
}

export default function InvestmentsPage() {
    const [plans, setPlans] = useState<InvestmentPlan[]>([])
    const [investments, setInvestments] = useState<Investment[]>([])
    const [userData, setUserData] = useState<UserData | null>(null)
    const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null)
    const [investAmount, setInvestAmount] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        fetchPlans()
        fetchInvestments()
        fetchUserData()
    }, [])

    const fetchPlans = async () => {
        const supabase = createClient()
        const { data } = await supabase
            .from("investment_plans")
            .select("*")
            .eq("is_active", true)
            .order("min_amount", { ascending: true })

        if (data) setPlans(data)
    }

    const fetchInvestments = async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
            .from("investments")
            .select("*, investment_plans(*)")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })

        if (data) setInvestments(data)
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

    const handleInvest = (plan: InvestmentPlan) => {
        setSelectedPlan(plan)
        setInvestAmount(plan.min_amount.toString())
        setError(null)
        setSuccess(false)
        setIsDialogOpen(true)
    }

    const handleSubmit = async () => {
        if (!selectedPlan) return
        setIsSubmitting(true)
        setError(null)

        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Please login to continue")

            const amount = parseFloat(investAmount)

            if (amount < selectedPlan.min_amount || amount > selectedPlan.max_amount) {
                throw new Error(`Amount must be between $${selectedPlan.min_amount} and $${selectedPlan.max_amount}`)
            }

            if (amount > totalBalance) {
                throw new Error("Insufficient balance")
            }

            const expectedReturn = amount * (selectedPlan.roi_percentage / 100)
            const endDate = new Date()
            endDate.setDate(endDate.getDate() + selectedPlan.duration_days)

            // Create investment
            const { error: investError } = await supabase.from("investments").insert({
                user_id: user.id,
                plan_id: selectedPlan.id,
                amount: amount,
                expected_return: expectedReturn,
                current_return: 0,
                status: "active",
                start_date: new Date().toISOString(),
                end_date: endDate.toISOString(),
            })

            if (investError) throw investError

            // Deduct from balance
            const { error: updateError } = await supabase
                .from("users")
                .update({ balance_deposit: (userData?.balance_deposit || 0) - amount })
                .eq("id", user.id)

            if (updateError) throw updateError

            setSuccess(true)
            setIsDialogOpen(false)
            fetchInvestments()
            fetchUserData()

        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "An error occurred")
        } finally {
            setIsSubmitting(false)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "active":
                return <span className="inline-flex items-center gap-1 text-sm text-primary"><Clock className="h-3 w-3" /> Active</span>
            case "completed":
                return <span className="inline-flex items-center gap-1 text-sm text-green-500"><CheckCircle2 className="h-3 w-3" /> Completed</span>
            default:
                return <span className="text-sm text-muted-foreground capitalize">{status}</span>
        }
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Investments</h1>
                        <p className="mt-1 text-muted-foreground">Grow your wealth with our investment plans</p>
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
                            <p className="text-foreground">Investment started successfully!</p>
                        </CardContent>
                    </Card>
                )}

                {/* Your Investments */}
                {investments.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-foreground">Your Investments</h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {investments.map((investment) => (
                                <Card key={investment.id} className={investment.status === 'active' ? 'border-primary/20' : ''}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg">{investment.investment_plans?.name || 'Investment'}</CardTitle>
                                            {getStatusBadge(investment.status)}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Amount Invested</span>
                                            <span className="font-medium text-foreground">${investment.amount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Current Return</span>
                                            <span className="font-medium text-green-500">+${investment.current_return.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Expected Return</span>
                                            <span className="font-medium text-foreground">${investment.expected_return.toFixed(2)}</span>
                                        </div>
                                        <div className="pt-2 border-t border-border text-xs text-muted-foreground">
                                            Started: {new Date(investment.start_date).toLocaleDateString()}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Investment Plans */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-foreground">Available Plans</h2>
                    {plans.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {plans.map((plan) => (
                                <Card key={plan.id} className="relative overflow-hidden hover:border-primary transition-colors">
                                    {plan.plan_type === 'gold' && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                            <span className="bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground rounded">
                                                POPULAR
                                            </span>
                                        </div>
                                    )}
                                    <CardHeader>
                                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                                        <CardDescription>{plan.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="text-center">
                                            <span className="text-4xl font-bold text-primary">{plan.roi_percentage}%</span>
                                            <span className="text-sm text-muted-foreground ml-1">ROI</span>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Duration</span>
                                                <span className="font-medium">{plan.duration_days} days</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Min Investment</span>
                                                <span className="font-medium">${plan.min_amount.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Max Investment</span>
                                                <span className="font-medium">${plan.max_amount.toLocaleString()}</span>
                                            </div>
                                        </div>
                                        {plan.features && plan.features.length > 0 && (
                                            <ul className="space-y-1 pt-2 border-t border-border">
                                                {plan.features.slice(0, 3).map((feature, i) => (
                                                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        <Button className="w-full" onClick={() => handleInvest(plan)}>
                                            <TrendingUp className="mr-2 h-4 w-4" />
                                            Invest Now
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                <p className="mt-4 text-muted-foreground">No investment plans available at the moment.</p>
                                <p className="text-sm text-muted-foreground">Check back soon for new opportunities.</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Investment Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Invest in {selectedPlan?.name}</DialogTitle>
                            <DialogDescription>
                                Enter the amount you want to invest. Minimum ${selectedPlan?.min_amount?.toLocaleString()}.
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
                                    placeholder={`Min $${selectedPlan?.min_amount}`}
                                    value={investAmount}
                                    onChange={(e) => setInvestAmount(e.target.value)}
                                    min={selectedPlan?.min_amount}
                                    max={Math.min(selectedPlan?.max_amount || 0, totalBalance)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Available balance: ${totalBalance.toFixed(2)}
                                </p>
                            </div>
                            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">ROI</span>
                                    <span className="font-bold text-primary">{selectedPlan?.roi_percentage}%</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Duration</span>
                                    <span className="font-medium">{selectedPlan?.duration_days} days</span>
                                </div>
                                <div className="flex justify-between text-sm border-t pt-2">
                                    <span className="text-muted-foreground">Expected Return</span>
                                    <span className="font-bold text-green-500">
                                        ${((parseFloat(investAmount) || 0) * ((selectedPlan?.roi_percentage || 0) / 100)).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSubmit} disabled={isSubmitting}>
                                {isSubmitting ? "Processing..." : "Confirm Investment"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
