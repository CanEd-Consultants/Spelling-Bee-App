"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils/cn"
import type { AttemptRecord } from "@/lib/types"

interface SessionSummaryProps {
  attempts: AttemptRecord[]
  streakCount: number
}

export function SessionSummary({ attempts, streakCount }: SessionSummaryProps) {
  const correct = attempts.filter((a) => a.isCorrect).length
  const total = attempts.length
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0

  const incorrectAttempts = attempts.filter((a) => !a.isCorrect)

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-display font-bold text-sboc-dark">
          Session Complete!
        </h2>
      </div>

      {/* Score */}
      <div className="rounded-xl border-2 border-gray-100 bg-white p-8 text-center">
        <p
          className={cn(
            "text-6xl font-display font-bold",
            percentage >= 80
              ? "text-sboc-green"
              : percentage >= 50
                ? "text-sboc-yellow"
                : "text-sboc-red"
          )}
        >
          {correct}/{total}
        </p>
        <p className="mt-2 text-lg text-sboc-neutral">{percentage}% correct</p>

        {streakCount > 0 && (
          <p className="mt-4 text-lg font-semibold text-sboc-dark">
            {streakCount} day streak!
          </p>
        )}
      </div>

      {/* Incorrect words */}
      {incorrectAttempts.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-display text-lg font-semibold text-sboc-dark">
            Words to Review
          </h3>
          <div className="rounded-xl border-2 border-gray-100 bg-white divide-y divide-gray-100">
            {incorrectAttempts.map((attempt) => (
              <div
                key={attempt.wordId}
                className="flex items-center justify-between p-4"
              >
                <div>
                  <p className="font-mono font-semibold text-sboc-dark">
                    {attempt.word}
                  </p>
                  <p className="text-sm text-sboc-red">
                    You typed: {attempt.attemptText}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <Link href="/practice" className="flex-1">
          <Button variant="default" className="w-full" size="lg">
            Practice Again
          </Button>
        </Link>
        <Link href="/dashboard" className="flex-1">
          <Button variant="outline" className="w-full" size="lg">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}
