import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Zap, AlertTriangle, Heart, Activity, Target, Flame, Star, Bell } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getWellnessScore, subscribeToWellnessScore, getMoodLogs, getAnomalyAlerts, subscribeToAnomalyAlerts, getStreaks } from '../lib/db'

const intensityColors = ['#1e293b', '#1e3a5f', '#1d4ed8', '#3b82f6', '#60a5fa']

const pieData = [
  { name: 'Calm', value: 40, color: '#34d399' },
  { name: 'Anxious', value: 25, color: '#f59e0b' },
  { name: 'Stressed', value: 20, color: '#f87171' },
  { name: 'Happy', value: 15, color: '#60a5fa' },
]

export default function DashboardHome({ user }) {
  const [scoreData, setScoreData] = useState(null)
  const [moodData, setMoodData] = useState([])
  const [heatmapData, setHeatmapData] = useState([])
  const [alerts, setAlerts] = useState([])
  const [streakData, setStreakData] = useState({ current_streak: 0, total_xp: 0 })

  useEffect(() => {
    if (!user?.id) return;

    // Fetch initial data
    getWellnessScore(user.id).then(({ data }) => data && setScoreData(data))
    getStreaks(user.id).then(({ data }) => data && setStreakData(data))
    getAnomalyAlerts(user.id).then(({ data }) => data && setAlerts(data))
    
    getMoodLogs(user.id).then(({ data }) => {
      if (data && data.length > 0) {
        // Map DB mood logs to chart format
        const formattedMoods = data.map(d => ({
          day: `Day ${d.day}`, mood: d.mood_score || 0, stress: d.stress_score || 0
        }))
        setMoodData(formattedMoods)
        
        // Heatmap mapping
        const hm = Array.from({ length: 28 }, (_, i) => {
          const log = data.find(x => x.day === i + 1)
          return { day: i + 1, intensity: log ? Math.min(Math.floor((log.mood_score || 50) / 20), 4) : 0 }
        })
        setHeatmapData(hm)
      } else {
        // Default empty heatmap if no logs
        setHeatmapData(Array.from({ length: 28 }, (_, i) => ({ day: i + 1, intensity: 0 })))
      }
    })

    // Subscriptions
    const subScore = subscribeToWellnessScore(user.id, (payload) => setScoreData(payload.new))
    const subAlerts = subscribeToAnomalyAlerts(user.id, (payload) => setAlerts(prev => [payload.new, ...prev]))

    return () => {
      if (subScore) subScore.unsubscribe()
      if (subAlerts) subAlerts.unsubscribe()
    }
  }, [user?.id])

  // Fallback defaults if no DB score yet
  const overall = scoreData?.overall_score || 80
  const burnout = scoreData?.burnout_risk || 'Low'
  const stability = scoreData?.emotional_stability || 85
  const recovery = scoreData?.recovery_progress || 50

  const statCards = [
    { label: 'Mood Score', value: overall, unit: '/100', icon: Heart, color: 'from-pink-500 to-rose-500', bg: 'from-pink-500/10 to-rose-500/10', border: 'border-pink-500/20', trend: '+5%' },
    { label: 'Stress Level', value: (100 - stability), unit: '/100', icon: Zap, color: 'from-amber-500 to-orange-500', bg: 'from-amber-500/10 to-orange-500/10', border: 'border-amber-500/20', trend: '-8%' },
    { label: 'Burnout Risk', value: burnout, unit: '', icon: AlertTriangle, color: 'from-teal-500 to-green-500', bg: 'from-teal-500/10 to-green-500/10', border: 'border-teal-500/20', trend: 'Stable' },
    { label: 'Emotional Stability', value: stability, unit: '/100', icon: Activity, color: 'from-blue-500 to-purple-500', bg: 'from-blue-500/10 to-purple-500/10', border: 'border-blue-500/20', trend: '+12%' },
  ]

  const wellnessCards = [
    { label: 'Daily Wellness Score', value: overall, icon: Star, color: '#60a5fa' },
    { label: 'Meditation Progress', value: streakData.total_xp > 0 ? Math.min(100, streakData.total_xp / 2) : 0, icon: Target, color: '#a78bfa' },
    { label: 'Recovery Progress', value: recovery, icon: TrendingUp, color: '#34d399' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Good morning, {user?.name?.split(' ')[0] || 'there'} 🌅</h1>
          <p className="text-slate-400 text-sm mt-1">Here's your emotional wellness overview for today</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400 text-sm font-medium">Wellness Active</span>
        </div>
      </div>

      {alerts.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-red-500/20 border border-red-500/30 flex items-start gap-3">
          <Bell className="text-red-400 shrink-0 mt-0.5" size={20} />
          <div>
            <div className="text-sm font-bold text-red-400">Anomaly Alert Detected</div>
            <div className="text-xs text-red-300 mt-1">{alerts[0].alert_reason || "Isolation Forest algorithm detected an unusual pattern in your recent logs. Please check your routine."}</div>
          </div>
        </motion.div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className={`glass rounded-2xl p-5 card-hover bg-gradient-to-br ${card.bg} border ${card.border}`}>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3`}>
              <card.icon size={18} className="text-white" />
            </div>
            <div className="text-2xl font-bold text-white">{card.value}<span className="text-sm text-slate-400">{card.unit}</span></div>
            <div className="text-xs text-slate-400 mt-1">{card.label}</div>
            <div className={`text-xs mt-2 font-medium ${card.trend.startsWith('+') ? 'text-green-400' : card.trend.startsWith('-') ? 'text-red-400' : 'text-slate-400'}`}>
              {card.trend} this week
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="lg:col-span-2 glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Weekly Mood Tracker</h3>
            <span className="text-xs text-slate-400 px-2 py-1 rounded-full bg-slate-700">Last 7 days</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            {moodData.length > 0 ? (
              <AreaChart data={moodData}>
                <defs>
                  <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#e2e8f0' }} />
                <Area type="monotone" dataKey="mood" stroke="#60a5fa" fill="url(#moodGrad)" strokeWidth={2} name="Mood" />
                <Area type="monotone" dataKey="stress" stroke="#f87171" fill="url(#stressGrad)" strokeWidth={2} name="Stress" />
              </AreaChart>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">Log some moods in the Routine Planner to see trends!</div>
            )}
          </ResponsiveContainer>
        </motion.div>

        {/* Pie chart */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="glass rounded-2xl p-5">
          <h3 className="font-semibold text-white mb-4">Emotional State (BERT)</h3>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-slate-400">{d.name}</span>
                </div>
                <span className="text-white font-medium">{d.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Wellness progress + Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Wellness cards */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="glass rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold text-white">Wellness Progress</h3>
          {wellnessCards.map((card, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <card.icon size={14} style={{ color: card.color }} />
                  <span className="text-sm text-slate-300">{card.label}</span>
                </div>
                <span className="text-sm font-bold text-white">{Math.round(card.value)}%</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${card.value}%` }} transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                  className="h-full rounded-full" style={{ background: card.color }} />
              </div>
            </div>
          ))}

          {/* Current emotional state */}
          <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
            <div className="text-xs text-slate-400 mb-1">Current Emotional State</div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{stability > 70 ? '😊' : stability > 40 ? '😐' : '😰'}</span>
              <div>
                <div className="text-sm font-semibold text-white">{stability > 70 ? 'Calm & Focused' : stability > 40 ? 'Neutral' : 'Stressed'}</div>
                <div className="text-xs text-slate-400">Confidence: 87% (BERT Placeholder)</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Emotional heatmap */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Emotional Heatmap</h3>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <span>Low</span>
              {intensityColors.map((c, i) => <div key={i} className="w-3 h-3 rounded-sm" style={{ background: c }} />)}
              <span>High</span>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {heatmapData.map((d, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 + i * 0.02 }}
                className="aspect-square rounded-sm cursor-pointer hover:scale-110 transition-transform"
                style={{ background: intensityColors[d.intensity] }}
                title={`Day ${d.day}: Intensity ${d.intensity}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 mt-4">
            <Flame size={14} className="text-orange-400" />
            <span className="text-sm text-slate-300">{streakData.current_streak}-day streak</span>
            <span className="ml-auto text-xs text-slate-400">28 days tracked</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
