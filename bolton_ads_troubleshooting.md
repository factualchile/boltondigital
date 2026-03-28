# Bolton Digital: Resolución de Errores - Google Ads & IA

Este documento resume los obstáculos técnicos encontrados durante la fase final de despliegue del "Ads Engineer" y la lógica de solución aplicada para evitar recurrencias.

## 1. Timeouts de Red (Error de Conexión Crítica)
- **Problema:** El proceso de creación de campañas involucra múltiples llamadas externas (GPT-4o para estrategia + Google Ads para presupuesto, campaña, grupos, palabras y anuncios). Este flujo secuencial tomaba ~35-45 segundos, superando el límite de 25s del frontend.
- **Solución:** Se actualizó `secureFetch` en `app/dashboard/page.tsx` para elevar el `AbortController` timeout a **90 segundos**.

## 2. Acceso a Modelos de IA (OpenAI 404)
- **Problema:** El uso del alias `gpt-4-turbo-preview` provocaba errores 404 (Model Not Found) debido a cambios en la disponibilidad de la API de OpenAI.
- **Solución:** Se realizó un refactory global en **12 archivos** de la API (`/api/ads/...`, `/api/leads/...`, `/api/vercel/...`) migrando todo a **gpt-4o**, garantizando mayor velocidad y compatibilidad.

## 3. Autorización de Google Ads (invalid_grant)
- **Problema:** Los `refresh_token` de Google Ads expiraban exactamente cada 7 días.
- **Causa:** El proyecto en Google Cloud Console estaba en estado "Testing".
- **Solución:** Se cambió el estado de la app a **"Production"** y se generó un nuevo token permanente. Se recordó al usuario que en "Testing" los tokens son efímeros.

## 4. Bloqueos por Política de Contenido (Health Policies)
- **Problema:** Google Ads bloqueaba la creación de palabras clave (keyword) y anuncios (ads) relacionados con salud o psicología.
- **Solución:** Se implementó un "Catch & Retry" robusto en `app/api/ads/campaigns/create/route.ts`:
    1. Si la API devuelve un error de tipo `policy_violation`.
    2. El servidor extrae la clave específica de la política (`policy_name`).
    3. Reintenta la operación incluyendo el campo `exempt_policy_violation_keys` con los objetos correctos.

## 5. Fallo de Serialización (Object Expected)
- **Problema:** Error `13 INTERNAL` al solicitar exenciones.
- **Causa:** El campo `exempt_policy_violation_keys` no acepta un array de strings, sino una lista de objetos `PolicyViolationKey`.
- **Solución:** Se ajustó el mapeo a: `.map(k => ({ policy_name: k }))`.

---

## 6. Desafío: Configuración de Conversiones (Bolton Lead)

### A. Google Ads ID not found
- **Causa:** Desincronización entre el estado local (Navegador) y remoto (Supabase) después de vincular la cuenta.
- **Solución:** Protocolo de **Self-Repair**. La API de conversiones ahora recibe el ID como respaldo y actualiza la tabla `user_settings` de forma silenciosa para corregir el registro del usuario.

### B. Error: entities.map is not a function
- **Causa:** Requerimiento estricto de la librería `google-ads-api`. El método `.create()` exige un Array físico de entidades incluso si solo se crea una.
- **Solución:** Se envolvió el objeto de configuración en `[...]`.

### C. Unrecognized field (conversion_tracking_setting)
- **Causa:** Incompatibilidad de esquema GAQL en la consulta del `google_ads_conversion_id` desde el recurso `customer`.
- **Solución:** **Extracción por Regex**. En lugar de consultar el campo problemático, Bolton lee los `tag_snippets` de la acción de conversión y extrae el ID global del Tag (`AW-XXXXXX`) directamente del código fuente de Google.

### D. Columna 'conversion_config' inexistente
- **Causa:** El esquema inicial de `user_settings` no contemplaba el almacenamiento de configuraciones de píxel dinámicas.
- **Solución:** Ejecución de migración SQL `ALTER TABLE` para incluir la columna `conversion_config` tipo `jsonb`.

---

## 7. Desafío: Textos Destacados (Callouts)

### A. Field 'asset' is required for 'CREATE'
- **Causa:** Error de redundancia. Se estaba envolviendo la operación en un objeto `{ create: { ... } }`, pero el método `.create()` del SDK ya realiza este envoltorio automáticamente, causando que Google no encuentre el campo `asset` en el nivel esperado.
- **Solución:** Se aplanó la estructura del objeto enviado a la API.

### B. Required field was not present (field_type)
- **Causa:** Uso de camelCase (`fieldType`) en una propiedad que el servicio de Google exige estrictamente en snake_case (`field_type`) para su capa gRPC.
- **Solución:** Estabilización de parámetros a formato nativo de Google Ads.

### C. Duplicate Name (Conflictos de Reintento)
- **Causa:** Google prohíbe crear dos activos con el mismo nombre exacto. Al fallar un intento anterior, el nombre "Bolton Callout" ya estaba tomado.
- **Solución:** **Timestamps dinámicos**. Se añadió la marca de tiempo al nombre de cada activo (`Bolton Callout [TS]: [Texto]`) para permitir reintentos infinitos sin errores de colisión.

---

## 8. Desafío: Enlaces de Sitio (Sitelinks)

### A. Error: REQUIRED - link_text
- **Causa:** Nomenclatura específica de recurso. A diferencia de otros anuncios, los Sitelinks exigen que el campo de texto sea estrictamente **`link_text`** y no `ad_text` o `text`.
- **Solución:** Corrección de la etiqueta del campo en el payload JSON.

### B. Fallo masivo de creación (Sin error descriptivo)
- **Causa:** Falta de validación de protocolo y swallowing de errores en el bucle asíncrono. Si la URL carecía de `https://`, Google la rechazaba sin aviso claro.
- **Solución:** **Sanitización de URL**. Se implementó un validador que asegura el protocolo `https` y un recolector de errores que reporta el fallo técnico exacto al usuario.

### C. Conflicto de URL Duplicada
- **Causa:** Google no permite 4 enlaces que apunten exactamente a la misma URL raíz.
- **Solución:** **Diferenciación de Hash**. Se añadió un parámetro de consulta único (`?sl=1`, `?sl=2`, etc.) a cada enlace para que Google los acepte como destinos distintos aunque lleven a la misma landing.

---

## 9. Desafío: Extensión de Llamada (Call Assets)

### A. Error de Nomenclatura (fieldType)
- **Causa:** Misma inconsistencia detectada en Sitelinks y Callouts; el servicio de vinculación de llamadas exige `field_type` (snake_case).
- **Solución:** Estandarización a formato nativo gRPC.

### B. Conflicto de Nombres Duplicados
- **Causa:** Intentar registrar el mismo teléfono con el nombre estático "Bolton Call" fallaba si el activo ya existía parcialmente.
- **Solución:** Implementación de **nombres dinámicos con marcas de tiempo** para garantizar unicidad en cada intento de activación.

### C. Validación de Formato Telefónico
- **Causa:** Google rechaza números que no sigan el estándar internacional E.164.
- **Solución:** **Sanitización automática**. El motor ahora limpia espacios, guiones y asegura el prefijo `+56` (Chile) antes de enviar la petición a la API.

---
*Documento actualizado por Antigravity para Bolton Digital - Marzo 2026*
