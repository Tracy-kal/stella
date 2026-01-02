import { Navbar } from "@/components/navbar"
import { Ticker } from "@/components/ticker"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Target, Users, Globe, Award, TrendingUp, Shield } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Ticker />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-balance text-5xl font-bold leading-tight text-foreground">About StellaOne Capitals</h1>
          <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground">
            We are a global leader in investment and trading solutions, empowering individuals and institutions to
            achieve their financial goals through innovative technology and expert guidance.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="border-y border-border bg-card/50 py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2">
            <Card>
              <CardContent className="p-8">
                <Target className="h-12 w-12 text-primary" />
                <h2 className="mt-4 text-2xl font-bold text-foreground">Our Mission</h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  To democratize access to global financial markets by providing cutting-edge tools, education, and
                  support that enable everyone to build and preserve wealth through intelligent investing and trading.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-8">
                <Award className="h-12 w-12 text-primary" />
                <h2 className="mt-4 text-2xl font-bold text-foreground">Our Vision</h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  To become the world's most trusted investment platform, recognized for exceptional service,
                  transparency, and empowering millions of people to achieve financial independence.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Users, value: "50,000+", label: "Active Users" },
            { icon: Globe, value: "150+", label: "Countries" },
            { icon: TrendingUp, value: "$2.5B+", label: "Trading Volume" },
            { icon: Shield, value: "100%", label: "Security" },
          ].map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-8">
                <stat.icon className="mx-auto h-10 w-10 text-primary" />
                <p className="mt-4 text-4xl font-bold text-foreground">{stat.value}</p>
                <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Values Section */}
      <section className="border-y border-border bg-card/50 py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-balance text-3xl font-bold text-foreground">Our Core Values</h2>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              The principles that guide everything we do at StellaOne Capitals.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Transparency",
                description:
                  "We believe in complete honesty and openness with our clients about fees, risks, and opportunities.",
              },
              {
                title: "Innovation",
                description:
                  "We constantly evolve our platform with cutting-edge technology to give you the competitive edge.",
              },
              {
                title: "Client Success",
                description:
                  "Your success is our success. We're committed to providing the tools and support you need to thrive.",
              },
            ].map((value, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-foreground">{value.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24">
        <Card className="border-primary bg-primary/5">
          <CardContent className="p-12 text-center">
            <h2 className="text-balance text-3xl font-bold text-foreground">Ready to Start Your Journey?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
              Join thousands of successful traders and investors worldwide.
            </p>
            <Button size="lg" className="mt-8" asChild>
              <Link href="/auth/signup">Get Started Today</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <Footer />
    </div>
  )
}
