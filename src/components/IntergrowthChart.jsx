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
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-base font-bold text-slate-800">
          {t("chart.title", { param: parameter })}
        </h2>
        <span className="text-xs text-slate-500">{t(`chart.${parameter}`)} ({meta.unit})</span>
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
            <Line type="monotone" dataKey="p97" stroke="#ec4899" dot={false} />
            <Line type="monotone" dataKey="p90" stroke="#8b5cf6" dot={false} />
            <Line type="monotone" dataKey="p50" stroke="#06b6d4" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="p10" stroke="#f59e0b" dot={false} />
            <Line type="monotone" dataKey="p3"  stroke="#ef4444" dot={false} />
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
