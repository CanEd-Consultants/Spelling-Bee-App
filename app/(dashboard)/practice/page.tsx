"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { GraduationCap } from "lucide-react"
import type { WordPool, SessionType } from "@/lib/types"
import { cn } from "@/lib/utils/cn"

const wordCountOptions = [
  { value: 10, label: "10 words" },
  { value: 25, label: "25 words" },
  { value: 50, label: "50 words" },
  { value: 0, label: "All words" },
]

const wordPoolOptions: { value: WordPool; label: string; description: string }[] = [
  { value: "all", label: "All Words", description: "Practice from the full word list" },
  { value: "needs_review", label: "Needs Review", description: "Words you got wrong before" },
  { value: "not_started", label: "Not Started", description: "Words you haven't practiced yet" },
  { value: "random_mix", label: "Random Mix", description: "60% new, 30% review, 10% learned" },
]

export default function PracticeSetupPage() {
  const router = useRouter()
  const [wordCount, setWordCount] = useState(10)
  const [wordPool, setWordPool] = useState<WordPool>("all")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function startSession() {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      const { data: children } = await supabase
        .from("child_profiles")
        .select("id")
        .eq("parent_id", user.id)
        .limit(1)

      if (!children || children.length === 0) {
        router.push("/onboarding")
        return
      }

      const childId = children[0].id
      const sessionType: SessionType =
        wordPool === "needs_review" ? "review" : "practice"

      const { data: session, error: sessionError } = await supabase
        .from("practice_sessions")
        .insert({
          child_id: childId,
          session_type: sessionType,
        })
        .select()
        .single()

      if (sessionError) {
        setError(sessionError.message)
        setIsLoading(false)
        return
      }

      // Store session config in URL params
      const params = new URLSearchParams({
        count: wordCount.toString(),
        pool: wordPool,
      })

      router.push(`/practice/${session.id}?${params.toString()}`)
    } catch {
      setError("Something went wrong. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-sboc-dark">
          Practice Session
        </h1>
        <p className="mt-1 text-sboc-neutral">
          Configure your practice session and start spelling
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-sboc-red">
          {error}
        </div>
      )}

      {/* Word count */}
      <div className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-sboc-dark">
          How many words?
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {wordCountOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setWordCount(option.value)}
              className={cn(
                "rounded-xl border-2 p-4 text-center font-semibold transition-colors min-h-[44px]",
                wordCount === option.value
                  ? "border-sboc-yellow bg-yellow-50 text-sboc-dark"
                  : "border-gray-100 bg-white text-sboc-neutral hover:border-gray-200"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Word pool */}
      <div className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-sboc-dark">
          Which words?
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {wordPoolOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setWordPool(option.value)}
              className={cn(
                "rounded-xl border-2 p-4 text-left transition-colors min-h-[44px]",
                wordPool === option.value
                  ? "border-sboc-yellow bg-yellow-50"
                  : "border-gray-100 bg-white hover:border-gray-200"
              )}
            >
              <p className="font-semibold text-sboc-dark">{option.label}</p>
              <p className="mt-1 text-sm text-sboc-neutral">
                {option.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Start button */}
      <Button
        size="lg"
        className="w-full text-lg"
        onClick={startSession}
        disabled={isLoading}
      >
        <GraduationCap className="mr-2 h-5 w-5" />
        {isLoading ? "Starting..." : "Start Session"}
      </Button>
    </div>
  )
}
