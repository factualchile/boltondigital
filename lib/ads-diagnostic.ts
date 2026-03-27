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
  
  // 🚩 1. EL GRAN SILENCIO (Métricas en Cero total)
  if (status !== 'ENABLED' || (impressions === 0 && clicks === 0 && conversions === 0)) {
    return {
      id: 1,
      title: "El Gran Silencio",
      diagnosis: "Tu motor de demanda está apagado o en ralentí absoluto. No hay actividad detectada en la subasta.",
      actions: [
        { id: 'ENABLE', label: "Activar Campaña", description: "Asegurar que el estado sea HABILITADO.", type: 'status' },
        { id: 'CHECK_PAYMENT', label: "Verificar Pagos", description: "Revisar si hay alertas de facturación en Google Ads.", type: 'status' }
      ]
    };
  }

  // 🚩 2. ANUNCIO INVISIBLE (Impresiones pero no clics)
  if (impressions > 0 && clicks === 0) {
    return {
      id: 2,
      title: "Anuncio Invisible",
      diagnosis: "Tu anuncio se está mostrando, pero nadie hace clic. El mensaje no está conectando con el interés del paciente.",
      actions: [
        { id: 'EDIT_ADS', label: "Mejorar Títulos", description: "Bolton sugiere usar ganchos más directos a la solución del dolor.", type: 'status' },
        { id: 'CHECK_URL', label: "Validar Enlace", description: "Verificar que la URL de destino funcione correctamente.", type: 'status' }
      ]
    };
  }

  // 🚩 3. BAJA PARTICIPACIÓN (Impresiones muy bajas)
  if (impressions > 0 && impressions < 100) {
    return {
      id: 3,
      title: "Baja Participación",
      diagnosis: "Estás participando en la subasta, pero estás 'al fondo de la fila'. Tu puja o tu presupuesto son insuficientes.",
      actions: [
        { id: 'INCREASE_BID', label: "Subir Puja 20%", description: "Aumentar la puja máxima para ganar mejores posiciones.", suggestedValue: 20, type: 'bid' },
        { id: 'EXPAND_KEYWORDS', label: "Ampliar Keywords", description: "Agregar términos relacionados para capturar más volumen.", type: 'status' }
      ]
    };
  }

  // 🚩 8. EL GANADOR (CTR Excepcional)
  if (ctr > 10) {
    return {
      id: 8,
      title: "El Ganador",
      diagnosis: `¡Tienes un CTR del ${ctr.toFixed(1)}%! Este es el ADN de Claudio Fernández Bolton en acción. El mercado ama tu anuncio.`,
      actions: [
        { id: 'SCALE_BUDGET', label: "Escalar Presupuesto", description: "Aumentar inversión para no perder ni un solo clic ganador.", suggestedValue: 20, type: 'budget' }
      ]
    };
  }

  // 🚩 7. EL DIAMANTE EN BRUTO (Alta conversión, poco tráfico)
  if (conversions > 0 && (conversions / (clicks || 1)) > 0.10) {
    return {
      id: 7,
      title: "El Diamante en Bruto",
      diagnosis: "Pocos clics, pero una tasa de conversión altísima. Estás filtrando muy bien al paciente ideal.",
      actions: [
        { id: 'INCREASE_BUDGET', label: "Inyectar Combustible", description: "Sube el presupuesto diario para atraer a más de estos pacientes.", suggestedValue: 15, type: 'budget' }
      ]
    };
  }

  // 🚩 5. EL FANTASMA DE LA LANDING (Clics pero 0 conversiones)
  if (clicks > 25 && conversions === 0) {
    return {
      id: 5,
      title: "El Fantasma de la Landing",
      diagnosis: "El anuncio atrae al paciente, pero tu página web lo deja ir. El problema está en el 'pasillo' final.",
      actions: [
        { id: 'FIX_LANDING', label: "Revisar Botón Reserva", description: "Verificar que el botón de contacto sea visible en móvil.", type: 'status' },
        { id: 'CHECK_PIXEL', label: "Validar Conversiones", description: "Asegurar que el rastreo de Google esté activo.", type: 'status' }
      ]
    };
  }

  // 🚩 21. EL ESPEJISMO DEL CPC (Escenario Elite)
  if (averageCpc > 1000 && averageCpc < 2000 && conversions > 0) {
    return {
      id: 21,
      title: "El Espejismo del CPC",
      diagnosis: "Estás pagando un CPC premium (~$1.400), pero es BARATO porque estás en zonas de NSE alto con ROI superior.",
      actions: [
        { id: 'MAINTAIN_ADS', label: "Blindar Campaña", description: "Mantener inversión y proteger la calidad del tráfico.", type: 'status' }
      ]
    };
  }

  // Default: Viento en Popa
  return {
    id: 10,
    title: "Viento en Popa",
    diagnosis: "Tu sistema está operando en rangos óptimos. Bolton recomienda ajustes de sintonía fina.",
    actions: [
      { id: 'SCALE_GRADUAL', label: "Escalar 10%", description: "Aumento táctico para seguir creciendo sin desestabilizar.", suggestedValue: 10, type: 'budget' }
    ]
  };
}
