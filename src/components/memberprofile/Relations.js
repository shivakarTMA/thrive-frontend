import React, { useState } from "react";
import "react-datepicker/dist/react-datepicker.css";

const Relations = () => {
  const [activeTab, setActiveTab] = useState("referrer");

  const referrerData = [
    { name: "John Doe", memberId: "123" },
    { name: "Jane Smith", memberId: "456" },
    { name: "Alice Johnson", memberId: "789" },
    { name: "Bob Brown", memberId: "978" },
    { name: "Charlie White", memberId: "654" },
  ];

  const referredBy = [
    { name: "John Doe", Number: "123", email: "John@gmail.com" },
    { name: "Jane Smith", Number: "456", email: "Jane@gmail.com" },
    { name: "Alice Johnson", Number: "789", email: "Alice@gmail.com" },
    { name: "Bob Brown", Number: "978", email: "Bob@gmail.com" },
    { name: "Charlie White", Number: "654", email: "Charlie@gmail.com" },
  ];

  const familyData = [
    { name: "Shivakar", memberId: "123" },
    { name: "Juhi", memberId: "456" },
    { name: "Alice Johnson", memberId: "789" },
    { name: "Bob Brown", memberId: "978" },
    { name: "Charlie White", memberId: "654" },
  ];

  const renderTable = () => {
    if (activeTab === "referrer") {
      return (
        <Table
          data={referrerData}
          columns={["Name", "Member Id"]}
          getRowData={(item) => [item.name, item.memberId]}
        />
      );
    } else if (activeTab === "referredBy") {
      return (
        <Table
          data={referredBy}
          columns={["Name", "Number", "Email"]}
          getRowData={(item) => [item.name, item.Number, item.email]}
        />
      );
    } else if (activeTab === "family") {
      return (
        <Table
          data={familyData}
          columns={["Name", "Member Id"]}
          getRowData={(item) => [item.name, item.memberId]}
        />
      );
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      {/* Tabs */}
      <div className="flex gap-4 mb-4 border-b pb-0">
        {[
          { key: "referrer", label: "Referrer" },
          { key: "referredBy", label: "Referred By" },
          { key: "family", label: "Family Members" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-t ${
              activeTab === tab.key ? "bg-black text-white" : "bg-gray-200 text-black"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {renderTable()}
    </div>
  );
};

const Table = ({ data, columns, getRowData }) => {
  return (
    <div className="overflow-auto">
      <table className="min-w-full border border-gray-300 text-sm">
        <thead className="bg-gray-100 text-left">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="border px-3 py-2">
                {col}
              </th>
            ))}
            <th className="border px-3 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {data?.length > 0 ? (
            data.map((item, idx) => (
              <tr key={idx}>
                {getRowData(item).map((cell, i) => (
                  <td key={i} className="border px-3 py-2">
                    {cell}
                  </td>
                ))}
                <td className="border px-3 py-2">
                  <button className="px-4 py-2 bg-black text-white font-semibold rounded max-w-[150px] w-full">
                    View
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + 1} className="text-center py-4 text-gray-500">
                No data found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Relations;
