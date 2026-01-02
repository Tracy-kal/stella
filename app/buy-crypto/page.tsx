"use client"

import { useEffect } from "react"

export default function BuyCryptoPage() {
  useEffect(() => {
    window.location.href = "https://www.blockchain.com/buy"
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin border-4 border-primary border-t-transparent"></div>
        <p className="mt-4 text-muted-foreground">Redirecting to blockchain.com...</p>
      </div>
    </div>
  )
}
