"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, PenTool, Target, Search, Users, ShieldCheck, Zap, Lock, ArrowRight, BrainCircuit, MessageSquare, Globe, Calculator } from 'lucide-react';

interface Assistant {
  id: string;
  name: string;
  role: string;
  description: string;
  skills: string[];
  icon: any;
  color: string;
  locked?: boolean;
}

const ASSISTANTS: Assistant[] = [
  {
    id: 'copy',
    name: 'CopyMaster IA',
    role: 'Arquitecto de Persuasión',
    description: 'Escribe anuncios que detienen el scroll y obligan a hacer clic. Especializado en ganchos psicológicos.',
    skills: ['Copywriting Directo', 'A/B Headlines', 'Storytelling'],
    icon: PenTool,
    color: '#3b82f6',
    locked: false
  },
  {
    id: 'media',
    name: 'MediaBuyer Pro',
    role: 'Estratega de Tráfico',
    description: 'Optimiza tus audiencias y presupuestos para que cada peso trabaje al máximo de su capacidad.',
    skills: ['Segmentación Hyper-Local', 'Escalado Vertical', 'Retargeting'],
    icon: Target,
    color: '#10b981',
    locked: true
  },
  {
    id: 'seo',
    name: 'Auditor SEO Bolton',
    role: 'Crawler de Autoridad',
    description: 'Analiza la estructura técnica de tu landing y detecta fugas de conversión por velocidad o semántica.',
    skills: ['Core Web Vitals', 'Semántica de Ventas', 'Indexación'],
    icon: Globe,
    color: '#f59e0b',
    locked: true
  },
  {
    id: 'ventas',
    name: 'Cierre-Ventas Bot',
    role: 'Especialista en Lead Closing',
    description: 'Diseña guiones y flujos de seguimiento para convertir leads fríos en clientes reales de alto ticket.',
    skills: ['Scripts de Cierre', 'Nutrición de Leads', 'Manejo de Objeciones'],
    icon: MessageSquare,
    color: '#8b5cf6',
    locked: true
  }
];

export function AssistantsView() {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div className="dashboard-main" style={{ padding: "0 2rem" }}>
      <div style={{ marginBottom: "5rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "3.5rem", fontWeight: 1000, marginBottom: "1.5rem", letterSpacing: "-2px" }}>Marketplace de Talentos AI</h2>
        <p style={{ fontSize: "1.3rem", color: "var(--muted-foreground)", maxWidth: "800px", margin: "0 auto" }}>Habilita agentes especializados para potenciar cada etapa de tu ecosistema comercial. Tu propio equipo de élite digital.</p>
      </div>

      <div className="grid-responsive" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "2.5rem", maxWidth: "1200px", margin: "0 auto" }}>
        {ASSISTANTS.map((as) => (
          <motion.div 
            key={as.id}
            whileHover={{ y: -10 }}
            className="glass"
            style={{ 
              padding: "3.5rem", 
              borderRadius: "3rem", 
              position: "relative",
              overflow: "hidden",
              border: `1px solid ${as.locked ? 'rgba(255,255,255,0.05)' : `${as.color}40`}`,
              background: as.locked ? 'rgba(0,0,0,0.2)' : `linear-gradient(135deg, ${as.color}08 0%, transparent 100%)`,
              transition: "all 0.3s ease"
            }}
          >
            {/* GLOW EFFECT */}
            {!as.locked && (
              <div style={{ position: 'absolute', top: '-20%', right: '-20%', width: '300px', height: '300px', background: `${as.color}15`, filter: 'blur(80px)', borderRadius: '50%' }} />
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: 'relative', zIndex: 1 }}>
               <div className="glass" style={{ padding: "1.2rem", borderRadius: "1.5rem", background: as.locked ? 'rgba(255,255,255,0.05)' : `${as.color}15`, color: as.locked ? 'var(--muted)' : as.color, border: `1px solid ${as.locked ? 'transparent' : `${as.color}30`}` }}>
                  <as.icon size={36} />
               </div>
               {as.locked ? (
                 <div className="glass" style={{ padding: "0.5rem 1rem", borderRadius: "1rem", display: "flex", gap: "0.5rem", alignItems: "center", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <Lock size={14} color="var(--muted)" />
                    <span style={{ fontSize: "0.75rem", fontWeight: 950, color: "var(--muted)", letterSpacing: "1px" }}>LVL 5 REQUERIDO</span>
                 </div>
               ) : (
                 <div className="glass" style={{ padding: "0.5rem 1rem", borderRadius: "1rem", display: "flex", gap: "0.5rem", alignItems: "center", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                    <Zap size={14} color="#10b981" />
                    <span style={{ fontSize: "0.75rem", fontWeight: 950, color: "#10b981", letterSpacing: "1px" }}>DISPONIBLE</span>
                 </div>
               )}
            </div>

            <div style={{ marginTop: "3rem", position: 'relative', zIndex: 1 }}>
              <h3 style={{ fontSize: "2rem", fontWeight: 950, marginBottom: "0.5rem", letterSpacing: "-0.5px" }}>{as.name}</h3>
              <p style={{ fontWeight: 800, color: as.color, fontSize: "0.9rem", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "1.5rem" }}>{as.role}</p>
              <p style={{ fontSize: "1.1rem", opacity: 0.6, lineHeight: 1.6, marginBottom: "2.5rem" }}>{as.description}</p>
              
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem", marginBottom: "3rem" }}>
                {as.skills.map((skill, i) => (
                  <span key={i} style={{ fontSize: "0.75rem", fontWeight: 900, padding: "0.4rem 0.8rem", background: "rgba(255,255,255,0.03)", borderRadius: "0.6rem", border: "1px solid rgba(255,255,255,0.05)" }}>{skill.toUpperCase()}</span>
                ))}
              </div>

              {!as.locked ? (
                 <button className="btn-primary" style={{ width: "100%", padding: "1.2rem", fontWeight: 950, fontSize: "1rem", borderRadius: "1.2rem", display: "flex", gap: "1rem", justifyContent: "center", alignItems: "center" }}>
                    ACTIVAR TALENTO <ArrowRight size={20} />
                 </button>
              ) : (
                 <button className="btn-secondary" disabled style={{ width: "100%", padding: "1.2rem", fontWeight: 950, fontSize: "1rem", borderRadius: "1.2rem", cursor: "not-allowed", opacity: 0.5 }}>
                    MISIONES PENDIENTES
                 </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass grid-responsive" style={{ marginTop: "6rem", padding: "4rem", borderRadius: "3rem", display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(90deg, rgba(59, 130, 246, 0.05), transparent)" }}>
        <div>
           <h4 style={{ fontSize: "1.5rem", fontWeight: 950, marginBottom: "0.5rem" }}>¿Buscas un Agente a medida?</h4>
           <p style={{ opacity: 0.6, fontWeight: 600 }}>Cualquier habilidad de Bolton puede ser encapsulada en un asistente personal.</p>
        </div>
        <button className="glass" style={{ padding: "1.2rem 2.5rem", borderRadius: "1.5rem", fontWeight: 950, fontSize: "0.9rem", border: "1px solid rgba(255,255,255,0.1)" }}>PROPONER NUEVO ASISTENTE</button>
      </div>
    </div>
  );
}
