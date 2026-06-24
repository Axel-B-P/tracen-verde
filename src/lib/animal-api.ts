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

export function formatFecha(iso: string | null | undefined): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("T")[0].split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}
