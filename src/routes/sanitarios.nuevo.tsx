import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { fetchAnimales, insertRegistro } from "@/lib/animal-api";

export const Route = createFileRoute("/sanitarios/nuevo")({
  validateSearch: (search: Record<string, unknown>) => ({
    caravana: typeof search.caravana === "string" ? search.caravana : undefined,
  }),
  head: () => ({
    meta: [{ title: "Nuevo registro sanitario · TrazaGan" }],
  }),
  component: NuevoRegistroPage,
});

const tipos = [
  { value: "vacuna", label: "Vacuna" },
  { value: "antiparasitario", label: "Antiparasitario" },
  { value: "control", label: "Control veterinario" },
  { value: "tratamiento", label: "Tratamiento" },
  { value: "otro", label: "Otro" },
];

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function NuevoRegistroPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { caravana: caravanaParam } = Route.useSearch();

  const animalesQuery = useQuery({
    queryKey: ["animales"],
    queryFn: fetchAnimales,
    retry: 1,
  });
  const animales = animalesQuery.data ?? [];

  const [form, setForm] = useState({
    animalId: "",
    tipo: "vacuna",
    producto: "",
    dosis: "",
    fechaAplicacion: "",
    fechaVencimiento: "",
    periodoCarencia: "",
    observaciones: "",
  });
  const [errors, setErrors] = useState<{
    animalId?: string;
    producto?: string;
    fechaAplicacion?: string;
  }>({});

  // Preseleccionar animal si viene ?caravana= en la URL
  useEffect(() => {
    if (!caravanaParam) return;
    const match = animales.find((a) => a.caravana === caravanaParam);
    if (match) setForm((f) => (f.animalId ? f : { ...f, animalId: match.id }));
  }, [caravanaParam, animales]);


  const mutation = useMutation({
    mutationFn: insertRegistro,
    onSuccess: async () => {
      toast.success("Registro sanitario guardado correctamente ✓");
      await queryClient.invalidateQueries({ queryKey: ["registros"] });
      navigate({ to: "/sanitarios" });
    },
    onError: (err: Error) => {
      toast.error(`No se pudo guardar: ${err.message}`);
    },
  });

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const inputBase =
    "flex h-10 w-full rounded-md border bg-card px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";
  const ok = "border-input";
  const bad = "border-destructive focus-visible:ring-destructive";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!form.animalId) errs.animalId = "Seleccioná un animal";
    if (!form.producto.trim()) errs.producto = "El producto es obligatorio";
    if (!form.fechaAplicacion) errs.fechaAplicacion = "La fecha de aplicación es obligatoria";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    mutation.mutate({
      animal_id: form.animalId,
      tipo: form.tipo,
      producto: form.producto.trim(),
      dosis: form.dosis ? Number(form.dosis) : null,
      fecha_aplicacion: form.fechaAplicacion,
      fecha_vencimiento: form.fechaVencimiento || null,
      periodo_carencia: form.periodoCarencia ? Number(form.periodoCarencia) : null,
      observaciones: form.observaciones || undefined,
    });
  };

  const submitting = mutation.isPending;
  const sinAnimales = !animalesQuery.isLoading && animales.length === 0;

  return (
    <AppLayout>
      <div className="p-8 max-w-[1100px]">
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="bg-primary text-primary-foreground px-6 py-4 flex items-center gap-3">
            <Link
              to="/sanitarios"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/10"
              aria-label="Volver"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="font-display text-lg font-semibold">Nuevo registro sanitario</h1>
          </div>

          {animalesQuery.isError && (
            <div className="px-6 py-2 text-xs text-accent-foreground bg-accent/20">
              Sin conexión con la base de datos — no se pudieron cargar los animales.
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Field label="Animal" required error={errors.animalId}>
                  {animalesQuery.isLoading ? (
                    <div className="flex items-center gap-2 h-10 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" /> Cargando animales…
                    </div>
                  ) : sinAnimales ? (
                    <p className="text-sm text-muted-foreground pt-2">
                      No hay animales cargados.{" "}
                      <Link to="/animales/nuevo" className="text-secondary hover:text-primary font-medium">
                        Registrá uno primero
                      </Link>
                      .
                    </p>
                  ) : (
                    <select
                      value={form.animalId}
                      onChange={(e) => update("animalId", e.target.value)}
                      className={`${inputBase} ${errors.animalId ? bad : ok}`}
                    >
                      <option value="">Seleccionar animal...</option>
                      {animales.map((a) => (
                        <option key={a.id} value={a.id}>
                          #{a.caravana} — {a.raza}
                        </option>
                      ))}
                    </select>
                  )}
                </Field>

                <Field label="Tipo de registro">
                  <select
                    value={form.tipo}
                    onChange={(e) => update("tipo", e.target.value)}
                    className={`${inputBase} ${ok}`}
                  >
                    {tipos.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Producto" required error={errors.producto}>
                  <input
                    type="text"
                    placeholder="Ej: Aftosa doble oleosa"
                    value={form.producto}
                    onChange={(e) => update("producto", e.target.value)}
                    className={`${inputBase} ${errors.producto ? bad : ok}`}
                  />
                </Field>

                <Field label="Dosis (ml)">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="Ej: 5"
                    value={form.dosis}
                    onChange={(e) => update("dosis", e.target.value)}
                    className={`${inputBase} ${ok}`}
                  />
                </Field>
              </div>

              <div className="space-y-4">
                <Field label="Fecha de aplicación" required error={errors.fechaAplicacion}>
                  <input
                    type="date"
                    value={form.fechaAplicacion}
                    onChange={(e) => update("fechaAplicacion", e.target.value)}
                    className={`${inputBase} ${errors.fechaAplicacion ? bad : ok}`}
                  />
                </Field>

                <Field label="Fecha de vencimiento">
                  <input
                    type="date"
                    value={form.fechaVencimiento}
                    onChange={(e) => update("fechaVencimiento", e.target.value)}
                    className={`${inputBase} ${ok}`}
                  />
                </Field>

                <Field label="Período de carencia (días)">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Ej: 30"
                    value={form.periodoCarencia}
                    onChange={(e) => update("periodoCarencia", e.target.value)}
                    className={`${inputBase} ${ok}`}
                  />
                </Field>
              </div>
            </div>

            <Field label="Observaciones">
              <textarea
                rows={3}
                value={form.observaciones}
                onChange={(e) => update("observaciones", e.target.value)}
                className="flex w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </Field>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
              <Link
                to="/sanitarios"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={submitting || sinAnimales}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? "Guardando…" : "Guardar registro"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
