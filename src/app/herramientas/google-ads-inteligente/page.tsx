'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { 
    LayoutDashboard, 
    Link as LinkIcon, 
    TrendingUp, 
    MousePointer2, 
    Eye, 
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
    Play
} from 'lucide-react';

type ViewLevel = 'campaigns' | 'adgroups' | 'details';
type PeriodScope = 'TODAY' | 'LAST_7_DAYS' | 'LAST_30_DAYS';

export default function GoogleAdsInteligentePage() {
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
        const checkInitialState = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // 1. Verificar Suscripción
                const { data: subData } = await supabase
                    .from('v_active_subscriptions')
                    .select('current_access_status')
                    .eq('user_id', user.id)
                    .eq('category', 'SEM')
                    .single();
                
                const status = subData?.current_access_status || 'EXPIRED';
                setSubscriptionStatus(status);

                if (status === 'EXPIRED') {
                    setIsLoading(false);
                    return;
                }

                // 2. Verificar Conexión de Ads
                const { data } = await supabase
                    .from('ads_campaigns')
                    .select('*')
                    .eq('user_id', user.id)
                    .limit(1);
                
                if (data && data.length > 0) {
                    setIsConnected(true);
                    fetchCampaigns(user.id, period);
                }
            }
            setIsLoading(false);
        };
        checkInitialState();
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (subscriptionStatus === 'EXPIRED') {
        return (
            <main className="min-h-screen">
                <Navbar />
                <div className="container" style={{ paddingTop: 'calc(var(--header-height) + 5rem)' }}>
                    <div className="glass" style={{ padding: '4rem', borderRadius: '32px', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(244, 63, 94, 0.1)', display: 'flex', alignItems: 'center', justifyCenter: 'center', margin: '0 auto 2rem' }}>
                            <DollarSign size={40} color="#f43f5e" />
                        </div>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Suscripción SEM Requerida</h2>
                        <p style={{ color: 'var(--fg-muted)', marginBottom: '2.5rem', fontSize: '1.1rem' }}>
                            Esta herramienta es parte del plan premium **Bolton SEM**. Tu acceso ha expirado o aún no has realizado tu primer pago.
                        </p>
                        <button className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                            Pagar con MercadoPago (Chile)
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
                    <ConnectionGuide UID="f786601a-5af0-4d29-84b6-7c6ba83d9e87" />
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                        {/* Area de Trabajo Principal */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            
                            {/* Toolbar: Navegación y Período */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    {viewLevel !== 'campaigns' && (
                                        <button onClick={goBack} className="glass" style={{ padding: '0.6rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', cursor: 'pointer', color: 'white' }}>
                                            <ArrowLeft size={18} /> Volver
                                        </button>
                                    )}
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                                        {viewLevel === 'campaigns' && 'Mis Campañas'}
                                        {viewLevel === 'adgroups' && 'Grupos de Anuncios'}
                                        {viewLevel === 'details' && 'Anuncios y Keywords'}
                                    </h2>
                                </div>

                                <div className="glass" style={{ padding: '0.4rem', borderRadius: '12px', display: 'flex', gap: '0.4rem' }}>
                                    <PeriodBtn active={period === 'TODAY'} onClick={() => setPeriod('TODAY')} label="Hoy" />
                                    <PeriodBtn active={period === 'LAST_7_DAYS'} onClick={() => setPeriod('LAST_7_DAYS')} label="7d" />
                                    <PeriodBtn active={period === 'LAST_30_DAYS'} onClick={() => setPeriod('LAST_30_DAYS')} label="30d" />
                                </div>
                            </div>

                            {/* Contenido Dinámico */}
                            {viewLevel === 'campaigns' && (
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

                            {viewLevel === 'adgroups' && (
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

                            {viewLevel === 'details' && (
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
                                    {viewLevel === 'campaigns' && "Estoy analizando tus campañas globales. Detecto que la inversión total es de saludale, pero podemos optimizar el CTR."}
                                    {viewLevel === 'adgroups' && "En este nivel podemos ver qué segmentos de público están funcionando mejor."}
                                    {viewLevel === 'details' && "Revisa las keywords en rojo. Son palabras que gastan pero no venden."}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

// COMPONENTES AUXILIARES

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

function ConnectionGuide({ UID }: { UID: string }) {
    return (
        <div className="glass" style={{ padding: '4rem', borderRadius: '32px', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                <LinkIcon size={40} className="text-gradient" />
            </div>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Pendiente de sincronización</h2>
            <p style={{ color: 'var(--fg-muted)', marginBottom: '2.5rem', fontSize: '1.1rem' }}>
                Aún no estamos recibiendo datos para tu cuenta. Por favor, asegúrate de haber configurado el **Google Ads Script** avanzado correctamente con tu UID:
            </p>
            <code style={{ display: 'block', background: '#000', padding: '1rem', borderRadius: '12px', fontSize: '1.2rem', color: 'var(--accent-primary)', marginBottom: '2rem' }}>
                {UID}
            </code>
            <p style={{ fontSize: '0.9rem', color: 'var(--fg-muted)' }}>
                Una vez que el script se ejecute por primera vez, verás tus métricas aquí automáticamente.
            </p>
        </div>
    );
}
