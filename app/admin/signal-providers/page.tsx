"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Plus, Pencil, Trash2, Radio } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface SignalProvider {
    id: string
    user_id: string
    display_name: string
    description: string
    price: number
    success_rate: number
    total_signals: number
    is_active: boolean
    created_at: string
}

export default function AdminSignalProvidersPage() {
    const [providers, setProviders] = useState<SignalProvider[]>([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingProvider, setEditingProvider] = useState<SignalProvider | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        display_name: "",
        description: "",
        price: "99",
        success_rate: "85",
    })

    useEffect(() => {
        fetchProviders()
    }, [])

    const fetchProviders = async () => {
        const supabase = createClient()
        const { data } = await supabase
            .from("signal_providers")
            .select("*")
            .order("created_at", { ascending: false })

        if (data) setProviders(data)
    }

    const handleOpenDialog = (provider?: SignalProvider) => {
        if (provider) {
            setEditingProvider(provider)
            setFormData({
                display_name: provider.display_name,
                description: provider.description || "",
                price: provider.price.toString(),
                success_rate: provider.success_rate.toString(),
            })
        } else {
            setEditingProvider(null)
            setFormData({
                display_name: "",
                description: "",
                price: "99",
                success_rate: "85",
            })
        }
        setIsDialogOpen(true)
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Not authenticated")

            const providerData = {
                display_name: formData.display_name,
                description: formData.description,
                price: parseFloat(formData.price),
                success_rate: parseFloat(formData.success_rate),
            }

            if (editingProvider) {
                await supabase
                    .from("signal_providers")
                    .update(providerData)
                    .eq("id", editingProvider.id)
            } else {
                await supabase.from("signal_providers").insert({
                    ...providerData,
                    user_id: user.id,
                    total_signals: 0,
                    is_active: true,
                })
            }

            setIsDialogOpen(false)
            fetchProviders()
        } catch (error) {
            console.error("Error:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleToggleActive = async (provider: SignalProvider) => {
        const supabase = createClient()
        await supabase
            .from("signal_providers")
            .update({ is_active: !provider.is_active })
            .eq("id", provider.id)
        fetchProviders()
    }

    const handleDelete = async (provider: SignalProvider) => {
        if (!confirm("Are you sure you want to delete this provider?")) return
        const supabase = createClient()
        await supabase.from("signal_providers").delete().eq("id", provider.id)
        fetchProviders()
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Signal Providers</h1>
                        <p className="mt-1 text-muted-foreground">Manage signal providers that users can subscribe to</p>
                    </div>
                    <Button onClick={() => handleOpenDialog()}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Provider
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <Radio className="h-8 w-8 text-primary" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Providers</p>
                                    <p className="text-2xl font-bold">{providers.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <Radio className="h-8 w-8 text-green-500" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Active Providers</p>
                                    <p className="text-2xl font-bold">{providers.filter(p => p.is_active).length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <Radio className="h-8 w-8 text-blue-500" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Signals</p>
                                    <p className="text-2xl font-bold">{providers.reduce((sum, p) => sum + p.total_signals, 0)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Providers Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Providers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Success Rate</TableHead>
                                    <TableHead>Signals</TableHead>
                                    <TableHead>Active</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {providers.map((provider) => (
                                    <TableRow key={provider.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{provider.display_name}</p>
                                                <p className="text-sm text-muted-foreground truncate max-w-xs">{provider.description}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>${provider.price}/mo</TableCell>
                                        <TableCell className="text-green-500">{provider.success_rate}%</TableCell>
                                        <TableCell>{provider.total_signals}</TableCell>
                                        <TableCell>
                                            <Switch
                                                checked={provider.is_active}
                                                onCheckedChange={() => handleToggleActive(provider)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" onClick={() => handleOpenDialog(provider)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button size="sm" variant="destructive" onClick={() => handleDelete(provider)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {providers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                            No providers found. Click "Add Provider" to create one.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Add/Edit Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingProvider ? "Edit Provider" : "Add New Provider"}</DialogTitle>
                            <DialogDescription>
                                {editingProvider ? "Update the provider's information." : "Create a new signal provider."}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Display Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., Pro Signals"
                                    value={formData.display_name}
                                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Premium trading signals with high accuracy..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="price">Monthly Price ($)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        min="0"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="rate">Success Rate (%)</Label>
                                    <Input
                                        id="rate"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={formData.success_rate}
                                        onChange={(e) => setFormData({ ...formData, success_rate: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSubmit} disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : editingProvider ? "Update Provider" : "Create Provider"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
