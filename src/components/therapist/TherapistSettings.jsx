import React from 'react';
import { motion } from 'framer-motion';

export default function TherapistSettings({ user }) {
  return (
    <div className="max-w-3xl glass-dark rounded-2xl p-8 border border-white/5">
      <h3 className="text-xl font-bold text-white mb-6">Profile Settings</h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
          <input 
            type="text" 
            disabled 
            value={user.name || ''} 
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-300 opacity-70 cursor-not-allowed"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Email Address</label>
          <input 
            type="email" 
            disabled 
            value={user.email || ''} 
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-300 opacity-70 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Specialization</label>
          <input 
            type="text" 
            disabled
            value={user.specialization || 'General Mental Health'} 
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-300 opacity-70 cursor-not-allowed"
          />
          <p className="text-xs text-slate-500 mt-2">To change your specialization, please contact platform administration.</p>
        </div>
      </div>
    </div>
  );
}
