import React from "react";
import StatItem from "./StatItem";


const StatCard = ({ title, value, description, items }) => {
  return (
    <div className="border p-4 w-full box--shadow bg-white rounded-[15px]">
      <div className="text-gray-600 text-sm">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-sm text-gray-500 mt-1">{description}</p>

      <div className="grid grid-cols-2 gap-3 mt-4">
        {items.map((item, index) => (
          <StatItem
            key={index}
            label={item.label}
            value={item.value}
            change={item.change}
          />
        ))}
      </div>
    </div>
  );
};

export default StatCard;
