"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Plus, Pencil, Trash2, Wallet, AlertCircle, Lock, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface CryptoAddress {
    id: string
    crypto_symbol: string
    crypto_name: string
    wallet_address: string
    network: string
    is_active: boolean
    created_at: string
}

export default function AdminCryptoAddressesPage() {
    const [addresses, setAddresses] = useState<CryptoAddress[]>([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isPinDialogOpen, setIsPinDialogOpen] = useState(false)
    const [editingAddress, setEditingAddress] = useState<CryptoAddress | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [pinVerified, setPinVerified] = useState(false)
    const [pinCode, setPinCode] = useState("")
    const [pinError, setPinError] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        crypto_symbol: "",
        crypto_name: "",
        wallet_address: "",
        network: "",
    })

    useEffect(() => {
        fetchAddresses()
    }, [])

    const fetchAddresses = async () => {
        const supabase = createClient()
        const { data } = await supabase
            .from("crypto_addresses")
            .select("*")
            .order("crypto_symbol", { ascending: true })

        if (data) setAddresses(data)
    }

    const verifyPin = async () => {
        setPinError(null)

        try {
            const response = await fetch("/api/admin/verify-pin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pin: pinCode }),
            })

            const data = await response.json()

            if (data.success) {
                setPinVerified(true)
                setIsPinDialogOpen(false)
                setPinCode("")
            } else {
                setPinError("Invalid PIN code")
            }
        } catch {
            setPinError("Failed to verify PIN")
        }
    }

    const handleOpenDialog = (address?: CryptoAddress) => {
        if (!pinVerified) {
            setIsPinDialogOpen(true)
            return
        }

        if (address) {
            setEditingAddress(address)
            setFormData({
                crypto_symbol: address.crypto_symbol,
                crypto_name: address.crypto_name,
                wallet_address: address.wallet_address,
                network: address.network,
            })
        } else {
            setEditingAddress(null)
            setFormData({
                crypto_symbol: "",
                crypto_name: "",
                wallet_address: "",
                network: "",
            })
        }
        setIsDialogOpen(true)
    }

    const handleSubmit = async () => {
        if (!pinVerified) return
        setIsSubmitting(true)

        try {
            const supabase = createClient()

            const addressData = {
                crypto_symbol: formData.crypto_symbol.toUpperCase(),
                crypto_name: formData.crypto_name,
                wallet_address: formData.wallet_address,
                network: formData.network,
            }

            if (editingAddress) {
                await supabase
                    .from("crypto_addresses")
                    .update({ ...addressData, updated_at: new Date().toISOString() })
                    .eq("id", editingAddress.id)
            } else {
                await supabase.from("crypto_addresses").insert({
                    ...addressData,
                    is_active: true,
                })
            }

            setIsDialogOpen(false)
            fetchAddresses()
        } catch (error) {
            console.error("Error:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleToggleActive = async (address: CryptoAddress) => {
        if (!pinVerified) {
            setIsPinDialogOpen(true)
            return
        }

        const supabase = createClient()
        await supabase
            .from("crypto_addresses")
            .update({ is_active: !address.is_active })
            .eq("id", address.id)
        fetchAddresses()
    }

    const handleDelete = async (address: CryptoAddress) => {
        if (!pinVerified) {
            setIsPinDialogOpen(true)
            return
        }

        if (!confirm("Are you sure you want to delete this address?")) return
        const supabase = createClient()
        await supabase.from("crypto_addresses").delete().eq("id", address.id)
        fetchAddresses()
    }

    const cryptoPresets = [
        { symbol: "BTC", name: "Bitcoin", network: "Bitcoin Network" },
        { symbol: "ETH", name: "Ethereum", network: "Ethereum (ERC20)" },
        { symbol: "USDT", name: "Tether", network: "Tron (TRC20)" },
        { symbol: "SOL", name: "Solana", network: "Solana Network" },
        { symbol: "BNB", name: "BNB", network: "BNB Smart Chain (BEP20)" },
        { symbol: "XRP", name: "Ripple", network: "Ripple Network" },
    ]

    const applyPreset = (preset: typeof cryptoPresets[0]) => {
        setFormData({
            ...formData,
            crypto_symbol: preset.symbol,
            crypto_name: preset.name,
            network: preset.network,
        })
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Deposit Addresses</h1>
                        <p className="mt-1 text-muted-foreground">Manage cryptocurrency deposit addresses</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {pinVerified && (
                            <span className="flex items-center gap-2 text-sm text-green-500">
                                <CheckCircle2 className="h-4 w-4" />
                                PIN Verified
                            </span>
                        )}
                        <Button onClick={() => handleOpenDialog()}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Address
                        </Button>
                    </div>
                </div>

                {/* Security Notice */}
                <Card className="border-yellow-500/50 bg-yellow-500/5">
                    <CardContent className="flex items-start gap-3 p-4">
                        <Lock className="h-5 w-5 flex-shrink-0 text-yellow-500 mt-0.5" />
                        <div>
                            <p className="font-medium text-foreground">PIN Protection Enabled</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Adding, editing, or deleting deposit addresses requires a 6-digit admin PIN code for security.
                                {!pinVerified && " Click any action button to verify your PIN."}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <Wallet className="h-8 w-8 text-primary" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Addresses</p>
                                    <p className="text-2xl font-bold">{addresses.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <CheckCircle2 className="h-8 w-8 text-green-500" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Active</p>
                                    <p className="text-2xl font-bold">{addresses.filter((a) => a.is_active).length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <AlertCircle className="h-8 w-8 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Inactive</p>
                                    <p className="text-2xl font-bold">{addresses.filter((a) => !a.is_active).length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Addresses Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Deposit Addresses</CardTitle>
                        <CardDescription>
                            Users will see these addresses when making deposits. Ensure addresses are correct.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Crypto</TableHead>
                                    <TableHead>Network</TableHead>
                                    <TableHead>Wallet Address</TableHead>
                                    <TableHead>Active</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {addresses.map((address) => (
                                    <TableRow key={address.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{address.crypto_symbol}</p>
                                                <p className="text-sm text-muted-foreground">{address.crypto_name}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>{address.network}</TableCell>
                                        <TableCell>
                                            <code className="text-xs bg-muted px-2 py-1 rounded break-all">
                                                {address.wallet_address}
                                            </code>
                                        </TableCell>
                                        <TableCell>
                                            <Switch
                                                checked={address.is_active}
                                                onCheckedChange={() => handleToggleActive(address)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" onClick={() => handleOpenDialog(address)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button size="sm" variant="destructive" onClick={() => handleDelete(address)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {addresses.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                            No deposit addresses configured. Users cannot make deposits until you add addresses.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* PIN Verification Dialog */}
                <Dialog open={isPinDialogOpen} onOpenChange={setIsPinDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Lock className="h-5 w-5" />
                                Admin PIN Required
                            </DialogTitle>
                            <DialogDescription>
                                Enter your 6-digit admin PIN to manage deposit addresses.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            {pinError && (
                                <div className="flex items-center gap-2 text-destructive text-sm">
                                    <AlertCircle className="h-4 w-4" />
                                    {pinError}
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="pin">PIN Code</Label>
                                <Input
                                    id="pin"
                                    type="password"
                                    maxLength={6}
                                    placeholder="Enter 6-digit PIN"
                                    value={pinCode}
                                    onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ""))}
                                    className="text-center text-2xl tracking-widest"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsPinDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={verifyPin} disabled={pinCode.length !== 6}>
                                Verify PIN
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Add/Edit Address Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingAddress ? "Edit Address" : "Add Deposit Address"}</DialogTitle>
                            <DialogDescription>
                                {editingAddress
                                    ? "Update the cryptocurrency deposit address."
                                    : "Add a new cryptocurrency deposit address. Double-check the address before saving."}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            {!editingAddress && (
                                <div className="space-y-2">
                                    <Label>Quick Select</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {cryptoPresets.map((preset) => (
                                            <Button
                                                key={preset.symbol}
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => applyPreset(preset)}
                                            >
                                                {preset.symbol}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="symbol">Symbol</Label>
                                    <Input
                                        id="symbol"
                                        placeholder="BTC"
                                        value={formData.crypto_symbol}
                                        onChange={(e) => setFormData({ ...formData, crypto_symbol: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="Bitcoin"
                                        value={formData.crypto_name}
                                        onChange={(e) => setFormData({ ...formData, crypto_name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="network">Network</Label>
                                <Input
                                    id="network"
                                    placeholder="Bitcoin Network"
                                    value={formData.network}
                                    onChange={(e) => setFormData({ ...formData, network: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Wallet Address</Label>
                                <Input
                                    id="address"
                                    placeholder="Enter wallet address"
                                    value={formData.wallet_address}
                                    onChange={(e) => setFormData({ ...formData, wallet_address: e.target.value })}
                                    className="font-mono"
                                />
                                <p className="text-xs text-destructive">
                                    ⚠️ Double-check the address! Incorrect addresses cannot recover funds.
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSubmit} disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : editingAddress ? "Update Address" : "Add Address"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
