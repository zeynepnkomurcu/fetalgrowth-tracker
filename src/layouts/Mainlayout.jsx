import { Link } from "react-router-dom";

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-700 text-white p-6">
        <h1 className="text-2xl font-bold mb-10">
          Fetal Tracker
        </h1>

        <nav className="space-y-4">
          <Link
            to="/"
            className="block hover:text-blue-200"
          >
            Dashboard
          </Link>

          <Link
            to="/patients"
            className="block hover:text-blue-200"
          >
            Patients
          </Link>

          <Link
            to="/reports"
            className="block hover:text-blue-200"
          >
            Reports
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        <header className="bg-white shadow p-4">
          <h2 className="text-xl font-semibold">
            Medical Dashboard
          </h2>
        </header>

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}