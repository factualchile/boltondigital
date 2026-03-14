'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { 
    Plus, 
    Globe, 
    ExternalLink, 
    Edit3, 
    CheckCircle2, 
    Clock,
    Layout,
    Sparkles,
    LogIn,
    DollarSign,
    Rocket,
    Zap
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';

export default function BoltonPagesDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [sites, setSites] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [subscriptionStatus, setSubscriptionStatus] = useState<'ACTIVE' | 'GRACE' | 'EXPIRED' | 'NONE'>('NONE');

    const fetchSites = async (userId: string) => {
        const { data, error } = await supabase
            .from('client_sites')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        
        if (data) setSites(data);
        setIsLoading(false);
    };

    return (
        <AuthGuard landing={<BoltonPagesLanding />} category="SEM">
            {(user) => {
                // Disparar carga de sitios si aún no se ha hecho
                if (sites.length === 0 && user && isLoading) {
                    fetchSites(user.id);
                }

                // Obtener status de suscripción desde el perfil (AuthGuard ya lo maneja internamente pero necesitamos mostrar la pantalla de bloqueo si es EXPIRED)
                // Usaremos un truco: si AuthGuard permite el paso, es que es ACTIVE o GRACE.
                
                return (
                    <main className="min-h-screen">
                        <Navbar />
                        
                        <div className="container" style={{ paddingTop: 'calc(var(--header-height) + 3rem)', paddingBottom: '5rem' }}>
                            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                                <div>
                                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>
                                        Bolton <span className="text-gradient">Pages</span>
                                    </h1>
                                    <p style={{ color: 'var(--fg-muted)', fontSize: '1.1rem' }}>
                                        Gestiona tus landing pages y dominios personalizados.
                                    </p>
                                </div>
                                <Link href="/herramientas/bolton-pages/editor" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem' }}>
                                    <Plus size={20} />
                                    Crear Nuevo Sitio
                                </Link>
                            </header>

                            {sites.length === 0 ? (
                                <div className="glass" style={{ padding: '5rem', textAlign: 'center', borderRadius: '32px' }}>
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
                                        <Layout size={40} className="text-gradient" />
                                    </div>
                                    <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Aún no tienes ningún sitio</h2>
                                    <p style={{ color: 'var(--fg-muted)', marginBottom: '2.5rem', maxWidth: '500px', margin: '0 auto 2.5rem' }}>
                                        Comienza a crear tu primera landing page profesional en minutos usando nuestras plantillas estratégicas.
                                    </p>
                                    <Link href="/herramientas/bolton-pages/editor" className="btn-primary">
                                        Empezar ahora
                                    </Link>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                                    {sites.map((site) => (
                                        <SiteCard key={site.id} site={site} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </main>
                );
            }}
        </AuthGuard>
    );
}

function BoltonPagesLanding() {
    const router = useRouter();
    return (
        <div className="container" style={{ paddingTop: 'calc(var(--header-height) + 5rem)', paddingBottom: '8rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
                <div className="animate-in slide-in-from-left duration-700">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-white/10 text-xs font-bold tracking-widest uppercase text-indigo-400 mb-6">
                        <Sparkles size={14} />
                        Conversión Garantizada
                    </div>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.1 }}>
                        Landing Pages que <br />
                        <span className="text-gradient">Venden por ti.</span>
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: 'var(--fg-muted)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
                        No desperdicies clics en un sitio web común. Crea páginas diseñadas específicamente para maximizar el retorno de tu inversión en Google Ads con Bolton Pages.
                    </p>
                    
                    <ul style={{ listStyle: 'none', padding: 0, marginBottom: '3rem' }}>
                        {[
                            'Editor visual ultra-rápido sin código.',
                            'Optimización nativa para dispositivos móviles.',
                            'Infraestructura de carga ultra-veloz.',
                            'Integración directa con Bolton Intelligence.'
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
                            <LogIn size={20} /> Empezar a Crear
                        </button>
                        <button 
                            onClick={() => router.push('/')}
                            className="glass" 
                            style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer' }}
                        >
                            Saber más
                        </button>
                    </div>
                </div>

                <div className="animate-in slide-in-from-right duration-700 relative">
                    <div className="glass" style={{ padding: '2rem', borderRadius: '32px', border: '1px solid rgba(99, 102, 241, 0.2)', boxShadow: '0 30px 60px -12px rgba(99, 102, 241, 0.3)' }}>
                        {/* Mockup Editor UI */}
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56' }}></div>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }}></div>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f' }}></div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '40px', height: '40px', background: 'var(--accent-gradient)', borderRadius: '10px' }}></div>
                                <div style={{ height: '12px', width: '100px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}></div>
                            </div>
                            <div style={{ height: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}></div>
                            <div style={{ height: '150px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Plus size={32} style={{ opacity: 0.1 }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ height: '80px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}></div>
                                <div style={{ height: '80px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}></div>
                            </div>
                        </div>
                    </div>
                    {/* Floating Glow */}
                    <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', width: '200px', height: '200px', background: 'var(--accent-primary)', filter: 'blur(80px)', opacity: 0.15, zIndex: -1 }}></div>
                </div>
            </div>
        </div>
    );
}

function SiteCard({ site }: { site: any }) {
    const config = site.site_config || {};
    
    return (
        <div className="glass animate-fade-scale" style={{ borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.05)', transition: 'var(--transition-smooth)' }}>
            <div style={{ 
                height: '180px', 
                background: 'rgba(255,255,255,0.02)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                position: 'relative'
            }}>
                <Layout size={48} style={{ opacity: 0.2 }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.4))' }}></div>
            </div>
            <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>{config.title || 'Sin Título'}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--fg-muted)', fontSize: '0.85rem' }}>
                            <Globe size={14} />
                            <span>{site.custom_domain || site.subdomain || 'dominio no configurado'}</span>
                        </div>
                    </div>
                    <span style={{ 
                        fontSize: '0.7rem', 
                        padding: '0.25rem 0.6rem', 
                        borderRadius: '50px', 
                        background: site.status === 'published' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: site.status === 'published' ? '#10b981' : '#f59e0b',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                    }}>
                        {site.status === 'published' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {site.status === 'published' ? 'Publicado' : 'Borrador'}
                    </span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
                    <Link href={`/herramientas/bolton-pages/editor?id=${site.id}`} style={{ 
                        background: 'rgba(255,255,255,0.05)', 
                        color: 'white', 
                        padding: '0.6rem', 
                        borderRadius: '10px', 
                        textAlign: 'center',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        border: '1px solid rgba(255,255,255,0.05)',
                        textDecoration: 'none'
                    }}>
                        <Edit3 size={16} /> Editar
                    </Link>
                    <a 
                        href={site.custom_domain ? `https://${site.custom_domain}` : `/boltonpages/${site.id}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={{ 
                            background: 'var(--accent-primary)', 
                            color: 'white', 
                            padding: '0.6rem', 
                            borderRadius: '10px', 
                            textAlign: 'center',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            textDecoration: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <ExternalLink size={16} /> Ver Sitio
                    </a>
                </div>
            </div>
        </div>
    );
}
