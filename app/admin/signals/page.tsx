import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function AdminSignalsPage() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Signal Providers</h1>
            <p className="mt-1 text-muted-foreground">Manage signal providers and trading signals</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Provider
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Active Signal Providers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-sm text-muted-foreground">No signal providers yet</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
