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
    purchaseDate: "2025-02-01",
    branchLocation: "Mumbai - Andheri",
    memberId: "2004687",
    memberName: "Rahul Sharma",
    contactNumber: "9876543210",
    email: "rahul.sharma@gmail.com",
    company: "Tech Solutions Pvt Ltd",
    descriptionService: "Annual Gym Membership",
    amount: 12000,
  },
  {
    id: 2,
    club_name: "DLF Summit Plaza",
    purchaseDate: "2025-02-05",
    branchLocation: "Bangalore - Whitefield",
    memberId: "2004688",
    memberName: "Anita Verma",
    contactNumber: "9123456789",
    email: "anita.verma@gmail.com",
    company: "Infosys",
    descriptionService: "Personal Training Package",
    amount: 8000,
  },
  {
    id: 3,
    club_name: "DLF Summit Plaza",
    purchaseDate: "2025-02-10",
    branchLocation: "Delhi - Saket",
    memberId: "2004689",
    memberName: "Karan Mehta",
    contactNumber: "9988776655",
    email: "karan.mehta@gmail.com",
    company: "Freelancer",
    descriptionService: "Yoga Classes (3 Months)",
    amount: 4500,
  },
];

const AdvancePaymentsReport = () => {
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
            {`Home > Reports > Finance Reports > Advance Payments Report`}
          </p>
          <h1 className="text-3xl font-semibold">Advance Payments Report</h1>
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
                <th className="px-2 py-4 min-w-[120px]">purchase date</th>
                <th className="px-2 py-4 min-w-[170px]">branch location</th>
                <th className="px-2 py-4 min-w-[100px]">member id</th>
                <th className="px-2 py-4 min-w-[120px]">member name</th>
                <th className="px-2 py-4 min-w-[150px]">contact number</th>
                <th className="px-2 py-4 min-w-[150px]">e-mail</th>
                <th className="px-2 py-4 min-w-[170px]">company</th>
                <th className="px-2 py-4 min-w-[200px]">description service</th>
                <th className="px-2 py-4 min-w-[100px]">amount</th>
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
                    <td className="px-2 py-2">{row.purchaseDate}</td>
                    <td className="px-2 py-2">{row.branchLocation}</td>
                    <td className="px-2 py-2">{row.memberId}</td>
                    <td className="px-2 py-2">{row.memberName}</td>
                    <td className="px-2 py-2">{row.contactNumber}</td>
                    <td className="px-2 py-2">{row.email}</td>
                    <td className="px-2 py-2">{row.company}</td>
                    <td className="px-2 py-2">{row.descriptionService}</td>
                    <td className="px-2 py-2">₹{row.amount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="text-center py-4">
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

export default AdvancePaymentsReport;
