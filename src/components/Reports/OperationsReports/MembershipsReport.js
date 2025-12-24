import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addYears, subYears } from "date-fns";
import { FaCalendarDays, FaCircle } from "react-icons/fa6";
import Select from "react-select";
import { customStyles, filterActiveItems } from "../../../Helper/helper";
import { authAxios } from "../../../config/config";
import { toast } from "react-toastify";

const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "month_till_date", label: "Month Till Date" },
  { value: "custom", label: "Custom Date" },
];

const dummyData = [
  {
    club_name: "DLF Summit Plaza",
    memberId: "MB-1001",
    memberName: "Rahul Sharma",
    planName: "Gold Membership",
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    lastCheckInDate: "2025-12-20",
    leadSource: "Website",
    salesRepName: "Anita Verma",
    billAmount: 12000,
    payMode: "Credit Card",
    companyName: "FitLife Gym",
    gender: "Male",
  },
  {
    club_name: "DLF Summit Plaza",
    memberId: "MB-1002",
    memberName: "Priya Mehta",
    planName: "Silver Membership",
    startDate: "2025-03-15",
    endDate: "2025-09-14",
    lastCheckInDate: "2025-12-18",
    leadSource: "Referral",
    salesRepName: "Rohit Singh",
    billAmount: 8000,
    payMode: "UPI",
    companyName: "FitLife Gym",
    gender: "Female",
  },
  {
    club_name: "DLF Summit Plaza",
    memberId: "MB-1003",
    memberName: "Amit Patel",
    planName: "Platinum Membership",
    startDate: "2025-02-10",
    endDate: "2026-02-09",
    lastCheckInDate: "2025-12-22",
    leadSource: "Walk-in",
    salesRepName: "Neha Kapoor",
    billAmount: 18000,
    payMode: "Cash",
    companyName: "Elite Fitness Club",
    gender: "Male",
  },
  {
    club_name: "DLF Summit Plaza",
    memberId: "MB-1004",
    memberName: "Sneha Iyer",
    planName: "Monthly Membership",
    startDate: "2025-12-01",
    endDate: "2025-12-31",
    lastCheckInDate: "2025-12-23",
    leadSource: "Instagram",
    salesRepName: "Arjun Malhotra",
    billAmount: 2500,
    payMode: "Debit Card",
    companyName: "Urban Gym",
    gender: "Female",
  },
];

const MembershipsReport = () => {
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
            {`Home > Reports > Operations Reports > Memberships Report`}
          </p>
          <h1 className="text-3xl font-semibold">Memberships Report</h1>
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
                <th className="px-2 py-4 min-w-[100px]">Member ID</th>
                <th className="px-2 py-4 min-w-[120px]">Member Name</th>
                <th className="px-2 py-4 min-w-[150px]">Plan Name</th>
                <th className="px-2 py-4 min-w-[100px]">Start Date</th>
                <th className="px-2 py-4 min-w-[100px]">End Date</th>
                <th className="px-2 py-4 min-w-[150px]">Last Check-in Date</th>
                <th className="px-2 py-4 min-w-[120px]">Lead Source</th>
                <th className="px-2 py-4 min-w-[120px]">Sales Rep Name</th>
                <th className="px-2 py-4 min-w-[120px]">Bill Amount</th>
                <th className="px-2 py-4 min-w-[120px]">Pay Mode</th>
                <th className="px-2 py-4 min-w-[120px]">Company Name</th>
                <th className="px-2 py-4 min-w-[100px]">Gender</th>
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
                    <td className="px-2 py-4">{row.memberId}</td>
                    <td className="px-2 py-4">{row.memberName}</td>
                    <td className="px-2 py-4">{row.planName}</td>
                    <td className="px-2 py-4">{row.startDate}</td>
                    <td className="px-2 py-4">{row.endDate}</td>
                    <td className="px-2 py-4">{row.lastCheckInDate}</td>
                    <td className="px-2 py-4">{row.leadSource}</td>
                    <td className="px-2 py-4">{row.salesRepName}</td>
                    <td className="px-2 py-4">₹{row.billAmount}</td>
                    <td className="px-2 py-4">{row.payMode}</td>
                    <td className="px-2 py-4">{row.companyName}</td>
                    <td className="px-2 py-4">{row.gender}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={13} className="text-center py-4">
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

export default MembershipsReport;
