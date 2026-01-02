import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Radio } from "lucide-react"

export default function SignalsPage() {
  const providers = [
    { name: "Pro Signals", price: 99, accuracy: 89, signals: 450, avatar: "PS" },
    { name: "Elite Trades", price: 149, accuracy: 93, signals: 320, avatar: "ET" },
    { name: "Market Masters", price: 199, accuracy: 91, signals: 580, avatar: "MM" },
  ]

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Trading Signals</h1>
          <p className="mt-1 text-muted-foreground">Subscribe to premium signals from verified providers</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {providers.map((provider, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center bg-primary text-sm font-bold text-primary-foreground">
                    {provider.avatar}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{provider.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">${provider.price}/month</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Accuracy</span>
                  <span className="font-medium text-accent">{provider.accuracy}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Signals</span>
                  <span className="font-medium text-foreground">{provider.signals}</span>
                </div>
                <Button className="w-full">
                  <Radio className="mr-2 h-4 w-4" />
                  Subscribe
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
