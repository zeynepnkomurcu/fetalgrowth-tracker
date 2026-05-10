import { useTranslation } from "react-i18next";

export default function LanguageSwitch() {
  const { i18n } = useTranslation();

  const change = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("lang", lng);
  };

  const current = i18n.language?.startsWith("tr") ? "tr" : "en";

  return (
    <div className="inline-flex items-center rounded-lg border border-[--color-border] bg-[--color-surface] overflow-hidden text-xs font-semibold">
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
                ? "bg-[--color-text] text-[--color-surface]"
                : "text-[--color-text-muted] hover:text-[--color-text] hover:bg-[--color-surface-muted]"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
