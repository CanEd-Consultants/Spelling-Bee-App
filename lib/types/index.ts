// ============================================
// Word Data Types (Static JSON)
// ============================================

export interface Word {
  id: number
  word: string
  pronunciation: string
  part_of_speech: string
  definition: string
  example_sentence: string
  homophones: string[]
  requires_capital: boolean
  capital_letter: string | null
  spelling_rule_tags: string[]
  alternate_spelling?: string
}

// ============================================
// User & Profile Types
// ============================================

export type AgeCategory = "primary" | "junior" | "intermediate"

export interface ParentProfile {
  id: string
  email: string
  full_name: string | null
  created_at: string
  updated_at: string
}

export interface ChildProfile {
  id: string
  parent_id: string
  name: string
  age: number
  category: AgeCategory
  daily_goal: number
  created_at: string
}

// ============================================
// Progress Tracking Types
// ============================================

export type MasteryStatus = "not_started" | "learning" | "mastered" | "needs_review"

export interface WordProgress {
  id: string
  child_id: string
  word_id: number
  word: string
  status: MasteryStatus
  correct_streak: number
  attempt_count: number
  correct_count: number
  last_practiced: string | null
  created_at: string
  updated_at: string
}

// ============================================
// Practice Session Types
// ============================================

export type SessionType = "practice" | "review"

export interface PracticeSession {
  id: string
  child_id: string
  session_type: SessionType
  words_attempted: number
  words_correct: number
  words_incorrect: number
  duration_secs: number | null
  completed: boolean
  started_at: string
  completed_at: string | null
}

export interface SessionAttempt {
  id: string
  session_id: string
  child_id: string
  word_id: number
  word: string
  attempt_text: string
  is_correct: boolean
  requested_repronounce: boolean
  requested_definition: boolean
  attempted_at: string
}

// ============================================
// Streak Types
// ============================================

export interface DailyStreak {
  id: string
  child_id: string
  current_streak: number
  longest_streak: number
  last_practice_date: string | null
}

// ============================================
// Session Config & State Types (Client-side)
// ============================================

export type WordPool = "all" | "needs_review" | "not_started" | "random_mix"

export interface SessionConfig {
  wordCount: number
  wordPool: WordPool
  sessionType: SessionType
}

export type SessionPhase = "listening" | "typing" | "feedback" | "complete"

export interface AttemptRecord {
  wordId: number
  word: string
  attemptText: string
  isCorrect: boolean
  requestedRepronounce: boolean
  requestedDefinition: boolean
}

export interface SessionState {
  sessionId: string
  words: Word[]
  currentIndex: number
  currentAttempt: string
  phase: SessionPhase
  attempts: AttemptRecord[]
  score: {
    correct: number
    incorrect: number
  }
}

// ============================================
// Spelling Guidelines Types
// ============================================

export interface SpellingSubrule {
  subrule: string
  description: string
  examples: string[]
  exceptions?: string[]
}

export interface SpellingRule {
  id: number
  title: string
  summary: string
  rules: SpellingSubrule[]
  word_list_examples: number[]
}
