import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";

import LanguageSwitch from "../components/LanguageSwitch";

export default function NewPatient() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [form, setForm] = useState({
    name: "",
    surname: "",
    tc: "",
    lmp: "",
  });

  const generateProtocolNumber = (name, surname) => {
    const patients = JSON.parse(localStorage.getItem("patients")) || [];
    const nextNumber = patients.length + 1;
    const initials = `${name[0] || ""}${surname[0] || ""}`.toUpperCase();
    return `${initials}-${String(nextNumber).padStart(4, "0")}`;
  };

  const generateResearchId = () => {
    const patients = JSON.parse(localStorage.getItem("patients")) || [];
    const nextNumber = patients.length + 1;
    return `FGR-${String(nextNumber).padStart(4, "0")}`;
  };

  const handleSave = () => {
    if (!form.name || !form.surname || !form.tc || !form.lmp) {
      alert(t("newPatient.fillAll"));
      return;
    }
    if (form.tc.length !== 11) {
      alert(t("newPatient.tcLength"));
      return;
    }

    const patients = JSON.parse(localStorage.getItem("patients")) || [];
    const newPatient = {
      id: crypto.randomUUID(),
      protocolNumber: generateProtocolNumber(form.name, form.surname),
      researchId: generateResearchId(),
      name: form.name,
      surname: form.surname,
      tc: form.tc,
      lmp: form.lmp,
      createdAt: new Date().toISOString(),
      visits: [],
    };
    patients.push(newPatient);
    localStorage.setItem("patients", JSON.stringify(patients));
    navigate("/");
  };

  const inputClass =
    "w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#134e4a] focus:border-transparent transition-all";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-6">

      <div className="max-w-xl mx-auto">

        {/* Top toolbar: back + language switch */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("common.back")}
          </button>
          <LanguageSwitch />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 space-y-5">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">
              {t("newPatient.title")}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {t("newPatient.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder={t("newPatient.namePh")}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
            />
            <input
              type="text"
              placeholder={t("newPatient.surnamePh")}
              value={form.surname}
              onChange={(e) => setForm({ ...form, surname: e.target.value })}
              className={inputClass}
            />
          </div>

          <input
            type="text"
            inputMode="numeric"
            maxLength={11}
            placeholder={t("newPatient.tcPh")}
            value={form.tc}
            onChange={(e) =>
              setForm({ ...form, tc: e.target.value.replace(/\D/g, "") })
            }
            className={`${inputClass} tabular`}
          />

          <div>
            <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {t("newPatient.lmpLabel")}
            </label>
            <input
              type="date"
              value={form.lmp}
              onChange={(e) => setForm({ ...form, lmp: e.target.value })}
              className={inputClass}
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full h-11 rounded-lg bg-[#134e4a] text-white text-sm font-semibold hover:bg-[#0f766e] transition-colors mt-2"
          >
            {t("common.savePatient")}
          </button>
        </div>
      </div>
    </div>
  );
}
