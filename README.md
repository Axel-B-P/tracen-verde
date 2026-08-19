# TrazaGan Livestock Hub

Build a cattle traceability web app called "TrazaGan" for Argentine livestock producers.

Tech: React + Tailwind CSS. Single page app with client-side routing. Use mock data, no backend needed.

COLOR PALETTE:

- Primary: #2E5D3A (deep forest green)

- Secondary: #4A7C59

- Background: #F4F9F5 (light sage)

- Accent: #D4A017 (amber)

- White cards with subtle green borders

OVERALL LAYOUT:

- Left sidebar (240px, dark green #2E5D3A) with navigation

- Main content area (right side, sage background)

- Sidebar items: Dashboard, Animales, Registros sanitarios, Alertas, Generar QR

- App logo at top of sidebar: cow icon + "TrazaGan" in white

- Bottom of sidebar: logged-in user "César Cuassolo · Admin"

PAGE 1 — DASHBOARD (default view):

Top row: 4 stat cards

- "Total animales" → 150 · icon: cow

- "Vacunas al día" → 142 · green badge

- "Con carencia activa" → 3 · amber badge  

- "Alertas pendientes" → 5 · red badge

Below: two columns

Left (60%): Table "Animales recientes" with columns: Caravana | Raza | Categoría | Estado | Acciones

Populate with 5 rows of mock data using real Argentine cattle breeds (Angus, Hereford, Holstein, Jersey) and real vaccine names mentioned by the producer (Aftosa, Brucelosis, Tuberculosis)

Mock animals:

- AR-0042 | Angus | Vaca en ordeñe | Activo | [Ver] [QR]

- AR-0031 | Holstein | Vaca seca | Activo | [Ver] [QR]

- AR-0078 | Jersey | Vaquillona | Activo | [Ver] [QR]

- AR-0015 | Hereford | Vaca en ordeñe | Carencia activa (amber) | [Ver] [QR]

- AR-0093 | Angus | Ternero | Activo | [Ver] [QR]

Right (40%): "Alertas próximas" card — list of 4 alerts:

- 🔴 AR-0015 — Carencia activa hasta 28/06/2026

- 🟡 AR-0042 — Vacuna aftosa vence en 5 días

- 🟡 AR-0031 — Control lechero pendiente

- 🟢 AR-0078 — Vacuna brucelosis aplicada hoy

PAGE 2 — FICHA DEL ANIMAL (navigate when clicking "Ver" on AR-0042):

Header card (green background):

- Large: "Angus · Macho · Caravana #AR-0042"

- Subtitle: "La Querencia — Villa del Rosario, Córdoba"

- Green badge: "✓ Apto para consumo"

- Button top right: "Generar QR" (amber)

Below: 3 column cards

Card 1 "Origen": Establecimiento, Localidad, Sistema de cría (Pastoril extensivo), Fecha nacimiento (12/03/2022)

Card 2 "Alimentación": Tipo (Pasturas naturales + verdeos), Potrero (Lote 4 — Campo norte), Período (Mar 2022 → Oct 2024)

Card 3 "Estado sanitario": última vacuna, próximo vencimiento, carencia activa (No)

Below: Full-width timeline "Historial sanitario"

- 15/04/2022 — Vacuna aftosa (dosis 2ml) ✓

- 10/08/2022 — Vacuna mancha y gangrena ✓

- 03/03/2023 — Antiparasitario interno ✓

- 21/09/2024 — Control veterinario pre-faena ✓

Navigation: clicking sidebar items and "Ver" buttons should navigate between views. "Volver" button on animal detail goes back to dashboard.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://tracen-verde.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5a4680ec-b8cd-45d1-92ac-a893de577838).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
