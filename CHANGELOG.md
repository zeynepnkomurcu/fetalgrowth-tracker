# Changelog

Alle noemenswaardige wijzigingen aan dit project worden hier bijgehouden.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) — datums in `YYYY-MM-DD`.

---

## [Unreleased]

### Changed
- Dashboard toont biometry + growth curve nu pas **na klik op een patient** — default state is een patient-select prompt. Geen lege biometry-velden meer zichtbaar zonder context.
- Patient-clicks blijven op **dezelfde pagina** (`/`) — selected patient is een state, geen route. Biometry, AC growth curve en clinical summary worden conditional gerenderd.
- Biometry-velden zijn compacter (4 op één rij ipv 2x2, kleinere padding).
- **Veldvolgorde nu BPD → HC → AC → FL** (was AC → BPD → HC → FL) in zowel biometry-form, chart-tabs als visit-history grid. EFW blijft achteraan in chart-tabs.
- **Live percentielen op alle biometry-velden + EFW** — terwijl je typt verschijnt rechtsboven het veld een chip met `Pxx`, kleurgecodeerd: groen P25–P75, geel P10–P25/P75–P90, oranje P3–P10/P90–P97, rood <P3/>P97. EFW kaart toont live Hadlock-IV waarde + matching percentiel-chip in plaats van pas-na-save te updaten. Berekening via z-score uit INTERGROWTH-21 mean+SD (Abramowitz-Stegun normCDF).
- **EFW staat nu inline tussen Biometry en Doppler** als compacte cyan strip met EFW-waarde + percentile-chip + Hadlock-IV hint, ipv een grote blok in de rechter sidebar. Right sidebar bevat nu enkel Clinical Summary.
- **LanguageSwitch verplaatst naar rechtsbovenhoek van de pagina** (boven het header-card op Dashboard, absoluut top-right op NewPatient) ipv naast de "Add Patient" knop — meer als een normale top-bar layout.

### Fixed
- **IG-21 referentietabel her-aligneerd** — eerdere tabel was Snijders-Nicolaides 1994 standaard (gaf AC=150 mm @ 21w → P25), nu echte INTERGROWTH-21 50e percentiel waarden (AC@21w P50 = 150 mm, valideert tegen klinische verwachting van Zeynep). Bron: Papageorghiou AT et al., Lancet 2014;384:869-79. Aanpassing geldt voor BPD, HC, AC en FL (GA 20-40w). Chart Y-axis domeinen iets verruimd om de nieuwe range te dekken. EFW blijft Hadlock-1991 met CV 12.7%.
- **Nieuwe `src/clinical/ig21.js` shared module** — IG-21 referentietabellen, Hadlock-1991 EFW reference + Hadlock-IV formule + percentile/badge helpers. `IntergrowthChart` gebruikt nu dezelfde data (was eerder gedupliceerd).
- MeasurementCard krijgt unit-suffix (mm) en chip-style percentiel-badge ipv kleine tekst.
- Doppler-sectie is nu standaard zichtbaar onder Biometry (was eerst gated achter Save & Analyze + lelijk inline-styled).
- `MeasurementCard` en `DopplerInput` herschreven met Tailwind-only, geen inline styles meer.
- `GuidelineModal` herschreven met Tailwind, klikbaar overlay, OK-knop in app-stijl.
- **Max 1 visit per patient per dag** — een tweede save op dezelfde dag overschrijft de bestaande visit van die dag (zelfde visit-id, nieuwe waarden). Toast meldt "updated" ipv "saved" zodat duidelijk is dat een overwrite is gebeurd.

### Fixed
- Save & Analyze slaat de visit nu **echt op** (in `localStorage` onder `patient.visits`) en de nieuwe meting verschijnt direct als zwarte dot op de AC growth curve.
- EFW wordt nu berekend met **Hadlock IV** (echte formule, was simpel gemiddelde van AC/BPD/HC/FL — klopte clinisch niet).
- Modal triggerde foutief bij waarde `"0"` (string-truthiness bug). Nu pas trigger boven 0.
- Biometry- en Doppler-inputvelden accepteren nu **alleen numerieke input** — `e`, `E`, `+`, `-` toetsen worden geblokkeerd, scroll-wiel verandert geen getal meer per ongeluk, `inputMode="decimal"` voor mobile keyboards.
- Browser-spinner pijltjes (▲▼) op number-inputs zijn globaal weggestyled in `index.css` — overbodig, namen visueel ruimte in en gaven nooit een goede UX voor decimale waarden.

### Added
- **S/D ratio veld in Doppler** tussen MCA PI en DV PIV — Systolic/Diastolic ratio, klinisch standaard. Doppler-grid groeit van 3 naar 4 kolommen. Veld wordt mee opgeslagen in `visit.rawData.sd` en getoond in visit history.

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
