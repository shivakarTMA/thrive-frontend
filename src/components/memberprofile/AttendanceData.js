import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  parseISO,
  isWithinInterval,
  isAfter,
  endOfDay,
  format,
} from "date-fns";
import { FaClock } from "react-icons/fa6";
import { toast } from "react-toastify";

const AttendanceData = () => {
  const [clubFilter, setClubFilter] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [manualDate, setManualDate] = useState(null);
  const [manualCheckIn, setManualCheckIn] = useState(null);
  const [manualCheckOut, setManualCheckOut] = useState(null);
  const [manualRecords, setManualRecords] = useState([]);

  const [lastClockInIndex, setLastClockInIndex] = useState(null);

  const attendanceData = [
    {
      checkInDate: "2025-05-25",
      checkInTime: "08:00 AM",
      checkOutTime: "10:00 AM",
    },
    {
      checkInDate: "2025-05-26",
      checkInTime: "07:30 AM",
      checkOutTime: "09:00 AM",
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

  // ✅ Auto Clock-Out at End of Day
  useEffect(() => {
    if (lastClockInIndex === null) return;

    const record = manualRecords[lastClockInIndex];
    if (!record) return;

    const endOfDayTime = endOfDay(new Date(record.checkInDate));
    const now = new Date();

    if (now > endOfDayTime) return; // Day is already over (no need to set timeout)

    const timeout = setTimeout(() => {
      handleAutoClockOut();
    }, endOfDayTime.getTime() - now.getTime());

    return () => clearTimeout(timeout);
  }, [lastClockInIndex, manualRecords]);

  const handleClockIn = (e) => {
    e.preventDefault();

    // ✅ Require clock-out time before allowing manual submission
    if (!manualDate || !manualCheckIn) {
      toast.error("Please select a clock-date and time before submitting.");
      return;
    }

    const today = new Date();
    if (isAfter(manualDate, today)) {
      alert("You cannot select a future date.");
      return;
    }

    const formatTime = (date) =>
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newRecord = {
      checkInDate: manualDate.toISOString().split("T")[0],
      checkInTime: formatTime(manualCheckIn),
      checkOutTime: "",
    };

    const updatedRecords = [...manualRecords, newRecord];
    setManualRecords(updatedRecords);
    setLastClockInIndex(updatedRecords.length - 1);
  };

  const handleClockOut = (e) => {
    e.preventDefault();
    if (lastClockInIndex === null) return;

    // ✅ Require clock-out time before allowing manual submission
    if (!manualCheckOut) {
      toast.error("Please select a clock-out time before submitting.");
      return;
    }

    const updatedRecords = [...manualRecords];
    const formatTime = (date) =>
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    updatedRecords[lastClockInIndex].checkOutTime = manualCheckOut
      ? formatTime(manualCheckOut)
      : formatTime(new Date());

    setManualRecords(updatedRecords);

    // ✅ Reset form values after clock out
    setManualDate(null);
    setManualCheckIn(null);
    setManualCheckOut(null);
    setLastClockInIndex(null);
  };

  const handleAutoClockOut = () => {
    if (lastClockInIndex === null) return;

    const updatedRecords = [...manualRecords];
    const formatTime = (date) =>
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    updatedRecords[lastClockInIndex].checkOutTime = formatTime(
      endOfDay(new Date(updatedRecords[lastClockInIndex].checkInDate))
    );

    setManualRecords(updatedRecords);

    // ✅ Reset form after auto clock-out
    setManualDate(null);
    setManualCheckIn(null);
    setManualCheckOut(null);
    setLastClockInIndex(null);
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <form className="p-4 mb-6 border rounded">
        <h3 className="text-lg font-semibold mb-2">Add Manual Attendance</h3>

        {/* Clock In Section */}
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
              disabled={lastClockInIndex !== null}
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
              disabled={lastClockInIndex !== null}
            />
          </div>
          <button
            onClick={handleClockIn}
            disabled={lastClockInIndex !== null}
            className={`px-4 py-2 rounded flex items-center gap-2 ${
              lastClockInIndex !== null
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-black text-white"
            }`}
          >
            <FaClock /> Clock In
          </button>
        </div>

        {/* Clock Out Section */}
        {lastClockInIndex !== null && (
          <div className="flex flex-wrap gap-4 items-end mt-4">
            <div>
              <DatePicker
                selected={manualCheckOut}
                onChange={(date) => setManualCheckOut(date)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="Check Out"
                dateFormat="hh:mm aa"
                placeholderText="Select Clock Out Time"
                className="border px-3 py-2 rounded w-full"
              />
            </div>
            <button
              onClick={handleClockOut}
              className="px-4 py-2 bg-green-600 text-white rounded flex items-center gap-2"
            >
              <FaClock /> Clock Out
            </button>
          </div>
        )}
      </form>

      {/* Attendance Table */}
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
                  <td className="border px-3 py-2">
                    {entry.checkOutTime || (
                      <span className="text-gray-400 italic">Pending...</span>
                    )}
                  </td>
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
