import { detectAcTrend }
  from "../clinical/trends/detectAcTrend";

import IntergrowthChart
  from "../components/IntergrowthChart";

import { useNavigate }
  from "react-router-dom";

import AcademicGrowthLayout
  from "../components/AcademicGrowthLayout";

import { detectCprTrend }
  from "../clinical/trends/detectCprTrend";

import { useParams }
  from "react-router-dom";

import { useState }
  from "react";

import { useTranslation }
  from "react-i18next";

export default function PatientDetails() {

  const navigate = useNavigate();

  const { t } = useTranslation();

  const { id } = useParams();

  const patients =
    JSON.parse(
      localStorage.getItem("patients")
    ) || [];

  const patient = patients[id];

  if (!patient) {
    return (
      <p className="text-white">
        Patient not found
      </p>
    );
  }

const [visits, setVisits] =
  useState(patient.visits || []);

  const cprTrend =
    detectCprTrend(visits);

  const acTrend =
    detectAcTrend(visits);

  const [measurements, setMeasurements] =
    useState({
      bpd: "",
      hc: "",
      ac: "",
      fl: "",
      uaPi: "",
      mcaPi: "",
    });

  const calculatePercentile = (
    type,
    value
  ) => {

    const numericValue =
      Number(value);

    if (!numericValue)
      return "-";

    if (type === "ac") {

      if (numericValue < 140)
        return "<3p";

      if (numericValue < 170)
        return "5p";

      if (numericValue < 190)
        return "10p";

      if (numericValue < 230)
        return "25p";

      if (numericValue < 270)
        return "50p";

      if (numericValue < 310)
        return "75p";

      if (numericValue < 340)
        return "90p";

      if (numericValue < 360)
        return "95p";

      return ">97p";
    }

    if (type === "bpd") {

      if (numericValue < 50)
        return "<3p";

      if (numericValue < 60)
        return "10p";

      if (numericValue < 70)
        return "25p";

      if (numericValue < 80)
        return "50p";

      if (numericValue < 90)
        return "75p";

      if (numericValue < 100)
        return "90p";

      return ">97p";
    }

    if (type === "hc") {

      if (numericValue < 180)
        return "<3p";

      if (numericValue < 220)
        return "10p";

      if (numericValue < 250)
        return "25p";

      if (numericValue < 280)
        return "50p";

      if (numericValue < 310)
        return "75p";

      if (numericValue < 340)
        return "90p";

      return ">97p";
    }

    if (type === "fl") {

      if (numericValue < 35)
        return "<3p";

      if (numericValue < 45)
        return "10p";

      if (numericValue < 55)
        return "25p";

      if (numericValue < 65)
        return "50p";

      if (numericValue < 72)
        return "75p";

      if (numericValue < 80)
        return "90p";

      return ">97p";
    }

    return "-";
  };

  const getPercentileColor = (
    percentile
  ) => {

    if (
      percentile === "5p" ||
      percentile === "<3p" ||
      percentile === "10p"
    ) {
      return "text-red-400";
    }

    if (
      percentile === "90p" ||
      percentile === "95p" ||
      percentile === ">97p"
    ) {
      return "text-orange-400";
    }

    return "text-green-400";
  };

  const calculateEfw = () => {

    const bpd =
      Number(measurements.bpd) / 10;

    const hc =
      Number(measurements.hc) / 10;

    const ac =
      Number(measurements.ac) / 10;

    const fl =
      Number(measurements.fl) / 10;

    if (
      !bpd ||
      !hc ||
      !ac ||
      !fl
    ) {
      return null;
    }

    const log10Efw =
      1.326
      - (0.00326 * ac * fl)
      + (0.0107 * hc)
      + (0.0438 * ac)
      + (0.158 * fl);

    const efw =
      Math.pow(10, log10Efw);

    return Math.round(efw);
  };

  const efw =
    calculateEfw();

  const visit = {

    id: crypto.randomUUID(),

    date: new Date().toISOString(),

    gaWeeks: patient.week,

    gaDays: patient.days,

    rawData: {
      bpd: Number(measurements.bpd),
      hc: Number(measurements.hc),
      ac: Number(measurements.ac),
      fl: Number(measurements.fl),
      uaPi: Number(measurements.uaPi),
      mcaPi: Number(measurements.mcaPi),
    },

    calculations: {
      efw,
    },
  };

  const saveVisit = () => {

    const updatedPatients =
      [...patients];

    if (
      !updatedPatients[id].visits
    ) {
      updatedPatients[id].visits = [];
    }

updatedPatients[id].visits.push(
  visit
);

setVisits([
  ...updatedPatients[id].visits
]);

    localStorage.setItem(
      "patients",
      JSON.stringify(updatedPatients)
    );

  };

  return (

    <AcademicGrowthLayout

      leftPanel={
        <div>

          <h2 className="
            text-2xl
            font-bold
            mb-6
            text-slate-800
          ">
            Patients
          </h2>

          <div className="space-y-3">

            {patients.map((p, index) => (

              <button
                key={index}

                onClick={() => {
                  navigate(`/patient/${index}`);
                }}

                className={`
                  w-full
                  text-left
                  p-4
                  rounded-2xl
                  transition-all

                  ${
                    Number(id) === index
                      ? "bg-cyan-500 text-white shadow-lg"
                      : `
                        bg-slate-100
                        hover:bg-slate-200
                        text-slate-800
                      `
                  }
                `}
              >

                <p className="
                  font-bold
                  text-lg
                ">
                  {p.name}
                </p>

                <p className="
                  text-sm
                  opacity-70
                  mt-1
                ">
                  {p.week}w {p.days}d
                </p>

              </button>

            ))}

          </div>

        </div>
      }

      topPanel={
        <div className="
          bg-white
          rounded-2xl
          p-6
          shadow-sm
        ">

          <h1 className="
            text-3xl
            font-bold
            text-slate-800
          ">
            {patient.name}
          </h1>

          <p className="
            mt-2
            text-slate-500
          ">
            GA: {patient.week}w {patient.days}d
          </p>

        </div>
      }

      chartPanel={
        <IntergrowthChart
          visits={visits}
        />
      }

      rightPanel={
        <>

          <div className="
            bg-white
            rounded-2xl
            p-6
            shadow-sm
          ">

            <h2 className="
              text-xl
              font-bold
              mb-6
              text-slate-800
            ">
              Measurements
            </h2>

            <div className="space-y-4">

              {[
                {
                  key: "ac",
                  label: "AC",
                  placeholder:
                    "Abdominal Circumference",
                },
                {
                  key: "bpd",
                  label: "BPD",
                  placeholder:
                    "Biparietal Diameter",
                },
                {
                  key: "hc",
                  label: "HC",
                  placeholder:
                    "Head Circumference",
                },
                {
                  key: "fl",
                  label: "FL",
                  placeholder:
                    "Femur Length",
                },
              ].map((field) => (

                <div key={field.key}>

                  <div className="
                    flex
                    justify-between
                    mb-2
                  ">

                    <label className="
                      font-semibold
                      text-slate-700
                    ">
                      {field.label}
                    </label>

                    <span className={`
                      text-sm
                      font-bold
                      ${
                        getPercentileColor(
                          calculatePercentile(
                            field.key,
                            measurements[field.key]
                          )
                        )
                      }
                    `}>

                      {
                        calculatePercentile(
                          field.key,
                          measurements[field.key]
                        )
                      }

                    </span>

                  </div>

                  <input
                    type="number"

                    placeholder={
                      field.placeholder
                    }

                    value={
                      measurements[field.key]
                    }

                    onChange={(e) =>
                      setMeasurements({
                        ...measurements,
                        [field.key]:
                          e.target.value,
                      })
                    }

                    className="
                      w-full
                      p-4
                      rounded-xl
                      border
                      border-slate-200
                      text-slate-900
                      placeholder:text-slate-400
                      focus:outline-none
                      focus:ring-2
                      focus:ring-cyan-400
                    "
                  />

                </div>

              ))}

              <div className="
                bg-slate-100
                rounded-xl
                p-4
              ">
                <p className="
                  text-sm
                  text-slate-500
                ">
                  Estimated Fetal Weight
                </p>

                <p className="
                  text-3xl
                  font-bold
                  text-slate-800
                  mt-2
                ">
                  {efw
                    ? `${efw} g`
                    : "-"}
                </p>
              </div>

              <input
                type="number"
                step="0.01"
                placeholder="UA PI"

                value={measurements.uaPi}

                onChange={(e) =>
                  setMeasurements({
                    ...measurements,
                    uaPi: e.target.value,
                  })
                }

                className="
                  w-full
                  p-4
                  rounded-xl
                  border
                  border-slate-200
                  text-slate-900
                  placeholder:text-slate-400
                  focus:outline-none
                  focus:ring-2
                  focus:ring-cyan-400
                "
              />

              <input
                type="number"
                step="0.01"
                placeholder="MCA PI"

                value={measurements.mcaPi}

                onChange={(e) =>
                  setMeasurements({
                    ...measurements,
                    mcaPi: e.target.value,
                  })
                }

                className="
                  w-full
                  p-4
                  rounded-xl
                  border
                  border-slate-200
                  text-slate-900
                  placeholder:text-slate-400
                  focus:outline-none
                  focus:ring-2
                  focus:ring-cyan-400
                "
              />

            </div>

          </div>

          {cprTrend && (

            <div
              className={`
                p-4
                rounded-2xl
                font-bold

                ${
                  cprTrend.worsening
                    ? `
                      bg-red-500/20
                      text-red-300
                    `
                    : `
                      bg-green-500/20
                      text-green-300
                    `
                }
              `}
            >
              {cprTrend.message}
            </div>

          )}

          {acTrend && (

            <div
              className={`
                p-4
                rounded-2xl
                font-bold

                ${
                  acTrend.worsening
                    ? `
                      bg-red-500/20
                      text-red-300
                    `
                    : `
                      bg-green-500/20
                      text-green-300
                    `
                }
              `}
            >
              {acTrend.message}
            </div>

          )}
{/* 
<ClinicalAssessmentCard
  visit={visit}
  onSave={saveVisit}
/>
*/}
<button
  onClick={saveVisit}
  className="
    w-full
    bg-cyan-500
    hover:bg-cyan-600
    text-white
    font-bold
    py-4
    rounded-2xl
    transition-all
  "
>
  Save Visit
</button>
          <div className="
            bg-white
            rounded-2xl
            p-6
            shadow-sm
          ">

            <h2 className="
              text-xl
              font-bold
              mb-4
              text-slate-800
            ">
              Visit History
            </h2>

            <div className="space-y-3">

              {visits.length === 0 && (

                <p className="text-slate-500">
                  No visits yet
                </p>

              )}

{Array.isArray(visits) &&
  [...visits]
    .reverse()
    .map((visitItem, index) => (

                  <div
                    key={index}
                    className="
                      border
                      border-slate-200
                      rounded-xl
                      p-4
                    "
                  >

                    <div className="
                      flex
                      justify-between
                      items-center
                      mb-2
                    ">

                      <p className="
                        font-bold
                        text-slate-800
                      ">
                        {visitItem.gaWeeks}w{" "}
                        {visitItem.gaDays}d
                      </p>

                      <p className="
                        text-sm
                        text-slate-500
                      ">
                        {
                          new Date(
                            visitItem.date
                          ).toLocaleDateString()
                        }
                      </p>

                    </div>

                    <div className="
                      grid
                      grid-cols-2
                      gap-2
                      text-sm
                    ">

                      <div className="text-slate-700">
                        AC:{" "}
                        <strong>
                          {visitItem.rawData?.ac || "-"}
                        </strong>
                      </div>

                      <div className="text-slate-700">
                        BPD:{" "}
                        <strong>
                          {visitItem.rawData?.bpd || "-"}
                        </strong>
                      </div>

                      <div className="text-slate-700">
                        HC:{" "}
                        <strong>
                          {visitItem.rawData?.hc || "-"}
                        </strong>
                      </div>

                      <div className="text-slate-700">
                        FL:{" "}
                        <strong>
                          {visitItem.rawData?.fl || "-"}
                        </strong>
                      </div>

                      <div className="text-slate-700">
                        UA PI:{" "}
                        <strong>
                          {visitItem.rawData?.uaPi || "-"}
                        </strong>
                      </div>

                      <div className="text-slate-700">
                        MCA PI:{" "}
                        <strong>
                          {visitItem.rawData?.mcaPi || "-"}
                        </strong>
                      </div>

                      <div className="
                        col-span-2
                        text-slate-800
                        font-semibold
                        mt-2
                      ">
                        EFW:{" "}
                        {
                     visitItem?.calculations?.efw
  ? `${visitItem.calculations.efw} g`
  : "-"
                        }
                      </div>

                    </div>

                  </div>

              ))}

            </div>

          </div>

        </>
      }

    />

  );
}
