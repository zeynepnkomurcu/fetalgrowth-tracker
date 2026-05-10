# Changelog

Alle noemenswaardige wijzigingen aan dit project worden hier bijgehouden.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) — datums in `YYYY-MM-DD`.

---

## [Unreleased]

### Changed
- Dashboard toont biometry + growth curve nu pas **na klik op een patient** — default state is een patient-select prompt. Geen lege biometry-velden meer zichtbaar zonder context.
- Patient-clicks blijven op **dezelfde pagina** (`/`) — selected patient is een state, geen route. Biometry, AC growth curve en clinical summary worden conditional gerenderd.
- Biometry-velden zijn compacter (4 op één rij ipv 2x2, kleinere padding).
- Doppler-sectie is nu standaard zichtbaar onder Biometry (was eerst gated achter Save & Analyze + lelijk inline-styled).
- `MeasurementCard` en `DopplerInput` herschreven met Tailwind-only, geen inline styles meer.
- `GuidelineModal` herschreven met Tailwind, klikbaar overlay, OK-knop in app-stijl.
- **Max 1 visit per patient per dag** — een tweede save op dezelfde dag overschrijft de bestaande visit van die dag (zelfde visit-id, nieuwe waarden). Toast meldt "updated" ipv "saved" zodat duidelijk is dat een overwrite is gebeurd.

### Fixed
- Save & Analyze slaat de visit nu **echt op** (in `localStorage` onder `patient.visits`) en de nieuwe meting verschijnt direct als zwarte dot op de AC growth curve.
- EFW wordt nu berekend met **Hadlock IV** (echte formule, was simpel gemiddelde van AC/BPD/HC/FL — klopte clinisch niet).
- Modal triggerde foutief bij waarde `"0"` (string-truthiness bug). Nu pas trigger boven 0.
- Biometry- en Doppler-inputvelden accepteren nu **alleen numerieke input** — `e`, `E`, `+`, `-` toetsen worden geblokkeerd, scroll-wiel verandert geen getal meer per ongeluk, `inputMode="decimal"` voor mobile keyboards.

### Added
- Visit history onder de growth curve — toont alle saved visits met AC/BPD/HC/FL/Doppler/EFW + delete-knop per visit.
- "✓ Visit saved" toast verschijnt 2.5s na succesvolle save zodat duidelijk is dat het werkt.
- GA wordt automatisch berekend uit LMP als `week`/`days` niet expliciet op patient zit.
- **Growth curve parameter-switcher** — AC/BPD/HC/FL/EFW tabs boven de chart. Elk parameter heeft eigen INTERGROWTH-21 P3/P10/P50/P90/P97 banden (afgeleid van mean+SD via z-multipliers). EFW gebruikt Hadlock-1991 referentietabel met CV 12.7%.
- **Volledige EN/TR vertaling** — alle UI-strings in i18n, `LanguageSwitch` component (EN/TR toggle) rechtsboven in de header van Dashboard én NewPatient. Taalkeuze wordt opgeslagen in `localStorage` onder key `lang` zodat reload de keuze behoudt. Resterende Nederlandse strings (modal "Vul minimaal..." etc) zijn vertaald naar EN+TR.

### Removed
- Route `/patient/:id` uit `App.jsx` (was vervangen door same-page state). `src/pages/PatientDetails.jsx` bestaat nog als file maar is niet meer gewired — kandidaat voor verwijdering volgende cleanup.
- "Guideline: ISUOG" rij uit Clinical Summary kaart — was puur decoratief, geen functionele info.
- Legenda onder de growth curve — tooltip toont al P3/P10/P50/P90/P97 + Patient bij hover, dus de aparte legenda was redundant.

---

## [0.2.0] — 2026-05-10

### Added
- Documentatie-skeleton: `README.md`, `CHANGELOG.md`, `docs/architecture.md`, `docs/clinical-formulas.md`, `docs/deployment.md`, `docs/commit-conventie.md`.
- Vercel auto-deploy gekoppeld aan `main` branch.

### Changed
- Alle TypeScript modules (`*.ts`) geconverteerd naar plain JavaScript (`*.js`) voor consistentie. Geen TypeScript meer in dit project.
- `src/layouts/Mainlayout.jsx` hernoemd naar `MainLayout.jsx` (file-naam matcht nu de component-naam).

### Removed
- Dode duplicate `src/translations/translations.js` (was identiek aan inline data in `src/i18n.js`).
- Dode duplicate `src/clinical/reference/acReference.js` (oudere AC-percentiel tabel, niet gebruikt).
- Dode duplicate `src/references/acReferences.ts` (alternatieve AC-percentiel tabel, niet gebruikt).
- Dode duplicate `src/clinical/calculations/cpr.ts` (TypeScript-versie van `calculateCpr.js`, niet gebruikt).
- `src/types/visit.ts` — TypeScript interface, niet bruikbaar in JS-only project.

### Known issues / TODO
- `src/pages/Patients.jsx` en `src/pages/Reports.jsx` bestaan maar zijn nog niet aan de router gekoppeld in `App.jsx`. Beslissen: in routing zetten of weghalen.
- `src/clinical/processVisit.js` orchestreert flags + staging + recommendations, maar wordt nog niet gebruikt door enige page. Wireup in `PatientDetails.jsx` is nog open.
- `src/clinical/calculateAcPercentile.js` heeft nog inline AC-referentie tabel — zou naar een aparte `clinical/references/` file moeten als andere percentiel-tabellen worden toegevoegd.
- `src/clinical/detectStage.js` is een legacy stage-detector. `clinical/staging/fgrStage.js` is de nieuwe versie. Beslissen welke gebruikt blijft.

---

## [0.1.0] — 2026-05-10 (initial commit)

Eerste schets van de v2 rewrite — react-router, Tailwind v4, modulaire `clinical/` folder.
