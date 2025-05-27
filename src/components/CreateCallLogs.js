import React, { useEffect, useState } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useParams } from "react-router-dom";
import { mockData, trainerAvailability } from "../DummyData/DummyData";
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
const callTypesOption = [
  { value: "welcome/induction call", label: "Welcome/Induction Call" },
  { value: "feedback call", label: "Feedback Call" },
  { value: "irregular call", label: "Irregular Call" },
  { value: "renewal call", label: "Renewal Call" },
  { value: "birthday/anniversary call", label: "Birthday/Anniversary Call" },
];

const allLeadStatuses = [
  { value: "closed", label: "Closed" },
  { value: "lost", label: "Lost" },
  { value: "opportunity", label: "Opportunity" },
];

const leadStatusOptionsMap = {
  "no answer": ["closed", "lost"],
  "call again": ["closed", "lost"],
  "future prospect": ["closed", "lost"],
  "trial scheduled": ["opportunity"],
  "tour scheduled": ["opportunity"],
  "wrong number": ["lost"],
  "not interested": ["closed", "lost"],
};

const serviceType = [
  { value: "membership 1 month", label: "Membership 1 Month" },
  { value: "membership 3 month", label: "Membership 3 Month" },
  { value: "membership 6 month", label: "Membership 6 Month" },
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
  callStatus: Yup.string().when("$details", (details, schema) => {
    const isActive = details?.status === "active";
    return schema.required(
      isActive
        ? "Call status is required"
        : "Call Type is required"
    );
  }),
  irregularCallType: Yup.string().when("callStatus", {
    is: "irregular call",
    then: () => Yup.string().required("Irregular Call is required"),
  }),

  leadStatus: Yup.string().when("$details", (details, schema) => {
    return details?.status === "active"
      ? schema.required("Lead Status is required")
      : schema.notRequired();
  }),

  serviceType: Yup.string().when("$details", (details, schema) => {
    return details?.status === "active"
      ? schema.required("Service Type is required")
      : schema.notRequired();
  }),
  notInterestedReason: Yup.string().when("callStatus", {
    is: "notinterested",
    then: () => Yup.string().required("Required"),
  }),
  scheduleFor: Yup.string().when("callStatus", {
    is: "enquiry follow-up",
    then: () => Yup.string().required("Schedule for is required"),
  }),

  trainerAvailability: Yup.string().when("callStatus", {
    is: "trial scheduled" || "tour scheduled",
    then: () => Yup.string().required("Trainer Date & Time is required"),
  }),
  assginStaff: Yup.string().when("callStatus", {
    is: "trial scheduled" || "tour scheduled",
    then: () => Yup.string().required("Staff Name is required"),
  }),
  trialDateTime: Yup.string().when("callStatus", {
    is: "trial scheduled" || "tour scheduled",
    then: () => Yup.string().required("Follow-up Date & Time is required"),
  }),

  discussion: Yup.string().required("Discussion is required"),
});

const CallLogs = ({ details }) => {
  const [callLogs, setCallLogs] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [trainerDateTime, setTrainerDateTime] = useState(null);
  const [filteredStaffOptions, setFilteredStaffOptions] = useState([]);

  const formik = useFormik({
    initialValues: {
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
    },
    validationSchema,
    onSubmit: (values) => {
      const newEntry = {
        ...values,
        createdAt: new Date(),
        updatedBy: "Rajat Sharma",
        leadSource: "Passing By",
      };

      setCallLogs((prevLogs) => [newEntry, ...prevLogs]);
      formik.resetForm();
    },
  });

  const filteredLogs = callLogs.filter((log) => {
    const matchesStatus =
      !filterStatus || filterStatus.value === ""
        ? true
        : log.callStatus === filterStatus.value;

    const logDate = log.createdAt ? new Date(log.createdAt) : null;

    // Adjust endDate to include entire day (set to 23:59:59)
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

    const selectedDate = trainerDateTime.toISOString().split("T")[0]; // e.g., "2025-05-01"
    const selectedTime = trainerDateTime.toTimeString().split(" ")[0]; // e.g., "08:00:00"

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

  const filteredLeadStatuses = selectedCallStatus
    ? allLeadStatuses.filter((status) =>
        leadStatusOptionsMap[selectedCallStatus]?.includes(status.value)
      )
    : allLeadStatuses; // fallback

  const now = new Date();
  const selectedDateTime = formik.values.trialDateTime
    ? new Date(formik.values.trialDateTime)
    : now;

  // Check if selected day is today
  const isTodaySelected =
    selectedDateTime.toDateString() === now.toDateString();

  // Set dynamic minTime
  const minTime = new Date(selectedDateTime);
  if (isTodaySelected) {
    minTime.setHours(now.getHours(), now.getMinutes(), 0, 0); // current time
  } else {
    minTime.setHours(0, 0, 0, 0); // 12:00 AM
  }

  // Set maxTime to 11:59 PM
  const maxTime = new Date(selectedDateTime);
  maxTime.setHours(23, 59, 59, 999);

  console.log("Formik Errors (if any):", formik.errors);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="border bg-white rounded p-4 w-full">
        <form onSubmit={formik.handleSubmit} className="sticky top-[50px]">
          {details?.status !== "active" && (
            <h2 className="text-xl font-semibold mb-4">
              {details?.name} - {details?.contact}
            </h2>
          )}

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
                className="custom--input w-full"
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
                {details?.status === "active"
                  ? "Call Type"
                  : "Lead Call Status"}
                <span className="text-red-500">*</span>
              </label>
              <Select
                name="callStatus"
                options={
                  details?.status === "active"
                    ? callTypesOption
                    : callStatusOption
                }
                value={
                  details?.status === "active"
                    ? callTypesOption.find(
                        (option) => option.value === formik.values.callStatus
                      ) || null
                    : callStatusOption.find(
                        (option) => option.value === formik.values.callStatus
                      ) || null
                }
                onChange={(option) =>
                  formik.setFieldValue("callStatus", option.value)
                }
                styles={customStyles}
                placeholder={
                  details?.status === "active"
                    ? "Call Type"
                    : "Lead Call Status"
                }
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

            {details?.status !== "active" && (
              <>
                <div>
                  <label className="mb-2 block">
                    Lead Status<span className="text-red-500">*</span>
                  </label>
                  <Select
                    name="leadStatus"
                    options={filteredLeadStatuses}
                    value={
                      filteredLeadStatuses.find(
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
                <div>
                  <label className="mb-2 block">
                    Service Type<span className="text-red-500">*</span>
                  </label>
                  <Select
                    name="serviceType"
                    options={serviceType}
                    value={
                      serviceType.find(
                        (option) => option.value === formik.values.serviceType
                      ) || null
                    }
                    onChange={(option) =>
                      formik.setFieldValue("serviceType", option.value)
                    }
                    styles={customStyles}
                    placeholder="Service Type"
                  />

                  {formik.errors?.serviceType &&
                    formik.touched?.serviceType && (
                      <div className="text-red-500 text-sm">
                        {formik.errors?.serviceType}
                      </div>
                    )}
                </div>
              </>
            )}
          </div>
          {formik.values?.callStatus === "not interested" && (
            <div className="w-full mt-3">
              <div>
                <label className="mb-2 block">
                  Not Interested Reason<span className="text-red-500">*</span>
                </label>
                <Select
                  name="notInterestedReason"
                  options={noReasons}
                  value={noReasons.find(
                    (option) =>
                      option.value === formik.values.notInterestedReason
                  )}
                  onChange={(option) => {
                    formik.setFieldValue("notInterestedReason", option.value);
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

          {formik.values?.callStatus === "no answer" && (
            <div className="mb-3 mt-3">
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

          {(formik.values?.callStatus === "trial scheduled" ||
            formik.values?.callStatus === "tour scheduled") && (
            <div className="w-full mt-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block">
                    Staff Availability<span className="text-red-500">*</span>
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
                    Assign Staff<span className="text-red-500">*</span>
                  </label>
                  <Select
                    name="assginStaff"
                    options={filteredStaffOptions}
                    onChange={(option) => {
                      formik.setFieldValue("assginStaff", option?.value);
                    }}
                    placeholder="Assign Staff"
                    styles={customStyles}
                    // isDisabled={filteredStaffOptions.length === 0}
                  />
                  {formik.errors.assginStaff && formik.touched.assginStaff && (
                    <div className="text-red-500 text-sm">
                      Staff Name is required
                    </div>
                  )}
                </div>
                <div className="col-span-2">
                  <label className="mb-2 block">
                    Schedule a Follow Up
                    <span className="text-red-500">*</span>
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
                    {formik.errors.trialDateTime &&
                      formik.touched.trialDateTime && (
                        <div className="text-red-500 text-sm">
                          Schedule a Follow Up is required
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          )}

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
            <button type="button" className="px-4 py-2 border rounded">
              Cancel
            </button>
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
            {details?.status === "active" ? (
              <Select
                options={[{ value: "", label: "All" }, ...callTypesOption]}
                value={filterStatus}
                onChange={setFilterStatus}
                placeholder="Call Type"
                styles={customStyles}
              />
            ) : (
              <>
                <Select
                  options={[{ value: "", label: "All" }, ...callStatusOption]}
                  value={filterStatus}
                  onChange={setFilterStatus}
                  placeholder="Call Status"
                  styles={customStyles}
                />
              </>
            )}

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
                  {details?.status === "active"
                    ? "Member Call Status"
                    : "Lead Call Status"}
                </span>{" "}
                {log.callStatus}
              </p>
              {details?.status !== "active" && (
                <>
                  <p className="border p-2 rounded">
                    <span className="text-sm font-semibold flex flex-col">
                      Followup:
                    </span>{" "}
                    {log.trialDateTime
                      ? new Date(log.trialDateTime).toLocaleString()
                      : "N/A"}
                  </p>

                  <p className="border p-2 rounded">
                    <span className="text-sm font-semibold flex flex-col">
                      Service:
                    </span>{" "}
                    {log.serviceType}
                  </p>
                </>
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
  );
};

export default CallLogs;
