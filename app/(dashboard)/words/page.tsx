"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { WordPreviewCard } from "@/components/words/word-preview-card"
import { cn } from "@/lib/utils/cn"
import type { Word, MasteryStatus, WordProgress } from "@/lib/types"
import allWordsData from "@/data/words/primary-2026.json"

const allWords = allWordsData as Word[]
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
const statusFilters: { value: MasteryStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "not_started", label: "Not Started" },
  { value: "learning", label: "Learning" },
  { value: "mastered", label: "Mastered" },
  { value: "needs_review", label: "Needs Review" },
]

export default function WordListPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [progressMap, setProgressMap] = useState<Map<number, MasteryStatus>>(
    new Map()
  )
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const search = searchParams.get("search") ?? ""
  const letter = searchParams.get("letter") ?? ""
  const status = (searchParams.get("status") ?? "all") as MasteryStatus | "all"

  // Load progress data if authenticated
  useEffect(() => {
    async function loadProgress() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      setIsAuthenticated(true)

      const { data: children } = await supabase
        .from("child_profiles")
        .select("id")
        .eq("parent_id", user.id)
        .limit(1)

      if (!children || children.length === 0) return

      const { data: progress } = await supabase
        .from("word_progress")
        .select("word_id, status")
        .eq("child_id", children[0].id)

      if (progress) {
        const map = new Map<number, MasteryStatus>()
        progress.forEach((p) => map.set(p.word_id, p.status as MasteryStatus))
        setProgressMap(map)
      }
    }

    loadProgress()
  }, [])

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/words?${params.toString()}`, { scroll: false })
  }

  const filteredWords = useMemo(() => {
    return allWords.filter((word) => {
      // Search filter
      if (search && !word.word.toLowerCase().includes(search.toLowerCase())) {
        return false
      }
      // Letter filter
      if (letter && !word.word.toLowerCase().startsWith(letter.toLowerCase())) {
        return false
      }
      // Status filter (only when authenticated)
      if (status !== "all" && isAuthenticated) {
        const wordStatus = progressMap.get(word.id) ?? "not_started"
        if (wordStatus !== status) {
          return false
        }
      }
      return true
    })
  }, [search, letter, status, progressMap, isAuthenticated])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-sboc-dark">
          Word List
        </h1>
        <p className="mt-1 text-sboc-neutral">
          {filteredWords.length} of {allWords.length} words
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sboc-neutral" />
        <Input
          type="text"
          placeholder="Search words..."
          value={search}
          onChange={(e) => updateParams("search", e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Letter filter */}
      <div className="flex flex-wrap gap-1">
        <button
          onClick={() => updateParams("letter", "")}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors min-h-[44px] min-w-[44px]",
            !letter
              ? "bg-sboc-yellow text-sboc-dark"
              : "bg-gray-100 text-sboc-neutral hover:bg-gray-200"
          )}
        >
          All
        </button>
        {letters.map((l) => (
          <button
            key={l}
            onClick={() => updateParams("letter", l === letter ? "" : l)}
            className={cn(
              "rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors min-h-[44px] min-w-[44px]",
              l === letter
                ? "bg-sboc-yellow text-sboc-dark"
                : "bg-gray-100 text-sboc-neutral hover:bg-gray-200"
            )}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Status filter (auth only) */}
      {isAuthenticated && (
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() =>
                updateParams("status", f.value === status ? "" : f.value)
              }
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors min-h-[44px]",
                f.value === status
                  ? "bg-sboc-dark text-white"
                  : "bg-gray-100 text-sboc-neutral hover:bg-gray-200"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Word grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredWords.map((word) => (
          <WordPreviewCard
            key={word.id}
            word={word}
            status={
              isAuthenticated
                ? progressMap.get(word.id) ?? "not_started"
                : undefined
            }
          />
        ))}
      </div>

      {filteredWords.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
          <p className="text-lg font-display font-bold text-sboc-dark">
            No words found
          </p>
          <p className="mt-1 text-sboc-neutral">
            Try adjusting your search or filters.
          </p>
        </div>
      )}
    </div>
  )
}
