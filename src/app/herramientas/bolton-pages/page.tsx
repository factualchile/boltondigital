'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { 
    Plus, 
    Globe, 
    ExternalLink, 
    Edit3, 
    Trash2, 
    CheckCircle2, 
    Clock,
    Layout
} from 'lucide-react';
import Link from 'next/link';

export default function BoltonPagesDashboard() {
    const [sites, setSites] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSites = async () => {
            const { data, error } = await supabase
                .from('client_sites')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (!error && data) {
                setSites(data);
            }
            setIsLoading(false);
        };

        fetchSites();
    }, []);

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

                {isLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                ) : sites.length === 0 ? (
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
}

function SiteCard({ site }: { site: any }) {
    const config = site.site_config || {};
    
    return (
        <div className="glass" style={{ borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ 
                height: '180px', 
                background: 'rgba(255,255,255,0.02)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                borderBottom: '1px solid rgba(255,255,255,0.05)'
            }}>
                <Layout size={48} style={{ opacity: 0.2 }} />
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
                        gap: '0.5rem'
                    }}>
                        <Edit3 size={16} /> Editar
                    </Link>
                    <a href={site.custom_domain ? `https://${site.custom_domain}` : '#'} target="_blank" rel="noopener noreferrer" style={{ 
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
                        opacity: site.custom_domain ? 1 : 0.5,
                        pointerEvents: site.custom_domain ? 'auto' : 'none'
                    }}>
                        <ExternalLink size={16} /> Ver Sitio
                    </a>
                </div>
            </div>
        </div>
    );
}
