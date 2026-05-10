import { useState } from "react";

import { useNavigate }
  from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitch from "../components/LanguageSwitch";

export default function NewPatient() {

  const navigate =
    useNavigate();
  const { t } = useTranslation();

  const [form, setForm] =
    useState({
      name: "",
      surname: "",
      tc: "",
      lmp: "",
    });

  const generateProtocolNumber = (
    name,
    surname
  ) => {

    const patients =
      JSON.parse(
        localStorage.getItem(
          "patients"
        )
      ) || [];

    const nextNumber =
      patients.length + 1;

    const initials =
      `${name[0] || ""}${
        surname[0] || ""
      }`.toUpperCase();

    return `${initials}-${String(
      nextNumber
    ).padStart(4, "0")}`;
  };

  const generateResearchId = () => {

    const patients =
      JSON.parse(
        localStorage.getItem(
          "patients"
        )
      ) || [];

    const nextNumber =
      patients.length + 1;

    return `FGR-${String(
      nextNumber
    ).padStart(4, "0")}`;
  };

  const handleSave = () => {

    if (
      !form.name ||
      !form.surname ||
      !form.tc ||
      !form.lmp
    ) {

      alert(t("newPatient.fillAll"));

      return;
    }

    if (form.tc.length !== 11) {

      alert(t("newPatient.tcLength"));

      return;
    }

    const patients =
      JSON.parse(
        localStorage.getItem(
          "patients"
        )
      ) || [];

    const newPatient = {

      id:
        crypto.randomUUID(),

      protocolNumber:
        generateProtocolNumber(
          form.name,
          form.surname
        ),

      researchId:
        generateResearchId(),

      name:
        form.name,

      surname:
        form.surname,

      tc:
        form.tc,

      lmp:
        form.lmp,

      createdAt:
        new Date().toISOString(),

      visits: [],
    };

    patients.push(newPatient);

    localStorage.setItem(
      "patients",
      JSON.stringify(patients)
    );

    navigate("/");
  };

  return (

    <div className="min-h-screen bg-slate-100 p-6 relative">

      <div className="absolute top-6 right-6">
        <LanguageSwitch />
      </div>

      <div className="flex items-center justify-center min-h-[calc(100vh-3rem)]">
        <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl p-8 space-y-5">

        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            {t("newPatient.title")}
          </h1>
          <p className="text-slate-500 mt-2">
            {t("newPatient.subtitle")}
          </p>
        </div>

        <div className="
          grid
          grid-cols-1
          md:grid-cols-2
          gap-4
        ">

          <input
            type="text"
            placeholder={t("newPatient.namePh")}

            value={form.name}

            onChange={(e) =>
              setForm({
                ...form,
                name:
                  e.target.value,
              })
            }

            className="
              w-full
              p-4
              rounded-2xl
              border
              border-slate-300
              text-slate-900
              placeholder:text-slate-400
              focus:outline-none
              focus:ring-2
              focus:ring-cyan-400
            "
          />

          <input
            type="text"
            placeholder={t("newPatient.surnamePh")}

            value={form.surname}

            onChange={(e) =>
              setForm({
                ...form,
                surname:
                  e.target.value,
              })
            }

            className="
              w-full
              p-4
              rounded-2xl
              border
              border-slate-300
              text-slate-900
              placeholder:text-slate-400
              focus:outline-none
              focus:ring-2
              focus:ring-cyan-400
            "
          />

        </div>

        <input
          type="text"

          inputMode="numeric"

          maxLength={11}

          placeholder={t("newPatient.tcPh")}

          value={form.tc}

          onChange={(e) =>
            setForm({
              ...form,
              tc:
                e.target.value
                  .replace(/\D/g, ""),
            })
          }

          className="
            w-full
            p-4
            rounded-2xl
            border
            border-slate-300
            text-slate-900
            placeholder:text-slate-400
            focus:outline-none
            focus:ring-2
            focus:ring-cyan-400
          "
        />

        <div>

          <label className="
            block
            mb-2
            text-sm
            font-semibold
            text-slate-700
          ">
            {t("newPatient.lmpLabel")}
          </label>

          <input
            type="date"

            value={form.lmp}

            onChange={(e) =>
              setForm({
                ...form,
                lmp:
                  e.target.value,
              })
            }

            className="
              w-full
              p-4
              rounded-2xl
              border
              border-slate-300
              text-slate-900
              focus:outline-none
              focus:ring-2
              focus:ring-cyan-400
            "
          />

        </div>

        <button
          onClick={handleSave}

          className="
            w-full
            bg-cyan-500
            hover:bg-cyan-600
            text-white
            font-bold
            py-4
            rounded-2xl
            transition-all
            shadow-lg
          "
        >
          {t("common.savePatient")}
        </button>

        </div>
      </div>

    </div>

  );
}