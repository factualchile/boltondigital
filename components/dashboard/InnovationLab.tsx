"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FlaskConical, Beaker } from 'lucide-react';

export function InnovationLab() {
  return (
    <div className="dashboard-main" style={{ padding: "0 2rem", minHeight: "60vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: "center" }}
      >
        <div style={{ display: 'inline-flex', padding: '2rem', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.05)', marginBottom: '2.5rem', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
           <FlaskConical size={60} color="#f59e0b" style={{ opacity: 0.5 }} />
        </div>
        
        <h2 style={{ fontSize: "3rem", fontWeight: 1000, marginBottom: "1.5rem", letterSpacing: "-2px", color: "white" }}>
          Laboratorio de Innovación
        </h2>
        
        <div className="glass" style={{ padding: "3rem", borderRadius: "2rem", border: "1px solid rgba(255,255,255,0.05)", maxWidth: "500px", margin: "0 auto", background: "rgba(255,255,255,0.01)" }}>
          <Beaker size={32} color="var(--primary)" style={{ margin: "0 auto 1.5rem", opacity: 0.4 }} />
          <p style={{ fontSize: "1.2rem", color: "rgba(255,255,255,0.6)", fontWeight: 600, lineHeight: 1.6 }}>
            No hay experimentos activos por el momento. 
          </p>
          <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.4)", marginTop: "1rem" }}>
            Estamos diseñando nuevas herramientas tácticas para tu crecimiento. Vuelve pronto.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
