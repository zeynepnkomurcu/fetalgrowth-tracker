# Architectuur

Korte uitleg waarom de codebase eruitziet zoals 'ie eruitziet, zodat je over 6 maanden niet hoeft te raden.

---

## Routing — react-router-dom

```
/                  →  DashboardTest    (overzicht + Add Patient + biometry input)
/patient/:id       →  PatientDetails   (per-patient: visits, charts, trends)
/new-patient       →  NewPatient       (registratie-form)
```

Elke route is **één file in `src/pages/`**. Geen tab-state meer (zoals v1) — een echte URL voor elke view zodat je kunt back-button-en, links delen, en deep-linken naar een specifieke patiënt.

---

## State — geen library, alleen `useState` + `localStorage`

De hele app is single-user, single-device. Daarom:

- **Geen Redux, Zustand, Context.** Alles `useState` in de page-componenten.
- **Patient data zit in `localStorage`** onder key `"patients"` (JSON array).
- **Vluchtige UI-state** (form-velden, modals) leeft alleen in component-state.

> Voor cross-device sync hebben we een Supabase-plan klaarliggen — zie [v1-memory](https://github.com/zeynepnkomurcu/fetalgrowth-tracker). In v2 nog niet geïmplementeerd.

---

## Folder-discipline

| Folder | Wat erin hoort | Wat er NIET in hoort |
|---|---|---|
| `pages/` | Top-level route-componenten. Layout + state + handlers. | Klinische formules. |
| `components/` | Herbruikbare UI-blokken (`MeasurementCard`, `PatientCard`, ...). | Routing. |
| `layouts/` | Wrappers met sidebar + content-frame. | Page-specifieke logica. |
| `clinical/` | **Pure JS functies** — geen React, geen JSX. Berekeningen, flags, stages. | Alles met JSX of React imports. |
| `clinical/calculations/` | Individuele formules (CPR, EFW, ...). | |
| `clinical/flags/` | Booleans + severity (`{ active, severity, message }`). | |
| `clinical/staging/` | FGR-stage bepaling op basis van flags. | |
| `clinical/recommendations/` | Advies-tekst per stage. | |
| `clinical/trends/` | Multi-visit analyses (verslechtering AC of CPR). | |

**Waarom `clinical/` los van UI?** Zodat we ooit unit-tests kunnen schrijven op alleen die functies, en zodat de logica niet wegzinkt in een 800-regel page-component.

---

## i18n

`src/i18n.js` registreert i18next + react-i18next. Twee talen op dit moment: **EN** en **TR**. Sleutel-vertalingen staan inline in dat ene bestand. Componenten gebruiken:

```jsx
import { useTranslation } from "react-i18next"
const { t } = useTranslation()
return <h1>{t("patients")}</h1>
```

Talen wisselen: `i18n.changeLanguage("tr")` (nog geen UI-toggle ingebouwd).

---

## Styling — Tailwind v4

Geen custom CSS, geen CSS-modules — alleen Tailwind utility-classes inline. Imports gebeurt via `@import "tailwindcss"` in `src/index.css` (Tailwind v4 syntax — geen `@tailwind base/components/utilities` meer nodig).

Vite plugin `@tailwindcss/vite` doet de rest.

---

## Bestaande modules nog NIET gewired

Deze modules zijn klaar maar nog niet aangesloten op de UI. In de CHANGELOG staat ze als TODO.

- `clinical/processVisit.js` — orchestreert CPR + flags + stage + recommendations in één call.
- `pages/Patients.jsx` — alternatieve patient-list view.
- `pages/Reports.jsx` — placeholder voor PDF export.
- `layouts/MainLayout.jsx` — sidebar layout (DashboardTest gebruikt 'm nog niet).

---

## Beslissingen die niet vanzelfsprekend zijn

| Vraag | Antwoord | Reden |
|---|---|---|
| Geen TypeScript? | Klopt | v1 was ook plain JS. Halve TS-setup zonder `tsconfig.json` levert alleen verwarring op. |
| Geen state-library? | Klopt | App is klein + single-device. Pas overwegen als state cross-page wordt gedeeld. |
| Tailwind ipv CSS-in-JS? | Tailwind | Snel itereren op design, geen runtime kosten, geen extra deps. |
| Geen routes-config file? | Klopt | Routes leven in `App.jsx`. Pas refactoren naar `routes.jsx` als het >10 routes worden. |
