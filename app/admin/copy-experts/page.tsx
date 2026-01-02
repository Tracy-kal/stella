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
import { Plus, Pencil, Trash2, Users } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface CopyExpert {
    id: string
    user_id: string
    display_name: string
    bio: string
    total_followers: number
    success_rate: number
    total_profit: number
    is_active: boolean
    created_at: string
}

export default function AdminCopyExpertsPage() {
    const [experts, setExperts] = useState<CopyExpert[]>([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingExpert, setEditingExpert] = useState<CopyExpert | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        display_name: "",
        bio: "",
        success_rate: "85",
        total_profit: "0",
    })

    useEffect(() => {
        fetchExperts()
    }, [])

    const fetchExperts = async () => {
        const supabase = createClient()
        const { data } = await supabase
            .from("copy_experts")
            .select("*")
            .order("created_at", { ascending: false })

        if (data) setExperts(data)
    }

    const handleOpenDialog = (expert?: CopyExpert) => {
        if (expert) {
            setEditingExpert(expert)
            setFormData({
                display_name: expert.display_name,
                bio: expert.bio || "",
                success_rate: expert.success_rate.toString(),
                total_profit: expert.total_profit.toString(),
            })
        } else {
            setEditingExpert(null)
            setFormData({
                display_name: "",
                bio: "",
                success_rate: "85",
                total_profit: "0",
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

            const expertData = {
                display_name: formData.display_name,
                bio: formData.bio,
                success_rate: parseFloat(formData.success_rate),
                total_profit: parseFloat(formData.total_profit),
            }

            if (editingExpert) {
                await supabase
                    .from("copy_experts")
                    .update(expertData)
                    .eq("id", editingExpert.id)
            } else {
                await supabase.from("copy_experts").insert({
                    ...expertData,
                    user_id: user.id,
                    total_followers: 0,
                    is_active: true,
                })
            }

            setIsDialogOpen(false)
            fetchExperts()
        } catch (error) {
            console.error("Error:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleToggleActive = async (expert: CopyExpert) => {
        const supabase = createClient()
        await supabase
            .from("copy_experts")
            .update({ is_active: !expert.is_active })
            .eq("id", expert.id)
        fetchExperts()
    }

    const handleDelete = async (expert: CopyExpert) => {
        if (!confirm("Are you sure you want to delete this expert?")) return
        const supabase = createClient()
        await supabase.from("copy_experts").delete().eq("id", expert.id)
        fetchExperts()
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Copy Trading Experts</h1>
                        <p className="mt-1 text-muted-foreground">Manage copy trading experts that users can follow</p>
                    </div>
                    <Button onClick={() => handleOpenDialog()}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Expert
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <Users className="h-8 w-8 text-primary" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Experts</p>
                                    <p className="text-2xl font-bold">{experts.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <Users className="h-8 w-8 text-green-500" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Active Experts</p>
                                    <p className="text-2xl font-bold">{experts.filter(e => e.is_active).length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <Users className="h-8 w-8 text-blue-500" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Followers</p>
                                    <p className="text-2xl font-bold">{experts.reduce((sum, e) => sum + e.total_followers, 0)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Experts Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Experts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Success Rate</TableHead>
                                    <TableHead>Total Profit</TableHead>
                                    <TableHead>Followers</TableHead>
                                    <TableHead>Active</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {experts.map((expert) => (
                                    <TableRow key={expert.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{expert.display_name}</p>
                                                <p className="text-sm text-muted-foreground truncate max-w-xs">{expert.bio}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-green-500">{expert.success_rate}%</TableCell>
                                        <TableCell>${expert.total_profit.toLocaleString()}</TableCell>
                                        <TableCell>{expert.total_followers}</TableCell>
                                        <TableCell>
                                            <Switch
                                                checked={expert.is_active}
                                                onCheckedChange={() => handleToggleActive(expert)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" onClick={() => handleOpenDialog(expert)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button size="sm" variant="destructive" onClick={() => handleDelete(expert)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {experts.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                            No experts found. Click "Add Expert" to create one.
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
                            <DialogTitle>{editingExpert ? "Edit Expert" : "Add New Expert"}</DialogTitle>
                            <DialogDescription>
                                {editingExpert ? "Update the expert's information." : "Create a new copy trading expert."}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Display Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., Michael Trading"
                                    value={formData.display_name}
                                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio/Description</Label>
                                <Textarea
                                    id="bio"
                                    placeholder="Expert trader with 10+ years experience..."
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
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
                                <div className="space-y-2">
                                    <Label htmlFor="profit">Total Profit ($)</Label>
                                    <Input
                                        id="profit"
                                        type="number"
                                        min="0"
                                        value={formData.total_profit}
                                        onChange={(e) => setFormData({ ...formData, total_profit: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSubmit} disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : editingExpert ? "Update Expert" : "Create Expert"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
