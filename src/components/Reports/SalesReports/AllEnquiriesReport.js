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
    member_id: 2004689,
    club_name: "DLF Summit Plaza",
    member_name: "purnibala maibam chanu",
    mobile: "8132967600",
    service_name: "membership plan",
    service_variation: "three months plan",
    company_name: "lets farm (cyber city) building 8c",
    purchase_date: "01-03-2025",
    start_date: "03-03-2025",
    end_date: "02-06-2025",
    lead_source: "hoardings",
    sales_rep_name: "swati singh",
    bill_amount: "5700.00",
  },
];

const AllEnquiriesReport = () => {
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
            {`Home > Reports > Sales Reports > All Enquiries Report`}
          </p>
          <h1 className="text-3xl font-semibold">All Enquiries Report</h1>
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
                <th className="px-2 py-4 min-w-[100px]">Enquiry ID</th>
                <th className="px-2 py-4 min-w-[150px]">Club Name</th>
                <th className="px-2 py-4 min-w-[100px]">Enquiry Date</th>
                <th className="px-2 py-4 min-w-[150px]">Name</th>
                <th className="px-2 py-4 min-w-[120px]">Location</th>
                <th className="px-2 py-4 min-w-[80px]">Gender</th>
                <th className="px-2 py-4 min-w-[150px]">Services</th>
                <th className="px-2 py-4 min-w-[120px]">Lead Owner </th>
                <th className="px-2 py-4 min-w-[120px]">Lead Source</th>
                <th className="px-2 py-4 min-w-[120px]">Enquiry Type</th>
                <th className="px-2 py-4 min-w-[120px]">Lead Status </th>
                <th className="px-2 py-4 min-w-[100px]">Status</th>

                <th className="px-2 py-4 min-w-[150px]">Last Communication</th>
                <th className="px-2 py-4 min-w-[150px]">Last Call Status</th>

                <th className="px-2 py-4 min-w-[150px]">Next Follow-Up</th>
              </tr>
            </thead>

            <tbody>
              {data.length ? (
                data.map((row, index) => (
                  <tr
                    key={index}
                    className="bg-white border-b hover:bg-gray-50 transition"
                  >
                    <td className="px-2 py-4">3934280</td>
                    <td className="px-2 py-4">{row.club_name || "-"}</td>
                    <td className="px-2 py-4">21-03-2025</td>
                    <td className="px-2 py-4">Ravi</td>
                    <td className="px-2 py-4">--</td>
                    <td className="px-2 py-4">Male</td>
                    <td className="px-2 py-4">Membership Plan</td>
                    <td className="px-2 py-4">prerna</td>
                    <td className="px-2 py-4">Hoardings</td>
                    <td className="px-2 py-4">Walk-in</td>
                    <td className="px-2 py-4">Enquiry</td>
                    <td className="px-2 py-4">Lead</td>
                    <td className="px-2 py-4">21-03-2025</td>
                    <td className="px-2 py-4">Enquiry</td>
                    <td className="px-2 py-4">22-03-2025</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={15} className="text-center px-2 py-4">
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

export default AllEnquiriesReport;
