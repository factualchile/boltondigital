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
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#050505" }}>
        <Loader2 className="animate-spin" size={40} color="#3b82f6" style={{ opacity: 0.4 }} />
      </div>
    );
  }

  return (
    <main className="container" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "6rem 1.5rem 4rem", position: "relative" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: "center", maxWidth: "900px" }}
      >
        {/* PILL BADGE */}
        <div className="pill-badge" style={{ marginBottom: '1.5rem' }}>
          <Zap size={14} color="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
          <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--muted-foreground)", letterSpacing: "1px", textTransform: "uppercase" }}>IA aplicada al crecimiento real</span>
        </div>
        
        <h1 style={{ fontSize: "clamp(2.5rem, 7vw, 5.2rem)", lineHeight: 1.05, marginBottom: "0.75rem", fontWeight: 950, letterSpacing: "-0.04em" }}>
          Tu negocio no necesita más datos.<br />
          <span style={{ color: "#3b82f6" }}>Necesita inteligencia.</span>
        </h1>

        <p style={{ fontSize: "clamp(0.95rem, 1.6vw, 1.1rem)", color: "var(--muted-foreground)", marginBottom: "2rem", lineHeight: 1.7, maxWidth: "650px", marginInline: "auto" }}>
          Bolton Digital traduce la complejidad de Google Ads en claridad humana. 
          Conecta tu cuenta y deja que el sistema trabaje por ti. Empecemos hoy.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center", marginBottom: "3rem" }}>
          <button className="btn btn-primary" style={{ padding: "1.2rem 2.8rem", fontSize: "1rem" }} onClick={() => router.push('/crear-cuenta')}>
            Comenzar gratis <ArrowRight size={18} />
          </button>
          <button className="btn btn-secondary" style={{ padding: "1.2rem 2.8rem", fontSize: "1rem" }} onClick={() => router.push('/acceder')}>
            Acceder
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem" }}>
          <FeatureCard
            icon={<TrendingUp size={20} color="#3b82f6" />}
            title="Crecimiento Real"
            desc="No solo clics, sino oportunidades reales de negocio."
          />
          <FeatureCard
            icon={<Bot size={20} color="#06b6d4" />}
            title="Cerebro Digital"
            desc="IA que analiza tu cuenta 24/7 sin descanso."
          />
          <FeatureCard
            icon={<Zap size={20} color="#10b981" />}
            title="Sincronización Total"
            desc="Conexión nativa con Google Ads en tiempo récord."
          />
        </div>
      </motion.div>
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
