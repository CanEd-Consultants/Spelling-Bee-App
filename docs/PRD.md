# PRD.md — Product Requirements Document

**Product:** Spelling Bee of Canada — Practice App
**Version:** 1.0 MVP
**Date:** February 2026
**Author:** Ravi
**Status:** Draft

-----

## 1. Problem Statement

Children preparing for the Spelling Bee of Canada have a 400-word official study list, competition rules to understand, and spelling guidelines to learn — but no dedicated digital tool to practice with. Parents sit beside their children reading words aloud from a PDF, which is time-consuming and inconsistent. There is no way to track which words a child has mastered, which ones need more work, or how they're improving over time.

-----

## 2. Goal

Build a focused, child-friendly web app that:

- Reads official SBOC words aloud (simulating a pronouncer)
- Lets children practice spelling interactively
- Tracks progress word-by-word over time
- Gives parents visibility into their child's preparation

-----

## 3. Target Users

### Primary User: The Contestant (Child, ages 6–14)

- Likely uses a tablet or laptop supervised by a parent
- Needs big buttons, clear audio, simple feedback (right/wrong)
- Should feel like a game, not homework
- Attention span is limited — sessions should be completable in 10–20 minutes

### Secondary User: The Parent

- Wants to see how their child is doing without running the sessions themselves
- May set up the account and manage word categories
- Needs a simple dashboard — not a complex analytics tool

-----

## 4. Core Features (MVP)

### 4.1 Word List Browser

- Browse all 400 Primary category words
- Each word shows: spelling, pronunciation guide, part of speech, definition, example sentence, and homophone flags
- Filter by: first letter, mastery status (not started / learning / mastered)
- Search by word
- No login required to browse

### 4.2 Practice Session

The core feature. Simulates the actual spelling bee experience.

**Session Setup:**

- Child (or parent) selects: word count (10 / 25 / 50 / all), word pool (all words / flagged for review / random mix), and difficulty filter (by letter range or custom)

**During Session:**

- Word is announced via text-to-speech (Web Speech API)
- Screen shows only the pronunciation guide (not the spelling)
- If word is a homophone: definition and example sentence auto-appear (per official rules)
- If word has a capital letter: a "Capital letter required" badge appears
- Child types their spelling attempt and hits Enter / Submit
- Immediate feedback: green checkmark (correct) or red X with correct spelling shown
- Child can request: re-pronounce, hear definition, hear example sentence (pre-spelling only, per rules)
- Session ends with a summary screen

**Scoring:**

- Correct on first attempt: ✅ Mastered
- Correct after hearing definition/re-pronounce: ⭐ Learned
- Incorrect: ❌ Needs Review (auto-added to review queue)

### 4.3 Progress Tracking

- Words categorized into three buckets: Not Started, Learning, Mastered
- Progress bar: X of 400 words mastered
- Streak counter: consecutive days practiced
- Recent session history (last 10 sessions with date, words attempted, score)
- "Weak words" list: words missed 2+ times

### 4.4 Review Mode

- Focused practice on words marked "Needs Review"
- Same interface as Practice Session but pulls only from the review queue
- After 2 consecutive correct answers, word graduates to "Learning"

### 4.5 Spelling Guidelines Reference

- Interactive guide to all 10 spelling rules from the official study guide
- Each rule has examples pulled directly from the word list
- Child can click any example word to jump to its full word card

### 4.6 Parent Dashboard

- Parent creates an account and adds their child's profile
- Sees child's overall progress (% mastered, current streak, last active)
- Sees word-level detail: which words are mastered vs. struggling
- Cannot modify practice data — read-only view
- Can set a "daily goal" (e.g., practice 10 words per day)

### 4.7 Account & Auth

- Parent signs up with email/password
- Adds child profile(s) (name, age category)
- Child does not need their own login — they use the parent's account
- Magic link login option for parents

-----

## 5. Out of Scope (MVP)

- Junior and Intermediate word lists (future phases)
- Competition management / organizer tools
- Live multiplayer spelling battles
- Mobile native app (iOS/Android)
- Speech recognition (child speaks spelling aloud) — complex, future feature
- Essay contest or Unsung Hero nomination features
- Leaderboards or social features

-----

## 6. User Flows

### Flow 1: First-Time Setup (Parent)

```
Land on homepage
  → Click "Get Started Free"
  → Sign up with email
  → Verify email
  → Add child profile (name, age, category: Primary)
  → See dashboard with 0% progress
  → Click "Start Practicing" → go to Practice Session setup
```

### Flow 2: Daily Practice Session (Child)

```
Parent opens app, selects child profile
  → Child clicks "Practice"
  → Selects session size (e.g., 25 words)
  → Session begins — word is read aloud
  → Child types spelling → submits
  → Feedback shown (correct/incorrect)
  → Next word plays automatically after 1.5 seconds
  → After final word: Summary screen shown
    (Score: 20/25, Words to review: 5, Streak: 3 days)
  → Child clicks "Done" → returns to dashboard
```

### Flow 3: Review Weak Words

```
Dashboard shows "5 words need review" badge
  → Click "Review Now"
  → Review session starts — only pulls flagged words
  → Same practice interface
  → Word marked correct twice → removed from review queue
  → Session ends → progress updated
```

### Flow 4: Parent Checks Progress

```
Parent logs in
  → Sees child dashboard
  → Clicks "View All Words"
  → Sees word list with mastery status icons
  → Clicks a word → sees full word detail + attempt history
  → Sets daily goal reminder
```

### Flow 5: Browse Word List (No Login)

```
Visit /words
  → See full list of 400 Primary words
  → Click any word → see definition, pronunciation, sentence
  → Prompted to sign up to track progress
```

-----

## 7. Content Requirements

All content is sourced from the **Official SBOC Primary Study Guide 2026 Edition**:

- 400 words with: pronunciation, part of speech, definition, example sentence
- Homophone flags (e.g., bailey/bailee/bailie, heal/heel/he'll)
- Capital letter flags (e.g., Ontario, Olympic, Stetson, Monday–Friday, December)
- 10 spelling guideline rules
- This content must be structured as JSON in `/data/words/primary-2026.json`

-----

## 8. Non-Functional Requirements

|Requirement           |Target                                                  |
|----------------------|--------------------------------------------------------|
|Page load time        |< 2 seconds (LCP)                                       |
|Audio playback latency|< 500ms after word display                              |
|Mobile responsiveness |Works on tablet (768px+) and desktop                    |
|Accessibility         |WCAG 2.1 AA — keyboard navigable, screen reader friendly|
|Uptime                |99.5% (Vercel + Supabase SLA)                           |
|Data privacy          |No child PII stored beyond name and age category        |

-----

## 9. Success Metrics (Post-Launch)

- 70%+ of registered children complete at least one practice session per week
- Average session length: 10–15 minutes
- 50+ words mastered per child after 4 weeks of use
- Parent satisfaction: "I can see exactly where my child needs help"
