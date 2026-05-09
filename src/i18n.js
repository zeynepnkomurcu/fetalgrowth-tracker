import i18n from "i18next";

import { initReactI18next }
  from "react-i18next";

i18n.use(initReactI18next).init({

  resources: {

    en: {
      translation: {
        patients: "Patients",
        add: "Add",
        delete: "Delete",
        gestationalAge: "Gestational Age",
        edd: "EDD",
        lmp: "LMP",
      },
    },

    tr: {
      translation: {
        patients: "Hastalar",
        add: "Ekle",
        delete: "Sil",
        gestationalAge: "Gebelik Haftası",
        edd: "Tahmini Doğum",
        lmp: "SAT",
      },
    },

  },

  lng: "en",

  fallbackLng: "en",

  interpolation: {
    escapeValue: false,
  },

});

export default i18n;