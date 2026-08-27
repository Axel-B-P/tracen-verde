import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, QrCode, CheckCircle2, MapPin, Wheat, ShieldCheck, Calendar, Loader2, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { getAnimal } from "@/lib/trazagan-data";
import { analizarHistorial } from "@/lib/ai-analisis.functions";
import {
  fetchAnimalByCaravana,
  fetchRegistrosByAnimalId,
  formatFecha,
  type DbAnimal,
  type DbRegistroSanitario,
} from "@/lib/animal-api";


export const Route = createFileRoute("/animales/$caravana")({
  head: ({ params }) => ({
    meta: [{ title: `${params.caravana} · TrazaGan` }],
  }),
  component: AnimalDetail,
});

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm text-foreground mt-0.5">{value}</div>
    </div>
  );
}

function AnimalDetail() {
  const { caravana } = Route.useParams();

  const animalQuery = useQuery({
    queryKey: ["animal", caravana],
    queryFn: () => fetchAnimalByCaravana(caravana),
    retry: 1,
  });

  const animalId = animalQuery.data?.id;
  const registrosQuery = useQuery({
    queryKey: ["registros", animalId],
    queryFn: () => fetchRegistrosByAnimalId(animalId!),
    enabled: !!animalId,
    retry: 1,
  });

  if (animalQuery.isLoading) {
    return (
      <AppLayout>
        <div className="p-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Cargando ficha…
        </div>
      </AppLayout>
    );
  }


  const db: DbAnimal | null = animalQuery.data ?? null;
  const mock = getAnimal(caravana);

  if (!db && !mock) {
    return (
      <AppLayout>
        <div className="p-8 space-y-2">
          <p className="text-muted-foreground">No se encontró ningún animal con caravana {caravana}.</p>
          <Link to="/" className="text-secondary hover:text-primary text-sm">← Volver al dashboard</Link>
        </div>
      </AppLayout>
    );
  }

  // Build view-model: prefer DB data, fall back to mock for cosmetic fields
  const raza = db?.raza ?? mock!.raza;
  const sexo = db?.sexo ?? mock!.sexo;
  const estadoActivo = (db?.estado ?? mock!.estado) === "activo";
  const establecimiento = mock?.establecimiento ?? "La Querencia";
  const localidad = mock?.localidad ?? "Villa del Rosario, Córdoba";
  const sistemaCria = db?.sistema_cria ?? mock?.sistemaCria ?? "—";
  const fechaNacimiento = db ? formatFecha(db.fecha_nacimiento) : mock?.fechaNacimiento ?? "—";
  const alimentacionTipo = mock?.alimentacionTipo ?? "—";
  const potrero = db?.potrero ?? mock?.potrero ?? "—";
  const periodo = mock?.periodo ?? "—";

  const registros: DbRegistroSanitario[] = registrosQuery.data ?? [];
  const ultimaVacuna = registros.find((r) => r.tipo === "vacuna");
  const proximoVenc = [...registros]
    .filter((r) => r.fecha_vencimiento)
    .sort((a, b) => (a.fecha_vencimiento! < b.fecha_vencimiento! ? -1 : 1))[0];
  const carenciaActiva = registros.some(
    (r) => r.periodo_carencia && r.fecha_vencimiento && new Date(r.fecha_vencimiento) >= new Date(),
  );
  const apto = !carenciaActiva && estadoActivo;

  return (
    <AppLayout>
      <div className="p-8 max-w-[1400px] space-y-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-secondary hover:text-primary font-medium"
        >
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>

        <div className="rounded-xl bg-primary text-primary-foreground p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-semibold">
                {raza} · {sexo} · Caravana #{caravana}
              </h1>
              <p className="text-sm text-primary-foreground/80 mt-1">
                {establecimiento} — {localidad}
              </p>
              <div className="mt-3">
                {apto ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-success px-3 py-1 text-xs font-medium text-success-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Apto para consumo
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                    Carencia activa — no apto
                  </span>
                )}
              </div>
            </div>
            <Link
              to="/qr"
              search={{ caravana }}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 self-start"
            >
              <QrCode className="h-4 w-4" /> Generar QR
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl bg-card border border-border p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <MapPin className="h-4 w-4" />
              <h3 className="font-display font-semibold text-foreground">Origen</h3>
            </div>
            <InfoRow label="Establecimiento" value={establecimiento} />
            <InfoRow label="Localidad" value={localidad} />
            <InfoRow label="Sistema de cría" value={sistemaCria} />
            <InfoRow label="Fecha nacimiento" value={fechaNacimiento} />
          </div>

          <div className="rounded-xl bg-card border border-border p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <Wheat className="h-4 w-4" />
              <h3 className="font-display font-semibold text-foreground">Alimentación</h3>
            </div>
            <InfoRow label="Tipo" value={alimentacionTipo} />
            <InfoRow label="Potrero" value={potrero} />
            <InfoRow label="Período" value={periodo} />
          </div>

          <div className="rounded-xl bg-card border border-border p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <ShieldCheck className="h-4 w-4" />
              <h3 className="font-display font-semibold text-foreground">Estado sanitario</h3>
            </div>
            <InfoRow
              label="Última vacuna"
              value={
                ultimaVacuna
                  ? `${ultimaVacuna.producto ?? "—"} — ${formatFecha(ultimaVacuna.fecha_aplicacion)}`
                  : mock?.ultimaVacuna ?? "—"
              }
            />
            <InfoRow
              label="Próximo vencimiento"
              value={
                proximoVenc
                  ? `${proximoVenc.producto ?? "—"} — ${formatFecha(proximoVenc.fecha_vencimiento)}`
                  : mock?.proximoVencimiento ?? "—"
              }
            />
            <InfoRow label="Carencia activa" value={carenciaActiva ? "Sí" : "No"} />
          </div>
        </div>

        <div className="rounded-xl bg-card border border-border shadow-sm">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <h2 className="font-display font-semibold">Historial sanitario</h2>
          </div>
          {registrosQuery.isLoading ? (
            <div className="flex items-center gap-2 px-5 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Cargando historial…
            </div>
          ) : registros.length === 0 ? (
            mock && mock.historial.length > 0 ? (
              <ol className="p-5 space-y-0">
                {mock.historial.map((ev, i) => (
                  <li key={i} className="relative pl-8 pb-6 last:pb-0">
                    <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-primary/15" />
                    {i < mock.historial.length - 1 && (
                      <span className="absolute left-[5px] top-5 bottom-0 w-px bg-border" />
                    )}
                    <div className="text-xs text-muted-foreground">{ev.fecha}</div>
                    <div className="text-sm font-medium text-foreground mt-0.5">
                      {ev.evento}
                      {ev.detalle ? (
                        <span className="text-muted-foreground font-normal"> ({ev.detalle})</span>
                      ) : null}
                      <span className="ml-2 text-success">✓</span>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="px-5 py-8 text-sm text-muted-foreground">
                Sin registros sanitarios para este animal.
              </div>
            )
          ) : (
            <ol className="p-5 space-y-0">
              {registros.map((r, i) => (
                <li key={r.id} className="relative pl-8 pb-6 last:pb-0">
                  <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-primary/15" />
                  {i < registros.length - 1 && (
                    <span className="absolute left-[5px] top-5 bottom-0 w-px bg-border" />
                  )}
                  <div className="text-xs text-muted-foreground">{formatFecha(r.fecha_aplicacion)}</div>
                  <div className="text-sm font-medium text-foreground mt-0.5">
                    <span className="capitalize">{r.tipo}</span>
                    {r.producto ? ` — ${r.producto}` : ""}
                    {r.dosis ? (
                      <span className="text-muted-foreground font-normal"> (dosis {r.dosis}ml)</span>
                    ) : null}
                    <span className="ml-2 text-success">✓</span>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
