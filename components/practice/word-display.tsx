"use client"

import { useEffect } from "react"
import { Volume2, AlertTriangle } from "lucide-react"
import { useSpeech } from "@/lib/hooks/useSpeech"
import { Button } from "@/components/ui/button"
import type { Word } from "@/lib/types"

interface WordDisplayProps {
  word: Word
  autoPlay?: boolean
}

export function WordDisplay({ word, autoPlay = true }: WordDisplayProps) {
  const { speak, isSupported } = useSpeech()

  useEffect(() => {
    if (autoPlay && isSupported) {
      // Small delay to let the component mount
      const timeout = setTimeout(() => {
        speak(word.word)
      }, 300)
      return () => clearTimeout(timeout)
    }
  }, [word.word, autoPlay, isSupported, speak])

  return (
    <div className="space-y-4 text-center">
      {/* Pronunciation guide */}
      <p className="font-mono text-3xl font-medium text-sboc-dark tracking-wider">
        {word.pronunciation}
      </p>

      {/* Speaker button */}
      {isSupported && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => speak(word.word)}
          aria-label="Hear the word"
          className="mx-auto"
        >
          <Volume2 className="h-8 w-8 text-sboc-yellow" />
        </Button>
      )}

      {!isSupported && (
        <p className="text-sm text-sboc-neutral">
          Audio not available in this browser
        </p>
      )}

      {/* Part of speech badge */}
      <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-sboc-neutral">
        {word.part_of_speech}
      </span>

      {/* Homophone warning — always show for homophones per SBOC rules */}
      {word.homophones.length > 0 && (
        <div className="mx-auto max-w-md rounded-lg border border-orange-200 bg-orange-50 p-4 text-left">
          <p className="text-sm font-semibold text-orange-800">
            This word has homophones: {word.homophones.join(", ")}
          </p>
          <p className="mt-2 text-sm text-sboc-dark">
            <span className="font-semibold">Definition:</span>{" "}
            {word.definition}
          </p>
          <p className="mt-1 text-sm text-sboc-neutral italic">
            &ldquo;{word.example_sentence}&rdquo;
          </p>
        </div>
      )}

      {/* Capital letter notice */}
      {word.requires_capital && (
        <div className="mx-auto inline-flex items-center gap-2 rounded-lg bg-yellow-50 border border-sboc-yellow/30 px-4 py-2">
          <AlertTriangle className="h-4 w-4 text-sboc-yellow" />
          <p className="text-sm font-semibold text-sboc-dark">
            Capital letter required
          </p>
        </div>
      )}
    </div>
  )
}
