"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, MessageSquare, Target, Zap, TrendingUp, AlertCircle } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ClaudioCloneProps {
  userId: string;
  campaignData: {
    id: string;
    metrics: any;
    insight: any;
    funnel: any;
  };
}

const QUICK_ACTIONS = [
  "¿Cómo puedo mejorar mi ROAS?",
  "Audita mi Landing Page actual",
  "¿Por qué mis clics no convierten?",
  "Optimiza mi presupuesto diario"
];

export function ClaudioClone({ campaignData, userId }: ClaudioCloneProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hola. Soy tu mentor estratégico. He analizado tu campaña "${campaignData.id}" y tengo algunas ideas claras sobre cómo escalar. ¿Qué necesitas saber hoy?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/claudio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          userId: userId,
          campaignContext: {
            id: campaignData.id,
            metrics: campaignData.metrics,
            insight: campaignData.insight
          }
        })
      });

      const data = await res.json();
      if (data.response) {
        const assistantMsg: Message = { role: 'assistant', content: data.response, timestamp: new Date() };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        throw new Error("Respuesta vacía de IA");
      }
    } catch (error) {
       const errorMsg: Message = { 
         role: 'assistant', 
         content: "Lo siento, mi conexión estratégica está teniendo interferencias. Revisa tu saldo de tokens o intenta de nuevo.", 
         timestamp: new Date() 
       };
       setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="glass dashboard-main" style={{ display: 'flex', flexDirection: 'column', height: '800px', maxHeight: '85vh', maxWidth: '1000px', margin: '0 auto', borderRadius: '3rem', border: '1px solid rgba(59, 130, 246, 0.3)', overflow: 'hidden', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(40px)' }}>
      {/* HEADER */}
      <div className="dashboard-header" style={{ padding: '2rem 3rem', background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.1), transparent)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div className="glass" style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(59, 130, 246, 0.4)' }}>
            <Sparkles size={32} color="white" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 950, letterSpacing: '-1px' }}>Clon de Claudio</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
              <p style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Arquitecto de ROI • Activo</p>
            </div>
          </div>
        </div>
        <div className="glass" style={{ padding: '0.75rem 1.5rem', borderRadius: '1rem', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '0.2rem' }}>CONTEXTO ACTUAL</p>
          <p style={{ fontWeight: 800, fontSize: '0.9rem' }}>{campaignData.id}</p>
        </div>
      </div>

      {/* CHAT BODY */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '3rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {messages.map((msg, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ 
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              display: 'flex',
              gap: '1rem',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
            }}
          >
            <div className="glass" style={{ 
              width: '40px', height: '40px', borderRadius: '50%', 
              background: msg.role === 'user' ? 'rgba(255,255,255,0.05)' : 'rgba(59, 130, 246, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)'
            }}>
              {msg.role === 'user' ? <User size={20} /> : <Bot size={20} color="var(--primary)" />}
            </div>
            <div className="glass" style={{ 
              padding: '1.5rem 2rem', 
              borderRadius: msg.role === 'user' ? '2rem 4px 2rem 2rem' : '4px 2rem 2rem 2rem',
              background: msg.role === 'user' ? 'rgba(255,255,255,0.03)' : 'rgba(59, 130, 246, 0.05)',
              border: msg.role === 'user' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(59, 130, 246, 0.2)',
              fontSize: '1.1rem', lineHeight: 1.6, fontWeight: 500, color: 'white'
            }}>
              {msg.content}
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div className="glass" style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bot size={20} color="var(--primary)" /></div>
            <div className="typing-dots">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
      </div>

      {/* QUICK ACTIONS */}
      <div style={{ padding: '0 3rem 1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {QUICK_ACTIONS.map((action, i) => (
          <button 
            key={i} 
            onClick={() => handleSend(action)}
            className="glass"
            style={{ padding: '0.8rem 1.2rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)', color: 'var(--muted)', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}
          >
            {action}
          </button>
        ))}
      </div>

      {/* INPUT AREA */}
      <div style={{ padding: '2rem 3rem 3rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="glass" style={{ 
          background: 'rgba(255,255,255,0.02)', borderRadius: '2rem', padding: '0.75rem',
          display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <input 
            type="text" 
            placeholder="Conversa con el Clon de Claudio..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend(input)}
            style={{ flex: 1, background: 'none', border: 'none', color: 'white', padding: '0.5rem 1.5rem', fontSize: '1.1rem', fontWeight: 500, outline: 'none' }}
          />
          <button 
            onClick={() => handleSend(input)}
            className="btn-primary" 
            style={{ width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
          >
            <Send size={24} />
          </button>
        </div>
      </div>

      <style jsx>{`
        .typing-dots { display: flex; gap: 4px; }
        .typing-dots span { width: 8px; height: 8px; background: var(--primary); border-radius: 50%; animation: bounce 1.4s infinite ease-in-out; opacity: 0.6; }
        .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
        .typing-dots span:nth-child(2) { animation-delay: -0.16s; }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }
      `}</style>
    </div>
  );
}
