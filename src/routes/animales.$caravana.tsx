import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, QrCode, CheckCircle2, MapPin, Wheat, ShieldCheck, Calendar } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { getAnimal } from "@/lib/trazagan-data";

export const Route = createFileRoute("/animales/$caravana")({
  head: ({ params }) => ({
    meta: [{ title: `${params.caravana} · TrazaGan` }],
  }),
  loader: ({ params }) => {
    const animal = getAnimal(params.caravana);
    if (!animal) throw notFound();
    return { animal };
  },
  component: AnimalDetail,
  notFoundComponent: () => (
    <AppLayout>
      <div className="p-8">
        <p className="text-muted-foreground">Animal no encontrado.</p>
        <Link to="/" className="text-secondary hover:text-primary text-sm">← Volver al dashboard</Link>
      </div>
    </AppLayout>
  ),
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
  const { animal } = Route.useLoaderData();

  return (
    <AppLayout>
      <div className="p-8 max-w-[1400px] space-y-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-secondary hover:text-primary font-medium"
        >
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>

        {/* Header */}
        <div className="rounded-xl bg-primary text-primary-foreground p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-semibold">
                {animal.raza} · {animal.sexo} · Caravana #{animal.caravana}
              </h1>
              <p className="text-sm text-primary-foreground/80 mt-1">
                {animal.establecimiento} — {animal.localidad}
              </p>
              <div className="mt-3">
                {animal.apto ? (
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
              search={{ caravana: animal.caravana }}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 self-start"
            >
              <QrCode className="h-4 w-4" /> Generar QR
            </Link>
          </div>
        </div>

        {/* 3 info cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl bg-card border border-border p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <MapPin className="h-4 w-4" />
              <h3 className="font-display font-semibold text-foreground">Origen</h3>
            </div>
            <InfoRow label="Establecimiento" value={animal.establecimiento} />
            <InfoRow label="Localidad" value={animal.localidad} />
            <InfoRow label="Sistema de cría" value={animal.sistemaCria} />
            <InfoRow label="Fecha nacimiento" value={animal.fechaNacimiento} />
          </div>

          <div className="rounded-xl bg-card border border-border p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <Wheat className="h-4 w-4" />
              <h3 className="font-display font-semibold text-foreground">Alimentación</h3>
            </div>
            <InfoRow label="Tipo" value={animal.alimentacionTipo} />
            <InfoRow label="Potrero" value={animal.potrero} />
            <InfoRow label="Período" value={animal.periodo} />
          </div>

          <div className="rounded-xl bg-card border border-border p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <ShieldCheck className="h-4 w-4" />
              <h3 className="font-display font-semibold text-foreground">Estado sanitario</h3>
            </div>
            <InfoRow label="Última vacuna" value={animal.ultimaVacuna} />
            <InfoRow label="Próximo vencimiento" value={animal.proximoVencimiento} />
            <InfoRow label="Carencia activa" value={animal.carenciaActiva ? "Sí" : "No"} />
          </div>
        </div>

        {/* Timeline */}
        <div className="rounded-xl bg-card border border-border shadow-sm">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <h2 className="font-display font-semibold">Historial sanitario</h2>
          </div>
          <ol className="p-5 space-y-0">
            {animal.historial.map((ev: { fecha: string; evento: string; detalle?: string }, i: number) => (
              <li key={i} className="relative pl-8 pb-6 last:pb-0">
                <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-primary/15" />
                {i < animal.historial.length - 1 && (
                  <span className="absolute left-[5px] top-5 bottom-0 w-px bg-border" />
                )}
                <div className="text-xs text-muted-foreground">{ev.fecha}</div>
                <div className="text-sm font-medium text-foreground mt-0.5">
                  {ev.evento}
                  {ev.detalle ? <span className="text-muted-foreground font-normal"> ({ev.detalle})</span> : null}
                  <span className="ml-2 text-success">✓</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </AppLayout>
  );
}
