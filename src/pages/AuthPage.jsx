import { useState } from "react";
import { Activity, Loader2, MailCheck, AlertCircle } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function AuthPage() {
  const [mode, setMode] = useState("signin"); // "signin" | "signup" | "check-email"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const switchMode = (next) => {
    setMode(next);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName || null } },
      });
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      setMode("check-email");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    }
    // success → App.jsx onAuthStateChange will re-render
  };

  const inputClass =
    "w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#134e4a] focus:border-transparent transition-all";

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#134e4a] to-[#0f766e] text-white p-16 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-white/15 backdrop-blur flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Fetal Growth Tracker
            </h1>
          </div>
          <p className="mt-4 text-white/80 text-lg max-w-md leading-relaxed">
            Longitudinal fetal surveillance and growth restriction assessment
            platform.
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/15">
            <p className="text-sm text-white/70 mb-3 font-medium">
              Clinical Features
            </p>
            <ul className="space-y-2 text-sm text-white/90">
              <li>• Intergrowth-21st Percentiles</li>
              <li>• Doppler Surveillance</li>
              <li>• FGR Stage Detection</li>
              <li>• Longitudinal Growth Tracking</li>
            </ul>
          </div>
          <p className="text-xs text-white/50">
            Research &amp; Clinical Workflow Platform
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            {mode === "check-email" ? (
              <CheckEmailView
                email={email}
                onBack={() => switchMode("signin")}
              />
            ) : (
              <>
                {/* Tabs */}
                <div className="flex gap-1 p-1 bg-slate-100 rounded-lg mb-6">
                  <button
                    type="button"
                    onClick={() => switchMode("signin")}
                    className={`flex-1 h-9 rounded-md text-sm font-semibold transition-colors ${
                      mode === "signin"
                        ? "bg-white text-slate-800 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode("signup")}
                    className={`flex-1 h-9 rounded-md text-sm font-semibold transition-colors ${
                      mode === "signup"
                        ? "bg-white text-slate-800 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Create account
                  </button>
                </div>

                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">
                    {mode === "signin"
                      ? "Welcome back"
                      : "Create your account"}
                  </h2>
                  <p className="text-slate-500 mt-1 text-sm">
                    {mode === "signin"
                      ? "Sign in to access your clinical workspace"
                      : "New accounts require admin approval before use"}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === "signup" && (
                    <div>
                      <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Full name
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className={inputClass}
                        placeholder="Dr. Zeynep Yılmaz"
                        autoComplete="name"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass}
                      placeholder="name@example.com"
                      autoComplete="email"
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={inputClass}
                      placeholder="••••••••"
                      autoComplete={
                        mode === "signin" ? "current-password" : "new-password"
                      }
                    />
                    {mode === "signup" && (
                      <p className="mt-1.5 text-xs text-slate-400">
                        At least 6 characters
                      </p>
                    )}
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 rounded-lg bg-[#134e4a] text-white text-sm font-semibold hover:bg-[#0f766e] disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {mode === "signin" ? "Sign in" : "Create account"}
                  </button>
                </form>
              </>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            Protected by Supabase Auth — your data stays private.
          </p>
        </div>
      </div>
    </div>
  );
}

function CheckEmailView({ email, onBack }) {
  return (
    <div className="text-center">
      <div className="w-14 h-14 rounded-full bg-[#134e4a]/10 flex items-center justify-center mx-auto mb-5">
        <MailCheck className="w-7 h-7 text-[#134e4a]" />
      </div>
      <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">
        Check your email
      </h2>
      <p className="text-slate-500 mt-2 text-sm leading-relaxed">
        We sent a confirmation link to <br />
        <span className="font-medium text-slate-700">{email}</span>.<br />
        Click the link to verify your email, then sign in.
      </p>
      <div className="mt-4 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 text-left">
        After verifying your email, an admin still needs to approve your
        account before you can use the app.
      </div>
      <button
        onClick={onBack}
        className="mt-6 inline-flex items-center justify-center w-full h-11 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
      >
        Back to sign in
      </button>
    </div>
  );
}
