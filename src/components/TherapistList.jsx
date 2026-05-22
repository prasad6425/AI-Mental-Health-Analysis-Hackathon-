import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Clock, CheckCircle, X, Calendar, MessageCircle } from 'lucide-react'
import { getTherapists, bookSession } from '../lib/db'

export default function TherapistList({ authUserId }) {
  const [therapists, setTherapists] = useState([])
  const [selected, setSelected] = useState(null)
  const [booked, setBooked] = useState(null)
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTherapists().then(({ data }) => {
      if (data) setTherapists(data)
      setLoading(false)
    })
  }, [])

  const filtered = filter === 'available' ? therapists.filter(t => t.is_available) : therapists

  const handleBooking = async () => {
    if (authUserId && selected) {
      // Create a notification for the therapist (booking system)
      await bookSession(authUserId, selected.name, 'Tomorrow', '10:00 AM')
    }
    setBooked(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Find Your Therapist 🩺</h1>
        <p className="text-slate-400 text-sm mt-1">Connect with certified mental health professionals</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'available'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${filter === f ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'glass text-slate-400 hover:text-white'}`}>
            {f === 'all' ? 'All Therapists' : '✅ Available Now'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center p-12 text-slate-400">Loading therapists...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((t, i) => (
          <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass rounded-2xl p-5 card-hover border border-white/5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center text-3xl flex-shrink-0">
                {t.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white text-sm truncate">{t.name}</div>
                <div className="text-xs text-blue-400 mt-0.5">{t.spec}</div>
                <div className="flex items-center gap-1 mt-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${t.available ? 'bg-green-400' : 'bg-slate-500'}`} />
                  <span className={`text-xs ${t.available ? 'text-green-400' : 'text-slate-500'}`}>
                    {t.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-3 text-xs text-slate-400">
              <div className="flex items-center gap-1">
                <Star size={12} className="text-amber-400 fill-amber-400" />
                <span className="text-white font-medium">{t.rating}</span>
                <span>({t.reviews})</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>{t.exp}</span>
              </div>
              <span className="ml-auto text-teal-400 font-medium">{t.price}</span>
            </div>

            <div className="flex flex-wrap gap-1 mb-4">
              {t.tags.map(tag => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">{tag}</span>
              ))}
            </div>

            <div className="flex gap-2">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => t.available && setSelected(t)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1 ${t.available ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/20' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}>
                <Calendar size={13} /> Book Session
              </motion.button>
              <button className="w-9 h-9 rounded-xl bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                <MessageCircle size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Booking modal */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelected(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="glass rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
              {booked ? (
                <div className="text-center py-4">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-green-400" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-white mb-2">Session Booked! 🎉</h3>
                  <p className="text-slate-400 text-sm">Your session with {selected.name} has been confirmed.</p>
                  <button onClick={() => { setSelected(null); setBooked(false) }} className="mt-4 px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium">Done</button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-white">Book a Session</h3>
                    <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white"><X size={18} /></button>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 mb-4">
                    <span className="text-3xl">{selected.avatar}</span>
                    <div>
                      <div className="font-medium text-white text-sm">{selected.name}</div>
                      <div className="text-xs text-blue-400">{selected.spec}</div>
                    </div>
                  </div>
                  <div className="space-y-3 mb-4">
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Select Date</label>
                      <input type="date" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Select Time</label>
                      <select className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50">
                        <option>9:00 AM</option><option>11:00 AM</option><option>2:00 PM</option><option>4:00 PM</option>
                      </select>
                    </div>
                  </div>
                  <button onClick={handleBooking} className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-sm">
                    Confirm Booking — {selected.price}
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
        </>
      )}
    </div>
  )
}
