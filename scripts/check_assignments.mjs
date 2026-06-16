import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://jkihhhdnfdraljgqbaty.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpraWhoaGRuZmRyYWxqZ3FiYXR5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ0NzkyMywiZXhwIjoyMDk1MDIzOTIzfQ.-uDzo7S9BZsbCRn0n_5k5ioevAPiuFhlv7uZyCByuf8'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

async function test() {
  const { data, error } = await supabase.from('user_therapist_assignment').select('*, users(*), therapists(*)')
  console.log('Assignments:', JSON.stringify(data, null, 2))
  console.log('Error:', error)
}
test()
