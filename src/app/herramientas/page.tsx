import Navbar from "@/components/Navbar";
import Link from "next/link";

const tools = [
    {
        id: "freelance-wordpress",
        title: "Freelance Experta WordPress",
        description: "Acceso directo a Astrid, experta en edición y optimización de sitios WordPress. Soporte técnico por hora.",
        price: "$9 / hora",
        tags: ["WordPress", "Soporte", "Freelance"],
        href: "/herramientas/freelance-wordpress"
    },
    {
        id: "marketing-strategy",
        title: "AI Strategy Planner",
        description: "Generador de planes de marketing integrales impulsado por IA. Próximamente.",
        price: "Premium",
        tags: ["IA", "Estrategia", "Marketing"],
        href: "#",
        disabled: true
    },
    {
        id: "google-ads-inteligente",
        title: "Google Ads Inteligente",
        description: "Conecta tu cuenta y optimiza tus campañas con IA basada en la metodología de Claudio. Simple, claro y estratégico.",
        price: "Premium",
        tags: ["Google Ads", "IA", "Automatización"],
        href: "/herramientas/google-ads-inteligente"
    }
];

export default function HerramientasPage() {
    return (
        <main>
            <Navbar />
            <section className="container" style={{ paddingTop: 'calc(var(--header-height) + 4rem)' }}>
                <header style={{ textAlign: 'center', marginBottom: '5rem' }}>
                    <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>
                        Marketplace de <span className="text-gradient">Herramientas</span>
                    </h1>
                    <p style={{ color: 'var(--fg-muted)', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto' }}>
                        Soluciones concretas impulsadas por expertos y tecnología de vanguardia para escalar tu negocio digital.
                    </p>
                </header>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    gap: '2.5rem'
                }}>
                    {tools.map((tool) => (
                        <div key={tool.id} className="glass" style={{
                            padding: '2.5rem',
                            borderRadius: '28px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            opacity: tool.disabled ? 0.6 : 1,
                            transition: 'var(--transition-smooth)',
                            border: tool.disabled ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <div>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                    {tool.tags.map(tag => (
                                        <span key={tag} style={{
                                            fontSize: '0.75rem',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '50px',
                                            background: 'rgba(99, 102, 241, 0.1)',
                                            color: 'var(--accent-primary)',
                                            fontWeight: 600
                                        }}>{tag}</span>
                                    ))}
                                </div>
                                <h3 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>{tool.title}</h3>
                                <p style={{ color: 'var(--fg-muted)', lineHeight: 1.6, marginBottom: '2rem' }}>{tool.description}</p>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>{tool.price}</span>
                                {tool.disabled ? (
                                    <span style={{ color: 'var(--fg-muted)', fontWeight: 600 }}>Próximamente</span>
                                ) : (
                                    <Link href={tool.href} className="btn-primary" style={{ padding: '0.6rem 1.5rem' }}>
                                        Acceder
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}
