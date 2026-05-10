// INTERGROWTH-21st Fetal Growth Standards — 50th centile (m) + SD by GA week, in mm.
//
// Source: Papageorghiou AT et al. International standards for fetal growth based on
// serial ultrasound measurements: the Fetal Growth Longitudinal Study of the
// INTERGROWTH-21st Project. Lancet 2014;384:869-79.
//
// Waarden hier komen uit een quadratische fit door drie INTERGROWTH-21 ankers
// (20w, 30w, 40w) per parameter, op 1 decimaal afgerond. Reden: ronde-mm waarden
// gaven afwisselende +2/+3 sprongen tussen weken, zichtbaar als hoeken in de
// curve. Quadratische fit geeft vloeiend afnemende slopes per week.
//
// Anker-ankers (P50, mm) per parameter:
//   BPD: 47.0 / 74.0 / 91.0    →  fit:  -37.000 + 5.200·w - 0.0500·w²
//   HC : 175.0 / 278.0 / 338.0 →  fit: -160.000 + 21.050·w - 0.2150·w²
//   AC : 140.0 / 238.0 / 322.0 →  fit:  -98.000 + 13.300·w - 0.0700·w²
//   FL : 32.0 / 57.0 / 73.0    →  fit:  -45.000 + 4.750·w - 0.0450·w²
//
// SD's lineair tussen 20w en 40w ankers (CV ≈ 4-5% voor BPD/HC/FL, 6-7% voor AC).
//
// Sanity-check: AC=150 mm @ 21+0w → m=150.4, sd=11.6 → z=-0.034 → P49 ≈ P50.
export const IG21 = {
  BPD: {
    20:{m:47.0,sd:2.5},  21:{m:50.2,sd:2.6},  22:{m:53.2,sd:2.7},  23:{m:56.2,sd:2.8},
    24:{m:59.0,sd:2.9},  25:{m:61.8,sd:3.0},  26:{m:64.4,sd:3.1},  27:{m:67.0,sd:3.2},
    28:{m:69.4,sd:3.3},  29:{m:71.8,sd:3.4},  30:{m:74.0,sd:3.5},  31:{m:76.2,sd:3.6},
    32:{m:78.2,sd:3.7},  33:{m:80.2,sd:3.8},  34:{m:82.0,sd:3.9},  35:{m:83.8,sd:4.0},
    36:{m:85.4,sd:4.1},  37:{m:87.0,sd:4.2},  38:{m:88.4,sd:4.3},  39:{m:89.8,sd:4.4},
    40:{m:91.0,sd:4.5},
  },
  HC: {
    20:{m:175.0,sd:8.0}, 21:{m:187.2,sd:8.5}, 22:{m:199.0,sd:9.0}, 23:{m:210.4,sd:9.5},
    24:{m:221.4,sd:10.0},25:{m:231.9,sd:10.5},26:{m:242.0,sd:11.0},27:{m:251.6,sd:11.5},
    28:{m:260.8,sd:12.0},29:{m:269.6,sd:12.5},30:{m:278.0,sd:13.0},31:{m:285.9,sd:13.5},
    32:{m:293.4,sd:14.0},33:{m:300.5,sd:14.5},34:{m:307.2,sd:15.0},35:{m:313.4,sd:15.5},
    36:{m:319.2,sd:16.0},37:{m:324.5,sd:16.5},38:{m:329.4,sd:17.0},39:{m:333.9,sd:17.5},
    40:{m:338.0,sd:18.0},
  },
  AC: {
    20:{m:140.0,sd:11.0},21:{m:150.4,sd:11.6},22:{m:160.7,sd:12.2},23:{m:170.9,sd:12.8},
    24:{m:180.9,sd:13.4},25:{m:190.8,sd:14.0},26:{m:200.5,sd:14.6},27:{m:210.1,sd:15.2},
    28:{m:219.5,sd:15.8},29:{m:228.8,sd:16.4},30:{m:238.0,sd:17.0},31:{m:247.0,sd:17.6},
    32:{m:255.9,sd:18.2},33:{m:264.7,sd:18.8},34:{m:273.3,sd:19.4},35:{m:281.8,sd:20.0},
    36:{m:290.1,sd:20.6},37:{m:298.3,sd:21.2},38:{m:306.3,sd:21.8},39:{m:314.2,sd:22.4},
    40:{m:322.0,sd:23.0},
  },
  FL: {
    20:{m:32.0,sd:2.4},  21:{m:34.9,sd:2.5},  22:{m:37.7,sd:2.6},  23:{m:40.5,sd:2.7},
    24:{m:43.1,sd:2.8},  25:{m:45.6,sd:2.9},  26:{m:48.1,sd:3.0},  27:{m:50.4,sd:3.1},
    28:{m:52.7,sd:3.2},  29:{m:54.9,sd:3.3},  30:{m:57.0,sd:3.4},  31:{m:59.0,sd:3.5},
    32:{m:60.9,sd:3.6},  33:{m:62.7,sd:3.7},  34:{m:64.5,sd:3.8},  35:{m:66.1,sd:3.9},
    36:{m:67.7,sd:4.0},  37:{m:69.1,sd:4.1},  38:{m:70.5,sd:4.2},  39:{m:71.8,sd:4.3},
    40:{m:73.0,sd:4.4},
  },
};

// Hadlock 1991 EFW P50 in grams, by GA week. SD ≈ 12.7% of mean.
export const EFW_REF = {20:331,21:387,22:451,23:524,24:608,25:704,26:815,27:941,28:1085,29:1248,30:1431,31:1635,32:1860,33:2103,34:2362,35:2633,36:2914,37:3203,38:3496,39:3789,40:4078};

// Abramowitz & Stegun 26.2.17 — standard normal CDF approximation
function normCDF(z) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z >= 0 ? 1 - p : p;
}

export function getZ(param, gaWeeks, value) {
  const v = Number(value);
  if (!v || isNaN(v) || gaWeeks == null) return null;
  const wk = Math.max(20, Math.min(40, Math.round(gaWeeks)));
  if (param === "EFW") {
    const m = EFW_REF[wk];
    if (!m) return null;
    const sd = m * 0.127;
    return (v - m) / sd;
  }
  const r = IG21[param]?.[wk];
  if (!r) return null;
  return (v - r.m) / r.sd;
}

export function getPercentile(param, gaWeeks, value) {
  const z = getZ(param, gaWeeks, value);
  if (z == null) return null;
  return Math.max(1, Math.min(99, Math.round(normCDF(z) * 100)));
}

// Returns Tailwind classes for a percentile band — used as a coloured chip.
export function percentileBadge(p) {
  if (p == null) return null;
  let color;
  if (p < 3 || p > 97)        color = "bg-red-100 text-red-700 ring-1 ring-red-200";
  else if (p < 10 || p > 90)  color = "bg-amber-100 text-amber-700 ring-1 ring-amber-200";
  else if (p < 25 || p > 75)  color = "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200";
  else                        color = "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200";
  return { color, label: `P${p}` };
}

// Hadlock IV — input mm, output grams.
export function calcEfwHadlock({ ac, bpd, hc, fl }) {
  if (!ac || !bpd || !hc || !fl) return null;
  const acCm = ac / 10, bpdCm = bpd / 10, hcCm = hc / 10, flCm = fl / 10;
  const log10Efw =
    1.326
    - 0.00326 * acCm * flCm
    + 0.0107  * hcCm
    + 0.0438  * acCm
    + 0.158   * flCm;
  return Math.round(Math.pow(10, log10Efw));
}
