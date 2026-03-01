import type { Word } from "@/lib/types"

export function checkSpelling(attempt: string, word: Word): boolean {
  const trimmedAttempt = attempt.trim()

  // Case-insensitive comparison (even for words requiring capital in oral competition)
  if (trimmedAttempt.toLowerCase() === word.word.toLowerCase()) {
    return true
  }

  // Check alternate spelling if available
  if (
    word.alternate_spelling &&
    trimmedAttempt.toLowerCase() === word.alternate_spelling.toLowerCase()
  ) {
    return true
  }

  return false
}
