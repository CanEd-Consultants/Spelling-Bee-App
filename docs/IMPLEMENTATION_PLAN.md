# IMPLEMENTATION_PLAN.md — Phased Build Plan

**Product:** Spelling Bee of Canada — Practice App
**Stack:** Next.js 14 + Supabase + Tailwind CSS

> Work through one phase at a time with Claude Code. Complete and review each phase before starting the next. Each task should be a single Claude Code instruction.

-----

## Phase 1: Project Foundation & Infrastructure

**Goal:** Working Next.js project, connected to Supabase, deployed to Vercel, with design system in place.
**Estimated time:** 1–2 days

### Tasks

**1.1 — Scaffold Next.js project**

```
Create a new Next.js 14 project with TypeScript, Tailwind CSS, App Router,
and pnpm. Install shadcn/ui and initialize it. Set up the folder structure
exactly as defined in CLAUDE.md.
```

**1.2 — Configure fonts and design tokens**

```
Install and configure Google Fonts: Fredoka (display), DM Sans (body),
JetBrains Mono (monospace). Set up Tailwind theme extension with SBOC brand
colors as defined in CLAUDE.md. Create a globals.css with CSS custom properties.
```

**1.3 — Set up Supabase project**

```
Create Supabase client helpers for both server (createServerClient) and browser
(createBrowserClient) using @supabase/ssr. Set up .env.local with the required
environment variables. Create a middleware.ts to handle session refresh on
every request.
```

**1.4 — Create database schema**

```
Write and run the full SQL schema from TECHNICAL_DESIGN.md in Supabase:
tables for profiles, child_profiles, word_progress, practice_sessions,
session_attempts, and daily_streaks. Enable RLS on all tables and add
the policies defined in the design doc.
```

**1.5 — Seed the word list JSON**

```
Create /data/words/primary-2026.json with all 400 words from the 2026
Official SBOC Primary Study Guide. Each entry must include: id, word,
pronunciation, part_of_speech, definition, example_sentence, homophones
(array), requires_capital (boolean), capital_letter (string or null),
spelling_rule_tags (array). Flag all words that appear in the homophone
brackets in the study guide. Flag all proper nouns (Ontario, Olympic,
Stetson, Monday, Friday, Thursday, December, Canary, Gander, etc.)
with requires_capital: true.
```

**1.6 — Create TypeScript types**

```
Create /lib/types/index.ts with all TypeScript interfaces: Word,
ChildProfile, ParentProfile, PracticeSession, SessionAttempt,
WordProgress, MasteryStatus, SessionConfig, SessionState.
```

**1.7 — Deploy to Vercel**

```
Connect the GitHub repository to Vercel. Add all environment variables
to Vercel project settings. Confirm the main branch deploys successfully
with a working URL.
```

-----

## Phase 2: Authentication & Profiles

**Goal:** Parents can sign up, log in, and add child profiles.
**Estimated time:** 1–2 days

### Tasks

**2.1 — Auth layout and pages**

```
Create the (auth) route group with a clean, centered layout. Build the
login page with email/password form and magic link option. Build the
signup page with email/password form. Use shadcn/ui Input, Button,
and Label components. Style with SBOC brand colors.
```

**2.2 — Supabase Auth integration**

```
Wire up the login and signup forms to Supabase Auth. On successful signup,
create a record in the profiles table using a Supabase database trigger
(handle_new_user). Redirect authenticated users to /dashboard on login.
```

**2.3 — Child profile setup flow**

```
After first login, if a parent has no child profiles, redirect them to an
onboarding screen: "Add your child's profile". Build a form with: child's
name, age (number picker 6–14), and auto-selected category (Primary 6-8,
Junior 9-11, Intermediate 12-14). On submit, create a child_profiles record
and a daily_streaks record. Redirect to dashboard.
```

**2.4 — Dashboard layout with sidebar**

```
Create the (dashboard) layout with a responsive sidebar. Sidebar shows:
SBOC logo, child's name + category badge, nav links (Practice, My Words,
Progress, Spelling Rules), and a logout button. Header shows current page
title and streak badge. Protected by middleware — redirect to /login if
no session.
```

**2.5 — Parent dashboard home page**

```
Build the main dashboard page. Show: child's name and category, overall
progress bar (X of 400 words mastered), current streak (days), daily goal
progress (e.g., "8 of 10 words today"), and a prominent "Start Practicing"
button. If no sessions yet, show a friendly empty state with a call to action.
```

-----

## Phase 3: Core Feature — Practice Session

**Goal:** The complete interactive practice session experience.
**Estimated time:** 3–4 days

### Tasks

**3.1 — Session setup screen**

```
Build /practice page with session configuration options:
- Word count selector (10 words, 25 words, 50 words, All 400)
- Word pool selector (All words, Needs Review, Not Started, Random Mix)
- A "Start Session" button that creates a practice_sessions record
  in Supabase and redirects to /practice/[sessionId]
```

**3.2 — Word selection logic**

```
Create a server-side utility function that takes session config and child
word_progress data, and returns an ordered array of Word objects for the
session. For 'Needs Review' pool: filter word_progress by status='needs_review'.
For 'Not Started': filter by status='not_started'. For 'Random Mix':
weighted random (60% not started, 30% needs review, 10% learning).
Shuffle the final array.
```

**3.3 — Practice session page shell**

```
Build /practice/[sessionId]/page.tsx. This is a client component
('use client'). Initialize useReducer with SessionState. Show a progress
bar at top (e.g., "Word 3 of 25"). Handle the session phases: 'listening',
'typing', 'feedback', 'complete'.
```

**3.4 — Text-to-speech hook**

```
Create /lib/hooks/useSpeech.ts. Implement Web Speech API with:
speak(text, rate, lang), stop(), and isSupported boolean.
Set default rate to 0.85, lang to 'en-CA'. If speechSynthesis is
not available, set isSupported to false (UI will show text fallback).
```

**3.5 — WordDisplay component**

```
Build the WordDisplay component shown during 'listening' phase.
Shows: pronunciation guide in large monospace font, a speaker icon
button (plays the word again), part of speech badge.
If word.homophones.length > 0: show definition and example sentence
automatically (required by SBOC rules — homophones must always show definition).
If word.requires_capital: show a yellow "Capital letter required" badge.
Auto-play the word via useSpeech when component mounts.
```

**3.6 — SpellingInput component**

```
Build the SpellingInput component shown during 'typing' phase.
A large text input centered on screen with placeholder "Type your spelling...".
Submit button and Enter key both trigger submission.
Input should auto-focus when phase changes to 'typing'.
Show character count if word is longer than 8 letters.
Disable input during 'feedback' phase.
```

**3.7 — AudioControls component**

```
Build AudioControls shown below the word during 'listening' and 'typing' phases.
Three buttons:
- "Hear Word Again" → calls speak(word.word), logs requested_repronounce=true
- "Hear Definition" → calls speak(word.definition), logs requested_definition=true
- "Hear Example" → calls speak(word.example_sentence)
Buttons are disabled after child submits their spelling attempt
(per official SBOC rules — no help after spelling begins...
note: keep buttons available until submit for usability with young children).
```

**3.8 — Answer checking and feedback**

```
Create a utility function checkSpelling(attempt: string, word: Word): boolean.
Must handle: case-insensitive comparison, trimming whitespace.
If word.requires_capital: the answer is correct regardless of capitalisation
(the oral competition requires saying "Capital X" — but typed input
accepts any capitalisation).
If word.homophones.length > 0: only the primary word spelling is accepted
(per rules: spell the word as defined, not a homophone).
If the word has an alternate_spelling field: accept that too.

Build FeedbackOverlay component:
- Correct: green background, checkmark icon, "Correct! ✓", word displayed in green
- Incorrect: red background, X icon, "The correct spelling is: [word]"
- Auto-advances to next word after 2 seconds
```

**3.9 — Session state persistence**

```
After each attempt, call POST /api/sessions/[id]/attempt to save the
attempt to Supabase. Also update word_progress: increment attempt_count,
correct_count. Update status logic:
- 2+ consecutive correct → 'mastered'
- 1 correct after 'needs_review' → 'learning'
- incorrect → 'needs_review', reset correct_streak to 0
Update daily_streaks if this is the first session today.
```

**3.10 — Session summary screen**

```
Build the SessionSummary component shown when all words are complete.
Show: score (e.g., "20 out of 25 correct"), percentage with colour coding,
list of incorrect words with correct spellings shown,
streak update ("🔥 3 day streak!"),
two buttons: "Practice Again" and "Back to Dashboard".
Call POST /api/sessions/[id]/complete to mark session done.
```

-----

## Phase 4: Word List Browser

**Goal:** A beautiful, browsable view of all 400 words with mastery status.
**Estimated time:** 1–2 days

### Tasks

**4.1 — Word list page**

```
Build /words page. Load primary-2026.json as a static import.
If user is authenticated, fetch word_progress for the current child
and merge mastery status into each word. Show a grid of WordPreviewCards.
Show total count and filter summary at top.
Public access (no auth required) — show words without mastery status.
```

**4.2 — Filters and search**

```
Add filter controls above the word grid:
- Search input: filters words by word string in real-time (client-side)
- Letter filter: A–Z buttons to filter by first letter
- Status filter (auth only): All / Not Started / Learning / Mastered / Needs Review
Use URL searchParams to persist filter state (shareable URLs).
```

**4.3 — WordPreviewCard component**

```
Build a card showing: word (large, Fredoka font), pronunciation (small, muted),
mastery status icon (●/★/✓/⚠ for not started/learning/mastered/needs review),
homophone badge if applicable, capital badge if applicable.
Clicking card navigates to /words/[word].
```

**4.4 — WordDetail page**

```
Build /words/[word]/page.tsx.
Show: word in large display font, pronunciation guide, part of speech,
full definition, example sentence in a styled blockquote,
homophones list (if any) with a warning callout,
capital letter notice (if required),
mastery status card with attempt stats (auth only),
"Practice This Word" button that starts a 1-word session.
```

-----

## Phase 5: Progress Dashboard & Review Mode

**Goal:** Parents and children can see clear progress; review mode targets weak words.
**Estimated time:** 1–2 days

### Tasks

**5.1 — Progress dashboard page**

```
Build /progress page.
Show:
- Mastery donut chart: 4 segments (not started, learning, mastered, needs review)
  built with CSS or a lightweight chart library
- "Words by the numbers": total mastered, total needs review, total not started
- Current streak and longest streak
- Weekly practice activity (7-day bar chart of words practiced per day)
```

**5.2 — Session history list**

```
Below the charts, show last 10 sessions:
each row shows date, session type (practice/review),
score (X/Y correct), duration.
Click a session to expand and see individual word attempts.
```

**5.3 — Weak words list**

```
"Words That Need Work" section: list all words with status='needs_review',
sorted by most incorrect attempts first.
Each row shows: word, attempt count, last practiced date,
"Practice Now" button that starts a review session with just that word.
```

**5.4 — Review mode session**

```
Build Review Mode: same interface as Practice Session (Phase 3)
but word pool is filtered to status='needs_review'.
After 2 consecutive correct answers on a word,
update status from 'needs_review' to 'learning'.
Show "All caught up! No words in review queue" if queue is empty.
```

-----

## Phase 6: Spelling Guidelines Reference

**Goal:** Interactive, linked reference to all 10 official SBOC spelling rules.
**Estimated time:** 1 day

### Tasks

**6.1 — Spelling guidelines data**

```
Create /data/guidelines/spelling-rules.json with all 10 rules
from the SBOC study guide. Each rule includes: id, title, summary,
subrules (with description, examples, exceptions), and word_list_examples
(array of word IDs from primary-2026.json that illustrate the rule).
```

**6.2 — Guidelines browser page**

```
Build /guidelines page listing all 10 rules as expandable RuleCards.
Each card shows rule title and summary, with click-to-expand for full details.
Show examples as styled word chips that link to /words/[word].
Tag words in the word list JSON with their relevant rule IDs
(e.g., "beginning" → rule 1a, "cancellation" → rule 1b).
```

-----

## Phase 7: Polish, Error Handling & Accessibility

**Goal:** Production-ready quality — handles edge cases, works for all users.
**Estimated time:** 2 days

### Tasks

**7.1 — Loading states**

```
Add skeleton loading states to: word list page, progress dashboard,
session summary. Use shadcn/ui Skeleton component.
All data fetching should show a loading state within 100ms.
```

**7.2 — Error boundaries and fallbacks**

```
Add error.tsx files to key route segments.
Handle: Supabase connection errors (show retry button),
speech synthesis not supported (show "Audio not available" banner
with text-only mode), empty states for all lists and dashboards.
```

**7.3 — Accessibility audit**

```
Ensure all interactive elements are keyboard navigable (Tab, Enter, Space).
Add aria-labels to icon buttons. Ensure colour contrast meets WCAG AA.
Test with screen reader (VoiceOver on Mac).
Add skip-to-main-content link in layout.
Minimum 44×44px tap targets on all buttons.
```

**7.4 — Mobile responsiveness**

```
Test and fix layout on: 768px (tablet), 375px (small phone —
though tablet is the primary mobile target).
Practice session should work well on iPad.
Sidebar collapses to bottom nav on small screens.
```

**7.5 — Toast notifications**

```
Add shadcn/ui Toaster to layout. Show toasts for:
session saved successfully, word progress updated,
streak updated ("🔥 You're on a 3-day streak!"),
network errors with retry prompts.
```

-----

## Phase 8: Deployment & Launch

**Goal:** App is live, tested, and ready for real users.
**Estimated time:** 1 day

### Tasks

**8.1 — Environment and secrets audit**

```
Verify all environment variables are set in Vercel production.
Confirm SUPABASE_SERVICE_ROLE_KEY is never exposed client-side.
Check that all Supabase RLS policies are active in production.
```

**8.2 — Performance check**

```
Run Lighthouse on: homepage, word list page, practice session page.
Target: LCP < 2s, CLS < 0.1, FID < 100ms.
Verify fonts load with display:swap.
Check bundle size — should be under 150kb first load JS.
```

**8.3 — Final QA checklist**

```
Test full user journey: signup → add child → practice session →
view progress → review mode → browse word list → spelling guidelines.
Test on: Chrome, Safari, Firefox, Edge.
Test speech synthesis on each browser (Chrome and Safari support it best).
Verify that all 400 words load correctly in the word list.
```

**8.4 — Custom domain (optional)**

```
Connect a custom domain to Vercel project.
Set up www redirect to apex domain.
Verify SSL certificate is active.
```

-----

## Summary Timeline

|Phase    |Feature                        |Est. Days     |
|---------|-------------------------------|--------------|
|1        |Foundation & Infrastructure    |1–2           |
|2        |Auth & Profiles                |1–2           |
|3        |Practice Session (Core Feature)|3–4           |
|4        |Word List Browser              |1–2           |
|5        |Progress & Review Mode         |1–2           |
|6        |Spelling Guidelines            |1             |
|7        |Polish & Accessibility         |2             |
|8        |Deployment                     |1             |
|**Total**|                               |**11–16 days**|

-----

## How to Use This With Claude Code

Start each work session by saying:

> "I'm working on Phase [X], Task [X.X]: [task title].
> Refer to CLAUDE.md for conventions and TECHNICAL_DESIGN.md for
> schema and component structure."

Then paste the task description. Work one task at a time.
Review the output before moving to the next task.
