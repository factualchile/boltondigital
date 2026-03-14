import { supabase } from '@/lib/supabase';
import LandingRenderer from '@/components/LandingRenderer';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface Props {
    params: { id: string };
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
    const site = await getSiteData(params.id);
    if (!site) return { title: 'Sitio no encontrado - Bolton Pages' };

    return {
        title: site.site_config.header_title || site.name,
        description: site.site_config.bio_summary || 'Landing Page creada con Bolton Pages',
    };
}

export default async function PublicLandingPage({ params }: Props) {
    const site = await getSiteData(params.id);

    if (!site) {
        notFound();
    }

    return (
        <main>
            <LandingRenderer data={site.site_config} />
        </main>
    );
}
