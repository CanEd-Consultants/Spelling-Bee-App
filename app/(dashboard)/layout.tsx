import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/layout/sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch child profiles
  const { data: childProfiles } = await supabase
    .from("child_profiles")
    .select("*")
    .eq("parent_id", user.id)

  // If no child profiles, redirect to onboarding
  if (!childProfiles || childProfiles.length === 0) {
    redirect("/onboarding")
  }

  // Use the first child profile for now (MVP: single child)
  const activeChild = childProfiles[0]

  // Fetch streak
  const { data: streak } = await supabase
    .from("daily_streaks")
    .select("*")
    .eq("child_id", activeChild.id)
    .single()

  return (
    <div className="min-h-screen bg-sboc-white">
      <Sidebar
        childName={activeChild.name}
        category={activeChild.category}
        currentStreak={streak?.current_streak ?? 0}
      />
      <main className="lg:pl-64">
        <div className="mx-auto max-w-5xl p-6 pt-16 lg:pt-6">{children}</div>
      </main>
    </div>
  )
}
