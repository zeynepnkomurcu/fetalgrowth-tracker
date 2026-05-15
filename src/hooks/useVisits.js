import { saveVisit, deleteVisitById } from "../services/DashboardService";

export function useVisits({
  patients,
  setPatients,
  selectedPatientId,
}) {

  async function addVisit(visit) {
    if (!selectedPatientId) return;

    try {
      await saveVisit(selectedPatientId, visit);

      const updatedPatients = [...patients];

      const patientIndex = updatedPatients.findIndex(
        (p) => p.id === selectedPatientId
      );

      if (patientIndex === -1) return;

      const patient = { ...updatedPatients[patientIndex] };

      patient.visits = [...(patient.visits || []), visit];

      updatedPatients[patientIndex] = patient;

      setPatients(updatedPatients);

    } catch (error) {
      console.error("Save visit error:", error);
      throw error;
    }
  }

  async function removeVisit(visitId) {
    if (!selectedPatientId) return;

    try {
      await deleteVisitById(visitId);

      const updatedPatients = [...patients];

      const patientIndex = updatedPatients.findIndex(
        (p) => p.id === selectedPatientId
      );

      if (patientIndex === -1) return;

      const patient = { ...updatedPatients[patientIndex] };

      patient.visits = (patient.visits || []).filter(
        (v) => v.id !== visitId
      );

      updatedPatients[patientIndex] = patient;

      setPatients(updatedPatients);

    } catch (error) {
      console.error("Delete visit error:", error);
      throw error;
    }
  }

  return {
    addVisit,
    removeVisit,
  };
}