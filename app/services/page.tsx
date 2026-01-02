import { Navbar } from "@/components/navbar"
import { Ticker } from "@/components/ticker"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { TrendingUp, Users, Radio, BarChart3, Wallet, GraduationCap, ArrowRight } from "lucide-react"

export default function ServicesPage() {
  const services = [
    {
      icon: TrendingUp,
      title: "Investment Plans",
      description:
        "Choose from our diverse investment plans designed to match your financial goals. From conservative to aggressive strategies, earn consistent returns with transparent ROI structures.",
      features: ["Multiple plan tiers", "Guaranteed returns", "Flexible duration", "Automated reinvestment"],
    },
    {
      icon: Users,
      title: "Copy Trading",
      description:
        "Follow and automatically replicate the trades of successful expert traders. Benefit from their experience and strategies without needing to be a trading expert yourself.",
      features: ["Top-rated experts", "Real-time copying", "Transparent performance", "Risk management"],
    },
    {
      icon: Radio,
      title: "Trading Signals",
      description:
        "Receive premium trading signals from verified professional traders. Get real-time entry and exit points, stop loss, and take profit levels for optimal trade execution.",
      features: ["Multiple signal providers", "Real-time alerts", "High accuracy rates", "Detailed analysis"],
    },
    {
      icon: BarChart3,
      title: "Advanced Trading",
      description:
        "Access institutional-grade trading tools with our powerful platform. Trade forex, crypto, stocks, and commodities with competitive leverage and ultra-fast execution.",
      features: ["Multiple asset classes", "Advanced charting", "Up to 100x leverage", "Lightning-fast execution"],
    },
    {
      icon: Wallet,
      title: "Portfolio Management",
      description:
        "Track all your investments and trades in one unified dashboard. Monitor performance, analyze profits, and optimize your portfolio with comprehensive analytics.",
      features: ["Real-time tracking", "Performance analytics", "Risk assessment", "Detailed reports"],
    },
    {
      icon: GraduationCap,
      title: "Education & Support",
      description:
        "Learn from our extensive educational resources and get 24/7 support from our expert team. We're committed to helping you succeed in your trading journey.",
      features: ["Trading academy", "Video tutorials", "24/7 support", "Personal account manager"],
    },
  ]

  return (
    <div className="min-h-screen">
      <Navbar />
      <Ticker />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-balance text-5xl font-bold leading-tight text-foreground">Our Services</h1>
          <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground">
            Comprehensive investment and trading solutions designed to help you achieve your financial goals.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="container mx-auto px-4 pb-24">
        <div className="grid gap-8 lg:grid-cols-2">
          {services.map((service, index) => (
            <Card key={index} className="border-border transition-all hover:border-primary">
              <CardContent className="p-8">
                <service.icon className="h-12 w-12 text-primary" />
                <h2 className="mt-4 text-2xl font-bold text-foreground">{service.title}</h2>
                <p className="mt-3 leading-relaxed text-muted-foreground">{service.description}</p>
                <ul className="mt-6 space-y-2">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="h-1.5 w-1.5 bg-accent"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-card/50 py-24">
        <div className="container mx-auto px-4">
          <Card className="border-primary bg-primary/5">
            <CardContent className="p-12 text-center">
              <h2 className="text-balance text-3xl font-bold text-foreground">Ready to Get Started?</h2>
              <p className="mx-auto mt-4 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
                Open your account today and access all our premium services.
              </p>
              <Button size="lg" className="mt-8" asChild>
                <Link href="/auth/signup">
                  Create Account <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  )
}
