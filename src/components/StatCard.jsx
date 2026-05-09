export default function StatCard({
  title,
  value,
  valueColor = "text-black",
}) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <h3 className="text-gray-500">{title}</h3>

      <p className={`text-4xl font-bold mt-2 ${valueColor}`}>
        {value}
      </p>
    </div>
  );
}