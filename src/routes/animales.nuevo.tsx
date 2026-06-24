import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { insertAnimal } from "@/lib/animal-api";

export const Route = createFileRoute("/animales/nuevo")({
  head: () => ({
    meta: [{ title: "Nuevo animal · TrazaGan" }],
  }),
  component: NuevoAnimalPage,
});

const razas = ["Angus", "Hereford", "Holstein", "Jersey", "Cruza", "Otra"];
const categorias = [
  "Vaca en ordeñe",
  "Vaca seca",
  "Vaquillona",
  "Ternero/a",
  "Novillo",
  "Toro",
];
const sistemas = ["Pastoril extensivo", "Pastoril intensivo", "Mixto", "Feedlot"];
const origenes = ["Nacido en el campo", "Comprado", "Donación"];

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

function NuevoAnimalPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    caravana: "",
    raza: "",
    sexo: "Macho",
    fechaNacimiento: "",
    categoria: "Vaca en ordeñe",
    sistema: "Pastoril extensivo",
    potrero: "",
    origen: "Nacido en el campo",
    observaciones: "",
  });
  const [errors, setErrors] = useState<{ caravana?: string; raza?: string }>({});

  const mutation = useMutation({
    mutationFn: insertAnimal,
    onSuccess: async (animal) => {
      toast.success(`Animal ${animal.caravana} registrado correctamente ✓`);
      await queryClient.invalidateQueries({ queryKey: ["animales"] });
      navigate({ to: "/" });
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
    const errs: { caravana?: string; raza?: string } = {};
    if (!form.caravana.trim()) errs.caravana = "La caravana es obligatoria";
    if (!form.raza) errs.raza = "Seleccioná una raza";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    mutation.mutate({
      caravana: form.caravana.trim(),
      raza: form.raza,
      sexo: form.sexo,
      categoria: form.categoria,
      fecha_nacimiento: form.fechaNacimiento || null,
      origen: form.origen,
      sistema_cria: form.sistema,
      potrero: form.potrero || undefined,
      observaciones: form.observaciones || undefined,
    });
  };

  const submitting = mutation.isPending;

  return (
    <AppLayout>
      <div className="p-8 max-w-[1100px]">
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="bg-primary text-primary-foreground px-6 py-4 flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/10"
              aria-label="Volver"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="font-display text-lg font-semibold">Registrar nuevo animal</h1>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Field label="Número de caravana" required error={errors.caravana}>
                  <input
                    type="text"
                    placeholder="AR-XXXX"
                    value={form.caravana}
                    onChange={(e) => update("caravana", e.target.value)}
                    className={`${inputBase} ${errors.caravana ? bad : ok}`}
                  />
                </Field>

                <Field label="Raza" required error={errors.raza}>
                  <select
                    value={form.raza}
                    onChange={(e) => update("raza", e.target.value)}
                    className={`${inputBase} ${errors.raza ? bad : ok}`}
                  >
                    <option value="">Seleccionar...</option>
                    {razas.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Sexo">
                  <div className="flex gap-4 pt-1">
                    {["Macho", "Hembra", "Castrado"].map((s) => (
                      <label key={s} className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name="sexo"
                          value={s}
                          checked={form.sexo === s}
                          onChange={(e) => update("sexo", e.target.value)}
                          className="accent-primary"
                        />
                        {s}
                      </label>
                    ))}
                  </div>
                </Field>

                <Field label="Fecha de nacimiento">
                  <input
                    type="date"
                    value={form.fechaNacimiento}
                    onChange={(e) => update("fechaNacimiento", e.target.value)}
                    className={`${inputBase} ${ok}`}
                  />
                </Field>
              </div>

              <div className="space-y-4">
                <Field label="Categoría">
                  <select
                    value={form.categoria}
                    onChange={(e) => update("categoria", e.target.value)}
                    className={`${inputBase} ${ok}`}
                  >
                    {categorias.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Sistema de cría">
                  <select
                    value={form.sistema}
                    onChange={(e) => update("sistema", e.target.value)}
                    className={`${inputBase} ${ok}`}
                  >
                    {sistemas.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Potrero actual">
                  <input
                    type="text"
                    value={form.potrero}
                    onChange={(e) => update("potrero", e.target.value)}
                    placeholder="Lote 4 — Campo norte"
                    className={`${inputBase} ${ok}`}
                  />
                </Field>

                <Field label="Origen">
                  <select
                    value={form.origen}
                    onChange={(e) => update("origen", e.target.value)}
                    className={`${inputBase} ${ok}`}
                  >
                    {origenes.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
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
                to="/"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? "Guardando…" : "Guardar animal"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
