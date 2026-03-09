'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedRole, setSelectedRole] = useState<'user' | 'freelancer' | 'admin'>('user');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        // Fetch access level and role from profile
        console.log("Checking profile for user:", authData.user?.id);
        let { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role, access_level')
            .eq('id', authData.user?.id)
            .single();

        console.log("Profile result:", profile, "Error:", profileError);

        // If profile doesn't exist, try to create it (self-healing)
        if (!profile && !profileError) {
            console.log("Profile not found, creating default...");
            const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert({
                    id: authData.user?.id,
                    full_name: authData.user?.user_metadata?.full_name || 'Nuevo Usuario',
                    email: authData.user?.email,
                    role: 'user',
                    access_level: 1
                })
                .select()
                .single();

            if (createError) {
                console.error("Critical: Could not create profile:", createError);
            } else {
                profile = newProfile;
            }
        }

        const level = profile?.access_level || 1;
        console.log("Access level detected:", level, "Requested role:", selectedRole);

        // Validation based on selectedRole and access_level
        if (selectedRole === 'admin' && level < 3) {
            setError(`No tienes permisos de Administrador. Tu nivel actual es: ${level}`);
            setLoading(false);
            return;
        }
        if (selectedRole === 'freelancer' && level < 2) {
            setError(`No tienes permisos de Freelancer. Tu nivel actual es: ${level}`);
            setLoading(false);
            return;
        }

        // Redirection logic based on CHOICE (if allowed)
        if (selectedRole === 'admin') {
            router.push('/admin');
        } else if (selectedRole === 'freelancer') {
            router.push('/dashboard/admin-astrid');
        } else {
            router.push('/dashboard/freelance-wordpress');
        }

        router.refresh();
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

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.9rem', color: 'var(--fg-muted)' }}>Ingresar como:</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                            {(['user', 'freelancer', 'admin'] as const).map((role) => (
                                <button
                                    key={role}
                                    type="button"
                                    onClick={() => setSelectedRole(role)}
                                    style={{
                                        padding: '0.75rem 0.5rem',
                                        borderRadius: '12px',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        background: selectedRole === role ? 'rgba(79, 70, 229, 0.2)' : 'rgba(255,255,255,0.05)',
                                        border: selectedRole === role ? '2px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.1)',
                                        color: selectedRole === role ? 'white' : 'var(--fg-muted)'
                                    }}
                                >
                                    {role === 'user' ? 'Cliente' : role === 'freelancer' ? 'Freelancer' : 'Admin'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                        style={{ marginTop: '1rem', padding: '1rem' }}
                    >
                        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--fg-muted)', fontSize: '0.9rem' }}>
                    ¿No tienes una cuenta? <Link href="/register" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Regístrate gratis</Link>
                </p>
            </div>
        </main>
    );
}
