import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const AttendanceData = () => {
  const [clubFilter, setClubFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState(null);

  const attendanceData = [
    { memberId: "M001", memberName: "John Doe", clubId: "C001", date: "2025-05-25", punchIn: "08:00 AM", punchOut: "10:00 AM" },
    { memberId: "M002", memberName: "Jane Smith", clubId: "C002", date: "2025-05-25", punchIn: "09:00 AM", punchOut: "11:00 AM" },
    { memberId: "M003", memberName: "Alice Johnson", clubId: "C001", date: "2025-05-26", punchIn: "07:30 AM", punchOut: "09:00 AM" },
    { memberId: "M004", memberName: "Bob Brown", clubId: "C003", date: "2025-05-26", punchIn: "10:00 AM", punchOut: "12:00 PM" },
    { memberId: "M005", memberName: "Charlie White", clubId: "C002", date: "2025-05-27", punchIn: "06:00 AM", punchOut: "08:00 AM" },
  ];

  const uniqueClubIds = [...new Set(attendanceData.map(item => item.clubId))];

  const filteredData = attendanceData.filter((item) => {
    const matchesClub = clubFilter === "All" || item.clubId === clubFilter;
    const matchesDate = !dateFilter || item.date === dateFilter.toISOString().split("T")[0];
    return matchesClub && matchesDate;
  });

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Attendance</h2>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-4">
        <select
          value={clubFilter}
          onChange={(e) => setClubFilter(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="All">All Clubs</option>
          {uniqueClubIds.map((id) => (
            <option key={id} value={id}>{id}</option>
          ))}
        </select>

        <DatePicker
  selected={dateFilter}
  onChange={(date) => setDateFilter(date)}
  className="border px-3 py-2 rounded"
  placeholderText="Select Date"
  isClearable
/>
      </div>

      {/* Table */}
      <div className="overflow-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="border px-3 py-2">Member ID</th>
              <th className="border px-3 py-2">Member Name</th>
              <th className="border px-3 py-2">Club ID</th>
              <th className="border px-3 py-2">Date</th>
              <th className="border px-3 py-2">Punch-in</th>
              <th className="border px-3 py-2">Punch-out</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((entry, idx) => (
                <tr key={idx}>
                  <td className="border px-3 py-2">{entry.memberId}</td>
                  <td className="border px-3 py-2">{entry.memberName}</td>
                  <td className="border px-3 py-2">{entry.clubId}</td>
                  <td className="border px-3 py-2">{entry.date}</td>
                  <td className="border px-3 py-2">{entry.punchIn}</td>
                  <td className="border px-3 py-2">{entry.punchOut}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center text-gray-500 py-4">
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

export default AttendanceData;
