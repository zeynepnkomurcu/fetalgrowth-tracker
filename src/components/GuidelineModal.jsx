import { useTranslation } from "react-i18next";

export default function GuidelineModal({ visible, onClose, message, title }) {
  const { t } = useTranslation();
  if (!visible) return null;
  const heading = title || t("modal.title");

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xl">⚠️</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">{heading}</h3>
            <p className="text-slate-600 mt-1 text-sm">{message}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 rounded-xl transition-all"
        >
          {t("common.ok")}
        </button>
      </div>
    </div>
  );
}
