import { useTranslation } from "react-i18next";

export default function DopplerInput({ values, onChange }) {
  const { t } = useTranslation();

  const fields = [
    { key: "uaPi",  label: "UA PI",  step: "0.01" },
    { key: "mcaPi", label: "MCA PI", step: "0.01" },
    { key: "sd",    label: "UA S/D", step: "0.01" },
    { key: "dvPiv", label: "DV PIV", step: "0.01" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {fields.map((f) => (
          <div
            key={f.key}
            className="border border-slate-200 rounded-lg px-3 py-2.5 bg-white hover:border-slate-300 focus-within:border-[#134e4a] focus-within:ring-1 focus-within:ring-[#134e4a] transition-colors"
          >
            <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
              {f.label}
            </label>
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
              className="w-full border-0 px-0 py-0 text-base font-semibold text-slate-800 focus:outline-none focus:ring-0 bg-transparent tabular placeholder:text-slate-400"
            />
          </div>
        ))}
      </div>

      <div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block mb-2">
          {t("doppler.edf")}
        </span>
        <div className="grid grid-cols-3 gap-2">
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
                className={`h-10 rounded-lg text-sm font-semibold transition-colors border ${
                  active
                    ? "bg-[#134e4a] text-white border-[#134e4a]"
                    : "bg-white text-[#134e4a] border-[#134e4a] hover:bg-[#f0fdfa]"
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
