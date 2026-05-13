import { Clock, LogOut, Activity } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function PendingApproval({ email }) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-lg bg-[#134e4a] text-white flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
          <span className="font-semibold text-slate-800 tracking-tight">
            Fetal Growth Tracker
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-5">
            <Clock className="w-7 h-7 text-amber-600" />
          </div>

          <h1 className="text-xl font-semibold text-slate-800 tracking-tight">
            Account pending approval
          </h1>

          <p className="text-slate-500 mt-2 text-sm leading-relaxed">
            Your email <span className="font-medium text-slate-700">{email}</span>{" "}
            is verified, but an administrator still needs to approve your
            account before you can access patient data.
          </p>

          <div className="mt-5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 text-left">
            <p className="font-semibold text-slate-700 mb-1">What's next?</p>
            <p>
              Contact your administrator to request approval. Once approved,
              sign out and sign back in to access the platform.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="mt-6 inline-flex items-center justify-center gap-2 w-full h-11 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
