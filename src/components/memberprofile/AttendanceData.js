import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import { parseISO, isWithinInterval } from "date-fns";
import { customStyles } from "../../Helper/helper";

const AttendanceData = () => {
  const [clubFilter, setClubFilter] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const attendanceData = [
    {
      memberId: "M001",
      memberName: "John Doe",
      checkInDate: "2025-05-25",
      checkInTime: "08:00 AM",
      checkOutTime: "10:00 AM",
      centerName: "C001",
      membershipType: "Gold",
      checkInMode: "QR",
      sessionType: "PT",
      trainerName: "Alex",
      attendanceStatus: "Present",
      addedBy: "Admin",
    },
    {
      memberId: "M002",
      memberName: "Jane Smith",
      checkInDate: "2025-05-25",
      checkInTime: "09:00 AM",
      checkOutTime: "11:00 AM",
      centerName: "C002",
      membershipType: "Silver",
      checkInMode: "Manual",
      sessionType: "GX",
      trainerName: "",
      attendanceStatus: "No-show",
      addedBy: "Staff1",
    },
    {
      memberId: "M003",
      memberName: "Alice Johnson",
      checkInDate: "2025-05-26",
      checkInTime: "07:30 AM",
      checkOutTime: "09:00 AM",
      centerName: "C001",
      membershipType: "Platinum",
      checkInMode: "Face Recognition",
      sessionType: "Café",
      trainerName: "",
      attendanceStatus: "Present",
      addedBy: "Admin",
    },
    {
      memberId: "M004",
      memberName: "Bob Brown",
      checkInDate: "2025-05-26",
      checkInTime: "10:00 AM",
      checkOutTime: "12:00 PM",
      centerName: "C003",
      membershipType: "Gold",
      checkInMode: "QR",
      sessionType: "Sports",
      trainerName: "",
      attendanceStatus: "Cancelled",
      addedBy: "Staff2",
    },
    {
      memberId: "M005",
      memberName: "Charlie White",
      checkInDate: "2025-05-27",
      checkInTime: "06:00 AM",
      checkOutTime: "08:00 AM",
      centerName: "C002",
      membershipType: "Silver",
      checkInMode: "Manual",
      sessionType: "PT",
      trainerName: "David",
      attendanceStatus: "Invalid Scan",
      addedBy: "Admin",
    },
  ];

  const clubOptions = Array.from(
    new Set(attendanceData.map((item) => item.centerName))
  ).map((center) => ({
    value: center,
    label: center,
  }));

  const filteredData = attendanceData.filter((item) => {
    const matchesClub = !clubFilter || item.centerName === clubFilter.value;

    const checkDate = parseISO(item.checkInDate);
    const matchesDate =
      (!startDate && !endDate) ||
      (startDate &&
        endDate &&
        isWithinInterval(checkDate, { start: startDate, end: endDate })) ||
      (startDate && !endDate && checkDate >= startDate) ||
      (!startDate && endDate && checkDate <= endDate);

    return matchesClub && matchesDate;
  });

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Attendance</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4 items-end">
        <Select
          options={clubOptions}
          value={clubFilter}
          onChange={setClubFilter}
          placeholder="Select Center"
          isClearable
          className="w-48"
          styles={customStyles}
        />
        <div className="custom--date dob-format">
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            showMonthDropdown
            showYearDropdown
            isClearable
            maxDate={endDate || null}
            dateFormat="dd MMM yyyy"
            dropdownMode="select"
            placeholderText="From date"
            className="custom--input w-full"
          />
        </div>
        <div className="custom--date dob-format">
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            showMonthDropdown
            showYearDropdown
            isClearable
            minDate={startDate || null}
            dateFormat="dd MMM yyyy"
            dropdownMode="select"
            placeholderText="End date"
            className="custom--input w-full"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="border px-3 py-2">Member ID</th>
              <th className="border px-3 py-2">Member Name</th>
              <th className="border px-3 py-2">Check-in Date</th>
              <th className="border px-3 py-2">Check-in Time</th>
              <th className="border px-3 py-2">Check-out Time</th>
              <th className="border px-3 py-2">Center Name</th>
              <th className="border px-3 py-2">Membership Type</th>
              <th className="border px-3 py-2">Check-in Mode</th>
              <th className="border px-3 py-2">Session Type</th>
              <th className="border px-3 py-2">Trainer Name</th>
              <th className="border px-3 py-2">Status</th>
              <th className="border px-3 py-2">Added By</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((entry, idx) => (
                <tr key={idx}>
                  <td className="border px-3 py-2">{entry.memberId}</td>
                  <td className="border px-3 py-2">{entry.memberName}</td>
                  <td className="border px-3 py-2">{entry.checkInDate}</td>
                  <td className="border px-3 py-2">{entry.checkInTime}</td>
                  <td className="border px-3 py-2">{entry.checkOutTime}</td>
                  <td className="border px-3 py-2">{entry.centerName}</td>
                  <td className="border px-3 py-2">{entry.membershipType}</td>
                  <td className="border px-3 py-2">{entry.checkInMode}</td>
                  <td className="border px-3 py-2">{entry.sessionType}</td>
                  <td className="border px-3 py-2">
                    {entry.trainerName || "-"}
                  </td>
                  <td className="border px-3 py-2">{entry.attendanceStatus}</td>
                  <td className="border px-3 py-2">{entry.addedBy}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={12} className="text-center text-gray-500 py-4">
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
