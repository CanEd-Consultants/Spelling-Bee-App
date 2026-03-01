# CLAUDE.md — Spelling Bee of Canada Practice App

> Claude Code reads this file at the start of every session. Follow all rules here precisely.

-----

## Project Overview

A web-based practice and study platform for Spelling Bee of Canada (SBOC) contestants aged 6–14 and their parents. The app helps children study the official word list, practice spelling interactively, and track their progress — all aligned with official SBOC competition rules.

-----

## Project Docs

- See `/docs/PRD.md` for product requirements and user flows
- See `/docs/TECHNICAL_DESIGN.md` for architecture and database schema
- See `/docs/IMPLEMENTATION_PLAN.md` for phased build tasks

-----

## Tech Stack

|Layer          |Choice                                                     |
|---------------|-----------------------------------------------------------|
|Framework      |Next.js 14 (App Router)                                    |
|Language       |TypeScript (strict mode)                                   |
|Styling        |Tailwind CSS + shadcn/ui                                   |
|Database       |Supabase (PostgreSQL)                                      |
|Auth           |Supabase Auth (email/password + magic link)                |
|Storage        |Supabase Storage (for audio files)                         |
|Text-to-Speech |Web Speech API (browser-native, fallback to ElevenLabs API)|
|Deployment     |Vercel                                                     |
|Package Manager|pnpm                                                       |

-----

## Folder Structure

```
/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Auth routes (login, signup)
│   ├── (dashboard)/            # Protected routes
│   │   ├── practice/           # Main practice session UI
│   │   ├── progress/           # Progress tracking
│   │   ├── words/              # Word list browser
│   │   └── settings/           # Account settings
│   ├── api/                    # API route handlers
│   └── layout.tsx
├── components/
│   ├── ui/                     # shadcn/ui primitives
│   ├── practice/               # Practice session components
│   ├── words/                  # Word card, word list components
│   ├── progress/               # Charts, stats components
│   └── layout/                 # Nav, sidebar, header
├── lib/
│   ├── supabase/               # Supabase client + server helpers
│   ├── hooks/                  # Custom React hooks
│   ├── utils/                  # Shared utility functions
│   └── types/                  # TypeScript type definitions
├── data/
│   └── words/                  # Static word list JSON files by category
├── docs/                       # Project planning documents
└── public/                     # Static assets
```

-----

## Coding Conventions

### TypeScript

- Always use strict TypeScript — no `any` types
- Define all data shapes in `/lib/types/index.ts`
- Use Zod for runtime validation on API routes

### Components

- Use named exports for all components
- One component per file
- Props interfaces defined at top of each file
- All interactive components must be client components (`'use client'`)
- Server components by default unless state/effects are needed

### Naming

- Components: `PascalCase` (e.g., `WordCard.tsx`)
- Hooks: `camelCase` prefixed with `use` (e.g., `usePracticeSession.ts`)
- Utilities: `camelCase` (e.g., `formatScore.ts`)
- DB tables: `snake_case` (e.g., `practice_sessions`)
- CSS classes: Tailwind only — no custom CSS files unless absolutely necessary

### Supabase

- Always use the server-side Supabase client for API routes and server components
- Use the browser client only inside `'use client'` components
- Row-level security (RLS) must be enabled on all tables
- Never expose service role key client-side

### Error Handling

- All API routes must return typed error responses
- Use `try/catch` on all async operations
- Show user-friendly error messages — never expose raw error strings

-----

## Design System

### Colors (SBOC Brand)

```
Primary Yellow:  #F5C400   (SBOC brand yellow)
Dark:            #1A1A1A   (text, backgrounds)
White:           #FAFAF5   (off-white backgrounds)
Accent Green:    #22C55E   (correct answers)
Accent Red:      #EF4444   (incorrect answers)
Neutral:         #6B7280   (secondary text)
```

### Typography

- Display/Headings: `Fredoka` (Google Fonts) — playful, child-friendly
- Body: `DM Sans` (Google Fonts) — clean and readable
- Monospace (letters): `JetBrains Mono` — for spelling letter display

### Component Rules

- All buttons must have visible focus states (accessibility)
- Minimum tap target size: 44×44px (mobile-friendly for children)
- Use `shadcn/ui` for all form elements, modals, and toasts
- Animations: subtle, purposeful — use Tailwind `transition` classes

-----

## Age Category Reference

|Category    |Age Range  |Word Count|
|------------|-----------|----------|
|Primary     |6–8 years  |400 words |
|Junior      |9–11 years |TBD       |
|Intermediate|12–14 years|TBD       |


> MVP focuses on Primary category (400 words from 2026 Official Study Guide)

-----

## Key Business Rules

1. A "practice session" presents words one at a time via audio (text-to-speech)
1. The child types or speaks their spelling attempt
1. Homophones must show definition + example sentence (per official rules)
1. Words with capitals must be flagged so child knows to indicate "Capital X"
1. Progress is tracked per word: correct / incorrect / skipped / needs review
1. Parents can view their child's progress but cannot alter practice data
1. All 400 Primary words are available offline via static JSON (no auth required to browse)

-----

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # Server-side only, never expose
ELEVENLABS_API_KEY=              # Optional TTS fallback
```

-----

## Git Conventions

- Branch naming: `feature/`, `fix/`, `chore/`
- Commit style: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`)
- Never commit `.env.local`
- PR descriptions must reference the implementation plan phase

-----

## What NOT to Do

- Do not use `pages/` router — App Router only
- Do not use `any` in TypeScript
- Do not use inline styles — Tailwind only
- Do not store sensitive data in localStorage
- Do not build the organizer/competition-management features in MVP
- Do not build Junior or Intermediate word lists until Primary is complete

-----

## Implementation Status

> Last updated: March 2026

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Foundation & Infrastructure | Done |
| 2 | Authentication & Profiles | Done |
| 3 | Practice Session (Core) | Done |
| 4 | Word List Browser | Done |
| 5 | Progress Dashboard & Review | Done |
| 6 | Spelling Guidelines | Done |
| 7 | Polish & Error Handling | Done |
| 8 | Deployment & Launch | Pending (requires Supabase + Vercel setup) |

### Before deploying:
1. Set up a Supabase project and add credentials to `.env.local`
2. Run `data/schema.sql` in the Supabase SQL Editor to create tables and RLS policies
3. Complete the word list in `data/words/primary-2026.json` (50 sample words included, needs all 400)
4. Connect the GitHub repo to Vercel and add environment variables
5. Verify fonts load correctly on deployed URL (Google Fonts loaded via CDN link)
