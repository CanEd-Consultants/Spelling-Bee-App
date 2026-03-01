"use client"

import { useEffect } from "react"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils/cn"

interface FeedbackOverlayProps {
  isCorrect: boolean
  correctWord: string
  onNext: () => void
}

export function FeedbackOverlay({
  isCorrect,
  correctWord,
  onNext,
}: FeedbackOverlayProps) {
  useEffect(() => {
    const timeout = setTimeout(onNext, 2000)
    return () => clearTimeout(timeout)
  }, [onNext])

  return (
    <div
      className={cn(
        "mx-auto max-w-md rounded-xl p-8 text-center",
        isCorrect ? "bg-green-50 border-2 border-sboc-green" : "bg-red-50 border-2 border-sboc-red"
      )}
    >
      <div
        className={cn(
          "mx-auto flex h-16 w-16 items-center justify-center rounded-full",
          isCorrect ? "bg-sboc-green" : "bg-sboc-red"
        )}
      >
        {isCorrect ? (
          <Check className="h-8 w-8 text-white" />
        ) : (
          <X className="h-8 w-8 text-white" />
        )}
      </div>

      <p
        className={cn(
          "mt-4 text-xl font-display font-bold",
          isCorrect ? "text-sboc-green" : "text-sboc-red"
        )}
      >
        {isCorrect ? "Correct!" : "Not quite!"}
      </p>

      {!isCorrect && (
        <p className="mt-2 text-lg">
          The correct spelling is:{" "}
          <span className="font-mono font-bold text-sboc-dark">
            {correctWord}
          </span>
        </p>
      )}

      {isCorrect && (
        <p className="mt-2 text-lg font-mono font-bold text-sboc-green">
          {correctWord}
        </p>
      )}
    </div>
  )
}
