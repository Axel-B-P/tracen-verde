import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, QrCode } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { animales } from "@/lib/trazagan-data";

export const Route = createFileRoute("/animales/")({
  head: () => ({ meta: [{ title: "Animales · TrazaGan" }] }),
  component: AnimalesIndex,
});

function AnimalesIndex() {
  return (
    <AppLayout>
      <div className="p-8 max-w-[1400px]">
        <header className="mb-6">
          <h1 className="text-2xl font-display font-semibold">Animales</h1>
          <p className="text-sm text-muted-foreground mt-1">{animales.length} registros mostrados (de 150 totales)</p>
        </header>

        <div className="rounded-xl bg-card border border-border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground border-b border-border bg-muted/30">
                <th className="px-5 py-3 font-medium">Caravana</th>
                <th className="px-5 py-3 font-medium">Raza</th>
                <th className="px-5 py-3 font-medium">Categoría</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {animales.map((a) => (
                <tr key={a.caravana} className="border-b border-border last:border-0 hover:bg-muted/40">
                  <td className="px-5 py-3 font-medium">{a.caravana}</td>
                  <td className="px-5 py-3 text-muted-foreground">{a.raza}</td>
                  <td className="px-5 py-3 text-muted-foreground">{a.categoria}</td>
                  <td className="px-5 py-3">
                    {a.estado === "activo" ? (
                      <span className="inline-flex items-center rounded-full bg-success/15 text-success px-2.5 py-0.5 text-xs font-medium">Activo</span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-accent/25 text-accent-foreground px-2.5 py-0.5 text-xs font-medium">Carencia activa</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to="/animales/$caravana"
                        params={{ caravana: a.caravana }}
                        className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-medium hover:bg-muted"
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
        </div>
      </div>
    </AppLayout>
  );
}
