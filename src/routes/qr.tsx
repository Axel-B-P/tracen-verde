import { createFileRoute } from "@tanstack/react-router";
import { Beef, Drumstick, Download, Copy, Check, Search, QrCode as QrIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { z } from "zod";
import { AppLayout } from "@/components/AppLayout";
import { animales } from "@/lib/trazagan-data";

const searchSchema = z.object({
  caravana: z.string().optional(),
});

export const Route = createFileRoute("/qr")({
  head: () => ({ meta: [{ title: "Generar QR · TrazaGan" }] }),
  validateSearch: searchSchema,
  component: Page,
});

type Contexto = "vida" | "faena" | null;
const fracciones = [
  "Media res izquierda",
  "Media res derecha",
  "Cuarto delantero izquierdo",
  "Cuarto delantero derecho",
  "Corte específico",
];

function Page() {
  const { caravana: initial } = Route.useSearch();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(initial ?? null);
  const [contexto, setContexto] = useState<Contexto>(null);
  const [fraccion, setFraccion] = useState(fracciones[0]);
  const [generated, setGenerated] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const animal = useMemo(() => animales.find((a) => a.caravana === selected) ?? null, [selected]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return animales;
    return animales.filter(
      (a) => a.caravana.toLowerCase().includes(q) || a.raza.toLowerCase().includes(q),
    );
  }, [query]);

  const url = useMemo(() => {
    if (!animal) return "";
    const base = `https://trazagan.vercel.app/animal/${animal.caravana}`;
    if (contexto === "faena") {
      return `${base}?ctx=faena&fraccion=${encodeURIComponent(fraccion)}`;
    }
    return base;
  }, [animal, contexto, fraccion]);

  useEffect(() => {
    if (!generated || !url) return;
    QRCode.toDataURL(url, { width: 320, margin: 1, color: { dark: "#2E5D3A", light: "#ffffff" } })
      .then(setQrDataUrl)
      .catch(() => toast.error("No se pudo generar el QR"));
  }, [generated, url]);

  const reset = () => {
    setGenerated(false);
    setQrDataUrl("");
  };

  const handleDownload = () => {
    if (!qrDataUrl || !animal) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `trazagan-${animal.caravana}.png`;
    a.click();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Enlace copiado");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <AppLayout>
      <div className="p-8 mx-auto max-w-[700px]">
        <header className="mb-6 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-accent/25 text-accent-foreground flex items-center justify-center">
            <QrIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-semibold">Generar QR</h1>
            <p className="text-sm text-muted-foreground">Trazabilidad para faena y consumidor final</p>
          </div>
        </header>

        <div className="rounded-xl bg-card border border-border shadow-sm divide-y divide-border">
          {/* Step 1 */}
          <section className="p-6 space-y-3">
            <StepHeader n={1} title="Seleccionar animal" />
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por caravana o nombre"
                className="w-full h-10 rounded-md border border-input bg-card pl-9 pr-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <ul className="max-h-56 overflow-y-auto rounded-md border border-border divide-y divide-border">
              {filtered.map((a) => {
                const active = selected === a.caravana;
                return (
                  <li key={a.caravana}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelected(a.caravana);
                        reset();
                      }}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-muted/50 ${
                        active ? "bg-primary/10 text-primary" : ""
                      }`}
                    >
                      <span className="font-medium">{a.caravana}</span>
                      <span className="text-xs text-muted-foreground">
                        {a.raza} · {a.categoria}
                      </span>
                    </button>
                  </li>
                );
              })}
              {filtered.length === 0 && (
                <li className="px-3 py-4 text-center text-sm text-muted-foreground">Sin resultados</li>
              )}
            </ul>

            {animal && (
              <div className="mt-2 rounded-lg border border-primary/30 bg-primary/5 p-4">
                <div className="text-xs uppercase tracking-wide text-primary">Animal seleccionado</div>
                <div className="mt-1 font-display text-lg font-semibold">{animal.caravana}</div>
                <div className="text-sm text-muted-foreground">
                  {animal.raza} · {animal.categoria}
                </div>
              </div>
            )}
          </section>

          {/* Step 2 */}
          {animal && (
            <section className="p-6 space-y-3">
              <StepHeader n={2} title="Seleccionar contexto" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ContextCard
                  active={contexto === "vida"}
                  onClick={() => {
                    setContexto("vida");
                    reset();
                  }}
                  icon={Beef}
                  title="QR en vida"
                  desc="El comprador puede ver el historial completo del animal vivo"
                />
                <ContextCard
                  active={contexto === "faena"}
                  onClick={() => {
                    setContexto("faena");
                    reset();
                  }}
                  icon={Drumstick}
                  title="QR post-faena"
                  desc="Vinculado a una fracción de canal específica"
                />
              </div>
              {contexto === "faena" && (
                <div className="pt-2">
                  <label className="block text-sm font-medium mb-1.5">Fracción de canal</label>
                  <select
                    value={fraccion}
                    onChange={(e) => {
                      setFraccion(e.target.value);
                      reset();
                    }}
                    className="w-full h-10 rounded-md border border-input bg-card px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {fracciones.map((f) => (
                      <option key={f}>{f}</option>
                    ))}
                  </select>
                </div>
              )}
            </section>
          )}

          {/* Step 3 */}
          {animal && contexto && (
            <section className="p-6 space-y-4">
              <StepHeader n={3} title="Generar" />
              {!generated ? (
                <button
                  type="button"
                  onClick={() => setGenerated(true)}
                  className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Generar QR
                </button>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="rounded-lg border border-border bg-white p-4">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt={`QR ${animal.caravana}`}
                        width={260}
                        height={260}
                        className="block"
                      />
                    ) : (
                      <div className="h-[260px] w-[260px] grid place-items-center text-xs text-muted-foreground">
                        Generando…
                      </div>
                    )}
                  </div>
                  <canvas ref={canvasRef} className="hidden" />

                  <div className="w-full">
                    <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-1">
                      URL pública
                    </label>
                    <input
                      readOnly
                      value={url}
                      onFocus={(e) => e.currentTarget.select()}
                      className="w-full h-10 rounded-md border border-input bg-muted/40 px-3 text-sm font-mono"
                    />
                  </div>

                  <div className="flex w-full gap-2">
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      <Download className="h-4 w-4" /> Descargar QR
                    </button>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
                    >
                      {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                      Copiar enlace
                    </button>
                  </div>

                  <p className="text-xs text-muted-foreground text-center">
                    Esta vista es pública — no requiere cuenta ni app para ser consultada
                  </p>
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function StepHeader({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
        {n}
      </span>
      <h2 className="font-display font-semibold text-foreground">{title}</h2>
    </div>
  );
}

function ContextCard({
  active,
  onClick,
  icon: Icon,
  title,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-lg border p-4 transition-colors ${
        active
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-border hover:border-primary/40 hover:bg-muted/40"
      }`}
    >
      <div
        className={`h-10 w-10 rounded-lg flex items-center justify-center mb-3 ${
          active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="font-semibold text-foreground">{title}</div>
      <div className="text-xs text-muted-foreground mt-1">{desc}</div>
    </button>
  );
}
