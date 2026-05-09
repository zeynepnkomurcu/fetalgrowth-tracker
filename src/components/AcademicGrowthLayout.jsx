export default function AcademicGrowthLayout({
  leftPanel,
  topPanel,
  chartPanel,
  rightPanel,
}) {

  return (

    <div className="
      grid
      grid-cols-12
      gap-6
      p-6
      min-h-screen
      bg-slate-50
    ">

      <div className="col-span-3">
        {leftPanel}
      </div>

      <div className="
        col-span-6
        space-y-6
      ">
        {topPanel}
        {chartPanel}
      </div>

      <div className="
        col-span-3
        space-y-6
      ">
        {rightPanel}
      </div>

    </div>

  );
}