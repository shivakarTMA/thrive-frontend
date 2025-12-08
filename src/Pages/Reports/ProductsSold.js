import React, { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addYears, subYears } from "date-fns";
import { FaCalendarDays } from "react-icons/fa6";
import { customStyles } from "../../Helper/helper";
import Select from "react-select";
import TrialAppointmentPanel from "../../components/FilterPanel/TrialAppointmentPanel";
import { productsSold } from "../../DummyData/DummyData";
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

const ProductsSold = () => {
  const [data, setData] = useState(productsSold);
  const [dateFilter, setDateFilter] = useState(dateFilterOptions[1]);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filterValue = params.get("date");
    const customFromValue = params.get("customFrom");
    const customToValue = params.get("customTo");

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
      customFrom: params.get("customFrom"),
      customTo: params.get("customTo"),
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
    let filteredData = [...productsSold];

    // Handle custom date filter
    if (dateFilter?.value === "custom") {
      const from = customFrom ? startOfDay(customFrom) : null;
      const to = customTo ? endOfDay(customTo) : null;

      if (from && to) {
        filteredData = filteredData.filter((item) => {
          const purchaseDate = parse(item.purchaseDate, "dd/MM/yyyy", new Date());
          return isWithinInterval(purchaseDate, { start: from, end: to });
        });
      }
    } else {
      const range = getDateRangeFromFilter(dateFilter?.value);

      if (range) {
        filteredData = filteredData.filter((item) => {
          const purchaseDate = parse(item.purchaseDate, "dd/MM/yyyy", new Date());

          if (isNaN(purchaseDate)) return false;

          return isWithinInterval(purchaseDate, {
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
  }, [dateFilter, queryParams.status, customFrom, customTo]);

  console.log(dateFilter?.value, "dateFilter");

  // Function to calculate stats dynamically
  const calculateStats = () => {
    // Get the correct date range for the current date filter
    const { from, to } = getDateRangeFromFilter(dateFilter?.value) || {
    from: customFrom ? startOfDay(customFrom) : null,
    to: customTo ? endOfDay(customTo) : null,
  };

    console.log("Filtering from:", from);
    console.log("Filtering to:", to);

    let filteredData = data.filter((item) => {
      const purchaseDate = parse(item.purchaseDate, "dd/MM/yyyy", new Date());

      console.log("Parsed purchaseDate:", purchaseDate);
      console.log(
        "Checking date in range:",
        isWithinInterval(purchaseDate, { start: from, end: to })
      );

      // Check if date is within the range if the range is defined
      const dateInRange =
        from && to
          ? isWithinInterval(purchaseDate, { start: from, end: to })
          : true;

      return dateInRange // Make sure status exists and is correctly matched
    });

    console.log("Filtered Data Length:", filteredData.length);

    const totalCheckIn = filteredData.length;
    const totalUniqueCheckIn = filteredData.length;
    const totalUniqueMembers = filteredData.length;

    return { totalCheckIn, totalUniqueCheckIn, totalUniqueMembers };
  };

  // Call stats function
  const { totalCheckIn, totalUniqueCheckIn, totalUniqueMembers } =
    calculateStats();

  console.log("Total Check-In: ", totalCheckIn);
  console.log("Total Unique Check-In: ", totalUniqueCheckIn);
  console.log("Total Unique No-Show: ", totalUniqueMembers);

  return (
    <>
      <div className="page--content">
        {/* Page heading */}
        <div className="flex items-end justify-between gap-2 mb-2">
          <div className="title--breadcrumbs">
            <p className="text-sm">{`Home >  Reports > Products Sold`}</p>
            <h1 className="text-3xl font-semibold">Products Sold</h1>
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
                    dateFormat="dd/MM/yyyy"
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
                    dateFormat="dd/MM/yyyy"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Dynamic Statistics */}
        <div className="grid grid-cols-5 gap-3 mb-5 p-3 border bg-white shodow--box rounded-[10px]">
          <div className="border rounded-[5px] overflow-hidden w-full">
            <div className="flex gap-1 justify-center bg-[#F1F1F1] p-4 py-3">
              <div className="text-lg font-bold">Memberships</div>
            </div>
            <div>
              <p className="text-3xl font-bold p-2 text-center py-5">
                08
              </p>
            </div>
          </div>
          <div className="border rounded-[5px] overflow-hidden w-full">
            <div className="flex gap-1 justify-center bg-[#F1F1F1] p-4 py-3">
              <div className="text-lg font-bold">Personal Training</div>
            </div>
            <div>
              <p className="text-3xl font-bold p-2 text-center py-5">
                15
              </p>
            </div>
          </div>
          <div className="border rounded-[5px] overflow-hidden w-full">
            <div className="flex gap-1 justify-center bg-[#F1F1F1] p-4 py-3">
              <div className="text-lg font-bold">Pilates</div>
            </div>
            <div>
              <p className="text-3xl font-bold p-2 text-center py-5">
                15
              </p>
            </div>
          </div>
          <div className="border rounded-[5px] overflow-hidden w-full">
            <div className="flex gap-1 justify-center bg-[#F1F1F1] p-4 py-3">
              <div className="text-lg font-bold">Recovery</div>
            </div>
            <div>
              <p className="text-3xl font-bold p-2 text-center py-5">
                05
              </p>
            </div>
          </div>
          <div className="border rounded-[5px] overflow-hidden w-full">
            <div className="flex gap-1 justify-center bg-[#F1F1F1] p-4 py-3">
              <div className="text-lg font-bold">Cafe</div>
            </div>
            <div>
              <p className="text-3xl font-bold p-2 text-center py-5">
                25
              </p>
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
                    <th className="px-2 py-4 min-w-[50px]">S.No.</th>
                    <th className="px-2 py-4 min-w-[120px] max-w-fit">
                      Purchase date
                    </th>
                    <th className="px-2 py-4 min-w-[120px] max-w-fit">Bill Type</th>
                    <th className="px-2 py-4 min-w-[120px] max-w-fit">
                      Club Name
                    </th>
                    <th className="px-2 py-4 min-w-[120px] max-w-fit">Member ID</th>
                    <th className="px-2 py-4 min-w-[120px] max-w-fit">
                      Member Name
                    </th>
                    <th className="px-2 py-4 min-w-[120px] max-w-fit">
                      Service Type
                    </th>
                    <th className="px-2 py-4 min-w-[150px] max-w-fit">
                      Service Name
                    </th>
                    <th className="px-2 py-4 min-w-[130px] max-w-fit">
                      Variation
                    </th>
                    <th className="px-2 py-4 min-w-[120px] max-w-fit">
                      Start Date
                    </th>
                    <th className="px-2 py-4 min-w-[120px] max-w-fit">
                      End Date
                    </th>
                    <th className="px-2 py-4 min-w-[120px] max-w-fit">
                      Lead Owner
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, idx) => (
                    <tr
                      key={row.serialNumber}
                      className="bg-white border-b hover:bg-gray-50 border-gray-200"
                    >
                      <td className="px-2 py-4">{row?.serialNumber}</td>
                      <td className="px-2 py-4">{row?.purchaseDate}</td>
                      <td className="px-2 py-4">{row?.billType}</td>
                      <td className="px-2 py-4">{row?.clubName}</td>
                      <td className="px-2 py-4">{row?.memberId}</td>
                      <td className="px-2 py-4">{row?.memberName}</td>
                      <td className="px-2 py-4">{row?.serviceType}</td>
                      <td className="px-2 py-4">{row?.servicesName}</td>
                      <td className="px-2 py-4">{row?.variation}</td>
                      <td className="px-2 py-4">{row?.startDate}</td>
                      <td className="px-2 py-4">{row?.endDate}</td>
                      <td className="px-2 py-4">{row?.leadOwner}</td>
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

export default ProductsSold;
