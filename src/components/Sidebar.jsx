import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 bg-slate-800 min-h-screen p-6">

      <h1 className="text-2xl font-bold text-white mb-10">
        Fetal Growth
      </h1>

      <div className="flex flex-col gap-4">

        <Link
          to="/"
          className="text-slate-300 hover:text-white"
        >
          Dashboard
        </Link>

        <Link
          to="/"
          className="text-slate-300 hover:text-white"
        >
          Patients
        </Link>

        <Link
          to="/"
          className="text-slate-300 hover:text-white"
        >
          Analytics
        </Link>

        <Link
          to="/"
          className="text-slate-300 hover:text-white"
        >
          Settings
        </Link>

      </div>
    </div>
  );
}