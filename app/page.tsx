"use client"

import { Navbar } from "@/components/navbar"
import { Ticker } from "@/components/ticker"
import { Footer } from "@/components/footer"
import { FloatingNotification } from "@/components/floating-notification"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { TrendingUp, Shield, Users, BarChart3, Clock, Award, ArrowRight, CheckCircle2, Globe, Zap, Wallet, LineChart, Lock, Smartphone, Headphones, Target } from "lucide-react"

export default function HomePage() {
  const partners = [
    "Binance", "Coinbase", "TradingView", "MetaTrader", "Bloomberg",
    "Reuters", "CoinMarketCap", "Kraken", "Gemini", "Bitfinex",
    "CME Group", "NASDAQ"
  ]

  return (
    <div className="min-h-screen">
      <Navbar />
      <Ticker />
      <FloatingNotification />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-balance text-5xl font-bold leading-tight text-foreground lg:text-6xl">
              Trade Smarter, Invest Better
            </h1>
            <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
              Access global markets with institutional-grade tools. Copy expert traders, receive premium signals, and
              grow your wealth with StellaOne Capitals.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/auth/signup">
                  Start Trading Now <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-8 pt-4">
              <div>
                <p className="text-3xl font-bold text-foreground">50K+</p>
                <p className="text-sm text-muted-foreground">Active Traders</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">$2.5B+</p>
                <p className="text-sm text-muted-foreground">Trading Volume</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">150+</p>
                <p className="text-sm text-muted-foreground">Countries</p>
              </div>
            </div>
          </div>
          <div className="animate-fade-in">
            <div className="relative w-full overflow-hidden rounded-xl border border-border shadow-2xl" style={{ minHeight: '500px' }}>
              <img
                src="/image/pexels-davidmcbee-730564.jpg"
                alt="Trading Platform"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* TradingView Widget Section */}
      <section className="border-y border-border bg-card/50 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-balance text-3xl font-bold text-foreground">Real-Time Market Data</h2>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              Stay informed with live market data, advanced charts, and professional analysis tools powered by
              TradingView.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-video w-full">
                  <iframe
                    src="https://s.tradingview.com/widgetembed/?symbol=BINANCE:BTCUSDT&interval=D&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=[]&theme=dark&style=1&timezone=Etc/UTC"
                    className="h-full w-full border-0"
                    title="Bitcoin Chart"
                  />
                </div>
              </CardContent>
            </Card>
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-video w-full">
                  <iframe
                    src="https://s.tradingview.com/widgetembed/?symbol=BINANCE:ETHUSDT&interval=D&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=[]&theme=dark&style=1&timezone=Etc/UTC"
                    className="h-full w-full border-0"
                    title="Ethereum Chart"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-3xl font-bold text-foreground">Why Choose StellaOne Capitals</h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            Experience the perfect blend of advanced technology, expert guidance, and comprehensive support.
          </p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Shield,
              title: "Secure & Regulated",
              description: "Your funds are protected with bank-level security and regulatory compliance.",
            },
            {
              icon: TrendingUp,
              title: "Copy Trading",
              description: "Follow and copy successful traders automatically. Profit from expert strategies.",
            },
            {
              icon: BarChart3,
              title: "Advanced Analytics",
              description: "Professional-grade charts, indicators, and market analysis tools at your fingertips.",
            },
            {
              icon: Users,
              title: "Expert Signals",
              description: "Receive premium trading signals from verified professional traders.",
            },
            {
              icon: Clock,
              title: "24/7 Support",
              description: "Round-the-clock customer support to help you succeed in your trading journey.",
            },
            {
              icon: Zap,
              title: "Fast Execution",
              description: "Lightning-fast order execution with minimal slippage and competitive spreads.",
            },
          ].map((feature, index) => (
            <Card key={index} className="border-border transition-all hover:border-primary">
              <CardContent className="p-6">
                <feature.icon className="h-10 w-10 text-primary" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="border-y border-border bg-card/50 py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-balance text-3xl font-bold text-foreground">How It Works</h2>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              Start trading in three simple steps and join thousands of successful investors.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                icon: Wallet,
                title: "Create Your Account",
                description: "Sign up in minutes with our streamlined verification process. Your security is our priority.",
              },
              {
                step: "02",
                icon: LineChart,
                title: "Fund & Analyze",
                description: "Deposit using crypto or fiat. Access real-time charts, expert signals, and market insights.",
              },
              {
                step: "03",
                icon: Target,
                title: "Trade & Profit",
                description: "Execute trades, copy experts, or let our signals guide you to consistent returns.",
              },
            ].map((item, index) => (
              <div key={index} className="relative text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 border-2 border-primary">
                  <item.icon className="h-10 w-10 text-primary" />
                </div>
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-6xl font-bold text-primary/10">{item.step}</span>
                <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {[
            { value: "$2.5B+", label: "Total Trading Volume", icon: TrendingUp },
            { value: "50,000+", label: "Active Traders", icon: Users },
            { value: "150+", label: "Countries Served", icon: Globe },
            { value: "99.9%", label: "Platform Uptime", icon: Zap },
          ].map((stat, index) => (
            <Card key={index} className="text-center border-border hover:border-primary transition-all">
              <CardContent className="p-8">
                <stat.icon className="mx-auto h-8 w-8 text-primary mb-4" />
                <p className="text-4xl font-bold text-foreground">{stat.value}</p>
                <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="border-y border-border bg-card/50 py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-balance text-3xl font-bold text-foreground">Trusted by Thousands</h2>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              See what our clients say about their experience with StellaOne Capitals.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                name: "Robert Chen",
                role: "Professional Trader",
                avatar: "RC",
                image: "/image/pexels-thecoachspace-2977547.jpg",
                content:
                  "The copy trading feature is exceptional. I've been following top traders and my portfolio has grown by 45% in just 6 months.",
              },
              {
                name: "Lisa Anderson",
                role: "Investor",
                avatar: "LA",
                image: "/image/pexels-dvaughnbell-2068664.jpg",
                content:
                  "StellaOne Capitals provides the best investment plans with consistent returns. Their support team is always helpful and responsive.",
              },
              {
                name: "Marcus Johnson",
                role: "Day Trader",
                avatar: "MJ",
                image: "/image/pexels-yankrukov-7693744.jpg",
                content:
                  "Fast execution, great analytics tools, and premium signals. Everything I need for successful trading in one platform.",
              },
            ].map((testimonial, index) => (
              <Card key={index} className="border-border overflow-hidden">
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <p className="text-sm leading-relaxed text-muted-foreground">"{testimonial.content}"</p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section - Infinite Scroll Carousel */}
      <section className="border-b border-border py-16 overflow-hidden">
        <div className="container mx-auto px-4 mb-8">
          <p className="text-center text-sm font-medium text-muted-foreground">TRUSTED BY LEADING ORGANIZATIONS</p>
        </div>
        <div className="relative">
          <div className="flex animate-scroll">
            {[...partners, ...partners].map((partner, i) => (
              <div
                key={i}
                className="flex-shrink-0 mx-8 flex h-16 w-40 items-center justify-center rounded-lg bg-card border border-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-primary transition-all"
              >
                {partner}
              </div>
            ))}
          </div>
        </div>
        <style jsx>{`
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          .animate-scroll {
            animation: scroll 30s linear infinite;
          }
          .animate-scroll:hover {
            animation-play-state: paused;
          }
        `}</style>
      </section>

      {/* Security & Compliance Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div className="space-y-6">
            <h2 className="text-balance text-3xl font-bold text-foreground">
              Bank-Level Security for Your Assets
            </h2>
            <p className="text-pretty leading-relaxed text-muted-foreground">
              Your security is our top priority. We employ multiple layers of protection to ensure your funds and data remain safe at all times.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: Lock, title: "256-bit Encryption", description: "Military-grade encryption for all data" },
                { icon: Shield, title: "Cold Storage", description: "95% of assets stored offline" },
                { icon: Smartphone, title: "2FA Protection", description: "Multi-factor authentication" },
                { icon: Headphones, title: "24/7 Monitoring", description: "Real-time threat detection" },
              ].map((item, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square w-full overflow-hidden rounded-xl border border-border">
              <img
                src="/image/pexels-n-voitkevich-6120214.jpg"
                alt="Security"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Countries & Economic Calendar */}
      <section className="border-y border-border bg-card/50 py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <Globe className="mx-auto h-12 w-12 text-primary" />
            <h2 className="mt-4 text-balance text-3xl font-bold text-foreground">Global Market Access</h2>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              Trade across 150+ countries with real-time economic data and market insights.
            </p>
          </div>
          <Card className="mt-12 overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-[16/9] w-full">
                <iframe
                  src="https://s.tradingview.com/embed-widget/market-overview/?locale=en#%7B%22colorTheme%22%3A%22dark%22%2C%22dateRange%22%3A%2212M%22%2C%22showChart%22%3Atrue%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22100%25%22%2C%22largeChartUrl%22%3A%22%22%2C%22isTransparent%22%3Afalse%2C%22showSymbolLogo%22%3Atrue%2C%22showFloatingTooltip%22%3Afalse%2C%22plotLineColorGrowing%22%3A%22rgba(41%2C%20191%2C%2099%2C%201)%22%2C%22plotLineColorFalling%22%3A%22rgba(241%2C%2096%2C%2082%2C%201)%22%2C%22gridLineColor%22%3A%22rgba(240%2C%20243%2C%20250%2C%200)%22%2C%22scaleFontColor%22%3A%22rgba(120%2C%20123%2C%20134%2C%201)%22%2C%22belowLineFillColorGrowing%22%3A%22rgba(41%2C%20191%2C%2099%2C%200.12)%22%2C%22belowLineFillColorFalling%22%3A%22rgba(241%2C%2096%2C%2082%2C%200.12)%22%2C%22belowLineFillColorGrowingBottom%22%3A%22rgba(41%2C%20191%2C%2099%2C%200)%22%2C%22belowLineFillColorFallingBottom%22%3A%22rgba(241%2C%2096%2C%2082%2C%200)%22%2C%22symbolActiveColor%22%3A%22rgba(41%2C%2098%2C%20255%2C%200.12)%22%2C%22tabs%22%3A%5B%7B%22title%22%3A%22Forex%22%2C%22symbols%22%3A%5B%7B%22s%22%3A%22FX%3AEURUSD%22%7D%2C%7B%22s%22%3A%22FX%3AGBPUSD%22%7D%2C%7B%22s%22%3A%22FX%3AUSDJPY%22%7D%2C%7B%22s%22%3A%22FX%3AAUDUSD%22%7D%5D%7D%2C%7B%22title%22%3A%22Crypto%22%2C%22symbols%22%3A%5B%7B%22s%22%3A%22BINANCE%3ABTCUSDT%22%7D%2C%7B%22s%22%3A%22BINANCE%3AETHUSDT%22%7D%2C%7B%22s%22%3A%22BINANCE%3ASOLUSDT%22%7D%5D%7D%5D%7D"
                  className="h-full w-full border-0"
                  title="Market Overview"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Blog/News Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Latest News & Insights</h2>
          <Button variant="ghost" asChild>
            <Link href="/blog">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            {
              image: "/image/pexels-anna-nekrashevich-6802049.jpg",
              date: "Dec 28, 2024",
              title: "Bitcoin Surges: What's Driving the Rally",
              description: "Analyze the key factors behind Bitcoin's recent price surge and expert predictions for the coming months."
            },
            {
              image: "/image/pexels-n-voitkevich-6120182.jpg",
              date: "Dec 26, 2024",
              title: "Forex Trading: 2025 Currency Outlook",
              description: "Discover major currency movements expected in 2025 and strategies to capitalize on forex volatility."
            },
            {
              image: "/image/pexels-goumbik-669610.jpg",
              date: "Dec 24, 2024",
              title: "Copy Trading: Expert Strategies Revealed",
              description: "Learn how top traders are generating consistent returns and how to follow their strategies."
            }
          ].map((article, i) => (
            <Card key={i} className="overflow-hidden border-border group">
              <div className="aspect-video w-full overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <CardContent className="p-6">
                <p className="text-xs text-muted-foreground">{article.date}</p>
                <h3 className="mt-2 text-lg font-semibold text-foreground">{article.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {article.description}
                </p>
                <Button variant="ghost" className="mt-4 p-0" asChild>
                  <Link href="#">
                    Read More <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24">
        <Card className="border-primary bg-primary/5">
          <CardContent className="p-12 text-center">
            <Award className="mx-auto h-12 w-12 text-primary" />
            <h2 className="mt-4 text-balance text-3xl font-bold text-foreground">
              Ready to Start Your Investment Journey?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
              Join thousands of successful traders and investors. Open your account today and start building wealth with
              StellaOne Capitals.
            </p>
            <Button size="lg" className="mt-8" asChild>
              <Link href="/auth/signup">
                Create Free Account <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <Footer />
    </div>
  )
}
