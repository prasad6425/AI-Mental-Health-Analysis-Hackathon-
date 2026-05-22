import { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain } from 'lucide-react'
import { useAuth } from './hooks/useAuth'
import { signOut } from './lib/db'
import Registration from './pages/Registration'
import Assessment from './pages/Assessment'
import UserDashboard from './pages/UserDashboard'
import './index.css'

export default function App() {
  const { authUser, profile, loading, refetchProfile } = useAuth()
  // 'assessment' view is shown after fresh signup before profile has category confirmed
  const [showAssessment, setShowAssessment] = useState(false)
  const [freshUser, setFreshUser] = useState(null) // holds form data during assessment

  const handleLogout = async () => {
    await signOut()
    setShowAssessment(false)
    setFreshUser(null)
  }

  const handleRegistered = (userData) => {
    // userData comes from Registration after Supabase signup + profile upsert
    setFreshUser(userData)
    setShowAssessment(true)
  }

  const handleAssessmentDone = () => {
    setShowAssessment(false)
    refetchProfile()
  }

  // ── Loading splash ──────────────────────────────────────────────────────────
  if (loading) return <LoadingScreen />

  // ── Not logged in ───────────────────────────────────────────────────────────
  if (!authUser) {
    return <Registration onRegistered={handleRegistered} onTherapistLogin={() => alert('Therapist Dashboard coming soon!')} />
  }

  // ── Logged in but needs assessment (fresh signup) ───────────────────────────
  if (showAssessment && freshUser) {
    return (
      <Assessment
        user={freshUser}
        authUserId={authUser.id}
        onComplete={handleAssessmentDone}
      />
    )
  }

  // ── Returning user — profile exists, go straight to dashboard ──────────────
  const dashboardUser = profile
    ? {
        name: profile.full_name,
        email: profile.email,
        phone: profile.phone,
        guardianPhone: profile.guardian_number,
        dob: profile.dob,
        category: profile.category,
      }
    : freshUser

  return <UserDashboard user={dashboardUser} authUserId={authUser.id} onLogout={handleLogout} />
}

function LoadingScreen() {
  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 border-r-purple-500" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain size={24} className="text-blue-400" />
          </div>
        </div>
        <p className="text-slate-400 text-sm">Loading MindWell...</p>
      </motion.div>
    </div>
  )
}
