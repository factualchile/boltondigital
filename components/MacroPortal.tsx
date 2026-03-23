"use client";

import { motion } from "framer-motion";
import { Users, Shield, Rocket, ChevronRight, Lock } from "lucide-react";
import { useState, useEffect } from "react";

interface Category {
  id: string;
  name: string;
  description: string;
  icon: any;
  isActive: boolean;
  color: string;
}

export default function MacroPortal({ onEnterCategory, activeCategories = [], categoryProgress = {} }: { onEnterCategory: (cat: string) => void, activeCategories?: string[], categoryProgress?: Record<string, number> }) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
  };

  const [categories, setCategories] = useState<Category[]>([
    { id: 'clientes', name: 'Clientes', description: 'Atracción, Conversión y Gestión de Leads.', icon: Users, isActive: true, color: '#3b82f6' },
    { id: 'control', name: 'Control', description: 'Gestión de Capital, Auditoría y Seguridad.', icon: Shield, isActive: false, color: '#10b981' },
    { id: 'desarrollo', name: 'Desarrollo', description: 'Estrategia, Mindset y Escalamiento.', icon: Rocket, isActive: false, color: '#f59e0b' },
  ]);

  useEffect(() => {
    setCategories(prev => prev.map(cat => ({
      ...cat,
      isActive: cat.id === 'clientes' || activeCategories.includes(cat.id)
    })));
  }, [activeCategories]);

  return (
    <div style={{ padding: "2rem", minHeight: "80vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div style={{ textAlign: "center", marginBottom: "4rem" }}>
         <h1 style={{ fontSize: "3.5rem", fontWeight: 950, marginBottom: "1rem" }}>Bolton OS</h1>
         <p style={{ color: "var(--muted-foreground)", fontSize: "1.2rem" }}>Selecciona el área de crecimiento que deseas operar hoy.</p>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem", maxWidth: "1200px", margin: "0 auto", width: "100%" }}
      >
        {categories.map((cat) => {
          const catProgress = categoryProgress[cat.id] || 0;
          return (
            <motion.div
              layout
              variants={item}
              key={cat.id}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => onEnterCategory(cat.id)}
              style={{ 
                cursor: "pointer",
                padding: "3rem 2rem",
                borderRadius: "1.5rem",
                background: "rgba(255,255,255,0.02)",
                border: `1px solid ${cat.isActive ? cat.color : 'rgba(255,255,255,0.05)'}`,
                filter: cat.isActive ? "none" : "grayscale(100%) opacity(0.5)",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                textAlign: "center",
                position: "relative",
                boxShadow: cat.isActive ? `0 20px 40px ${cat.color}11` : 'none'
              }}
            >
              {cat.isActive && (
                <div style={{ position: "absolute", top: "1rem", right: "2rem", fontSize: "0.8rem", fontWeight: 900, color: cat.color }}>
                   {catProgress}% COMPLETADO
                </div>
              )}
              
              <div style={{ 
                background: cat.isActive ? cat.color : 'rgba(255,255,255,0.05)', 
                width: "80px", height: "80px", borderRadius: "2rem", 
                display: "flex", alignItems: "center", justifyContent: "center", 
                margin: "0 auto 2rem",
                boxShadow: cat.isActive ? `0 10px 30px ${cat.color}44` : 'none'
              }}>
                <cat.icon size={40} color={cat.isActive ? "white" : "var(--muted-foreground)"} />
              </div>
              
              <h3 style={{ fontSize: "1.8rem", fontWeight: 950, marginBottom: "1rem" }}>{cat.name}</h3>
              <p style={{ fontSize: "0.95rem", color: "var(--muted-foreground)", lineHeight: 1.5, marginBottom: "2rem" }}>{cat.description}</p>
              
              {cat.isActive && (
                <div style={{ height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", marginBottom: "2rem", overflow: "hidden" }}>
                   <motion.div initial={{ width: 0 }} animate={{ width: `${catProgress}%` }} style={{ height: "100%", background: cat.color }} />
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", fontWeight: 800, color: cat.isActive ? cat.color : 'var(--muted)' }}>
                 {cat.isActive ? <>Explorar Camino <ChevronRight size={18} /></> : <><Lock size={16} /> Bloqueado</>}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
