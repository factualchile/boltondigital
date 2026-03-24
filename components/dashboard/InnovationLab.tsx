"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TestTube2, Sparkles, Binary, Cpu, Atom, Radar, Share2, FlaskConical, Zap, Activity, Microscope, Wand2, BarChart4, ChevronRight } from 'lucide-react';

interface LabTool {
  id: string;
  name: string;
  status: 'active' | 'beta' | 'locked';
  description: string;
  icon: any;
  color: string;
  loadTime: number;
}

const LAB_TOOLS: LabTool[] = [
  {
    id: 'visual-gen',
    name: 'AI Visual Generator',
    status: 'beta',
    description: 'Genera variantes de anuncios de alto impacto visual basadas en los ganchos de tu campaña.',
    icon: Wand2,
    color: '#f59e0b',
    loadTime: 3000
  },
  {
    id: 'ab-predictor',
    name: 'A/B Success Predictor',
    status: 'locked',
    description: 'Nuestra red neuronal simula el comportamiento de usuarios para predecir qué variante ganará.',
    icon: Cpu,
    color: '#ef4444',
    loadTime: 5000
  },
  {
    id: 'sentiment-radar',
    name: 'Market Sentiment Radar',
    status: 'beta',
    description: 'Escaneo profundo de tendencias y sentimiento de audiencia en tiempo real (Google Trends integration).',
    icon: Radar,
    color: '#3b82f6',
    loadTime: 4000
  }
];

export function InnovationLab() {
  const [runningTool, setRunningTool] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const startExperiment = (tool: LabTool) => {
    if (tool.status === 'locked') return;
    setRunningTool(tool.id);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + (100 / (tool.loadTime / 100));
      });
    }, 100);
  };

  return (
    <div style={{ padding: "0 2rem" }}>
      <div style={{ marginBottom: "5rem", textAlign: "center" }}>
        <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', marginBottom: '1.5rem', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
           <FlaskConical size={40} color="#f59e0b" className="animate-pulse" />
        </div>
        <h2 style={{ fontSize: "3.5rem", fontWeight: 1000, marginBottom: "1.5rem", letterSpacing: "-2px" }}>Laboratorio de Innovación</h2>
        <p style={{ fontSize: "1.3rem", color: "var(--muted-foreground)", maxWidth: "800px", margin: "0 auto" }}>Prueba las herramientas de IA más potentes del ecosistema Bolton antes de su lanzamiento global. El futuro del ROI se escribe aquí.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
        {LAB_TOOLS.map((tool) => (
          <motion.div 
            key={tool.id}
            whileHover={{ y: -5 }}
            className="glass"
            style={{ 
              padding: "3rem", 
              borderRadius: "2.5rem", 
              background: "rgba(255,255,255,0.01)", 
              border: "1px solid rgba(255,255,255,0.05)",
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* AMBIENT BACKGROUND */}
            <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', opacity: 0.05, transform: 'rotate(-15deg)' }}>
               <tool.icon size={200} color={tool.color} />
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div className="glass" style={{ padding: '0.8rem', borderRadius: '1rem', color: tool.color, background: `${tool.color}15` }}>
                   <tool.icon size={28} />
                </div>
                <div className="glass" style={{ padding: '0.4rem 1rem', borderRadius: '1rem', fontSize: '0.7rem', fontWeight: 950, letterSpacing: '1px', border: `1px solid ${tool.status === 'locked' ? 'rgba(255,255,255,0.1)' : `${tool.color}40`}`, color: tool.status === 'locked' ? 'var(--muted)' : tool.color }}>
                   {tool.status.toUpperCase()}
                </div>
              </div>

              <h3 style={{ fontSize: '1.6rem', fontWeight: 950, marginBottom: '1rem' }}>{tool.name}</h3>
              <p style={{ fontSize: '1rem', opacity: 0.5, lineHeight: 1.6, marginBottom: '2.5rem', fontWeight: 500 }}>{tool.description}</p>

              {runningTool === tool.id ? (
                <div style={{ marginTop: '2rem' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 950 }}>
                      <span style={{ color: tool.color }}>SINCRONIZANDO NEURONAS...</span>
                      <span>{Math.floor(progress)}%</span>
                   </div>
                   <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} style={{ height: '100%', background: tool.color, boxShadow: `0 0 15px ${tool.color}50` }} />
                   </div>
                </div>
              ) : (
                <button 
                  onClick={() => startExperiment(tool)}
                  disabled={tool.status === 'locked'}
                  className={tool.status === 'locked' ? "btn-secondary" : "btn-primary"}
                  style={{ 
                    width: '100%', 
                    padding: '1.2rem', 
                    fontWeight: 950, 
                    borderRadius: '1.2rem', 
                    fontSize: '0.9rem', 
                    cursor: tool.status === 'locked' ? 'not-allowed' : 'pointer',
                    opacity: tool.status === 'locked' ? 0.3 : 1
                  }}
                >
                  {tool.status === 'locked' ? 'ACCESO RESTRINGIDO' : 'INICIAR EXPERIMENTO'}
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass" style={{ marginTop: '6rem', padding: '5rem', borderRadius: '4rem', display: 'flex', position: 'relative', overflow: 'hidden', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
         <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.08) 0%, transparent 100%)' }} />
         
         <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>
            <div>
               <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', color: 'var(--primary)', marginBottom: '1.5rem' }}>
                  <Binary size={24} />
                  <span style={{ fontWeight: 950, fontSize: '0.8rem', letterSpacing: '4px' }}>TELEMETRÍA DE LABORATORIO</span>
               </div>
               <h3 style={{ fontSize: '2.5rem', fontWeight: 950, marginBottom: '1.5rem' }}>Optimización en Tiempo Real</h3>
               <p style={{ fontSize: '1.2rem', opacity: 0.6, lineHeight: 1.7, fontWeight: 500 }}>
                 Todos los experimentos del laboratorio se alimentan de la base de datos distribuida de Bolton. Contribuyes al cerebro colectivo mientras obtienes una ventaja injusta en tu nicho.
               </p>
            </div>
            
            <div className="glass" style={{ padding: '3rem', borderRadius: '2.5rem', background: 'rgba(0,0,0,0.2)' }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {[
                    { label: "Procesamiento IA", value: "98.2%", icon: Cpu },
                    { label: "Nivel de Innovación", value: "Alpha 3", icon: Zap },
                    { label: "Carga Neuronal", value: "Sincronizada", icon: Activity }
                  ].map((stat, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <stat.icon size={20} color="var(--primary)" />
                          <span style={{ fontWeight: 800, fontSize: '0.9rem', opacity: 0.6 }}>{stat.label}</span>
                       </div>
                       <span style={{ fontWeight: 950, fontSize: '1.1rem' }}>{stat.value}</span>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
