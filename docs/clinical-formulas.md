# Klinische formules en bronnen

Centraal overzicht van alle medische berekeningen die de app uitvoert, met bron-referenties zodat we de waarden later kunnen verdedigen of updaten.

> **⚠️** Sommige drempelwaardes hieronder zijn op dit moment placeholder-waardes uit de v1 prototype. Voor productie-gebruik moeten ze door Dr. Zeynep gevalideerd worden tegen de officiële INTERGROWTH-21 / ISUOG tabellen.

---

## Estimated Fetal Weight (EFW)

**Formule:** Hadlock IV (1985) — gebruikt BPD, HC, AC, FL.

```
log10(EFW) = 1.326
           - 0.00326 × AC × FL
           + 0.0107  × HC
           + 0.0438  × AC
           + 0.158   × FL
EFW (g)   = 10 ^ log10(EFW)
```

**Waar in code:** `src/pages/PatientDetails.jsx` → `calculateEfw()`

**Input:** alle metingen in cm (in de UI worden ze in mm ingevoerd → `/10` voor de formule).

**Bron:** Hadlock FP, Harrist RB, Sharman RS, et al. *Estimation of fetal weight with the use of head, body, and femur measurements—a prospective study.* Am J Obstet Gynecol 1985;151(3):333-7.

---

## AC Percentile (placeholder tabel)

**Waar in code:** `src/clinical/calculateAcPercentile.js` (inline tabel)

| GA (weken) | p3 | p10 | p50 | p90 | p97 |
|---|---|---|---|---|---|
| 24 | 160 | 190 | 240 | 300 | 340 |
| 28 | 220 | 260 | 320 | 400 | 460 |
| 32 | 320 | 380 | 480 | 620 | 720 |
| 36 | 450 | 520 | 680 | 880 | 980 |
| 40 | 520 | 620 | 820 | 1040 | 1180 |

**Status:** placeholder — moet vervangen worden door officiële INTERGROWTH-21 tabel met waarden voor elke GA-week (24 t/m 42).

**Bron (te implementeren):** Papageorghiou AT, Ohuma EO, Altman DG, et al. *International standards for fetal growth based on serial ultrasound measurements: the Fetal Growth Longitudinal Study of the INTERGROWTH-21st Project.* Lancet 2014;384:869-79.

---

## Cerebroplacental Ratio (CPR)

**Formule:**

```
CPR = MCA-PI / UA-PI
```

**Waar in code:** `src/clinical/calculations/calculateCpr.js`

**Drempel voor pathologisch:** `CPR < 1.08` → `lowCprFlag` actief.

**Bron drempel:** ISUOG Practice Guidelines: use of Doppler velocimetry in obstetrics (2013). Drempelwaarden voor laag CPR variëren per guideline (<1.0 of <1.08 of <5e percentiel) — momenteel hard-coded op 1.08, te valideren.

**Waar in code:** `src/clinical/flags/lowCprFlag.js`

---

## Umbilical Artery — abnormale flow

**Drempel:** UA-PI > 1.4 → `abnormalUaFlag` actief.

**Waar in code:** `src/clinical/flags/abnormalUaFlag.js`

**Status:** placeholder — eigenlijk moet UA-PI vergeleken worden met percentiel-tabel per GA, niet met één vaste drempel.

---

## EDF (End-Diastolic Flow) states

Drie discrete states, geen formule:

| State | Betekenis |
|---|---|
| `normal` | Voorwaartse flow over hele cyclus |
| `absent` (AEDF) | Geen voorwaartse flow in diastole |
| `reversed` (REDF) | Negatieve flow in diastole — kritisch |

**Bron:** standard ISUOG terminology.

---

## FGR Staging

**Waar in code:** `src/clinical/staging/fgrStage.js`

| Stage | Trigger |
|---|---|
| **0** | Geen flag actief |
| **1** | `lowCPR` OF `abnormalUA` actief |
| **2** | `lowCPR` EN `abnormalUA` beide actief |
| **3** | AEDF actief |
| **4** | REDF actief |

**Aanpak:** vereenvoudigde versie van GRIT/TRUFFLE staging. Volledige Figueras-Gratacos staging (die ook EFW-percentiel en MCA-PI percentiel gebruikt) is **nog niet** geïmplementeerd.

**Bron (volledige staging):** Figueras F, Gratacós E. *Update on the diagnosis and classification of fetal growth restriction and proposal of a stage-based management protocol.* Fetal Diagn Ther 2014;36(2):86-98.

---

## Recommendations per stage

**Waar in code:** `src/clinical/recommendations/fgrRecommendations.js`

| Stage | Tekst-niveau | Boodschap |
|---|---|---|
| 0 | info | Routine interval growth surveillance |
| 1 | important | Weekly Doppler surveillance |
| 2 | important | Twice weekly fetal surveillance |
| 3 | critical | Inpatient MFM evaluation |
| 4 | critical | Urgent fetal assessment |

**Status:** boodschappen zijn algemeen — kunnen later vervangen worden door site-specifieke protocol-tekst van het ziekenhuis waar de app gebruikt wordt.

---

## Gestational Age (GA)

**Berekening:** `(today - LMP) / 7` → afgerond naar weken + dagen.

**Waar in code:** `src/pages/Patients.jsx` (`addPatient`) en in component-level berekeningen in v1.

**EDD:** `LMP + 280 dagen` (Naegele's rule).

---

## Hoe een nieuwe formule toevoegen

1. Maak een file aan in `src/clinical/calculations/<naamFormule>.js`
2. Eén export, pure functie, geen React imports
3. Voeg een sectie toe in dit document met formule + bron
4. Eén regel in `CHANGELOG.md` onder `### Added`
5. Importeer in de page waar je 'm gebruikt
