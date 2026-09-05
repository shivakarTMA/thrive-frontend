import React, { useEffect, useRef, useState, useMemo } from "react";
import { FiClock, FiPlus, FiTrash2 } from "react-icons/fi";
import { IoCloseCircle } from "react-icons/io5";
import Select from "react-select";
import {
  blockInvalidNumberKeys,
  blockNonLettersAndNumbers,
  customStyles,
  filterActiveItems,
  sanitizePositiveInteger,
  sanitizeTextWithNumbers,
  selectIcon,
} from "../../Helper/helper";
import DatePicker from "react-datepicker"; // Date picker component
import "react-datepicker/dist/react-datepicker.css"; // Date picker styles
import { FaCalendarDays } from "react-icons/fa6";
import { authAxios } from "../../config/config";
import { toast } from "react-toastify";
import { PiImageFill } from "react-icons/pi";
import { useDispatch } from "react-redux";

// status type options for dropdown
const statusType = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
];
// Booking type options for dropdown
const bookingType = [
  { label: "Paid", value: "PAID" },
  { label: "Free", value: "FREE" },
];

// Is Feature type options for dropdown
const featureType = [
  { label: "Yes", value: true },
  { label: "No", value: false },
];

const CreateBatchClasses = ({  setShowBatchModal,
  editingOption,
  checkActiveBooking,
  formik }) => {
  const leadBoxRef = useRef(null);
  const [studio, setStudio] = useState([]);
  const [club, setClub] = useState([]);
  const [service, setService] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [packageCategory, setPackageCategory] = useState([]);
  // const [clubTiming, setClubTiming] = useState([]);
  const [trainerSlotsData, setTrainerSlotsData] = useState([]);
  const slotsRequestIdRef = useRef(0);
  const dispatch = useDispatch();
  const [clubSlotsData, setClubSlotsData] = useState([]);
  const [clubSlotsLoading, setClubSlotsLoading] = useState(false);

  const FULL_TO_SHORT_DAY = {
    Monday: "Mon",
    Tuesday: "Tue",
    Wednesday: "Wed",
    Thursday: "Thu",
    Friday: "Fri",
    Saturday: "Sat",
    Sunday: "Sun",
  };

  const shortWeekday = (day) => FULL_TO_SHORT_DAY[day] || day;
  const clubSlotsByWeekday = useMemo(() => {
    const map = {};
    clubSlotsData.forEach((entry) => {
      const shortDay = FULL_TO_SHORT_DAY[entry.weekday];
      if (shortDay && !map[shortDay]) {
        map[shortDay] = entry.slots || [];
      }
    });
    return map;
  }, [clubSlotsData]);

  // ===== Create Class modal tabs =====
  const [activeTab, setActiveTab] = useState("details"); // "details" | "schedule"

  const DETAILS_TAB_FIELDS = [
    "image",
    "club_id",
    "service_id",
    "show_on_app",
    "package_category_id",
    "name",
    "is_featured",
    "position",
    "tags",
    "description",
  ];

  const goToScheduleTab = (e) => {
    if (e) e.preventDefault();
    formik.validateForm().then((errors) => {
      const detailsErrors = Object.keys(errors).filter((key) =>
        DETAILS_TAB_FIELDS.includes(key),
      );
      if (detailsErrors.length > 0) {
        formik.setTouched(
          Object.fromEntries(detailsErrors.map((key) => [key, true])),
        );
        return;
      }
      setActiveTab("schedule");
    });
  };

  // ===== Schedule (weekly recurring pattern) builder state =====
  const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const [scheduleMode, setScheduleMode] = useState("weekly"); // "single" | "weekly"
  const [scheduleStartDate, setScheduleStartDate] = useState("");
  const [scheduleEndDate, setScheduleEndDate] = useState("");
  const [skipDates, setSkipDates] = useState([]);
  const [showSessionList, setShowSessionList] = useState(true);
  const [autoReserve, setAutoReserve] = useState(false);
  const [conflictAction, setConflictAction] = useState("skip");
  const makeSlot = () => ({
    startTime: "",
    endTime: "",
    trainerId: "",
    studioId: "",
    capacity: 18,
    waitlist: 0,
  });
  const [dayRows, setDayRows] = useState(
    DAY_LABELS.map((day) => ({
      day,
      enabled: false,
      slots: [makeSlot()],
    })),
  );

  // Tracks which enabled slot fields (startTime/endTime/trainerId/studioId)
  // are missing, keyed by `${dayIndex}-${slotIndex}`, so we can red-outline them.
  const [slotErrors, setSlotErrors] = useState({});

  // Conflicting sessions returned by the API (e.g. on_conflict = WARN).
  const [sessionConflicts, setSessionConflicts] = useState([]);

  const updateSlot = (dayIndex, slotIndex, changes) => {
    setDayRows((rows) =>
      rows.map((row, i) =>
        i === dayIndex
          ? {
              ...row,
              slots: row.slots.map((slot, si) =>
                si === slotIndex ? { ...slot, ...changes } : slot,
              ),
            }
          : row,
      ),
    );

    // Clear the red outline on fields as soon as they're filled in.
    const key = `${dayIndex}-${slotIndex}`;
    setSlotErrors((prev) => {
      if (!prev[key]) return prev;
      const updatedFieldErrors = { ...prev[key] };
      Object.keys(changes).forEach((field) => {
        if (changes[field]) updatedFieldErrors[field] = false;
      });
      if (!Object.values(updatedFieldErrors).some(Boolean)) {
        const { [key]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: updatedFieldErrors };
    });
  };

  const addSlot = (dayIndex) => {
    setDayRows((rows) =>
      rows.map((row, i) =>
        i === dayIndex
          ? {
              ...row,
              // Fresh slot with cleared unique fields so it doesn't look
              // like a duplicate of the last slot while the user picks values.
              slots: [...row.slots, makeSlot()],
            }
          : row,
      ),
    );
  };

  const removeSlot = (dayIndex, slotIndex) => {
    setDayRows((rows) =>
      rows.map((row, i) =>
        i === dayIndex && row.slots.length > 1
          ? { ...row, slots: row.slots.filter((_, si) => si !== slotIndex) }
          : row,
      ),
    );
  };

  const toggleDayEnabled = (dayIndex, enabled) => {
    setDayRows((rows) =>
      rows.map((row, i) => {
        if (i !== dayIndex) return row;
        const updated = { ...row, enabled };
        return enabled ? applyDefaultTimes(updated) : updated;
      }),
    );
  };

 const copyFirstRowToWeek = () => {
  setDayRows((rows) => {
    const firstRow = rows[0];

    return rows.map((row, index) => {
      if (index === 0) return row;

      return {
        ...row,
        enabled: true, // Enables Saturday and Sunday too
        slots: firstRow.slots.map((slot) => ({
          ...slot,
        })),
      };
    });
  });
};
// A day with no enabled club slots can't have any class created for it.
const hasAvailableSlots = (dayLabel) =>
  (clubSlotsByWeekday[dayLabel] || []).some((slot) => slot.enable);

  const selectWeekdaysOnly = () => {
    setDayRows((rows) =>
      rows.map((row) => {
        const enabled =
          row.day !== "Sat" && row.day !== "Sun" && hasAvailableSlots(row.day);
        const updated = { ...row, enabled };
        return enabled ? applyDefaultTimes(updated) : updated;
      }),
    );
  };

  const selectAllDays = () => {
    setDayRows((rows) =>
      rows.map((row) => {
        const enabled = hasAvailableSlots(row.day);
        const updated = { ...row, enabled };
        return enabled ? applyDefaultTimes(updated) : updated;
      }),
    );
  };

const clearAllDays = () => {
  // Clear table rows
  setDayRows((rows) =>
    rows.map((row) => ({
      ...row,
      enabled: false,
      slots: [makeSlot()],
    })),
  );

  // Clear selected date range
  setScheduleStartDate("");
  setScheduleEndDate("");
  setSessionConflicts([]);

  // Clear excluded dates
  setSkipDates([]);

  // Hide the old session list
  setShowSessionList(false);

  // Clear Formik values
  formik.setFieldValue("schedule_start_date", "");
  formik.setFieldValue("schedule_end_date", "");
  formik.setFieldValue("skip_dates", []);
};

const toggleSkipDate = (dateStr) => {
  setSkipDates((previousDates) =>
    previousDates.includes(dateStr)
      ? previousDates.filter((date) => date !== dateStr)
      : [...previousDates, dateStr],
  );
};

  // Builds the list of concrete sessions from the weekly pattern between
  // scheduleStartDate and scheduleEndDate, skipping dates in skipDates.
  // Each enabled day can have multiple slots, each producing its own session.
  const scheduledSessions = useMemo(() => {
    if (
      scheduleMode !== "weekly" ||
      !scheduleStartDate ||
      !scheduleEndDate
    ) {
      return [];
    }

    const start = new Date(scheduleStartDate);
    const end = new Date(scheduleEndDate);
    if (isNaN(start) || isNaN(end) || start > end) return [];

    const enabledDays = new Set(
      dayRows.filter((r) => r.enabled).map((r) => r.day),
    );
    const rowsByDay = Object.fromEntries(dayRows.map((r) => [r.day, r]));

    const sessions = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      const dayLabel = DAY_LABELS[(cursor.getDay() + 6) % 7]; // Mon-first index
     
    if (enabledDays.has(dayLabel)) {
  const dateStr = cursor.toLocaleDateString("en-CA");
  const row = rowsByDay[dayLabel];

  // Do not create any slot for a skipped date
  if (!skipDates.includes(dateStr)) {
    row.slots.forEach((slot, slotIndex) => {
      sessions.push({
        date: dateStr,
        day: dayLabel,
        startTime: slot.startTime,
        endTime: slot.endTime,
        slotIndex,
      });
    });
  }
}
      cursor.setDate(cursor.getDate() + 1);
    }
    return sessions;
  }, [scheduleMode, scheduleStartDate, scheduleEndDate, skipDates, dayRows]);

  // Maps the conflict select's current values to the API's expected enum.
  const CONFLICT_ACTION_MAP = {
    Stop: "SKIP",
    Warn: "WARN",
  };

  // Attaches each scheduled session's trainer/studio/capacity from the
  // matching day row + slot, and formats date/time for the API.
  const buildSessionsPayload = () => {
    const rowsByDay = Object.fromEntries(dayRows.map((r) => [r.day, r]));

    return scheduledSessions.map((s) => {
      const slot = rowsByDay[s.day]?.slots?.[s.slotIndex] || {};

      return {
        date: s.date,
        start_time: s.startTime ? `${s.startTime}:00` : "",
        end_time: s.endTime ? `${s.endTime}:00` : "",
        trainer_id: slot.trainerId || null,
        studio_id: slot.studioId || null,
        max_capacity: slot.capacity,
        waitlist_capacity: slot.waitlist,
      };
    });
  };

  // Ensures every enabled day's slots have Class Start/End/Trainer/Studio
  // filled in; returns a map of `${dayIndex}-${slotIndex}` -> field flags.
  const validateSlots = () => {
    const errors = {};
    dayRows.forEach((row, dayIndex) => {
      if (!row.enabled) return;
      row.slots.forEach((slot, slotIndex) => {
        const fieldErrors = {
          startTime: !slot.startTime,
          endTime: !slot.endTime,
          trainerId: !slot.trainerId,
          studioId: !slot.studioId,
        };
        if (Object.values(fieldErrors).some(Boolean)) {
          errors[`${dayIndex}-${slotIndex}`] = fieldErrors;
        }
      });
    });
    return errors;
  };

  const handleBatchSubmit = async (e) => {
    e.preventDefault();

    setSessionConflicts([]);

    const errors = validateSlots();
    if (Object.keys(errors).length > 0) {
      setSlotErrors(errors);
      toast.error("Class Start, Class End, Trainer and Studio are required for every slot");
      return;
    }
    setSlotErrors({});

    const sessions = buildSessionsPayload();
    if (!sessions.length) {
      toast.error("Please build at least one session before submitting");
      return;
    }

    const isPaid = formik.values.booking_type === "PAID";
    const payload = {
      club_id: formik.values.club_id,
      service_id: formik.values.service_id,
      package_category_id: formik.values.package_category_id,
      name: formik.values.name,
      caption: formik.values.caption ?? null,
      description: formik.values.description,
      tags: formik.values.tags,
      equipment: formik.values.equipment,
      position: formik.values.position,
      amount: isPaid ? Number(formik.values.amount || 0) : 0,
      discount: isPaid ? Number(formik.values.discount || 0) : 0,
      gst: isPaid ? Number(formik.values.gst ?? 5) : 0,
      booking_type: formik.values.booking_type || "FREE",
      is_featured: !!formik.values.is_featured,
      hsn_sac_code: formik.values.hsn_sac_code || "",
      show_on_app: !!formik.values.show_on_app,
      on_conflict: CONFLICT_ACTION_MAP[formik.values.conflict_action] || "SKIP",
      sessions,
    };

    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (key === "sessions") {
        formData.append("sessions", JSON.stringify(value));
      } else if (typeof value === "boolean") {
        formData.append(key, value ? "true" : "false");
      } else {
        formData.append(key, value ?? "");
      }
    });

    if (formik.values.image instanceof File) {
      formData.append("image", formik.values.image);
    }

    try {
      formik.setSubmitting(true);
      await authAxios().post("/package/group/class/bulk/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Classes created successfully");
      formik.resetForm();
      setShowBatchModal(false);
    } catch (err) {
      console.error("Batch create error:", err);
      const responseData = err.response?.data;

      if (responseData?.conflict_type === "EXISTING_DATA") {
        setSessionConflicts(responseData.conflicts || []);
      }

      toast.error(
        responseData?.message ||
          responseData?.errors ||
          "Failed to create classes",
      );
    } finally {
      formik.setSubmitting(false);
    }
  };

  // Sessions grouped per weekday+time for the "Mon · 7:00 PM  4 × 7:00 PM" summary rows
 const sessionSummaryByDay = useMemo(() => {
  const groups = {};

  scheduledSessions.forEach((s) => {
    // slotIndex keeps same-time slots separate
    const key = `${s.day}-${s.startTime}-${s.slotIndex}`;

    if (!groups[key]) {
      groups[key] = {
        day: s.day,
        time: s.startTime,
        slotIndex: s.slotIndex,
        count: 0,
      };
    }

    groups[key].count += 1;
  });

  return Object.values(groups).sort((a, b) => {
    const dayDifference =
      DAY_LABELS.indexOf(a.day) - DAY_LABELS.indexOf(b.day);

    if (dayDifference !== 0) {
      return dayDifference;
    }

    const timeDifference = a.time.localeCompare(b.time);

    if (timeDifference !== 0) {
      return timeDifference;
    }

    return a.slotIndex - b.slotIndex;
  });
}, [scheduledSessions]);

  const formatDateForState = (date) => {
  if (!date) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const availableDaysInRange = useMemo(() => {
  if (!scheduleStartDate || !scheduleEndDate) {
    return new Set();
  }

  const start = new Date(`${scheduleStartDate}T00:00:00`);
  const end = new Date(`${scheduleEndDate}T00:00:00`);

  if (start > end) {
    return new Set();
  }

  const availableDays = new Set();
  const currentDate = new Date(start);

  while (currentDate <= end) {
    const dayLabel =
      DAY_LABELS[(currentDate.getDay() + 6) % 7];

    availableDays.add(dayLabel);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return availableDays;
}, [scheduleStartDate, scheduleEndDate]);

useEffect(() => {
  if (!scheduleStartDate || !scheduleEndDate) return;

  setDayRows((rows) =>
    rows.map((row) => {
      const enabled =
        availableDaysInRange.has(row.day) && hasAvailableSlots(row.day);
      const updated = { ...row, enabled };
      // Select only days which come in the chosen date range
      return enabled ? applyDefaultTimes(updated) : updated;
    }),
  );
}, [scheduleStartDate, scheduleEndDate, availableDaysInRange, clubSlotsByWeekday]);

const getDateObject = (dateString) => {
  if (!dateString) return null;

  return new Date(`${dateString}T00:00:00`);
};
  const fetchClub = async (search = "") => {
    try {
      const res = await authAxios().get("/club/list", {
        params: search ? { search } : {},
      });
      let data = res.data?.data || res.data || [];
      const activeOnly = filterActiveItems(data);
      setClub(activeOnly);
    } catch (err) {
      console.error(err);
    }
  };

// ===============================
// FETCH TRAINER AVAILABILITY (new API)
// Group class scheduling isn't a package/complimentary session, so this
// uses booking_type "TRIAL" — response gives open_time/close_time per
// date (no discrete slots), gated by the holiday flags.
// ===============================
const fetchTrainerAvailability = async (trainerId, clubId) => {
  if (!trainerId || !clubId) {
    setTrainerSlotsData([]);
    return;
  }

  const requestId = ++slotsRequestIdRef.current;

  try {
    const res = await authAxios().post(
      "/staff/operating/hours/trainer/slots",
      {
        trainer_id: trainerId,
        club_id: clubId,
        booking_type: "TRIAL",
      },
    );

    if (requestId !== slotsRequestIdRef.current) return;

    setTrainerSlotsData(res.data?.data || []);
  } catch (err) {
    if (requestId !== slotsRequestIdRef.current) return;

    console.error("Trainer availability fetch error:", err);
    setTrainerSlotsData([]);
  }
};

  const fetchService = async (clubId = null) => {
    try {
      const params = {};
      if (clubId) params.club_id = clubId;
      const res = await authAxios().get("/service/list", { params });
      let data = res.data?.data || res.data || [];

      const activeService = data.filter(
        (item) => item.status === "ACTIVE" && item.type === "GROUP_CLASS",
      );

      console.log(activeService, "activeService");
      setService(activeService);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStaff = async (clubId = null) => {
    try {
      const params = {
        role: "TRAINER,FITNESS_MANAGER,ASS_FITNESS_MANAGER",
      };
      if (clubId) {
        params.club_id = clubId;
      }
      const res = await authAxios().get("/staff/list", {
        params,
      });
      
      let data = res.data?.data || res.data || [];
      const activeService = data.filter((item) => item.status === "ACTIVE");
      setStaffList(activeService);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudio = async (clubId = null) => {
    try {
      const params = {};
      if (clubId) params.club_id = clubId;
      const res = await authAxios().get("/studio/list", { params });
      let data = res.data?.data || res.data || [];
      const activeService = data.filter((item) => item.status === "ACTIVE");
      setStudio(activeService);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPackageCategory = async (clubId = null) => {
    try {
      const params = {};
      if (clubId) params.club_id = clubId;
      const res = await authAxios().get("/package-category/list", { params });
      let data = res.data?.data || res.data || [];
      // filter only ACTIVE categories
      const activeCategories = data.filter((item) => item.status === "ACTIVE");
      setPackageCategory(activeCategories);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchClub();
  }, []);

  useEffect(() => {
    if (formik.values.club_id) {
      fetchService(formik.values.club_id);
      fetchStudio(formik.values.club_id);
      fetchStaff(formik.values.club_id);
      fetchPackageCategory(formik.values.club_id);

      // ❌ reset ONLY when NOT editing
      if (!editingOption) {
        formik.setFieldValue("service_id", "");
        formik.setFieldValue("studio_id", "");
        formik.setFieldValue("trainer_id", "");
        formik.setFieldValue("package_category_id", "");
        formik.setFieldValue("start_time", ""); // ✅ ADD
        formik.setFieldValue("end_time", ""); // ✅ ADD
      }
    } else {
      setService([]);
      setStudio([]);
      setStaffList([]);
      setPackageCategory([]);
    }
  }, [formik.values.club_id]);

  // Availability window depends on BOTH club and trainer, so refetch
// whenever either changes.
useEffect(() => {
  if (!formik.values.trainer_id || !formik.values.club_id) {
    slotsRequestIdRef.current += 1; // invalidate any in-flight request
    setTrainerSlotsData([]);
    return;
  }

  fetchTrainerAvailability(formik.values.trainer_id, formik.values.club_id);
}, [formik.values.trainer_id, formik.values.club_id]);

// Reset date/time whenever trainer changes — the availability window
// that produced the old options no longer applies.
useEffect(() => {
  if (!editingOption) {
    formik.setFieldValue("start_date", "");
    formik.setFieldValue("start_time", "");
    formik.setFieldValue("end_time", "");
  }
}, [formik.values.trainer_id]);

  const formatTo12Hour = (time24) => {
    if (!time24) return "";
    const [h, m] = time24.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;

    return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
  };

const NO_SLOTS_OPTION = { label: "No time Slots", value: "", isDisabled: true };

// API returns dates as dd-mm-yyyy
const formatDateForApi = (date) => {
  if (!date) return null;
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
};

// Only dates present in the API response are selectable in the calendar
const availableDatesSet = useMemo(() => {
  return new Set(trainerSlotsData.map((d) => d.date));
}, [trainerSlotsData]);

const filterAvailableDate = (date) => {
  const dateStr = formatDateForApi(date);
  return availableDatesSet.has(dateStr);
};

// The matched day's entry for the selected start_date
const selectedDayData = useMemo(() => {
  if (!formik.values.start_date || !trainerSlotsData.length) return null;

  const dateStr = formatDateForApi(new Date(formik.values.start_date));

  return trainerSlotsData.find((d) => d.date === dateStr) || null;
}, [formik.values.start_date, trainerSlotsData]);

const daySlots = selectedDayData?.slots || [];

// Generates "HH:mm" slots between start and end at a fixed interval.
const SLOT_INTERVAL_MINUTES = 15; // ⚠️ confirm real interval, see note below

const generateTimeSlots = (start, end, interval = SLOT_INTERVAL_MINUTES) => {
  if (!start || !end) return [];

  const slots = [];
  const [startH, startM] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);

  const current = new Date();
  current.setHours(startH, startM, 0, 0);

  const endDate = new Date();
  endDate.setHours(endH, endM, 0, 0);

  while (current <= endDate) {
    const h = String(current.getHours()).padStart(2, "0");
    const m = String(current.getMinutes()).padStart(2, "0");
    slots.push(`${h}:${m}`);
    current.setMinutes(current.getMinutes() + interval);
  }

  return slots;
};

// Club timing for the selected date, generated from open_time/close_time
const clubTiming = useMemo(() => {
  if (!selectedDayData) return [];
  if (selectedDayData.is_full_day_holiday || selectedDayData.is_staff_holiday) {
    return [];
  }
  return generateTimeSlots(selectedDayData.open_time, selectedDayData.close_time);
}, [selectedDayData]);

const startTimeOptions = useMemo(() => {
  if (!formik.values.start_date) return [];
  if (!daySlots.length) return [NO_SLOTS_OPTION];

  const now = new Date();
  const selectedDate = new Date(formik.values.start_date);
  const isToday = selectedDate.toDateString() === now.toDateString();

  return daySlots.map((slot) => {
    let isDisabled = !slot.enable;

    // extra safety guard — minDate should already prevent past dates,
    // but block past times on today specifically
    if (isToday) {
      const [h, m] = slot.time.split(":").map(Number);
      const slotDate = new Date(selectedDate);
      slotDate.setHours(h, m, 0, 0);
      if (slotDate <= now) isDisabled = true;
    }

    return {
      label: formatTo12Hour(slot.time),
      value: slot.time,
      isDisabled,
    };
  });
}, [daySlots, formik.values.start_date]);

const endTimeOptions = useMemo(() => {
  if (!formik.values.start_time) return [];
  if (!daySlots.length) return [NO_SLOTS_OPTION];

  const [sh, sm] = formik.values.start_time.split(":").map(Number);
  const startMinutes = sh * 60 + sm;

  return daySlots.map((slot) => {
    const [eh, em] = slot.time.split(":").map(Number);
    const endMinutes = eh * 60 + em;

    const isDisabled = !slot.enable || endMinutes <= startMinutes;

    return {
      label: formatTo12Hour(slot.time),
      value: slot.time,
      isDisabled,
    };
  });
}, [daySlots, formik.values.start_time]);

  const trainerOptions =
    staffList?.map((item) => ({
      label: item.name,
      value: item.id,
    })) || [];

  const clubOptions =
    club?.map((item) => ({
      label: item.name,
      value: item.id,
    })) || [];

  const studioOptions =
    studio?.map((item) => ({
      label: item.name,
      value: item.id,
    })) || [];

  const serviceOptions =
    service
      ?.map((item) => ({
        label: item.name,
        value: item.id,
        type: item.type,
      }))
      .filter((item) => item.type !== "PRODUCT") || [];

  const packageCategoryOptions =
    packageCategory?.map((item) => ({
      label: item.title,
      value: item.id,
    })) || [];

  // ✅ Reset fields except image when service_id changes
  useEffect(() => {
    const fetchPackageById = async (id) => {
      try {
        const res = await authAxios().get(`/package/${id}`);
        const data = res.data?.data || res.data || null;

        if (data) {
          formik.setValues({
            name: data?.name || "",
            service_id: data?.service_id || "",
            trainer_id: data?.trainer_id || "",
            club_id: data?.club_id || null,
            studio_id: data?.studio_id || null,
            package_category_id: data?.package_category_id || "",
            description: data?.description || "",
            image: data?.image || null,
            start_date: data?.start_date || "",
            start_time: data?.start_time ? data.start_time.slice(0, 5) : "",
            end_time: data?.end_time ? data.end_time.slice(0, 5) : "",
            max_capacity:
              data?.max_capacity !== undefined ? data.max_capacity : "",
            waitlist_capacity:
              data?.waitlist_capacity !== undefined
                ? data.waitlist_capacity
                : "",
            tags: data?.tags || "",
            amount: data?.amount !== undefined ? data.amount : "",
            discount: data?.discount !== undefined ? data.discount : "",
            booking_type: data?.booking_type || "",
            // gst: data?.gst !== undefined ? data.gst : "",
            earn_coin: data?.earn_coin !== undefined ? data.earn_coin : "",
            position: data?.position !== undefined ? data.position : "",
            hsn_sac_code: data?.hsn_sac_code || "",
            is_featured:
              data?.is_featured === true
                ? true
                : data?.is_featured === false
                  ? false
                  : null,
            equipment: data?.equipment || "",
            status: data?.status || "",
            show_on_app:
              data?.show_on_app === true
                ? true
                : data?.show_on_app === false
                  ? false
                  : null,
          });
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (editingOption) {
      fetchPackageById(editingOption);
    }
  }, [editingOption]);

  const handleFileChange = (e, formik) => {
    const file = e.target.files[0];
    if (!file) return;
    formik.setFieldValue("image", file); // for preview
  };

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      setShowBatchModal(false);
    }
  };

// Ayush Works from here 

const fetchClubSlots = async () => {
      try {
        if (!formik.values.club_id) {
          setClubSlotsData([]);
          return;
        }
  
        setClubSlotsLoading(true);
  
        const res = await authAxios().post("/club/details/slots", {
          club_id: formik.values.club_id,
        });
  
        setClubSlotsData(res.data?.data || []);
      } catch (err) {
        console.error("Club slots error:", err);
        setClubSlotsData([]);
      } finally {
        setClubSlotsLoading(false);
      }
    };

    useEffect(()=>{
      fetchClubSlots()
    },[formik.values.club_id])

// Time options for a given weekday, optionally disabling times at/after
// `afterTime` for the "Class End" select.
const getDayTimeOptions = (dayLabel, afterTime) => {
  const slots = clubSlotsByWeekday[dayLabel] || [];
  return slots.map((slot) => ({
    label: formatTo12Hour(slot.time),
    value: slot.time,
    isDisabled: !slot.enable || (afterTime ? slot.time <= afterTime : false),
  }));
};

// Defaults a row's slots to the day's first/last available time whenever
// they don't already have a start/end time set.
const applyDefaultTimes = (row) => {
  const available = (clubSlotsByWeekday[row.day] || []).filter(
    (slot) => slot.enable,
  );
  if (!available.length) return row;

  const firstTime = available[0].time;
  const lastTime = available[available.length - 1].time;

  return {
    ...row,
    slots: row.slots.map((slot) => ({
      ...slot,
      startTime: slot.startTime || firstTime,
      endTime: slot.endTime || lastTime,
    })),
  };
};

// Merges customStyles with a red control border/shadow when a field is invalid.
const getSlotSelectStyles = (isInvalid) => ({
  ...customStyles,
  control: (base, state) => {
    const merged = customStyles.control(base, state);
    if (!isInvalid) return merged;
    return {
      ...merged,
      borderColor: "#ef4444",
      boxShadow: "0 0 0 1px #ef4444",
      "&:hover": { borderColor: "#ef4444" },
    };
  },
});

// Disables a trainer/studio option if another slot on the same day already
// has the exact same (startTime, endTime, field) combination.
const excludeDuplicateCombo = (options, row, slotIndex, field) => {
  const current = row.slots[slotIndex];
  const usedValues = new Set(
    row.slots
      .filter((_, i) => i !== slotIndex)
      .filter(
        (s) => s.startTime === current.startTime && s.endTime === current.endTime,
      )
      .map((s) => s[field])
      .filter(Boolean),
  );
  return options.map((option) =>
    usedValues.has(option.value)
      ? { ...option, isDisabled: true }
      : option,
  );
};






  return (
    <>
      <div
        className="bg--blur create--lead--container overflow-auto hide--overflow fixed top-0 left-0 z-[999] w-full bg-black bg-opacity-60 h-full"
        onClick={handleOverlayClick}
      >
        <div
          className="min-h-[70vh] w-[95%] max-w-5xl mx-auto mt-[100px] mb-[100px] container--leadbox rounded-[10px] flex flex-col"
          ref={leadBoxRef}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-white rounded-t-[10px] flex gap-3 items-center justify-between py-4 px-4 border-b">
            <h2 className="text-xl font-semibold">
              {editingOption ? "Edit Class" : "Create Class"}
            </h2>
            <div
              className="close--lead cursor-pointer"
              onClick={() => {
                formik.resetForm();
                setShowBatchModal(false);
              }}
            >
              <IoCloseCircle className="text-3xl" />
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white flex gap-6 px-6 border-b">
            <button
              type="button"
              onClick={() => setActiveTab("details")}
              className={`py-3 text-sm font-medium border-b-2 -mb-px ${
                activeTab === "details"
                  ? "border-black text-black"
                  : "border-transparent text-gray-500"
              }`}
            >
              Session Details
            </button>
            <button
              type="button"
              onClick={goToScheduleTab}
              className={`py-3 text-sm font-medium border-b-2 -mb-px ${
                activeTab === "schedule"
                  ? "border-black text-black"
                  : "border-transparent text-gray-500"
              }`}
            >
              Schedule
            </button>
          </div>

          {/* Form */}
          <div className="flex-1">
            <form onSubmit={handleBatchSubmit} className="space-y-6">
              <div className="flex bg-white rounded-b-[10px]">
                <div className="p-6 flex-1">
                  {/* <div className="flex gap-3"> */}

                  {activeTab === "details" && (
                  <>
                  <div className="grid md:grid-cols-4 grid-cols-1 gap-4 gap-y-2">
                    {/* Image Preview */}
                    <div className="row-span-2">
                      <div className="bg-gray-100 rounded-lg w-full h-[160px] overflow-hidden">
                        {formik.values?.image ? (
                          <img
                            src={
                              formik.values.image instanceof File
                                ? URL.createObjectURL(formik.values.image)
                                : formik.values.image
                            }
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center">
                            <PiImageFill className="text-gray-300 text-7xl" />
                            <span className="text-gray-500 text-sm">
                              Upload Image
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Image Upload */}
                    <div>
                      <label className="mb-2 block">
                        Image<span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          name="image"
                          // onChange={handleFileChange} // ✅ no value prop here
                          onChange={(e) => handleFileChange(e, formik)}
                          onBlur={() => formik.setFieldTouched("image", true)}
                          className="custom--input w-full"
                        />
                      </div>

                      {formik.touched.image && formik.errors.image && (
                        <div className="text-red-500 text-sm">
                          {formik.errors.image}
                        </div>
                      )}
                    </div>
                    {/* Club Dropdown */}
                    <div>
                      <label className="mb-2 block">
                        Club<span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Select
                          name="club_id"
                          value={
                            clubOptions.find(
                              (option) =>
                                option.value.toString() ===
                                formik.values.club_id?.toString(),
                            ) || null
                          }
                          options={clubOptions}
                          onChange={(option) =>
                            formik.setFieldValue("club_id", option.value)
                          }
                          onBlur={() => formik.setFieldTouched("club_id", true)}
                          styles={customStyles}
                          className="!capitalize"
                        />
                      </div>
                      {formik.touched.club_id && formik.errors.club_id && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.club_id}
                        </p>
                      )}
                    </div>
                    {/* Service ID */}
                    <div>
                      <label className="mb-2 block">
                        Service<span className="text-red-500">*</span>
                      </label>
                      <Select
                        name="service_id"
                        value={
                          serviceOptions.find(
                            (opt) => opt.value === formik.values.service_id,
                          ) || null
                        }
                        options={serviceOptions}
                        onChange={(option) => {
                          formik.setFieldValue("service_id", option.value);
                        }}
                        onBlur={() =>
                          formik.setFieldTouched("service_id", true)
                        }
                        styles={customStyles}
                      />
                      {formik.touched.service_id &&
                        formik.errors.service_id && (
                          <div className="text-red-500 text-sm">
                            {formik.errors.service_id}
                          </div>
                        )}
                    </div>
                      <div>
                      <label className="mb-2 block">
                        Show on App<span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Select
                          name="show_on_app"
                          value={featureType.find(
                            (opt) => opt.value === formik.values.show_on_app,
                          )}
                          options={featureType}
                          onChange={(option) =>
                            formik.setFieldValue(
                              "show_on_app",
                              option?.value ?? null,
                            )
                          }
                          onBlur={() =>
                            formik.setFieldTouched("show_on_app", true)
                          }
                          styles={customStyles}
                        />
                      </div>
                      {formik.touched.show_on_app &&
                        formik.errors.show_on_app && (
                          <div className="text-red-500 text-sm">
                            {formik.errors.show_on_app}
                          </div>
                        )}
                    </div>
                    {/* Service ID */}
              

                    <div>
                      <label className="mb-2 block">
                        Category<span className="text-red-500">*</span>
                      </label>

                      <Select
                        name="package_category_id"
                        value={
                          packageCategoryOptions.find(
                            (opt) =>
                              opt.value === formik.values.package_category_id,
                          ) || null
                        }
                        options={packageCategoryOptions}
                        onChange={(option) =>
                          formik.setFieldValue(
                            "package_category_id",
                            option.value,
                          )
                        }
                        onBlur={() =>
                          formik.setFieldTouched("package_category_id", true)
                        }
                        styles={customStyles}
                      />

                      {formik.touched.package_category_id &&
                        formik.errors.package_category_id && (
                          <div className="text-red-500 text-sm">
                            {formik.errors.package_category_id}
                          </div>
                        )}
                    </div>
                 

                    {/* Name */}
                    <div>
                      <label className="mb-2 block">
                        Class Name<span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="name"
                          value={formik.values.name}
                          // onChange={formik.handleChange}
                          onKeyDown={blockNonLettersAndNumbers}
                          onChange={(e) => {
                            const cleaned = sanitizeTextWithNumbers(
                              e.target.value,
                            );
                            formik.setFieldValue("name", cleaned);
                          }}
                          onBlur={formik.handleBlur}
                          className="custom--input w-full"
                        />
                      </div>

                      {formik.touched.name && formik.errors.name && (
                        <div className="text-red-500 text-sm">
                          {formik.errors.name}
                        </div>
                      )}
                    </div>

                       <div>
                      <label className="mb-2 block">
                        Featured Event
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Select
                          name="is_featured"
                          value={featureType.find(
                            (opt) => opt.value === formik.values.is_featured,
                          )}
                          options={featureType}
                          onChange={(option) =>
                            formik.setFieldValue(
                              "is_featured",
                              option?.value ?? null,
                            )
                          }
                          onBlur={() =>
                            formik.setFieldTouched("is_featured", true)
                          }
                          styles={customStyles}
                        />
                      </div>
                      {formik.touched.is_featured &&
                        formik.errors.is_featured && (
                          <div className="text-red-500 text-sm">
                            {formik.errors.is_featured}
                          </div>
                        )}
                    </div>
                        <div>
                      <label className="mb-2 block">
                        Position<span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="position"
                          value={
                            formik.values.position !== null
                              ? formik.values.position
                              : ""
                          }
                          // onChange={formik.handleChange}
                          onKeyDown={blockInvalidNumberKeys} // ⛔ blocks typing -, e, etc.
                          onChange={(e) => {
                            const cleanValue = sanitizePositiveInteger(
                              e.target.value,
                            );
                            formik.setFieldValue("position", cleanValue);
                          }}
                          onBlur={formik.handleBlur}
                          className="custom--input w-full"
                        />
                      </div>
                      {formik.touched.position && formik.errors.position && (
                        <div className="text-red-500 text-sm">
                          {formik.errors.position}
                        </div>
                      )}
                    </div>
                    <div>
                        <label className="mb-2 block">Status</label>
                        <div className="relative">
                          <Select
                            name="status"
                            value={
                              statusType.find(
                                (opt) => opt.value === formik.values.status,
                              ) || null
                            }
                            options={statusType}
                            onChange={(option) =>
                              formik.setFieldValue(
                                "status",
                                option ? option.value : "",
                              )
                            }
                            onBlur={() =>
                              formik.setFieldTouched("status", true)
                            }
                            styles={customStyles}
                            placeholder="Select Status"
                          />
                        </div>
                        {formik.touched.status && formik.errors.status && (
                          <div className="text-red-500 text-sm">
                            {formik.errors.status}
                          </div>
                        )}
                      </div>

                    {/* HSN SAC Code */}
                    <div>
                      <label className="mb-2 block">HSN SAC Code</label>
                      <div className="relative">
                        <input
                          type="text"
                          name="hsn_sac_code"
                          value={formik.values.hsn_sac_code}
                          // onChange={formik.handleChange}
                          onKeyDown={blockNonLettersAndNumbers}
                          onChange={(e) => {
                            const cleaned = sanitizeTextWithNumbers(
                              e.target.value,
                            );
                            formik.setFieldValue("hsn_sac_code", cleaned);
                          }}
                          onBlur={formik.handleBlur}
                          className="custom--input w-full"
                        />
                      </div>
                      {formik.touched.hsn_sac_code &&
                        formik.errors.hsn_sac_code && (
                          <div className="text-red-500 text-sm">
                            {formik.errors.hsn_sac_code}
                          </div>
                        )}
                    </div>


                    {/* Earn Coins */}

                    {/* <div>
                      <label className="mb-2 block">
                        Earn Coins<span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="earn_coin"
                          value={
                            formik.values.earn_coin !== null
                              ? formik.values.earn_coin
                              : ""
                          }
                          // onChange={formik.handleChange}
                          onKeyDown={blockInvalidNumberKeys} // ⛔ blocks typing -, e, etc.
                          onChange={(e) => {
                            const cleanValue = sanitizePositiveInteger(
                              e.target.value,
                            );
                            formik.setFieldValue("earn_coin", cleanValue);
                          }}
                          onBlur={formik.handleBlur}
                          className="custom--input w-full number--appearance-none"
                        />
                      </div>
                      {formik.touched.earn_coin && formik.errors.earn_coin && (
                        <div className="text-red-500 text-sm">
                          {formik.errors.earn_coin}
                        </div>
                      )}
                    </div> */}

                  

                    {/* Status */}
                    {/* {editingOption && editingOption && ( */}
                      {/* <div>
                        <label className="mb-2 block">Status</label>
                        <div className="relative">
                          <Select
                            name="status"
                            value={
                              statusType.find(
                                (opt) => opt.value === formik.values.status,
                              ) || null
                            }
                            options={statusType}
                            onChange={(option) =>
                              formik.setFieldValue(
                                "status",
                                option ? option.value : "",
                              )
                            }
                            onBlur={() =>
                              formik.setFieldTouched("status", true)
                            }
                            styles={customStyles}
                            placeholder="Select Status"
                          />
                        </div>
                        {formik.touched.status && formik.errors.status && (
                          <div className="text-red-500 text-sm">
                            {formik.errors.status}
                          </div>
                        )}
                      </div> */}
                    {/* )} */}
                  </div>
                  {/* </div> */}

                     <div className="my-3">
                      <label className="mb-2 block">
                        Tags<span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="tags"
                          value={formik.values.tags}
                          // onChange={formik.handleChange}
                          onKeyDown={blockNonLettersAndNumbers}
                          onChange={(e) => {
                            const cleaned = sanitizeTextWithNumbers(
                              e.target.value,
                            );
                            formik.setFieldValue("tags", cleaned);
                          }}
                          onBlur={formik.handleBlur}
                          className="custom--input w-full"
                        />
                      </div>
                      {formik.touched.tags && formik.errors.tags && (
                        <div className="text-red-500 text-sm">
                          {formik.errors.tags}
                        </div>
                      )}
                    </div>

                  {/* Equipment */}
                  <div className="my-3">
                    <label className="mb-2 block">Equipment</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="equipment"
                        value={formik.values.equipment}
                        // onChange={formik.handleChange}
                        onKeyDown={blockNonLettersAndNumbers}
                        onChange={(e) => {
                          const cleaned = sanitizeTextWithNumbers(
                            e.target.value,
                          );
                          formik.setFieldValue("equipment", cleaned);
                        }}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="mb-2 block">
                      Description<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <textarea
                        rows={3}
                        name="description"
                        value={formik.values.description}
                        // onChange={formik.handleChange}
                        onKeyDown={blockNonLettersAndNumbers}
                        onChange={(e) => {
                          const cleaned = sanitizeTextWithNumbers(
                            e.target.value,
                          );
                          formik.setFieldValue("description", cleaned);
                        }}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full"
                      />
                    </div>

                    {formik.touched.description &&
                      formik.errors.description && (
                        <div className="text-red-500 text-sm">
                          {formik.errors.description}
                        </div>
                      )}
                  </div>
                  </>
                  )}

                {activeTab === "schedule" && (
  <div className="flex flex-col lg:flex-row gap-6 min-w-0">
    {/* Left: pattern builder */}
    <div className="w-full flex-1 min-w-0 lg:w-0">
      {scheduleMode === "weekly" && (
        <>
            <div className="grid md:grid-cols-3 grid-cols-1 gap-4 mb-4">
  {/* Start Date */}
  <div>
    <label className="mb-2 block">
      Start Date<span className="text-red-500">*</span>
    </label>

    <div className="custom--date relative">
      <span className="absolute z-[1] top-1/2 -translate-y-1/2 left-[15px] pointer-events-none">
        <FaCalendarDays />
      </span>

      <DatePicker
        selected={
          scheduleStartDate
            ? new Date(`${scheduleStartDate}T00:00:00`)
            : null
        }
        onChange={(date) => {
          if (!date) return;

          const formattedDate = date.toLocaleDateString("en-CA");

          setScheduleStartDate(formattedDate);
          formik.setFieldValue("schedule_start_date", formattedDate);

          // Reset end date if it is before the new start date
          if (
            scheduleEndDate &&
            new Date(`${scheduleEndDate}T00:00:00`) < date
          ) {
            setScheduleEndDate("");
            formik.setFieldValue("schedule_end_date", "");
          }
        }}
        onBlur={() =>
          formik.setFieldTouched("schedule_start_date", true)
        }
        dateFormat="dd-MM-yyyy"
        placeholderText="dd-mm-yyyy"
        minDate={new Date()}
        className="custom--input w-full input--icon"
        onKeyDown={(e) => e.preventDefault()}
      />
    </div>

    {formik.touched.schedule_start_date &&
      formik.errors.schedule_start_date && (
        <div className="text-red-500 text-sm">
          {formik.errors.schedule_start_date}
        </div>
      )}
  </div>


           <div>
    <label className="mb-2 block">
      End Date<span className="text-red-500">*</span>
    </label>

    <div className="custom--date relative">
      <span className="absolute z-[1] top-1/2 -translate-y-1/2 left-[15px] pointer-events-none">
        <FaCalendarDays />
      </span>

      <DatePicker
        selected={
          scheduleEndDate
            ? new Date(`${scheduleEndDate}T00:00:00`)
            : null
        }
        onChange={(date) => {
          if (!date) return;

          const formattedDate = date.toLocaleDateString("en-CA");

          setScheduleEndDate(formattedDate);
          formik.setFieldValue("schedule_end_date", formattedDate);
        }}
        onBlur={() =>
          formik.setFieldTouched("schedule_end_date", true)
        }
        dateFormat="dd-MM-yyyy"
        placeholderText="dd-mm-yyyy"
        minDate={
          scheduleStartDate
            ? new Date(`${scheduleStartDate}T00:00:00`)
            : new Date()
        }
        disabled={!scheduleStartDate}
        className="custom--input w-full input--icon"
        onKeyDown={(e) => e.preventDefault()}
      />
    </div>

    {formik.touched.schedule_end_date &&
      formik.errors.schedule_end_date && (
        <div className="text-red-500 text-sm">
          {formik.errors.schedule_end_date}
        </div>
      )}
  </div>


            <div>
    <label className="mb-2 block">Skip these dates</label>

    <div className="custom--date relative">
      <span className="absolute z-[1] top-1/2 -translate-y-1/2 left-[15px] pointer-events-none">
        <FaCalendarDays />
      </span>

      <DatePicker
        selected={null}
        onChange={(date) => {
          if (!date) return;

          const formattedDate = date.toLocaleDateString("en-CA");

          toggleSkipDate(formattedDate);

          const updatedSkipDates = skipDates.includes(formattedDate)
            ? skipDates.filter((item) => item !== formattedDate)
            : [...skipDates, formattedDate];

          formik.setFieldValue("skip_dates", updatedSkipDates);
        }}
        dateFormat="dd-MM-yyyy"
        placeholderText="dd-mm-yyyy"
        minDate={
          scheduleStartDate
            ? new Date(`${scheduleStartDate}T00:00:00`)
            : new Date()
        }
        maxDate={
          scheduleEndDate
            ? new Date(`${scheduleEndDate}T00:00:00`)
            : null
        }
        disabled={!scheduleStartDate || !scheduleEndDate}
        className="custom--input w-full input--icon"
        onKeyDown={(e) => e.preventDefault()}
      />
    </div>

  {/* {skipDates.length > 0 && (
    <div className="flex flex-wrap gap-1 mt-2">
      {skipDates.map((d) => (
        <span
          key={d}
          className="text-xs bg-gray-100 rounded px-2 py-1 flex items-center gap-1"
        >
          {d}

          <button type="button" onClick={() => toggleSkipDate(d)}>
            <IoCloseCircle />
          </button>
        </span>
      ))}
                </div>
              )} */}
            </div>
          </div>

          {/* Table scrolls only inside this area */}
          <div className="w-full max-w-full overflow-x-auto border rounded-md mb-2">
            <table className="min-w-[850px] w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="p-2">Day</th>
                  <th className="p-2">Class Start</th>
                  <th className="p-2">Class End</th>
                  <th className="p-2">Trainer</th>
                  <th className="p-2">Studio</th>
                  <th className="p-2">Cap.</th>
                  <th className="p-2">Waitlist</th>
                  <th className="p-2">Row Actions</th>
                </tr>
              </thead>

              <tbody>
                {dayRows.map((row, dayIndex) =>
                  row.slots.map((slot, slotIndex) => (
                    <tr
                      key={`${row.day}-${slotIndex}`}
                      className="border-t"
                    >
                      <td className="p-2">
  {slotIndex === 0 ? (
    <label
  className={`flex items-center gap-2 ${
    !availableDaysInRange.has(row.day) || !hasAvailableSlots(row.day)
      ? "opacity-40 cursor-not-allowed"
      : ""
  }`}
>
      <input
  type="checkbox"
  checked={row.enabled}
  disabled={!availableDaysInRange.has(row.day) || !hasAvailableSlots(row.day)}
  onChange={(e) =>
    toggleDayEnabled(dayIndex, e.target.checked)
  }
/>
      {row.day}
    </label>
  ) : (
    <span className="pl-6">{row.day}</span>
  )}
</td>
                      <td className="p-2 min-w-[140px]">
                        <Select
                          isDisabled={!row.enabled}
                          value={
                            getDayTimeOptions(row.day).find(
                              (o) => o.value === slot.startTime,
                            ) || null
                          }
                          options={getDayTimeOptions(row.day)}
                          onChange={(option) =>
                            updateSlot(dayIndex, slotIndex, {
                              startTime: option.value,
                            })
                          }
                        styles={{
  ...customStyles,
  ...getSlotSelectStyles(
    slotErrors[`${dayIndex}-${slotIndex}`]?.startTime
  ),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
}}
menuPortalTarget={document.body}
menuPosition="fixed"
/>
                      </td>

                      <td className="p-2 min-w-[140px]">
                        <Select
                          isDisabled={!row.enabled}
                          value={
                            getDayTimeOptions(row.day, slot.startTime).find(
                              (o) => o.value === slot.endTime,
                            ) || null
                          }
                          options={getDayTimeOptions(row.day, slot.startTime)}
                          onChange={(option) =>
                            updateSlot(dayIndex, slotIndex, {
                              endTime: option.value,
                            })
                          }
                         styles={{
  ...customStyles,
  ...getSlotSelectStyles(
    slotErrors[`${dayIndex}-${slotIndex}`]?.endTime
  ),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
}}
menuPortalTarget={document.body}
menuPosition="fixed"
/>
                      </td>
                           <td className="p-2 min-w-[140px]">
                        <Select
                          isDisabled={!row.enabled}
                          value={
                            trainerOptions.find(
                              (o) => o.value === slot.trainerId,
                            ) || null
                          }
                          options={excludeDuplicateCombo(
                            trainerOptions,
                            row,
                            slotIndex,
                            "trainerId",
                          )}
                          onChange={(option) =>
                            updateSlot(dayIndex, slotIndex, {
                              trainerId: option.value,
                            })
                          }
                        styles={{
  ...customStyles,
  ...getSlotSelectStyles(
    slotErrors[`${dayIndex}-${slotIndex}`]?.trainerId
  ),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
}}
menuPortalTarget={document.body}
menuPosition="fixed"
/>
                      </td>
                      <td className="p-2 min-w-[140px]">
                        <Select
                          isDisabled={!row.enabled}
                          value={
                            studioOptions.find(
                              (o) => o.value === slot.studioId,
                            ) || null
                          }
                          options={excludeDuplicateCombo(
                            studioOptions,
                            row,
                            slotIndex,
                            "studioId",
                          )}
                          onChange={(option) =>
                            updateSlot(dayIndex, slotIndex, {
                              studioId: option.value,
                            })
                          }
                         styles={{
  ...customStyles,
  ...getSlotSelectStyles(
    slotErrors[`${dayIndex}-${slotIndex}`]?.studioId
  ),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
}}
menuPortalTarget={document.body}
menuPosition="fixed"
/>
                      </td>

                      <td className="p-2">
                        <input
                          type="number"
                          disabled={!row.enabled}
                          value={slot.capacity}
                          onKeyDown={blockInvalidNumberKeys}
                          onChange={(e) =>
                            updateSlot(dayIndex, slotIndex, {
                              capacity: sanitizePositiveInteger(
                                e.target.value,
                              ),
                            })
                          }
                          className="custom--input w-16 number--appearance-none"
                        />
                      </td>

                      <td className="p-2">
                        <input
                          type="number"
                          disabled={!row.enabled}
                          value={slot.waitlist}
                          onKeyDown={blockInvalidNumberKeys}
                          onChange={(e) =>
                            updateSlot(dayIndex, slotIndex, {
                              waitlist: sanitizePositiveInteger(
                                e.target.value,
                              ),
                            })
                          }
                          className="custom--input w-16 number--appearance-none"
                        />
                      </td>

                      <td className="p-2">
                        <div className="flex gap-2 whitespace-nowrap">
                          <button
                            type="button"
                            disabled={!row.enabled}
                            onClick={() => addSlot(dayIndex)}
                            className="px-2 py-1 border rounded text-xs disabled:opacity-40"
                          >
                            + Slot
                          </button>

                          <button
                            type="button"
                            disabled={row.slots.length <= 1}
                            onClick={() =>
                              removeSlot(dayIndex, slotIndex)
                            }
                            className="px-2 py-1 border rounded text-xs text-red-600 disabled:opacity-40"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-black-700 mb-6 items-center">
            <button type="button" className="px-2 py-1 border rounded text-xs text-black-600 hover:bg-black hover:text-white " onClick={copyFirstRowToWeek}>
              Copy first row to entire week
            </button>

            <button type="button" className="px-2 py-1 border rounded text-xs text-black-600 hover:bg-black hover:text-white " onClick={selectWeekdaysOnly}>
              Weekdays only
            </button>

            <button type="button" className="px-2 py-1 border rounded text-xs text-black-600 hover:bg-black hover:text-white" onClick={selectAllDays}>
              Select all days
            </button>

            <button type="button" className="px-2 py-1 border rounded text-xs text-black-600 hover:bg-black hover:text-white" onClick={clearAllDays}>
              Clear
            </button>

            <span className="text-gray-400 ml-auto">
              Unchecked days are skipped
            </span>
          </div>
          {/* Booking settings */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
  {/* Booking Type */}
  <div>
    <label className="mb-2 block font-medium">
      Booking Type <span className="text-red-500">*</span>
    </label>

    <select
      name="booking_type"
      value={formik.values.booking_type || "FREE"}
      onChange={(e) => {
        const value = e.target.value;

        formik.setFieldValue("booking_type", value);

        if (value === "PAID") {
          formik.setFieldValue("gst", formik.values.gst ?? 5);
        }
      }}
      onBlur={formik.handleBlur}
      className="custom--input w-full"
    >
      <option value="FREE">Free</option>
      <option value="PAID">Paid</option>
    </select>

    {formik.touched.booking_type && formik.errors.booking_type && (
      <div className="text-red-500 text-sm">
        {formik.errors.booking_type}
      </div>
    )}
  </div>

  {/* Auto Reserve */}
  {/* <div>
    <label className="mb-2 block font-medium">Auto Reserve</label>

    <select
      name="auto_reserve"
      value={formik.values.auto_reserve ? "ON" : "OFF"}
      onChange={(e) => {
        formik.setFieldValue(
          "auto_reserve",
          e.target.value === "ON",
        );
      }}
      className="custom--input w-full"
    >
      <option value="OFF">Off</option>
      <option value="ON">On</option>
    </select>
  </div> */}

  {/* Conflict Action */}
  <div>
    <label className="mb-2 block font-medium">
      On conflict with existing class
    </label>

    <select
      name="conflict_action"
      value={formik.values.conflict_action || "STOP"}
      onChange={formik.handleChange}
      className="custom--input w-full"
    >
      <option value="Stop">Skip this session</option>
      <option value="Warn">Stop and warn me</option>
    </select>
  </div>
</div>

{/* Show pricing only when Paid is selected */}
{formik.values.booking_type === "PAID" && (
  <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 mb-6">
    <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-600">
      Pricing — each session is sold separately at this price
    </p>

    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {/* Amount */}
      <div>
        <label className="mb-2 block font-medium">
          Amount (₹) <span className="text-red-500">*</span>
        </label>

        <input
          type="number"
          name="amount"
          min="0"
          value={formik.values.amount ?? ""}
          onKeyDown={blockInvalidNumberKeys}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className="custom--input w-full number--appearance-none"
        />

        {formik.touched.amount && formik.errors.amount && (
          <div className="text-red-500 text-sm">
            {formik.errors.amount}
          </div>
        )}
      </div>

      {/* Discount */}
      <div>
        <label className="mb-2 block font-medium">
          Discount (₹) <span className="text-red-500">*</span>
        </label>

        <input
          type="number"
          name="discount"
          min="0"
          value={formik.values.discount ?? ""}
          onKeyDown={blockInvalidNumberKeys}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder="0.00"
          className="custom--input w-full number--appearance-none"
        />

        {formik.touched.discount && formik.errors.discount && (
          <div className="text-red-500 text-sm">
            {formik.errors.discount}
          </div>
        )}
      </div>

      {/* GST */}
      <div>
        <label className="mb-2 block font-medium">GST (%)</label>

        <input
          type="number"
          disabled
          name="gst"
          value={formik.values.gst ?? 5}
          className="custom--input w-full bg-gray-100"
        />
      </div>

      {/* HSN/SAC */}
      <div>
        <label className="mb-2 block font-medium">
          HSN / SAC Code
        </label>

        <input
          type="text"
          name="hsn_sac_code"
          value={formik.values.hsn_sac_code ?? ""}
          onKeyDown={blockNonLettersAndNumbers}
          onChange={(e) => {
            const cleaned = sanitizeTextWithNumbers(e.target.value);

            formik.setFieldValue("hsn_sac_code", cleaned);
          }}
          onBlur={formik.handleBlur}
          className="custom--input w-full"
        />
      </div>

      {/* Payable Amount */}
      <div>
        <label className="mb-2 block font-medium">
          Payable per booking
        </label>

        <div className="custom--input w-full font-semibold">
          ₹
          {(
            Math.max(
              Number(formik.values.amount || 0) -
                Number(formik.values.discount || 0),
              0,
            ) *
            (1 + Number(formik.values.gst ?? 5) / 100)
          ).toFixed(2)}
        </div>
      </div>
    </div>
  </div>
)}
        </>
      )}
    </div>

    {/* Right: session preview */}
    {scheduleMode === "weekly" && (
      <div className="w-full lg:w-[260px] shrink-0 bg-gray-50 rounded-md p-4">
        <p className="text-xs uppercase text-gray-500 mb-1">
          Sessions to be created
        </p>

        <p className="text-3xl font-semibold">
          {scheduledSessions.length}
          <span className="text-sm font-normal ml-1">classes</span>
        </p>

        <p className="text-xs text-gray-500 mb-3">
          {scheduleStartDate || "—"} → {scheduleEndDate || "—"}
        </p>

        {sessionSummaryByDay.map((s) => (
          <div
            key={s.day}
            className="flex justify-between gap-3 text-sm py-0.5"
          >
            <span className="whitespace-nowrap">
              {s.day} · {formatTo12Hour(s.time)}
            </span>

            <span className="whitespace-nowrap">
              {s.count} × {formatTo12Hour(s.time)}
            </span>
          </div>
        ))}

        {skipDates.length > 0 && (
  <div className="mt-3">
    <p className="text-xs text-gray-500 mb-2">
      {skipDates.length} dates excluded:
    </p>

    <div className="flex flex-wrap gap-1">
      {skipDates.map((date) => (
  <span
    key={date}
    className="inline-flex items-center gap-1 rounded border px-2 py-1 text-xs"
  >
    {date}

    <button
      type="button"
      onClick={() => toggleSkipDate(date)}
    >
      <IoCloseCircle className="text-sm" />
    </button>
  </span>
))}
    </div>
  </div>
)}
        <button
          type="button"
          className="text-xs text-gray-700 mt-2"
          onClick={() => setShowSessionList((s) => !s)}
        >
          {showSessionList ? "Hide" : "Show"} session list
        </button>

        {showSessionList && (
          <div className="max-h-[220px] overflow-y-auto mt-2 space-y-2 pr-1">
          {scheduledSessions.map((s) => (
  <div
    key={`${s.date}-${s.slotIndex}-${s.startTime}-${s.endTime}`}
    className="text-xs flex justify-between gap-3"
  >
                <span className="whitespace-nowrap">
                  {s.date} · {s.day}
                </span>

                <span className="whitespace-nowrap">
                  {formatTo12Hour(s.startTime)} –{" "}
                  {formatTo12Hour(s.endTime)}
                </span>
              </div>
            ))}
          </div>
        )}

        {sessionConflicts.length > 0 && (
          <div className="mt-3 rounded-md ">
            <p className="text-xs font-semibold text-red-600 mb-2">
              {sessionConflicts.length} conflicting date
              {sessionConflicts.length > 1 ? "s" : ""}:
            </p>

            <div className="max-h-[180px] overflow-y-auto space-y-1 pr-1">
              {sessionConflicts.map((c, i) => (
                <div
                  key={`${c.date}-${c.start_time}-${i}`}
                  className="text-xs flex justify-between gap-3 text-red-700"
                >
                  <span className="whitespace-nowrap">
                    {c.date} · {shortWeekday(c.weekday)}
                  </span>

                  <span className="whitespace-nowrap">
                     {formatTo12Hour(c.start_time)} – {formatTo12Hour(c.end_time)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )}
  </div>
)}
                </div>
              </div>

              {/* Submit Button */}
              {!(editingOption && checkActiveBooking !== 0) &&
                formik?.values?.status !== "EXPIRED" && (
                  <div className="flex gap-4 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        formik.resetForm();
                        setShowBatchModal(false);
                      }}
                      className="px-4 py-2 bg-transparent border border-white text-white font-semibold rounded max-w-[150px] w-full"
                    >
                      Cancel
                    </button>

                    {activeTab === "details" ? (
                      <button
                        type="button"
                        onClick={goToScheduleTab}
                        className="px-4 py-2 font-semibold rounded max-w-[150px] w-full bg-white text-black"
                      >
                        Next
                      </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={formik.isSubmitting}
                      className={`px-4 py-2 font-semibold rounded max-w-[150px] w-full ${
                        formik.isSubmitting
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-white text-black"
                      }`}
                    >
                      {scheduleMode === "weekly"
                        ? `Create ${scheduledSessions.length} classes`
                        : "Submit"}
                    </button>
                  )}
                  </div>
                )}

            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateBatchClasses;
