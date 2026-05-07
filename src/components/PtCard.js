import React from "react";
import { PiChartLineDownLight, PiChartLineUpLight } from "react-icons/pi";

const PtCard = ({ title, value, percent }) => {
  const isPositive = percent >= 0;
  const percentColor = isPositive ? "text-green-600" : "text-red-600";

  return (
    <div className="border rounded p-4 w-full">
      <h3 className="text-md text-black mb-2">{title}</h3>
      <div className="flex items-center justify-between">
        <span className="text-4xl font-semibold">{value}</span>
        <div className={`flex items-center ${percentColor}`}>
          {isPositive ? (
            <PiChartLineUpLight className="mr-1 text-2xl" />
          ) : (
            <PiChartLineDownLight className="mr-1 text-2xl" />
          )}
          <span>{Math.abs(percent)}%</span>
        </div>
      </div>
    </div>
  );
};

export default PtCard;
