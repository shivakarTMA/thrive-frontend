import React from "react";
import { FaChartLine } from "react-icons/fa";
import { PiChartLineDownLight, PiChartLineUpLight } from "react-icons/pi";

const StatItem = ({ label, value, change }) => {
  const isNegative = change.trim().startsWith("-");

  return (
    <div className="flex flex-col border rounded p-3 w-full">
      <div className="text-sm font-medium text-gray-600">{label}</div>
      <div className="flex flex-wrap items-center justify-between mt-2">
        <span className="text-lg font-semibold">{value}</span>
        <div
          className={`flex items-center text-xs border px-3 py-1 rounded ${
            isNegative ? "text-red-600" : "text-green-600"
          }`}
        >
            {isNegative ? <PiChartLineDownLight className="mr-1 text-2xl" /> : <PiChartLineUpLight className="mr-1 text-2xl" />}
          
          {change}
        </div>
      </div>
    </div>
  );
};

export default StatItem;
