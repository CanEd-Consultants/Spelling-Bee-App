"use client"

import { useCallback, useEffect, useReducer, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { WordDisplay } from "@/components/practice/word-display"
import { SpellingInput } from "@/components/practice/spelling-input"
import { AudioControls } from "@/components/practice/audio-controls"
import { FeedbackOverlay } from "@/components/practice/feedback-overlay"
import { SessionSummary } from "@/components/practice/session-summary"
import { checkSpelling } from "@/lib/utils/check-spelling"
import { selectWords } from "@/lib/utils/word-selection"
import type {
  Word,
  SessionState,
  SessionPhase,
  AttemptRecord,
  WordProgress,
  WordPool,
} from "@/lib/types"
import allWordsData from "@/data/words/primary-2026.json"

type SessionAction =
  | { type: "SET_WORDS"; words: Word[]; sessionId: string }
  | { type: "SET_ATTEMPT"; text: string }
  | { type: "SET_PHASE"; phase: SessionPhase }
  | { type: "SUBMIT_ATTEMPT"; isCorrect: boolean }
  | { type: "NEXT_WORD" }
  | { type: "SET_REPRONOUNCE" }
  | { type: "SET_DEFINITION" }

const initialState: SessionState = {
  sessionId: "",
  words: [],
  currentIndex: 0,
  currentAttempt: "",
  phase: "listening",
  attempts: [],
  score: { correct: 0, incorrect: 0 },
}

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case "SET_WORDS":
      return {
        ...state,
        sessionId: action.sessionId,
        words: action.words,
        currentIndex: 0,
        phase: "listening",
      }
    case "SET_ATTEMPT":
      return { ...state, currentAttempt: action.text }
    case "SET_PHASE":
      return { ...state, phase: action.phase }
    case "SUBMIT_ATTEMPT": {
      const currentWord = state.words[state.currentIndex]
      const attempt: AttemptRecord = {
        wordId: currentWord.id,
        word: currentWord.word,
        attemptText: state.currentAttempt,
        isCorrect: action.isCorrect,
        requestedRepronounce: false,
        requestedDefinition: false,
      }
      return {
        ...state,
        phase: "feedback",
        attempts: [...state.attempts, attempt],
        score: {
          correct: state.score.correct + (action.isCorrect ? 1 : 0),
          incorrect: state.score.incorrect + (action.isCorrect ? 0 : 1),
        },
      }
    }
    case "NEXT_WORD": {
      const nextIndex = state.currentIndex + 1
      if (nextIndex >= state.words.length) {
        return { ...state, phase: "complete" }
      }
      return {
        ...state,
        currentIndex: nextIndex,
        currentAttempt: "",
        phase: "listening",
      }
    }
    case "SET_REPRONOUNCE": {
      const updatedAttempts = [...state.attempts]
      if (updatedAttempts.length > 0) {
        updatedAttempts[updatedAttempts.length - 1] = {
          ...updatedAttempts[updatedAttempts.length - 1],
          requestedRepronounce: true,
        }
      }
      return { ...state, attempts: updatedAttempts }
    }
    case "SET_DEFINITION": {
      const updatedAttempts = [...state.attempts]
      if (updatedAttempts.length > 0) {
        updatedAttempts[updatedAttempts.length - 1] = {
          ...updatedAttempts[updatedAttempts.length - 1],
          requestedDefinition: true,
        }
      }
      return { ...state, attempts: updatedAttempts }
    }
    default:
      return state
  }
}

export default function PracticeSessionPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const sessionId = params.sessionId as string
  const [state, dispatch] = useReducer(sessionReducer, initialState)
  const [isLoading, setIsLoading] = useState(true)
  const [streakCount, setStreakCount] = useState(0)

  // Load words on mount
  useEffect(() => {
    async function loadWords() {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data: children } = await supabase
        .from("child_profiles")
        .select("id")
        .eq("parent_id", user.id)
        .limit(1)

      if (!children || children.length === 0) return

      const childId = children[0].id

      // Get word progress
      const { data: progressData } = await supabase
        .from("word_progress")
        .select("*")
        .eq("child_id", childId)

      const progressMap = new Map<number, WordProgress>()
      progressData?.forEach((p) => {
        progressMap.set(p.word_id, p as WordProgress)
      })

      // Get streak
      const { data: streak } = await supabase
        .from("daily_streaks")
        .select("current_streak")
        .eq("child_id", childId)
        .single()

      setStreakCount(streak?.current_streak ?? 0)

      // Select words based on session config
      const count = parseInt(searchParams.get("count") ?? "10")
      const pool = (searchParams.get("pool") ?? "all") as WordPool

      const words = selectWords(
        allWordsData as Word[],
        progressMap,
        pool,
        count
      )

      dispatch({ type: "SET_WORDS", words, sessionId })
      setIsLoading(false)
    }

    loadWords()
  }, [sessionId, searchParams])

  // Save attempt to database
  const saveAttempt = useCallback(
    async (attempt: AttemptRecord) => {
      try {
        const supabase = createClient()

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        const { data: children } = await supabase
          .from("child_profiles")
          .select("id")
          .eq("parent_id", user.id)
          .limit(1)

        if (!children || children.length === 0) return

        const childId = children[0].id

        // Save attempt
        await supabase.from("session_attempts").insert({
          session_id: sessionId,
          child_id: childId,
          word_id: attempt.wordId,
          word: attempt.word,
          attempt_text: attempt.attemptText,
          is_correct: attempt.isCorrect,
          requested_repronounce: attempt.requestedRepronounce,
          requested_definition: attempt.requestedDefinition,
        })

        // Upsert word progress
        const { data: existing } = await supabase
          .from("word_progress")
          .select("*")
          .eq("child_id", childId)
          .eq("word_id", attempt.wordId)
          .single()

        if (existing) {
          const newStreak = attempt.isCorrect
            ? existing.correct_streak + 1
            : 0
          let newStatus = existing.status
          if (attempt.isCorrect && newStreak >= 2) {
            newStatus = "mastered"
          } else if (
            attempt.isCorrect &&
            existing.status === "needs_review"
          ) {
            newStatus = "learning"
          } else if (!attempt.isCorrect) {
            newStatus = "needs_review"
          }

          await supabase
            .from("word_progress")
            .update({
              status: newStatus,
              correct_streak: newStreak,
              attempt_count: existing.attempt_count + 1,
              correct_count: existing.correct_count + (attempt.isCorrect ? 1 : 0),
              last_practiced: new Date().toISOString(),
            })
            .eq("id", existing.id)
        } else {
          await supabase.from("word_progress").insert({
            child_id: childId,
            word_id: attempt.wordId,
            word: attempt.word,
            status: attempt.isCorrect ? "learning" : "needs_review",
            correct_streak: attempt.isCorrect ? 1 : 0,
            attempt_count: 1,
            correct_count: attempt.isCorrect ? 1 : 0,
            last_practiced: new Date().toISOString(),
          })
        }
      } catch (err) {
        console.error("Failed to save attempt:", err)
      }
    },
    [sessionId]
  )

  // Complete session
  const completeSession = useCallback(async () => {
    try {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data: children } = await supabase
        .from("child_profiles")
        .select("id")
        .eq("parent_id", user.id)
        .limit(1)

      if (!children || children.length === 0) return

      const childId = children[0].id
      const correct = state.attempts.filter((a) => a.isCorrect).length

      await supabase
        .from("practice_sessions")
        .update({
          words_attempted: state.attempts.length,
          words_correct: correct,
          words_incorrect: state.attempts.length - correct,
          completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq("id", sessionId)

      // Update streak
      const today = new Date().toISOString().split("T")[0]
      const { data: streak } = await supabase
        .from("daily_streaks")
        .select("*")
        .eq("child_id", childId)
        .single()

      if (streak) {
        const lastDate = streak.last_practice_date
        let newStreak = streak.current_streak

        if (lastDate !== today) {
          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)
          const yesterdayStr = yesterday.toISOString().split("T")[0]

          if (lastDate === yesterdayStr) {
            newStreak = streak.current_streak + 1
          } else {
            newStreak = 1
          }
        }

        const longestStreak = Math.max(newStreak, streak.longest_streak)

        await supabase
          .from("daily_streaks")
          .update({
            current_streak: newStreak,
            longest_streak: longestStreak,
            last_practice_date: today,
          })
          .eq("child_id", childId)

        setStreakCount(newStreak)
      }
    } catch (err) {
      console.error("Failed to complete session:", err)
    }
  }, [sessionId, state.attempts])

  // Handle submit
  function handleSubmit() {
    const currentWord = state.words[state.currentIndex]
    const isCorrect = checkSpelling(state.currentAttempt, currentWord)
    dispatch({ type: "SUBMIT_ATTEMPT", isCorrect })

    const attempt: AttemptRecord = {
      wordId: currentWord.id,
      word: currentWord.word,
      attemptText: state.currentAttempt,
      isCorrect,
      requestedRepronounce: false,
      requestedDefinition: false,
    }
    saveAttempt(attempt)
  }

  // Handle next word
  const handleNext = useCallback(() => {
    dispatch({ type: "NEXT_WORD" })
  }, [])

  // Auto-complete session when all words are done
  useEffect(() => {
    if (state.phase === "complete" && state.attempts.length > 0) {
      completeSession()
    }
  }, [state.phase, state.attempts.length, completeSession])

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-4">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-sboc-yellow" />
          <p className="text-sboc-neutral">Loading words...</p>
        </div>
      </div>
    )
  }

  if (state.words.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-xl font-display font-bold text-sboc-dark">
            No words found
          </p>
          <p className="text-sboc-neutral">
            Try a different word pool or add more words to practice.
          </p>
        </div>
      </div>
    )
  }

  // Session complete
  if (state.phase === "complete") {
    return (
      <SessionSummary attempts={state.attempts} streakCount={streakCount} />
    )
  }

  const currentWord = state.words[state.currentIndex]

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-sboc-neutral">
          <span>
            Word {state.currentIndex + 1} of {state.words.length}
          </span>
          <span>
            {state.score.correct} correct
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-100">
          <div
            className="h-2 rounded-full bg-sboc-yellow transition-all"
            style={{
              width: `${((state.currentIndex + 1) / state.words.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Feedback overlay */}
      {state.phase === "feedback" && (
        <FeedbackOverlay
          isCorrect={
            state.attempts[state.attempts.length - 1]?.isCorrect ?? false
          }
          correctWord={currentWord.word}
          onNext={handleNext}
        />
      )}

      {/* Word display and input */}
      {(state.phase === "listening" || state.phase === "typing") && (
        <div className="space-y-8">
          <WordDisplay word={currentWord} autoPlay={state.phase === "listening"} />

          <SpellingInput
            value={state.currentAttempt}
            onChange={(text) => dispatch({ type: "SET_ATTEMPT", text })}
            onSubmit={handleSubmit}
            disabled={false}
            wordLength={currentWord.word.length}
          />

          <AudioControls
            word={currentWord}
            disabled={false}
            onRepronounce={() => dispatch({ type: "SET_REPRONOUNCE" })}
            onDefinition={() => dispatch({ type: "SET_DEFINITION" })}
          />
        </div>
      )}
    </div>
  )
}
