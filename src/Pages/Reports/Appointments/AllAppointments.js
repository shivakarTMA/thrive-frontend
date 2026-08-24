import React, { useEffect, useMemo, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { subYears, format } from "date-fns";
import { FaCalendarDays } from "react-icons/fa6";
import {
  ALLOWED_ROLES,
  customStyles,
  filterActiveItems,
  formatAutoDate,
  formatText,
  formatTimeAppointment,
  sanitizeTextWithNumbers,
} from "../../../Helper/helper";
import Select from "react-select";
import AllAppointmentPanel from "../../../components/FilterPanel/AllAppointmentPanel";
import { useLocation, useNavigate } from "react-router-dom";
import { authAxios } from "../../../config/config";
import { toast } from "react-toastify";
import Pagination from "../../../components/common/Pagination";
import { useFormik } from "formik";
import { useSelector } from "react-redux";
import IsLoadingHOC from "../../../components/common/IsLoadingHOC";
import { LuDownload } from "react-icons/lu";

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

const NO_SLOTS_OPTION = { label: "No time Slots", value: "", isDisabled: true };

const AllAppointments = (props) => {
  const { setLoading } = props;
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [pendingId, setPendingId] = useState(null);
  const [pendingRow, setPendingRow] = useState(null); // full row for reschedule (category/duration)
  const [remarks, setRemarks] = useState("");
  const { user } = useSelector((state) => state.auth);
  const userRole = user.role;

  const [selectedTrainerId, setSelectedTrainerId] = useState(null);
  const [selectedClubId, setSelectedClubId] = useState(null);

  // Reschedule date + time now tracked separately (like create-appointment flow)
  const [rescheduleDateOnly, setRescheduleDateOnly] = useState(null);
  const [rescheduleTime, setRescheduleTime] = useState(null);

  // Response from /staff/operating/hours/trainer/slots
  const [trainerSlotsData, setTrainerSlotsData] = useState([]);
  const slotsRequestIdRef = useRef(0);

  const location = useLocation();
  const navigate = useNavigate();

  // State variables
  const [appointmentList, setAppointmentList] = useState([]);
  const [clubList, setClubList] = useState([]);
  const [clubFilter, setClubFilter] = useState(null);

  const [dateFilter, setDateFilter] = useState(dateFilterOptions[0]);
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Applied filters state
  const [appliedFilters, setAppliedFilters] = useState({
    assigned_staff_id: null,
    appointment_category: null,
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
      filterBookingCategory: null,
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
      console.error(error);
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
    if (filters.assigned_staff_id) {
      params.set("assigned_staff_id", filters.assigned_staff_id);
    }

    if (filters.appointment_category) {
      params.set("appointment_category", filters.appointment_category);
    }

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
      if (appliedFilters.appointment_category) {
        params.appointment_category = appliedFilters.appointment_category;
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

      if (userRole === "RECOVERY") {
        params.service_name = "RECOVERY";
      }

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
      appointment_category: params.get("appointment_category") || null,
      assigned_staff_id: params.get("assigned_staff_id")
        ? Number(params.get("assigned_staff_id"))
        : null,
    };

    setAppliedFilters(urlFilters);

    // Sync with formik
    formik.setValues({
      filterTrainer: urlFilters.assigned_staff_id,
      filterBookingStatus: urlFilters.booking_status,
      filterBookingCategory: urlFilters.appointment_category,
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
    appliedFilters.appointment_category,
    appliedFilters.appointment_date,
    appliedFilters.service_id,
    appliedFilters.package_id,
  ]);

  const { scheduled, upcoming, completed, noShow, cancelled } = stats;

  const updateAppointmentStatus = (row, newStatus) => {
    setPendingId(row.id);
    setPendingStatus(newStatus);
    setRemarks("");

    if (newStatus === "RESCHEDULED") {
      setPendingRow(row);
      setSelectedTrainerId(row.assigned_staff_id);
      setSelectedClubId(row.club_id);

      // Prefill with the existing slot; the trainer-slots fetch (below)
      // will validate/refresh what's actually still available.
      setRescheduleDateOnly(row.start_date ? new Date(row.start_date) : null);
      setRescheduleTime(row.start_time ? row.start_time.slice(0, 5) : null);
    } else {
      setPendingRow(null);
      setSelectedTrainerId(null);
      setSelectedClubId(null);
      setRescheduleDateOnly(null);
      setRescheduleTime(null);
      setTrainerSlotsData([]);
    }

    setShowConfirmModal(false); // close any previous
    setTimeout(() => setShowConfirmModal(true), 0); // reopen fresh
  };

  // ===============================
  // DATE / TIME HELPERS (same convention as create-appointment flow)
  // ===============================
  const formatDateForApi = (date) => {
    if (!date) return null;
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
  };

  const formatTo12Hour = (time24) => {
    const [h, m] = time24.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
  };

  // ===============================
  // FETCH TRAINER SLOTS for reschedule (mirrors CreateMemberAppointment)
  // ===============================
  const fetchTrainerSlots = async (trainerId, clubId, category, duration) => {
    if (!trainerId || !clubId) {
      setTrainerSlotsData([]);
      return;
    }

    const requestId = ++slotsRequestIdRef.current;

    try {
      const bookingType =
        category === "complementary" ? "COMPLIMENTARY" : "PACKAGE";

      const body = {
        trainer_id: trainerId,
        club_id: clubId,
        booking_type: bookingType,
      };

      // ⚠️ Confirm `session_duration` (or whatever field actually holds
      // this on the appointment-list row) is the right source for PACKAGE
      // bookings — it's not currently rendered anywhere in this table.
      if (bookingType === "PACKAGE" && duration) {
        body.duration = duration;
      }

      const res = await authAxios().post(
        "/staff/operating/hours/trainer/slots",
        body,
      );

      if (requestId !== slotsRequestIdRef.current) return;

      setTrainerSlotsData(res.data?.data || []);
    } catch (err) {
      if (requestId !== slotsRequestIdRef.current) return;

      console.error("fetchTrainerSlots (reschedule) error:", err);
      setTrainerSlotsData([]);
    }
  };

  useEffect(() => {
    if (pendingStatus !== "RESCHEDULED") return;

    if (!selectedTrainerId || !selectedClubId) {
      slotsRequestIdRef.current += 1; // invalidate any in-flight request
      setTrainerSlotsData([]);
      return;
    }

    fetchTrainerSlots(
      selectedTrainerId,
      selectedClubId,
      pendingRow?.appointment_category,
      pendingRow?.session_duration,
    );
  }, [selectedTrainerId, selectedClubId, pendingStatus, pendingRow]);

  // Dates allowed in the reschedule calendar (must be present in API response)
  const availableRescheduleDatesSet = useMemo(() => {
    return new Set(trainerSlotsData.map((d) => d.date));
  }, [trainerSlotsData]);

  const filterAvailableRescheduleDate = (date) => {
    const dateStr = formatDateForApi(date);
    return availableRescheduleDatesSet.has(dateStr);
  };

  // Selected reschedule day's slot data
  const selectedRescheduleDayData = useMemo(() => {
    if (!rescheduleDateOnly || !trainerSlotsData.length) return null;

    const dateStr = formatDateForApi(rescheduleDateOnly);
    return trainerSlotsData.find((d) => d.date === dateStr) || null;
  }, [rescheduleDateOnly, trainerSlotsData]);

  // Time options for reschedule, driven entirely by server `enable` flag
  const rescheduleTimeOptions = useMemo(() => {
    if (!rescheduleDateOnly) return [];

    if (!selectedRescheduleDayData) return [NO_SLOTS_OPTION];

    const { slots } = selectedRescheduleDayData;

    if (!slots || slots.length === 0) return [NO_SLOTS_OPTION];

    return slots.map((slot) => ({
      label: formatTo12Hour(slot.time),
      value: slot.time,
      isDisabled: !slot.enable,
    }));
  }, [selectedRescheduleDayData, rescheduleDateOnly]);

  // Warn when the picked reschedule date has no bookable slots at all
  useEffect(() => {
    if (!rescheduleDateOnly) return;

    if (
      rescheduleTimeOptions.length === 1 &&
      rescheduleTimeOptions[0].value === ""
    ) {
      toast.error("No slots available for selected date");
    }
  }, [selectedRescheduleDayData]);

  // Combine the separate date + time fields into a single Date for submit
  const buildRescheduleDateTime = () => {
    if (!rescheduleDateOnly || !rescheduleTime) return null;

    const [h, m] = rescheduleTime.split(":").map(Number);
    const combined = new Date(rescheduleDateOnly);
    combined.setHours(h, m, 0, 0);
    return combined;
  };

  const confirmStatusUpdate = async () => {
    try {
      let body = {};

      if (pendingStatus === "RESCHEDULED") {
        const combinedDateTime = buildRescheduleDateTime();

        if (!combinedDateTime || !remarks.trim()) {
          toast.error("Please select date & time and enter remarks");
          return;
        }

        body = {
          start_date: format(combinedDateTime, "yyyy-MM-dd HH:mm:ss"),
          last_status: "RESCHEDULED",
          remarks: remarks.trim(),
        };
      } else {
        body = {
          booking_status: pendingStatus,
          remarks: remarks.trim() || undefined,
        };
      }

      await authAxios().put(`/appointment/${pendingId}`, body);
      toast.success("Status updated successfully");

      // ✅ Reset all modal state
      setShowConfirmModal(false);
      setRemarks("");
      setPendingRow(null);
      setRescheduleDateOnly(null);
      setRescheduleTime(null);
      setTrainerSlotsData([]);

      fetchAppointments(page);
    } catch (err) {
      console.error(err);
    }
  };

  const isInProgress = (row) => {
    if (row?.booking_status !== "ACTIVE") return false;

    if (!row?.start_date || !row?.start_time) return false;

    const now = new Date();

    const start = new Date(row.start_date);
    const [hours, minutes] = row.start_time.split(":");
    start.setHours(Number(hours), Number(minutes), 0, 0);

    // Optional: define a session duration (e.g. 1 hour)
    const end = new Date(start);
    end.setHours(end.getHours() + 1);

    return now >= start && now <= end;
  };

  // ✅ UPDATED: Fixed function to show proper labels for ACTIVE and UPCOMING
  const getSelectedStatusOption = (status, row) => {
    if (!status) return null;

    if (isInProgress(row)) {
      return { value: "ACTIVE", label: "In Progress" };
    }

    if (status === "ACTIVE") {
      return { value: status, label: "Upcoming" };
    }

    return statusUpdateOptions.find((opt) => opt.value === status) || null;
  };

  const getAllowedStatusOptions = (row) => {
    const currentStatus = row?.booking_status;

    if (isInProgress(row)) {
      return [
        { value: "COMPLETED", label: "Completed" },
        { value: "NO_SHOW", label: "No Show" },
      ];
    }

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
        return [];
    }
  };

  const canUpdateStatus = (status) => {
    return status === "ACTIVE" || status === "COMPLETED";
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setAppointmentList((prev) => [...prev]);
    }, 60000); // every 1 min

    return () => clearInterval(interval);
  }, []);

  const handleExportBookings = async () => {
    try {
      setLoading(true);

      const params = {};

      if (dateFilter?.value && dateFilter.value !== "custom") {
        params.dateFilter = dateFilter.value;
      }

      if (dateFilter?.value === "custom" && customFrom && customTo) {
        params.startDate = format(customFrom, "yyyy-MM-dd");
        params.endDate = format(customTo, "yyyy-MM-dd");
      }

      if (clubFilter?.value) {
        params.club_id = clubFilter.value;
      }

      if (userRole === "RECOVERY") {
        params.service_name = "RECOVERY";
      }

      Object.entries(appliedFilters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params[key] = value;
        }
      });

      const response = await authAxios().get(
        "/appointment/fetch/list/download?appointment_type=SESSION",
        {
          params,
          responseType: "blob",
        },
      );

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "all-bookings.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("All bookings list downloaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to download all bookings list.");
    } finally {
      setLoading(false);
    }
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
                onChange={(option) => {
                  setClubFilter(option);
                  formik.resetForm();
                  setAppliedFilters({
                    assigned_staff_id: null,
                    appointment_category: null,
                    booking_status: null,
                    appointment_date: null,
                    service_id: null,
                    package_id: null,
                  });
                }}
                isClearable={userRole === "ADMIN" ? true : false}
                styles={customStyles}
              />
            </div>
          </div>
          {!ALLOWED_ROLES.includes(userRole) && (
            <div className="max-w-[160px] w-full">
              <button
                onClick={handleExportBookings}
                disabled={
                  appointmentList.length === 0 ||
                  (dateFilter?.value === "custom" && (!customFrom || !customTo))
                }
                className={`w-full px-4 py-2 rounded flex items-center gap-2
                        ${
                          appointmentList.length === 0 ||
                          (dateFilter?.value === "custom" &&
                            (!customFrom || !customTo))
                            ? "bg-gray-400 cursor-not-allowed text-white"
                            : "bg-black text-white hover:bg-gray-800"
                        }`}
              >
                <LuDownload /> <span>Export Bookings</span>
              </button>
            </div>
          )}
        </div>

        {/* Dynamic Statistics */}
        <div className="grid grid-cols-5 gap-5 mb-5 p-3 border bg-white shodow--box rounded-[10px]">
          <div className="border rounded-[5px] overflow-hidden w-full">
            <div className="flex justify-center bg-[#F1F1F1] p-4 py-3">
              <div className="text-lg font-bold">All</div>
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
              filterBookingCategory={formik.values.filterBookingCategory}
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
                        <td className="px-2 py-4">
                          {formatText(row?.last_status) || "--"}
                        </td>
                        <td className="px-2 py-4">
                          {userRole === "FOH" ||
                          userRole === "TRAINER" ||
                          userRole === "FITNESS_MANAGER" ||
                          userRole === "ASS_FITNESS_MANAGER" ||
                          userRole === "CLUB_MANAGER" ||
                          userRole === "ASS_CLUB_MANAGER" ||
                          userRole === "PROGRAM_SPECIALIST" ||
                          userRole === "RECOVERY" ||
                          userRole === "ADMIN" ? (
                            <div className="max-w-[130px] w-full">
                              <Select
                                placeholder="Select"
                                options={getAllowedStatusOptions(row)}
                                value={getSelectedStatusOption(
                                  row?.booking_status,
                                  row,
                                )}
                                isDisabled={!canUpdateStatus(row?.booking_status)}
                                onChange={(selected) => {
                                  if (!selected) return;
                                  updateAppointmentStatus(row, selected.value);
                                }}
                                styles={{
                                  ...customStyles,
                                  menuPortal: (base) => ({
                                    ...base,
                                    zIndex: 9999,
                                  }),
                                }}
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                              />
                            </div>
                          ) : (
                            <span>
                              {formatText(row?.booking_status) || "--"}
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-4">
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
              {!selectedTrainerId && pendingStatus === "RESCHEDULED"
                ? "The session cannot be rescheduled yet as a trainer has not been assigned."
                : "Confirm Status Update"}
            </h3>

            {!selectedTrainerId && pendingStatus === "RESCHEDULED" ? null : (
              <p className="text-center mb-4">
                Are you sure you want to mark this appointment as
                <span className="font-bold ml-1">
                  {formatText(pendingStatus)}
                </span>
                ?
              </p>
            )}

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
                <div>
                  <label className="block text-sm font-medium mb-1">
                    New Date & Time <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    {/* DATE */}
                    <div className="custom--date relative w-[50%]">
                      <span className="absolute z-[1] mt-[11px] ml-[15px]">
                        <FaCalendarDays />
                      </span>
                      <DatePicker
                        selected={rescheduleDateOnly}
                        onChange={(date) => {
                          setRescheduleDateOnly(date);
                          setRescheduleTime(null);
                        }}
                        dateFormat="dd/MM/yyyy"
                        minDate={new Date()}
                        filterDate={filterAvailableRescheduleDate}
                        onKeyDown={(e) => e.preventDefault()}
                        disabled={!selectedTrainerId}
                        placeholderText="Select Date"
                        className="custom--input w-full input--icon"
                      />
                    </div>

                    {/* TIME */}
                    <div className="w-[50%]">
                      <Select
                        key={`${selectedTrainerId}-${rescheduleDateOnly}`}
                        value={
                          rescheduleTime
                            ? rescheduleTimeOptions.find(
                                (o) => o.value === rescheduleTime,
                              )
                            : null
                        }
                        onChange={(opt) => {
                          if (!opt || opt.value === "") return;
                          setRescheduleTime(opt.value);
                        }}
                        options={rescheduleTimeOptions}
                        isDisabled={!rescheduleDateOnly || !selectedTrainerId}
                        placeholder="Select Time"
                        styles={customStyles}
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
                    onChange={(e) => {
                      const cleaned = sanitizeTextWithNumbers(e.target.value);
                      setRemarks(cleaned);
                    }}
                    rows="3"
                    className="w-full border rounded p-2"
                    placeholder="Reason for rescheduling"
                    disabled={!selectedTrainerId}
                  />
                </div>
              </div>
            )}

            <div
              className={`flex ${!selectedTrainerId ? "justify-end" : "justify-between"} gap-3`}
            >
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setRemarks("");
                }}
                className="w-1/2 border border-gray-400 rounded py-2 hover:bg-gray-50"
              >
                Cancel
              </button>

              {!selectedTrainerId && pendingStatus === "RESCHEDULED" ? null : (
                <button
                  onClick={confirmStatusUpdate}
                  className="w-1/2 bg-black text-white rounded py-2 hover:bg-gray-800"
                >
                  Confirm
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default IsLoadingHOC(AllAppointments);