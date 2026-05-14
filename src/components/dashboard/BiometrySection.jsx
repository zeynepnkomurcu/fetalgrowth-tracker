import MeasurementCard from "../MeasurementCard";
import DopplerInput from "../DopplerInput";

export default function BiometrySection({
  t,
  card,
  measurements,
  setMeasurements,
  ga,
  getPercentile,
  percentileBadge,
  liveEfw,
  liveEfwBadge,
  doppler,
  handleDopplerChange,
  handleSave,
}) {
  return (
    <div className={`${card} p-6 space-y-6`}>

      {/* Biometry */}
      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-3">
          {t("dash.biometry")}
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">

          {["BPD", "HC", "AC", "FL"].map((field) => (
            <MeasurementCard
              key={field}
              title={field}
              value={measurements[field]}
              onChange={(e) =>
                setMeasurements((prev) => ({
                  ...prev,
                  [field]: e.target.value,
                }))
              }
              percentile={
                measurements[field]
                  ? percentileBadge(
                      getPercentile(
                        field,
                        ga.weeks,
                        measurements[field]
                      )
                    )
                  : null
              }
            />
          ))}
        </div>
      </div>

      {/* EFW */}
      <div className="rounded-lg px-4 py-3 flex items-center justify-between gap-3 bg-[#134e4a] text-white">

        <div className="flex items-baseline gap-3 min-w-0">

          <span className="text-[10px] uppercase tracking-wider opacity-80 font-semibold">
            {t("dash.efw")}
          </span>

          <span className="text-2xl font-semibold tabular leading-none">
            {liveEfw ? liveEfw : "—"}

            {liveEfw && (
              <span className="text-sm font-normal opacity-80 ml-1">
                g
              </span>
            )}
          </span>

          {liveEfwBadge && (
            <span className="bg-white/15 backdrop-blur px-2 py-0.5 rounded font-semibold text-xs tabular">
              {liveEfwBadge.label}
            </span>
          )}
        </div>

        <span className="text-[10px] opacity-75 hidden sm:inline tracking-wide">
          {t("dash.efwHint")}
        </span>
      </div>

      {/* Doppler */}
      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-3">
          {t("dash.doppler")}
        </h3>

        <DopplerInput
          values={doppler}
          onChange={handleDopplerChange}
        />
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        className="w-full h-11 rounded-lg bg-[#134e4a] text-white text-sm font-semibold hover:bg-[#0f766e] transition-colors"
      >
        {t("dash.saveAnalyze")}
      </button>
    </div>
  );
}