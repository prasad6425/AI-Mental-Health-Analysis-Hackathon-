import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Activity, TrendingUp, Sparkles, BrainCircuit, HeartPulse, ShieldCheck
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';

import { useState, useEffect } from 'react';
import { getGlobalAnalyticsApi } from '../lib/api';

// Custom Tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-dark p-3 rounded-lg border border-white/10 shadow-xl">
        <p className="text-white font-medium mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color || entry.payload.color }} className="text-sm">
            {entry.name}: <span className="font-bold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function PlatformImpact() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getGlobalAnalyticsApi();
        setData(result);
      } catch (err) {
        console.error("Failed to fetch global analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 bg-slate-800 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-800 rounded-2xl"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[300px] bg-slate-800 rounded-2xl"></div>
          <div className="h-[300px] bg-slate-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  // Map icon strings back to lucide icons
  const getIcon = (name) => {
    switch(name) {
      case 'HeartPulse': return HeartPulse;
      case 'Users': return Users;
      case 'Sparkles': return Sparkles;
      default: return Activity;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Platform Impact</h1>
          <p className="text-slate-400">Real-time analytics and global wellness metrics</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full glass border border-blue-500/20 text-sm text-blue-300">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
          Live Updates Active
        </div>
      </motion.div>

      {/* Top 3 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard 
          title="Total Users" 
          value={data?.total_users || 0} 
          trend="Live" 
          trendUp={true} 
          icon={Users} 
          color="blue" 
          delay={0.1}
          subtitle="Registered profiles" 
        />
        <MetricCard 
          title="Active Treatments" 
          value={data?.total_users || 0} 
          trend="Live" 
          trendUp={true} 
          icon={Activity} 
          color="purple" 
          delay={0.2}
          subtitle="Currently improving" 
        />
        <MetricCard 
          title="Recovery Rate" 
          value={data?.recovery_rate || "0%"} 
          trend="Live" 
          trendUp={true} 
          icon={TrendingUp} 
          color="emerald" 
          delay={0.3}
          subtitle="Users recovered from stress" 
        />
      </div>

      {/* Active Users Line Chart (Full Width) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ delay: 0.3 }}
        className="glass-dark rounded-2xl p-6 border border-white/5 card-hover"
      >
        <h3 className="text-lg font-semibold text-white mb-6">Active Users (7 Days)</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data?.active_users_data || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
              <YAxis stroke="#64748b" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="users" 
                stroke="#8b5cf6" 
                strokeWidth={3} 
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }} 
                activeDot={{ r: 6, fill: '#fff' }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

    </div>
  );
}

function MetricCard({ title, value, trend, trendUp, icon: Icon, color, delay, subtitle }) {
  const colorMap = {
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/20 text-purple-400',
    emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400',
    rose: 'from-rose-500/20 to-rose-600/5 border-rose-500/20 text-rose-400',
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay }}
      className={`glass-dark rounded-2xl p-5 border ${colorMap[color].split(' ')[2]} card-hover relative overflow-hidden`}
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorMap[color].split(' ').slice(0,2).join(' ')} blur-3xl opacity-50 -mr-10 -mt-10 rounded-full`}></div>
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-slate-400 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
          </div>
          <div className={`p-2 rounded-xl bg-white/5 backdrop-blur-sm border border-white/5 ${colorMap[color].split(' ')[3]}`}>
            <Icon size={20} />
          </div>
        </div>
        
        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
          <p className="text-xs text-slate-400 truncate mr-2">{subtitle}</p>
          <div className={`flex items-center text-xs font-semibold ${trendUp ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
