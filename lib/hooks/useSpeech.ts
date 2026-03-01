"use client"

import { useCallback, useEffect, useRef, useState } from "react"

interface SpeechOptions {
  rate?: number
  pitch?: number
  lang?: string
}

export function useSpeech() {
  const [isSupported, setIsSupported] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    setIsSupported(typeof window !== "undefined" && "speechSynthesis" in window)
  }, [])

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [])

  const speak = useCallback(
    (text: string, options?: SpeechOptions) => {
      if (!isSupported) return

      stop()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = options?.rate ?? 0.85
      utterance.pitch = options?.pitch ?? 1.0
      utterance.lang = options?.lang ?? "en-CA"

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      utteranceRef.current = utterance
      window.speechSynthesis.speak(utterance)
    },
    [isSupported, stop]
  )

  return { speak, stop, isSupported, isSpeaking }
}
