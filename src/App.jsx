import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import DashboardTest
  from "./pages/DashboardTest";

import PatientDetails
  from "./pages/PatientDetails";

import NewPatient
  from "./pages/NewPatient";

export default function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<DashboardTest />}
        />

        <Route
          path="/patient/:id"
          element={<PatientDetails />}
        />

        <Route
          path="/new-patient"
          element={<NewPatient />}
        />

      </Routes>

    </BrowserRouter>

  );
}