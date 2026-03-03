# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A web-based practice and study platform for Spelling Bee of Canada (SBOC) contestants aged 6–14 and their parents. Children study the official word list, practice spelling interactively via text-to-speech, and track progress — aligned with official SBOC competition rules.

See `/docs/PRD.md`, `/docs/TECHNICAL_DESIGN.md`, and `/docs/IMPLEMENTATION_PLAN.md` for detailed specs.

## Development Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server (http://localhost:3000)
pnpm build            # Production build (also serves as type-check)
pnpm lint             # ESLint (next/core-web-vitals config)
```

No test framework is configured. There are no test scripts or test files. Use `pnpm build` to verify TypeScript correctness.

## Tech Stack

Next.js 14 (App Router) · TypeScript (strict) · Tailwind CSS + shadcn/ui · Supabase (PostgreSQL, Auth, Storage) · Web Speech API for TTS · pnpm · Deployed on Vercel

## Architecture

### Routing & Auth Protection

Two route groups under `app/`:
- `(auth)/` — login, signup pages with a centered card layout
- `(dashboard)/` — all protected pages (practice, progress, words, guidelines, settings, onboarding)

**Auth gate**: The `(dashboard)/layout.tsx` server component calls `supabase.auth.getUser()` and redirects to `/login` if unauthenticated, or `/onboarding` if no child profile exists. This is the real auth protection — the middleware refreshes session tokens but does not enforce route protection (known issue: middleware checks for `/(dashboard)` prefix which never matches real URLs).

Auth actions (login, signup, magic link, logout) are Server Actions in `app/(auth)/actions.ts`. Magic link callback is handled by `app/api/auth/callback/route.ts`.

### Supabase Clients (3 variants in `lib/supabase/`)

| File | Usage |
|------|-------|
| `client.ts` | Browser client — use only in `'use client'` components |
| `server.ts` | Server client with cookie handling — use in Server Components and Server Actions |
| `admin.ts` | Service-role client — use for privileged server-side operations only |

### Practice Session Flow

The core feature uses a `useReducer` state machine in `app/(dashboard)/practice/[sessionId]/page.tsx`:

1. **Setup** (`/practice` page): User selects word count and pool type → inserts `practice_sessions` row → redirects to `/practice/{sessionId}?count=N&pool=TYPE`
2. **Session** (`/practice/[sessionId]`): Words loaded from static JSON via `selectWords()`, presented one at a time through phases: `listening` → `typing` → `feedback` → next word or `complete`
3. **Scoring**: `checkSpelling()` (in `lib/utils/check-spelling.ts`) does case-insensitive comparison, also accepts `alternate_spelling`
4. **Persistence**: On each attempt, fire-and-forget async calls UPSERT `word_progress` and INSERT `session_attempts`. On completion, updates `practice_sessions` totals and `daily_streaks`.

Word pool selection strategies (`lib/utils/word-selection.ts`): `all`, `needs_review`, `not_started`, `random_mix` (60% not_started + 30% needs_review + 10% learning)

### Word Data

Static JSON at `data/words/primary-2026.json` — imported at build time, no network request needed. Currently 50 of 400 planned words. Each word has: `id`, `word`, `pronunciation`, `part_of_speech`, `definition`, `example_sentence`, `homophones[]`, `requires_capital`, `capital_letter`, `spelling_rule_tags[]`, optional `alternate_spelling`.

Spelling guidelines in `data/guidelines/spelling-rules.json` — 10 rules with subrules and examples.

### Database Schema

`data/schema.sql` defines 5 tables (all with RLS):
- `profiles` — extends `auth.users`, auto-created by trigger `on_auth_user_created`
- `child_profiles` — child name/age/category per parent (MVP uses only the first child)
- `word_progress` — per-word mastery tracking per child (status: `not_started`/`learning`/`mastered`/`needs_review`)
- `practice_sessions` — one row per session with totals
- `session_attempts` — one row per word attempt within a session
- `daily_streaks` — one row per child tracking current and longest streak

RLS policies scope all data to `auth.uid()` matching the parent chain.

### Data Layer Pattern

There is no service/repository layer. All Supabase queries are inline in page components. The practice session page defines `saveAttempt` and `completeSession` as `useCallback` closures that re-query for user/child on each call.

## Coding Conventions

- **TypeScript**: Strict mode, no `any`. All types in `lib/types/index.ts`. Use Zod for API route validation.
- **Components**: Named exports, one per file, props interfaces at top. Server components by default; add `'use client'` only when state/effects are needed.
- **Naming**: Components `PascalCase`, hooks `useCamelCase`, utilities `camelCase`, DB tables `snake_case`.
- **Styling**: Tailwind only, no custom CSS files. shadcn/ui for form elements, modals, toasts. SBOC brand colors are defined as `sboc-*` in `tailwind.config.ts`.
- **Fonts**: `font-display` (Fredoka), `font-body` (DM Sans), `font-mono` (JetBrains Mono) — loaded via Google Fonts CDN in root layout.
- **Path alias**: `@/*` maps to project root (e.g., `@/lib/utils/cn`, `@/components/ui/button`).
- **Git**: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`). Branch naming: `feature/`, `fix/`, `chore/`.

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| `sboc-yellow` | `#F5C400` | Primary brand color |
| `sboc-dark` | `#1A1A1A` | Text, dark backgrounds |
| `sboc-white` | `#FAFAF5` | Off-white backgrounds |
| `sboc-green` | `#22C55E` | Correct answers |
| `sboc-red` | `#EF4444` | Incorrect answers |
| `sboc-neutral` | `#6B7280` | Secondary text |

Minimum tap target: 44×44px (child-friendly). All buttons need visible focus states.

## Key Business Rules

1. Practice sessions present words via TTS one at a time; child types their spelling
2. Homophones must show definition + example sentence (per SBOC official rules)
3. Words with capitals must be flagged so child knows to indicate "Capital X"
4. Progress tracked per word: correct_streak >= 2 → `mastered`, incorrect → `needs_review`
5. Parents can view but not alter practice data
6. Word list browsing works without auth (static JSON)
7. MVP focuses on Primary category (ages 6–8, 400 words) only

## What NOT to Do

- Do not use `pages/` router — App Router only
- Do not use inline styles — Tailwind only
- Do not store sensitive data in localStorage
- Do not build organizer/competition-management features in MVP
- Do not build Junior or Intermediate word lists until Primary is complete

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Supabase anon key (public)
SUPABASE_SERVICE_ROLE_KEY=       # Server-side only, never expose
ELEVENLABS_API_KEY=              # Optional TTS fallback
```

## Implementation Status

Phases 1–7 (foundation through polish) are complete. Phase 8 (deployment) is pending — requires Supabase project setup, running `data/schema.sql`, completing the word list to 400 words, and Vercel deployment.

## Known Issues

- **Middleware auth check is a no-op**: `middleware.ts` checks `pathname.startsWith("/(dashboard)")` but route group parentheses are stripped from real URLs. Auth protection relies on the dashboard layout's server-side redirect instead.
- **Word list incomplete**: `data/words/primary-2026.json` has 50 of 400 planned words.
- **Zod not installed**: CLAUDE.md convention says to use Zod for API validation, but it is not in `package.json`. Install it before adding validated API routes.
