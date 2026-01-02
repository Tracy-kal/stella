import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
          <CardDescription>We've sent you a verification link to confirm your email address</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            Click the link in your email to verify your account and start trading.
          </p>
          <Button asChild className="w-full bg-transparent" variant="outline">
            <Link href="/auth/login">Back to Sign In</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
