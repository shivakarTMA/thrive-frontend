import React, { useEffect, useState } from "react";
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
import { customStyles, filterActiveItems } from "../Helper/helper";
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
import { createFilterTime } from "../utils/dateTimeHelpers";
import { useClubDateTime } from "../hooks/useClubDateTime";
import { useDateTimePicker } from "../hooks/useDateTimePicker";

const validationSchema = Yup.object().shape({
  call_status: Yup.string().required("Call status is required"),

  // Follow-up Date & Time
  trial_tour_datetime: Yup.string().when("call_status", {
    is: (val) => val === "Trial/Tour Scheduled",
    then: (schema) =>
      schema
        .required("Date & Time is required")
        .test("has-time", "Please select a time as well", (value) => {
          if (!value) return false;
          const date = new Date(value);
          // ✅ If hours and minutes are both 0 → time was not selected
          return !(date.getHours() === 0 && date.getMinutes() === 0);
        }),
    otherwise: (schema) => schema.notRequired(),
  }),

  follow_up_datetime: Yup.string()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .when("call_status", {
      is: (val) => val === "Trial/Tour Scheduled",
      then: (schema) =>
        schema.test("has-time", "Please select a time as well", (value) => {
          // ✅ If empty → valid (not required)
          if (!value) return true;

          const date = new Date(value);

          // ❌ Invalid if time is 00:00
          return !(date.getHours() === 0 && date.getMinutes() === 0);
        }),
      otherwise: (schema) =>
        schema.when("call_status", {
          is: (val) =>
            val !== "Not Interested" &&
            val !== "Not Relevant" &&
            val !== "Invalid number" &&
            val !== "Won",
          then: (schema) =>
            schema
              .required("Date & Time is required")
              .test("has-time", "Please select a time as well", (value) => {
                if (!value) return false;
                const date = new Date(value);
                return !(date.getHours() === 0 && date.getMinutes() === 0);
              }),
          otherwise: (schema) => schema.notRequired(),
        }),
    }),
  training_by: Yup.string().when("call_status", {
    is: "Trial/Tour Scheduled",
    then: (schema) => schema.required("Trainer is required"),
    otherwise: (schema) => schema.notRequired(),
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

  const logId = searchParams.get("logId");

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const action = queryParams.get("action");
  const [leadDetails, setLeadDetails] = useState(null);
  const [trainerList, setTrainerList] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [editLog, setEditLog] = useState(null);
  const [timeSelected, setTimeSelected] = useState(false);

  // Redux state
  const dispatch = useDispatch();
  const { lists, loading } = useSelector((state) => state.optionList);

  // Fetch option lists
  useEffect(() => {
    dispatch(fetchOptionList("LEAD_CALL_STATUS"));
    dispatch(fetchOptionList("NOT_INTERESTED_REASON"));
  }, [dispatch]);

  // Extract Redux lists
  const callStatusOption = lists["LEAD_CALL_STATUS"] || [];
  const notInterestedOption = lists["NOT_INTERESTED_REASON"] || [];

  const [clubData, setClubData] = useState(null);
  const [callLogs, setCallLogs] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const fetchClubById = async (id) => {
    try {
      const res = await authAxios().get(`/club/${id}`);
      const data = res.data?.data || res.data || null;
      console.log("CLUB DATA:", data); // ← CHECK THIS in browser console
      setClubData(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch club details");
    }
  };

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
      toast.error("Failed to fetch lead details");
    }
  };

  const fetchLeadById = async (leadId) => {
    try {
      const res = await authAxios().get(`/lead/${leadId}`);
      const data = res.data?.data || res.data || null;
      setLeadDetails(data);
      fetchClubById(data?.club_id);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch lead details");
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
    follow_up_datetime: "",
    schedule_for: null,
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
      // console.log(values, "values");
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
        // ✅ 1. CLEAN URL FIRST (kills logId)
        navigate(`/lead-follow-up/${leadId}`, { replace: true });
        setEditLog(null); // Exit edit mode
        resetForm();
        fetchLeadCallLogs(leadId);
      } catch (error) {
        toast.error("Something went wrong. Please try again.");
        console.error("Error submitting form:", error);
      }
    },
  });

  const { filterTime: followUpFilterTime } = useClubDateTime(
    formik.values.follow_up_datetime,
    clubData,
  );

  const { filterTime: trialFilterTime } = useClubDateTime(
    formik.values.trial_tour_datetime,
    clubData,
  );

  const followUpDT = useDateTimePicker(
    formik,
    "follow_up_datetime",
    followUpFilterTime,
  );
  const trialToDT = useDateTimePicker(
    formik,
    "trial_tour_datetime",
    trialFilterTime,
  );

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

  const handleDateTrainerChange = (val) => {
    if (!val) return;
    formik.setFieldValue("trial_tour_datetime", val.toISOString());
    // reset selected trainer whenever date/time changes
    formik.setFieldValue("training_by", "");
  };

  // Staff select -> just the value/id
  const handleSelectSchedule = (_, selectedOption) => {
    formik.setFieldValue("training_by", selectedOption?.value ?? "");
  };

  const now = new Date();
  const minTime = new Date();
  minTime.setHours(6, 0, 0, 0);

  const maxTime = new Date();
  maxTime.setHours(22, 0, 0, 0);

  const baseMinTime = new Date();
  baseMinTime.setHours(6, 0, 0, 0); // 6:00 AM

  const baseMaxTime = new Date();
  baseMaxTime.setHours(22, 0, 0, 0); // 10:00 PM

  const getMinTime = (selectedDate) => {
    if (!selectedDate) return baseMinTime;

    const selected = new Date(selectedDate);
    const today = new Date();

    const isToday = selected.toDateString() === today.toDateString();

    if (isToday) {
      const current = new Date();
      return current.getHours() < 6 ? baseMinTime : current;
    }

    // future dates → always 6 AM
    return baseMinTime;
  };

  useEffect(() => {
    if (action === "schedule-tour-trial") {
      formik.setFieldValue("call_status", "Trial/Tour Scheduled");
    }
  }, [action]);

  useEffect(() => {
    if (editLog) {
      formik.setValues({
        member_id: leadId,
        call_status: editLog.call_status,
        follow_up_datetime: editLog.follow_up_datetime || "",
        schedule_for: editLog.schedule_for || "",
        trial_tour_datetime: editLog.trial_tour_datetime
          ? new Date(editLog.trial_tour_datetime)
          : "",
        training_by: editLog.training_by || "",
        not_interested_reason: editLog.not_interested_reason || "",
        closure_date: editLog.closure_date
          ? new Date(editLog.closure_date)
          : "",
        amount: editLog.amount || "",
        remark: editLog.remark || "",
        id: editLog.id, // <-- VERY IMPORTANT for update mode
      });
    }
  }, [editLog]);

  const fetchStaff = async () => {
    try {
      // Fetch all staff needed for 'training_by' select (both roles)
      const res = await authAxios().get("/staff/list?role=TRAINER&role=FOH");
      const staff = res.data?.data || [];

      const activeOnly = filterActiveItems(staff);

      console.log(activeOnly, "activeOnly");

      // --- GROUPING STAFF BY ROLE ---
      const foh = activeOnly
        .filter((item) => item.role === "FOH")
        .map((item) => ({
          value: item.id,
          label: item.name,
        }));

      const trainer = activeOnly
        .filter((item) => item.role === "TRAINER")
        .map((item) => ({
          value: item.id,
          label: item.name,
        }));

      // Final grouped structure for 'training_by' select
      const groupedOptions = [
        {
          label: "FOH",
          options: foh,
        },
        {
          label: "TRAINER",
          options: trainer,
        },
      ];

      // Separate arrays for each select
      setTrainerList(trainer); // For 'schedule_for'
      setStaffList(groupedOptions); // For 'training_by'
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch staff");
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const staffListOptions =
    staffList?.map((item) => ({
      label: item.name,
      value: item.id,
    })) || [];

  // useEffect(() => {
  //   console.log("Formik Errors:", formik.errors);
  //   console.log("Formik Touched:", formik.touched);
  //   console.log("Formik Values:", formik.values);
  // }, [formik.errors, formik.touched, formik.values]);

  useEffect(() => {
    const logToEdit = callLogs.find((log) => String(log.id) === String(logId));

    if (logId) {
      setEditLog(logToEdit);
    } else {
      setEditLog(null);
    }
  }, [logId, callLogs]);

  return (
    <div className="page--content">
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">Home &gt; Lead calls</p>
          <h1 className="text-3xl font-semibold">Lead Calls</h1>
        </div>
      </div>

      <Link
        to={logId ? "/my-follow-ups" : "/all-leads"}
        className="flex items-center gap-2 mt-5 cursor-pointer border rounded-full w-fit border-black px-3 py-1 bg-black text-white"
      >
        <MdOutlineKeyboardBackspace /> <span>Back</span>
      </Link>

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
                  isDisabled={editLog ? true : false}
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
                  <div>
                    <label className="mb-2 block">
                      Date & Time <span className="text-red-500">*</span>
                    </label>
                    <div className="custom--date flex-1">
                      <span className="absolute z-[1] mt-[11px] ml-[15px]">
                        <FaCalendarDays />
                      </span>
                      <DatePicker
                        selected={followUpDT.selected}
                        onChange={followUpDT.handleDateTime}
                        onChangeRaw={followUpDT.handleChangeRaw}
                        showTimeSelect
                        timeFormat="hh:mm aa"
                        dateFormat={followUpDT.dateFormat}
                        placeholderText="Select date & time"
                        minDate={new Date()}
                        filterTime={followUpFilterTime}
                        className="border px-3 py-2 w-full input--icon"
                        disabled={!!editLog}
                      />
                    </div>
                    {formik.touched.follow_up_datetime &&
                      formik.errors.follow_up_datetime && (
                        <p className="text-sm text-red-500 mt-1">
                          {formik.errors.follow_up_datetime}
                        </p>
                      )}
                  </div>
                )}

              {formik?.values?.call_status === "Trial/Tour Scheduled" && (
                <>
                  <div>
                    <label className="mb-2 block">
                      Date & Time <span className="text-red-500">*</span>
                    </label>
                    <div className="custom--date flex-1">
                      <span className="absolute z-[1] mt-[11px] ml-[15px]">
                        <FaCalendarDays />
                      </span>
                      <DatePicker
                        selected={trialToDT.selected}
                        onChange={trialToDT.handleDateTime}
                        onChangeRaw={trialToDT.handleChangeRaw}
                        showTimeSelect
                        timeFormat="hh:mm aa"
                        dateFormat={trialToDT.dateFormat}
                        placeholderText="Select date & time"
                        minDate={new Date()}
                        filterTime={trialFilterTime}
                        className="border px-3 py-2 w-full input--icon"
                        disabled={!!editLog}
                      />
                      {formik.touched.trial_tour_datetime &&
                        formik.errors.trial_tour_datetime && (
                          <p className="text-sm text-red-500 mt-1">
                            {formik.errors.trial_tour_datetime}
                          </p>
                        )}
                    </div>
                  </div>

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
                      onChange={(option) =>
                        handleSelectSchedule("training_by", option)
                      }
                      placeholder="Select Trainer"
                      styles={customStyles}
                      isDisabled={editLog ? true : false}
                    />
                    {formik.values.schedule &&
                      formik.values.follow_up_datetime && (
                        <p className="text-sm text-red-500 mt-1">
                          No trainers available at this date and time.
                        </p>
                      )}

                    {formik.touched.training_by &&
                      formik.errors.training_by && (
                        <p className="text-sm text-red-500 mt-1">
                          {formik.errors.training_by}
                        </p>
                      )}
                  </div>

                  <div className="my-3 col-span-2 border border-gray-500 rounded-lg p-3 pt-0">
                    <h3 className="w-fit font-semibold text-black mb-1 px-2 bg-white mt-[-10px]">
                      Schedule Follow UP
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block">
                          Date & Time
                        </label>
                        <div className="custom--date flex-1">
                          <span className="absolute z-[1] mt-[11px] ml-[15px]">
                            <FaCalendarDays />
                          </span>
                          <DatePicker
                            selected={followUpDT.selected}
                            onChange={followUpDT.handleDateTime}
                            onChangeRaw={followUpDT.handleChangeRaw}
                            showTimeSelect
                            timeFormat="hh:mm aa"
                            dateFormat={followUpDT.dateFormat}
                            placeholderText="Select date & time"
                            minDate={new Date()}
                            filterTime={followUpFilterTime}
                            className="border px-3 py-2 w-full input--icon"
                            disabled={!!editLog}
                          />
                        </div>
                        {formik.touched.follow_up_datetime &&
                          formik.errors.follow_up_datetime && (
                            <p className="text-sm text-red-500 mt-1">
                              {formik.errors.follow_up_datetime}
                            </p>
                          )}
                      </div>

                      {/* Schedule For */}
                      <div>
                        <label className="mb-2 block">
                          Schedule For
                        </label>

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
                          onChange={(option) =>
                            formik.setFieldValue("schedule_for", option.value)
                          }
                          onBlur={() =>
                            formik.setFieldTouched("schedule_for", true)
                          }
                          styles={customStyles}
                          isDisabled={editLog ? true : false}
                        />
                        {formik.errors?.schedule_for &&
                          formik.touched?.schedule_for && (
                            <div className="text-red-500 text-sm">
                              {formik.errors?.schedule_for}
                            </div>
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
                        );
                        formik.setFieldTouched("not_interested_reason", true);
                      }}
                      styles={customStyles}
                      placeholder="Select Reason"
                      isDisabled={editLog ? true : false}
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
                        disabled={!!editLog}
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
                        disabled={editLog ? true : false}
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
                onChange={formik.handleChange}
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
                <span className="absolute z-[1] mt-[11px] ml-[15px]">
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
                <span className="absolute z-[1] mt-[11px] ml-[15px]">
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
