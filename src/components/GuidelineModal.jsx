import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";

export default function GuidelineModal({ visible, onClose, message, title }) {
  const { t } = useTranslation();
  if (!visible) return null;
  const heading = title || t("modal.title");

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[--color-surface] border border-[--color-border] rounded-2xl shadow-2xl max-w-md w-full p-6"
      >
        <div className="flex items-start gap-3 mb-5">
          <div className="w-9 h-9 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold tracking-tight">{heading}</h3>
            <p className="text-sm text-[--color-text-muted] mt-1">{message}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-full h-10 rounded-lg bg-[--color-text] text-[--color-surface] font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          {t("common.ok")}
        </button>
      </div>
    </div>
  );
}
