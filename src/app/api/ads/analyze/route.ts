import { NextRequest, NextResponse } from 'next/server';
import { analyzeMetrics } from '@/lib/ads/openai';

export async function POST(req: NextRequest) {
    try {
        const { metrics } = await req.json();
        
        if (!metrics) {
            return NextResponse.json({ error: 'Métricas no proporcionadas' }, { status: 400 });
        }

        const analysis = await analyzeMetrics(metrics);
        
        if (!analysis) {
            return NextResponse.json({ error: 'Error al procesar el análisis' }, { status: 500 });
        }

        return NextResponse.json(analysis);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
