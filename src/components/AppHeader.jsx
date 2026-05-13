import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Activity, LogOut, ShieldCheck } from "lucide-react";

import { supabase } from "../lib/supabase";
import LanguageSwitch from "./LanguageSwitch";

export default function AppHeader() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (cancelled) return;
      const userId = data?.user?.id;
      setEmail(data?.user?.email || "");
      if (!userId) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("user_id", userId)
        .single();
      if (!cancelled) setIsAdmin(profile?.is_admin === true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#134e4a] text-white flex items-center justify-center flex-shrink-0">
            <Activity className="w-4 h-4" />
          </div>
          <span className="font-semibold text-slate-800 tracking-tight truncate">
            {t("app.title")}
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm font-semibold text-[#134e4a] hover:bg-[#134e4a]/10 transition-colors"
              title="User administration"
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}

          <LanguageSwitch />

          {email && (
            <span
              className="hidden md:inline text-sm text-slate-500 max-w-[180px] truncate"
              title={email}
            >
              {email}
            </span>
          )}

          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors"
            title={t("common.logout")}
            aria-label={t("common.logout")}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
