import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClipboardCheck, Calendar, ChevronRight, Loader2 } from 'lucide-react';
import { getLatestFeedback } from '../lib/db';

const stateColors = {
  'Stable': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  'Improving': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  'Declining': 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  'Critical': 'text-red-400 bg-red-500/10 border-red-500/20',
};

export default function UserFeedbackView({ userId }) {
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await getLatestFeedback(userId);
      setFeedback(data);
      setLoading(false);
    }
    load();
  }, [userId]);

  if (loading) {
    return (
      <div className="glass-dark rounded-2xl p-6 border border-white/5 flex items-center justify-center h-32">
        <Loader2 size={24} className="text-slate-500 animate-spin" />
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="glass-dark rounded-2xl p-6 border border-white/5 text-center">
        <ClipboardCheck size={32} className="mx-auto text-slate-600 mb-2" />
        <p className="text-slate-400 text-sm">No therapist feedback yet</p>
      </div>
    );
  }

  const stateClass = stateColors[feedback.overall_state] || 'text-slate-300 bg-slate-700/30 border-slate-600';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-dark rounded-2xl p-6 border border-white/5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardCheck size={18} className="text-teal-400" />
          <h3 className="font-semibold text-white">Therapist Feedback</h3>
        </div>
        <span className={`text-xs font-medium px-3 py-1 rounded-full border ${stateClass}`}>
          {feedback.overall_state}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MetricRow label="Stress Level" value={feedback.stress_observation} />
        <MetricRow label="Emotional State" value={feedback.emotional_wellbeing} />
        <MetricRow label="Sleep" value={feedback.sleep_observation} />
        <MetricRow label="Engagement" value={feedback.engagement_level} />
      </div>

      {feedback.recommendations && (
        <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/15">
          <p className="text-xs text-blue-300 font-medium mb-1">Recommendations</p>
          <p className="text-sm text-slate-300 leading-relaxed">{feedback.recommendations}</p>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-white/5">
        <span>By {feedback.therapists?.name || 'Your Therapist'}</span>
        <div className="flex items-center gap-1">
          <Calendar size={11} />
          {feedback.followup_date
            ? `Follow-up: ${new Date(feedback.followup_date).toLocaleDateString()}`
            : new Date(feedback.created_at).toLocaleDateString()}
        </div>
      </div>
    </motion.div>
  );
}

function MetricRow({ label, value }) {
  return (
    <div className="glass rounded-lg p-2.5 border border-white/5">
      <p className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium text-slate-200 mt-0.5">{value}</p>
    </div>
  );
}
