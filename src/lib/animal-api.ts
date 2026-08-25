import { supabase } from "@/integrations/supabase/client";

export interface DbAnimal {
  id: string;
  caravana: string;
  raza: string;
  sexo: string;
  categoria: string | null;
  fecha_nacimiento: string | null;
  origen: string | null;
  sistema_cria: string | null;
  potrero: string | null;
  estado: string | null;
  observaciones: string | null;
  created_at: string;
}

export interface DbRegistroSanitario {
  id: string;
  animal_id: string;
  tipo: string;
  producto: string | null;
  dosis: number | null;
  fecha_aplicacion: string;
  fecha_vencimiento: string | null;
  periodo_carencia: number | null;
  observaciones: string | null;
}

export async function fetchAnimales(): Promise<DbAnimal[]> {
  const { data, error } = await supabase
    .from("animal")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DbAnimal[];
}

export async function fetchAnimalByCaravana(caravana: string): Promise<DbAnimal | null> {
  const { data, error } = await supabase
    .from("animal")
    .select("*")
    .eq("caravana", caravana)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as DbAnimal | null;
}

export async function fetchRegistrosByAnimalId(animalId: string): Promise<DbRegistroSanitario[]> {
  const { data, error } = await supabase
    .from("registro_sanitario")
    .select("*")
    .eq("animal_id", animalId)
    .order("fecha_aplicacion", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DbRegistroSanitario[];
}

export async function insertAnimal(input: {
  caravana: string;
  raza: string;
  sexo: string;
  categoria?: string;
  fecha_nacimiento?: string | null;
  origen?: string;
  sistema_cria?: string;
  potrero?: string;
  observaciones?: string;
}): Promise<DbAnimal> {
  const { data, error } = await supabase
    .from("animal")
    .insert({ ...input, estado: "activo" })
    .select()
    .single();
  if (error) throw error;
  return data as DbAnimal;
}

export async function insertRegistro(input: {
  animal_id: string;
  tipo: string;
  producto?: string;
  dosis?: number | null;
  fecha_aplicacion: string;
  fecha_vencimiento?: string | null;
  periodo_carencia?: number | null;
  observaciones?: string;
}): Promise<DbRegistroSanitario> {
  const { data, error } = await supabase
    .from("registro_sanitario")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as DbRegistroSanitario;
}

export function formatFecha(iso: string | null | undefined): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("T")[0].split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export interface DbRegistroConAnimal extends DbRegistroSanitario {
  animal: { caravana: string; raza: string } | null;
}

export async function fetchRegistros(): Promise<DbRegistroConAnimal[]> {
  const { data, error } = await supabase
    .from("registro_sanitario")
    .select("*, animal:animal_id(caravana, raza)")
    .order("fecha_aplicacion", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as DbRegistroConAnimal[];
}

export type AlertaTono = "red" | "amber" | "green";
export interface AlertaDerivada {
  id: string;
  tono: AlertaTono;
  caravana: string;
  descripcion: string;
  fecha: string;
}

/** Deriva alertas de los vencimientos y carencias registrados en la base */
export function derivarAlertas(registros: DbRegistroConAnimal[]): AlertaDerivada[] {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return registros
    .filter((r) => r.fecha_vencimiento)
    .map((r) => {
      const venc = new Date(`${r.fecha_vencimiento!.split("T")[0]}T00:00:00`);
      const dias = Math.round((venc.getTime() - hoy.getTime()) / 86400000);
      const producto = r.producto ?? r.tipo;
      const esCarencia = !!r.periodo_carencia;
      let tono: AlertaTono = "green";
      let descripcion: string;
      if (dias < 0) {
        tono = "red";
        descripcion = esCarencia
          ? `Carencia de ${producto} finalizada el ${formatFecha(r.fecha_vencimiento)}`
          : `${producto} vencido desde el ${formatFecha(r.fecha_vencimiento)}`;
      } else if (dias <= 15) {
        tono = esCarencia ? "red" : "amber";
        descripcion = esCarencia
          ? `Carencia activa por ${producto} — vence el ${formatFecha(r.fecha_vencimiento)}`
          : `${producto} vence en ${dias} día${dias === 1 ? "" : "s"} (${formatFecha(r.fecha_vencimiento)})`;
      } else {
        descripcion = `${producto} vigente hasta el ${formatFecha(r.fecha_vencimiento)}`;
      }
      return {
        id: r.id,
        tono,
        caravana: r.animal?.caravana ?? "—",
        descripcion,
        fecha: formatFecha(r.fecha_vencimiento),
      };
    })
    .sort((a, b) => ["red", "amber", "green"].indexOf(a.tono) - ["red", "amber", "green"].indexOf(b.tono));
}
