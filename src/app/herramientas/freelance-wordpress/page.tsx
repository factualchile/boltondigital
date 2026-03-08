import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function FreelanceWordpressPage() {
    return (
        <main>
            <Navbar />
            <section className="container" style={{ paddingTop: 'calc(var(--header-height) + 4rem)' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <header style={{ marginBottom: '4rem' }}>
                        <Link href="/herramientas" style={{ color: 'var(--accent-primary)', textDecoration: 'none', marginBottom: '1rem', display: 'inline-block' }}>
                            ← Volver al Marketplace
                        </Link>
                        <h1 style={{ fontSize: '3rem', marginTop: '1rem' }}>
                            Freelance Expert en <span className="text-gradient">WordPress</span>
                        </h1>
                        <p style={{ fontSize: '1.25rem', color: 'var(--fg-muted)', marginTop: '1rem' }}>
                            Soluciones técnicas de alta calidad directamente de Astrid. Edición, optimización y soporte experto.
                        </p>
                    </header>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '3rem' }}>
                        <div className="glass" style={{ padding: '2.5rem', borderRadius: '32px' }}>
                            <h2 style={{ marginBottom: '1.5rem' }}>Beneficios</h2>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                <BenefitItem title="Experiencia Senior" desc="Astrid es experta en el ecosistema WordPress, desde plugins hasta plantillas personalizadas." />
                                <BenefitItem title="Transparencia Total" desc="Paga solo por el tiempo real invertido. Registro de minutos exactos en cada ticket." />
                                <BenefitItem title="Dashboard Profesional" desc="Gestiona tus solicitudes y pagos en un solo lugar con claridad técnica." />
                                <BenefitItem title="Tarifa Competitiva" desc="Soporte premium a una tarifa de $9 USD por hora de trabajo real." />
                            </ul>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div className="glass" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid var(--accent-primary)' }}>
                                <h3 style={{ marginBottom: '1rem' }}>Inicia tu Solicitud</h3>
                                <p style={{ color: 'var(--fg-muted)', marginBottom: '1.5rem' }}>Para crear tickets y gestionar tus abonos, necesitas iniciar sesión.</p>
                                <Link href="/login" className="btn-primary" style={{ display: 'block', textAlign: 'center' }}>
                                    Iniciar Sesión
                                </Link>
                                <p style={{ fontSize: '0.8rem', textAlign: 'center', marginTop: '1rem', color: 'var(--fg-muted)' }}>
                                    ¿No tienes cuenta? <Link href="/register" style={{ color: 'var(--accent-primary)' }}>Regístrate</Link>
                                </p>
                            </div>

                            <div className="glass" style={{ padding: '2rem', borderRadius: '24px' }}>
                                <h3 style={{ marginBottom: '0.5rem' }}>Tarifa Única</h3>
                                <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>$9 <span style={{ fontSize: '1rem', color: 'var(--fg-muted)', fontWeight: 400 }}>/ hora</span></span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

function BenefitItem({ title, desc }: { title: string, desc: string }) {
    return (
        <li style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ color: 'var(--accent-secondary)', marginBottom: '0.25rem' }}>{title}</h4>
            <p style={{ color: 'var(--fg-muted)', fontSize: '0.95rem' }}>{desc}</p>
        </li>
    );
}
