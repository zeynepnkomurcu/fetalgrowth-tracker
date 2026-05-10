import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

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

const emptyMeasurements = { AC: "", BPD: "", HC: "", FL: "", EFW: "" };
const emptyDoppler = { uaPi: "", mcaPi: "", dvPiv: "", edfState: null };

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
  const { t } = useTranslation();

  const [patients, setPatients] = useState(
    () => JSON.parse(localStorage.getItem("patients")) || []
  );

  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [measurements, setMeasurements] = useState(emptyMeasurements);
  const [doppler, setDoppler] = useState(emptyDoppler);
  const [chartParam, setChartParam] = useState("AC");

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [savedToast, setSavedToast] = useState(false);

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
    const todayKey = nowIso.slice(0, 10); // YYYY-MM-DD

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
    localStorage.setItem("patients", JSON.stringify(updatedPatients));

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
    localStorage.setItem("patients", JSON.stringify(updatedPatients));
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6 relative">

      {/* Floating language switch — top-right corner of the page */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-10">
        <LanguageSwitch />
      </div>

      <div className="max-w-7xl mx-auto space-y-4">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {t("app.title")}
            </h1>
            <p className="mt-1 text-slate-500 text-sm">
              {t("app.subtitle")}
            </p>
          </div>
          <button
            onClick={() => navigate("/new-patient")}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all"
          >
            {t("common.addPatient")}
          </button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

          {/* Patients sidebar */}
          <div className="bg-white rounded-2xl shadow-sm p-4 h-fit">
            <h2 className="text-base font-bold text-slate-800 mb-3">{t("dash.patients")}</h2>
            <div className="space-y-2">
              {patients.length === 0 && (
                <p className="text-slate-500 text-sm">{t("dash.noPatients")}</p>
              )}
              {patients.map((patient, index) => {
                const isSelected = selectedPatientId === index;
                return (
                  <button
                    key={index}
                    onClick={() => handleSelectPatient(index)}
                    className={`w-full text-left p-3 rounded-xl transition-all ${
                      isSelected
                        ? "bg-cyan-500 text-white shadow"
                        : "border border-slate-200 hover:border-cyan-400 hover:bg-cyan-50 text-slate-800"
                    }`}
                  >
                    <p className="font-semibold text-sm">
                      {patient.name} {patient.surname}
                    </p>
                    <p className={`text-xs mt-0.5 ${isSelected ? "opacity-90" : "text-slate-500"}`}>
                      {patient.protocolNumber || (patient.week != null ? `${patient.week}w ${patient.days}d` : "")}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conditional content */}
          {selectedPatient === null ? (
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-sm p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="w-14 h-14 bg-cyan-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-2xl">👶</span>
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-1">
                  {t("dash.selectPatient")}
                </h2>
                <p className="text-slate-500 max-w-md text-sm">
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
                <div className="bg-white rounded-2xl shadow-sm p-4">
                  <h2 className="text-xl font-bold text-slate-800">
                    {selectedPatient.name} {selectedPatient.surname || ""}
                  </h2>
                  <p className="text-slate-500 text-sm mt-0.5">
                    {t("dash.ga")}: {ga.weeks}w {ga.days}d
                    {selectedPatient.lmp && (
                      <span className="text-slate-400"> · {t("dash.lmp")}: {selectedPatient.lmp}</span>
                    )}
                  </p>
                </div>

                {/* Biometry + Doppler */}
                <div className="bg-white rounded-2xl shadow-sm p-5 space-y-5">
                  <div>
                    <h2 className="text-base font-bold text-slate-800 mb-3">{t("dash.biometry")}</h2>
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

                  {/* Inline EFW between Biometry and Doppler */}
                  <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-xl px-4 py-3 text-white flex items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-baseline gap-3 min-w-0">
                      <span className="text-[11px] uppercase tracking-wide opacity-80 font-semibold">
                        {t("dash.efw")}
                      </span>
                      <span className="text-2xl font-bold tabular-nums leading-none">
                        {liveEfw ? liveEfw : "—"}
                        {liveEfw && <span className="text-sm font-medium opacity-80 ml-1">g</span>}
                      </span>
                      {liveEfwBadge && (
                        <span className="bg-white/25 backdrop-blur px-2 py-0.5 rounded-md font-bold text-xs tabular-nums">
                          {liveEfwBadge.label}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-cyan-50 opacity-80 hidden sm:inline">
                      {t("dash.efwHint")}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-slate-800 mb-3">{t("dash.doppler")}</h2>
                    <DopplerInput values={doppler} onChange={handleDopplerChange} />
                  </div>

                  <div className="relative">
                    <button
                      onClick={handleSave}
                      className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 rounded-xl transition-all shadow"
                    >
                      {t("dash.saveAnalyze")}
                    </button>
                    {savedToast && (
                      <div className="absolute -top-12 left-0 right-0 bg-green-500 text-white text-sm font-semibold py-2 px-4 rounded-xl text-center shadow-lg animate-pulse">
                        {savedToast === "updated"
                          ? t("dash.visitUpdated")
                          : t("dash.visitSaved")}
                      </div>
                    )}
                  </div>
                </div>

                {/* Growth Curve param tabs + chart */}
                <div className="bg-white rounded-2xl shadow-sm p-3">
                  <div className="flex gap-2 flex-wrap">
                    {["BPD", "HC", "AC", "FL", "EFW"].map((p) => {
                      const active = chartParam === p;
                      return (
                        <button
                          key={p}
                          onClick={() => setChartParam(p)}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                            active
                              ? "bg-cyan-500 text-white shadow"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
                  <div className="bg-white rounded-2xl shadow-sm p-5">
                    <h2 className="text-base font-bold text-slate-800 mb-3">
                      {t("dash.visitHistory")} ({visits.length})
                    </h2>
                    <div className="space-y-2">
                      {[...visits].reverse().map((v) => (
                        <div
                          key={v.id}
                          className="border border-slate-200 rounded-xl p-3 flex items-start justify-between"
                        >
                          <div className="flex-1">
                            <div className="flex items-baseline gap-3">
                              <span className="font-bold text-slate-800 text-sm">
                                {v.gaWeeks}w {v.gaDays}d
                              </span>
                              <span className="text-xs text-slate-500">
                                {new Date(v.date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="grid grid-cols-4 gap-2 text-xs text-slate-600 mt-2">
                              <span>BPD: <strong>{v.rawData?.bpd ?? "-"}</strong></span>
                              <span>HC: <strong>{v.rawData?.hc ?? "-"}</strong></span>
                              <span>AC: <strong>{v.rawData?.ac ?? "-"}</strong></span>
                              <span>FL: <strong>{v.rawData?.fl ?? "-"}</strong></span>
                              <span>UA-PI: <strong>{v.rawData?.uaPi ?? "-"}</strong></span>
                              <span>MCA-PI: <strong>{v.rawData?.mcaPi ?? "-"}</strong></span>
                              <span>EDF: <strong>{v.rawData?.edfState ?? "-"}</strong></span>
                              <span className="font-semibold text-slate-800">
                                EFW: <strong>{v.calculations?.efw ? `${v.calculations.efw} g` : "-"}</strong>
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteVisit(v.id)}
                            className="ml-2 text-slate-400 hover:text-red-500 text-lg leading-none"
                            title={t("dash.deleteVisit")}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Summary */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <h2 className="text-base font-bold text-slate-800 mb-3">{t("dash.summary")}</h2>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center bg-slate-100 rounded-xl p-3">
                      <span className="text-slate-600 text-sm">{t("dash.visits")}</span>
                      <span className="font-bold text-slate-800 text-sm">{visits.length}</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-100 rounded-xl p-3">
                      <span className="text-slate-600 text-sm">{t("dash.lastGa")}</span>
                      <span className="font-bold text-slate-800 text-sm">
                        {visits.length > 0
                          ? `${visits[visits.length - 1].gaWeeks}w ${visits[visits.length - 1].gaDays}d`
                          : "-"}
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
      </div>
    </div>
  );
}
