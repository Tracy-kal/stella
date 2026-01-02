"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    siteName: "StellaOne Capitals",
    maintenanceMode: false,
    minDeposit: 100,
    maxWithdrawal: 10000,
    referralBonus: 5,
    defaultTrades: 10,
  })

  const handleSave = () => {
    console.log("Settings saved:", settings)
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
          <p className="mt-1 text-muted-foreground">Configure global platform settings</p>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="trading">Trading</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="referral">Referral</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Site Name</Label>
                  <Input
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Maintenance Mode</p>
                    <p className="text-sm text-muted-foreground">Temporarily disable platform access</p>
                  </div>
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                  />
                </div>
                <Button onClick={handleSave}>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trading" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Trading Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Default Required Trades</Label>
                  <Input
                    type="number"
                    value={settings.defaultTrades}
                    onChange={(e) => setSettings({ ...settings, defaultTrades: Number.parseInt(e.target.value) })}
                  />
                  <p className="text-sm text-muted-foreground">Number of trades required before users can withdraw</p>
                </div>
                <Button onClick={handleSave}>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Minimum Deposit ($)</Label>
                    <Input
                      type="number"
                      value={settings.minDeposit}
                      onChange={(e) => setSettings({ ...settings, minDeposit: Number.parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Maximum Withdrawal ($)</Label>
                    <Input
                      type="number"
                      value={settings.maxWithdrawal}
                      onChange={(e) => setSettings({ ...settings, maxWithdrawal: Number.parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <Button onClick={handleSave}>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referral" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Referral Program</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Referral Bonus (%)</Label>
                  <Input
                    type="number"
                    value={settings.referralBonus}
                    onChange={(e) => setSettings({ ...settings, referralBonus: Number.parseInt(e.target.value) })}
                  />
                  <p className="text-sm text-muted-foreground">Percentage of referred user's first deposit</p>
                </div>
                <Button onClick={handleSave}>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
