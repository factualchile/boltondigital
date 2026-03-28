"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, MessageSquare, Globe, User, 
  ArrowLeft, Send, Loader2, Zap, 
  CheckCircle2, TrendingUp, Users, DollarSign,
  AlertCircle, Smartphone, Sparkles, ListRestart,
  Camera, Download, Mail, RefreshCw
} from 'lucide-react';
import { supabase } from "@/lib/supabase";

interface Assistant {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  type: 'calculator' | 'chat' | 'audit';
}

const NEW_ASSISTANTS: Assistant[] = [
  {
    id: 'estimador',
    name: 'Estimador de Resultados',
    description: 'Proyecta el impacto de tu inversión en clics, pacientes e ingresos reales.',
    icon: Calculator,
    color: '#3b82f6',
    type: 'calculator'
  },
  {
    id: 'whatsapp',
    name: 'SIMULADOR de potencial paciente',
    description: 'Entrena tu cierre de ventas con pacientes simulados por IA y personalidades reales.',
    icon: MessageSquare,
    color: '#10b981',
    type: 'chat'
  },
  {
    id: 'landing',
    name: 'Evaluador de Landing',
    description: 'Auditoría crítica de tu página basada en el Cerebro de Claudio.',
    icon: Globe,
    color: '#f59e0b',
    type: 'audit'
  },
  {
    id: 'foto',
    name: 'Mejorador de Foto',
    description: 'Evaluación de confianza y lenguaje corporal para tu imagen profesional.',
    icon: User,
    color: '#818cf8',
    type: 'audit'
  }
];

export function AssistantsView({ landingUrl, conversionConfig, userId }: { landingUrl?: string | null, conversionConfig?: any, userId?: string }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const activeAssistant = NEW_ASSISTANTS.find(a => a.id === selectedId);

  return (
    <div className="dashboard-main" style={{ padding: "0 1rem 4rem" }}>
      <AnimatePresence mode="wait">
        {!selectedId ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div style={{ marginBottom: "4rem", textAlign: "center" }}>
              <h2 style={{ fontSize: "2.5rem", fontWeight: 1000, marginBottom: "1rem", letterSpacing: "-1.5px", color: "white" }}>
                Asistentes de Crecimiento
              </h2>
              <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.6)", maxWidth: "600px", margin: "0 auto" }}>
                Herramientas tácticas diseñadas para que cada psicólogo domine su mercado y convierta más pacientes.
              </p>
            </div>

            <div className="grid-responsive" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", maxWidth: "1100px", margin: "0 auto" }}>
              {NEW_ASSISTANTS.map((as) => (
                <motion.button 
                  key={as.id}
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedId(as.id)}
                  className="glass"
                  style={{ 
                    padding: "2.5rem", 
                    borderRadius: "2rem", 
                    textAlign: "left",
                    background: `linear-gradient(135deg, ${as.color}08 0%, transparent 100%)`,
                    border: `1px solid rgba(255,255,255,0.05)`,
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden"
                  }}
                >
                  <div className="glass" style={{ width: "50px", height: "50px", borderRadius: "1rem", display: "flex", alignItems: "center", justifyContent: "center", background: `${as.color}15`, color: as.color, marginBottom: "2rem" }}>
                    <as.icon size={24} />
                  </div>
                  <h3 style={{ fontSize: "1.4rem", fontWeight: 950, marginBottom: "0.75rem", color: "white" }}>{as.name}</h3>
                  <p style={{ opacity: 0.7, fontSize: "0.95rem", lineHeight: 1.6, color: "rgba(255,255,255,0.7)" }}>{as.description}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="interface"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
              <button 
                onClick={() => setSelectedId(null)}
                style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "transparent", border: "none", color: "white", cursor: "pointer", marginBottom: "2rem", fontWeight: 800, fontSize: "0.8rem", opacity: 0.7 }}
              >
                <ArrowLeft size={16} /> VOLVER AL MENÚ
              </button>

              <div className="glass" style={{ padding: "2.5rem", borderRadius: "2rem", border: `1px solid ${activeAssistant?.color}30`, position: "relative", overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "3rem" }}>
                  <div className="glass" style={{ width: "40px", height: "40px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", background: `${activeAssistant?.color}15`, color: activeAssistant?.color }}>
                    {activeAssistant && <activeAssistant.icon size={20} />}
                  </div>
                  <h3 style={{ fontSize: "1.5rem", fontWeight: 950, color: "white" }}>{activeAssistant?.name}</h3>
                </div>

                {selectedId === 'estimador' && <EstimadorResults assistant={activeAssistant!} />}
                {selectedId === 'whatsapp' && <SimulatorChat type="simulator" assistant={activeAssistant!} userId={userId} />}
                {selectedId === 'landing' && <SimulatorChat type="audit_landing" assistant={activeAssistant!} landingUrl={landingUrl} conversionConfig={conversionConfig} userId={userId} placeholder="Pega la URL o el texto de tu landing..." />}
                {selectedId === 'foto' && <SimulatorChat type="audit_photo" assistant={activeAssistant!} userId={userId} placeholder="Describe tu foto profesional o sube una para analizar..." />}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- SUB-COMPONENTES ---

function EstimadorResults({ assistant }: { assistant: Assistant }) {
  const [formData, setFormData] = useState({
    city: 'Santiago',
    specialty: 'Terapia Adultos',
    budget: 200000,
    price: 35000
  });

  const [results, setResults] = useState<any>(null);

  const calculate = () => {
    const avgCPC = 1800; // Benchmark de Claudio
    const clicks = Math.floor(formData.budget / avgCPC);
    const leads = Math.floor(clicks * 0.12); // 12% Conv Rate
    const patients = Math.floor(leads * 0.25); // 25% Sales Rate
    const revenue = patients * formData.price * 10; // 10 sesiones adherencia

    setResults({
      clicks, leads, patients, 
      cpl: Math.floor(formData.budget / (leads || 1)),
      cpp: Math.floor(formData.budget / (patients || 1)),
      revenue
    });
  };

  useEffect(() => { calculate(); }, []);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.5rem" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
        <div className="input-field">
          <label style={{ fontSize: "0.7rem", fontWeight: 950, opacity: 0.5, letterSpacing: "1px", marginBottom: "0.5rem", display: "block", color: "white" }}>CIUDAD</label>
          <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="glass-input" />
        </div>
        <div className="input-field">
          <label style={{ fontSize: "0.7rem", fontWeight: 950, opacity: 0.5, letterSpacing: "1px", marginBottom: "0.5rem", display: "block", color: "white" }}>ESPECIALIDAD</label>
          <input type="text" value={formData.specialty} onChange={e => setFormData({...formData, specialty: e.target.value})} className="glass-input" />
        </div>
        <div className="input-field">
          <label style={{ fontSize: "0.7rem", fontWeight: 950, opacity: 0.5, letterSpacing: "1px", marginBottom: "0.5rem", display: "block", color: "white" }}>INVERSIÓN MENSUAL (CLP)</label>
          <input type="number" value={formData.budget} onChange={e => setFormData({...formData, budget: Number(e.target.value)})} className="glass-input" />
        </div>
        <div className="input-field">
          <label style={{ fontSize: "0.7rem", fontWeight: 950, opacity: 0.5, letterSpacing: "1px", marginBottom: "0.5rem", display: "block", color: "white" }}>PRECIO POR SESIÓN</label>
          <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="glass-input" />
        </div>
        <button onClick={calculate} className="btn-primary" style={{ padding: "1rem", borderRadius: "1rem", marginTop: "1rem" }}>CALCULAR PROYECCIÓN</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <MetricBox icon={Zap} label="Clics Est." value={results?.clicks} />
        <MetricBox icon={Users} label="Leads Est." value={results?.leads} />
        <MetricBox icon={CheckCircle2} label="Pacientes Est." value={results?.patients} />
        <MetricBox icon={DollarSign} label="CPL (Costo Lead)" value={`$${results?.cpl.toLocaleString()}`} />
        
        <div className="glass" style={{ gridColumn: "span 2", padding: "1.5rem", borderRadius: "1.2rem", background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59,130,246,0.3)" }}>
          <p style={{ fontSize: "0.7rem", fontWeight: 950, opacity: 0.6, marginBottom: "0.5rem" }}>INGRESO POTENCIAL (10 SESIONES)</p>
          <p style={{ fontSize: "1.8rem", fontWeight: 1000, color: "#3b82f6" }}>${results?.revenue.toLocaleString()} CLP</p>
        </div>
      </div>
    </div>
  );
}

function MetricBox({ label, value, icon: Icon }: any) {
  return (
    <div className="glass" style={{ padding: "1.2rem", borderRadius: "1.2rem", background: "rgba(255,255,255,0.02)" }}>
      <Icon size={14} style={{ opacity: 0.4, marginBottom: "0.5rem", color: "white" }} />
      <p style={{ fontSize: "0.6rem", fontWeight: 950, opacity: 0.5, textTransform: "uppercase", color: "white" }}>{label}</p>
      <p style={{ fontSize: "1.2rem", fontWeight: 950, color: "white" }}>{value}</p>
    </div>
  );
}

function SimulatorChat({ type, assistant, placeholder, landingUrl, conversionConfig, userId }: { type: string, assistant: Assistant, placeholder?: string, landingUrl?: string | null, conversionConfig?: any, userId?: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [epiphany, setEpiphany] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [generatedPhoto, setGeneratedPhoto] = useState<string | null>(null);
  const [showAIImproveButton, setShowAIImproveButton] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // INICIALIZACIÓN DE ASISTENTES
  useEffect(() => {
    if (type === 'simulator' && messages.length === 0) {
      setMessages([{ role: 'assistant', content: 'Hola, solicito una hora para atención psicológica por favor' }]);
    } else if (type === 'audit_landing' && messages.length === 0) {
      const autoAudit = async () => {
        setLoading(true);
        const lData = conversionConfig?.lastLandingData;
        const survey = conversionConfig?.campaignSurvey;
        
        let auditQuery = "";
        if (lData) {
          auditQuery = `Analiza el copy REAL de mi landing:
             - TÍTULO: ${lData.service}
             - SLOGAN: ${lData.slogan}
             - BIO: ${lData.profession}
             - UBICACIÓN: ${lData.location}
             - ESPECIALIDADES: ${lData.specialties?.join(", ")}
             IMPORTANTE: Solo audita esta información. Dame una retroalimentación crítica.`;
        } else if (survey) {
          auditQuery = `He detectado tus datos base:
             - PROFESIÓN: ${survey.profession}
             - SERVICIO: ${survey.service}
             IA: Aun no tenemos el copy final, pero analicemos estos datos base.`;
        } else {
          auditQuery = `Auditame mi landing page. ¿Qué datos necesitas?`;
        }

        try {
          const res = await fetch("/api/assistants/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type, userInput: auditQuery, messages: [] })
          });
          const data = await res.json();
          if (data.success) setMessages([{ role: "assistant", content: data.content }]);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      };
      autoAudit();
    }
  }, [type, messages.length, landingUrl, conversionConfig]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", userId || "anon");

      const uploadRes = await fetch("/api/storage/upload", {
        method: "POST",
        body: formData
      });
      
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || "Error al subir imagen");

      const publicUrl = uploadData.publicUrl;
      setUploadedImage(publicUrl);
      setMessages([{ role: "assistant", content: "📸 He recibido tu foto. Dame unos segundos, Claudio la está auditando ahora mismo..." }]);
      setLoading(true);

      const auditRes = await fetch("/api/assistants/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          type: 'audit_photo', 
          userInput: `Analiza esta mi foto profesional. Si crees que se puede mejorar (luz, fondo, vestimenta), incluye [PROPOSE_RETOUCH] al final.`, 
          imageUrl: publicUrl,
          messages: [] 
        })
      });
      
      if (!auditRes.ok) throw new Error(`Error IA: ${auditRes.statusText}`);
      
      const auditData = await auditRes.json();
      if (auditData.success) {
        let text = auditData.content;
        if (text.includes("[PROPOSE_RETOUCH]")) {
          text = text.replace("[PROPOSE_RETOUCH]", "").trim();
          setShowAIImproveButton(true);
        }
        setMessages([{ role: "assistant", content: text }]);
      } else {
        throw new Error(auditData.error || "Fallo desconocido en el análisis.");
      }
    } catch (error: any) {
      console.error("Audit Photo error:", error);
      alert(`⚠️ Problema con la foto: ${error.message}`);
      setUploadedImage(null); // Reset para permitir intentar de nuevo
    } finally {
      setUploadingPhoto(false);
      setLoading(false);
    }
  };

  const handleImprovePhoto = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/assistants/generate-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: uploadedImage, profession: conversionConfig?.campaignSurvey?.profession || "Psicólogo" })
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedPhoto(data.imageUrl);
        setMessages(prev => [...prev, { role: "assistant", content: "¡He generado una versión mejorada para ti! He ajustado la vestimenta y el entorno." }]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setShowAIImproveButton(false);
    }
  };

  const handleSendEmail = async () => {
    if (!generatedPhoto) return;
    setLoading(true);
    try {
      const res = await fetch("/api/notify/photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: generatedPhoto })
      });
      const data = await res.json();
      if (data.success) alert("¡Foto enviada a tu correo con éxito! 📧");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading || epiphany) return;
    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/assistants/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          type, 
          userInput: input, 
          messages: messages.slice(-10),
          imageUrl: (type === 'audit_photo') ? uploadedImage : null,
          userId
        })
      });
      const data = await res.json();
      if (data.success) {
        let text = data.content;
        if (text.includes("[EPIFANIA]")) {
          const parts = text.split("[EPIFANIA]");
          text = parts[0].trim();
          setEpiphany(parts[1].trim());
        }
        if (text.includes("[PROPOSE_RETOUCH]")) {
          text = text.replace("[PROPOSE_RETOUCH]", "").trim();
          setShowAIImproveButton(true);
        }
        if (text) setMessages(prev => [...prev, { role: "assistant", content: text }]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "650px", position: "relative" }}>
      <div 
        ref={scrollRef}
        style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}
        className="custom-scrollbar"
      >
        {type === 'audit_photo' && !uploadedImage && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass"
            style={{ padding: "4rem 2rem", borderRadius: "2rem", textAlign: "center", border: "2px dashed rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.01)" }}
          >
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "rgba(59, 130, 246, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 2rem", color: "#3b82f6" }}>
               {uploadingPhoto ? <Loader2 className="animate-spin" size={32} /> : <Camera size={32} />}
            </div>
            <h4 style={{ fontSize: "1.2rem", fontWeight: 900, marginBottom: "0.5rem", color: "white" }}>Sube tu foto profesional</h4>
            <p style={{ opacity: 0.5, fontSize: "0.9rem", marginBottom: "2rem" }}>Bolton IA auditará tu imagen y te sugerirá mejoras de autoridad.</p>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="glass-button"
              style={{ padding: "1rem 2rem", borderRadius: "1rem", fontWeight: 800, background: "#3b82f6", color: "white", border: "none", cursor: "pointer" }}
            >
              {uploadingPhoto ? "SUBIENDO..." : "SELECCIONAR ARCHIVO"}
            </button>
            <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} style={{ display: "none" }} accept="image/*" />
          </motion.div>
        )}

        {messages.length === 0 && type !== 'audit_photo' && (
          <div style={{ textAlign: "center", padding: "3rem", opacity: 0.4 }}>
            <p style={{ fontSize: "0.9rem" }}>{placeholder || "Escribe un mensaje para comenzar..."}</p>
          </div>
        )}

        {messages.map((m, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ 
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: "85%",
              padding: "1.2rem 1.6rem",
              borderRadius: m.role === 'user' ? "2rem 2rem 0.5rem 2rem" : "2rem 2rem 2rem 0.5rem",
              background: m.role === 'user' ? "rgba(255,255,255,0.05)" : `${assistant.color}18`,
              border: `1px solid ${m.role === 'user' ? 'rgba(255,255,255,0.1)' : `${assistant.color}35`}`,
              fontSize: "1.05rem",
              lineHeight: 1.5,
              whiteSpace: "pre-wrap",
              color: "white"
            }}
          >
            {m.content}
          </motion.div>
        ))}

        {generatedPhoto && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass"
            style={{ padding: "1.5rem", borderRadius: "1.5rem", marginTop: "1rem", border: "1px solid #10b98133", background: "rgba(16, 185, 129, 0.05)" }}
          >
            <p style={{ fontSize: "0.7rem", fontWeight: 900, color: "#10b981", letterSpacing: "1px", marginBottom: "1rem" }}>SUGERENCIA DE IA BOLTON:</p>
            <img src={generatedPhoto} alt="Generated" style={{ width: "100%", borderRadius: "1rem", marginBottom: "1.5rem", border: "2px solid rgba(255,255,255,0.1)" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <a href={generatedPhoto} download="mi-foto-bolton.jpg" target="_blank" rel="noopener noreferrer" style={{ display: "flex", textDecoration: "none", alignItems: "center", justifyContent: "center", gap: "0.5rem", background: "rgba(255,255,255,0.05)", padding: "1rem", borderRadius: "1rem", color: "white", fontSize: "0.85rem", fontWeight: 800 }}>
                <Download size={16} /> DESCARGAR HD
              </a>
              <button onClick={handleSendEmail} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", background: "#3b82f6", padding: "1rem", borderRadius: "1rem", color: "white", border: "none", fontSize: "0.85rem", fontWeight: 800, cursor: "pointer" }}>
                <Mail size={16} /> ENVIAR AL CORREO
              </button>
            </div>
          </motion.div>
        )}

        {showAIImproveButton && !generatedPhoto && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: "center", padding: "1.5rem", background: "rgba(59, 130, 246, 0.05)", borderRadius: "1.5rem", border: "1px dashed rgba(59, 130, 246, 0.3)" }}
          >
            <p style={{ fontSize: "0.95rem", marginBottom: "1.5rem", opacity: 0.8 }}>¿Deseas que genere una versión profesional mejorada usando este perfil?</p>
            <button 
              onClick={handleImprovePhoto}
              style={{ display: "flex", alignItems: "center", gap: "0.8rem", margin: "0 auto", background: "#3b82f6", color: "white", padding: "1rem 2rem", borderRadius: "1rem", border: "none", fontWeight: 950, cursor: "pointer" }}
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> {loading ? "TRABAJANDO..." : "SÍ, GENERAR RETOQUE CON IA"}
            </button>
          </motion.div>
        )}

        {loading && !showAIImproveButton && !generatedPhoto && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", color: "rgba(255,255,255,0.5)", paddingLeft: "1rem" }}>
            <Loader2 className="animate-spin" size={18} /> <span style={{ fontSize: "0.9rem", fontWeight: 700 }}>AI está procesando...</span>
          </div>
        )}

        {epiphany && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="glass" 
            style={{ 
              padding: "3rem", borderRadius: "2.5rem", marginTop: "4rem", 
              background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)",
              border: "1px solid rgba(16, 185, 129, 0.3)", boxShadow: "0 20px 50px rgba(0, 0, 0, 0.2)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1.2rem", marginBottom: "2.5rem" }}>
               <div style={{ width: "50px", height: "50px", borderRadius: "1rem", background: "#10b981", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Sparkles size={28} />
               </div>
               <h3 style={{ fontSize: "2rem", fontWeight: 1000, letterSpacing: "-1px" }}>LA EPIFANÍA BOLTON</h3>
            </div>
            <div style={{ fontSize: "1.1rem", lineHeight: 1.8, opacity: 0.9, whiteSpace: "pre-wrap", marginBottom: "3rem" }}>{epiphany}</div>
            <button 
               onClick={() => { setMessages([]); setEpiphany(null); }}
               className="btn-primary" 
               style={{ width: "100%", padding: "1.2rem", borderRadius: "1.5rem", background: "#10b981", fontWeight: 950, fontSize: "0.9rem", border: "none", color: "white", cursor: "pointer" }}
            >
               NUEVA SIMULACIÓN <ListRestart size={18} />
            </button>
          </motion.div>
        )}
      </div>

      {!epiphany && (!showAIImproveButton || input) && (
        <div style={{ position: "relative" }}>
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder={type === 'audit_photo' ? "Comenta tu foto..." : "Escribe un mensaje..."}
            className="glass-input"
            style={{ width: "100%", padding: "1.2rem 5rem 1.2rem 2rem", borderRadius: "2rem", color: "white", fontSize: "1.1rem", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}
          />
          <button 
            onClick={sendMessage}
            disabled={loading}
            style={{ position: "absolute", right: "0.8rem", top: "50%", transform: "translateY(-50%)", background: assistant.color, border: "none", color: "white", width: "45px", height: "45px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
          </button>
        </div>
      )}
    </div>
  );
}
