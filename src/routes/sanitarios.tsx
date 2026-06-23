import { createFileRoute } from "@tanstack/react-router";
import { Syringe } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { animales } from "@/lib/trazagan-data";

export const Route = createFileRoute("/sanitarios")({
  head: () => ({ meta: [{ title: "Registros sanitarios · TrazaGan" }] }),
  component: Page,
});

function Page() {
  const eventos = animales.flatMap((a) =>
    a.historial.map((h) => ({ ...h, caravana: a.caravana, raza: a.raza })),
  );
  return (
    <AppLayout>
      <div className="p-8 max-w-[1400px]">
        <header className="mb-6 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Syringe className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-semibold">Registros sanitarios</h1>
            <p className="text-sm text-muted-foreground">Vacunas, antiparasitarios y controles veterinarios</p>
          </div>
        </header>

        <div className="rounded-xl bg-card border border-border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground border-b border-border bg-muted/30">
                <th className="px-5 py-3 font-medium">Fecha</th>
                <th className="px-5 py-3 font-medium">Caravana</th>
                <th className="px-5 py-3 font-medium">Raza</th>
                <th className="px-5 py-3 font-medium">Evento</th>
                <th className="px-5 py-3 font-medium">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {eventos.map((e, i) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/40">
                  <td className="px-5 py-3 text-muted-foreground">{e.fecha}</td>
                  <td className="px-5 py-3 font-medium">{e.caravana}</td>
                  <td className="px-5 py-3 text-muted-foreground">{e.raza}</td>
                  <td className="px-5 py-3">{e.evento}</td>
                  <td className="px-5 py-3 text-muted-foreground">{e.detalle ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
