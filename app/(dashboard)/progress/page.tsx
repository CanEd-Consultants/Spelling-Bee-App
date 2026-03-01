"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils/cn"
import type { MasteryStatus } from "@/lib/types"

interface ProgressStats {
  mastered: number
  learning: number
  needsReview: number
  notStarted: number
  currentStreak: number
  longestStreak: number
}

interface SessionRecord {
  id: string
  session_type: string
  words_attempted: number
  words_correct: number
  started_at: string
}

interface WeakWord {
  word: string
  word_id: number
  attempt_count: number
  correct_count: number
  last_practiced: string | null
}

export default function ProgressPage() {
  const [stats, setStats] = useState<ProgressStats | null>(null)
  const [sessions, setSessions] = useState<SessionRecord[]>([])
  const [weakWords, setWeakWords] = useState<WeakWord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadProgress() {
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

      if (!children || children.length === 0) return

      const childId = children[0].id

      // Get word progress
      const { data: progress } = await supabase
        .from("word_progress")
        .select("*")
        .eq("child_id", childId)

      const mastered =
        progress?.filter((p) => p.status === "mastered").length ?? 0
      const learning =
        progress?.filter((p) => p.status === "learning").length ?? 0
      const needsReview =
        progress?.filter((p) => p.status === "needs_review").length ?? 0
      const notStarted = 400 - mastered - learning - needsReview

      // Get streak
      const { data: streak } = await supabase
        .from("daily_streaks")
        .select("*")
        .eq("child_id", childId)
        .single()

      setStats({
        mastered,
        learning,
        needsReview,
        notStarted,
        currentStreak: streak?.current_streak ?? 0,
        longestStreak: streak?.longest_streak ?? 0,
      })

      // Get sessions
      const { data: sessionData } = await supabase
        .from("practice_sessions")
        .select("*")
        .eq("child_id", childId)
        .eq("completed", true)
        .order("started_at", { ascending: false })
        .limit(10)

      setSessions((sessionData as SessionRecord[]) ?? [])

      // Get weak words
      const weak =
        progress
          ?.filter((p) => p.status === "needs_review")
          .sort((a, b) => b.attempt_count - a.attempt_count)
          .slice(0, 20)
          .map((p) => ({
            word: p.word,
            word_id: p.word_id,
            attempt_count: p.attempt_count,
            correct_count: p.correct_count,
            last_practiced: p.last_practiced,
          })) ?? []

      setWeakWords(weak)
      setIsLoading(false)
    }

    loadProgress()
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-sboc-yellow" />
      </div>
    )
  }

  if (!stats) return null

  const total = 400

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-sboc-dark">
          Progress
        </h1>
        <p className="mt-1 text-sboc-neutral">
          Track your spelling journey
        </p>
      </div>

      {/* Mastery overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Mastered"
          value={stats.mastered}
          total={total}
          color="bg-sboc-green"
        />
        <StatCard
          label="Learning"
          value={stats.learning}
          total={total}
          color="bg-sboc-yellow"
        />
        <StatCard
          label="Needs Review"
          value={stats.needsReview}
          total={total}
          color="bg-sboc-red"
        />
        <StatCard
          label="Not Started"
          value={stats.notStarted}
          total={total}
          color="bg-gray-300"
        />
      </div>

      {/* Mastery donut chart (CSS) */}
      <div className="rounded-xl border-2 border-gray-100 bg-white p-8">
        <h2 className="font-display text-lg font-semibold text-sboc-dark mb-6">
          Overall Progress
        </h2>
        <div className="flex items-center justify-center gap-12 flex-wrap">
          <div className="relative h-48 w-48">
            <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="3"
              />
              {stats.mastered > 0 && (
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke="#22C55E"
                  strokeWidth="3"
                  strokeDasharray={`${(stats.mastered / total) * 97.4} 97.4`}
                  strokeDashoffset="0"
                />
              )}
              {stats.learning > 0 && (
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke="#F5C400"
                  strokeWidth="3"
                  strokeDasharray={`${(stats.learning / total) * 97.4} 97.4`}
                  strokeDashoffset={`${-((stats.mastered / total) * 97.4)}`}
                />
              )}
              {stats.needsReview > 0 && (
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="3"
                  strokeDasharray={`${(stats.needsReview / total) * 97.4} 97.4`}
                  strokeDashoffset={`${-(((stats.mastered + stats.learning) / total) * 97.4)}`}
                />
              )}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl font-bold text-sboc-dark">
                  {Math.round((stats.mastered / total) * 100)}%
                </p>
                <p className="text-xs text-sboc-neutral">mastered</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <LegendItem color="bg-sboc-green" label="Mastered" value={stats.mastered} />
            <LegendItem color="bg-sboc-yellow" label="Learning" value={stats.learning} />
            <LegendItem color="bg-sboc-red" label="Needs Review" value={stats.needsReview} />
            <LegendItem color="bg-gray-300" label="Not Started" value={stats.notStarted} />
          </div>
        </div>
      </div>

      {/* Streak */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border-2 border-gray-100 bg-white p-6">
          <p className="text-sm font-medium text-sboc-neutral">
            Current Streak
          </p>
          <p className="mt-2 text-4xl font-bold text-sboc-dark">
            {stats.currentStreak}{" "}
            <span className="text-lg text-sboc-neutral">days</span>
          </p>
        </div>
        <div className="rounded-xl border-2 border-gray-100 bg-white p-6">
          <p className="text-sm font-medium text-sboc-neutral">
            Longest Streak
          </p>
          <p className="mt-2 text-4xl font-bold text-sboc-dark">
            {stats.longestStreak}{" "}
            <span className="text-lg text-sboc-neutral">days</span>
          </p>
        </div>
      </div>

      {/* Weak words */}
      {weakWords.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-sboc-dark">
            Words That Need Work
          </h2>
          <div className="rounded-xl border-2 border-gray-100 bg-white divide-y divide-gray-100">
            {weakWords.map((w) => (
              <div
                key={w.word_id}
                className="flex items-center justify-between p-4"
              >
                <div>
                  <Link
                    href={`/words/${encodeURIComponent(w.word)}`}
                    className="font-mono font-semibold text-sboc-dark hover:text-sboc-yellow transition-colors"
                  >
                    {w.word}
                  </Link>
                  <p className="text-xs text-sboc-neutral">
                    {w.correct_count}/{w.attempt_count} correct
                    {w.last_practiced &&
                      ` \u00B7 Last: ${new Date(w.last_practiced).toLocaleDateString()}`}
                  </p>
                </div>
                <Link href="/practice">
                  <Button variant="outline" size="sm">
                    Practice
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Session history */}
      {sessions.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-sboc-dark">
            Recent Sessions
          </h2>
          <div className="rounded-xl border-2 border-gray-100 bg-white divide-y divide-gray-100">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4"
              >
                <div>
                  <p className="font-semibold text-sboc-dark capitalize">
                    {session.session_type}
                  </p>
                  <p className="text-xs text-sboc-neutral">
                    {new Date(session.started_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={cn(
                      "font-bold",
                      session.words_correct / session.words_attempted >= 0.8
                        ? "text-sboc-green"
                        : session.words_correct / session.words_attempted >= 0.5
                          ? "text-sboc-yellow"
                          : "text-sboc-red"
                    )}
                  >
                    {session.words_correct}/{session.words_attempted}
                  </p>
                  <p className="text-xs text-sboc-neutral">
                    {Math.round(
                      (session.words_correct / session.words_attempted) * 100
                    )}
                    %
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {sessions.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
          <p className="text-lg font-display font-bold text-sboc-dark">
            No sessions yet
          </p>
          <p className="mt-1 text-sboc-neutral">
            Start practicing to see your progress here.
          </p>
          <Link href="/practice">
            <Button className="mt-4">Start Practicing</Button>
          </Link>
        </div>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  total,
  color,
}: {
  label: string
  value: number
  total: number
  color: string
}) {
  return (
    <div className="rounded-xl border-2 border-gray-100 bg-white p-6">
      <p className="text-sm font-medium text-sboc-neutral">{label}</p>
      <p className="mt-2 text-3xl font-bold text-sboc-dark">{value}</p>
      <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100">
        <div
          className={cn("h-1.5 rounded-full transition-all", color)}
          style={{ width: `${(value / total) * 100}%` }}
        />
      </div>
    </div>
  )
}

function LegendItem({
  color,
  label,
  value,
}: {
  color: string
  label: string
  value: number
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn("h-3 w-3 rounded-full", color)} />
      <span className="text-sm text-sboc-dark">
        {label}: <span className="font-semibold">{value}</span>
      </span>
    </div>
  )
}
