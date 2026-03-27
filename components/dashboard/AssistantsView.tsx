"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, MessageSquare, Globe, User, 
  ArrowLeft, Send, Loader2, Zap, 
  CheckCircle2, TrendingUp, Users, DollarSign,
  AlertCircle, Smartphone
} from 'lucide-react';

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
    name: 'Simulador de Paciente',
    description: 'Entrena tu cierre de ventas por WhatsApp con pacientes simulados por IA.',
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

export function AssistantsView() {
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
                {selectedId === 'whatsapp' && <SimulatorChat type="simulator" assistant={activeAssistant!} />}
                {selectedId === 'landing' && <SimulatorChat type="audit_landing" assistant={activeAssistant!} placeholder="Pega la URL o el texto de tu landing..." />}
                {selectedId === 'foto' && <SimulatorChat type="audit_photo" assistant={activeAssistant!} placeholder="Describe tu foto profesional o sube una para analizar..." />}
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

function SimulatorChat({ type, assistant, placeholder }: { type: string, assistant: Assistant, placeholder?: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/assistants/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, userInput: input, messages: messages.slice(-5) })
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, { role: "assistant", content: data.content }]);
      }
    } catch (e) {
      console.error("Chat error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "500px" }}>
      <div 
        ref={scrollRef}
        style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}
        className="custom-scrollbar"
      >
        {messages.length === 0 && (
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
              padding: "1rem 1.4rem",
              borderRadius: m.role === 'user' ? "1.5rem 1.5rem 0.2rem 1.5rem" : "1.5rem 1.5rem 1.5rem 0.2rem",
              background: m.role === 'user' ? "rgba(255,255,255,0.05)" : `${assistant.color}15`,
              border: `1px solid ${m.role === 'user' ? 'rgba(255,255,255,0.1)' : `${assistant.color}30`}`,
              fontSize: "0.95rem",
              lineHeight: 1.5,
              whiteSpace: "pre-wrap",
              color: "white"
            }}
          >
            {m.content}
          </motion.div>
        ))}
        {loading && (
          <div style={{ alignSelf: "flex-start", opacity: 0.5, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Loader2 className="animate-spin" size={16} /> <span style={{ fontSize: "0.8rem" }}>AI está pensando...</span>
          </div>
        )}
      </div>

      <div style={{ position: "relative" }}>
        <input 
          type="text" 
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Escribe tu mensaje..."
          className="glass-input"
          style={{ width: "100%", paddingRight: "4rem", borderRadius: "1.5rem", color: "white" }}
        />
        <button 
          onClick={sendMessage}
          disabled={loading}
          style={{ position: "absolute", right: "0.6rem", top: "50%", transform: "translateY(-50%)", background: assistant.color, border: "none", color: "white", width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
