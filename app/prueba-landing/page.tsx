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
    <div className="landing-container" style={{ 
      fontFamily: "'Outfit', sans-serif", 
      color: "#1e293b", 
      backgroundColor: "#f4f7fa", 
      minHeight: "100vh",
      height: "100vh", 
      display: "flex",
      flexDirection: "column"
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800;900&display=swap" rel="stylesheet" />

      {/* HEADER INTEGRADO */}
      <header className="header" style={{ 
        background: "white",
        borderBottom: "1px solid rgba(0,0,0,0.05)",
        padding: "0.8rem 5%", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        zIndex: 10
      }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
            <h1 className="service-title" style={{ margin: 0, fontSize: "1.8rem", fontWeight: 900, color: "#1e4b6b", letterSpacing: "-0.5px" }}>{service}</h1>
            <div className="location-box" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#64748b", fontSize: "0.85rem", fontWeight: 600 }}>
                <MapPin size={14} />
                <span>{location}</span>
            </div>
        </div>
        <div className="contact-info" style={{ textAlign: "right" }}>
            <p className="contact-label" style={{ margin: 0, fontSize: "0.7rem", fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px" }}>Contacto Directo</p>
            <div className="phone-box" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.2rem", fontWeight: 800, color: "#2c6a91" }}>
                <Phone size={20} />
                <a href={`tel:${phone}`} style={{ color: "inherit", textDecoration: "none" }}>{phone}</a>
            </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="main-content" style={{ 
        flex: 1,
        padding: "1rem 5%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div className="card-wrapper" style={{ 
          background: "white",
          width: "100%",
          maxWidth: "1400px",
          height: "82vh", 
          borderRadius: "1.8rem",
          display: "grid",
          gridTemplateColumns: "20% 65% 15%", // NUEVAS PROPORCIONES
          boxShadow: "0 50px 100px -20px rgba(0,0,0,0.12)",
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.8)"
        }}>
          
          {/* COLUMNA IZQUIERDA (PERFIL) - CON MAYOR INTENCIÓN VISUAL */}
          <div className="col-left" style={{ 
            padding: "2.5rem 1.8rem", 
            backgroundColor: "#f8fafc", 
            borderRight: "1px solid rgba(0,0,0,0.04)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}>
            <div className="inner-profile-card" style={{
                background: "white",
                padding: "2rem 1.2rem",
                borderRadius: "1.5rem",
                width: "100%",
                boxShadow: "0 10px 25px rgba(0,0,0,0.03)",
                border: "1px solid rgba(0,0,0,0.02)",
                textAlign: "center"
            }}>
                <div className="profile-img-container" style={{ 
                    width: "150px", 
                    height: "150px", 
                    borderRadius: "50%", 
                    overflow: "hidden", 
                    margin: "0 auto 1.5rem",
                    border: "6px solid white",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
                }}>
                    <img src={imageUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div className="profile-separator" style={{ height: "4px", width: "25px", background: "#3b82f6", margin: "0 auto 1.2rem", borderRadius: "2px" }} />
                <p className="comp-phrase" style={{ fontSize: "0.85rem", color: "#475569", fontWeight: 600, lineHeight: 1.5, marginBottom: "1.5rem" }}>
                    Comprometido con el bienestar de las parejas en Chile.
                </p>
                <button className="small-link-btn" style={{
                    backgroundColor: "white",
                    color: "#2c6a91",
                    border: "1px solid #e2e8f0",
                    padding: "0.5rem 1.2rem",
                    borderRadius: "2rem",
                    fontSize: "0.75rem",
                    fontWeight: 800,
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                }}>
                    CONOCER MÁS
                </button>
            </div>
          </div>

          {/* COLUMNA CENTRAL (INFO PRINCIPAL) */}
          <div className="col-center" style={{ 
            padding: "3rem 4rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <h2 className="main-name" style={{ 
                    fontSize: "clamp(2rem, 3.8vw, 4rem)", 
                    color: "#0f172a", 
                    margin: "0 0 0.4rem", 
                    fontWeight: 950, 
                    letterSpacing: "-2.5px",
                    whiteSpace: "nowrap"
                }}>{name}</h2>
                
                <p className="profession-text" style={{ 
                    fontSize: "1.45rem", // AUMENTADO
                    fontWeight: 600, 
                    color: "#3b82f6", 
                    marginBottom: "2.8rem",
                    letterSpacing: "-0.5px"
                }}>{profession}</p>
                
                <div className="specialties-box" style={{ 
                    background: "#ffffff", // MÁS BLANCO
                    padding: "2.8rem", // MÁS PADDING
                    borderRadius: "1.5rem",
                    border: "1px solid #f1f5f9", // BORDE SUTIL
                    boxShadow: "0 15px 40px rgba(0,0,0,0.02)", // SOMBRA LIGERA
                    position: "relative"
                }}>
                    <p style={{ fontWeight: 800, marginBottom: "1.5rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "2.5px", fontSize: "0.75rem" }}>
                        Especialidades Clínicas
                    </p>
                    <div className="specialties-grid" style={{ 
                        display: "grid", 
                        gridTemplateColumns: "1fr 1fr", 
                        gap: "1.2rem 3rem" // MEJOR INTERLINEADO
                    }}>
                        {specialties.map((item, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.8rem", fontSize: "0.95rem", fontWeight: 500, color: "#334155" }}>
                            <CheckCircle2 size={16} color="#10b981" />
                            <span>{item}</span>
                        </div>
                        ))}
                    </div>
                </div>

                <p className="experience-text" style={{ marginTop: "2.8rem", color: "#64748b", fontSize: "1.1rem", lineHeight: 1.7, fontWeight: 400 }}>
                    {experience} Mi enfoque se basa en la comunicación asertiva y la reconexión profunda.
                </p>
            </motion.div>
          </div>

          {/* COLUMNA DERECHA (ACCIÓN) - GRADIENTE ELEGANTE Y MENOS ANCHO */}
          <div className="col-right" style={{ 
            padding: "3rem 1.8rem", 
            background: "linear-gradient(180deg, #1e3a5f 0%, #0f172a 100%)", // GRADIENTE SOFISTICADO
            color: "white",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "4rem"
          }}>
            <div className="guarantee-box" style={{ 
              background: "rgba(255,255,255,0.05)", 
              padding: "2rem 1.5rem",
              borderRadius: "1.5rem",
              border: "1px solid rgba(255,255,255,0.1)",
              width: "100%",
              textAlign: "center"
            }}>
              <p style={{ fontWeight: 900, fontSize: "0.85rem", margin: "0 0 1rem", letterSpacing: "1.5px", color: "#60a5fa" }}>GARANTÍA</p>
              <p style={{ fontSize: "0.85rem", opacity: 0.9, lineHeight: 1.5 }}>
                Si la primera sesión no te parece <strong style={{color: "white", fontWeight: 950}}>EXCEPCIONAL</strong>, te devuelvo tu dinero.
              </p>
            </div>

            <motion.button 
              className="reserve-btn-main"
              whileHover={{ scale: 1.05, filter: "brightness(1.1)" }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", // GRADIENTE EN BOTÓN
                color: "white",
                border: "none",
                padding: "1.6rem 1.2rem", // MÁS PADDING VERTICAL
                borderRadius: "1.2rem",
                fontSize: "1.2rem",
                fontWeight: 900,
                cursor: "pointer",
                width: "100%",
                boxShadow: "0 20px 45px rgba(59, 130, 246, 0.45)", // SOMBRA BLUR GRANDE
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.8rem",
                transition: "all 0.3s ease"
              }}
            >
              RESERVAR
              <ArrowRight size={22} />
            </motion.button>

            <p style={{ fontSize: "0.7rem", opacity: 0.3, letterSpacing: "0.5px" }}>
              SESIÓN 100% GARANTIZADA
            </p>
          </div>

        </div>
      </main>

      {/* WHATSAPP */}
      <a 
        className="whatsapp-float"
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
          boxShadow: "0 20px 40px rgba(37, 211, 102, 0.3)",
          zIndex: 1000,
          transition: "transform 0.3s ease"
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.1)"}
        onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
      >
        <MessageCircle size={35} fill="currentColor" />
      </a>

      <style>{`
        /* RESPONSIVE MAGIC */
        @media (max-width: 1024px) {
          .landing-container { height: auto !important; overflow: auto !important; }
          .header { padding: 0.6rem 5% !important; flex-direction: column; text-align: center; gap: 0.3rem !important; }
          .service-title { font-size: 1.3rem !important; }
          .location-box { font-size: 0.75rem !important; margin-bottom: 0.2rem; }
          .contact-label { display: none; }
          .phone-box { font-size: 1.1rem !important; justify-content: center; }
          
          .main-content { padding: 0.5rem !important; display: block !important; }
          .card-wrapper { grid-template-columns: 1fr !important; height: auto !important; display: flex !important; flex-direction: column !important; }
          .col-left, .col-center, .col-right { display: contents !important; }

          .main-name { order: 1 !important; text-align: center; padding: 2rem 1rem 0 !important; font-size: 1.8rem !important; white-space: nowrap !important; line-height: 1; }
          .profile-img-container { order: 2 !important; margin: 1.5rem auto !important; width: 130px !important; height: 130px !important; }
          .profession-text { order: 3 !important; text-align: center; margin-bottom: 2rem !important; font-size: 1.1rem !important; }
          .comp-phrase { order: 4 !important; text-align: center; padding: 0 2rem !important; margin-bottom: 1rem !important; }
          .small-link-btn { order: 5 !important; margin: 0 auto 2rem !important; display: flex !important; }
          .experience-text { order: 6 !important; padding: 0 2rem !important; text-align: center; font-size: 0.95rem !important; }
          .specialties-box { order: 7 !important; margin: 1.5rem !important; padding: 1.8rem !important; }
          .specialties-grid { grid-template-columns: 1fr !important; gap: 0.8rem !important; }
          
          .col-right { order: 8 !important; padding: 3rem 2rem !important; display: flex !important; flex-direction: column !important; background: #0f172a !important; }
          .guarantee-box { margin: 2rem 0 !important; }
          .reserve-btn-main { padding: 1.4rem !important; }
        }

        .small-link-btn:hover { background: #f8fafc !important; border-color: #3b82f6 !important; color: #3b82f6 !important; }
      `}</style>
    </div>
  );
}
