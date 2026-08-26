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
    const apiKey = process.env["ANTHROPIC_API_KEY"];
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY missing");

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

    const prompt = `Sos un asistente veterinario especializado en ganadería argentina. Analizá el siguiente historial sanitario de un animal y respondé en español, con lenguaje simple y directo, sin tecnicismos innecesarios.

Animal: caravana ${data.caravana}, ${data.raza}, ${data.categoria ?? "categoría no informada"}, nacido el ${data.fecha_nacimiento ?? "fecha no informada"}, sistema de cría ${data.sistema_cria ?? "no informado"}.

Historial sanitario:
${lista}

Respondé con:
1. Estado sanitario general (una oración simple)
2. Vacunas o tratamientos que están por vencer o ya vencieron
3. Riesgos que detectás en el historial
4. Qué recomendarías revisar próximamente

Sé breve y claro. Máximo 150 palabras.`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 700,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("Anthropic error", res.status, detail.slice(0, 500));
      throw new Error(`Anthropic request failed with status ${res.status}`);
    }

    const json = (await res.json()) as { content?: Array<{ type: string; text?: string }> };
    const texto = (json.content ?? [])
      .filter((c) => c.type === "text" && c.text)
      .map((c) => c.text!.trim())
      .join("\n\n");

    return { analisis: texto || "El análisis no devolvió contenido." };
  });
