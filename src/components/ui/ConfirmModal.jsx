import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Are you sure?", 
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDanger = true
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }} 
          animate={{ scale: 1, y: 0 }} 
          exit={{ scale: 0.9, y: 20 }}
          className="glass rounded-2xl p-6 w-full max-w-sm border border-white/10 relative overflow-hidden" 
          onClick={e => e.stopPropagation()}
        >
          {/* Subtle gradient accent at the top */}
          <div className={`absolute top-0 left-0 w-full h-1 ${isDanger ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`} />
          
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
            <X size={18} />
          </button>

          <div className="flex flex-col items-center text-center mt-2">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isDanger ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
              <AlertTriangle size={24} />
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-slate-400 text-sm mb-6">{message}</p>
            
            <div className="flex gap-3 w-full">
              <button 
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 font-medium transition-all text-sm"
              >
                {cancelText}
              </button>
              <button 
                onClick={() => { onConfirm(); onClose(); }}
                className={`flex-1 py-2.5 rounded-xl text-white font-medium transition-all text-sm ${
                  isDanger 
                    ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-blue-500/20'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
