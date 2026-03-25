"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, User as UserIcon, LayoutDashboard, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Escuchar cambios de estado
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (!user) return null;

  return (
    <AnimatePresence>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ 
          position: "fixed", 
          top: 0, 
          left: 0, 
          right: 0, 
          zIndex: 1000,
          padding: scrolled ? "0.5rem 2rem" : "0.75rem 2.5rem", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          background: scrolled ? "rgba(5, 5, 8, 0.9)" : "transparent", 
          backdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255, 255, 255, 0.05)" : "none",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
           <div 
             onClick={() => router.push("/")}
             style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "0.6rem" }}
           >
              <div style={{ 
                background: "linear-gradient(135deg, var(--primary), var(--accent))", 
                padding: "0.4rem", 
                borderRadius: "0.6rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 15px rgba(59, 130, 246, 0.4)"
              }}>
                <Zap size={18} color="white" fill="white" />
              </div>
              <span style={{ fontFamily: "var(--font-outfit)", fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.5px" }}>
                BOLTON <span style={{ color: "var(--primary)" }}>DIGITAL</span>
              </span>
           </div>
        </div>

        <div style={{ display: "flex", gap: "1.2rem", alignItems: "center" }}>
          {pathname === "/" && (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/dashboard")}
              className="btn btn-primary" 
              style={{ padding: "0.6rem 1.2rem", fontSize: "0.8rem", height: "auto", fontWeight: 700 }}
            >
              IR AL DASHBOARD IA <LayoutDashboard size={14} style={{ marginLeft: "0.6rem" }} />
            </motion.button>
          )}
          
          <button 
            onClick={handleSignOut} 
            className="btn" 
            style={{ 
              background: "rgba(255, 255, 255, 0.03)", 
              border: "1px solid rgba(255, 255, 255, 0.08)",
              padding: "0.6rem 1.2rem", 
              fontSize: "0.8rem", 
              height: "auto", 
              display: "flex", 
              alignItems: "center", 
              gap: "0.6rem",
              color: "white",
              fontWeight: 600
            }}
          >
            <LogOut size={14} strokeWidth={2.5} /> Salir
          </button>
        </div>
      </motion.nav>
    </AnimatePresence>
  );
}
