// Import required libraries and components
import React, { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addYears, subYears } from "date-fns";
import { FaCalendarDays, FaCircle } from "react-icons/fa6";
import { customStyles, formatAutoDate } from "../../../Helper/helper";
import Select from "react-select";
import TrialAppointmentPanel from "../../../components/FilterPanel/TrialAppointmentPanel";
import viewIcon from "../../../assets/images/icons/eye.svg";
import printIcon from "../../../assets/images/icons/print-icon.svg";
import mailIcon from "../../../assets/images/icons/mail-icon.svg";
import { useLocation } from "react-router-dom";
import { format, subDays, startOfToday, startOfMonth } from "date-fns";
import { authAxios } from "../../../config/config";
import { toast } from "react-toastify";
import Pagination from "../../../components/common/Pagination";

// Date filter dropdown options
const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "month_till_date", label: "Month Till Date" },
  { value: "custom", label: "Custom Date" },
];

const TrialAppointments = () => {
  const [appointmentList, setAppointmentList] = useState([]);

  const [dateFilter, setDateFilter] = useState(dateFilterOptions[1]);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const location = useLocation();

  // Status filter
  const [itemStatus, setItemStatus] = useState(null);

  // Auto-apply status filter from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const statusParam = searchParams.get("status");
    if (statusParam) {
      setItemStatus({ value: statusParam, label: statusParam });
    }
  }, [location.search]);

  // ---------------------------
  // BUILD FINAL FILTER PARAMS
  // ---------------------------
  const buildFinalFilters = (filters = {}) => {
    const finalFilters = { ...filters };

    // Handle top date dropdown
    if (dateFilter?.value === "today") {
      finalFilters.startDate = format(startOfToday(), "yyyy-MM-dd");
      finalFilters.endDate = format(startOfToday(), "yyyy-MM-dd");
    }

    if (dateFilter?.value === "last_7_days") {
      finalFilters.startDate = format(subDays(new Date(), 7), "yyyy-MM-dd");
      finalFilters.endDate = format(new Date(), "yyyy-MM-dd");
    }

    if (dateFilter?.value === "month_till_date") {
      finalFilters.startDate = format(startOfMonth(new Date()), "yyyy-MM-dd");
      finalFilters.endDate = format(new Date(), "yyyy-MM-dd");
    }

    if (dateFilter?.value === "custom" && customFrom && customTo) {
      finalFilters.startDate = format(customFrom, "yyyy-MM-dd");
      finalFilters.endDate = format(customTo, "yyyy-MM-dd");
    }

    // Status filter
    if (itemStatus?.value) {
      finalFilters.status = itemStatus.value;
    }

    return finalFilters;
  };

  // ---------------------------
  // FETCH APPOINTMENTS
  // ---------------------------
  const fetchAppointments = async (currentPage = page, filters = {}) => {
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
        ...buildFinalFilters(filters),
      };

      const res = await authAxios().get("/appointment/fetch/list", { params });

      const responseData = res.data;
      const data = responseData?.data || [];

      setAppointmentList(data);
      setPage(responseData?.currentPage || 1);
      setTotalPages(responseData?.totalPage || 1);
      setTotalCount(responseData?.totalCount || data.length);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch appointments");
    }
  };

  // Re-fetch when filters change
  useEffect(() => {
    fetchAppointments(1);
    setPage(1);
  }, [dateFilter, customFrom, customTo, itemStatus]);

  // ---------------------------
  // DYNAMIC STATS
  // ---------------------------
  const calculateStats = () => {
    const scheduled = appointmentList.filter(
      (item) => item.status === "Scheduled"
    ).length;
    const completed = appointmentList.filter(
      (item) => item.status === "Completed"
    ).length;
    const noShow = appointmentList.filter(
      (item) => item.status === "No-Show"
    ).length;

    return { scheduled, completed, noShow };
  };

  const { scheduled, completed, noShow } = calculateStats();

  // Status colors
  const statusColors = {
    Opportunity: "bg-[#EEEEEE]",
    New: "bg-[#E4FCFF]",
    ACTIVE: "bg-[#D1FADF]",
    COMPLETED: "bg-[#E5E7EB]",
    CANCELLED: "bg-[#FFE4E4]",
    RESCHEDULED: "bg-[#FFF2CC]",
    NO_SHOW: "bg-[#FCE7F3]",
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
                  setPage(1);
                }}
                styles={customStyles}
                className="w-full"
              />
            </div>

            {/* Custom Date Range */}
            {dateFilter?.value === "custom" && (
              <>
                <div className="custom--date dob-format max-w-[180px] w-full relative">
                  <span className="absolute z-[1] mt-[11px] ml-[15px]">
                    <FaCalendarDays />
                  </span>
                  <DatePicker
                    selected={customFrom}
                    onChange={(date) => {
                      setCustomFrom(date);
                      setPage(1);
                    }}
                    placeholderText="From Date"
                    className="custom--input w-full input--icon"
                    minDate={subYears(new Date(), 20)}
                    maxDate={addYears(new Date(), 0)}
                    dateFormat="dd-MM-yyyy"
                  />
                </div>

                <div className="custom--date dob-format max-w-[180px] w-full relative">
                  <span className="absolute z-[1] mt-[11px] ml-[15px]">
                    <FaCalendarDays />
                  </span>
                  <DatePicker
                    selected={customTo}
                    onChange={(date) => {
                      setCustomTo(date);
                      setPage(1);
                    }}
                    placeholderText="To Date"
                    className="custom--input w-full input--icon"
                    minDate={subYears(new Date(), 20)}
                    maxDate={addYears(new Date(), 0)}
                    dateFormat="dd-MM-yyyy"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Dynamic Statistics */}
        <div className="grid grid-cols-3 gap-5 mb-5 p-3 border bg-white shodow--box rounded-[10px]">
          <div className="border rounded-[5px] overflow-hidden w-full">
            <div className="flex justify-center bg-[#F1F1F1] p-4 py-3">
              <div className="text-lg font-bold">Scheduled</div>
            </div>
            <p className="text-3xl font-bold text-center py-5">{scheduled}</p>
          </div>

          <div className="border rounded-[5px] overflow-hidden w-full">
            <div className="flex justify-center bg-[#F1F1F1] p-4 py-3">
              <div className="text-lg font-bold">Completed</div>
            </div>
            <p className="text-3xl font-bold text-center py-5">{completed}</p>
          </div>

          <div className="border rounded-[5px] overflow-hidden w-full">
            <div className="flex justify-center bg-[#F1F1F1] p-4 py-3">
              <div className="text-lg font-bold">No Show</div>
            </div>
            <p className="text-3xl font-bold text-center py-5">{noShow}</p>
          </div>
        </div>

        {/* Data Table */}
        <div className="w-full p-3 border bg-white shodow--box rounded-[10px]">
          <div className="flex items-start gap-3 justify-between w-full mb-3 border-b border-b-[#D4D4D4] pb-3">
            <TrialAppointmentPanel
              itemStatus={itemStatus}
              setItemStatus={setItemStatus}
            />
          </div>

          <div className="table--data--bottom w-full">
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-2 py-4">Enquiry Date</th>
                    <th className="px-2 py-4">Lead Name</th>
                    <th className="px-2 py-4">Date & Time</th>
                    <th className="px-2 py-4">Staff Name</th>
                    <th className="px-2 py-4">Scheduled By</th>
                    <th className="px-2 py-4">Status</th>
                    <th className="px-2 py-4">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {appointmentList.map((row) => (
                    <tr
                      key={row?.id}
                      className="bg-white border-b hover:bg-gray-50 border-gray-200"
                    >
                      <td className="px-2 py-4">
                        {formatAutoDate(row?.createdAt)}
                      </td>

                      <td className="px-2 py-4">{row?.lead_name || "--"}</td>

                      <td className="px-2 py-4">
                        {formatAutoDate(row?.start_date)} {row?.start_time}
                      </td>

                      <td className="px-2 py-4">{row?.staff_name || "--"}</td>

                      <td className="px-2 py-4">
                        {row?.assigned_staff_name || "--"}
                      </td>

                      <td className="px-2 py-4">
                        <span
                          className={`flex items-center gap-1 rounded-full min-h-[30px] px-3 text-sm w-fit 
                          ${
                            statusColors[row?.booking_status] || "bg-[#EEEEEE]"
                          }`}
                        >
                          <FaCircle className="text-[10px]" />
                          {row?.booking_status ?? "--"}
                        </span>
                      </td>

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

            <Pagination
              page={page}
              totalPages={totalPages}
              rowsPerPage={rowsPerPage}
              totalCount={totalCount}
              currentDataLength={appointmentList.length}
              onPageChange={(newPage) => {
                setPage(newPage);
                fetchAppointments(newPage);
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default TrialAppointments;
