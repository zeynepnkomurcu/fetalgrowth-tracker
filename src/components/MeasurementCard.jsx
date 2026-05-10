export default function MeasurementCard({
  title,
  value,
  onChange,
  percentile,
  placeholder,
  unit = "mm",
}) {
  return (
    <div className="border border-slate-200 rounded-lg px-3 py-2.5 bg-white hover:border-slate-300 focus-within:border-[#134e4a] focus-within:ring-1 focus-within:ring-[#134e4a] transition-colors">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </h3>
        {percentile && (
          <span
            className={`px-1.5 py-0.5 rounded font-bold text-[10px] tabular ${percentile.color}`}
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
          className="w-full border-0 px-0 py-0 text-base font-semibold text-slate-800 focus:outline-none focus:ring-0 bg-transparent tabular placeholder:text-slate-400"
        />
        <span className="text-[10px] text-slate-400 select-none">{unit}</span>
      </div>
    </div>
  );
}
