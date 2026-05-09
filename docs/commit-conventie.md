# Commit conventie

Doel: `git log --oneline` moet leesbaar zijn als verkort changelog. Niet meer 10× "Update App.jsx" zoals in v1.

---

## Format

```
<type>: <korte beschrijving in tegenwoordige tijd>
```

Eén regel, lowercase, geen punt op het einde.

### Voorbeelden

✅ Goed:

```
feat: patient edit form
fix: ga calculation off-by-one bug bij lmp > 40w
refactor: split dashboard into smaller components
docs: update clinical-formulas.md met intergrowth-21 tabel
chore: bump react-router-dom naar 7.16
```

❌ Vermijd:

```
Update App.jsx                       (zegt niets)
Fixed bug                            (welke?)
WIP                                  (commit later, samen)
asdf                                 (komaan)
```

---

## Types

| Type | Wanneer |
|---|---|
| `feat:` | Nieuwe functionaliteit voor gebruiker (nieuwe page, nieuwe input, nieuwe chart). |
| `fix:` | Bug-fix die voor gebruiker zichtbaar is. |
| `refactor:` | Code-restructurering zonder gedragsverandering. |
| `docs:` | Alleen wijzigingen in `README.md`, `CHANGELOG.md`, `docs/`. |
| `style:` | Tailwind/CSS-only — geen logica. |
| `chore:` | Dependency-bumps, build-config, ide-files. Niets dat eindgebruiker raakt. |
| `clinical:` | Aanpassing aan klinische formule of drempelwaarde. **Dr. Zeynep moet meelezen.** |

---

## Workflow

1. Maak je wijziging.
2. **Update `CHANGELOG.md`** onder `## [Unreleased]` — één regel.
3. Commit met de juiste prefix.
4. `git push origin main` → Vercel deployt automatisch.

---

## Speciaal voor `clinical:` commits

Klinische wijzigingen (formules, drempelwaardes, stages) moeten **altijd**:
1. Een referentie in [`docs/clinical-formulas.md`](clinical-formulas.md) krijgen of updaten.
2. Bron-paper of guideline vermelden in de commit-body:

```
clinical: cpr drempel naar 1.0 (was 1.08)

Bron: ISUOG Practice Guidelines update 2024.
Verzocht door: Dr. Zeynep, 2026-05-12.
```
