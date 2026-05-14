import { Search, Trash2, Users } from "lucide-react";

export default function PatientsSidebar({
  patients,
  selectedPatientId,
  searchQuery,
  setSearchQuery,
  handleSelectPatient,
  handleDeleteClick,
  t,
  card,
}) {
  return (
    <div className={`${card} p-4 h-fit`}>
      <h2 className="text-base font-semibold text-slate-800 mb-3 px-1">
        {t("dash.patients")}
      </h2>

      {patients.length > 0 && (
        <div className="relative mb-3">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("common.searchPatient")}
            className="w-full pl-9 pr-3 h-9 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#134e4a] focus:border-transparent"
          />
        </div>
      )}

      <div className="space-y-1.5">
        {patients.length === 0 && (
          <div className="flex flex-col items-center text-center py-8">
            <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <Users className="w-5 h-5 text-slate-400" />
            </div>

            <p className="text-xs text-slate-500">
              {t("dash.noPatients")}
            </p>
          </div>
        )}

        {(() => {
          const q = searchQuery.trim().toLowerCase();

          const filtered = patients
            .map((patient, index) => ({ patient, index }))
            .filter(({ patient }) => {
              if (!q) return true;

              const haystack = [
                patient.name,
                patient.surname,
                `${patient.name || ""} ${patient.surname || ""}`,
                patient.protocolNumber,
              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

              return haystack.includes(q);
            });

          if (patients.length > 0 && filtered.length === 0) {
            return (
              <p className="text-xs text-slate-400 text-center py-4">
                —
              </p>
            );
          }

          return filtered.map(({ patient, index }) => {
            const isSelected = selectedPatientId === index;

            return (
              <div
                key={index}
                className={`w-full px-3 py-2.5 rounded-lg transition-colors ${
                  isSelected
                    ? "bg-[#134e4a] text-white"
                    : "border border-slate-200 hover:border-[#134e4a]/40 hover:bg-[#f0fdfa] text-slate-800"
                }`}
              >
                <div className="flex items-start justify-between gap-2">

                  <button
                    onClick={() => handleSelectPatient(index)}
                    className="flex-1 text-left"
                  >
                    <p className="font-semibold text-sm">
                      {patient.name} {patient.surname}
                    </p>

                    <p
                      className={`text-xs mt-0.5 tabular ${
                        isSelected
                          ? "text-white/80"
                          : "text-slate-500"
                      }`}
                    >
                      {patient.protocolNumber ||
                        (patient.week != null
                          ? `${patient.week}w ${patient.days}d`
                          : "")}
                    </p>
                  </button>

                  <button
                    onClick={() => handleDeleteClick(patient)}
                    className={`p-1 rounded hover:bg-black/10 ${
                      isSelected
                        ? "text-white"
                        : "text-slate-500"
                    }`}
                  >
                    <Trash2 size={16} />
                  </button>

                </div>
              </div>
            );
          });
        })()}
      </div>
    </div>
  );
}