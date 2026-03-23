"use client";

import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { LogOut, Radio, BarChart3, Bot, Zap, TrendingUp, MousePointer2, Eye, DollarSign, Target, Loader2, Sparkles, MessageSquare, ArrowRight, ArrowLeft, ShieldCheck, Activity, ThumbsUp, ThumbsDown, Lock, User as UserIcon, Layers, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, MinusCircle, Lightbulb, TrendingDown, Clock, Check, Edit3, MessageCircle, PenTool, Calculator, Calendar, Play, Pause, Filter, Users, Mail, Phone, ExternalLink, UserCheck, BrainCircuit, Star, BarChart, Trophy, Flame, Shield, ShieldAlert, ShieldCheck as ShieldOk, Globe, Layout, Palette, Copy, BookmarkCheck, History, ListRestart, Send, Rocket, LayoutDashboard, Brain, TestTube2, ScrollText, Settings, X as XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import GoogleAdsConnect from "@/components/GoogleAdsConnect";
import CategoryPath from "@/components/CategoryPath";
import MacroPortal from "@/components/MacroPortal";
import CampaignCreationModal from "@/components/CampaignCreationModal";
import LandingFormModal from "@/components/LandingFormModal";

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
          key: 'motor', 
          name: 'Motor', 
          description: 'Vincula tu cuenta de Google Ads para activar el cerebro comercial.', 
          status: (isComp('motor') || !!customerId) ? 'completed' : 'unlocked' as any,
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
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--background)" }}>
        <Loader2 className="animate-spin" size={60} color="var(--primary)" style={{ opacity: 0.2 }} />
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: "2rem", minHeight: "100vh" }}>
      {currentMacro !== "portal" && (
        <header className="glass" style={{ padding: "1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem", borderRadius: "1.2rem", background: "rgba(15, 23, 42, 0.8)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button 
              onClick={() => { setCurrentMacro("portal"); setCurrentInstance(null); }} 
              style={{ background: "var(--primary)", padding: "0.6rem 1.2rem", borderRadius: "0.8rem", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <LayoutDashboard size={20} color="white" />
              <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "white" }}>MENÚ</span>
            </button>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 950, letterSpacing: "-1px" }}>BOLTON / {currentMacro.toUpperCase()} {currentInstance ? `> ${currentInstance.toUpperCase()}` : ''}</h2>
          </div>

          {customerId && currentMacro === 'clientes' && !currentInstance && (
             <motion.button 
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={() => {
                 setCurrentInstance('motor');
                 setCurrentView('overview');
               }}
               className="glass"
               style={{ 
                 background: "linear-gradient(135deg, var(--primary) 0%, #10b981 100%)", 
                 padding: "0.6rem 1.2rem", 
                 borderRadius: "0.8rem", 
                 border: "none", 
                 color: "white", 
                 fontWeight: 900, 
                 fontSize: "0.75rem",
                 cursor: "pointer",
                 boxShadow: "0 10px 20px rgba(59, 130, 246, 0.2)",
                 display: "flex",
                 alignItems: "center",
                 gap: "0.7rem",
                 marginLeft: "1rem"
               }}
             >
               <LayoutDashboard size={16} />
               DASHBOARD IA
             </motion.button>
          )}
          
          {currentInstance && (
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
              <button 
                onClick={() => setCurrentInstance(null)}
                style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", padding: "0.6rem 1rem", borderRadius: "0.8rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", transition: "all 0.3s" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <ArrowLeft size={14} color="var(--muted-foreground)" />
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--muted-foreground)" }}>FLUJO TÉCNICO</span>
              </button>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.2rem", visibility: "hidden" }}>
             <button className="btn-secondary" style={{ padding: "0.6rem 1.2rem", fontSize: "0.8rem", height: "auto", display: "flex", alignItems: "center", gap: "0.5rem" }}>Salir</button>
          </div>
        </header>
      )}

      <main>
        <AnimatePresence mode="wait">
          {currentMacro === "portal" ? (
             <MacroPortal 
               key="portal" 
               activeCategories={activeCategories}
               categoryProgress={calculateCategoryProgress()}
               onEnterCategory={(cat) => {
                 if (activeCategories.includes(cat) || cat === 'clientes') setCurrentMacro(cat as MacroArea);
               }} 
             />
          ) : (
            <motion.div key="macro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {!currentInstance ? (
                <>
                  <CategoryPath 
                    category={currentMacro} 
                    instances={getInstances(currentMacro)} 
                    onActivate={activateInstance}
                    onUnlink={handleUnlink}
                    onEnter={(k) => {
                      if (k === 'motor') handleConnected(customerId!, true);
                      setCurrentInstance(k);
                    }}
                    onGoToDashboard={() => {
                      setCurrentInstance('motor');
                      setCurrentView('overview');
                    }}
                    onDeployLanding={handleDeployLanding}
                    deployingLanding={deployingLanding}
                    landingUrl={landingUrl}
                    customDomain={customDomain}
                    onShowDns={() => setShowDnsModal(true)}
                  />
                </>
              ) : (
                <>
                  {(status === "fetching" || status === "interpreting" || status === "connecting") && (
                    <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", margin: "10vh auto" }}>
                       <Loader2 className="animate-spin" size={100} color="var(--primary)" style={{ opacity: 0.2, margin: "0 auto 2.5rem" }} />
                       <h2 style={{ fontSize: "3rem", fontWeight: 950 }}>Iniciando {currentInstance?.toUpperCase()}</h2>
                    </motion.div>
                  )}
                  
                  {status === "dashboard" && currentInstance === 'motor' && (
                    <motion.div key="dashboard-content" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                       
                       {currentView === "overview" && (
                         <div key="overview">
                             <div className="glass" style={{ padding: "3rem", marginBottom: "3rem", borderLeft: "6px solid var(--primary)", background: "linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, transparent 100%)", position: 'relative' }}>
                               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", color: "var(--primary)" }}><Zap size={22} /><span style={{ fontWeight: 900, fontSize: "0.85rem", letterSpacing: "2px" }}>DIAGNÓSTICO ESTRATÉGICO</span></div>
                                   <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                                       <p style={{ fontSize: "0.65rem", fontWeight: 950, color: "var(--muted-foreground)", background: "rgba(255,255,255,0.03)", padding: "0.4rem 0.8rem", borderRadius: "2rem", border: "1px solid rgba(255,255,255,0.05)", letterSpacing: "0.5px" }}>
                                          IDENTIFICADOR: {campaigns.find(c => c.id.toString() === (campaignId || tempId)?.toString())?.name?.toUpperCase() || "CARGANDO..."}
                                       </p>
                                   </div>
                               </div>
                               <h1 style={{ fontSize: "3.2rem", fontWeight: 950, lineHeight: 1.1, marginBottom: "2.5rem" }}>
                                 {insight?.diagnosis || FALLBACK_INSIGHT.diagnosis}
                               </h1>

                               {/* BLOQUE DE VEREDICTO (SOLO VISIBLE MIENTRAS CARGA O SI NO HAY PLAN) */}
                               <AnimatePresence mode="wait">
                               {!isAiFinal ? (
                                 <motion.div 
                                   key="verdict-loading"
                                   initial={{ opacity: 0, scale: 0.98 }}
                                   animate={{ opacity: 1, scale: 1 }}
                                   exit={{ opacity: 0, scale: 0.95 }}
                                   className="glass" 
                                   style={{ 
                                     padding: "2.5rem", 
                                     background: "rgba(59, 130, 246, 0.05)", 
                                     border: "1px solid rgba(59, 130, 246, 0.2)",
                                     boxShadow: "0 0 40px rgba(59, 130, 246, 0.15)",
                                     marginBottom: "3rem", 
                                     borderRadius: "1.5rem",
                                     position: "relative",
                                     overflow: "hidden"
                                   }}
                                 >
                                    <div style={{ position: "absolute", top: "-50%", left: "-50%", width: "200%", height: "200%", background: "radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
                                    <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start", position: "relative", zIndex: 1 }}>
                                       <div style={{ position: "relative" }}>
                                          <div className="glass" style={{ padding: "0.8rem", borderRadius: "1rem", background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.3)" }}>
                                             <Bot size={32} color="#3b82f6" />
                                          </div>
                                          <motion.div 
                                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            style={{ position: "absolute", top: -4, right: -4, width: 10, height: 10, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 10px #10b981" }} 
                                          />
                                       </div>
                                       <div style={{ flex: 1 }}>
                                          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.8rem" }}>
                                             <p style={{ fontSize: "0.75rem", fontWeight: 950, color: "#3b82f6", letterSpacing: "2px", textTransform: "uppercase" }}>VEREDICTO DE INTELIGENCIA ESTRATÉGICA</p>
                                             <div style={{ height: "1px", flex: 1, background: "linear-gradient(90deg, rgba(59, 130, 246, 0.3), transparent)" }} />
                                          </div>
                                          <p style={{ fontSize: "1.25rem", fontWeight: 800, lineHeight: 1.6, color: "white", letterSpacing: "-0.5px" }}>
                                             {battlePlan || insight?.battlePlan || FALLBACK_INSIGHT.battlePlan}
                                          </p>
                                          {/* TELEMETRÍA DE EMERGENCIA */}
                                          <div style={{ marginTop: "1rem", padding: "0.5rem", background: "rgba(59, 130, 246, 0.05)", borderRadius: "0.5rem", border: "1px solid rgba(59, 130, 246, 0.1)" }}>
                                             <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                <div style={{ width: 6, height: 6, borderRadius: "50%", background: aiError ? "#ef4444" : "#10b981", boxShadow: aiError ? "0 0 5px #ef4444" : "0 0 5px #10b981" }} />
                                                <p style={{ fontSize: "0.6rem", color: aiError ? "#f87171" : "rgba(255,255,255,0.4)", fontWeight: 950, letterSpacing: "0.5px" }}>
                                                   DEBUG: {aiError || "Conexión Estable"} | Status: {aiLoadingStatus}
                                                </p>
                                             </div>
                                          </div>
                                       </div>
                                    </div>
                                 </motion.div>
                               ) : (
                                 /* NUEVA FILA DE 5 RECUADROS ESTRATÉGICOS (HORIZONTAL GRID) */
                                 <motion.div 
                                    key="strategic-grid"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1rem", marginBottom: "3rem" }}
                                 >
                                    {[
                                      { 
                                        label: "Estado", 
                                        value: (() => {
                                          const camp = campaigns.find(c => c.id.toString() === (campaignId || tempId)?.toString());
                                          if (!camp) return '...';
                                          // Detección Multi-Formato (Google Ads ENUMs: 2 = ENABLED, 3 = PAUSED)
                                          const status = String(camp.status).toUpperCase();
                                          return (status === 'ENABLED' || status === '2') ? 'ACTIVA' : 'PAUSADA';
                                        })(),
                                        color: (() => {
                                          const camp = campaigns.find(c => c.id.toString() === (campaignId || tempId)?.toString());
                                          if (!camp) return 'var(--muted)';
                                          const status = String(camp.status).toUpperCase();
                                          return (status === 'ENABLED' || status === '2') ? '#10b981' : '#f59e0b';
                                        })()
                                      },
                                      { label: "Canal", value: "Google Ads", color: "#3b82f6" },
                                      { label: "Inteligencia", value: "Bolton v1.2", color: "var(--accent)" },
                                      { label: "Seguridad", value: "Blindado", color: "#10b981" },
                                      { label: "Siguiente", value: "Optimizar", color: "white" }
                                    ].map((box, i) => (
                                      <div key={i} className="glass" style={{ padding: "1.5rem", textAlign: "center", borderTop: `3px solid ${box.color}`, background: "rgba(255,255,255,0.02)" }}>
                                        <p style={{ fontSize: "0.6rem", color: "var(--muted)", fontWeight: 950, textTransform: "uppercase", marginBottom: "0.5rem", letterSpacing: "1px" }}>{box.label}</p>
                                        <p style={{ fontSize: "1.1rem", fontWeight: 950, color: box.color }}>{box.value}</p>
                                      </div>
                                    ))}
                                 </motion.div>
                               )}
                               </AnimatePresence>

                               <div className="glass" style={{ display: "inline-flex", padding: "1rem 2rem", background: "rgba(255,255,255,0.02)", alignItems: "center", gap: "1rem" }}>
                                  <Rocket size={24} color="var(--primary)" />
                                  <div>
                                     <p style={{ fontSize: "0.7rem", color: "var(--muted)" }}>PRÓXIMA MISIÓN</p>
                                     <p style={{ fontWeight: 800, fontSize: "1.2rem" }}>{insight?.nextAction || FALLBACK_INSIGHT.nextAction}</p>
                                  </div>
                               </div>
                              </div>
                            
                             {showScaling && (
                               <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="glass" style={{ padding: "2.5rem", marginBottom: "3rem", background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.1)", overflow: 'hidden' }}>
                                 <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
                                    <div style={{ padding: "0.5rem", borderRadius: "50%", background: "rgba(16, 185, 129, 0.1)" }}><Trophy color="#10b981" /></div>
                                    <h3 style={{ fontSize: "1.5rem", fontWeight: 950 }}>Senda 2: Desafíos de Escalamiento</h3>
                                 </div>
                                 <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
                                    {[
                                      { label: "Primeros 10 Leads", progress: leads.length, target: 10, icon: Users },
                                      { label: "Optimización de ROAS", progress: 4.2, target: 5.0, icon: Zap },
                                      { label: "Dominio del Mercado", progress: 65, target: 100, icon: Rocket },
                                    ].map((task, i) => (
                                      <div key={i} className="glass" style={{ padding: "1.5rem", background: "rgba(255,255,255,0.02)" }}>
                                         <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                                            <task.icon size={18} color="#10b981" />
                                            <span style={{ fontSize: "0.7rem", fontWeight: 900 }}>{Math.round((task.progress/task.target)*100)}%</span>
                                         </div>
                                         <p style={{ fontSize: "0.85rem", fontWeight: 800, marginBottom: "0.5rem" }}>{task.label}</p>
                                         <div style={{ height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}>
                                            <div style={{ width: `${(task.progress/task.target)*100}%`, height: "100%", background: "#10b981" }} />
                                         </div>
                                      </div>
                                    ))}
                                 </div>
                               </motion.div>
                             )}

                             <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", marginBottom: "4rem" }}>
                                 {(recommendations.length > 0 || !insight) && recommendations.slice(0, 3).map((rec, i) => (
                                   <div key={i} className="glass" style={{ padding: "2rem", borderTop: `4px solid ${rec.type === 'AHORRO' ? '#ef4444' : rec.type === 'CRECIMIENTO' ? '#3b82f6' : '#10b981'}` }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                         <span style={{ fontSize: '0.65rem', fontWeight: 900, padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>{rec.type}</span>
                                         {rec.type === 'AHORRO' ? <Activity size={16} color="#ef4444" /> : rec.type === 'CRECIMIENTO' ? <Zap size={16} color="#3b82f6" /> : <ShieldCheck size={16} color="#10b981" />}
                                      </div>
                                      <h4 style={{ fontWeight: 900, fontSize: '1.2rem', marginBottom: '0.75rem' }}>{rec.title}</h4>
                                      <p style={{ fontSize: '0.85rem', opacity: 0.6 }}>{rec.description}</p>
                                   </div>
                                 ))}
                             </div>

                             <div style={{ display: "grid", gridTemplateColumns: "1fr 0.45fr", gap: "2.5rem" }}>
                                <div className="glass" style={{ padding: "2.5rem" }}>
                                   <h3 style={{ fontSize: "1.5rem", fontWeight: 950, marginBottom: "2.5rem" }}>Mapa de Adquisición</h3>
                                   <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                      {funnel.length > 0 ? funnel.map((step) => (
                                         <div key={step.id}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}><span>{step.label}</span><b>{step.value.toLocaleString()}</b></div>
                                            <div style={{ height: "45px", background: "rgba(255,255,255,0.02)", borderRadius: "0.6rem", overflow: "hidden" }}>
                                               <motion.div initial={{ width: 0 }} animate={{ width: `${step.percentage}%` }} style={{ height: "100%", background: step.color, opacity: 0.8 }} />
                                            </div>
                                         </div>
                                      )) : <div style={{ opacity: 0.3, textAlign: "center", padding: "2rem" }}>Cargando datos...</div>}
                                   </div>
                                </div>
                                <div className="glass" style={{ padding: "2.5rem", background: "linear-gradient(rgba(59, 130, 246, 0.1), transparent)", textAlign: "center" }}>
                                   <p style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: 800 }}>EFICACIA TOTAL</p>
                                   <span style={{ fontSize: "6rem", fontWeight: 950, color: "var(--primary)" }}>{insight?.growthScore || 0}</span>
                                   <p style={{ fontSize: "0.85rem", color: "#10b981", fontWeight: 800 }}>{insight?.statusLabel || "ESTABLE"}</p>
                                </div>
                             </div>
                         </div>
                       )}

                       {currentView === "crm" && (
                         <div key="crm" className="glass" style={{ padding: "3rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "3rem" }}><Users size={32} color="var(--primary)" /><h3 style={{ fontSize: "2rem", fontWeight: 950 }}>Radar de Prioridad</h3></div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "1.5rem" }}>
                               {leads.map(lead => (
                                 <div key={lead.id} className="glass" style={{ padding: "2rem", borderTop: `4px solid ${lead.score >= 70 ? '#10b981' : '#3b82f6'}` }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                                       <span style={{ fontSize: "0.7rem", fontWeight: 950, padding: "0.2rem 0.6rem", background: "rgba(255,255,255,0.05)", borderRadius: "10px" }}>{lead.trait?.toUpperCase() || "NUEVO"}</span>
                                       <span style={{ fontWeight: 950, fontSize: "1.1rem" }}>{lead.score || 0}/100</span>
                                    </div>
                                    <h4 style={{ fontSize: "1.4rem", fontWeight: 950, marginBottom: "0.5rem" }}>{lead.name}</h4>
                                    <p style={{ opacity: 0.6 }}>{lead.email}</p>
                                 </div>
                               ))}
                            </div>
                         </div>
                       )}

                       {currentView === "creative" && (
                         <div key="creative" className="glass" style={{ padding: "3rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "4rem" }}><Brain size={40} color="var(--primary)" /><h3 style={{ fontSize: "2.2rem", fontWeight: 950 }}>Laboratorio Creativo</h3></div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                               {variants.map((v, i) => (
                                 <div key={i} className="glass" style={{ padding: "2rem" }}>
                                    <span style={{ fontSize: "0.75rem", fontWeight: 950, color: "var(--primary)" }}>{v.angle.toUpperCase()}</span>
                                    <h4 style={{ fontSize: "1.4rem", fontWeight: 950, margin: "1.5rem 0" }}>{v.headline}</h4>
                                    <p style={{ lineHeight: 1.6, opacity: 0.7 }}>{v.description}</p>
                                 </div>
                               ))}
                            </div>
                         </div>
                       )}

                       {currentView === "history" && (
                         <div key="history" className="glass" style={{ padding: "3rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "4rem" }}><History size={32} color="var(--primary)" /><h3 style={{ fontSize: "2rem", fontWeight: 950 }}>Bitácora</h3></div>
                            {history.map(event => (
                              <div key={event.id} className="glass" style={{ padding: "2rem", marginBottom: "1.5rem", borderLeft: "4px solid var(--primary)" }}>
                                 <h4 style={{ fontSize: "1.3rem", fontWeight: 950 }}>{event.action_title}</h4>
                                 <p style={{ opacity: 0.7 }}>{event.impact_summary}</p>
                              </div>
                            ))}
                         </div>
                       )}
                    </motion.div>
                  )}
                </>
              )}
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
          onConfirm={(data) => handleDeployLanding(data)}
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
    </div>
  );
}
