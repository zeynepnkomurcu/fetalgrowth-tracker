import { useState } from "react";
import { useTranslation }
  from "react-i18next";
export default function AddPatientForm({ addPatient }) {
const { t } = useTranslation();
  const [name, setName] = useState("");
const [lmp, setLmp] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();

if (!name || !lmp) return;

addPatient(name, lmp);

    setName("");
    setLmp("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-2 mb-6"
    >
      <input
        type="text"
        placeholder="Patient name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 rounded w-full"
      />
      <input
  type="date"
  value={lmp}
  onChange={(e) => setLmp(e.target.value)}
  className="border p-2 rounded"
 />

      <button
        type="submit"
        className="bg-blue-500 text-white px-4 rounded"
      >
{t("add")}
      </button>
    </form>
  );
}