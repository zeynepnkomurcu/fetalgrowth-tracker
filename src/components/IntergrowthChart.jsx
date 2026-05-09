import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function IntergrowthChart({
  visits,
}) {

  const chartData = [
    {
      ga: 24,
      p3: 160,
      p10: 190,
      p50: 240,
      p90: 300,
      p97: 340,
    },
    {
      ga: 28,
      p3: 220,
      p10: 260,
      p50: 320,
      p90: 400,
      p97: 460,
    },
    {
      ga: 32,
      p3: 320,
      p10: 380,
      p50: 480,
      p90: 620,
      p97: 720,
    },
    {
      ga: 36,
      p3: 450,
      p10: 520,
      p50: 680,
      p90: 880,
      p97: 980,
    },
    {
      ga: 40,
      p3: 520,
      p10: 620,
      p50: 820,
      p90: 1040,
      p97: 1180,
    },
  ];

  const visitPoints = visits
    .filter((visit) => visit.gaWeeks >= 24)
    .map((visit) => ({
      ga:
        visit.gaWeeks +
        (visit.gaDays || 0) / 7,

      actual:
        visit.rawData?.ac || 0,
    }));

  const mergedData = [...chartData];

  visitPoints.forEach((visit) => {
    mergedData.push({
      ga: visit.ga,
      actual: visit.actual,
    });
  });

  mergedData.sort(
    (a, b) => a.ga - b.ga
  );

  return (
    <div className="
      bg-white
      rounded-2xl
      p-6
      shadow-sm
      h-[500px]
    ">

      <h2 className="
        text-2xl
        font-bold
        mb-6
        text-slate-800
      ">
        AC Growth Curve
      </h2>

      <ResponsiveContainer
        width="100%"
        height="85%"
      >

        <LineChart data={mergedData}>

          <CartesianGrid
            strokeDasharray="3 3"
          />

          <XAxis
            dataKey="ga"
            type="number"
            domain={[24, 40]}
            ticks={[24, 28, 32, 36, 40]}
            tickFormatter={(value) =>
              `${Math.round(value)}w`
            }
          />

          <YAxis
            domain={[150, 1200]}
            label={{
              value: "AC (mm)",
              angle: -90,
              position: "insideLeft",
            }}
          />

     <Tooltip
  itemSorter={(item) => {
    const order = {
      p3: 5,
      p10: 4,
      p50: 3,
      p90: 2,
      p97: 1,
      actual: 0,
    };

    return order[item.dataKey];
  }}
/>

          <Legend
  payload={[
    {
      value: "P97",
      type: "line",
      color: "#ec4899",
    },
    {
      value: "P90",
      type: "line",
      color: "#8b5cf6",
    },
    {
      value: "P50",
      type: "line",
      color: "#06b6d4",
    },
    {
      value: "P10",
      type: "line",
      color: "#f59e0b",
    },
    {
      value: "P3",
      type: "line",
      color: "#ef4444",
    },
    {
      value: "Patient",
      type: "line",
      color: "#111827",
    },
  ]}
/>

         <Line
  type="monotone"
  dataKey="p97"
  stroke="#ec4899"
  dot={false}
/>

<Line
  type="monotone"
  dataKey="p90"
  stroke="#8b5cf6"
  dot={false}
/>

<Line
  type="monotone"
  dataKey="p50"
  stroke="#06b6d4"
  dot={false}
/>

<Line
  type="linear"
  dataKey="p10"
  stroke="#f59e0b"
  dot={false}
/>

<Line
  type="linear"
  dataKey="p3"
  stroke="#ef4444"
  dot={false}
/>

<Line
  type="monotone"
  dataKey="actual"
  stroke="#111827"
  strokeWidth={4}
  connectNulls
  dot={{
    r: 6,
    strokeWidth: 2,
    fill: "#111827",
  }}
/>

        </LineChart>

      </ResponsiveContainer>

    </div>
  );
}