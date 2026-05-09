import { useState } from "react";
import { useNavigate } from "react-router-dom";

import MeasurementCard from "../components/MeasurementCard";
import IntergrowthChart from "../components/IntergrowthChart";
import DopplerInput from "../components/DopplerInput";
import GuidelineModal from "../components/GuidelineModal";

const percentileTable = {
  AC:  { 28: [80, 90, 100, 110, 120],  29: [85, 95, 105, 115, 125] },
  BPD: { 28: [60, 70, 80, 90, 100],     29: [65, 75, 85, 95, 105] },
  HC:  { 28: [240, 250, 260, 270, 280], 29: [245, 255, 265, 275, 285] },
  FL:  { 28: [50, 55, 60, 65, 70],      29: [52, 57, 62, 67, 72] },
};

const emptyMeasurements = { AC: "", BPD: "", HC: "", FL: "", EFW: "" };
const emptyDoppler = { uaPi: "", mcaPi: "", dvPiv: "", edfState: null };

export default function Dashboard() {
  const navigate = useNavigate();

  const [patients] = useState(
    () => JSON.parse(localStorage.getItem("patients")) || []
  );

  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [measurements, setMeasurements] = useState(emptyMeasurements);
  const [doppler, setDoppler] = useState(emptyDoppler);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const selectedPatient =
    selectedPatientId !== null ? patients[selectedPatientId] : null;

  const visits = selectedPatient?.visits || [];
  const week = selectedPatient?.week || 28;

  const handleSelectPatient = (index) => {
    setSelectedPatientId(index);
    setMeasurements(emptyMeasurements);
    setDoppler(emptyDoppler);
  };

  const handleDopplerChange = (key, value) => {
    setDoppler((prev) => ({ ...prev, [key]: value }));
  };

  const calculatePercentile = (type, value, w) => {
    const weekTable = percentileTable[type]?.[w];
    if (!weekTable) return null;
    const [p3, p10, p50, p90, p97] = weekTable;

    if (value < p3)   return { label: "<3p", color: "text-red-500" };
    if (value < p10)  return { label: "10p", color: "text-red-500" };
    if (value < p50)  return { label: "25p", color: "text-yellow-500" };
    if (value <= p90) return { label: "50p", color: "text-green-500" };
    if (value <= p97) return { label: "90p", color: "text-orange-500" };
    return { label: ">97p", color: "text-orange-500" };
  };

  const handleSave = () => {
    const { AC, BPD, HC, FL } = measurements;
    let efw = null;
    const entered = [];
    if (AC) entered.push(Number(AC));
    if (BPD) entered.push(Number(BPD));
    if (HC) entered.push(Number(HC));
    if (FL) entered.push(Number(FL));

    if (entered.length >= 2) {
      efw = entered.reduce((a, b) => a + b, 0) / entered.length;
      setMeasurements((prev) => ({ ...prev, EFW: Math.round(efw) }));
    }

    const AC_10th = 125;
    const EFW_10th = 2000;

    if ((AC && Number(AC) < AC_10th) || (efw && efw < EFW_10th)) {
      setModalMessage(
        "ISUOG Guideline: Doppler evaluation recommended due to low AC or EFW percentile."
      );
      setModalVisible(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Fetal Growth Tracker
            </h1>
            <p className="mt-1 text-slate-500 text-sm">
              Clinical fetal growth assessment platform based on ISUOG guidelines
            </p>
          </div>
          <button
            onClick={() => navigate("/new-patient")}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all"
          >
            + Add Patient
          </button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

          {/* Patients sidebar */}
          <div className="bg-white rounded-2xl shadow-sm p-4 h-fit">
            <h2 className="text-base font-bold text-slate-800 mb-3">Patients</h2>
            <div className="space-y-2">
              {patients.length === 0 && (
                <p className="text-slate-500 text-sm">No patients yet</p>
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
                  Select a patient
                </h2>
                <p className="text-slate-500 max-w-md text-sm">
                  {patients.length === 0
                    ? "Add a new patient using the button above to start tracking fetal biometry and growth curves."
                    : "Choose a patient from the list on the left to view their biometry, growth curve and clinical summary."}
                </p>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-3 grid grid-cols-1 xl:grid-cols-3 gap-4">

              {/* Left: Biometry + Doppler + Curve */}
              <div className="xl:col-span-2 space-y-4">

                {/* Selected patient header */}
                <div className="bg-white rounded-2xl shadow-sm p-4">
                  <h2 className="text-xl font-bold text-slate-800">
                    {selectedPatient.name} {selectedPatient.surname || ""}
                  </h2>
                  {selectedPatient.week != null && (
                    <p className="text-slate-500 text-sm mt-0.5">
                      GA: {selectedPatient.week}w {selectedPatient.days || 0}d
                    </p>
                  )}
                </div>

                {/* Biometry + Doppler combined card */}
                <div className="bg-white rounded-2xl shadow-sm p-5 space-y-5">

                  {/* Biometry */}
                  <div>
                    <h2 className="text-base font-bold text-slate-800 mb-3">Biometry</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {["AC", "BPD", "HC", "FL"].map((field) => (
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
                              ? calculatePercentile(field, Number(measurements[field]), week)
                              : null
                          }
                        />
                      ))}
                    </div>
                  </div>

                  {/* Doppler */}
                  <div>
                    <h2 className="text-base font-bold text-slate-800 mb-3">Doppler</h2>
                    <DopplerInput values={doppler} onChange={handleDopplerChange} />
                  </div>

                  {/* Save */}
                  <button
                    onClick={handleSave}
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 rounded-xl transition-all shadow"
                  >
                    Save & Analyze
                  </button>
                </div>

                {/* Growth Curve */}
                <IntergrowthChart visits={visits} />
              </div>

              {/* Right: EFW + Summary */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl p-5 text-white shadow-lg">
                  <p className="text-xs opacity-80 uppercase tracking-wide">Estimated Fetal Weight</p>
                  <h2 className="text-4xl font-bold mt-2">
                    {measurements.EFW ? `${measurements.EFW} g` : "-"}
                  </h2>
                  <p className="mt-2 text-cyan-100 text-xs">Hadlock-based approximation</p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <h2 className="text-base font-bold text-slate-800 mb-3">
                    Clinical Summary
                  </h2>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center bg-slate-100 rounded-xl p-3">
                      <span className="text-slate-600 text-sm">Growth Status</span>
                      <span className="font-bold text-green-600 text-sm">Stable</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-100 rounded-xl p-3">
                      <span className="text-slate-600 text-sm">Doppler Need</span>
                      <span className="font-bold text-orange-500 text-sm">Conditional</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-100 rounded-xl p-3">
                      <span className="text-slate-600 text-sm">Guideline</span>
                      <span className="font-bold text-cyan-600 text-sm">ISUOG</span>
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
