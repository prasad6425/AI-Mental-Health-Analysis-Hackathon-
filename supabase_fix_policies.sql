-- ============================================================
-- Run this SQL in Supabase SQL Editor (New Query)
-- ============================================================

-- 1. Allow therapists to READ their assigned patients' profiles
CREATE POLICY "Therapists can read their assigned patients"
ON users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_therapist_assignment
    WHERE user_therapist_assignment.user_id = users.id
    AND user_therapist_assignment.therapist_id = auth.uid()
  )
);

-- 2. Allow users to read their own profile (skip if already exists)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can read own profile'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can read own profile" ON users FOR SELECT USING (auth.uid() = id)';
  END IF;
END $$;

-- 3. Enable Realtime for therapist_feedback (if not already done)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'therapist_feedback'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE therapist_feedback';
  END IF;
END $$;
