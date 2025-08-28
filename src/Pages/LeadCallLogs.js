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

import { customStyles } from "../Helper/helper";
import { useFormik } from "formik";
import * as Yup from "yup";

const noReasons = [
  { value: "expensive", label: "Expensive" },
  { value: "competition", label: "Competition" },
  { value: "not-responsive", label: "Not-responsive" },
  { value: "relocation", label: "Relocation" },
  { value: "parking/transport", label: "Parking/Transport" },
  { value: "distance", label: "Distance" },
  { value: "time constraints", label: "Time Constraints" },
  { value: "lack of motivation", label: "Lack of motivation" },
];

const callStatusOption = [
  { value: "trial scheduled", label: "Trial Scheduled" },
  { value: "tour scheduled", label: "Tour Scheduled" },
  { value: "no answer", label: "No Answer" },
  { value: "call again", label: "Call Again" },
  { value: "not interested", label: "Not Interested" },
  { value: "future prospect", label: "Future Prospect" },
  { value: "wrong number", label: "Wrong Number" },
];

const allLeadStatuses = [
  { value: "closed", label: "Closed" },
  { value: "lost", label: "Lost" },
];

const leadStatusOptionsMap = [
  { value: "new", label: "New" },
  { value: "lead", label: "Lead" },
  { value: "opportunity", label: "Opportunity" },
  { value: "won", label: "Won" },
  { value: "closed", label: "Closed" },
  { value: "lost", label: "Lost" },
  { value: "future prospect", label: "Future Prospect" },
];

const irregularCallType = [
  { value: "Busy", label: "Busy" },
  { value: "Traveling", label: "Traveling" },
  { value: "Service issue", label: "Service issue" },
  { value: "Hybrid", label: "Hybrid" },
  { value: "No Answer", label: "No Answer" },
];

const validationSchema = Yup.object().shape({
  calledBy: Yup.string().required("Call by is required"),
  callStatus: Yup.string().required("Call status is required"),
  irregularCallType: Yup.string().when("callStatus", {
    is: "irregular call",
    then: () => Yup.string().required("Irregular Call is required"),
  }),
  leadStatus: Yup.string().required("Lead Status is required"),
  notInterestedReason: Yup.string().when("callStatus", {
    is: "not interested",
    then: () => Yup.string().required("Required"),
  }),
  scheduleFor: Yup.string().when("callStatus", {
    is: "enquiry follow-up",
    then: () => Yup.string().required("Schedule for is required"),
  }),

  trainerAvailability: Yup.string().when("callStatus", {
    is: (val) => val === "trial scheduled" || val === "tour scheduled",
    then: () => Yup.string().required("Trainer Date & Time is required"),
  }),
  assginStaff: Yup.string().when("callStatus", {
    is: (val) => val === "trial scheduled" || val === "tour scheduled",
    then: () => Yup.string().required("Staff Name is required"),
  }),
  discussion: Yup.string().required("Discussion is required"),
});

const LeadCallLogs = () => {
  const { id } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const action = queryParams.get("action");

  const dataSource = action === "add-follow-up" ? assignedLeadsData : mockData;
  const leadDetails = dataSource.find((m) => m.id === parseInt(id));

  const [callLogs, setCallLogs] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [trainerDateTime, setTrainerDateTime] = useState(null);
  const [filteredStaffOptions, setFilteredStaffOptions] = useState([]);

  const initialValues = {
    callStatus: null,
    leadStatus: null,
    serviceType: null,
    notInterestedReason: "",
    trialType: "",
    scheduleFollowUp: null,
    irregularCallType: "",
    trainerAvailability: "",
    assginStaff: "",
    trialDateTime: "",
    TrialTourStaff: "",
    discussion: "",
    scheduleFor: "",
    followUpDate: null,
    temperature: "",
    closureDate: null,
    amount: "",
    calledBy: "Nitin",
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

      // Reset form and external states
      resetForm({ values: initialValues });
      setTrainerDateTime(null);
      setFilteredStaffOptions([]);
    },
  });

  const filteredLogs = callLogs.filter((log) => {
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

  const handleDateTrainerChange = (date) => {
    setTrainerDateTime(date);
    formik.setFieldValue("trainerAvailability", date);
  };

  useEffect(() => {
    if (!trainerDateTime) return;

    const selectedDate = trainerDateTime.toISOString().split("T")[0];
    const selectedTime = trainerDateTime.toTimeString().split(" ")[0];

    const availableStaff = Object.entries(trainerAvailability)
      .filter(([staff, slots]) =>
        slots.some(
          (slot) => slot.date === selectedDate && slot.time === selectedTime
        )
      )
      .map(([staff]) => ({
        value: staff.toLowerCase(),
        label: staff.charAt(0).toUpperCase() + staff.slice(1),
      }));

    setFilteredStaffOptions(availableStaff);
  }, [trainerDateTime]);

  const selectedCallStatus = formik.values.callStatus;

  const filteredLeadStatusOptions =
    filteredLogs.length > 0
      ? leadStatusOptionsMap.filter((option) => option.value !== "new")
      : leadStatusOptionsMap;

  const now = new Date();
  const selectedDateTime = formik.values.trialDateTime
    ? new Date(formik.values.trialDateTime)
    : now;

  const isTodaySelected =
    selectedDateTime.toDateString() === now.toDateString();

  const minTime = new Date(selectedDateTime);
  if (isTodaySelected) {
    minTime.setHours(now.getHours(), now.getMinutes(), 0, 0);
  } else {
    minTime.setHours(0, 0, 0, 0);
  }

  const maxTime = new Date(selectedDateTime);
  maxTime.setHours(23, 59, 59, 999);

  useEffect(() => {
    if (action === "schedule-tour-trial") {
      formik.setFieldValue("callStatus", "trial scheduled");
    }
  }, [action]);

  return (
    <div className="page--content">
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">Home &gt; Lead calls</p>
          <h1 className="text-3xl font-semibold">Lead Calls</h1>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="border bg-white rounded p-4 w-full">
          <form onSubmit={formik.handleSubmit} className="sticky top-[50px]">
            <h2 className="text-xl font-semibold mb-4">
              {leadDetails?.name} - {leadDetails?.contact}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block">
                  Staff Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="calledBy"
                  value={formik.values.calledBy}
                  onChange={formik.handleChange}
                  placeholder="Called By"
                  className="custom--input w-full bg-gray-100"
                  readOnly={true}
                />
                {formik.errors.calledBy && formik.touched.calledBy && (
                  <div className="text-red-500 text-sm">
                    {formik.errors.calledBy}
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
                  onChange={(option) =>
                    formik.setFieldValue("callStatus", option.value)
                  }
                  styles={customStyles}
                  placeholder="Call Status"
                />

                {formik.errors?.callStatus && formik.touched?.callStatus && (
                  <div className="text-red-500 text-sm">
                    {formik.errors?.callStatus}
                  </div>
                )}
              </div>

              {formik.values.callStatus === "irregular call" && (
                <div>
                  <label className="mb-2 block">
                    Irregular call types
                    <span className="text-red-500">*</span>
                  </label>
                  <Select
                    name="irregularCallType"
                    options={irregularCallType}
                    value={
                      irregularCallType.find(
                        (option) =>
                          option.value === formik.values.irregularCallType
                      ) || null
                    }
                    onChange={(option) =>
                      formik.setFieldValue("irregularCallType", option.value)
                    }
                    styles={customStyles}
                    placeholder="Irregular Call Type"
                  />

                  {formik.errors?.irregularCallType &&
                    formik.touched?.irregularCallType && (
                      <div className="text-red-500 text-sm">
                        {formik.errors?.irregularCallType}
                      </div>
                    )}
                </div>
              )}

              <div>
                <label className="mb-2 block">
                  Lead Status<span className="text-red-500">*</span>
                </label>

                <Select
                  name="leadStatus"
                  options={filteredLeadStatusOptions}
                  value={
                    filteredLeadStatusOptions.find(
                      (option) => option.value === formik.values.leadStatus
                    ) || null
                  }
                  onChange={(option) =>
                    formik.setFieldValue("leadStatus", option.value)
                  }
                  styles={customStyles}
                  placeholder="Lead Status"
                />

                {formik.errors?.leadStatus && formik.touched?.leadStatus && (
                  <div className="text-red-500 text-sm">
                    {formik.errors?.leadStatus}
                  </div>
                )}
              </div>
              {(formik.values?.callStatus === "trial scheduled" ||
                formik.values?.callStatus === "tour scheduled") && (
                <>
                  <div>
                    <label className="mb-2 block">
                      Date & Time <span className="text-red-500">*</span>
                    </label>
                    <div className="custom--date flex-1">
                      <DatePicker
                        selected={trainerDateTime}
                        onChange={handleDateTrainerChange}
                        showTimeSelect
                        timeFormat="hh:mm aa"
                        dateFormat="MMMM d, yyyy hh:mm aa"
                        placeholderText="Select date & time"
                        className="border px-3 py-2 w-full"
                        minDate={now}
                      />
                      {formik.errors?.trainerAvailability &&
                        formik.touched?.trainerAvailability && (
                          <div className="text-red-500 text-sm">
                            Staff Availability
                          </div>
                        )}
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block">
                      Assigned to<span className="text-red-500">*</span>
                    </label>
                    <Select
                      name="assginStaff"
                      options={filteredStaffOptions}
                      onChange={(option) => {
                        formik.setFieldValue("assginStaff", option?.value);
                      }}
                      placeholder="Assign Staff"
                      styles={customStyles}
                    />
                    {formik.errors.assginStaff &&
                      formik.touched.assginStaff && (
                        <div className="text-red-500 text-sm">
                          Staff Name is required
                        </div>
                      )}
                  </div>
                  <div>
                    <label className="mb-2 block">
                      Schedule a Follow Up
                      {/* <span className="text-red-500">*</span> */}
                    </label>
                    <div className="custom--date">
                      <DatePicker
                        selected={formik.values.trialDateTime}
                        onChange={(val) =>
                          formik.setFieldValue("trialDateTime", val)
                        }
                        showTimeSelect
                        timeFormat="hh:mm aa"
                        dateFormat="MMMM d, yyyy hh:mm aa"
                        placeholderText="Select follow-up date & time"
                        className="border px-3 py-2 w-full"
                        minDate={now} // disables all past days
                        minTime={minTime} // disables past times today
                        maxTime={maxTime}
                      />
                    </div>
                  </div>
                </>
              )}

              {formik.values?.callStatus === "no answer" && (
                <div>
                  <label className="mb-2 block">Schedule a Follow Up</label>
                  <div className="custom--date">
                    <DatePicker
                      selected={formik.values.scheduleFollowUp}
                      onChange={(val) =>
                        formik.setFieldValue("scheduleFollowUp", val)
                      }
                      showTimeSelect
                      timeFormat="hh:mm aa"
                      dateFormat="MMMM d, yyyy hh:mm aa"
                      placeholderText="Select follow-up date & time"
                      className="border px-3 py-2 w-full"
                      minDate={now}
                      minTime={minTime}
                      maxTime={maxTime}
                    />
                  </div>
                </div>
              )}

              {formik.values?.callStatus === "not interested" && (
                <div>
                  <div>
                    <label className="mb-2 block">
                      Not Interested Reason
                      <span className="text-red-500">*</span>
                    </label>
                    <Select
                      name="notInterestedReason"
                      options={noReasons}
                      value={noReasons.find(
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
            </div>

            {/* Discussion */}
            <div className="mb-3 mt-3">
              <label className="mb-2 block">
                Discussion Details<span className="text-red-500">*</span>
              </label>
              <textarea
                name="discussion"
                placeholder="Discussion (max 1800 characters)"
                maxLength={1800}
                value={formik.values.discussion}
                onChange={formik.handleChange}
                className="custom--input w-full"
              />
              {formik.errors?.discussion && formik.touched?.discussion && (
                <div className="text-red-500 text-sm">
                  {formik.errors?.discussion}
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
        <div className="border bg-white rounded p-4 w-full">
          <h2 className="text-xl font-semibold mb-5">Contact History</h2>
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

          {filteredLogs.length === 0 && (
            <p className="text-gray-500">No call logs found.</p>
          )}

          {filteredLogs.map((log, index) => (
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

                {/* Show follow-up dates */}
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

                {/* Not Interested Reason */}
                {log.callStatus === "not interested" &&
                  log.notInterestedReason && (
                    <p className="border p-2 rounded">
                      <span className="text-sm font-semibold flex flex-col">
                        Reason
                      </span>{" "}
                      {log.notInterestedReason}
                    </p>
                  )}

                {/* Irregular Call */}
                {log.callStatus === "irregular call" &&
                  log.irregularCallType && (
                    <p className="border p-2 rounded">
                      <span className="text-sm font-semibold flex flex-col">
                        Irregular Call
                      </span>{" "}
                      {log.irregularCallType}
                    </p>
                  )}

                {/* Trainer Availability */}
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

                {/* Assigned Staff */}
                {(log.callStatus === "trial scheduled" ||
                  log.callStatus === "tour scheduled") &&
                  log.assginStaff && (
                    <p className="border p-2 rounded">
                      <span className="text-sm font-semibold flex flex-col">
                        Assigned Staff
                      </span>{" "}
                      {log.assginStaff}
                    </p>
                  )}
              </div>

              <div className="bg-gray-50 p-3 rounded">
                <h3 className="text-sm font-semibold">Remarks:</h3>
                <p>{log.discussion}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeadCallLogs;
