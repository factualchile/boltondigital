'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
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
                setError("No se pudieron recuperar datos.");
                setLoading(false);
                return;
            }

            // Strict level 3 check
            const { data: profile } = await supabase
                .from('profiles')
                .select('access_level')
                .eq('id', authData.user.id)
                .maybeSingle();

            const level = profile?.access_level ?? 1;

            if (level < 3) {
                setError(`Acceso Denegado: Se requiere nivel Administrativo (Nivel 3). Tu nivel: ${level}`);
                await supabase.auth.signOut();
                setLoading(false);
                return;
            }

            router.push('/admin');
        } catch (err: any) {
            setError("Error en el servidor de autenticación.");
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
            background: 'linear-gradient(to bottom right, #000, #111)',
            padding: '2rem'
        }}>
            <div className="glass" style={{
                width: '100%',
                maxWidth: '450px',
                padding: '3rem',
                borderRadius: '32px',
                border: '1px solid rgba(239, 68, 68, 0.3)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h1 style={{ fontSize: '1.8rem', color: '#ef4444' }}>Terminal <span style={{ color: 'white' }}>ADMIN</span></h1>
                    <p style={{ color: 'var(--fg-muted)', marginTop: '0.8rem' }}>Control Maestro de Bolton Digital</p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        padding: '1rem',
                        borderRadius: '12px',
                        marginBottom: '1.5rem',
                        fontSize: '0.9rem',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@boltondigital.cl"
                        style={{
                            width: '100%',
                            padding: '1rem',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            color: 'white'
                        }}
                    />
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        style={{
                            width: '100%',
                            padding: '1rem',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            color: 'white'
                        }}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            padding: '1rem',
                            borderRadius: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: '0.3s'
                        }}
                    >
                        {loading ? 'AUTENTICANDO...' : 'ENTRAR AL SISTEMA'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
                    <Link href="/" style={{ color: 'var(--fg-muted)', fontSize: '0.8rem', textDecoration: 'none' }}>← Volver al inicio</Link>
                </div>
            </div>
        </main>
    );
}
