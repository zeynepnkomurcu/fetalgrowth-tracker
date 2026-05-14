import { supabase } from "../lib/supabase";

export async function fetchPatientsWithVisits() {
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const formattedPatients = [];

  for (const p of data) {
    const { data: visitsData, error: visitsError } = await supabase
      .from("visits")
      .select("*")
      .eq("patient_id", p.id)
      .order("created_at", { ascending: true });

    if (visitsError) {
      throw visitsError;
    }

    formattedPatients.push({
      ...p,
      protocolNumber: p.protocol_number,
      researchId: p.research_id,
      createdAt: p.created_at,

      visits: (visitsData || []).map((v) => ({
        id: v.id,
        date: v.created_at,
        gaWeeks: v.ga_weeks,
        gaDays: v.ga_days,
        rawData: v.raw_data,
        calculations: v.calculations,
      })),
    });
  }

  return formattedPatients;
}

export async function saveVisit(patientId, visit) {
  const { error } = await supabase
    .from("visits")
    .insert([
      {
        id: visit.id,
        patient_id: patientId,
        ga_weeks: visit.gaWeeks,
        ga_days: visit.gaDays,
        raw_data: visit.rawData,
        calculations: visit.calculations,
      },
    ]);

  if (error) {
    throw error;
  }
}

export async function deleteVisitById(visitId) {
  const { error } = await supabase
    .from("visits")
    .delete()
    .eq("id", visitId);

  if (error) {
    throw error;
  }
}

export async function deletePatientCompletely(patientId, userId) {
  // delete visits
  const { error: visitsError } = await supabase
    .from("visits")
    .delete()
    .eq("patient_id", patientId);

  if (visitsError) {
    throw visitsError;
  }

  // delete relation
  const { error: relationError } = await supabase
    .from("user_patients")
    .delete()
    .eq("patient_id", patientId);

  if (relationError) {
    throw relationError;
  }

  // delete patient
  const { error: patientError } = await supabase
    .from("patients")
    .delete()
    .eq("id", patientId);

  if (patientError) {
    throw patientError;
  }
}