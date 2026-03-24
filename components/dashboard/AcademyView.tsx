"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Play, BookOpen, CheckCircle2, Lock, ArrowRight, Clock, Star, Brain, PlayCircle, FileText, Layout, Trophy, ChevronRight } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  lessons: number;
  progress: number;
  locked: boolean;
  color: string;
  icon: any;
}

const COURSES: Course[] = [
  {
    id: 'ads-101',
    title: 'Google Ads: Fundamentos de Élite',
    description: 'Aprende a dominar el motor comercial de Bolton desde cero. Configuración perfecta y estrategia de pujas.',
    category: 'TRÁFICO',
    duration: '2h 15m',
    lessons: 12,
    progress: 100,
    locked: false,
    color: '#3b82f6',
    icon: Target
  },
  {
    id: 'landing-conv',
    title: 'Arquitectura de Landings de Alta Conversión',
    description: 'El arte de convertir desconocidos en clientes. Psicología del diseño y copy persuasivo.',
    category: 'CONVERSIÓN',
    duration: '1h 45m',
    lessons: 8,
    progress: 45,
    locked: false,
    color: '#10b981',
    icon: Layout
  },
  {
    id: 'roi-eng',
    title: 'Ingeniería de ROI: Escalado Progresivo',
    description: 'Cómo multiplicar tu inversión sin quemar el presupuesto. Estrategias avanzadas de Bolton OS.',
    category: 'ESTRATEGIA',
    duration: '3h 30m',
    lessons: 15,
    progress: 0,
    locked: true,
    color: '#f59e0b',
    icon: Brain
  },
  {
    id: 'master-bolton',
    title: 'Masterclass: El Futuro de la IA Comercial',
    description: 'Uso experto de asistentes, clanes de Claudio y automatización total del ecosistema digital.',
    category: 'AVANZADO',
    duration: '4h 00m',
    lessons: 20,
    progress: 0,
    locked: true,
    color: '#8b5cf6',
    icon: Trophy
  }
];

import { Target } from 'lucide-react';

export function AcademyView() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  return (
    <div className="dashboard-main" style={{ padding: "0 2rem" }}>
      <AnimatePresence mode="wait">
        {!selectedCourse ? (
          <motion.div key="catalog" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div style={{ marginBottom: "5rem", textAlign: "center" }}>
              <h2 style={{ fontSize: "3.5rem", fontWeight: 1000, marginBottom: "1.5rem", letterSpacing: "-2px" }}>Universidad Bolton</h2>
              <p style={{ fontSize: "1.3rem", color: "var(--muted-foreground)", maxWidth: "800px", margin: "0 auto" }}>Domina las artes del marketing digital y el retorno de inversión. De cero a experto con la metodología Bolton.</p>
            </div>

            <div className="grid-responsive" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "2.5rem", maxWidth: "1200px", margin: "0 auto" }}>
              {COURSES.map((course) => (
                <motion.div 
                  key={course.id}
                  whileHover={{ scale: 1.02 }}
                  className="glass"
                  style={{ 
                    padding: "3rem", 
                    borderRadius: "2.5rem", 
                    position: "relative",
                    overflow: "hidden",
                    border: `1px solid ${course.locked ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)'}`,
                    cursor: course.locked ? 'not-allowed' : 'pointer',
                    background: "rgba(255,255,255,0.01)"
                  }}
                  onClick={() => !course.locked && setSelectedCourse(course)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
                    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                      <span style={{ fontSize: "0.7rem", fontWeight: 950, color: course.color, background: `${course.color}15`, padding: "0.4rem 1rem", borderRadius: "1rem", letterSpacing: "1px" }}>{course.category}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", opacity: 0.5, fontSize: "0.75rem", fontWeight: 800 }}>
                        <Clock size={14} /> {course.duration}
                      </div>
                    </div>
                    {course.locked ? <Lock size={20} color="var(--muted)" /> : <PlayCircle size={24} color={course.color} />}
                  </div>

                  <h3 style={{ fontSize: "1.8rem", fontWeight: 950, marginBottom: "1rem" }}>{course.title}</h3>
                  <p style={{ fontSize: "1rem", opacity: 0.6, lineHeight: 1.6, marginBottom: "2.5rem" }}>{course.description}</p>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ flex: 1, marginRight: "2rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.6rem", fontSize: "0.8rem", fontWeight: 900 }}>
                        <span style={{ opacity: 0.5 }}>PROGRESO</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div style={{ height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "10px", overflow: "hidden" }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${course.progress}%` }} style={{ height: "100%", background: course.color, boxShadow: `0 0 10px ${course.color}40` }} />
                      </div>
                    </div>
                    <div className="glass" style={{ width: "45px", height: "45px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: course.locked ? 'var(--muted)' : course.color, border: `1px solid ${course.locked ? 'rgba(255,255,255,0.05)' : `${course.color}30`}` }}>
                       <ChevronRight size={24} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="glass grid-responsive" style={{ marginTop: "6rem", padding: "4rem", borderRadius: "3rem", display: "flex", gap: "3rem", alignItems: "center", background: "linear-gradient(135deg, rgba(88, 28, 135, 0.1) 0%, transparent 100%)" }}>
               <div className="glass" style={{ width: "100px", height: "100px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--primary)", boxShadow: "0 0 40px rgba(59, 130, 246, 0.3)" }}>
                  <Trophy size={50} color="white" />
               </div>
               <div>
                  <h4 style={{ fontSize: "1.8rem", fontWeight: 950, marginBottom: "0.5rem" }}>Sube de Nivel</h4>
                  <p style={{ opacity: 0.7, fontSize: "1.1rem", fontWeight: 500 }}>Completa cursos para desbloquear el **Modo Avanzado** del Dashboard y obtener acceso a los Asistentes Pro del Marketplace.</p>
               </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="viewer" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {/* VOLVER AL CATÁLOGO */}
            <button 
              onClick={() => setSelectedCourse(null)}
              style={{ background: 'none', border: 'none', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', marginBottom: '3rem', fontWeight: 800, fontSize: '1rem' }}
            >
              <ArrowRight size={20} style={{ transform: 'rotate(180deg)' }} /> VOLVER A LA ACADEMIA
            </button>

            <div className="grid-responsive" style={{ display: "grid", gridTemplateColumns: "1fr 0.35fr", gap: "3rem" }}>
              {/* VIDEO PLAYER AREA */}
              <div>
                <div className="glass" style={{ width: '100%', aspectRatio: '16/9', borderRadius: '3rem', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', position: 'relative', background: 'black', marginBottom: '3rem' }}>
                   {/* Placeholder Video */}
                   <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.8))' }}>
                      <PlayCircle size={100} color={selectedCourse.color} style={{ opacity: 0.4 }} />
                   </div>
                </div>
                <div className="glass" style={{ padding: '3.5rem', borderRadius: '2.5rem' }}>
                   <h1 style={{ fontSize: '2.5rem', fontWeight: 950, marginBottom: '1.5rem' }}>1.1 El Motor Comercial de Bolton</h1>
                   <p style={{ fontSize: '1.2rem', lineHeight: 1.7, opacity: 0.7, fontWeight: 500 }}>
                     En esta lección aprenderás cómo Bolton se comunica con la API de Google Ads y por qué los reportes de Insight son la clave para escalar tu negocio. Veremos la configuración inicial y cómo auditar tus primeras 24 horas de datos.
                   </p>
                   <div style={{ marginTop: '3rem', display: 'flex', gap: '1.5rem' }}>
                      <div className="glass" style={{ padding: '1.5rem 2.5rem', borderRadius: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                         <FileText size={24} color={selectedCourse.color} />
                         <div>
                            <p style={{ fontSize: '0.75rem', fontWeight: 900, opacity: 0.5 }}>RECURSO PDF</p>
                            <p style={{ fontWeight: 800 }}>Guía de Setup.pdf</p>
                         </div>
                      </div>
                      <div className="glass" style={{ padding: '1.5rem 2.5rem', borderRadius: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                         <Brain size={24} color={selectedCourse.color} />
                         <div>
                            <p style={{ fontSize: '0.75rem', fontWeight: 900, opacity: 0.5 }}>HOJA DE TRABAJO</p>
                            <p style={{ fontWeight: 800 }}>Checklist ROI.xlsx</p>
                         </div>
                      </div>
                   </div>
                </div>
              </div>

              {/* CURRICULUM AREA */}
              <div className="glass" style={{ padding: '3rem', borderRadius: '2.5rem', height: 'fit-content' }}>
                 <h3 style={{ fontSize: '1.6rem', fontWeight: 950, marginBottom: '2.5rem' }}>Temario del Curso</h3>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[
                      { title: "El Motor Comercial de Bolton", duration: "12:05", status: "watching" },
                      { title: "Conexión con el Insight Hub", duration: "15:20", status: "pending" },
                      { title: "Optimización de Presupuesto", duration: "08:45", status: "locked" },
                      { title: "Interpretación de Batalla", duration: "20:00", status: "locked" },
                      { title: "Escalado de Audiencia", duration: "12:00", status: "locked" },
                      { title: "Cierre y Evaluación", duration: "05:00", status: "locked" }
                    ].map((lesson, i) => (
                      <div key={i} className="glass" style={{ 
                        padding: '1.5rem', 
                        borderRadius: '1.2rem', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        border: lesson.status === 'watching' ? `1px solid ${selectedCourse.color}50` : '1px solid rgba(255,255,255,0.05)',
                        background: lesson.status === 'watching' ? `${selectedCourse.color}05` : 'transparent',
                        opacity: lesson.status === 'locked' ? 0.4 : 1
                      }}>
                         <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            {lesson.status === 'watching' ? <Play size={16} color={selectedCourse.color} /> : (lesson.status === 'locked' ? <Lock size={16} /> : <CheckCircle2 size={16} />)}
                            <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>{lesson.title}</div>
                         </div>
                         <span style={{ fontSize: '0.75rem', opacity: 0.4 }}>{lesson.duration}</span>
                      </div>
                    ))}
                 </div>
                 <button className="btn-primary" style={{ width: '100%', marginTop: '3rem', padding: '1.5rem', fontWeight: 950, fontSize: '1rem' }}>SIGUIENTE LECCIÓN</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
