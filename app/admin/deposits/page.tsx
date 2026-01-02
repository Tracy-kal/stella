import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle } from "lucide-react"

export default async function AdminDepositsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/admin/login")

  const { data: deposits } = await supabase
    .from("transactions")
    .select("*, users(full_name, email)")
    .eq("type", "deposit")
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Deposit Management</h1>
          <p className="mt-1 text-muted-foreground">Review and approve user deposits</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Deposits ({deposits?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">User</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Crypto</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deposits?.map((deposit) => (
                    <tr key={deposit.id} className="border-b border-border text-sm">
                      <td className="py-4">
                        <p className="font-medium text-foreground">{deposit.users?.full_name}</p>
                        <p className="text-xs text-muted-foreground">{deposit.users?.email}</p>
                      </td>
                      <td className="py-4 font-medium text-foreground">${deposit.amount}</td>
                      <td className="py-4 text-muted-foreground">{deposit.crypto_type || "N/A"}</td>
                      <td className="py-4">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium ${
                            deposit.status === "approved"
                              ? "bg-accent/10 text-accent"
                              : deposit.status === "rejected"
                                ? "bg-destructive/10 text-destructive"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {deposit.status}
                        </span>
                      </td>
                      <td className="py-4 text-muted-foreground">
                        {new Date(deposit.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4">
                        {deposit.status === "pending" && (
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" className="h-8 px-2 text-accent">
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 px-2 text-destructive">
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
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
