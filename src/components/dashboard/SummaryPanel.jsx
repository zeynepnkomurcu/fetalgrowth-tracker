export default function SummaryPanel({
  visits,
  t,
  card,
}) {
  return (
    <div className="space-y-4">
      <div className={`${card} p-6`}>
        <h3 className="text-sm font-semibold text-slate-800 mb-3">
          {t("dash.summary")}
        </h3>

        <div className="space-y-1">

          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-sm text-slate-500">
              {t("dash.visits")}
            </span>

            <span className="font-semibold text-sm text-slate-800 tabular">
              {visits.length}
            </span>
          </div>

          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-slate-500">
              {t("dash.lastGa")}
            </span>

            <span className="font-semibold text-sm text-slate-800 tabular">
              {visits.length > 0
                ? `${visits[visits.length - 1].gaWeeks}w ${visits[visits.length - 1].gaDays}d`
                : "—"}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}