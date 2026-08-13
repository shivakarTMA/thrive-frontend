import React, { useEffect, useMemo, useState, useRef } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  blockNonLettersAndNumbers,
  customStyles,
  filterActiveItems,
  sanitizeTextWithNumbers,
} from "../Helper/helper";
import { useFormik } from "formik";
import * as Yup from "yup";
import { authAxios } from "../config/config";
import { toast } from "react-toastify";
import PhoneInput from "react-phone-number-input";
import LeadContactHistory from "./LeadContactHistory";
import { useDispatch, useSelector } from "react-redux";
import { fetchOptionList } from "../Redux/Reducers/optionListSlice";
import { FaCalendarDays } from "react-icons/fa6";
import { LuIndianRupee } from "react-icons/lu";
import { format } from "date-fns";
import { addYears, subYears } from "date-fns";
import { MdOutlineKeyboardBackspace } from "react-icons/md";

const NO_SLOTS_OPTION = { label: "No time Slots", value: "", isDisabled: true };

const validationSchema = Yup.object().shape({
  call_status: Yup.string().required("Call status is required"),

  // Follow-up Date & Time
  trial_tour_datetime: Yup.string().when("call_status", {
    is: (val) => val === "Trial/Tour Scheduled",
    then: (schema) => schema.required("Date & Time is required"),
    otherwise: (schema) => schema.notRequired(),
  }),

  follow_up_datetime: Yup.string()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .when("call_status", {
      is: (val) => val === "Trial/Tour Scheduled",
      then: (schema) => schema.required("Date & Time is required"),
      otherwise: (schema) =>
        schema.when("call_status", {
          is: (val) =>
            val !== "Not Interested" &&
            val !== "Not Relevant" &&
            val !== "Invalid number" &&
            val !== "Won",
          then: (schema) => schema.required("Date & Time is required"),
          otherwise: (schema) => schema.notRequired(),
        }),
    }),
  training_by: Yup.string().when("call_status", {
    is: "Trial/Tour Scheduled",
    then: (schema) => schema.required("Trainer is required"),
    otherwise: (schema) => schema.notRequired(),
  }),

  schedule_for: Yup.string().nullable(),

  follow_up_datetime: Yup.string()
    .nullable()
    .when(["schedule_for"], {
      is: (schedule_for) => !!schedule_for,
      then: (schema) => schema.required("Schedule Date & Time is required"),
      otherwise: (schema) => schema.nullable(),
    }),

  // Not Interested Reason
  not_interested_reason: Yup.string().when("call_status", {
    is: "Not Interested",
    then: (schema) => schema.required("Not Interested Reason is required"),
    otherwise: (schema) => schema.notRequired(),
  }),

  // Closure Date — only for Won
  closure_date: Yup.date()
    .nullable()
    .when("call_status", {
      is: "Won",
      then: (schema) => schema.required("Closure date is required"),
      otherwise: (schema) => schema.notRequired(),
    }),

  // Amount — only for Won
  amount: Yup.number()
    .nullable()
    .when("call_status", {
      is: "Won",
      then: (schema) =>
        schema
          .required("Amount is required")
          .typeError("Amount must be a number")
          .min(0, "Amount cannot be negative"),
      otherwise: (schema) => schema.notRequired(),
    }),

  // Always required
  remark: Yup.string().required("Remarks is required"),
});

const LeadCallLogs = () => {
  const { id: leadId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const userRole = user.role;

  const logId = searchParams.get("logId");
  const clubIdFromParams = searchParams.get("club_id");

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const action = queryParams.get("action");
  const [leadDetails, setLeadDetails] = useState(null);
  const [trainerList, setTrainerList] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [editLog, setEditLog] = useState(null);
  const [clubData, setClubData] = useState(null);

  const clubId = clubIdFromParams || clubData; // ✅ fallback to API club
  const [trainerBookedSlots, setTrainerBookedSlots] = useState([]);
  const [scheduleBookedSlots, setScheduleBookedSlots] = useState([]);

  // Schedule Follow UP trainer working slots
  const [scheduleTrainerSlotsData, setScheduleTrainerSlotsData] = useState([]);

  // ===============================
  // TRIAL/TOUR trainer slots (new API) — scoped only to the
  // "Trial/Tour Scheduled" trainer + date/time fields below.
  // ===============================
  const [trialTrainerSlotsData, setTrialTrainerSlotsData] = useState([]);
  const trialSlotsRequestIdRef = useRef(0);

  // Redux state
  const dispatch = useDispatch();
  const { lists, loading } = useSelector((state) => state.optionList);

  // Fetch option lists
  useEffect(() => {
    dispatch(fetchOptionList("LEAD_CALL_STATUS"));
    dispatch(fetchOptionList("NOT_INTERESTED_REASON"));
  }, [dispatch]);

  // Extract Redux lists
  // const callStatusOption = lists["LEAD_CALL_STATUS"] || [];
  const callStatusOption = (lists["LEAD_CALL_STATUS"] || []).filter(
    (option) => {
      if (leadDetails?.is_trial_booked) {
        return option.value !== "Trial/Tour Scheduled";
      }
      return true;
    },
  );
  const notInterestedOption = lists["NOT_INTERESTED_REASON"] || [];

  const [callLogs, setCallLogs] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const fetchLeadCallLogs = async (leadId, filters = {}) => {
    try {
      const params = {};

      if (filters.call_status) params.call_status = filters.call_status;
      if (filters.startDate)
        params.startDate = format(filters.startDate, "yyyy-MM-dd");
      if (filters.endDate)
        params.endDate = format(filters.endDate, "yyyy-MM-dd");

      // ✅ Correct way to send params — DO NOT add them inside the URL string
      const res = await authAxios().get(
        `/lead/call/log/list/${leadId}`,
        { params }, // Axios will automatically append ?call_type=...&startDate=... etc.
      );

      // console.log(res.request.responseURL, "Final Request URL"); // 🔍 This will show full correct URL

      const data = res.data?.data || res.data || null;
      setCallLogs(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLeadById = async (leadId) => {
    try {
      const res = await authAxios().get(`/lead/${leadId}`);
      const data = res.data?.data || res.data || null;
      setLeadDetails(data);
      setClubData(data?.club_id);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!leadId) return;

    fetchLeadById(leadId);

    const filters = {
      call_status: filterStatus?.value || "",
      startDate,
      endDate,
    };

    fetchLeadCallLogs(leadId, filters);
  }, [leadId, filterStatus, startDate, endDate]);

  const initialValues = {
    member_id: leadId,
    call_status: "",
    follow_up_date: null,
    follow_up_time: null,
    follow_up_datetime: "",
    schedule_for: null,
    trial_tour_date: null,
    trial_tour_time: null,
    trial_tour_datetime: "",
    training_by: "",
    not_interested_reason: "",
    closure_date: "",
    amount: "",
    remark: "",
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      // ===============================
      // 🔥 FORCE COMBINE (ALWAYS)
      // ===============================

      // Trial/Tour
      if (values.trial_tour_date && values.trial_tour_time) {
        const [h, m] = values.trial_tour_time.split(":").map(Number);

        const combined = new Date(values.trial_tour_date);
        combined.setHours(h, m, 0, 0);

        values.trial_tour_datetime = combined.toISOString();
      }

      // Schedule Follow-up
      if (values.follow_up_date && values.follow_up_time) {
        const [h, m] = values.follow_up_time.split(":").map(Number);

        const combined = new Date(values.follow_up_date);
        combined.setHours(h, m, 0, 0);

        values.follow_up_datetime = combined.toISOString();
      }

      // ===============================
      // 🚨 VALIDATION (IMPORTANT)
      // ===============================

      // Trial/Tour required
      if (
        values.call_status === "Trial/Tour Scheduled" &&
        !values.trial_tour_datetime
      ) {
        formik.setFieldTouched("trial_tour_datetime", true);
        toast.error("Please select Trial/Tour date & time");
        return;
      }

      // Schedule required
      if (values.schedule_for && !values.follow_up_datetime) {
        formik.setFieldTouched("follow_up_datetime", true);
        toast.error("Please select Schedule date & time");
        return;
      }

      try {
        if (values.id) {
          // UPDATE MODE
          await authAxios().put(`/lead/call/log/${values.id}`, values);
          toast.success("Call log updated successfully!");
        } else {
          // CREATE MODE
          await authAxios().post("/lead/call/log/create", values);
          toast.success("Call created successfully!");
        }

        // ===============================
        // 🔥 RESET + REFRESH
        // ===============================
        navigate(`/lead-follow-up/${leadId}`, { replace: true });
        setEditLog(null);
        resetForm();
        fetchLeadCallLogs(leadId);
      } catch (error) {
        console.error("Error submitting form:", error);

        toast.error(
          error.response?.data?.message ||
            error.response?.data?.errors ||
            "Something went wrong",
        );
      }
    },
  });

  const handleCallStatusChange = (option) => {
    if (formik.values.id) {
      // EDIT MODE → do not reset form
      formik.setFieldValue("call_status", option.value);
    } else {
      // CREATE MODE → safe to reset
      formik.resetForm({
        values: { ...initialValues, call_status: option.value },
      });
    }
  };

  const now = new Date();

  useEffect(() => {
    if (action === "schedule-tour-trial") {
      formik.setFieldValue("call_status", "Trial/Tour Scheduled");
    }
  }, [action]);

  useEffect(() => {
    if (editLog) {
      formik.setValues({
        member_id: leadId,
        id: editLog.id, // <-- VERY IMPORTANT for update mode
      });
    }
  }, [editLog]);

  // ===============================
  // TRIAL/TOUR: new trainer-slots API
  // Trial/Tour is not a package session, so this is always a
  // COMPLIMENTARY booking_type (no duration needed).
  // ===============================
  const fetchTrialTrainerSlots = async (trainerId, targetClubId) => {
    if (!trainerId || !targetClubId) {
      setTrialTrainerSlotsData([]);
      return;
    }

    // Mark this call as the latest in-flight request
    const requestId = ++trialSlotsRequestIdRef.current;

    try {
      const res = await authAxios().post(
        "/staff/operating/hours/trainer/slots",
        {
          trainer_id: trainerId,
          club_id: targetClubId,
          booking_type: "COMPLIMENTARY",
        },
      );

      // Ignore this response if a newer request has been issued since
      if (requestId !== trialSlotsRequestIdRef.current) return;

      setTrialTrainerSlotsData(res.data?.data || []);
    } catch (err) {
      if (requestId !== trialSlotsRequestIdRef.current) return;

      console.error("Trial/Tour trainer slot fetch error:", err);
      setTrialTrainerSlotsData([]);
    }
  };

  // Refetch trial/tour slots whenever trainer or club changes
  useEffect(() => {
    if (!formik.values.training_by || !clubId) {
      trialSlotsRequestIdRef.current += 1; // invalidate any in-flight request
      setTrialTrainerSlotsData([]);
      return;
    }

    fetchTrialTrainerSlots(formik.values.training_by, clubId);
  }, [formik.values.training_by, clubId]);

  // Schedule Follow Up (schedule_for) — unchanged, still uses old API
  // const fetchScheduleBookedSlots = async (staffId) => {
  //   if (!staffId || !clubId) {
  //     setScheduleBookedSlots([]);
  //     return;
  //   }

  //   try {
  //     const res = await authAxios().post("/appointment/trainer/booked/slot", {
  //       club_id: clubId,
  //       trainer_id: staffId, // same API used for FOH too
  //       booking_type: "COMPLIMENTARY", // always COMPLIMENTARY for schedule follow-up
  //     });

  //     const slots = res.data?.availability || [];
  //     // console.log("Schedule Follow Up booked slots:", slots);
  //     setScheduleBookedSlots(slots);
  //   } catch (err) {
  //     console.error(err);
  //     setScheduleBookedSlots([]);
  //   }
  // };
  // ===============================
  // SCHEDULE FOLLOW UP:
  // Fetch trainer working/available slots
  // ===============================
  const fetchScheduleTrainerSlots = async (trainerId, targetClubId) => {
    if (!trainerId || !targetClubId) {
      setScheduleTrainerSlotsData([]);
      return;
    }

    try {
      const res = await authAxios().post(
        "/staff/operating/hours/trainer/slots",
        {
          trainer_id: trainerId,
          club_id: targetClubId,
          booking_type: "COMPLIMENTARY",
        },
      );

      console.log("Schedule Follow UP trainer slots:", res.data);

      setScheduleTrainerSlotsData(res.data?.data || []);
    } catch (err) {
      console.error("Schedule Follow UP trainer slots error:", err);

      setScheduleTrainerSlotsData([]);
    }
  };

  // ===============================
  // SCHEDULE FOLLOW UP:
  // Fetch already booked slots
  // ===============================
  const fetchScheduleBookedSlots = async (staffId) => {
    if (!staffId || !clubId) {
      setScheduleBookedSlots([]);
      return;
    }

    try {
      const res = await authAxios().post("/appointment/trainer/booked/slot", {
        club_id: clubId,
        trainer_id: staffId,
        booking_type: "COMPLIMENTARY",
      });

      console.log("Schedule Follow UP booked slots:", res.data);

      setScheduleBookedSlots(res.data?.availability || []);
    } catch (err) {
      console.error("Schedule Follow UP booked slots error:", err);

      setScheduleBookedSlots([]);
    }
  };

  const fetchStaff = async () => {
    try {
      if (!clubId) return;

      const roles = [
        "TRAINER",
        "FITNESS_MANAGER",
        "ASS_FITNESS_MANAGER",
        "FOH",
      ];

      // Fetch all staff needed for 'training_by' select (both roles)
      const res = await authAxios().get("/staff/list", {
        params: {
          role: roles.join(","),
          club_id: clubId,
        },
      });
      const staff = res.data?.data || [];

      const activeOnly = filterActiveItems(staff);

      // --- GROUPING STAFF BY ROLE ---
      const foh = activeOnly
        .filter((item) => item.role === "FOH")
        .map((item) => ({
          value: item.id,
          label: item.name,
        }));

      const trainer = activeOnly
        .filter((item) =>
          ["TRAINER", "FITNESS_MANAGER", "ASS_FITNESS_MANAGER"].includes(
            item.role,
          ),
        )
        .map((item) => ({
          value: item.id,
          label: item.name,
        }));

      // For schedule_for dropdown
      setTrainerList(trainer);

      // For training_by dropdown
      const groupedStaff = [];

      if (foh.length) {
        groupedStaff.push({
          label: "FOH",
          options: foh,
        });
      }

      if (trainer.length) {
        groupedStaff.push({
          label: "TRAINER",
          options: trainer,
        });
      }

      setStaffList(groupedStaff);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (clubIdFromParams || clubData) {
      fetchStaff();
    }
  }, [clubIdFromParams, clubData]);

  useEffect(() => {
    const logToEdit = callLogs.find((log) => String(log.id) === String(logId));

    if (logId) {
      setEditLog(logToEdit);
    } else {
      setEditLog(null);
    }
  }, [logId, callLogs]);

  const getScheduleBookedSlotsForDate = (date) => {
    if (!date || !scheduleBookedSlots.length) return [];

    const dateStr = date.toLocaleDateString("en-CA");

    const matched = scheduleBookedSlots.find((item) => item.date === dateStr);

    return matched?.slots || [];
  };
  // Get trainer working schedule for selected date
  const getScheduleTrainerDataForDate = (date) => {
    if (!date || !scheduleTrainerSlotsData.length) {
      return null;
    }

    const dateStr = formatDateForApi(date);

    return (
      scheduleTrainerSlotsData.find((item) => item.date === dateStr) || null
    );
  };

  const formatTo12Hour = (time24) => {
    const [h, m] = time24.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
  };

  // API returns/expects dates as dd-mm-yyyy — used for Trial/Tour only
  const formatDateForApi = (date) => {
    if (!date) return null;
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
  };

  // ===============================
  // TRIAL/TOUR: dates allowed in the calendar (must be present in API response)
  // ===============================
  const trialAvailableDatesSet = useMemo(() => {
    return new Set(trialTrainerSlotsData.map((d) => d.date));
  }, [trialTrainerSlotsData]);

  // react-datepicker calls this per rendered day; only dates present in
  // the API response (regardless of their slots) are selectable.
  const filterAvailableTrialDate = (date) => {
    const dateStr = formatDateForApi(date);
    return trialAvailableDatesSet.has(dateStr);
  };

  // Selected trial/tour day's slot data (from new API response)
  const selectedTrialDayData = useMemo(() => {
    if (!formik.values.trial_tour_date || !trialTrainerSlotsData.length) {
      return null;
    }

    const dateStr = formatDateForApi(formik.values.trial_tour_date);

    return trialTrainerSlotsData.find((d) => d.date === dateStr) || null;
  }, [formik.values.trial_tour_date, trialTrainerSlotsData]);

  // ===============================
  // TRIAL/TOUR time options - only looks at `slots` for the matched date;
  // empty slots -> "No time Slots", otherwise each slot's own
  // `enable` flag decides if it's selectable.
  // ===============================
  const timeOptions = useMemo(() => {
    if (!formik.values.trial_tour_date) return [];

    if (!selectedTrialDayData) return [NO_SLOTS_OPTION];

    const { slots } = selectedTrialDayData;

    if (!slots || slots.length === 0) {
      return [NO_SLOTS_OPTION];
    }

    return slots.map((slot) => ({
      label: formatTo12Hour(slot.time),
      value: slot.time,
      isDisabled: !slot.enable,
    }));
  }, [selectedTrialDayData, formik.values.trial_tour_date]);

  useEffect(() => {
    if (!formik.values.trial_tour_date) return;

    if (timeOptions.length === 1 && timeOptions[0].value === "") {
      toast.error("No slots available for selected date");
    }
  }, [selectedTrialDayData]);

  const scheduleTimeOptions = useMemo(() => {
    const selectedDate = formik.values.follow_up_date;

    if (!selectedDate) {
      return [];
    }

    // Get trainer's working schedule for selected date
    const trainerDay = getScheduleTrainerDataForDate(selectedDate);

    // No trainer schedule found
    if (!trainerDay) {
      return [];
    }

    // Full day holiday
    if (trainerDay.is_full_day_holiday) {
      return [];
    }

    // Staff holiday
    if (trainerDay.is_staff_holiday) {
      return [];
    }

    // No slots
    if (!trainerDay.slots?.length) {
      return [];
    }

    const now = new Date();

    // Already booked slots
    const bookedSlots = getScheduleBookedSlotsForDate(selectedDate);

    return trainerDay.slots.map((slot) => {
      const time = slot.time;

      const [hours, minutes] = time.split(":").map(Number);

      const timeDate = new Date(selectedDate);

      timeDate.setHours(hours, minutes, 0, 0);

      const isToday = selectedDate.toDateString() === now.toDateString();

      const isPast = isToday && timeDate <= now;

      const isBooked = bookedSlots.includes(time);

      return {
        label: formatTo12Hour(time),
        value: time,

        // Disable if:
        // 1. API says enable=false
        // 2. Time is already booked
        // 3. Time has already passed today
        isDisabled: slot.enable !== true || isBooked || isPast,
      };
    });
  }, [
    formik.values.follow_up_date,
    scheduleTrainerSlotsData,
    scheduleBookedSlots,
  ]);

  const combineDateTime = (date, time) => {
    if (!date || !time) return;

    const [h, m] = time.split(":").map(Number);

    const combined = new Date(date);
    combined.setHours(h, m, 0, 0);

    formik.setFieldValue("trial_tour_datetime", combined.toISOString());
  };

  const combineScheduleDateTime = (date, time) => {
    if (!date || !time) return;

    const [h, m] = time.split(":").map(Number);

    const combined = new Date(date);
    combined.setHours(h, m, 0, 0);

    formik.setFieldValue("follow_up_datetime", combined.toISOString());
  };

  return (
    <div className="page--content">
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">Home &gt; Lead calls</p>
          <h1 className="text-3xl font-semibold">Lead Calls</h1>
        </div>
      </div>

      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mt-5 cursor-pointer border rounded-full w-fit border-black px-3 py-1 bg-black text-white"
      >
        <MdOutlineKeyboardBackspace /> <span>Back</span>
      </button>

      <div className="flex gap-5 mt-5">
        <div className="z-[222] relative max-w-[500px] bg-white p-4 rounded-[10px] w-full box--shadow">
          <form onSubmit={formik.handleSubmit} className="sticky top-[50px]">
            <h2 className="text-xl font-semibold mb-4">
              {leadDetails?.full_name}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block">
                  Call Status
                  <span className="text-red-500">*</span>
                </label>
                <Select
                  name="call_status"
                  options={callStatusOption}
                  value={
                    callStatusOption.find(
                      (option) => option.value === formik.values.call_status,
                    ) || null
                  }
                  onChange={handleCallStatusChange}
                  styles={customStyles}
                  placeholder="Call Status"
                  // isDisabled={editLog ? true : false}
                />

                {formik.errors?.call_status && formik.touched?.call_status && (
                  <div className="text-red-500 text-sm">
                    {formik.errors?.call_status}
                  </div>
                )}
              </div>

              {formik.values.call_status !== "Trial/Tour Scheduled" &&
                formik.values.call_status !== "Not Interested" &&
                formik.values.call_status !== "Not Relevant" &&
                formik.values.call_status !== "Invalid number" &&
                formik.values.call_status !== "Won" && (
                  <div className="col-span-2">
                    <label className="mb-2 block">
                      Date & Time<span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="custom--date flex-1">
                        <span className="absolute z-[1] mt-[11px] ml-[15px]">
                          <FaCalendarDays />
                        </span>
                        <DatePicker
                          selected={formik.values.follow_up_date}
                          onChange={(date) => {
                            formik.setFieldValue("follow_up_date", date);

                            // reset time
                            formik.setFieldValue("follow_up_time", null);
                            formik.setFieldValue("follow_up_datetime", "");
                          }}
                          onKeyDown={(e) => {
                            e.preventDefault();
                          }}
                          dateFormat="dd/MM/yyyy"
                          minDate={new Date()} // ✅ disable past dates
                          placeholderText="Select date"
                          className="border px-3 py-2 w-full input--icon"
                          // disabled={!!editLog}
                        />
                      </div>

                      <div>
                        <Select
                          key={`${formik.values.schedule_for}-${formik.values.follow_up_date}`}
                          value={
                            formik.values.follow_up_time
                              ? scheduleTimeOptions.find(
                                  (opt) =>
                                    opt.value === formik.values.follow_up_time,
                                )
                              : null
                          }
                          onChange={(option) => {
                            if (!option || option.isDisabled) return;

                            formik.setFieldValue(
                              "follow_up_time",
                              option.value,
                            );

                            combineScheduleDateTime(
                              formik.values.follow_up_date,
                              option.value,
                            );
                          }}
                          options={scheduleTimeOptions}
                          placeholder="Select Time"
                          isDisabled={!formik.values.follow_up_date}
                          styles={customStyles}
                        />
                      </div>
                    </div>

                    {formik.touched.follow_up_datetime &&
                      formik.errors.follow_up_datetime && (
                        <div className="text-red-500 text-sm">
                          {formik.errors.follow_up_datetime}
                        </div>
                      )}
                  </div>
                )}

              {formik?.values?.call_status === "Trial/Tour Scheduled" && (
                <>
                  {/* Trainer */}
                  <div>
                    <label className="mb-2 block">
                      Trainer <span className="text-red-500">*</span>
                    </label>
                    <Select
                      name="training_by"
                      value={
                        trainerList.find(
                          (opt) => opt.value === formik.values.training_by,
                        ) || null
                      }
                      options={trainerList}
                      onChange={(selectedOption) => {
                        const trainerId = selectedOption?.value || null;

                        formik.setFieldValue("training_by", trainerId);

                        // 🔥 RESET ALL RELATED FIELDS
                        formik.setFieldValue("trial_tour_date", null);
                        formik.setFieldValue("trial_tour_time", null);
                        formik.setFieldValue("trial_tour_datetime", "");

                        // slots refetch happens via the useEffect
                        // watching formik.values.training_by
                      }}
                      placeholder="Select Trainer"
                      styles={customStyles}
                      // isDisabled={editLog ? true : false}
                    />
                    {formik.touched.training_by &&
                      formik.errors.training_by && (
                        <p className="text-sm text-red-500 mt-1">
                          {formik.errors.training_by}
                        </p>
                      )}
                  </div>

                  <div className="col-span-2">
                    <label className="mb-2 block">
                      Date & Time <span className="text-red-500">*</span>
                    </label>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="custom--date">
                        <span className="absolute z-[1] mt-[9px] ml-[15px]">
                          <FaCalendarDays />
                        </span>
                        <DatePicker
                          selected={formik.values.trial_tour_date}
                          onChange={(date) => {
                            formik.setFieldValue("trial_tour_date", date);

                            formik.setFieldValue("trial_tour_time", null);
                            formik.setFieldValue("trial_tour_datetime", "");
                          }}
                          dateFormat="dd/MM/yyyy"
                          minDate={new Date()} // ✅ disable past dates
                          filterDate={filterAvailableTrialDate}
                          placeholderText="Select Date"
                          onKeyDown={(e) => {
                            e.preventDefault();
                          }}
                          disabled={!formik.values.training_by}
                          className="border px-3 py-2 w-full input--icon"
                        />
                      </div>

                      <div>
                        <Select
                          key={`${formik.values.training_by}-${formik.values.trial_tour_date}`}
                          value={
                            formik.values.trial_tour_time
                              ? timeOptions.find(
                                  (opt) =>
                                    opt.value === formik.values.trial_tour_time,
                                )
                              : null
                          }
                          onChange={(option) => {
                            if (!option || option.value === "") return;

                            formik.setFieldValue(
                              "trial_tour_time",
                              option.value,
                            );

                            combineDateTime(
                              formik.values.trial_tour_date,
                              option.value,
                            );
                          }}
                          options={timeOptions}
                          placeholder="Select Time"
                          isDisabled={!formik.values.trial_tour_date}
                          styles={customStyles}
                        />
                      </div>
                    </div>

                    {formik.touched.trial_tour_datetime &&
                      formik.errors.trial_tour_datetime && (
                        <p className="text-sm text-red-500 mt-1">
                          {formik.errors.trial_tour_datetime}
                        </p>
                      )}
                  </div>

                  <div className="my-3 col-span-2 border border-gray-500 rounded-lg p-3 pt-0">
                    <h3 className="w-fit font-semibold text-black mb-1 px-2 bg-white mt-[-10px]">
                      Schedule Follow UP
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Schedule For */}
                      <div>
                        <label className="mb-2 block">Schedule For</label>
                        <Select
                          name="schedule_for"
                          value={
                            staffList
                              .flatMap((group) => group.options)
                              .find(
                                (opt) =>
                                  opt.value === formik.values?.schedule_for,
                              ) || null
                          }
                          options={staffList}
                          onChange={(selectedOption) => {
                            const staffId = selectedOption?.value || null;

                            formik.setFieldValue("schedule_for", staffId);

                            // Reset selected date/time
                            formik.setFieldValue("follow_up_date", null);
                            formik.setFieldValue("follow_up_time", null);
                            formik.setFieldValue("follow_up_datetime", "");

                            // Reset old API data
                            setScheduleTrainerSlotsData([]);
                            setScheduleBookedSlots([]);

                            if (!staffId) {
                              return;
                            }

                            // Fetch BOTH:
                            // 1. Trainer working slots
                            // 2. Already booked slots
                            fetchScheduleTrainerSlots(staffId, clubId);
                            fetchScheduleBookedSlots(staffId);
                          }}
                          placeholder="Schedule For"
                          styles={customStyles}
                          // isDisabled={editLog ? true : false}
                        />
                        {formik.errors?.schedule_for &&
                          formik.touched?.schedule_for && (
                            <div className="text-red-500 text-sm">
                              {formik.errors?.schedule_for}
                            </div>
                          )}
                      </div>

                      <div className="col-span-2">
                        <label className="mb-2 block">Date & Time</label>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="custom--date flex-1">
                            <span className="absolute z-[1] mt-[9px] ml-[15px]">
                              <FaCalendarDays />
                            </span>
                            <DatePicker
                              selected={formik.values.follow_up_date}
                              onChange={(date) => {
                                formik.setFieldValue("follow_up_date", date);

                                formik.setFieldValue("follow_up_time", null);

                                formik.setFieldValue("follow_up_datetime", "");
                              }}
                              dateFormat="dd/MM/yyyy"
                              minDate={new Date()}
                              placeholderText="Select Date"
                              onKeyDown={(e) => {
                                e.preventDefault();
                              }}
                              disabled={!formik.values.schedule_for}
                              className="border px-3 py-2 w-full input--icon"
                            />
                          </div>
                          <div>
                            <Select
                              key={`${formik.values.schedule_for}-${formik.values.follow_up_date}`}
                              value={
                                formik.values.follow_up_time
                                  ? scheduleTimeOptions.find(
                                      (opt) =>
                                        opt.value ===
                                        formik.values.follow_up_time,
                                    )
                                  : null
                              }
                              onChange={(option) => {
                                formik.setFieldValue(
                                  "follow_up_time",
                                  option.value,
                                );

                                combineScheduleDateTime(
                                  formik.values.follow_up_date,
                                  option.value,
                                );
                              }}
                              options={scheduleTimeOptions}
                              placeholder="Select Time"
                              isDisabled={!formik.values.follow_up_date}
                              styles={customStyles}
                            />
                          </div>
                        </div>
                        {formik.touched.follow_up_datetime &&
                          formik.errors.follow_up_datetime && (
                            <p className="text-sm text-red-500 mt-1">
                              {formik.errors.follow_up_datetime}
                            </p>
                          )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {formik?.values?.call_status === "Not Interested" && (
                <div>
                  <div>
                    <label className="mb-2 block">
                      Not Interested Reason
                      <span className="text-red-500">*</span>
                    </label>
                    <Select
                      name="not_interested_reason"
                      options={notInterestedOption}
                      value={notInterestedOption.find(
                        (option) =>
                          option.value === formik.values.not_interested_reason,
                      )}
                      onChange={(option) => {
                        formik.setFieldValue(
                          "not_interested_reason",
                          option.value,
                          true,
                        );
                        // formik.setFieldTouched("not_interested_reason", true);
                      }}
                      styles={customStyles}
                      placeholder="Select Reason"
                      // isDisabled={editLog ? true : false}
                    />
                    {formik.errors?.not_interested_reason &&
                      formik.touched?.not_interested_reason && (
                        <div className="text-red-500 text-sm">
                          {formik.errors.not_interested_reason}
                        </div>
                      )}
                  </div>
                </div>
              )}

              {formik?.values?.call_status === "Won" && (
                <>
                  <div>
                    <label className="mb-2 block">
                      Expected Date of Closure
                    </label>
                    <div className="custom--date flex-1">
                      <span className="absolute z-[1] mt-[11px] ml-[15px]">
                        <FaCalendarDays />
                      </span>
                      <DatePicker
                        selected={formik.values.closure_date}
                        onChange={(val) =>
                          formik.setFieldValue("closure_date", val)
                        }
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Select Date"
                        className="border px-3 py-2 w-full input--icon"
                        minDate={now}
                        // disabled={!!editLog}
                        onKeyDown={(e) => {
                          e.preventDefault();
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block">Amount</label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                        <LuIndianRupee />
                      </span>
                      <input
                        type="number"
                        name="amount"
                        value={formik.values.amount}
                        onChange={formik.handleChange}
                        className={`custom--input w-full input--icon ${
                          editLog ? "!bg-gray-100 pointer-events-none" : ""
                        }`}
                        // disabled={editLog ? true : false}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="mb-3 mt-3">
              <label className="mb-2 block">
                Remarks<span className="text-red-500">*</span>
              </label>
              <textarea
                name="remark"
                placeholder="Discussion (max 1800 characters)"
                maxLength={1800}
                value={formik.values.remark}
                // onChange={formik.handleChange}
                onKeyDown={blockNonLettersAndNumbers}
                onChange={(e) => {
                  const cleaned = sanitizeTextWithNumbers(e.target.value);
                  formik.setFieldValue("remark", cleaned);
                }}
                rows={4}
                className="custom--input w-full"
              />
              {formik.errors?.remark && formik.touched?.remark && (
                <div className="text-red-500 text-sm">
                  {formik.errors?.remark}
                </div>
              )}
            </div>

            {/* Buttons */}
            {(userRole === "FOH" ||
              userRole === "TRAINER" ||
              userRole === "FITNESS_MANAGER" ||
              userRole === "ASS_FITNESS_MANAGER" ||
              userRole === "CLUB_MANAGER" ||
              userRole === "ASS_CLUB_MANAGER" ||
              userRole === "PROGRAM_SPECIALIST" ||
              userRole === "ADMIN") && (
              <div className="flex items-center justify-end gap-2 mt-3">
                {editLog && (
                  <button
                    type="button"
                    className="px-4 py-2 bg-white text-black border border-black rounded"
                    onClick={() => {
                      formik.resetForm();
                      setEditLog(null);
                      navigate(`/lead-follow-up/${leadId}`);
                    }}
                  >
                    Clear
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white rounded"
                >
                  Submit
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Contact History Placeholder */}
        <div className="bg-white p-4 rounded-[10px] w-full box--shadow">
          <div className="flex pt-2 gap-2 items-center pb-3 mb-5 border-b border-b-[#D4D4D4]">
            <h2 className="text-xl font-semibold">Contact History</h2>
            <span className="font-bold">{"-"}</span>
            <div>
              <PhoneInput
                name="phone"
                value={"+" + leadDetails?.country_code + leadDetails?.mobile}
                international
                defaultCountry="IN"
                countryCallingCodeEditable={false}
                readOnly={true}
                disabled={true}
                className="disable--phone px-0 text-right font-[500]"
              />
            </div>
          </div>
          <div className="flex gap-2 mb-3">
            <div className="grid grid-cols-3 gap-2">
              <Select
                options={[{ value: "", label: "All" }, ...callStatusOption]}
                value={filterStatus}
                onChange={setFilterStatus}
                placeholder="Call Status"
                styles={customStyles}
                className="w-full"
              />

              <div className="custom--date flex-1">
                <span className="absolute z-[1] mt-[9px] ml-[15px]">
                  <FaCalendarDays />
                </span>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => {
                    setStartDate(date);
                    setEndDate(null);
                  }}
                  maxDate={new Date()}
                  placeholderText="Start Date"
                  className="border px-3 py-2 w-full input--icon"
                  isClearable
                />
              </div>
              <div className="custom--date flex-1">
                <span className="absolute z-[1] mt-[9px] ml-[15px]">
                  <FaCalendarDays />
                </span>
                <DatePicker
                  selected={endDate}
                  onChange={setEndDate}
                  minDate={startDate || subYears(new Date(), 20)}
                  maxDate={addYears(new Date(), 0)}
                  dateFormat="dd MMM yyyy"
                  disabled={!startDate}
                  placeholderText="End Date"
                  className="border px-3 py-2 w-full input--icon"
                  isClearable
                />
              </div>
            </div>
          </div>

          {callLogs.length > 0 ? (
            callLogs.map((filteredLogs, index) => (
              <LeadContactHistory
                key={index}
                filteredData={filteredLogs}
                handleEditLog={setEditLog}
                userRole={userRole}
                editLog={editLog}
              />
            ))
          ) : (
            <p className="text-center text-gray-500">No records found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadCallLogs;
