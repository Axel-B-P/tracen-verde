import { createFileRoute } from "@tanstack/react-router";
import { QrCode } from "lucide-react";
import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { animales } from "@/lib/trazagan-data";

export const Route = createFileRoute("/qr")({
  head: () => ({ meta: [{ title: "Generar QR · TrazaGan" }] }),
  component: Page,
});

function Page() {
  const [selected, setSelected] = useState(animales[0].caravana);
  const animal = animales.find((a) => a.caravana === selected)!;

  return (
    <AppLayout>
      <div className="p-8 max-w-[1000px]">
        <header className="mb-6 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-accent/25 text-accent-foreground flex items-center justify-center">
            <QrCode className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-semibold">Generar QR</h1>
            <p className="text-sm text-muted-foreground">Código de trazabilidad para faena y consumidor final</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl bg-card border border-border p-5 shadow-sm">
            <label className="text-xs uppercase tracking-wide text-muted-foreground">Animal</label>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              {animales.map((a) => (
                <option key={a.caravana} value={a.caravana}>
                  {a.caravana} — {a.raza} ({a.categoria})
                </option>
              ))}
            </select>

            <dl className="mt-5 space-y-3 text-sm">
              <div>
                <dt className="text-[11px] uppercase text-muted-foreground">Establecimiento</dt>
                <dd>{animal.establecimiento}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase text-muted-foreground">Última vacuna</dt>
                <dd>{animal.ultimaVacuna}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase text-muted-foreground">Estado</dt>
                <dd>{animal.apto ? "Apto para consumo" : "Carencia activa"}</dd>
              </div>
            </dl>

            <button className="mt-5 w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90">
              Descargar QR
            </button>
          </div>

          <div className="rounded-xl bg-card border border-border p-5 shadow-sm flex flex-col items-center justify-center">
            <div className="aspect-square w-full max-w-[260px] rounded-lg bg-foreground/95 p-4 grid grid-cols-12 gap-0.5">
              {Array.from({ length: 144 }).map((_, i) => {
                const seed = (i * 9301 + selected.charCodeAt(3) * 49297) % 233280;
                const on = seed / 233280 > 0.48;
                return (
                  <div
                    key={i}
                    className={on ? "bg-background rounded-[1px]" : "bg-transparent"}
                  />
                );
              })}
            </div>
            <div className="mt-4 text-xs text-muted-foreground">trazagan.ar/{animal.caravana}</div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
