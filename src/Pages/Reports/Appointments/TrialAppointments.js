// Import required libraries and components
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addYears, subYears, format } from "date-fns";
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
import TrialAppointmentPanel from "../../../components/FilterPanel/TrialAppointmentPanel";
import { useLocation, useNavigate } from "react-router-dom";
import { authAxios } from "../../../config/config";
import { toast } from "react-toastify";
import Pagination from "../../../components/common/Pagination";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { FiClock } from "react-icons/fi";
import { fetchClubTiming } from "../../../Redux/Reducers/clubTimingSlice";
import { useClubDatePickerProps } from "../../../hooks/useClubDatePickerProps";
import IsLoadingHOC from "../../../components/common/IsLoadingHOC";
import { LuDownload } from "react-icons/lu";
import { GoPencil } from "react-icons/go";
import { CgGym } from "react-icons/cg";
import Tooltip from "../../../components/common/Tooltip";

// Date filter dropdown options
const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "month_till_date", label: "Month Till Date" },
  { value: "custom", label: "Custom Date" },
];

const statusUpdateOptions = [
  { value: "RESCHEDULED", label: "Rescheduled" },
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

const TrialAppointments = (props) => {
  const { setLoading } = props;
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [changeTrainerModal, setChangeTrainerModal] = useState(false);
  const [updateTrainerId, setUpdateTrainerId] = useState(null);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [pendingId, setPendingId] = useState(null);
  const [remarks, setRemarks] = useState("");
  const { user } = useSelector((state) => state.auth);
  const userRole = user.role;

  const dispatch = useDispatch();
  const [selectedLeadClub, setSelectedLeadClub] = useState(null);
  const [rescheduleDateTime, setRescheduleDateTime] = useState(null);

  const [selectedTrainerId, setSelectedTrainerId] = useState(null);
  const [selectedClubId, setSelectedClubId] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);

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

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [changeTrainerList, setChangeTrainerList] = useState([]);

  // Applied filters state
  const [appliedFilters, setAppliedFilters] = useState({
    assigned_staff_id: null,
    booking_status: null,
    appointment_date: null,
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

    // ✅ Fetch trainers based on club_id (if provided) or all trainers
  // Fetch trainers based on appointment club_id and appointment_id
const fetchTrainer = async (appointmentClubId = null, appointmentId = null) => {
  try {
    const roles = [
      "TRAINER",
      "FITNESS_MANAGER",
      "ASS_FITNESS_MANAGER",
    ];

    const params = {
      role: roles.join(","),
    };

    // Send appointment club_id
    if (appointmentClubId) {
      params.club_id = appointmentClubId;
    }

    // Send appointment id
    if (appointmentId) {
      params.appointment_id = appointmentId;
    }

    console.log("Fetch Trainer Params:", params);

    const response = await authAxios().get("/staff/list", {
      params,
    });

    const data = response.data?.data || [];

    // Only allowed roles + enable === true
    const activeTrainers = data.filter(
      (item) =>
        roles.includes(item.role) &&
        item.enable === true
    );

    console.log("All Trainers:", data);
    console.log("Enabled Trainers:", activeTrainers);
    const trainerList = data.filter((item) =>
      roles.includes(item.role)
    );

    setChangeTrainerList(trainerList);

    // setChangeTrainerList(activeTrainers);
  } catch (error) {
    console.error("Failed to fetch trainers:", error);
    setChangeTrainerList([]);
  }
};


const trainerChangeOptions =
  changeTrainerList?.map((item) => ({
    label: item.name,
    value: item.id,
    isDisabled: item.enable !== true,
  })) || [];

    console.log(changeTrainerList,'changeTrainerList')
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
    if (filters.assigned_staff_id) {
      params.set("assigned_staff_id", filters.assigned_staff_id);
    }
    if (filters.booking_status) {
      params.set("booking_status", filters.booking_status);
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
        appointment_type: "CLUB",
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

      // console.log("🔍 API Request Params:", params);

      const res = await authAxios().get("/appointment/fetch/list", { params });

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
      assigned_staff_id: params.get("assigned_staff_id")
        ? Number(params.get("assigned_staff_id"))
        : null,
      booking_status: params.get("booking_status") || null,
    };

    setAppliedFilters(urlFilters);

    // Sync with formik
    formik.setValues({
      filterTrainer: urlFilters.assigned_staff_id,
      filterBookingStatus: urlFilters.booking_status,
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
  ]);

  const { scheduled, upcoming, completed, noShow, cancelled } = stats;

  const updateAppointmentStatus = (row, newStatus) => {
    setSelectedLeadClub(row.club_id);
    setPendingId(row.id);
    setPendingStatus(newStatus);
    setRemarks("");

    if (newStatus === "RESCHEDULED") {
      // ✅ SET trainer + club from row
      setSelectedTrainerId(row.assigned_staff_id);
      setSelectedClubId(row.club_id);
      // ✅ Combine existing date + time into single rescheduleDateTime
      if (row.start_date && row.start_time) {
        const combined = new Date(row.start_date);
        const [hours, minutes] = row.start_time.split(":");
        combined.setHours(Number(hours), Number(minutes), 0, 0);
        setRescheduleDateTime(combined);
      } else {
        setRescheduleDateTime(null);
      }
    }

    setShowConfirmModal(false); // close any previous
    setTimeout(() => setShowConfirmModal(true), 0); // reopen fresh
  };

  const handleActionClick = (row) => {
    setSelectedAppointment(row);
    setPendingId(row.id);
    setSelectedLeadClub(row.club_id);
    setShowConfirmModal(true);

    // Reset previous values
    setPendingStatus(null);
    setRemarks("");
    setRescheduleDateTime(null);
  };

 const handleChangeTrainer = async (row) => {
  setSelectedAppointment(row);
  setUpdateTrainerId(null);
  setRemarks("");

  // Fetch trainers using appointment club_id + appointment id
  await fetchTrainer(row?.club_id, row?.id);

  setChangeTrainerModal(true);
};

  const confirmChangeTrainer = async () => {
    if (!updateTrainerId) {
      toast.error("Please select a trainer");
      return;
    }

    if (!remarks.trim()) {
      toast.error("Remarks are required");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        assigned_staff_id: updateTrainerId,
        remarks,
      };

      await authAxios().put(`/appointment/${selectedAppointment.id}`, payload);

      toast.success("Trainer changed successfully");

      setChangeTrainerModal(false);
      setRemarks("");
      setUpdateTrainerId(null);

      // Refresh appointment list
      fetchAppointments(1);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const fetchTrainerBookedSlots = async () => {
    if (!selectedTrainerId || !selectedClubId) {
      setBookedSlots([]);
      return;
    }

    try {
      const res = await authAxios().post("/appointment/trainer/booked/slot", {
        club_id: selectedClubId,
        trainer_id: selectedTrainerId,
      });

      setBookedSlots(res.data?.availability || []);
    } catch (err) {
      console.error("Trainer slot fetch error:", err);
      setBookedSlots([]);
    }
  };

  useEffect(() => {
    if (pendingStatus === "RESCHEDULED") {
      fetchTrainerBookedSlots();
    }
  }, [selectedTrainerId, selectedClubId, pendingStatus]);

  const getExcludeTimesForDate = (date) => {
    if (!date || !bookedSlots.length) return [];

    const dateStr = new Date(date).toISOString().split("T")[0];
    const matchedDay = bookedSlots.find((item) => item.date === dateStr);
    if (!matchedDay) return [];

    return [...new Set(matchedDay.slots)].map((timeStr) => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      const d = new Date(date); // ← use actual picked date, NOT new Date()
      d.setHours(hours, minutes, 0, 0);
      return d;
    });
  };

  const getExcludeTimes = () => getExcludeTimesForDate(rescheduleDateTime);

  const getFirstAvailableTime = (date) => {
    let suggested = datePickerProps.getDefaultTimeForDate(date);
    if (!suggested) return null;

    const excludedTimes = getExcludeTimesForDate(date);
    const interval = datePickerProps.timeIntervals; // ← dynamic from hook

    // ── Compare only HH:MM to avoid date mismatch with maxTime (which is today's Date) ──
    const toMins = (d) => d.getHours() * 60 + d.getMinutes();
    const maxMins = toMins(datePickerProps.maxTime);

    while (toMins(suggested) <= maxMins) {
      const suggestedMins = toMins(suggested);

      const isExcluded = excludedTimes.some(
        (excluded) => toMins(excluded) === suggestedMins,
      );

      if (!isExcluded) return suggested; // ✅ free slot found

      // Advance by one interval
      suggested = new Date(suggested.getTime() + interval * 60 * 1000);
    }

    return null; // all slots blocked for this date
  };

  const confirmStatusUpdate = async () => {
    try {
      if (pendingStatus === "RESCHEDULED") {
        // ✅ Validate single rescheduleDateTime instead of separate date+time
        if (!rescheduleDateTime || !remarks.trim()) {
          toast.error("Please select date & time and enter remarks");
          return;
        }
      }

      let body = {};

      if (pendingStatus === "RESCHEDULED") {
        body = {
          start_date: format(rescheduleDateTime, "yyyy-MM-dd HH:mm:ss"),
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
      setRescheduleDateTime(null); // ✅ reset single state

      fetchAppointments(page);
    } catch (err) {
      console.error(err);
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

  useEffect(() => {
    if (selectedLeadClub) dispatch(fetchClubTiming(selectedLeadClub));
  }, [selectedLeadClub]); // <-- dependency added

  // ── NEW: get ready-to-use DatePicker props from Redux timing ──
  const datePickerProps = useClubDatePickerProps(rescheduleDateTime);

  const handleDownloadTrialAppointments = async () => {
    try {
      setLoading(true);

      const params = {};

      // 📅 Date filters
      if (dateFilter?.value && dateFilter.value !== "custom") {
        params.dateFilter = dateFilter.value;
      }

      if (dateFilter?.value === "custom" && customFrom && customTo) {
        params.startDate = format(customFrom, "yyyy-MM-dd");
        params.endDate = format(customTo, "yyyy-MM-dd");
      }

      // 🏢 Club filter
      if (clubFilter?.value) {
        params.club_id = clubFilter.value;
      }

      // 🎯 Applied filters
      Object.entries(appliedFilters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params[key] = value;
        }
      });

      // console.log("📥 Download Params:", params);

      const response = await authAxios().get(
        "/appointment/fetch/list/download?appointment_type=CLUB",
        {
          params,
          responseType: "blob",
        },
      );

      // 📄 Create download
      const blob = new Blob([response.data]);

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.setAttribute("download", "trial-appointments.xlsx");

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

      toast.success("Trial appointments list downloaded successfully!");
    } catch (error) {
      console.error(error);

      toast.error("Failed to download trial appointments list.");
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
            <p className="text-sm">{`Home > Trial Appointments`}</p>
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
                  <span className="absolute z-[1] mt-[9px] ml-[15px]">
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
                  <span className="absolute z-[1] mt-[9px] ml-[15px]">
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
          {!ALLOWED_ROLES.includes(userRole) && (
            <div className="max-w-[190px] w-full">
              <button
                onClick={handleDownloadTrialAppointments}
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
                <LuDownload /> <span>Export Appointments</span>
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
            <TrialAppointmentPanel
              formik={formik}
              filterTrainer={formik.values.filterTrainer}
              filterBookingStatus={formik.values.filterBookingStatus}
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
                    <th className="px-2 py-4 min-w-[100px]">Created On</th>
                    <th className="px-2 py-4 min-w-[150px]">Club Name</th>
                    <th className="px-2 py-4 min-w-[150px]">
                      Appointment Name
                    </th>
                    <th className="px-2 py-4 min-w-[110px]">Enquiry Date</th>
                    <th className="px-2 py-4 min-w-[130px]">Name</th>
                    <th className="px-2 py-4 min-w-[110px]">Scheduled At</th>
                    <th className="px-2 py-4 min-w-[120px]">Trainer Name</th>
                    <th className="px-2 py-4 min-w-[130px]">Scheduled By</th>
                    <th className="px-2 py-4 min-w-[130px]">Last Status</th>
                    <th className="px-2 py-4 min-w-[180px]">Current Status</th>
                    <th className="px-2 py-4 min-w-[150px]">Remarks</th>
                    {(userRole === "FOH" ||
                      userRole === "TRAINER" ||
                      userRole === "FITNESS_MANAGER" ||
                      userRole === "ASS_FITNESS_MANAGER" ||
                      userRole === "CLUB_MANAGER" ||
                      userRole === "ASS_CLUB_MANAGER" ||
                      userRole === "PROGRAM_SPECIALIST" ||
                      userRole === "ADMIN") && (
                      <th className="px-2 py-4 min-w-[100px]">Action</th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {appointmentList.length === 0 ? (
                    <tr>
                      <td colSpan="12" className="text-center py-4">
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
                        <td className="px-2 py-4">Trial/Tour</td>
                        <td className="px-2 py-4">
                          {row?.appointment_date
                            ? formatAutoDate(row.appointment_date)
                            : "--"}
                        </td>
                        <td className="px-2 py-4">{row?.lead_name || "--"}</td>
                        <td className="px-2 py-4">
                          {formatAutoDate(row?.start_date)}
                          <br />
                          {formatTimeAppointment(row?.start_time)}
                        </td>
                        <td className="px-2 py-4">
                          {row?.assigned_staff_name || "--"}
                        </td>
                        <td className="px-2 py-4">
                          {row?.staff_name || "Self"}
                        </td>
                        <td className="px-2 py-4">
                          {formatText(row?.last_status) || "--"}
                        </td>
                        <td className="px-2 py-4">
                          {formatText(
                            row?.booking_status === "ACTIVE"
                              ? "UPCOMING"
                              : row?.booking_status,
                          ) || "--"}
                        </td>
                        <td className="px-2 py-4">
                          {row?.remarks ? row?.remarks : "--"}
                        </td>

                        {(userRole === "FOH" ||
                          userRole === "TRAINER" ||
                          userRole === "FITNESS_MANAGER" ||
                          userRole === "ASS_FITNESS_MANAGER" ||
                          userRole === "CLUB_MANAGER" ||
                          userRole === "ASS_CLUB_MANAGER" ||
                          userRole === "PROGRAM_SPECIALIST" ||
                          userRole === "ADMIN") && (
                          <td className="px-2 py-4">
                            <div className="max-w-[130px] w-full">
                              <div className="flex gap-0">
                                <Tooltip
                                  id={`edit-status-${row?.id}`}
                                  content="Update Status"
                                  place="left"
                                >
                                  <button
                                    className="bg-gray-100 w-8 h-8 rounded-l-md flex border border-gray-300 items-center justify-center disabled:bg-gray-400"
                                    disabled={
                                      !canUpdateStatus(row?.booking_status) ||
                                      getAllowedStatusOptions(
                                        row?.booking_status,
                                      ).length === 0
                                    }
                                    onClick={() => handleActionClick(row)}
                                  >
                                    <GoPencil className="text-lg text-gray-800" />
                                  </button>
                                </Tooltip>
                                <Tooltip
                                  id={`change-trainer-${row?.id}`}
                                  content="Change Trainer"
                                  place="left"
                                >
                                  <button
                                    className="bg-gray-100 w-8 h-8 rounded-r-md border border-gray-300 flex items-center justify-center disabled:bg-gray-300"
                                    disabled={row?.booking_status !== "ACTIVE"}
                                    onClick={() => handleChangeTrainer(row)}
                                  >
                                    <CgGym className="text-lg text-gray-800" />
                                  </button>
                                </Tooltip>
                              </div>
                            </div>
                          </td>
                        )}
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

            {pendingStatus && (
              <p className="text-center mb-4">
                Are you sure you want to mark this appointment as
                <span className="font-bold ml-1">
                  {formatText(pendingStatus)}
                </span>
                ?
              </p>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Status <span className="text-red-500">*</span>
              </label>

              <Select
                placeholder="Select Status"
                value={
                  pendingStatus
                    ? { value: pendingStatus, label: formatText(pendingStatus) }
                    : null
                }
                options={getAllowedStatusOptions(
                  selectedAppointment?.booking_status,
                )}
                onChange={(selected) => {
                  if (!selected) return;

                  setPendingStatus(selected.value);

                  if (selected.value === "RESCHEDULED") {
                    setSelectedTrainerId(selectedAppointment.assigned_staff_id);
                    setSelectedClubId(selectedAppointment.club_id);

                    if (
                      selectedAppointment.start_date &&
                      selectedAppointment.start_time
                    ) {
                      const combined = new Date(selectedAppointment.start_date);

                      const [hours, minutes] =
                        selectedAppointment.start_time.split(":");

                      combined.setHours(Number(hours), Number(minutes), 0, 0);

                      setRescheduleDateTime(combined);
                    }
                  } else {
                    setRescheduleDateTime(null);
                  }
                }}
                styles={customStyles}
              />
            </div>

            {pendingStatus === "CANCELLED" && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Remarks <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={remarks}
                  // onChange={(e) => setRemarks(e.target.value)}
                  onChange={(e) => {
                    const cleaned = sanitizeTextWithNumbers(e.target.value);
                    setRemarks(cleaned);
                  }}
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
                  <div className="custom--date relative">
                    {/* Calendar Icon */}
                    <span className="absolute z-[1] mt-[11px] ml-[15px]">
                      <FaCalendarDays />
                    </span>
                    <DatePicker
                      selected={rescheduleDateTime}
                      onChange={(date) => {
                        if (!date) {
                          setRescheduleDateTime(null);
                          return;
                        }

                        const prev = rescheduleDateTime;
                        const isSameDay =
                          prev &&
                          new Date(prev).toDateString() ===
                            new Date(date).toDateString();

                        if (isSameDay) {
                          setRescheduleDateTime(date);
                        } else {
                          const dateWithTime = getFirstAvailableTime(date);
                          setRescheduleDateTime(dateWithTime ?? null);
                        }
                      }}
                      {...datePickerProps}
                      excludeTimes={getExcludeTimes()}
                      disabled={!selectedTrainerId} // ✅ IMPORTANT
                      className="custom--input w-full input--icon"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Remarks <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={remarks}
                    // onChange={(e) => setRemarks(e.target.value)}
                    onChange={(e) => {
                      const cleaned = sanitizeTextWithNumbers(e.target.value);
                      setRemarks(cleaned);
                    }}
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

      {changeTrainerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-[10px] w-[400px] shadow-lg">
            <h3 className="text-lg font-semibold mb-1 text-center">
              Confirm Trainer Change
            </h3>

            <p className="text-center mb-4">
              Are you sure you want to assign a new trainer to this trial appointment?
            </p>

            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium">
                Change Trainer Name <span className="text-red-500">*</span>
              </label>
              <Select
                value={
                  trainerChangeOptions.find(
                    (opt) => opt.value === updateTrainerId
                  ) || null
                }
                onChange={(option) => {
                  if (!option || option.isDisabled) return;

                  setUpdateTrainerId(option.value);
                }}
                options={trainerChangeOptions}
                placeholder="Select trainer"
                styles={customStyles}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Remarks <span className="text-red-500">*</span>
              </label>
              <textarea
                value={remarks}
                // onChange={(e) => setRemarks(e.target.value)}
                onChange={(e) => {
                  const cleaned = sanitizeTextWithNumbers(e.target.value);
                  setRemarks(cleaned);
                }}
                placeholder="Enter cancellation reason"
                rows="4"
                className="w-full border border-gray-300 rounded-[5px] p-2 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
              />
            </div>

            <div className="flex justify-between gap-3">
              <button
                onClick={() => {
                  setChangeTrainerModal(false);
                  setRemarks("");
                }}
                className="w-1/2 border border-gray-400 rounded py-2 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={confirmChangeTrainer}
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

export default IsLoadingHOC(TrialAppointments);
