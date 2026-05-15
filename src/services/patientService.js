import { supabase } from "../lib/supabase";

export async function getPatients() {
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Get patients error:", error);
    throw error;
  }

  return data;
}

export async function createPatient(patientData) {
  const { data, error } = await supabase
    .from("patients")
    .insert([patientData])
    .select()
    .single();

  if (error) {
    console.error("Create patient error:", error);
    throw error;
  }

  return data;
}

export async function deletePatient(patientId) {
  const { error } = await supabase
    .from("patients")
    .delete()
    .eq("id", patientId);

  if (error) {
    console.error("Delete patient error:", error);
    throw error;
  }

  return true;
}