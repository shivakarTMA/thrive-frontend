// Import required libraries and components
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addYears, subYears, format } from "date-fns";
import { FaCalendarDays } from "react-icons/fa6";
import {
  customStyles,
  filterActiveItems,
  formatAutoDate,
  formatText,
  formatTimeAppointment,
} from "../../../Helper/helper";
import Select from "react-select";
import AllAppointmentPanel from "../../../components/FilterPanel/AllAppointmentPanel";
import { useLocation, useNavigate } from "react-router-dom";
import { authAxios } from "../../../config/config";
import { toast } from "react-toastify";
import Pagination from "../../../components/common/Pagination";
import { useFormik } from "formik";
import { useSelector } from "react-redux";
import { FiClock } from "react-icons/fi";

// Date filter dropdown options
const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "month_till_date", label: "Month Till Date" },
  { value: "custom", label: "Custom Date" },
];

const statusUpdateOptions = [
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "NO_SHOW", label: "No Show" },
];

const filterStatusOptions = [
  { value: "ACTIVE", label: "Upcoming" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "NO_SHOW", label: "No Show" },
];

const isToday = (date) => {
  if (!date) return false;

  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const AllAppointments = () => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [pendingId, setPendingId] = useState(null);
  const [remarks, setRemarks] = useState("");
  const { user } = useSelector((state) => state.auth);
  const userRole = user.role;

  const [rescheduleDate, setRescheduleDate] = useState(null);
  const [rescheduleTime, setRescheduleTime] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  // State variables
  const [appointmentList, setAppointmentList] = useState([]);
  const [clubList, setClubList] = useState([]);
  const [clubFilter, setClubFilter] = useState(null);

  const [dateFilter, setDateFilter] = useState(dateFilterOptions[1]);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Applied filters state
  const [appliedFilters, setAppliedFilters] = useState({
    assigned_staff_id: null,
    booking_status: null,
    appointment_date: null,
    service_id: null,
    package_id: null,
  });

  const [stats, setStats] = useState({
    scheduled: 0,
    upcoming: 0,
    completed: 0,
    noShow: 0,
    cancelled: 0,
  });

  const [filtersInitialized, setFiltersInitialized] = useState(false);

  // Formik for panel filters
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      filterTrainer: null,
      filterBookingStatus: null,
      filterAppointmentDate: null,
      filterServiceType: null,
      filterServiceName: null,
    },
    onSubmit: (values) => {
      console.log(values);
    },
  });

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

  useEffect(() => {
    fetchClub();
  }, []);

  const clubOptions = clubList.map((item) => ({
    label: item.name,
    value: item.id,
  }));

    const selectedClub =
    clubOptions.find((opt) => opt.value === clubFilter?.value) || null;

  // ---------------------------
  // UPDATE URL WITH PARAMS
  // ---------------------------
  const updateURLParams = (filters) => {
    const params = new URLSearchParams();

    // Date filter
    if (dateFilter?.value && dateFilter.value !== "custom") {
      params.set("dateFilter", dateFilter.value);
    }

    if (dateFilter?.value === "custom" && customFrom && customTo) {
      params.set("startDate", format(customFrom, "yyyy-MM-dd"));
      params.set("endDate", format(customTo, "yyyy-MM-dd"));
    }

    // Club filter
    if (clubFilter?.value) {
      params.set("club_id", clubFilter.value);
    }

    // Applied filters
    if (filters.booking_status) {
      params.set("booking_status", filters.booking_status);
    }
    // if (filters.assigned_staff_id) {
    //   params.set("assigned_staff_id", filters.assigned_staff_id);
    // }
    // if (filters.service_id) {
    //   params.set("service_id", filters.service_id);
    // }
    // if (filters.service_name) {
    //   params.set("service_name", filters.service_name);
    // }

    navigate(`?${params.toString()}`, { replace: true });
  };

  // ---------------------------
  // FETCH APPOINTMENTS
  // ---------------------------
  const fetchAppointments = async (currentPage = page) => {
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
      };

      // Date Filter
      if (dateFilter?.value && dateFilter.value !== "custom") {
        params.dateFilter = dateFilter.value;
      }

      if (dateFilter?.value === "custom" && customFrom && customTo) {
        params.startDate = format(customFrom, "yyyy-MM-dd");
        params.endDate = format(customTo, "yyyy-MM-dd");
      }

      // Club filter
      if (clubFilter?.value) {
        params.club_id = clubFilter.value;
      }

      // Applied Filters
      if (appliedFilters.assigned_staff_id) {
        params.assigned_staff_id = appliedFilters.assigned_staff_id;
      }
      if (appliedFilters.booking_status) {
        params.booking_status = appliedFilters.booking_status;
      }
      if (appliedFilters.service_id) {
        params.service_id = appliedFilters.service_id;
      }
      if (appliedFilters.package_id) {
        params.package_id = appliedFilters.package_id;
      }

      console.log("🔍 API Request Params:", params);

      const res = await authAxios().get(
        "/appointment/fetch/list?appointment_type=SESSION",
        { params },
      );

      const responseData = res.data;
      const data = responseData?.data || [];

      setAppointmentList(data);
      setPage(responseData?.currentPage || 1);
      setTotalPages(responseData?.totalPage || 1);
      setTotalCount(responseData?.totalCount || data.length);

      // Update stats
      const statusCount = responseData?.appointment_status_count || {};
      setStats({
        scheduled: statusCount.scheduled_count || 0,
        upcoming: statusCount.upcoming_count || 0,
        completed: statusCount.completed_count || 0,
        noShow: statusCount.no_show_count || 0,
        cancelled: statusCount.cancelled_count || 0,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch appointments");
    }
  };

  // ---------------------------
  // INITIALIZE FROM URL
  // ---------------------------

  useEffect(() => {
    // Wait for clubList to be loaded
    if (clubList.length === 0) return;

    // Only run initialization once
    if (filtersInitialized) return;

    const params = new URLSearchParams(location.search);

    // Date filter
    const dateFilterValue = params.get("dateFilter");
    if (dateFilterValue) {
      const matchedDate = dateFilterOptions.find(
        (opt) => opt.value === dateFilterValue,
      );
      if (matchedDate) {
        setDateFilter(matchedDate);
      }
    }

    // Custom date filter
    const startDate = params.get("startDate");
    const endDate = params.get("endDate");
    if (startDate && endDate) {
      setDateFilter(dateFilterOptions.find((d) => d.value === "custom"));
      setCustomFrom(new Date(startDate));
      setCustomTo(new Date(endDate));
    }

    // Club filter - only set from URL if present, otherwise default to first club
    const clubId = params.get("club_id");
    // if (clubId) {
    //   const club = clubList.find((c) => c.id === Number(clubId));
    //   if (club) {
    //     setClubFilter({ label: club.name, value: club.id });
    //   }
    // } else {
    //   // Set default club only on initial load
    //   setClubFilter({
    //     label: clubList[0].name,
    //     value: clubList[0].id,
    //   });
    // }
    if (!clubFilter) {
      if (clubId) {
        const club = clubList.find((c) => c.id === Number(clubId));
        if (club) {
          setClubFilter({ label: club.name, value: club.id });
        }
      } else {
        setClubFilter({
          label: clubList[0].name,
          value: clubList[0].id,
        });
      }
    }

    // Applied filters from URL
    const urlFilters = {
      booking_status: params.get("booking_status") || null,
      // assigned_staff_id: params.get("assigned_staff_id")
      //   ? Number(params.get("assigned_staff_id"))
      //   : null,
      // service_id: params.get("service_id") || null,
      // service_name: params.get("service_name") || null,
    };

    setAppliedFilters(urlFilters);

    // Sync with formik
    formik.setValues({
      filterTrainer: urlFilters.assigned_staff_id,
      filterBookingStatus: urlFilters.booking_status,
      filterServiceType: urlFilters.service_id,
      filterServiceName: urlFilters.package_id,
    });

    setFiltersInitialized(true);
  }, [clubList]);

  // ---------------------------
  // FETCH WHEN FILTERS CHANGE
  // ---------------------------
  useEffect(() => {
    if (!filtersInitialized) return;

    // 🚫 Prevent API call until both dates are selected
    if (dateFilter?.value === "custom" && (!customFrom || !customTo)) {
      return;
    }

    setPage(1);
    fetchAppointments(1);
    updateURLParams(appliedFilters);
  }, [
    filtersInitialized,
    dateFilter?.value,
    customFrom,
    customTo,
    clubFilter?.value,
    appliedFilters.assigned_staff_id,
    appliedFilters.booking_status,
    appliedFilters.appointment_date,
    appliedFilters.service_id,
    appliedFilters.package_id,
  ]);

  const { scheduled, upcoming, completed, noShow, cancelled } = stats;

  const updateAppointmentStatus = (row, newStatus) => {
    setPendingId(row.id);
    setPendingStatus(newStatus);
    setRemarks("");

    // ✅ Prefill previous date & time for reschedule
    if (newStatus === "RESCHEDULED") {
      setRescheduleDate(row.start_date ? new Date(row.start_date) : null);

      if (row.start_time) {
        const [hours, minutes] = row.start_time.split(":");
        const time = new Date();
        time.setHours(hours);
        time.setMinutes(minutes);
        setRescheduleTime(time);
      }
    }

    setShowConfirmModal(true);
  };

  const confirmStatusUpdate = async () => {
    try {
      // ✅ Validation for RESCHEDULED
      if (pendingStatus === "RESCHEDULED") {
        if (!rescheduleDate || !rescheduleTime || !remarks.trim()) {
          toast.error("Please select date, time and enter remarks");
          return;
        }
      }

      let body = {};

      if (pendingStatus === "RESCHEDULED") {
        // ✅ Combine date + time into one Date object
        const combinedDateTime = new Date(rescheduleDate);
        combinedDateTime.setHours(
          rescheduleTime.getHours(),
          rescheduleTime.getMinutes(),
          0,
          0,
        );

        body = {
          start_date: format(combinedDateTime, "yyyy-MM-dd HH:mm:ss"),
          last_status: "RESCHEDULED",
          remarks: remarks.trim(),
        };
      } else {
        // ✅ Other statuses
        body = {
          booking_status: pendingStatus,
          remarks: remarks.trim() || undefined,
        };
      }

      await authAxios().put(`/appointment/${pendingId}`, body);

      toast.success("Status updated successfully");

      // ✅ Reset modal state
      setShowConfirmModal(false);
      setRemarks("");
      setRescheduleDate(null);
      setRescheduleTime(null);

      fetchAppointments(page);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update appointment");
    }
  };

  // ✅ UPDATED: Fixed function to show proper labels for ACTIVE and UPCOMING
  const getSelectedStatusOption = (status) => {
    if (!status) return null;

    // For ACTIVE status, display as "Upcoming"
    if (status === "ACTIVE") {
      return { value: status, label: "Upcoming" };
    }

    // For UPCOMING status, display as "Upcoming"
    // if (status === "UPCOMING") {
    //   return { value: status, label: "Upcoming" };
    // }

    // For other statuses (COMPLETED, CANCELLED, NO_SHOW), find in statusUpdateOptions
    return statusUpdateOptions.find((opt) => opt.value === status) || null;
  };

  const getAllowedStatusOptions = (currentStatus) => {
    switch (currentStatus) {
      case "ACTIVE":
        return [
          { value: "RESCHEDULED", label: "Rescheduled" },
          { value: "CANCELLED", label: "Cancelled" },
          { value: "COMPLETED", label: "Completed" },
          { value: "NO_SHOW", label: "No Show" },
        ];

      case "COMPLETED":
        return [{ value: "NO_SHOW", label: "No Show" }];

      default:
        // CANCELLED, NO_SHOW
        return [];
    }
  };

  const canUpdateStatus = (status) => {
    return status === "ACTIVE" || status === "COMPLETED";
  };

  const getMinTime = () => {
    if (isToday(rescheduleDate)) {
      return new Date(); // current time
    }

    // allow full day for future dates
    const time = new Date();
    time.setHours(0, 0, 0, 0);
    return time;
  };

  const getMaxTime = () => {
    const time = new Date();
    time.setHours(23, 45, 0, 0);
    return time;
  };

  return (
    <>
      <div className="page--content">
        {/* Page heading */}
        <div className="flex items-end justify-between gap-2 mb-5">
          <div className="title--breadcrumbs">
            <p className="text-sm">{`Home > All Bookings`}</p>
            <h1 className="text-3xl font-semibold">All Bookings</h1>
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
                    onChange={(date) => {
                      setCustomFrom(date);
                      setCustomTo(null);
                    }}
                    placeholderText="From Date"
                    className="custom--input w-full input--icon"
                    minDate={subYears(new Date(), 20)}
                    // maxDate={addYears(new Date(), 0)}
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
                    minDate={customFrom || subYears(new Date(), 20)}
                    // maxDate={addYears(new Date(), 0)}
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    dateFormat="dd-MM-yyyy"
                    disabled={!customFrom}
                  />
                </div>
              </>
            )}
            <div className="w-fit min-w-[180px]">
              <Select
                placeholder="Filter by club"
                value={selectedClub}
                options={clubOptions}
                onChange={(option) => setClubFilter(option)}
                isClearable={userRole === "ADMIN" ? true : false}
                styles={customStyles}
              />
            </div>
          </div>
        </div>

        {/* Dynamic Statistics */}
        <div className="grid grid-cols-5 gap-5 mb-5 p-3 border bg-white shodow--box rounded-[10px]">
          <div className="border rounded-[5px] overflow-hidden w-full">
            <div className="flex justify-center bg-[#F1F1F1] p-4 py-3">
              <div className="text-lg font-bold">Scheduled</div>
            </div>
            <p className="text-3xl font-bold text-center py-5">{scheduled}</p>
          </div>

          <div className="border rounded-[5px] overflow-hidden w-full">
            <div className="flex justify-center bg-[#F1F1F1] p-4 py-3">
              <div className="text-lg font-bold">Upcoming</div>
            </div>
            <p className="text-3xl font-bold text-center py-5">{upcoming}</p>
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
          <div className="flex items-start gap-3 justify-between w-full mb-3 border-b border-b-[#D4D4D4] pb-3">
            <AllAppointmentPanel
              formik={formik}
              filterTrainer={formik.values.filterTrainer}
              filterBookingStatus={formik.values.filterBookingStatus}
              filterServiceType={formik.values.filterServiceType}
              filterServiceName={formik.values.filterServiceName}
              filterAppointmentDate={formik.values.filterAppointmentDate}
              setFilterValue={(field, value) =>
                formik.setFieldValue(field, value)
              }
              appliedFilters={appliedFilters}
              setAppliedFilters={setAppliedFilters}
              filteredStatusOptions={filterStatusOptions}
              clubId={clubFilter?.value}
            />
          </div>

          <div className="table--data--bottom w-full">
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-2 py-4 min-w-[100px]">Booking Date</th>
                    <th className="px-2 py-4 min-w-[150px]">Club Name</th>
                    <th className="px-2 py-4 min-w-[150px]">Booking Type</th>
                    <th className="px-2 py-4 min-w-[150px]">Service Type</th>
                    <th className="px-2 py-4 min-w-[150px]">Service Name</th>
                    <th className="px-2 py-4 min-w-[150px]">Variation Name</th>
                    <th className="px-2 py-4 min-w-[150px]">Session Name</th>
                    <th className="px-2 py-4 min-w-[110px]">Scheduled At</th>
                    <th className="px-2 py-4 min-w-[130px]">Member Name</th>
                    <th className="px-2 py-4 min-w-[120px]">Trainer Name</th>
                    <th className="px-2 py-4 min-w-[130px]">Last Status</th>

                    {/*                
                    <th className="px-2 py-4 min-w-[130px]">Scheduled By</th> */}
                    <th className="px-2 py-4 min-w-[170px]">
                      Current Status/Action
                    </th>
                    <th className="px-2 py-4 min-w-[150px]">Remarks</th>
                    <th className="px-2 py-4 min-w-[100px]">VAS Rating</th>
                    <th className="px-2 py-4 min-w-[100px]">Rating</th>
                  </tr>
                </thead>

                <tbody>
                  {appointmentList.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="text-center py-4">
                        No data found.
                      </td>
                    </tr>
                  ) : (
                    appointmentList.map((row) => (
                      <tr
                        key={row?.id}
                        className="bg-white border-b hover:bg-gray-50 border-gray-200"
                      >
                        <td className="px-2 py-4">
                          {formatAutoDate(row?.createdAt)}
                        </td>
                        <td className="px-2 py-4">
                          {row?.club_name ? row?.club_name : "--"}
                        </td>
                        <td className="px-2 py-4">
                          {row?.appointment_category
                            ? row?.appointment_category
                            : "--"}
                        </td>
                        <td className="px-2 py-4">
                          {formatText(row?.service_type)}
                        </td>
                        <td className="px-2 py-4">
                          {formatText(row?.package_name)}
                        </td>
                        <td className="px-2 py-4">
                          {row?.variation_name ? row?.variation_name : "--"}
                        </td>
                        <td className="px-2 py-4">
                          {row?.session_name ? row?.session_name : "--"}
                        </td>
                        <td className="px-2 py-4">
                          {formatAutoDate(row?.start_date)}
                          <br></br> {formatTimeAppointment(row?.start_time)}
                        </td>
                        <td className="px-2 py-4">{row?.lead_name || "--"}</td>
                        <td className="px-2 py-4">
                          {row?.assigned_staff_name || "--"}
                        </td>

                        {/*                         
                        <td className="px-2 py-4">
                          {row?.staff_name || "Self"}
                        </td> */}
                        <td className="px-2 py-4">
                          {formatText(row?.last_status) || "--"}
                        </td>
                        <td className="px-2 py-4">
                          <div className="max-w-[130px] w-full">
                            <Select
                              placeholder="Select"
                              options={getAllowedStatusOptions(
                                row?.booking_status,
                              )}
                              value={getSelectedStatusOption(
                                row?.booking_status,
                              )}
                              isDisabled={
                                !canUpdateStatus(row?.booking_status) ||
                                getAllowedStatusOptions(row?.booking_status)
                                  .length === 0
                              }
                              onChange={(selected) => {
                                if (!selected) return;
                                updateAppointmentStatus(row, selected.value);
                              }}
                              styles={customStyles}
                            />
                          </div>
                        </td>
                        <td className="px-2 py-4">
                          {/* ✅ UPDATED: Only show remarks for CANCELLED status */}
                          {/* {row?.booking_status === "CANCELLED" && row?.remarks
                            ? row?.remarks
                            : "--"} */}
                            {row?.remarks ? row?.remarks : "--"}
                        </td>
                        <td className="px-2 py-4">
                            {row?.vas_rating ? row?.vas_rating : "--"}
                        </td>
                        <td className="px-2 py-4">
                            {row?.rating ? row?.rating : "--"}
                        </td>
                      </tr>
                    ))
                  )}
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
          <div className="bg-white p-6 rounded-[10px] w-[400px] shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-center">
              Confirm Status Update
            </h3>

            <p className="text-center mb-4">
              Are you sure you want to mark this appointment as
              <span className="font-bold ml-1">
                {formatText(pendingStatus)}
              </span>
              ?
            </p>

            {pendingStatus === "CANCELLED" && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Remarks <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter cancellation reason"
                  rows="4"
                  className="w-full border border-gray-300 rounded-[5px] p-2 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
                />
              </div>
            )}

            {pendingStatus === "RESCHEDULED" && (
              <div className="mb-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      New Date <span className="text-red-500">*</span>
                    </label>
                    <div className="custom--date relative">
                      {/* Calendar Icon */}
                      <span className="absolute z-[1] mt-[11px] ml-[15px]">
                        <FaCalendarDays />
                      </span>

                      <DatePicker
                        selected={rescheduleDate}
                        onChange={(date) => {
                          setRescheduleDate(date);
                          setRescheduleTime(null); // ✅ reset time
                        }}
                        className="custom--input w-full input--icon"
                        dateFormat="dd-MM-yyyy"
                        minDate={new Date()}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      New Time <span className="text-red-500">*</span>
                    </label>
                    <div className="custom--date relative">
                      {/* Clock Icon */}
                      <span className="absolute z-[1] mt-[11px] ml-[15px]">
                        <FiClock />
                      </span>
                      <DatePicker
                        selected={rescheduleTime}
                        onChange={(time) => setRescheduleTime(time)}
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        timeCaption="Time"
                        dateFormat="hh:mm aa"
                        className="custom--input w-full input--icon"
                        minTime={getMinTime()}
                        maxTime={getMaxTime()}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Remarks <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows="3"
                    className="w-full border rounded p-2"
                    placeholder="Reason for rescheduling"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setRemarks("");
                }}
                className="w-1/2 border border-gray-400 rounded py-2 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={confirmStatusUpdate}
                className="w-1/2 bg-black text-white rounded py-2 hover:bg-gray-800"
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

export default AllAppointments;
