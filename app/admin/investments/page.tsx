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
import { Plus, Pencil, Trash2, TrendingUp, Users } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

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
  created_at: string
}

interface Investment {
  id: string
  user_id: string
  plan_id: string
  amount: number
  expected_return: number
  current_return: number
  status: string
  start_date: string
  users: { full_name: string; email: string }
  investment_plans: { name: string }
}

export default function AdminInvestmentsPage() {
  const [plans, setPlans] = useState<InvestmentPlan[]>([])
  const [investments, setInvestments] = useState<Investment[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<InvestmentPlan | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    plan_type: "basic",
    min_amount: "500",
    max_amount: "10000",
    roi_percentage: "15",
    duration_days: "30",
    description: "",
    features: "",
  })

  useEffect(() => {
    fetchPlans()
    fetchInvestments()
  }, [])

  const fetchPlans = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("investment_plans")
      .select("*")
      .order("min_amount", { ascending: true })

    if (data) setPlans(data)
  }

  const fetchInvestments = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("investments")
      .select("*, users(full_name, email), investment_plans(name)")
      .order("created_at", { ascending: false })

    if (data) setInvestments(data as Investment[])
  }

  const handleOpenDialog = (plan?: InvestmentPlan) => {
    if (plan) {
      setEditingPlan(plan)
      setFormData({
        name: plan.name,
        plan_type: plan.plan_type,
        min_amount: plan.min_amount.toString(),
        max_amount: plan.max_amount.toString(),
        roi_percentage: plan.roi_percentage.toString(),
        duration_days: plan.duration_days.toString(),
        description: plan.description || "",
        features: plan.features?.join("\n") || "",
      })
    } else {
      setEditingPlan(null)
      setFormData({
        name: "",
        plan_type: "basic",
        min_amount: "500",
        max_amount: "10000",
        roi_percentage: "15",
        duration_days: "30",
        description: "",
        features: "",
      })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const supabase = createClient()

      const featuresArray = formData.features
        .split("\n")
        .map((f) => f.trim())
        .filter((f) => f.length > 0)

      const planData = {
        name: formData.name,
        plan_type: formData.plan_type,
        min_amount: parseFloat(formData.min_amount),
        max_amount: parseFloat(formData.max_amount),
        roi_percentage: parseFloat(formData.roi_percentage),
        duration_days: parseInt(formData.duration_days),
        description: formData.description,
        features: featuresArray,
      }

      if (editingPlan) {
        await supabase.from("investment_plans").update(planData).eq("id", editingPlan.id)
      } else {
        await supabase.from("investment_plans").insert({
          ...planData,
          is_active: true,
        })
      }

      setIsDialogOpen(false)
      fetchPlans()
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleActive = async (plan: InvestmentPlan) => {
    const supabase = createClient()
    await supabase.from("investment_plans").update({ is_active: !plan.is_active }).eq("id", plan.id)
    fetchPlans()
  }

  const handleDelete = async (plan: InvestmentPlan) => {
    if (!confirm("Are you sure you want to delete this plan?")) return
    const supabase = createClient()
    await supabase.from("investment_plans").delete().eq("id", plan.id)
    fetchPlans()
  }

  const handleUpdateInvestmentReturn = async (investmentId: string, currentReturn: number) => {
    const supabase = createClient()
    await supabase.from("investments").update({ current_return: currentReturn }).eq("id", investmentId)
    fetchInvestments()
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Investment Management</h1>
            <p className="mt-1 text-muted-foreground">Manage investment plans and user investments</p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Create Plan
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <TrendingUp className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Plans</p>
                  <p className="text-2xl font-bold">{plans.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Users className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Investments</p>
                  <p className="text-2xl font-bold">{investments.filter((i) => i.status === "active").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <TrendingUp className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Invested</p>
                  <p className="text-2xl font-bold">
                    ${investments.reduce((sum, i) => sum + i.amount, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Investment Plans Table */}
        <Card>
          <CardHeader>
            <CardTitle>Investment Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>ROI</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Range</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell className="capitalize">{plan.plan_type}</TableCell>
                    <TableCell className="text-primary font-medium">{plan.roi_percentage}%</TableCell>
                    <TableCell>{plan.duration_days} days</TableCell>
                    <TableCell>
                      ${plan.min_amount.toLocaleString()} - ${plan.max_amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Switch checked={plan.is_active} onCheckedChange={() => handleToggleActive(plan)} />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleOpenDialog(plan)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(plan)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {plans.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No investment plans found. Click "Create Plan" to add one.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* User Investments Table */}
        <Card>
          <CardHeader>
            <CardTitle>User Investments ({investments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Expected</TableHead>
                  <TableHead>Current Return</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {investments.map((investment) => (
                  <TableRow key={investment.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{investment.users?.full_name}</p>
                        <p className="text-sm text-muted-foreground">{investment.users?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{investment.investment_plans?.name}</TableCell>
                    <TableCell className="font-medium">${investment.amount.toLocaleString()}</TableCell>
                    <TableCell>${investment.expected_return.toFixed(2)}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        className="w-24"
                        defaultValue={investment.current_return}
                        onBlur={(e) =>
                          handleUpdateInvestmentReturn(investment.id, parseFloat(e.target.value) || 0)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded capitalize ${investment.status === "active"
                            ? "bg-green-500/10 text-green-500"
                            : investment.status === "completed"
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                      >
                        {investment.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(investment.start_date).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
                {investments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No investments found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Create/Edit Plan Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingPlan ? "Edit Investment Plan" : "Create Investment Plan"}</DialogTitle>
              <DialogDescription>
                {editingPlan
                  ? "Update the investment plan details."
                  : "Create a new investment plan for users."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Plan Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Gold Plan"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Plan Type</Label>
                  <Select
                    value={formData.plan_type}
                    onValueChange={(v) => setFormData({ ...formData, plan_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="silver">Silver</SelectItem>
                      <SelectItem value="gold">Gold</SelectItem>
                      <SelectItem value="platinum">Platinum</SelectItem>
                      <SelectItem value="diamond">Diamond</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="min">Min Amount ($)</Label>
                  <Input
                    id="min"
                    type="number"
                    value={formData.min_amount}
                    onChange={(e) => setFormData({ ...formData, min_amount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max">Max Amount ($)</Label>
                  <Input
                    id="max"
                    type="number"
                    value={formData.max_amount}
                    onChange={(e) => setFormData({ ...formData, max_amount: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="roi">ROI Percentage (%)</Label>
                  <Input
                    id="roi"
                    type="number"
                    step="0.1"
                    value={formData.roi_percentage}
                    onChange={(e) => setFormData({ ...formData, roi_percentage: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (Days)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration_days}
                    onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of this plan..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="features">Features (one per line)</Label>
                <Textarea
                  id="features"
                  placeholder="Daily profit updates&#10;24/7 support&#10;Capital guarantee"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : editingPlan ? "Update Plan" : "Create Plan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
