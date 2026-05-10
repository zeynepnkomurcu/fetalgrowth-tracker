import { useTranslation } from "react-i18next";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { IG21, EFW_REF } from "../clinical/ig21";

// z-multipliers for percentiles
const Z3 = 1.881, Z10 = 1.282, Z90 = 1.282, Z97 = 1.881;

const PARAM_META = {
  AC:  { unit: "mm", domain: [110, 380], visitKey: "ac"  },
  BPD: { unit: "mm", domain: [40, 105],  visitKey: "bpd" },
  HC:  { unit: "mm", domain: [150, 380], visitKey: "hc"  },
  FL:  { unit: "mm", domain: [25, 85],   visitKey: "fl"  },
  EFW: { unit: "g",  domain: [200, 5000], visitKey: "efw" },
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
  const { t } = useTranslation();
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
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-800">
          {t("chart.title", { param: parameter })}
        </h3>
        <span className="text-xs text-slate-400">{t(`chart.${parameter}`)} ({meta.unit})</span>
      </div>

      <div className="h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mergedData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid stroke="#f1f5f9" strokeDasharray="0" vertical={false} />
            <XAxis
              dataKey="ga"
              type="number"
              domain={[20, 40]}
              ticks={[20, 24, 28, 32, 36, 40]}
              tickFormatter={(v) => `${Math.round(v)}w`}
              stroke="#94a3b8"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={meta.domain}
              stroke="#94a3b8"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "12px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
              }}
              itemSorter={(item) => {
                const order = { p3: 5, p10: 4, p50: 3, p90: 2, p97: 1, actual: 0 };
                return order[item.dataKey];
              }}
            />
            <Line type="monotone" dataKey="p97" stroke="#ef4444" strokeWidth={1} strokeDasharray="3 3" dot={false} />
            <Line type="monotone" dataKey="p90" stroke="#f59e0b" strokeWidth={1} dot={false} />
            <Line type="monotone" dataKey="p50" stroke="#134e4a" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="p10" stroke="#f59e0b" strokeWidth={1} dot={false} />
            <Line type="monotone" dataKey="p3"  stroke="#ef4444" strokeWidth={1} strokeDasharray="3 3" dot={false} />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#0f172a"
              strokeWidth={2.5}
              connectNulls
              dot={{ r: 5, strokeWidth: 2, fill: "#0f172a", stroke: "#ffffff" }}
              activeDot={{ r: 7, strokeWidth: 2, stroke: "#ffffff" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
