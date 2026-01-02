import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Search, UserPlus } from "lucide-react"

export default async function AdminUsersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/admin/login")

  const { data: adminUser } = await supabase.from("admin_users").select("*").eq("id", user.id).single()
  if (!adminUser) redirect("/")

  const { data: users } = await supabase.from("users").select("*").order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">User Management</h1>
            <p className="mt-1 text-muted-foreground">Manage all user accounts and permissions</p>
          </div>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search users by name or email..." className="pl-10" />
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Users ({users?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Country</th>
                    <th className="pb-3 font-medium">Balance</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users?.map((user) => (
                    <tr key={user.id} className="border-b border-border text-sm">
                      <td className="py-4">
                        <p className="font-medium text-foreground">{user.full_name}</p>
                      </td>
                      <td className="py-4 text-muted-foreground">{user.email}</td>
                      <td className="py-4 text-muted-foreground">{user.country}</td>
                      <td className="py-4 font-medium text-foreground">
                        ${(user.balance_deposit + user.balance_profit + user.balance_bonus).toFixed(2)}
                      </td>
                      <td className="py-4">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium ${
                            user.account_status === "active"
                              ? "bg-accent/10 text-accent"
                              : user.account_status === "blocked"
                                ? "bg-destructive/10 text-destructive"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {user.account_status}
                        </span>
                      </td>
                      <td className="py-4">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/users/${user.id}`}>Manage</Link>
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
