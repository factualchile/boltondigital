'use client';

import { useEffect, useState } from 'react';
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalHours: 0,
        totalTickets: 0,
        activeTickets: 0
    });
    const router = useRouter();

    const fetchAdminData = async () => {
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                router.push('/login');
                return;
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('role, access_level')
                .eq('id', user.id)
                .single();

            // Strict authorization check for Level 3 / admin
            if (!profile || (profile.role !== 'admin' && profile.access_level !== 3)) {
                router.push('/dashboard/freelance-wordpress');
                return;
            }

            // Safely fetch data
            const [profilesRes, ticketsRes] = await Promise.all([
                supabase.from('profiles').select('*').order('created_at', { ascending: false }),
                supabase.from('tickets').select('id, status')
            ]);

            const profileData = profilesRes.data || [];
            const ticketData = ticketsRes.data || [];

            setUsers(profileData);

            // Calculate exact stats defensively
            const safeRevenue = profileData.reduce((acc, p) => acc + (Number(p.total_usd_spent) || 0), 0);
            const safeHours = (profileData.reduce((acc, p) => acc + (Number(p.total_minutes_used) || 0), 0)) / 60;
            const activeTix = ticketData.filter(t => t.status !== 'Terminada').length;

            setStats({
                totalRevenue: Number(safeRevenue) || 0,
                totalHours: Number(safeHours) || 0,
                totalTickets: ticketData.length,
                activeTickets: activeTix
            });

        } catch (error) {
            console.error("Error cargando dashboard /admin:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminData();
    }, [router]);

    const handleUpdateAccessLevel = async (userId: string, newLevel: number) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    access_level: newLevel,
                    role: newLevel === 3 ? 'admin' : newLevel === 2 ? 'freelancer' : 'user'
                })
                .eq('id', userId);

            if (error) throw error;

            // Re-fetch only users to update UI quickly
            fetchAdminData();
        } catch (error: any) {
            alert("Error al actualizar nivel de acceso: " + error.message);
        }
    };

    if (loading) {
        return (
            <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)' }}>
                <p className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 600 }}>Iniciando entorno seguro...</p>
            </main>
        );
    }

    return (
        <main>
            <Navbar />
            <div className="container" style={{ paddingTop: 'calc(var(--header-height) + 2rem)' }}>
                <header style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '2.5rem' }}>Dashboard <span className="text-gradient">General</span></h2>
                    <p style={{ color: 'var(--fg-muted)' }}>Métricas limpias y control de accesos de la plataforma.</p>
                </header>

                {/* Secure Metrics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
                    <div className="glass" style={{ padding: '2rem', borderRadius: '24px' }}>
                        <small style={{ color: 'var(--fg-muted)', display: 'block', marginBottom: '0.75rem' }}>Ingresos Totales (Bruto)</small>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-secondary)' }}>${stats.totalRevenue.toFixed(2)} USD</div>
                    </div>
                    <div className="glass" style={{ padding: '2rem', borderRadius: '24px' }}>
                        <small style={{ color: 'var(--fg-muted)', display: 'block', marginBottom: '0.75rem' }}>Horas Trabajadas</small>
                        <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.totalHours.toFixed(1)} h</div>
                    </div>
                    <div className="glass" style={{ padding: '2rem', borderRadius: '24px' }}>
                        <small style={{ color: 'var(--fg-muted)', display: 'block', marginBottom: '0.75rem' }}>Tickets en Curso</small>
                        <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.activeTickets}</div>
                    </div>
                </div>

                {/* Safe User Management List */}
                <section style={{ marginBottom: '4rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Base de Datos de Usuarios</h3>
                    <div className="glass table-responsive" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <th style={{ padding: '1.5rem' }}>Nombre / Contacto</th>
                                    <th style={{ padding: '1.5rem' }}>Rol Asignado</th>
                                    <th style={{ padding: '1.5rem' }}>Cambiar Nivel de Acceso</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: 'var(--fg-muted)' }}>Buscando usuarios...</td>
                                    </tr>
                                ) : (
                                    users.map((u) => (
                                        <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '1.5rem' }}>
                                                <div style={{ fontWeight: 600 }}>{u.full_name || 'Usuario Nuevo'}</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--fg-muted)' }}>{u.email}</div>
                                            </td>
                                            <td style={{ padding: '1.5rem' }}>
                                                <span style={{
                                                    padding: '0.4rem 0.8rem',
                                                    borderRadius: '20px',
                                                    fontSize: '0.8rem',
                                                    background: u.access_level === 3 ? 'rgba(239, 68, 68, 0.1)' : u.access_level === 2 ? 'rgba(79, 70, 229, 0.1)' : 'rgba(255,255,255,0.05)',
                                                    color: u.access_level === 3 ? '#ef4444' : u.access_level === 2 ? '#6366f1' : 'var(--fg-muted)'
                                                }}>
                                                    Nivel {u.access_level || 1}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1.5rem' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <BadgeButton onClick={() => handleUpdateAccessLevel(u.id, 1)} active={u.access_level === 1} label="Nvl 1" />
                                                    <BadgeButton onClick={() => handleUpdateAccessLevel(u.id, 2)} active={u.access_level === 2} label="Nvl 2" />
                                                    <BadgeButton onClick={() => handleUpdateAccessLevel(u.id, 3)} active={u.access_level === 3} label="Nvl 3" />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </main>
    );
}

// Small helper component for clean UI
function BadgeButton({ onClick, active, label }: { onClick: () => void, active: boolean, label: string }) {
    return (
        <button
            onClick={onClick}
            style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: active ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.05)',
                color: active ? 'white' : 'var(--fg-muted)',
                transition: 'all 0.2s ease'
            }}
        >
            {label}
        </button>
    );
}
