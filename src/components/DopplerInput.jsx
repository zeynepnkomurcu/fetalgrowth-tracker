import { useTranslation } from "react-i18next";

export default function DopplerInput({ values, onChange }) {
  const { t } = useTranslation();

  const inputClass =
    "w-full border-0 px-0 py-0 text-base text-slate-900 focus:outline-none focus:ring-0 bg-transparent";

  const labelClass =
    "text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2";

  const fields = [
    { key: "uaPi",  label: "UA PI",  step: "0.01" },
    { key: "mcaPi", label: "MCA PI", step: "0.01" },
    { key: "sd",    label: "S/D",    step: "0.01" },
    { key: "dvPiv", label: "DV PIV", step: "0.01" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {fields.map((f) => (
          <div
            key={f.key}
            className="border border-slate-200 rounded-xl p-3 bg-white"
          >
            <label className={labelClass}>{f.label}</label>
            <input
              type="number"
              inputMode="decimal"
              step={f.step}
              min="0"
              value={values[f.key] ?? ""}
              onChange={(e) => onChange(f.key, e.target.value)}
              onKeyDown={(e) => {
                if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
              }}
              onWheel={(e) => e.currentTarget.blur()}
              placeholder="0.00"
              className={inputClass}
            />
          </div>
        ))}
      </div>

      <div>
        <span className={labelClass}>{t("doppler.edf")}</span>
        <div className="flex gap-2 flex-wrap">
          {[
            { key: "normal",   label: t("doppler.normal") },
            { key: "absent",   label: t("doppler.aedf") },
            { key: "reversed", label: t("doppler.redf") },
          ].map((opt) => {
            const active = values.edfState === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => onChange("edfState", active ? null : opt.key)}
                className={`flex-1 py-2 px-3 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? opt.key === "normal"
                      ? "bg-green-500 text-white"
                      : opt.key === "absent"
                      ? "bg-orange-500 text-white"
                      : "bg-red-500 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
