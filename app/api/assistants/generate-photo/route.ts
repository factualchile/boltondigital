import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { verifyUser } from "@/lib/auth-server";

export async function POST(req: Request) {
  try {
    const { imageUrl, profession, userId } = await req.json();

    if (userId) {
      const isOwner = await verifyUser(req, userId);
      if (!isOwner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. ANALIZAR LA FOTO ORIGINAL PARA EXTRAER RASGOS (CONSISTENCIA)
    const analysisResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "Eres un experto en descripción física para generación de imágenes. Describe detalladamente a la persona en la foto (rasgos faciales, color de pelo, etnia, edad aparente) para que otra IA pueda recrearla fielmente en un entorno distinto. Responde solo con la descripción en inglés." 
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Describe a esta persona para recrearla." },
            { type: "image_url", image_url: { url: imageUrl } }
          ]
        }
      ]
    });

    const personDescription = analysisResponse.choices[0].message.content;

    // 2. GENERAR LA NUEVA FOTO PROFESIONAL
    const prompt = `A ultra-realistic professional corporate portrait of a ${profession}. The person has the following features: ${personDescription}. They are wearing high-end professional attire (suit, blazer, or elegant office wear). They are in a modern, luxury psychotherapy office with soft natural lighting, bookshelves, and a comfortable atmosphere. 8k resolution, cinematic lighting, sharp focus, hyper-realistic photography style. Ensure it looks like a real photo, not 3D render.`;

    const generation = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
      style: "natural"
    });

    const generatedUrl = generation.data?.[0]?.url;
    if (!generatedUrl) throw new Error("No se pudo generar la imagen con esta descripción.");

    return NextResponse.json({ 
      success: true, 
      imageUrl: generatedUrl 
    });

  } catch (error: any) {
    console.error("Image Generation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
