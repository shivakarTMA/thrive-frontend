import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addYears, subYears, format } from "date-fns";
import { FaCalendarDays } from "react-icons/fa6";
import { authAxios } from "../../../config/config";
import { customStyles, filterActiveItems } from "../../../Helper/helper";
import { toast } from "react-toastify";
import Select from "react-select";

const AttendanceHeatmapReport = () => {
  const [clubList, setClubList] = useState([]);
  const [clubFilter, setClubFilter] = useState(null);

  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);

  // Dummy attendance data to mimic the screenshot table
  const attendanceData = [
    { timeRange: "12:01 AM To 01:00 AM", checkIns: 0 },
    { timeRange: "01:00 AM To 02:00 AM", checkIns: 0 },
    { timeRange: "02:00 AM To 03:00 AM", checkIns: 0 },
    { timeRange: "03:00 AM To 04:00 AM", checkIns: 0 },
    { timeRange: "04:00 AM To 05:00 AM", checkIns: 0 },
    { timeRange: "05:00 AM To 06:00 AM", checkIns: 0 },
  ];

  // Function to fetch club list
  const fetchClub = async (search = "") => {
    try {
      const response = await authAxios().get("/club/list", {
        params: search ? { search } : {},
      });
      const data = response.data?.data || [];
      const activeOnly = filterActiveItems(data);
      if (activeOnly.length === 1) {
        setClubFilter(activeOnly[0].id);
      }
      setClubList(activeOnly);
    } catch (error) {
      toast.error("Failed to fetch clubs");
    }
  };
  // Function to fetch role list

  useEffect(() => {
    fetchClub();
  }, []);

  const clubOptions = clubList.map((item) => ({
    label: item.name,
    value: item.id,
  }));

  return (
    <div className="page--content">
      {/* Header */}
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">
            {`Home > Reports > Operations Reports > Attendance Heat Map`}
          </p>
          <h1 className="text-3xl font-semibold">Attendance Heat Map</h1>
        </div>
      </div>

      {/* Date Range Picker and Buttons */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-fit min-w-[200px]">
          <Select
            placeholder="Filter by club"
            value={clubOptions.find((o) => o.value === clubFilter) || null}
            options={clubOptions}
            onChange={(option) => setClubFilter(option?.value)}
            styles={customStyles}
            className="w-full"
          />
        </div>

        <div className="custom--date dob-format flex-1 max-w-[180px] w-full">
          <FaCalendarDays className="absolute z-[1] mt-[11px] ml-[15px]" />
          <DatePicker
            selected={customFrom}
            onChange={(date) => {
              setCustomFrom(date);
              setCustomTo(null); // ✅ reset To Date if From Date changes
            }}
            placeholderText="From Date"
            className="custom--input w-full input--icon"
            dateFormat="dd-MM-yyyy"
            minDate={subYears(new Date(), 20)}
            maxDate={addYears(new Date(), 0)}
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
          />
        </div>

        <div className="custom--date dob-format flex-1 max-w-[180px] w-full">
          <FaCalendarDays className="absolute z-[1] mt-[11px] ml-[15px]" />
          <DatePicker
            selected={customTo}
            onChange={setCustomTo}
            placeholderText="To Date"
            className="custom--input w-full input--icon"
            dateFormat="dd-MM-yyyy"
            minDate={customFrom || subYears(new Date(), 20)}
            maxDate={addYears(new Date(), 0)}
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            disabled={!customFrom}
          />
        </div>

        <button className="bg-black text-white font-semibold py-2 px-4 rounded">
          Go
        </button>

        {/* <button className="bg-black text-white font-semibold py-2 px-4 rounded">
          Export Excel
        </button> */}
      </div>

      {/* Attendance Table */}
      <div className="w-full p-3 border bg-white shodow--box rounded-[10px]">
        <div className="overflow-x-auto border rounded shadow-sm bg-white">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="py-3 px-4 min-w-[250px]">Time Range</th>
                <th className="py-3 px-4 min-w-[120px]">Check-Ins</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.length ? (
                attendanceData.map((item, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{item.timeRange}</td>
                    <td className="py-3 px-4">{item.checkIns}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="text-center py-4">
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceHeatmapReport;
