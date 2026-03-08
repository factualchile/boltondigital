'use client';

import { useEffect, useState } from 'react';
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { useRouter } from 'next/navigation';

export default function UserFreelanceDashboard() {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [tickets, setTickets] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    // Form states
    const [title, setTitle] = useState('');
    const [priority, setPriority] = useState('Media');
    const [description, setDescription] = useState('');

    async function getDashboardData() {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            router.push('/login');
            return;
        }

        console.log("Fetching data for user:", user.id);

        // 1. Get Profile (Stats)
        let { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error("Profile Error:", profileError);
        }

        // AUTO-CREATE PROFILE IF MISSING (Fix for FK Error)
        if (profileError || !profileData) {
            console.log("Profile missing, creating...");
            const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    full_name: user.user_metadata?.full_name || 'Usuario',
                    email: user.email
                })
                .select()
                .single();

            if (!createError) {
                profileData = newProfile;
            } else {
                console.error("Create Profile Error:", createError);
            }
        }

        setProfile(profileData);

        // 2. Get Tickets with Work Logs
        const { data: ticketsData, error: ticketsError } = await supabase
            .from('tickets')
            .select(`
                *,
                work_logs (*)
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (ticketsError) {
            console.error("Tickets Fetch Error:", ticketsError);
        } else {
            console.log("Tickets Found:", ticketsData?.length || 0);
        }

        setTickets(ticketsData || []);
        setLoading(false);
    }

    useEffect(() => {
        getDashboardData();
    }, [router]);

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const { data: { user } } = await supabase.auth.getUser();

        const { error } = await supabase
            .from('tickets')
            .insert({
                user_id: user?.id,
                title,
                priority,
                description,
                status: 'Pendiente'
            });

        if (!error) {
            setTitle('');
            setDescription('');
            setPriority('Media');
            setShowModal(false);
            getDashboardData(); // Refresh list
        } else {
            alert("Error al crear la solicitud: " + error.message);
        }
        setIsSubmitting(false);
    };

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
                            <button className="btn-primary" onClick={() => setShowModal(true)}>+ Nueva Solicitud</button>
                        </header>

                        {/* Modal Create Ticket */}
                        {showModal && (
                            <div style={{
                                position: 'fixed',
                                top: 0, left: 0, width: '100%', height: '100%',
                                background: 'rgba(0,0,0,0.8)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                zIndex: 2000,
                                padding: '1rem'
                            }}>
                                <div className="glass" style={{ width: '100%', maxWidth: '600px', padding: '2.5rem', borderRadius: '24px', position: 'relative' }}>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.5rem' }}
                                    >✕</button>
                                    <h3 style={{ marginBottom: '2rem', fontSize: '1.75rem' }}>Nueva Solicitud para <span className="text-gradient">Astrid</span></h3>

                                    <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--fg-muted)' }}>Título de la solicitud</label>
                                            <input
                                                type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                                                placeholder="Ej: Error en formulario de contacto"
                                                style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--fg-muted)' }}>Prioridad</label>
                                            <select
                                                value={priority} onChange={(e) => setPriority(e.target.value)}
                                                style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                                            >
                                                <option value="Baja">Baja</option>
                                                <option value="Media">Media</option>
                                                <option value="Alta">Alta</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--fg-muted)' }}>Descripción completa</label>
                                            <textarea
                                                required rows={4} value={description} onChange={(e) => setDescription(e.target.value)}
                                                placeholder="Describe detalladamente lo que necesitas..."
                                                style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', resize: 'vertical' }}
                                            />
                                        </div>
                                        <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ padding: '1rem' }}>
                                            {isSubmitting ? 'Creando...' : 'Crear Solicitud'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

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
                                            <>
                                                <tr key={ticket.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <td style={{ padding: '1.5rem' }}>
                                                        <div style={{ fontWeight: 600 }}>{ticket.title}</div>
                                                        <div style={{ fontSize: '0.85rem', color: 'var(--fg-muted)' }}>{ticket.description}</div>
                                                    </td>
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
                                                {/* Work Logs History Row */}
                                                {ticket.work_logs && ticket.work_logs.length > 0 && (
                                                    <tr>
                                                        <td colSpan={4} style={{ padding: '0 1.5rem 1.5rem 1.5rem', background: 'rgba(255,255,255,0.02)' }}>
                                                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                                                                <small style={{ color: 'var(--accent-primary)', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Desglose de trabajo:</small>
                                                                {ticket.work_logs.map((log: any) => (
                                                                    <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                                                                        <span style={{ color: 'var(--fg-muted)' }}>• {log.description || 'Sin descripción'}</span>
                                                                        <span style={{ fontWeight: 600 }}>{log.minutes_spent} min</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </>
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
