import React from 'react';
import { Zap } from 'lucide-react';

interface LandingData {
    primary_color: string;
    secondary_color: string;
    font_family: string;
    header_title: string;
    phone: string;
    location_text: string;
    professional_name: string;
    profile_image: string;
    bio_summary: string;
    expert_subtitle: string;
    areas_of_expertise: string;
    warranty_text: string;
    cta_text_outline: string;
    cta_text_filled: string;
    whatsapp_number: string;
}

export default function LandingRenderer({ data, isMobile = false }: { data: LandingData, isMobile?: boolean }) {
    return (
        <div style={{ 
            width: '100%',
            minHeight: '100vh',
            background: 'white',
            display: 'flex',
            flexDirection: 'column',
            color: '#333',
            fontFamily: `${data.font_family}, sans-serif`,
            position: 'relative',
            overflowX: 'hidden'
        }}>
            {/* Header Azul */}
            <div style={{ 
                background: data.primary_color, 
                color: 'white', 
                padding: '1rem 2rem', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <div style={{ fontSize: isMobile ? '1.2rem' : '1.5rem', fontWeight: 700 }}>{data.header_title}</div>
                <a href={`tel:${data.phone}`} style={{ color: 'white', fontSize: isMobile ? '1rem' : '1.2rem', fontWeight: 700, textDecoration: 'underline' }}>
                    {data.phone}
                </a>
            </div>

            {/* Barra Secundaria */}
            <div style={{ display: 'flex', background: 'white' }}>
                <div style={{ 
                    background: data.secondary_color, 
                    color: 'white', 
                    padding: '0.6rem 2.5rem', 
                    fontSize: '0.9rem', 
                    fontWeight: 600,
                    clipPath: isMobile ? 'none' : 'polygon(0% 0%, 95% 0%, 100% 100%, 0% 100%)'
                }}>
                    {data.location_text}
                </div>
            </div>

            {/* Contenido Principal */}
            <main style={{ padding: isMobile ? '2rem 1.5rem' : '4rem 2rem', flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                <h1 style={{ 
                    color: data.primary_color, 
                    fontSize: isMobile ? '2rem' : '3.5rem', 
                    fontWeight: 800, 
                    marginBottom: '3rem',
                    textAlign: isMobile ? 'center' : 'left',
                    lineHeight: 1.1
                }}>
                    {data.professional_name}
                </h1>

                <div style={{ 
                    display: 'flex', 
                    gap: isMobile ? '2rem' : '4rem', 
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: isMobile ? 'center' : 'flex-start'
                }}>
                    {/* Columna Izquierda: Foto y CTA 1 */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', minWidth: isMobile ? '100%' : '250px' }}>
                        <div style={{ 
                            width: isMobile ? '220px' : '280px', 
                            height: isMobile ? '220px' : '280px', 
                            borderRadius: '50%', 
                            overflow: 'hidden',
                            border: `6px solid white`,
                            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                        }}>
                            <img 
                                src={data.profile_image} 
                                alt={data.professional_name} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
                        </div>
                        <button style={{ 
                            background: 'transparent', 
                            border: `2px solid ${data.primary_color}`, 
                            color: data.primary_color,
                            padding: '0.8rem 2rem',
                            borderRadius: '50px',
                            fontWeight: 700,
                            fontSize: '1rem',
                            cursor: 'pointer',
                            transition: '0.3s'
                        }}>
                            {data.cta_text_outline}
                        </button>
                    </div>

                    {/* Columna Central: Bio y Detalles */}
                    <div style={{ flex: 1, fontSize: '1.1rem', lineHeight: 1.7 }}>
                        <p style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1.25rem' }}>{data.bio_summary}</p>
                        <p style={{ fontWeight: 600, marginBottom: '1.5rem', color: data.primary_color }}>{data.expert_subtitle}</p>
                        <p style={{ color: '#555', whiteSpace: 'pre-line' }}>
                            {data.areas_of_expertise}
                        </p>
                    </div>

                    {/* Columna Derecha: Garantía y CTA 2 */}
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: isMobile ? 'center' : 'flex-end', 
                        gap: '3rem',
                        minWidth: isMobile ? '100%' : '300px'
                    }}>
                        <div style={{ 
                            border: '2px solid #e0e0e0', 
                            borderRadius: '50%', 
                            padding: '2rem', 
                            textAlign: 'center', 
                            maxWidth: '250px',
                            aspectRatio: '1.2 / 1',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            background: '#fcfcfc'
                        }}>
                            <p style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.75rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', letterSpacing: '1px' }}>
                                GARANTÍA DE SATISFACCIÓN
                            </p>
                            <p style={{ color: '#666', fontSize: '0.85rem' }}>{data.warranty_text}</p>
                        </div>

                        <button style={{ 
                            background: data.secondary_color, 
                            color: 'white', 
                            padding: '1.25rem 3rem', 
                            borderRadius: '16px', 
                            fontWeight: 800, 
                            fontSize: '1.2rem',
                            border: 'none',
                            boxShadow: `0 10px 25px ${data.secondary_color}44`,
                            cursor: 'pointer'
                        }}>
                            {data.cta_text_filled}
                        </button>
                    </div>
                </div>
            </main>

            {/* WhatsApp Flotante */}
            <a 
                href={`https://wa.me/${data.whatsapp_number}`}
                target="_blank"
                rel="noreferrer"
                style={{ 
                    position: 'fixed', 
                    bottom: '30px', 
                    right: '30px', 
                    width: '64px', 
                    height: '64px', 
                    background: '#25D366', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'white',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    zIndex: 1000,
                    transition: '0.3s'
                }}
            >
               <Zap size={32} fill="white" />
            </a>
            
            <footer style={{ padding: '2rem', textAlign: 'center', fontSize: '0.8rem', color: '#999', background: '#f9f9f9', borderTop: '1px solid #eee' }}>
                &copy; {new Date().getFullYear()} {data.professional_name} &bull; Bolton Pages by Bolton Digital
            </footer>
        </div>
    );
}
