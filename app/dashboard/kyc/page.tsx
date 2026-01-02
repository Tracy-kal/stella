"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle2, Clock, Upload, Shield, FileText, XCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface UserData {
    kyc_status: string
    kyc_document_type: string
    kyc_document_url: string
    kyc_selfie_url: string
    kyc_submitted_at: string
    tax_code: string
    mfi_code: string
}

export default function KYCPage() {
    const [userData, setUserData] = useState<UserData | null>(null)
    const [documentType, setDocumentType] = useState("passport")
    const [documentFile, setDocumentFile] = useState<File | null>(null)
    const [selfieFile, setSelfieFile] = useState<File | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        fetchUserData()
    }, [])

    const fetchUserData = async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
            .from("users")
            .select("kyc_status, kyc_document_type, kyc_document_url, kyc_selfie_url, kyc_submitted_at, tax_code, mfi_code")
            .eq("id", user.id)
            .single()

        if (data) setUserData(data)
    }

    const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            if (file.size > 10 * 1024 * 1024) {
                setError("File size must be less than 10MB")
                return
            }
            setDocumentFile(file)
            setError(null)
        }
    }

    const handleSelfieChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            if (file.size > 10 * 1024 * 1024) {
                setError("File size must be less than 10MB")
                return
            }
            setSelfieFile(file)
            setError(null)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)
        setSuccess(false)

        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Please login to continue")

            if (!documentFile || !selfieFile) {
                throw new Error("Please upload both documents")
            }

            let documentUrl = null
            let selfieUrl = null

            // Upload document
            const docExt = documentFile.name.split('.').pop()
            const docName = `${user.id}/document_${Date.now()}.${docExt}`

            const { error: docError } = await supabase.storage
                .from("kyc-documents")
                .upload(docName, documentFile)

            if (docError) {
                console.error("Document upload error:", docError)
                throw new Error("Failed to upload document. Please try again.")
            }

            const { data: docData } = supabase.storage.from("kyc-documents").getPublicUrl(docName)
            documentUrl = docData.publicUrl

            // Upload selfie
            const selfieExt = selfieFile.name.split('.').pop()
            const selfieName = `${user.id}/selfie_${Date.now()}.${selfieExt}`

            const { error: selfieError } = await supabase.storage
                .from("kyc-documents")
                .upload(selfieName, selfieFile)

            if (selfieError) {
                console.error("Selfie upload error:", selfieError)
                throw new Error("Failed to upload selfie. Please try again.")
            }

            const { data: selfieData } = supabase.storage.from("kyc-documents").getPublicUrl(selfieName)
            selfieUrl = selfieData.publicUrl

            // Update user KYC status
            const { error: updateError } = await supabase
                .from("users")
                .update({
                    kyc_status: "pending",
                    kyc_document_type: documentType,
                    kyc_document_url: documentUrl,
                    kyc_selfie_url: selfieUrl,
                    kyc_submitted_at: new Date().toISOString(),
                })
                .eq("id", user.id)

            if (updateError) throw updateError

            setSuccess(true)
            fetchUserData()

        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "An error occurred")
        } finally {
            setIsSubmitting(false)
        }
    }

    const getStatusDisplay = () => {
        switch (userData?.kyc_status) {
            case "approved":
                return (
                    <Card className="border-green-500/50 bg-green-500/5">
                        <CardContent className="flex items-center gap-3 p-4">
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                            <div>
                                <p className="font-medium text-foreground">Verification Approved</p>
                                <p className="text-sm text-muted-foreground">Your identity has been verified successfully.</p>
                            </div>
                        </CardContent>
                    </Card>
                )
            case "pending":
                return (
                    <Card className="border-yellow-500/50 bg-yellow-500/5">
                        <CardContent className="flex items-center gap-3 p-4">
                            <Clock className="h-6 w-6 text-yellow-500" />
                            <div>
                                <p className="font-medium text-foreground">Verification Pending</p>
                                <p className="text-sm text-muted-foreground">Your documents are being reviewed. This usually takes 24-48 hours.</p>
                            </div>
                        </CardContent>
                    </Card>
                )
            case "rejected":
                return (
                    <Card className="border-destructive/50 bg-destructive/5">
                        <CardContent className="flex items-center gap-3 p-4">
                            <XCircle className="h-6 w-6 text-destructive" />
                            <div>
                                <p className="font-medium text-foreground">Verification Rejected</p>
                                <p className="text-sm text-muted-foreground">Please resubmit your documents with clearer images.</p>
                            </div>
                        </CardContent>
                    </Card>
                )
            default:
                return null
        }
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="mx-auto max-w-3xl space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Identity Verification (KYC)</h1>
                    <p className="mt-1 text-muted-foreground">Verify your identity to unlock full account features</p>
                </div>

                {getStatusDisplay()}

                {success && (
                    <Card className="border-green-500/50 bg-green-500/5">
                        <CardContent className="flex items-center gap-3 p-4">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            <p className="text-foreground">Documents submitted successfully! Review in progress.</p>
                        </CardContent>
                    </Card>
                )}

                {error && (
                    <Card className="border-destructive/50 bg-destructive/5">
                        <CardContent className="flex items-center gap-3 p-4">
                            <AlertCircle className="h-5 w-5 text-destructive" />
                            <p className="text-foreground">{error}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Tax/MFI Code Section */}
                {userData?.tax_code && (
                    <Card className="border-blue-500/50 bg-blue-500/5">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
                                <div>
                                    <p className="font-medium text-foreground">Tax/MFI Code Required for Withdrawal</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        A tax clearance or MFI code has been assigned to your account. You will need to enter this code when making withdrawals.
                                    </p>
                                    <p className="text-sm font-mono mt-2 text-blue-500">Code: {userData.tax_code}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* KYC Form - Only show if not approved or pending */}
                {(!userData?.kyc_status || userData.kyc_status === 'rejected') && (
                    <form onSubmit={handleSubmit}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-primary" />
                                    Verify Your Identity
                                </CardTitle>
                                <CardDescription>
                                    Upload your government-issued ID and a selfie to complete verification
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="docType">Document Type</Label>
                                    <Select value={documentType} onValueChange={setDocumentType}>
                                        <SelectTrigger id="docType">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="passport">Passport</SelectItem>
                                            <SelectItem value="drivers_license">Driver's License</SelectItem>
                                            <SelectItem value="national_id">National ID Card</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="document">Upload Document</Label>
                                    <label
                                        htmlFor="document"
                                        className="flex cursor-pointer flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors"
                                    >
                                        <Upload className="h-8 w-8 text-muted-foreground" />
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            {documentFile ? documentFile.name : "Click to upload your ID document"}
                                        </p>
                                        <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                                        <input
                                            id="document"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleDocumentChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="selfie">Upload Selfie with Document</Label>
                                    <label
                                        htmlFor="selfie"
                                        className="flex cursor-pointer flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors"
                                    >
                                        <Upload className="h-8 w-8 text-muted-foreground" />
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            {selfieFile ? selfieFile.name : "Click to upload a selfie holding your document"}
                                        </p>
                                        <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                                        <input
                                            id="selfie"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleSelfieChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>

                                <div className="bg-muted/50 p-4 rounded-lg">
                                    <p className="text-sm font-medium text-foreground">Requirements:</p>
                                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                                        <li>• Document must be valid and not expired</li>
                                        <li>• All corners of the document must be visible</li>
                                        <li>• Selfie must clearly show your face and the document</li>
                                        <li>• Images must be clear and not blurry</li>
                                    </ul>
                                </div>

                                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                                    {isSubmitting ? "Uploading..." : "Submit for Verification"}
                                </Button>
                            </CardContent>
                        </Card>
                    </form>
                )}

                {/* Verification Benefits */}
                <Card>
                    <CardHeader>
                        <CardTitle>Why Verify?</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                                <div>
                                    <p className="font-medium text-foreground">Unlock Withdrawals</p>
                                    <p className="text-sm text-muted-foreground">Verified accounts can withdraw funds to their preferred wallet.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                                <div>
                                    <p className="font-medium text-foreground">Higher Limits</p>
                                    <p className="text-sm text-muted-foreground">Access higher deposit and withdrawal limits.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                                <div>
                                    <p className="font-medium text-foreground">Account Security</p>
                                    <p className="text-sm text-muted-foreground">Protect your account and funds with identity verification.</p>
                                </div>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
