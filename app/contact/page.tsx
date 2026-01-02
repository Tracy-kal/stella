"use client"

import type React from "react"

import { Navbar } from "@/components/navbar"
import { Ticker } from "@/components/ticker"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, MapPin, Phone } from "lucide-react"
import { useState } from "react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Contact form submitted:", formData)
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <Ticker />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-balance text-5xl font-bold leading-tight text-foreground">Get in Touch</h1>
          <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground">
            Have questions? We're here to help. Reach out to our team and we'll get back to you as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="container mx-auto px-4 pb-24">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Contact Form */}
          <Card>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="How can we help?"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us more about your inquiry..."
                    rows={6}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <Mail className="h-10 w-10 text-primary" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">Email Us</h3>
                <p className="mt-2 text-sm text-muted-foreground">Our team is here to help.</p>
                <p className="mt-2 font-medium text-foreground">support@stellaonecapitals.com</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <Phone className="h-10 w-10 text-primary" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">Call Us</h3>
                <p className="mt-2 text-sm text-muted-foreground">Mon-Fri from 8am to 6pm EST</p>
                <p className="mt-2 font-medium text-foreground">+1 (555) 123-4567</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <MapPin className="h-10 w-10 text-primary" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">Visit Us</h3>
                <p className="mt-2 text-sm text-muted-foreground">Come say hello at our office.</p>
                <p className="mt-2 font-medium text-foreground">
                  123 Financial District
                  <br />
                  New York, NY 10004
                  <br />
                  United States
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
