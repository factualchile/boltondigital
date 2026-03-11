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

    useEffect(() => {
        // Simular chequeo de conexión
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

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
                                <MetricCard title="Inversión" value="$450.00" trend="+12%" icon={<DollarSign size={20} />} />
                                <MetricCard title="Conversiones" value="24" trend="+5%" icon={<CheckCircle2 size={20} />} color="#10b981" />
                                <MetricCard title="Costo / Conv." value="$18.75" trend="-8%" icon={<TrendingUp size={20} />} color="#f59e0b" />
                                <MetricCard title="Clics" value="1,240" trend="+15%" icon={<MousePointer2 size={20} />} />
                                <MetricCard title="CTR" value="2.4%" trend="+0.2%" icon={<Eye size={20} />} />
                                <MetricCard title="CPC Prom." value="$0.36" trend="0%" icon={<DollarSign size={20} />} />
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
                                <SuggestionItem 
                                    title="Pausar palabra clave 'curso gratis'"
                                    reason="Ha generado 42 clics sin ninguna conversión en los últimos 30 días."
                                    impact="Ahorro estimado: $15/mes"
                                    type="pause"
                                />
                                <SuggestionItem 
                                    title="Aumentar presupuesto en 'Campaña Ventas'"
                                    reason="El ROAS es de 4.5x y la campaña está limitada por presupuesto."
                                    impact="Ventas estimadas: +15%"
                                    type="play"
                                />
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

function MetricCard({ title, value, trend, icon, color = 'var(--accent-primary)' }) {
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

function SuggestionItem({ title, reason, impact, type }) {
    return (
        <div className="glass" style={{ 
            padding: '1.5rem', 
            borderRadius: '20px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            border: '1px solid rgba(255,255,255,0.05)',
            transition: 'var(--transition-smooth)',
            hover: { background: 'rgba(255,255,255,0.02)' }
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
            <button className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                Aplicar Cambio
            </button>
        </div>
    );
}
