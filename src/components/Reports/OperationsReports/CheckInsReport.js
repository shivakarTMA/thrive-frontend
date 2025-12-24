import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addYears, subYears } from "date-fns";
import { FaCalendarDays, FaCircle } from "react-icons/fa6";
import Select from "react-select";
import { customStyles, filterActiveItems } from "../../../Helper/helper";
import { toast } from "react-toastify";
import { authAxios } from "../../../config/config";

const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "month_till_date", label: "Month Till Date" },
  { value: "custom", label: "Custom Date" },
];

const dummyData = [
  {
    club_name: "DLF Summit Plaza",
    membershipId: "M-001",
    name: "John Doe",
    plan: "Gold",
    memberName: "Johnathan Doe",
    checkInTime: "2025-12-23T09:15:00",
    checkOutTime: "2025-12-23T11:45:00",
  },
  {
    club_name: "DLF Summit Plaza",
    membershipId: "M-002",
    name: "Jane Smith",
    plan: "Silver",
    memberName: "Jane A. Smith",
    checkInTime: "2025-12-23T10:00:00",
    checkOutTime: "2025-12-23T12:30:00",
  },
  {
    club_name: "DLF Summit Plaza",
    membershipId: "M-003",
    name: "Alex Brown",
    plan: "Platinum",
    memberName: "Alexander Brown",
    checkInTime: "2025-12-23T08:45:00",
    checkOutTime: "2025-12-23T10:15:00",
  },
];

const CheckInsReport = () => {
  const [data] = useState(dummyData);
  const [clubList, setClubList] = useState([]);
  const [clubFilter, setClubFilter] = useState(null);

  const [dateFilter, setDateFilter] = useState(dateFilterOptions[1]);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);

  // Function to fetch club list
  const fetchClub = async (search = "") => {
    try {
      const response = await authAxios().get("/club/list", {
        params: search ? { search } : {},
      });
      const data = response.data?.data || [];
      const activeOnly = filterActiveItems(data);
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
            {`Home > Reports > Operations Reports > Check Ins`}
          </p>
          <h1 className="text-3xl font-semibold">Check Ins</h1>
        </div>
        <div className="w-fit bg-white shodow--box rounded-[10px] px-5 py-2">
          <div className="flex items-center gap-5">
            <div className="text-md font-medium text-gray-600 flex gap-2 items-center">
              <FaCircle className="text-[10px] text-[#009EB2]" /> No of persons
            </div>
            <div className="pr-2">
              <span className="text-md font-semibold">3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 items-center justify-between">
        <div className="flex gap-2 w-full">
          <div className="max-w-[180px] w-full">
            <Select
              placeholder="Date Filter"
              options={dateFilterOptions}
              value={dateFilter}
              onChange={(selected) => {
                setDateFilter(selected);
                if (selected?.value !== "custom") {
                  setCustomFrom(null);
                  setCustomTo(null);
                }
              }}
              styles={customStyles}
            />
          </div>

          {dateFilter?.value === "custom" && (
            <>
              <div className="custom--date dob-format flex-1 max-w-[180px] w-full">
                <span className="absolute z-[1] mt-[11px] ml-[15px]">
                  <FaCalendarDays />
                </span>
                <DatePicker
                  selected={customFrom}
                  onChange={setCustomFrom}
                  placeholderText="From Date"
                  className="custom--input w-full input--icon"
                  minDate={subYears(new Date(), 20)}
                  maxDate={addYears(new Date(), 0)}
                  dateFormat="dd-MM-yyyy"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                />
              </div>

              <div className="custom--date dob-format flex-1 max-w-[180px] w-full">
                <span className="absolute z-[1] mt-[11px] ml-[15px]">
                  <FaCalendarDays />
                </span>
                <DatePicker
                  selected={customTo}
                  onChange={setCustomTo}
                  placeholderText="To Date"
                  className="custom--input w-full input--icon"
                  minDate={subYears(new Date(), 20)}
                  maxDate={addYears(new Date(), 0)}
                  dateFormat="dd-MM-yyyy"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                />
              </div>
            </>
          )}
          <div className="w-full max-w-[200px]">
            <Select
              placeholder="Filter by club"
              value={clubOptions.find((o) => o.value === clubFilter) || null}
              options={clubOptions}
              onChange={(option) => setClubFilter(option?.value)}
              isClearable
              styles={customStyles}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="w-full p-3 border bg-white shodow--box rounded-[10px]">
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-2 py-4 min-w-[150px]">Club Name</th>
                <th className="px-2 py-4 min-w-[50px]">Membership ID</th>
                <th className="px-2 py-4 min-w-[100px]">Name</th>
                <th className="px-2 py-4 min-w-[100px]">Plan</th>
                <th className="px-2 py-4 min-w-[100px]">member name</th>
                <th className="px-2 py-4 min-w-[130px]">Check In time</th>
                <th className="px-2 py-4 min-w-[120px]">Check out Time</th>
              </tr>
            </thead>

            <tbody>
              {data.length ? (
                data.map((row, index) => (
                  <tr
                    key={index}
                    className="bg-white border-b hover:bg-gray-50"
                  >
                    <td className="px-2 py-4">{row.club_name || "-"}</td>
                    <td className="px-2 py-4">{row.membershipId}</td>
                    <td className="px-2 py-4">{row.name}</td>
                    <td className="px-2 py-4">{row.plan}</td>
                    <td className="px-2 py-4">{row.memberName}</td>
                    <td className="px-2 py-4">{row.checkInTime}</td>
                    <td className="px-2 py-4">{row.checkOutTime}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-4">
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

export default CheckInsReport;
