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
    <div className="nav-pilar-container" style={{ 
      display: "flex", 
      justifyContent: "center", 
      padding: "0.15rem",
      background: "rgba(255, 255, 255, 0.02)",
      borderRadius: "99px",
      border: "1px solid rgba(255, 255, 255, 0.05)",
      width: "fit-content",
      maxWidth: "100%",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      zIndex: 100,
      position: "relative"
    }}>
      {PILARS.map((pilar) => {
        const isActive = activePilar === pilar.id;
        const Icon = pilar.icon;

        return (
          <button
            key={pilar.id}
            onClick={() => {
              console.log("Navigating to:", pilar.id);
              onChange(pilar.id as Pilar);
            }}
            style={{
              position: "relative",
              padding: "0.6rem 1.4rem",
              borderRadius: "99px",
              border: "none",
              background: "transparent",
              color: isActive ? "white" : "rgba(255,255,255,0.4)",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.6rem",
              fontWeight: 800,
              fontSize: "0.85rem",
              zIndex: 110,
              outline: "none",
              WebkitTapHighlightColor: "transparent"
            }}
          >
            {isActive && (
              <motion.div
                layoutId="activePilar"
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(255, 255, 255, 0.08)",
                  borderRadius: "99px",
                  border: `1px solid ${pilar.color}55`,
                  boxShadow: `0 8px 16px -4px ${pilar.color}22`,
                  zIndex: -1,
                  pointerEvents: "none"
                }}
              />
            )}
            <Icon 
              size={16} 
              color={isActive ? pilar.color : "rgba(255,255,255,0.4)"} 
              style={{ pointerEvents: "none" }} 
            />
            <span style={{ pointerEvents: "none" }}>{pilar.name}</span>
          </button>
        );
      })}
    </div>
  );
}
