import { useEffect, useState }
  from "react";

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import { supabase }
  from "./lib/supabase";
import NewPatient from "./pages/NewPatient";
import AuthPage
  from "./pages/AuthPage";

import Dashboard
  from "./pages/Dashboard";

function App() {

  const [session, setSession] =
    useState(null);

  useEffect(() => {

    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
      });

    const {
      data: { subscription },
    } = supabase.auth
      .onAuthStateChange(
        (_event, session) => {
          setSession(session);
        }
      );

    return () =>
      subscription.unsubscribe();

  }, []);

  if (!session) {
    return <AuthPage />;
  }

  return (
    <BrowserRouter>

<Routes>

  <Route
    path="/"
    element={<Dashboard />}
  />

  <Route
    path="/new-patient"
    element={<NewPatient />}
  />

</Routes>

    </BrowserRouter>
  );
}

export default App;