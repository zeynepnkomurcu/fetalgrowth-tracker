# FetalGrowth Tracker v2

Klinische web-app voor opvolging van foetale groei volgens **INTERGROWTH-21** standaard, met **Doppler-analyse** en **FGR-staging** (Fetal Growth Restriction). Bedoeld voor gynaecologen — momenteel in actieve ontwikkeling voor Dr. Zeynep.

> **v2-rewrite.** Dit is een gestructureerde herschrijving van [v1](https://github.com/zeynepnkomurcu/fetalgrowth-tracker). Verschillen: react-router (geen tab-state meer), Tailwind v4, react-i18next, modulaire `clinical/` folder voor formules en stages.

---

## 🔗 Live

- **Productie:** https://fetalgrowth-tracker.vercel.app
- **GitHub:** https://github.com/zeynepnkomurcu/fetalgrowth-tracker2

> _De v2-code draait op de v1-URL (Vercel-project hernoemd 2026-05-10). Het oude v1-project leeft nog onder `fetalgrowth-tracker-v1-archive.vercel.app` als archief. Repo-naam blijft `fetalgrowth-tracker2`._

---

## ✨ Functionaliteit

- **Patient management** — lijst-sidebar met unified search (voornaam/achternaam/protocolnummer), `+ Add Patient` voor volledige registratie (naam + TC kimlik + LMP), `+ Dummy` voor snelle test-patient (alleen LMP).
- **Biometry input** (BPD/HC/AC/FL in mm) met **live INTERGROWTH-21 percentielen** terwijl je typt, kleurgecodeerde chips.
- **Doppler input** (UA PI, MCA PI, UA S/D, DV PIV) + EDF state-toggle (Normal/AEDF/REDF).
- **Live EFW** via Hadlock-IV formule, plus matching percentile-chip via Hadlock-1991 reference.
- **Growth curves** (BPD/HC/AC/FL/EFW) met IG-21 P3/P10/P50/P90/P97 banden, Apple Health-stijl area-fill tussen P10–P90, custom hover-tooltip.
- **Visit history** per patient met max 1 visit/dag (overschrijft bij dubbele save).
- **EN/TR i18n** — sticky language preference in localStorage.
- **PWA support** — installeerbaar op iOS/Android met safe-area handling voor notch/dynamic island.

---

## 🧰 Stack

| Laag | Tool |
|---|---|
| Framework | React 19 |
| Build | Vite 8 |
| Routing | react-router-dom v7 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite` + `@theme` tokens) |
| Icons | lucide-react |
| i18n | react-i18next + i18next |
| Charts | Recharts (ComposedChart) |
| Persistentie | localStorage (geen backend) |
| Deploy | Vercel (auto-deploy bij push naar `main`) |

Geen TypeScript — alle code is plain `.js`/`.jsx` voor consistentie.

---

## 🎨 Design system

- **Accent**: medical-teal `#134e4a` (Tailwind `teal-900`) — primary buttons, selected states, P50 line
- **Background**: `slate-50` (#f8fafc)
- **Cards**: `bg-white border border-slate-200 rounded-xl shadow-sm`
- **Typography**: Inter, tabular-nums voor cijfers
- Tokens gedefinieerd in `src/index.css` via Tailwind v4 `@theme`.

---

## 🚀 Lokaal draaien

```bash
npm install
npm run dev      # → http://localhost:5173
npm run build    # productie build
npm run preview  # check productie build lokaal
npm run lint     # eslint
```

---

## 📁 Folder-structuur

```
fetalgrowth-tracker2/
├── public/
│   ├── empty-state-fetus.png   # echo-illustratie voor empty state
│   └── manifest.json, icons
├── src/
│   ├── App.jsx                 # router setup
│   ├── main.jsx                # React entry point
│   ├── i18n.js                 # vertalingen (EN/TR)
│   ├── index.css               # Tailwind import + @theme tokens
│   │
│   ├── pages/
│   │   ├── DashboardTest.jsx   → /
│   │   └── NewPatient.jsx      → /new-patient
│   │   (PatientDetails.jsx, Patients.jsx, Reports.jsx — niet gewired, cleanup-kandidaten)
│   │
│   ├── components/
│   │   ├── MeasurementCard.jsx
│   │   ├── DopplerInput.jsx
│   │   ├── IntergrowthChart.jsx
│   │   ├── GuidelineModal.jsx
│   │   └── LanguageSwitch.jsx
│   │
│   ├── utils/
│   │   └── formatDate.js       # locale-aware long date formatter
│   │
│   └── clinical/               # ALLE klinische logica (geen UI)
│       ├── ig21.js             # IG-21 referentietabel + EFW Hadlock-1991 + helpers
│       ├── calculateAcPercentile.js
│       ├── calculations/       # individuele formules (CPR, EFW, ...)
│       ├── flags/              # binaire signalen (lowCPR, abnormalUA, ...)
│       ├── staging/            # FGR-stage bepaling
│       ├── recommendations/    # advies-tekst per stage
│       └── trends/             # multi-visit trend detectie
│
├── docs/                       # diepere documentatie
├── CHANGELOG.md                # alle wijzigingen per release
└── README.md                   # dit bestand
```

**Regel:** klinische logica hoort NOOIT in een `pages/` of `components/` file. Maak er een `clinical/` module van zodat het testbaar is en niet vastzit aan een view.

---

## 📚 Documentatie

| Doc | Inhoud |
|---|---|
| [`docs/architecture.md`](docs/architecture.md) | Folder-keuzes, routing, state-management, waarom localStorage |
| [`docs/clinical-formulas.md`](docs/clinical-formulas.md) | Bronnen + formules (Hadlock EFW, INTERGROWTH-21 percentielen, CPR drempels) |
| [`docs/deployment.md`](docs/deployment.md) | Vercel setup, env vars, troubleshooting |
| [`docs/commit-conventie.md`](docs/commit-conventie.md) | Hoe commits genoemd worden zodat git log leesbaar blijft |

---

## 📜 Wijzigingen bijhouden

Elke wijziging gaat in [`CHANGELOG.md`](CHANGELOG.md) onder de juiste kop (`Added` / `Changed` / `Fixed` / `Removed`). Per release-versie gegroepeerd, datum in `YYYY-MM-DD`.

---

## ⚠️ Disclaimer

Deze app is een hulpmiddel voor opgeleide gynaecologen. **Geen klinische beslissing mag uitsluitend op output van deze app gebaseerd zijn.** Altijd combineren met klinisch oordeel en lokale guidelines (ISUOG, NICE).
