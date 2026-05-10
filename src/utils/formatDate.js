// Format an ISO date / date string as "<day> <month-name> <year>".
// Locale follows the i18n language so months render in Turkish when active.
//
// Examples:
//   formatLongDate("2026-02-04", "en") -> "4 February 2026"
//   formatLongDate("2026-02-04", "tr") -> "4 Şubat 2026"
export function formatLongDate(iso, lang) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return String(iso);
  const locale = lang?.startsWith("tr") ? "tr-TR" : "en-GB";
  return d.toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
