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
      backgroundColor: "#f1f5f9", 
      minHeight: "100vh",
      height: "100vh", 
      display: "flex",
      flexDirection: "column"
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800;900&display=swap" rel="stylesheet" />

      {/* HEADER */}
      <header className="header" style={{ 
        background: "white",
        borderBottom: "1px solid rgba(0,0,0,0.05)",
        padding: "1rem 5%", 
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
          borderRadius: "1.5rem",
          display: "grid",
          gridTemplateColumns: "20% 60% 20%",
          boxShadow: "0 40px 100px -20px rgba(0,0,0,0.08)",
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.8)"
        }}>
          
          {/* COLUMNA IZQUIERDA (PERFIL) */}
          <div className="col-left" style={{ 
            padding: "2rem 1.5rem", 
            backgroundColor: "#f8fafc", 
            borderRight: "1px solid rgba(0,0,0,0.03)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}>
            <div className="profile-img-container" style={{ 
                width: "160px", 
                height: "160px", 
                borderRadius: "50%", 
                overflow: "hidden", 
                margin: "0 auto 1.5rem",
                border: "6px solid white",
                boxShadow: "0 15px 30px rgba(0,0,0,0.1)"
            }}>
                <img src={imageUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div className="profile-separator" style={{ height: "4px", width: "25px", background: "#2c6a91", margin: "0 auto 1.2rem", borderRadius: "2px" }} />
            <p className="comp-phrase" style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 600, lineHeight: 1.4, marginBottom: "1.5rem", textAlign: "center" }}>
                Comprometido con el bienestar de las parejas en Chile.
            </p>
            <button className="small-link-btn" style={{
                backgroundColor: "white",
                color: "#2c6a91",
                border: "1px solid #2c6a91",
                padding: "0.4rem 1rem",
                borderRadius: "2rem",
                fontSize: "0.75rem",
                fontWeight: 800,
                cursor: "pointer"
            }}>
                RESERVAR AHORA
            </button>
          </div>

          {/* COLUMNA CENTRAL (INFO PRINCIPAL) */}
          <div className="col-center" style={{ 
            padding: "3rem 4rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            paddingTop: "4rem"
          }}>
            <h2 className="main-name" style={{ 
                fontSize: "clamp(2rem, 3.5vw, 3.8rem)", 
                color: "#1e293b", 
                margin: "0 0 0.2rem", 
                fontWeight: 950, 
                letterSpacing: "-2px",
                whiteSpace: "nowrap"
            }}>{name}</h2>
            
            <p className="profession-text" style={{ 
                fontSize: "1.3rem", 
                fontWeight: 600, 
                color: "#2c6a91", 
                marginBottom: "3rem"
            }}>{profession}</p>
            
            <div className="specialties-box" style={{ 
                background: "#f8fafc", 
                padding: "2rem", 
                borderRadius: "1.2rem",
                border: "1px solid rgba(0,0,0,0.02)"
            }}>
                <p style={{ fontWeight: 800, marginBottom: "1.2rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "2px", fontSize: "0.7rem" }}>
                    Áreas de especialidad técnica
                </p>
                <div className="specialties-grid" style={{ 
                    display: "grid", 
                    gridTemplateColumns: "1fr 1fr", 
                    gap: "0.7rem 2.5rem" 
                }}>
                    {specialties.map((item, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.8rem", fontSize: "0.9rem", fontWeight: 500 }}>
                        <CheckCircle2 size={15} color="#10b981" />
                        <span>{item}</span>
                    </div>
                    ))}
                </div>
            </div>

            <p className="experience-text" style={{ marginTop: "2rem", color: "#64748b", fontSize: "1rem", lineHeight: 1.6, fontWeight: 400 }}>
                {experience} Mi enfoque se basa en la comunicación asertiva y la reconexión profunda.
            </p>
          </div>

          {/* COLUMNA DERECHA (ACCIÓN ALINEADA) */}
          <div className="col-right" style={{ 
            padding: "3rem 1.5rem", 
            backgroundColor: "#1e293b", 
            color: "white",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: "4.5rem"
          }}>
            <div className="guarantee-box" style={{ 
              background: "rgba(255,255,255,0.03)", 
              padding: "1.5rem 1.2rem",
              borderRadius: "1.2rem",
              border: "1px solid rgba(255,255,255,0.08)",
              width: "100%",
              marginBottom: "4.5rem",
              textAlign: "center"
            }}>
              <p style={{ fontWeight: 900, fontSize: "0.8rem", margin: "0 0 0.8rem", letterSpacing: "1px", color: "#94a3b8" }}>GARANTÍA</p>
              <p style={{ fontSize: "0.8rem", opacity: 0.9, lineHeight: 1.4 }}>
                Si la primera sesión no te parece <strong style={{color: "#60a5fa", fontWeight: 900}}>GENIAL</strong>, te devuelvo tu dinero.
              </p>
            </div>

            <motion.button 
              className="reserve-btn-main"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                padding: "1.2rem",
                borderRadius: "1rem",
                fontSize: "1.1rem",
                fontWeight: 900,
                cursor: "pointer",
                width: "100%",
                boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.6rem"
              }}
            >
              RESERVAR
              <ArrowRight size={18} />
            </motion.button>
          </div>

        </div>
      </main>

      <style>{`
        /* RESPONSIVE MAGIC */
        @media (max-width: 1024px) {
          .landing-container { height: auto !important; overflow: auto !important; }
          
          /* HEADER COMPACTO (-33%) */
          .header { 
            padding: 0.5rem 5% !important; 
            flex-direction: column; 
            text-align: center; 
            gap: 0.2rem !important; 
          }
          .service-title { font-size: 1.2rem !important; line-height: 1.2; }
          .location-box { font-size: 0.7rem !important; margin-bottom: 0.2rem; }
          .contact-label { display: none; }
          .phone-box { font-size: 1rem !important; justify-content: center; }
          .phone-box svg { width: 16px; height: 16px; }
          
          .main-content { padding: 0.5rem !important; display: block !important; }
          .card-wrapper { 
            grid-template-columns: 1fr !important; 
            height: auto !important; 
            display: flex !important;
            flex-direction: column !important;
          }
          
          .col-left, .col-center, .col-right { 
            display: contents !important; 
          }

          /* CUSTOM ORDERING */
          .main-name { 
            order: 1 !important; 
            text-align: center; 
            padding: 1.5rem 1rem 0 !important; 
            font-size: clamp(1.4rem, 6vw, 2rem) !important; /* DINÁMICO PARA UNA SOLA LÍNEA */
            white-space: nowrap !important; /* UNA SOLA LÍNEA */
            overflow: hidden;
            text-overflow: ellipsis;
            width: 100%; 
            box-sizing: border-box; 
          }
          .profile-img-container { order: 2 !important; margin: 1rem auto !important; width: 120px !important; height: 120px !important; }
          .profession-text { order: 3 !important; text-align: center; margin-bottom: 1.5rem !important; font-size: 0.95rem !important; padding: 0 1rem; }
          .comp-phrase { order: 4 !important; text-align: center; padding: 0 1.5rem !important; margin-bottom: 1rem !important; font-size: 0.8rem !important; }
          .small-link-btn { order: 5 !important; margin: 0 auto 1.5rem !important; display: flex !important; padding: 0.3rem 0.8rem !important; font-size: 0.7rem !important; }
          .experience-text { order: 6 !important; padding: 0 1.5rem !important; text-align: center; font-size: 0.9rem !important; }
          .specialties-box { order: 7 !important; margin: 1.5rem !important; padding: 1.2rem !important; text-align: left; }
          .specialties-grid { grid-template-columns: 1fr !important; gap: 0.5rem !important; }
          
          .col-right { display: flex !important; flex-direction: column !important; order: 8 !important; padding: 0 1.5rem 2rem !important; background: #1e293b !important; }
          .guarantee-box { order: 1 !important; margin: 1.5rem 0 !important; padding: 1rem !important; }
          .reserve-btn-main { order: 2 !important; padding: 1rem !important; font-size: 1rem !important; }
          
          .profile-separator { display: none !important; }
          .whatsapp-float { width: 50px !important; height: 50px !important; bottom: 1.2rem !important; right: 1.2rem !important; }
        }

        /* HOVERS */
        .small-link-btn:hover { background: #2c6a91 !important; color: white !important; }
      `}</style>

      {/* WHATSAPP */}
      <a 
        className="whatsapp-float"
        href={`https://wa.me/${phone.replace(/\D/g, '')}`} 
        style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          backgroundColor: "#25d366",
          color: "white",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 15px 30px rgba(37, 211, 102, 0.3)",
          zIndex: 1000
        }}
      >
        <MessageCircle size={32} fill="currentColor" />
      </a>
    </div>
  );
}
