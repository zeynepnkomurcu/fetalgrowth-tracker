export default function MeasurementCard({
  title,
  value,
  onChange,
  percentile,
  placeholder,
  unit = "mm",
}) {
  return (
    <div className="border border-[--color-border] rounded-xl px-3 py-2.5 bg-[--color-surface] hover:border-[--color-border-strong] focus-within:border-[--color-text] focus-within:ring-1 focus-within:ring-[--color-text] transition-colors">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[--color-text-subtle]">
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
          className="w-full border-0 px-0 py-0 text-base font-semibold text-[--color-text] focus:outline-none focus:ring-0 bg-transparent tabular placeholder:text-[--color-text-subtle]"
        />
        <span className="text-[10px] text-[--color-text-subtle] select-none">{unit}</span>
      </div>
    </div>
  );
}
