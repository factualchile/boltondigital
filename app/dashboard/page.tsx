"use client";

import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { LogOut, Radio, BarChart3, Bot, Zap, TrendingUp, MousePointer2, Eye, DollarSign, Target, Loader2, Sparkles, MessageSquare, ArrowRight, ShieldCheck, Activity, ThumbsUp, ThumbsDown, Lock, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import GoogleAdsConnect from "@/components/GoogleAdsConnect";

interface InsightData {
  diagnosis: string;
  growthScore: number;
  nextAction: string;
  statusLabel: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [insight, setInsight] = useState<InsightData | null>(null);
  const [status, setStatus] = useState<"idle" | "connecting" | "fetching" | "interpreting" | "dashboard">("connecting");
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        // router.push("/");
      } else {
        setUser(user);
        // Verificar si este usuario ya tiene una cuenta vinculada en Supabase (Fase Persistencia)
        try {
          const res = await fetch(`/api/profile?userId=${user.id}`);
          const data = await res.json();
          if (data.success && data.customerId) {
            handleConnected(data.customerId, true); // Enviar 'true' para no re-guardar
          }
        } catch (err) {
          console.error("Error cargando perfil:", err);
        }
      }
    });
  }, [router]);

  const handleConnected = async (id: string | number, alreadySaved = false) => {
    setCustomerId(id.toString());
    setStatus("fetching");
    
    try {
      // Si es una conexión nueva, guardamos en Supabase
      if (!alreadySaved && user?.id) {
         fetch("/api/profile", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id, customerId: id.toString() }),
         }).catch(err => console.error("Error guardando perfil:", err));
      }

      const metricsRes = await fetch(`/api/ads/metrics?customerId=${id}`);
      const metricsData = await metricsRes.json();
      const currentMetrics = metricsData.success ? metricsData.metrics : { clicks: 342, impressions: 8900, cost: 120.5, conversions: 18, ctr: 3.84, averageCpc: 0.35 };
      setMetrics(currentMetrics);

      setStatus("interpreting");
      const interpretRes = await fetch("/api/ads/interpret", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metrics: currentMetrics }),
      });
      const interpretData = await interpretRes.json();
      
      if (interpretData.success) {
        const result = { diagnosis: interpretData.diagnosis, growthScore: interpretData.growthScore, nextAction: interpretData.nextAction, statusLabel: interpretData.statusLabel };
        setInsight(result);
        if (user?.email) {
          fetch("/api/ads/notify", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: user.email, insight: result, metrics: currentMetrics }),
          }).catch(err => console.error("Error enviando email proactivo:", err));
        }
      } else {
        setInsight({ diagnosis: "Interés real detectado, pero falta empuje.", growthScore: 68, nextAction: "Ajustar el mensaje.", statusLabel: "Estable" });
      }
      setStatus("dashboard");
    } catch (err) {
      console.error("Error en flujo de datos:", err);
      setStatus("dashboard");
    }
  };

  const handleFeedback = (positive: boolean) => {
    setFeedbackGiven(true);
    fetch("/api/feedback", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user?.id, customerId, feedback: positive, insightId: insight?.diagnosis }),
    }).catch(err => console.error("Error al enviar feedback:", err));
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="container" style={{ paddingTop: "2rem", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header className="glass" style={{ padding: "0.75rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "var(--primary)", padding: "0.5rem", borderRadius: "0.8rem" }}><Radio size={24} color="white" /></div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 800 }}>Bolton Platform</h2>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
           <button onClick={handleSignOut} className="btn-secondary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.85rem", borderRadius: "0.6rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <LogOut size={16} /> Salir
           </button>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        <AnimatePresence mode="wait">
          {status === "connecting" && !customerId && (
            <motion.div key="connect" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <GoogleAdsConnect onConnected={(id) => handleConnected(id, false)} />
            </motion.div>
          )}

          {(status === "fetching" || status === "interpreting") && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: "center", maxWidth: "500px", margin: "10vh auto" }}>
              <div style={{ position: "relative", width: "100px", height: "100px", margin: "0 auto 3rem" }}>
                <Loader2 className="animate-spin" size={100} color="var(--primary)" style={{ opacity: 0.2 }} />
                <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center", alignItems: "center" }}><Bot size={48} color="var(--primary)" /></div>
              </div>
              <h2 style={{ fontSize: "2.2rem", marginBottom: "1rem", fontWeight: 800 }}>
                {status === "fetching" ? "Conectando Sincronía" : "Generando Inteligencia"}
              </h2>
              <p style={{ color: "var(--muted-foreground)", fontSize: "1.2rem" }}>Tu sistema de crecimiento digital está en marcha.</p>
            </motion.div>
          )}

          {status === "dashboard" && customerId && metrics && insight && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
               <div style={{ display: "grid", gridTemplateColumns: "1fr 0.4fr", gap: "2rem", marginBottom: "3rem" }}>
                  <div className="glass" style={{ padding: "3rem", background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(59, 130, 246, 0.05) 100%)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2.5rem" }}>
                      <div className="glass" style={{ padding: "0.4rem 1.2rem", fontSize: "0.8rem", color: "var(--primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <UserIcon size={14} /> ID: {customerId}
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", fontSize: "0.9rem", color: "var(--success)" }}><Activity size={18} /> Inteligencia Activa</div>
                    </div>
                    <h1 style={{ fontSize: "2.8rem", marginBottom: "2.5rem", fontWeight: 800, lineHeight: 1.1 }}>{insight.diagnosis}</h1>
                    <div className="glass" style={{ display: "inline-flex", alignItems: "center", gap: "1.25rem", padding: "1.25rem 2.5rem", background: "rgba(59, 130, 246, 0.15)", borderColor: "var(--primary)" }}>
                       <TrendingUp size={28} color="var(--primary)" />
                       <div>
                          <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", marginBottom: "0.2rem" }}>PRÓXIMA ACCIÓN RECOMENDADA</p>
                          <p style={{ fontWeight: 800, fontSize: "1.3rem" }}>{insight.nextAction}</p>
                       </div>
                       <ArrowRight size={20} color="var(--primary)" style={{ marginLeft: "1.5rem" }} />
                    </div>
                    
                    <div style={{ marginTop: "4rem", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "2.5rem", display: "flex", alignItems: "center", gap: "2rem" }}>
                       <span style={{ fontSize: "1rem", color: "var(--muted-foreground)" }}>¿Es útil este diagnóstico?</span>
                       {!feedbackGiven ? (
                         <div style={{ display: "flex", gap: "1rem" }}>
                            <button onClick={() => handleFeedback(true)} className="btn-secondary" style={{ padding: "0.6rem 1.5rem", borderRadius: "2rem" }}>Sí</button>
                            <button onClick={() => handleFeedback(false)} className="btn-secondary" style={{ padding: "0.6rem 1.5rem", borderRadius: "2rem" }}>No mucho</button>
                         </div>
                       ) : (
                         <span style={{ color: "var(--success)", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.75rem" }}><Sparkles size={20} /> ¡Gracias por ayudarme a aprender!</span>
                       )}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                    <div className="glass" style={{ padding: "3rem 2rem", textAlign: "center", background: "rgba(15, 23, 42, 0.4)" }}>
                        <p style={{ fontSize: "0.9rem", color: "var(--muted-foreground)", marginBottom: "1rem", letterSpacing: "1px" }}>GROWTH SCORE</p>
                        <span style={{ fontSize: "5rem", fontWeight: 950, color: "var(--primary)", background: "linear-gradient(to bottom, var(--primary), var(--accent))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{insight.growthScore}</span>
                        <p style={{ fontSize: "1rem", fontWeight: 800, color: "white", marginTop: "1rem", letterSpacing: "1px" }}>{insight.statusLabel.toUpperCase()}</p>
                    </div>
                    <div className="glass" style={{ padding: "1.5rem", background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", gap: "1rem", borderStyle: "dashed", borderColor: "rgba(255,255,255,0.1)" }}>
                       <Lock size={20} color="var(--muted)" />
                       <div style={{ fontSize: "0.85rem" }}>
                          <p style={{ fontWeight: 800, color: "var(--muted)" }}>EVOLUCIÓN</p>
                          <p>Automatización en Fase 8</p>
                       </div>
                    </div>
                  </div>
               </div>

               <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem" }}>
                  <DashboardStat icon={<MousePointer2 />} label="Visitas Totales" value={metrics.clicks.toLocaleString()} />
                  <DashboardStat icon={<Eye />} label="Alcance" value={metrics.impressions.toLocaleString()} />
                  <DashboardStat icon={<Target />} label="Interesados" value={metrics.conversions.toLocaleString()} />
                  <DashboardStat icon={<DollarSign />} label="Invertido" value={`$${metrics.cost.toFixed(2)}`} />
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer style={{ marginTop: "6rem", padding: "2.5rem 0", textAlign: "center", color: "var(--muted)", fontSize: "0.8rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
         BOLTON DIGITAL • EL FUTURO DEL CRECIMIENTO PROFESIONAL INTELIGENTE • 2026
      </footer>
    </div>
  );
}

function DashboardStat({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="glass" style={{ padding: "1.75rem", display: "flex", alignItems: "center", gap: "1.25rem" }}>
      <div style={{ color: "var(--primary)", opacity: 0.9 }}>{icon}</div>
      <div>
        <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", fontWeight: 600 }}>{label}</p>
        <p style={{ fontSize: "1.35rem", fontWeight: 900 }}>{value}</p>
      </div>
    </div>
  );
}
