"use client"

import { Button } from "@/components/ui/button"

export default function PracticeError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-display font-bold text-sboc-dark">
          Something went wrong
        </h2>
        <p className="text-sboc-neutral">
          There was a problem with your practice session.
        </p>
        <Button onClick={reset}>Try Again</Button>
      </div>
    </div>
  )
}
