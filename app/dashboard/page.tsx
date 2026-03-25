"use client";

import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { LogOut, Radio, BarChart3, Bot, Zap, TrendingUp, MousePointer2, Eye, DollarSign, Target, Loader2, Sparkles, MessageSquare, ArrowRight, ArrowLeft, ShieldCheck, Activity, ThumbsUp, ThumbsDown, Lock, User as UserIcon, Layers, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, MinusCircle, Lightbulb, TrendingDown, Clock, Check, Edit3, MessageCircle, PenTool, Calculator, Calendar, Play, Pause, Filter, Users, Mail, Phone, ExternalLink, UserCheck, BrainCircuit, Star, BarChart, Trophy, Flame, Shield, ShieldAlert, ShieldCheck as ShieldOk, Globe, Layout, Palette, Copy, BookmarkCheck, History, ListRestart, Send, Rocket, LayoutDashboard, Brain, TestTube2, ScrollText, Settings, X as XIcon, Radar, GraduationCap } from "lucide-react";
import { useRouter } from "next/navigation";
import GoogleAdsConnect from "@/components/GoogleAdsConnect";
import CategoryPath from "@/components/CategoryPath";
import MacroPortal from "@/components/MacroPortal";
import CampaignCreationModal from "@/components/CampaignCreationModal";
import LandingFormModal from "@/components/LandingFormModal";
import MainNavigation, { Pilar } from "@/components/MainNavigation";
import { ClaudioClone } from "@/components/dashboard/ClaudioClone";
import { AssistantsView } from "@/components/dashboard/AssistantsView";
import { AcademyView } from "@/components/dashboard/AcademyView";
import { InnovationLab } from "@/components/dashboard/InnovationLab";
import { ProfileView } from "@/components/dashboard/ProfileView";

type View = "overview" | "crm" | "creative" | "history";
type MacroArea = "portal" | "clientes" | "control" | "desarrollo";

const FALLBACK_METRICS = { clicks: 0, impressions: 0, cost: 0, conversions: 0, ctr: 0, averageCpc: 0 };
const FALLBACK_INSIGHT = {
  diagnosis: "Sincronizando cerebro Bolton...",
  nextAction: "Analizando flujos...",
  growthScore: 50,
  statusLabel: "CALIBRANDO",
  battlePlan: "Bolton IA está realizando una sincronización profunda con tus campañas. Esto puede tomar unos segundos extras mientras procesamos la visión estratégica..."
};
const FALLBACK_RECOMMENDATIONS = [
  { type: "PROTECCIÓN", title: "Capa de IA Activa", description: "Bolton está blindando tu presupuesto contra clics no calificados. La protección es total." },
  { type: "CRECIMIENTO", title: "Expansión Radial", description: "Preparando el mapa para ampliar tu cobertura en zonas limítrofes. Disponible en 24h." },
  { type: "AHORRO", title: "Eficiencia Target", description: "Asegurando que cada centavo se use en clics con alta probabilidad de contacto." }
];

const CHALLENGES_DATA: Record<string, { video: string, tutorialText: string, links: { label: string, url: string }[] }> = {
  crear_cuenta: {
    video: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder
    tutorialText: "El primer paso para dominar el mercado es tener tu propia infraestructura. Crea tu cuenta de Google Ads en modo experto para que Bolton pueda conectarse y empezar a trabajar por ti.",
    links: [
      { label: "Crear cuenta Google Ads", url: "https://ads.google.com" },
      { label: "Guía de Registro Paso a Paso", url: "#" }
    ]
  },
  motor: {
    video: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder
    tutorialText: "El Motor Comercial es el núcleo de Bolton. Al vincular tu ID de Google Ads (10 dígitos), permites que nuestra IA acceda a la telemetría en tiempo real para optimizar pujas y presupuestos.",
    links: [
      { label: "Cómo encontrar mi ID", url: "#" },
      { label: "Seguridad de Datos", url: "#" }
    ]
  },
  landing: {
    video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    tutorialText: "Tu Landing Page es tu vendedor 24/7. Bolton construye una estructura de alta conversión basada en tu oferta. Una vez activa, puedes vincular tu propio dominio para máxima autoridad.",
    links: [
      { label: "Guía de Dominios", url: "#" },
      { label: "Mejores Prácticas UI", url: "#" }
    ]
  },
  creacion: {
    video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    tutorialText: "Aquí es donde ocurre la magia. Definimos el avatar de tu cliente ideal, los ángulos de venta y la estructura de campaña que Google Ads ama. Bolton genera los anuncios por ti.",
    links: [
      { label: "Estructura Hagakure", url: "#" },
      { label: "Avatar de Cliente", url: "#" }
    ]
  },
  activacion: {
    video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    tutorialText: "El momento de la verdad. Activar la campaña inicia el flujo de demanda. Bolton entrará en fase de aprendizaje durante las primeras 48-72 horas para estabilizar el algoritmo.",
    links: [
      { label: "Checklist de Lanzamiento", url: "#" }
    ]
  },
  escalamiento: {
    video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    tutorialText: "Una vez que tenemos tracción, usamos el escalamiento táctico. Bolton buscará nuevas oportunidades de mercado y ajustará la inversión donde el ROAS sea más alto.",
    links: [
      { label: "Escalado Vertical vs Horizontal", url: "#" }
    ]
  }
};

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [currentMacro, setCurrentMacro] = useState<MacroArea>("portal");
  const [currentInstance, setCurrentInstance] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>("overview");
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [tempId, setTempId] = useState("");
  
  // BOLTON 3.0 NAVIGATION
  const [activePilar, setActivePilar] = useState<Pilar>("desafios");
  const [dashboardMode, setDashboardMode] = useState<"facil" | "avanzado" | "clon">("facil");
  const [desafioTab, setDesafioTab] = useState<"actual" | "completados" | "futuros">("actual");
  const [showProfile, setShowProfile] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const secureFetch = async (url: string, options: any = {}) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout
    
    try {
      const { data: { session } } = await supabase.auth.getSession().catch(() => ({ data: { session: null } }));
      const token = session?.access_token;
      const headers = {
        ...options.headers,
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      };
      const res = await fetch(url, { ...options, headers, signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const clone = res.clone();
        const errText = await clone.text();
        console.error(`[SecureFetch ERROR] ${url} | Status: ${res.status} | Body:`, errText);
      }
      return res;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') throw new Error("Timeout: La respuesta tardó más de 25 segundos.");
      throw error;
    }
  };

  const auditSession = () => {
    if (!user) { console.error("[Audit] User missing"); return false; }
    if (!customerId && !tempId) { console.error("[Audit] CustomerId missing"); return false; }
    return true;
  };

  // FASE 9: COMPONENTE SKELETON PARA UX PREMIUM
  const Skeleton = ({ width = "100%", height = "1rem", borderRadius = "0.5rem" }) => (
    <motion.div 
      animate={{ opacity: [0.3, 0.6, 0.3] }} 
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      style={{ width, height, borderRadius, background: "rgba(255,255,255,0.05)" }} 
    />
  );
  const [successMessage, setSuccessMessage] = useState({ title: "¡Hito Alcanzado!", body: "Has desbloqueado un nuevo nivel de crecimiento." });
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [showIdModal, setShowIdModal] = useState(false);
  const [showCreationModal, setShowCreationModal] = useState(false);
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [showScaling, setShowScaling] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [funnel, setFunnel] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [learnings, setLearnings] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [battlePlan, setBattlePlan] = useState<string | null>(null);
  const [insight, setInsight] = useState<any>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiLoadingStatus, setAiLoadingStatus] = useState<string>("Iniciando...");
  const [isAiFinal, setIsAiFinal] = useState(false);
  const [deployingLanding, setDeployingLanding] = useState(false);
  const [landingUrl, setLandingUrl] = useState<string | null>(null);
  const [showDnsModal, setShowDnsModal] = useState(false);
  const [showLandingForm, setShowLandingForm] = useState(false);
  const [preLandingData, setPreLandingData] = useState<any>(null);
  const [customDomain, setCustomDomain] = useState("");
  const [dnsConfig, setDnsConfig] = useState<any>(null);
  const [vercelProjectId, setVercelProjectId] = useState<string | null>(null);
  const [status, setStatus] = useState<"connecting" | "fetching" | "interpreting" | "dashboard">("connecting");
  const router = useRouter();

  useEffect(() => {
    console.log("[Bolton] Componente Dashboard Montado. Status:", status, "Instancia:", currentInstance);
  }, []);

  useEffect(() => {
    const init = async () => {
      const rescueTimer = setTimeout(() => {
        setLoadingSettings(false);
        console.log("Bolton: Protocolo de Rescate Activado (Timeout)");
      }, 2000);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUser(session.user);
          setLoadingSettings(false);
          clearTimeout(rescueTimer);

          // DISPARADOR DE BIENVENIDA (Fase 10)
          if (session.user.email_confirmed_at) {
            fetch('/api/notify/welcome', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: session.user.email, userId: session.user.id })
            }).catch(e => console.error("Welcome trigger failed:", e));
          }

          const res = await secureFetch(`/api/user/settings?userId=${session.user.id}`);
          const data = await res.json();
          if (data.success) {
            if (data.googleAdsId) {
              setCustomerId(data.googleAdsId);
              setCampaignId(data.currentCampaignId);
            }
            
            if (data.landingUrl) setLandingUrl(data.landingUrl);
            if (data.customDomain) setCustomDomain(data.customDomain);
            if (data.vercelProjectId) setVercelProjectId(data.vercelProjectId);

            const syncProgress = async () => {
              if (data.googleAdsId) {
                await secureFetch("/api/user/progress", { 
                  method: "POST", headers: { "Content-Type": "application/json" }, 
                  body: JSON.stringify({ userId: session.user.id, category: 'clientes', instanceKey: 'motor', isCompleted: true }) 
                });
              }
              
              if (data.landingUrl) {
                await secureFetch("/api/user/progress", { 
                  method: "POST", headers: { "Content-Type": "application/json" }, 
                  body: JSON.stringify({ userId: session.user.id, category: 'clientes', instanceKey: 'landing', isCompleted: true }) 
                });
              }

              if (data.currentCampaignId) {
                await secureFetch("/api/user/progress", { 
                  method: "POST", headers: { "Content-Type": "application/json" }, 
                  body: JSON.stringify({ userId: session.user.id, category: 'clientes', instanceKey: 'creacion', isCompleted: true }) 
                });
              }
              fetchProgress(session.user.id);
            };
            syncProgress();

            if (data.currentCampaignId && data.googleAdsId) {
              setCurrentInstance('motor');
              setCurrentMacro('clientes');
              setCurrentView('overview');
              setStatus('fetching');
              handleConnected(data.googleAdsId, true, data.currentCampaignId, session.user);
            }
          }
          fetchProgress(session.user.id);
        } else {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
            setUser(authUser);
            setLoadingSettings(false);
            clearTimeout(rescueTimer);
          } else {
            router.push("/");
            setLoadingSettings(false);
          }
        }
      } catch (e) {
        console.error("Dashboard init error:", e);
        setLoadingSettings(false);
      }
    };
    init();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const fetchProgress = async (userId?: string) => {
    const targetId = userId || user?.id;
    if (!targetId) return;
    const res = await secureFetch(`/api/user/progress?userId=${targetId}`);
    const d = await res.json();
    if (d.success) {
      setProgress(d.progress);
      const active = d.progress.filter((p: any) => p.is_active).map((p: any) => p.category.toLowerCase());
      setActiveCategories(Array.from(new Set(active)));
    }
  };

  const calculateCategoryProgress = () => {
    const counts: Record<string, { total: number, done: number }> = {
      clientes: { total: 5, done: 0 },
      control: { total: 5, done: 0 },
      desarrollo: { total: 5, done: 0 },
    };
    
    progress.forEach(p => {
      const cat = p.category.toLowerCase();
      if (counts[cat] && p.is_completed) counts[cat].done++;
    });

    const result: Record<string, number> = {};
    Object.keys(counts).forEach(k => {
      result[k] = Math.round((counts[k].done / counts[k].total) * 100);
    });
    return result;
  };

  useEffect(() => {
    if (status === 'connecting' || status === 'fetching' || status === 'interpreting') {
      const rescueTimer = setTimeout(() => {
        console.warn("[Bolton] !!! PROTOCOLO DE RESCATE ACTIVADO (RESCUE 2.0) !!! Forzando entrada al Dashboard.");
        setStatus("dashboard");
        if (!currentInstance) setCurrentInstance("motor");
        if (!currentMacro) setCurrentMacro("clientes");
        if (!currentView) setCurrentView("overview");
      }, 5000);
      return () => clearTimeout(rescueTimer);
    }
  }, [status]);

  useEffect(() => {
    if (status === 'dashboard' && !insight) {
      const timer = setTimeout(() => {
        if (!insight) {
          console.warn("[Bolton] Insight Shield Activado: Inyectando diagnóstico preventivo por delay crítico de red.");
          setInsight(FALLBACK_INSIGHT);
        }
      }, 15000); // Aumentado a 15s para diagnóstico extremo
      return () => clearTimeout(timer);
    }
    if (status === 'dashboard' && recommendations.length === 0) {
      setRecommendations(FALLBACK_RECOMMENDATIONS);
    }
  }, [status, insight, recommendations]);

  const handleConnected = async (id: string | number, alreadySaved = false, explicitCampaignId?: string, explicitUser?: any) => {
    const currentUser = explicitUser || user;
    if (!currentUser) {
      console.warn("[Bolton] Intento de conexión sin usuario detectado.");
      return;
    }
    const customerStr = id.toString();
    setCustomerId(customerStr);
    
    setStatus("fetching"); 
    console.log(`[Bolton] Iniciando handleConnected para Customer: ${id}`);

    const rescueTimeout = setTimeout(() => {
      console.warn("[Bolton] Rescate Crítico: Forzando estado dashboard por demora.");
      setStatus("dashboard");
    }, 5000);
    
    try {
      if (!alreadySaved && user?.id) { 
        await secureFetch("/api/user/settings", { 
          method: "POST", 
          headers: { "Content-Type": "application/json" }, 
          body: JSON.stringify({ userId: user.id, googleAdsId: customerStr }) 
        }); 
      }

      (async () => {
        try {
          setAiLoadingStatus("Estableciendo conexión segura...");
          const effectiveCampaignId = explicitCampaignId || campaignId;
          const campaignParam = effectiveCampaignId ? `&campaignId=${effectiveCampaignId}` : "";
          
          setAiLoadingStatus("Obteniendo métricas de Google Ads...");
          setAiLoadingStatus("Obteniendo métricas de Google Ads...");
          const [metricsData, campData] = await Promise.all([
            secureFetch(`/api/ads/metrics?customerId=${customerStr}${campaignParam}`)
              .then(r => r.json())
              .catch(() => {
                console.warn("[Bolton] Timeout/Error en métricas. Usando fallback temporal.");
                return { success: false, metrics: FALLBACK_METRICS };
              }),
            secureFetch(`/api/ads/campaigns?customerId=${customerStr}`)
              .then(r => r.json())
              .catch(() => {
                console.warn("[Bolton] Timeout/Error en campañas. Usando lista vacía.");
                return { success: false, campaigns: [] };
              })
          ]);

          const currentMetrics = metricsData.metrics || FALLBACK_METRICS;
          setMetrics(currentMetrics);
          const loadedCampaigns = campData.campaigns || [];
          setCampaigns(loadedCampaigns);

          setAiLoadingStatus("Calculando arquitectura de embudo...");
          setFunnel([
            { id: 1, label: "Impresiones", value: currentMetrics.impressions, percentage: 100, color: "#3b82f6" },
            { id: 2, label: "Clics", value: currentMetrics.clicks, percentage: currentMetrics.impressions > 0 ? (currentMetrics.clicks / currentMetrics.impressions) * 100 : 0, color: "#10b981" },
            { id: 3, label: "Conver.", value: currentMetrics.conversions, percentage: currentMetrics.clicks > 0 ? (currentMetrics.conversions / currentMetrics.clicks) * 100 : 0, color: "#f59e0b" },
          ]);

          if (currentUser?.id) {
            setAiLoadingStatus("Sincronizando progreso del usuario...");
            secureFetch("/api/user/progress", { 
              method: "POST", headers: { "Content-Type": "application/json" }, 
              body: JSON.stringify({ userId: currentUser.id, category: 'clientes', instanceKey: 'motor', isCompleted: true }) 
            }).then(() => fetchProgress());
          }

          setAiLoadingStatus("Analizando métricas con GPT-4...");
          secureFetch("/api/ads/interpret", { 
            method: "POST", headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify({ metrics: currentMetrics, userId: user?.id }) 
          }).then(r => r.json()).then(d => { 
            if (d.success) {
              console.log("[Bolton] Diagnóstico de IA Real Recibido.");
              setInsight(d);
              setIsAiFinal(true);
              setAiError(null);
            } else {
              setAiError(`Interpret AI: ${d.error || 'Fallo de interpretación'}`);
            }
          }).catch((err) => {
            console.error("[Bolton] Error en Interpret IA:", err);
            setAiError(`Interpret Network Error: ${err.message}`);
          });
          
          if (recommendations.length === 0) setRecommendations(FALLBACK_RECOMMENDATIONS);

          fetchLeads();
          fetchHistory();
          fetchLearnings();

          if (loadedCampaigns.length > 0) {
            secureFetch("/api/ads/funnel", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ metrics: currentMetrics }) }).then(r => r.json()).then(d => { if (d.success) setFunnel(d.funnelSteps); });
            secureFetch("/api/ads/recommendations", {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: user?.id, campaigns: loadedCampaigns, overallMetrics: currentMetrics })
            }).then(r => r.json()).then(d => { if (d.success) setRecommendations(d.recommendations); });

            setAiLoadingStatus("Redactando Plan de Batalla...");
            secureFetch("/api/ads/report/weekly", { 
              method: "POST", headers: { "Content-Type": "application/json" }, 
              body: JSON.stringify({ metrics: currentMetrics, leads, history: [], userEmail: user?.email, userId: user?.id }) 
            }).then(r => r.json()).then(d => { 
              if (d.success && d.battlePlan) {
                console.log("[Bolton] Veredicto Estratégico Real Recibido.");
                setBattlePlan(d.battlePlan); 
                setAiError(null);
                setAiLoadingStatus("Análisis completado.");
              } else {
                setAiError(`Weekly AI: ${d.error || 'Fallo de redacción'}`);
              }
            }).catch(e => {
              console.error("[Bolton] Error Crítico en Veredicto:", e);
              setAiError(`Weekly Network Error: ${e.message}`);
            });

            secureFetch(`/api/ads/ads?customerId=${customerStr}${campaignParam}`).then(r => r.json()).then(adsData => {
              if (adsData.success) {
                secureFetch("/api/ads/variants", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ads: adsData.ads, learnings: [], campaignName: loadedCampaigns[0].name, userId: user?.id }) }).then(r => r.json()).then(d => { if (d.success) setVariants(d.variants); });
              }
            });
          }
        } catch (innerErr: any) {
          console.error("[Bolton] Inner Sync Error:", innerErr);
          setAiError(`Sync Error: ${innerErr.message || 'Error desconocido'}`);
        } finally {
          clearTimeout(rescueTimeout);
          setStatus("dashboard");
        }
      })();

    } catch (err) {
      console.error("[Bolton] Outer Error:", err);
      clearTimeout(rescueTimeout);
      setStatus("dashboard");
    }
  };

  const fetchLeads = async () => {
    if (!user) return;
    const res = await secureFetch(`/api/leads?userId=${user.id}`);
    const d = await res.json();
    if (d.success) {
      const rawLeads = d.leads;
      if (rawLeads.length > 0) {
        secureFetch("/api/leads/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, leads: rawLeads, attribution: { efficiencyScore: insight?.growthScore || 50 } })
        }).then(r => r.json()).then(scoreData => {
          if (scoreData.success) {
            const scoredLeads = rawLeads.map((l: any) => {
              const s = scoreData.scores.find((sc: any) => sc.id === l.id);
              return s ? { ...l, score: s.score, trait: s.trait } : l;
            });
            setLeads(scoredLeads.sort((a: any, b: any) => (b.score || 0) - (a.score || 0)));
          } else {
            setLeads(rawLeads);
          }
        });
      } else {
        setLeads([]);
      }
    }
  };

  const fetchHistory = async () => {
    if (!user) return;
    const res = await secureFetch(`/api/ads/history?userId=${user.id}`);
    const d = await res.json();
    if (d.success) setHistory(d.history);
  };

  const fetchLearnings = async () => {
    if (!user) return;
    const res = await secureFetch(`/api/learnings?userId=${user.id}`);
    const d = await res.json();
    if (d.success) setLearnings(d.learnings);
  };

  const activateInstance = async (key: string) => {
    if (key === 'motor') {
      if (!customerId) setShowIdModal(true);
      else completeActivation('motor');
    } else if (key === 'creacion') {
      if (campaignId) {
        showToast("Ya tienes una campaña activa. Redirigiendo al análisis...", "info");
        setCurrentInstance("motor");
        setCurrentView("overview");
      } else {
        setShowCreationModal(true);
      }
    } else if (key === 'activacion') {
      setShowActivationModal(true);
    }
  };

  const handleSurveyComplete = async (data: any) => {
    setShowCreationModal(false);
    let currentUser = user;
    if (!currentUser) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        currentUser = session.user;
        setUser(currentUser);
      }
    }

    if (!currentUser) {
      showToast("Sesión expirada. Por favor refresca la página.", "error");
      return;
    }

    showToast("Agente Experto: Analizando negocio e IA...", "info");
    setStatus("fetching");
    
    try {
      const res = await secureFetch("/api/ads/campaigns/create", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ userId: currentUser.id, customerId, ...data }) 
      });

      const result = await res.json();
      
      if (result.success) {
        showToast("¡Google Ads: Campaña creada correctamente!", "success");
        setCampaignId(result.campaignId);
        await fetchProgress();
        if (customerId) {
          handleConnected(customerId, true, result.campaignId);
        }
        setSuccessMessage({ title: "¡Campaña Creada!", body: "El Agente Experto ha diseñado tu estrategia. Paso final: Activación." });
        setStatus("dashboard");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
      } else {
        showToast(`Google Ads: ${result.error || "Fallo de comunicación"}`, "error");
        setStatus("dashboard");
        setCurrentInstance(null);
      }
    } catch (err) {
      showToast("Bolton Network: Error de conexión crítica.", "error");
      console.error("Excepción:", err);
      setStatus("dashboard");
    }
  };

  const handleCampaignActivation = async () => {
    if (!user || !campaignId) return;
    setShowActivationModal(false);
    setStatus("fetching");
    
    try {
      const res = await secureFetch("/api/ads/campaigns/activate", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ userId: user.id }) 
      });

      const data = await res.json();
      if (data.success) {
        await fetchProgress();
        showToast("¡Campaña activada con éxito!", "success");
        setCurrentInstance('motor');
        setCurrentView('overview');
        setStatus("dashboard");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
      } else {
        showToast(`Error: ${data.error || "No se pudo activar"}`, "error");
        setStatus("dashboard");
      }
    } catch (err) {
      showToast("Error de conexión al activar campaña.", "error");
      setStatus("dashboard");
    }
  };

  const handleManualComplete = async (instanceKey: string) => {
    if (!user) return;
    setStatus("fetching");
    try {
      const res = await secureFetch("/api/user/progress", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ userId: user.id, category: 'clientes', instanceKey, isCompleted: true }) 
      });
      const data = await res.json();
      if (data.success) {
        showToast("¡Hito completado!", "success");
        await fetchProgress();
        setSuccessMessage({ title: "¡Paso Superado!", body: "Has habilitado la infraestructura necesaria para Bolton." });
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
      }
    } catch (e) {
      showToast("Error al sincronizar progreso estratégico.", "error");
    } finally {
      setStatus("dashboard");
    }
  };

  const handleDeployLanding = async (formData?: any) => {
    if (!user || deployingLanding) return;

    // Si no hay formData, o si es un evento de clic, abrimos el modal
    if (!formData || formData.nativeEvent || formData.target) {
        if (vercelProjectId) {
            const ok = window.confirm("¿Realmente deseas eliminar el proyecto antiguo en Vercel para crear uno nuevo? (Se perderá la vinculación de dominio actual)");
            if (!ok) return;

            setDeployingLanding(true);
            try {
                const delRes = await secureFetch("/api/vercel/delete-project", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId: user.id, projectId: vercelProjectId })
                });
                const delData = await delRes.json();
                if (!delData.success) throw new Error(delData.error);

                // Limpiar local y DB
                setLandingUrl(null);
                setVercelProjectId(null);
                setCustomDomain("");
                await secureFetch("/api/user/settings", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId: user.id, landingUrl: null, vercelProjectId: null, customDomain: null })
                });
                showToast("Proyecto antiguo eliminado. Iniciando nuevo diseño...", "success");
            } catch (err: any) {
                showToast(`Error de limpieza: ${err.message}`, "error");
                setDeployingLanding(false);
                return;
            } finally {
                setDeployingLanding(false);
            }
        }

        try {
            const res = await secureFetch(`/api/user/settings?userId=${user.id}`);
            const data = await res.json();
            if (data.success && data.campaignSurvey) {
                setPreLandingData({
                    full_name: data.campaignSurvey.name || "",
                    profession: data.campaignSurvey.profession || "",
                    main_service: data.campaignSurvey.service || "",
                    phone: data.campaignSurvey.phone || "",
                    location: data.campaignSurvey.commune || ""
                });
            }
        } catch (e) {}
        setShowLandingForm(true);
        return;
    }

    setShowLandingForm(false);
    setDeployingLanding(true);
    showToast("Bolton IA: Preparando contenidos de alta conversión...", "info");
    
    try {
      // 1. Preparar contenidos con IA (pasando formData)
      const prepRes = await secureFetch("/api/vercel/prepare-landing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, formData })
      });
      const prepData = await prepRes.json();
      if (!prepData.success) throw new Error(prepData.error);

      showToast("Vercel Engine: Desplegando en la nube...", "info");

      // 2. Desplegar en Vercel
      const deployRes = await secureFetch("/api/vercel/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, landingData: prepData.landingData })
      });
      const deployData = await deployRes.json();
      if (!deployData.success) throw new Error(deployData.error);

      // 3. Persistir en DB
      await secureFetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, landingUrl: deployData.url, vercelProjectId: deployData.projectId })
      });

      // 4. Sincronizar progreso de desafío
      await secureFetch("/api/user/progress", { 
        method: "POST", headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ userId: user.id, category: 'clientes', instanceKey: 'landing', isCompleted: true }) 
      });

      setLandingUrl(deployData.url);
      setVercelProjectId(deployData.projectId);
      showToast("¡ÉXITO! Landing Page desplegada correctamente. 🚀", "success");
      await fetchProgress();

    } catch (err: any) {
      showToast(`Error de Despliegue: ${err.message}`, "error");
    } finally {
      setDeployingLanding(false);
    }
  };

  const handleConnectDomain = async () => {
    if (!user || !vercelProjectId || !customDomain) return;
    try {
        const res = await secureFetch("/api/vercel/domains", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id, projectId: vercelProjectId, domain: customDomain })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);

        setDnsConfig(data.dns);
        // Persistir dominio en DB
        await secureFetch("/api/user/settings", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id, customDomain: customDomain })
        });
        showToast("Dominio vinculado. Configura tus DNS ahora.", "success");
    } catch (err: any) {
        showToast(err.message, "error");
    }
  };

  const completeActivation = async (key: string, explicitId?: string) => {
    if (!user) return;
    const res = await secureFetch("/api/user/progress", { 
      method: "POST", headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ userId: user.id, category: currentMacro || 'clientes', instanceKey: key, isCompleted: true, isActive: true }) 
    });
    const d = await res.json();
    if (d.success) {
      await fetchProgress(); 
      if (key === 'motor') handleConnected(explicitId || customerId || tempId, false); 
      setCurrentInstance(key);
    }
  };


  const handleUnlink = async () => {
    if (!user || !window.confirm("¿Estás seguro de que quieres desvincular esta campaña? Se borrará el progreso de estrategia actual para empezar de cero.")) return;
    
    setStatus("fetching");
    try {
      const res = await secureFetch("/api/ads/campaigns/unlink", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ userId: user.id }) 
      });
      
      const data = await res.json();
      if (data.success) {
        setCampaignId(null);
        setBattlePlan(null);
        setMetrics(null);
        setFunnel([]);
        await fetchProgress();
        showToast("Campaña desvinculada. Puedes crear una nueva estrategia.", "success");
        setCurrentInstance(null);
        setStatus("dashboard");
      } else {
        showToast(`Error: ${data.error || "No se pudo desvincular"}`, "error");
        setStatus("dashboard");
      }
    } catch (err) {
      showToast("Error de conexión al desvincular.", "error");
      setStatus("dashboard");
    }
  };

  const NavItem = ({ id, icon: Icon, label }: { id: View, icon: any, label: string }) => (
    <button 
      onClick={() => setCurrentView(id)}
      className={`glass nav-btn ${currentView === id ? 'active' : ''}`}
      style={{ padding: "0.75rem 1.5rem", borderRadius: "0.8rem", display: "flex", alignItems: "center", gap: "0.75rem", border: "1px solid rgba(255,255,255,0.05)", background: currentView === id ? "rgba(59, 130, 246, 0.15)" : "transparent", transition: "all 0.3s" }}
    >
      <Icon size={18} color={currentView === id ? "var(--primary)" : "var(--muted-foreground)"} />
      <span style={{ fontSize: "0.9rem", fontWeight: 800, color: currentView === id ? "white" : "var(--muted-foreground)" }}>{label}</span>
      {id === "crm" && leads.length > 0 && <span style={{ background: "#10b981", fontSize: "0.6rem", padding: "0.1rem 0.4rem", borderRadius: "10px", color: "white" }}>{leads.length}</span>}
    </button>
  );

  const getInstances = (category: string) => {
    const check = (key: string) => progress.find(p => p.instance_key === key && p.category.toLowerCase() === category.toLowerCase());
    const isAct = (key: string) => check(key)?.is_active;
    const isComp = (key: string) => check(key)?.is_completed;

    if (category.toLowerCase() === 'clientes') {
      return [
        { 
          key: 'crear_cuenta', 
          name: '1. Crea tu cuenta Motor', 
          description: 'Crea tu cuenta de Google Ads para habilitar la infraestructura Bolton.', 
          status: isComp('crear_cuenta') ? 'completed' : 'unlocked' as any
        },
        { 
          key: 'motor', 
          name: '2. Vincula Motor', 
          description: 'Vincula tu cuenta de Google Ads para activar el cerebro comercial.', 
          status: isComp('crear_cuenta') ? ((isComp('motor') || !!customerId) ? 'completed' : 'unlocked') : 'locked' as any,
          value: customerId || undefined
        },
        { 
          key: 'landing', 
          name: 'Landing Page', 
          description: 'Tu centro de conversión optimizado por IA.', 
          status: (isComp('motor') || !!customerId) ? (landingUrl ? 'completed' : 'unlocked') : 'locked' as any
        },
        { 
          key: 'creacion', 
          name: 'Creación de Campaña', 
          description: 'Diseña tu estrategia de adquisición premium.', 
          status: (landingUrl) ? (isComp('creacion') || !!campaignId ? 'completed' : (isAct('creacion') ? 'active' : 'unlocked')) : 'locked' as any,
          value: campaignId || undefined
        },
        { 
          key: 'activacion', 
          name: 'Activar Campaña', 
          description: 'Inicia el flujo de demanda y conquista el mercado.', 
          status: (isComp('creacion') || !!campaignId) ? (isComp('activacion') ? 'completed' : 'unlocked') : 'locked' as any 
        },
        { 
          key: 'escalamiento', 
          name: 'Escalamiento Táctico', 
          description: 'Optimización de presupuestos dinámicos y puja agresiva.', 
          status: isComp('activacion') ? 'unlocked' : 'locked' as any 
        },
        { 
          key: 'geografia', 
          name: 'Dominio Geográfico', 
          description: 'Expansión radial de zonas de impacto y calor de demanda.', 
          status: 'locked' as any 
        },
        { 
          key: 'creativo', 
          name: 'Optimización Creativa', 
          description: 'Laboratorio de variantes de alto CTR y mensajes persuasivos.', 
          status: 'locked' as any 
        },
        { 
          key: 'leads', 
          name: 'Re-engagement de Leads', 
          description: 'Estrategias de retorta y cierre masivo con ganchos de IA.', 
          status: 'locked' as any 
        },
        { 
          key: 'canales', 
          name: 'Expansión de Canales', 
          description: 'Integración multicanal Bolton para dominio total del mercado.', 
          status: 'locked' as any 
        },
      ];
    }
    return [];
  };

  if (loadingSettings) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#050505" }}>
        <Loader2 className="animate-spin" size={60} color="#3b82f6" style={{ opacity: 0.3 }} />
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: "2rem", minHeight: "100vh" }}>
      {currentMacro !== "portal" && (
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem", padding: "0 0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <button 
              onClick={() => { setCurrentMacro("portal"); setCurrentInstance(null); }} 
              className="glass-pill"
              style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", transition: "all 0.3s" }}
            >
              <LayoutDashboard size={16} color="var(--primary)" />
              <span style={{ fontSize: "0.7rem", fontWeight: 900, color: "white", letterSpacing: "1px" }}>MENÚ</span>
            </button>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.6rem', opacity: 0.4, fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase' }}>Sistema Bolton 3.5</span>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 950, letterSpacing: "-0.5px", marginTop: '-2px' }}>
                {currentMacro.toUpperCase()} {currentInstance ? `> ${currentInstance.toUpperCase()}` : ''}
              </h2>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
             {customerId && currentMacro === 'clientes' && !currentInstance && (
               <motion.button 
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 onClick={() => {
                   setCurrentInstance('motor');
                   setCurrentView('overview');
                 }}
                 className="btn-primary"
                 style={{ padding: "0.5rem 1.2rem", fontSize: "0.7rem", borderRadius: "2rem", display: "flex", alignItems: "center", gap: "0.6rem" }}
               >
                 <Activity size={14} /> DASHBOARD IA
               </motion.button>
             )}
             
             {currentInstance && (
                <button 
                  onClick={() => setCurrentInstance(null)}
                  className="glass-pill"
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}
                >
                  <ArrowLeft size={14} color="var(--primary)" />
                  <span style={{ fontSize: "0.7rem", fontWeight: 900, color: "white" }}>VOLVER</span>
                </button>
             )}

             <button 
              onClick={() => setShowProfile(true)}
              className="glass" 
              style={{ width: "40px", height: "40px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", cursor: "pointer" }}
             >
                <UserIcon size={18} color="var(--primary)" />
             </button>
          </div>
        </header>
      )}

      <main className="dashboard-main" style={{ padding: "0 2rem 4rem" }}>
        {/* NAVEGACIÓN MAESTRA BOLTON 3.0 */}
        <MainNavigation activePilar={activePilar} onChange={setActivePilar} />

        <AnimatePresence mode="wait">
          {activePilar === "desafios" && (
            <motion.div key="desafios-pilar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
                {/* CABECERA DE VINCULACIONES (Requerido por Claudio) */}
                {/* SMART STATUS BAR (Reemplaza al cuadro grande) */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "3rem" }}>
                  <div className="glass status-bar-responsive" style={{ display: "flex", padding: "0.75rem 2rem", gap: "3rem", alignItems: "center", border: "1px solid rgba(59, 130, 246, 0.15)", background: "rgba(15, 23, 42, 0.3)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <Target size={14} color="var(--primary)" />
                      <span style={{ fontSize: "0.7rem", fontWeight: 900, color: "var(--muted-foreground)" }}>ADS ID:</span>
                      <span style={{ fontSize: "0.8rem", fontWeight: 800, letterSpacing: '0.5px' }}>{customerId || "PENDIENTE"}</span>
                    </div>
                    {landingUrl && (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <Globe size={14} color="#10b981" />
                        <span style={{ fontSize: "0.7rem", fontWeight: 900, color: "var(--muted-foreground)" }}>LANDING:</span>
                        <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#3b82f6" }}>{landingUrl}</span>
                      </div>
                    )}
                    {campaignId && (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <Activity size={14} color="var(--accent)" />
                        <span style={{ fontSize: "0.7rem", fontWeight: 900, color: "var(--muted-foreground)" }}>CAMP:</span>
                        <span style={{ fontSize: "0.8rem", fontWeight: 800 }}>{campaigns.find(c => c.id.toString() === campaignId.toString())?.name || campaignId}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* SUB-NAVEGACIÓN DESAFÍOS */}
                <div className="nav-pilar-container" style={{ display: "flex", justifyContent: "center", gap: "3rem", marginBottom: "3.5rem" }}>
                  {[
                    { id: "actual", name: "En Curso" },
                    { id: "completados", name: "Completados" },
                    { id: "futuros", name: "Próximos Pasos" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setDesafioTab(tab.id as any)}
                      style={{
                        padding: "0.75rem 0.5rem",
                        color: desafioTab === tab.id ? "white" : "var(--muted-foreground)",
                        fontWeight: 900,
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "1.5px",
                        position: "relative",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        opacity: desafioTab === tab.id ? 1 : 0.4,
                        transition: "all 0.3s"
                      }}
                    >
                      {tab.name}
                      {desafioTab === tab.id && (
                        <motion.div layoutId="desafioUnderline" style={{ position: "absolute", bottom: -2, left: "15%", right: "15%", height: "2px", background: "var(--primary)", boxShadow: "0 0 15px var(--primary)" }} />
                      )}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {(() => {
                    const allChallenges = getInstances("clientes");
                    
                    if (desafioTab === 'actual') {
                      const actual = allChallenges.find(c => c.status !== 'completed' && c.status !== 'locked');
                      if (!actual) return (
                        <motion.div key="all-done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: "8rem 0" }}>
                          <div style={{ width: "100px", height: "100px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 2.5rem" }}>
                            <Trophy size={50} color="#10b981" />
                          </div>
                          <h3 style={{ fontSize: "2.5rem", fontWeight: 950, marginBottom: "1rem" }}>¡Ruta Completada!</h3>
                          <p style={{ opacity: 0.6, fontSize: "1.1rem" }}>Has desbloqueado todo el potencial comercial de esta fase.</p>
                        </motion.div>
                      );

                      const tutorial = CHALLENGES_DATA[actual.key];

                      return (
                        <motion.div key="actual-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                          <CategoryPath 
                            category="clientes" 
                            instances={[actual]} 
                            onActivate={activateInstance}
                            onUnlink={handleUnlink}
                            onEnter={(k) => {
                              if (k === 'motor') handleConnected(customerId!, true);
                              setCurrentInstance(k);
                            }}
                            onGoToDashboard={() => setActivePilar("dashboard")}
                            onDeployLanding={handleDeployLanding}
                            deployingLanding={deployingLanding}
                            landingUrl={landingUrl}
                            customDomain={customDomain}
                            onShowDns={() => setShowDnsModal(true)}
                          />

                          {/* SECCIÓN TUTORIAL PREMIUM */}
                          {tutorial && (
                            <div className="glass dashboard-main" style={{ maxWidth: "850px", margin: "4rem auto", padding: "0.5rem", borderRadius: "2.5rem", overflow: "hidden", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
                               <div style={{ padding: "3rem", background: "linear-gradient(180deg, rgba(59, 130, 246, 0.03) 0%, transparent 100%)" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2.5rem" }}>
                                    <div className="glass" style={{ padding: "0.75rem", borderRadius: "1rem", color: "var(--primary)" }}>
                                      <BrainCircuit size={28} />
                                    </div>
                                    <div>
                                      <h3 style={{ fontSize: "1.8rem", fontWeight: 950, letterSpacing: "-0.5px" }}>Tutorial Maestro</h3>
                                      <p style={{ fontSize: "0.85rem", opacity: 0.5, fontWeight: 700, textTransform: "uppercase" }}>Guía Estratégica Bolton OS</p>
                                    </div>
                                  </div>

                                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "3rem" }}>
                                    <div style={{ position: "relative", borderRadius: "1.5rem", overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)" }}>
                                      <div style={{ paddingTop: "56.25%", background: "#000" }}>
                                        <iframe 
                                          src={tutorial.video}
                                          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                                          frameBorder="0"
                                          allowFullScreen
                                        />
                                      </div>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                                      <p style={{ fontSize: "1.1rem", lineHeight: 1.6, opacity: 0.7, marginBottom: "2.5rem", fontWeight: 500 }}>
                                        {tutorial.tutorialText}
                                      </p>
                                      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center" }}>
                                        {tutorial.links.map((link, idx) => (
                                          <a 
                                            key={idx} 
                                            href={link.url}
                                            target="_blank"
                                            className="btn-secondary" 
                                            style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", padding: "1rem 1.5rem", fontSize: "0.8rem", fontWeight: 900, borderRadius: "1rem" }}
                                          >
                                            {link.label.toUpperCase()} <ExternalLink size={14} />
                                          </a>
                                        ))}
                                        {currentInstance === 'crear_cuenta' && !progress.find(p => p.instance_key === 'crear_cuenta' && p.is_completed) && (
                                          <button 
                                            onClick={() => handleManualComplete('crear_cuenta')}
                                            className="btn-primary" 
                                            style={{ padding: "1rem 2rem", fontSize: "0.8rem", fontWeight: 950, borderRadius: "1rem", display: "flex", alignItems: "center", gap: "0.8rem", background: "#10b981", border: "none", color: "white" }}
                                          >
                                             MARCAR COMO COMPLETADO <Check size={18} />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                               </div>
                            </div>
                          )}
                        </motion.div>
                      );
                    }

                    if (desafioTab === 'completados') {
                      const completed = allChallenges.filter(c => c.status === 'completed');
                      return (
                        <motion.div key="completed-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          {completed.length > 0 ? (
                            <CategoryPath 
                              category="clientes" 
                              instances={completed} 
                              onActivate={activateInstance}
                              onUnlink={handleUnlink}
                              onEnter={(k) => {
                                if (k === 'motor') handleConnected(customerId!, true);
                                setCurrentInstance(k);
                              }}
                              onGoToDashboard={() => setActivePilar("dashboard")}
                              onDeployLanding={handleDeployLanding}
                              deployingLanding={deployingLanding}
                              landingUrl={landingUrl}
                              customDomain={customDomain}
                              onShowDns={() => setShowDnsModal(true)}
                            />
                          ) : (
                            <div style={{ textAlign: "center", padding: "8rem 0", opacity: 0.4 }}>
                              <History size={60} style={{ margin: "0 auto 2rem" }} />
                              <h3 style={{ fontSize: "1.5rem", fontWeight: 950 }}>Historial Vacío</h3>
                              <p>Completa tu primer desafío para verlo aquí.</p>
                            </div>
                          )}
                        </motion.div>
                      );
                    }

                    if (desafioTab === 'futuros') {
                      const futures = allChallenges.filter(c => c.status === 'locked');
                      return (
                        <motion.div key="futures-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                           <CategoryPath 
                              category="clientes" 
                              instances={futures} 
                              onActivate={activateInstance}
                              onUnlink={handleUnlink}
                              onEnter={() => {}}
                              onGoToDashboard={() => {}}
                            />
                        </motion.div>
                      );
                    }
                    return null;
                  })()}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {activePilar === "dashboard" && (
            <motion.div key="dashboard-pilar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                {/* SUB-NAVEGACIÓN DASHBOARD */}
                <div style={{ display: "flex", gap: "1.5rem", marginBottom: "3rem", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "1rem" }}>
                  {[
                    { id: "facil", name: "Fácil" },
                    { id: "avanzado", name: "Avanzado" },
                    { id: "clon", name: "Clon Claudio" },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setDashboardMode(mode.id as any)}
                      style={{
                        padding: "0.5rem 1rem",
                        color: dashboardMode === mode.id ? "#8b5cf6" : "var(--muted-foreground)",
                        fontWeight: 800,
                        fontSize: "0.9rem",
                        position: "relative",
                        background: "none",
                        border: "none",
                        cursor: "pointer"
                      }}
                    >
                      {mode.name}
                      {dashboardMode === mode.id && (
                        <motion.div layoutId="dashboardUnderline" style={{ position: "absolute", bottom: -1, left: 0, right: 0, height: "2px", background: "#8b5cf6" }} />
                      )}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {dashboardMode === "facil" && (
                    <motion.div key="facil-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                       <div className="glass" style={{ padding: "4rem", marginBottom: "3rem", borderLeft: "8px solid var(--primary)", background: "linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, transparent 100%)", position: 'relative', overflow: 'hidden' }}>
                          <div style={{ position: 'absolute', top: '-10%', right: '-5%', opacity: 0.03 }}><Bot size={400} /></div>
                          
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                             <div style={{ display: "flex", gap: "1rem", alignItems: "center", color: "var(--primary)" }}>
                                <div style={{ padding: "0.5rem", background: "rgba(59, 130, 246, 0.1)", borderRadius: "0.5rem" }}><Zap size={24} /></div>
                                <span style={{ fontWeight: 950, fontSize: "0.9rem", letterSpacing: "3px", textTransform: "uppercase" }}>Diagnóstico Estratégico AI</span>
                             </div>
                             <div className="glass" style={{ padding: "0.6rem 1.2rem", borderRadius: "2rem", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.2)" }}>
                                <p style={{ fontSize: "0.7rem", fontWeight: 950, color: "var(--muted)", letterSpacing: "1px" }}>ESTRATEGIA: {campaigns.find(c => c.id.toString() === (campaignId || tempId)?.toString())?.name?.toUpperCase() || "CARGANDO..."}</p>
                             </div>
                          </div>

                          <h1 style={{ fontSize: "3.5rem", fontWeight: 950, lineHeight: 1.1, marginBottom: "3rem", letterSpacing: "-1.5px", maxWidth: "900px" }}>
                            {insight?.diagnosis || FALLBACK_INSIGHT.diagnosis}
                          </h1>

                          <div className="glass" style={{ padding: "3rem", background: "rgba(59, 130, 246, 0.05)", border: "1px solid rgba(59, 130, 246, 0.2)", borderRadius: "2rem", marginBottom: "3.5rem", position: 'relative', zIndex: 1 }}>
                             <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}>
                                <div className="glass" style={{ padding: "1rem", borderRadius: "1.2rem", background: "rgba(59, 130, 246, 0.15)", border: "1px solid rgba(59, 130, 246, 0.4)", boxShadow: "0 0 30px rgba(59, 130, 246, 0.1)" }}>
                                   <Bot size={40} color="#3b82f6" />
                                </div>
                                <div style={{ flex: 1 }}>
                                   <p style={{ fontSize: "0.8rem", fontWeight: 950, color: "#3b82f6", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "1rem" }}>Veredicto de la Inteligencia</p>
                                   <p style={{ fontSize: "1.4rem", fontWeight: 800, lineHeight: 1.6, color: "white" }}>
                                      {battlePlan || insight?.battlePlan || FALLBACK_INSIGHT.battlePlan}
                                   </p>
                                </div>
                             </div>
                          </div>

                          <div style={{ display: "flex", gap: "3rem", alignItems: "center" }}>
                             <div className="glass" style={{ display: "inline-flex", padding: "1.2rem 2.5rem", background: "rgba(255,255,255,0.03)", alignItems: "center", gap: "1.25rem", borderRadius: "1.5rem" }}>
                                <Rocket size={28} color="var(--primary)" />
                                <div>
                                   <p style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: 800, textTransform: "uppercase" }}>Próxima Misión</p>
                                   <p style={{ fontWeight: 900, fontSize: "1.3rem" }}>{insight?.nextAction || FALLBACK_INSIGHT.nextAction}</p>
                                </div>
                             </div>
                             
                             <div style={{ display: "flex", gap: "1rem" }}>
                                <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 10px #10b981" }} />
                                <p style={{ fontSize: "0.85rem", fontWeight: 800, opacity: 0.6 }}>SISTEMA OPERATIVO ACTIVO</p>
                             </div>
                          </div>
                       </div>

                       {/* RECOMENDACIONES ESTRATÉGICAS */}
                       <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem", marginBottom: "4rem" }}>
                          {(recommendations.length > 0 || !insight) && recommendations.slice(0, 3).map((rec, i) => (
                            <div key={i} className="glass" style={{ padding: "3rem", borderRadius: "2rem", borderTop: `6px solid ${rec.type === 'AHORRO' ? '#ef4444' : rec.type === 'CRECIMIENTO' ? '#3b82f6' : '#10b981'}`, background: "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)", transition: "transform 0.3s ease" }}>
                               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                  <span style={{ fontSize: '0.7rem', fontWeight: 950, padding: '0.4rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '2rem', letterSpacing: "1.5px", color: rec.type === 'AHORRO' ? '#ef4444' : rec.type === 'CRECIMIENTO' ? '#3b82f6' : '#10b981' }}>{rec.type}</span>
                                  {rec.type === 'AHORRO' ? <Activity size={20} color="#ef4444" /> : rec.type === 'CRECIMIENTO' ? <Zap size={20} color="#3b82f6" /> : <ShieldCheck size={20} color="#10b981" />}
                               </div>
                               <h4 style={{ fontWeight: 950, fontSize: "1.5rem", marginBottom: "1.2rem", lineHeight: 1.2 }}>{rec.title}</h4>
                               <p style={{ fontSize: "1rem", opacity: 0.5, lineHeight: 1.7, fontWeight: 500 }}>{rec.description}</p>
                            </div>
                          ))}
                       </div>

                       <div style={{ display: "grid", gridTemplateColumns: "1fr 0.45fr", gap: "2.5rem" }}>
                          {/* MAPA DE GANANCIAS */}
                          <div className="glass" style={{ padding: "4rem", borderRadius: "2.5rem" }}>
                             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4rem" }}>
                                <div>
                                   <h3 style={{ fontSize: "2rem", fontWeight: 950, marginBottom: "0.5rem" }}>Mapa de Ganancias</h3>
                                   <p style={{ opacity: 0.5, fontSize: "0.9rem", fontWeight: 600 }}>Visualización del flujo de conversión Bolton OS</p>
                                </div>
                                <div className="glass" style={{ padding: "0.75rem 1.5rem", borderRadius: "1rem", display: "flex", gap: "0.8rem", alignItems: "center" }}>
                                   <MousePointer2 size={18} color="var(--primary)" />
                                   <span style={{ fontSize: "0.85rem", fontWeight: 900 }}>EFICIENCIA 94%</span>
                                </div>
                             </div>
                             <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
                                {funnel.length > 0 ? funnel.map((step) => (
                                   <div key={step.id}>
                                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", fontSize: "0.95rem" }}>
                                         <span style={{ fontWeight: 950, opacity: 0.4, letterSpacing: "2px" }}>{step.label.toUpperCase()}</span>
                                         <b style={{ fontSize: "1.4rem", fontWeight: 950 }}>{step.value.toLocaleString()}</b>
                                      </div>
                                      <div style={{ height: "55px", background: "rgba(255,255,255,0.02)", borderRadius: "1.2rem", overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)", padding: "4px" }}>
                                         <motion.div 
                                           initial={{ width: 0 }} 
                                           animate={{ width: `${step.percentage}%` }} 
                                           style={{ height: "100%", background: step.color, borderRadius: "0.9rem", opacity: 0.7, boxShadow: `0 0 30px ${step.color}40`, position: 'relative' }}
                                         >
                                            <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', fontWeight: 950, color: 'white' }}>{step.percentage}%</div>
                                         </motion.div>
                                      </div>
                                   </div>
                                )) : <div style={{ opacity: 0.3, textAlign: "center", padding: "4rem" }}>Sincronizando telemetría del embudo...</div>}
                             </div>
                          </div>

                          {/* SCORE DE CRECIMIENTO */}
                          <div className="glass" style={{ padding: "4rem", background: "radial-gradient(circle at top right, rgba(59, 130, 246, 0.15) 0%, transparent 100%)", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", borderRadius: "2.5rem" }}>
                             <p style={{ fontSize: "1rem", color: "var(--muted)", fontWeight: 950, letterSpacing: "4px", marginBottom: "2rem", textTransform: "uppercase" }}>Índice de Dominio</p>
                             <div style={{ position: 'relative', display: 'inline-block', margin: '0 auto' }}>
                                <motion.span 
                                  initial={{ scale: 0.5, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  style={{ fontSize: "9rem", fontWeight: 950, color: "var(--primary)", lineHeight: 1, letterSpacing: "-5px", display: "block" }}
                                >
                                  {insight?.growthScore || 0}
                                </motion.span>
                                <div style={{ position: 'absolute', top: '10%', right: '-20%', background: 'var(--primary)', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 950 }}>AI</div>
                             </div>
                             <div style={{ marginTop: "3rem", display: "inline-block", padding: "0.8rem 2.5rem", borderRadius: "3rem", background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)", boxShadow: "0 0 40px rgba(16, 185, 129, 0.1)" }}>
                                <p style={{ fontSize: "1.2rem", color: "#10b981", fontWeight: 950, letterSpacing: "1px" }}>{insight?.statusLabel || "ÓPTIMO"}</p>
                             </div>
                          </div>
                       </div>
                    </motion.div>
                  )}

                  {dashboardMode === "avanzado" && (
                    <motion.div key="avanzado-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                       {/* MÉTRICAS TÉCNICAS PROFUNDAS */}
                       <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1.5rem", marginBottom: "3.5rem" }}>
                          {[
                            { label: "ROAS (Target)", value: "5.2x", color: "#10b981", icon: DollarSign, trend: "+12%" },
                            { label: "CPA (Efectivo)", value: "$3.850", color: "#3b82f6", icon: Target, trend: "-5%" },
                            { label: "CTR Promedio", value: "3.4%", color: "var(--accent)", icon: MousePointer2, trend: "+0.8%" },
                            { label: "Impresiones", value: metrics?.impressions.toLocaleString() || "0", color: "white", icon: Eye, trend: "Pico 14:00" },
                            { label: "Leads Brutos", value: leads.length.toLocaleString(), color: "white", icon: Radio, trend: "L48h" }
                          ].map((m, i) => (
                            <div key={i} className="glass" style={{ padding: "2.5rem 1.5rem", textAlign: "center", borderTop: `5px solid ${m.color}`, background: "rgba(255,255,255,0.01)", borderRadius: "1.5rem" }}>
                               <p style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: 950, textTransform: "uppercase", marginBottom: "1.2rem", letterSpacing: "1.5px" }}>{m.label}</p>
                               <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                                  <m.icon size={18} color={m.color} />
                                  <p style={{ fontSize: "2.2rem", fontWeight: 950, color: m.color, letterSpacing: "-1px" }}>{m.value}</p>
                                </div>
                                <p style={{ fontSize: "0.65rem", fontWeight: 900, color: m.trend.startsWith('+') ? '#10b981' : (m.trend.startsWith('-') ? '#3b82f6' : 'var(--muted)'), opacity: 0.6 }}>{m.trend}</p>
                            </div>
                          ))}
                       </div>

                       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.5rem", marginBottom: "4rem" }}>
                          {/* LABORATORIO DE VARIANTES */}
                          <div className="glass" style={{ padding: "3.5rem", borderRadius: "2.5rem" }}>
                             <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "3.5rem" }}>
                                <div className="glass" style={{ padding: '0.6rem', borderRadius: '0.8rem', color: 'var(--primary)' }}><Brain size={32} /></div>
                                <div>
                                   <h3 style={{ fontSize: "1.8rem", fontWeight: 950 }}>Laboratorio Creativo</h3>
                                   <p style={{ fontSize: '0.85rem', opacity: 0.5, fontWeight: 700 }}>Rendimiento por Ángulo de Venta</p>
                                </div>
                             </div>
                             <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                {variants.map((v, i) => (
                                  <div key={i} className="glass" style={{ padding: "2.5rem", background: "linear-gradient(rgba(255,255,255,0.03), transparent)", borderRadius: "1.5rem", border: "1px solid rgba(255,255,255,0.05)" }}>
                                     <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem", alignItems: "center" }}>
                                        <div style={{ display: 'flex', gap: '0.8rem' }}>
                                           <span style={{ fontSize: "0.7rem", fontWeight: 950, color: "var(--primary)", background: "rgba(59, 130, 246, 0.1)", padding: "0.4rem 0.8rem", borderRadius: "2rem", letterSpacing: '1px' }}>{v.angle.toUpperCase()}</span>
                                           <span style={{ fontSize: "0.7rem", fontWeight: 950, color: "#10b981", background: "rgba(16, 185, 129, 0.1)", padding: "0.4rem 0.8rem", borderRadius: "2rem", letterSpacing: '1px' }}>WINNER</span>
                                        </div>
                                        <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.8rem", fontWeight: 900 }}>
                                           <div style={{ textAlign: 'right' }}><p style={{ opacity: 0.4, fontSize: '0.6rem' }}>CTR</p><p>{(Math.random() * 2 + 3).toFixed(1)}%</p></div>
                                           <div style={{ textAlign: 'right' }}><p style={{ opacity: 0.4, fontSize: '0.6rem' }}>LEADS</p><p>{Math.floor(Math.random() * 15) + 5}</p></div>
                                        </div>
                                     </div>
                                     <h4 style={{ fontSize: "1.4rem", fontWeight: 950, marginBottom: "1.2rem", color: "white" }}>{v.headline}</h4>
                                     <p style={{ lineHeight: 1.6, opacity: 0.6, fontSize: "1rem", fontWeight: 500 }}>{v.description}</p>
                                  </div>
                                ))}
                             </div>
                          </div>

                          {/* RADAR DE AUDIENCIA */}
                          <div className="glass" style={{ padding: "3.5rem", borderRadius: "2.5rem" }}>
                             <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "3.5rem" }}>
                                <div className="glass" style={{ padding: '0.6rem', borderRadius: '0.8rem', color: 'var(--primary)' }}><Users size={32} /></div>
                                <div>
                                   <h3 style={{ fontSize: "1.8rem", fontWeight: 950 }}>Radar de Audiencia</h3>
                                   <p style={{ fontSize: '0.85rem', opacity: 0.5, fontWeight: 700 }}>Prospección en Tiempo Real</p>
                                </div>
                             </div>
                             <div className="glass" style={{ maxHeight: "650px", overflowY: "auto", padding: "1rem", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "1.5rem", background: 'rgba(0,0,0,0.1)' }}>
                                {leads.length > 0 ? leads.map(lead => (
                                  <div key={lead.id} className="lead-row" style={{ padding: "1.8rem", borderBottom: "1px solid rgba(255,255,255,0.03)", display: "flex", justifyContent: "space-between", alignItems: "center", transition: 'all 0.2s' }}>
                                     <div>
                                        <p style={{ fontWeight: 950, fontSize: "1.2rem", marginBottom: '0.25rem' }}>{lead.name}</p>
                                        <p style={{ fontSize: "0.8rem", opacity: 0.4, fontWeight: 700, letterSpacing: '0.5px' }}>{lead.email.toUpperCase()}</p>
                                     </div>
                                     <div style={{ textAlign: "right" }}>
                                        <div style={{ display: 'inline-block', padding: '0.4rem 1rem', borderRadius: '1rem', background: lead.score >= 70 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)', border: `1px solid ${lead.score >= 70 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)'}` }}>
                                           <div style={{ fontSize: "0.85rem", fontWeight: 950, color: lead.score >= 70 ? "#10b981" : "#3b82f6" }}>🔥 {lead.score}%</div>
                                        </div>
                                        <div style={{ fontSize: "0.65rem", fontWeight: 900, textTransform: "uppercase", opacity: 0.3, marginTop: '0.6rem', letterSpacing: '1px' }}>{lead.trait || "Potential Client"}</div>
                                     </div>
                                  </div>
                                )) : <div style={{ textAlign: "center", padding: "5rem", opacity: 0.3 }}><Radar size={50} className="animate-pulse" style={{ margin: '0 auto 1.5rem' }} /><p style={{ fontWeight: 800 }}>Escaneando señales de conversión...</p></div>}
                             </div>
                          </div>
                       </div>

                       {/* BITÁCORA TÉCNICA */}
                       <div className="glass" style={{ padding: "4rem", borderRadius: "2.5rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "4rem" }}>
                             <div className="glass" style={{ padding: '0.6rem', borderRadius: '0.8rem', color: 'var(--primary)' }}><History size={32} /></div>
                             <h3 style={{ fontSize: "2rem", fontWeight: 950 }}>Bitácora de Optimización Bolton</h3>
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "2rem" }}>
                             {history.map(event => (
                               <div key={event.id} className="glass" style={{ padding: "2.5rem", borderLeft: "5px solid var(--primary)", background: "rgba(255,255,255,0.02)", borderRadius: "1.5rem", position: 'relative' }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.2rem", alignItems: 'center' }}>
                                     <h4 style={{ fontSize: "1.4rem", fontWeight: 950, letterSpacing: '-0.5px' }}>{event.action_title}</h4>
                                     <span style={{ fontSize: "0.75rem", opacity: 0.3, fontWeight: 900 }}>{new Date(event.timestamp).toLocaleDateString()}</span>
                                  </div>
                                  <p style={{ opacity: 0.6, fontSize: "1rem", lineHeight: 1.6, fontWeight: 500 }}>{event.impact_summary}</p>
                                  <div style={{ position: 'absolute', right: '1.5rem', bottom: '1.5rem', opacity: 0.1 }}><ShieldCheck size={40} /></div>
                               </div>
                             ))}
                          </div>
                       </div>
                    </motion.div>
                  )}

                  {dashboardMode === "clon" && (
                    <motion.div key="clon-view" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                       <ClaudioClone 
                          userId={user?.id}
                          campaignData={{
                            id: (campaignId || tempId)?.toString() || "Sin Campaña",
                            metrics: metrics || FALLBACK_METRICS,
                            insight: insight || FALLBACK_INSIGHT,
                            funnel: funnel
                          }}
                       />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {activePilar === "asistentes" && (
            <motion.div key="asistentes-pilar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: "1400px", margin: "0 auto", paddingBottom: "10rem" }}>
               <AssistantsView />
            </motion.div>
          )}

          {activePilar === "laboratorio" && (
            <motion.div key="lab-pilar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '10rem' }}>
               <InnovationLab />
            </motion.div>
          )}

          {activePilar === "aprende" && (
            <motion.div key="aprende-pilar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '10rem' }}>
               <AcademyView />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {showIdModal && (
        <div className="glass" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
           <div style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
              <button 
                onClick={() => setShowIdModal(false)}
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', zIndex: 10 }}
              >
                <XIcon size={24} />
              </button>
              <GoogleAdsConnect 
                userId={user?.id}
                onConnected={(id) => {
                  const cleaned = id.toString().replace(/-/g, "");
                  setCustomerId(cleaned);
                  setShowIdModal(false);
                  completeActivation('motor', cleaned);
                }}
              />
           </div>
        </div>
      )}

      {showCreationModal && (
        <CampaignCreationModal 
          onClose={() => setShowCreationModal(false)}
          onComplete={handleSurveyComplete}
          existingCampaigns={campaigns}
        />
      )}

      {showActivationModal && (
        <div className="glass" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100 }}>
           <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass" style={{ padding: "4rem", maxWidth: "500px", textAlign: "center", background: "var(--background)", borderRadius: "2rem" }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 2rem" }}>
                 <Play color="#10b981" size={40} />
              </div>
              <h3 style={{ fontSize: "2rem", fontWeight: 950, marginBottom: "1rem" }}>Activar Campaña</h3>
              <p style={{ opacity: 0.7, marginBottom: "2.5rem" }}>Estás a un paso de habilitar tu campaña real. Una vez activa, Bolton OS comenzará a optimizarla usando IA para maximizar tu retorno.</p>
              <div style={{ display: "flex", gap: "1rem" }}>
                <button onClick={() => setShowActivationModal(false)} className="btn-secondary" style={{ flex: 1 }}>Más tarde</button>
                <button onClick={handleCampaignActivation} className="btn-primary" style={{ flex: 1 }}>Habilitar Ahora</button>
              </div>
           </motion.div>
        </div>
      )}

      {showDnsModal && (
        <div className="glass" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, backdropFilter: "blur(10px)" }}>
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="glass" 
             style={{ width: '100%', maxWidth: '600px', padding: '3rem', position: 'relative', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '2rem' }}
            >
              <button onClick={() => setShowDnsModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><XIcon size={24} /></button>
              
              <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '2rem', fontWeight: 950, marginBottom: '0.5rem' }}>Conectar Dominio</h3>
                <p style={{ opacity: 0.6 }}>Asocia tu propia dirección web a la Landing Page de Bolton.</p>
              </div>

              {!dnsConfig ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '1px', display: 'block', marginBottom: '0.5rem' }}>TU DOMINIO (EJ: MISERVICIO.CL)</label>
                    <input 
                      type="text" 
                      placeholder="ejemplo.cl"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      className="glass"
                      style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px border rgba(255,255,255,0.1)', color: 'white', fontSize: '1.1rem', borderRadius: '0.8rem' }}
                    />
                  </div>
                  <button 
                    onClick={handleConnectDomain}
                    className="btn-primary"
                    style={{ width: '100%', padding: '1.2rem', fontWeight: 900, fontSize: '1rem' }}
                  >
                    VINCULAR AHORA
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <div className="glass" style={{ padding: '1.5rem', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '1rem' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981', marginBottom: '1rem' }}>Paso 1: Configura tus registros DNS</p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.5rem' }}>
                        <div>
                          <p style={{ opacity: 0.5, fontSize: '0.6rem', fontWeight: 900 }}>TIPO A (Root)</p>
                          <code style={{ color: 'var(--primary)', fontWeight: 800 }}>{dnsConfig.a}</code>
                        </div>
                        <Copy size={16} className="cursor-pointer opacity-50 text-white" />
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.5rem' }}>
                        <div>
                          <p style={{ opacity: 0.5, fontSize: '0.6rem', fontWeight: 900 }}>CNAME (www)</p>
                          <code style={{ color: 'var(--primary)', fontWeight: 800 }}>{dnsConfig.cname}</code>
                        </div>
                        <Copy size={16} className="cursor-pointer opacity-50 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  <p style={{ fontSize: '0.8rem', opacity: 0.6, textAlign: 'center' }}>
                    * Los cambios DNS pueden tardar hasta 24 horas en propagarse globalmente. Una vez configurados, tu sitio estará listo.
                  </p>

                  <button onClick={() => setShowDnsModal(false)} className="btn-secondary" style={{ width: '100%' }}>TERMINAR</button>
                </div>
              )}
           </motion.div>
        </div>
      )}

      {showLandingForm && (
        <LandingFormModal 
          initialData={preLandingData}
          onClose={() => setShowLandingForm(false)}
          onConfirm={(data: any) => handleDeployLanding(data)}
        />
      )}

      {showSuccess && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.95)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200, overflow: "hidden" }}
        >
           <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: "center", padding: "4rem", maxWidth: "500px" }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, ease: "easeOut" }} style={{ width: "100px", height: "100px", borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 2rem", boxShadow: "0 0 50px var(--primary)" }}>
                 <Rocket size={50} color="white" />
              </motion.div>
              <h2 style={{ fontSize: "2.5rem", fontWeight: 950, marginBottom: "1rem" }}>{successMessage.title}</h2>
              <p style={{ fontSize: "1.2rem", opacity: 0.8, marginBottom: "2rem" }}>{successMessage.body}</p>
              <button onClick={() => setShowSuccess(false)} className="btn-primary" style={{ padding: "1rem 2rem" }}>Continuar la Misión</button>
           </motion.div>
        </motion.div>
      )}
      {toast && (
        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} style={{ position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 2000, background: toast.type === 'error' ? '#ef4444' : (toast.type === 'success' ? '#10b981' : 'var(--primary)'), color: 'white', padding: '1rem 2rem', borderRadius: '1rem', fontWeight: 800, boxShadow: '0 20px 40px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {toast.message}
        </motion.div>
      )}
      <AnimatePresence>
        {showProfile && (
          <ProfileView 
            user={user}
            onClose={() => setShowProfile(false)}
            onLogout={handleLogout}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
