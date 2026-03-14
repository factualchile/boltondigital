import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Endpoint para que el Google Ads Script consulte las acciones pendientes.
 * GET: Obtiene acciones PENDING para un UID específico.
 * POST: Notifica el resultado de la ejecución para cada orden.
 */

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('uid');

    if (!uid) {
        return NextResponse.json({ error: 'UID requerido' }, { status: 400 });
    }

    try {
        const { data, error } = await supabase
            .from('ads_actions_queue')
            .select('*')
            .eq('user_id', uid)
            .eq('status', 'PENDING')
            .order('created_at', { ascending: true });

        if (error) throw error;

        return NextResponse.json({ orders: data || [] });
    } catch (error) {
        console.error('Execution API Error:', error);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { uid, orders_results } = await req.json();

        if (!uid || !orders_results) {
            return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
        }

        // Actualizar el estado de cada orden en base al resultado del script
        for (const res of orders_results) {
            const { error } = await supabase
                .from('ads_actions_queue')
                .update({ 
                    status: res.success ? 'COMPLETED' : 'FAILED',
                    executed_at: new Date().toISOString(),
                    metadata: { ...(res.metadata || {}), execution_log: res.log }
                })
                .eq('id', res.order_id)
                .eq('user_id', uid);
            
            if (error) console.error(`Error actualizando orden ${res.order_id}:`, error);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Execution API Update Error:', error);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}
