'use client';

import { useEffect, useState } from 'react';
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { useRouter } from 'next/navigation';

import { Component, ReactNode } from 'react';

class DashboardErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, errorMsg: string }> {
    constructor(props: { children: ReactNode }) {
        super(props);
        this.state = { hasError: false, errorMsg: '' };
    }
    static getDerivedStateFromError(error: any) {
        return { hasError: true, errorMsg: error.toString() };
    }
    componentDidCatch(error: any, errorInfo: any) {
        console.error("Dashboard Error caught:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '5rem', background: 'var(--bg-deep)', color: 'white', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <h1 style={{ color: '#ef4444', marginBottom: '1rem' }}>⚠ Error Fatal en Dashboard</h1>
                    <p style={{ fontFamily: 'monospace', background: 'rgba(239, 68, 68, 0.1)', padding: '2rem', borderRadius: '12px', border: '1px solid #ef4444', maxWidth: '800px', width: '100%', wordBreak: 'break-all' }}>
                        {this.state.errorMsg}
                    </p>
                    <button onClick={() => window.location.reload()} className="btn-primary" style={{ marginTop: '2rem', padding: '1rem 2rem' }}>
                        Recargar Página
                    </button>
                    <p style={{ marginTop: '2rem', color: 'var(--fg-muted)', fontSize: '0.9rem' }}>Por favor, toma una captura de este error y envíasela a la Inteligencia Artificial.</p>
                </div>
            );
        }
        return this.props.children;
    }
}

export default function AstridAdminDashboard() {
    const [tickets, setTickets] = useState<any[]>([]);

    const [filter, setFilter] = useState<'Pendiente' | 'Terminada' | 'En Proceso'>('Pendiente');
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [summary, setSummary] = useState({ totalMinutes: 0 });
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [minutesToLog, setMinutesToLog] = useState<string>('');
    const [logDescription, setLogDescription] = useState<string>('');
    const [isLoggingTime, setIsLoggingTime] = useState<string | null>(null);
    const router = useRouter();

    async function getTickets() {
        const { data, error } = await supabase
            .from('tickets')
            .select(`
                *,
                profiles (id, full_name, email),
                work_logs (*)
            `)
            .eq('status', filter)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching tickets:", error);
        }

        // Handle postgrest joining quirk (sometimes it returns an array for single joins)
        const processedData = data?.map(t => ({
            ...t,
            requester: Array.isArray(t.profiles) ? t.profiles[0] : t.profiles
        })) || [];

        setTickets(processedData);

        if (selectedTicket) {
            const updated = processedData.find(t => t.id === selectedTicket.id);
            if (updated) setSelectedTicket(updated);
        }
    }

    async function fetchAdminData() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/login');
            return;
        }

        // 1. Check Admin/Freelancer Status (Level 2 or 3)
        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (!profileData || (profileData.access_level < 2)) {
            router.push('/dashboard/freelance-wordpress');
            return;
        }
        setProfile(profileData);

        // 2. Fetch Monthly Work Logs (Summary)
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { data: logs } = await supabase
            .from('work_logs')
            .select('minutes_spent')
            .gte('logged_at', startOfMonth.toISOString());

        const total = logs?.reduce((acc: number, log: any) => acc + log.minutes_spent, 0) || 0;
        setSummary({ totalMinutes: total });

        // 3. Initial tickets fetch
        await getTickets();

        setLoading(false);
    }

    useEffect(() => {
        fetchAdminData();
    }, [router]);

    useEffect(() => {
        if (!loading) getTickets();
    }, [filter]);

    const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
        const updateData: any = { status: newStatus };
        if (newStatus === 'Terminada') {
            updateData.finished_at = new Date().toISOString();
        }

        const { error } = await supabase
            .from('tickets')
            .update(updateData)
            .eq('id', ticketId);

        if (!error) getTickets();
    };

    const handleLogTime = async (ticketId: string, userId: string) => {
        const mins = parseInt(minutesToLog);
        if (isNaN(mins) || mins <= 0) return;
        setIsSubmitting(true);

        // 1. Insert Log
        const { error: logError } = await supabase
            .from('work_logs')
            .insert({
                ticket_id: ticketId,
                minutes_spent: mins,
                description: logDescription || 'Avance técnico'
            });

        if (!logError) {
            // 2. Update Ticket Total
            const ticket = tickets.find(t => t.id === ticketId);
            const newTotal = (ticket.total_minutes || 0) + mins;

            await supabase
                .from('tickets')
                .update({ total_minutes: newTotal })
                .eq('id', ticketId);

            // 3. Update User Profile Total
            const { data: userProfile } = await supabase
                .from('profiles')
                .select('total_minutes_used, total_usd_spent')
                .eq('id', userId)
                .single();

            const updatedMins = (userProfile?.total_minutes_used || 0) + mins;
            const updatedUsd = (updatedMins / 60) * 9;

            await supabase
                .from('profiles')
                .update({
                    total_minutes_used: updatedMins,
                    total_usd_spent: updatedUsd
                })
                .eq('id', userId);

            setMinutesToLog('');
            setLogDescription('');
            setIsLoggingTime(null);
            getTickets();
            fetchAdminData(); // Refresh totals
        } else {
            alert("Error al registrar tiempo: " + logError.message);
        }
        setIsSubmitting(false);
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'N/A';
        try {
            const d = new Date(dateStr);
            // Uso de formato UTC determinista para evitar caídas de hidratación entre el servidor y el cliente
            return `${d.getUTCDate().toString().padStart(2, '0')}/${(d.getUTCMonth() + 1).toString().padStart(2, '0')}/${d.getUTCFullYear()}`;
        } catch (e) {
            return 'N/A';
        }
    };

    if (loading) {
        return (
            <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)' }}>
                <p className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 600 }}>Cargando panel de Astrid...</p>
            </main>
        );
    }

    const totalHours = (summary.totalMinutes / 60).toFixed(1);
    const totalEarnings = ((summary.totalMinutes / 60) * 9).toFixed(2);

    return (
        <DashboardErrorBoundary>
            <main suppressHydrationWarning>
                <Navbar />
                <div className="container" style={{ paddingTop: 'calc(var(--header-height) + 2rem)', paddingBottom: '5rem' }}>
                    <header style={{ marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: '2.5rem' }}>Control de Solicitudes <span className="text-gradient">Astrid</span></h2>
                        <p style={{ color: 'var(--fg-muted)' }}>Gestión profesional de tickets y avances técnicos.</p>
                    </header>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2.5rem', alignItems: 'start' }} className="admin-layout">

                        {/* Active Tickets List */}
                        <section>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h3 style={{ margin: 0 }}>Gestión de Solicitudes</h3>
                                <div className="glass" style={{ padding: '0.4rem', borderRadius: '14px', display: 'flex', gap: '0.25rem' }}>
                                    {(['Pendiente', 'En Proceso', 'Terminada'] as const).map(f => (
                                        <button
                                            key={f}
                                            onClick={() => setFilter(f)}
                                            style={{
                                                padding: '0.5rem 1.25rem',
                                                borderRadius: '10px',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem',
                                                fontWeight: 600,
                                                background: filter === f ? 'var(--accent-primary)' : 'transparent',
                                                color: filter === f ? 'white' : 'var(--fg-muted)',
                                                transition: '0.2s'
                                            }}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {tickets.length === 0 ? (
                                    <div className="glass" style={{ padding: '5rem', textAlign: 'center', borderRadius: '24px', color: 'var(--fg-muted)' }}>
                                        No hay solicitudes en esta categoría.
                                    </div>
                                ) : (
                                    tickets.map(ticket => (
                                        <div
                                            key={ticket.id}
                                            className="glass"
                                            onClick={() => setSelectedTicket(ticket)}
                                            style={{
                                                padding: '1.5rem 2rem',
                                                borderRadius: '20px',
                                                display: 'grid',
                                                gridTemplateColumns: 'minmax(200px, 1fr) 150px 120px 100px',
                                                alignItems: 'center',
                                                gap: '1.5rem',
                                                cursor: 'pointer',
                                                transition: '0.2s',
                                                border: '1px solid rgba(255,255,255,0.05)'
                                            }}
                                        >
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem' }}>{ticket.title}</div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                                                        {ticket.requester?.full_name || ticket.requester?.email || 'Pendiente de Perfil'}
                                                    </span>
                                                    {ticket.requester?.email && ticket.requester?.full_name && (
                                                        <span style={{ fontSize: '0.85rem', color: 'var(--fg-muted)' }}>• {ticket.requester.email}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--fg-muted)', marginBottom: '0.25rem' }}>Estado</div>
                                                <span style={{
                                                    fontSize: '0.85rem',
                                                    fontWeight: 600,
                                                    color: ticket.status === 'Terminada' ? 'var(--accent-secondary)' : ticket.status === 'En Proceso' ? '#fbbf24' : 'white'
                                                }}>● {ticket.status || 'Pendiente'}</span>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--fg-muted)', marginBottom: '0.25rem' }}>Trabajado</div>
                                                <div style={{ fontWeight: 700 }}>{ticket.total_minutes || 0} min</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Detalles</button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>

                        {/* Time & Billing Sidebar */}
                        <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div className="glass" style={{ padding: '2.5rem', borderRadius: '32px' }}>
                                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Resumen Mensual (Astrid)</h3>
                                <div style={{ marginBottom: '2rem' }}>
                                    <small style={{ color: 'var(--fg-muted)', display: 'block', marginBottom: '0.5rem' }}>Horas Totales:</small>
                                    <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{totalHours} h</div>
                                </div>
                                <div style={{ marginBottom: '2rem' }}>
                                    <small style={{ color: 'var(--fg-muted)', display: 'block', marginBottom: '0.5rem' }}>Ingresos Brutos ($9/hr):</small>
                                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-secondary)' }}>${totalEarnings} <span style={{ fontSize: '0.9rem', color: 'var(--fg-muted)', fontWeight: 400 }}>USD</span></div>
                                </div>
                                <div style={{ paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--fg-muted)', lineHeight: '1.5' }}>
                                        Este es un cálculo automático basado en los registros de tiempo de este mes calendario.
                                    </p>
                                </div>
                            </div>

                            <div className="glass" style={{ padding: '2rem', borderRadius: '28px' }}>
                                <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Soporte & Pagos</h3>
                                <button className="btn-primary" style={{ width: '100%', padding: '0.8rem' }}>
                                    Ver Comprobantes Usuarios
                                </button>
                            </div>
                        </aside>
                    </div>
                </div>

                {/* TICKET DETAILS MODAL */}
                {selectedTicket && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                        background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 2000, padding: '1rem'
                    }}>
                        <div className="glass" style={{
                            width: '100%', maxWidth: '900px', height: '90vh',
                            borderRadius: '32px', display: 'grid', gridTemplateColumns: '1fr 320px',
                            overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            {/* Main Detail Area */}
                            <div style={{ padding: '3rem', overflowY: 'auto', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                                <button
                                    onClick={() => setSelectedTicket(null)}
                                    style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '10px', cursor: 'pointer', marginBottom: '2rem' }}
                                >← Volver al listado</button>

                                <div style={{ marginBottom: '2.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                        <span style={{
                                            padding: '0.4rem 1rem', borderRadius: '30px', background: 'rgba(79, 70, 229, 0.2)',
                                            color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase'
                                        }}>{selectedTicket.priority}</span>
                                        <select
                                            value={selectedTicket.status}
                                            onChange={(e) => handleUpdateStatus(selectedTicket.id, e.target.value)}
                                            style={{
                                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                                color: 'white', padding: '0.4rem 1rem', borderRadius: '10px', fontSize: '0.85rem'
                                            }}
                                        >
                                            <option value="Pendiente">Pendiente</option>
                                            <option value="En Proceso">En Proceso</option>
                                            <option value="Terminada">Terminada</option>
                                        </select>
                                    </div>
                                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{selectedTicket.title}</h2>
                                    <p style={{ color: 'var(--fg-muted)', fontSize: '1.1rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{selectedTicket.description}</p>
                                </div>

                                <div style={{ marginTop: '3rem' }}>
                                    <h4 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        Historial de Avances <span style={{ fontSize: '0.9rem', color: 'var(--accent-primary)', background: 'rgba(79, 70, 229, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>{selectedTicket.work_logs?.length || 0}</span>
                                    </h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {!selectedTicket.work_logs || selectedTicket.work_logs.length === 0 ? (
                                            <div style={{ color: 'var(--fg-muted)', fontSize: '0.9rem', fontStyle: 'italic', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                                                No hay avances registrados para esta solicitud.
                                            </div>
                                        ) : (
                                            selectedTicket.work_logs.map((log: any) => (
                                                <div key={log.id} style={{
                                                    background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '16px',
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                                }}>
                                                    <div>
                                                        <div style={{ fontSize: '0.95rem', marginBottom: '0.25rem' }}>{log.description}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--fg-muted)' }}>{formatDate(log.logged_at)}</div>
                                                    </div>
                                                    <div style={{ fontWeight: 800, color: 'var(--accent-primary)' }}>+{log.minutes_spent} min</div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right: User Info & Log Form */}
                            <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem', background: 'rgba(255,255,255,0.01)' }}>
                                <div className="glass" style={{ padding: '1.5rem', borderRadius: '24px' }}>
                                    <h5 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-muted)', marginBottom: '1rem' }}>Solicitante</h5>
                                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{selectedTicket.requester?.full_name || 'Sin Nombre'}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>{selectedTicket.requester?.email || 'Email Bloqueado / No disponible'}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--fg-muted)' }}>Creado el {formatDate(selectedTicket.created_at)}</div>
                                    {!selectedTicket.requester && (
                                        <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: '#ef4444', fontStyle: 'italic' }}>
                                            Nota: No tienes permisos RLS para ver los datos de este cliente.
                                        </div>
                                    )}
                                </div>

                                <div className="glass" style={{ padding: '1.5rem', borderRadius: '24px' }}>
                                    <h5 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-muted)', marginBottom: '1.25rem' }}>Añadir Avance</h5>
                                    <form onSubmit={(e) => { e.preventDefault(); handleLogTime(selectedTicket.id, selectedTicket.user_id); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <div style={{ flex: 1 }}>
                                                <label style={{ fontSize: '0.75rem', color: 'var(--fg-muted)', display: 'block', marginBottom: '0.4rem' }}>Minutos</label>
                                                <input
                                                    type="number" required placeholder="0"
                                                    value={minutesToLog} onChange={(e) => setMinutesToLog(e.target.value)}
                                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', color: 'var(--fg-muted)', display: 'block', marginBottom: '0.4rem' }}>Descripción del trabajo</label>
                                            <textarea
                                                required rows={3} placeholder="¿Qué avance se realizó?"
                                                value={logDescription} onChange={(e) => setLogDescription(e.target.value)}
                                                style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', resize: 'none', fontSize: '0.85rem' }}
                                            />
                                        </div>
                                        <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ padding: '0.8rem', width: '100%', borderRadius: '12px' }}>
                                            {isSubmitting ? 'Guardando...' : 'Registrar Avance'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </DashboardErrorBoundary>
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
