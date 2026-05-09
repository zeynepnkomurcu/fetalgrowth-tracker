# Changelog

Alle noemenswaardige wijzigingen aan dit project worden hier bijgehouden.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) — datums in `YYYY-MM-DD`.

---

## [Unreleased]

_Nog niets._

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
