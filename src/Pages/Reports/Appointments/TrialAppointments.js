// Import required libraries and components
import React, { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addYears, subYears } from "date-fns";
import { FaCalendarDays } from "react-icons/fa6";
import { customStyles } from "../../../Helper/helper";
import Select from "react-select";
import TrialAppointmentPanel from "../../../components/FilterPanel/TrialAppointmentPanel";
import { trialAppointments } from "../../../DummyData/DummyData"; // Dummy data file
import viewIcon from "../../../assets/images/icons/eye.svg";
import printIcon from "../../../assets/images/icons/print-icon.svg";
import mailIcon from "../../../assets/images/icons/mail-icon.svg";
import { useLocation } from "react-router-dom";
import {
  parse,
  isWithinInterval,
  startOfToday,
  startOfMonth,
  subDays,
  startOfDay,
  endOfDay,
} from "date-fns";

// Date filter dropdown options
const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "month_till_date", label: "Month Till Date" },
  { value: "custom", label: "Custom Date" },
];

const TrialAppointments = () => {

  const [data, setData] = useState(trialAppointments);
  const [dateFilter, setDateFilter] = useState(dateFilterOptions[1]);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);

  const [selectedIds, setSelectedIds] = useState([]);

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filterValue = params.get('date');
    const customFromValue = params.get('customFrom');
    const customToValue = params.get('customTo');

    if (filterValue) {
      const matchedOption = dateFilterOptions.find(
        (option) => option.value === filterValue
      );
      if (matchedOption) {
        setDateFilter(matchedOption);
      }
    }
    if (customFromValue) {
      setCustomFrom(customFromValue);
    }
    if (customToValue) {
      setCustomTo(customToValue);
    }

  }, [location.search]);

  // Extract query params
  const queryParams = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      date: params.get("date"),
      status: params.get("status"),
      customFrom: params.get('customFrom'),
      customTo: params.get('customTo'),
    };
  }, [location.search]);

  // State for status filter
  const [itemStatus, setItemStatus] = useState(null);

  // Auto-apply status filter if in URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const statusParam = searchParams.get("status");
    if (statusParam) {
      setItemStatus({ value: statusParam, label: statusParam });
    }
  }, [location.search]);

  // Helper function to calculate date range
  const getDateRangeFromFilter = (filterValue) => {
    const today = new Date();

    switch (filterValue) {
      case "today":
        return { from: startOfDay(today), to: endOfDay(today) };
      case "last_7_days":
        return { from: startOfDay(subDays(today, 6)), to: endOfDay(today) };
      case "month_till_date":
        return { from: startOfDay(startOfMonth(today)), to: endOfDay(today) };
      default:
        return null;
    }
  };

  // Filter data dynamically
  useEffect(() => {
    let filteredData = [...trialAppointments];

     // Handle custom date filter
  if (dateFilter?.value === "custom") {
    const from = customFrom ? startOfDay(customFrom) : null;
    const to = customTo ? endOfDay(customTo) : null;

    if (from && to) {
      filteredData = filteredData.filter((item) => {
        const enquiryDate = parse(item.enquiryDate, "dd/MM/yyyy", new Date());
        return isWithinInterval(enquiryDate, { start: from, end: to });
      });
    }
  } else {
    const range = getDateRangeFromFilter(dateFilter?.value);

    if (range) {
      filteredData = filteredData.filter((item) => {
        const enquiryDate = parse(item.enquiryDate, "dd/MM/yyyy", new Date());

        if (isNaN(enquiryDate)) return false;

        return isWithinInterval(enquiryDate, {
          start: range.from,
          end: range.to,
        });
      });
    }
  }

    // Apply status filter
    if (queryParams.status) {
      filteredData = filteredData.filter(
        (item) =>
          item.status?.toLowerCase() === queryParams.status?.toLowerCase()
      );
    }

    setData(filteredData);
  }, [dateFilter, queryParams.date, queryParams.status, customFrom, customTo]);

  // Function to calculate stats dynamically
  const calculateStats = () => {
    const scheduled = data.filter((item) => item.status === "Scheduled").length;
    const completed = data.filter((item) => item.status === "Completed").length;
    const noShow = data.filter((item) => item.status === "No-Show").length;

    return { scheduled, completed, noShow };
  };

  // Call stats function
  const { scheduled, completed, noShow } = calculateStats();

  // Handle row selection
  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <>
      <div className="page--content">
        {/* Page heading */}
        <div className="flex items-end justify-between gap-2 mb-2">
          <div className="title--breadcrumbs">
            <p className="text-sm">{`Home > Reports > Appointments > Trial Appointments`}</p>
            <h1 className="text-3xl font-semibold">Trial Appointments</h1>
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
                className="w-full"
              />
            </div>

            {/* Custom Date Range */}
            {dateFilter?.value === "custom" && (
              <>
                <div className="custom--date flex-1 max-w-[180px] w-full">
                  <span className="absolute z-[1] mt-[15px] ml-[15px]">
                    <FaCalendarDays />
                  </span>
                  <DatePicker
                    selected={customFrom}
                    onChange={(date) => setCustomFrom(date)}
                    placeholderText="From Date"
                    className="custom--input w-full input--icon"
                    minDate={subYears(new Date(), 20)}
                    maxDate={addYears(new Date(), 0)}
                    dateFormat="dd/MM/yyyy"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                  />
                </div>
                <div className="custom--date flex-1 max-w-[180px] w-full">
                  <span className="absolute z-[1] mt-[15px] ml-[15px]">
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
                    dateFormat="dd/MM/yyyy"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Dynamic Statistics */}
        <div className="grid grid-cols-3 gap-5 mb-5 p-3 border bg-white shodow--box rounded-[10px]">
          <div className="border rounded-[5px] overflow-hidden w-full">
            <div className="flex gap-1 justify-center bg-[#F1F1F1] p-4 py-3">
              <div className="text-lg font-bold">Scheduled</div>
            </div>
            <div>
              <p className="text-3xl font-bold p-2 text-center py-5">{scheduled}</p>
            </div>
          </div>
          <div className="border rounded-[5px] overflow-hidden w-full">
            <div className="flex gap-1 justify-center bg-[#F1F1F1] p-4 py-3">
              <div className="text-lg font-bold">Completed</div>
            </div>
            <div>
              <p className="text-3xl font-bold p-2 text-center py-5">{completed}</p>
            </div>
          </div>
          <div className="border rounded-[5px] overflow-hidden w-full">
            <div className="flex gap-1 justify-center bg-[#F1F1F1] p-4 py-3">
              <div className="text-lg font-bold">No Show</div>
            </div>
            <div>
              <p className="text-3xl font-bold p-2 text-center py-5">{noShow}</p>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="w-full p-3 border bg-white shodow--box rounded-[10px]">
          <div className="flex items-start gap-3 justify-between w-full mb-3 border-b border-b-[#D4D4D4] pb-3">
            <div>
              <TrialAppointmentPanel
                itemStatus={itemStatus}
                setItemStatus={setItemStatus}
              />
            </div>
          </div>

          <div className="table--data--bottom w-full">
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-2 py-4 min-w-[50px]">#</th>
                    <th className="px-2 py-4 min-w-[110px] max-w-fit">
                      Enquiry Date
                    </th>
                    <th className="px-2 py-4 min-w-[170px] max-w-fit">
                      Appointment Category
                    </th>
                    <th className="px-2 py-4 min-w-[170px] max-w-fit">
                      Appointment Name
                    </th>
                    <th className="px-2 py-4 min-w-[170px] max-w-fit">
                      Lead Name
                    </th>
                    <th className="px-2 py-4 min-w-[170px] max-w-fit">
                      Date & Time
                    </th>
                    <th className="px-2 py-4 min-w-[170px] max-w-fit">
                      Staff Name
                    </th>
                    <th className="px-2 py-4 min-w-[170px] max-w-fit">
                      Scheduled By
                    </th>
                    <th className="px-2 py-4 min-w-[120px] max-w-fit">Status</th>
                    <th className="px-2 py-4 min-w-[200px] max-w-fit">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, idx) => (
                    <tr
                      key={row.id}
                      className="bg-white border-b hover:bg-gray-50 border-gray-200"
                    >
                      <td className="px-2 py-4">
                        <div className="flex items-center custom--checkbox--2">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            checked={selectedIds.includes(row.id)}
                            onChange={() => handleCheckboxChange(row.id)}
                          />
                          <span className="checkmark--custom"></span>
                        </div>
                      </td>
                      <td className="px-2 py-4">{row?.enquiryDate}</td>
                      <td className="px-2 py-4">{row?.appointmentCategory}</td>
                      <td className="px-2 py-4">{row?.appointmentName}</td>
                      <td className="px-2 py-4">{row?.leadName}</td>
                      <td className="px-2 py-4">{row.dateTime}</td>
                      <td className="px-2 py-4">{row.staffName}</td>
                      <td className="px-2 py-4">{row.scheduledBy}</td>
                      <td className="px-2 py-4">{row.status}</td>
                      <td className="px-2 py-4">
                        <div className="flex">
                          <div className="bg-[#F1F1F1] border border-[#D4D4D4] rounded-l-[5px] w-[32px] h-[32px] flex items-center justify-center cursor-pointer">
                            <img src={viewIcon} />
                          </div>
                          <div
                            className={`bg-[#F1F1F1] border border-[#D4D4D4] rounded-[0px] w-[32px] h-[32px] flex items-center justify-center`}
                          >
                            <img src={printIcon} />
                          </div>
                          <div
                            className={`bg-[#F1F1F1] border border-[#D4D4D4] rounded-r-[5px] w-[32px] h-[32px] flex items-center justify-center`}
                          >
                            <img src={mailIcon} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TrialAppointments;
