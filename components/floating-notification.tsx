"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Notification {
  id: string
  name: string
  amount: string
  action: string
  avatar: string
}

const notifications: Notification[] = [
  { id: "1", name: "Michael Chen", amount: "$25,000", action: "just invested", avatar: "MC" },
  { id: "2", name: "Sarah Johnson", amount: "$50,000", action: "earned from trading", avatar: "SJ" },
  { id: "3", name: "David Martinez", amount: "$15,000", action: "withdrew", avatar: "DM" },
  { id: "4", name: "Emily Williams", amount: "$100,000", action: "just invested", avatar: "EW" },
  { id: "5", name: "James Brown", amount: "$35,000", action: "earned from signals", avatar: "JB" },
]

export function FloatingNotification() {
  const [visible, setVisible] = useState(false)
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null)

  useEffect(() => {
    const showNotification = () => {
      const randomNotification = notifications[Math.floor(Math.random() * notifications.length)]
      setCurrentNotification(randomNotification)
      setVisible(true)

      setTimeout(() => {
        setVisible(false)
      }, 5000)
    }

    const interval = setInterval(showNotification, 10000)
    showNotification()

    return () => clearInterval(interval)
  }, [])

  if (!visible || !currentNotification) return null

  return (
    <div className="fixed bottom-4 left-4 z-50 animate-slide-in-left">
      <div className="flex items-center gap-3 border border-border bg-card p-4 shadow-lg backdrop-blur-md">
        <div className="flex h-10 w-10 items-center justify-center bg-primary text-sm font-bold text-primary-foreground">
          {currentNotification.avatar}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">{currentNotification.name}</p>
          <p className="text-xs text-muted-foreground">
            {currentNotification.action} <span className="font-semibold text-accent">{currentNotification.amount}</span>
          </p>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setVisible(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
