'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const getUserData = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
                setUser(authUser);
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', authUser.id)
                    .single();
                setProfile(profileData);
            }
        };

        getUserData();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUser(session.user);
            } else {
                setUser(null);
                setProfile(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    return (
        <nav className="glass" style={{
            position: 'fixed',
            top: 0,
            width: '100%',
            height: 'var(--header-height)',
            display: 'flex',
            alignItems: 'center',
            zIndex: 1000,
        }}>
            <div className="container" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <Link href="/" style={{ fontSize: '1.25rem', fontWeight: 800 }} className="font-heading">
                    BOLTON<span className="text-gradient">DIGITAL</span>
                </Link>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }} className="nav-links">
                    {user ? (
                        <>
                            <span style={{ fontSize: '0.85rem', color: 'var(--fg-muted)', fontWeight: 500 }} className="user-greeting">
                                Hola, <span style={{ color: 'white', fontWeight: 600 }}>{profile?.full_name || user.email?.split('@')[0]}</span>
                            </span>
                            <button
                                onClick={handleLogout}
                                style={{
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    color: '#ef4444',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    padding: '0.4rem 1rem',
                                    borderRadius: '8px',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                Cerrar Sesión
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" style={{ fontSize: '0.9rem', color: 'var(--fg-muted)', fontWeight: 500 }}>Iniciar Sesión</Link>
                            <Link href="/register" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
                                Empieza Ahora
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
