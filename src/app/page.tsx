import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <>
      <main>
        <Navbar />
        <Hero />

        {/* Services Section Placeholder */}
        <section id="servicios" className="container">
          <h2 style={{ fontSize: '3rem', marginBottom: '4rem', textAlign: 'center' }}>
            Nuestras <span className="text-gradient">Especialidades</span>
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            <ServiceCard
              title="Estrategia & Marketing"
              desc="Planes detallados y ejecución de alto nivel para posicionar tu marca en el top del mercado."
            />
            <ServiceCard
              title="Optimización de Ventas"
              desc="Funnels y procesos optimizados con IA para maximizar la conversión en cada punto de contacto."
            />
            <ServiceCard
              title="Herramientas IA"
              desc="Desarrollo de soluciones personalizadas que resuelven problemas específicos de logística y ventas."
            />
          </div>
        </section>
      </main>
      <footer style={{ padding: '2rem', opacity: 0.2, fontSize: '0.8rem', textAlign: 'center' }}>
        <a href="/test-v123" style={{ color: 'inherit', textDecoration: 'none' }}>Debug Deployment v123</a>
      </footer>
    </>
  );
}

function ServiceCard({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="glass" style={{ padding: '3rem', borderRadius: '24px' }}>
      <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>{title}</h3>
      <p style={{ color: 'var(--fg-muted)', lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}
