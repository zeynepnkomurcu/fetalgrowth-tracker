import { useTranslation } from "react-i18next";

export default function LanguageSwitch() {
  const { i18n } = useTranslation();

  const change = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("lang", lng);
  };

  const current = i18n.language?.startsWith("tr") ? "tr" : "en";

  return (
    <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white overflow-hidden text-xs font-semibold shadow-sm">
      {[
        { key: "en", label: "EN" },
        { key: "tr", label: "TR" },
      ].map((opt) => {
        const active = current === opt.key;
        return (
          <button
            key={opt.key}
            onClick={() => change(opt.key)}
            className={`px-3 h-9 transition-colors ${
              active
                ? "bg-[#134e4a] text-white"
                : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
