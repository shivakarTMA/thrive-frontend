import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addYears, subYears } from "date-fns";
import { FaCalendarDays } from "react-icons/fa6";
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
    id: 1,
    club_name: "DLF Summit Plaza",
    sequence: "SEQ-001",
    proFormaInvoiceNo: "PFI-1001",
    memberId: "M-101",
    memberName: "John Doe",
    date: "2025-01-10",
    service: "Personal Training",
    salesRepName: "Alex Smith",
    ptName: "David Lee",
    paidAmount: 5000,
    tdsAmount: 500,
  },
  {
    id: 2,
    club_name: "DLF Summit Plaza",
    sequence: "SEQ-002",
    proFormaInvoiceNo: "PFI-1002",
    memberId: "M-102",
    memberName: "Emma Watson",
    date: "2025-01-12",
    service: "Zumba Classes",
    salesRepName: "Sarah Johnson",
    ptName: "Michael Brown",
    paidAmount: 3000,
    tdsAmount: 300,
  },
  {
    id: 3,
    club_name: "DLF Summit Plaza",
    sequence: "SEQ-003",
    proFormaInvoiceNo: "PFI-1003",
    memberId: "M-103",
    memberName: "Chris Evans",
    date: "2025-01-15",
    service: "Yoga Training",
    salesRepName: "Robert King",
    ptName: "Sophia Wilson",
    paidAmount: 4000,
    tdsAmount: 400,
  },
];

const TDSReport = () => {
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
            {`Home > Reports > Finance Reports > TDS Report`}
          </p>
          <h1 className="text-3xl font-semibold">TDS Report</h1>
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
                <th className="px-2 py-4 min-w-[50px]">s.no</th>
                <th className="px-2 py-4 min-w-[150px]">Club Name</th>
                <th className="px-2 py-4 min-w-[100px]">sequence</th>
                <th className="px-2 py-4 min-w-[170px]">
                  pro forma invoice no
                </th>
                <th className="px-2 py-4 min-w-[100px]">member id</th>
                <th className="px-2 py-4 min-w-[120px]">member name</th>
                <th className="px-2 py-4 min-w-[100px]">date</th>
                <th className="px-2 py-4 min-w-[150px]">service</th>
                <th className="px-2 py-4 min-w-[130px]">sales rep name</th>
                <th className="px-2 py-4 min-w-[120px]">pt name</th>
                <th className="px-2 py-4 min-w-[100px]">paid amount</th>
                <th className="px-2 py-4 min-w-[110px]">tds amount</th>
              </tr>
            </thead>

            <tbody>
              {data.length ? (
                data.map((row, index) => (
                  <tr
                    key={index}
                    className="bg-white border-b hover:bg-gray-50"
                  >
                    <td className="px-2 py-4">{index + 1}</td>
                    <td className="px-2 py-4">{row.club_name || "-"}</td>
                    <td className="px-2 py-2">{row.sequence}</td>
                    <td className="px-2 py-2">{row.proFormaInvoiceNo}</td>
                    <td className="px-2 py-2">{row.memberId}</td>
                    <td className="px-2 py-2">{row.memberName}</td>
                    <td className="px-2 py-2">{row.date}</td>
                    <td className="px-2 py-2">{row.service}</td>
                    <td className="px-2 py-2">{row.salesRepName}</td>
                    <td className="px-2 py-2">{row.ptName}</td>
                    <td className="px-2 py-2">₹{row.paidAmount}</td>
                    <td className="px-2 py-2">₹{row.tdsAmount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={12} className="text-center py-4">
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

export default TDSReport;
