import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";

export default function GuidelineModal({ visible, onClose, message, title }) {
  const { t } = useTranslation();
  if (!visible) return null;
  const heading = title || t("modal.title");

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-md w-full p-6"
      >
        <div className="flex items-start gap-3 mb-5">
          <div className="w-9 h-9 bg-amber-50 rounded-full flex items-center justify-center flex-shrink-0 ring-1 ring-amber-100">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-800 tracking-tight">{heading}</h3>
            <p className="text-sm text-slate-500 mt-1">{message}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-full h-10 rounded-lg bg-[#134e4a] text-white text-sm font-semibold hover:bg-[#0f766e] transition-colors"
        >
          {t("common.ok")}
        </button>
      </div>
    </div>
  );
}
