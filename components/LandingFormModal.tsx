"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Send, User, Briefcase, Phone, MapPin, Star } from "lucide-react";

interface LandingFormModalProps {
  onClose: () => void;
  onConfirm: (formData: any) => void;
  initialData?: any;
}

export default function LandingFormModal({ onClose, onConfirm, initialData }: LandingFormModalProps) {
  const [formData, setFormData] = useState({
    full_name: initialData?.full_name || "",
    profession: initialData?.profession || "",
    main_service: initialData?.main_service || "",
    phone: initialData?.phone || "",
    location: initialData?.location || "Concepción, Chile",
    imageUrl: initialData?.imageUrl || "",
    specialties_raw: initialData?.specialties_raw || "",
    description: initialData?.description || ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(formData);
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2200, backdropFilter: "blur(12px)" }}>
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="glass"
        style={{ 
          width: "100%", 
          maxWidth: "550px", 
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "3rem", 
          position: "relative", 
          border: "1px solid rgba(59, 130, 246, 0.3)", 
          borderRadius: "2rem", 
          background: "var(--background)",
          scrollbarWidth: "none",
          msOverflowStyle: "none"
        }}
      >
        <button onClick={onClose} style={{ position: "absolute", top: "1.5rem", right: "1.5rem", background: "transparent", border: "none", color: "white", cursor: "pointer", opacity: 0.5 }}><X size={24} /></button>

        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "rgba(59, 130, 246, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
            <Star color="var(--primary)" fill="var(--primary)" size={30} />
          </div>
          <h3 style={{ fontSize: "2rem", fontWeight: 950, marginBottom: "0.5rem" }}>Tu Landing Profesional</h3>
          <p style={{ opacity: 0.6 }}>Confirma los datos que Bolton IA usará para construir tu sitio.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="input-group">
              <label style={{ fontSize: "0.65rem", fontWeight: 900, color: "var(--primary)", letterSpacing: "1px", display: "block", marginBottom: "0.5rem" }}>
                <User size={12} style={{ display: 'inline', marginRight: '4px' }} /> NOMBRE COMPLETO
              </label>
              <input 
                required
                className="glass" 
                style={{ width: "100%", padding: "0.8rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", borderRadius: "0.8rem" }}
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              />
            </div>
            <div className="input-group">
              <label style={{ fontSize: "0.65rem", fontWeight: 900, color: "var(--primary)", letterSpacing: "1px", display: "block", marginBottom: "0.5rem" }}>
                <Briefcase size={12} style={{ display: 'inline', marginRight: '4px' }} /> PROFESIÓN
              </label>
              <input 
                required
                className="glass" 
                style={{ width: "100%", padding: "0.8rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", borderRadius: "0.8rem" }}
                value={formData.profession}
                onChange={(e) => setFormData({...formData, profession: e.target.value})}
              />
            </div>
          </div>

          <div className="input-group">
            <label style={{ fontSize: "0.65rem", fontWeight: 900, color: "var(--primary)", letterSpacing: "1px", display: "block", marginBottom: "0.5rem" }}>SERVICIO PRINCIPAL A DESTACAR</label>
            <input 
              required
              placeholder="Ej: Terapia de Parejas Online"
              className="glass" 
              style={{ width: "100%", padding: "0.8rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", borderRadius: "0.8rem" }}
              value={formData.main_service}
              onChange={(e) => setFormData({...formData, main_service: e.target.value})}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="input-group">
              <label style={{ fontSize: "0.65rem", fontWeight: 900, color: "var(--primary)", letterSpacing: "1px", display: "block", marginBottom: "0.5rem" }}>
                <Phone size={12} style={{ display: 'inline', marginRight: '4px' }} /> WHATSAPP
              </label>
              <input 
                required
                placeholder="+569..."
                className="glass" 
                style={{ width: "100%", padding: "0.8rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", borderRadius: "0.8rem" }}
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div className="input-group">
              <label style={{ fontSize: "0.65rem", fontWeight: 900, color: "var(--primary)", letterSpacing: "1px", display: "block", marginBottom: "0.5rem" }}>
                <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} /> UBICACIÓN
              </label>
              <input 
                required
                className="glass" 
                style={{ width: "100%", padding: "0.8rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", borderRadius: "0.8rem" }}
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>
          </div>

          <div className="input-group">
            <label style={{ fontSize: "0.65rem", fontWeight: 900, color: "var(--primary)", letterSpacing: "1px", display: "block", marginBottom: "0.5rem" }}>URL DE TU FOTO PROFESIONAL</label>
            <input 
              placeholder="https://ejemplo.com/tu-foto.jpg"
              className="glass" 
              style={{ width: "100%", padding: "0.8rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", borderRadius: "0.8rem" }}
              value={formData.imageUrl}
              onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
            />
          </div>

          <div className="input-group">
            <label style={{ fontSize: "0.65rem", fontWeight: 900, color: "var(--primary)", letterSpacing: "1px", display: "block", marginBottom: "0.5rem" }}>BREVE DESCRIPCIÓN PROFESIONAL (BIO)</label>
            <textarea 
              rows={2}
              placeholder="Ej: Con más de diez años de experiencia transformando vidas..."
              className="glass" 
              style={{ width: "100%", padding: "0.8rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", borderRadius: "0.8rem", resize: "none", fontSize: "0.9rem" }}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="input-group">
            <label style={{ fontSize: "0.65rem", fontWeight: 900, color: "var(--primary)", letterSpacing: "1px", display: "block", marginBottom: "0.5rem" }}>ÁREAS DE ESPECIALIDAD (UNA POR LÍNEA)</label>
            <textarea 
              rows={3}
              placeholder="Ej: Terapia Cognitiva&#10;Manejo de Ansiedad&#10;Depresión Post-Parto"
              className="glass" 
              style={{ width: "100%", padding: "0.8rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", borderRadius: "0.8rem", resize: "none", fontSize: "0.9rem" }}
              value={formData.specialties_raw}
              onChange={(e) => setFormData({...formData, specialties_raw: e.target.value})}
            />
          </div>

          <button 
            type="submit"
            className="btn-primary"
            style={{ width: "100%", padding: "1.2rem", marginTop: "1rem", fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem" }}
          >
            CONFIRMAR Y DESPLEGAR <Send size={18} />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
