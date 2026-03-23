import { NextResponse } from "next/server";
import { verifyUser } from "@/lib/auth-server";

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;

export async function POST(req: Request) {
  try {
    const { userId, landingData } = await req.json();
    if (!userId || !landingData) {
      return NextResponse.json({ error: "Faltan datos de usuario o de la landing" }, { status: 400 });
    }

    const isOwner = await verifyUser(req, userId);
    if (!isOwner) return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });

    if (!VERCEL_TOKEN) {
      return NextResponse.json({ error: "Vercel Token no configurado en el servidor" }, { status: 500 });
    }

    const projectName = `bolton-landing-${userId.slice(0, 8)}`;

    // 1. CREAR EL DEPLOYMENT DIRECTO (FILE-BASED)
    // Usamos el API de Vercel para subir archivos HTML/CSS/JS estáticos
    // que representen la landing personalizada.
    
    const indexHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${landingData.service} | ${landingData.name}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { font-family: 'Inter', sans-serif; }
        .typeform-modal { display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.95); z-index: 1000; align-items: center; justify-content: center; backdrop-filter: blur(10px); }
        .typeform-content { width: 90%; max-width: 600px; color: white; padding: 2rem; }
        .typeform-step { display: none; flex-direction: column; gap: 2rem; animation: slideUp 0.5s ease-out; }
        .typeform-step.active { display: flex; }
        .typeform-option { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 1rem; cursor: pointer; transition: all 0.2s; font-size: 1.2rem; }
        .typeform-option:hover { background: rgba(255,255,255,0.1); border-color: #2c6a91; }
        .typeform-input { background: transparent; border: none; border-bottom: 2px solid rgba(255,255,255,0.2); font-size: 2rem; color: white; width: 100%; outline: none; padding: 0.5rem 0; transition: border-color 0.3s; }
        .typeform-input:focus { border-color: #2c6a91; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    </style>
    <script>
        // Sistema de Diagnóstico Bolton IA (HEAD)
        window.addEventListener('DOMContentLoaded', (event) => {
            console.log("DOM Cargado. Bolton IA Listo.");
        });

        let leadData = {
            when: '',
            schedule: '',
            name: '',
            phone: '',
            userEmail: '${landingData.email}'
        };

        function openModal(e) {
            console.log("Activando modal de conversión...");
            if(e) e.preventDefault();
            const modal = document.getElementById('leadModal');
            if(modal) {
                modal.style.display = 'flex';
            } else {
                console.error("Fallo crítico: Modal no encontrado.");
                alert("Hubo un error al abrir el formulario. Refresca e intenta de nuevo.");
            }
        }

        function closeModal() {
            const modal = document.getElementById('leadModal');
            if(modal) modal.style.display = 'none';
        }

        function nextStep(current, value) {
            if(current === 1) leadData.when = value;
            if(current === 2) leadData.schedule = value;
            if(current === 3) {
                const nameEl = document.getElementById('leadName');
                leadData.name = nameEl ? nameEl.value : '';
            }
            
            const currentStep = document.getElementById('step' + current);
            const nextStep = document.getElementById('step' + (current + 1));
            
            if(currentStep && nextStep) {
                currentStep.classList.remove('active');
                nextStep.classList.add('active');
                
                if(current === 2) setTimeout(() => { const el = document.getElementById('leadName'); if(el) el.focus(); }, 100);
                if(current === 3) setTimeout(() => { const el = document.getElementById('leadPhone'); if(el) el.focus(); }, 100);
            }
        }

        async function submitLead() {
            const phoneEl = document.getElementById('leadPhone');
            leadData.phone = phoneEl ? phoneEl.value : '';
            
            const s4 = document.getElementById('step4');
            const sF = document.getElementById('stepFinal');
            if(s4 && sF) {
                s4.classList.remove('active');
                sF.classList.add('active');
            }

            try {
                const res = await fetch('https://boltondigital.cl/api/leads/capture', {
                    method: 'POST',
                    mode: 'cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(leadData)
                });
                const data = await res.json();
                if(!res.ok || !data.success) {
                    console.error("Error API Leads:", data);
                    alert("⚠️ Error en envío: " + (data.error || "Fallo desconocido"));
                }
            } catch(e) {
                console.error("Error capturando lead:", e);
                alert("⚠️ Error de conexión: " + e.message);
            }
        }
    </script>
</head>
<body class="bg-slate-50 text-slate-700">
    <header class="bg-[#2c6a91] text-white py-6 px-[5%] flex flex-wrap justify-between items-center gap-4">
        <h1 class="text-3xl font-bold">${landingData.service}</h1>
        <div class="text-xl font-semibold flex items-center gap-2">
            <span>📞</span>
            <a href="tel:${landingData.phone}" class="underline">${landingData.phone}</a>
        </div>
    </header>

    <div class="bg-[#0f172a] text-white py-3 px-[5%] text-lg border-l-4 border-blue-500">
        <span>📍 Consulta ubicada en ${landingData.location}</span>
    </div>

    <main class="max-w-7xl mx-auto py-16 px-[5%]">
        <div class="flex flex-col md:flex-row gap-8 items-start">
            <!-- Columna Izquierda (25%) -->
            <div class="w-full md:w-1/4 flex flex-col items-center gap-6">
                <div class="w-full aspect-square rounded-full overflow-hidden border-8 border-white shadow-xl">
                    <img src="${landingData.imageUrl || 'https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&w=400&h=400'}" class="w-full h-full object-cover">
                </div>
                <a href="javascript:void(0)" onclick="openModal(event)" class="w-full py-4 border-2 border-[#2c6a91] text-[#2c6a91] font-bold rounded-full hover:bg-[#2c6a91] hover:text-white transition-all text-center">RESERVAR AHORA</a>
            </div>

            <!-- Columna Central (50%) -->
            <div class="w-full md:w-1/2">
                <h2 class="text-4xl font-extrabold text-[#2c6a91] mb-6">${landingData.name}</h2>
                <div class="prose prose-lg text-slate-700 max-w-none">
                    <p class="text-xl font-semibold mb-6 leading-relaxed">${landingData.experience}</p>
                </div>
                <div class="mt-12 bg-white/50 p-8 rounded-2xl border border-slate-200">
                    <p class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Áreas de especialidad:</p>
                    <ul class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        ${landingData.specialties.map((s: string) => `<li class="flex items-start gap-3 text-lg font-medium text-slate-600"><span class="text-[#2c6a91]">✅</span> ${s}</li>`).join('')}
                    </ul>
                </div>
            </div>

            <!-- Columna Derecha (25%) -->
            <div class="w-full md:w-1/4 flex flex-col items-center gap-8">
                <div class="bg-white border-2 border-slate-200 rounded-full w-full aspect-square flex flex-col justify-center items-center text-center p-10 shadow-sm">
                    <p class="font-extrabold text-sm text-[#2c6a91] uppercase mb-3 tracking-tighter">Garantía de Satisfacción</p>
                    <p class="text-sm leading-snug">Si la primera sesión no te parece <span class="text-[#2c6a91] font-bold">GENIAL</span> te devuelvo tu dinero</p>
                </div>
                <a href="javascript:void(0)" onclick="openModal(event)" class="w-full bg-[#0f172a] text-white py-5 px-8 rounded-xl font-bold text-xl text-center shadow-2xl hover:scale-105 transition-transform flex items-center justify-center gap-2">
                    RESERVAR AHORA ➔
                </a>
            </div>
        </div>
    </main>

    <!-- Botón Flotante WhatsApp Oficial -->
    <a href="https://wa.me/${landingData.phone.replace(/\D/g, '')}" class="fixed bottom-8 right-8 bg-[#25d366] text-white p-0 rounded-full shadow-2xl z-50 hover:scale-110 transition-transform overflow-hidden w-16 h-16 flex items-center justify-center">
        <svg viewBox="0 0 24 24" width="45" height="45" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd"><path d="M12.031 6.172c-2.32 0-4.591.531-6.621 1.541l-.471.241-4.901-1.281 1.3 4.791-.261.411c-1.12 1.771-1.711 3.821-1.711 5.921 0 6.111 4.971 11.081 11.081 11.081 1.933 0 3.775-.512 5.373-1.47l.43-.258 4.754 1.244-1.266-4.655.267-.426c.953-1.522 1.453-3.298 1.453-5.125 0-6.11-4.97-11.081-11.081-11.081zm0 20.306c-1.82 0-3.6-.482-5.161-1.391l-.37-.21-3.831.996 1.016-3.731-.231-.37c-1.021-1.63-1.561-3.511-1.561-5.461 0-5.711 4.641-10.351 10.351-10.351 2.731 0 5.3 1.061 7.231 2.991 1.931 1.931 2.991 4.5 2.991 7.231 0 5.711-4.641 10.351-10.351 10.351z" fill="#fff" /></svg>
    </a>
    <!-- Modal Tipo Typeform -->
    <div id="leadModal" class="typeform-modal">
        <div class="typeform-content">
            <!-- Paso 1: ¿Para cuándo? -->
            <div class="typeform-step active" id="step1">
                <h2 class="text-3xl font-bold mb-4">¿Para cuándo necesitas la atención?</h2>
                <div class="flex flex-col gap-3">
                    <div class="typeform-option" onclick="nextStep(1, 'Lo antes posible')">🚀 Lo antes posible</div>
                    <div class="typeform-option" onclick="nextStep(1, 'Para la próxima semana')">📅 Para la próxima semana</div>
                    <div class="typeform-option" onclick="nextStep(1, 'Aún no lo decido')">🤔 Aún no lo decido</div>
                </div>
            </div>

            <!-- Paso 2: Horario -->
            <div class="typeform-step" id="step2">
                <h2 class="text-3xl font-bold mb-4">¿En qué horario te acomodaría más?</h2>
                <div class="flex flex-col gap-3">
                    <div class="typeform-option" onclick="nextStep(2, 'Mañana (8:00 - 12:00)')">🌅 En la mañana (08:00 a 12:00)</div>
                    <div class="typeform-option" onclick="nextStep(2, 'Tarde (13:00 - 17:00)')">☀️ En la tarde (13:00 a 17:00)</div>
                    <div class="typeform-option" onclick="nextStep(2, 'Más tarde (18:00 - 21:00)')">🌆 Más tarde (18:00 a 21:00)</div>
                    <div class="typeform-option" onclick="nextStep(2, 'Aún no lo decido')">🤔 Aún no lo decido</div>
                </div>
            </div>

            <!-- Paso 3: Nombre -->
            <div class="typeform-step" id="step3">
                <h2 class="text-3xl font-bold mb-4">Ingresa tu nombre:</h2>
                <input type="text" id="leadName" class="typeform-input mb-8" placeholder="Tu nombre aquí..." onkeydown="if(event.key === 'Enter') nextStep(3)">
                <div class="flex items-center gap-4">
                    <button onclick="nextStep(3)" class="px-8 py-3 bg-[#2c6a91] rounded-lg font-bold text-lg hover:bg-[#347da8] transition-all">SIGUIENTE →</button>
                    <p class="text-sm opacity-50">o presiona ENTER</p>
                </div>
            </div>

            <!-- Paso 4: Teléfono -->
            <div class="typeform-step" id="step4">
                <h2 class="text-3xl font-bold mb-4">Ingresa tu número de teléfono:</h2>
                <input type="tel" id="leadPhone" class="typeform-input mb-8" placeholder="+56 9..." onkeydown="if(event.key === 'Enter') submitLead()">
                <div class="flex items-center gap-4">
                    <button onclick="submitLead()" class="px-8 py-3 bg-[#10b981] rounded-lg font-bold text-lg hover:bg-[#059669] transition-all text-white">ENVIAR SOLICITUD</button>
                    <p class="text-sm opacity-50">o presiona ENTER</p>
                </div>
            </div>

            <!-- Paso Final: Éxito -->
            <div class="typeform-step" id="stepFinal">
                <div class="text-center">
                    <h2 class="text-4xl font-bold mb-4">¡Listo! 🎉</h2>
                    <p class="text-xl opacity-80">Hemos recibido tu solicitud. Te contactaremos pronto.</p>
                    <button onclick="closeModal()" class="mt-8 px-8 py-3 bg-[#2c6a91] rounded-full font-bold">CERRAR</button>
                </div>
            </div>
        </div>
    </div>

    <!-- El script se movió al HEAD para mayor robustez -->
</body>
</html>
    `;

    // 2. DISPARAR DEPLOYMENT
    const TEAM_ID = "team_0PZkhC8Qe13ExRpSLJ3amS7P"; // Detectado en diagnóstico
    const deployRes = await fetch(`https://api.vercel.com/v13/deployments?teamId=${TEAM_ID}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${VERCEL_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: projectName, // Nombre del proyecto/app
        projectSettings: {
            framework: null
        },
        files: [
          {
            file: "index.html",
            data: indexHtml
          }
        ],
        target: "production"
      })
    });

    const deployData = await deployRes.json();

    if (!deployRes.ok) {
        console.error("Vercel API Detailed Error:", JSON.stringify(deployData, null, 2));
        throw new Error(deployData.error?.message || deployData.message || "Error al desplegar en Vercel");
    }

    return NextResponse.json({ 
      success: true, 
      url: `https://${deployData.url}`,
      projectId: deployData.projectId,
      deploymentId: deployData.id
    });

  } catch (error: any) {
    console.error("Vercel Deploy Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
