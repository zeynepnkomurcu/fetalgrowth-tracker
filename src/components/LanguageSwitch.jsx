import { useTranslation } from "react-i18next";

export default function LanguageSwitch() {
  const { i18n } = useTranslation();

  const change = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("lang", lng);
  };

  const current = i18n.language?.startsWith("tr") ? "tr" : "en";

  return (
    <div className="inline-flex border border-slate-200 rounded-xl overflow-hidden text-sm font-semibold">
      {[
        { key: "en", label: "EN" },
        { key: "tr", label: "TR" },
      ].map((opt) => {
        const active = current === opt.key;
        return (
          <button
            key={opt.key}
            onClick={() => change(opt.key)}
            className={`px-3 py-1.5 transition-all ${
              active
                ? "bg-cyan-500 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
