import { supabase } from '@/lib/supabase';
import LandingRenderer from '@/components/LandingRenderer';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface Props {
    params: Promise<{ id: string }>;
}

async function getSiteData(id: string) {
    const { data, error } = await supabase
        .from('client_sites')
        .select('*')
        .eq('id', id)
        .single();
    
    if (error || !data) return null;
    return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const site = await getSiteData(id);
    if (!site) return { title: 'Sitio no encontrado - Bolton Pages' };
    return {
        title: site.site_config?.header_title || site.name || 'Bolton Pages',
        description: site.site_config?.bio_summary || 'Sitio creado con Bolton Pages',
    };
}

export default async function PublicBoltonPage({ params }: Props) {
    const { id } = await params;
    
    console.log('--- PublicBoltonPage Debug ---');
    console.log('ID requested:', id);
    
    const { data: site, error } = await supabase
        .from('client_sites')
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (error) {
        console.error('Supabase error:', error.message);
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h1 style={{ color: '#ef4444' }}>Error al conectar con la base de datos</h1>
                <p>{error.message}</p>
                <p style={{ fontSize: '0.8rem', color: '#666' }}>ID: {id}</p>
            </div>
        );
    }

    if (!site) {
        console.warn('Site not found in DB for ID:', id);
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h1>Sitio no encontrado</h1>
                <p>El identificador de página no existe en nuestra base de datos.</p>
                <p style={{ fontSize: '0.8rem', color: '#666' }}>ID: {id}</p>
            </div>
        );
    }

    console.log('Site found successfully:', site.name);
    return <LandingRenderer data={site.site_config} />;
}
