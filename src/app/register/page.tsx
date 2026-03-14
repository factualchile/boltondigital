'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
    Check, 
    Mail, 
    Lock, 
    User, 
    Sparkles, 
    ChevronRight, 
    ShieldCheck, 
    Zap,
    Chrome
} from 'lucide-react';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Verificación proactiva de email duplicado
            const { data: existingUser, error: checkError } = await supabase
                .from('profiles')
                .select('id')
                .eq('email', email.trim().toLowerCase())
                .maybeSingle();

            if (checkError) {
                console.error("Error checking existing user:", checkError);
            }

            if (existingUser) {
                setError("Este correo electrónico ya está registrado. Por favor, inicia sesión.");
                setLoading(false);
                return;
            }

            // 2. Proceder con el registro oficial
            const { data, error: signUpError } = await supabase.auth.signUp({
                email: email.trim().toLowerCase(),
                password,
                options: {
                    data: {
                        full_name: fullName,
                        email: email.trim().toLowerCase(), // Guardar email en metadata también
                    },
                    emailRedirectTo: `${window.location.origin}/onboarding`
                }
            });

            if (signUpError) {
                setError(signUpError.message);
            } else {
                setSuccess(true);
            }
        } catch (err) {
            setError("Ocurrió un error inesperado. Inténtalo de nuevo.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <main style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-deep)' }}>
            {/* Left Side: Form */}
            <div style={{ 
                flex: '1', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                padding: '2rem',
                zIndex: 1
            }}>
                <div style={{ width: '100%', maxWidth: '440px' }} className="animate-in fade-in slide-in-from-left-4 duration-700">
                    <div style={{ marginBottom: '2.5rem' }}>
                        <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 800, textDecoration: 'none', color: 'white' }} className="font-heading">
                            BOLTON<span className="text-gradient">DIGITAL</span>
                        </Link>
                        <h1 style={{ fontSize: '2.5rem', marginTop: '1.5rem', fontWeight: 800 }}>Crea tu cuenta</h1>
                        <p style={{ color: 'var(--fg-muted)', marginTop: '0.5rem' }}>Únete a la nueva era del marketing con IA.</p>
                    </div>

                    {success ? (
                        <div className="glass animate-in zoom-in duration-500" style={{ padding: '3rem', borderRadius: '24px', textAlign: 'center', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                            <div style={{ 
                                width: '64px', 
                                height: '64px', 
                                borderRadius: '50%', 
                                background: 'rgba(16, 185, 129, 0.1)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                margin: '0 auto 1.5rem' 
                            }}>
                                <Mail size={32} color="#10b981" />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#10b981' }}>¡Casi listo!</h3>
                            <p style={{ color: 'var(--fg-muted)', lineHeight: '1.6' }}>
                                Hemos enviado un enlace de confirmación a <strong>{email}</strong>. 
                                Por favor, revísalo para activar tu cuenta.
                            </p>
                            <button 
                                onClick={() => router.push('/login')} 
                                className="btn-primary" 
                                style={{ marginTop: '2rem', width: '100%' }}
                            >
                                Volver al Login
                            </button>
                        </div>
                    ) : (
                        <>

                            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--fg-muted)', fontWeight: 500 }}>Nombre Completo</label>
                                    <div style={{ position: 'relative' }}>
                                        <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                                        <input
                                            type="text"
                                            required
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="Juan Pérez"
                                            className="input-field"
                                        />
                                    </div>
                                </div>
                                
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--fg-muted)', fontWeight: 500 }}>Email Profesional</label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="tu@empresa.com"
                                            className="input-field"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--fg-muted)', fontWeight: 500 }}>Contraseña</label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                                        <input
                                            type="password"
                                            required
                                            minLength={6}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="input-field"
                                        />
                                    </div>
                                    <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: password.length >= 6 ? '#10b981' : 'var(--fg-muted)' }}>
                                        <Check size={12} /> Mínimo 6 caracteres
                                    </div>
                                </div>

                                {error && (
                                    <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.85rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary"
                                    style={{ marginTop: '1rem', width: '100%', padding: '1rem', fontSize: '1rem' }}
                                >
                                    {loading ? 'Creando cuenta...' : 'Crear Cuenta Gratis'}
                                </button>
                            </form>
                        </>
                    )}

                    <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--fg-muted)', fontSize: '0.9rem' }}>
                        ¿Ya tienes una cuenta? <Link href="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'none' }}>Inicia sesión</Link>
                    </p>
                </div>
            </div>

            {/* Right Side: Benefits Panel */}
            <div style={{ 
                flex: '1.2', 
                background: 'linear-gradient(135deg, #0a0a0c 0%, #15151a 100%)', 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '4rem',
                borderLeft: '1px solid rgba(255,255,255,0.05)',
                position: 'relative',
                overflow: 'hidden'
            }} className="hidden-mobile">
                <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '400px', height: '400px', background: 'var(--accent-primary)', opacity: 0.05, filter: 'blur(100px)', borderRadius: '50%' }}></div>
                <div style={{ position: 'absolute', bottom: '-5%', left: '5%', width: '300px', height: '300px', background: '#a855f7', opacity: 0.05, filter: 'blur(100px)', borderRadius: '50%' }}></div>

                <div style={{ maxWidth: '500px', zIndex: 1 }} className="animate-in fade-in slide-in-from-right-4 duration-1000">
                    <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        padding: '0.5rem 1rem', 
                        borderRadius: '50px', 
                        background: 'rgba(99, 102, 241, 0.1)', 
                        color: 'var(--accent-primary)',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        marginBottom: '2rem',
                        letterSpacing: '1px'
                    }}>
                        <Sparkles size={14} /> LA AGENCIA DEL FUTURO
                    </div>
                    <h2 style={{ fontSize: '3rem', lineHeight: 1.1, marginBottom: '2rem' }}>
                        Toma el control total de tus <span className="text-gradient">ventas digitales.</span>
                    </h2>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <BenefitItem 
                            icon={<Zap size={24} />} 
                            title="Despliegue Instantáneo" 
                            desc="Crea Landing Pages optimizadas en segundos con Bolton Pages." 
                        />
                        <BenefitItem 
                            icon={<ShieldCheck size={24} />} 
                            title="IA de Claudio" 
                            desc="Optimización automática de Google Ads basada en datos reales de negocio." 
                        />
                        <BenefitItem 
                            icon={<div style={{ fontWeight: 800, fontSize: '1.1rem' }}>360°</div>} 
                            title="Gestión Centralizada" 
                            desc="Freelancers, SEM y desarrollo web en una sola plataforma profesional." 
                        />
                    </div>
                </div>
            </div>

            <style jsx>{`
                .input-field {
                    width: 100%;
                    padding: 0.85rem 1rem 0.85rem 2.8rem;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 12px;
                    color: white;
                    font-size: 0.95rem;
                    outline: none;
                    transition: var(--transition-smooth);
                }
                .input-field:focus {
                    border-color: var(--accent-primary);
                    background: rgba(255,255,255,0.06);
                    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
                }
                @media (max-width: 1024px) {
                    .hidden-mobile {
                        display: none !important;
                    }
                }
            `}</style>
        </main>
    );
}

function BenefitItem({ icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
            <div style={{ 
                flexShrink: 0,
                width: '48px', 
                height: '48px', 
                borderRadius: '14px', 
                background: 'rgba(255,255,255,0.02)', 
                border: '1px solid rgba(255,255,255,0.05)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'var(--accent-primary)'
            }}>
                {icon}
            </div>
            <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>{title}</h4>
                <p style={{ color: 'var(--fg-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>{desc}</p>
            </div>
        </div>
    );
}
