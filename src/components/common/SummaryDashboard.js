import React from "react";

function SummaryDashboard({ data }) {
  return (
    <div className="mt-2 space-y-2 ">
      {Object.entries(data).map(([key, value]) => {
        // Convert value to string to safely use includes
        const stringValue = String(value);

        return (
          <div
            key={key}
            className="py-2 text-sm flex justify-between [&:not(:last-child)]:border-b [&:not(:last-child)]:border-[#D4D4D4]"
          >
            {/* Format key by adding space before capital letters */}
            <span>{key.replace(/([A-Z])/g, " $1")}</span>
            {/* If value contains a slash, wrap it in parentheses */}
            <strong>
              {stringValue.includes("/") ? `(${stringValue})` : stringValue}
            </strong>
          </div>
        );
      })}
    </div>
  );
}

export default SummaryDashboard;
