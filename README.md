# FetalGrowth Tracker v2

Klinische web-app voor opvolging van foetale groei volgens **INTERGROWTH-21** standaard, met **Doppler-analyse** en **FGR-staging** (Fetal Growth Restriction). Bedoeld voor gynaecologen — momenteel in actieve ontwikkeling voor Dr. Zeynep.

> **v2-rewrite.** Dit is een gestructureerde herschrijving van [v1](https://github.com/zeynepnkomurcu/fetalgrowth-tracker). Verschillen: react-router (geen tab-state meer), Tailwind v4, react-i18next, modulaire `clinical/` folder voor formules en stages.

---

## 🔗 Live

- **Productie:** https://fetalgrowth-tracker2.vercel.app
- **GitHub:** https://github.com/zeynepnkomurcu/fetalgrowth-tracker2

---

## 🧰 Stack

| Laag | Tool |
|---|---|
| Framework | React 19 |
| Build | Vite 8 |
| Routing | react-router-dom v7 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| i18n | react-i18next + i18next |
| Charts | Recharts |
| Persistentie | localStorage (geen backend) |
| Deploy | Vercel (auto-deploy bij push naar `main`) |

Geen TypeScript — alle code is plain `.js`/`.jsx` voor consistentie.

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
├── public/                  # statische assets (icons, manifest)
├── src/
│   ├── App.jsx              # router setup
│   ├── main.jsx             # React entry point
│   ├── i18n.js              # vertalingen (EN/TR)
│   ├── index.css            # Tailwind import
│   │
│   ├── pages/               # route-componenten (1 file = 1 URL)
│   │   ├── DashboardTest.jsx    → /
│   │   ├── PatientDetails.jsx   → /patient/:id
│   │   └── NewPatient.jsx       → /new-patient
│   │
│   ├── components/          # herbruikbare UI-blokken
│   ├── layouts/             # page-frames (sidebar + content wrapper)
│   │
│   └── clinical/            # ALLE klinische logica (geen UI)
│       ├── calculateAcPercentile.js
│       ├── calculations/    # individuele formules (CPR, EFW, ...)
│       ├── flags/           # binaire signalen (lowCPR, abnormalUA, ...)
│       ├── staging/         # FGR-stage bepaling
│       ├── recommendations/ # advies-tekst per stage
│       └── trends/          # multi-visit trend detectie
│
├── docs/                    # diepere documentatie (zie hieronder)
├── CHANGELOG.md             # alle wijzigingen per datum
└── README.md                # dit bestand
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

Elke wijziging gaat in [`CHANGELOG.md`](CHANGELOG.md). Niet diep nadenken — gewoon één regel per wijziging onder de juiste kop (`Added` / `Changed` / `Fixed` / `Removed`).

```
## [Unreleased]
### Added
- Patient edit form (2026-05-12)
### Fixed
- GA berekening bij LMP > 40 weken
```

---

## ⚠️ Disclaimer

Deze app is een hulpmiddel voor opgeleide gynaecologen. **Geen klinische beslissing mag uitsluitend op output van deze app gebaseerd zijn.** Altijd combineren met klinisch oordeel en lokale guidelines (ISUOG, NICE).
