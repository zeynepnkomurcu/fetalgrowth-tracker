// INTERGROWTH-21st means + SDs by GA week (20–40), in mm.
export const IG21 = {
  BPD: { 20:{m:47.8,sd:2.4},21:{m:50.5,sd:2.5},22:{m:53.2,sd:2.6},23:{m:55.9,sd:2.7},24:{m:58.5,sd:2.8},25:{m:61.1,sd:2.9},26:{m:63.6,sd:3.0},27:{m:66.0,sd:3.1},28:{m:68.4,sd:3.2},29:{m:70.7,sd:3.3},30:{m:72.9,sd:3.4},31:{m:75.0,sd:3.5},32:{m:77.0,sd:3.6},33:{m:78.9,sd:3.7},34:{m:80.7,sd:3.8},35:{m:82.4,sd:3.9},36:{m:83.9,sd:4.0},37:{m:85.3,sd:4.1},38:{m:86.6,sd:4.2},39:{m:87.7,sd:4.3},40:{m:88.7,sd:4.4} },
  HC:  { 20:{m:178,sd:9},21:{m:188,sd:9},22:{m:198,sd:10},23:{m:208,sd:10},24:{m:218,sd:11},25:{m:228,sd:11},26:{m:237,sd:11},27:{m:246,sd:12},28:{m:255,sd:12},29:{m:263,sd:13},30:{m:271,sd:13},31:{m:279,sd:14},32:{m:286,sd:14},33:{m:292,sd:14},34:{m:298,sd:15},35:{m:304,sd:15},36:{m:309,sd:15},37:{m:313,sd:16},38:{m:317,sd:16},39:{m:320,sd:16},40:{m:323,sd:17} },
  AC:  { 20:{m:148,sd:11},21:{m:158,sd:12},22:{m:169,sd:12},23:{m:179,sd:13},24:{m:190,sd:14},25:{m:200,sd:14},26:{m:211,sd:15},27:{m:221,sd:16},28:{m:232,sd:16},29:{m:242,sd:17},30:{m:252,sd:18},31:{m:262,sd:18},32:{m:272,sd:19},33:{m:281,sd:20},34:{m:290,sd:20},35:{m:299,sd:21},36:{m:308,sd:22},37:{m:316,sd:22},38:{m:323,sd:23},39:{m:330,sd:24},40:{m:336,sd:24} },
  FL:  { 20:{m:33.0,sd:2.5},21:{m:35.5,sd:2.6},22:{m:38.0,sd:2.7},23:{m:40.5,sd:2.8},24:{m:42.9,sd:2.9},25:{m:45.3,sd:3.0},26:{m:47.6,sd:3.1},27:{m:49.8,sd:3.2},28:{m:51.9,sd:3.3},29:{m:54.0,sd:3.4},30:{m:55.9,sd:3.5},31:{m:57.8,sd:3.6},32:{m:59.5,sd:3.7},33:{m:61.2,sd:3.8},34:{m:62.7,sd:3.9},35:{m:64.1,sd:4.0},36:{m:65.4,sd:4.1},37:{m:66.5,sd:4.2},38:{m:67.5,sd:4.3},39:{m:68.3,sd:4.4},40:{m:69.0,sd:4.5} },
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
