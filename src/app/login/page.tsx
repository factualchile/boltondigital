'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Chrome } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                setError(authError.message);
                setLoading(false);
                return;
            }

            if (!authData.user) {
                setError("Error al obtener datos del usuario.");
                setLoading(false);
                return;
            }

            router.push('/herramientas');
        } catch (err: any) {
            console.error("Login catch error:", err);
            setError("Error inesperado en el inicio de sesión.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <main style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-deep)',
            padding: '2rem'
        }}>
            <div className="glass" style={{
                width: '100%',
                maxWidth: '450px',
                padding: '3rem',
                borderRadius: '32px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 800, textDecoration: 'none', color: 'white' }} className="font-heading">
                        BOLTON<span className="text-gradient">DIGITAL</span>
                    </Link>
                    <h1 style={{ fontSize: '2rem', marginTop: '1.5rem' }}>Bienvenido</h1>
                    <p style={{ color: 'var(--fg-muted)', marginTop: '0.5rem' }}>Ingresa a tu cuenta profesional</p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        padding: '1rem',
                        borderRadius: '12px',
                        marginBottom: '1.5rem',
                        fontSize: '0.9rem',
                        border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--fg-muted)' }}>Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu@email.com"
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                color: 'white',
                                outline: 'none',
                                transition: 'var(--transition-smooth)'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--fg-muted)' }}>Contraseña</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                color: 'white',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                        style={{ marginTop: '1rem', padding: '1rem' }}
                    >
                        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1rem 0' }}>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--fg-muted)' }}>o</span>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="glass"
                        style={{ 
                            padding: '1rem', 
                            borderRadius: '12px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '0.75rem',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: 600
                        }}
                    >
                        <Chrome size={20} /> Continuar con Google
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--fg-muted)', fontSize: '0.9rem' }}>
                    ¿No tienes una cuenta? <Link href="/register" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Regístrate gratis</Link>
                </p>
            </div>
        </main>
    );
}
