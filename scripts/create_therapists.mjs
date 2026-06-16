// Script to create all 10 therapist accounts in Supabase
// Run with: node scripts/create_therapists.mjs

import { createClient } from '@supabase/supabase-js'

// ⚠️  Replace this with your SERVICE ROLE key from:
// Supabase Dashboard → Project Settings → API → service_role (secret)
const SUPABASE_URL = 'https://jkihhhdnfdraljgqbaty.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpraWhoaGRuZmRyYWxqZ3FiYXR5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ0NzkyMywiZXhwIjoyMDk1MDIzOTIzfQ.-uDzo7S9BZsbCRn0n_5k5ioevAPiuFhlv7uZyCByuf8'  // <-- paste your service role key

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const therapists = [
  { email: 'sarah.mitchell@mindwell.com',  name: 'Dr. Sarah Mitchell',  specialization: 'Anxiety & Depression' },
  { email: 'james.patel@mindwell.com',     name: 'Dr. James Patel',     specialization: 'Stress & Burnout' },
  { email: 'priya.sharma@mindwell.com',    name: 'Dr. Priya Sharma',    specialization: 'Teen & Youth Wellness' },
  { email: 'michael.chen@mindwell.com',    name: 'Dr. Michael Chen',    specialization: 'Career Coaching & Stress' },
  { email: 'emily.rose@mindwell.com',      name: 'Dr. Emily Rose',      specialization: 'Relationships & Family' },
  { email: 'marcus.johnson@mindwell.com',  name: 'Dr. Marcus Johnson',  specialization: 'PTSD & Trauma' },
  { email: 'sofia.garcia@mindwell.com',    name: 'Dr. Sofia Garcia',    specialization: 'Anxiety & Phobias' },
  { email: 'william.taylor@mindwell.com',  name: 'Dr. William Taylor',  specialization: 'Addiction Recovery' },
  { email: 'olivia.brown@mindwell.com',    name: 'Dr. Olivia Brown',    specialization: 'Eating Disorders' },
  { email: 'daniel.kim@mindwell.com',      name: 'Dr. Daniel Kim',      specialization: 'General Mental Health' },
]

const PASSWORD = 'Therapist@123'

async function createTherapists() {
  console.log('Syncing therapist accounts...\n')

  for (const t of therapists) {
    // Try to create; if already exists, fetch the existing user
    let userId = null

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: t.email,
      password: PASSWORD,
      email_confirm: true,
    })

    if (authError && authError.message.includes('already been registered')) {
      // User exists — look them up by email
      const { data: listData } = await supabase.auth.admin.listUsers()
      const existing = listData?.users?.find(u => u.email === t.email)
      if (existing) {
        userId = existing.id
        // Reset their password so we know it works
        await supabase.auth.admin.updateUserById(userId, { password: PASSWORD })
        console.log(`🔄 Found existing auth user: ${t.name}`)
      } else {
        console.error(`❌ Could not find user: ${t.email}`)
        continue
      }
    } else if (authError) {
      console.error(`❌ Auth error for ${t.name}:`, authError.message)
      continue
    } else {
      userId = authData.user.id
    }

    // Insert / update therapist profile
    const { error: profileError } = await supabase.from('therapists').upsert({
      id: userId,
      name: t.name,
      email: t.email,
      specialization: t.specialization,
      status: 'active',
    }, { onConflict: 'id' })

    if (profileError) {
      console.error(`❌ Profile error for ${t.name}:`, profileError.message)
    } else {
      console.log(`✅ Profile synced: ${t.name} (${t.email})`)
    }
  }

  console.log('\n✅ Done! Login with password: Therapist@123')
}

createTherapists()
