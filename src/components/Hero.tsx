export default function Hero() {
    return (
        <section style={{
            position: 'relative',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            paddingTop: 'var(--header-height)',
            overflow: 'hidden'
        }}>
            {/* Background Decoration */}
            <div style={{
                position: 'absolute',
                top: '-10%',
                right: '-10%',
                width: '500px',
                height: '500px',
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
                borderRadius: '50%',
                zIndex: -1,
            }} />
            <div style={{
                position: 'absolute',
                bottom: '10%',
                left: '-5%',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(0, 242, 254, 0.1) 0%, transparent 70%)',
                borderRadius: '50%',
                zIndex: -1,
            }} />

            <div className="container">
                <div style={{ maxWidth: '800px' }}>
                    <h1 style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', lineHeight: 1.1, marginBottom: '2rem' }}>
                        Claridad <span className="text-gradient">Estratégica</span>.<br />
                        Innovación con <span className="text-gradient">IA</span>.
                    </h1>
                    <p style={{
                        fontSize: '1.25rem',
                        color: 'var(--fg-muted)',
                        marginBottom: '3rem',
                        lineHeight: 1.6,
                        maxWidth: '600px'
                    }}>
                        La agencia boutique de marketing digital que fusiona estrategia de alto nivel
                        con tecnología de vanguardia para resolver los desafíos más complejos de tu negocio.
                    </p>

                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                        <button className="btn-primary">Explorar Soluciones</button>
                        <button className="glass" style={{
                            padding: '0.8rem 2rem',
                            borderRadius: '50px',
                            fontWeight: 600,
                            color: 'var(--fg-main)',
                            cursor: 'pointer'
                        }}>
                            Ver Agencia
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
