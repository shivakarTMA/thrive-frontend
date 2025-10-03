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
import ContactHistory from "./ContactHistory";
import { useDispatch, useSelector } from "react-redux";
import { fetchOptionList } from "../Redux/Reducers/optionListSlice";
import { FaCalendarDays } from "react-icons/fa6";
import { LuIndianRupee } from "react-icons/lu";

// Trainer assignment options
const assignTrainers = [
  { value: "shivakar", label: "Shivakar" },
  { value: "nitin", label: "Nitin" },
  { value: "esha", label: "Esha" },
  { value: "apporva", label: "Apporva" },
];

const validationSchema = Yup.object().shape({
  scheduleFor: Yup.string()
    .nullable()
    .when("callStatus", {
      is: (val) => val !== "Not Relevant" && val !== "Invalid number",
      then: (schema) => schema.required("Schedule For is required"),
      otherwise: (schema) => schema.notRequired(),
    }),

  callStatus: Yup.string().required("Call status is required"),

  // Main Date & Time (only when not Trial/Tour/Not Interested/Not Relevant/Invalid number)
  date_time: Yup.string().when("callStatus", {
    is: (val) =>
      val !== "Trial/Tour Scheduled" &&
      val !== "Not Interested" &&
      val !== "Not Relevant" &&
      val !== "Invalid number",
    then: (schema) => schema.required("Date & Time is required"),
    otherwise: (schema) => schema.notRequired(),
  }),

  // Trial/Tour Scheduled Fields
  schedule_date_time: Yup.string().when("callStatus", {
    is: "Trial/Tour Scheduled",
    then: (schema) => schema.required("Date & Time is required"),
    otherwise: (schema) => schema.notRequired(),
  }),

  staff_name: Yup.string().when("callStatus", {
    is: "Trial/Tour Scheduled",
    then: (schema) => schema.required("Staff Name is required"),
    otherwise: (schema) => schema.notRequired(),
  }),

  // Not Interested Reason
  notInterestedReason: Yup.string().when("callStatus", {
    is: "Not Interested",
    then: (schema) => schema.required("Not Interested Reason is required"),
    otherwise: (schema) => schema.notRequired(),
  }),

  // Remarks (Discussion) - Hide when Not Relevant or Invalid number
  remarks: Yup.string().when("callStatus", {
    is: (val) => val !== "Not Relevant" && val !== "Invalid number",
    then: (schema) => schema.required("Discussion is required"),
    otherwise: (schema) => schema.notRequired(),
  }),

  // Optional fields (won case)
  closureDate: Yup.date().nullable(),
  amount: Yup.number().nullable(),
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
    }
  }, [id]);

  const initialValues = {
    scheduleFor: "",
    callStatus: "",
    date_time: "",
    schedule_date_time: "",
    staff_name: "",
    followup_date_time: "",
    followup_staff_name: "",
    notInterestedReason: "",

    closureDate: "",
    amount: "",
    remarks: "",
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      const newEntry = {
        ...values,
        createdAt: new Date(),
        updatedBy: "Rajat Sharma",
        leadSource: "Passing By",
      };

      setCallLogs((prevLogs) => [newEntry, ...prevLogs]);
      console.log(values, "values shivakar");

      // Reset form and external states
      resetForm({ values: initialValues });
    },
  });

  const handleDateChange = (date) => {
    formik.setFieldValue("followup_date_time", date);
  };

  const filteredData = callLogs.filter((log) => {
    const matchesStatus =
      !filterStatus || filterStatus.value === ""
        ? true
        : log.callStatus === filterStatus.value;

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
      values: { ...initialValues, callStatus: option.value },
    }); // Reset all fields except callStatus
  };

  const handleDateTime = (date) => {
    formik.setFieldValue("date_time", date); // Store Date object in Formik
  };

  const handleDateTrainerChange = (val) => {
    if (!val) return;
    formik.setFieldValue("schedule_date_time", val.toISOString());
  };

  // Staff select -> just the value/id
  const handleSelectSchedule = (_, selectedOption) => {
    formik.setFieldValue("staff_name", selectedOption?.value ?? "");
  };

  const now = new Date();
  const minTime = new Date();
  minTime.setHours(6, 0, 0, 0);

  const maxTime = new Date();
  maxTime.setHours(22, 0, 0, 0);

  useEffect(() => {
    if (action === "schedule-tour-trial") {
      formik.setFieldValue("callStatus", "Trial/Tour Scheduled");
    }
  }, [action]);

  const getAvailableTrainers = () => {
    const dt = formik.values.schedule_date_time;
    if (!dt) return [];

    const selected = new Date(dt);
    if (isNaN(selected)) return [];

    return assignTrainers.filter((trainer) =>
      trainerAvailability[trainer.value]?.some((slot) => {
        const slotDt = new Date(slot.date_time);
        return slotDt.getTime() === selected.getTime();
      })
    );
  };

  console.log(leadDetails, "SHIVAKAR");

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
              <div>
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
              </div>

              <div>
                <label className="mb-2 block">
                  Call Status
                  <span className="text-red-500">*</span>
                </label>
                <Select
                  name="callStatus"
                  options={callStatusOption}
                  value={
                    callStatusOption.find(
                      (option) => option.value === formik.values.callStatus
                    ) || null
                  }
                  onChange={handleCallStatusChange}
                  styles={customStyles}
                  placeholder="Call Status"
                />

                {formik.errors?.callStatus && formik.touched?.callStatus && (
                  <div className="text-red-500 text-sm">
                    {formik.errors?.callStatus}
                  </div>
                )}
              </div>

              {formik.values.callStatus !== "Trial/Tour Scheduled" &&
                formik.values.callStatus !== "Not Interested" &&
                formik.values.callStatus !== "Not Relevant" &&
                formik.values.callStatus !== "Invalid number" && formik.values.callStatus !== "Won" && (
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
                          formik.values.date_time
                            ? new Date(formik.values.date_time)
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
                    {formik.touched.date_time && formik.errors.date_time && (
                      <p className="text-sm text-red-500 mt-1">
                        {formik.errors.date_time}
                      </p>
                    )}
                  </div>
                )}

              {formik?.values?.callStatus === "Trial/Tour Scheduled" && (
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
                          formik.values.schedule_date_time
                            ? new Date(formik.values.schedule_date_time)
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
                      {formik.touched.schedule_date_time &&
                        formik.errors.schedule_date_time && (
                          <p className="text-sm text-red-500 mt-1">
                            {formik.errors.schedule_date_time}
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
                      name="staff_name"
                      value={
                        assignTrainers.find(
                          (opt) => opt.value === formik.values.staff_name
                        ) || null
                      }
                      onChange={(option) =>
                        handleSelectSchedule("staff_name", option)
                      }
                      options={getAvailableTrainers()}
                      placeholder="Select Staff"
                      styles={customStyles}
                    />
                    {formik.values.schedule &&
                      formik.values.schedule_date_time &&
                      !getAvailableTrainers().length && (
                        <p className="text-sm text-red-500 mt-1">
                          No trainers available at this date and time.
                        </p>
                      )}

                    {formik.touched.staff_name && formik.errors.staff_name && (
                      <p className="text-sm text-red-500 mt-1">
                        {formik.errors.staff_name}
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
                          <span className="absolute z-[1] mt-[15px] ml-[15px]">
                            <FaCalendarDays />
                          </span>
                          <DatePicker
                            selected={formik.values.followup_date_time}
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

                        {formik.errors?.followup_date_time &&
                          formik.touched?.followup_date_time && (
                            <div className="text-red-500 text-sm">
                              {formik.errors?.followup_date_time}
                            </div>
                          )}
                      </div>

                      {/* Schedule For */}
                      <div>
                        <label className="mb-2 block">
                          Schedule For
                        </label>

                        <Select
                          name="followup_staff_name"
                          value={
                            staffListOptions.find(
                              (opt) =>
                                opt.value === formik.values?.followup_staff_name
                            ) || null
                          }
                          options={staffListOptions}
                          onChange={(option) =>
                            formik.setFieldValue(
                              "followup_staff_name",
                              option.value
                            )
                          }
                          onBlur={() =>
                            formik.setFieldTouched("followup_staff_name", true)
                          }
                          styles={customStyles}
                        />
                        {formik.errors?.followup_staff_name &&
                          formik.touched?.followup_staff_name && (
                            <div className="text-red-500 text-sm">
                              {formik.errors?.followup_staff_name}
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {formik?.values?.callStatus === "Not Interested" && (
                <div>
                  <div>
                    <label className="mb-2 block">
                      Not Interested Reason
                      <span className="text-red-500">*</span>
                    </label>
                    <Select
                      name="notInterestedReason"
                      options={notInterestedOption}
                      value={notInterestedOption.find(
                        (option) =>
                          option.value === formik.values.notInterestedReason
                      )}
                      onChange={(option) => {
                        formik.setFieldValue(
                          "notInterestedReason",
                          option.value
                        );
                        formik.setFieldTouched("notInterestedReason", true);
                      }}
                      styles={customStyles}
                      placeholder="Select Reason"
                    />
                    {formik.errors?.notInterestedReason &&
                      formik.touched?.notInterestedReason && (
                        <div className="text-red-500 text-sm">
                          {formik.errors.notInterestedReason}
                        </div>
                      )}
                  </div>
                </div>
              )}

              {formik?.values?.callStatus === "Won" && (
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
                        selected={formik.values.closureDate}
                        onChange={(val) =>
                          formik.setFieldValue("closureDate", val)
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

            {formik?.values?.callStatus === "Not Relevant" ||
            formik?.values?.callStatus === "Invalid number" ? null : (
              <>
                <div className="mb-3 mt-3">
                  <label className="mb-2 block">
                    Discussion Details<span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="remarks"
                    placeholder="Discussion (max 1800 characters)"
                    maxLength={1800}
                    value={formik.values.remarks}
                    onChange={formik.handleChange}
                    rows={4}
                    className="custom--input w-full"
                  />
                  {formik.errors?.remarks && formik.touched?.remarks && (
                    <div className="text-red-500 text-sm">
                      {formik.errors?.remarks}
                    </div>
                  )}
                </div>
              </>
            )}

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
          <div className="flex gap-2 justify-between items-center mb-5">
            <h2 className="text-xl font-semibold">Contact History</h2>
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
              />

              <div className="custom--date">
                <DatePicker
                  selected={startDate}
                  onChange={setStartDate}
                  placeholderText="Start Date"
                  className="custom--input"
                />
              </div>
              <div className="custom--date">
                <DatePicker
                  selected={endDate}
                  onChange={setEndDate}
                  placeholderText="End Date"
                  className="custom--input"
                />
              </div>
            </div>
          </div>

          {/* {filteredLogs.length === 0 && (
            <p className="text-gray-500">No call logs found.</p>
          )} */}

          {/* {filteredLogs.map((log, index) => (
            <div
              key={index}
              className="border rounded p-4 w-full mb-3 calllogdetails"
            >
              <div className="grid grid-cols-2 gap-2 mb-3">
                <p className="border p-2 rounded">
                  <span className="text-sm font-semibold flex flex-col">
                    Called by:
                  </span>{" "}
                  {log.calledBy}
                </p>
                <p className="border p-2 rounded">
                  <span className="text-sm font-semibold flex flex-col">
                    Call Status
                  </span>{" "}
                  {log.callStatus}
                </p>
                <p className="border p-2 rounded">
                  <span className="text-sm font-semibold flex flex-col">
                    Lead Status
                  </span>{" "}
                  {log.leadStatus}
                </p>

             
                {log.scheduleFollowUp && (
                  <p className="border p-2 rounded">
                    <span className="text-sm font-semibold flex flex-col">
                      Follow-up Date
                    </span>{" "}
                    {new Date(log.scheduleFollowUp).toLocaleString()}
                  </p>
                )}

                {(log.callStatus === "trial scheduled" ||
                  log.callStatus === "tour scheduled") &&
                  log.trialDateTime && (
                    <p className="border p-2 rounded">
                      <span className="text-sm font-semibold flex flex-col">
                        Follow-up Date
                      </span>{" "}
                      {new Date(log.trialDateTime).toLocaleString()}
                    </p>
                  )}

             
                {log.callStatus === "not interested" &&
                  log.notInterestedReason && (
                    <p className="border p-2 rounded">
                      <span className="text-sm font-semibold flex flex-col">
                        Reason
                      </span>{" "}
                      {log.notInterestedReason}
                    </p>
                  )}

               
                {log.callStatus === "irregular call" &&
                  log.irregularCallType && (
                    <p className="border p-2 rounded">
                      <span className="text-sm font-semibold flex flex-col">
                        Irregular Call
                      </span>{" "}
                      {log.irregularCallType}
                    </p>
                  )}

         
                {(log.callStatus === "trial scheduled" ||
                  log.callStatus === "tour scheduled") &&
                  log.trainerAvailability && (
                    <p className="border p-2 rounded">
                      <span className="text-sm font-semibold flex flex-col">
                        Trainer Date & Time
                      </span>{" "}
                      {new Date(log.trainerAvailability).toLocaleString()}
                    </p>
                  )}

              
                {(log.callStatus === "trial scheduled" ||
                  log.callStatus === "tour scheduled") &&
                  log.staff_name && (
                    <p className="border p-2 rounded">
                      <span className="text-sm font-semibold flex flex-col">
                        Assigned Staff
                      </span>{" "}
                      {log.staff_name}
                    </p>
                  )}
              </div>

              <div className="bg-gray-50 p-3 rounded">
                <h3 className="text-sm font-semibold">Remarks:</h3>
                <p>{log.remarks}</p>
              </div>
            </div>
          ))} */}
          {filteredData.length > 0 ? (
            filteredData.map((filteredLogs, index) => (
              <ContactHistory key={index} filteredData={filteredLogs} />
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
