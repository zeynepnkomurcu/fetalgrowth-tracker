    <PatientsSidebar
  patients={patients}
  selectedPatientId={selectedPatientId}
  onSelectPatient={handleSelectPatient}
  onDeletePatient={handleDeleteClick}
  searchQuery={searchQuery}
  setSearchQuery={setSearchQuery}
/>
    {/* Patients sidebar */}
          <div className={`${card} p-4 h-fit`}>
            <h2 className="text-base font-semibold text-slate-800 mb-3 px-1">
              {t("dash.patients")}
            </h2>