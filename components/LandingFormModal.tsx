"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, User, Briefcase, Phone, MapPin, Star, Image as ImageIcon, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface LandingFormModalProps {
  onClose: () => void;
  onConfirm: (formData: any) => void;
  initialData?: any;
  userId: string;
}

export default function LandingFormModal({ onClose, onConfirm, initialData, userId }: LandingFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    service: initialData?.service || "",
    location: initialData?.location || "",
    imageUrl: initialData?.imageUrl || "",
    slogan: initialData?.slogan || "",
    name: initialData?.name || "",
    profession: initialData?.profession || "",
    specialties_raw: initialData?.specialties_raw || "",
    includeGuarantee: initialData?.includeGuarantee !== undefined ? initialData.includeGuarantee : true,
    phoneCode: "+56",
    phone: initialData?.phone?.replace("+56", "").trim() || ""
  });

  const [showGuaranteeAlert, setShowGuaranteeAlert] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("userId", userId);

      const uploadRes = await fetch("/api/storage/upload", {
        method: "POST",
        body: formDataUpload
      });
      
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || "Fallo en la carga");

      const publicUrl = uploadData.publicUrl;
      setFormData({ ...formData, imageUrl: publicUrl });
    } catch (error: any) {
      console.error("Error uploading image:", error);
      alert("Error al subir la imagen a través del procesador Bolton: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Split specialties
    const specialties = formData.specialties_raw
      .split('\n')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);

    if (specialties.length < 10) {
      alert("Por favor, incluye al menos 10 áreas o temas que abordas.");
      return;
    }

    const finalData = {
      ...formData,
      specialties,
      phone: `${formData.phoneCode} ${formData.phone}`.trim()
    };

    onConfirm(finalData);
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.95)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2200, backdropFilter: "blur(20px)" }}>
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        style={{ 
          width: "100%", 
          maxWidth: "700px", 
          maxHeight: "92vh",
          overflowY: "auto",
          padding: "3rem", 
          position: "relative", 
          border: "1px solid rgba(59, 130, 246, 0.2)", 
          borderRadius: "2.5rem", 
          background: "#0f172a",
          boxShadow: "0 50px 100px -20px rgba(0,0,0,0.5)",
          color: "white"
        }}
      >
        <button onClick={onClose} style={{ position: "absolute", top: "1.5rem", right: "1.5rem", background: "transparent", border: "none", color: "white", cursor: "pointer", opacity: 0.5 }}><X size={24} /></button>

        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "1.2rem", background: "rgba(59, 130, 246, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", border: "1px solid rgba(59, 130, 246, 0.3)" }}>
            <Star color="#3b82f6" fill="#3b82f6" size={32} />
          </div>
          <h3 style={{ fontSize: "2.2rem", fontWeight: 950, marginBottom: "0.5rem", letterSpacing: "-1px" }}>Configura tu Landing</h3>
          <p style={{ opacity: 0.6, fontSize: "1rem" }}>Completa los 10 puntos clave para tu presencia digital profesional.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.8rem" }}>
          
          {/* 1. Título */}
          <div className="input-group">
            <label style={{ fontSize: "0.75rem", fontWeight: 900, color: "#3b82f6", letterSpacing: "1.5px", display: "block", marginBottom: "0.6rem" }}>1. TÍTULO DE LA LANDING</label>
            <input 
              required
              placeholder="Ej: Atención psicológica para adultos"
              style={{ width: "100%", padding: "1rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "white", borderRadius: "1rem", fontSize: "1rem" }}
              value={formData.service}
              onChange={(e) => setFormData({...formData, service: e.target.value})}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            {/* 2. Ubicación */}
            <div className="input-group">
              <label style={{ fontSize: "0.75rem", fontWeight: 900, color: "#3b82f6", letterSpacing: "1.5px", display: "block", marginBottom: "0.6rem" }}>2. UBICACIÓN</label>
              <div style={{ position: "relative" }}>
                <MapPin size={18} style={{ position: "absolute", left: "1rem", top: "1rem", opacity: 0.4 }} />
                <input 
                  required
                  placeholder="Ej: Concepción"
                  style={{ width: "100%", padding: "1rem 1rem 1rem 3rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "white", borderRadius: "1rem" }}
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>
            </div>

            {/* 5. Nombre Profesional */}
            <div className="input-group">
              <label style={{ fontSize: "0.75rem", fontWeight: 900, color: "#3b82f6", letterSpacing: "1.5px", display: "block", marginBottom: "0.6rem" }}>5. NOMBRE PROFESIONAL</label>
              <div style={{ position: "relative" }}>
                <User size={18} style={{ position: "absolute", left: "1rem", top: "1rem", opacity: 0.4 }} />
                <input 
                  required
                  placeholder="Ej: Juan Pérez Soto"
                  style={{ width: "100%", padding: "1rem 1rem 1rem 3rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "white", borderRadius: "1rem" }}
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* 3. Foto (Upload) */}
          <div className="input-group">
            <label style={{ fontSize: "0.75rem", fontWeight: 900, color: "#3b82f6", letterSpacing: "1.5px", display: "block", marginBottom: "0.6rem" }}>3. FOTO DEL PROFESIONAL</label>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{
                  flex: 1,
                  padding: "1rem",
                  background: "rgba(59, 130, 246, 0.1)",
                  border: "1px dashed rgba(59, 130, 246, 0.5)",
                  borderRadius: "1rem",
                  color: "#3b82f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.8rem",
                  cursor: "pointer",
                  fontWeight: 700
                }}
              >
                {uploading ? <Loader2 className="animate-spin" size={20} /> : <ImageIcon size={20} />}
                {formData.imageUrl ? "CAMBIAR FOTO" : "SUBIR ARCHIVO"}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                style={{ display: "none" }} 
                accept="image/*"
              />
              {formData.imageUrl && (
                <div style={{ width: "50px", height: "50px", borderRadius: "50%", overflow: "hidden", border: "2px solid #3b82f6" }}>
                  <img src={formData.imageUrl} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}
            </div>
          </div>

          {/* 4. Slogan */}
          <div className="input-group">
            <label style={{ fontSize: "0.75rem", fontWeight: 900, color: "#3b82f6", letterSpacing: "1.5px", display: "block", marginBottom: "0.6rem" }}>4. SLOGAN</label>
            <input 
              required
              placeholder="Ej: Comprometido con el bienestar de las parejas en Chile."
              style={{ width: "100%", padding: "1rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "white", borderRadius: "1rem" }}
              value={formData.slogan}
              onChange={(e) => setFormData({...formData, slogan: e.target.value})}
            />
          </div>

          {/* 6. Profesión + Años */}
          <div className="input-group">
            <label style={{ fontSize: "0.75rem", fontWeight: 900, color: "#3b82f6", letterSpacing: "1.5px", display: "block", marginBottom: "0.6rem" }}>6. PROFESIÓN + OFICIO + AÑOS DE EXPERIENCIA</label>
            <textarea 
              required
              rows={2}
              placeholder="Ej: Psicólogo y psicoterapeuta con más de 12 años de experiencia"
              style={{ width: "100%", padding: "1rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "white", borderRadius: "1rem", resize: "none" }}
              value={formData.profession}
              onChange={(e) => setFormData({...formData, profession: e.target.value})}
            />
          </div>

          {/* 7. Áreas (10 min) */}
          <div className="input-group">
            <label style={{ fontSize: "0.75rem", fontWeight: 900, color: "#3b82f6", letterSpacing: "1.5px", display: "block", marginBottom: "0.6rem" }}>7. ÁREAS QUE ABORDA (MÍNIMO 10, UNA POR LÍNEA)</label>
            <textarea 
              required
              rows={5}
              placeholder="Ej: Depresión&#10;Ansiedad&#10;Duelos..."
              style={{ width: "100%", padding: "1rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "white", borderRadius: "1rem", resize: "none", fontSize: "0.9rem" }}
              value={formData.specialties_raw}
              onChange={(e) => setFormData({...formData, specialties_raw: e.target.value})}
            />
          </div>

          {/* 8. Garantía */}
          <div style={{ background: "rgba(59, 130, 246, 0.05)", padding: "1.5rem", borderRadius: "1.5rem", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontWeight: 800, margin: 0 }}>¿Incluir cartel de garantía?</p>
                <p style={{ fontSize: "0.8rem", opacity: 0.6, margin: "0.2rem 0 0" }}>"Si la primera sesión no te parece GENIAL, te devuelvo tu dinero"</p>
              </div>
              <input 
                type="checkbox" 
                checked={formData.includeGuarantee}
                onChange={(e) => {
                  setFormData({...formData, includeGuarantee: e.target.checked});
                  if (!e.target.checked) setShowGuaranteeAlert(true);
                  else setShowGuaranteeAlert(false);
                }}
                style={{ width: "24px", height: "24px", cursor: "pointer" }}
              />
            </div>
            
            <AnimatePresence>
              {showGuaranteeAlert && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ marginTop: "1rem", padding: "1rem", background: "rgba(245, 158, 11, 0.1)", borderRadius: "1rem", border: "1px solid rgba(245, 158, 11, 0.3)", display: "flex", gap: "0.8rem", color: "#f59e0b" }}
                >
                  <AlertCircle size={24} style={{ flexShrink: 0 }} />
                  <p style={{ fontSize: "0.85rem", fontWeight: 600, margin: 0 }}>
                    <strong>Aviso Pro:</strong> Claudio recomienda encarecidamente que aparezca el aviso de garantía para maximizar la confianza y conversión.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 9. WhatsApp */}
          <div className="input-group">
            <label style={{ fontSize: "0.75rem", fontWeight: 900, color: "#3b82f6", letterSpacing: "1.5px", display: "block", marginBottom: "0.6rem" }}>9. NÚMERO DE TELÉFONO CON WHATSAPP</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input 
                readOnly
                value={formData.phoneCode}
                style={{ width: "80px", padding: "1rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#10b981", borderRadius: "1rem", fontWeight: 900, textAlign: "center" }}
              />
              <div style={{ flex: 1, position: "relative" }}>
                <Phone size={18} style={{ position: "absolute", left: "1rem", top: "1rem", opacity: 0.4 }} />
                <input 
                  required
                  placeholder="9 1234 5678"
                  style={{ width: "100%", padding: "1rem 1rem 1rem 3rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "white", borderRadius: "1rem" }}
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={uploading}
            style={{ 
              width: "100%", 
              padding: "1.4rem", 
              marginTop: "1rem", 
              fontWeight: 950, 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              gap: "0.8rem",
              background: "linear-gradient(135deg, #3b82f6, #2563eb)",
              color: "white",
              border: "none",
              borderRadius: "1.2rem",
              fontSize: "1.1rem",
              cursor: uploading ? "not-allowed" : "pointer",
              boxShadow: "0 20px 40px -10px rgba(59, 130, 246, 0.4)"
            }}
          >
            CONFIRMAR Y DESPLEGAR LANDING <Send size={20} />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
