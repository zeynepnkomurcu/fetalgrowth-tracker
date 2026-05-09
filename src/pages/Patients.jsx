import { useState, useEffect } from "react";
import PatientCard from "../components/PatientCard";
import { useTranslation }
  from "react-i18next";
import AddPatientForm from "../components/AddPatientForm";
export default function Patients() {
const { t } = useTranslation();
const [patients, setPatients] = useState(() => {

  const savedPatients =
    localStorage.getItem("patients");

  return savedPatients
    ? JSON.parse(savedPatients)
    : [];

});

const addPatient = (name, lmp) => {
const today = new Date();
const lmpDate = new Date(lmp);

const diffTime = today - lmpDate;

const diffDays = Math.floor(
  diffTime / (1000 * 60 * 60 * 24)
);

const calculatedWeek = Math.floor(
  diffDays / 7
);
const calculatedDays = diffDays % 7;

const eddDate = new Date(lmpDate);

eddDate.setDate(
  eddDate.getDate() + 280
);

const newPatient = {
  name: name,
  lmp: lmpDate.toLocaleDateString("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric",
}),
  week: calculatedWeek,
  days: calculatedDays,
  edd: eddDate.toLocaleDateString("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric",
}),
};

  setPatients([...patients, newPatient]);
};

const deletePatient = (indexToDelete) => {
  const updatedPatients = patients.filter(
    (_, index) => index !== indexToDelete
  );

  setPatients(updatedPatients);
};
useEffect(() => {

  localStorage.setItem(
    "patients",
    JSON.stringify(patients)
  );

}, [patients]);
const changeWeek = (indexToUpdate, amount) => {

  const updatedPatients = [...patients];

  updatedPatients[indexToUpdate].week += amount;

  setPatients(updatedPatients);
};
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
{t("patients")}
      </h1>

      <AddPatientForm addPatient={addPatient} />

      <div className="space-y-4 mt-6">
        {patients.map((patient, index) => (
<PatientCard
  key={index}
  id={index}
  name={patient.name}
  week={patient.week}
  days={patient.days}
  edd={patient.edd}
risk={patient.week > 30 ? "High" : "Low"}
  onDelete={() => deletePatient(index)}
  onIncrease={() => changeWeek(index, 1)}
  onDecrease={() => changeWeek(index, -1)}
/>
        ))}
      </div>
    </div>
  );
}