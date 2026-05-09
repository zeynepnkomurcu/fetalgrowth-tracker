import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/DashboardTest";
import NewPatient from "./pages/NewPatient";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/new-patient" element={<NewPatient />} />
      </Routes>
    </BrowserRouter>
  );
}
