import { Resend } from 'resend';

let resendClient: Resend | null = null;
function getResendClient(): Resend {
    if (!resendClient) {
        resendClient = new Resend(process.env.RESEND_API_KEY);
    }
    return resendClient;
}

export const sendWelcomeEmail = async (email: string, name: string) => {
    try {
        await getResendClient().emails.send({
            from: 'Bolton Digital <hola@boltondigital.cl>',
            to: email,
            subject: '¡Bienvenido a Bolton Digital! - Primeros Pasos SEM',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
                    <h1 style="color: #6366f1;">¡Hola ${name}!</h1>
                    <p>Estamos muy felices de tenerte con nosotros. Has dado el primer paso para escalar tu negocio con Inteligencia Artificial.</p>
                    <p><strong>¿Qué sigue ahora?</strong></p>
                    <ul>
                        <li>Configura tu cuenta de Google Ads en tu panel de Bolton.</li>
                        <li>Acepta la invitación de administrador que te llegará de parte de nuestro equipo.</li>
                        <li>Espera a que Claudio analice tus primeras métricas.</li>
                    </ul>
                    <p>Mañana te enviaré los "Lineamientos de Claudio" para que entiendas cómo pensamos la estrategia de tu cuenta.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
                    <p style="font-size: 12px; color: #999;">Bolton Digital - Santiago, Chile</p>
                </div>
            `
        });
    } catch (error) {
        console.error("Error sending welcome email:", error);
    }
};

export const sendStrategyEmail = async (email: string, name: string) => {
    try {
        await getResendClient().emails.send({
            from: 'Claudio de Bolton <estrategia@boltondigital.cl>',
            to: email,
            subject: 'Día 2: Los 3 mandamientos de una campaña SEM ganadora',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
                    <h1 style="color: #6366f1;">Hola ${name}, aquí Claudio.</h1>
                    <p>Hoy quiero compartirte cómo optimizamos cuentas para que realmente vendan:</p>
                    <ol>
                        <li><strong>Obsesión por las Conversiones:</strong> Un clic es solo un costo si no hay una venta detrás.</li>
                        <li><strong>Landing Pages Específicas:</strong> Nunca envíes tráfico a la Home. Usa Bolton Pages para crear una página por producto.</li>
                        <li><strong>Limpieza de Keywords:</strong> Pausa lo que no convierte rápido.</li>
                    </ol>
                    <p>Entra a tu panel para ver si ya tenemos datos de tu cuenta.</p>
                    <a href="https://boltondigital.cl/herramientas/google-ads-inteligente" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 20px;">Ir a mi Dashboard</a>
                </div>
            `
        });
    } catch (error) {
        console.error("Error sending strategy email:", error);
    }
};

export const sendUrgentSupportEmail = async (userData: {
    email: string;
    name: string;
    businessName: string;
    phone: string;
    contactPhone: string;
    date: string;
    service: string;
}) => {
    try {
        await getResendClient().emails.send({
            from: 'Sistema Alertas <alertas@boltondigital.cl>',
            to: ['cfernandez.bolton@gmail.com', 'contactoboltondigital@gmail.com'],
            subject: 'URGENTE: Cliente nuevo no reconocido',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; border: 2px solid #ef4444; border-radius: 12px;">
                    <h1 style="color: #ef4444; margin-top: 0;">🚨 Alerta de Activación Fallida</h1>
                    <p>Un cliente reporta que completó su suscripción en Mercado Pago pero el sistema de Bolton no lo ha reconocido automáticamente.</p>
                    
                    <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #1e293b;">Datos del Cliente</h3>
                        <p><strong>Nombre:</strong> ${userData.name}</p>
                        <p><strong>Email Registro:</strong> ${userData.email}</p>
                        <p><strong>Negocio:</strong> ${userData.businessName}</p>
                        <p><strong>Teléfono Registro:</strong> ${userData.phone}</p>
                        <p><strong>Teléfono de Contacto URGENTE:</strong> <span style="font-size: 1.2rem; color: #ef4444; font-weight: bold;">${userData.contactPhone}</span></p>
                    </div>

                    <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #1e293b;">Detalles del Servicio</h3>
                        <p><strong>Servicio:</strong> ${userData.service}</p>
                        <p><strong>Fecha Reporte:</strong> ${userData.date}</p>
                    </div>

                    <p style="font-size: 0.9rem; color: #64748b;">El cliente confirmó que han pasado más de 10 minutos, refrescó la página y ratificó que inició la suscripción correctamente.</p>
                    
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #999;">Bolton Digital - Sistema de Alertas Críticas</p>
                </div>
            `
        });
    } catch (error) {
        console.error("Error sending urgent support email:", error);
    }
};
