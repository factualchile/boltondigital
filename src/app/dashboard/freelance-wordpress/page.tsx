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

    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'N/A';
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return 'N/A';
            return d.toLocaleDateString();
        } catch {
            return 'N/A';
        }
    };

    return (
        <main>
            <Navbar />
            <div className="container" style={{ paddingTop: 'calc(var(--header-height) + 2.5rem)', paddingBottom: '5rem' }}>
                <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Panel de <span className="text-gradient">Control</span></h1>
                        <p style={{ color: 'var(--fg-muted)', fontSize: '1.1rem' }}>Gestiona tus solicitudes y revisa tus métricas.</p>
                    </div>
                    <button className="btn-primary" onClick={() => setShowModal(true)} style={{ padding: '0.8rem 1.8rem', fontSize: '1rem', boxShadow: '0 10px 20px -5px rgba(79, 70, 229, 0.4)' }}>
                        + Nueva Solicitud
                    </button>
                </header>

                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '2.5rem',
                    alignItems: 'start'
                }} className="dashboard-content-wrapper">

                    {/* Left Column: Stats & Navigation */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', flex: '1 1 300px', maxWidth: '300px' }}>
                        {/* Navigation Card */}
                        <div className="glass" style={{ padding: '1.8rem', borderRadius: '24px' }}>
                            <h4 style={{ marginBottom: '1.25rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--fg-muted)' }}>Menú</h4>
                            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <a href="#" style={{ fontWeight: 600, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0' }}>
                                    <span style={{ fontSize: '1.2rem' }}>📋</span> Mis Solicitudes
                                </a>
                                <a href="#abonar" style={{ color: 'var(--fg-muted)', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', transition: '0.2s' }}>
                                    <span style={{ fontSize: '1.2rem' }}>💳</span> Abonar Dinero
                                </a>
                                <a href="#" style={{ color: 'var(--fg-muted)', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0' }}>
                                    <span style={{ fontSize: '1.2rem' }}>👤</span> Mi Perfil
                                </a>
                            </nav>
                        </div>

                        {/* Stats Stack */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <StatCard label="Minutos Utilizados" value={`${stats.minutesUsed}`} sub="minutos" icon="⏱️" />
                            <StatCard label="Gasto Acumulado" value={`$${stats.totalSpent.toFixed(2)}`} sub="USD" icon="💰" />
                            <StatCard label="Tickets Activos" value={stats.activeTickets} sub="solicitudes" icon="🚀" />
                        </div>
                    </div>

                    {/* Right Column: Content */}
                    <section style={{ flex: '1 1 500px' }}>
                        {/* Modal Create Ticket */}
                        {showModal && (
                            <div style={{
                                position: 'fixed',
                                top: 0, left: 0, width: '100%', height: '100%',
                                background: 'rgba(0,0,0,0.85)',
                                backdropFilter: 'blur(8px)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                zIndex: 2000,
                                padding: '1rem'
                            }}>
                                <div className="glass" style={{ width: '100%', maxWidth: '650px', padding: '3rem', borderRadius: '32px', position: 'relative' }}>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >✕</button>
                                    <h3 style={{ marginBottom: '2.5rem', fontSize: '2rem' }}>Nueva solicitud a <span className="text-gradient">Astrid</span></h3>

                                    <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.95rem', fontWeight: 500 }}>Título descriptivo</label>
                                            <input
                                                type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                                                placeholder="Resumen corto de lo que necesitas..."
                                                style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', fontSize: '1rem' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.95rem', fontWeight: 500 }}>Nivel de Prioridad</label>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                                {['Baja', 'Media', 'Alta'].map(p => (
                                                    <button
                                                        key={p} type="button" onClick={() => setPriority(p)}
                                                        style={{
                                                            padding: '0.8rem', borderRadius: '12px', border: '1px solid',
                                                            borderColor: priority === p ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                                                            background: priority === p ? 'rgba(79, 70, 229, 0.15)' : 'rgba(255,255,255,0.02)',
                                                            color: priority === p ? 'white' : 'var(--fg-muted)',
                                                            cursor: 'pointer', transition: '0.2s', fontWeight: 600
                                                        }}
                                                    >{p}</button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.95rem', fontWeight: 500 }}>Descripción y Detalles</label>
                                            <textarea
                                                required rows={5} value={description} onChange={(e) => setDescription(e.target.value)}
                                                placeholder="Instrucciones paso a paso, enlaces, o cualquier detalle relevante..."
                                                style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', fontSize: '1rem', resize: 'vertical', lineHeight: '1.6' }}
                                            />
                                        </div>
                                        <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ padding: '1.2rem', fontSize: '1.1rem' }}>
                                            {isSubmitting ? 'Procesando...' : '🚀 Enviar Solicitud'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Mis Solicitudes</h3>
                            {tickets.length === 0 ? (
                                <div className="glass" style={{ padding: '5rem 2rem', textAlign: 'center', borderRadius: '24px' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>📭</div>
                                    <p style={{ color: 'var(--fg-muted)', fontSize: '1.1rem' }}>Todavía no tienes solicitudes activas.</p>
                                    <button className="btn-primary" onClick={() => setShowModal(true)} style={{ marginTop: '1.5rem' }}>Comienza ahora</button>
                                </div>
                            ) : (
                                tickets.map(ticket => (
                                    <div key={ticket.id} className="glass" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden' }}>
                                        {/* Header of Ticket Card */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
                                            <div style={{ flex: '1 1 200px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                                    <span style={{
                                                        fontSize: '0.7rem',
                                                        padding: '0.3rem 0.8rem',
                                                        borderRadius: '30px',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.1em',
                                                        fontWeight: 700,
                                                        background: ticket.priority === 'Alta' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                                        color: ticket.priority === 'Alta' ? '#ef4444' : '#fff',
                                                        border: `1px solid ${ticket.priority === 'Alta' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.1)'}`
                                                    }}>{ticket.priority || 'Media'}</span>
                                                    <span style={{
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        color: ticket.status === 'Terminada' ? 'var(--accent-secondary)' : '#fbbf24'
                                                    }}>● {ticket.status || 'Pendiente'}</span>
                                                </div>
                                                <h4 style={{ fontSize: '1.35rem', fontWeight: 700, lineHeight: '1.3' }}>{ticket.title || 'Sin Título'}</h4>
                                            </div>
                                            <div style={{ textAlign: 'right', minWidth: '100px' }}>
                                                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{ticket.total_minutes || 0} min</div>
                                                <small style={{ color: 'var(--fg-muted)', fontSize: '0.75rem' }} suppressHydrationWarning>{formatDate(ticket.created_at)}</small>
                                            </div>
                                        </div>

                                        {/* Description Section */}
                                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '16px', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <p style={{ color: 'var(--fg-muted)', fontSize: '0.95rem', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{ticket.description || 'Sin descripción detallada.'}</p>
                                        </div>

                                        {/* Work Logs Breakdown */}
                                        {ticket.work_logs && Array.isArray(ticket.work_logs) && ticket.work_logs.length > 0 && (
                                            <div style={{ marginTop: '1.5rem' }}>
                                                <h5 style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, var(--accent-primary), transparent)', opacity: 0.3 }}></span>
                                                    Cronología de Trabajo
                                                    <span style={{ height: '1px', flex: 1, background: 'linear-gradient(-90deg, var(--accent-primary), transparent)', opacity: 0.3 }}></span>
                                                </h5>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                    {ticket.work_logs.map((log: any) => (
                                                        <div key={log.id} style={{
                                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                            background: 'rgba(255,255,255,0.03)', padding: '0.75rem 1rem', borderRadius: '12px', fontSize: '0.9rem'
                                                        }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                                <span style={{ color: 'var(--fg-muted)', fontSize: '0.8rem' }} suppressHydrationWarning>{formatDate(log.logged_at)}</span>
                                                                <span>{log.description || 'Avance en la tarea'}</span>
                                                            </div>
                                                            <span style={{ fontWeight: 700, color: 'white' }}>+{log.minutes_spent || 0} min</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Payment Section - Reimagined */}
                        <div id="abonar" style={{ marginTop: '6rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1.8rem' }}>Recarga de <span className="text-gradient">Horas</span></h3>
                            </div>
                            <div className="glass" style={{ padding: '3.5rem', borderRadius: '32px', position: 'relative', overflow: 'hidden' }}>
                                {/* Background Accent */}
                                <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'var(--accent-primary)', opacity: 0.05, filter: 'blur(80px)', borderRadius: '50%' }}></div>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4rem', zIndex: 1, position: 'relative' }} className="payment-grid">
                                    <div style={{ flex: '1 1 300px' }}>
                                        <h4 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>Instrucciones de Pago</h4>
                                        <p style={{ marginBottom: '2rem', color: 'var(--fg-muted)', fontSize: '1.05rem', lineHeight: '1.6' }}>
                                            Cada hora de trabajo de Astrid tiene un valor de **$9.00 USD**. Para asignar nuevas tareas, asegúrate de tener saldo disponible.
                                        </p>
                                        <div style={{ background: 'rgba(255,255,255,0.04)', padding: '1.8rem', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.2)' }}>
                                            <small style={{ color: 'var(--accent-primary)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem' }}>Cuenta PayPal</small>
                                            <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem', color: 'white' }}>@joseluismartz</div>
                                        </div>
                                        <div style={{ marginTop: '2rem', display: 'flex', gap: '1.5rem' }}>
                                            <div>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>$9 / h</div>
                                                <small style={{ color: 'var(--fg-muted)' }}>Tarifa Actual</small>
                                            </div>
                                            <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                                            <div>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>Respuesta</div>
                                                <small style={{ color: 'var(--fg-muted)' }}>Velocidad Astrid</small>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="glass" style={{ padding: '2rem', borderRadius: '24px', background: 'rgba(255,255,255,0.02)', flex: '1 1 300px' }}>
                                        <h5 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 600 }}>Registrar Comprobante</h5>
                                        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--fg-muted)' }}>Captura del pago</label>
                                                <input type="file" style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '0.9rem' }} />
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                <div>
                                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--fg-muted)' }}>Fecha</label>
                                                    <input type="date" style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white' }} />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--fg-muted)' }}>Nombre PayPal</label>
                                                    <input type="text" placeholder="Ej: John Doe" style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white' }} />
                                                </div>
                                            </div>
                                            <button type="button" className="btn-primary" style={{ marginTop: '0.5rem', padding: '1rem', width: '100%', borderRadius: '12px' }}>Confirmar Depósito</button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}

function StatCard({ label, value, sub, icon }: { label: string, value: string | number, sub: string, icon: string }) {
    return (
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '24px', display: 'flex', gap: '1.25rem', alignItems: 'center', transition: '0.3s' }}>
            <div style={{ fontSize: '2rem', background: 'rgba(255,255,255,0.05)', width: '60px', height: '60px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {icon}
            </div>
            <div style={{ flex: 1 }}>
                <small style={{ color: 'var(--fg-muted)', display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>{label}</small>
                <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                    {value} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--fg-muted)' }}>{sub}</span>
                </div>
            </div>
        </div>
    );
}
