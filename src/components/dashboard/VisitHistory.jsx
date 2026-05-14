import { X } from "lucide-react";
import { formatLongDate } from "../../utils/formatDate";

export default function VisitHistory({
  visits,
  onDeleteVisit,
  t,
  i18n,
  card,
}) {
  if (visits.length === 0) return null;

  return (
    <div className={`${card} p-6`}>
      <h3 className="text-sm font-semibold text-slate-800 mb-3">
        {t("dash.visitHistory")} · {visits.length}
      </h3>

      <div className="space-y-2">
        {[...visits].reverse().map((v) => (
          <div
            key={v.id}
            className="border border-slate-200 rounded-lg px-4 py-3 flex items-start justify-between hover:border-[#134e4a]/30 hover:bg-slate-50 transition-colors"
          >
            <div className="flex-1 min-w-0">

              <div className="flex items-baseline gap-3">
                <span className="font-semibold text-sm text-slate-800 tabular">
                  {v.gaWeeks}w {v.gaDays}d
                </span>

                <span className="text-xs text-slate-400">
                  {formatLongDate(v.date, i18n.language)}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-xs text-slate-500 mt-2 tabular">
                <span>BPD <strong className="text-slate-800">{v.rawData?.bpd ?? "—"}</strong></span>
                <span>HC <strong className="text-slate-800">{v.rawData?.hc ?? "—"}</strong></span>
                <span>AC <strong className="text-slate-800">{v.rawData?.ac ?? "—"}</strong></span>
                <span>FL <strong className="text-slate-800">{v.rawData?.fl ?? "—"}</strong></span>

                <span>UA-PI <strong className="text-slate-800">{v.rawData?.uaPi ?? "—"}</strong></span>
                <span>MCA-PI <strong className="text-slate-800">{v.rawData?.mcaPi ?? "—"}</strong></span>

                <span>UA S/D <strong className="text-slate-800">{v.rawData?.sd ?? "—"}</strong></span>

                <span>EDF <strong className="text-slate-800">{v.rawData?.edfState ?? "—"}</strong></span>

                <span className="col-span-2 sm:col-span-4">
                  EFW{" "}
                  <strong className="text-slate-800">
                    {v.calculations?.efw
                      ? `${v.calculations.efw} g`
                      : "—"}
                  </strong>
                </span>
              </div>
            </div>

            <button
              onClick={() => onDeleteVisit(v.id)}
              className="ml-2 p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title={t("dash.deleteVisit")}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}