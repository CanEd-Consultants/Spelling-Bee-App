import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Volume2, AlertTriangle, ArrowLeft } from "lucide-react"
import type { Word } from "@/lib/types"
import allWordsData from "@/data/words/primary-2026.json"

const allWords = allWordsData as Word[]

interface WordDetailPageProps {
  params: { word: string }
}

export default function WordDetailPage({ params }: WordDetailPageProps) {
  const decodedWord = decodeURIComponent(params.word)
  const word = allWords.find(
    (w) => w.word.toLowerCase() === decodedWord.toLowerCase()
  )

  if (!word) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Back link */}
      <Link
        href="/words"
        className="inline-flex items-center gap-2 text-sm text-sboc-neutral hover:text-sboc-dark transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to word list
      </Link>

      {/* Word header */}
      <div className="space-y-2">
        <h1 className="text-5xl font-display font-bold text-sboc-dark">
          {word.word}
        </h1>
        <p className="font-mono text-xl text-sboc-neutral">
          {word.pronunciation}
        </p>
        <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-sboc-neutral">
          {word.part_of_speech}
        </span>
      </div>

      {/* Definition */}
      <div className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-sboc-dark">
          Definition
        </h2>
        <p className="text-lg text-sboc-dark">{word.definition}</p>
      </div>

      {/* Example sentence */}
      <div className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-sboc-dark">
          Example
        </h2>
        <blockquote className="border-l-4 border-sboc-yellow pl-4 text-lg italic text-sboc-neutral">
          &ldquo;{word.example_sentence}&rdquo;
        </blockquote>
      </div>

      {/* Homophones */}
      {word.homophones.length > 0 && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <h2 className="font-display text-lg font-semibold text-orange-800">
              Homophones
            </h2>
          </div>
          <p className="mt-2 text-orange-800">
            This word sounds like:{" "}
            <span className="font-semibold">
              {word.homophones.join(", ")}
            </span>
          </p>
          <p className="mt-1 text-sm text-orange-700">
            In the spelling bee, the definition and example sentence will help
            you know which spelling is required.
          </p>
        </div>
      )}

      {/* Capital letter notice */}
      {word.requires_capital && (
        <div className="rounded-lg border border-sboc-yellow/30 bg-yellow-50 p-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-sboc-yellow" />
            <h2 className="font-display text-lg font-semibold text-sboc-dark">
              Capital Letter Required
            </h2>
          </div>
          <p className="mt-2 text-sboc-dark">
            This word starts with a capital &ldquo;{word.capital_letter}&rdquo;.
            In the oral competition, you must indicate this by saying
            &ldquo;Capital {word.capital_letter}&rdquo;.
          </p>
        </div>
      )}

      {/* Practice button */}
      <Link href="/practice">
        <Button size="lg" className="w-full">
          <Volume2 className="mr-2 h-5 w-5" />
          Practice This Word
        </Button>
      </Link>
    </div>
  )
}
