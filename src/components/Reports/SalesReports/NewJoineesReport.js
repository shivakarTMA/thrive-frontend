import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addYears, subYears } from "date-fns";
import { FaCalendarDays, FaCircle } from "react-icons/fa6";
import { customStyles, filterActiveItems } from "../../../Helper/helper";
import Select from "react-select";
import { authAxios } from "../../../config/config";
import { toast } from "react-toastify";

const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "month_till_date", label: "Month Till Date" },
  { value: "custom", label: "Custom Date" },
];

const dummayData = [
  {
    id: 1,
    club_name: "DLF Summit Plaza",
    member_id: 2050141,
    member_name: "avantika",
    mobile: "9625997172",
    service_name: "membership plan",
    service_variation: "three months plan",
    company_name: "ogilvy",
    invoice_id: "mar7-2025",
    purchase_date: "03-03-2025",
    start_date: "05-03-2025",
    end_date: "04-06-2025",
    total_checkins: 5,
    lead_source: "hoardings",
    sales_rep_name: "prerna",
    bill_amount: "5700.00",
    status: "ACTIVE",
  },
];

const NewJoineesReport = () => {
  const [data, setData] = useState(dummayData);
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
    <>
      <div className="page--content">
        <div className="flex items-end justify-between gap-2 mb-5">
          <div className="title--breadcrumbs">
            <p className="text-sm">{`Home >  Reports >  Sales Reports > New Joinees Report`}</p>
            <h1 className="text-3xl font-semibold">New Joinees Report</h1>
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
                // isClearable
                styles={customStyles}
                className="w-full"
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
                    onChange={(date) => setCustomFrom(date)}
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
                    onChange={(date) => setCustomTo(date)}
                    placeholderText="To Date"
                    className="custom--input w-full input--icon"
                    minDate={subYears(new Date(), 20)}
                    maxDate={addYears(new Date(), 0)}
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    dateFormat="dd-MM-yyyy"
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

        <div className="w-full p-3 border bg-white shodow--box rounded-[10px]">
          <div className="table--data--bottom w-full">
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-2 py-4 min-w-[50px]">S.no</th>
                    <th className="px-2 py-4 min-w-[150px]">Club Name</th>
                    <th className="px-2 py-4 min-w-[100px]">Member ID</th>
                    <th className="px-2 py-4 min-w-[150px]">Member Name</th>
                    <th className="px-2 py-4 min-w-[150px]">Service</th>
                    <th className="px-2 py-4 min-w-[150px]">
                      Service Variation
                    </th>
                    <th className="px-2 py-4 min-w-[130px]">Invoice ID</th>
                    <th className="px-2 py-4 min-w-[150px]">Purchase Date</th>
                    <th className="px-2 py-4 min-w-[120px]">Start Date</th>
                    <th className="px-2 py-4 min-w-[120px]">End Date</th>
                    <th className="px-2 py-4 min-w-[120px]">Total Check-ins</th>
                    <th className="px-2 py-4 min-w-[120px]">Lead Source</th>
                    <th className="px-2 py-4 min-w-[150px]">Sales Rep Name</th>
                    <th className="px-2 py-4 min-w-[100px]">Bill Amount</th>
                    <th className="px-2 py-4">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {data.length ? (
                    data.map((row, index) => (
                      <tr
                        key={index}
                        className="group bg-white border-b hover:bg-gray-50 transition duration-700"
                      >
                        <td className="px-2 py-4">{index + 1}</td>
                        <td className="px-2 py-4">{row.club_name || "-"}</td>
                        <td className="px-2 py-4">{row.member_id || "-"}</td>
                        <td className="px-2 py-4">{row.member_name || "-"}</td>
                        <td className="px-2 py-4">{row.service_name || "-"}</td>
                        <td className="px-2 py-4">
                          {row.service_variation || "-"}
                        </td>

                        <td className="px-2 py-4">{row.invoice_id || "-"}</td>
                        <td className="px-2 py-4">
                          {row.purchase_date || "-"}
                        </td>
                        <td className="px-2 py-4">{row.start_date || "-"}</td>
                        <td className="px-2 py-4">{row.end_date || "-"}</td>
                        <td className="px-2 py-4">
                          {row.total_checkins || "-"}
                        </td>
                        <td className="px-2 py-4">{row.lead_source || "-"}</td>
                        <td className="px-2 py-4">
                          {row.sales_rep_name || "-"}
                        </td>
                        <td className="px-2 py-4">₹{row.bill_amount || "-"}</td>
                        <td className="px-2 py-4">
                          <span
                            className={`
                                flex items-center justify-between gap-1 rounded-full min-h-[30px] px-3 text-sm w-fit
                            ${
                              row?.status !== "ACTIVE"
                                ? "bg-[#EEEEEE]"
                                : "bg-[#E8FFE6] text-[#138808]"
                            }
                            `}
                          >
                            <FaCircle className="text-[10px]" /> {row?.status}
                          </span>
                        </td>
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
      </div>
    </>
  );
};

export default NewJoineesReport;
