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
    memberId: "PT-101",
    memberName: "Amit Sharma",
    status: "Active",
    salesRep: "Rohit Verma",
    personalTrainerName: "Sandeep Yadav",
    planName: "Personal Training Gold",
    planType: "30 Sessions",
    amount: 30000,
    expiryDate: "25-01-2026",
    lastCheckInDateForPT: "20-12-2025",
    totalSessions: 30,
    utilized: 18,
    balance: 12,
    lastCheckInDate: "22-12-2025",
    renewalDone: "N",
    paymentLink: "Send Link",
  },
  {
    club_name: "DLF Summit Plaza",
    memberId: "PT-102",
    memberName: "Neha Singh",
    status: "Expiring Soon",
    salesRep: "Anjali Mehta",
    personalTrainerName: "Pooja Nair",
    planName: "Personal Training Silver",
    planType: "20 Sessions",
    amount: 20000,
    expiryDate: "05-01-2026",
    lastCheckInDateForPT: "18-12-2025",
    totalSessions: 20,
    utilized: 15,
    balance: 5,
    lastCheckInDate: "19-12-2025",
    renewalDone: "N",
    paymentLink: "Pending",
  },
  {
    club_name: "DLF Summit Plaza",
    memberId: "PT-103",
    memberName: "Rahul Patel",
    status: "Expired",
    salesRep: "Kunal Shah",
    personalTrainerName: "Aakash Jain",
    planName: "Personal Training Basic",
    planType: "10 Sessions",
    amount: 10000,
    expiryDate: "10-12-2025",
    lastCheckInDateForPT: "05-12-2025",
    totalSessions: 10,
    utilized: 10,
    balance: 0,
    lastCheckInDate: "06-12-2025",
    renewalDone: "Y",
    paymentLink: "Paid",
  },
];

const PtExpiryReport = () => {
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
            {`Home > Reports > Operations Reports > PT Expiry Report`}
          </p>
          <h1 className="text-3xl font-semibold">PT Expiry Report</h1>
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
                <th className="px-2 py-4 min-w-[170px]">
                  Personal Trainer Name
                </th>
                <th className="px-2 py-4 min-w-[160px]">Plan Name</th>
                <th className="px-2 py-4 min-w-[120px]">Plan Type</th>
                <th className="px-2 py-4 min-w-[80px]">Amount</th>
                <th className="px-2 py-4 min-w-[100px]">Expiry Date</th>
                <th className="px-2 py-4 min-w-[200px]">
                  Last Check-in Date for PT
                </th>
                <th className="px-2 py-4 min-w-[120px]">Total Sessions</th>
                <th className="px-2 py-4 min-w-[100px]">Utilized</th>
                <th className="px-2 py-4 min-w-[100px]">Balance</th>
                <th className="px-2 py-4 min-w-[150px]">Last Check-in Date</th>
                <th className="px-2 py-4 min-w-[150px]">Renewal Done (Y/N)</th>
                <th className="px-2 py-4 min-w-[100px]">Payment Link</th>
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

                    <td className="px-2 py-4 flex items-center gap-2">
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
                    <td className="px-2 py-4">{row.personalTrainerName}</td>
                    <td className="px-2 py-4">{row.planName}</td>
                    <td className="px-2 py-4">{row.planType}</td>
                    <td className="px-2 py-4">₹{row.amount}</td>
                    <td className="px-2 py-4">{row.expiryDate}</td>
                    <td className="px-2 py-4">{row.lastCheckInDateForPT}</td>
                    <td className="px-2 py-4">{row.totalSessions}</td>
                    <td className="px-2 py-4">{row.utilized}</td>
                    <td className="px-2 py-4">{row.balance}</td>
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={16} className="text-center py-4">
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

export default PtExpiryReport;
