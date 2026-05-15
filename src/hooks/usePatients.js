import { useEffect, useState } from "react";
import {
  fetchPatientsWithVisits,
  deletePatientCompletely,
} from "../services/DashboardService";

export function usePatients() {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, []);

  async function loadPatients() {
    try {
      setLoading(true);

      const patientsData = await fetchPatientsWithVisits();

      setPatients(patientsData);
    } catch (error) {
      console.error("Load patients error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function removePatient(patientId) {
    try {
      await deletePatientCompletely(patientId);

      setPatients((prev) =>
        prev.filter((p) => p.id !== patientId)
      );

      if (selectedPatientId === patientId) {
        setSelectedPatientId(null);
      }

    } catch (error) {
      console.error("Delete patient error:", error);
      throw error;
    }
  }

  return {
    patients,
    setPatients,

    selectedPatientId,
    setSelectedPatientId,

    loading,

    removePatient,
    loadPatients,
  };
}