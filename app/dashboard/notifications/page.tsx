import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, CheckCheck } from "lucide-react"

export default async function NotificationsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
            <p className="mt-1 text-muted-foreground">Stay updated with your account activity</p>
          </div>
          <Button variant="outline">
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark All Read
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            {notifications && notifications.length > 0 ? (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex gap-4 border-b border-border pb-4 ${!notification.is_read && "bg-muted/20"}`}
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center bg-primary/10">
                      <Bell className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{notification.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                    {!notification.is_read && <div className="h-2 w-2 flex-shrink-0 bg-primary"></div>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground">No notifications yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
