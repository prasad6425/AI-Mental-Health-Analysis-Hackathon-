import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { getAssignedPatients, saveTherapistFeedback } from '../../lib/db';

export default function TherapistFeedback({ authUserId }) {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  const [form, setForm] = useState({
    overall_state: 'Stable',
    stress_observation: 'Low',
    emotional_wellbeing: 'Positive',
    sleep_observation: 'Adequate',
    engagement_level: 'High',
    therapist_notes: '',
    recommendations: '',
    followup_date: ''
  });

  useEffect(() => {
    async function loadPatients() {
      const { data } = await getAssignedPatients(authUserId);
      setPatients(data || []);
      if (data && data.length > 0) setSelectedPatientId(data[0].users.id);
      setLoading(false);
    }
    loadPatients();
  }, [authUserId]);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatientId) return;
    setSubmitting(true);
    setStatus(null);

    const { error } = await saveTherapistFeedback(selectedPatientId, authUserId, form);
    setSubmitting(false);

    if (error) {
      setStatus({ type: 'error', msg: error.message || 'Failed to submit feedback' });
    } else {
      setStatus({ type: 'success', msg: 'Feedback submitted successfully!' });
      // Reset text fields
      update('therapist_notes', '');
      update('recommendations', '');
      update('followup_date', '');
      setTimeout(() => setStatus(null), 3000);
    }
  };

  if (loading) return <div className="text-slate-400">Loading patients...</div>;
  if (patients.length === 0) return <div className="text-slate-400">No patients assigned.</div>;

  return (
    <div className="max-w-3xl glass-dark rounded-2xl p-8 border border-white/5">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Patient Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Select Patient</label>
          <select 
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
          >
            {patients.map(p => (
              <option key={p.users.id} value={p.users.id}>{p.users.full_name} ({p.users.email})</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SelectField label="Overall Mental State" value={form.overall_state} onChange={v => update('overall_state', v)} options={['Stable', 'Improving', 'Declining', 'Critical']} />
          <SelectField label="Stress Observation" value={form.stress_observation} onChange={v => update('stress_observation', v)} options={['Low', 'Moderate', 'High', 'Severe']} />
          <SelectField label="Emotional Wellbeing" value={form.emotional_wellbeing} onChange={v => update('emotional_wellbeing', v)} options={['Positive', 'Neutral', 'Volatile', 'Depressed']} />
          <SelectField label="Sleep Observation" value={form.sleep_observation} onChange={v => update('sleep_observation', v)} options={['Adequate', 'Restless', 'Insomnia', 'Oversleeping']} />
          <SelectField label="Engagement Level" value={form.engagement_level} onChange={v => update('engagement_level', v)} options={['High', 'Moderate', 'Low', 'Withdrawn']} />
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Next Follow-up Date</label>
            <input type="date" value={form.followup_date} onChange={e => update('followup_date', e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Therapist Notes (Private & Dashboard)</label>
          <textarea 
            value={form.therapist_notes} onChange={e => update('therapist_notes', e.target.value)}
            rows={4} placeholder="General observations..."
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Recommendations (Shown to patient)</label>
          <textarea 
            value={form.recommendations} onChange={e => update('recommendations', e.target.value)}
            rows={3} placeholder="Actionable steps for the patient..."
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
          />
        </div>

        {status && (
          <div className={`p-4 rounded-xl flex items-center gap-3 ${status.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
            {status.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span className="text-sm font-medium">{status.msg}</span>
          </div>
        )}

        <button 
          type="submit" disabled={submitting}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold shadow-lg disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit Daily Feedback'}
        </button>

      </form>
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
      >
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}
