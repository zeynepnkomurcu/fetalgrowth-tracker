# Changelog

Alle noemenswaardige wijzigingen aan dit project worden hier bijgehouden.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) — datums in `YYYY-MM-DD`.

---

## [Unreleased]

### Security / Data model
- **Gedeelde patiënten via TC + user_patients junction** — vervangt het strikt per-user model. Iedere arts heeft zijn eigen patiëntenlijst, maar als twee artsen dezelfde TC invoeren, delen ze één patient-record en alle bijbehorende visits (bidirectioneel: nieuwe visits door arts B zijn ook zichtbaar voor arts A).
  - SQL-migratie `db/migrations/2026-05-13b_shared_patients_by_tc.sql`:
    - Verwijdert `user_id` uit `patients` en `visits` + de oude self-owned policies.
    - `UNIQUE` partial index op `patients.tc` (alleen wanneer ingevuld — dummies met lege TC mogen meerdere keren).
    - Nieuwe `user_patients` junction tabel met RLS op eigen rijen.
    - Nieuwe policies op `patients` en `visits`: zichtbaar/bewerkbaar als je gelinkt bent via `user_patients`.
    - Nieuwe RPC `link_or_create_patient(...)` (`SECURITY DEFINER`): zoekt bestaande patient op TC, link huidige user, return id. Of: insert + link. Atomair zodat RLS niet de TC-lookup blokkeert.
  - `NewPatient` roept de RPC aan ipv directe `patients.insert`. Profile-merge regel: **eerste invoer wint** — als de TC al bestaat, worden de getypte name/LMP genegeerd en zie je het profiel zoals de eerste arts het invoerde.
  - `Dashboard` patient-fetch is weer een plain `select *` (RLS filtert automatisch via `user_patients`).
  - Visit insert geeft geen `user_id` meer mee (RLS check loopt via patient-link).
  - **Vereist**: SQL-editor in Supabase openen en `2026-05-13b_shared_patients_by_tc.sql` runnen vóór de nieuwe code gebruikt wordt.

### Changed
- **App shell met top app bar** — nieuwe `AppHeader` component met sticky top bar (brand links, taal-switch + email + logout-icon rechts) op alle pagina's. Vervangt de zwevende absolute `LanguageSwitch` en de inline "Account chip + Logout knop" die met Dummy/Add Patient om plek vochten in de rechterbovenhoek.
- **Dashboard kreeg een eigen page header** met grote titel "Patients" + subtitle, en de primary actions (Dummy + Add Patient) onder de top app bar in plaats van vermengd met de app-branding.
- **NewPatient gebruikt dezelfde AppHeader** — consistente chrome over de hele app.

### Fixed
- **NewPatient save flow hersteld** — `generateProtocolNumber` verwees naar een ongedefinieerde `patients` variabele (overblijfsel van de localStorage-versie), en `generateResearchId` gebruikte een ongedefinieerde `initials`. Beide gooiden een `ReferenceError` bij elke save. Logica nu inline in `handleSave`: protocolnummer = `XX-NNNN` op basis van Supabase-rij-count, research ID = `RID-` + laatste 6 cijfers van timestamp.
- **Save-knop kreeg disabled state** tijdens insert om dubbel-submit te voorkomen.
- **Dashboard `useEffect` opgeruimd** — verwijderde dubbele geneste `if (!error && data)` en de losse `console.log(data)`.

### Removed
- **Inline Account chip + Logout knop** uit Dashboard header — vervangen door logout-icon in de nieuwe `AppHeader`.

---

## [0.3.0] — 2026-05-10

### Klinisch & data
- **IG-21 referentietabel her-aligneerd** naar de officiële INTERGROWTH-21 publicatie (Papageorghiou AT et al., Lancet 2014;384:869-79). Voorgaande tabel was Snijders-Nicolaides 1994 en gaf AC=150 mm @ 21w → P25; nu m@21w = 150 dus AC=150 @ 21w → P50, in lijn met Zeynep's klinische verwachting. Aanpassing geldt voor BPD/HC/AC/FL (GA 20–40w).
- **Decimal-precision tabel via quadratische fit** door 3 INTERGROWTH-21 ankers (20w/30w/40w). Voorheen waren ronde-mm waarden ingevoerd met afwisselende +2/+3 sprongen tussen weken; dat veroorzaakte zichtbare hoeken/golfjes in de curve. Nu vloeiend afnemende slopes per week.
- **Live percentielen op alle biometry-velden + EFW** — terwijl je typt verschijnt rechtsboven het veld een chip met `Pxx`, kleurgecodeerd: emerald P25–P75, geel P10–P25/P75–P90, oranje P3–P10/P90–P97, rood <P3/>P97. Berekening via z-score uit IG-21 mean+SD met Abramowitz-Stegun normCDF. EFW kaart toont live Hadlock-IV waarde + matching percentiel-chip ipv pas-na-save.
- **Hadlock IV EFW formule** vervangt het eerdere simple-gemiddelde dat clinisch niet klopte.
- **Max 1 visit per patient per dag** — een tweede save op dezelfde dag overschrijft de bestaande visit (zelfde id, nieuwe waarden). Toast meldt "updated" ipv "saved".
- **GA berekening uit LMP** als patient geen `week`/`days` heeft (helper `calcGaFromLmp` in DashboardTest).
- **Datum-format "4 February 2026"** (dag-maandnaam-jaar) overal — patient header LMP, visit history dates. Locale-aware: Turkse mode toont "4 Şubat 2026". Helper in `src/utils/formatDate.js`.

### UI redesign — medical-teal / clinical look
- **Volledige design-system pass** met `#134e4a` (medical-teal / teal-900) als primaire accent, slate-50 page-background, witte kaarten met `border-slate-200 rounded-xl shadow-sm`. Inter font, font-feature-settings voor scherpere letterforms, tabular-nums voor alle cijfers.
- **Lucide icons** (lucide-react dependency) vervangen alle emojis: Plus, FlaskConical, X, Check, CalendarDays, Users, Search, AlertTriangle, ArrowLeft.
- **Knop-system**:
  - Primary (Add Patient, Save & Analyze, Selected patient card, Active chart-tab, Modal OK, Dummy create) → solid teal-900 white text, hover teal-700.
  - Secondary (+ Dummy) → outlined teal-900.
  - Doppler EDF (Normal/AEDF/REDF) → outlined teal default, filled teal-900 wanneer geselecteerd.
- **EFW strip** is solid teal-900 ipv cyan gradient.
- **GuidelineModal** → Lucide AlertTriangle in amber halo, teal OK-knop, slate-900/40 backdrop met blur.
- **Save-toast** → bottom-right floating, teal-900 met Lucide Check, slide-in animation (`@keyframes toast-in`).
- **Patient-empty-state** in sidebar → Lucide Users avatar + "No patients yet".
- **Empty-state hoofdscherm** → fetal-echo PNG illustratie in `public/empty-state-fetus.png` (cropped om dubbele "Fetal Büyüme Analizi" tekst te vermijden), vergroot tot `max-w-lg`, met i18n-titel "Bir hasta seçin / Select a patient" eronder.

### Chart polish
- **Apple Health-stijl Area-band** tussen P10 en P90 met verticaal teal-gradient (10%→4% alpha). Geeft visueel duidelijk de "normale range".
- **ComposedChart** ipv plain LineChart om Area + Line te combineren.
- **Custom tooltip** in design-system stijl: witte card, slate border, soft shadow, gekleurde dots per percentile, tabular numbers. Rijen gesorteerd in zelfde volgorde als chart-lijnen visueel staan: P97 → P90 → P50 → P10 → P3 → Patient.
- **Klinische lijn-palet**: P50 in teal-900, P10/P90 in amber, P3/P97 in red dashed (extremes), Patient lijn in slate-900 met witte stroke om dots.
- **Mobile-responsive chart** — hoogte 280px op mobiel (vs 420px desktop), Y-axis width 36 op mobiel (vs 48), X-tick reductie tot `[20, 28, 36, 40]` op smal scherm, axis-lines verborgen, tickLine off voor cleane uitstraling.
- **Growth-curve parameter-switcher** — BPD/HC/AC/FL/EFW tabs boven de chart, in volgorde gevraagd door Zeynep. Actieve tab is teal-900.

### Mobile & PWA
- **Safe-area inset** op `body` (`padding: env(safe-area-inset-*)`) zodat content nooit meer onder iOS dynamic island/notch schuift in standalone PWA-mode.
- **PWA chrome kleur** in `manifest.json` en `index.html` theme-color → `#134e4a`, background-color → `#f8fafc`.
- **Mobile knop-labels** altijd zichtbaar (was iconen-only) zodat gebruiker niet moet raden welke knop wat doet.
- **Header padding** schaalt: `px-5 py-4` op mobiel, `px-6 py-5` op desktop. Title `text-xl sm:text-2xl`.
- **LanguageSwitch** floats top-right corner — desktop altijd zichtbaar, mobile alleen op landing/empty-state. Wanneer een patient geopend is op mobiel verbergt de switch zich om schermruimte vrij te geven; op desktop blijft hij staan.

### Patient management
- **+ Dummy knop** naast + Add Patient — opent modal die enkel om LMP vraagt en direct test-patient aanmaakt (`Dummy #1`, `DUMMY-0001`). Voor snelle UI-tests zonder name/surname/TC validation.
- **Unified search** in patients sidebar — Lucide Search icoon, real-time filter op voornaam, achternaam, voor+achternaam combo, en protocolnummer (case-insensitive). Empty result toont een quiet "—".

### Doppler
- **UA S/D ratio veld** tussen MCA PI en DV PIV. Doppler-grid groeit van 3 naar 4 kolommen. Veld in `visit.rawData.sd` en getoond in visit history.

### Removed
- Route `/patient/:id` uit `App.jsx` (vervangen door same-page state). `src/pages/PatientDetails.jsx` blijft als file maar is niet meer gewired — kandidaat voor cleanup.
- "Guideline: ISUOG" rij uit Clinical Summary (puur decoratief).
- Legenda onder de growth curve (tooltip dekt al alles).
- Cyan kleur palette door de hele app vervangen door teal-900.

### Fixed
- **Save & Analyze persisteert echt** in `localStorage` onder `patient.visits[]`, dot verschijnt direct op de growth curve (was eerder leeg-witte modal).
- Modal-trigger string-truthiness bug op `"0"` waarde.
- Biometry/Doppler velden accepteren alleen numerieke input — `e/E/+/-` toetsen geblokkeerd, scroll-wiel verandert getal niet meer per ongeluk, `inputMode="decimal"` voor mobile keyboards.
- Browser-spinner pijltjes (▲▼) globaal gestyled weg in `index.css`.
- Dubbele "+" glyph in Add Patient / Dummy knoppen weggehaald (vertaalstrings begonnen al met "+ " én lucide Plus icoon ervoor).

### Doc & infra
- **Repo en URL gesplitst**: GitHub repo blijft `fetalgrowth-tracker2`, Vercel-project hernoemd naar `fetalgrowth-tracker` zodat de v2-code op de v1-URL `https://fetalgrowth-tracker.vercel.app` draait. v1 archief leeft op `fetalgrowth-tracker-v1-archive.vercel.app`.

---

## [0.2.0] — 2026-05-10

### Added
- Documentatie-skeleton: `README.md`, `CHANGELOG.md`, `docs/architecture.md`, `docs/clinical-formulas.md`, `docs/deployment.md`, `docs/commit-conventie.md`.
- Vercel auto-deploy gekoppeld aan `main` branch.
- Volledige EN/TR i18n via react-i18next, LanguageSwitch component, sticky in `localStorage`.
- Growth curve P3/P10/P50/P90/P97 banden afgeleid van mean+SD via z-multipliers.
- Visit history onder de curve met delete-knop per visit, "✓ Visit saved" toast.

### Changed
- Alle TypeScript modules (`*.ts`) geconverteerd naar plain JavaScript (`*.js`).
- `src/layouts/Mainlayout.jsx` hernoemd naar `MainLayout.jsx`.
- Dashboard toont biometry/curve nu pas **na klik op een patient** — same-page state, geen route change.
- Biometry-veldvolgorde **BPD → HC → AC → FL** (was AC → BPD → HC → FL).
- Biometry compacter (4 op 1 rij ipv 2x2).
- Doppler-sectie standaard zichtbaar onder Biometry.
- `MeasurementCard`, `DopplerInput`, `GuidelineModal` herschreven met Tailwind-only.

### Removed
- Dode duplicate files: `src/translations/translations.js`, `src/clinical/reference/acReference.js`, `src/references/acReferences.ts`, `src/clinical/calculations/cpr.ts`, `src/types/visit.ts`.

### Known issues / TODO (uit 0.2.0, deels nog open)
- `src/pages/Patients.jsx`, `src/pages/Reports.jsx`, `src/pages/PatientDetails.jsx` bestaan maar zijn niet aan router gekoppeld.
- `src/clinical/processVisit.js` orchestreert flags+staging+recommendations, nog niet gewired.
- `src/clinical/detectStage.js` (legacy) en `clinical/staging/fgrStage.js` (nieuw) — beslissen welke blijft.

---

## [0.1.0] — 2026-05-10 (initial commit)

Eerste schets van de v2 rewrite — react-router, Tailwind v4, modulaire `clinical/` folder.
