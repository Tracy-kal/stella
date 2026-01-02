import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin, Mail } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center bg-primary">
                <span className="font-mono text-lg font-bold text-primary-foreground">S1</span>
              </div>
              <span className="text-lg font-bold">StellaOne Capitals</span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Your trusted partner in global investment and trading. Access institutional-grade tools and grow your
              wealth with confidence.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Quick Links</h3>
            <ul className="space-y-2">
              {["About Us", "Services", "Investment Plans", "Copy Trading", "Signal Providers"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Resources</h3>
            <ul className="space-y-2">
              {["FAQ", "Blog", "Contact", "Support", "Terms of Service", "Privacy Policy"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Contact Us</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>support@stellaonecapitals.com</span>
              </li>
              <li className="leading-relaxed">
                123 Financial District
                <br />
                New York, NY 10004
                <br />
                United States
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} StellaOne Capitals. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
