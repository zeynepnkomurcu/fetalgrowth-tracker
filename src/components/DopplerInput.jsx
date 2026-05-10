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
            className="border border-[--color-border] rounded-xl px-3 py-2.5 bg-[--color-surface] hover:border-[--color-border-strong] focus-within:border-[--color-text] focus-within:ring-1 focus-within:ring-[--color-text] transition-colors"
          >
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[--color-text-subtle] block mb-1">
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
              className="w-full border-0 px-0 py-0 text-base font-semibold text-[--color-text] focus:outline-none focus:ring-0 bg-transparent tabular placeholder:text-[--color-text-subtle]"
            />
          </div>
        ))}
      </div>

      <div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[--color-text-subtle] block mb-2">
          {t("doppler.edf")}
        </span>
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: "normal",   label: t("doppler.normal"),  active: "bg-brand-500 text-white" },
            { key: "absent",   label: t("doppler.aedf"),    active: "bg-amber-500 text-white" },
            { key: "reversed", label: t("doppler.redf"),    active: "bg-red-500 text-white" },
          ].map((opt) => {
            const active = values.edfState === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => onChange("edfState", active ? null : opt.key)}
                className={`h-10 rounded-lg text-sm font-semibold transition-colors ${
                  active
                    ? opt.active
                    : "border border-[--color-border] text-[--color-text-muted] hover:bg-[--color-surface-muted] hover:text-[--color-text]"
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
