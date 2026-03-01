"use client"

import { Volume2, BookOpen, MessageSquare } from "lucide-react"
import { useSpeech } from "@/lib/hooks/useSpeech"
import { Button } from "@/components/ui/button"
import type { Word } from "@/lib/types"

interface AudioControlsProps {
  word: Word
  disabled: boolean
  onRepronounce: () => void
  onDefinition: () => void
}

export function AudioControls({
  word,
  disabled,
  onRepronounce,
  onDefinition,
}: AudioControlsProps) {
  const { speak, isSupported } = useSpeech()

  if (!isSupported) return null

  function handleRepronounce() {
    speak(word.word)
    onRepronounce()
  }

  function handleDefinition() {
    speak(word.definition)
    onDefinition()
  }

  function handleExample() {
    speak(word.example_sentence)
  }

  return (
    <div className="mx-auto flex max-w-md flex-wrap justify-center gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={handleRepronounce}
        disabled={disabled}
        className="gap-2"
      >
        <Volume2 className="h-4 w-4" />
        Hear Word Again
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDefinition}
        disabled={disabled}
        className="gap-2"
      >
        <BookOpen className="h-4 w-4" />
        Hear Definition
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExample}
        disabled={disabled}
        className="gap-2"
      >
        <MessageSquare className="h-4 w-4" />
        Hear Example
      </Button>
    </div>
  )
}
