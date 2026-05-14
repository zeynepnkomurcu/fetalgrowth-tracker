import {
  Check,
  FlaskConical,
  Plus
} from "lucide-react";
import DeletePatientModal from "../components/dashboard/DeletePatientModal";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import BiometrySection from "../components/dashboard/BiometrySection";
import PatientHeader from "../components/dashboard/PatientHeader";
import PatientsSidebar from "../components/dashboard/PatientsSidebar";
import VisitHistory from "../components/dashboard/VisitHistory";
import {
  deletePatientCompletely,
  deleteVisitById,
  fetchPatientsWithVisits,
  saveVisit,
} from "../services/DashboardService";

import {
  calcEfwHadlock,
  getPercentile,
  percentileBadge,
} from "../clinical/ig21";
import AppHeader from "../components/AppHeader";
import GuidelineModal from "../components/GuidelineModal";

const emptyMeasurements = { AC: "", BPD: "", HC: "", FL: "", EFW: "" };
const emptyDoppler = { uaPi: "", mcaPi: "", sd: "", dvPiv: "", edfState: null };

function calcGaFromLmp(lmp) {
  if (!lmp) return null;
  const lmpDate = new Date(lmp);
  if (isNaN(lmpDate.getTime())) return null;
  const today = new Date();
  const diffDays = Math.floor((today - lmpDate) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return null;
  return {
    weeks: Math.floor(diffDays / 7),
    days: diffDays % 7,
  };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
const [patientToDelete, setPatientToDelete] = useState(null);

  useEffect(() => {
const fetchPatients = async () => {
  try {
    const patientsData = await fetchPatientsWithVisits();
    setPatients(patientsData);
  } catch (error) {
    console.error(error);
  }
};

    fetchPatients();
  }, []);

  const [measurements, setMeasurements] = useState(emptyMeasurements);
  const [doppler, setDoppler] = useState(emptyDoppler);
  const [chartParam, setChartParam] = useState("AC");

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [savedToast, setSavedToast] = useState(false);

  const [dummyOpen, setDummyOpen] = useState(false);
  const [dummyLmp, setDummyLmp] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  const handleCreateDummy = () => {
    if (!dummyLmp) return;
    const dummyCount = patients.filter((p) =>
      p.protocolNumber?.startsWith("DUMMY")
    ).length;
    const next = dummyCount + 1;
    const newPatient = {
      id: crypto.randomUUID(),
      name: "Dummy",
      surname: `#${next}`,
      protocolNumber: `DUMMY-${String(next).padStart(4, "0")}`,
      lmp: dummyLmp,
      tc: "",
      createdAt: new Date().toISOString(),
      visits: [],
    };
    const updated = [...patients, newPatient];
    setPatients(updated);
setSelectedPatientId(newPatient.id);
    setMeasurements(emptyMeasurements);
    setDoppler(emptyDoppler);
    setDummyOpen(false);
    setDummyLmp("");
  };

 const selectedPatient =
  patients.find((p) => p.id === selectedPatientId) || null;

  const visits = selectedPatient?.visits || [];

  const ga = selectedPatient
    ? selectedPatient.week != null
      ? { weeks: selectedPatient.week, days: selectedPatient.days || 0 }
      : calcGaFromLmp(selectedPatient.lmp) || { weeks: 28, days: 0 }
    : { weeks: 28, days: 0 };

const handleSelectPatient = (patientId) => {
  setSelectedPatientId(patientId);
    setMeasurements(emptyMeasurements);
    setDoppler(emptyDoppler);
  };
const handleDeleteClick = (patient) => {
  setPatientToDelete(patient);
};
const confirmDelete = async () => {
  if (!patientToDelete) return;

  try {
    await deletePatientCompletely(patientToDelete.id);

    setPatients((prev) =>
      prev.filter((p) => p.id !== patientToDelete.id)
    );

    setPatientToDelete(null);
    setSelectedPatientId(null);

  } catch (error) {
    console.error(error);
  }
};
  const handleDopplerChange = (key, value) => {
    setDoppler((prev) => ({ ...prev, [key]: value }));
  };

  // Live-derived EFW (Hadlock IV) and EFW percentile, updated as user types.
  const liveEfw = calcEfwHadlock({
    ac:  Number(measurements.AC)  || null,
    bpd: Number(measurements.BPD) || null,
    hc:  Number(measurements.HC)  || null,
    fl:  Number(measurements.FL)  || null,
  });
  const liveEfwPct = liveEfw ? getPercentile("EFW", ga.weeks, liveEfw) : null;
  const liveEfwBadge = percentileBadge(liveEfwPct);

const handleSave = async () => {
    if (selectedPatientId === null) return;

    const ac = Number(measurements.AC) || null;
    const bpd = Number(measurements.BPD) || null;
    const hc = Number(measurements.HC) || null;
    const fl = Number(measurements.FL) || null;

    if (!ac && !bpd && !hc && !fl && !doppler.uaPi && !doppler.mcaPi) {
      setModalMessage(t("modal.fillFields"));
      setModalVisible(true);
      return;
    }

    const efw = calcEfwHadlock({ ac, bpd, hc, fl });

    const nowIso = new Date().toISOString();
  const updatedPatients = [...patients];
const patientIndex = patients.findIndex(
  (p) => p.id === selectedPatientId
);

const patient = { ...updatedPatients[patientIndex] };
    const visit = {
id: crypto.randomUUID(),
      date: nowIso,
      gaWeeks: ga.weeks,
      gaDays: ga.days,
      rawData: {
        ac:    ac    || undefined,
        bpd:   bpd   || undefined,
        hc:    hc    || undefined,
        fl:    fl    || undefined,
        uaPi:  Number(doppler.uaPi)  || undefined,
        mcaPi: Number(doppler.mcaPi) || undefined,
        sd:    Number(doppler.sd)    || undefined,
        dvPiv: Number(doppler.dvPiv) || undefined,
        edfState: doppler.edfState || undefined,
      },
      calculations: {
        efw: efw || undefined,
      },
    };

try {
  await saveVisit(patient.id, visit);
} catch (error) {
  console.error(error);
  return;
}
patient.visits = [...(patient.visits || []), visit];

updatedPatients[patientIndex] = patient;

setPatients(updatedPatients);

    setMeasurements({ ...emptyMeasurements, EFW: efw || "" });
    setDoppler(emptyDoppler);

setSavedToast("saved");
    setTimeout(() => setSavedToast(false), 2500);

    const AC_10th = 125;
    const EFW_10th = 2000;
    if ((ac && ac < AC_10th) || (efw && efw < EFW_10th)) {
      setModalMessage(t("modal.isuogAlert"));
      setModalVisible(true);
    }
  };

const handleDeleteVisit = async (visitId) => {
    if (selectedPatientId === null) return;
    const updatedPatients = [...patients];
const patientIndex = patients.findIndex(
  (p) => p.id === selectedPatientId
);

const patient = { ...updatedPatients[patientIndex] };

patient.visits = (patient.visits || []).filter(
  (v) => v.id !== visitId
);

updatedPatients[patientIndex] = patient;
    setPatients(updatedPatients);
try {
  await deleteVisitById(visitId);
} catch (error) {
  console.error(error);
}
  };

  // ── shared classNames ─────────────────────────────────────────────
  const card = "bg-white border border-slate-200 rounded-xl shadow-sm";
  const btnPrimary =
    "inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-lg bg-[#134e4a] text-white text-sm font-semibold hover:bg-[#0f766e] transition-colors";
  const btnSecondary =
    "inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-lg border border-[#134e4a] text-[#134e4a] bg-white text-sm font-semibold hover:bg-[#f0fdfa] transition-colors";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">

      <AppHeader />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-4">

        {/* Page header */}
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800 tracking-tight">
              {t("dash.patients")}
            </h1>
            <p className="mt-1 text-slate-500 text-xs sm:text-sm">
              {t("app.subtitle")}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setDummyOpen(true)} className={btnSecondary}>
              <FlaskConical className="w-4 h-4" />
              {t("common.addDummy")}
            </button>
            <button onClick={() => navigate("/new-patient")} className={btnPrimary}>
              <Plus className="w-4 h-4" />
              {t("common.addPatient")}
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

<PatientsSidebar
  patients={patients}
  selectedPatientId={selectedPatientId}
  searchQuery={searchQuery}
  setSearchQuery={setSearchQuery}
  handleSelectPatient={handleSelectPatient}
  handleDeleteClick={handleDeleteClick}
  t={t}
  card={card}
/>
          {/* Conditional content */}
          {selectedPatient === null ? (
            <div className="lg:col-span-3">
              <div className={`${card} p-12 flex flex-col items-center justify-center text-center min-h-[460px]`}>
                <img
                  src="/empty-state-fetus.png"
                  alt=""
                  aria-hidden="true"
                  className="w-full max-w-lg h-auto mb-6 select-none pointer-events-none"
                />
                <h2 className="text-xl font-semibold text-slate-800 mb-1">
                  {t("dash.selectPatient")}
                </h2>
                <p className="text-sm text-slate-500 max-w-md">
                  {patients.length === 0
                    ? t("dash.selectPatientHintEmpty")
                    : t("dash.selectPatientHint")}
                </p>
              </div>
            </div>
         ) : (
  <>
    <DeletePatientModal
      visible={!!patientToDelete}
      onClose={() => setPatientToDelete(null)}
      onConfirm={confirmDelete}
    />

    <div className="lg:col-span-3 grid grid-cols-1 xl:grid-cols-3 gap-4">


              {/* Left: Biometry + Doppler + Curve + Visits */}
              <div className="xl:col-span-2 space-y-4">

   
   <PatientHeader
  patient={selectedPatient}
  ga={ga}
  t={t}
  i18n={i18n}
  card={card}
/>
           

<BiometrySection
  t={t}
  card={card}
  measurements={measurements}
  setMeasurements={setMeasurements}
  ga={ga}
  getPercentile={getPercentile}
  percentileBadge={percentileBadge}
  liveEfw={liveEfw}
  liveEfwBadge={liveEfwBadge}
  doppler={doppler}
  handleDopplerChange={handleDopplerChange}
  handleSave={handleSave}
/>

<VisitHistory
  visits={visits}
  onDeleteVisit={handleDeleteVisit}
  t={t}
  i18n={i18n}
  card={card}
/>
</div>
              {/* Right: Summary */}
              <div className="space-y-4">
                <div className={`${card} p-6`}>
                  <h3 className="text-sm font-semibold text-slate-800 mb-3">
                    {t("dash.summary")}
                  </h3>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-500">{t("dash.visits")}</span>
                      <span className="font-semibold text-sm text-slate-800 tabular">{visits.length}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-slate-500">{t("dash.lastGa")}</span>
                      <span className="font-semibold text-sm text-slate-800 tabular">
                        {visits.length > 0
                          ? `${visits[visits.length - 1].gaWeeks}w ${visits[visits.length - 1].gaDays}d`
                          : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
          )}
        </div>

        <GuidelineModal
          visible={modalVisible}
          message={modalMessage}
          onClose={() => setModalVisible(false)}
        />

        {/* Save toast */}
        {savedToast && (
          <div className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 bg-[#134e4a] text-white px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium toast-in">
            <Check className="w-4 h-4" />
            {savedToast === "updated" ? t("dash.visitUpdated") : t("dash.visitSaved")}
          </div>
        )}

        {/* Dummy patient modal */}
        {dummyOpen && (
          <div
            onClick={() => setDummyOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-md w-full p-6 space-y-4"
            >
              <div>
                <h3 className="text-lg font-semibold text-slate-800 tracking-tight">
                  {t("dummy.title")}
                </h3>
                <p className="text-sm text-slate-500 mt-1">{t("dummy.subtitle")}</p>
              </div>

              <div>
                <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {t("newPatient.lmpLabel")}
                </label>
                <input
                  type="date"
                  autoFocus
                  value={dummyLmp}
                  onChange={(e) => setDummyLmp(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#134e4a] focus:border-transparent"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setDummyOpen(false)}
                  className="flex-1 h-10 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm transition-colors"
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={handleCreateDummy}
                  disabled={!dummyLmp}
                  className="flex-1 h-10 rounded-lg bg-[#134e4a] text-white disabled:bg-slate-300 disabled:cursor-not-allowed font-semibold text-sm hover:bg-[#0f766e] transition-colors"
                >
                  {t("dummy.create")}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
