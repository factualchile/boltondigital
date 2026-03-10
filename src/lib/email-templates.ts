
/**
 * BOLTON DIGITAL - Email Notification System
 * Modern and Professional HTML Templates
 */

const COMPANY_NAME = "Bolton Digital";
const ACCENT_COLOR = "#6366f1"; // Indigo/Violet
const BG_COLOR = "#000000";
const TEXT_COLOR = "#ffffff";
const MUTED_COLOR = "#94a3b8";

const baseTemplate = (content: string, previewText: string) => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${previewText}</title>
    <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #000; color: #fff; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #0a0a0a; border: 1px solid #1f1f1f; }
        .header { padding: 40px 20px; text-align: center; border-bottom: 1px solid #1f1f1f; }
        .logo { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; text-decoration: none; color: #fff; }
        .accent { color: ${ACCENT_COLOR}; }
        .content { padding: 40px 30px; line-height: 1.6; }
        .footer { padding: 30px; text-align: center; color: ${MUTED_COLOR}; font-size: 12px; border-top: 1px solid #1f1f1f; }
        .button { display: inline-block; padding: 12px 24px; background-color: ${ACCENT_COLOR}; color: #fff !important; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; }
        .info-card { background: #111; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid ${ACCENT_COLOR}; }
        .detail-row { display: flex; margin-bottom: 8px; font-size: 14px; }
        .detail-label { color: ${MUTED_COLOR}; width: 100px; font-weight: 500; }
        .detail-value { color: #fff; flex: 1; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <a href="https://boltondigital.cl" class="logo">BOLTON<span class="accent">DIGITAL</span></a>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            © ${new Date().getFullYear()} ${COMPANY_NAME}. Todos los derechos reservados.<br>
            Este es un correo automático, por favor no respondas directamente.
        </div>
    </div>
</body>
</html>
`;

export const getNewTicketEmail = (userName: string, ticketTitle: string, ticketPriority: string) => {
    return baseTemplate(`
        <h1 style="font-size: 24px; margin-bottom: 20px;">¡Nueva Solicitud Recibida!</h1>
        <p>Hola <strong>${userName}</strong>,</p>
        <p>Hemos recibido tu solicitud técnica correctamente. Nuestro equipo ya ha sido notificado y comenzará a trabajar en ello en breve.</p>
        
        <div class="info-card">
            <div class="detail-row">
                <span class="detail-label">Título:</span>
                <span class="detail-value">${ticketTitle}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Prioridad:</span>
                <span class="detail-value">${ticketPriority}</span>
            </div>
        </div>

        <p>Puedes seguir el progreso de esta solicitud desde tu panel de control.</p>
        <a href="https://boltondigital.cl/dashboard/freelance-wordpress" class="button">Ver mi Panel</a>
    `, "Tu solicitud ha sido recibida - Bolton Digital");
};

export const getStaffNewTicketNotification = (userName: string, ticketTitle: string, userEmail: string) => {
    return baseTemplate(`
        <h1 style="font-size: 24px; margin-bottom: 20px; color: ${ACCENT_COLOR};">Alerta: Nuevo Ticket</h1>
        <p>Hola del Equipo,</p>
        <p>El cliente <strong>${userName}</strong> (${userEmail}) acaba de abrir una nueva solicitud de soporte técnico.</p>
        
        <div class="info-card">
            <div class="detail-row">
                <span class="detail-label">Título:</span>
                <span class="detail-value">${ticketTitle}</span>
            </div>
        </div>

        <p>Por favor, revisa el dashboard general para asignar o comenzar el trabajo.</p>
        <a href="https://boltondigital.cl/dashboard/admin-astrid" class="button">Ir al Dashboard</a>
    `, "¡Atención! Nuevo ticket recibido - Bolton Digital");
};

export const getStatusUpdateEmail = (ticketTitle: string, newStatus: string) => {
    let statusMsg = "";
    if (newStatus === "En Proceso") statusMsg = "ha comenzado a ser trabajada por nuestro equipo.";
    if (newStatus === "Terminada") statusMsg = "ha sido finalizada con éxito.";

    return baseTemplate(`
        <h1 style="font-size: 24px; margin-bottom: 20px;">Actualización de Estado</h1>
        <p>Tu solicitud <strong>"${ticketTitle}"</strong> ${statusMsg}</p>
        
        <div class="info-card">
            <div class="detail-row">
                <span class="detail-label">Estado:</span>
                <span class="detail-value" style="color: ${ACCENT_COLOR}; font-weight: bold;">${newStatus}</span>
            </div>
        </div>

        <p>Puedes ver los detalles entrando a tu cuenta.</p>
        <a href="https://boltondigital.cl/dashboard/freelance-wordpress" class="button">Ver Solicitud</a>
    `, `Actualización en tu ticket: ${newStatus} - Bolton Digital`);
};

export const getWorkLogEmail = (ticketTitle: string, minutes: number, description: string) => {
    return baseTemplate(`
        <h1 style="font-size: 24px; margin-bottom: 20px;">Nuevo Avance Registrado</h1>
        <p>Se ha registrado un nuevo avance en tu solicitud: <strong>"${ticketTitle}"</strong>.</p>
        
        <div class="info-card">
            <div class="detail-row">
                <span class="detail-label">Minutos:</span>
                <span class="detail-value">${minutes} min</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Trabajo:</span>
                <span class="detail-value">${description}</span>
            </div>
        </div>

        <p>Este tiempo ha sido descontado de tu abono de mantenimiento mensual.</p>
        <a href="https://boltondigital.cl/dashboard/freelance-wordpress" class="button">Ver mis Avances</a>
    `, "Nuevo avance en tu proyecto - Bolton Digital");
};
