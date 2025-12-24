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
    memberId: "MB-2001",
    memberName: "Amit Sharma",
    status: "Active",
    salesRep: "Rohit Verma",
    generalTrainer: "Sandeep Yadav",
    planName: "Gold Membership",
    planType: "Annual",
    amount: 15000,
    expiryDate: "25-12-2025",
    lastCheckInDate: "20-12-2025",
    renewalDone: "N",
    paymentLink: "Pending",
    companyName: "FitZone Gym",
    gender: "Male",
  },
  {
    club_name: "DLF Summit Plaza",
    memberId: "MB-2002",
    memberName: "Neha Singh",
    status: "Expiring Soon",
    salesRep: "Anjali Mehta",
    generalTrainer: "Pooja Nair",
    planName: "Silver Membership",
    planType: "6 Months",
    amount: 9000,
    expiryDate: "30-12-2025",
    lastCheckInDate: "22-12-2025",
    renewalDone: "N",
    paymentLink: "Sent",
    companyName: "FitZone Gym",
    gender: "Female",
  },
  {
    club_name: "DLF Summit Plaza",
    memberId: "MB-2003",
    memberName: "Rahul Patel",
    status: "Expired",
    salesRep: "Kunal Shah",
    generalTrainer: "Aakash Jain",
    planName: "Monthly Membership",
    planType: "Monthly",
    amount: 2500,
    expiryDate: "15-12-2025",
    lastCheckInDate: "10-12-2025",
    renewalDone: "Y",
    paymentLink: "Paid",
    companyName: "Urban Fitness",
    gender: "Male",
  },
  {
    club_name: "DLF Summit Plaza",
    memberId: "MB-2004",
    memberName: "Sneha Iyer",
    status: "Active",
    salesRep: "Arjun Malhotra",
    generalTrainer: "Ritika Das",
    planName: "Platinum Membership",
    planType: "Annual",
    amount: 22000,
    expiryDate: "10-01-2026",
    lastCheckInDate: "23-12-2025",
    renewalDone: "N",
    paymentLink: "Sent",
    companyName: "Elite Fitness Club",
    gender: "Female",
  },
];

const MembershipExpiryReport = () => {
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
            {`Home > Reports > Operations Reports > Membership Expiry Report`}
          </p>
          <h1 className="text-3xl font-semibold">Membership Expiry Report</h1>
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
                <th className="px-2 py-4 min-w-[130px]">Status</th>
                <th className="px-2 py-4 min-w-[130px]">Sales Rep</th>
                <th className="px-2 py-4 min-w-[130px]">General Trainer</th>
                <th className="px-2 py-4 min-w-[150px]">Plan Name</th>
                <th className="px-2 py-4 min-w-[120px]">Plan Type</th>
                <th className="px-2 py-4 min-w-[120px]">Amount</th>
                <th className="px-2 py-4 min-w-[120px]">Expiry Date</th>
                <th className="px-2 py-4 min-w-[150px]">Last Check-in Date</th>
                <th className="px-2 py-4 min-w-[150px]">Renewal Done (Y/N)</th>
                <th className="px-2 py-4 min-w-[120px]">Payment Link</th>
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
                    <td className="px-2 py-4 flex items-center gap-1">
                      <FaCircle
                        className={`text-xs ${
                          row.status === "Active"
                            ? "text-green-500"
                            : row.status === "Expiring Soon"
                            ? "text-yellow-500"
                            : "text-red-500"
                        }`}
                      />
                      {row.status}
                    </td>
                    <td className="px-2 py-4">{row.salesRep}</td>
                    <td className="px-2 py-4">{row.generalTrainer}</td>
                    <td className="px-2 py-4">{row.planName}</td>
                    <td className="px-2 py-4">{row.planType}</td>
                    <td className="px-2 py-4">₹{row.amount}</td>
                    <td className="px-2 py-4">{row.expiryDate}</td>
                    <td className="px-2 py-4">{row.lastCheckInDate}</td>
                    <td className="px-2 py-4 flex items-center justify-center gap-1">
                      <FaCircle
                        className={`text-xs ${
                          row.renewalDone === "Y"
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      />
                      {row.renewalDone}
                    </td>
                    <td className="px-2 py-4">
                      <button
                        type="button"
                        className="px-3 py-1 bg-black text-white rounded flex items-center gap-2 !text-[13px]"
                      >
                        Send Link
                      </button>
                    </td>
                    <td className="px-2 py-4">{row.companyName}</td>
                    <td className="px-2 py-4">{row.gender}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={15} className="text-center py-4">
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

export default MembershipExpiryReport;
