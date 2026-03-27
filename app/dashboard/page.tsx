"use client";

import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useEffect, useState, Suspense } from "react";
import { LogOut, Radio, BarChart3, Bot, Zap, TrendingUp, MousePointer2, Eye, DollarSign, Target, Loader2, Sparkles, MessageSquare, ArrowRight, ArrowLeft, ShieldCheck, Activity, ThumbsUp, ThumbsDown, Lock, User as UserIcon, Layers, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, MinusCircle, Lightbulb, TrendingDown, Clock, Check, Edit3, MessageCircle, PenTool, Calculator, Calendar, Play, Pause, Filter, Users, Mail, Phone, ExternalLink, UserCheck, BrainCircuit, Star, BarChart, Trophy, Flame, Shield, ShieldAlert, ShieldCheck as ShieldOk, Globe, Layout, Palette, Copy, BookmarkCheck, History, ListRestart, Send, Rocket, LayoutDashboard, Brain, TestTube2, ScrollText, Settings, X as XIcon, Radar, GraduationCap } from "lucide-react";
import { getScenarioDiagnosis, ScenarioDiagnosis, AdAction } from "@/lib/ads-diagnostic";
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
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [rawActivity, setRawActivity] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

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
  const [diagnosis, setDiagnosis] = useState<ScenarioDiagnosis | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<AdAction | null>(null);
  const [actionValue, setActionValue] = useState<number>(10);
  const [isExecuting, setIsExecuting] = useState(false);
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
        console.warn("[Bolton] Protocolo de Rescate Activado (Timeout 5s). Asegurando renderizado.");
      }, 5000);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUser(session.user);
          setLoadingSettings(false);
          clearTimeout(rescueTimer);

          // DISPARADOR DE BIENVENIDA (Fase 10)
          // 🛡️ CONTROL DE BIENVENIDA ÚNICA (Persistencia total con localStorage)
          const welcomeTriggered = localStorage.getItem(`welcome_sent_${session.user.id}`);
          if (session.user.email_confirmed_at && !welcomeTriggered) {
            localStorage.setItem(`welcome_sent_${session.user.id}`, 'true');
            fetch('/api/notify/welcome', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: session.user.email, userId: session.user.id })
            }).catch(async (e) => {
              console.error("[Bolton] Welcome trigger fallback attempt:", e);
              // Reintento silencioso vía Auth Hook o eliminar marca para siguiente sesión
              localStorage.removeItem(`welcome_sent_${session.user.id}`);
            });
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

  const fetchRawHistory = async () => {
    if (!user?.id) return;
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('user_activity_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      setRawActivity(data || []);
      setShowHistoryModal(true);
    } catch (err: any) {
      console.error("Fallo al obtener historial real:", err);
      showToast("No pudimos cargar el historial técnico.", "error");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleConnected = async (id: any, alreadySaved: boolean = false, explicitCampaignId?: string, explicitUser?: any) => {
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
          setMetrics(metricsData.metrics);
          // Calcular diagnóstico determinista
          if (metricsData.metrics && customerId) {
            const campaignData = campaigns.find(c => c.id.toString() === campaignId?.toString());
            const diag = getScenarioDiagnosis(metricsData.metrics, campaignData?.status || 'ENABLED', 10000); // Budget hardcoded temporalmente
            setDiagnosis(diag);
          }
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

  const transparentRedeploy = async () => {
    if (!user) return;
    setDeployingLanding(true);
    showToast("Bolton IA: Reflejando cambios en tu sitio en vivo...", "info");
    
    try {
      const prepRes = await secureFetch("/api/vercel/prepare-landing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id })
      });
      const prepData = await prepRes.json();
      if (!prepData.success) throw new Error(prepData.error);

      const deployRes = await secureFetch("/api/vercel/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, landingData: prepData.landingData })
      });
      const deployData = await deployRes.json();
      if (!deployData.success) throw new Error(deployData.error);
      
      showToast("¡Sincronización de sitio completada!", "success");
    } catch (err: any) {
      console.error("Transparent Redeploy Error:", err);
      showToast("No pudimos actualizar el sitio automáticamente.", "error");
    } finally {
      setDeployingLanding(false);
    }
  };

  const setupConversions = async () => {
    if (!user) return;
    setStatus("fetching");
    showToast("Bolton IA: Creando acción de conversión en Google Ads...", "info");
    
    try {
      const res = await secureFetch("/api/ads/conversions/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id })
      });
      
      const data = await res.json();
      if (data.success) {
        showToast("¡Configuración de conversión exitosa!", "success");
        await fetchProgress();
        
        // MÁXIMA MAGIA: Redeploy automático
        await transparentRedeploy();

        setSuccessMessage({ title: "¡Conversiones Activas!", body: "Bolton ahora mide cada contacto real. Tu ROI empezará a calibrarse." });
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
      } else {
        showToast(`Error: ${data.error || "No se pudo configurar"}`, "error");
      }
    } catch (err) {
      showToast("Error de conexión al configurar conversiones.", "error");
    } finally {
      setStatus("dashboard");
    }
  };

  const setupCallouts = async () => {
    if (!user) return;
    setStatus("fetching");
    showToast("Bolton IA: Analizando tu perfil para redactar textos de alto impacto...", "info");
    
    try {
      const res = await secureFetch("/api/ads/assets/callouts/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id })
      });
      
      const data = await res.json();
      if (data.success) {
        showToast("¡Textos destacados inyectados con éxito!", "success");
        await fetchProgress();
        setSuccessMessage({ title: "¡Anuncios Optimizados!", body: "Bolton ha inyectado tus fortalezas directamente en Google Ads. Tus ads ya son más grandes y potentes." });
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
      } else {
        showToast(`Error: ${data.error || "No se pudo configurar"}`, "error");
      }
    } catch (err) {
      showToast("Error de conexión al configurar textos destacados.", "error");
    } finally {
      setStatus("dashboard");
    }
  };

  const setupSitelinks = async () => {
    if (!user) return;
    setStatus("fetching");
    showToast("Bolton IA: Diseñando enlaces de sitio estratégicos...", "info");
    
    try {
      const res = await secureFetch("/api/ads/assets/sitelinks/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id })
      });
      
      const data = await res.json();
      if (data.success) {
        showToast("¡Enlaces de sitio creados con éxito!", "success");
        await fetchProgress();
        setSuccessMessage({ title: "¡Estructura Expandida!", body: "Tus anuncios ahora ocupan más espacio y ofrecen accesos directos a tus servicios." });
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
      } else {
        showToast(`Error: ${data.error || "No se pudo configurar"}`, "error");
      }
    } catch (err) {
      showToast("Error de conexión al configurar sitelinks.", "error");
    } finally {
      setStatus("dashboard");
    }
  };

  const setupCallExtension = async () => {
    if (!user) return;
    setStatus("fetching");
    showToast("Bolton IA: Vinculando línea de atención directa...", "info");
    
    try {
      const res = await secureFetch("/api/ads/assets/calls/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id })
      });
      
      const data = await res.json();
      if (data.success) {
        showToast("¡Extensión de llamada habilitada!", "success");
        await fetchProgress();
        setSuccessMessage({ title: "¡Llamada Directa!", body: "Tus pacientes ahora pueden llamarte con un clic desde el anuncio de Google." });
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
      } else {
        showToast(`Error: ${data.error || "No se pudo configurar"}`, "error");
      }
    } catch (err) {
      showToast("Error de conexión al configurar extensión de llamada.", "error");
    } finally {
      setStatus("dashboard");
    }
  };

  const handleExecuteAction = async () => {
    if (!user || !pendingAction || !campaignId || !customerId) return;
    setIsExecuting(true);
    
    try {
      const res = await secureFetch("/api/ads/actions/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          actionId: pendingAction.id,
          campaignId,
          customerId,
          value: actionValue
        })
      });
      
      const data = await res.json();
      if (data.success) {
        showToast(`¡Acción ejecutada!: ${data.actionLabel}`, "success");
        setShowConfirmModal(false);
        await fetchMetrics(); // Refrescar métricas/estado
      } else {
        showToast(`Error: ${data.error}`, "error");
      }
    } catch (err) {
      showToast("Error al ejecutar la acción estratégica.", "error");
    } finally {
      setIsExecuting(false);
      setPendingAction(null);
    }
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
    } else if (key === 'escalamiento') {
      setupConversions();
    } else if (key === 'geografia') {
      setupCallouts();
    } else if (key === 'creativo') {
      setupSitelinks();
    } else if (key === 'leads') {
      setupCallExtension();
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

  const handleManualComplete = async (instanceKey: string, category: string = 'clientes') => {
    if (!user) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        showToast("Error estratégico: Tu sesión ha expirado. Forzando reconexión.", "error");
        setTimeout(() => router.push("/"), 2000);
        return;
      }
      setUser(session.user);
    }
    
    console.log(`[Bolton] Marcando hito manual: ${instanceKey} en ${category}`);
    setStatus("fetching");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await secureFetch("/api/user/progress", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ userId: session?.user?.id || user?.id, category, instanceKey, isCompleted: true }) 
      });
      const data = await res.json();
      if (data.success) {
        showToast("¡Hito estratégico superado!", "success");
        await fetchProgress(); // Sincroniza estado local con Supabase
        setSuccessMessage({ title: "¡Estructura Blindada!", body: "Has habilitado la infraestructura necesaria para Bolton OS." });
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      console.error("[Bolton] Error al guardar progreso:", e);
      showToast(`Error al sincronizar progreso: ${e.message}`, "error");
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


  const handleUnlink = async (instanceKey?: string) => {
    const isMotor = instanceKey === 'motor';
    const confirmMsg = isMotor 
      ? "¿Estás seguro de que quieres desvincular tu cuenta de Google Ads? Esto detendrá la sincronización del cerebro comercial."
      : "¿Estás seguro de que quieres desvincular esta campaña? Se borrará el progreso de estrategia actual para empezar de cero.";
    
    if (!user || !window.confirm(confirmMsg)) return;
    
    setStatus("fetching");
    try {
      const endpoint = isMotor ? "/api/ads/motor/unlink" : "/api/ads/campaigns/unlink";
      const res = await secureFetch(endpoint, { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ userId: user.id }) 
      });
      
      const data = await res.json();
      if (data.success) {
        if (isMotor) {
          setCustomerId(null);
          setCampaignId(null); // Si se va el motor, se va la campaña
        } else {
          setCampaignId(null);
        }
        
        setBattlePlan(null);
        setMetrics(null);
        setFunnel([]);
        await fetchProgress();
        showToast(isMotor ? "Cuenta desvinculada correctamente." : "Campaña desvinculada. Puedes crear una nueva estrategia.", "success");
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

  const handleDeleteLanding = async () => {
    if (!user || !vercelProjectId || !window.confirm("¿Estás seguro de que quieres eliminar tu landing page? Se borrará el sitio web y el proyecto en Vercel permanentemente.")) return;
    
    setStatus("fetching");
    setDeployingLanding(true);
    try {
      // 1. Borrar en Vercel
      const delRes = await secureFetch("/api/vercel/delete-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, projectId: vercelProjectId })
      });
      
      const delData = await delRes.json();
      if (!delData.success) throw new Error(delData.error);

      // 2. Limpiar en Supabase (Settings)
      await secureFetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: user.id, 
          landingUrl: null, 
          vercelProjectId: null, 
          customDomain: null 
        })
      });

      // 3. Resetear hito de progreso
      await secureFetch("/api/user/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: user.id, 
          category: 'clientes', 
          instanceKey: 'landing', 
          isCompleted: false 
        })
      });

      setLandingUrl(null);
      setVercelProjectId(null);
      setCustomDomain("");
      await fetchProgress();
      showToast("Landing page eliminada y progreso reseteado.", "success");
      setCurrentInstance(null);
      setStatus("dashboard");
    } catch (err: any) {
      showToast(`Error al eliminar landing: ${err.message}`, "error");
      setStatus("dashboard");
    } finally {
      setDeployingLanding(false);
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
          name: 'Crea tu cuenta Motor', 
          description: 'Crea tu cuenta de Google Ads para habilitar la infraestructura Bolton.', 
          status: isComp('crear_cuenta') ? 'completed' : 'unlocked' as any
        },
        { 
          key: 'motor', 
          name: 'Vincula Motor', 
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
          name: 'Configuración de conversiones', 
          description: 'Mide cada contacto y reserva para que Bolton optimice tu inversión con precisión quirúrgica.', 
          status: isComp('activacion') ? 'unlocked' : 'locked' as any 
        },
        { 
          key: 'geografia', 
          name: 'Define tus Textos destacados', 
          description: 'Resalta tus fortalezas (años de experiencia, atención inmediata) para disparar tu CTR.', 
          status: isComp('escalamiento') ? (isComp('geografia') ? 'completed' : 'unlocked') : 'locked' as any 
        },
        { 
          key: 'creativo', 
          name: 'Crear enlaces de sitio', 
          description: 'Añade accesos directos a tus servicios clave (ej: Terapia de Pareja) para captar más espacio.', 
          status: isComp('geografia') ? (isComp('creativo') ? 'completed' : 'unlocked') : 'locked' as any 
        },
        { 
          key: 'leads', 
          name: 'Crear extensión de llamada', 
          description: 'Permite que tus pacientes te llamen con un solo clic directamente desde tu anuncio de Google.', 
          status: isComp('creativo') ? (isComp('leads') ? 'completed' : 'unlocked') : 'locked' as any 
        },
        { 
          key: 'canales', 
          name: 'Expansión de Canales', 
          description: 'Integración multicanal Bolton para dominio total del mercado.', 
          status: isComp('leads') ? 'unlocked' : 'locked' as any 
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
    <div className="container" style={{ paddingTop: "6rem", minHeight: "100vh" }}>
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

                <AnimatePresence>
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
                            onDeleteLanding={handleDeleteLanding}
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
                                        {actual && actual.status !== 'completed' && actual.status !== 'locked' && (
                                          <button 
                                            onClick={() => handleManualComplete(actual.key, 'clientes')}
                                            className="btn-primary hover-glow" 
                                            style={{ padding: "1.2rem 2.5rem", fontSize: "0.85rem", fontWeight: 950, borderRadius: "1.5rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", background: "#10b981", border: "none", color: "white", boxShadow: "0 10px 30px rgba(16, 185, 129, 0.3)", transition: "all 0.3s ease" }}
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
                              onDeleteLanding={handleDeleteLanding}
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
                              onGoToDashboard={() => setActivePilar("dashboard")}
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

          {/* MODAL DE CONFIRMACIÓN BOLTON DECISIONS */}
          <AnimatePresence>
            {showConfirmModal && pendingAction && (
              <div className="modal-overlay" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)" }}>
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="glass"
                  style={{ padding: "3rem", borderRadius: "2.5rem", maxWidth: "500px", width: "90%", border: "1px solid rgba(59, 130, 246, 0.3)", textAlign: "center" }}
                >
                  <div style={{ width: "60px", height: "60px", background: "rgba(59, 130, 246, 0.1)", borderRadius: "1.2rem", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
                    <Shield size={32} color="var(--primary)" />
                  </div>
                  
                  <h2 style={{ fontSize: "1.8rem", fontWeight: 950, marginBottom: "1rem" }}>Confirmar Acción</h2>
                  <p style={{ opacity: 0.7, marginBottom: "2rem" }}>
                    Bolton está listo para ejecutar: <br/>
                    <strong style={{ color: "white", fontSize: "1.2rem" }}>{pendingAction.label}</strong>
                  </p>

                  {pendingAction.type === 'budget' && (
                    <div style={{ marginBottom: "2rem", padding: "1.5rem", background: "rgba(255,255,255,0.03)", borderRadius: "1.2rem", border: "1px solid rgba(255,255,255,0.05)" }}>
                       <p style={{ fontSize: "0.7rem", fontWeight: 900, textTransform: "uppercase", opacity: 0.5, marginBottom: "1rem" }}>Ajustar Porcentaje (%)</p>
                       <input 
                         type="number" 
                         value={actionValue}
                         onChange={(e) => setActionValue(Number(e.target.value))}
                         style={{ background: "transparent", border: "none", borderBottom: "2px solid var(--primary)", fontSize: "2rem", fontWeight: 900, color: "white", textAlign: "center", width: "100px", outline: "none" }}
                       />
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "1rem" }}>
                    <button 
                      onClick={() => setShowConfirmModal(false)}
                      className="btn-secondary" 
                      style={{ flex: 1, padding: "1rem", borderRadius: "1rem" }}
                      disabled={isExecuting}
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={handleExecuteAction}
                      className="btn-primary" 
                      style={{ flex: 1, padding: "1rem", borderRadius: "1rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
                      disabled={isExecuting}
                    >
                      {isExecuting ? <Loader2 className="animate-spin" size={18} /> : "Ejecutar Acción"}
                    </button>
                  </div>
                  
                  <p style={{ marginTop: "1.5rem", fontSize: "0.6rem", opacity: 0.4, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px" }}>
                    Bolton enviará una notificación a tu correo tras la ejecución.
                  </p>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {activePilar === "dashboard" && (
            <motion.div key="dashboard-pilar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1rem" }}>
                
                {/* 1. SECCIÓN: ESTADO DEL SISTEMA (AI MSG) */}
                <div className="glass" style={{ padding: "2.5rem", borderRadius: "2rem", marginBottom: "2rem", background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, transparent 100%)", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "1rem" }}>
                        <div style={{ padding: "0.8rem", borderRadius: "1.2rem", background: "rgba(59, 130, 246, 0.2)", color: "var(--primary)" }}>
                            <Bot size={32} />
                        </div>
                        <div>
                            <span style={{ fontSize: "0.75rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "2px", opacity: 0.5 }}>Estado de tu sistema</span>
                            <h2 style={{ fontSize: "2rem", fontWeight: 950 }}>{insight?.system_status?.label || "Calibrando Visión..."}</h2>
                        </div>
                    </div>
                    <p style={{ fontSize: "1.25rem", fontWeight: 500, lineHeight: 1.6, opacity: 0.8, maxWidth: "800px" }}>
                        {insight?.system_status?.message || "Bolton está analizando la mejor ruta para conectar con tus próximos pacientes. En unos instantes verás el camino despejado."}
                    </p>
                </div>

                {/* NUEVO: PANEL DE DECISIÓN BOLTON (DETERMINISTA) */}
                {diagnosis && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass" 
                    style={{ 
                      padding: "2rem", 
                      borderRadius: "2rem", 
                      marginBottom: "2rem", 
                      background: "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)",
                      border: "1px solid rgba(59, 130, 246, 0.3)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "1.5rem"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                        <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#3b82f6", boxShadow: "0 0 10px #3b82f6" }} />
                        <h3 style={{ fontSize: "1.2rem", fontWeight: 950, letterSpacing: "-0.5px" }}>Diagnóstico: {diagnosis.title}</h3>
                      </div>
                      <div className="glass-pill" style={{ fontSize: "0.6rem", fontWeight: 900, background: "rgba(59, 130, 246, 0.1)" }}>DESCUBRIMIENTO DETERMINISTA</div>
                    </div>
                    
                    <p style={{ fontSize: "1.1rem", fontWeight: 500, opacity: 0.9, lineHeight: 1.5 }}>{diagnosis.diagnosis}</p>
                    
                    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                      {diagnosis.actions.map(act => (
                        <button
                          key={act.id}
                          onClick={() => {
                            setPendingAction(act);
                            setActionValue(act.suggestedValue || 10);
                            setShowConfirmModal(true);
                          }}
                          className="btn-primary"
                          style={{ 
                            padding: "0.8rem 1.5rem", 
                            fontSize: "0.8rem", 
                            borderRadius: "1rem", 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "0.6rem",
                            background: act.type === 'budget' ? 'linear-gradient(to right, #3b82f6, #10b981)' : 'var(--primary)',
                            border: "none"
                          }}
                        >
                          {act.label} <ArrowRight size={14} />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "2rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                        
                        {/* 2. SECCIÓN: SEÑALES DE ACTIVIDAD */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem" }}>
                            {[
                                { label: "Visibilidad", value: insight?.activity_signals?.views || "Sincronizando...", icon: Eye, color: "#3b82f6" },
                                { label: "Interés", value: insight?.activity_signals?.interest || "Procesando...", icon: MousePointer2, color: "#10b981" },
                                { label: "Contactos", value: insight?.activity_signals?.leads || "Esperando...", icon: UserCheck, color: "#f59e0b" }
                            ].map((sig, i) => (
                                <div key={i} className="glass" style={{ padding: "1.5rem", borderRadius: "1.8rem", textAlign: "center", border: "1px solid rgba(255,255,255,0.03)" }}>
                                    <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: `${sig.color}15`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
                                        <sig.icon size={20} color={sig.color} />
                                    </div>
                                    <h4 style={{ fontSize: "1.2rem", fontWeight: 950, marginBottom: "0.2rem", letterSpacing: "-0.5px" }}>{sig.value}</h4>
                                    <p style={{ fontSize: "0.65rem", opacity: 0.4, fontWeight: 900, textTransform: "uppercase", letterSpacing: "1px" }}>{sig.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* NUEVA SECCIÓN: CÁLCULO DE RENTABILIDAD (CEREBRO CLAUDIO) */}
                        {insight?.claudio_roi && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="glass" 
                                style={{ 
                                    padding: "2rem", 
                                    borderRadius: "2rem", 
                                    background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, transparent 100%)", 
                                    border: "1px solid rgba(16, 185, 129, 0.2)",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    gap: "2rem"
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                                    <div style={{ padding: "1rem", borderRadius: "1.2rem", background: "rgba(16, 185, 129, 0.2)", color: "#10b981" }}>
                                        <DollarSign size={32} />
                                    </div>
                                    <div>
                                        <span style={{ fontSize: "0.7rem", fontWeight: 900, opacity: 0.5, textTransform: "uppercase", letterSpacing: "1.5px" }}>Rendimiento Estratégico Proyectado</span>
                                        <h3 style={{ fontSize: "1.75rem", fontWeight: 950, color: "#10b981" }}>{insight.claudio_roi.projected_revenue} CLP</h3>
                                        <p style={{ fontSize: "0.85rem", opacity: 0.6, marginTop: "0.3rem" }}>{insight.claudio_roi.adherence_logic}</p>
                                    </div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <div style={{ display: "inline-block", padding: "0.4rem 1rem", borderRadius: "2rem", background: "rgba(16, 185, 129, 0.2)", fontSize: "0.7rem", fontWeight: 900, color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                                        {insight.claudio_roi.status}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* 3. RECOMENDACIÓN PRINCIPAL */}
                        <div className="glass" style={{ padding: "2.5rem", borderRadius: "2rem", border: "1px solid rgba(16, 185, 129, 0.2)", position: "relative", overflow: "hidden", background: "linear-gradient(165deg, rgba(16, 185, 129, 0.05) 0%, transparent 100%)" }}>
                            <div style={{ 
                                position: "absolute", 
                                top: 0, 
                                right: 0, 
                                padding: "0.8rem 1.5rem", 
                                background: insight?.main_recommendation?.priority === 'ALTA' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)', 
                                borderRadius: "0 0 0 1.5rem", 
                                fontSize: "0.65rem", 
                                fontWeight: 900, 
                                color: insight?.main_recommendation?.priority === 'ALTA' ? '#fca5a5' : '#10b981',
                                letterSpacing: '1px'
                            }}>
                                PRIORIDAD {insight?.main_recommendation?.priority || "ALTA"}
                            </div>
                            
                            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                                <div style={{ padding: "0.6rem", borderRadius: "0.8rem", background: "rgba(16, 185, 129, 0.2)", color: "#10b981" }}>
                                    <Zap size={20} />
                                </div>
                                <h3 style={{ fontSize: "1.4rem", fontWeight: 950, letterSpacing: "-0.5px" }}>Acción Estratégica Sugerida</h3>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                <div>
                                    <span style={{ fontSize: "0.7rem", fontWeight: 900, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "1.5px", display: "block", marginBottom: "0.5rem" }}>Lo que Bolton observa:</span>
                                    <p style={{ fontSize: "1.1rem", fontWeight: 500, lineHeight: 1.5, opacity: 0.9 }}>
                                        {insight?.main_recommendation?.interpretation || "Analizando el flujo actual de pacientes..."}
                                    </p>
                                </div>

                                {insight?.main_recommendation?.why_it_matters && (
                                    <div className="glass" style={{ padding: "1.2rem", borderRadius: "1.2rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                        <span style={{ fontSize: "0.65rem", fontWeight: 900, opacity: 0.5, textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "0.5rem" }}>¿Por qué es importante?</span>
                                        <p style={{ fontSize: "0.95rem", opacity: 0.7, lineHeight: 1.5 }}>{insight?.main_recommendation?.why_it_matters}</p>
                                    </div>
                                )}

                                <div>
                                    <span style={{ fontSize: "0.7rem", fontWeight: 900, color: "#10b981", textTransform: "uppercase", letterSpacing: "1.5px", display: "block", marginBottom: "0.5rem" }}>Siguiente Paso:</span>
                                    <p style={{ fontSize: "1rem", opacity: 0.8, marginBottom: "2rem", lineHeight: 1.5 }}>
                                        {insight?.main_recommendation?.action_text || "Mantén el sistema activo mientras calibramos la protección de tu inversión."}
                                    </p>
                                </div>
                            </div>
                            
                            <motion.button 
                                whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(16, 185, 129, 0.4)" }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setActivePilar("desafios")}
                                className="btn-primary" 
                                style={{ padding: "1.2rem 2.5rem", fontSize: "0.85rem", fontWeight: 950, borderRadius: "1.2rem", background: "#10b981", border: "none", width: "100%", cursor: "pointer" }}
                            >
                                {insight?.main_recommendation?.button_label?.toUpperCase() || "CARGANDO MEJORA..."}
                            </motion.button>
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                        
                        {/* 4. ACTIVIDAD DEL SISTEMA (AI TIMELINE) */}
                        <div className="glass" style={{ padding: "2.5rem", borderRadius: "2rem", height: "100%", border: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column" }}>
                            <h3 style={{ fontSize: "1.2rem", fontWeight: 950, marginBottom: "2rem", display: "flex", alignItems: "center", gap: "1rem", letterSpacing: "-0.5px" }}>
                                <History size={22} color="var(--primary)" /> Historial Estratégico
                            </h3>
                            
                            <div style={{ display: "flex", flexDirection: "column", gap: "2rem", position: "relative", flex: 1 }}>
                                {/* Línea vertical decorativa */}
                                <div style={{ position: "absolute", left: "7px", top: "10px", bottom: "10px", width: "2px", background: "linear-gradient(180deg, var(--primary) 0%, rgba(59, 130, 246, 0.1) 100%)", opacity: 0.3 }} />

                                {(insight?.activity_timeline || [
                                    { when: "Hoy", action: "Evaluando el flujo de búsquedas en tu zona..." },
                                    { when: "Ayer", action: "Optimizando la visibilidad para tu especialidad..." },
                                    { when: "Reciente", action: "Asegurando la protección de tu inversión..." }
                                ]).map((item: any, i: number) => (
                                    <motion.div 
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        style={{ display: "flex", gap: "1.5rem", position: "relative", zIndex: 1 }}
                                    >
                                        <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: i === 0 ? "var(--primary)" : "#1e293b", border: "3px solid #0f172a", marginTop: "4px", boxShadow: i === 0 ? "0 0 10px var(--primary)" : "none" }} />
                                        <div>
                                            <span style={{ fontSize: "0.65rem", fontWeight: 950, color: i === 0 ? "var(--primary)" : "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "1.5px" }}>{item.when}</span>
                                            <p style={{ fontSize: "0.9rem", fontWeight: 500, opacity: i === 0 ? 0.9 : 0.6, marginTop: "0.25rem", lineHeight: 1.4 }}>{item.action}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02, color: "var(--primary)" }}
                                whileTap={{ scale: 0.98 }}
                                onClick={fetchRawHistory}
                                disabled={loadingHistory}
                                style={{ 
                                    marginTop: "2rem", 
                                    background: "rgba(255,255,255,0.03)", 
                                    border: "1px solid rgba(255,255,255,0.07)", 
                                    color: "rgba(255,255,255,0.6)", 
                                    padding: "0.8rem 1.2rem", 
                                    borderRadius: "1rem", 
                                    fontSize: "0.75rem", 
                                    fontWeight: 900, 
                                    display: "flex", 
                                    alignItems: "center", 
                                    justifyContent: "center", 
                                    gap: "0.8rem", 
                                    cursor: "pointer",
                                    width: "100%"
                                }}
                            >
                                {loadingHistory ? (
                                    <>Sincronizando... <Loader2 size={14} className="animate-spin" /></>
                                ) : (
                                    <>VER DETALLES DEL HISTORIAL <ArrowRight size={14} /></>
                                )}
                            </motion.button>

                            <div style={{ marginTop: "2rem", padding: "1rem", borderRadius: "1rem", background: "rgba(59, 130, 246, 0.05)", border: "1px solid rgba(59, 130, 246, 0.1)" }}>
                                <p style={{ fontSize: "0.75rem", opacity: 0.5, fontStyle: "italic", textAlign: "center" }}>
                                    Bolton monitorea y ajusta tu sistema de forma autónoma las 24 horas del día.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5. PROGRESO Y EVOLUCIÓN */}
                <div style={{ marginTop: "2rem", display: "grid", gridTemplateColumns: "2.1fr 1fr", gap: "2rem" }}>
                    <div className="glass" style={{ padding: "2.5rem", borderRadius: "2rem", background: "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                            <h3 style={{ fontSize: "1.2rem", fontWeight: 950, letterSpacing: "-0.5px" }}>Evolución de tu Consulta</h3>
                            <div style={{ fontSize: "0.7rem", fontWeight: 950, color: "var(--primary)", background: "rgba(59, 130, 246, 0.1)", padding: "0.4rem 0.8rem", borderRadius: "2rem" }}>
                                NIVEL DE CRECIMIENTO: {insight?.growthScore || "50"}%
                            </div>
                        </div>
                        <div style={{ height: "120px", display: "flex", alignItems: "flex-end", gap: "0.8rem", marginBottom: "2rem" }}>
                            {[40, 60, 45, 80, 55, 90, 100].map((h, i) => (
                                <div key={i} style={{ flex: 1, position: "relative", height: "100%" }}>
                                    <motion.div 
                                        initial={{ height: 0 }}
                                        animate={{ height: `${h}%` }}
                                        transition={{ duration: 1, delay: i * 0.1 }}
                                        style={{ 
                                            position: "absolute",
                                            bottom: 0,
                                            width: "100%",
                                            background: i === 6 ? "var(--primary)" : "rgba(255,255,255,0.03)", 
                                            borderRadius: "0.5rem",
                                            boxShadow: i === 6 ? "0 0 20px rgba(59, 130, 246, 0.3)" : "none"
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", padding: "1.5rem", background: "rgba(255,255,255,0.02)", borderRadius: "1.5rem" }}>
                            <div style={{ padding: "0.8rem", borderRadius: "50%", background: "rgba(59, 130, 246, 0.1)", color: "var(--primary)" }}>
                                <TrendingUp size={24} />
                            </div>
                            <p style={{ fontSize: "1.05rem", fontWeight: 500, lineHeight: 1.5, opacity: 0.9 }}>
                                {insight?.progress_insight || "Tu presencia digital se está fortaleciendo. Cada día llegas a personas más interesadas en tu terapia."}
                            </p>
                        </div>
                    </div>

                    {/* 6. ACCESO A DESAFÍOS */}
                    <div className="glass" style={{ padding: "2rem", borderRadius: "2rem", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", cursor: "pointer", border: "1px dashed rgba(255,255,255,0.1)" }} onClick={() => setActivePilar("desafios")}>
                         <Trophy size={40} color="#f59e0b" style={{ marginBottom: "1rem" }} />
                         <h3 style={{ fontSize: "1.1rem", fontWeight: 900 }}>Potencia tus resultados</h3>
                         <p style={{ fontSize: "0.85rem", opacity: 0.6, marginTop: "0.5rem" }}>Continúa con los pequeños hitos estratégicos para multiplicar el flujo de pacientes.</p>
                         <button className="btn-secondary" style={{ marginTop: "1.5rem", padding: "0.6rem 1.2rem", fontSize: "0.75rem" }}>VER RUTA MAESTRA</button>
                    </div>
                </div>

              </div>
            </motion.div>
          )}

          {activePilar === "asistentes" && (
            <motion.div 
              key="asistentes-pilar" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ maxWidth: "1400px", margin: "0 auto", paddingBottom: "10rem" }}
            >
               <AssistantsView />
            </motion.div>
          )}

          {activePilar === "laboratorio" && (
            <motion.div 
              key="lab-pilar" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '10rem' }}
            >
               <InnovationLab />
            </motion.div>
          )}

          {activePilar === "aprende" && (
            <motion.div 
              key="aprende-pilar" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '10rem' }}
            >
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
          userId={user.id}
          initialData={preLandingData}
          onClose={() => setShowLandingForm(false)}
          onConfirm={handleDeployLanding}
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

      <AnimatePresence>
        {showHistoryModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.95)", backdropFilter: "blur(10px)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "2rem", width: "100%", maxWidth: "800px", maxHeight: "85vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 40px 100px rgba(0,0,0,0.8)" }}
            >
               <div style={{ padding: "2.5rem", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h2 style={{ fontSize: "1.8rem", fontWeight: 950, display: "flex", alignItems: "center", gap: "1rem" }}>
                      <ScrollText size={32} color="var(--primary)" /> Bitácora Técnica Real
                    </h2>
                    <p style={{ opacity: 0.5, fontSize: "0.9rem", marginTop: "0.5rem" }}>Eventos brutos registrados en el servidor de Bolton.</p>
                  </div>
                  <button 
                    onClick={() => setShowHistoryModal(false)}
                    style={{ background: "rgba(255,255,255,0.05)", border: "none", color: "white", padding: "1rem", borderRadius: "1rem", cursor: "pointer" }}
                  >
                    <XIcon size={24} />
                  </button>
               </div>

               <div style={{ flex: 1, overflowY: "auto", padding: "2.5rem" }} className="custom-scrollbar">
                  {rawActivity.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                      {rawActivity.map((log, i) => (
                        <div key={log.id} style={{ display: "flex", gap: "1.5rem", padding: "1.5rem", background: "rgba(255,255,255,0.02)", borderRadius: "1.5rem", border: "1px solid rgba(255,255,255,0.05)" }}>
                           <div style={{ padding: "0.8rem", borderRadius: "1rem", background: "rgba(59, 130, 246, 0.1)", height: "fit-content" }}>
                              <Activity size={20} color="var(--primary)" />
                           </div>
                           <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                                 <span style={{ fontSize: "0.7rem", fontWeight: 900, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "1px" }}>{log.action_type}</span>
                                 <span style={{ fontSize: "0.7rem", opacity: 0.4 }}>{new Date(log.created_at).toLocaleString()}</span>
                              </div>
                              <p style={{ fontSize: "1rem", fontWeight: 500, lineHeight: 1.5, opacity: 0.9 }}>{log.description}</p>
                              {log.meta_data && Object.keys(log.meta_data).length > 0 && (
                                <pre style={{ fontSize: "0.65rem", background: "rgba(0,0,0,0.3)", padding: "1rem", borderRadius: "0.8rem", marginTop: "1rem", opacity: 0.5, overflow: "auto" }}>
                                  {JSON.stringify(log.meta_data, null, 2)}
                                </pre>
                              )}
                           </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "5rem 0", opacity: 0.3 }}>
                       <History size={60} style={{ margin: "0 auto 1.5rem" }} />
                       <p>No hay eventos técnicos registrados aún.</p>
                    </div>
                  )}
               </div>

               <div style={{ padding: "2rem", background: "rgba(0,0,0,0.2)", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "1.5rem" }}>
                  <ChevronDown size={20} className="animate-bounce opacity-30" />
                  <span style={{ fontSize: "0.8rem", opacity: 0.4, fontWeight: 700 }}>FIN DEL HISTORIAL DISPONIBLE</span>
                  <ChevronDown size={20} className="animate-bounce opacity-30" />
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
