export default function ClinicalAssessmentCard({
  visit,
  onSave,
}) {

  return (

    <div className="mt-8 bg-slate-700 p-6 rounded-2xl">

      <h2 className="text-2xl font-bold mb-4">
        Clinical Assessment
      </h2>

      <div className="space-y-3">

        <button
          onClick={onSave}
          className="
            mt-6
            bg-cyan-500
            hover:bg-cyan-600
            px-6
            py-3
            rounded-xl
            font-bold
          "
        >
          Save Visit
        </button>

        <p>
          CPR:
          {" "}
          <span className="text-cyan-400 font-bold">
            {visit.calculations.cpr || "-"}
          </span>
        </p>

        <p>
          Stage:
          {" "}
          <span className="text-yellow-400 font-bold">
            {visit.stage.label}
          </span>
        </p>

        <div>

          <p className="mb-2 font-semibold">
            Recommendations
          </p>

          <ul className="space-y-2">

            {visit.recommendations.map(
              (rec, index) => (

                <li
                  key={index}
                  className="
                    bg-slate-800
                    p-3
                    rounded-xl
                  "
                >
                  {rec}
                </li>
              )
            )}

          </ul>

        </div>

      </div>

    </div>
  )
}