import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const registroSchema = z.object({
  tipo: z.string().max(80),
  producto: z.string().max(120).nullable().optional(),
  dosis: z.number().nullable().optional(),
  fecha_aplicacion: z.string().max(40),
  fecha_vencimiento: z.string().max(40).nullable().optional(),
  periodo_carencia: z.number().nullable().optional(),
});

const inputSchema = z.object({
  caravana: z.string().trim().min(1).max(60),
  raza: z.string().trim().max(80).default("—"),
  categoria: z.string().trim().max(80).nullable().optional(),
  sistema_cria: z.string().trim().max(80).nullable().optional(),
  fecha_nacimiento: z.string().trim().max(40).nullable().optional(),
  registros: z.array(registroSchema).max(100).default([]),
});

export const analizarHistorial = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env["GROQ_API_KEY"];
    if (!apiKey) throw new Error("GROQ_API_KEY missing");

    const lista =
      data.registros.length === 0
        ? "Sin registros sanitarios cargados."
        : data.registros
            .map(
              (r) =>
                `- ${r.tipo}${r.producto ? ` (${r.producto})` : ""}${
                  r.dosis ? `, dosis ${r.dosis}ml` : ""
                }, aplicado el ${r.fecha_aplicacion}${
                  r.fecha_vencimiento ? `, vence el ${r.fecha_vencimiento}` : ""
                }${r.periodo_carencia ? `, período de carencia ${r.periodo_carencia} días` : ""}`,
            )
            .join("\n");

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        max_tokens: 400,
        messages: [
          {
            role: "system",
            content:
              "Sos un asistente veterinario especializado en ganadería argentina. Respondé siempre en español, con lenguaje simple y directo, sin tecnicismos innecesarios.",
          },
          {
            role: "user",
            content: `Analizá el siguiente historial sanitario de un animal y respondé con: 1) Estado sanitario general en una oración, 2) Vacunas o tratamientos por vencer o ya vencidos, 3) Riesgos que detectás, 4) Qué recomendarías revisar. Sé breve, máximo 150 palabras.\n\nAnimal: ${data.raza}, ${data.categoria ?? "categoría no informada"}, nacido el ${data.fecha_nacimiento ?? "fecha no informada"}, sistema de cría ${data.sistema_cria ?? "no informado"}.\n\nHistorial:\n${lista}`,
          },
        ],
      }),
    });

    if (!res.ok) {
      let detail = "";
      try {
        detail = await res.text();
      } catch (_) {
        detail = "No response body";
      }
      const fullError = `Groq request failed with status ${res.status}: ${detail}`;
      console.error(fullError);
      throw new Error(fullError);
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const texto = json.choices?.[0]?.message?.content?.trim() ?? "";

    return { analisis: texto || "El análisis no devolvió contenido." };
  });
