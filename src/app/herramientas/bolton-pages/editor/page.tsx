'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { 
    Layout, 
    Type, 
    Palette, 
    Globe, 
    Save, 
    Eye, 
    ArrowLeft,
    Plus,
    CheckCircle2,
    Monitor,
    Smartphone,
    Link as LinkIcon
} from 'lucide-react';
import Link from 'next/link';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import AuthGuard from '@/components/AuthGuard';
import { DollarSign } from 'lucide-react';

export default function BoltonPagesEditorPage() {
    return (
        <Suspense fallback={<div>Cargando editor...</div>}>
            <BoltonPagesEditor />
        </Suspense>
    );
}

function BoltonPagesEditor() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const siteId = searchParams.get('id');

    const [siteData, setSiteData] = useState({
        title: 'Mi Landing Page',
        description: 'Bienvenido a mi sitio web profesional.',
        cta_text: 'Agendar Cita',
        primary_color: '#6366F1',
        font_family: 'Inter',
        subdomain: '',
        custom_domain: ''
    });
    const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'content' | 'design' | 'domain'>('content');

    useEffect(() => {
        const fetchSite = async () => {
            if (siteId) {
                const { data, error } = await supabase
                    .from('client_sites')
                    .select('*')
                    .eq('id', siteId)
                    .single();

                if (!error && data) {
                    setSiteData(data.site_config);
                }
            }
            setIsLoading(false);
        };

        fetchSite();
    }, [siteId]);

    const handleSave = async () => {
        setIsSaving(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            alert('Debes iniciar sesión para guardar.');
            setIsSaving(false);
            return;
        }

        const payload = {
            user_id: user.id,
            site_config: siteData,
            custom_domain: siteData.custom_domain || null,
            status: 'published'
        };

        let result;
        if (siteId) {
            result = await supabase
                .from('client_sites')
                .update(payload)
                .eq('id', siteId);
        } else {
            result = await supabase
                .from('client_sites')
                .insert([payload]);
        }

        if (result.error) {
            alert('Error al guardar: ' + result.error.message);
        } else {
            alert('¡Sitio guardado exitosamente!');
            router.push('/herramientas/bolton-pages');
        }
        setIsSaving(false);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <AuthGuard landing={<div>Redirigiendo...</div>} category="SEM">
            {(user: any, subscriptionStatus: string) => {
                if (subscriptionStatus === 'EXPIRED') {
                    return (
                        <main className="min-h-screen">
                            <Navbar />
                            <div className="container" style={{ paddingTop: 'calc(var(--header-height) + 5rem)' }}>
                                <div className="glass" style={{ padding: '4rem', borderRadius: '32px', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
                                    <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(244, 63, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                                        <DollarSign size={40} color="#f43f5e" />
                                    </div>
                                    <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Suscripción requerida</h2>
                                    <p style={{ color: 'var(--fg-muted)', marginBottom: '2.5rem', fontSize: '1.1rem' }}>
                                        El editor de landing pages es exclusivo de nuestro plan **SEM**. Suscríbete para empezar a crear sitios de alta conversión.
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
                    <main className="min-h-screen bg-[#050505]">
                        <Navbar />
                        {/* El resto del código del editor aquí */}

            {/* Header del Editor */}
            <div style={{
                paddingTop: 'calc(var(--header-height) + 1rem)',
                paddingBottom: '1rem',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(10px)',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Link href="/herramientas" style={{ color: 'var(--fg-muted)' }}>
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Bolton Pages <span className="text-gradient">Editor</span></h1>
                            <p style={{ fontSize: '0.8rem', color: 'var(--fg-muted)' }}>Editando: {siteData.title}</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="btn-primary" 
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.5rem' }}
                        >
                            <Save size={18} />
                            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', height: 'calc(100vh - var(--header-height) - 4.5rem)' }}>
                {/* Panel Lateral - Controles */}
                <aside style={{ 
                    borderRight: '1px solid rgba(255,255,255,0.05)', 
                    padding: '2rem', 
                    overflowY: 'auto',
                    background: 'rgba(255,255,255,0.02)'
                }}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                        <TabButton active={activeTab === 'content'} onClick={() => setActiveTab('content')} icon={<Type size={18}/>} label="Contenido" />
                        <TabButton active={activeTab === 'design'} onClick={() => setActiveTab('design')} icon={<Palette size={18}/>} label="Diseño" />
                        <TabButton active={activeTab === 'domain'} onClick={() => setActiveTab('domain')} icon={<Globe size={18}/>} label="Dominio" />
                    </div>

                    {activeTab === 'content' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <Field label="Título de la Página">
                                <input 
                                    type="text" 
                                    value={siteData.title}
                                    onChange={(e) => setSiteData({...siteData, title: e.target.value})}
                                    style={inputStyle}
                                />
                            </Field>
                            <Field label="Descripción / Intro">
                                <textarea 
                                    value={siteData.description}
                                    onChange={(e) => setSiteData({...siteData, description: e.target.value})}
                                    style={{...inputStyle, height: '100px', resize: 'none'}}
                                />
                            </Field>
                            <Field label="Texto del Botón (CTA)">
                                <input 
                                    type="text" 
                                    value={siteData.cta_text}
                                    onChange={(e) => setSiteData({...siteData, cta_text: e.target.value})}
                                    style={inputStyle}
                                />
                            </Field>
                        </div>
                    )}

                    {activeTab === 'design' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <Field label="Color Primario">
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <input 
                                        type="color" 
                                        value={siteData.primary_color}
                                        onChange={(e) => setSiteData({...siteData, primary_color: e.target.value})}
                                        style={{ width: '40px', height: '40px', padding: 0, border: 'none', background: 'none' }}
                                    />
                                    <input type="text" value={siteData.primary_color} readOnly style={{...inputStyle, flex: 1}} />
                                </div>
                            </Field>
                            <Field label="Tipografía">
                                <select style={inputStyle}>
                                    <option>Inter</option>
                                    <option>Roboto</option>
                                    <option>Outfit</option>
                                    <option>Bento</option>
                                </select>
                            </Field>
                        </div>
                    )}

                    {activeTab === 'domain' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div className="glass" style={{ padding: '1rem', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                <p style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600, marginBottom: '0.5rem' }}>
                                    💡 Tip de Claudio
                                </p>
                                <p style={{ fontSize: '0.85rem', color: 'var(--fg-muted)' }}>
                                    Tener tu propio dominio .cl aumenta la confianza de tus clientes en un 80%.
                                </p>
                            </div>
                            <Field label="Dominio Personalizado (.cl)">
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        type="text" 
                                        placeholder="ej: misitio.cl"
                                        style={inputStyle}
                                    />
                                    <LinkIcon size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-muted)' }} />
                                </div>
                            </Field>
                            <div style={{ fontSize: '0.8rem', color: 'var(--fg-muted)', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}>
                                <p style={{ fontWeight: 600, color: 'white', marginBottom: '0.5rem' }}>Instrucciones DNS:</p>
                                <p>Crea un registro tipo <strong>A</strong> apuntando a:</p>
                                <code style={{ display: 'block', background: '#000', padding: '0.5rem', margin: '0.5rem 0', borderRadius: '4px', textAlign: 'center', color: 'var(--accent-primary)' }}>
                                    76.76.21.21
                                </code>
                            </div>
                        </div>
                    )}
                </aside>

                {/* Área de Preview */}
                <section style={{ background: '#111', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', overflowY: 'auto' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.4rem', borderRadius: '10px' }}>
                        <button onClick={() => setPreviewMode('desktop')} style={{...modeBtnStyle, background: previewMode === 'desktop' ? 'rgba(255,255,255,0.1)' : 'transparent'}}>
                            <Monitor size={18} />
                        </button>
                        <button onClick={() => setPreviewMode('mobile')} style={{...modeBtnStyle, background: previewMode === 'mobile' ? 'rgba(255,255,255,0.1)' : 'transparent'}}>
                            <Smartphone size={18} />
                        </button>
                    </div>

                    {/* Simulación del Sitio */}
                    <div style={{ 
                        width: previewMode === 'desktop' ? '100%' : '375px',
                        maxWidth: previewMode === 'desktop' ? '1000px' : '375px',
                        minHeight: '600px',
                        background: '#0a0a0a',
                        borderRadius: '20px',
                        overflow: 'hidden',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                        transition: 'var(--transition-smooth)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {/* Header Navbar Simulado */}
                        <div style={{ padding: '1.5rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>LOGO</div>
                            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>
                                <span>Inicio</span>
                                <span>Servicios</span>
                                <span>Contacto</span>
                            </div>
                        </div>

                        {/* Hero Simulado */}
                        <div style={{ padding: '6rem 3rem', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.1 }}>
                                {siteData.title}
                            </h2>
                            <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.5)', maxWidth: '600px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
                                {siteData.description}
                            </p>
                            <button style={{ 
                                background: siteData.primary_color, 
                                color: 'white', 
                                border: 'none', 
                                padding: '1rem 2.5rem', 
                                borderRadius: '50px', 
                                fontWeight: 700, 
                                fontSize: '1.1rem',
                                cursor: 'pointer',
                                boxShadow: `0 10px 30px ${siteData.primary_color}33`
                            }}>
                                {siteData.cta_text}
                            </button>
                        </div>
                        
                        <div style={{ padding: '2rem', textAlign: 'center', fontSize: '0.8rem', color: 'rgba(255,255,255,0.2)', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                            Power by Bolton Digital
                        </div>
                    </div>
                </section>
            </div>
        </main>
                );
            }}
        </AuthGuard>
    );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <button 
            onClick={onClick}
            style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '12px',
                background: active ? 'rgba(255,255,255,0.05)' : 'transparent',
                color: active ? 'white' : 'var(--fg-muted)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                transition: 'var(--transition-smooth)'
            }}
        >
            {icon}
            {label}
        </button>
    );
}

function Field({ label, children }: { label: string, children: React.ReactNode }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>{label}</label>
            {children}
        </div>
    );
}

const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    padding: '0.8rem 1rem',
    color: 'white',
    fontSize: '0.9rem',
    width: '100%'
};

const modeBtnStyle: React.CSSProperties = {
    padding: '0.5rem',
    borderRadius: '8px',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
};
