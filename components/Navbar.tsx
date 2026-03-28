"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, User as UserIcon, LayoutDashboard, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MainNavigation from "./MainNavigation";

declare global {
  interface Window {
    __BOLTON_ACTIVE_PILAR__?: string;
    __BOLTON_SET_PILAR__?: (p: string) => void;
    __BOLTON_SHOW_PROFILE__?: () => void;
  }
}

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);
  const [activePilar, setActivePilar] = useState<string>("desafios");
  const router = useRouter();
  const pathname = usePathname();
  const isLandingPage = pathname?.startsWith('/l/') || pathname?.startsWith('/landing/');
  const isDashboard = pathname === '/dashboard';

  useEffect(() => {
    // 🛡️ ESCUCHAR CAMBIOS DEL DASHBOARD
    const handlePilarChange = (e: any) => {
       if (e.detail) setActivePilar(e.detail);
    };
    window.addEventListener('bolton:pilar-changed', handlePilarChange);

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener('bolton:pilar-changed', handlePilarChange);
      subscription.unsubscribe();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (isLandingPage) return null;
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
          padding: scrolled ? "0.4rem 2rem" : "0.6rem 2.5rem", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          background: scrolled ? "rgba(5, 5, 8, 0.95)" : "rgba(5, 5, 8, 0.5)", 
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
        }}
      >
        {/* LADO IZQUIERDO: LOGO */}
        <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
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

        {/* CENTRO: NAVEGACIÓN MAESTRA (Solo en Dashboard) */}
        <div style={{ flex: 2, display: "flex", justifyContent: "center" }}>
           {isDashboard && (
             <MainNavigation 
               activePilar={activePilar as any} 
               onChange={(p) => {
                 setActivePilar(p);
                 window.dispatchEvent(new CustomEvent('bolton:remote-pilar-set', { detail: p }));
               }} 
             />
           )}
        </div>

        {/* LADO DERECHO: ACCIONES */}
        <div style={{ flex: 1, display: "flex", gap: "1rem", alignItems: "center", justifyContent: "flex-end" }}>
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

          {isDashboard && (
            <button 
              onClick={() => window.__BOLTON_SHOW_PROFILE__?.()}
              className="glass" 
              style={{ width: "38px", height: "38px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", cursor: "pointer" }}
            >
              <UserIcon size={16} color="var(--primary)" />
            </button>
          )}
          
          <button 
            onClick={handleSignOut} 
            className="btn" 
            style={{ 
              background: "rgba(255, 255, 255, 0.02)", 
              border: "1px solid rgba(255, 255, 255, 0.05)",
              padding: "0.5rem 1rem", 
              fontSize: "0.75rem", 
              height: "auto", 
              display: "flex", 
              alignItems: "center", 
              gap: "0.5rem",
              color: "white",
              fontWeight: 600,
              borderRadius: "8px"
            }}
          >
            <LogOut size={14} /> Salir
          </button>
        </div>
      </motion.nav>
    </AnimatePresence>
  );
}
