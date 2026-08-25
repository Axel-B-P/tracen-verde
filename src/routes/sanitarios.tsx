import { createFileRoute, Link } from "@tanstack/react-router";
import { Syringe, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { fetchRegistros, formatFecha } from "@/lib/animal-api";

export const Route = createFileRoute("/sanitarios")({
  head: () => ({
    meta: [
      { title: "Registros sanitarios · TrazaGan" },
      {
        name: "description",
        content: "Vacunas, antiparasitarios y controles veterinarios de tu rodeo.",
      },
      { property: "og:title", content: "Registros sanitarios · TrazaGan" },
      {
        property: "og:description",
        content: "Historial sanitario completo del rodeo en TrazaGan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["registros"],
    queryFn: fetchRegistros,
    retry: 1,
  });

  const eventos = data ?? [];

  return (
    <AppLayout>
      <div className="p-8 max-w-[1400px]">
        <header className="mb-6 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Syringe className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-semibold">Registros sanitarios</h1>
            <p className="text-sm text-muted-foreground">
              Vacunas, antiparasitarios y controles veterinarios
            </p>
          </div>
        </header>

        <div className="rounded-xl bg-card border border-border shadow-sm overflow-hidden">
          {isError && (
            <div className="px-5 py-2 text-xs text-accent-foreground bg-accent/20">
              Sin conexión con la base de datos — no se pudieron cargar los registros.
            </div>
          )}
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Cargando registros…
            </div>
          ) : eventos.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-muted-foreground">
              Todavía no hay registros sanitarios cargados.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground border-b border-border bg-muted/30">
                  <th className="px-5 py-3 font-medium">Fecha</th>
                  <th className="px-5 py-3 font-medium">Caravana</th>
                  <th className="px-5 py-3 font-medium">Raza</th>
                  <th className="px-5 py-3 font-medium">Tipo</th>
                  <th className="px-5 py-3 font-medium">Producto</th>
                  <th className="px-5 py-3 font-medium">Vencimiento</th>
                </tr>
              </thead>
              <tbody>
                {eventos.map((e) => (
                  <tr key={e.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                    <td className="px-5 py-3 text-muted-foreground">
                      {formatFecha(e.fecha_aplicacion)}
                    </td>
                    <td className="px-5 py-3 font-medium">
                      {e.animal ? (
                        <Link
                          to="/animales/$caravana"
                          params={{ caravana: e.animal.caravana }}
                          className="hover:text-primary"
                        >
                          {e.animal.caravana}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{e.animal?.raza ?? "—"}</td>
                    <td className="px-5 py-3 capitalize">{e.tipo}</td>
                    <td className="px-5 py-3 text-muted-foreground">{e.producto ?? "—"}</td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {formatFecha(e.fecha_vencimiento)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
