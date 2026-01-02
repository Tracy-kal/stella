import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function PortfolioPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: investments } = await supabase
    .from("investments")
    .select("*, investment_plans(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Investment Portfolio</h1>
            <p className="mt-1 text-muted-foreground">Track your investments and earnings</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/deposits">New Investment</Link>
          </Button>
        </div>

        {investments && investments.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {investments.map((investment) => (
              <Card key={investment.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{investment.investment_plans.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-medium text-foreground">${investment.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Expected Return</span>
                    <span className="font-medium text-foreground">${investment.expected_return.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Current Return</span>
                    <span className="font-medium text-accent">${investment.current_return.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium capitalize text-foreground">{investment.status}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Start Date</span>
                    <span className="text-foreground">{new Date(investment.start_date).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No investments yet</p>
              <Button className="mt-4" asChild>
                <Link href="/dashboard/deposits">Start Investing</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
