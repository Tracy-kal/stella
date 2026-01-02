import { createClient } from "@/lib/supabase/server"

export async function createNotification(userId: string, title: string, message: string, type = "info", link?: string) {
  const supabase = await createClient()
  await supabase.from("notifications").insert({
    user_id: userId,
    title,
    message,
    type,
    link,
  })
}

export async function sendBulkNotification(title: string, message: string, type = "info") {
  const supabase = await createClient()
  const { data: users } = await supabase.from("users").select("id")
  if (!users) return

  const notifications = users.map((user) => ({
    user_id: user.id,
    title,
    message,
    type,
  }))

  await supabase.from("notifications").insert(notifications)
}
