import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageCircle } from 'lucide-react';
import { getTherapistChats, sendTherapistChat, subscribeToTherapistChats } from '../lib/db';

export default function UserTherapistChat({ userId, therapist, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    let subscription;
    async function load() {
      const { data } = await getTherapistChats(userId, therapist.id);
      setMessages(data || []);
      setLoading(false);

      subscription = subscribeToTherapistChats(userId, therapist.id, (payload) => {
        setMessages(prev => {
          // Avoid duplicates from optimistic update
          const exists = prev.some(m => m.id === payload.new.id);
          return exists ? prev : [...prev, payload.new];
        });
      });
    }
    load();
    return () => { if (subscription) subscription.unsubscribe(); };
  }, [userId, therapist.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const msg = input.trim();
    setInput('');

    const tempMsg = {
      id: `temp-${Date.now()}`,
      sender_id: userId,
      receiver_id: therapist.id,
      message: msg,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMsg]);

    await sendTherapistChat(userId, therapist.id, msg);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          className="relative glass-dark border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col"
          style={{ height: '75vh', maxHeight: '600px' }}
        >
          {/* Header */}
          <div className="flex items-center gap-4 p-4 border-b border-white/5 flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white font-bold">
              {therapist.name?.charAt(0) || 'T'}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white">{therapist.name}</h3>
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                Online
              </span>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-all">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
              <div className="text-center text-slate-500 py-8">Loading conversation...</div>
            ) : messages.length === 0 ? (
              <div className="text-center text-slate-500 py-8">
                <MessageCircle size={36} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">Send a message to start your session</p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMe = msg.sender_id === userId;
                return (
                  <motion.div
                    key={msg.id || idx}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${isMe ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-slate-700/80 text-slate-100 rounded-bl-sm'}`}>
                      <p className="text-sm leading-relaxed">{msg.message}</p>
                      <span className="text-[10px] opacity-50 mt-1 block">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </motion.div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="flex gap-2 p-4 border-t border-white/5 flex-shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 text-sm transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-12 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white flex items-center justify-center rounded-xl transition-all"
            >
              <Send size={18} />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
