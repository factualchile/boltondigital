'use client';

import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import { 
    Target, 
    Layout, 
    Sparkles, 
    Search,
    ChevronRight,
    Briefcase,
    Code,
    Zap,
    Filter,
    ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const allTools = [
    {
        id: "google-ads",
        title: "Google Ads Inteligente",
        description: "Optimiza tus campañas con inteligencia artificial y los lineamientos estratégicos de Claudio.",
        icon: <Target size={24} />,
        href: "/herramientas/google-ads-inteligente",
        color: "linear-gradient(135deg, #4285F4, #FBBC05)",
        category: "SEM",
        badges: ["IA Ready", "Activo"]
    },
    {
        id: "bolton-pages",
        title: "Bolton Pages",
        description: "Crea landing pages de alta conversión optimizadas para tus anuncios de Google en segundos.",
        icon: <Layout size={24} />,
        href: "/herramientas/bolton-pages",
        color: "linear-gradient(135deg, #FF4B2B, #FF416C)",
        category: "SEM",
        badges: ["Nuevo"]
    },
    {
        id: "freelance-wordpress",
        title: "WordPress Freelancer",
        description: "Gestiona tus proyectos de desarrollo WordPress, clientes y tareas de forma centralizada.",
        icon: <Code size={24} />,
        href: "/herramientas/freelance-wordpress",
        color: "linear-gradient(135deg, #21759b, #d54e21)",
        category: "Desarrollo",
        badges: ["Especialistas"]
    }
];

const categories = ["Todos", "SEM", "Desarrollo", "IA"];

export default function HerramientasPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('Todos');
    const [filteredTools, setFilteredTools] = useState(allTools);
    const [userProfile, setUserProfile] = useState<any>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                setUserProfile(data);
            }
        };
        fetchProfile();
    }, []);

    useEffect(() => {
        let result = allTools;
        
        if (activeCategory !== 'Todos') {
            result = result.filter(t => t.category === activeCategory);
        }
        
        if (searchQuery) {
            result = result.filter(t => 
                t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        setFilteredTools(result);
    }, [searchQuery, activeCategory]);

    return (
        <main className="min-h-screen" style={{ background: 'var(--bg-deep)' }}>
            <Navbar />
            
            <div className="container" style={{ paddingTop: 'calc(var(--header-height) + 2rem)', paddingBottom: '6rem' }}>
                <header style={{ textAlign: 'center', marginBottom: '2.5rem' }} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-white/10 text-[9px] font-bold tracking-widest uppercase text-indigo-400 mb-4">
                        <Sparkles size={12} />
                        Bolton Intelligence Hub
                    </div>
                    <h1 style={{ fontSize: '2.8rem', fontWeight: 800, marginBottom: '0.75rem', lineHeight: 1.1 }}>
                        Tus herramientas <br /><span className="text-gradient">de alta gama.</span>
                    </h1>
                </header>

                {/* Search & Filter Bar */}
                <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '1.25rem', 
                    marginBottom: '2.5rem',
                    background: 'rgba(255,255,255,0.02)',
                    padding: '1.25rem',
                    borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <div style={{ position: 'relative', width: '100%' }}>
                        <Search size={22} style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                        <input 
                            type="text" 
                            placeholder="Buscar herramientas por nombre o función..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ 
                                width: '100%', 
                                padding: '1rem 1.25rem 1rem 3.5rem', 
                                background: 'rgba(5, 5, 5, 0.4)', 
                                border: '1px solid rgba(255,255,255,0.1)', 
                                borderRadius: '16px',
                                color: 'white',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'var(--transition-smooth)'
                            }}
                            className="input-search"
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {categories.map(cat => (
                            <button 
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={activeCategory === cat ? 'tab-active' : ''}
                                style={{ 
                                    padding: '0.75rem 1.5rem', 
                                    borderRadius: '50px', 
                                    border: '1px solid rgba(255,255,255,0.1)', 
                                    background: 'rgba(255,255,255,0.02)',
                                    color: activeCategory === cat ? 'white' : 'var(--fg-muted)',
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'var(--transition-smooth)'
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid of Tools */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
                    gap: '1.5rem' 
                }}>
                    {filteredTools.map((tool, idx) => (
                        <ToolCard 
                            key={tool.id} 
                            tool={tool} 
                            idx={idx} 
                            isProfileIncomplete={tool.id === 'google-ads' && !userProfile?.google_ads_id}
                        />
                    ))}
                </div>

                {filteredTools.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--fg-muted)' }}>
                        <Filter size={48} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
                        <p>No encontramos herramientas que coincidan con tu búsqueda.</p>
                        <button onClick={() => { setSearchQuery(''); setActiveCategory('Todos'); }} style={{ color: 'var(--accent-primary)', background: 'none', border: 'none', cursor: 'pointer', marginTop: '1rem', textDecoration: 'underline' }}>
                            Ver todas las herramientas
                        </button>
                    </div>
                )}
            </div>

            <style jsx>{`
                .input-search:focus {
                    border-color: var(--accent-primary);
                    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
                }
            `}</style>
        </main>
    );
}

function ToolCard({ tool, idx, isProfileIncomplete }: { tool: any, idx: number, isProfileIncomplete: boolean }) {
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        cardRef.current.style.setProperty('--mouse-x', `${x}px`);
        cardRef.current.style.setProperty('--mouse-y', `${y}px`);
    };

    return (
        <Link 
            href={tool.href} 
            style={{ textDecoration: 'none', color: 'inherit' }}
            className={`animate-fade-scale`}
        >
            <div 
                ref={cardRef}
                onMouseMove={handleMouseMove}
                className="tool-card glow-card glass"
                style={{ 
                    padding: '1.5rem', 
                    borderRadius: '24px', 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: '1rem',
                    transition: 'var(--transition-smooth)',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}
            >
                <div className="glow-overlay"></div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1, marginBottom: '0.5rem' }}>
                    <div style={{ 
                        width: '48px', 
                        height: '48px', 
                        borderRadius: '14px', 
                        background: tool.color, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'white',
                        boxShadow: '0 8px 24px -5px rgba(0,0,0,0.3)'
                    }}>
                        {tool.icon}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {tool.badges.map((badge: string) => (
                            <span key={badge} className={`badge ${
                                badge === 'IA Ready' ? 'badge-ia' : 
                                badge === 'Activo' ? 'badge-active' : 'badge-new'
                            }`}>
                                {badge}
                            </span>
                        ))}
                        {isProfileIncomplete && (
                            <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                Incompleto
                            </span>
                        )}
                    </div>
                </div>

                <div style={{ zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{tool.title}</h3>
                        <ArrowUpRight size={18} className="arrow-icon" style={{ opacity: 0.2, transition: '0.3s' }} />
                    </div>
                    <p style={{ color: 'var(--fg-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                        {tool.description}
                    </p>
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', fontSize: '0.9rem', fontWeight: 700, zIndex: 1 }}>
                    Acceder ahora <ChevronRight size={16} />
                </div>
            </div>

            <style jsx>{`
                .tool-card:hover {
                    transform: translateY(-10px);
                    border-color: rgba(99, 102, 241, 0.3) !important;
                    background: rgba(255,255,255,0.05) !important;
                }
                .tool-card:hover .arrow-icon {
                    transform: translate(3px, -3px);
                    opacity: 1 !important;
                    color: var(--accent-primary);
                }
            `}</style>
        </Link>
    );
}
