import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Eye, QrCode, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { animales as mockAnimales } from "@/lib/trazagan-data";
import { fetchAnimales } from "@/lib/animal-api";

export const Route = createFileRoute("/animales/")({
  head: () => ({
    meta: [
      { title: "Animales · TrazaGan" },
      { name: "description", content: "Listado completo del rodeo con caravana, raza, categoría y estado sanitario." },
      { property: "og:title", content: "Animales · TrazaGan" },
      { property: "og:description", content: "Listado completo del rodeo con caravana, raza, categoría y estado sanitario." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AnimalesIndex,
});

type Row = { caravana: string; raza: string; categoria: string; estado: string };

function AnimalesIndex() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["animales"],
    queryFn: fetchAnimales,
    retry: 1,
  });

  const mockRows: Row[] = mockAnimales.map((a) => ({
    caravana: a.caravana,
    raza: a.raza,
    categoria: a.categoria,
    estado: a.estado,
  }));

  const rows: Row[] =
    data && data.length > 0
      ? data.map((a) => ({
          caravana: a.caravana,
          raza: a.raza,
          categoria: a.categoria ?? "—",
          estado: a.estado ?? "activo",
        }))
      : mockRows;

  return (
    <AppLayout>
      <div className="p-8 max-w-[1400px]">
        <header className="mb-6">
          <h1 className="text-2xl font-display font-semibold">Animales</h1>
          <p className="text-sm text-muted-foreground mt-1">{rows.length} registros mostrados</p>
        </header>

        <div className="rounded-xl bg-card border border-border shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Cargando animales…
            </div>
          ) : (
            <>
              {isError && (
                <div className="px-5 py-2 text-xs text-accent-foreground bg-accent/20">
                  Sin conexión con la base de datos — mostrando datos de demostración.
                </div>
              )}
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
                  {rows.map((a) => (
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
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
