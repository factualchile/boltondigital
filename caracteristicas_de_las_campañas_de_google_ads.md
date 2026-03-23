# CARACTERÍSTICAS DE LAS CAMPAÑAS DE GOOGLE ADS - BOLTON DIGITAL

## 🎯 Configuración Estructural (Core)
- **Tipo de Campaña**: Red de Búsqueda únicamente (Search).
- **Redes Excluidas**: 
    - NO Partners de Búsqueda de Google.
    - NO Red de Display de Google.
- **Estrategia de Puja**: Maximizar Clics (Maximize Clicks).
- **Límite de CPC (Máximo)**: $2.3 USD por clic.

## 📍 Geolocalización y Horarios
- **Ubicación**: País señalado por el usuario + Comuna específica para la palabra clave.
- **Programación de Anúncios**: 
    - Días: Lunes a Viernes.
    - Horario: 07:30 AM a 10:30 PM (22:30).
- **Inversión**: $8 USD diarios (Lunes a Viernes).

## 🔑 Estrategia de Palabras Clave (Single Keyword Strategy)
- **Cantidad**: 1 sola palabra clave por campaña.
- **Concordancia**: Concordancia de Frase (`"palabra clave"`).
- **Lógica de Construcción (IA)**:
    - Input A: Profesión del usuario.
    - Input B: Comuna/Oficina o "Online".
    - IA debe transformar sutilmente a "Intención de búsqueda":
        - Ejemplo 1: Psicólogo + Concepción -> `"Psicólogo en Concepción"`.
        - Ejemplo 2: Terapia de Pareja + Online -> `"Terapia de pareja online"`.

## ✍️ Reglas de Creatividad (Anuncios)
- **URL Final**: Debe ser el dominio/página de aterrizaje proporcionado por el usuario en el formulario.
- **Inclusión**: El título 1 y al menos una descripción DEBEN contener la palabra clave exacta generada por la IA.
- **Enfoque**: Claridad humana y conversión directa.

## 💾 Persistencia y Optimización
- **Vinculación**: Cada campaña creada queda asociada al ID de usuario en Supabase (`user_settings.current_campaign_id`).
- **Recurrencia**: Al iniciar sesión, Bolton Digital carga esta campaña específica para análisis y optimización proactiva.
