import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, CheckCircle2, X as XIcon, ArrowRight, ArrowLeft, Camera, Phone, Mail, DollarSign, MapPin, Globe, Briefcase, Plus, Loader2 } from 'lucide-react';

interface CampaignCreationModalProps {
  onClose: () => void;
  onComplete: (data: any) => void;
  existingCampaigns: any[];
}

const ProcessingStatus = () => {
  const [index, setIndex] = useState(0);
  const steps = [
    "Analizando servicios con Agente Experto...",
    "Generando Keyword Maestra de alta intención...",
    "Redactando anuncios persuasivos (RSA)...",
    "Configurando presupuesto seguro (~$8.000 CLP)...",
    "Estableciendo geolocalización y horarios (Chile)...",
    "Finalizando orquestación en Google Ads..."
  ];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setIndex(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 2500);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <motion.p 
      key={index}
      initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
      style={{ fontWeight: 600, color: 'var(--primary)' }}
    >
      {steps[index]}
    </motion.p>
  );
};

const CampaignCreationModal: React.FC<CampaignCreationModalProps> = ({ onClose, onComplete, existingCampaigns }) => {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<'create' | 'select' | null>(null);
  const [formData, setFormData] = useState({
    profession: '',
    service: '',
    modality: 'online',
    commune: '',
    whatsapp: '',
    email: '',
    price: '',
    photo: '',
    extras: '',
    website: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const next = () => setStep(s => s + 1);
  const prev = () => setStep(s => s - 1);

  const stepsInfo = [
    { title: "Tipo de Misión", desc: "¿Creamos una nueva estructura o optimizamos una existente?" },
    { title: "Definición del Perfil", desc: "¿Cuál es tu especialidad y qué servicio quieres potenciar?" },
    { title: "Modalidad y Ubicación", desc: "¿Cómo entregas tu valor al mundo?" },
    { title: "Contacto Real", desc: "Donde Bolton enviará tus nuevas oportunidades." },
    { title: "Misión de Lanzamiento", desc: "Confirmación final de la estrategia de crecimiento." }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        style={{ width: '100%', maxWidth: '600px', background: 'var(--background)', borderRadius: '2rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
      >
        {/* Header Progress */}
        <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', display: 'flex' }}>
           {[...Array(5)].map((_, i) => (
             <div key={i} style={{ flex: 1, background: i < step ? 'var(--primary)' : 'transparent', transition: 'all 0.5s' }} />
           ))}
        </div>

        <div style={{ padding: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '2px' }}>PASO {step} DE {stepsInfo.length}</span>
              <h2 style={{ fontSize: '2rem', fontWeight: 950, marginTop: '0.5rem' }}>{stepsInfo[step-1].title}</h2>
              <p style={{ opacity: 0.6, marginTop: '0.5rem' }}>{stepsInfo[step-1].desc}</p>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', color: 'white' }}><XIcon size={20} /></button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={step} 
              initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
              style={{ minHeight: '300px' }}
            >
              {step === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <button 
                    onClick={() => { setMode('create'); next(); }}
                    style={{ padding: '2rem', borderRadius: '1.2rem', background: mode === 'create' ? 'linear-gradient(135deg, var(--primary), #1d4ed8)' : 'rgba(255,255,255,0.05)', border: mode === 'create' ? 'none' : '1px solid rgba(255,255,255,0.1)', color: 'white', textAlign: 'left', cursor: 'pointer', position: 'relative', overflow: 'hidden', borderLeft: mode === 'create' ? 'none' : '4px solid var(--primary)' }}
                  >
                     <h4 style={{ fontSize: '1.4rem', fontWeight: 950 }}>Crear Nueva Campaña</h4>
                     <p style={{ opacity: 0.8, fontSize: '0.9rem', marginTop: '0.5rem' }}>Bolton diseñará una estructura optimizada desde cero para tu servicio.</p>
                     <Plus size={60} style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.1 }} />
                  </button>
                  <button 
                    onClick={() => { setMode('select'); setStep(5); }}
                    style={{ padding: '2rem', borderRadius: '1.2rem', background: mode === 'select' ? 'linear-gradient(135deg, #4b5563, #1f2937)' : 'rgba(255,255,255,0.05)', border: mode === 'select' ? 'none' : '1px solid rgba(255,255,255,0.1)', color: 'white', textAlign: 'left', cursor: 'pointer', borderLeft: mode === 'select' ? 'none' : '4px solid #4b5563' }}
                  >
                     <h4 style={{ fontSize: '1.4rem', fontWeight: 950 }}>Vincular Existente</h4>
                     <p style={{ opacity: 0.6, fontSize: '0.9rem', marginTop: '0.5rem' }}>Selecciona una campaña de tu cuenta de Google Ads para que Bolton la optimice.</p>
                  </button>
                </div>
              )}

              {step === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div className="input-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 700 }}>Profesión u Oficio</label>
                    <input value={formData.profession} onChange={e => setFormData({...formData, profession: e.target.value})} placeholder="Ej: Psicólogo Clínico" style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '0.8rem', color: 'white' }} />
                  </div>
                  <div className="input-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 700 }}>Servicio a Promocionar</label>
                    <input value={formData.service} onChange={e => setFormData({...formData, service: e.target.value})} placeholder="Ej: Terapia de Parejas" style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '0.8rem', color: 'white' }} />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    {['online', 'presencial', 'ambas'].map(m => (
                      <button 
                        key={m} 
                        onClick={() => setFormData({...formData, modality: m})}
                        style={{ padding: '1.5rem 1rem', borderRadius: '1rem', border: `2px solid ${formData.modality === m ? 'var(--primary)' : 'rgba(255,255,255,0.05)'}`, background: formData.modality === m ? 'rgba(59, 130, 246, 0.1)' : 'transparent', color: 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
                      >
                         {m === 'online' && <Globe size={24} />}
                         {m === 'presencial' && <MapPin size={24} />}
                         {m === 'ambas' && <Briefcase size={24} />}
                         <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>{m}</span>
                      </button>
                    ))}
                  </div>
                  {formData.modality !== 'online' && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
                       <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 700 }}>Comuna de Atención</label>
                       <input value={formData.commune} onChange={e => setFormData({...formData, commune: e.target.value})} placeholder="Ej: Providencia, Santiago" style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '0.8rem', color: 'white' }} />
                    </motion.div>
                  )}
                </div>
              )}

              {step === 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                   <div className="input-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 700 }}>WhatsApp de Contacto</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '0.8rem' }}>
                      <Phone size={18} opacity={0.5} />
                      <input value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} placeholder="+56 9 XXXX XXXX" style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', padding: '0.5rem' }} />
                    </div>
                  </div>
                  <div className="input-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 700 }}>Email para Notificaciones</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '0.8rem' }}>
                      <Mail size={18} opacity={0.5} />
                      <input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="tunombre@email.com" style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', padding: '0.5rem' }} />
                    </div>
                  </div>
                   <div className="input-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 700 }}>Sitio Web / Landing Page <span style={{ color: 'var(--primary)' }}>*</span></label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--primary)', padding: '0.5rem 1rem', borderRadius: '0.8rem' }}>
                      <Globe size={18} color="var(--primary)" />
                      <input 
                        value={formData.website} 
                        onChange={e => setFormData({...formData, website: e.target.value})} 
                        placeholder="ej: miweb.cl o https://misitio.cl" 
                        style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', padding: '0.5rem' }} 
                        required
                      />
                    </div>
                    <p style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: '0.4rem' }}>Donde caerán los clics de tus potenciales clientes.</p>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                   {isSubmitting ? (
                     <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 2rem' }}>
                           <motion.div 
                             animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                             style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, border: '4px solid rgba(59, 130, 246, 0.1)', borderTop: '4px solid var(--primary)', borderRadius: '50%' }}
                           />
                           <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Rocket size={40} color="var(--primary)" />
                           </div>
                        </div>
                        <h4 style={{ fontSize: '1.4rem', fontWeight: 950, marginBottom: '0.5rem' }}>Aprovisionando Campaña</h4>
                        <div style={{ fontSize: '0.9rem', opacity: 0.6, marginBottom: '2rem', minHeight: '1.2rem' }}>
                           <ProcessingStatus />
                        </div>
                        <div style={{ height: '8px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                            <motion.div 
                              initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 15 }}
                              style={{ height: '100%', background: 'linear-gradient(90deg, var(--primary), #60a5fa)', boxShadow: '0 0 15px var(--primary)' }} 
                            />
                        </div>
                     </div>
                   ) : mode === 'create' ? (
                     <div style={{ textAlign: 'center', padding: '1rem' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                           <Rocket size={40} color="var(--primary)" />
                        </div>
                        <h4 style={{ fontSize: '1.5rem', fontWeight: 950, marginBottom: '1rem' }}>¿Iniciamos la misión?</h4>
                        <p style={{ opacity: 0.7, lineHeight: 1.6, marginBottom: '2rem' }}>Crearemos una nueva campaña definitiva en tu cuenta de Google Ads. Quedará en **Pausa** hasta que tú decidas activarla. ¿Estás de acuerdo?</p>
                        <button 
                          onClick={() => {
                            setIsSubmitting(true);
                            onComplete({ type: 'create', ...formData });
                          }} 
                          className="btn-primary" 
                          style={{ width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        >
                          "Sí, ¡Vamos adelante!"
                        </button>
                     </div>
                   ) : (
                     <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.5rem' }}>
                        <h4 style={{ fontWeight: 800, marginBottom: '1rem' }}>Campaña Existentes Detectadas</h4>
                        {existingCampaigns.length > 0 ? existingCampaigns.map(c => (
                          <button 
                            key={c.id} 
                            onClick={() => {
                              onComplete({ type: 'select', campaignId: c.id, ...formData });
                            }}
                            style={{ padding: '1.25rem', borderRadius: '0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                          >
                             <div>
                                <p style={{ fontWeight: 800 }}>{c.name}</p>
                                <p style={{ fontSize: '0.75rem', opacity: 0.5 }}>ID: {c.id}</p>
                             </div>
                             <CheckCircle2 size={18} color="var(--primary)" />
                          </button>
                        )) : <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>No se encontraron campañas activas disponibles.</div>}
                     </div>
                   )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Footer Nav */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <button 
              onClick={prev} 
              disabled={step === 1 || isSubmitting}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: (step === 1 || isSubmitting) ? 0.3 : 1 }}
            >
              <ArrowLeft size={20} /> Atrás
            </button>
            {step < 5 && (
              <button 
                onClick={next} 
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem' }}
              >
                Siguiente <ArrowRight size={20} />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CampaignCreationModal;
