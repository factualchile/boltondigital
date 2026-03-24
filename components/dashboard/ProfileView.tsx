"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Zap, TrendingUp, Clock, LogOut, X, Coins, CheckCircle2 } from 'lucide-react';

interface ProfileViewProps {
  user: any;
  onClose: () => void;
  onLogout: () => void;
}

export function ProfileView({ user, onClose, onLogout }: ProfileViewProps) {
  const [usage, setUsage] = useState<{ tokens_used: number; monthly_limit: number; last_reset: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsage() {
      if (!user?.id) return;
      try {
        const res = await fetch(`/api/profile/tokens?userId=${user.id}`);
        const data = await res.json();
        setUsage(data);
      } catch (e) {
        console.error("Error fetching tokens:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchUsage();
  }, [user]);

  const percent = usage ? Math.min(100, (usage.tokens_used / usage.monthly_limit) * 100) : 0;
  const isLimitReached = percent >= 100;

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="profile-sidebar glass"
      style={{ 
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '450px', 
        maxWidth: '100%',
        background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(40px)',
        borderLeft: '1px solid rgba(255,255,255,0.1)', zIndex: 2000,
        padding: '2rem', display: 'flex', flexDirection: 'column'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
         <h3 style={{ fontSize: '1.8rem', fontWeight: 950, letterSpacing: '-1px' }}>Perfil de Socio</h3>
         <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
            <X size={24} />
         </button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
         <div className="glass" style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', border: '2px solid rgba(255,255,255,0.1)' }}>
            <User size={50} color="white" />
         </div>
         <h4 style={{ fontSize: '1.4rem', fontWeight: 900 }}>{user?.email?.split('@')[0]}</h4>
         <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '0.5rem', fontWeight: 600 }}>ID: {user?.id?.slice(0, 8)}...</p>
      </div>

      <div className="glass" style={{ padding: '2.5rem', borderRadius: '2rem', background: 'rgba(255,255,255,0.02)', marginBottom: '3rem', border: '1px solid rgba(255,255,255,0.05)' }}>
         <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem' }}>
            <Coins size={20} color="var(--primary)" />
            <span style={{ fontWeight: 950, fontSize: '0.8rem', letterSpacing: '2px' }}>TOKENOMICS BOLTON</span>
         </div>

         {loading ? (
            <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <div className="animate-spin" style={{ width: '20px', height: '20px', border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }} />
            </div>
         ) : (
            <>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontWeight: 900 }}>
                  <span style={{ fontSize: '0.9rem' }}>Consumo Mensual</span>
                  <span style={{ color: isLimitReached ? '#ef4444' : 'white' }}>{percent.toFixed(1)}%</span>
               </div>
               
               <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${percent}%` }} 
                    style={{ height: '100%', background: isLimitReached ? '#ef4444' : 'var(--primary)', boxShadow: `0 0 15px ${isLimitReached ? '#ef444450' : 'var(--primary)40'}` }} 
                  />
               </div>

               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, opacity: 0.6 }}>
                  <span>{usage?.tokens_used?.toLocaleString()} used</span>
                  <span>{usage?.monthly_limit?.toLocaleString()} total</span>
               </div>

               <div style={{ marginTop: '2.5rem', display: 'flex', gap: '0.8rem', alignItems: 'center', padding: '1rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <Clock size={16} color="var(--muted)" />
                  <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--muted)' }}>
                    Reinicio automático el {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleDateString()}
                  </p>
               </div>
            </>
         )}
      </div>

      <div style={{ flex: 1 }} />

      <button 
        onClick={onLogout}
        className="glass" 
        style={{ 
          width: '100%', padding: '1.5rem', borderRadius: '1.5rem', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem',
          color: '#ef4444', fontWeight: 950, border: '1px solid rgba(239, 68, 68, 0.2)',
          transition: 'all 0.2s', background: 'rgba(239, 68, 68, 0.05)'
        }}
      >
        <LogOut size={20} /> CERRAR SESIÓN
      </button>
    </motion.div>
  );
}
