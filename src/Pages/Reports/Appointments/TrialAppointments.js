// Import required libraries and components
import React, { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addYears, subYears } from "date-fns";
import { FaCalendarDays, FaCircle } from "react-icons/fa6";
import {
  customStyles,
  filterActiveItems,
  formatAutoDate,
  formatText,
} from "../../../Helper/helper";
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

const statusUpdateOptions = [
  { value: "ACTIVE", label: "Scheduled" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "NO_SHOW", label: "No Show" },
];

const TrialAppointments = () => {
  const [appointmentList, setAppointmentList] = useState([]);
  const [clubList, setClubList] = useState([]);
  const [clubFilter, setClubFilter] = useState(null);

  const [dateFilter, setDateFilter] = useState(dateFilterOptions[1]);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [pendingId, setPendingId] = useState(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({
    scheduled: 0,
    completed: 0,
    noShow: 0,
    cancelled: 0,
  });

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

  const fetchAppointmentStats = async () => {
    try {
      let params = {};

      if (dateFilter?.value === "custom") {
        if (customFrom && customTo) {
          params.startDate = format(customFrom, "yyyy-MM-dd");
          params.endDate = format(customTo, "yyyy-MM-dd");
        } else {
          return; // don't fetch until both dates selected
        }
      } else {
        params.dateFilter = dateFilter?.value || "last_7_days";
      }

      const res = await authAxios().get("/appointment/trial/count", { params });
      const data = res.data?.data || {};

      setStats({
        scheduled: Number(data.scheduled_count) || 0,
        completed: Number(data.completed_count) || 0,
        noShow: Number(data.no_show_count) || 0,
        cancelled: Number(data.cancelled_count) || 0,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch appointment stats");
    }
  };

  useEffect(() => {
    fetchAppointmentStats();
  }, [dateFilter, customFrom, customTo]);

  // Re-fetch when filters change
  useEffect(() => {
    fetchAppointments(1);
    setPage(1);
  }, [dateFilter, customFrom, customTo, itemStatus]);

  const { scheduled, completed, noShow, cancelled } = stats;

  // Status colors
  const statusColors = {
    Opportunity: "bg-[#EEEEEE]",
    New: "bg-[#E4FCFF]",
    ACTIVE: "bg-[#D1FADF]",
    COMPLETED: "bg-[#E8FFE6] text-[#138808]",
    CANCELLED: "bg-[#FFE4E4] text-[#880808]",
    RESCHEDULED: "bg-[#FFF2CC]",
    NO_SHOW: "bg-[#FCE7F3]",
  };

  const updateAppointmentStatus = (id, newStatus) => {
    setPendingId(id);
    setPendingStatus(newStatus);
    setShowConfirmModal(true);
  };

  const confirmStatusUpdate = async () => {
    try {
      const body = { booking_status: pendingStatus };

      await authAxios().put(`/appointment/${pendingId}`, body);

      toast.success("Status updated successfully");

      setShowConfirmModal(false);
      fetchAppointments(page);
      fetchAppointmentStats();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  const getSelectedStatusOption = (status) => {
    return statusUpdateOptions.find((opt) => opt.value === status) || null;
  };

  const filteredStatusOptions = statusUpdateOptions.filter(
    (opt) => opt.value !== "ACTIVE"
  );

  return (
    <>
      <div className="page--content">
        {/* Page heading */}
        <div className="flex items-end justify-between gap-2 mb-5">
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

        {/* Dynamic Statistics */}
        <div className="grid grid-cols-4 gap-5 mb-5 p-3 border bg-white shodow--box rounded-[10px]">
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
          <div className="border rounded-[5px] overflow-hidden w-full">
            <div className="flex justify-center bg-[#F1F1F1] p-4 py-3">
              <div className="text-lg font-bold">Cancelled</div>
            </div>
            <p className="text-3xl font-bold text-center py-5">{cancelled}</p>
          </div>
        </div>

        {/* Data Table */}
        <div className="w-full p-3 border bg-white shodow--box rounded-[10px]">
          {/* <div className="flex items-start gap-3 justify-between w-full mb-3 border-b border-b-[#D4D4D4] pb-3">
            <TrialAppointmentPanel
              itemStatus={itemStatus}
              setItemStatus={setItemStatus}
            />
          </div> */}

          <div className="table--data--bottom w-full">
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-2 py-4 min-w-[100px]">Enquiry Date</th>
                    <th className="px-2 py-4 min-w-[150px]">Club Name</th>
                    <th className="px-2 py-4 min-w-[200px]">Appointment Category</th>
                    <th className="px-2 py-4 min-w-[200px]">Service/Appointment Name</th>
                    <th className="px-2 py-4 min-w-[130px]">Lead Name</th>
                    <th className="px-2 py-4 min-w-[110px]">Date & Time</th>
                    <th className="px-2 py-4 min-w-[130px]">Staff Name</th>
                    <th className="px-2 py-4 min-w-[130px]">Scheduled By</th>
                    <th className="px-2 py-4 min-w-[130px]">Status</th>
                    <th className="px-2 py-4 text-center min-w-[150px]">Action</th>
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
                      <td className="px-2 py-4">DLF Summit Plaza</td>
                      <td className="px-2 py-4">Complimentary Appointment</td>
                      <td className="px-2 py-4">Trial/test</td>

                      <td className="px-2 py-4">{row?.lead_name || "--"}</td>

                      <td className="px-2 py-4">
                        {formatAutoDate(row?.start_date)} {row?.start_time}
                      </td>

                      <td className="px-2 py-4">
                        {row?.staff_name || "Shivakar Sharma"}
                      </td>

                      <td className="px-2 py-4">
                        {row?.assigned_staff_name || "Self"}
                      </td>

                      <td className="px-2 py-4">
                        <span
                          className={`flex items-center gap-1 rounded-full min-h-[30px] px-3 text-sm w-fit 
                          ${
                            statusColors[row?.booking_status] || "bg-[#EEEEEE]"
                          }`}
                        >
                          <FaCircle className="text-[10px]" />
                          {formatText(
                            row?.booking_status === "ACTIVE"
                              ? "SCHEDULED"
                              : row?.booking_status
                          ) ?? "--"}
                        </span>
                      </td>

                      <td className="px-2 py-4">
                        {/* <Select
                          placeholder="Select"
                          options={statusUpdateOptions}
                          value={getSelectedStatusOption(row?.booking_status)} // <-- FIXED
                          isDisabled={row?.booking_status !== "ACTIVE"}
                          onChange={(selected) => {
                            if (!selected) return;

                            updateAppointmentStatus(
                              row?.id,
                              selected.value,
                              (success) => {
                                if (success) {
                                  // table will refresh automatically
                                }
                              }
                            );
                          }}
                          styles={customStyles}
                        /> */}
                        <div className="max-w-[130px] w-full mx-auto">
                          <Select
                            placeholder="Select"
                            options={filteredStatusOptions}
                            value={getSelectedStatusOption(row?.booking_status)}
                            isDisabled={row?.booking_status !== "ACTIVE"}
                            onChange={(selected) => {
                              if (!selected) return;
                              updateAppointmentStatus(row?.id, selected.value);
                            }}
                            styles={customStyles}
                          />
                        </div>
                        {/* <div className="flex">
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
                        </div> */}
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

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-[10px] w-[350px] shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-center">
              Confirm Status Update
            </h3>

            <p className="text-center mb-6">
              Are you sure you want to mark this appointment as
              <span className="font-bold ml-1">{pendingStatus}</span>?
            </p>

            <div className="flex justify-between gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="w-1/2 border border-gray-400 rounded py-2"
              >
                Cancel
              </button>

              <button
                onClick={confirmStatusUpdate}
                className="w-1/2 bg-black text-white rounded py-2"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TrialAppointments;
