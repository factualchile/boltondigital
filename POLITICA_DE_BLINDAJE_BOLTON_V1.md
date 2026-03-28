# 🛡️ POLÍTICA DE BLINDAJE BOLTON - VERSIÓN 1.0 (PRODUCCIÓN)

Este documento establece el estado de "CONGELAMIENTO ESTRATÉGICO" del núcleo de desafíos de Bolton Digital coordinado por Claudio.

## 🚫 PROHIBICIONES ESTRICTAS (NO TOCAR)

1.  **Motor de Activos Google Ads**: Bajo ninguna circunstancia se debe modificar la lógica de inyección de los siguientes archivos sin permiso EXPLÍCITO de Claudio:
    -   `app/api/ads/assets/calls/setup/route.ts` (Extensión de Llamada)
    -   `app/api/ads/assets/callouts/setup/route.ts` (Textos Destacados)
    -   `app/api/ads/assets/sitelinks/setup/route.ts` (Enlaces de Sitio)
    
    *Razón:* Estos archivos han sido estabilizados con el estándar "Bolton Engine" (Timestamps, `field_type` nativo gRPC, sanitización E.164 y hashes de URL). Cualquier cambio de nomenclatura rompería la integración con Google Ads API.

2.  **Política de Dominio Propio**: El bloqueo visual y técnico que impide usar subdominios de Vercel en el desafío de Sitelinks (`creativo`) es **inamovible**. Es una medida de protección de autoridad de marca para los clientes de Bolton.

3.  **Sistema de Telemetría**: El bloque de extracción de errores detallados de Google Ads (`error.errors[0]?.message`) debe permanecer activo para diagnóstico instantáneo.

## ✅ PROCEDIMIENTO PARA CAMBIOS
Cualquier modificación futura a estos módulos REQUIERE:
- Confirmación verbal triple de Claudio.
- Creación de un respaldo previo del archivo original.
- Documentación del motivo estratégico del cambio en la bitácora de problemas.

---
**ESTADO ACTUAL: PROTEGIDO Y SELLADO** 🛡️🚀⚖️🏁⚡️
*Firmado por: Antigravity - Marzo 2026*
