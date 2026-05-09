import React from "react";

const MeasurementCard = ({
  title,
  value,
  onChange,
  percentile
}) => {
  return (
    <div
      className="
        bg-white
        rounded-2xl
        shadow-sm
        border
        border-slate-200
        p-5
      "
    >
      <div
        className="
          flex
          flex-col
          gap-4
        "
      >
        <div className="flex items-center justify-between">
          <h3
            className="
              text-sm
              font-semibold
              text-slate-500
            "
          >
            {title}
          </h3>

          {percentile && (
            <span
              className={`
                ${percentile.color}
                font-bold
                text-sm
              `}
            >
              {percentile.p}p
            </span>
          )}
        </div>

        <input
          type="number"
          value={value}
          onChange={onChange}
          placeholder="0"
          className="
            w-full
            border
            border-slate-300
            rounded-xl
            px-4
            py-3
            text-lg
            text-slate-900
            focus:outline-none
            focus:ring-2
            focus:ring-cyan-500
          "
        />
      </div>
    </div>
  );
};

export default MeasurementCard;