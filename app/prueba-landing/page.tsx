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
      backgroundColor: "#f1f5f9", // Fondo base un poco más denso
      minHeight: "100vh",
      height: "100vh",
      overflow: "hidden", 
      margin: 0,
      padding: 0,
      display: "flex",
      flexDirection: "column"
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800;900&display=swap" rel="stylesheet" />

      {/* HEADER INTEGRADO */}
      <header style={{ 
        background: "white",
        borderBottom: "1px solid rgba(0,0,0,0.05)",
        padding: "1rem 5%", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        zIndex: 10
      }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
            <h1 style={{ margin: 0, fontSize: "1.8rem", fontWeight: 900, color: "#1e4b6b", letterSpacing: "-0.5px" }}>{service}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#64748b", fontSize: "0.85rem", fontWeight: 600 }}>
                <MapPin size={14} />
                <span>{location}</span>
            </div>
        </div>
        <div style={{ textAlign: "right" }}>
            <p style={{ margin: 0, fontSize: "0.7rem", fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px" }}>Contacto Directo</p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.2rem", fontWeight: 800, color: "#2c6a91" }}>
                <Phone size={20} />
                <a href={`tel:${phone}`} style={{ color: "inherit", textDecoration: "none" }}>{phone}</a>
            </div>
        </div>
      </header>

      {/* MAIN CONTAINER CON PROFUNDIDAD */}
      <main style={{ 
        flex: 1,
        padding: "2rem 5%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{ 
          background: "white",
          width: "100%",
          maxWidth: "1400px",
          height: "85vh", // Limitamos altura para asegurar no-scroll
          borderRadius: "2rem",
          display: "grid",
          gridTemplateColumns: "20% 60% 20%", // PROPORCIONES SOLICITADAS
          boxShadow: "0 40px 100px -20px rgba(0,0,0,0.08)",
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.8)"
        }}>
          
          {/* COLUMNA IZQUIERDA (20%) - PERFIL */}
          <div style={{ 
            padding: "3rem 2rem", 
            backgroundColor: "#f8fafc", 
            borderRight: "1px solid rgba(0,0,0,0.03)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div style={{ width: "100%", textAlign: "center" }}>
                <div style={{ 
                width: "180px", 
                height: "180px", 
                borderRadius: "50%", 
                overflow: "hidden", 
                margin: "0 auto 2rem",
                border: "6px solid white",
                boxShadow: "0 15px 30px rgba(0,0,0,0.1)"
                }}>
                <img src={imageUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ height: "4px", width: "30px", background: "#2c6a91", margin: "0 auto 1.5rem", borderRadius: "2px" }} />
                <p style={{ fontSize: "0.9rem", color: "#64748b", fontWeight: 600, lineHeight: 1.4 }}>
                    Comprometido con el bienestar de las parejas en Chile.
                </p>
            </div>
            
            <button className="btn-secondary" style={{
              backgroundColor: "white",
              color: "#2c6a91",
              border: "1px solid #e2e8f0",
              padding: "0.8rem",
              borderRadius: "0.8rem",
              fontSize: "0.8rem",
              fontWeight: 800,
              cursor: "pointer",
              transition: "all 0.3s ease",
              width: "100%"
            }}>
              MÁS INFORMACIÓN
            </button>
          </div>

          {/* COLUMNA CENTRAL (60%) - INFO PRINCIPAL */}
          <div style={{ 
            padding: "4rem 4rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center"
          }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <h2 style={{ fontSize: "3.5rem", color: "#1e293b", margin: "0 0 0.5rem", fontWeight: 900, letterSpacing: "-1.5px" }}>{name}</h2>
                <p style={{ fontSize: "1.4rem", fontWeight: 500, color: "#2c6a91", marginBottom: "2.5rem" }}>{profession}</p>
                
                <div style={{ 
                    background: "#f8fafc", 
                    padding: "2.5rem", 
                    borderRadius: "1.5rem",
                    border: "1px solid rgba(0,0,0,0.02)",
                    position: "relative"
                }}>
                    <p style={{ fontWeight: 800, marginBottom: "1.5rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "2px", fontSize: "0.75rem" }}>
                        Áreas de especialidad técnica
                    </p>
                    <div style={{ 
                        display: "grid", 
                        gridTemplateColumns: "1fr 1fr", 
                        gap: "0.8rem 2.5rem" 
                    }}>
                        {specialties.map((item, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.8rem", fontSize: "0.95rem", fontWeight: 500 }}>
                            <CheckCircle2 size={16} color="#10b981" />
                            <span>{item}</span>
                        </div>
                        ))}
                    </div>
                </div>

                <p style={{ marginTop: "2.5rem", color: "#64748b", fontSize: "1.1rem", lineHeight: 1.6, fontWeight: 400 }}>
                    {experience} Mi enfoque se basa en la comunicación asertiva y la reconexión profunda.
                </p>
            </motion.div>
          </div>

          {/* COLUMNA DERECHA (20%) - ACCIÓN */}
          <div style={{ 
            padding: "3rem 2rem", 
            backgroundColor: "#1e293b", 
            color: "white",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "3rem",
            textAlign: "center"
          }}>
            <div style={{ 
              background: "rgba(255,255,255,0.03)", 
              padding: "2rem 1.5rem",
              borderRadius: "1.5rem",
              border: "1px solid rgba(255,255,255,0.05)",
              width: "100%"
            }}>
              <p style={{ fontWeight: 900, fontSize: "0.9rem", margin: "0 0 1rem", letterSpacing: "1px" }}>GARANTÍA</p>
              <p style={{ fontSize: "0.85rem", opacity: 0.8, lineHeight: 1.5 }}>
                Si la primera sesión no te parece <strong style={{color: "#60a5fa"}}>GENIAL</strong>, te devuelvo tu dinero.
              </p>
            </div>

            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                padding: "1.5rem",
                borderRadius: "1.2rem",
                fontSize: "1.2rem",
                fontWeight: 900,
                cursor: "pointer",
                width: "100%",
                boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.8rem"
              }}
            >
              RESERVAR
              <ArrowRight size={20} />
            </motion.button>

            <p style={{ fontSize: "0.7rem", opacity: 0.4, maxWidth: "150px" }}>
              * Consulta sujeta a disponibilidad. Reservas 100% seguras.
            </p>
          </div>

        </div>
      </main>

      {/* FOOTER MINIMALISTA INTEGRADO */}
      <footer style={{ padding: "1rem 8%", fontSize: "0.8rem", opacity: 0.5, textAlign: "center" }}>
        © 2026 Bolton Digital - Todos los derechos reservados
      </footer>

      {/* WHATSAPP CONECTADO VISUALMENTE */}
      <a 
        href={`https://wa.me/${phone.replace(/\D/g, '')}`} 
        style={{
          position: "fixed",
          bottom: "2.5rem",
          right: "2.5rem",
          backgroundColor: "#25d366",
          color: "white",
          width: "65px",
          height: "65px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 15px 30px rgba(37, 211, 102, 0.3)",
          zIndex: 1000
        }}
      >
        <MessageCircle size={35} fill="currentColor" />
      </a>

      <style>{`
        @media (max-width: 1024px) {
          main { overflow-y: auto !important; height: auto !important; }
          main > div { 
            grid-template-columns: 1fr !important;
            height: auto !important;
            margin-top: 2rem;
          }
          .no-scroll { overflow: auto !important; }
        }
      `}</style>
    </div>
  );
}
