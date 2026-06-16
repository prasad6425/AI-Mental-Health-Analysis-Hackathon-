import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, User, MessageCircle } from 'lucide-react';
import { getAssignedPatients, getTherapistChats, sendTherapistChat, subscribeToTherapistChats } from '../../lib/db';

export default function TherapistChat({ authUserId }) {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    async function loadPatients() {
      const { data } = await getAssignedPatients(authUserId);
      setPatients(data || []);
      setLoading(false);
    }
    loadPatients();
  }, [authUserId]);

  useEffect(() => {
    if (!selectedPatientId) return;

    let subscription;
    async function loadMessages() {
      const { data } = await getTherapistChats(authUserId, selectedPatientId);
      setMessages(data || []);
      
      subscription = subscribeToTherapistChats(authUserId, selectedPatientId, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      });
    }
    loadMessages();

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [authUserId, selectedPatientId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedPatientId) return;
    
    const msg = input.trim();
    setInput('');
    
    // Optimistic update
    const tempMsg = {
      id: Date.now().toString(),
      sender_id: authUserId,
      receiver_id: selectedPatientId,
      message: msg,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMsg]);
    
    await sendTherapistChat(authUserId, selectedPatientId, msg);
  };

  if (loading) return <div className="text-slate-400">Loading chat...</div>;

  return (
    <div className="flex h-[700px] glass-dark border border-white/5 rounded-2xl overflow-hidden">
      {/* Patient List Sidebar */}
      <div className="w-1/3 border-r border-white/5 flex flex-col">
        <div className="p-4 border-b border-white/5">
          <h3 className="font-semibold text-white">Patients</h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {patients.length === 0 ? (
            <p className="text-slate-500 text-sm p-4 text-center">No assigned patients.</p>
          ) : (
            patients.map((assignment) => {
              const p = assignment.users;
              const isSelected = selectedPatientId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPatientId(p.id)}
                  className={`w-full flex items-center gap-3 p-4 border-b border-white/5 transition-all text-left ${isSelected ? 'bg-blue-500/10' : 'hover:bg-white/5'}`}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold">
                    {p.full_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className={`font-medium ${isSelected ? 'text-blue-400' : 'text-slate-200'}`}>{p.full_name}</p>
                    <p className="text-xs text-slate-500 truncate">{p.email}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="w-2/3 flex flex-col bg-black/20">
        {!selectedPatientId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <MessageCircle size={48} className="mb-4 opacity-50" />
            <p>Select a patient to start messaging</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg, idx) => {
                const isMe = msg.sender_id === authUserId;
                return (
                  <motion.div
                    key={msg.id || idx}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none'}`}>
                      <p className="text-sm">{msg.message}</p>
                      <span className="text-[10px] opacity-50 mt-1 block">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            
            <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-slate-900/50 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-all text-sm"
              />
              <button 
                type="submit"
                disabled={!input.trim()}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white w-12 flex items-center justify-center rounded-xl transition-all"
              >
                <Send size={18} />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
