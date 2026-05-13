import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Clock,
  ShieldCheck,
  UserX,
  Mail,
  Calendar,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import AppHeader from "../components/AppHeader";
import { formatLongDate } from "../utils/formatDate";

export default function AdminPage() {
  const navigate = useNavigate();
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingOn, setActingOn] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("user_id, email, full_name, approved, is_admin, created_at, approved_at")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPending(data.filter((p) => !p.approved));
      setApproved(data.filter((p) => p.approved));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleApprove = async (userId) => {
    setActingOn(userId);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("profiles")
      .update({
        approved: true,
        approved_at: new Date().toISOString(),
        approved_by: user?.id ?? null,
      })
      .eq("user_id", userId);
    setActingOn(null);
    if (error) {
      alert(error.message);
      return;
    }
    fetchAll();
  };

  const handleRevoke = async (userId) => {
    if (!confirm("Revoke this user's access?")) return;
    setActingOn(userId);
    const { error } = await supabase
      .from("profiles")
      .update({ approved: false, approved_at: null, approved_by: null })
      .eq("user_id", userId);
    setActingOn(null);
    if (error) {
      alert(error.message);
      return;
    }
    fetchAll();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <AppHeader />

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-6">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </button>

        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#134e4a]" />
            User administration
          </h1>
          <p className="mt-1 text-slate-500 text-sm">
            Approve new signups so they can access patient data.
          </p>
        </div>

        {/* Pending users */}
        <section className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <header className="px-6 py-4 border-b border-slate-200 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-semibold text-slate-800">
              Pending approval
            </h2>
            <span className="ml-auto text-xs tabular text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {pending.length}
            </span>
          </header>

          <div className="divide-y divide-slate-100">
            {loading && (
              <p className="px-6 py-8 text-center text-sm text-slate-400">
                Loading…
              </p>
            )}
            {!loading && pending.length === 0 && (
              <p className="px-6 py-8 text-center text-sm text-slate-400">
                No pending users.
              </p>
            )}
            {pending.map((u) => (
              <div
                key={u.user_id}
                className="px-6 py-4 flex items-center justify-between gap-4 flex-wrap"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 text-sm">
                    {u.full_name || u.email}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <Mail className="w-3.5 h-3.5" />
                    {u.email}
                  </p>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Signed up {formatLongDate(u.created_at, "en")}
                  </p>
                </div>
                <button
                  onClick={() => handleApprove(u.user_id)}
                  disabled={actingOn === u.user_id}
                  className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#134e4a] text-white text-sm font-semibold hover:bg-[#0f766e] disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Approve
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Approved users */}
        <section className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <header className="px-6 py-4 border-b border-slate-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#134e4a]" />
            <h2 className="text-sm font-semibold text-slate-800">
              Approved users
            </h2>
            <span className="ml-auto text-xs tabular text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {approved.length}
            </span>
          </header>

          <div className="divide-y divide-slate-100">
            {!loading && approved.length === 0 && (
              <p className="px-6 py-8 text-center text-sm text-slate-400">
                No approved users yet.
              </p>
            )}
            {approved.map((u) => (
              <div
                key={u.user_id}
                className="px-6 py-4 flex items-center justify-between gap-4 flex-wrap"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                    {u.full_name || u.email}
                    {u.is_admin && (
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-[#134e4a] bg-[#134e4a]/10 px-1.5 py-0.5 rounded">
                        Admin
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <Mail className="w-3.5 h-3.5" />
                    {u.email}
                  </p>
                  {u.approved_at && (
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                      Approved {formatLongDate(u.approved_at, "en")}
                    </p>
                  )}
                </div>
                {!u.is_admin && (
                  <button
                    onClick={() => handleRevoke(u.user_id)}
                    disabled={actingOn === u.user_id}
                    className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-200 text-slate-500 text-xs font-semibold hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
