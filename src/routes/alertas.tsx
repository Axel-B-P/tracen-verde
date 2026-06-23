import { createFileRoute } from "@tanstack/react-router";
import { BellRing } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { alertas } from "@/lib/trazagan-data";

export const Route = createFileRoute("/alertas")({
  head: () => ({ meta: [{ title: "Alertas · TrazaGan" }] }),
  component: Page,
});

function Page() {
  return (
    <AppLayout>
      <div className="p-8 max-w-[1000px]">
        <header className="mb-6 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-destructive/15 text-destructive flex items-center justify-center">
            <BellRing className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-semibold">Alertas</h1>
            <p className="text-sm text-muted-foreground">Vencimientos, carencias y controles pendientes</p>
          </div>
        </header>

        <ul className="space-y-2">
          {alertas.map((al, i) => {
            const dot = { red: "bg-destructive", amber: "bg-accent", green: "bg-success" }[al.tono];
            return (
              <li
                key={i}
                className="flex items-start gap-3 rounded-xl bg-card border border-border p-4 shadow-sm"
              >
                <span className={`mt-1.5 h-2.5 w-2.5 rounded-full ${dot}`} />
                <span className="text-sm">{al.texto}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </AppLayout>
  );
}
