import React, { useState } from "react";
import MeasurementCard from "../components/MeasurementCard";
import { useNavigate } from "react-router-dom";
import DopplerInput from "../components/DopplerInput";
import GuidelineModal from "../components/GuidelineModal";

const percentileTable = {
  AC: { 28: [80, 90, 100, 110, 120], 29: [85, 95, 105, 115, 125] },
  BPD: { 28: [60, 70, 80, 90, 100], 29: [65, 75, 85, 95, 105] },
  HC: { 28: [240, 250, 260, 270, 280], 29: [245, 255, 265, 275, 285] },
  FL: { 28: [50, 55, 60, 65, 70], 29: [52, 57, 62, 67, 72] },
};

export default function Dashboard() {
  const navigate = useNavigate();

  const [measurements, setMeasurements] = useState({
    AC: "",
    BPD: "",
    HC: "",
    FL: "",
    EFW: "",
  });

  const [showDoppler, setShowDoppler] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const patients = JSON.parse(localStorage.getItem("patients")) || [];

  const calculatePercentile = (type, value, week) => {
    const weekTable = percentileTable[type]?.[week];
    if (!weekTable) return null;
    const [p3, p10, p50, p90, p97] = weekTable;

    if (value < p3) return { label: "<3p", color: "text-red-500" };
    if (value < p10) return { label: "10p", color: "text-red-500" };
    if (value < p50) return { label: "25p", color: "text-yellow-500" };
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
      setShowDoppler(true);
    }
  };

  const week = patients[0]?.week || 28;

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-sm p-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Fetal Growth Tracker
            </h1>
            <p className="mt-2 text-slate-500 text-sm">
              Clinical fetal growth assessment platform based on ISUOG guidelines
            </p>
          </div>
          <button
            onClick={() => navigate("/new-patient")}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-5 py-3 rounded-2xl font-bold transition-all"
          >
            + Add Patient
          </button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="bg-white rounded-3xl shadow-sm p-5 h-fit">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Patients</h2>
            <div className="space-y-3">
              {patients.length === 0 && (
                <p className="text-slate-500 text-sm">No patients yet</p>
              )}
              {patients.map((patient, index) => (
                <button
                  key={index}
                  onClick={() => navigate(`/patient/${index}`)}
                  className="w-full text-left p-4 rounded-2xl border border-slate-200 hover:border-cyan-400 hover:bg-cyan-50 transition-all"
                >
                  <p className="font-bold text-slate-800">
                    {patient.name} {patient.surname}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">{patient.protocolNumber}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left side */}
            <div className="xl:col-span-2 space-y-6">
              {/* Measurements */}
              <div className="bg-white rounded-3xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Biometry</h2>
                    <p className="text-slate-500 mt-1">Enter fetal measurements</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                <button
                  onClick={handleSave}
                  className="mt-6 w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg"
                >
                  Save & Analyze
                </button>
              </div>

              {/* Doppler */}
              {showDoppler && (
                <div className="bg-white rounded-3xl shadow-sm p-6">
                  <h2 className="text-2xl font-bold text-slate-800 mb-4">Doppler Assessment</h2>
                  <DopplerInput visible={showDoppler} />
                </div>
              )}
            </div>

            {/* Right side */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-3xl p-6 text-white shadow-lg">
                <p className="text-sm opacity-80">ESTIMATED FETAL WEIGHT</p>
                <h2 className="text-5xl font-bold mt-3">
                  {measurements.EFW ? `${measurements.EFW} g` : "-"}
                </h2>
                <p className="mt-3 text-cyan-100">Hadlock-based approximation</p>
              </div>
              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-800 mb-5">Clinical Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-slate-100 rounded-2xl p-4">
                    <span className="text-slate-600">Growth Status</span>
                    <span className="font-bold text-green-600">Stable</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-100 rounded-2xl p-4">
                    <span className="text-slate-600">Doppler Need</span>
                    <span className="font-bold text-orange-500">Conditional</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-100 rounded-2xl p-4">
                    <span className="text-slate-600">Guideline</span>
                    <span className="font-bold text-cyan-600">ISUOG</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
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