import { CalendarDays } from "lucide-react";
import { formatLongDate } from "../../utils/formatDate";

export default function PatientHeader({
  patient,
  ga,
  t,
  i18n,
  card,
}) {
  return (
    <div className={`${card} px-6 py-5`}>
      <h2 className="text-xl font-semibold text-slate-800 tracking-tight">
        {patient.name} {patient.surname || ""}
      </h2>

      <p className="text-slate-500 text-sm mt-1 flex items-center gap-2 flex-wrap">
        <span className="tabular">
          {t("dash.ga")}: {ga.weeks}w {ga.days}d
        </span>

        {patient.lmp && (
          <>
            <span className="text-slate-300">·</span>

            <span className="inline-flex items-center gap-1 text-slate-400">
              <CalendarDays className="w-3.5 h-3.5" />

              {t("dash.lmp")}{" "}
              {formatLongDate(patient.lmp, i18n.language)}
            </span>
          </>
        )}
      </p>
    </div>
  );
}