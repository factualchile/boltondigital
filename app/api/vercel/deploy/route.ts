import { NextResponse } from "next/server";
import { verifyUser } from "@/lib/auth-server";
import { supabaseAdmin, supabase } from "@/lib/supabase";

const client_sb = supabaseAdmin || supabase;

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
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800;900&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    
    ${landingData.conversionConfig ? `
    <!-- Global site tag (gtag.js) - Google Ads: ${landingData.conversionConfig.googleAdsConversionId} -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=AW-${landingData.conversionConfig.googleAdsConversionId}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'AW-${landingData.conversionConfig.googleAdsConversionId}');
      
      function gtag_report_conversion(url) {
        var callback = function () {
          if (typeof(url) != 'undefined') {
            window.location = url;
          }
        };
        gtag('event', 'conversion', {
            'send_to': 'AW-${landingData.conversionConfig.googleAdsConversionId}/${landingData.conversionConfig.conversionLabel}',
            'event_callback': callback
        });
        return false;
      }
    </script>
    ` : ''}

    <style>
        body { font-family: 'Outfit', sans-serif; background-color: #f1f5f9; color: #1e293b; overflow-x: hidden; }
        .typeform-modal { display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.95); z-index: 1000; align-items: center; justify-content: center; backdrop-filter: blur(10px); }
        .typeform-content { width: 90%; max-width: 600px; color: white; padding: 2rem; }
        .typeform-step { display: none; flex-direction: column; gap: 2rem; animation: slideUp 0.5s ease-out; }
        .typeform-step.active { display: flex; }
        .typeform-option { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 1rem; cursor: pointer; transition: all 0.2s; font-size: 1.2rem; font-weight: 600; }
        .typeform-option:hover { background: rgba(37, 99, 235, 0.2); border-color: #3b82f6; }
        .typeform-input { background: transparent; border: none; border-bottom: 2px solid rgba(255,255,255,0.2); font-size: 2rem; color: white; width: 100%; outline: none; padding: 0.5rem 0; transition: border-color 0.3s; font-weight: 800; }
        .typeform-input:focus { border-color: #3b82f6; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

        /* Estilos de cuadrícula Premium */
        @media (min-width: 1025px) {
            .desktop-grid { display: grid; grid-template-columns: 20% 60% 20%; height: 82vh; overflow: hidden; }
            .col-left { border-right: 1px solid rgba(0,0,0,0.03); background-color: #f8fafc; }
            .col-right { background-color: #1e293b; color: white; }
            .no-scroll { height: 100vh; overflow: hidden; display: flex; flex-direction: column; }
        }

        /* Responsive Mobile Reordering */
        @media (max-width: 1024px) {
            .reorder-container { display: flex; flex-direction: column; }
            .order-1 { order: 1; } .order-2 { order: 2; } .order-3 { order: 3; } .order-4 { order: 4; }
            .order-5 { order: 5; } .order-6 { order: 6; } .order-7 { order: 7; } .order-8 { order: 8; }
            .mobile-hide { display: none; }
        }
    </style>
    <script>
        let leadData = {
            when: '',
            schedule: '',
            name: '',
            phone: '',
            userEmail: '${landingData.email}',
            professional_userId: '${userId}'
        };

        function openModal(e) {
            if(e) e.preventDefault();
            const modal = document.getElementById('leadModal');
            if(modal) modal.style.display = 'flex';
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
            
            document.getElementById('step' + current).classList.remove('active');
            document.getElementById('step' + (current + 1)).classList.add('active');
            
            if(current === 2) setTimeout(() => document.getElementById('leadName').focus(), 100);
            if(current === 3) setTimeout(() => document.getElementById('leadPhone').focus(), 100);
        }

        async function submitLead() {
            const phoneEl = document.getElementById('leadPhone');
            leadData.phone = phoneEl ? phoneEl.value : '';

            // DISPARAR CONVERSIÓN GOOGLE ADS
            if (typeof gtag !== 'undefined' && '${landingData.conversionConfig?.googleAdsConversionId || ""}') {
                gtag('event', 'conversion', {
                    'send_to': 'AW-${landingData.conversionConfig?.googleAdsConversionId}/${landingData.conversionConfig?.conversionLabel}'
                });
            }
            
            document.getElementById('step4').classList.remove('active');
            document.getElementById('stepFinal').classList.add('active');

            const payloadInput = document.getElementById('leadPayload');
            const form = document.getElementById('leadForm');
            if(payloadInput && form) {
                payloadInput.value = JSON.stringify(leadData);
                form.submit();
            }
        }
    </script>
</head>
<body class="no-scroll">
    <!-- HEADER -->
    <header class="bg-white border-b border-black/5 py-4 px-[5%] flex justify-between items-center z-10 shrink-0">
        <div class="flex flex-col">
            <h1 class="text-2xl lg:text-3xl font-black text-[#1e4b6b] tracking-tighter leading-tight">${landingData.service}</h1>
            <div class="flex items-center gap-2 text-slate-500 text-xs lg:text-sm font-semibold">
                <span>📍</span>
                <span>${landingData.location}</span>
            </div>
        </div>
        <div class="text-right">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden lg:block">Contacto Directo</p>
            <div class="flex items-center gap-2 text-lg lg:text-xl font-bold text-[#2c6a91]">
                <span>📞</span>
                <a href="tel:${landingData.phone}">${landingData.phone}</a>
            </div>
        </div>
    </header>

    <!-- MAIN CONTENT -->
    <main class="flex-1 p-2 lg:p-6 flex items-center justify-center overflow-auto lg:overflow-hidden">
        <div class="bg-white w-full max-w-[1400px] desktop-grid rounded-3xl shadow-2xl border border-white/80 overflow-hidden reorder-container">
            
            <!-- Columna Izquierda (Perfil) -->
            <div class="col-left p-8 flex flex-col items-center order-3 lg:order-1">
                <div class="w-32 lg:w-40 h-32 lg:h-40 rounded-full overflow-hidden border-4 lg:border-8 border-white shadow-lg mb-6 order-2 lg:order-none">
                    <img src="${landingData.imageUrl || 'https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&w=400&h=400'}" class="w-full h-full object-cover">
                </div>
                <div class="h-1 w-8 bg-[#2c6a91] mb-6 rounded-full hidden lg:block"></div>
                <p class="text-xs lg:text-sm text-slate-500 font-semibold text-center leading-relaxed mb-6 order-4 lg:order-none">
                    ${landingData.slogan}
                </p>
                <button onclick="openModal(event)" class="bg-white text-[#2c6a91] border border-[#2c6a91] px-4 py-2 rounded-full text-[10px] lg:text-xs font-black hover:bg-[#2c6a91] hover:text-white transition-all order-5 lg:order-none">
                    RESERVAR AHORA
                </button>
            </div>

            <!-- Columna Central (Info) -->
            <div class="p-6 lg:p-12 flex flex-col justify-start lg:pt-16 order-1 lg:order-2">
                <h2 class="text-3xl lg:text-6xl font-black text-slate-800 tracking-tighter mb-2 order-1 lg:order-none text-center lg:text-left truncate">
                    ${landingData.name}
                </h2>
                <p class="text-lg lg:text-2xl font-bold text-[#2c6a91] mb-8 order-2 lg:order-none text-center lg:text-left">
                    ${landingData.profession}
                </p>
                
                <div class="bg-slate-50 p-6 lg:p-8 rounded-2xl border border-black/5 order-8 lg:order-none">
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Áreas de especialidad técnica</p>
                    <ul class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        ${landingData.specialties.map((s: string) => `<li class="flex items-center gap-3 text-sm font-semibold text-slate-600"><span>✅</span> ${s}</li>`).join('')}
                    </ul>
                </div>

                <p class="mt-8 text-slate-500 text-sm lg:text-base leading-relaxed order-6 lg:order-none text-center lg:text-left">
                    ${landingData.experience}
                </p>
            </div>

            <!-- Columna Derecha (Acción) -->
            <div class="col-right p-8 lg:p-12 flex flex-col items-center lg:pt-20 order-8 lg:order-3">
                ${landingData.includeGuarantee ? `
                <div class="bg-white/5 p-6 rounded-2xl border border-white/10 w-full mb-12 text-center">
                    <p class="font-black text-[10px] text-slate-400 uppercase mb-3 tracking-widest">GARANTÍA</p>
                    <p class="text-xs lg:text-sm leading-relaxed opacity-90">
                        Si la primera sesión no te parece <strong class="text-blue-400 font-black">GENIAL</strong>, te devuelvo tu dinero.
                    </p>
                </div>
                ` : ''}

                <button onclick="openModal(event)" class="w-full bg-blue-600 text-white p-5 rounded-2xl font-black text-lg lg:text-xl shadow-2xl hover:scale-105 transition-transform flex items-center justify-center gap-3">
                    RESERVAR
                    <span>➔</span>
                </button>
            </div>
        </div>
    </main>

    <!-- WHATSAPP -->
    <a 
      href="https://wa.me/${landingData.phone.replace(/\D/g, '')}" 
      ${landingData.conversionConfig ? `onclick="return gtag_report_conversion('https://wa.me/${landingData.phone.replace(/\D/g, '')}')"` : ''}
      class="fixed bottom-6 right-6 bg-[#25d366] text-white w-14 lg:w-16 h-14 lg:h-16 rounded-full shadow-2xl z-50 flex items-center justify-center hover:scale-110 transition-transform"
    >
        <svg viewBox="0 0 24 24" width="32" height="32" fill="white"><path d="M12.031 6.172c-2.32 0-4.591.531-6.621 1.541l-.471.241-4.901-1.281 1.3 4.791-.261.411c-1.12 1.771-1.711 3.821-1.711 5.921 0 6.111 4.971 11.081 11.081 11.081 1.933 0 3.775-.512 5.373-1.47l.43-.258 4.754 1.244-1.266-4.655.267-.426c.953-1.522 1.453-3.298 1.453-5.125 0-6.11-4.97-11.081-11.081-11.081zm0 20.306c-1.82 0-3.6-.482-5.161-1.391l-.37-.21-3.831.996 1.016-3.731-.231-.37c-1.021-1.63-1.561-3.511-1.561-5.461 0-5.711 4.641-10.351 10.351-10.351 2.731 0 5.3 1.061 7.231 2.991 1.931 1.931 2.991 4.5 2.991 7.231 0 5.711-4.641 10.351-10.351 10.351z" /></svg>
    </a>

    <!-- Modal -->
    <div id="leadModal" class="typeform-modal">
        <div class="typeform-content">
            <div class="typeform-step active" id="step1">
                <h2 class="text-2xl lg:text-3xl font-black mb-6">¿Para cuándo necesitas la atención?</h2>
                <div class="flex flex-col gap-4">
                    <div class="typeform-option" onclick="nextStep(1, 'Lo antes posible')">🚀 Lo antes posible</div>
                    <div class="typeform-option" onclick="nextStep(1, 'Para la próxima semana')">📅 Para la próxima semana</div>
                    <div class="typeform-option" onclick="nextStep(1, 'Aún no lo decido')">🤔 Aún no lo decido</div>
                </div>
            </div>
            <div class="typeform-step" id="step2">
                <h2 class="text-2xl lg:text-3xl font-black mb-6">¿En qué horario te acomodaría más?</h2>
                <div class="flex flex-col gap-4">
                    <div class="typeform-option" onclick="nextStep(2, 'Mañana')">🌅 En la mañana</div>
                    <div class="typeform-option" onclick="nextStep(2, 'Tarde')">☀️ En la tarde</div>
                    <div class="typeform-option" onclick="nextStep(2, 'Noche')">🌆 En la noche</div>
                </div>
            </div>
            <div class="typeform-step" id="step3">
                <h2 class="text-2xl lg:text-3xl font-black mb-6">Tu nombre completo:</h2>
                <input type="text" id="leadName" class="typeform-input mb-8" placeholder="Escribe aquí..." onkeydown="if(event.key === 'Enter') nextStep(3)">
                <button onclick="nextStep(3)" class="bg-[#3b82f6] px-8 py-3 rounded-xl font-black">SIGUIENTE</button>
            </div>
            <div class="typeform-step" id="step4">
                <h2 class="text-2xl lg:text-3xl font-black mb-6">Tu teléfono (WhatsApp):</h2>
                <input type="tel" id="leadPhone" class="typeform-input mb-8" placeholder="+56 9..." onkeydown="if(event.key === 'Enter') submitLead()">
                <button onclick="submitLead()" class="bg-[#10b981] px-8 py-4 rounded-xl font-black text-xl">ENVIAR SOLICITUD</button>
            </div>
            <div class="typeform-step" id="stepFinal">
                <div class="text-center">
                    <h2 class="text-4xl font-black mb-6">¡Solicitud Enviada! 🎉</h2>
                    <p class="text-xl opacity-80 mb-8">Te contactaremos a la brevedad para coordinar.</p>
                    <button onclick="closeModal()" class="bg-white/10 px-8 py-3 rounded-full font-bold border border-white/20">CERRAR</button>
                </div>
            </div>
        </div>
    </div>

    <form id="leadForm" action="https://www.boltondigital.cl/api/leads/capture" method="POST" target="hidden_iframe" style="display:none">
        <input type="hidden" name="payload" id="leadPayload">
    </form>
    <iframe name="hidden_iframe" id="hidden_iframe" style="display:none"></iframe>

    <script>
        // Forzar scroll top en mobile al empezar
        if(window.innerWidth < 1024) {
            window.scrollTo(0,0);
        }
    </script>
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

    // 📝 LOG DE ACTIVIDAD REAL
    if (userId) {
      await client_sb.from('user_activity_log').insert([{
          user_id: userId,
          action_type: 'DEPLOY_LANDING',
          description: `Se desplegó landing personalizada para ${landingData.service} (${landingData.name})`,
          meta_data: { 
              project: projectName,
              url: `https://${deployData.url}`
          }
      }]).catch((e: any) => console.error("Activity log failed:", e));
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
