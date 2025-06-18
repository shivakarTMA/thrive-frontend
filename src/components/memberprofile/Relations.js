import React from "react";
import "react-datepicker/dist/react-datepicker.css";

const Relations = () => {
  const referredBy = [
    { name: "Amit Sharma", relationship: "Friend", referredOn: "2025-01-15", status: "Member" },
    { name: "Neha Verma", relationship: "Colleague", referredOn: "2025-02-01", status: "Lead" },
    { name: "Rohit Singh", relationship: "Sibling", referredOn: "2025-02-20", status: "Member" },
    { name: "Divya Patel", relationship: "Neighbor", referredOn: "2025-03-05", status: "Lead" },
    { name: "Sanjay Kumar", relationship: "Trainer", referredOn: "2025-03-22", status: "Member" },
    { name: "Priya Das", relationship: "Cousin", referredOn: "2025-04-10", status: "Lead" },
    { name: "Rahul Mehta", relationship: "Spouse", referredOn: "2025-04-18", status: "Member" },
    { name: "Sneha Rao", relationship: "Friend", referredOn: "2025-05-01", status: "Lead" },
    { name: "Karan Malhotra", relationship: "Classmate", referredOn: "2025-05-12", status: "Lead" },
    { name: "Tina George", relationship: "Coworker", referredOn: "2025-06-01", status: "Member" },
  ];

  const columns = ["Name", "Relationship", "Referred On", "Current Status"];

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="overflow-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="border px-3 py-2">
                  {col}
                </th>
              ))}
              {/* <th className="border px-3 py-2">Action</th> */}
            </tr>
          </thead>
          <tbody>
            {referredBy.length > 0 ? (
              referredBy.map((item, idx) => (
                <tr key={idx}>
                  <td className="border px-3 py-2">{item.name}</td>
                  <td className="border px-3 py-2">{item.relationship}</td>
                  <td className="border px-3 py-2">{item.referredOn}</td>
                  <td className="border px-3 py-2">{item.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="text-center py-4 text-gray-500"
                >
                  No data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Relations;
