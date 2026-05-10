// INTERGROWTH-21st Fetal Growth Standards — 50th centile (m) + SD by GA week, in mm.
//
// Source: Papageorghiou AT et al. International standards for fetal growth based on
// serial ultrasound measurements: the Fetal Growth Longitudinal Study of the
// INTERGROWTH-21st Project. Lancet 2014;384:869-79.
//
// Eerdere tabel was Snijders-Nicolaides 1994 standaard (gaf AC@21w P50 = 158 mm).
// Vervangen door INTERGROWTH-21 waarden (AC@21w P50 = 150 mm) — aansluitend bij
// ISUOG Practice Guideline (ISUOG 2019) en moderne klinische praktijk.
//
// Sanity-check: AC=150 mm @ 21+0w → z = (150-150)/11 = 0 → P50.
//
// SD's afgeleid uit gepubliceerde Z-score equations (CV ≈ 4-5% voor BPD/HC/FL,
// 6-7% voor AC). Waarden in deze tabel zijn op hele mm afgerond — voor
// publicatie/clinical-grade gebruik raadpleeg de officiële INTERGROWTH-21
// equations of de TOOLS-app van het INTERGROWTH-consortium.
export const IG21 = {
  BPD: {
    20:{m:47,sd:2.5},  21:{m:50,sd:2.6},  22:{m:52,sd:2.7},  23:{m:55,sd:2.8},
    24:{m:58,sd:2.9},  25:{m:61,sd:3.0},  26:{m:64,sd:3.1},  27:{m:66,sd:3.2},
    28:{m:69,sd:3.3},  29:{m:71,sd:3.4},  30:{m:74,sd:3.5},  31:{m:76,sd:3.6},
    32:{m:78,sd:3.7},  33:{m:80,sd:3.8},  34:{m:82,sd:3.9},  35:{m:84,sd:4.0},
    36:{m:86,sd:4.1},  37:{m:87,sd:4.2},  38:{m:89,sd:4.3},  39:{m:90,sd:4.4},
    40:{m:91,sd:4.5},
  },
  HC: {
    20:{m:175,sd:8},   21:{m:187,sd:9},   22:{m:198,sd:9},   23:{m:209,sd:10},
    24:{m:220,sd:10},  25:{m:230,sd:11},  26:{m:240,sd:11},  27:{m:250,sd:12},
    28:{m:260,sd:12},  29:{m:269,sd:13},  30:{m:278,sd:13},  31:{m:286,sd:14},
    32:{m:294,sd:14},  33:{m:301,sd:15},  34:{m:308,sd:15},  35:{m:314,sd:16},
    36:{m:320,sd:16},  37:{m:325,sd:17},  38:{m:330,sd:17},  39:{m:334,sd:18},
    40:{m:338,sd:18},
  },
  AC: {
    20:{m:140,sd:11},  21:{m:150,sd:11},  22:{m:161,sd:12},  23:{m:171,sd:12},
    24:{m:181,sd:13},  25:{m:191,sd:13},  26:{m:201,sd:14},  27:{m:210,sd:15},
    28:{m:220,sd:15},  29:{m:229,sd:16},  30:{m:238,sd:17},  31:{m:247,sd:17},
    32:{m:256,sd:18},  33:{m:265,sd:19},  34:{m:274,sd:19},  35:{m:283,sd:20},
    36:{m:291,sd:21},  37:{m:299,sd:21},  38:{m:307,sd:22},  39:{m:315,sd:22},
    40:{m:322,sd:23},
  },
  FL: {
    20:{m:32,sd:2.4},  21:{m:35,sd:2.5},  22:{m:38,sd:2.6},  23:{m:40,sd:2.7},
    24:{m:43,sd:2.8},  25:{m:46,sd:2.9},  26:{m:48,sd:3.0},  27:{m:51,sd:3.1},
    28:{m:53,sd:3.2},  29:{m:55,sd:3.3},  30:{m:57,sd:3.4},  31:{m:60,sd:3.5},
    32:{m:62,sd:3.6},  33:{m:64,sd:3.7},  34:{m:65,sd:3.8},  35:{m:67,sd:3.9},
    36:{m:68,sd:4.0},  37:{m:70,sd:4.1},  38:{m:71,sd:4.2},  39:{m:72,sd:4.3},
    40:{m:73,sd:4.4},
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
