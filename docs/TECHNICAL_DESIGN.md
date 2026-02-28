# TECHNICAL_DESIGN.md — Technical Design Document

**Product:** Spelling Bee of Canada — Practice App
**Stack:** Next.js 14 + Supabase + Tailwind CSS
**Version:** 1.0 MVP

-----

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                  Vercel (CDN + Edge)             │
│                                                  │
│   ┌──────────────────────────────────────────┐  │
│   │         Next.js 14 App Router            │  │
│   │                                          │  │
│   │  ┌─────────────┐  ┌──────────────────┐  │  │
│   │  │ Server      │  │ Client           │  │  │
│   │  │ Components  │  │ Components       │  │  │
│   │  │ (RSC)       │  │ ('use client')   │  │  │
│   │  └──────┬──────┘  └────────┬─────────┘  │  │
│   │         │                  │             │  │
│   │  ┌──────▼──────────────────▼─────────┐  │  │
│   │  │        API Route Handlers          │  │  │
│   │  │   /api/sessions  /api/progress     │  │  │
│   │  └──────────────────┬────────────────┘  │  │
│   └─────────────────────┼────────────────────┘  │
└─────────────────────────┼───────────────────────┘
                          │
┌─────────────────────────▼───────────────────────┐
│                   Supabase                       │
│                                                  │
│   ┌─────────────┐   ┌────────────────────────┐  │
│   │  Auth       │   │  PostgreSQL Database   │  │
│   │  (email,    │   │  (RLS enabled)         │  │
│   │  magic link)│   │                        │  │
│   └─────────────┘   └────────────────────────┘  │
└─────────────────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────┐
│           Static Data (No DB needed)            │
│   /data/words/primary-2026.json                 │
│   /data/guidelines/spelling-rules.json          │
└─────────────────────────────────────────────────┘
```

**Key architectural decisions:**

- Word list data is **static JSON** — no database reads needed for browsing. Fast, free, works without auth.
- Only user-specific data (progress, sessions, profiles) goes to Supabase.
- Text-to-speech uses **Web Speech API** (browser-native, zero cost). ElevenLabs as optional fallback for higher quality.
- No separate backend server — Next.js API routes handle all server logic.

-----

## 2. Database Schema

### Table: `profiles`

Extends Supabase auth.users. One record per parent account.

```sql
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### Table: `child_profiles`

A parent can have multiple children.

```sql
CREATE TABLE child_profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  age           INTEGER CHECK (age BETWEEN 6 AND 14),
  category      TEXT NOT NULL CHECK (category IN ('primary', 'junior', 'intermediate')),
  daily_goal    INTEGER DEFAULT 10,   -- words per day
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### Table: `word_progress`

Tracks mastery status for each word per child.

```sql
CREATE TABLE word_progress (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id        UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  word_id         INTEGER NOT NULL,         -- matches id in primary-2026.json
  word            TEXT NOT NULL,            -- denormalized for easy querying
  status          TEXT NOT NULL DEFAULT 'not_started'
                    CHECK (status IN ('not_started', 'learning', 'mastered', 'needs_review')),
  correct_streak  INTEGER DEFAULT 0,        -- consecutive correct answers
  attempt_count   INTEGER DEFAULT 0,
  correct_count   INTEGER DEFAULT 0,
  last_practiced  TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(child_id, word_id)
);
```

### Table: `practice_sessions`

One record per completed practice session.

```sql
CREATE TABLE practice_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id        UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  session_type    TEXT NOT NULL CHECK (session_type IN ('practice', 'review')),
  words_attempted INTEGER NOT NULL DEFAULT 0,
  words_correct   INTEGER NOT NULL DEFAULT 0,
  words_incorrect INTEGER NOT NULL DEFAULT 0,
  duration_secs   INTEGER,                  -- session duration in seconds
  completed       BOOLEAN DEFAULT FALSE,
  started_at      TIMESTAMPTZ DEFAULT NOW(),
  completed_at    TIMESTAMPTZ
);
```

### Table: `session_attempts`

One record per word attempt within a session.

```sql
CREATE TABLE session_attempts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
  child_id        UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  word_id         INTEGER NOT NULL,
  word            TEXT NOT NULL,
  attempt_text    TEXT NOT NULL,            -- what the child typed
  is_correct      BOOLEAN NOT NULL,
  requested_repronounce   BOOLEAN DEFAULT FALSE,
  requested_definition    BOOLEAN DEFAULT FALSE,
  attempted_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### Table: `daily_streaks`

Tracks consecutive days practiced for streak counter.

```sql
CREATE TABLE daily_streaks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id      UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  current_streak  INTEGER DEFAULT 0,
  longest_streak  INTEGER DEFAULT 0,
  last_practice_date  DATE,
  UNIQUE(child_id)
);
```

-----

## 3. Row Level Security (RLS) Policies

```sql
-- Profiles: users can only read/write their own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own profile only" ON profiles
  USING (auth.uid() = id);

-- Child profiles: parents can only access their own children
ALTER TABLE child_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parent owns children" ON child_profiles
  USING (auth.uid() = parent_id);

-- Word progress: scoped to child's parent
ALTER TABLE word_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parent accesses child progress" ON word_progress
  USING (
    child_id IN (
      SELECT id FROM child_profiles WHERE parent_id = auth.uid()
    )
  );

-- Same pattern for practice_sessions, session_attempts, daily_streaks
```

-----

## 4. Static Data Structure

### `/data/words/primary-2026.json`

```json
[
  {
    "id": 1,
    "word": "abandon",
    "pronunciation": "uh-ban-duhn",
    "part_of_speech": "v",
    "definition": "To give up on or to leave.",
    "example_sentence": "When our rowboat sprung a leak, we decided to abandon it.",
    "homophones": [],
    "requires_capital": false,
    "capital_letter": null,
    "spelling_rule_tags": []
  },
  {
    "id": 17,
    "word": "bailey",
    "pronunciation": "bay-lee",
    "part_of_speech": "n",
    "definition": "The courtyard surrounding a castle, within the protective walls.",
    "example_sentence": "The bailey housed essential buildings such as stables and kitchens.",
    "homophones": ["bailee", "bailie"],
    "requires_capital": false,
    "capital_letter": null,
    "spelling_rule_tags": []
  },
  {
    "id": 45,
    "word": "canary",
    "pronunciation": "kuh-nair-ee",
    "part_of_speech": "n",
    "definition": "A yellow songbird.",
    "example_sentence": "Although the canary is a wild bird, it is sometimes kept as a pet.",
    "homophones": ["Canary"],
    "requires_capital": false,
    "capital_letter": null,
    "spelling_rule_tags": []
  },
  {
    "id": 264,
    "word": "Ontario",
    "pronunciation": "on-tair-ee-oh",
    "part_of_speech": "n",
    "definition": "A province in Canada.",
    "example_sentence": "The capital of Ontario is Toronto.",
    "homophones": [],
    "requires_capital": true,
    "capital_letter": "O",
    "spelling_rule_tags": []
  }
]
```

### `/data/guidelines/spelling-rules.json`

```json
[
  {
    "id": 1,
    "title": "Final Consonant Doubled",
    "summary": "A word ending in a single consonant preceded by a single vowel doubles the consonant before a vowel suffix.",
    "rules": [
      {
        "subrule": "a",
        "description": "One syllable words or words accented on the final syllable double the final consonant.",
        "examples": ["plan→planning", "refer→referring", "commit→committing"],
        "exceptions": ["devil→devilish", "benefit→benefited"]
      },
      {
        "subrule": "b",
        "description": "Words ending in L usually double before a suffix.",
        "examples": ["cancel→cancellation"]
      }
    ],
    "word_list_examples": [22, 334]
  }
]
```

-----

## 5. API Routes

```
POST   /api/sessions/start          Create new practice session
POST   /api/sessions/[id]/attempt   Record a word attempt
POST   /api/sessions/[id]/complete  Mark session as complete
GET    /api/progress/[childId]      Get overall progress summary
GET    /api/progress/[childId]/words Get word-level mastery data
POST   /api/progress/[childId]/words Update word mastery status
GET    /api/children                Get all child profiles for parent
POST   /api/children                Create child profile
PATCH  /api/children/[id]           Update child profile
```

-----

## 6. Key Component Tree

```
app/
├── (auth)/
│   ├── login/page.tsx              → LoginForm
│   └── signup/page.tsx             → SignupForm, ChildProfileSetup
│
├── (dashboard)/
│   ├── layout.tsx                  → DashboardLayout (Sidebar + Header)
│   │
│   ├── page.tsx                    → ParentDashboard
│   │   ├── ChildProgressCard       → per child summary
│   │   ├── StreakBadge
│   │   └── DailyGoalProgress
│   │
│   ├── practice/
│   │   ├── page.tsx                → SessionSetup (word count, pool)
│   │   └── [sessionId]/page.tsx    → PracticeSession
│   │       ├── WordDisplay         → shows pronunciation, homophone flag
│   │       ├── SpellingInput       → text input + submit
│   │       ├── AudioControls       → re-pronounce, definition, sentence
│   │       ├── FeedbackOverlay     → correct/incorrect animation
│   │       └── SessionSummary      → end-of-session results
│   │
│   ├── words/
│   │   ├── page.tsx                → WordListBrowser
│   │   │   ├── WordSearchBar
│   │   │   ├── WordFilter          → by letter, status
│   │   │   └── WordGrid            → list of WordPreviewCard
│   │   └── [word]/page.tsx         → WordDetail
│   │       ├── WordHeader          → word, pronunciation, POS
│   │       ├── WordDefinition
│   │       ├── HomophoneAlert
│   │       └── MasteryStatus
│   │
│   ├── progress/
│   │   └── page.tsx                → ProgressDashboard
│   │       ├── MasteryDonut        → not started / learning / mastered
│   │       ├── WeakWordsList
│   │       └── SessionHistory
│   │
│   └── guidelines/
│       └── page.tsx                → SpellingGuidelinesBrowser
│           ├── RuleCard            → expandable rule with examples
│           └── ExampleWordLink     → links to WordDetail
```

-----

## 7. Text-to-Speech Strategy

```typescript
// lib/hooks/useSpeech.ts

// Priority 1: Web Speech API (free, built-in)
const speak = (text: string, options?: SpeechOptions) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;    // slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.lang = 'en-CA'; // Canadian English
    window.speechSynthesis.speak(utterance);
    return;
  }
  // Priority 2: ElevenLabs API (if env var present)
  // Falls back to showing pronunciation guide text only
};
```

**Pronouncer script pattern (matches official rules):**

- Say word once normally
- Pause 1.5 seconds
- Child types
- If child requests: say word again, or say definition + example

-----

## 8. State Management

No global state library needed. Use:

- **React Server Components** for initial data fetching
- **URL state** (searchParams) for filters and navigation
- **React useState/useReducer** for practice session state
- **Supabase Realtime** (optional, future) for live parent dashboard updates

### Practice Session State (useReducer)

```typescript
type SessionState = {
  sessionId: string;
  words: Word[];
  currentIndex: number;
  currentAttempt: string;
  phase: 'listening' | 'typing' | 'feedback' | 'complete';
  attempts: AttemptRecord[];
  score: { correct: number; incorrect: number };
};
```

-----

## 9. Authentication Flow

```
Parent visits app
  → Supabase Auth (email/password or magic link)
  → On login: fetch profile + child_profiles
  → Store session via Supabase SSR helpers (cookie-based)
  → Middleware protects all /dashboard/* routes
  → API routes verify session via createServerClient()
```

Word list browsing at `/words` is **public** — no auth required.

-----

## 10. Performance Considerations

- Word list JSON (~400 words) is loaded as a static import — no API call needed
- Practice sessions use optimistic UI — update local state immediately, sync to DB in background
- Images: none in MVP (text-only UI)
- Fonts: loaded via `next/font` with `display: swap`
- Bundle: shadcn/ui components are tree-shaken automatically
