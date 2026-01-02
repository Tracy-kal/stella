"use client"

import { use, useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useRouter } from "next/navigation"

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data } = await supabase.from("users").select("*").eq("id", resolvedParams.id).single()
      setUserData(data)
      setLoading(false)
    }
    fetchUser()
  }, [resolvedParams.id])

  const handleUpdate = async () => {
    const supabase = createClient()
    await supabase.from("users").update(userData).eq("id", resolvedParams.id)
    alert("User updated successfully")
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{userData?.full_name}</h1>
            <p className="mt-1 text-muted-foreground">{userData?.email}</p>
          </div>
          <Button onClick={() => router.back()} variant="outline">
            Back
          </Button>
        </div>

        <Tabs defaultValue="details" className="w-full">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="balances">Balances</TabsTrigger>
            <TabsTrigger value="trading">Trading</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      value={userData?.full_name || ""}
                      onChange={(e) => setUserData({ ...userData, full_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={userData?.email || ""} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input
                      value={userData?.phone_number || ""}
                      onChange={(e) => setUserData({ ...userData, phone_number: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input value={userData?.country || ""} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Status</Label>
                    <Select
                      value={userData?.account_status}
                      onValueChange={(value) => setUserData({ ...userData, account_status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="blocked">Blocked</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Current Plan</Label>
                    <Select
                      value={userData?.current_plan}
                      onValueChange={(value) => setUserData({ ...userData, current_plan: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="silver">Silver</SelectItem>
                        <SelectItem value="gold">Gold</SelectItem>
                        <SelectItem value="platinum">Platinum</SelectItem>
                        <SelectItem value="diamond">Diamond</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleUpdate}>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="balances" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Balance Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Deposit Balance</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={userData?.balance_deposit || 0}
                      onChange={(e) => setUserData({ ...userData, balance_deposit: Number.parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Profit Balance</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={userData?.balance_profit || 0}
                      onChange={(e) => setUserData({ ...userData, balance_profit: Number.parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bonus Balance</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={userData?.balance_bonus || 0}
                      onChange={(e) => setUserData({ ...userData, balance_bonus: Number.parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground">Total Balance</p>
                  <p className="text-3xl font-bold text-foreground">
                    $
                    {(
                      (userData?.balance_deposit || 0) +
                      (userData?.balance_profit || 0) +
                      (userData?.balance_bonus || 0)
                    ).toFixed(2)}
                  </p>
                </div>
                <Button onClick={handleUpdate}>Update Balances</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trading" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Trading Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Required Trades</Label>
                    <Input
                      type="number"
                      value={userData?.required_trades || 0}
                      onChange={(e) => setUserData({ ...userData, required_trades: Number.parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Completed Trades</Label>
                    <Input
                      type="number"
                      value={userData?.completed_trades || 0}
                      onChange={(e) => setUserData({ ...userData, completed_trades: Number.parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Withdrawal Code</Label>
                    <Input
                      value={userData?.withdrawal_code || ""}
                      onChange={(e) => setUserData({ ...userData, withdrawal_code: e.target.value })}
                      placeholder="Optional withdrawal verification code"
                    />
                  </div>
                </div>
                <Button onClick={handleUpdate}>Save Trading Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Permissions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Can Trade</p>
                    <p className="text-sm text-muted-foreground">Allow user to execute trades</p>
                  </div>
                  <Switch
                    checked={userData?.can_trade}
                    onCheckedChange={(checked) => setUserData({ ...userData, can_trade: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Can Withdraw</p>
                    <p className="text-sm text-muted-foreground">Allow user to withdraw funds</p>
                  </div>
                  <Switch
                    checked={userData?.can_withdraw}
                    onCheckedChange={(checked) => setUserData({ ...userData, can_withdraw: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Signal Provider</p>
                    <p className="text-sm text-muted-foreground">User can provide trading signals</p>
                  </div>
                  <Switch
                    checked={userData?.is_signal_provider}
                    onCheckedChange={(checked) => setUserData({ ...userData, is_signal_provider: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Copy Expert</p>
                    <p className="text-sm text-muted-foreground">User available for copy trading</p>
                  </div>
                  <Switch
                    checked={userData?.is_copy_expert}
                    onCheckedChange={(checked) => setUserData({ ...userData, is_copy_expert: checked })}
                  />
                </div>
                <Button onClick={handleUpdate}>Update Permissions</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
