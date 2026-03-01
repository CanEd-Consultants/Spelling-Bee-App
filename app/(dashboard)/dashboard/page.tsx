import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { GraduationCap, BookOpen, BarChart3 } from "lucide-react"

export default async function DashboardPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get the active child
  const { data: childProfiles } = await supabase
    .from("child_profiles")
    .select("*")
    .eq("parent_id", user.id)

  if (!childProfiles || childProfiles.length === 0) {
    redirect("/onboarding")
  }

  const child = childProfiles[0]

  // Get word progress stats
  const { data: progress } = await supabase
    .from("word_progress")
    .select("status")
    .eq("child_id", child.id)

  const mastered = progress?.filter((p) => p.status === "mastered").length ?? 0
  const learning = progress?.filter((p) => p.status === "learning").length ?? 0
  const needsReview =
    progress?.filter((p) => p.status === "needs_review").length ?? 0
  const totalWords = 400
  const progressPercent = Math.round((mastered / totalWords) * 100)

  // Get streak
  const { data: streak } = await supabase
    .from("daily_streaks")
    .select("*")
    .eq("child_id", child.id)
    .single()

  // Get today's sessions
  const today = new Date().toISOString().split("T")[0]
  const { data: todaySessions } = await supabase
    .from("practice_sessions")
    .select("words_attempted")
    .eq("child_id", child.id)
    .gte("started_at", `${today}T00:00:00`)
    .eq("completed", true)

  const wordsToday =
    todaySessions?.reduce((sum, s) => sum + s.words_attempted, 0) ?? 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-sboc-dark">
          Hi, {child.name}!
        </h1>
        <p className="mt-1 text-sboc-neutral">
          Ready to practice your spelling today?
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Overall progress */}
        <div className="rounded-xl border-2 border-gray-100 bg-white p-6">
          <p className="text-sm font-medium text-sboc-neutral">
            Words Mastered
          </p>
          <p className="mt-2 text-3xl font-bold text-sboc-dark">
            {mastered}
            <span className="text-lg text-sboc-neutral">/{totalWords}</span>
          </p>
          <div className="mt-3 h-2 w-full rounded-full bg-gray-100">
            <div
              className="h-2 rounded-full bg-sboc-green transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Streak */}
        <div className="rounded-xl border-2 border-gray-100 bg-white p-6">
          <p className="text-sm font-medium text-sboc-neutral">
            Current Streak
          </p>
          <p className="mt-2 text-3xl font-bold text-sboc-dark">
            {streak?.current_streak ?? 0}
            <span className="text-lg text-sboc-neutral"> days</span>
          </p>
          {(streak?.longest_streak ?? 0) > 0 && (
            <p className="mt-1 text-xs text-sboc-neutral">
              Best: {streak?.longest_streak} days
            </p>
          )}
        </div>

        {/* Today's progress */}
        <div className="rounded-xl border-2 border-gray-100 bg-white p-6">
          <p className="text-sm font-medium text-sboc-neutral">Today</p>
          <p className="mt-2 text-3xl font-bold text-sboc-dark">
            {wordsToday}
            <span className="text-lg text-sboc-neutral">
              /{child.daily_goal}
            </span>
          </p>
          <p className="mt-1 text-xs text-sboc-neutral">words practiced</p>
        </div>

        {/* Needs review */}
        <div className="rounded-xl border-2 border-gray-100 bg-white p-6">
          <p className="text-sm font-medium text-sboc-neutral">Needs Review</p>
          <p className="mt-2 text-3xl font-bold text-sboc-red">
            {needsReview}
          </p>
          <p className="mt-1 text-xs text-sboc-neutral">
            {learning} learning
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/practice" className="block">
          <div className="flex items-center gap-4 rounded-xl border-2 border-sboc-yellow bg-yellow-50 p-6 transition-colors hover:bg-yellow-100">
            <GraduationCap className="h-10 w-10 text-sboc-yellow" />
            <div>
              <p className="font-display text-lg font-bold text-sboc-dark">
                Start Practicing
              </p>
              <p className="text-sm text-sboc-neutral">
                Practice new words
              </p>
            </div>
          </div>
        </Link>

        <Link href="/words" className="block">
          <div className="flex items-center gap-4 rounded-xl border-2 border-gray-100 bg-white p-6 transition-colors hover:bg-gray-50">
            <BookOpen className="h-10 w-10 text-sboc-neutral" />
            <div>
              <p className="font-display text-lg font-bold text-sboc-dark">
                Browse Words
              </p>
              <p className="text-sm text-sboc-neutral">View all 400 words</p>
            </div>
          </div>
        </Link>

        <Link href="/progress" className="block">
          <div className="flex items-center gap-4 rounded-xl border-2 border-gray-100 bg-white p-6 transition-colors hover:bg-gray-50">
            <BarChart3 className="h-10 w-10 text-sboc-neutral" />
            <div>
              <p className="font-display text-lg font-bold text-sboc-dark">
                View Progress
              </p>
              <p className="text-sm text-sboc-neutral">Track improvement</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Empty state for new users */}
      {mastered === 0 && learning === 0 && needsReview === 0 && (
        <div className="rounded-xl border-2 border-dashed border-sboc-yellow/50 bg-yellow-50/50 p-8 text-center">
          <GraduationCap className="mx-auto h-12 w-12 text-sboc-yellow" />
          <h3 className="mt-4 font-display text-xl font-bold text-sboc-dark">
            Ready to begin?
          </h3>
          <p className="mt-2 text-sboc-neutral">
            Start your first practice session and begin mastering the 400
            official SBOC words.
          </p>
          <Link href="/practice">
            <Button size="lg" className="mt-4">
              Start Your First Session
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
