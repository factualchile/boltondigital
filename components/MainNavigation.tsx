"use client";

import { motion } from "framer-motion";
import { Target, LayoutDashboard, Users, TestTube2, GraduationCap } from "lucide-react";

export type Pilar = "desafios" | "dashboard" | "asistentes" | "laboratorio" | "aprende";

interface MainNavigationProps {
  activePilar: Pilar;
  onChange: (pilar: Pilar) => void;
}

const PILARS = [
  { id: "desafios", name: "Desafíos", icon: Target, color: "#3b82f6" },
  { id: "dashboard", name: "Dashboard", icon: LayoutDashboard, color: "#8b5cf6" },
  { id: "asistentes", name: "Asistentes", icon: Users, color: "#10b981" },
  { id: "laboratorio", name: "Laboratorio", icon: TestTube2, color: "#f59e0b" },
  { id: "aprende", name: "Aprende", icon: GraduationCap, color: "#ec4899" },
];

export default function MainNavigation({ activePilar, onChange }: MainNavigationProps) {
  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      marginBottom: "3rem", 
      padding: "0.5rem",
      background: "rgba(255, 255, 255, 0.02)",
      borderRadius: "1.5rem",
      border: "1px solid rgba(255, 255, 255, 0.05)",
      width: "fit-content",
      margin: "0 auto 4rem",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
    }}>
      {PILARS.map((pilar) => {
        const isActive = activePilar === pilar.id;
        const Icon = pilar.icon;

        return (
          <button
            key={pilar.id}
            onClick={() => onChange(pilar.id as Pilar)}
            style={{
              position: "relative",
              padding: "0.75rem 1.5rem",
              borderRadius: "1.2rem",
              border: "none",
              background: "transparent",
              color: isActive ? "white" : "var(--muted-foreground)",
              cursor: "pointer",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              fontWeight: 700,
              fontSize: "0.9rem",
            }}
          >
            {isActive && (
              <motion.div
                layoutId="activePilar"
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "1.2rem",
                  border: `1px solid ${pilar.color}44`,
                  boxShadow: `0 0 20px ${pilar.color}11`,
                  zIndex: 0,
                }}
              />
            )}
            <Icon 
              size={18} 
              color={isActive ? pilar.color : "var(--muted-foreground)"} 
              style={{ position: "relative", zIndex: 1 }} 
            />
            <span style={{ position: "relative", zIndex: 1 }}>{pilar.name}</span>
          </button>
        );
      })}
    </div>
  );
}
