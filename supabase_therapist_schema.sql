-- Supabase Schema Updates for Therapist Portal

-- 1. Create Therapists Table
CREATE TABLE therapists (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    specialization TEXT,
    profile_image TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for therapists
ALTER TABLE therapists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON therapists FOR SELECT USING (true);
CREATE POLICY "Therapists can update own profile" ON therapists FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own therapist profile" ON therapists FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Create User-Therapist Assignment Table
CREATE TABLE user_therapist_assignment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE, -- A user can have only 1 assigned therapist at a time
    therapist_id UUID REFERENCES therapists(id) NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for assignment
ALTER TABLE user_therapist_assignment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own assignment" ON user_therapist_assignment FOR SELECT USING (auth.uid() = user_id OR auth.uid() = therapist_id);
CREATE POLICY "Users can create their own assignment" ON user_therapist_assignment FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own assignment" ON user_therapist_assignment FOR UPDATE USING (auth.uid() = user_id);

-- 3. Create Therapist Chats Table
CREATE TABLE therapist_chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES auth.users(id) NOT NULL,
    receiver_id UUID REFERENCES auth.users(id) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for chats
ALTER TABLE therapist_chats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own chats" ON therapist_chats FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can insert their own chats" ON therapist_chats FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- 4. Create Therapist Feedback Table
CREATE TABLE therapist_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    therapist_id UUID REFERENCES therapists(id) NOT NULL,
    overall_state TEXT NOT NULL,
    stress_observation TEXT NOT NULL,
    emotional_wellbeing TEXT NOT NULL,
    sleep_observation TEXT NOT NULL,
    engagement_level TEXT NOT NULL,
    therapist_notes TEXT,
    recommendations TEXT,
    followup_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for feedback
ALTER TABLE therapist_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users and therapists can read feedback" ON therapist_feedback FOR SELECT USING (auth.uid() = user_id OR auth.uid() = therapist_id);
CREATE POLICY "Therapists can insert feedback" ON therapist_feedback FOR INSERT WITH CHECK (auth.uid() = therapist_id);

-- Enable Realtime for therapist_chats
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE therapist_chats;
