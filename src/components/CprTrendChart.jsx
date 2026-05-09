import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function CprTrendChart({
  visits,
}) {

  const data = visits.map(
    (visit, index) => ({
      visit: index + 1,

      cpr:
        visit.calculations?.cpr || 0,
    })
  );

  return (

    <div className="
      mt-8
      bg-slate-700
      p-6
      rounded-2xl
    ">

      <h2 className="
        text-2xl
        font-bold
        mb-6
      ">
        CPR Trend
      </h2>

      <div className="h-72">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >

          <LineChart data={data}>

            <XAxis dataKey="visit" />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="cpr"
              stroke="#06b6d4"
              strokeWidth={3}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}