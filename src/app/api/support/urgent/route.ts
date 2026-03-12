import { NextResponse } from 'next/server';
import { sendUrgentSupportEmail } from '@/lib/emails';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, name, businessName, phone, contactPhone, service } = body;

        if (!email || !contactPhone) {
            return NextResponse.json({ error: 'Faltan datos críticos' }, { status: 400 });
        }

        await sendUrgentSupportEmail({
            email,
            name,
            businessName,
            phone,
            contactPhone,
            service,
            date: new Date().toLocaleString('es-CL'),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error in urgent support API:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
