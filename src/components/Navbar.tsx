'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, LogOut, User as UserIcon, LogIn } from 'lucide-react';

export default function Navbar() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
        setIsMobileMenuOpen(false);
        router.push('/login');
        router.refresh();
    };

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    return (
        <>
            <nav className={`animate-slide-down ${isScrolled ? 'navbar-scrolled' : ''}`} style={{
                position: 'fixed',
                top: 0,
                width: '100%',
                height: isScrolled ? '70px' : 'var(--header-height)',
                display: 'flex',
                alignItems: 'center',
                zIndex: 1000,
                transition: 'var(--transition-smooth)',
                background: isScrolled ? 'rgba(5, 5, 5, 0.8)' : 'transparent',
                backdropFilter: isScrolled ? 'blur(20px)' : 'none',
                borderBottom: isScrolled ? '1px solid rgba(255, 255, 255, 0.05)' : 'none'
            }}>
                <div className="container" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%'
                }}>
                    <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 800, textDecoration: 'none', color: 'white' }} className="font-heading">
                        BOLTON<span className="text-gradient">DIGITAL</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }} className="hidden-mobile">
                        {user ? (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.03)', padding: '0.5rem 1rem', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <UserIcon size={16} color="var(--accent-primary)" />
                                    <span style={{ fontSize: '0.85rem', color: 'white', fontWeight: 600 }}>
                                        {profile?.full_name || user.email?.split('@')[0]}
                                    </span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="nav-link"
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#ef4444',
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <LogOut size={16} /> Salir
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="nav-link" style={{ fontSize: '0.9rem', color: 'var(--fg-muted)', fontWeight: 600 }}>
                                    Iniciar Sesión
                                </Link>
                                <Link href="/register" className="btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem', boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.3)' }}>
                                    Empieza Ahora
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button 
                        onClick={toggleMobileMenu}
                        style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'none' }}
                        className="show-mobile"
                    >
                        {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.9)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 999,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '2.5rem',
                    padding: '2rem'
                }} className="animate-in fade-in duration-300">
                    <Link href="/" onClick={() => setIsMobileMenuOpen(false)} style={{ fontSize: '2rem', fontWeight: 800, textDecoration: 'none', color: 'white' }} className="font-heading">
                        BOLTON<span className="text-gradient">DIGITAL</span>
                    </Link>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '300px' }}>
                        {user ? (
                            <>
                                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                                    <p style={{ color: 'var(--fg-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Conectado como:</p>
                                    <p style={{ fontSize: '1.2rem', fontWeight: 700 }}>{profile?.full_name || user.email}</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="btn-primary"
                                    style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', width: '100%', padding: '1rem' }}
                                >
                                    Cerrar Sesión
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} style={{ 
                                    textDecoration: 'none', 
                                    color: 'white', 
                                    fontSize: '1.25rem', 
                                    fontWeight: 600,
                                    textAlign: 'center',
                                    padding: '1rem',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px'
                                }}>
                                    <LogIn size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} /> Iniciar Sesión
                                </Link>
                                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="btn-primary" style={{ textAlign: 'center', padding: '1rem', fontSize: '1.1rem' }}>
                                    Empieza Ahora
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}

            <style jsx>{`
                @media (min-width: 1025px) {
                    .show-mobile { display: none !important; }
                }
                @media (max-width: 1024px) {
                    .hidden-mobile { display: none !important; }
                    .show-mobile { display: block !important; }
                }
            `}</style>
        </>
    );
}
