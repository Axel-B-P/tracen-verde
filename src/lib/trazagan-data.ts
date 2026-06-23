export type AnimalEstado = "activo" | "carencia";

export interface SanitarioEvento {
  fecha: string;
  evento: string;
  detalle?: string;
}

export interface Animal {
  caravana: string;
  raza: string;
  sexo: "Macho" | "Hembra";
  categoria: string;
  estado: AnimalEstado;
  establecimiento: string;
  localidad: string;
  sistemaCria: string;
  fechaNacimiento: string;
  alimentacionTipo: string;
  potrero: string;
  periodo: string;
  ultimaVacuna: string;
  proximoVencimiento: string;
  carenciaActiva: boolean;
  apto: boolean;
  historial: SanitarioEvento[];
}

export const animales: Animal[] = [
  {
    caravana: "AR-0042",
    raza: "Angus",
    sexo: "Macho",
    categoria: "Vaca en ordeñe",
    estado: "activo",
    establecimiento: "La Querencia",
    localidad: "Villa del Rosario, Córdoba",
    sistemaCria: "Pastoril extensivo",
    fechaNacimiento: "12/03/2022",
    alimentacionTipo: "Pasturas naturales + verdeos",
    potrero: "Lote 4 — Campo norte",
    periodo: "Mar 2022 → Oct 2024",
    ultimaVacuna: "Aftosa — 21/09/2024",
    proximoVencimiento: "Aftosa — 28/06/2026",
    carenciaActiva: false,
    apto: true,
    historial: [
      { fecha: "15/04/2022", evento: "Vacuna aftosa", detalle: "dosis 2ml" },
      { fecha: "10/08/2022", evento: "Vacuna mancha y gangrena" },
      { fecha: "03/03/2023", evento: "Antiparasitario interno" },
      { fecha: "21/09/2024", evento: "Control veterinario pre-faena" },
    ],
  },
  {
    caravana: "AR-0031",
    raza: "Holstein",
    sexo: "Hembra",
    categoria: "Vaca seca",
    estado: "activo",
    establecimiento: "La Querencia",
    localidad: "Villa del Rosario, Córdoba",
    sistemaCria: "Pastoril extensivo",
    fechaNacimiento: "05/06/2021",
    alimentacionTipo: "Pasturas + silaje de maíz",
    potrero: "Lote 2 — Campo sur",
    periodo: "Jun 2021 → presente",
    ultimaVacuna: "Brucelosis — 12/05/2025",
    proximoVencimiento: "Aftosa — 10/09/2026",
    carenciaActiva: false,
    apto: true,
    historial: [
      { fecha: "20/07/2021", evento: "Vacuna brucelosis" },
      { fecha: "15/11/2022", evento: "Vacuna aftosa" },
      { fecha: "12/05/2025", evento: "Refuerzo brucelosis" },
    ],
  },
  {
    caravana: "AR-0078",
    raza: "Jersey",
    sexo: "Hembra",
    categoria: "Vaquillona",
    estado: "activo",
    establecimiento: "La Querencia",
    localidad: "Villa del Rosario, Córdoba",
    sistemaCria: "Pastoril extensivo",
    fechaNacimiento: "22/09/2023",
    alimentacionTipo: "Pasturas naturales",
    potrero: "Lote 5 — Campo este",
    periodo: "Sep 2023 → presente",
    ultimaVacuna: "Brucelosis — 23/06/2026",
    proximoVencimiento: "Aftosa — 15/12/2026",
    carenciaActiva: false,
    apto: true,
    historial: [
      { fecha: "10/10/2023", evento: "Desparasitación inicial" },
      { fecha: "23/06/2026", evento: "Vacuna brucelosis" },
    ],
  },
  {
    caravana: "AR-0015",
    raza: "Hereford",
    sexo: "Hembra",
    categoria: "Vaca en ordeñe",
    estado: "carencia",
    establecimiento: "La Querencia",
    localidad: "Villa del Rosario, Córdoba",
    sistemaCria: "Pastoril extensivo",
    fechaNacimiento: "18/02/2020",
    alimentacionTipo: "Pasturas + suplemento mineral",
    potrero: "Lote 1 — Campo central",
    periodo: "Feb 2020 → presente",
    ultimaVacuna: "Antibiótico — 14/06/2026",
    proximoVencimiento: "Carencia hasta 28/06/2026",
    carenciaActiva: true,
    apto: false,
    historial: [
      { fecha: "14/06/2026", evento: "Tratamiento antibiótico — inicio carencia" },
      { fecha: "10/03/2025", evento: "Vacuna aftosa" },
      { fecha: "02/09/2024", evento: "Control tuberculosis" },
    ],
  },
  {
    caravana: "AR-0093",
    raza: "Angus",
    sexo: "Macho",
    categoria: "Ternero",
    estado: "activo",
    establecimiento: "La Querencia",
    localidad: "Villa del Rosario, Córdoba",
    sistemaCria: "Pastoril extensivo",
    fechaNacimiento: "04/02/2026",
    alimentacionTipo: "Lactancia + pasturas",
    potrero: "Lote 6 — Maternidad",
    periodo: "Feb 2026 → presente",
    ultimaVacuna: "—",
    proximoVencimiento: "Aftosa — 04/08/2026",
    carenciaActiva: false,
    apto: true,
    historial: [{ fecha: "04/02/2026", evento: "Nacimiento registrado" }],
  },
];

export const alertas = [
  { tono: "red" as const, texto: "AR-0015 — Carencia activa hasta 28/06/2026" },
  { tono: "amber" as const, texto: "AR-0042 — Vacuna aftosa vence en 5 días" },
  { tono: "amber" as const, texto: "AR-0031 — Control lechero pendiente" },
  { tono: "green" as const, texto: "AR-0078 — Vacuna brucelosis aplicada hoy" },
];

export function getAnimal(caravana: string) {
  return animales.find((a) => a.caravana === caravana);
}
