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
    Link as LinkIcon,
    Zap
} from 'lucide-react';
import Link from 'next/link';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import AuthGuard from '@/components/AuthGuard';
import { DollarSign } from 'lucide-react';
import LandingRenderer from '@/components/LandingRenderer';

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

    const [siteData, setSiteData] = useState<any>({
        // Estética
        primary_color: '#2c5f7d',
        secondary_color: '#001f3f',
        font_family: 'Inter',
        
        // Header & Info
        header_title: 'Atención psicológica para parejas',
        phone: '+56 9 7878 9839',
        location_text: 'Consulta Ubicada en Concepción',
        
        // Perfil Professional
        professional_name: 'Nombre del Profesional',
        profile_image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
        bio_summary: 'Psicólogo con más de 15 años de experiencia clínica.',
        expert_subtitle: 'Experto en atención a parejas.',
        areas_of_expertise: 'Áreas de experiencia: Problemas de comunicación - Falta de conexión emocional - Infidelidad y reconstrucción de la confianza - Celos y control - Problemas en la intimidad y sexualidad.',
        warranty_text: 'Si la primera sesión no te parece GENIAL te devuelvo tu dinero',
        
        // Botones y Contacto
        cta_text_outline: 'RESERVAR AHORA',
        cta_text_filled: 'RESERVAR AHORA',
        whatsapp_number: '56978789839',

        title: 'Mi Landing Page', // Mantener por compatibilidad base
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
                const { data: { user } } = await supabase.auth.getUser(); // Fetch user here
                if (user) {
                    const { data, error } = await supabase
                        .from('client_sites')
                        .select('*')
                        .eq('id', siteId)
                        .single();

                    if (!error && data) {
                        setSiteData((prevSiteData: any) => ({
                            ...prevSiteData, // Valores por defecto del estado inicial
                            ...data.site_config,
                            // Asegurar que si es un sitio antiguo, tenga los campos nuevos
                            primary_color: data.site_config.primary_color || prevSiteData.primary_color,
                            secondary_color: data.site_config.secondary_color || prevSiteData.secondary_color,
                            whatsapp_number: data.site_config.whatsapp_number || prevSiteData.whatsapp_number,
                            // Add other new fields with defaults if necessary
                        }));
                    }
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
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {siteId && (
                        <a 
                            href={`/boltonpages/${siteId}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                        >
                            <LinkIcon size={16} /> Ver en vivo
                        </a>
                    )}
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="btn-primary" 
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}
                    >
                        <Save size={18} /> {isSaving ? 'Guardando...' : 'Guardar Cambios'}
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
                            <Field label="Título de Cabecera">
                                <input 
                                    type="text" 
                                    value={siteData.header_title}
                                    onChange={(e) => setSiteData({...siteData, header_title: e.target.value})}
                                    style={inputStyle}
                                />
                            </Field>
                            <Field label="Teléfono (Header)">
                                <input 
                                    type="text" 
                                    value={siteData.phone}
                                    onChange={(e) => setSiteData({...siteData, phone: e.target.value})}
                                    style={inputStyle}
                                />
                            </Field>
                            <Field label="Ubicación / Subtítulo">
                                <input 
                                    type="text" 
                                    value={siteData.location_text}
                                    onChange={(e) => setSiteData({...siteData, location_text: e.target.value})}
                                    style={inputStyle}
                                />
                            </Field>
                            <hr style={{ border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)' }} />
                            <Field label="Nombre del Profesional">
                                <input 
                                    type="text" 
                                    value={siteData.professional_name}
                                    onChange={(e) => setSiteData({...siteData, professional_name: e.target.value})}
                                    style={inputStyle}
                                />
                            </Field>
                            <Field label="Subtítulo de Experto">
                                <input 
                                    type="text" 
                                    value={siteData.expert_subtitle}
                                    onChange={(e) => setSiteData({...siteData, expert_subtitle: e.target.value})}
                                    style={inputStyle}
                                />
                            </Field>
                            <Field label="URL Imagen de Perfil">
                                <input 
                                    type="text" 
                                    value={siteData.profile_image}
                                    onChange={(e) => setSiteData({...siteData, profile_image: e.target.value})}
                                    placeholder="https://..."
                                    style={inputStyle}
                                />
                            </Field>
                            <Field label="Resumen Bio">
                                <input 
                                    type="text" 
                                    value={siteData.bio_summary}
                                    onChange={(e) => setSiteData({...siteData, bio_summary: e.target.value})}
                                    style={inputStyle}
                                />
                            </Field>
                            <Field label="Especialidades">
                                <textarea 
                                    value={siteData.areas_of_expertise}
                                    onChange={(e) => setSiteData({...siteData, areas_of_expertise: e.target.value})}
                                    style={{...inputStyle, height: '120px', resize: 'none'}}
                                />
                            </Field>
                            <Field label="Texto de Garantía">
                                <textarea 
                                    value={siteData.warranty_text}
                                    onChange={(e) => setSiteData({...siteData, warranty_text: e.target.value})}
                                    style={{...inputStyle, height: '80px', resize: 'none'}}
                                />
                            </Field>
                            <Field label="Número WhatsApp (Internacional)">
                                <input 
                                    type="text" 
                                    value={siteData.whatsapp_number}
                                    onChange={(e) => setSiteData({...siteData, whatsapp_number: e.target.value})}
                                    placeholder="56912345678"
                                    style={inputStyle}
                                />
                            </Field>
                        </div>
                    )}

                    {activeTab === 'design' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <Field label="Color Primario (Header/Bordes)">
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
                            <Field label="Color Secundario (Botón/Barra)">
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <input 
                                        type="color" 
                                        value={siteData.secondary_color}
                                        onChange={(e) => setSiteData({...siteData, secondary_color: e.target.value})}
                                        style={{ width: '40px', height: '40px', padding: 0, border: 'none', background: 'none' }}
                                    />
                                    <input type="text" value={siteData.secondary_color} readOnly style={{...inputStyle, flex: 1}} />
                                </div>
                            </Field>
                            <Field label="Tipografía">
                                <select 
                                    value={siteData.font_family}
                                    onChange={(e) => setSiteData({...siteData, font_family: e.target.value})}
                                    style={inputStyle}
                                >
                                    <option>Inter</option>
                                    <option>Roboto</option>
                                    <option>Outfit</option>
                                    <option>Open Sans</option>
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

                    {/* Simulación del Sitio (Plantilla Estratégica) */}
                    <div style={{ 
                        width: previewMode === 'desktop' ? '100%' : '375px',
                        maxWidth: previewMode === 'desktop' ? '1200px' : '375px',
                        minHeight: '600px',
                        background: 'white',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                        transition: 'var(--transition-smooth)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        position: 'relative'
                    }}>
                        <div style={{ transform: previewMode === 'desktop' ? 'scale(0.8)' : 'scale(1)', transformOrigin: 'top center', height: '100%' }}>
                            <LandingRenderer data={siteData} isMobile={previewMode === 'mobile'} />
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
