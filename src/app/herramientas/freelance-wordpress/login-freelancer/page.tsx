'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function FreelancerLoginPage() {
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

            // Fetch access level and role from profile
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role, access_level')
                .eq('id', authData.user.id)
                .maybeSingle();

            if (profileError) {
                setError(`Error interno de permisos (RLS): ${profileError.message}`);
                setLoading(false);
                return;
            }

            const level = profile?.access_level ?? 1;

            if (level < 2) {
                setError(`Acceso denegado. No tienes permisos de Freelancer. (Nivel detectado: ${level})`);
                await supabase.auth.signOut();
                setLoading(false);
                return;
            }

            // Correct redirection for Astrid/Freelancer
            router.push('/dashboard/admin-astrid');
        } catch (err: any) {
            console.error("Login catch error:", err);
            setError("Error inesperado en el inicio de sesión.");
        } finally {
            setLoading(false);
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
                    <h1 style={{ fontSize: '2rem', marginTop: '1.5rem' }}>Acceso <span className="text-gradient">Equipo</span></h1>
                    <p style={{ color: 'var(--fg-muted)', marginTop: '0.5rem' }}>Inicio de sesión profesional (Freelancers)</p>
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
                            placeholder="freelancer@boltondigital.cl"
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
                        style={{ marginTop: '1rem', padding: '1rem', background: 'var(--accent-primary)' }}
                    >
                        {loading ? 'Validando...' : 'Iniciar Sesión Freelancer'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--fg-muted)', fontSize: '0.8rem' }}>
                    Esta es una zona restringida para personal autorizado.
                </p>
            </div>
        </main>
    );
}
