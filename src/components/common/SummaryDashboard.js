import React from "react";
import { Link } from "react-router-dom";

const DEFAULT_KEYS = {
  FollowUps: "0/0",
  "Tour/Trials": "0/0",
  Appointments: "0/0",
  Classes: "0/0",
  MembershipExpiry: 0,
  ServiceExpiry: 0,
  ClientBirthdays: 0,
  ClientAnniversaries: 0,
};

function SummaryDashboard({ data = {}, routeMap = {}, generateUrl }) {

  // Merge API data with default keys
  const mergedData = { ...DEFAULT_KEYS, ...data };

  return (
    <div className="mt-2 space-y-2">

      {/* Empty State Message */}

      {Object.entries(mergedData).map(([key, value]) => {
        const stringValue = String(value);
        const route = routeMap[key];

        return (
          <div
            key={key}
            className="py-2 text-sm flex justify-between items-center
              [&:not(:last-child)]:border-b
              [&:not(:last-child)]:border-[#D4D4D4]"
          >
            {/* Format key */}
            <span>
              {key.replace(/([A-Z])/g, " $1").trim()}
            </span>

            <strong>
              {route ? (
                <Link
                  to={generateUrl(route)}
                  className="text-black hover:underline"
                >
                  {stringValue.includes("/")
                    ? `(${stringValue})`
                    : stringValue}
                </Link>
              ) : (
                stringValue.includes("/")
                  ? `(${stringValue})`
                  : stringValue
              )}
            </strong>
          </div>
        );
      })}
    </div>
  );
}

export default SummaryDashboard;