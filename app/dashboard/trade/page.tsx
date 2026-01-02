import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default async function TradePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: userData } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (!userData?.can_trade) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <h2 className="mt-4 text-xl font-bold text-foreground">Trading Not Activated</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your account needs to be activated for trading. Please make a deposit or contact support.
            </p>
            <Button className="mt-6">Contact Support</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Trading Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Execute trades and monitor your positions</p>
        </div>

        {/* TradingView Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Market Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video w-full bg-muted"></div>
          </CardContent>
        </Card>

        {/* Trading Interface */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Place Trade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 bg-muted"></div>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Open Positions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">No open positions</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
