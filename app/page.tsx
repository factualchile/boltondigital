"use client";

import { useState, useEffect } from "react";
import AuthForm from "@/components/AuthForm";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Loader2, Zap, TrendingUp, Bot, ArrowRight, LogOut } from "lucide-react";
import { motion } from "framer-motion";

import Navbar from "@/components/Navbar";

export default function LandingPage() {
  const [showAuth, setShowAuth] = useState(false);
  const [checking, setChecking] = useState(true);
  const [session, setSession] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setChecking(false);
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    router.refresh();
  };

  if (checking) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--background)" }}>
        <Loader2 className="animate-spin" size={40} color="var(--primary)" />
      </div>
    );
  }

  return (
    <main className="container" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "4rem 1.5rem", position: "relative" }}>
      {!showAuth ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ textAlign: "center", maxWidth: "800px" }}
        >
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(59, 130, 246, 0.1)", padding: "0.5rem 1rem", borderRadius: "2rem", marginBottom: "2rem", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
            <Zap size={16} color="var(--primary)" />
            <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--primary)" }}>IA aplicada al crecimiento real</span>
          </div>

          <h1 style={{ fontSize: "clamp(2.5rem, 8vw, 4.5rem)", lineHeight: 1.1, marginBottom: "1.5rem", fontWeight: 800 }}>
            Tu negocio no necesita más datos. <br />
            <span style={{ background: "linear-gradient(to right, var(--primary), var(--accent))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Necesita inteligencia.
            </span>
          </h1>

          <p style={{ fontSize: "clamp(1.1rem, 2vw, 1.25rem)", color: "var(--muted-foreground)", marginBottom: "3rem", lineHeight: 1.6 }}>
            Bolton Digital traduce la complejidad de Google Ads en claridad humana. 
            Conecta tu cuenta y deja que el sistema trabaje por ti. Empecemos hoy.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center" }}>
            <button className="btn btn-primary" style={{ padding: "1rem 2rem", fontSize: "1.1rem" }} onClick={() => setShowAuth(true)}>
              Comenzar gratis <ArrowRight size={20} />
            </button>
            <button className="btn btn-secondary" style={{ padding: "1rem 2rem", fontSize: "1.1rem" }}>
              Saber más
            </button>
          </div>

          <div style={{ marginTop: "5rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2rem" }}>
            <FeatureCard
              icon={<TrendingUp size={24} color="var(--primary)" />}
              title="Crecimiento Real"
              desc="No mostramos clics, mostramos oportunidades de negocio."
            />
            <FeatureCard
              icon={<Bot size={24} color="var(--accent)" />}
              title="Cerebro Digital"
              desc="IA que analiza tu cuenta 24/7 para que tú no tengas que hacerlo."
            />
            <FeatureCard
              icon={<Zap size={24} color="var(--success)" />}
              title="Sincronización Total"
              desc="Conexión nativa con Google Ads en menos de 2 minutos."
            />
          </div>
        </motion.div>
      ) : (
        <AuthForm onBack={() => setShowAuth(false)} />
      )}
    </main>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="glass" style={{ padding: "2rem", textAlign: "left", transition: "transform 0.3s ease" }}>
      <div style={{ marginBottom: "1rem" }}>{icon}</div>
      <h3 style={{ marginBottom: "0.5rem", fontSize: "1.25rem" }}>{title}</h3>
      <p style={{ color: "var(--muted-foreground)", fontSize: "0.95rem" }}>{desc}</p>
    </div>
  );
}
