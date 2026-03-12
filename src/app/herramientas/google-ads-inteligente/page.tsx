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
    Play,
    Pause,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';

export default function GoogleAdsInteligentePage() {
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState('30_days');
    const [metrics, setMetrics] = useState<any[]>([]);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isApplying, setIsApplying] = useState<string | null>(null);

    useEffect(() => {
        const checkConnection = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Verificar si hay datos en la tabla de sincronización
                const { data, error } = await supabase
                    .from('ads_metrics_sync')
                    .select('*')
                    .eq('user_id', user.id)
                    .limit(1);
                
                if (data && data.length > 0) {
                    setIsConnected(true);
                    fetchMetrics(user.id);
                }
            }
            setIsLoading(false);
        };

        const fetchMetrics = async (userId: string) => {
            const { data, error } = await supabase
                .from('ads_metrics_sync')
                .select('*')
                .eq('user_id', userId)
                .order('synced_at', { ascending: false });
            
            if (data) {
                setMetrics(data);
                generateSuggestions(data);
            }
        };

        checkConnection();
    }, []);

    const generateSuggestions = (data: any[]) => {
        // Lógica simple de sugerencias basada en los lineamientos de Claudio
        const newSuggestions = data.filter(m => m.clicks > 20 && m.conversions === 0).map(m => ({
            id: m.id,
            target_id: m.campaign_id,
            title: `Pausar campaña '${m.campaign_name}'`,
            reason: `Tiene ${m.clicks} clics y 0 conversiones. Está consumiendo presupuesto sin resultados.`,
            impact: `Ahorro estimado: $${m.cost.toFixed(2)}`,
            type: 'pause'
        }));
        setSuggestions(newSuggestions);
    };

    const handleApplyAction = async (suggestion: any) => {
        setIsApplying(suggestion.id);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;

        const { error } = await supabase
            .from('ads_actions_queue')
            .insert([{
                user_id: user.id,
                account_id: metrics[0]?.account_id || 'unknown',
                action_type: suggestion.type === 'pause' ? 'PAUSE_CAMPAIGN' : 'UPDATE_BUDGET',
                target_id: suggestion.target_id,
                target_name: suggestion.title,
                status: 'PENDING'
            }]);

        if (!error) {
            alert('Acción encolada. El Google Ads Script la ejecutará en su próxima corrida.');
            setSuggestions(suggestions.filter(s => s.id !== suggestion.id));
        } else {
            alert('Error al encolar acción: ' + error.message);
        }
        setIsApplying(null);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <main className="min-h-screen">
            <Navbar />
            
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
                    <p style={{ color: 'var(--fg-muted)', fontSize: '1.2rem', maxWidth: '800px' }}>
                        Transforma la complejidad de tus anuncios en decisiones estratégicas guiadas por inteligencia artificial.
                    </p>
                </header>

                {!isConnected ? (
                    <div className="glass" style={{ 
                        padding: '4rem', 
                        borderRadius: '32px', 
                        textAlign: 'center',
                        maxWidth: '800px',
                        margin: '0 auto',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <div style={{ 
                            width: '80px', 
                            height: '80px', 
                            borderRadius: '24px', 
                            background: 'rgba(99, 102, 241, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 2rem'
                        }}>
                            <LinkIcon size={40} className="text-gradient" />
                        </div>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Conecta tu cuenta de Google Ads</h2>
                        <p style={{ color: 'var(--fg-muted)', marginBottom: '2.5rem', fontSize: '1.1rem' }}>
                            Para comenzar el análisis, necesitamos sincronizar tus datos de campaña. 
                            Usaremos esta información solo para mostrarte métricas e interpretarlas.
                        </p>
                        <button 
                            className="btn-primary" 
                            style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', fontWeight: 600 }}
                            onClick={() => setIsConnected(true)} // Temporal para demo
                        >
                            Vincular Cuenta ahora
                        </button>
                        <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--fg-muted)' }}>
                            Seguro. Encriptado. Bajo tu control total.
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                        {/* Dashboard Principal */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {/* Selectores de fecha */}
                            <div className="glass" style={{ padding: '0.5rem', borderRadius: '16px', display: 'flex', gap: '0.5rem', width: 'fit-content' }}>
                                {['Ayer', '7 días', '30 días'].map((p, i) => (
                                    <button 
                                        key={p}
                                        onClick={() => setSelectedPeriod(p)}
                                        style={{
                                            padding: '0.6rem 1.2rem',
                                            borderRadius: '12px',
                                            background: selectedPeriod === p ? 'var(--accent-primary)' : 'transparent',
                                            color: selectedPeriod === p ? 'white' : 'var(--fg-muted)',
                                            fontWeight: 600,
                                            border: 'none',
                                            cursor: 'pointer',
                                            transition: 'var(--transition-smooth)'
                                        }}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>

                            {/* Grid de Métricas */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                                <MetricCard 
                                    title="Inversión" 
                                    value={`$${metrics.reduce((acc, m) => acc + (m.cost || 0), 0).toFixed(2)}`} 
                                    trend="+--" 
                                    icon={<DollarSign size={20} />} 
                                />
                                <MetricCard 
                                    title="Conversiones" 
                                    value={metrics.reduce((acc, m) => acc + (m.conversions || 0), 0).toString()} 
                                    trend="+--" 
                                    icon={<CheckCircle2 size={20} />} 
                                    color="#10b981" 
                                />
                                <MetricCard 
                                    title="Costo / Conv." 
                                    value={`$${(metrics.reduce((acc, m) => acc + (m.cost || 0), 0) / (metrics.reduce((acc, m) => acc + (m.conversions || 0), 0) || 1)).toFixed(2)}`} 
                                    trend="--" 
                                    icon={<TrendingUp size={20} />} 
                                    color="#f59e0b" 
                                />
                                <MetricCard title="Clics" value={metrics.reduce((acc, m) => acc + (m.clicks || 0), 0).toString()} trend="+--" icon={<MousePointer2 size={20} />} />
                                <MetricCard 
                                    title="CTR" 
                                    value={`${((metrics.reduce((acc, m) => acc + (m.clicks || 0), 0) / (metrics.reduce((acc, m) => acc + (m.impressions || 0), 1)) || 0) * 100).toFixed(2)}%`} 
                                    trend="--" 
                                    icon={<Eye size={20} />} 
                                />
                                <MetricCard 
                                    title="CPC Prom." 
                                    value={`$${(metrics.reduce((acc, m) => acc + (m.cost || 0), 0) / (metrics.reduce((acc, m) => acc + (m.clicks || 0), 1)) || 0).toFixed(2)}`} 
                                    trend="--" 
                                    icon={<DollarSign size={20} />} 
                                />
                            </div>

                            {/* Análisis de IA */}
                            <div className="glass" style={{ padding: '2.5rem', borderRadius: '28px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                    <MessageSquare className="text-gradient" size={24} />
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Análisis Estratégico</h3>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '20px', borderLeft: '4px solid var(--accent-primary)' }}>
                                    <p style={{ lineHeight: 1.7, color: '#e5e7eb', fontSize: '1.05rem' }}>
                                        "Tus anuncios están teniendo un buen alcance, pero el <strong>CTR del 2.4%</strong> sugiere que podríamos mejorar los textos de los anuncios para atraer clics más calificados. El costo por conversión es saludable según los lineamientos de Claudio, sin embargo, detectamos 3 palabras clave que están consumiendo presupuesto sin generar resultados."
                                    </p>
                                </div>
                            </div>

                            {/* Sugerencias Actionables */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Sugerencias de Mejora</h3>
                                {suggestions.length > 0 ? suggestions.map(s => (
                                    <SuggestionItem 
                                        key={s.id}
                                        title={s.title}
                                        reason={s.reason}
                                        impact={s.impact}
                                        type={s.type}
                                        onApply={() => handleApplyAction(s)}
                                        isLoading={isApplying === s.id}
                                    />
                                )) : (
                                    <div className="glass" style={{ padding: '2rem', textAlign: 'center', color: 'var(--fg-muted)', borderRadius: '20px' }}>
                                        No hay sugerencias críticas por ahora. ¡Buen trabajo!
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Barra Lateral / Asistente */}
                        <div className="glass" style={{ borderRadius: '28px', display: 'flex', flexDirection: 'column', height: 'fit-content', position: 'sticky', top: 'calc(var(--header-height) + 2rem)' }}>
                            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <h4 style={{ fontWeight: 700, fontSize: '1.1rem' }}>Asistente Inteligente</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--fg-muted)' }}>Basado en la metodología de Claudio</p>
                            </div>
                            <div style={{ padding: '1.5rem', height: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: '12px 12px 12px 0', fontSize: '0.9rem' }}>
                                    ¡Hola! ¿Cómo puedo ayudarte con tus campañas hoy?
                                </div>
                            </div>
                            <div style={{ padding: '1rem' }}>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        type="text" 
                                        placeholder="Pregunta algo..." 
                                        style={{
                                            width: '100%',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            padding: '0.8rem 1rem',
                                            borderRadius: '12px',
                                            color: 'white',
                                            fontSize: '0.9rem'
                                        }}
                                    />
                                    <button style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer' }}>
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

interface MetricCardProps {
    title: string;
    value: string;
    trend: string;
    icon: React.ReactNode;
    color?: string;
}

function MetricCard({ title, value, trend, icon, color = 'var(--accent-primary)' }: MetricCardProps) {
    return (
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ color: 'var(--fg-muted)', fontWeight: 600, fontSize: '0.9rem' }}>{title}</div>
                <div style={{ color }}>{icon}</div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>{value}</div>
            <div style={{ 
                fontSize: '0.85rem', 
                color: trend.startsWith('+') ? '#10b981' : '#f43f5e',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
            }}>
                {trend} <span style={{ color: 'var(--fg-muted)', fontWeight: 400 }}>vs periodo anterior</span>
            </div>
        </div>
    );
}

interface SuggestionItemProps {
    title: string;
    reason: string;
    impact: string;
    type: 'pause' | 'play';
    onApply: () => void;
    isLoading: boolean;
}

function SuggestionItem({ title, reason, impact, type, onApply, isLoading }: SuggestionItemProps) {
    return (
        <div className="glass" style={{ 
            padding: '1.5rem', 
            borderRadius: '20px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            border: '1px solid rgba(255,255,255,0.05)',
            transition: 'var(--transition-smooth)'
        }}>
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                <div style={{ 
                    marginTop: '0.25rem',
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '8px', 
                    background: type === 'pause' ? 'rgba(244, 63, 94, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: type === 'pause' ? '#f43f5e' : '#10b981'
                }}>
                    {type === 'pause' ? <Pause size={18} /> : <Play size={18} />}
                </div>
                <div>
                    <h4 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{title}</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--fg-muted)', marginBottom: '0.5rem' }}>{reason}</p>
                    <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>{impact}</span>
                </div>
            </div>
            <button 
                className="btn-primary" 
                onClick={onApply}
                disabled={isLoading}
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                {isLoading ? 'Encolando...' : 'Aplicar Cambio'}
            </button>
        </div>
    );
}
