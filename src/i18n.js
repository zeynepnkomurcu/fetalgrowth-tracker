import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const en = {
  // App shell
  "app.title": "Fetal Growth Tracker",
  "app.subtitle": "Clinical fetal growth assessment platform based on ISUOG guidelines",

  // Common
  "common.addPatient": "+ Add Patient",
  "common.savePatient": "Save Patient",
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.delete": "Delete",
  "common.ok": "OK",
  "common.back": "Back",

  // Dashboard
  "dash.patients": "Patients",
  "dash.noPatients": "No patients yet",
  "dash.selectPatient": "Select a patient",
  "dash.selectPatientHintEmpty": "Add a new patient using the button above to start tracking fetal biometry and growth curves.",
  "dash.selectPatientHint": "Choose a patient from the list on the left to view their biometry, growth curve and clinical summary.",
  "dash.biometry": "Biometry",
  "dash.doppler": "Doppler",
  "dash.saveAnalyze": "Save & Analyze",
  "dash.visitSaved": "✓ Visit saved — added to growth curve",
  "dash.visitUpdated": "✓ Today's visit updated — same-day overwrite",
  "dash.visitHistory": "Visit History",
  "dash.deleteVisit": "Delete visit",
  "dash.efw": "Estimated Fetal Weight",
  "dash.efwHint": "Hadlock IV — needs AC/BPD/HC/FL",
  "dash.summary": "Clinical Summary",
  "dash.visits": "Visits",
  "dash.lastGa": "Last GA",
  "dash.ga": "GA",
  "dash.lmp": "LMP",

  // Modal
  "modal.title": "Clinical alert",
  "modal.fillFields": "Please enter at least one measurement before saving.",
  "modal.isuogAlert": "ISUOG Guideline: Doppler evaluation recommended due to low AC or EFW percentile.",

  // Doppler
  "doppler.edf": "End-Diastolic Flow",
  "doppler.normal": "Normal",
  "doppler.aedf": "AEDF",
  "doppler.redf": "REDF",

  // Chart
  "chart.title": "{{param}} Growth Curve",
  "chart.patient": "Patient",
  "chart.AC": "Abdominal Circumference",
  "chart.BPD": "Biparietal Diameter",
  "chart.HC": "Head Circumference",
  "chart.FL": "Femur Length",
  "chart.EFW": "Estimated Fetal Weight",

  // NewPatient
  "newPatient.title": "New Patient",
  "newPatient.subtitle": "ISUOG-based fetal growth follow-up registration",
  "newPatient.namePh": "Patient Name",
  "newPatient.surnamePh": "Patient Surname",
  "newPatient.tcPh": "Turkish ID Number",
  "newPatient.lmpLabel": "Last Menstrual Period (LMP)",
  "newPatient.fillAll": "Please fill all required fields",
  "newPatient.tcLength": "Turkish ID number must be 11 digits",
};

const tr = {
  // App shell
  "app.title": "Fetal Büyüme Takibi",
  "app.subtitle": "ISUOG kılavuzlarına dayalı klinik fetal büyüme değerlendirme platformu",

  // Common
  "common.addPatient": "+ Hasta Ekle",
  "common.savePatient": "Hastayı Kaydet",
  "common.save": "Kaydet",
  "common.cancel": "İptal",
  "common.delete": "Sil",
  "common.ok": "Tamam",
  "common.back": "Geri",

  // Dashboard
  "dash.patients": "Hastalar",
  "dash.noPatients": "Henüz hasta yok",
  "dash.selectPatient": "Bir hasta seçin",
  "dash.selectPatientHintEmpty": "Fetal biyometri ve büyüme eğrilerini izlemeye başlamak için yukarıdaki düğmeyi kullanarak yeni bir hasta ekleyin.",
  "dash.selectPatientHint": "Biyometri, büyüme eğrisi ve klinik özeti görmek için soldaki listeden bir hasta seçin.",
  "dash.biometry": "Biyometri",
  "dash.doppler": "Doppler",
  "dash.saveAnalyze": "Kaydet ve Analiz Et",
  "dash.visitSaved": "✓ Ziyaret kaydedildi — büyüme eğrisine eklendi",
  "dash.visitUpdated": "✓ Bugünkü ziyaret güncellendi — aynı gün üzerine yazıldı",
  "dash.visitHistory": "Ziyaret Geçmişi",
  "dash.deleteVisit": "Ziyareti sil",
  "dash.efw": "Tahmini Fetal Ağırlık",
  "dash.efwHint": "Hadlock IV — AC/BPD/HC/FL gerekir",
  "dash.summary": "Klinik Özet",
  "dash.visits": "Ziyaretler",
  "dash.lastGa": "Son GH",
  "dash.ga": "GH",
  "dash.lmp": "SAT",

  // Modal
  "modal.title": "Klinik uyarı",
  "modal.fillFields": "Kaydetmeden önce en az bir ölçüm girin.",
  "modal.isuogAlert": "ISUOG Kılavuzu: Düşük AC veya EFW persentili nedeniyle Doppler değerlendirmesi önerilir.",

  // Doppler
  "doppler.edf": "Diyastol Sonu Akım",
  "doppler.normal": "Normal",
  "doppler.aedf": "AEDF",
  "doppler.redf": "REDF",

  // Chart
  "chart.title": "{{param}} Büyüme Eğrisi",
  "chart.patient": "Hasta",
  "chart.AC": "Karın Çevresi",
  "chart.BPD": "Biparietal Çap",
  "chart.HC": "Baş Çevresi",
  "chart.FL": "Femur Uzunluğu",
  "chart.EFW": "Tahmini Fetal Ağırlık",

  // NewPatient
  "newPatient.title": "Yeni Hasta",
  "newPatient.subtitle": "ISUOG temelli fetal büyüme takibi kaydı",
  "newPatient.namePh": "Hasta Adı",
  "newPatient.surnamePh": "Hasta Soyadı",
  "newPatient.tcPh": "T.C. Kimlik Numarası",
  "newPatient.lmpLabel": "Son Adet Tarihi (SAT)",
  "newPatient.fillAll": "Lütfen tüm zorunlu alanları doldurun",
  "newPatient.tcLength": "T.C. Kimlik numarası 11 haneli olmalıdır",
};

const savedLng =
  (typeof window !== "undefined" && localStorage.getItem("lang")) || "en";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    tr: { translation: tr },
  },
  lng: savedLng,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
