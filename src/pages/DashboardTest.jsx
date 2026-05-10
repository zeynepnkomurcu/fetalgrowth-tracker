import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Plus,
  FlaskConical,
  Baby,
  X,
  Check,
  CalendarDays,
} from "lucide-react";

import MeasurementCard from "../components/MeasurementCard";
import IntergrowthChart from "../components/IntergrowthChart";
import DopplerInput from "../components/DopplerInput";
import GuidelineModal from "../components/GuidelineModal";
import LanguageSwitch from "../components/LanguageSwitch";
import ThemeSwitch from "../components/ThemeSwitch";
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
  const { t, i18n } = useTranslation();

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

  const [dummyOpen, setDummyOpen] = useState(false);
  const [dummyLmp, setDummyLmp] = useState("");

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
    localStorage.setItem("patients", JSON.stringify(updated));
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
    <div className="min-h-screen bg-[--color-bg] text-[--color-text] p-4 md:p-6 relative">

      {/* Floating top-right controls */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-10 flex items-center gap-2">
        <ThemeSwitch />
        <LanguageSwitch />
      </div>

      <div className="max-w-7xl mx-auto space-y-4">

        {/* Header */}
        <header className="bg-[--color-surface] border border-[--color-border] rounded-2xl px-6 py-5 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {t("app.title")}
            </h1>
            <p className="mt-1 text-sm text-[--color-text-muted]">
              {t("app.subtitle")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDummyOpen(true)}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-[--color-border] bg-[--color-surface] text-[--color-text-muted] hover:text-[--color-text] hover:bg-[--color-surface-muted] text-sm font-medium transition-colors"
            >
              <FlaskConical className="w-4 h-4" />
              {t("common.addDummy")}
            </button>
            <button
              onClick={() => navigate("/new-patient")}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[--color-text] text-[--color-surface] hover:opacity-90 text-sm font-semibold transition-opacity"
            >
              <Plus className="w-4 h-4" />
              {t("common.addPatient")}
            </button>
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

          {/* Patients sidebar */}
          <aside className="bg-[--color-surface] border border-[--color-border] rounded-2xl p-4 h-fit">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[--color-text-subtle] mb-3 px-1">
              {t("dash.patients")}
            </h2>
            <div className="space-y-1">
              {patients.length === 0 && (
                <p className="text-sm text-[--color-text-subtle] px-1">{t("dash.noPatients")}</p>
              )}
              {patients.map((patient, index) => {
                const isSelected = selectedPatientId === index;
                return (
                  <button
                    key={index}
                    onClick={() => handleSelectPatient(index)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                      isSelected
                        ? "bg-[--color-text] text-[--color-surface]"
                        : "hover:bg-[--color-surface-muted] text-[--color-text]"
                    }`}
                  >
                    <p className="font-medium text-sm">
                      {patient.name} {patient.surname}
                    </p>
                    <p className={`text-xs mt-0.5 tabular ${isSelected ? "opacity-70" : "text-[--color-text-subtle]"}`}>
                      {patient.protocolNumber || (patient.week != null ? `${patient.week}w ${patient.days}d` : "")}
                    </p>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Conditional content */}
          {selectedPatient === null ? (
            <div className="lg:col-span-3">
              <div className="bg-[--color-surface] border border-[--color-border] rounded-2xl p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="w-12 h-12 rounded-full bg-[--color-surface-muted] flex items-center justify-center mb-4">
                  <Baby className="w-6 h-6 text-[--color-text-muted]" />
                </div>
                <h2 className="text-lg font-semibold mb-1">
                  {t("dash.selectPatient")}
                </h2>
                <p className="text-sm text-[--color-text-muted] max-w-md">
                  {patients.length === 0
                    ? t("dash.selectPatientHintEmpty")
                    : t("dash.selectPatientHint")}
                </p>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-3 grid grid-cols-1 xl:grid-cols-3 gap-4">

              {/* Left column: Biometry + Doppler + Curve + Visits */}
              <div className="xl:col-span-2 space-y-4">

                {/* Patient header */}
                <div className="bg-[--color-surface] border border-[--color-border] rounded-2xl px-5 py-4">
                  <h2 className="text-xl font-semibold tracking-tight">
                    {selectedPatient.name} {selectedPatient.surname || ""}
                  </h2>
                  <p className="text-sm text-[--color-text-muted] mt-1 flex items-center gap-2 flex-wrap">
                    <span className="tabular">{t("dash.ga")}: {ga.weeks}w {ga.days}d</span>
                    {selectedPatient.lmp && (
                      <>
                        <span className="text-[--color-text-subtle]">·</span>
                        <span className="inline-flex items-center gap-1 text-[--color-text-subtle]">
                          <CalendarDays className="w-3.5 h-3.5" />
                          {t("dash.lmp")} {formatLongDate(selectedPatient.lmp, i18n.language)}
                        </span>
                      </>
                    )}
                  </p>
                </div>

                {/* Biometry + Doppler card */}
                <div className="bg-[--color-surface] border border-[--color-border] rounded-2xl p-5 space-y-5">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[--color-text-subtle] mb-3">
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
                              ? percentileBadge(getPercentile(field, ga.weeks, measurements[field]))
                              : null
                          }
                        />
                      ))}
                    </div>
                  </div>

                  {/* Inline EFW between Biometry and Doppler */}
                  <div className="rounded-xl px-4 py-3 flex items-center justify-between gap-3 bg-brand-500 text-white">
                    <div className="flex items-baseline gap-3 min-w-0">
                      <span className="text-[10px] uppercase tracking-wider opacity-75 font-semibold">
                        {t("dash.efw")}
                      </span>
                      <span className="text-2xl font-semibold tabular leading-none">
                        {liveEfw ? liveEfw : "—"}
                        {liveEfw && <span className="text-sm font-normal opacity-75 ml-1">g</span>}
                      </span>
                      {liveEfwBadge && (
                        <span className="bg-white/20 backdrop-blur px-2 py-0.5 rounded font-semibold text-xs tabular">
                          {liveEfwBadge.label}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] opacity-75 hidden sm:inline tracking-wide">
                      {t("dash.efwHint")}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[--color-text-subtle] mb-3">
                      {t("dash.doppler")}
                    </h3>
                    <DopplerInput values={doppler} onChange={handleDopplerChange} />
                  </div>

                  <button
                    onClick={handleSave}
                    className="w-full h-11 rounded-xl bg-[--color-text] text-[--color-surface] font-semibold text-sm hover:opacity-90 transition-opacity"
                  >
                    {t("dash.saveAnalyze")}
                  </button>
                </div>

                {/* Growth Curve param tabs */}
                <div className="bg-[--color-surface] border border-[--color-border] rounded-2xl p-2">
                  <div className="flex gap-1">
                    {["BPD", "HC", "AC", "FL", "EFW"].map((p) => {
                      const active = chartParam === p;
                      return (
                        <button
                          key={p}
                          onClick={() => setChartParam(p)}
                          className={`flex-1 h-9 rounded-lg text-sm font-semibold transition-colors ${
                            active
                              ? "bg-[--color-text] text-[--color-surface]"
                              : "text-[--color-text-muted] hover:bg-[--color-surface-muted]"
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
                  <div className="bg-[--color-surface] border border-[--color-border] rounded-2xl p-5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[--color-text-subtle] mb-3">
                      {t("dash.visitHistory")} · {visits.length}
                    </h3>
                    <div className="space-y-2">
                      {[...visits].reverse().map((v) => (
                        <div
                          key={v.id}
                          className="border border-[--color-border] rounded-xl px-4 py-3 flex items-start justify-between hover:bg-[--color-surface-muted] transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-3">
                              <span className="font-semibold text-sm tabular">
                                {v.gaWeeks}w {v.gaDays}d
                              </span>
                              <span className="text-xs text-[--color-text-subtle]">
                                {formatLongDate(v.date, i18n.language)}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-xs text-[--color-text-muted] mt-2 tabular">
                              <span>BPD <strong className="text-[--color-text]">{v.rawData?.bpd ?? "—"}</strong></span>
                              <span>HC <strong className="text-[--color-text]">{v.rawData?.hc ?? "—"}</strong></span>
                              <span>AC <strong className="text-[--color-text]">{v.rawData?.ac ?? "—"}</strong></span>
                              <span>FL <strong className="text-[--color-text]">{v.rawData?.fl ?? "—"}</strong></span>
                              <span>UA-PI <strong className="text-[--color-text]">{v.rawData?.uaPi ?? "—"}</strong></span>
                              <span>MCA-PI <strong className="text-[--color-text]">{v.rawData?.mcaPi ?? "—"}</strong></span>
                              <span>UA S/D <strong className="text-[--color-text]">{v.rawData?.sd ?? "—"}</strong></span>
                              <span>EDF <strong className="text-[--color-text]">{v.rawData?.edfState ?? "—"}</strong></span>
                              <span className="col-span-2 sm:col-span-4">
                                EFW <strong className="text-[--color-text]">{v.calculations?.efw ? `${v.calculations.efw} g` : "—"}</strong>
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteVisit(v.id)}
                            className="ml-2 p-1.5 rounded-md text-[--color-text-subtle] hover:text-[--color-pct-warn] hover:bg-[--color-surface] transition-colors"
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

              {/* Right column: Summary */}
              <aside className="space-y-4">
                <div className="bg-[--color-surface] border border-[--color-border] rounded-2xl p-5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[--color-text-subtle] mb-3">
                    {t("dash.summary")}
                  </h3>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center py-2 border-b border-[--color-border]">
                      <span className="text-sm text-[--color-text-muted]">{t("dash.visits")}</span>
                      <span className="font-semibold text-sm tabular">{visits.length}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-[--color-text-muted]">{t("dash.lastGa")}</span>
                      <span className="font-semibold text-sm tabular">
                        {visits.length > 0
                          ? `${visits[visits.length - 1].gaWeeks}w ${visits[visits.length - 1].gaDays}d`
                          : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>

        <GuidelineModal
          visible={modalVisible}
          message={modalMessage}
          onClose={() => setModalVisible(false)}
        />

        {/* Save toast — bottom-right floating */}
        {savedToast && (
          <div className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 bg-[--color-text] text-[--color-surface] px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium toast-in">
            <Check className="w-4 h-4 text-brand-400" />
            {savedToast === "updated"
              ? t("dash.visitUpdated")
              : t("dash.visitSaved")}
          </div>
        )}

        {/* Dummy patient modal */}
        {dummyOpen && (
          <div
            onClick={() => setDummyOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-[--color-surface] border border-[--color-border] rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4"
            >
              <div>
                <h3 className="text-lg font-semibold tracking-tight">{t("dummy.title")}</h3>
                <p className="text-sm text-[--color-text-muted] mt-1">{t("dummy.subtitle")}</p>
              </div>

              <div>
                <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-[--color-text-subtle]">
                  {t("newPatient.lmpLabel")}
                </label>
                <input
                  type="date"
                  autoFocus
                  value={dummyLmp}
                  onChange={(e) => setDummyLmp(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-[--color-border-strong] bg-[--color-surface] text-[--color-text] focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setDummyOpen(false)}
                  className="flex-1 h-10 rounded-lg border border-[--color-border] text-[--color-text-muted] hover:bg-[--color-surface-muted] font-medium text-sm transition-colors"
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={handleCreateDummy}
                  disabled={!dummyLmp}
                  className="flex-1 h-10 rounded-lg bg-[--color-text] text-[--color-surface] disabled:bg-[--color-border-strong] disabled:cursor-not-allowed font-semibold text-sm hover:opacity-90 transition-opacity"
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
