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

// Listen to <html class="dark"> changes so we re-render with the right colors.
function useIsDark() {
  const [dark, setDark] = useState(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  );
  useEffect(() => {
    const obs = new MutationObserver(() =>
      setDark(document.documentElement.classList.contains("dark"))
    );
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

function CustomTooltip({ active, payload, label, unit, t }) {
  if (!active || !payload || !payload.length) return null;
  const order = { actual: 0, p50: 1, p10: 2, p90: 3, p3: 4, p97: 5 };
  const sorted = [...payload].sort(
    (a, b) => (order[a.dataKey] ?? 99) - (order[b.dataKey] ?? 99)
  );
  return (
    <div className="bg-[--color-surface] border border-[--color-border] rounded-lg shadow-lg px-3 py-2 text-xs">
      <div className="font-semibold mb-1.5 tabular text-[--color-text]">
        {Math.round(label * 10) / 10}w
      </div>
      <div className="space-y-0.5">
        {sorted.map((entry, i) => {
          if (entry.value == null || entry.dataKey === "p10band" || entry.dataKey === "p90band") return null;
          const labelText = entry.dataKey === "actual" ? t("chart.patient") : entry.dataKey.toUpperCase();
          return (
            <div key={i} className="flex items-center justify-between gap-4 tabular">
              <span className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: entry.stroke || entry.fill }}
                />
                <span className="text-[--color-text-muted]">{labelText}</span>
              </span>
              <span className="font-semibold text-[--color-text]">
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
  const isDark = useIsDark();
  const meta = PARAM_META[parameter];
  const referenceData = buildReferenceData(parameter);

  // Add a "band" pair for area-fill between P10 and P90 (Apple Health style).
  const data = referenceData.map((d) => ({
    ...d,
    band: [d.p10, d.p90],
  }));

  const visitPoints = (visits || [])
    .filter((v) => v.gaWeeks >= 20)
    .map((v) => {
      const val = getVisitValue(v, parameter);
      return val != null
        ? { ga: v.gaWeeks + (v.gaDays || 0) / 7, actual: val }
        : null;
    })
    .filter(Boolean);

  const mergedData = [...data, ...visitPoints].sort((a, b) => a.ga - b.ga);

  const colors = isDark
    ? {
        grid:    "#2a2d33",
        axis:    "#71717a",
        bandFill:"rgba(16,185,129,0.06)",
        bandLine:"#3a3e45",
        outerLine:"#52525b",
        median:  "#10b981",
        actual:  "#f5f5f5",
        actualDot:"#f5f5f5",
        actualStroke:"#0b0d10",
      }
    : {
        grid:    "#f1f5f9",
        axis:    "#94a3b8",
        bandFill:"rgba(16,185,129,0.08)",
        bandLine:"#cbd5e1",
        outerLine:"#e2e8f0",
        median:  "#10b981",
        actual:  "#0a0a0a",
        actualDot:"#0a0a0a",
        actualStroke:"#ffffff",
      };

  return (
    <div className="bg-[--color-surface] border border-[--color-border] rounded-2xl p-5">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[--color-text-subtle]">
          {t("chart.title", { param: parameter })}
        </h3>
        <span className="text-xs text-[--color-text-subtle]">
          {t(`chart.${parameter}`)} ({meta.unit})
        </span>
      </div>

      <div className="h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={mergedData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid stroke={colors.grid} strokeDasharray="0" vertical={false} />
            <XAxis
              dataKey="ga"
              type="number"
              domain={[20, 40]}
              ticks={[20, 24, 28, 32, 36, 40]}
              tickFormatter={(v) => `${Math.round(v)}w`}
              stroke={colors.axis}
              tick={{ fontSize: 11, fill: colors.axis }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={meta.domain}
              stroke={colors.axis}
              tick={{ fontSize: 11, fill: colors.axis }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip
              content={<CustomTooltip unit={meta.unit} t={t} />}
              cursor={{ stroke: colors.axis, strokeDasharray: "3 3" }}
            />

            {/* P10–P90 area band — Apple Health style */}
            <Area
              type="monotone"
              dataKey="band"
              fill={colors.bandFill}
              stroke="transparent"
              isAnimationActive={false}
              connectNulls
            />

            {/* Outer percentiles — subtle */}
            <Line type="monotone" dataKey="p97" stroke={colors.outerLine} strokeWidth={1} strokeDasharray="2 4" dot={false} />
            <Line type="monotone" dataKey="p90" stroke={colors.bandLine}  strokeWidth={1} dot={false} />
            <Line type="monotone" dataKey="p50" stroke={colors.median}    strokeWidth={1.5} dot={false} />
            <Line type="monotone" dataKey="p10" stroke={colors.bandLine}  strokeWidth={1} dot={false} />
            <Line type="monotone" dataKey="p3"  stroke={colors.outerLine} strokeWidth={1} strokeDasharray="2 4" dot={false} />

            {/* Patient line + dots */}
            <Line
              type="monotone"
              dataKey="actual"
              stroke={colors.actual}
              strokeWidth={2}
              connectNulls
              dot={{ r: 5, strokeWidth: 2, fill: colors.actualDot, stroke: colors.actualStroke }}
              activeDot={{ r: 7, strokeWidth: 2 }}
              isAnimationActive
              animationDuration={300}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
