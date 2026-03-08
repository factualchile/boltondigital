'use client';

import { useEffect, useState } from 'react';
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { useRouter } from 'next/navigation';

export default function AstridAdminDashboard() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [filter, setFilter] = useState<'Pendiente' | 'Terminada' | 'En Proceso'>('Pendiente');
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [summary, setSummary] = useState({ totalMinutes: 0 });
    const [isLoggingTime, setIsLoggingTime] = useState<string | null>(null);
    const [minutesToLog, setMinutesToLog] = useState<string>('');
    const [logDescription, setLogDescription] = useState<string>('');
    const router = useRouter();

    async function getTickets() {
        const { data } = await supabase
            .from('tickets')
            .select(`
                *,
                profiles (full_name, email)
            `)
            .eq('status', filter)
            .order('created_at', { ascending: false });

        setTickets(data || []);
    }

    async function fetchAdminData() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/login');
            return;
        }

        // 1. Check Admin Status
        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (!profileData || (profileData.role !== 'freelancer' && profileData.role !== 'admin')) {
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

        // 1. Insert Log with Description
        const { error: logError } = await supabase
            .from('work_logs')
            .insert({
                ticket_id: ticketId,
                minutes_spent: mins,
                description: logDescription
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
            const updatedUsd = (updatedMins / 60) * 7;

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
            fetchAdminData();
        } else {
            alert("Error al registrar tiempo: " + logError.message);
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
    const totalEarnings = ((summary.totalMinutes / 60) * 7).toFixed(2);

    return (
        <main>
            <Navbar />
            <div className="container" style={{ paddingTop: 'calc(var(--header-height) + 2rem)' }}>
                <header style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '2.5rem' }}>Panel de Control <span className="text-gradient">Astrid</span></h2>
                    <p style={{ color: 'var(--fg-muted)' }}>Gestión de solicitudes y registro de tiempos técnicos.</p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>

                    {/* Active Tickets List */}
                    <section>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0 }}>Gestión de Solicitudes</h3>
                            <div className="glass" style={{ padding: '0.5rem', borderRadius: '12px', display: 'flex', gap: '0.5rem' }}>
                                {(['Pendiente', 'En Proceso', 'Terminada'] as const).map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        style={{
                                            padding: '0.4rem 1rem',
                                            borderRadius: '8px',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                            background: filter === f ? 'var(--accent-primary)' : 'transparent',
                                            color: filter === f ? 'white' : 'var(--fg-muted)',
                                            transition: 'var(--transition-smooth)'
                                        }}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="glass" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                        <th style={{ padding: '1.5rem' }}>Usuario</th>
                                        <th style={{ padding: '1.5rem' }}>Detalle Solicitud</th>
                                        <th style={{ padding: '1.5rem' }}>Estado</th>
                                        <th style={{ padding: '1.5rem' }}>Tiempo</th>
                                        <th style={{ padding: '1.5rem' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tickets.map(ticket => (
                                        <tr key={ticket.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '1.5rem' }}>
                                                <div style={{ fontWeight: 600 }}>{ticket.profiles?.full_name}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--fg-muted)' }}>{ticket.profiles?.email}</div>
                                            </td>
                                            <td style={{ padding: '1.5rem' }}>
                                                <div style={{ fontWeight: 600 }}>{ticket.title}</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--fg-muted)', marginTop: '0.25rem' }}>
                                                    {ticket.description}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.5rem' }}>
                                                <select
                                                    value={ticket.status}
                                                    onChange={(e) => handleUpdateStatus(ticket.id, e.target.value)}
                                                    style={{
                                                        background: 'rgba(255,255,255,0.05)',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        color: 'white',
                                                        padding: '0.4rem 0.8rem',
                                                        borderRadius: '8px',
                                                        outline: 'none'
                                                    }}>
                                                    <option value="Pendiente">Pendiente</option>
                                                    <option value="En Proceso">En Proceso</option>
                                                    <option value="Terminada">Terminada</option>
                                                </select>
                                            </td>
                                            <td style={{ padding: '1.5rem' }}>
                                                {ticket.total_minutes} min
                                            </td>
                                            <td style={{ padding: '1.5rem' }}>
                                                {isLoggingTime === ticket.id ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '150px' }}>
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <input
                                                                type="number" autoFocus placeholder="Min"
                                                                value={minutesToLog} onChange={(e) => setMinutesToLog(e.target.value)}
                                                                style={{ width: '60px', padding: '0.4rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--accent-primary)', color: 'white' }}
                                                            />
                                                            <button onClick={() => handleLogTime(ticket.id, ticket.user_id)} className="btn-primary" style={{ padding: '0.4rem', flex: 1 }}>Registrar</button>
                                                            <button onClick={() => setIsLoggingTime(null)} style={{ background: 'none', border: 'none', color: '#ef4444' }}>✕</button>
                                                        </div>
                                                        <input
                                                            type="text" placeholder="¿Qué hiciste?"
                                                            value={logDescription} onChange={(e) => setLogDescription(e.target.value)}
                                                            style={{ width: '100%', padding: '0.4rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.8rem' }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setIsLoggingTime(ticket.id)}
                                                        className="btn-primary"
                                                        style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                                                    >
                                                        + Log
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {tickets.length === 0 && (
                                        <tr>
                                            <td colSpan={5} style={{ padding: '4rem', textAlign: 'center', color: 'var(--fg-muted)' }}>No hay solicitudes registradas aún.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Time & Billing Sidebar */}
                    <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div className="glass" style={{ padding: '2rem', borderRadius: '28px' }}>
                            <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Resumen Mensual (Astrid)</h3>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <small style={{ color: 'var(--fg-muted)' }}>Horas Totales del Mes:</small>
                                <div style={{ fontSize: '2rem', fontWeight: 800 }}>{totalHours} h</div>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <small style={{ color: 'var(--fg-muted)' }}>Ingresos Calculados ($7/hr):</small>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-secondary)' }}>${totalEarnings} <span style={{ fontSize: '0.9rem', color: 'var(--fg-muted)' }}>USD</span></div>
                            </div>
                        </div>

                        <div className="glass" style={{ padding: '2rem', borderRadius: '28px' }}>
                            <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Pagos de Usuarios</h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--fg-muted)', marginBottom: '1.5rem' }}>
                                Revisa los comprobantes de PayPal subidos por los clientes.
                            </p>
                            <button className="btn-primary" style={{ width: '100%' }}>
                                Revisar Comprobantes
                            </button>
                        </div>
                    </aside>
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
