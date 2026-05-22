import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, CheckCircle2, Circle, Flame, Trophy, Droplets, Music, Moon, BookOpen, Sun, Wind, Apple } from 'lucide-react'
import { saveTaskProgress, getWellnessProgress, saveMoodLog, getMoodLogs, getStreaks } from '../lib/db'

const days = [
  { day: 1, theme: 'Fresh Start', emoji: '🌅', color: 'from-blue-500 to-cyan-500' },
  { day: 2, theme: 'Inner Peace', emoji: '🧘', color: 'from-purple-500 to-pink-500' },
  { day: 3, theme: 'Energy Boost', emoji: '⚡', color: 'from-amber-500 to-orange-500' },
  { day: 4, theme: 'Mindful Focus', emoji: '🎯', color: 'from-teal-500 to-green-500' },
  { day: 5, theme: 'Self Care', emoji: '💆', color: 'from-rose-500 to-pink-500' },
  { day: 6, theme: 'Social Wellness', emoji: '🤝', color: 'from-indigo-500 to-blue-500' },
  { day: 7, theme: 'Reflection', emoji: '🌟', color: 'from-violet-500 to-purple-500' },
]

const buildTasks = (day) => ({
  morning: [
    { id: `${day}-m1`, icon: Apple, label: 'Healthy Breakfast', desc: 'Oats with fruits & nuts + green tea', xp: 10 },
    { id: `${day}-m2`, icon: Sun, label: '10-min Meditation', desc: 'Guided morning mindfulness session', xp: 15 },
    { id: `${day}-m3`, icon: Droplets, label: 'Hydration Reminder', desc: 'Drink 2 glasses of water', xp: 5 },
  ],
  afternoon: [
    { id: `${day}-a1`, icon: Wind, label: 'Breathing Exercise', desc: '4-7-8 breathing technique (5 mins)', xp: 10 },
    { id: `${day}-a2`, icon: Sun, label: 'Wellness Activity', desc: 'Light stretching or short walk', xp: 15 },
    { id: `${day}-a3`, icon: Sun, label: 'Positive Affirmation', desc: '"I am capable, calm, and resilient"', xp: 5 },
  ],
  evening: [
    { id: `${day}-e1`, icon: Music, label: 'Relaxation Music', desc: 'Lo-fi or nature sounds (15 mins)', xp: 10 },
    { id: `${day}-e2`, icon: Wind, label: 'Evening Walk', desc: '15-minute mindful walk outside', xp: 15 },
    { id: `${day}-e3`, icon: Sun, label: 'Calm Activity', desc: 'Reading or light creative hobby', xp: 10 },
  ],
  night: [
    { id: `${day}-n1`, icon: Moon, label: 'Sleep Meditation', desc: 'Body scan relaxation (10 mins)', xp: 15 },
    { id: `${day}-n2`, icon: BookOpen, label: 'Reflection Journal', desc: "Write 3 things you're grateful for", xp: 20 },
    { id: `${day}-n3`, icon: Sun, label: 'Mood Check-in', desc: 'Rate your day 1-10', xp: 10 },
  ],
})

const sectionColors = {
  morning:   { label: '🌅 Morning',   color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20' },
  afternoon: { label: '☀️ Afternoon', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  evening:   { label: '🌆 Evening',   color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  night:     { label: '🌙 Night',     color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20' },
}

export default function RoutinePlan({ authUserId }) {
  const [expanded, setExpanded] = useState(1)
  const [completed, setCompleted] = useState({})
  const [moodInputs, setMoodInputs] = useState({})
  const [savingTask, setSavingTask] = useState(null)
  const [savingMood, setSavingMood] = useState(null)
  const [streaks, setStreaks] = useState({ current_streak: 0, total_xp: 0 })

  // Load saved progress from Supabase on mount
  useEffect(() => {
    if (!authUserId) return
    getWellnessProgress(authUserId).then(({ data }) => { if (data) setCompleted(data) })
    getMoodLogs(authUserId).then(({ data }) => { 
      if (data) {
        const m = {}
        data.forEach(d => { m[d.day] = d.note })
        setMoodInputs(m)
      }
    })
    fetchStreaks()
  }, [authUserId])

  const fetchStreaks = async () => {
    if (!authUserId) return
    const { data } = await getStreaks(authUserId)
    if (data) setStreaks(data)
  }

  const toggleTask = async (taskId) => {
    const newVal = !completed[taskId]
    setCompleted(c => ({ ...c, [taskId]: newVal }))
    setSavingTask(taskId)
    // Find XP reward
    let xp = 10
    days.forEach(d => {
      Object.values(buildTasks(d.day)).flat().forEach(t => { if (t.id === taskId) xp = t.xp })
    })
    
    if (authUserId) {
      await saveTaskProgress(authUserId, taskId, newVal, xp)
      await fetchStreaks() // refresh XP
    }
    setSavingTask(null)
  }

  const saveMood = async (day, note) => {
    setMoodInputs(m => ({ ...m, [day]: note }))
    setSavingMood(day)
    if (authUserId) await saveMoodLog(authUserId, day, note)
    setSavingMood(null)
  }

  const getDayProgress = (day) => {
    const all = Object.values(buildTasks(day)).flat()
    const done = all.filter(t => completed[t.id]).length
    return { done, total: all.length, pct: Math.round((done / all.length) * 100) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">7-Day Wellness Routine 📅</h1>
          <p className="text-slate-400 text-sm mt-1">Your personalized daily wellness journey</p>
        </div>
        <div className="flex gap-3">
          <div className="glass rounded-xl px-4 py-2 text-center">
            <div className="flex items-center gap-1 text-amber-400 font-bold text-sm"><Flame size={14} /> {streaks.current_streak}</div>
            <div className="text-xs text-slate-400">Day Streak</div>
          </div>
          <div className="glass rounded-xl px-4 py-2 text-center">
            <div className="flex items-center gap-1 text-purple-400 font-bold text-sm"><Trophy size={14} /> {streaks.total_xp}</div>
            <div className="text-xs text-slate-400">Total XP</div>
          </div>
        </div>
      </div>

      {/* Overall progress */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-white">Weekly Completion</span>
          <span className="text-sm text-slate-400">
            {days.reduce((acc, d) => acc + getDayProgress(d.day).done, 0)} / {days.length * 12} tasks
          </span>
        </div>
        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500 rounded-full"
            animate={{ width: `${Math.round((days.reduce((acc, d) => acc + getDayProgress(d.day).done, 0) / (days.length * 12)) * 100)}%` }}
            transition={{ duration: 1 }} />
        </div>
      </div>

      {/* Day accordion cards */}
      <div className="space-y-3">
        {days.map((d) => {
          const { done, total, pct } = getDayProgress(d.day)
          const tasks = buildTasks(d.day)
          const isOpen = expanded === d.day

          return (
            <motion.div key={d.day} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: d.day * 0.04 }} className="glass rounded-2xl overflow-hidden">

              {/* Accordion header */}
              <button onClick={() => setExpanded(isOpen ? null : d.day)}
                className="w-full p-5 flex items-center gap-4 hover:bg-white/5 transition-colors">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${d.color} flex items-center justify-center text-2xl flex-shrink-0`}>
                  {d.emoji}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white">Day {d.day}</span>
                    <span className="text-xs text-slate-400">— {d.theme}</span>
                    {pct === 100 && <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">✓ Complete</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${d.color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-slate-400 flex-shrink-0">{done}/{total} · {pct}%</span>
                  </div>
                </div>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={18} className="text-slate-400" />
                </motion.div>
              </button>

              {/* Accordion body */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                    <div className="px-5 pb-5 space-y-4 border-t border-white/5 pt-4">
                      {Object.entries(tasks).map(([section, items]) => {
                        const sc = sectionColors[section]
                        return (
                          <div key={section}>
                            <div className={`text-xs font-semibold ${sc.color} mb-2`}>{sc.label}</div>
                            <div className={`rounded-xl ${sc.bg} border ${sc.border} p-3 space-y-2`}>
                              {items.map(task => (
                                <div key={task.id} className="flex items-center gap-3">
                                  <button onClick={() => toggleTask(task.id)} className="flex-shrink-0" disabled={savingTask === task.id}>
                                    {savingTask === task.id
                                      ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}
                                          className="w-[18px] h-[18px] rounded-full border-2 border-blue-400 border-t-transparent" />
                                      : completed[task.id]
                                        ? <CheckCircle2 size={18} className="text-green-400" />
                                        : <Circle size={18} className="text-slate-500 hover:text-slate-300 transition-colors" />}
                                  </button>
                                  <task.icon size={14} className="text-slate-400 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <div className={`text-sm font-medium ${completed[task.id] ? 'line-through text-slate-500' : 'text-white'}`}>{task.label}</div>
                                    <div className="text-xs text-slate-500 truncate">{task.desc}</div>
                                  </div>
                                  <span className="text-xs text-purple-400 font-medium flex-shrink-0">+{task.xp}XP</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}

                      {/* Mood log input — saved to Supabase */}
                      <div className="mt-2">
                        <label className="text-xs text-slate-400 mb-2 block flex items-center gap-1">
                          💭 Day Reflection
                          {savingMood === d.day && <span className="text-blue-400 text-xs ml-1">Saving...</span>}
                          {moodInputs[d.day] && savingMood !== d.day && <span className="text-green-400 text-xs ml-1">✓ Saved</span>}
                        </label>
                        <input
                          value={moodInputs[d.day] || ''}
                          onChange={e => setMoodInputs(m => ({ ...m, [d.day]: e.target.value }))}
                          onBlur={e => e.target.value && saveMood(d.day, e.target.value)}
                          placeholder="How did today feel? Write a quick note..."
                          className="w-full bg-slate-800/50 border border-slate-700 focus:border-blue-500/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
