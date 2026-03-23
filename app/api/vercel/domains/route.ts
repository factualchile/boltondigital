import { NextResponse } from "next/server";
import { verifyUser } from "@/lib/auth-server";

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;

export async function POST(req: Request) {
  try {
    const { userId, projectId, domain } = await req.json();
    if (!userId || !projectId || !domain) {
      return NextResponse.json({ error: "Faltan datos obligatorios (User, Project o Dominio)" }, { status: 400 });
    }

    const isOwner = await verifyUser(req, userId);
    if (!isOwner) return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });

    if (!VERCEL_TOKEN) return NextResponse.json({ error: "Vercel Token no configurado" }, { status: 500 });

    // 1. AGREGAR DOMINIO AL PROYECTO
    const addRes = await fetch(`https://api.vercel.com/v9/projects/${projectId}/domains`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${VERCEL_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name: domain })
    });

    const addData = await addRes.json();
    if (!addRes.ok) throw new Error(addData.error?.message || "Error al añadir dominio");

    // 2. OBTENER CONFIGURACIÓN DNS
    const configRes = await fetch(`https://api.vercel.com/v6/domains/${domain}/config`, {
        headers: { "Authorization": `Bearer ${VERCEL_TOKEN}` }
    });
    const configData = await configRes.json();

    return NextResponse.json({ 
      success: true, 
      domain: addData.name,
      misconfigured: addData.misconfigured,
      dns: {
          a: "76.76.21.21", // IP estándar de Vercel
          cname: "cname.vercel-dns.com."
      }
    });

  } catch (error: any) {
    console.error("Vercel Domain Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const domain = searchParams.get("domain");

        if (!domain) return NextResponse.json({ error: "Dominio requerido" }, { status: 400 });

        const res = await fetch(`https://api.vercel.com/v6/domains/${domain}/config`, {
            headers: { "Authorization": `Bearer ${VERCEL_TOKEN}` }
        });
        const data = await res.json();

        return NextResponse.json({ success: true, ...data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
