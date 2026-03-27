import { NextResponse } from "next/server";
import { verifyUser } from "@/lib/auth-server";

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const TEAM_ID = process.env.VERCEL_TEAM_ID;

export async function POST(req: Request) {
  try {
    const { userId, projectId } = await req.json();

    if (!userId || !projectId) {
      return NextResponse.json({ error: "Faltan datos de usuario o ID de proyecto" }, { status: 400 });
    }

    const isOwner = await verifyUser(req, userId);
    if (!isOwner) return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });

    if (!VERCEL_TOKEN) {
      return NextResponse.json({ error: "Vercel Token no configurado en el servidor" }, { status: 500 });
    }

    // Borrar el proyecto en Vercel
    const deleteUrl = `https://api.vercel.com/v9/projects/${projectId}${TEAM_ID ? `?teamId=${TEAM_ID}` : ''}`;
    const deleteRes = await fetch(deleteUrl, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${VERCEL_TOKEN}`
      }
    });

    if (!deleteRes.ok) {
      const errorData = await deleteRes.json();
      console.error("Vercel Delete Error:", errorData);
      // No lanzamos error si no lo encuentra (ya podría estar borrado)
      if (deleteRes.status !== 404) {
          throw new Error(errorData.error?.message || "Error al eliminar el proyecto en Vercel");
      }
    }

    return NextResponse.json({ success: true, message: "Proyecto eliminado correctamente" });

  } catch (error: any) {
    console.error("Delete Project Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
