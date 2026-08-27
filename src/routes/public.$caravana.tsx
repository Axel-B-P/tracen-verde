import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, MapPin, Wheat, Calendar, CheckCircle2, AlertTriangle } from "lucide-react";
import { fetchAnimalByCaravana, fetchRegistrosByAnimalId, formatFecha, type DbRegistroSanitario } from "@/lib/animal-api";

export const Route = createFileRoute("/public/$caravana")({
  head: ({ params }) => ({
    meta: [
      { title: `Caravana ${params.caravana} · TrazaGan` },
      { name: "description", content: `Información pública de trazabilidad para la caravana ${params.caravana}.` },
      { property: "og:title", content: `Caravana ${params.caravana} · TrazaGan` },
      { property: "og:description", content: `Información pública de trazabilidad para la caravana ${params.caravana}.` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PublicTraceabilityPage,
});

function tipoAlimentacion(sistema?: string | null): string {
  if (!sistema) return "—";
  const s = sistema.toLowerCase();
  if (s.includes("feedlot")) return "Confinamiento / feedlot";
  if (s.includes("pastoreo")) return "Pastoreo natural";
  if (s.includes("invernada")) return "Invernada";
  if (s.includes("cria")) return "Cría a campo";
  return sistema;
}

function estaVencida(fecha?: string | null): boolean {
  if (!fecha) return false;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return new Date(fecha) < hoy;
}

function carenciaActiva(reg: DbRegistroSanitario): boolean {
  if (!reg.periodo_carencia || !reg.fecha_vencimiento) return false;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return new Date(reg.fecha_vencimiento) >= hoy;
}

function hayRestriccion(registros: DbRegistroSanitario[]): boolean {
  return registros.some(carenciaActiva);
}

function PublicTraceabilityPage() {
  const { caravana } = Route.useParams();

  const animalQuery = useQuery({
    queryKey: ["public-animal", caravana],
    queryFn: () => fetchAnimalByCaravana(caravana),
    retry: 1,
  });

  const animalId = animalQuery.data?.id;
  const registrosQuery = useQuery({
    queryKey: ["public-registros", animalId],
    queryFn: () => fetchRegistrosByAnimalId(animalId!),
    enabled: !!animalId,
    retry: 1,
  });

  if (animalQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> Cargando ficha pública…
        </div>
      </div>
    );
  }

  if (!animalQuery.data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-sm text-center">
          <h1 className="text-xl font-semibold text-foreground">Animal no encontrado</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            No existe información pública para la caravana <strong className="text-foreground">{caravana}</strong>.
          </p>
        </div>
      </div>
    );
  }

  const animal = animalQuery.data;
  const registros = (registrosQuery.data ?? []).sort(
    (a, b) => new Date(b.fecha_aplicacion).getTime() - new Date(a.fecha_aplicacion).getTime(),
  );
  const apto = !hayRestriccion(registros);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-[480px] px-4 py-6">
          <p className="text-xs opacity-80">TrazaGan · Trazabilidad ganadera</p>
          <h1 className="mt-1 text-xl font-display font-semibold leading-tight">
            {animal.raza} · {animal.sexo} · Caravana #{caravana}
          </h1>
          <p className="mt-1 text-sm opacity-80">La Querencia — Villa del Rosario, Córdoba</p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {apto ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success px-3 py-1 text-xs font-medium text-success-foreground">
                <CheckCircle2 className="h-3.5 w-3.5" /> Apto para consumo
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                <AlertTriangle className="h-3.5 w-3.5" /> Restricción activa
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs opacity-90">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            Vista pública activa
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[480px] px-4 py-5 space-y-4">
        <section className="rounded-xl bg-card border border-border p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <MapPin className="h-4 w-4" />
            <h2 className="font-display font-semibold text-foreground">Origen</h2>
          </div>
          <InfoRow label="Establecimiento" value="La Querencia" />
          <InfoRow label="Localidad" value="Villa del Rosario, Córdoba" />
          <InfoRow label="Sistema de cría" value={animal.sistema_cria ?? "—"} />
          <InfoRow label="Fecha de nacimiento" value={formatFecha(animal.fecha_nacimiento)} />
          <InfoRow label="Potrero" value={animal.potrero ?? "—"} />
        </section>

        <section className="rounded-xl bg-card border border-border p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <Wheat className="h-4 w-4" />
            <h2 className="font-display font-semibold text-foreground">Alimentación</h2>
          </div>
          <InfoRow label="Tipo" value={tipoAlimentacion(animal.sistema_cria)} />
          <InfoRow label="Potrero" value={animal.potrero ?? "—"} />
        </section>

        <section className="rounded-xl bg-card border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <h2 className="font-display font-semibold text-foreground">Historial sanitario</h2>
          </div>

          {registrosQuery.isLoading ? (
            <div className="flex items-center gap-2 px-5 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Cargando historial…
            </div>
          ) : registros.length === 0 ? (
            <div className="px-5 py-8 text-sm text-muted-foreground">
              Sin registros sanitarios para este animal.
            </div>
          ) : (
            <ol className="p-5 space-y-0">
              {registros.map((r, i) => {
                const vencida = estaVencida(r.fecha_vencimiento);
                const carencia = carenciaActiva(r);
                return (
                  <li key={r.id} className="relative pl-8 pb-6 last:pb-0">
                    <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-primary/15" />
                    {i < registros.length - 1 && (
                      <span className="absolute left-[5px] top-5 bottom-0 w-px bg-border" />
                    )}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-muted-foreground">{formatFecha(r.fecha_aplicacion)}</span>
                      {vencida && (
                        <span className="inline-flex items-center rounded bg-destructive px-1.5 py-0.5 text-[10px] font-medium text-destructive-foreground">
                          Vencida
                        </span>
                      )}
                      {carencia && (
                        <span className="inline-flex items-center rounded bg-accent px-1.5 py-0.5 text-[10px] font-medium text-accent-foreground">
                          Carencia activa
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-medium text-foreground mt-0.5">
                      <span className="capitalize">{r.tipo}</span>
                      {r.producto ? ` — ${r.producto}` : ""}
                      {r.dosis ? (
                        <span className="text-muted-foreground font-normal"> (dosis {r.dosis}ml)</span>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-[480px] px-4 py-5 text-center text-xs text-muted-foreground space-y-1">
          <p>TrazaGan · Información verificada por el productor</p>
          <p>Tecnicatura en Desarrollo de Software · 2026</p>
        </div>
      </footer>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm text-foreground mt-0.5">{value}</div>
    </div>
  );
}
