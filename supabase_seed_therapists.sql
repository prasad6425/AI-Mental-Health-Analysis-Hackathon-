-- =====================================================
-- SEED THERAPIST ACCOUNTS (Run this AFTER the schema)
-- This creates Supabase Auth + therapists table entries
-- =====================================================

-- Step 1: Create auth users for each therapist
-- (Run this in the Supabase SQL Editor)

SELECT supabase_auth.create_user(
  '{"email": "sarah.mitchell@mindwell.com", "password": "Therapist@123", "email_confirmed": true}'::jsonb
);

-- NOTE: Supabase does not allow bulk auth user creation via plain SQL.
-- Use the script below in the SQL Editor instead:

-- Insert directly into therapists table AFTER you create
-- the auth users via the Admin API or Supabase Dashboard.

-- =====================================================
-- SIMPLER APPROACH: Use this single SQL block
-- It inserts into therapists using a known UUID approach.
-- You must create Auth users via Dashboard or use this SQL:
-- =====================================================

-- Create all 10 therapist auth accounts and profiles at once:
DO $$
DECLARE
  uid1 uuid; uid2 uuid; uid3 uuid; uid4 uuid; uid5 uuid;
  uid6 uuid; uid7 uuid; uid8 uuid; uid9 uuid; uid10 uuid;
BEGIN
  -- Create auth users (Supabase internal function)
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role)
  VALUES
    (gen_random_uuid(), 'sarah.mitchell@mindwell.com',  crypt('Therapist@123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated'),
    (gen_random_uuid(), 'james.patel@mindwell.com',     crypt('Therapist@123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated'),
    (gen_random_uuid(), 'priya.sharma@mindwell.com',    crypt('Therapist@123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated'),
    (gen_random_uuid(), 'michael.chen@mindwell.com',    crypt('Therapist@123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated'),
    (gen_random_uuid(), 'emily.rose@mindwell.com',      crypt('Therapist@123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated'),
    (gen_random_uuid(), 'marcus.johnson@mindwell.com',  crypt('Therapist@123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated'),
    (gen_random_uuid(), 'sofia.garcia@mindwell.com',    crypt('Therapist@123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated'),
    (gen_random_uuid(), 'william.taylor@mindwell.com',  crypt('Therapist@123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated'),
    (gen_random_uuid(), 'olivia.brown@mindwell.com',    crypt('Therapist@123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated'),
    (gen_random_uuid(), 'daniel.kim@mindwell.com',      crypt('Therapist@123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated');

  -- Now insert matching therapist profiles
  INSERT INTO public.therapists (id, name, email, specialization, status)
  SELECT u.id, t.name, t.email, t.spec, 'active'
  FROM auth.users u
  JOIN (VALUES
    ('sarah.mitchell@mindwell.com',  'Dr. Sarah Mitchell',  'Anxiety & Depression'),
    ('james.patel@mindwell.com',     'Dr. James Patel',     'Stress & Burnout'),
    ('priya.sharma@mindwell.com',    'Dr. Priya Sharma',    'Teen & Youth Wellness'),
    ('michael.chen@mindwell.com',    'Dr. Michael Chen',    'Career Coaching & Stress'),
    ('emily.rose@mindwell.com',      'Dr. Emily Rose',      'Relationships & Family'),
    ('marcus.johnson@mindwell.com',  'Dr. Marcus Johnson',  'PTSD & Trauma'),
    ('sofia.garcia@mindwell.com',    'Dr. Sofia Garcia',    'Anxiety & Phobias'),
    ('william.taylor@mindwell.com',  'Dr. William Taylor',  'Addiction Recovery'),
    ('olivia.brown@mindwell.com',    'Dr. Olivia Brown',    'Eating Disorders'),
    ('daniel.kim@mindwell.com',      'Dr. Daniel Kim',      'General Mental Health')
  ) AS t(email, name, spec) ON u.email = t.email
  WHERE u.email IN (
    'sarah.mitchell@mindwell.com', 'james.patel@mindwell.com', 'priya.sharma@mindwell.com',
    'michael.chen@mindwell.com', 'emily.rose@mindwell.com', 'marcus.johnson@mindwell.com',
    'sofia.garcia@mindwell.com', 'william.taylor@mindwell.com', 'olivia.brown@mindwell.com',
    'daniel.kim@mindwell.com'
  );
END $$;
