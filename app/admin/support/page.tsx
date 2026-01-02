import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function AdminSupportPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/admin/login")

  const { data: tickets } = await supabase
    .from("support_tickets")
    .select("*, users(full_name, email)")
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Support Tickets</h1>
          <p className="mt-1 text-muted-foreground">Manage customer support requests</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Tickets ({tickets?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">User</th>
                    <th className="pb-3 font-medium">Subject</th>
                    <th className="pb-3 font-medium">Priority</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Created</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets?.map((ticket) => (
                    <tr key={ticket.id} className="border-b border-border text-sm">
                      <td className="py-4">
                        <p className="font-medium text-foreground">{ticket.users?.full_name}</p>
                        <p className="text-xs text-muted-foreground">{ticket.users?.email}</p>
                      </td>
                      <td className="py-4 text-foreground">{ticket.subject}</td>
                      <td className="py-4">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium capitalize ${
                            ticket.priority === "urgent"
                              ? "bg-destructive/10 text-destructive"
                              : ticket.priority === "high"
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="py-4">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium capitalize ${
                            ticket.status === "open"
                              ? "bg-primary/10 text-primary"
                              : ticket.status === "in_progress"
                                ? "bg-accent/10 text-accent"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {ticket.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-4 text-muted-foreground">{new Date(ticket.created_at).toLocaleDateString()}</td>
                      <td className="py-4">
                        <Button size="sm" variant="ghost">
                          View
                        </Button>
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
