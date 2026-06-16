import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Activity, Calendar } from 'lucide-react';
import { getAssignedPatients } from '../../lib/db';

export default function TherapistPatients({ authUserId }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await getAssignedPatients(authUserId);
      setPatients(data || []);
      setLoading(false);
    }
    load();
  }, [authUserId]);

  if (loading) return <div className="text-slate-400">Loading patients...</div>;

  if (patients.length === 0) {
    return (
      <div className="glass-dark rounded-2xl p-8 text-center border border-white/5">
        <User size={48} className="mx-auto text-slate-500 mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Patients Assigned</h3>
        <p className="text-slate-400">You currently do not have any active patients. When users request your assistance, they will appear here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {patients.map((assignment) => {
        const p = assignment.users;
        if (!p) return null;
        return (
          <motion.div 
            key={assignment.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-dark rounded-2xl p-6 border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                {p.full_name?.charAt(0) || 'U'}
              </div>
              <div>
                <h3 className="text-white font-semibold">{p.full_name}</h3>
                <p className="text-sm text-slate-400">{p.email}</p>
              </div>
            </div>
            
            <div className="space-y-2 mt-4 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400 flex items-center gap-2"><Activity size={14} /> Category</span>
                <span className="text-slate-200 capitalize">{p.category || 'Unknown'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400 flex items-center gap-2"><Calendar size={14} /> Assigned On</span>
                <span className="text-slate-200">{new Date(assignment.assigned_at).toLocaleDateString()}</span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
