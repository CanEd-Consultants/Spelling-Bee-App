import type { Word, WordPool, WordProgress } from "@/lib/types"

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function selectWords(
  allWords: Word[],
  progressMap: Map<number, WordProgress>,
  pool: WordPool,
  count: number
): Word[] {
  let filtered: Word[]

  switch (pool) {
    case "needs_review": {
      filtered = allWords.filter((w) => {
        const progress = progressMap.get(w.id)
        return progress?.status === "needs_review"
      })
      break
    }
    case "not_started": {
      filtered = allWords.filter((w) => {
        const progress = progressMap.get(w.id)
        return !progress || progress.status === "not_started"
      })
      break
    }
    case "random_mix": {
      const notStarted = allWords.filter((w) => {
        const p = progressMap.get(w.id)
        return !p || p.status === "not_started"
      })
      const needsReview = allWords.filter((w) => {
        const p = progressMap.get(w.id)
        return p?.status === "needs_review"
      })
      const learning = allWords.filter((w) => {
        const p = progressMap.get(w.id)
        return p?.status === "learning"
      })

      const targetCount = count > 0 ? count : allWords.length

      // 60% not started, 30% needs review, 10% learning
      const nsCount = Math.ceil(targetCount * 0.6)
      const nrCount = Math.ceil(targetCount * 0.3)
      const lCount = targetCount - nsCount - nrCount

      filtered = [
        ...shuffle(notStarted).slice(0, nsCount),
        ...shuffle(needsReview).slice(0, nrCount),
        ...shuffle(learning).slice(0, lCount),
      ]
      break
    }
    case "all":
    default: {
      filtered = [...allWords]
      break
    }
  }

  const shuffled = shuffle(filtered)

  if (count > 0) {
    return shuffled.slice(0, count)
  }

  return shuffled
}
