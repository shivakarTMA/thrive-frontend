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
    memberId: "MB-501",
    memberName: "Amit Sharma",
    planName: "Gold Membership",
    startDate: "01-01-2025",
    endDate: "31-12-2025",
    lastCheckInDate: "22-12-2025",
    leadSource: "Website",
    salesRepName: "Rohit Verma",
    billAmount: 12000,
    payMode: "Credit Card",
    companyName: "FitZone Gym",
    gender: "Male",
  },
  {
    club_name: "DLF Summit Plaza",
    memberId: "MB-502",
    memberName: "Neha Singh",
    planName: "Silver Membership",
    startDate: "15-03-2025",
    endDate: "14-09-2025",
    lastCheckInDate: "20-12-2025",
    leadSource: "Referral",
    salesRepName: "Anjali Mehta",
    billAmount: 8000,
    payMode: "UPI",
    companyName: "FitZone Gym",
    gender: "Female",
  },
  {
    club_name: "DLF Summit Plaza",
    memberId: "MB-503",
    memberName: "Rahul Patel",
    planName: "Platinum Membership",
    startDate: "10-02-2025",
    endDate: "09-02-2026",
    lastCheckInDate: "23-12-2025",
    leadSource: "Walk-in",
    salesRepName: "Kunal Shah",
    billAmount: 18000,
    payMode: "Cash",
    companyName: "Elite Fitness Club",
    gender: "Male",
  },
];

const InactiveClientSummaryReport = () => {
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
            {`Home > Reports > Operations Reports > Inactive Client Summary Report`}
          </p>
          <h1 className="text-3xl font-semibold">
            Inactive Client Summary Report
          </h1>
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
                <th className="px-2 py-4 min-w-[100px]">Bill Amount</th>
                <th className="px-2 py-4 min-w-[100px]">Pay Mode</th>
                <th className="px-2 py-4 min-w-[150px]">Company Name</th>
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

export default InactiveClientSummaryReport;
