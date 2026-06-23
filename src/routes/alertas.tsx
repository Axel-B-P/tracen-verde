import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Clock, CalendarCheck, Check } from "lucide-react";
import { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";

export const Route = createFileRoute("/alertas")({
  head: () => ({ meta: [{ title: "Alertas · TrazaGan" }] }),
  component: Page,
});

type Tono = "red" | "amber" | "green";
type Alerta = {
  id: string;
  tono: Tono;
  caravana: string;
  descripcion: string;
  fecha: string;
};

const initial: Alerta[] = [
  { id: "1", tono: "red", caravana: "AR-0015", descripcion: "Carencia activa por Oxitetraciclina — vence el 28/06/2026", fecha: "28/06/2026" },
  { id: "2", tono: "red", caravana: "AR-0031", descripcion: "Vacuna Tuberculosis vencida desde el 01/06/2026", fecha: "01/06/2026" },
  { id: "3", tono: "amber", caravana: "AR-0042", descripcion: "Vacuna Aftosa vence en 5 días (28/06/2026)", fecha: "28/06/2026" },
  { id: "4", tono: "amber", caravana: "AR-0078", descripcion: "Control lechero mensual pendiente", fecha: "—" },
  { id: "5", tono: "green", caravana: "AR-0093", descripcion: "Desparasitación programada para 30/06/2026", fecha: "30/06/2026" },
];

type FilterKey = "todas" | "criticas" | "proximas" | "resueltas";
const tabs: { key: FilterKey; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "criticas", label: "Críticas" },
  { key: "proximas", label: "Próximas" },
  { key: "resueltas", label: "Resueltas" },
];

function Page() {
  const [alerts, setAlerts] = useState(initial);
  const [resolved, setResolved] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<FilterKey>("todas");

  const pendientes = alerts.length - resolved.size;

  const visible = useMemo(
    () =>
      alerts.filter((a) => {
        const isResolved = resolved.has(a.id);
        if (filter === "resueltas") return isResolved;
        if (isResolved) return false;
        if (filter === "criticas") return a.tono === "red";
        if (filter === "proximas") return a.tono === "amber";
        return true;
      }),
    [alerts, resolved, filter],
  );

  const toggle = (id: string) =>
    setResolved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <AppLayout>
      <div className="p-8 max-w-[1100px]">
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h1 className="font-display text-lg font-semibold text-foreground">Centro de alertas</h1>
            <span className="inline-flex items-center rounded-full bg-destructive/15 text-destructive px-3 py-1 text-xs font-semibold">
              {pendientes} pendientes
            </span>
          </div>

          <div className="px-6 pt-4 flex gap-1 border-b border-border">
            {tabs.map((t) => {
              const active = filter === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setFilter(t.key)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    active
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <ul className="divide-y divide-border">
            {visible.length === 0 && (
              <li className="px-6 py-10 text-center text-sm text-muted-foreground">
                No hay alertas en esta categoría.
              </li>
            )}
            {visible.map((a) => {
              const isResolved = resolved.has(a.id);
              const dot = { red: "bg-destructive", amber: "bg-accent", green: "bg-success" }[a.tono];
              const Icon = a.tono === "red" ? AlertTriangle : a.tono === "amber" ? Clock : CalendarCheck;
              const iconCls = {
                red: "text-destructive",
                amber: "text-accent-foreground",
                green: "text-success",
              }[a.tono];
              return (
                <li
                  key={a.id}
                  className={`flex items-center gap-4 px-6 py-4 ${isResolved ? "opacity-60" : ""}`}
                >
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
                    <Icon className={`h-4 w-4 ${iconCls}`} />
                  </div>
                  <div className={`flex-1 min-w-0 ${isResolved ? "line-through text-muted-foreground" : ""}`}>
                    <Link
                      to="/animales/$caravana"
                      params={{ caravana: a.caravana }}
                      className="font-semibold text-foreground hover:text-primary"
                    >
                      {a.caravana}
                    </Link>
                    <span className="text-sm text-muted-foreground"> — {a.descripcion}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-muted-foreground tabular-nums">{a.fecha}</span>
                    <button
                      onClick={() => toggle(a.id)}
                      className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                        isResolved
                          ? "border-success/40 bg-success/10 text-success"
                          : "border-primary/40 text-primary hover:bg-primary/10"
                      }`}
                    >
                      {isResolved ? (
                        <>
                          <Check className="h-3.5 w-3.5" /> Resuelta
                        </>
                      ) : (
                        "Resolver"
                      )}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </AppLayout>
  );
}
