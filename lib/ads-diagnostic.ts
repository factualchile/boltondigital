export interface AdAction {
  id: string;
  label: string;
  description: string;
  suggestedValue?: number;
  type: 'status' | 'budget' | 'bid';
}

export interface ScenarioDiagnosis {
  id: number;
  title: string;
  diagnosis: string;
  actions: AdAction[];
}

export function getScenarioDiagnosis(metrics: any, status: string, budget: number): ScenarioDiagnosis {
  const { clicks, impressions, conversions, ctr, averageCpc } = metrics;
  
  // 1. EL GRAN SILENCIO (Métricas en 0)
  if (impressions === 0 && status !== 'ENABLED') {
    return {
      id: 1,
      title: "El Gran Silencio",
      diagnosis: "Tu motor de demanda está apagado. La campaña no está participando en ninguna subasta.",
      actions: [
        { id: 'ENABLE_CAMPAIGN', label: "Activar Campaña", description: "Poner la campaña en estado HABILITADO inmediatamente.", type: 'status' },
        { id: 'INCREASE_BUDGET', label: "Inyectar Presupuesto", description: "Aumentar el presupuesto para asegurar visibilidad.", suggestedValue: 10, type: 'budget' }
      ]
    };
  }

  // 7. EL DIAMANTE EN BRUTO (Pocos clics pero convierten)
  if (clicks > 0 && clicks < 50 && conversions > 0 && (conversions / clicks) > 0.05) {
    return {
      id: 7,
      title: "El Diamante en Bruto",
      diagnosis: "¡Bingo! Estás atrayendo tráfico de altísima calidad que sabe lo que quiere. Cada clic cuenta.",
      actions: [
        { id: 'INCREASE_BUDGET', label: "Escalar Presupuesto", description: "Aumentar la inversión para capturar más de este tráfico ganador.", suggestedValue: 20, type: 'budget' },
        { id: 'INCREASE_BID', label: "Subir Puja 10%", description: "Asegurar que tu anuncio aparezca más arriba para este tráfico cualificado.", suggestedValue: 10, type: 'bid' }
      ]
    };
  }

  // 8. EL GANADOR (CTR Muy Alto)
  if (ctr > 7) {
    return {
      id: 8,
      title: "El Ganador",
      diagnosis: `Tu anuncio tiene un CTR fantástico del ${ctr.toFixed(1)}%. Casi el doble del estándar aceptable.`,
      actions: [
        { id: 'INCREASE_BUDGET', label: "Potenciar Presupuesto", description: "Aprovechar que el anuncio encanta a los pacientes.", suggestedValue: 15, type: 'budget' }
      ]
    };
  }

  // 5. EL FANTASMA DE LA LANDING (CTR Sano pero 0 conversiones)
  if (ctr > 3 && conversions === 0 && clicks > 20) {
    return {
      id: 5,
      title: "El Fantasma de la Landing",
      diagnosis: "Tu anuncio atrae gente, pero tu página web no está logrando 'cerrar' el trato. Algo falta en el vínculo.",
      actions: [
        { id: 'OPTIMIZE_LANDING', label: "Optimizar Landing IA", description: "Bolton redactará una nueva versión de tu página para mejorar la conversión.", type: 'status' }, // Trigger especial
        { id: 'PAUSE_CAMPAIGN', label: "Pausar para Revisar", description: "Detener el gasto hasta que la página esté optimizada.", type: 'status' }
      ]
    };
  }

  // Predeterminado: Optimización Continua
  return {
    id: 10,
    title: "Viento en Popa",
    diagnosis: "Tu campaña está operando en rangos estables. Bolton recomienda ajustes finos para maximizar la rentabilidad.",
    actions: [
      { id: 'INCREASE_BUDGET', label: "Escalar Gradual", description: "Aumentar ligeramente el presupuesto para seguir creciendo.", suggestedValue: 10, type: 'budget' },
      { id: 'MAINTAIN', label: "Mantener Estrategia", description: "Seguir con la configuración actual y vigilar tendencias.", type: 'status' }
    ]
  };
}
