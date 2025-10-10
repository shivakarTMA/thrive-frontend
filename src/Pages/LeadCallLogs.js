import React, { useEffect, useState } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useLocation, useParams } from "react-router-dom";
import {
  assignedLeadsData,
  mockData,
  trainerAvailability,
} from "../DummyData/DummyData";

import { customStyles, selectIcon } from "../Helper/helper";
import { useFormik } from "formik";
import * as Yup from "yup";
import { apiAxios } from "../config/config";
import { toast } from "react-toastify";
import PhoneInput from "react-phone-number-input";
import LeadContactHistory from "./LeadContactHistory";
import { useDispatch, useSelector } from "react-redux";
import { fetchOptionList } from "../Redux/Reducers/optionListSlice";
import { FaCalendarDays } from "react-icons/fa6";
import { LuIndianRupee } from "react-icons/lu";

// Trainer assignment options
const assignTrainers = [
  { value: 1, label: "Shivakar", key: "shivakar" },
  { value: 2, label: "Nitin", key: "nitin" },
  { value: 3, label: "Esha", key: "esha" },
  { value: 4, label: "Apporva", key: "apporva" },
];

const trainerIdMap = Object.fromEntries(
  assignTrainers.map((t) => [t.value, t.key])
);

const validationSchema = Yup.object().shape({
   call_status: Yup.string().required("Call status is required"),

  // Follow-up Date & Time
  follow_up_datetime: Yup.string().when("call_status", {
    is: (val) =>
      val !== "Not Interested" &&
      val !== "Not Relevant" &&
      val !== "Invalid number" &&
      val !== "Won",
    then: (schema) => schema.required("Date & Time is required"),
    otherwise: (schema) => schema.notRequired(),
  }),

  // Staff Name — only when Trial/Tour Scheduled
  schedule_for: Yup.string().when("call_status", {
    is: "Trial/Tour Scheduled",
    then: (schema) => schema.required("Staff Name is required"),
    otherwise: (schema) => schema.notRequired(),
  }),

  // Not Interested Reason
  not_interested_reason: Yup.string().when("call_status", {
    is: "Not Interested",
    then: (schema) =>
      schema.required("Not Interested Reason is required"),
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
  remark: Yup.string().required("Discussion is required"),
});

const LeadCallLogs = () => {
  const { id } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const action = queryParams.get("action");
  const [leadDetails, setLeadDetails] = useState(null);
  const [staffList, setStaffList] = useState([]);

  const dataSource = action === "add-follow-up" ? assignedLeadsData : mockData;

  const fetchStaff = async (search = "") => {
    try {
      const res = await apiAxios().get("/staff/list", {
        params: search ? { search } : {},
      });
      let data = res.data?.data || res?.data || [];
      const activeService = data?.filter((item) => item?.status === "ACTIVE");
      setStaffList(activeService);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch club");
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

  const [callLogs, setCallLogs] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const fetchLeadCallLogs = async (leadId) => {
    try {
      const res = await apiAxios().get(`/lead/call/log/list/${leadId}`);
      const data = res.data?.data || res.data || null;
      setCallLogs(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch member details");
    }
  };

  const fetchLeadById = async (leadId) => {
    try {
      const res = await apiAxios().get(`/lead/${leadId}`);
      const data = res.data?.data || res.data || null;
      setLeadDetails(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch member details");
    }
  };

  useEffect(() => {
    if (id) {
      fetchLeadById(id);
      fetchLeadCallLogs(id);
    }
  }, [id]);

  const initialValues = {
    member_id: leadDetails?.id,
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
      console.log("Form validation errors:", formik.errors);

      try {
        await apiAxios().post("/lead/call/log/create", values);
        toast.success("Call created successfully!");

        resetForm();
        fetchLeadCallLogs(id);
      } catch (error) {
        toast.error("Something went wrong. Please try again.");
        console.error("Error submitting form:", error);
      }
    },
  });

  const handleDateChange = (date) => {
    formik.setFieldValue("trial_tour_datetime", date);
  };

  console.log(callLogs, "callLogs");

  const filteredData = callLogs.filter((log) => {
    const matchesStatus =
      !filterStatus || filterStatus.value === ""
        ? true
        : log.call_status === filterStatus.value;

    const logDate = log.createdAt ? new Date(log.createdAt) : null;

    const endOfDay = endDate
      ? new Date(endDate.setHours(23, 59, 59, 999))
      : null;

    const matchesStart = startDate ? logDate >= startDate : true;
    const matchesEnd = endOfDay ? logDate <= endOfDay : true;

    return matchesStatus && matchesStart && matchesEnd;
  });

  const handleCallStatusChange = (option) => {
    formik.resetForm({
      values: { ...initialValues, call_status: option.value },
    }); // Reset all fields except call_status
  };

  const handleDateTime = (date) => {
    formik.setFieldValue("follow_up_datetime", date); // Store Date object in Formik
  };

  const handleDateTrainerChange = (val) => {
    if (!val) return;
    formik.setFieldValue("follow_up_datetime", val.toISOString());
    // reset selected trainer whenever date/time changes
    formik.setFieldValue("schedule_for", "");
  };

  // Staff select -> just the value/id
  const handleSelectSchedule = (_, selectedOption) => {
    formik.setFieldValue("schedule_for", selectedOption?.value ?? "");
  };

  const getAvailableTrainers = () => {
    const dt = formik.values.follow_up_datetime;
    if (!dt) return [];

    const selected = new Date(dt);
    if (isNaN(selected)) return [];

    return assignTrainers.filter((trainer) => {
      const trainerKey = trainerIdMap[trainer.value];
      if (!trainerKey) return false;

      return trainerAvailability[trainerKey]?.some((slot) => {
        const slotDt = new Date(slot.date_time);
        return slotDt.getTime() === selected.getTime();
      });
    });
  };

  const now = new Date();
  const minTime = new Date();
  minTime.setHours(6, 0, 0, 0);

  const maxTime = new Date();
  maxTime.setHours(22, 0, 0, 0);

  useEffect(() => {
    if (action === "schedule-tour-trial") {
      formik.setFieldValue("call_status", "Trial/Tour Scheduled");
    }
  }, [action]);

  console.log(formik.values, "CALL LOGS");

  return (
    <div className="page--content">
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">Home &gt; Lead calls</p>
          <h1 className="text-3xl font-semibold">Lead Calls</h1>
        </div>
      </div>

      <div className="flex gap-5">
        <div className="z-[222] relative max-w-[500px] bg-white p-4 rounded-[10px] w-full box--shadow">
          <form onSubmit={formik.handleSubmit} className="sticky top-[50px]">
            <h2 className="text-xl font-semibold mb-4">
              {leadDetails?.full_name}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {/* Schedule For only admin */}
              {/* <div>
                <label className="mb-2 block">
                  Schedule For<span className="text-red-500">*</span>
                </label>

                <Select
                  name="scheduleFor"
                  value={
                    staffListOptions.find(
                      (opt) => opt.value === formik.values?.scheduleFor
                    ) || null
                  }
                  options={staffListOptions}
                  onChange={(option) =>
                    formik.setFieldValue("scheduleFor", option.value)
                  }
                  onBlur={() => formik.setFieldTouched("scheduleFor", true)}
                  styles={customStyles}
                />
                {formik.errors?.scheduleFor && formik.touched?.scheduleFor && (
                  <div className="text-red-500 text-sm">
                    {formik.errors?.scheduleFor}
                  </div>
                )}
              </div> */}

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
                      (option) => option.value === formik.values.call_status
                    ) || null
                  }
                  onChange={handleCallStatusChange}
                  styles={customStyles}
                  placeholder="Call Status"
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
                      <span className="absolute z-[1] mt-[15px] ml-[15px]">
                        <FaCalendarDays />
                      </span>
                      <DatePicker
                        selected={
                          formik.values.follow_up_datetime
                            ? new Date(formik.values.follow_up_datetime)
                            : null
                        }
                        onChange={handleDateTime}
                        showTimeSelect
                        timeFormat="hh:mm aa"
                        dateFormat="dd/MM/yyyy hh:mm aa"
                        placeholderText="Select date & time"
                        className="border px-3 py-2 w-full input--icon"
                        minDate={now}
                        minTime={minTime}
                        maxTime={maxTime}
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
                      <span className="absolute z-[1] mt-[15px] ml-[15px]">
                        <FaCalendarDays />
                      </span>
                      <DatePicker
                        selected={
                          formik.values.follow_up_datetime
                            ? new Date(formik.values.follow_up_datetime)
                            : null
                        }
                        onChange={handleDateTrainerChange}
                        showTimeSelect
                        timeFormat="hh:mm aa"
                        dateFormat="dd/MM/yyyy hh:mm aa"
                        placeholderText="Select date & time"
                        className="border px-3 py-2 w-full input--icon"
                        minDate={now}
                        minTime={minTime}
                        maxTime={maxTime}
                      />
                      {formik.touched.follow_up_datetime &&
                        formik.errors.follow_up_datetime && (
                          <p className="text-sm text-red-500 mt-1">
                            {formik.errors.follow_up_datetime}
                          </p>
                        )}
                    </div>
                  </div>

                  {/* Staff Name */}
                  <div>
                    <label className="mb-2 block">
                      Staff Name <span className="text-red-500">*</span>
                    </label>
                    <Select
                      name="schedule_for"
                      value={
                        assignTrainers.find(
                          (opt) => opt.value === formik.values.schedule_for
                        ) || null
                      }
                      onChange={(option) =>
                        handleSelectSchedule("schedule_for", option)
                      }
                      options={getAvailableTrainers()}
                      placeholder="Select Staff"
                      styles={customStyles}
                    />
                    {formik.values.schedule &&
                      formik.values.follow_up_datetime &&
                      !getAvailableTrainers().length && (
                        <p className="text-sm text-red-500 mt-1">
                          No trainers available at this date and time.
                        </p>
                      )}

                    {formik.touched.schedule_for &&
                      formik.errors.schedule_for && (
                        <p className="text-sm text-red-500 mt-1">
                          {formik.errors.schedule_for}
                        </p>
                      )}
                  </div>

                  <div className="my-3 col-span-2 border border-gray-500 rounded-lg p-3 pt-0">
                    <h3 className="w-fit font-semibold text-black mb-1 px-2 bg-white mt-[-10px]">
                      Schedule Follow UP
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block">Date & Time</label>
                        <div className="custom--date flex-1">
                          <span className="absolute z-[1] mt-[15px] ml-[15px]">
                            <FaCalendarDays />
                          </span>
                          <DatePicker
                            selected={formik.values.trial_tour_datetime}
                            onChange={handleDateChange}
                            showTimeSelect
                            timeFormat="hh:mm aa"
                            dateFormat="dd/MM/yyyy hh:mm aa"
                            placeholderText="Select date & time"
                            className="border px-3 py-2 w-full input--icon"
                            minDate={now}
                            minTime={minTime}
                            maxTime={maxTime}
                          />
                        </div>

                        {formik.errors?.trial_tour_datetime &&
                          formik.touched?.trial_tour_datetime && (
                            <div className="text-red-500 text-sm">
                              {formik.errors?.trial_tour_datetime}
                            </div>
                          )}
                      </div>

                      {/* Schedule For */}
                      <div>
                        <label className="mb-2 block">Schedule For</label>

                        <Select
                          name="training_by"
                          value={
                            staffListOptions.find(
                              (opt) => opt.value === formik.values?.training_by
                            ) || null
                          }
                          options={staffListOptions}
                          onChange={(option) =>
                            formik.setFieldValue("training_by", option.value)
                          }
                          onBlur={() =>
                            formik.setFieldTouched("training_by", true)
                          }
                          styles={customStyles}
                        />
                        {formik.errors?.training_by &&
                          formik.touched?.training_by && (
                            <div className="text-red-500 text-sm">
                              {formik.errors?.training_by}
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
                          option.value === formik.values.not_interested_reason
                      )}
                      onChange={(option) => {
                        formik.setFieldValue(
                          "not_interested_reason",
                          option.value
                        );
                        formik.setFieldTouched("not_interested_reason", true);
                      }}
                      styles={customStyles}
                      placeholder="Select Reason"
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
                      <span className="absolute z-[1] mt-[15px] ml-[15px]">
                        <FaCalendarDays />
                      </span>
                      <DatePicker
                        selected={formik.values.closure_date}
                        onChange={(val) =>
                          formik.setFieldValue("closure_date", val)
                        }
                        dateFormat="dd/MM/yyyy hh:mm aa"
                        placeholderText="Select Date"
                        className="border px-3 py-2 w-full input--icon"
                        minDate={now}
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
                        className="custom--input w-full input--icon"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="mb-3 mt-3">
              <label className="mb-2 block">
                Discussion Details<span className="text-red-500">*</span>
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
            <div className="flex justify-end gap-2 mt-3">
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
                name="text"
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
                <span className="absolute z-[1] mt-[15px] ml-[15px]">
                  <FaCalendarDays />
                </span>
                <DatePicker
                  selected={startDate}
                  onChange={setStartDate}
                  placeholderText="Start Date"
                  className="border px-3 py-2 w-full input--icon"
                  isClearable
                />
              </div>
              <div className="custom--date flex-1">
                <span className="absolute z-[1] mt-[15px] ml-[15px]">
                  <FaCalendarDays />
                </span>
                <DatePicker
                  selected={endDate}
                  onChange={setEndDate}
                  placeholderText="End Date"
                  className="border px-3 py-2 w-full input--icon"
                />
              </div>
            </div>
          </div>

          {filteredData.length > 0 ? (
            filteredData.map((filteredLogs, index) => (
              <LeadContactHistory key={index} filteredData={filteredLogs} />
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
