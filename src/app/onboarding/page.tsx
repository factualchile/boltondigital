'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
    CheckCircle2, 
    ChevronRight, 
    Target, 
    CreditCard, 
    User, 
    ArrowRight,
    HelpCircle,
    Info,
    Mail,
    Sparkles
} from 'lucide-react';
import Navbar from '@/components/Navbar';

type Step = 'profile' | 'payment' | 'google-ads' | 'finish';

export default function OnboardingPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState<Step>('profile');
    const [isLoading, setIsLoading] = useState(false);
    
    // Form data
    const [businessName, setBusinessName] = useState('');
    const [phone, setPhone] = useState('');
    const [googleAdsId, setGoogleAdsId] = useState('');

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
            } else {
                // Cargar progreso previo si existe
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                
                if (profile) {
                    setBusinessName(profile.business_name || '');
                    setPhone(profile.phone || '');
                    setGoogleAdsId(profile.google_ads_id || '');
                    if (profile.onboarding_completed) {
                        router.push('/herramientas/google-ads-inteligente');
                    }
                }
            }
        };
        checkUser();
    }, []);

    const handleSaveProfile = async () => {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('profiles').update({
                business_name: businessName,
                phone: phone,
                onboarding_step: 1
            }).eq('id', user.id);
            setCurrentStep('payment');
        }
        setIsLoading(false);
    };

    const handleSimulatePayment = async () => {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            // Simular inserción de pago en Supabase
            await supabase.from('user_subscriptions').upsert({
                user_id: user.id,
                category: 'SEM',
                current_period_end: new Date(Date.now() + 44 * 24 * 60 * 60 * 1000).toISOString(), // 30 + 14 días
                grace_period_end: new Date(Date.now() + 58 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'ACTIVE'
            });
            setCurrentStep('google-ads');
        }
        setIsLoading(false);
    };

    const handleSaveAdsId = async () => {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('profiles').update({
                google_ads_id: googleAdsId,
                onboarding_completed: true,
                onboarding_step: 3
            }).eq('id', user.id);
            setCurrentStep('finish');
        }
        setIsLoading(false);
    };

    return (
        <main className="min-h-screen bg-[#050505] text-white">
            <Navbar />
            
            <div className="container" style={{ paddingTop: 'calc(var(--header-height) + 5rem)', paddingBottom: '5rem' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    
                    {/* Progress Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4rem', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '25px', left: '10%', right: '10%', height: '2px', background: 'rgba(255,255,255,0.05)', zIndex: 0 }}></div>
                        <StepIndicator active={true} done={['payment', 'google-ads', 'finish'].includes(currentStep)} icon={<User size={18}/>} label="Perfil" />
                        <StepIndicator active={['payment', 'google-ads', 'finish'].includes(currentStep)} done={['google-ads', 'finish'].includes(currentStep)} icon={<CreditCard size={18}/>} label="Pago" />
                        <StepIndicator active={['google-ads', 'finish'].includes(currentStep)} done={['finish'].includes(currentStep)} icon={<Target size={18}/>} label="Google Ads" />
                        <StepIndicator active={currentStep === 'finish'} done={false} icon={<CheckCircle2 size={18}/>} label="Listo" />
                    </div>

                    <div className="glass" style={{ padding: '3.5rem', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        {currentStep === 'profile' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>¡Bienvenido a la familia <span className="text-gradient">Bolton</span>!</h2>
                                <p style={{ color: 'var(--fg-muted)', marginBottom: '2.5rem' }}>Cuéntanos un poco sobre tu negocio para empezar a optimizar tus ventas.</p>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div className="form-group">
                                        <label>Nombre de tu Negocio / Empresa</label>
                                        <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Ej: Mi Tienda Online" />
                                    </div>
                                    <div className="form-group">
                                        <label>Teléfono de Contacto (WhatsApp)</label>
                                        <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+56 9 ..." />
                                    </div>
                                    <button onClick={handleSaveProfile} disabled={!businessName || !phone || isLoading} className="btn-primary" style={{ marginTop: '1rem', width: '100%', padding: '1.2rem' }}>
                                        {isLoading ? 'Guardando...' : 'Continuar al Pago'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {currentStep === 'payment' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
                                <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                                    <Sparkles size={40} className="text-gradient" />
                                </div>
                                <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>Activa tus <span className="text-gradient">14 Días Gratis</span></h2>
                                <p style={{ color: 'var(--fg-muted)', marginBottom: '2.5rem', maxWidth: '500px', margin: '0 auto 2.5rem' }}>
                                    Prueba toda la suite SEM por 14 días sin costo. Después, se activará tu suscripción mensual de forma automática. ¡Puedes cancelar cuando quieras!
                                </p>
                                
                                <div className="glass" style={{ padding: '2rem', borderRadius: '20px', background: 'rgba(255,255,255,0.02)', marginBottom: '2.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <span>Plan Bolton SEM</span>
                                        <span style={{ fontWeight: 700 }}>$15.000 / mes</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontWeight: 700 }}>
                                        <span>Hoy (14 días de prueba)</span>
                                        <span>$0</span>
                                    </div>
                                </div>

                                <button onClick={handleSimulatePayment} className="btn-primary" style={{ width: '100%', padding: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                                    Configurar pago en MercadoPago <ArrowRight size={20} />
                                </button>
                            </div>
                        )}

                        {currentStep === 'google-ads' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>Conecta <span className="text-gradient">Google Ads</span></h2>
                                <p style={{ color: 'var(--fg-muted)', marginBottom: '2rem' }}>Sigue estos simples pasos para que Claudio pueda empezar a analizar tus campañas.</p>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <GuideStep num={1} text="Entra a tu cuenta de Google Ads o crea una nueva." />
                                    <GuideStep num={2} text="Copia tu ID de Cuenta (ej: 123-456-7890) que aparece arriba a la derecha." />
                                    <GuideStep num={3} text="Pega tu ID aquí abajo para que podamos asociarla." />
                                    
                                    <div className="form-group" style={{ marginTop: '0.5rem' }}>
                                        <label>Google Ads Customer ID</label>
                                        <input type="text" value={googleAdsId} onChange={e => setGoogleAdsId(e.target.value)} placeholder="000-000-0000" />
                                    </div>

                                    <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', background: 'rgba(99, 102, 241, 0.05)', display: 'flex', gap: '1rem', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                        <Info size={24} className="text-indigo-400" style={{ flexShrink: 0 }} />
                                        <p style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
                                            <strong>Último Paso:</strong> Recibirás un correo de Google Ads solicitando acceso de administrador para **mcc@boltondigital.cl**. Por favor, acéptalo para habilitar la optimización.
                                        </p>
                                    </div>

                                    <button onClick={handleSaveAdsId} disabled={!googleAdsId || isLoading} className="btn-primary" style={{ marginTop: '1rem', width: '100%', padding: '1.2rem' }}>
                                        {isLoading ? 'Conectando...' : 'Finalizar Configuración'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {currentStep === 'finish' && (
                            <div className="animate-in fade-in zoom-in duration-700 text-center">
                                <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                                    <CheckCircle2 size={60} color="#10b981" />
                                </div>
                                <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>¡Estamos Listos!</h2>
                                <p style={{ fontSize: '1.2rem', color: 'var(--fg-muted)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
                                    Hemos configurado tu perfil correctamente. El script de Claudio empezará a sincronizar tus datos en la próxima hora. 
                                </p>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', textAlign: 'left', marginBottom: '3rem' }}>
                                    <FinishTip icon={<Mail size={18} />} text="Revisa tu correo para tus primeros consejos estratégicos." />
                                    <FinishTip icon={<Target size={18} />} text="Acepta la invitación de administrador en Google Ads." />
                                </div>

                                <button onClick={() => router.push('/herramientas/google-ads-inteligente')} className="btn-primary" style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem' }}>
                                    Ir a mi Dashboard
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .form-group label {
                    display: block;
                    font-size: 0.9rem;
                    font-weight: 600;
                    margin-bottom: 0.75rem;
                    color: rgba(255,255,255,0.6);
                }
                input {
                    width: 100%;
                    padding: 1rem 1.5rem;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 14px;
                    color: white;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                }
                input:focus {
                    outline: none;
                    border-color: var(--accent-primary);
                    background: rgba(255,255,255,0.05);
                }
                .text-gradient {
                    background: linear-gradient(135deg, #6366f1, #a855f7);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
            `}</style>
        </main>
    );
}

function StepIndicator({ active, done, icon, label }: any) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', zIndex: 1 }}>
            <div style={{ 
                width: '50px', 
                height: '50px', 
                borderRadius: '50%', 
                background: done ? '#10b981' : (active ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: active ? '0 0 20px rgba(99, 102, 241, 0.3)' : 'none',
                transition: 'all 0.5s ease'
            }}>
                {done ? <CheckCircle2 size={18} /> : icon}
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: active ? 700 : 500, color: active ? 'white' : 'var(--fg-muted)' }}>{label}</span>
        </div>
    );
}

function GuideStep({ num, text }: { num: number, text: string }) {
    return (
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 800, fontSize: '0.9rem' }}>{num}</div>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>{text}</p>
        </div>
    );
}

function FinishTip({ icon, text }: { icon: any, text: string }) {
    return (
        <div className="glass" style={{ padding: '1.25rem', borderRadius: '16px', display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ color: 'var(--accent-primary)' }}>{icon}</div>
            <span style={{ fontSize: '0.85rem', lineHeight: 1.4 }}>{text}</span>
        </div>
    );
}
