import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ComposedChart,
  Line,
  Area,
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
    let row;
    if (parameter === "EFW") {
      const m = EFW_REF[ga];
      const sd = m * 0.127;
      row = {
        ga,
        p3:  Math.round(m - Z3 * sd),
        p10: Math.round(m - Z10 * sd),
        p50: m,
        p90: Math.round(m + Z90 * sd),
        p97: Math.round(m + Z97 * sd),
      };
    } else {
      const r = IG21[parameter]?.[ga];
      if (!r) continue;
      row = {
        ga,
        p3:  +(r.m - Z3 * r.sd).toFixed(1),
        p10: +(r.m - Z10 * r.sd).toFixed(1),
        p50: r.m,
        p90: +(r.m + Z90 * r.sd).toFixed(1),
        p97: +(r.m + Z97 * r.sd).toFixed(1),
      };
    }
    // Pair the band [p10, p90] for the Area component (Apple Health style fill).
    row.band = [row.p10, row.p90];
    data.push(row);
  }
  return data;
}

function getVisitValue(visit, parameter) {
  if (parameter === "EFW") return visit.calculations?.efw ?? null;
  const key = PARAM_META[parameter].visitKey;
  return visit.rawData?.[key] ?? null;
}

// Detect viewport so we can render fewer ticks on narrow screens.
function useIsMobile() {
  const [mobile, setMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  );
  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return mobile;
}

function CustomTooltip({ active, payload, label, unit, t }) {
  if (!active || !payload || !payload.length) return null;
  // Mirror the chart's vertical order: P97 top → P3 bottom, patient last.
  const order = { p97: 0, p90: 1, p50: 2, p10: 3, p3: 4, actual: 5 };
  const sorted = [...payload]
    .filter((e) => e.dataKey !== "band" && e.value != null)
    .sort((a, b) => (order[a.dataKey] ?? 99) - (order[b.dataKey] ?? 99));
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-md px-3 py-2 text-xs">
      <div className="font-semibold text-slate-800 mb-1.5 tabular">
        {Math.round(label * 10) / 10}w
      </div>
      <div className="space-y-0.5">
        {sorted.map((entry, i) => {
          const labelText =
            entry.dataKey === "actual" ? t("chart.patient") : entry.dataKey.toUpperCase();
          return (
            <div key={i} className="flex items-center justify-between gap-4 tabular">
              <span className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: entry.stroke || entry.fill }}
                />
                <span className="text-slate-500">{labelText}</span>
              </span>
              <span className="font-semibold text-slate-800">
                {entry.value} {unit}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function IntergrowthChart({ visits, parameter = "AC" }) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
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

  // Fewer X ticks on mobile to avoid crowding.
  const xTicks = isMobile ? [20, 28, 36, 40] : [20, 24, 28, 32, 36, 40];

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 sm:p-6">
      <div className="flex items-baseline justify-between mb-3 sm:mb-4 gap-2">
        <h3 className="text-sm font-semibold text-slate-800">
          {t("chart.title", { param: parameter })}
        </h3>
        <span className="text-xs text-slate-400 truncate">
          {t(`chart.${parameter}`)} ({meta.unit})
        </span>
      </div>

      <div className="h-[280px] sm:h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={mergedData}
            margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
          >
            <defs>
              <linearGradient id="bandFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"  stopColor="#134e4a" stopOpacity="0.10" />
                <stop offset="100%" stopColor="#134e4a" stopOpacity="0.04" />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#f1f5f9" strokeDasharray="0" vertical={false} />

            <XAxis
              dataKey="ga"
              type="number"
              domain={[20, 40]}
              ticks={xTicks}
              tickFormatter={(v) => `${Math.round(v)}w`}
              stroke="#94a3b8"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              padding={{ left: 6, right: 6 }}
            />
            <YAxis
              domain={meta.domain}
              stroke="#94a3b8"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              width={isMobile ? 36 : 48}
            />
            <Tooltip
              cursor={{ stroke: "#94a3b8", strokeDasharray: "3 3" }}
              content={<CustomTooltip unit={meta.unit} t={t} />}
            />

            {/* P10–P90 area band — Apple Health style fill */}
            <Area
              type="monotone"
              dataKey="band"
              stroke="transparent"
              fill="url(#bandFill)"
              isAnimationActive={false}
              connectNulls
              activeDot={false}
            />

            {/* Outer percentile lines */}
            <Line type="monotone" dataKey="p97" stroke="#ef4444" strokeWidth={1} strokeDasharray="3 3" dot={false} />
            <Line type="monotone" dataKey="p90" stroke="#f59e0b" strokeWidth={1} dot={false} />
            <Line type="monotone" dataKey="p50" stroke="#134e4a" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="p10" stroke="#f59e0b" strokeWidth={1} dot={false} />
            <Line type="monotone" dataKey="p3"  stroke="#ef4444" strokeWidth={1} strokeDasharray="3 3" dot={false} />

            {/* Patient line + dots */}
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#0f172a"
              strokeWidth={2.5}
              connectNulls
              dot={{ r: 5, strokeWidth: 2, fill: "#0f172a", stroke: "#ffffff" }}
              activeDot={{ r: 7, strokeWidth: 2, stroke: "#ffffff" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
