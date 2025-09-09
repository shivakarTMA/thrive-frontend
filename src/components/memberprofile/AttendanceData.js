import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { parseISO, isWithinInterval, isAfter } from "date-fns";
import { FaClock } from "react-icons/fa6";

const AttendanceData = () => {
  const [clubFilter, setClubFilter] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [manualDate, setManualDate] = useState(null);
  const [manualCheckIn, setManualCheckIn] = useState(null);
  const [manualCheckOut, setManualCheckOut] = useState(null);
  const [manualRecords, setManualRecords] = useState([]);

  const attendanceData = [
    {
      checkInDate: "2025-05-25",
      checkInTime: "08:00 AM",
      checkOutTime: "10:00 AM",
    },
    {
      checkInDate: "2025-05-25",
      checkInTime: "09:00 AM",
      checkOutTime: "11:00 AM",
    },
    {
      checkInDate: "2025-05-26",
      checkInTime: "07:30 AM",
      checkOutTime: "09:00 AM",
    },
    {
      checkInDate: "2025-05-26",
      checkInTime: "10:00 AM",
      checkOutTime: "12:00 PM",
    },
    {
      checkInDate: "2025-05-27",
      checkInTime: "06:00 AM",
      checkOutTime: "08:00 AM",
    },
  ];

  const combinedData = [...attendanceData, ...manualRecords];

  const filteredData = combinedData.filter((item) => {
    const matchesClub = !clubFilter || item.centerName === clubFilter?.value;
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

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualDate || !manualCheckIn || !manualCheckOut) return;

    const today = new Date();
    const selectedDate = new Date(manualDate);
    if (isAfter(selectedDate, today)) {
      alert("You cannot select a future date.");
      return;
    }

    const formatTime = (date) =>
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newRecord = {
      checkInDate: manualDate.toISOString().split("T")[0],
      checkInTime: formatTime(manualCheckIn),
      checkOutTime: formatTime(manualCheckOut),
    };

    setManualRecords([...manualRecords, newRecord]);
    setManualDate(null);
    setManualCheckIn(null);
    setManualCheckOut(null);
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <form
        onSubmit={handleManualSubmit}
        className="p-4 mb-6 border rounded bg-gray-50"
      >
        <h3 className="text-lg font-semibold mb-2">Add Manual Attendance</h3>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <DatePicker
              selected={manualDate}
              onChange={(date) => setManualDate(date)}
              showMonthDropdown
              showYearDropdown
              maxDate={new Date()}
              dateFormat="dd MMM yyyy"
              dropdownMode="select"
              placeholderText="Select Date"
              className="border px-3 py-2 rounded w-full"
              required
            />
          </div>
          <div>
            <DatePicker
              selected={manualCheckIn}
              onChange={(date) => setManualCheckIn(date)}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={15}
              timeCaption="Check In"
              dateFormat="hh:mm aa"
              placeholderText="Check In Time"
              className="border px-3 py-2 rounded w-full"
              required
              maxDate={new Date()}
            />
          </div>
          <div>
            <DatePicker
              selected={manualCheckOut}
              onChange={(date) => setManualCheckOut(date)}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={15}
              timeCaption="Check Out"
              dateFormat="hh:mm aa"
              placeholderText="Check Out Time"
              className="border px-3 py-2 rounded w-full"
              required
              maxDate={new Date()}
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-black text-white rounded flex items-center gap-2"
          >
            <FaClock /> Clock In
          </button>
        </div>
      </form>

      <div className="overflow-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="border px-3 py-2">Check-in Date</th>
              <th className="border px-3 py-2">Check-in Time</th>
              <th className="border px-3 py-2">Check-out Time</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((entry, idx) => (
                <tr key={idx}>
                  <td className="border px-3 py-2">{entry.checkInDate}</td>
                  <td className="border px-3 py-2">{entry.checkInTime}</td>
                  <td className="border px-3 py-2">{entry.checkOutTime}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center text-gray-500 py-4">
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
