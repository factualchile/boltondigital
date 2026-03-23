"use client";

import React from "react";
import { Phone, MapPin, MessageCircle, ArrowRight, CheckCircle2 } from "lucide-react";

interface LandingProps {
  name?: string;
  profession?: string;
  service?: string;
  location?: string;
  phone?: string;
  experience?: string;
  specialties?: string[];
  imageUrl?: string;
  website?: string;
}

export default function LandingBase({
  name = "Claudio Fernández Bolton",
  profession = "Psicólogo experto en atención a parejas",
  service = "Atención psicológica para parejas",
  location = "Consulta Ubicada en Concepción",
  phone = "+56 9 7878 9839",
  experience = "Psicólogo con más de 15 años de experiencia clínica. Experto en atención a parejas.",
  specialties = [
    "Problemas de comunicación",
    "Falta de conexión emocional",
    "Infidelidad y reconstrucción de la confianza",
    "Celos y control",
    "Problemas en la intimidad y sexualidad",
    "Crisis y cambios en la relación",
    "Dificultades con la crianza",
    "Desgaste y rutina en la relación"
  ],
  imageUrl = "https://images.unsplash.com/photo-1559839734-2b71f1536783?q=80&w=400&h=400&auto=format&fit=crop", // Placeholder profesional
  website = "#"
}: LandingProps) {
  return (
    <div style={{ 
      fontFamily: "'Inter', sans-serif", 
      color: "#334155", 
      backgroundColor: "#f8fafc",
      minHeight: "100vh",
      margin: 0,
      padding: 0
    }}>
      {/* HEADER AZUL */}
      <header style={{ 
        backgroundColor: "#2c6a91", 
        color: "white", 
        padding: "1.5rem 5%", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1rem"
      }}>
        <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 700 }}>{service}</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.25rem", fontWeight: 600 }}>
          <Phone size={24} />
          <a href={`tel:${phone}`} style={{ color: "white", textDecoration: "underline" }}>{phone}</a>
        </div>
      </header>

      {/* SUBHEADER OSCURO */}
      <div style={{ 
        backgroundColor: "#0f172a", 
        color: "white", 
        padding: "0.6rem 5%", 
        fontSize: "1.1rem" 
      }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", borderLeft: "4px solid #3b82f6", paddingLeft: "1rem" }}>
          <MapPin size={18} />
          <span>{location}</span>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main style={{ padding: "4rem 5%", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "1fr 1.5fr 1fr", 
          gap: "3rem",
          alignItems: "start"
        }}>
          
          {/* LADO IZQUIERDO: FOTO Y BOTÓN */}
          <div style={{ textAlign: "center" }}>
            <div style={{ 
              width: "250px", 
              height: "250px", 
              borderRadius: "50%", 
              overflow: "hidden", 
              margin: "0 auto 2rem",
              border: "8px solid white",
              boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)"
            }}>
              <img src={imageUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <button style={{
              backgroundColor: "white",
              color: "#2c6a91",
              border: "2px solid #2c6a91",
              padding: "1rem 2rem",
              borderRadius: "2rem",
              fontSize: "1.1rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.3s ease",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem"
            }}>
              RESERVAR AHORA
            </button>
          </div>

          {/* CENTRO: BIOGRAFÍA Y ESPECIALIDADES */}
          <div>
            <h2 style={{ fontSize: "2.5rem", color: "#2c6a91", margin: "0 0 1.5rem", fontWeight: 800 }}>{name}</h2>
            <p style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "1rem" }}>{experience}</p>
            
            <div style={{ marginTop: "2rem" }}>
              <p style={{ fontWeight: 700, marginBottom: "1rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", fontSize: "0.9rem" }}>
                Áreas de experiencia:
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {specialties.map((item, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "start", gap: "0.5rem", fontSize: "1.05rem" }}>
                    <div style={{ marginTop: "5px" }}><CheckCircle2 size={16} color="#2c6a91" /></div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* LADO DERECHO: GARANTÍA Y BOTÓN PRINCIPAL */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem", alignItems: "center" }}>
            <div style={{ 
              border: "2px solid #cbd5e1", 
              borderRadius: "50%", 
              padding: "2rem",
              textAlign: "center",
              aspectRatio: "1/1",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              width: "240px"
            }}>
              <p style={{ fontWeight: 800, fontSize: "1rem", margin: "0 0 0.5rem", textTransform: "uppercase" }}>Garantía de Satisfacción</p>
              <p style={{ fontSize: "0.9rem", margin: 0 }}>Si la primera sesión no te parece <strong style={{color: "#2c6a91"}}>GENIAL</strong> te devuelvo tu dinero</p>
            </div>

            <button style={{
              backgroundColor: "#0f172a",
              color: "white",
              border: "none",
              padding: "1.2rem 2.5rem",
              borderRadius: "0.8rem",
              fontSize: "1.2rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.3)",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem"
            }}>
              RESERVAR AHORA
              <ArrowRight size={20} />
            </button>
          </div>

        </div>
      </main>

      {/* WHATSAPP FLOATING */}
      <a 
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
          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.4)",
          zIndex: 1000
        }}
      >
        <MessageCircle size={35} fill="currentColor" />
      </a>

      {/* CSS ADDITION FOR RESPONSIVENESS (SIMULATED) */}
      <style>{`
        @media (max-width: 900px) {
          main > div {
            grid-template-columns: 1fr !important;
          }
          header {
            justify-content: center !important;
          }
        }
      `}</style>
    </div>
  );
}
