'use client';

import { useEffect, useState } from 'react';
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { useRouter } from 'next/navigation';

export default function SuperAdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalHours: 0,
        avgCompletionTime: 0,
        activeTickets: 0,
        totalTickets: 0
    });
    const [recentLogs, setRecentLogs] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [astridEfficiency, setAstridEfficiency] = useState<any[]>([]);
    const router = useRouter();

    async function fetchData() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/login');
            return;
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role, access_level')
            .eq('id', user.id)
            .single();

        if (!profile || (profile.role !== 'admin' && profile.access_level !== 3)) {
            router.push('/dashboard/freelance-wordpress');
            return;
        }

        // 1. Basic Stats
        const { data: tickets } = await supabase.from('tickets').select('*');
        const { data: profiles } = await supabase
            .from('profiles')
            .select('*')
            .order('updated_at', { ascending: false });

        setUsers(profiles || []);

        const totalRevenue = profiles?.reduce((acc, p) => acc + (Number(p.total_usd_spent) || 0), 0) || 0;
        const totalHours = (profiles?.reduce((acc, p) => acc + (Number(p.total_minutes_used) || 0), 0) || 0) / 60;

        // 2. Efficiency (Avg time per ticket)
        const finishedTickets = tickets?.filter(t => t.status === 'Terminada' && t.finished_at) || [];
        const totalSeconds = finishedTickets.reduce((acc, t) => {
            const start = new Date(t.created_at).getTime();
            const end = new Date(t.finished_at).getTime();
            return acc + (end - start) / 1000;
        }, 0);
        const avgCompletionTime = finishedTickets.length > 0 ? (totalSeconds / finishedTickets.length / 3600) : 0;

        setStats({
            totalRevenue,
            totalHours,
            avgCompletionTime,
            activeTickets: tickets?.filter(t => t.status !== 'Terminada').length || 0,
            totalTickets: tickets?.length || 0
        });

        // 3. Recent Movement Logs (Work Logs)
        const { data: logs } = await supabase
            .from('work_logs')
            .select(`
                *,
                tickets (title, user_id, profiles!user_id (full_name))
            `)
            .order('logged_at', { ascending: false })
            .limit(10);

        setRecentLogs(logs || []);

        setLoading(false);
    }

    const handleUpdateAccessLevel = async (userId: string, newLevel: number) => {
        const { error } = await supabase
            .from('profiles')
            .update({
                access_level: newLevel,
                role: newLevel === 3 ? 'admin' : newLevel === 2 ? 'freelancer' : 'user'
            })
            .eq('id', userId);

        if (!error) {
            fetchData();
        } else {
            alert("Error al actualizar nivel: " + error.message);
        }
    };

    useEffect(() => {
        fetchData();
    }, [router]);

    if (loading) {
        return (
            <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)' }}>
                <p className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 600 }}>Cargando Panel de Administración...</p>
            </main>
        );
    }

    return (
        <main>
            <Navbar />
            <div className="container" style={{ paddingTop: 'calc(var(--header-height) + 2rem)' }}>
                <header style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '2.5rem' }}>Dashboard <span className="text-gradient">Super Admin</span></h2>
                    <p style={{ color: 'var(--fg-muted)' }}>Métricas globales del negocio y rendimiento técnico.</p>
                </header>

                {/* Metrics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                    <MetricCard label="Ingresos Totales" value={`$${(stats.totalRevenue || 0).toFixed(2)} USD`} color="var(--accent-secondary)" />
                    <MetricCard label="Horas Producidas" value={`${(stats.totalHours || 0).toFixed(1)} h`} />
                    <MetricCard label="Tiempo Promedio Ticket" value={`${(stats.avgCompletionTime || 0).toFixed(1)} h`} />
                    <MetricCard label="Tickets Activos" value={stats.activeTickets || 0} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    {/* Recent Activities */}
                    <section>
                        <h3 style={{ marginBottom: '1.5rem' }}>Registro de Movimientos (Astrid)</h3>
                        <div className="glass table-responsive" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                        <th style={{ padding: '1.5rem' }}>Fecha/Hora</th>
                                        <th style={{ padding: '1.5rem' }}>Cliente</th>
                                        <th style={{ padding: '1.5rem' }}>Ticket</th>
                                        <th style={{ padding: '1.5rem' }}>Tiempo</th>
                                        <th style={{ padding: '1.5rem' }}>Descripción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentLogs.map((log) => (
                                        <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '1.5rem', fontSize: '0.85rem' }}>
                                                {new Date(log.logged_at).toLocaleString()}
                                            </td>
                                            <td style={{ padding: '1.5rem', fontWeight: 600 }}>
                                                {log.tickets?.profiles?.full_name}
                                            </td>
                                            <td style={{ padding: '1.5rem', fontSize: '0.9rem' }}>
                                                {log.tickets?.title}
                                            </td>
                                            <td style={{ padding: '1.5rem', color: 'var(--accent-primary)', fontWeight: 700 }}>
                                                {log.minutes_spent} min
                                            </td>
                                            <td style={{ padding: '1.5rem', fontSize: '0.85rem', color: 'var(--fg-muted)' }}>
                                                {log.description}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Stats Sidebar */}
                    <aside>
                        <div className="glass" style={{ padding: '2rem', borderRadius: '24px' }}>
                            <h3 style={{ marginBottom: '1.5rem' }}>Resumen de Eficiencia</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <small style={{ color: 'var(--fg-muted)' }}>Total Tickets Históricos:</small>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.totalTickets}</div>
                                </div>
                                <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Eficiencia Astrid:</p>
                                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ width: '85%', height: '100%', background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))' }}></div>
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--fg-muted)', marginTop: '0.5rem' }}>Basado en tiempo de respuesta y cierre de tickets.</p>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>

                {/* User Management Section */}
                <section style={{ marginTop: '4rem', marginBottom: '4rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Gestión de Usuarios y Accesos</h3>
                    <div className="glass table-responsive" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <th style={{ padding: '1.5rem' }}>Usuario</th>
                                    <th style={{ padding: '1.5rem' }}>Email</th>
                                    <th style={{ padding: '1.5rem' }}>Nivel de Acceso</th>
                                    <th style={{ padding: '1.5rem' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '1.5rem', fontWeight: 600 }}>{u.full_name || 'Sin nombre'}</td>
                                        <td style={{ padding: '1.5rem', color: 'var(--fg-muted)' }}>{u.email}</td>
                                        <td style={{ padding: '1.5rem' }}>
                                            <span style={{
                                                padding: '0.4rem 0.8rem',
                                                borderRadius: '20px',
                                                fontSize: '0.8rem',
                                                background: u.access_level === 3 ? 'rgba(239, 68, 68, 0.1)' : u.access_level === 2 ? 'rgba(79, 70, 229, 0.1)' : 'rgba(255,255,255,0.05)',
                                                color: u.access_level === 3 ? '#ef4444' : u.access_level === 2 ? '#6366f1' : 'var(--fg-muted)',
                                                border: '1px solid rgba(255,255,255,0.1)'
                                            }}>
                                                Nivel {u.access_level} ({u.role})
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.5rem' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => handleUpdateAccessLevel(u.id, 1)} className="glass" style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', cursor: 'pointer' }}>Nivel 1</button>
                                                <button onClick={() => handleUpdateAccessLevel(u.id, 2)} className="glass" style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', cursor: 'pointer' }}>Nivel 2</button>
                                                <button onClick={() => handleUpdateAccessLevel(u.id, 3)} className="glass" style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', cursor: 'pointer' }}>Nivel 3</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </main>
    );
}

function MetricCard({ label, value, color }: { label: string, value: string | number, color?: string }) {
    return (
        <div className="glass" style={{ padding: '2rem', borderRadius: '24px' }}>
            <small style={{ color: 'var(--fg-muted)', display: 'block', marginBottom: '0.75rem' }}>{label}</small>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: color || 'white' }}>{value}</div>
        </div>
    );
}
