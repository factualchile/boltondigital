import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="glass" style={{
            position: 'fixed',
            top: 0,
            width: '100%',
            height: 'var(--header-height)',
            display: 'flex',
            alignItems: 'center',
            zIndex: 1000,
        }}>
            <div className="container" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%'
            }}>
                <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 800 }} className="font-heading">
                    BOLTON<span className="text-gradient">DIGITAL</span>
                </Link>

                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <Link href="#servicios" style={{ fontWeight: 500, color: 'var(--fg-muted)' }}>Servicios</Link>
                    <Link href="#ia-tools" style={{ fontWeight: 500, color: 'var(--fg-muted)' }}>Herramientas IA</Link>
                    <Link href="#contacto" className="btn-primary" style={{ padding: '0.5rem 1.5rem' }}>
                        Empieza Ahora
                    </Link>
                </div>
            </div>
        </nav>
    );
}
