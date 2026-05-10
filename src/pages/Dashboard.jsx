import { useEffect } from "react";
import { supabase } from "../lib/supabase";
import { LogOut, User }
  from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Plus,
  FlaskConical,
  X,
  Check,
  CalendarDays,
  Users,
  Search,
} from "lucide-react";

import MeasurementCard from "../components/MeasurementCard";
import IntergrowthChart from "../components/IntergrowthChart";
import DopplerInput from "../components/DopplerInput";
import GuidelineModal from "../components/GuidelineModal";
import LanguageSwitch from "../components/LanguageSwitch";
import {
  getPercentile,
  percentileBadge,
  calcEfwHadlock,
} from "../clinical/ig21";
import { formatLongDate } from "../utils/formatDate";

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
useEffect(() => {

  const fetchPatients = async () => {

    const { data, error } =
      await supabase
        .from("patients")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

    if (!error && data) {
      setPatients(data);
    }
  };

  fetchPatients();

}, []);
  const handleLogout = async () => {
  await supabase.auth.signOut();
};

  const { t, i18n } = useTranslation();

const [patients, setPatients] = useState([]);

  const [selectedPatientId, setSelectedPatientId] = useState(null);
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
    setSelectedPatientId(updated.length - 1);
    setMeasurements(emptyMeasurements);
    setDoppler(emptyDoppler);
    setDummyOpen(false);
    setDummyLmp("");
  };

  const selectedPatient =
    selectedPatientId !== null ? patients[selectedPatientId] : null;

  const visits = selectedPatient?.visits || [];

  const ga = selectedPatient
    ? selectedPatient.week != null
      ? { weeks: selectedPatient.week, days: selectedPatient.days || 0 }
      : calcGaFromLmp(selectedPatient.lmp) || { weeks: 28, days: 0 }
    : { weeks: 28, days: 0 };

  const handleSelectPatient = (index) => {
    setSelectedPatientId(index);
    setMeasurements(emptyMeasurements);
    setDoppler(emptyDoppler);
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

  const handleSave = () => {
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
    const todayKey = nowIso.slice(0, 10);

    const updatedPatients = [...patients];
    const patient = { ...updatedPatients[selectedPatientId] };
    const existingVisits = patient.visits || [];
    const existingToday = existingVisits.find((v) => (v.date || "").slice(0, 10) === todayKey);

    const visit = {
      id: existingToday?.id || crypto.randomUUID(),
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

    patient.visits = existingToday
      ? existingVisits.map((v) => (v.id === existingToday.id ? visit : v))
      : [...existingVisits, visit];
    updatedPatients[selectedPatientId] = patient;

    setPatients(updatedPatients);

    setMeasurements({ ...emptyMeasurements, EFW: efw || "" });
    setDoppler(emptyDoppler);

    setSavedToast(existingToday ? "updated" : "saved");
    setTimeout(() => setSavedToast(false), 2500);

    const AC_10th = 125;
    const EFW_10th = 2000;
    if ((ac && ac < AC_10th) || (efw && efw < EFW_10th)) {
      setModalMessage(t("modal.isuogAlert"));
      setModalVisible(true);
    }
  };

  const handleDeleteVisit = (visitId) => {
    if (selectedPatientId === null) return;
    const updatedPatients = [...patients];
    const patient = { ...updatedPatients[selectedPatientId] };
    patient.visits = (patient.visits || []).filter((v) => v.id !== visitId);
    updatedPatients[selectedPatientId] = patient;
    setPatients(updatedPatients);
  };

  // ── shared classNames ─────────────────────────────────────────────
  const card = "bg-white border border-slate-200 rounded-xl shadow-sm";
  const btnPrimary =
    "inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-lg bg-[#134e4a] text-white text-sm font-semibold hover:bg-[#0f766e] transition-colors";
  const btnSecondary =
    "inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-lg border border-[#134e4a] text-[#134e4a] bg-white text-sm font-semibold hover:bg-[#f0fdfa] transition-colors";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-6 relative">

      {/* Floating language switch — visible on desktop always, on mobile only on the empty state */}
      <div
        className={`absolute top-4 right-4 md:top-6 md:right-6 z-20 ${
          selectedPatient ? "hidden md:block" : ""
        }`}
      >
        <LanguageSwitch />
      </div>

      <div
        className={`max-w-7xl mx-auto space-y-4 md:pt-0 ${
          selectedPatient ? "pt-0" : "pt-12"
        }`}
      >

        {/* Header */}
        <div className={`${card} px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-3 flex-wrap`}>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 tracking-tight">
              {t("app.title")}
            </h1>
            <p className="mt-1 text-slate-500 text-xs sm:text-sm">
              {t("app.subtitle")}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2">

  <div className="
    hidden sm:flex
    items-center
    gap-2
    px-3
    h-10
    rounded-lg
    border
    border-slate-200
    bg-white
    text-slate-600
    text-sm
  ">
    <User className="w-4 h-4" />
    Account
  </div>

  <button
    onClick={handleLogout}
    className="
      inline-flex
      items-center
      justify-center
      gap-2
      h-10
      px-4
      rounded-lg
      border
      border-slate-200
      bg-white
      text-slate-700
      hover:bg-slate-50
      transition-colors
      text-sm
      font-medium
    "
  >
    <LogOut className="w-4 h-4" />
    Logout
  </button>

</div>

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

          {/* Patients sidebar */}
          <div className={`${card} p-4 h-fit`}>
            <h2 className="text-base font-semibold text-slate-800 mb-3 px-1">
              {t("dash.patients")}
            </h2>

            {/* Unified search */}
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
                  <p className="text-xs text-slate-500">{t("dash.noPatients")}</p>
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
                    <button
                      key={index}
                      onClick={() => handleSelectPatient(index)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                        isSelected
                          ? "bg-[#134e4a] text-white"
                          : "border border-slate-200 hover:border-[#134e4a]/40 hover:bg-[#f0fdfa] text-slate-800"
                      }`}
                    >
                      <p className="font-semibold text-sm">
                        {patient.name} {patient.surname}
                      </p>
                      <p className={`text-xs mt-0.5 tabular ${isSelected ? "text-white/80" : "text-slate-500"}`}>
                        {patient.protocolNumber || (patient.week != null ? `${patient.week}w ${patient.days}d` : "")}
                      </p>
                    </button>
                  );
                });
              })()}
            </div>
          </div>

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
            <div className="lg:col-span-3 grid grid-cols-1 xl:grid-cols-3 gap-4">

              {/* Left: Biometry + Doppler + Curve + Visits */}
              <div className="xl:col-span-2 space-y-4">

                {/* Patient header */}
                <div className={`${card} px-6 py-5`}>
                  <h2 className="text-xl font-semibold text-slate-800 tracking-tight">
                    {selectedPatient.name} {selectedPatient.surname || ""}
                  </h2>
                  <p className="text-slate-500 text-sm mt-1 flex items-center gap-2 flex-wrap">
                    <span className="tabular">{t("dash.ga")}: {ga.weeks}w {ga.days}d</span>
                    {selectedPatient.lmp && (
                      <>
                        <span className="text-slate-300">·</span>
                        <span className="inline-flex items-center gap-1 text-slate-400">
                          <CalendarDays className="w-3.5 h-3.5" />
                          {t("dash.lmp")} {formatLongDate(selectedPatient.lmp, i18n.language)}
                        </span>
                      </>
                    )}
                  </p>
                </div>

                {/* Biometry + Doppler */}
                <div className={`${card} p-6 space-y-6`}>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 mb-3">{t("dash.biometry")}</h3>
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
                              ? percentileBadge(getPercentile(field, ga.weeks, measurements[field]))
                              : null
                          }
                        />
                      ))}
                    </div>
                  </div>

                  {/* Inline EFW */}
                  <div className="rounded-lg px-4 py-3 flex items-center justify-between gap-3 bg-[#134e4a] text-white">
                    <div className="flex items-baseline gap-3 min-w-0">
                      <span className="text-[10px] uppercase tracking-wider opacity-80 font-semibold">
                        {t("dash.efw")}
                      </span>
                      <span className="text-2xl font-semibold tabular leading-none">
                        {liveEfw ? liveEfw : "—"}
                        {liveEfw && <span className="text-sm font-normal opacity-80 ml-1">g</span>}
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

                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 mb-3">{t("dash.doppler")}</h3>
                    <DopplerInput values={doppler} onChange={handleDopplerChange} />
                  </div>

                  <button
                    onClick={handleSave}
                    className="w-full h-11 rounded-lg bg-[#134e4a] text-white text-sm font-semibold hover:bg-[#0f766e] transition-colors"
                  >
                    {t("dash.saveAnalyze")}
                  </button>
                </div>

                {/* Growth Curve param tabs */}
                <div className={`${card} p-2`}>
                  <div className="flex gap-1">
                    {["BPD", "HC", "AC", "FL", "EFW"].map((p) => {
                      const active = chartParam === p;
                      return (
                        <button
                          key={p}
                          onClick={() => setChartParam(p)}
                          className={`flex-1 h-9 rounded-md text-sm font-semibold transition-colors ${
                            active
                              ? "bg-[#134e4a] text-white"
                              : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <IntergrowthChart visits={visits} parameter={chartParam} />

                {/* Visit history */}
                {visits.length > 0 && (
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
                                EFW <strong className="text-slate-800">{v.calculations?.efw ? `${v.calculations.efw} g` : "—"}</strong>
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteVisit(v.id)}
                            className="ml-2 p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title={t("dash.deleteVisit")}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
      </div>
    </div>
  );
}
