export default function MeasurementCard({
  title,
  value,
  onChange,
  percentile,
  placeholder,
  unit = "mm",
}) {
  return (
    <div className="border border-slate-200 rounded-xl px-3 py-2.5 bg-white hover:border-slate-300 transition-colors">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {title}
        </h3>
        {percentile && (
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${percentile.color}`}
          >
            {percentile.label}
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <input
          type="number"
          inputMode="decimal"
          step="0.1"
          min="0"
          value={value}
          onChange={onChange}
          onKeyDown={(e) => {
            if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
          }}
          onWheel={(e) => e.currentTarget.blur()}
          placeholder={placeholder ?? "0"}
          className="w-full border-0 px-0 py-0 text-base font-semibold text-slate-900 focus:outline-none focus:ring-0 bg-transparent tabular-nums"
        />
        <span className="text-xs text-slate-400 select-none">{unit}</span>
      </div>
    </div>
  );
}
