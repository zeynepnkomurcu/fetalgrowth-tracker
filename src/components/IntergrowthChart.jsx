import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// INTERGROWTH-21st means + SDs by GA week (20–40)
const IG21 = {
  BPD: { 20:{m:47.8,sd:2.4},21:{m:50.5,sd:2.5},22:{m:53.2,sd:2.6},23:{m:55.9,sd:2.7},24:{m:58.5,sd:2.8},25:{m:61.1,sd:2.9},26:{m:63.6,sd:3.0},27:{m:66.0,sd:3.1},28:{m:68.4,sd:3.2},29:{m:70.7,sd:3.3},30:{m:72.9,sd:3.4},31:{m:75.0,sd:3.5},32:{m:77.0,sd:3.6},33:{m:78.9,sd:3.7},34:{m:80.7,sd:3.8},35:{m:82.4,sd:3.9},36:{m:83.9,sd:4.0},37:{m:85.3,sd:4.1},38:{m:86.6,sd:4.2},39:{m:87.7,sd:4.3},40:{m:88.7,sd:4.4} },
  HC:  { 20:{m:178,sd:9},21:{m:188,sd:9},22:{m:198,sd:10},23:{m:208,sd:10},24:{m:218,sd:11},25:{m:228,sd:11},26:{m:237,sd:11},27:{m:246,sd:12},28:{m:255,sd:12},29:{m:263,sd:13},30:{m:271,sd:13},31:{m:279,sd:14},32:{m:286,sd:14},33:{m:292,sd:14},34:{m:298,sd:15},35:{m:304,sd:15},36:{m:309,sd:15},37:{m:313,sd:16},38:{m:317,sd:16},39:{m:320,sd:16},40:{m:323,sd:17} },
  AC:  { 20:{m:148,sd:11},21:{m:158,sd:12},22:{m:169,sd:12},23:{m:179,sd:13},24:{m:190,sd:14},25:{m:200,sd:14},26:{m:211,sd:15},27:{m:221,sd:16},28:{m:232,sd:16},29:{m:242,sd:17},30:{m:252,sd:18},31:{m:262,sd:18},32:{m:272,sd:19},33:{m:281,sd:20},34:{m:290,sd:20},35:{m:299,sd:21},36:{m:308,sd:22},37:{m:316,sd:22},38:{m:323,sd:23},39:{m:330,sd:24},40:{m:336,sd:24} },
  FL:  { 20:{m:33.0,sd:2.5},21:{m:35.5,sd:2.6},22:{m:38.0,sd:2.7},23:{m:40.5,sd:2.8},24:{m:42.9,sd:2.9},25:{m:45.3,sd:3.0},26:{m:47.6,sd:3.1},27:{m:49.8,sd:3.2},28:{m:51.9,sd:3.3},29:{m:54.0,sd:3.4},30:{m:55.9,sd:3.5},31:{m:57.8,sd:3.6},32:{m:59.5,sd:3.7},33:{m:61.2,sd:3.8},34:{m:62.7,sd:3.9},35:{m:64.1,sd:4.0},36:{m:65.4,sd:4.1},37:{m:66.5,sd:4.2},38:{m:67.5,sd:4.3},39:{m:68.3,sd:4.4},40:{m:69.0,sd:4.5} },
};

// Hadlock 1991 EFW P50 in grams, by GA week. SD ≈ 12.7% of mean.
const EFW_REF = {20:331,21:387,22:451,23:524,24:608,25:704,26:815,27:941,28:1085,29:1248,30:1431,31:1635,32:1860,33:2103,34:2362,35:2633,36:2914,37:3203,38:3496,39:3789,40:4078};

// z-multipliers for percentiles
const Z3 = 1.881, Z10 = 1.282, Z90 = 1.282, Z97 = 1.881;

const PARAM_META = {
  AC:  { label: "Abdominal Circumference", unit: "mm", domain: [120, 360], visitKey: "ac"  },
  BPD: { label: "Biparietal Diameter",     unit: "mm", domain: [40, 100],  visitKey: "bpd" },
  HC:  { label: "Head Circumference",      unit: "mm", domain: [150, 360], visitKey: "hc"  },
  FL:  { label: "Femur Length",            unit: "mm", domain: [25, 80],   visitKey: "fl"  },
  EFW: { label: "Estimated Fetal Weight",  unit: "g",  domain: [200, 5000], visitKey: "efw" },
};

function buildReferenceData(parameter) {
  const data = [];
  for (let ga = 20; ga <= 40; ga++) {
    if (parameter === "EFW") {
      const m = EFW_REF[ga];
      const sd = m * 0.127;
      data.push({
        ga,
        p3:  Math.round(m - Z3 * sd),
        p10: Math.round(m - Z10 * sd),
        p50: m,
        p90: Math.round(m + Z90 * sd),
        p97: Math.round(m + Z97 * sd),
      });
    } else {
      const r = IG21[parameter]?.[ga];
      if (!r) continue;
      data.push({
        ga,
        p3:  +(r.m - Z3 * r.sd).toFixed(1),
        p10: +(r.m - Z10 * r.sd).toFixed(1),
        p50: r.m,
        p90: +(r.m + Z90 * r.sd).toFixed(1),
        p97: +(r.m + Z97 * r.sd).toFixed(1),
      });
    }
  }
  return data;
}

function getVisitValue(visit, parameter) {
  if (parameter === "EFW") return visit.calculations?.efw ?? null;
  const key = PARAM_META[parameter].visitKey;
  return visit.rawData?.[key] ?? null;
}

export default function IntergrowthChart({ visits, parameter = "AC" }) {
  const meta = PARAM_META[parameter];
  const referenceData = buildReferenceData(parameter);

  const visitPoints = (visits || [])
    .filter((v) => v.gaWeeks >= 20)
    .map((v) => {
      const val = getVisitValue(v, parameter);
      return val != null
        ? { ga: v.gaWeeks + (v.gaDays || 0) / 7, actual: val }
        : null;
    })
    .filter(Boolean);

  const mergedData = [...referenceData, ...visitPoints].sort((a, b) => a.ga - b.ga);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-base font-bold text-slate-800">
          {parameter} Growth Curve
        </h2>
        <span className="text-xs text-slate-500">{meta.label} ({meta.unit})</span>
      </div>

      <div className="h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mergedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="ga"
              type="number"
              domain={[20, 40]}
              ticks={[20, 24, 28, 32, 36, 40]}
              tickFormatter={(v) => `${Math.round(v)}w`}
            />
            <YAxis
              domain={meta.domain}
              label={{
                value: `${parameter} (${meta.unit})`,
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip
              itemSorter={(item) => {
                const order = { p3: 5, p10: 4, p50: 3, p90: 2, p97: 1, actual: 0 };
                return order[item.dataKey];
              }}
            />
            <Legend
              payload={[
                { value: "P97", type: "line", color: "#ec4899" },
                { value: "P90", type: "line", color: "#8b5cf6" },
                { value: "P50", type: "line", color: "#06b6d4" },
                { value: "P10", type: "line", color: "#f59e0b" },
                { value: "P3",  type: "line", color: "#ef4444" },
                { value: "Patient", type: "line", color: "#111827" },
              ]}
            />
            <Line type="monotone" dataKey="p97" stroke="#ec4899" dot={false} />
            <Line type="monotone" dataKey="p90" stroke="#8b5cf6" dot={false} />
            <Line type="monotone" dataKey="p50" stroke="#06b6d4" dot={false} />
            <Line type="linear"   dataKey="p10" stroke="#f59e0b" dot={false} />
            <Line type="linear"   dataKey="p3"  stroke="#ef4444" dot={false} />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#111827"
              strokeWidth={3}
              connectNulls
              dot={{ r: 6, strokeWidth: 2, fill: "#111827" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
