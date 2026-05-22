import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Shield, Palette, Globe, Moon, Save } from 'lucide-react'

export default function SettingsPage({ user }) {
  const [notifications, setNotifications] = useState({ daily: true, weekly: true, alerts: false })
  const [saved, setSaved] = useState(false)

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings ⚙️</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <div className="glass rounded-2xl p-6">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Shield size={16} className="text-blue-400" /> Profile</h3>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white">
            {user?.name?.[0] || 'U'}
          </div>
          <div>
            <div className="font-medium text-white">{user?.name}</div>
            <div className="text-sm text-slate-400">{user?.email}</div>
            <div className="text-xs text-blue-400 mt-1 capitalize">{user?.category} User</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[['Full Name', user?.name], ['Email', user?.email], ['Phone', user?.phone], ['Category', user?.category]].map(([label, val]) => (
            <div key={label}>
              <label className="text-xs text-slate-400 mb-1 block">{label}</label>
              <div className="px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-slate-300 capitalize">{val || '—'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="glass rounded-2xl p-6">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Bell size={16} className="text-purple-400" /> Notifications</h3>
        <div className="space-y-3">
          {[['daily', 'Daily Wellness Reminders', 'Get reminded to complete your daily routine'], ['weekly', 'Weekly Progress Report', 'Receive your weekly emotional wellness summary'], ['alerts', 'Stress Alerts', 'Get notified when stress levels are high']].map(([key, label, desc]) => (
            <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30">
              <div>
                <div className="text-sm font-medium text-white">{label}</div>
                <div className="text-xs text-slate-400">{desc}</div>
              </div>
              <button onClick={() => setNotifications(n => ({ ...n, [key]: !n[key] }))}
                className={`w-11 h-6 rounded-full transition-all relative ${notifications[key] ? 'bg-blue-600' : 'bg-slate-600'}`}>
                <motion.div animate={{ x: notifications[key] ? 20 : 2 }} className="absolute top-1 w-4 h-4 rounded-full bg-white shadow" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Appearance */}
      <div className="glass rounded-2xl p-6">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Palette size={16} className="text-teal-400" /> Appearance</h3>
        <div className="flex gap-3">
          {['Dark Mode', 'Light Mode', 'Auto'].map((mode, i) => (
            <button key={mode} className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${i === 0 ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'}`}>
              {mode}
            </button>
          ))}
        </div>
      </div>

      <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={save}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg shadow-blue-500/25">
        <Save size={16} />
        {saved ? '✓ Saved!' : 'Save Changes'}
      </motion.button>
    </div>
  )
}
