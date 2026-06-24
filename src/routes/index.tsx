import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Beef, ShieldCheck, AlertTriangle, BellRing, QrCode, Eye, Plus, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { animales as mockAnimales, alertas } from "@/lib/trazagan-data";
import { fetchAnimales, type DbAnimal } from "@/lib/animal-api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · TrazaGan" },
      { name: "description", content: "Trazabilidad ganadera para productores argentinos." },
    ],
  }),
  component: Dashboard,
});

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  tone: "primary" | "success" | "warning" | "danger";
}) {
  const toneClasses = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/15 text-success",
    warning: "bg-accent/20 text-accent-foreground",
    danger: "bg-destructive/15 text-destructive",
  }[tone];
  return (
    <div className="rounded-xl bg-card border border-border p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
          <div className="mt-2 text-3xl font-display font-semibold text-foreground">{value}</div>
        </div>
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${toneClasses}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function Badge({
  variant,
  children,
}: {
  variant: "active" | "carencia" | "ok";
  children: React.ReactNode;
}) {
  const cls = {
    active: "bg-success/15 text-success",
    carencia: "bg-accent/25 text-accent-foreground",
    ok: "bg-primary/10 text-primary",
  }[variant];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {children}
    </span>
  );
}

type Row = { caravana: string; raza: string; categoria: string; estado: string };

function toRows(db: DbAnimal[]): Row[] {
  return db.map((a) => ({
    caravana: a.caravana,
    raza: a.raza,
    categoria: a.categoria ?? "—",
    estado: a.estado ?? "activo",
  }));
}

function Dashboard() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["animales"],
    queryFn: fetchAnimales,
  });

  const rows: Row[] =
    data && data.length > 0
      ? toRows(data)
      : mockAnimales.map((a) => ({
          caravana: a.caravana,
          raza: a.raza,
          categoria: a.categoria,
          estado: a.estado,
        }));

  return (
    <AppLayout>
      <div className="p-8 max-w-[1400px]">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-semibold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              La Querencia · Villa del Rosario, Córdoba
            </p>
          </div>
          <Link
            to="/animales/nuevo"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> Nuevo animal
          </Link>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total animales" value={data?.length ?? 150} icon={Beef} tone="primary" />
          <StatCard label="Vacunas al día" value={142} icon={ShieldCheck} tone="success" />
          <StatCard label="Con carencia activa" value={3} icon={AlertTriangle} tone="warning" />
          <StatCard label="Alertas pendientes" value={5} icon={BellRing} tone="danger" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">
          <section className="lg:col-span-3 rounded-xl bg-card border border-border shadow-sm">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-display font-semibold text-foreground">Animales recientes</h2>
              <Link
                to="/animales"
                className="text-xs text-secondary hover:text-primary font-medium"
              >
                Ver todos →
              </Link>
            </div>
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Cargando animales…
                </div>
              ) : isError ? (
                <div className="px-5 py-8 text-sm text-destructive">
                  Error al cargar: {(error as Error)?.message ?? "desconocido"}
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground border-b border-border">
                      <th className="px-5 py-3 font-medium">Caravana</th>
                      <th className="px-5 py-3 font-medium">Raza</th>
                      <th className="px-5 py-3 font-medium">Categoría</th>
                      <th className="px-5 py-3 font-medium">Estado</th>
                      <th className="px-5 py-3 font-medium text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((a) => (
                      <tr key={a.caravana} className="border-b border-border last:border-0 hover:bg-muted/40">
                        <td className="px-5 py-3 font-medium text-foreground">{a.caravana}</td>
                        <td className="px-5 py-3 text-muted-foreground">{a.raza}</td>
                        <td className="px-5 py-3 text-muted-foreground">{a.categoria}</td>
                        <td className="px-5 py-3">
                          {a.estado === "activo" ? (
                            <Badge variant="active">Activo</Badge>
                          ) : (
                            <Badge variant="carencia">Carencia activa</Badge>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to="/animales/$caravana"
                              params={{ caravana: a.caravana }}
                              className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted"
                            >
                              <Eye className="h-3.5 w-3.5" /> Ver
                            </Link>
                            <button className="inline-flex items-center gap-1 rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground hover:opacity-90">
                              <QrCode className="h-3.5 w-3.5" /> QR
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          <section className="lg:col-span-2 rounded-xl bg-card border border-border shadow-sm">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="font-display font-semibold text-foreground">Alertas próximas</h2>
            </div>
            <ul className="p-3 space-y-1">
              {alertas.map((al, i) => {
                const dot = {
                  red: "bg-destructive",
                  amber: "bg-accent",
                  green: "bg-success",
                }[al.tono];
                return (
                  <li
                    key={i}
                    className="flex items-start gap-3 rounded-lg px-3 py-3 hover:bg-muted/50"
                  >
                    <span className={`mt-1.5 h-2.5 w-2.5 rounded-full ${dot}`} />
                    <span className="text-sm text-foreground">{al.texto}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
