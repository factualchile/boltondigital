"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, Lock, ArrowRight, Play, LayoutDashboard, RefreshCcw } from "lucide-react";

interface Instance {
  key: string;
  name: string;
  description: string;
  status: 'locked' | 'unlocked' | 'active' | 'completed';
  value?: string;
}

interface CategoryPathProps {
  category: string;
  instances: Instance[];
  onActivate: (instanceKey: string) => void;
  onEnter: (instanceKey: string) => void;
  onUnlink?: (instanceKey: string) => void;
  onDeleteLanding?: () => void;
  onGoToDashboard?: () => void;
  onDeployLanding?: () => void;
  onShowDns?: () => void;
  deployingLanding?: boolean;
  landingUrl?: string | null;
  customDomain?: string | null;
}

export default function CategoryPath({ 
  category, 
  instances, 
  onActivate, 
  onEnter, 
  onUnlink, 
  onDeleteLanding,
  onGoToDashboard,
  onDeployLanding,
  onShowDns,
  deployingLanding,
  landingUrl,
  customDomain
}: CategoryPathProps) {
  const isAnyCompleted = instances.some(i => i.status === 'completed');

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
      <div style={{ marginBottom: "4rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
         <div>
            <h2 style={{ fontSize: "2.5rem", fontWeight: 950 }}>Camino de {category}</h2>
            <p style={{ opacity: 0.6 }}>Completa cada instancia para desbloquear el máximo potencial de tu negocio.</p>
         </div>
         {isAnyCompleted && onGoToDashboard && (
           <motion.button 
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             onClick={onGoToDashboard}
             className="glass"
             style={{ 
               background: "linear-gradient(135deg, var(--primary) 0%, #10b981 100%)", 
               padding: "0.8rem 1.5rem", 
               borderRadius: "1rem", 
               border: "none", 
               color: "white", 
               fontWeight: 900, 
               fontSize: "0.85rem",
               cursor: "pointer",
               boxShadow: "0 10px 20px rgba(59, 130, 246, 0.2)",
               display: "flex",
               alignItems: "center",
               gap: "0.75rem"
             }}
           >
             <LayoutDashboard size={18} />
             IR AL DASHBOARD IA
           </motion.button>
         )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {instances.map((inst, i) => (
          <div key={inst.key} style={{ position: "relative", paddingBottom: i < instances.length - 1 ? "2rem" : 0 }}>
            {i < instances.length - 1 && (
              <div 
                style={{ 
                  position: "absolute", 
                  left: "45px", 
                  top: "70px", 
                  width: "2px", 
                  height: "calc(100% - 50px)", 
                  background: inst.status === 'completed' ? 'linear-gradient(to bottom, var(--primary), rgba(255,255,255,0.05))' : 'rgba(255,255,255,0.05)',
                  zIndex: 0
                }} 
              />
            )}
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass"
              style={{ 
                padding: "2rem", 
                display: "flex", 
                alignItems: "center", 
                gap: "2rem",
                position: "relative",
                zIndex: 1,
                borderLeft: inst.status === 'active' || inst.status === 'completed' ? `4px solid ${inst.status === 'completed' ? '#10b981' : 'var(--primary)'}` : '4px solid transparent',
                opacity: inst.status === 'locked' ? 0.4 : 1,
                boxShadow: inst.status === 'active' ? `0 0 30px rgba(59, 130, 246, 0.15)` : 'none'
              }}
            >
              <motion.div 
                animate={inst.status === 'active' ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{ 
                  width: "50px", height: "50px", borderRadius: "50%", 
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                  background: inst.status === 'completed' ? '#10b981' : (inst.status === 'locked' ? 'rgba(255,255,255,0.05)' : 'rgba(59, 130, 246, 0.1)')
                }}
              >
                {inst.status === 'completed' ? <CheckCircle2 color="white" /> : (inst.status === 'locked' ? <Lock size={20} /> : <Circle size={20} color="var(--primary)" />)}
              </motion.div>

               <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                    <h4 style={{ fontSize: "1.3rem", fontWeight: 950, color: inst.status === 'locked' ? 'var(--muted)' : 'white' }}>{i + 1}. {inst.name}</h4>
                    {(inst.key === 'motor' || inst.key === 'creacion') && inst.status === 'completed' && inst.value && (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(16, 185, 129, 0.1)", padding: "0.2rem 0.6rem", borderRadius: "2rem", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                        <motion.div 
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                          style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 10px #10b981" }}
                        />
                        <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#10b981", letterSpacing: "1px" }}>
                          ID: {inst.value}
                        </span>
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: "0.9rem", opacity: 0.6 }}>
                    {inst.key === 'landing' && landingUrl ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <span>URL: <a href={landingUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: 700 }}>{landingUrl}</a></span>
                        {customDomain && (
                          <span style={{ color: '#10b981', fontWeight: 800 }}>Dominio vinculado: {customDomain}</span>
                        )}
                      </div>
                    ) : (
                      inst.description
                    )}
                  </div>
               </div>

               <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  {inst.key === 'landing' ? (
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                      {!landingUrl && inst.status !== 'locked' && (
                        <button 
                          onClick={onDeployLanding} 
                          disabled={deployingLanding}
                          className="btn-primary" 
                          style={{ padding: "0.5rem 1rem", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
                        >
                           {deployingLanding ? 'Construyendo...' : 'Activar'} 
                           {deployingLanding ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><RefreshCcw size={14} /></motion.div> : <Play size={14} />}
                        </button>
                      )}
                      {landingUrl && inst.status === 'completed' && (
                        <>
                          <a href={landingUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.8rem", textDecoration: "none" }}>
                            Ver Landing
                          </a>
                          <button 
                            onClick={onDeployLanding}
                            className="btn-secondary" 
                            style={{ padding: "0.5rem 1rem", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
                          >
                             Volver a crear <RefreshCcw size={14} />
                          </button>
                          <button 
                            onClick={onShowDns}
                            className="btn-secondary" 
                            style={{ padding: "0.5rem 1rem", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.5rem", borderColor: "var(--primary)", color: "var(--primary)" }}
                          >
                             Configurar DNS <ArrowRight size={14} />
                          </button>
                          
                          {/* BOTÓN SOLICITADO: Eliminar Landing */}
                          {onDeleteLanding && (
                             <button 
                               onClick={(e) => { e.stopPropagation(); onDeleteLanding(); }}
                               className="btn-secondary" 
                               style={{ padding: "0.5rem 1rem", fontSize: "0.8rem", color: "#ef4444", background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.1)" }}
                             >
                               Eliminar landing page
                             </button>
                          )}
                        </>
                      )}
                    </div>
                  ) : (
                    <>
                      {inst.status === 'unlocked' && (
                        <button onClick={() => onActivate(inst.key)} className="btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                           Activar <Play size={14} />
                        </button>
                      )}
                      {(inst.status === 'active' || inst.status === 'completed') && (
                        <div style={{ display: "flex", gap: "0.8rem" }}>
                          {(inst.key === 'motor' || inst.key === 'creacion') && inst.status === 'completed' && onUnlink && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); onUnlink(inst.key); }} 
                              className="btn-secondary" 
                              style={{ padding: "0.5rem 1rem", fontSize: "0.8rem", color: "#ef4444", background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.1)" }}
                            >
                              Desvincular
                            </button>
                          )}
                          
                          {inst.status !== 'completed' && (
                            <button onClick={() => onEnter(inst.key)} className="btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              Entrar <ArrowRight size={14} />
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  )}
               </div>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}
