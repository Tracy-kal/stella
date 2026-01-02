import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default async function AdminTradesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/admin/login")

  const { data: trades } = await supabase
    .from("trades")
    .select("*, users(full_name, email)")
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Trade Management</h1>
            <p className="mt-1 text-muted-foreground">Monitor and place trades on behalf of users</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Place Trade
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Trades ({trades?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">User</th>
                    <th className="pb-3 font-medium">Symbol</th>
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Entry</th>
                    <th className="pb-3 font-medium">Exit</th>
                    <th className="pb-3 font-medium">P/L</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {trades?.map((trade) => (
                    <tr key={trade.id} className="border-b border-border text-sm">
                      <td className="py-4">
                        <p className="font-medium text-foreground">{trade.users?.full_name}</p>
                      </td>
                      <td className="py-4 font-medium text-foreground">{trade.symbol}</td>
                      <td className="py-4">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium uppercase ${
                            trade.trade_type === "buy"
                              ? "bg-accent/10 text-accent"
                              : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          {trade.trade_type}
                        </span>
                      </td>
                      <td className="py-4 text-muted-foreground">${trade.amount}</td>
                      <td className="py-4 text-muted-foreground">${trade.entry_price}</td>
                      <td className="py-4 text-muted-foreground">{trade.exit_price ? `$${trade.exit_price}` : "-"}</td>
                      <td className="py-4">
                        <span className={`font-medium ${trade.profit_loss >= 0 ? "text-accent" : "text-destructive"}`}>
                          {trade.profit_loss >= 0 ? "+" : ""}${trade.profit_loss}
                        </span>
                      </td>
                      <td className="py-4">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium capitalize ${
                            trade.status === "open"
                              ? "bg-primary/10 text-primary"
                              : trade.status === "closed"
                                ? "bg-muted text-muted-foreground"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {trade.status}
                        </span>
                      </td>
                      <td className="py-4 text-muted-foreground">{new Date(trade.created_at).toLocaleDateString()}</td>
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
