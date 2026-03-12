'use client';

import Navbar from '@/components/Navbar';
import { 
    Target, 
    MousePointer2, 
    Layout, 
    Sparkles, 
    ArrowRight,
    Search,
    ChevronRight,
    Globe,
    Megaphone
} from 'lucide-react';
import Link from 'next/link';

const tools = [
    {
        category: "SEM (Search Engine Marketing)",
        icon: <Search className="text-indigo-500" size={24} />,
        description: "Herramientas diseñadas para maximizar tu visibilidad en buscadores y generar ventas directas.",
        items: [
            {
                id: "google-ads",
                title: "Google Ads Inteligente",
                description: "Optimiza tus campañas con inteligencia artificial y los lineamientos estratégicos de Claudio.",
                icon: <Target size={24} />,
                href: "/herramientas/google-ads-inteligente",
                color: "linear-gradient(135deg, #4285F4, #FBBC05)"
            },
            {
                id: "bolton-pages",
                title: "Bolton Pages",
                description: "Crea landing pages de alta conversión optimizadas para tus anuncios de Google en segundos.",
                icon: <Layout size={24} />,
                href: "/herramientas/bolton-pages",
                color: "linear-gradient(135deg, #FF4B2B, #FF416C)"
            }
        ]
    }
];

export default function HerramientasPage() {
    return (
        <main className="min-h-screen">
            <Navbar />
            
            <div className="container" style={{ paddingTop: 'calc(var(--header-height) + 4rem)', paddingBottom: '6rem' }}>
                <header style={{ textAlign: 'center', marginBottom: '5rem' }}>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-white/10 text-xs font-bold tracking-widest uppercase text-indigo-400 mb-6">
                        <Sparkles size={14} />
                        Marketplace de Herramientas
                    </div>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.1 }}>
                        Potencia tu Negocio con <span className="text-gradient">Inteligencia</span>
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: 'var(--fg-muted)', maxWidth: '700px', margin: '0 auto' }}>
                        Selecciona la categoría que deseas potenciar. Cada herramienta está diseñada bajo metodologías probadas para escalar tus resultados.
                    </p>
                </header>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem' }}>
                    {tools.map((cat, idx) => (
                        <div key={idx}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                                <div style={{ 
                                    width: '50px', 
                                    height: '50px', 
                                    borderRadius: '16px', 
                                    background: 'rgba(99, 102, 241, 0.1)', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center' 
                                }}>
                                    {cat.icon}
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{cat.category}</h2>
                                    <p style={{ color: 'var(--fg-muted)', fontSize: '1rem' }}>{cat.description}</p>
                                </div>
                            </div>

                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', 
                                gap: '2rem' 
                            }}>
                                {cat.items.map(tool => (
                                    <Link href={tool.href} key={tool.id} className="tool-card-link">
                                        <div className="tool-card glass">
                                            <div className="tool-card-icon" style={{ background: tool.color }}>
                                                {tool.icon}
                                            </div>
                                            <div className="tool-card-content">
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{tool.title}</h3>
                                                    <ChevronRight size={18} className="arrow-icon" />
                                                </div>
                                                <p style={{ fontSize: '0.95rem', color: 'var(--fg-muted)', lineHeight: 1.6 }}>
                                                    {tool.description}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .tool-card-link {
                    text-decoration: none;
                    color: inherit;
                    display: block;
                }
                .tool-card {
                    padding: 2rem;
                    border-radius: 28px;
                    display: flex;
                    gap: 1.5rem;
                    height: 100%;
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    border: 1px solid rgba(255,255,255,0.03);
                    position: relative;
                    overflow: hidden;
                }
                .tool-card:hover {
                    transform: translateY(-8px);
                    background: rgba(255,255,255,0.05);
                    border-color: rgba(99, 102, 241, 0.2);
                }
                .tool-card-icon {
                    width: 60px;
                    height: 60px;
                    min-width: 60px;
                    border-radius: 18px;
                    display: flex;
                    alignItems: center;
                    justify-content: center;
                    color: white;
                    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
                }
                .tool-card-content {
                    flex: 1;
                }
                .arrow-icon {
                    opacity: 0.3;
                    transition: transform 0.3s ease;
                }
                .tool-card:hover .arrow-icon {
                    transform: translateX(5px);
                    opacity: 1;
                    color: var(--accent-primary);
                }
                @media (max-width: 768px) {
                    .tool-card {
                        flex-direction: column;
                    }
                }
            `}</style>
        </main>
    );
}
