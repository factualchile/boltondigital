"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowLeft, Mail, Lock, User, LogIn, UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthForm({ onBack }: { onBack: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      }
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass"
      style={{ width: "100%", maxWidth: "450px", padding: "3rem 2.5rem", position: "relative" }}
    >
      <button onClick={onBack} style={{ position: "absolute", top: "1.5rem", left: "1.5rem", color: "var(--muted-foreground)", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
        <ArrowLeft size={16} /> Volver
      </button>

      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{isLogin ? "Bienvenido de vuelta" : "Crea tu cuenta"}</h2>
        <p style={{ color: "var(--muted-foreground)" }}>El primer paso para crecer con inteligencia.</p>
      </div>

      <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div style={{ position: "relative" }}>
          <Mail size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
          <input
            type="email"
            placeholder="Introduce tu correo"
            className="input"
            style={{ paddingLeft: "3rem" }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div style={{ position: "relative" }}>
          <Lock size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
          <input
            type="password"
            placeholder="Contraseña"
            className="input"
            style={{ paddingLeft: "3rem" }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <div style={{ color: "var(--error)", fontSize: "0.875rem", textAlign: "center" }}>{error}</div>}

        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%", padding: "1rem" }}>
          {loading ? "Cargando..." : isLogin ? "Acceder" : "Unirse gratis"}
          {!loading && (isLogin ? <LogIn size={18} /> : <UserPlus size={18} />)}
        </button>
      </form>

      <div style={{ marginTop: "2rem", textAlign: "center", fontSize: "0.95rem" }}>
        <span style={{ color: "var(--muted-foreground)" }}>
          {isLogin ? "¿No tienes una cuenta? " : "¿Ya eres parte de Bolton? "}
        </span>
        <button onClick={() => setIsLogin(!isLogin)} style={{ color: "var(--primary)", fontWeight: 600 }}>
          {isLogin ? "Crea una ahora" : "Inicia sesión"}
        </button>
      </div>

      {!isLogin && (
        <p style={{ marginTop: "1.5rem", fontSize: "0.75rem", color: "var(--muted-foreground)", textAlign: "center" }}>
          Al registrarte, aceptas nuestros términos y condiciones.
        </p>
      )}
    </motion.div>
  );
}
