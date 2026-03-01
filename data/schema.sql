-- ============================================
-- Spelling Bee of Canada — Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. TABLES
-- ============================================

-- Profiles: extends Supabase auth.users
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Child profiles: a parent can have multiple children
CREATE TABLE child_profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  age           INTEGER CHECK (age BETWEEN 6 AND 14),
  category      TEXT NOT NULL CHECK (category IN ('primary', 'junior', 'intermediate')),
  daily_goal    INTEGER DEFAULT 10,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Word progress: mastery status for each word per child
CREATE TABLE word_progress (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id        UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  word_id         INTEGER NOT NULL,
  word            TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'not_started'
                    CHECK (status IN ('not_started', 'learning', 'mastered', 'needs_review')),
  correct_streak  INTEGER DEFAULT 0,
  attempt_count   INTEGER DEFAULT 0,
  correct_count   INTEGER DEFAULT 0,
  last_practiced  TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(child_id, word_id)
);

-- Practice sessions: one record per completed session
CREATE TABLE practice_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id        UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  session_type    TEXT NOT NULL CHECK (session_type IN ('practice', 'review')),
  words_attempted INTEGER NOT NULL DEFAULT 0,
  words_correct   INTEGER NOT NULL DEFAULT 0,
  words_incorrect INTEGER NOT NULL DEFAULT 0,
  duration_secs   INTEGER,
  completed       BOOLEAN DEFAULT FALSE,
  started_at      TIMESTAMPTZ DEFAULT NOW(),
  completed_at    TIMESTAMPTZ
);

-- Session attempts: one record per word attempt within a session
CREATE TABLE session_attempts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
  child_id        UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  word_id         INTEGER NOT NULL,
  word            TEXT NOT NULL,
  attempt_text    TEXT NOT NULL,
  is_correct      BOOLEAN NOT NULL,
  requested_repronounce   BOOLEAN DEFAULT FALSE,
  requested_definition    BOOLEAN DEFAULT FALSE,
  attempted_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Daily streaks: tracks consecutive days practiced
CREATE TABLE daily_streaks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id      UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  current_streak  INTEGER DEFAULT 0,
  longest_streak  INTEGER DEFAULT 0,
  last_practice_date  DATE,
  UNIQUE(child_id)
);

-- ============================================
-- 2. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Profiles: users can only read/write their own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Child profiles: parents can only access their own children
ALTER TABLE child_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view own children"
  ON child_profiles FOR SELECT
  USING (auth.uid() = parent_id);

CREATE POLICY "Parents can insert own children"
  ON child_profiles FOR INSERT
  WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Parents can update own children"
  ON child_profiles FOR UPDATE
  USING (auth.uid() = parent_id);

CREATE POLICY "Parents can delete own children"
  ON child_profiles FOR DELETE
  USING (auth.uid() = parent_id);

-- Word progress: scoped to child's parent
ALTER TABLE word_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parent can view child word progress"
  ON word_progress FOR SELECT
  USING (
    child_id IN (
      SELECT id FROM child_profiles WHERE parent_id = auth.uid()
    )
  );

CREATE POLICY "Parent can insert child word progress"
  ON word_progress FOR INSERT
  WITH CHECK (
    child_id IN (
      SELECT id FROM child_profiles WHERE parent_id = auth.uid()
    )
  );

CREATE POLICY "Parent can update child word progress"
  ON word_progress FOR UPDATE
  USING (
    child_id IN (
      SELECT id FROM child_profiles WHERE parent_id = auth.uid()
    )
  );

-- Practice sessions: scoped to child's parent
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parent can view child sessions"
  ON practice_sessions FOR SELECT
  USING (
    child_id IN (
      SELECT id FROM child_profiles WHERE parent_id = auth.uid()
    )
  );

CREATE POLICY "Parent can insert child sessions"
  ON practice_sessions FOR INSERT
  WITH CHECK (
    child_id IN (
      SELECT id FROM child_profiles WHERE parent_id = auth.uid()
    )
  );

CREATE POLICY "Parent can update child sessions"
  ON practice_sessions FOR UPDATE
  USING (
    child_id IN (
      SELECT id FROM child_profiles WHERE parent_id = auth.uid()
    )
  );

-- Session attempts: scoped to child's parent
ALTER TABLE session_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parent can view child attempts"
  ON session_attempts FOR SELECT
  USING (
    child_id IN (
      SELECT id FROM child_profiles WHERE parent_id = auth.uid()
    )
  );

CREATE POLICY "Parent can insert child attempts"
  ON session_attempts FOR INSERT
  WITH CHECK (
    child_id IN (
      SELECT id FROM child_profiles WHERE parent_id = auth.uid()
    )
  );

-- Daily streaks: scoped to child's parent
ALTER TABLE daily_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parent can view child streaks"
  ON daily_streaks FOR SELECT
  USING (
    child_id IN (
      SELECT id FROM child_profiles WHERE parent_id = auth.uid()
    )
  );

CREATE POLICY "Parent can insert child streaks"
  ON daily_streaks FOR INSERT
  WITH CHECK (
    child_id IN (
      SELECT id FROM child_profiles WHERE parent_id = auth.uid()
    )
  );

CREATE POLICY "Parent can update child streaks"
  ON daily_streaks FOR UPDATE
  USING (
    child_id IN (
      SELECT id FROM child_profiles WHERE parent_id = auth.uid()
    )
  );

-- ============================================
-- 3. TRIGGERS
-- ============================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_word_progress_updated_at
  BEFORE UPDATE ON word_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
