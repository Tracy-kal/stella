import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, FileText } from "lucide-react"

export default async function AdminKYCPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/admin/login")

  const { data: kycDocuments } = await supabase
    .from("kyc_documents")
    .select("*, users(full_name, email)")
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">KYC Verification</h1>
          <p className="mt-1 text-muted-foreground">Review and verify user identity documents</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>KYC Documents ({kycDocuments?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">User</th>
                    <th className="pb-3 font-medium">Document Type</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Submitted</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {kycDocuments?.map((doc) => (
                    <tr key={doc.id} className="border-b border-border text-sm">
                      <td className="py-4">
                        <p className="font-medium text-foreground">{doc.users?.full_name}</p>
                        <p className="text-xs text-muted-foreground">{doc.users?.email}</p>
                      </td>
                      <td className="py-4 text-muted-foreground">{doc.document_type}</td>
                      <td className="py-4">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium ${
                            doc.status === "approved"
                              ? "bg-accent/10 text-accent"
                              : doc.status === "rejected"
                                ? "bg-destructive/10 text-destructive"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {doc.status}
                        </span>
                      </td>
                      <td className="py-4 text-muted-foreground">{new Date(doc.created_at).toLocaleDateString()}</td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" className="h-8 px-2">
                            <FileText className="h-4 w-4" />
                          </Button>
                          {doc.status === "pending" && (
                            <>
                              <Button size="sm" variant="ghost" className="h-8 px-2 text-accent">
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-8 px-2 text-destructive">
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
