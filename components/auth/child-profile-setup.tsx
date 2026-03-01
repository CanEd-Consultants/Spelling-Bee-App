"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { AgeCategory } from "@/lib/types"

function getCategory(age: number): AgeCategory {
  if (age <= 8) return "primary"
  if (age <= 11) return "junior"
  return "intermediate"
}

function getCategoryLabel(category: AgeCategory): string {
  switch (category) {
    case "primary":
      return "Primary (Ages 6-8)"
    case "junior":
      return "Junior (Ages 9-11)"
    case "intermediate":
      return "Intermediate (Ages 12-14)"
  }
}

export function ChildProfileSetup() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [age, setAge] = useState(7)
  const category = getCategory(age)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string

    if (!name) {
      setError("Please enter your child's name.")
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError("You must be logged in.")
        setIsLoading(false)
        return
      }

      const { data: childProfile, error: insertError } = await supabase
        .from("child_profiles")
        .insert({
          parent_id: user.id,
          name,
          age,
          category,
        })
        .select()
        .single()

      if (insertError) {
        setError(insertError.message)
        setIsLoading(false)
        return
      }

      // Create daily_streaks record for the child
      await supabase.from("daily_streaks").insert({
        child_id: childProfile.id,
      })

      router.push("/")
      router.refresh()
    } catch {
      setError("Something went wrong. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="rounded-xl border-2 border-gray-100 bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-display font-bold text-sboc-dark">
        Add Your Child
      </h2>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-sboc-red">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Child&apos;s Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Enter your child's name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <div className="flex items-center gap-4">
            <input
              id="age"
              name="age"
              type="range"
              min={6}
              max={14}
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-sboc-yellow"
            />
            <span className="min-w-[3ch] text-center text-lg font-bold text-sboc-dark">
              {age}
            </span>
          </div>
        </div>

        <div className="rounded-lg bg-yellow-50 border border-sboc-yellow/30 p-4">
          <p className="text-sm font-semibold text-sboc-dark">
            Category: {getCategoryLabel(category)}
          </p>
          {category !== "primary" && (
            <p className="mt-1 text-xs text-sboc-neutral">
              Note: Only Primary category words are available in this version.
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
          {isLoading ? "Setting up..." : "Start Practicing"}
        </Button>
      </form>
    </div>
  )
}
