'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
    DollarSign, 
    Target,
    MessageSquare,
    ChevronRight,
    ArrowLeft,
    Layers,
    Type,
    Tag,
    Clock,
    CheckCircle2,
    Pause,
    Play,
    TrendingUp,
    Sparkles,
    Info,
    AlertTriangle,
    Link as LinkIcon,
    LogIn
} from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';

type ViewLevel = 'campaigns' | 'adgroups' | 'details';
type PeriodScope = 'TODAY' | 'LAST_7_DAYS' | 'LAST_30_DAYS';

export default function GoogleAdsInteligentePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [viewLevel, setViewLevel] = useState<ViewLevel>('campaigns');
    const [period, setPeriod] = useState<PeriodScope>('LAST_30_DAYS');
    const [subscriptionStatus, setSubscriptionStatus] = useState<'ACTIVE' | 'GRACE' | 'EXPIRED' | 'NONE'>('NONE');
    
    // Jerarquía de selección
    const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
    const [selectedAdGroupId, setSelectedAdGroupId] = useState<string | null>(null);

    // Datos
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [adGroups, setAdGroups] = useState<any[]>([]);
    const [ads, setAds] = useState<any[]>([]);
    const [keywords, setKeywords] = useState<any[]>([]);

    useEffect(() => {
        const loadInitialData = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
                // Verificar Perfil y Google Ads ID
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('google_ads_id')
                    .eq('id', authUser.id)
                    .single();

                if (!profile?.google_ads_id) {
                    router.push('/onboarding');
                    return;
                }

                // Verificar Conexión de Ads
                const { data } = await supabase
                    .from('ads_campaigns')
                    .select('*')
                    .eq('user_id', authUser.id)
                    .limit(1);
                
                if (data && data.length > 0) {
                    setIsConnected(true);
                    fetchCampaigns(authUser.id, period);
                }
            }
            setIsLoading(false);
        };
        loadInitialData();
    }, [period]);

    const fetchCampaigns = async (userId: string, p: PeriodScope) => {
        const { data } = await supabase
            .from('ads_campaigns')
            .select('*')
            .eq('user_id', userId)
            .eq('period', p)
            .order('cost', { ascending: false });
        if (data) setCampaigns(data);
    };

    const fetchAdGroups = async (campaignId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
            .from('ads_ad_groups')
            .select('*')
            .eq('user_id', user.id)
            .eq('campaign_id', campaignId)
            .eq('period', period);
        if (data) setAdGroups(data);
    };

    const fetchDetails = async (adGroupId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const [adsRes, kwRes] = await Promise.all([
            supabase.from('ads_items').select('*').eq('user_id', user.id).eq('ad_group_id', adGroupId).eq('period', period),
            supabase.from('ads_keywords').select('*').eq('user_id', user.id).eq('ad_group_id', adGroupId).eq('period', period)
        ]);
        
        if (adsRes.data) setAds(adsRes.data);
        if (kwRes.data) setKeywords(kwRes.data);
    };

    const generateSugerencias = () => {
        const totalClicks = campaigns.reduce((acc, c) => acc + (c.clicks || 0), 0);
        const totalCosto = campaigns.reduce((acc, c) => acc + (c.cost || 0), 0);
        const impressions = campaigns.reduce((acc, c) => acc + (c.impressions || 0), 1);
        const avgCtr = (totalClicks / impressions) * 100;

        const sugs = [];

        if (avgCtr < 5) {
            sugs.push({
                id: 'optimizar_anuncios',
                title: 'Optimizar Títulos de Anuncios',
                reason: `Tu CTR actual es de ${avgCtr.toFixed(2)}%. Claudio sugiere que tus anuncios no son lo suficientemente "magnéticos" para el buscador.`,
                impact: 'ALTO',
                action: 'SUGGEST_TITLES'
            });
        }

        if (totalCosto > 0 && campaigns.reduce((acc, c) => acc + (c.conversions || 0), 0) === 0) {
            sugs.push({
                id: 'pausar_no_convierten',
                title: 'Pausar Campañas Ineficientes',
                reason: 'Has gastado dinero sin generar conversiones reales. Claudio recomienda pausar temporalmente para revisar la landing page.',
                impact: 'CRÍTICO',
                action: 'PAUSE_CAMPAIGN'
            });
        }

        sugs.push({
            id: 'limpiar_negativas',
            title: 'Limpiar Palabras Negativas',
            reason: 'Se detectó tráfico irrelevante. Claudio sugiere filtrar términos de búsqueda para no desperdiciar presupuesto.',
            impact: 'MEDIO',
            action: 'ADD_NEGATIVE_KEYWORDS'
        });

        return sugs.slice(0, 3);
    };

    const handleAcceptSuggestion = async (suggestion: any) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('ads_actions_queue').insert({
                user_id: user.id,
                action_type: suggestion.action,
                target_id: selectedCampaignId || 'ALL',
                status: 'PENDING',
                metadata: { suggestion_id: suggestion.id }
            });
        }
    };

    const handleCampaignClick = (c: any) => {
        setSelectedCampaignId(c.google_id);
        fetchAdGroups(c.google_id);
        setViewLevel('adgroups');
    };

    const handleAdGroupClick = (g: any) => {
        setSelectedAdGroupId(g.google_id);
        fetchDetails(g.google_id);
        setViewLevel('details');
    };

    const goBack = () => {
        if (viewLevel === 'details') {
            setViewLevel('adgroups');
            setSelectedAdGroupId(null);
        } else if (viewLevel === 'adgroups') {
            setViewLevel('campaigns');
            setSelectedCampaignId(null);
        }
    };

    return (
        <AuthGuard landing={<ToolLanding />} category="SEM">
            {(user, subscriptionStatus) => {
                if (subscriptionStatus === 'EXPIRED') {
                    return (
                        <main className="min-h-screen">
                            <Navbar />
                            <div className="container" style={{ paddingTop: 'calc(var(--header-height) + 5rem)' }}>
                                <div className="glass" style={{ padding: '4rem', borderRadius: '32px', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
                                    <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(244, 63, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                                        <DollarSign size={40} color="#f43f5e" />
                                    </div>
                                    <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Suscripción SEM Requerida</h2>
                                    <p style={{ color: 'var(--fg-muted)', marginBottom: '2.5rem', fontSize: '1.1rem' }}>
                                        Esta herramienta es parte del plan premium **Bolton SEM**. Tu acceso ha expirado o aún no has realizado tu primer pago.
                                    </p>
                                    <button 
                                        onClick={() => router.push('/onboarding')}
                                        className="btn-primary" 
                                        style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
                                    >
                                        Ver Planes de Suscripción
                                    </button>
                                </div>
                            </div>
                        </main>
                    );
                }

                return (
                    <main className="min-h-screen">
                        <Navbar />
                        
                        {subscriptionStatus === 'GRACE' && (
                            <div style={{ 
                                background: 'linear-gradient(90deg, #f59e0b, #d97706)', 
                                color: 'white', 
                                padding: '0.75rem', 
                                textAlign: 'center', 
                                fontSize: '0.9rem', 
                                fontWeight: 600,
                                position: 'fixed',
                                top: 'var(--header-height)',
                                left: 0,
                                right: 0,
                                zIndex: 100
                            }}>
                                ⚠️ Tienes un pago pendiente. Tu acceso de cortesía termina en pocos días. ¡Ponte al día para no perder tus métricas!
                            </div>
                        )}
                        
                        <div className="container" style={{ paddingTop: 'calc(var(--header-height) + 3rem)', paddingBottom: '5rem' }}>
                            <header style={{ marginBottom: '3rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                    <div style={{ 
                                        width: '40px', 
                                        height: '40px', 
                                        borderRadius: '12px', 
                                        background: 'linear-gradient(135deg, #4285F4, #FBBC05)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Target size={24} color="white" />
                                    </div>
                                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>
                                        Google Ads <span className="text-gradient">Inteligente</span>
                                    </h1>
                                </div>
                            </header>

                            {!isConnected ? (
                                <ConnectionGuide UID={user?.id || ''} />
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                                    {/* Area de Trabajo Principal */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                        
                                        {/* Toolbar: Navegación y Período */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                {(viewLevel as string) !== 'campaigns' && (
                                                    <button onClick={goBack} className="glass" style={{ padding: '0.6rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', cursor: 'pointer', color: 'white' }}>
                                                        <ArrowLeft size={18} /> Volver
                                                    </button>
                                                )}
                                                <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                                                    {(viewLevel as string) === 'campaigns' && 'Mis Campañas'}
                                                    {(viewLevel as string) === 'adgroups' && 'Grupos de Anuncios'}
                                                    {(viewLevel as string) === 'details' && 'Anuncios y Keywords'}
                                                </h2>
                                            </div>

                                            <div className="glass" style={{ padding: '0.4rem', borderRadius: '12px', display: 'flex', gap: '0.4rem' }}>
                                                <PeriodBtn active={period === 'TODAY'} onClick={() => setPeriod('TODAY')} label="Hoy" />
                                                <PeriodBtn active={period === 'LAST_7_DAYS'} onClick={() => setPeriod('LAST_7_DAYS')} label="7d" />
                                                <PeriodBtn active={period === 'LAST_30_DAYS'} onClick={() => setPeriod('LAST_30_DAYS')} label="30d" />
                                            </div>
                                        </div>

                                        {/* Grid de Métricas con Info IA */}
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                                            <MetricCard 
                                                title="Inversión" 
                                                value={`$${campaigns.reduce((acc, c) => acc + (c.cost || 0), 0).toFixed(0)}`} 
                                                icon={<DollarSign size={18} />} 
                                                info="Es el capital total que Google ha consumido. Claudio dice: 'No es un gasto, es el motor de búsqueda de tus clientes'."
                                            />
                                            <MetricCard 
                                                title="Conversiones" 
                                                value={campaigns.reduce((acc, c) => acc + (c.conversions || 0), 0).toString()} 
                                                icon={<CheckCircle2 size={18} />} 
                                                color="#10b981" 
                                                info="Ventas o leads reales. Si esto está bajo, revisa urgente tu Bolton Page."
                                            />
                                            <MetricCard 
                                                title="CTR Prom." 
                                                value={`${((campaigns.reduce((acc, c) => acc + (c.clicks || 0), 0) / (campaigns.reduce((acc, c) => acc + (c.impressions || 0), 1)) || 0) * 100).toFixed(2)}%`} 
                                                icon={<TrendingUp size={18} />} 
                                                color="#f59e0b" 
                                                info="Click Through Rate. Indica qué tan atractivo es tu anuncio. Menos de 1% es señal de alerta."
                                            />
                                        </div>

                                        {/* Panel de Optimización IA */}
                                        <div className="glass" style={{ borderRadius: '28px', padding: '2rem', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                                                <Sparkles size={24} className="text-gradient" />
                                                <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Sugerencias de Optimización</h3>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                                {generateSugerencias().map((s, i) => (
                                                    <SuggestionAction 
                                                        key={i}
                                                        title={s.title}
                                                        reason={s.reason}
                                                        impact={s.impact}
                                                        onAccept={() => handleAcceptSuggestion(s)}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        {/* Contenido Dinámico (Tablas) */}
                                        {(viewLevel as string) === 'campaigns' && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {campaigns.map(c => (
                                                    <RowItem 
                                                        key={c.google_id}
                                                        title={c.name}
                                                        sub={`ID: ${c.google_id}`}
                                                        status={c.status}
                                                        metrics={c}
                                                        onClick={() => handleCampaignClick(c)}
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        {(viewLevel as string) === 'adgroups' && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {adGroups.map(g => (
                                                    <RowItem 
                                                        key={g.google_id}
                                                        title={g.name}
                                                        sub={`Grupo de Anuncios`}
                                                        status={g.status}
                                                        metrics={g}
                                                        onClick={() => handleAdGroupClick(g)}
                                                        isAdGroup
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        {(viewLevel as string) === 'details' && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                                                {/* Sub-nivel: Anuncios */}
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                                        <Layers size={20} className="text-gradient" />
                                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Anuncios (/Ads)</h3>
                                                    </div>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                                        {ads.map(ad => (
                                                            <AdCard key={ad.google_id} ad={ad} />
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Sub-nivel: Keywords */}
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                                        <Tag size={20} className="text-gradient" />
                                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Palabras Clave (/Keywords)</h3>
                                                    </div>
                                                    <div className="glass" style={{ borderRadius: '20px', overflow: 'hidden' }}>
                                                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                                            <thead>
                                                                <tr style={{ background: 'rgba(255,255,255,0.03)', fontSize: '0.85rem', color: 'var(--fg-muted)' }}>
                                                                    <th style={{ padding: '1rem' }}>Keyword</th>
                                                                    <th style={{ padding: '1rem' }}>Concordancia</th>
                                                                    <th style={{ padding: '1rem' }}>Clics</th>
                                                                    <th style={{ padding: '1rem' }}>Conv.</th>
                                                                    <th style={{ padding: '1rem' }}>Costo</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {keywords.map(kw => (
                                                                    <tr key={kw.google_id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem' }}>
                                                                        <td style={{ padding: '1rem', fontWeight: 600 }}>{kw.text}</td>
                                                                        <td style={{ padding: '1rem' }}><span style={{ opacity: 0.6 }}>{kw.match_type}</span></td>
                                                                        <td style={{ padding: '1rem' }}>{kw.clicks}</td>
                                                                        <td style={{ padding: '1rem' }}>{kw.conversions}</td>
                                                                        <td style={{ padding: '1rem' }}>${kw.cost.toFixed(2)}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Asistente - Siempre presente */}
                                    <div className="glass" style={{ borderRadius: '28px', display: 'flex', flexDirection: 'column', height: 'fit-content', position: 'sticky', top: 'calc(var(--header-height) + 2rem)' }}>
                                        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                <MessageSquare size={18} className="text-gradient" />
                                                <h4 style={{ fontWeight: 700, fontSize: '1.1rem' }}>Análisis IA</h4>
                                            </div>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--fg-muted)' }}>Estrategia personalizada de Claudio</p>
                                        </div>
                                        <div style={{ padding: '1.5rem', minHeight: '300px' }}>
                                            <div style={{ background: 'rgba(99, 102, 241, 0.05)', padding: '1.25rem', borderRadius: '16px', borderLeft: '3px solid var(--accent-primary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                                                {(viewLevel as string) === 'campaigns' && "Estoy analizando tus campañas globales. Detecto que la inversión total es de saludale, pero podemos optimizar el CTR."}
                                                {(viewLevel as string) === 'adgroups' && "En este nivel podemos ver qué segmentos de público están funcionando mejor."}
                                                {(viewLevel as string) === 'details' && "Revisa las keywords en rojo. Son palabras que gastan pero no venden."}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </main>
                );
            }}
        </AuthGuard>
    );
}

// COMPONENTES AUXILIARES

function MetricCard({ title, value, icon, color = "var(--accent-primary)", info }: any) {
    const [showInfo, setShowInfo] = useState(false);
    return (
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {icon}
                </div>
                <button 
                    onMouseEnter={() => setShowInfo(true)}
                    onMouseLeave={() => setShowInfo(false)}
                    style={{ background: 'none', border: 'none', color: 'var(--fg-muted)', cursor: 'help' }}
                >
                    <Info size={16} />
                </button>
            </div>
            {showInfo && info && (
                <div className="animate-in fade-in zoom-in duration-200" style={{ 
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, 
                    background: '#1a1a1a', padding: '1rem', borderRadius: '12px', 
                    fontSize: '0.8rem', border: '1px solid var(--accent-primary)', marginTop: '0.5rem',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                }}>
                    {info}
                </div>
            )}
            <div style={{ fontSize: '0.85rem', color: 'var(--fg-muted)', marginBottom: '0.25rem' }}>{title}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{value}</div>
        </div>
    );
}

function SuggestionAction({ title, reason, impact, onAccept }: any) {
    const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'DONE'>('IDLE');

    const handleClick = async () => {
        setStatus('LOADING');
        await onAccept();
        setStatus('DONE');
    };

    return (
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {title}
                    <span style={{ fontSize: '0.65rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.1rem 0.5rem', borderRadius: '50px' }}>{impact}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--fg-muted)' }}>{reason}</p>
            </div>
            <button 
                onClick={handleClick}
                disabled={status !== 'IDLE'}
                className="btn-primary" 
                style={{ 
                    padding: '0.6rem 1.5rem', fontSize: '0.85rem', 
                    background: status === 'DONE' ? '#10b981' : 'var(--accent-primary)',
                    border: 'none', minWidth: '120px'
                }}
            >
                {status === 'IDLE' && 'Aceptar'}
                {status === 'LOADING' && 'Procesando...'}
                {status === 'DONE' && '¡Encolado!'}
            </button>
        </div>
    );
}

function PeriodBtn({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
    return (
        <button 
            onClick={onClick}
            style={{
                padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700,
                background: active ? 'var(--accent-primary)' : 'transparent',
                color: active ? 'white' : 'var(--fg-muted)', border: 'none', cursor: 'pointer'
            }}>
            {label}
        </button>
    );
}

function RowItem({ title, sub, status, metrics, onClick, isAdGroup = false }: any) {
    return (
        <div onClick={onClick} className="glass" style={{ 
            padding: '1.25rem 2rem', borderRadius: '20px', display: 'grid', 
            gridTemplateColumns: '1fr repeat(4, 100px) 40px', alignItems: 'center',
            cursor: 'pointer', transition: 'var(--transition-smooth)', border: '1px solid rgba(255,255,255,0.05)'
        }}>
            <div>
                <h4 style={{ fontWeight: 700, marginBottom: '0.2rem' }}>{title}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--fg-muted)' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: status === 'ENABLED' ? '#10b981' : '#f43f5e' }}></div>
                    {sub}
                </div>
            </div>
            <MetricSmall label="Clics" value={metrics.clicks} />
            <MetricSmall label="Conv." value={metrics.conversions} />
            <MetricSmall label="Costo" value={`$${metrics.cost.toFixed(0)}`} />
            <MetricSmall label="CTR" value={`${(metrics.ctr * 100).toFixed(1)}%`} hide={isAdGroup} />
            <ChevronRight size={20} style={{ opacity: 0.3 }} />
        </div>
    );
}

function MetricSmall({ label, value, hide = false }: any) {
    if (hide) return <div></div>;
    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--fg-muted)', marginBottom: '0.2rem' }}>{label}</div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{value}</div>
        </div>
    );
}

function AdCard({ ad }: any) {
    return (
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '50px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', fontWeight: 700 }}>ANUNCIO</span>
            </div>
            {ad.headlines && ad.headlines.slice(0, 3).map((h: string, i: number) => (
                <div key={i} style={{ color: '#4285F4', fontWeight: 600, fontSize: '1rem', marginBottom: '0.2rem' }}>{h}</div>
            ))}
            <p style={{ fontSize: '0.85rem', color: 'var(--fg-muted)', marginTop: '0.8rem', lineHeight: 1.5 }}>
                {ad.descriptions && ad.descriptions[0]}
            </p>
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ opacity: 0.5 }}>{ad.clicks} clics</span>
                <span style={{ color: '#10b981', fontWeight: 600 }}>{ad.conversions} conv.</span>
            </div>
        </div>
    );
}

function ToolLanding() {
    const router = useRouter();
    return (
        <div className="container" style={{ paddingTop: 'calc(var(--header-height) + 5rem)', paddingBottom: '8rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
                <div className="animate-in slide-in-from-left duration-700">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-white/10 text-xs font-bold tracking-widest uppercase text-indigo-400 mb-6">
                        <Sparkles size={14} />
                        Inteligencia Artificial Bolton
                    </div>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.1 }}>
                        Optimización de <br />
                        <span className="text-gradient">Google Ads</span> Pro.
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: 'var(--fg-muted)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
                        Utiliza los lineamientos estratégicos de Claudio y el poder de la IA para auditar, optimizar y escalar tus campañas en tiempo real. 
                    </p>
                    
                    <ul style={{ listStyle: 'none', padding: 0, marginBottom: '3rem' }}>
                        {[
                            'Auditoría de CTR y conversiones instantánea.',
                            'Sugerencias tácticas basadas en datos reales.',
                            'Cola de acciones automatizada para el Script.',
                            'Análisis profundo de Keywords y Anuncios.'
                        ].map((item, id) => (
                            <li key={id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'rgba(255,255,255,0.8)' }}>
                                <CheckCircle2 size={20} color="#10b981" />
                                {item}
                            </li>
                        ))}
                    </ul>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button 
                            onClick={() => router.push('/login')}
                            className="btn-primary" 
                            style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                        >
                            <LogIn size={20} /> Iniciar Sesión ahora
                        </button>
                        <button 
                            onClick={() => router.push('/register')}
                            className="glass" 
                            style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer' }}
                        >
                            Crear cuenta gratis
                        </button>
                    </div>
                </div>

                <div className="animate-in slide-in-from-right duration-700 relative">
                    <div className="glass" style={{ padding: '2rem', borderRadius: '32px', border: '1px solid rgba(99, 102, 241, 0.2)', boxShadow: '0 30px 60px -12px rgba(99, 102, 241, 0.3)' }}>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56' }}></div>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }}></div>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f' }}></div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ height: '20px', width: '60%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '1rem' }}></div>
                            <div style={{ height: '100px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '12px', marginBottom: '1.5rem', borderLeft: '3px solid var(--accent-primary)' }}></div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                <div style={{ height: '60px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}></div>
                                <div style={{ height: '60px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}></div>
                                <div style={{ height: '60px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}></div>
                            </div>
                        </div>
                    </div>
                    {/* Floating Glow */}
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '300px', height: '300px', background: 'var(--accent-primary)', filter: 'blur(100px)', opacity: 0.1, zIndex: -1 }}></div>
                </div>
            </div>
        </div>
    );
}

function ConnectionGuide({ UID }: { UID: string }) {
    return (
        <div className="glass animate-in fade-in zoom-in duration-500" style={{ padding: '4rem', borderRadius: '32px', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                <LinkIcon size={40} className="text-gradient" />
            </div>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Pendiente de sincronización</h2>
            <p style={{ color: 'var(--fg-muted)', marginBottom: '2.5rem', fontSize: '1.1rem' }}>
                Aún no estamos recibiendo datos para tu cuenta. Por favor, asegúrate de haber configurado el **Google Ads Script** avanzado correctamente con tu User ID (UID):
            </p>
            <div style={{ position: 'relative', marginBottom: '2rem' }}>
                <code style={{ display: 'block', background: '#000', padding: '1.25rem', borderRadius: '16px', fontSize: '1.1rem', color: 'var(--accent-primary)', border: '1px solid rgba(99, 102, 241, 0.3)', wordBreak: 'break-all' }}>
                    {UID}
                </code>
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--fg-muted)', lineHeight: 1.6 }}>
                Una vez que el script se ejecute por primera vez en tu cuenta de Google Ads, <br />
                <strong>tus métricas aparecerán aquí automáticamente.</strong>
            </p>
        </div>
    );
}
