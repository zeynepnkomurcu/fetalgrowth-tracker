export default function MeasurementCard({ title, value, onChange, percentile, placeholder }) {
  return (
    <div className="border border-slate-200 rounded-xl p-3 bg-white">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {title}
        </h3>
        {percentile && (
          <span className={`${percentile.color} font-bold text-xs`}>
            {percentile.label}
          </span>
        )}
      </div>
      <input
        type="number"
        value={value}
        onChange={onChange}
        placeholder={placeholder ?? "0"}
        className="w-full border-0 px-0 py-0 text-base text-slate-900 focus:outline-none focus:ring-0 bg-transparent"
      />
    </div>
  );
}
