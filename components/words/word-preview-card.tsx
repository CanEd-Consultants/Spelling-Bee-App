"use client"

import Link from "next/link"
import { cn } from "@/lib/utils/cn"
import type { Word, MasteryStatus } from "@/lib/types"

interface WordPreviewCardProps {
  word: Word
  status?: MasteryStatus
}

function getStatusIcon(status: MasteryStatus) {
  switch (status) {
    case "mastered":
      return { icon: "\u2713", color: "text-sboc-green", bg: "bg-green-50" }
    case "learning":
      return { icon: "\u2605", color: "text-sboc-yellow", bg: "bg-yellow-50" }
    case "needs_review":
      return { icon: "\u26A0", color: "text-sboc-red", bg: "bg-red-50" }
    case "not_started":
    default:
      return { icon: "\u25CF", color: "text-gray-300", bg: "bg-gray-50" }
  }
}

export function WordPreviewCard({ word, status }: WordPreviewCardProps) {
  const statusInfo = getStatusIcon(status ?? "not_started")

  return (
    <Link href={`/words/${encodeURIComponent(word.word)}`}>
      <div className="group rounded-xl border-2 border-gray-100 bg-white p-4 transition-all hover:border-sboc-yellow hover:shadow-sm min-h-[44px]">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="font-display text-lg font-bold text-sboc-dark group-hover:text-sboc-yellow transition-colors">
              {word.word}
            </p>
            <p className="text-sm text-sboc-neutral">{word.pronunciation}</p>
          </div>
          {status && (
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm",
                statusInfo.bg,
                statusInfo.color
              )}
              title={status.replace("_", " ")}
            >
              {statusInfo.icon}
            </span>
          )}
        </div>

        <div className="mt-2 flex flex-wrap gap-1">
          {word.homophones.length > 0 && (
            <span className="rounded bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700">
              homophone
            </span>
          )}
          {word.requires_capital && (
            <span className="rounded bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-700">
              capital
            </span>
          )}
          <span className="rounded bg-gray-50 px-2 py-0.5 text-xs text-sboc-neutral">
            {word.part_of_speech}
          </span>
        </div>
      </div>
    </Link>
  )
}
