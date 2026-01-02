import { Navbar } from "@/components/navbar"
import { Ticker } from "@/components/ticker"
import { Footer } from "@/components/footer"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"

export default function FAQPage() {
  const faqs = [
    {
      question: "How do I get started with StellaOne Capitals?",
      answer:
        "Getting started is simple. Click the 'Get Started' button, fill out the registration form with your details, verify your email, and complete your profile. Once approved, you can make your first deposit and start trading or investing immediately.",
    },
    {
      question: "What investment plans do you offer?",
      answer:
        "We offer five investment tiers: Basic (5% ROI, 7 days), Silver (10% ROI, 14 days), Gold (15% ROI, 21 days), Platinum (20% ROI, 30 days), and Diamond (30% ROI, 45 days). Each plan has different minimum investment amounts and features tailored to different investor profiles.",
    },
    {
      question: "How does copy trading work?",
      answer:
        "Copy trading allows you to automatically replicate the trades of successful expert traders. Simply browse our list of verified experts, review their performance history, and select the ones you want to follow. Your account will automatically execute the same trades in proportion to your allocated funds.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept multiple cryptocurrencies including Bitcoin (BTC), Ethereum (ETH), Tether (USDT), and Solana (SOL). All deposits are processed securely on their respective blockchain networks.",
    },
    {
      question: "How long do withdrawals take?",
      answer:
        "Withdrawal processing times vary based on your account status and trading activity. Typically, withdrawals are processed within 24-48 hours after approval. You must meet the minimum trading requirements before requesting a withdrawal.",
    },
    {
      question: "What are the trading requirements for withdrawals?",
      answer:
        "To ensure active participation in the platform, users must complete a minimum number of trades (typically 10) before they can withdraw funds. This requirement helps maintain platform integrity and encourages proper engagement with our trading tools.",
    },
    {
      question: "Is my money safe with StellaOne Capitals?",
      answer:
        "Yes, security is our top priority. We use bank-level encryption, cold storage for crypto assets, and implement strict security protocols. All user data is protected with advanced cybersecurity measures, and we comply with international financial regulations.",
    },
    {
      question: "Can I upgrade my investment plan?",
      answer:
        "Yes, you can upgrade your investment plan at any time through your dashboard. Contact your account manager or our support team for assistance with plan upgrades and to understand the benefits of higher-tier plans.",
    },
    {
      question: "What is the referral program?",
      answer:
        "Our referral program rewards you for inviting friends and family to join StellaOne Capitals. You earn a percentage of their deposits and trading activity. Each user receives a unique referral code that can be shared to track referrals.",
    },
    {
      question: "Do you offer customer support?",
      answer:
        "Yes, we provide 24/7 customer support through multiple channels including live chat, email, and phone. Premium account holders also receive dedicated account managers for personalized assistance.",
    },
  ]

  return (
    <div className="min-h-screen">
      <Navbar />
      <Ticker />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-balance text-5xl font-bold leading-tight text-foreground">Frequently Asked Questions</h1>
          <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground">
            Find answers to common questions about our platform, services, and how to get started.
          </p>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="container mx-auto px-4 pb-24">
        <Card className="mx-auto max-w-4xl">
          <CardContent className="p-6 md:p-8">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-base font-semibold text-foreground">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </section>

      <Footer />
    </div>
  )
}
