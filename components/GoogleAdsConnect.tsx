"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, CheckCircle2, ChevronRight, Loader2, Info } from "lucide-react";

import { supabase } from "@/lib/supabase";

export default function GoogleAdsConnect({ onConnected, userId }: { onConnected: (id: string) => void, userId?: string }) {
  const [customerId, setCustomerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const formatId = (val: string) => {
    const cleaned = val.replace(/\D/g, "");
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerId(formatId(e.target.value));
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch("/api/ads/connect", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ customerId, userId }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "No pudimos conectar con esta cuenta.");
      }

      setSuccess(true);
      setTimeout(() => onConnected(data.id || customerId), 1500);
    } catch (err: any) {
      setError(err.message || "No pudimos conectar con esta cuenta. Verifica el ID.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass"
      style={{ padding: "3rem", maxWidth: "600px", margin: "0 auto", textAlign: "center" }}
    >
      <AnimatePresence mode="wait">
        {!success ? (
          <motion.div key="form" exit={{ opacity: 0, x: -20 }}>
            <div style={{ background: "rgba(59, 130, 246, 0.1)", width: "64px", height: "64px", borderRadius: "1rem", display: "flex", justifyContent: "center", alignItems: "center", margin: "0 auto 1.5rem" }}>
              <BarChart3 size={32} color="var(--primary)" />
            </div>
            
            <h2 style={{ fontSize: "1.75rem", marginBottom: "0.75rem" }}>Conecta tu Google Ads</h2>
            <p style={{ color: "var(--muted-foreground)", marginBottom: "2rem" }}>
              Para que Bolton empiece a pensar por ti, necesitamos acceso a los datos de tu cuenta. 
              Es 100% seguro y solo tomamos lectura.
            </p>

            <form onSubmit={handleConnect} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ textAlign: "left" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem", display: "block", color: "var(--muted-foreground)" }}>
                  Tu Customer ID (Ej: 123-456-7890)
                </label>
                <input
                  type="text"
                  placeholder="000-000-0000"
                  className="input"
                  style={{ fontSize: "1.25rem", textAlign: "center", letterSpacing: "1.5px" }}
                  value={customerId}
                  onChange={handleInputChange}
                  maxLength={12}
                  required
                />
              </div>

              {error && (
                <div style={{ color: "var(--error)", fontSize: "0.875rem", background: "rgba(239, 68, 68, 0.1)", padding: "0.75rem", borderRadius: "0.5rem" }}>
                  {error}
                </div>
              )}

              <button className="btn btn-primary" style={{ padding: "1rem", fontSize: "1.1rem" }} disabled={loading}>
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Vincular mi cuenta"}
                {!loading && <ChevronRight size={20} />}
              </button>
            </form>

            <div style={{ marginTop: "2rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", color: "var(--muted-foreground)", fontSize: "0.875rem" }}>
              <Info size={16} />
              <span>¿No sabes dónde encontrar tu ID? <a href="#" style={{ color: "var(--primary)" }}>Ver tutorial</a></span>
            </div>
          </motion.div>
        ) : (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
            <div style={{ color: "var(--success)", marginBottom: "1.5rem" }}>
              <CheckCircle2 size={72} strokeWidth={1.5} />
            </div>
            <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>¡Conexión Exitosa!</h2>
            <p style={{ color: "var(--muted-foreground)" }}>
              Estamos estableciendo el puente seguro con Google Ads. <br /> 
              Dame unos segundos para empezar a analizar tu cuenta.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
