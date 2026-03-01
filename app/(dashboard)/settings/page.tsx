"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { logout } from "@/app/(auth)/actions"

export default function SettingsPage() {
  const [childName, setChildName] = useState("")
  const [childAge, setChildAge] = useState(7)
  const [dailyGoal, setDailyGoal] = useState(10)
  const [parentEmail, setParentEmail] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    async function loadSettings() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      setParentEmail(user.email ?? "")

      const { data: children } = await supabase
        .from("child_profiles")
        .select("*")
        .eq("parent_id", user.id)
        .limit(1)

      if (children && children.length > 0) {
        setChildName(children[0].name)
        setChildAge(children[0].age)
        setDailyGoal(children[0].daily_goal)
      }
      setIsLoading(false)
    }

    loadSettings()
  }, [])

  async function handleSave() {
    setIsSaving(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data: children } = await supabase
        .from("child_profiles")
        .select("id")
        .eq("parent_id", user.id)
        .limit(1)

      if (children && children.length > 0) {
        const category =
          childAge <= 8
            ? "primary"
            : childAge <= 11
              ? "junior"
              : "intermediate"

        await supabase
          .from("child_profiles")
          .update({
            name: childName,
            age: childAge,
            category,
            daily_goal: dailyGoal,
          })
          .eq("id", children[0].id)

        setMessage("Settings saved successfully!")
      }
    } catch {
      setMessage("Failed to save settings. Please try again.")
    }

    setIsSaving(false)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-sboc-yellow" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-sboc-dark">
          Settings
        </h1>
        <p className="mt-1 text-sboc-neutral">Manage your account and child profile</p>
      </div>

      {message && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-sboc-green">
          {message}
        </div>
      )}

      {/* Parent info */}
      <div className="rounded-xl border-2 border-gray-100 bg-white p-6 space-y-4">
        <h2 className="font-display text-lg font-semibold text-sboc-dark">
          Parent Account
        </h2>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" value={parentEmail} disabled />
        </div>
      </div>

      {/* Child profile */}
      <div className="rounded-xl border-2 border-gray-100 bg-white p-6 space-y-4">
        <h2 className="font-display text-lg font-semibold text-sboc-dark">
          Child Profile
        </h2>
        <div className="space-y-2">
          <Label htmlFor="childName">Name</Label>
          <Input
            id="childName"
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="childAge">Age</Label>
          <div className="flex items-center gap-4">
            <input
              id="childAge"
              type="range"
              min={6}
              max={14}
              value={childAge}
              onChange={(e) => setChildAge(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-sboc-yellow"
            />
            <span className="min-w-[3ch] text-center text-lg font-bold">
              {childAge}
            </span>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="dailyGoal">Daily Goal (words per day)</Label>
          <Input
            id="dailyGoal"
            type="number"
            min={5}
            max={50}
            value={dailyGoal}
            onChange={(e) => setDailyGoal(Number(e.target.value))}
          />
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Sign out */}
      <div className="rounded-xl border-2 border-gray-100 bg-white p-6">
        <h2 className="font-display text-lg font-semibold text-sboc-dark">
          Account
        </h2>
        <p className="mt-1 text-sm text-sboc-neutral">
          Sign out of your account on this device.
        </p>
        <form action={logout} className="mt-4">
          <Button type="submit" variant="outline">
            Sign Out
          </Button>
        </form>
      </div>
    </div>
  )
}
