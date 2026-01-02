import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default async function AdminInvestmentsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/admin/login")

  const { data: investments } = await supabase
    .from("investments")
    .select("*, users(full_name, email), investment_plans(name)")
    .order("created_at", { ascending: false })

  const { data: plans } = await supabase.from("investment_plans").select("*").order("min_amount")

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Investment Management</h1>
            <p className="mt-1 text-muted-foreground">Manage investment plans and user investments</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Plan
          </Button>
        </div>

        {/* Investment Plans */}
        <Card>
          <CardHeader>
            <CardTitle>Investment Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {plans?.map((plan) => (
                <Card key={plan.id}>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground">{plan.name}</h3>
                    <p className="mt-2 text-2xl font-bold text-primary">{plan.roi_percentage}% ROI</p>
                    <div className="mt-4 space-y-2 text-sm">
                      <p className="text-muted-foreground">
                        Range: ${plan.min_amount} - ${plan.max_amount}
                      </p>
                      <p className="text-muted-foreground">Duration: {plan.duration_days} days</p>
                      <p
                        className={`inline-block px-2 py-1 text-xs ${
                          plan.is_active ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {plan.is_active ? "Active" : "Inactive"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Investments */}
        <Card>
          <CardHeader>
            <CardTitle>All Investments ({investments?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">User</th>
                    <th className="pb-3 font-medium">Plan</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Expected</th>
                    <th className="pb-3 font-medium">Current</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {investments?.map((investment) => (
                    <tr key={investment.id} className="border-b border-border text-sm">
                      <td className="py-4">
                        <p className="font-medium text-foreground">{investment.users?.full_name}</p>
                      </td>
                      <td className="py-4 text-muted-foreground">{investment.investment_plans?.name}</td>
                      <td className="py-4 font-medium text-foreground">${investment.amount}</td>
                      <td className="py-4 text-muted-foreground">${investment.expected_return}</td>
                      <td className="py-4 font-medium text-accent">${investment.current_return}</td>
                      <td className="py-4">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium capitalize ${
                            investment.status === "active"
                              ? "bg-accent/10 text-accent"
                              : investment.status === "completed"
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {investment.status}
                        </span>
                      </td>
                      <td className="py-4 text-muted-foreground">
                        {new Date(investment.start_date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
