import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

// 3-state theme: "system" (follow OS) | "light" | "dark".
// Click cycles system → light → dark → system.
// Stored in localStorage["theme"] (null = system).
function applyTheme(theme) {
  const root = document.documentElement;
  const isDark =
    theme === "dark" ||
    (theme !== "light" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.classList.toggle("dark", isDark);
}

export default function ThemeSwitch() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "system"
  );

  // Re-apply when system preference changes while on "system".
  useEffect(() => {
    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => applyTheme("system");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [theme]);

  const cycle = () => {
    const order = ["system", "light", "dark"];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setTheme(next);
    if (next === "system") localStorage.removeItem("theme");
    else localStorage.setItem("theme", next);
    applyTheme(next);
  };

  const Icon =
    theme === "system" ? Monitor : theme === "light" ? Sun : Moon;
  const label =
    theme === "system" ? "System" : theme === "light" ? "Light" : "Dark";

  return (
    <button
      onClick={cycle}
      title={`Theme: ${label} (click to cycle)`}
      className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[--color-border] bg-[--color-surface] hover:bg-[--color-surface-muted] text-[--color-text-muted] hover:text-[--color-text] transition-colors"
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}
