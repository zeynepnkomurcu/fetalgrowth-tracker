import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function signUp() {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Account created!");
    }
  }

  async function signIn() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Logged in!");
    }
  }

return (
  <div className="min-h-screen bg-zinc-100 flex">
    
    {/* LEFT PANEL */}
    <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-slate-900 to-slate-700 text-white p-16 flex-col justify-between">
      
      <div>
        <h1 className="text-4xl font-bold tracking-tight">
          Fetal Growth Tracker
        </h1>

        <p className="mt-4 text-slate-300 text-lg max-w-md">
          Longitudinal fetal surveillance and fetal growth restriction assessment platform.
        </p>
      </div>

      <div className="space-y-6">
        
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <p className="text-sm text-slate-300 mb-2">
            Clinical Features
          </p>

          <ul className="space-y-2 text-sm">
            <li>• Intergrowth-21st Percentiles</li>
            <li>• Doppler Surveillance</li>
            <li>• FGR Stage Detection</li>
            <li>• Longitudinal Growth Tracking</li>
          </ul>
        </div>

        <div className="text-xs text-slate-400">
          Research & Clinical Workflow Platform
        </div>
      </div>
    </div>

    {/* RIGHT PANEL */}
    <div className="flex-1 flex items-center justify-center p-6">
      
      <div className="w-full max-w-md">
        
        <div className="bg-white rounded-3xl shadow-xl border border-zinc-200 p-8">
          
          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-zinc-900">
              Sign In
            </h2>

            <p className="text-zinc-500 mt-2">
              Access your clinical workspace
            </p>
          </div>

<form
  onSubmit={(e) => {
    e.preventDefault();
    signIn();
  }}
  className="space-y-5"
>

            <div>
              <label className="text-sm font-medium text-zinc-700">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-500"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-700">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-500"
                placeholder="••••••••"
              />
            </div>
<button
  type="button"
  onClick={signUp}
  className="w-full rounded-xl border border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-700 py-3 font-medium transition"
>
  Create Account
</button>
            <button
              type="submit"
              className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white py-3 font-medium transition"
            >
              Sign In
            </button>
          </form>

        </div>
      </div>
    </div>
  </div>
);
}