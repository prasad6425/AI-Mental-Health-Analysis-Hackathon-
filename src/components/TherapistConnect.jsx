import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserCheck, Star, Loader2, CheckCircle } from 'lucide-react';
import { getTherapists, assignTherapist } from '../lib/db';

export default function TherapistConnect({ userId, onClose, onAssigned }) {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await getTherapists();
      setTherapists(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const handleAssign = async (therapistId) => {
    setAssigning(therapistId);
    const { error } = await assignTherapist(userId, therapistId);
    if (!error) {
      setSuccess(true);
      setTimeout(() => {
        onAssigned && onAssigned();
        onClose();
      }, 1500);
    }
    setAssigning(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative glass-dark border border-white/10 rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[80vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Connect with a Therapist</h2>
              <p className="text-sm text-slate-400 mt-1">Choose a professional to support your wellness journey</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-all">
              <X size={20} />
            </button>
          </div>

          {success ? (
            <div className="text-center py-8">
              <CheckCircle size={48} className="text-emerald-400 mx-auto mb-3" />
              <p className="text-white font-semibold">Therapist Assigned!</p>
              <p className="text-slate-400 text-sm mt-1">You can now chat with your therapist.</p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={32} className="text-blue-400 animate-spin" />
            </div>
          ) : therapists.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <UserCheck size={40} className="mx-auto mb-3 opacity-50" />
              <p>No therapists available on the platform yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {therapists.map((t) => (
                <div
                  key={t.id}
                  className="glass rounded-xl p-4 border border-white/5 flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {t.name?.charAt(0) || 'T'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white">{t.name}</h3>
                    <p className="text-sm text-slate-400">{t.specialization || 'General Mental Health'}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={11} className="text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => handleAssign(t.id)}
                    disabled={!!assigning}
                    className="flex-shrink-0 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 text-white text-sm font-semibold disabled:opacity-50 transition-all"
                  >
                    {assigning === t.id ? <Loader2 size={16} className="animate-spin" /> : 'Select'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
