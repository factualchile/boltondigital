'use client';

import { useEffect, useState } from 'react';
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { useRouter } from 'next/navigation';

export default function UserFreelanceDashboard() {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [tickets, setTickets] = useState<any[]>([]);
    const router = useRouter();

    useEffect(() => {
        async function getDashboardData() {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/login');
                return;
            }

            // 1. Get Profile (Stats)
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            setProfile(profileData);

            // 2. Get Tickets
            const { data: ticketsData } = await supabase
                .from('tickets')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            setTickets(ticketsData || []);
            setLoading(false);
        }

        getDashboardData();
    }, [router]);

    if (loading) {
        return (
            <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)' }}>
                <p className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 600 }}>Cargando tu panel...</p>
            </main>
        );
    }

    const stats = {
        minutesUsed: profile?.total_minutes_used || 0,
        totalSpent: profile?.total_usd_spent || 0,
        activeTickets: tickets.filter(t => t.status !== 'Terminada').length
    };

    return (
        <main>
            <Navbar />
            <div className="container" style={{ paddingTop: 'calc(var(--header-height) + 2rem)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>

                    {/* Sidebar */}
                    <aside>
                        <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px', marginBottom: '1rem' }}>
                            <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <a href="#" style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>Mis Solicitudes</a>
                                <a href="#abonar" style={{ color: 'var(--fg-muted)' }}>Abonar Dinero</a>
                                <a href="#" style={{ color: 'var(--fg-muted)' }}>Mi Perfil</a>
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <section>
                        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2>Mi Panel <span className="text-gradient">Freelance</span></h2>
                            <button className="btn-primary">+ Nueva Solicitud</button>
                        </header>

                        {/* Stats Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '1.5rem',
                            marginBottom: '3rem'
                        }}>
                            <StatCard label="Minutos Utilizados" value={`${stats.minutesUsed} min`} />
                            <StatCard label="Total Gastado" value={`$${stats.totalSpent.toFixed(2)} USD`} />
                            <StatCard label="Tickets Activos" value={stats.activeTickets} />
                        </div>

                        {/* Tickets Table */}
                        <div className="glass" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                            {tickets.length === 0 ? (
                                <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--fg-muted)' }}>
                                    Todavía no tienes solicitudes activas.
                                </div>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                            <th style={{ padding: '1.5rem' }}>Título</th>
                                            <th style={{ padding: '1.5rem' }}>Prioridad</th>
                                            <th style={{ padding: '1.5rem' }}>Estado</th>
                                            <th style={{ padding: '1.5rem' }}>Tiempo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tickets.map(ticket => (
                                            <tr key={ticket.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '1.5rem' }}>{ticket.title}</td>
                                                <td style={{ padding: '1.5rem' }}>
                                                    <span style={{
                                                        fontSize: '0.8rem',
                                                        padding: '0.2rem 0.6rem',
                                                        borderRadius: '4px',
                                                        background: ticket.priority === 'Alta' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                                        color: ticket.priority === 'Alta' ? '#ef4444' : 'var(--fg-main)'
                                                    }}>{ticket.priority}</span>
                                                </td>
                                                <td style={{ padding: '1.5rem' }}>{ticket.status}</td>
                                                <td style={{ padding: '1.5rem' }}>{ticket.total_minutes} min</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Payment Section */}
                        <div id="abonar" style={{ marginTop: '4rem' }}>
                            <h3 style={{ marginBottom: '1.5rem' }}>Abonar Dinero</h3>
                            <div className="glass" style={{ padding: '2.5rem', borderRadius: '28px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                                    <div>
                                        <p style={{ marginBottom: '1.5rem' }}>Para continuar con tus solicitudes, realiza un abono a la siguiente cuenta:</p>
                                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                                            <small style={{ color: 'var(--fg-muted)' }}>Cuenta PayPal:</small>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>@joseluismartz</div>
                                        </div>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--fg-muted)' }}>* Recuerda que Astrid cobra $7 USD por hora de trabajo.</p>
                                    </div>

                                    <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Comprobante (Imagen)</label>
                                            <input type="file" style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Fecha de Pago</label>
                                                <input type="date" style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nombre PayPal</label>
                                                <input type="text" placeholder="Tu cuenta PayPal" style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} />
                                            </div>
                                        </div>
                                        <button type="button" className="btn-primary" style={{ marginTop: '0.5rem' }}>Registrar Abono</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}

function StatCard({ label, value }: { label: string, value: string | number }) {
    return (
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px' }}>
            <small style={{ color: 'var(--fg-muted)', display: 'block', marginBottom: '0.5rem' }}>{label}</small>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{value}</div>
        </div>
    );
}
