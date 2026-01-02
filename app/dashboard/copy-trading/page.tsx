import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"

export default function CopyTradingPage() {
  const experts = [
    { name: "Michael Trading", followers: 1250, successRate: 87.5, profit: 145000, avatar: "MT" },
    { name: "Sarah Forex Pro", followers: 980, successRate: 92.3, profit: 198000, avatar: "SF" },
    { name: "David Crypto", followers: 2100, successRate: 85.2, profit: 167000, avatar: "DC" },
  ]

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Copy Trading</h1>
          <p className="mt-1 text-muted-foreground">Follow expert traders and copy their strategies automatically</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {experts.map((expert, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center bg-primary text-sm font-bold text-primary-foreground">
                    {expert.avatar}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{expert.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{expert.followers} followers</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Success Rate</span>
                  <span className="font-medium text-accent">{expert.successRate}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Profit</span>
                  <span className="font-medium text-foreground">${expert.profit.toLocaleString()}</span>
                </div>
                <Button className="w-full">
                  <Users className="mr-2 h-4 w-4" />
                  Copy Trader
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
