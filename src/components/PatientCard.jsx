import { Link } from "react-router-dom";
import { useTranslation }
  from "react-i18next";
export default function PatientCard({
  id, 
  name,
  week,
  days,
  edd,
  risk,
  onDelete,
  onIncrease,
  onDecrease,
}) {
  const { t } = useTranslation();
  return (
<Link
  to={`/patient/${id}`}
  className="block"
>
<div className="bg-slate-800 text-white p-5 rounded-2xl shadow hover:shadow-lg transition">
      <div className="flex justify-between items-center">
        
        <div>
          <h3 className="text-xl font-bold">
            {name}
          </h3>

<div className="flex items-center gap-3 mt-2">

  <button
    onClick={onDecrease}
    className="bg-slate-700 hover:bg-slate-600 px-3 rounded"
  >
    -
  </button>

  <p className="text-slate-300">
{week}w {days}d
  </p>
<p className="text-sm text-slate-400">
{t("edd")}: {edd}
</p>
  <button
    onClick={onIncrease}
    className="bg-slate-700 hover:bg-slate-600 px-3 rounded"
  >
    +
  </button>

</div>
        </div>

<div className="flex flex-col items-end gap-3">

  <div
    className={`px-3 py-1 rounded-full text-sm font-semibold ${
      risk === "High"
        ? "bg-red-100 text-red-600"
        : "bg-green-100 text-green-600"
    }`}
  >
    {risk}
  </div>

  <button
    onClick={onDelete}
    className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded"
  >
{t("delete")}
  </button>

</div>
      </div>
    </div>
  </Link>
  );
}