import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { supabase } from "./lib/supabase";
import AuthPage from "./pages/AuthPage";
import PendingApproval from "./pages/PendingApproval";
import Dashboard from "./pages/Dashboard";
import NewPatient from "./pages/NewPatient";

function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user?.id) {
      setProfile(null);
      return;
    }
    setProfileLoading(true);
    supabase
      .from("profiles")
      .select("approved, is_admin, full_name, email")
      .eq("user_id", session.user.id)
      .single()
      .then(({ data }) => {
        setProfile(data || null);
        setProfileLoading(false);
      });
  }, [session?.user?.id]);

  if (!authReady) {
    return <FullPageLoader />;
  }

  if (!session) {
    return <AuthPage />;
  }

  if (profileLoading || !profile) {
    return <FullPageLoader />;
  }

  if (!profile.approved) {
    return <PendingApproval email={session.user.email} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/new-patient" element={<NewPatient />} />
      </Routes>
    </BrowserRouter>
  );
}

function FullPageLoader() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-[#134e4a] animate-spin" />
    </div>
  );
}

export default App;
