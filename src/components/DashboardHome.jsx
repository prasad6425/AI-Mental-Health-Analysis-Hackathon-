import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { TrendingUp, Zap, AlertTriangle, Heart, Activity, Target, Flame, Star, Bell, Brain, Trophy, Gamepad2, UserCheck, MessageCircle, PenLine } from 'lucide-react'
import { getWellnessScore, subscribeToWellnessScore, getAnomalyAlerts, subscribeToAnomalyAlerts, getStreaks, getAssignedTherapist } from '../lib/db'
import TherapistConnect from './TherapistConnect'
import UserTherapistChat from './UserTherapistChat'
import UserFeedbackView from './UserFeedbackView'

// Progress Levels
const levels = [
  { id: 1, title: 'Beginner', max: 100, color: 'text-slate-400', bg: 'bg-slate-500/20' },
  { id: 2, title: 'Growing Mind', max: 300, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  { id: 3, title: 'Wellness Explorer', max: 600, color: 'text-purple-400', bg: 'bg-purple-500/20' },
  { id: 4, title: 'Mind Champion', max: 1000, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  { id: 5, title: 'Wellness Master', max: Infinity, color: 'text-amber-400', bg: 'bg-amber-500/20' },
]

const getLevelInfo = (xp) => {
  for (let i = 0; i < levels.length; i++) {
    if (xp <= levels[i].max) {
      const currentLevel = levels[i]
      const prevMax = i > 0 ? levels[i - 1].max : 0
      const progress = ((xp - prevMax) / (currentLevel.max - prevMax)) * 100
      return { ...currentLevel, progress: Math.min(100, Math.max(0, progress)), nextMax: currentLevel.max }
    }
  }
  return { ...levels[levels.length - 1], progress: 100, nextMax: Infinity }
}

export default function DashboardHome({ user, setActiveTab }) {
  const [scoreData, setScoreData] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [streakData, setStreakData] = useState({ current_streak: 0, total_xp: 0 })
  const [assignedTherapist, setAssignedTherapist] = useState(null)
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    if (!user?.id) return;

    // Fetch initial data
    getWellnessScore(user.id).then(({ data }) => data && setScoreData(data))
    getStreaks(user.id).then(({ data }) => data && setStreakData(data))
    getAnomalyAlerts(user.id).then(({ data }) => data && setAlerts(data))
    getAssignedTherapist(user.id).then(({ data }) => data && setAssignedTherapist(data.therapists))

    // Real-time Subscriptions
    const subScore = subscribeToWellnessScore(user.id, (payload) => setScoreData(payload.new))
    const subAlerts = subscribeToAnomalyAlerts(user.id, (payload) => setAlerts(prev => [payload.new, ...prev]))

    return () => {
      if (subScore) subScore.unsubscribe()
      if (subAlerts) subAlerts.unsubscribe()
    }
  }, [user?.id])

  // Real-time metrics
  const overall = scoreData?.overall_score ?? 80
  const burnout = scoreData?.burnout_risk ?? 'Low'
  const stability = scoreData?.emotional_stability ?? 85
  const recovery = scoreData?.recovery_progress ?? 50

  const statCards = [
    { label: t('dashboard.mood_score'), value: overall, unit: '/100', icon: Heart, color: 'from-pink-500 to-rose-500', bg: 'from-pink-500/10 to-rose-500/10', border: 'border-pink-500/20' },
    { label: t('dashboard.stress_level'), value: (100 - stability), unit: '/100', icon: Zap, color: 'from-amber-500 to-orange-500', bg: 'from-amber-500/10 to-orange-500/10', border: 'border-amber-500/20' },
    { label: t('dashboard.burnout_risk'), value: burnout, unit: '', icon: AlertTriangle, color: 'from-teal-500 to-green-500', bg: 'from-teal-500/10 to-green-500/10', border: 'border-teal-500/20' },
    { label: t('dashboard.stability'), value: stability, unit: '/100', icon: Activity, color: 'from-blue-500 to-purple-500', bg: 'from-blue-500/10 to-purple-500/10', border: 'border-blue-500/20' },
  ]

  const wellnessCards = [
    { label: t('dashboard.current_wellness'), value: overall, icon: Star, color: '#60a5fa' },
    { label: t('dashboard.therapy_progress'), value: recovery, icon: TrendingUp, color: '#34d399' },
  ]

  const levelInfo = getLevelInfo(streakData.total_xp || 0)

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Actions */}
      <div className="glass-dark rounded-3xl p-6 md:p-8 border border-white/5 relative overflow-hidden">
        {/* Abstract Background Element */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{t('dashboard.greeting')}, {user?.name?.split(' ')[0] || 'there'} 🌅</h1>
              <p className="text-slate-400">Welcome to your safe space. How can we support you today?</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 w-fit">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-sm font-medium">AI Analysis Active</span>
            </div>
          </div>
        </div>
      </div>

      {alerts.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
          <Bell className="text-red-400 shrink-0 mt-0.5" size={20} />
          <div>
            <div className="text-sm font-bold text-red-400">Action Recommended</div>
            <div className="text-xs text-red-300 mt-1">{alerts[0].alert_reason || "We've noticed you might be feeling overwhelmed. Please consider reaching out to your therapist or taking a deep breath."}</div>
          </div>
        </motion.div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column (Stats & Journey) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statCards.map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className={`glass rounded-2xl p-4 border-t-4 border-t-${stat.color.split('-')[1]}-500`}>
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon size={16} className={`text-${stat.color.split('-')[1]}-400`} />
                  <span className="text-xs font-medium text-slate-400">{stat.label}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">{stat.value}</span>
                  <span className="text-xs text-slate-500">{stat.unit}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Gamification / Levels */}
          <div className="glass rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-500/20">
                  <Trophy className="text-blue-400" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Wellness Journey</h3>
                  <div className={`text-sm font-bold ${levelInfo.color}`}>{levelInfo.title}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-white">{streakData.total_xp} <span className="text-sm text-slate-400 font-medium">XP</span></div>
                <div className="flex items-center gap-1 text-orange-400 text-sm font-medium mt-1">
                  <Flame size={14} /> {streakData.current_streak} Day Streak
                </div>
              </div>
            </div>
            
            <div className="w-full bg-slate-800 rounded-full h-2.5 mb-2 border border-slate-700">
              <motion.div initial={{ width: 0 }} animate={{ width: `${levelInfo.progress}%` }} className={`h-2.5 rounded-full ${levelInfo.bg.replace('/20', '')}`} />
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>{streakData.total_xp} XP</span>
              <span>{levelInfo.nextMax === Infinity ? 'MAX' : levelInfo.nextMax} XP to Next Level</span>
            </div>
          </div>
        </div>

        {/* Right Column (AI Insights) */}
        <div className="space-y-6">
          {/* AI Sentiment Insight Card */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-6 flex flex-col justify-center relative overflow-hidden h-full">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
          
          <div className="flex items-center gap-2 mb-6 relative z-10">
            <Brain className="text-purple-400" size={20} />
            <h3 className="font-semibold text-white">Live AI Sentiment Insight</h3>
          </div>
          
          <div className="relative z-10 space-y-4">
            <div className="p-5 rounded-xl bg-slate-800/50 border border-slate-700">
              <div className="text-xs text-slate-400 mb-3">Current real-time AI understanding of your state:</div>
              <div className="flex items-center gap-4">
                <span className="text-4xl">{stability > 70 ? '😊' : stability > 40 ? '😐' : '😰'}</span>
                <div>
                  <div className="text-xl font-bold text-white">
                    {stability > 70 ? 'Positive & Calm' : stability > 40 ? 'Neutral State' : 'High Stress Detected'}
                  </div>
                  <div className="text-sm text-blue-400 mt-1">
                    Powered by DistilBERT NLP
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        </div>
      </div>

      {/* Therapist Section */}
      {(overall < 50 || !assignedTherapist) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-4"
        >
          {/* Connect with Therapist prompt */}
          {!assignedTherapist ? (
            <div className="lg:col-span-2 p-5 rounded-2xl bg-gradient-to-r from-teal-500/10 to-blue-500/10 border border-teal-500/20 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <UserCheck size={22} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">Connect with a Professional Therapist</h3>
                <p className="text-sm text-slate-400 mt-0.5">{overall < 50 ? 'Your stress levels are high. A therapist can help.' : 'Get personalized mental health support from an expert.'}</p>
              </div>
              <button
                onClick={() => setShowConnectModal(true)}
                className="flex-shrink-0 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 text-white text-sm font-semibold transition-all"
              >
                Find a Therapist
              </button>
            </div>
          ) : (
            <div className="lg:col-span-2 p-5 rounded-2xl glass border border-white/5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {assignedTherapist.name?.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-400">Your Therapist</p>
                <h3 className="font-semibold text-white">{assignedTherapist.name}</h3>
                <p className="text-sm text-slate-400">{assignedTherapist.specialization || 'General Mental Health'}</p>
              </div>
              <button
                onClick={() => setShowChat(true)}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30 text-sm font-medium transition-all"
              >
                <MessageCircle size={16} />
                Chat
              </button>
            </div>
          )}

          {/* Feedback Card */}
          <UserFeedbackView userId={user.id} />
        </motion.div>
      )}

      {/* Therapist Connect Modal */}
      {showConnectModal && (
        <TherapistConnect
          userId={user.id}
          onClose={() => setShowConnectModal(false)}
          onAssigned={() => getAssignedTherapist(user.id).then(({ data }) => data && setAssignedTherapist(data.therapists))}
        />
      )}

      {/* Chat Modal */}
      {showChat && assignedTherapist && (
        <UserTherapistChat
          userId={user.id}
          therapist={assignedTherapist}
          onClose={() => setShowChat(false)}
        />
      )}

    </div>
  )
}
