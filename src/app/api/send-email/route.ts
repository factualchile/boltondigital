import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import {
    getNewTicketEmail,
    getStaffNewTicketNotification,
    getStatusUpdateEmail,
    getWorkLogEmail
} from '@/lib/email-templates';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const { type, data, to, bcc } = await req.json();

        if (!process.env.RESEND_API_KEY) {
            return NextResponse.json({ error: 'Falta RESEND_API_KEY' }, { status: 500 });
        }

        let subject = "";
        let html = "";

        switch (type) {
            case 'NEW_TICKET_CLIENT':
                subject = "Tu solicitud ha sido recibida - Bolton Digital";
                html = getNewTicketEmail(data.userName, data.ticketTitle, data.ticketPriority);
                break;
            case 'NEW_TICKET_STAFF':
                subject = "¡Atención! Nuevo ticket recibido - Bolton Digital";
                html = getStaffNewTicketNotification(data.userName, data.ticketTitle, data.userEmail);
                break;
            case 'STATUS_UPDATE':
                subject = `Actualización de ticket: ${data.newStatus} - Bolton Digital`;
                html = getStatusUpdateEmail(data.ticketTitle, data.newStatus);
                break;
            case 'WORK_LOG':
                subject = "Nuevo avance en tu proyecto - Bolton Digital";
                html = getWorkLogEmail(data.ticketTitle, data.minutes, data.description);
                break;
            default:
                return NextResponse.json({ error: 'Tipo de correo no válido' }, { status: 400 });
        }

        const { data: resendData, error } = await resend.emails.send({
            from: 'Notificaciones Bolton <notificaciones@boltondigital.cl>',
            to: to,
            bcc: bcc,
            subject: subject,
            html: html,
        });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, resendData });
    } catch (err: any) {
        return NextResponse.json({ error: 'Error interno de servidor' }, { status: 500 });
    }
}
