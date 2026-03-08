import Navbar from "@/components/Navbar";

export default function AstridAdminDashboard() {
    const incomingTickets = [
        { id: 1, user: "Claudio F.", title: "Error en plugin de contacto", priority: "Alta", status: "In Progress", time: 45 },
        { id: 2, user: "Juan P.", title: "Optimización de imágenes Home", priority: "Media", status: "Pending", time: 0 },
    ];

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
                        <h3 style={{ marginBottom: '1.5rem' }}>Solicitudes Entrantes</h3>
                        <div className="glass" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                        <th style={{ padding: '1.5rem' }}>Usuario</th>
                                        <th style={{ padding: '1.5rem' }}>Solicitud</th>
                                        <th style={{ padding: '1.5rem' }}>Estado</th>
                                        <th style={{ padding: '1.5rem' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {incomingTickets.map(ticket => (
                                        <tr key={ticket.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '1.5rem' }}>{ticket.user}</td>
                                            <td style={{ padding: '1.5rem' }}>
                                                <div style={{ fontWeight: 600 }}>{ticket.title}</div>
                                                <small style={{ color: 'var(--fg-muted)' }}>Prioridad: {ticket.priority}</small>
                                            </td>
                                            <td style={{ padding: '1.5rem' }}>
                                                <select defaultValue={ticket.status} style={{
                                                    background: 'rgba(255,255,255,0.05)',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    color: 'white',
                                                    padding: '0.4rem 0.8rem',
                                                    borderRadius: '8px'
                                                }}>
                                                    <option value="Pending">Pendiente</option>
                                                    <option value="In Progress">En Proceso</option>
                                                    <option value="Completed">Terminada</option>
                                                </select>
                                            </td>
                                            <td style={{ padding: '1.5rem' }}>
                                                <button className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                                                    Registrar Tiempo
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Time & Billing Sidebar */}
                    <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div className="glass" style={{ padding: '2rem', borderRadius: '28px' }}>
                            <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Resumen Mensual</h3>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <small style={{ color: 'var(--fg-muted)' }}>Horas Totales:</small>
                                <div style={{ fontSize: '2rem', fontWeight: 800 }}>24.5 h</div>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <small style={{ color: 'var(--fg-muted)' }}>Ingresos Facturados:</small>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-secondary)' }}>$171.50 <span style={{ fontSize: '0.9rem', color: 'var(--fg-muted)' }}>USD</span></div>
                            </div>
                        </div>

                        <div className="glass" style={{ padding: '2rem', borderRadius: '28px' }}>
                            <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Verificación de Pagos</h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--fg-muted)', marginBottom: '1.5rem' }}>
                                Revisa los comprobantes subidos por los usuarios para validar su saldo.
                            </p>
                            <button className="glass" style={{
                                width: '100%',
                                padding: '0.8rem',
                                borderRadius: '12px',
                                fontWeight: 600,
                                color: 'white',
                                cursor: 'pointer'
                            }}>
                                Ver 3 Comprobantes Pendientes
                            </button>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}
