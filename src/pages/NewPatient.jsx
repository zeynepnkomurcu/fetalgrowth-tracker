import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";

import { supabase } from "../lib/supabase";

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
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name || !form.surname || !form.tc || !form.lmp) {
      alert(t("newPatient.fillAll"));
      return;
    }
    if (form.tc.length !== 11) {
      alert(t("newPatient.tcLength"));
      return;
    }

    setSaving(true);

    const { count: existingCount, error: countError } = await supabase
      .from("patients")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("SUPABASE COUNT ERROR:", countError);
      alert(countError.message);
      setSaving(false);
      return;
    }

    const nextSeq = (existingCount || 0) + 1;
    const initials = `${form.name[0] || ""}${form.surname[0] || ""}`.toUpperCase();
    const protocolNumber = `${initials}-${String(nextSeq).padStart(4, "0")}`;
    const researchId = `RID-${Date.now().toString().slice(-6)}`;

    const { error } = await supabase.from("patients").insert([
      {
        id: crypto.randomUUID(),
        name: form.name,
        surname: form.surname,
        tc: form.tc,
        lmp: form.lmp,
        protocol_number: protocolNumber,
        research_id: researchId,
      },
    ]);

    if (error) {
      console.error("SUPABASE ERROR:", error);
      alert(error.message);
      setSaving(false);
      return;
    }

    navigate("/");
  };

  const inputClass =
    "w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#134e4a] focus:border-transparent transition-all";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-6 relative">

      {/* Floating language switch — top-right corner of the page on all sizes */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20">
        <LanguageSwitch />
      </div>

      <div className="max-w-xl mx-auto pt-12 md:pt-0">

        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("common.back")}
        </button>

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
            disabled={saving}
            className="w-full h-11 rounded-lg bg-[#134e4a] text-white text-sm font-semibold hover:bg-[#0f766e] disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors mt-2"
          >
            {saving ? "…" : t("common.savePatient")}
          </button>
        </div>
      </div>
    </div>
  );
}
