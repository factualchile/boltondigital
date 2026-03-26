"use client";

import React from "react";
import { motion } from "framer-motion";
import { Phone, MapPin, MessageCircle, ArrowRight, CheckCircle2 } from "lucide-react";

export default function PreviewLanding() {
  const name = "Claudio Fernández Bolton";
  const profession = "Psicólogo experto en atención a parejas";
  const service = "Atención psicológica para parejas";
  const location = "Consulta Ubicada en Concepción";
  const phone = "+56 9 7878 9839";
  const experience = "Psicólogo con más de 15 años de experiencia clínica. Experto en atención a parejas.";
  const specialties = [
    "Problemas de comunicación",
    "Falta de conexión emocional",
    "Infidelidad y reconstrucción de la confianza",
    "Celos y control",
    "Problemas en la intimidad y sexualidad",
    "Crisis y cambios en la relación",
    "Dificultades con la crianza",
    "Desgaste y rutina en la relación"
  ];
  const imageUrl = "https://images.unsplash.com/photo-1559839734-2b71f1536783?q=80&w=400&h=400&auto=format&fit=crop";

  return (
    <div style={{ 
      fontFamily: "'Outfit', sans-serif", 
      color: "#1e293b", 
      backgroundColor: "#f8fafc",
      minHeight: "100vh",
      height: "100vh",
      overflow: "hidden", // No scroll
      margin: 0,
      padding: 0,
      display: "flex",
      flexDirection: "column"
    }}>
      {/* GOOGLE FONTS IMPORT */}
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800;900&display=swap" rel="stylesheet" />

      {/* HEADER PREMIUM */}
      <header style={{ 
        background: "linear-gradient(135deg, #1e4b6b 0%, #2c6a91 100%)", 
        color: "white", 
        padding: "1.2rem 8%", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        zIndex: 10
      }}>
        <h1 style={{ margin: 0, fontSize: "2.2rem", fontWeight: 900, letterSpacing: "-1px" }}>{service}</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "1.4rem", fontWeight: 800 }}>
          <Phone size={28} color="#60a5fa" />
          <a href={`tel:${phone}`} style={{ color: "white", textDecoration: "none", borderBottom: "2px solid rgba(255,255,255,0.2)" }}>{phone}</a>
        </div>
      </header>

      {/* SUBHEADER CLEAN */}
      <div style={{ 
        backgroundColor: "white", 
        color: "#475569", 
        padding: "0.8rem 8%", 
        fontSize: "1rem",
        fontWeight: 600,
        borderBottom: "1px solid rgba(0,0,0,0.05)",
        display: "flex",
        alignItems: "center",
        gap: "1.5rem"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", background: "#f1f5f9", padding: "0.4rem 1rem", borderRadius: "2rem" }}>
          <MapPin size={18} color="#2c6a91" />
          <span>{location}</span>
        </div>
      </div>

      {/* MAIN CONTENT - OPTIMIZED FOR NO SCROLL */}
      <main style={{ 
        flex: 1,
        display: "flex",
        alignItems: "center",
        padding: "0 8%",
        maxWidth: "1400px",
        margin: "0 auto",
        width: "100%"
      }}>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "1fr 1.6fr 1.1fr", 
          gap: "4rem",
          alignItems: "center",
          width: "100%"
        }}>
          
          {/* LADO IZQUIERDO: FOTO Y BOTÓN SECUNDARIO */}
          <div style={{ textAlign: "center" }}>
            <motion.div 
              style={{ 
                position: "relative",
                width: "280px", 
                height: "280px", 
                margin: "0 auto 2.5rem"
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <div style={{
                  position: "absolute",
                  inset: "-10px",
                  background: "radial-gradient(circle, rgba(44, 106, 145, 0.2) 0%, transparent 70%)",
                  borderRadius: "50%",
                  zIndex: -1
                }} />
                <div style={{ 
                  width: "100%", 
                  height: "100%", 
                  borderRadius: "50%", 
                  overflow: "hidden", 
                  border: "10px solid white",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)"
                }}>
                  <img src={imageUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
            </motion.div>
            
            <button className="preview-btn-outline" style={{
              backgroundColor: "white",
              color: "#2c6a91",
              border: "2.5px solid #2c6a91",
              padding: "0.8rem 1.5rem",
              borderRadius: "2rem",
              fontSize: "0.9rem",
              fontWeight: 800,
              cursor: "pointer",
              transition: "all 0.3s ease",
              width: "200px",
              margin: "0 auto"
            }}>
              RESERVAR AHORA
            </button>
          </div>

          {/* CENTRO: BIOGRAFÍA Y ESPECIALIDADES */}
          <div style={{ paddingRight: "2rem" }}>
            <h2 style={{ fontSize: "3rem", color: "#1e4b6b", margin: "0 0 1rem", fontWeight: 900, lineHeight: 1.1 }}>{name}</h2>
            <p style={{ fontSize: "1.2rem", fontWeight: 500, color: "#475569", marginBottom: "2.5rem", borderLeft: "4px solid #60a5fa", paddingLeft: "1.5rem" }}>
              {experience}
            </p>
            
            <div>
              <p style={{ fontWeight: 800, marginBottom: "1.2rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "2px", fontSize: "0.8rem" }}>
                Áreas de especialidad:
              </p>
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "1fr 1fr", 
                gap: "0.8rem 2rem" 
              }}>
                {specialties.map((item, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.7rem", fontSize: "1rem", fontWeight: 500 }}>
                    <CheckCircle2 size={18} color="#10b981" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* LADO DERECHO: GARANTÍA Y BOTÓN ACCIÓN */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem", alignItems: "center" }}>
            <div style={{ 
              background: "white",
              border: "1px solid rgba(0,0,0,0.05)", 
              borderRadius: "50%", 
              padding: "2.5rem",
              textAlign: "center",
              aspectRatio: "1/1",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              width: "260px",
              boxShadow: "0 15px 35px rgba(0,0,0,0.05)",
              position: "relative"
            }}>
              <div style={{ position: "absolute", top: "10px", left: "50%", transform: "translateX(-50%)", background: "#f1f5f9", padding: "0.3rem 0.8rem", borderRadius: "1rem", fontSize: "0.6rem", fontWeight: 900, letterSpacing: "1px", color: "#64748b" }}>CERTIFICADO</div>
              <p style={{ fontWeight: 900, fontSize: "1.1rem", margin: "0 0 0.8rem", color: "#1e293b", lineHeight: 1.2 }}>GARANTÍA DE SATISFACCIÓN</p>
              <p style={{ fontSize: "0.95rem", color: "#64748b", fontWeight: 500 }}>Si la primera sesión no te parece <strong style={{color: "#2c6a91", fontWeight: 900}}>GENIAL</strong> te devuelvo tu dinero</p>
            </div>

            <button className="preview-btn-main" style={{
              background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
              color: "white",
              border: "none",
              padding: "1.4rem 3rem",
              borderRadius: "1rem",
              fontSize: "1.25rem",
              fontWeight: 900,
              cursor: "pointer",
              transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
              boxShadow: "0 20px 40px rgba(15, 23, 42, 0.3)",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "1rem"
            }}>
              RESERVAR AHORA
              <ArrowRight size={24} color="#60a5fa" />
            </button>
          </div>

        </div>
      </main>

      {/* WHATSAPP FLOATING */}
      <a 
        href={`https://wa.me/${phone.replace(/\D/g, '')}`} 
        style={{
          position: "fixed",
          bottom: "3rem",
          right: "3rem",
          backgroundColor: "#25d366",
          color: "white",
          width: "70px",
          height: "70px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 20px 40px rgba(37, 211, 102, 0.4)",
          zIndex: 1000,
          transition: "transform 0.3s ease"
        }}
        className="whatsapp-btn"
      >
        <MessageCircle size={40} fill="currentColor" />
      </a>

      <style>{`
        .preview-btn-main:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 30px 60px rgba(15, 23, 42, 0.4);
        }
        .preview-btn-outline:hover {
          background-color: #2c6a91 !important;
          color: white !important;
          transform: scale(1.05);
        }
        .whatsapp-btn:hover {
          transform: scale(1.1) rotate(10deg);
        }
        @media (max-width: 1200px) {
          h2 { fontSize: 2.5rem !important; }
          main > div { gap: 2rem !important; }
        }
      `}</style>
    </div>
  );
}
