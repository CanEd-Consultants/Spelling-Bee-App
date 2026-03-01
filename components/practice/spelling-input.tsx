"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SpellingInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled: boolean
  wordLength?: number
}

export function SpellingInput({
  value,
  onChange,
  onSubmit,
  disabled,
  wordLength,
}: SpellingInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus()
    }
  }, [disabled])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && value.trim().length > 0) {
      onSubmit()
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Type your spelling..."
          className="h-14 text-center text-xl font-mono tracking-wider"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
        />
        {wordLength && wordLength > 8 && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-sboc-neutral">
            {value.length} chars
          </span>
        )}
      </div>
      <Button
        onClick={onSubmit}
        disabled={disabled || value.trim().length === 0}
        className="w-full"
        size="lg"
      >
        Submit
      </Button>
    </div>
  )
}
