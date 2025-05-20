import React, { useState } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useParams } from "react-router-dom";
import { mockData } from "../../DummyData/DummyData";
import { customStyles } from "../../Helper/helper";
import { useFormik } from "formik";
import * as Yup from "yup";

// Sample select options (Replace with real ones if needed)
const filterLead = [
  { value: "all", label: "All" },
  { value: "upcoming", label: "Upcoming" },
  { value: "missed", label: "Missed" },
  { value: "completed", label: "Completed" },
];
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
  { value: "enquiry", label: "Enquiry" },
  { value: "trial scheduled", label: "Trial Scheduled" },
  { value: "enquiry follow-up", label: "Enquiry follow-up" },
  { value: "busy tone", label: "Busy Tone" },
  { value: "sale", label: "Sale" },
  { value: "switched Off/ out of reach", label: "Switched Off/ Out of Reach" },
  { value: "no answer", label: "No answer" },
  { value: "future prospect", label: "Future Prospect" },
  { value: "did not put enquiry", label: "Did not Put Enquiry" },
  { value: "notinterested", label: "Not Interested" },
  { value: "not relevant", label: "Not Relevant" },
  { value: "invalid number", label: "Invalid number" },
];
const staffNameOption = [{ value: "Rajat Sharma", label: "Rajat Sharma" }];
const scheduleForOption = [
  { value: "Call", label: "Call" },
  { value: "Trial", label: "Trial" },
];

const validationSchema = Yup.object().shape({
  calledBy: Yup.string().required("Call by is required"),
  callStatus: Yup.string().required("Call status is required"),
  notInterestedReason: Yup.string().when("callStatus", {
    is: "notinterested",
    then: () => Yup.string().required("Required"),
  }),
  scheduleFor: Yup.string().when("callStatus", {
    is: "enquiry follow-up",
    then: () => Yup.string().required("Schedule for is required"),
  }),
  followUpDate: Yup.date()
    .nullable()
    .when("callStatus", {
      is: (val) =>
        val !== "sale" &&
        val !== "did not put enquiry" &&
        val !== "notinterested" &&
        val !== "not relevant" &&
        val !== "invalid number",
      then: (schema) => schema.required("Follow date is required"),
    }),
  discussion: Yup.string().required("Discussion is required"),
});

const LeadFollowUp = () => {
  const { id } = useParams();
  const leadDetails = mockData.find((m) => m.id === parseInt(id));
  const [callLogs, setCallLogs] = useState([]);

  const formik = useFormik({
    initialValues: {
      callStatus: "",
      notInterestedReason: "",
      trialType: "",
      trialDateTime: null,
      staffName: "Nitin",
      discussion: "",
      scheduleFor: "",
      followUpDate: null,
      temperature: "",
      closureDate: null,
      amount: "",
      calledBy: "Nitin",
    },
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      const newEntry = {
        ...values,
        createdAt: new Date(),
        updatedBy: "Rajat Sharma", // You can make this dynamic
        leadSource: "Passing By", // Make dynamic if needed
      };

      setCallLogs((prevLogs) => [newEntry, ...prevLogs]);
      resetForm();
    },
  });

  console.log("Formik Errors (if any):", formik.errors);

  return (
    <div className="page--content">
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">Home &gt; Lead calls</p>
          <h1 className="text-3xl font-semibold">Lead Calls</h1>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="border rounded p-4 w-full">
          <form onSubmit={formik.handleSubmit} className="sticky top-[50px]">
            <h2 className="text-xl font-semibold mb-4">
              {leadDetails?.name} - {leadDetails?.contact}
            </h2>

            {/* Called By & Call Status */}
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
                  Call Status<span className="text-red-500">*</span>
                </label>
                <Select
                  name="callStatus"
                  options={callStatusOption}
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
            </div>
            {formik.values?.callStatus === "notinterested" && (
              <div className="w-full mt-3">
                <div>
                  <label className="mb-2 block">
                    Not Interested Reason<span className="text-red-500">*</span>
                  </label>
                  <Select
                    name="notInterestedReason"
                    options={noReasons}
                    onChange={(option) => {
                      formik.setFieldValue("notInterestedReason", option.value);
                      formik.setFieldTouched("notInterestedReason", true); // 👈 ADD THIS
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

            {formik.values?.callStatus === "trial scheduled" && (
              <div className="border p-3 rounded w-full mt-3">
                <div className="my-5 !mt-0">
                  <label className="mb-2 block">Trial Type</label>
                  <div className="flex gap-2">
                    <label className="custom--radio">
                      Trial Appointment
                      <input
                        type="radio"
                        name="trialType"
                        value="trial appointment"
                        checked={
                          formik.values.trialType === "trial appointment"
                        }
                        className="w-4 h-4"
                        onChange={formik.handleChange}
                      />
                      <span className="radio-checkmark"></span>
                    </label>
                    <label className="custom--radio">
                      Trial Class
                      <input
                        type="radio"
                        name="trialType"
                        className="w-4 h-4"
                        value="trial class"
                        checked={formik.values.trialType === "trial class"}
                        onChange={formik.handleChange}
                      />
                      <span className="radio-checkmark"></span>
                    </label>
                    <label className="custom--radio">
                      Trial Session
                      <input
                        type="radio"
                        name="trialType"
                        className="w-4 h-4"
                        value="trial session"
                        checked={formik.values.trialType === "trial session"}
                        onChange={formik.handleChange}
                      />
                      <span className="radio-checkmark"></span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block">Date & Time</label>
                    <div className="custom--date">
                      <DatePicker
                        selected={formik.values.trialDateTime}
                        onChange={(val) =>
                          formik.setFieldValue("trialDateTime", val)
                        }
                        showTimeSelect
                        timeFormat="HH:mm"
                        dateFormat="MMMM d, yyyy h:mm aa"
                        placeholderText="Select trial date & time"
                        className="border px-3 py-2 w-full"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block">Staff Name</label>
                    <Select
                      name="staffName"
                      options={staffNameOption}
                      onChange={(option) =>
                        formik.setFieldValue("staffName", option.value)
                      }
                      styles={customStyles}
                      placeholder="Assign Staff"
                    />
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

            {formik.values?.callStatus === "sale" ||
            formik.values?.callStatus === "did not put enquiry" ||
            formik.values?.callStatus === "notinterested" ||
            formik.values?.callStatus === "not relevant" ||
            formik.values?.callStatus === "invalid number" ? null : (
              <>
                <h3 className="font-semibold text-xl">Schedule follow-up</h3>
                <div className="grid grid-cols-2 gap-4 my-3">
                  <div>
                    <label className="mb-2 block">
                      Date & Time<span className="text-red-500">*</span>
                    </label>
                    <div className="custom--date">
                      <DatePicker
                        selected={formik.values.followUpDate}
                        onChange={(val) =>
                          formik.setFieldValue("followUpDate", val)
                        }
                        showTimeSelect
                        timeFormat="HH:mm"
                        dateFormat="MMMM d, yyyy h:mm aa"
                        placeholderText="Follow-up date & time"
                        className="border px-3 py-2 w-full"
                      />
                      {formik.errors?.followUpDate &&
                        formik.touched?.followUpDate && (
                          <div className="text-red-500 text-sm">
                            {formik.errors.followUpDate}
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </>
            )}
            {/* Lead Temperature */}

            <div className="mb-3">
              <label className="mb-2 block">Lead Temperature</label>
              <div className="flex gap-2">
                <label className="custom--radio" style={{ color: "#00f" }}>
                  Cold
                  <input
                    type="radio"
                    name="temperature"
                    value="cold"
                    checked={formik.values.temperature === "cold"}
                    className="w-4 h-4"
                    onChange={formik.handleChange}
                  />
                  <span className="radio-checkmark cold"></span>
                </label>
                <label className="custom--radio" style={{ color: "#ffa500" }}>
                  Warm
                  <input
                    type="radio"
                    name="temperature"
                    className="w-4 h-4"
                    value="warm"
                    checked={formik.values.temperature === "warm"}
                    onChange={formik.handleChange}
                  />
                  <span className="radio-checkmark warm"></span>
                </label>
                <label className="custom--radio" style={{ color: "#f00" }}>
                  Hot
                  <input
                    type="radio"
                    name="temperature"
                    className="w-4 h-4"
                    value="hot"
                    checked={formik.values.temperature === "hot"}
                    onChange={formik.handleChange}
                  />
                  <span className="radio-checkmark hot"></span>
                </label>
              </div>
            </div>

            {/* Closure Date & Amount */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block">Expected Date of Closure</label>
                <div className="custom--date">
                  <DatePicker
                    selected={formik.values.closureDate}
                    onChange={(val) => formik.setFieldValue("closureDate", val)}
                    dateFormat="dd MMM yyyy"
                    placeholderText="Expected Closure Date"
                    className="border px-3 py-2 w-full"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block">Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={formik.values.amount}
                  onChange={formik.handleChange}
                  placeholder="Amount"
                  className="custom--input w-full number--appearance-none"
                />
              </div>
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
        <div className="border rounded p-4 w-full">
          <h2 className="text-xl font-semibold mb-5">Contact History</h2>
          <div className="flex gap-2 mb-3">
            <div className="grid grid-cols-3 gap-2">
              <Select
                name="historyFilter"
                onChange={(option) =>
                  formik.setFieldValue("historyFilter", option)
                }
                options={filterLead}
                styles={customStyles}
                placeholder="Filter"
              />
              <div className="custom--date">
                <DatePicker
                  selected={formik.values.historyStartDate}
                  onChange={(date) =>
                    formik.setFieldValue("historyStartDate", date)
                  }
                  dateFormat="dd/MM/yyyy"
                  placeholderText="From Date"
                  className="border px-3 py-2"
                />
              </div>
              <div className="custom--date">
                <DatePicker
                  selected={formik.values.historyEndDate}
                  onChange={(date) =>
                    formik.setFieldValue("historyEndDate", date)
                  }
                  dateFormat="dd/MM/yyyy"
                  placeholderText="To Date"
                  className="border px-3 py-2"
                />
              </div>
            </div>
            <button
              type="button"
              className="px-4 py-2 bg-black text-white rounded"
              onClick={() => {
                // Add logic to filter history entries here
                console.log("Filter data", {
                  filter: formik.values.historyFilter,
                  start: formik.values.historyStartDate,
                  end: formik.values.historyEndDate,
                });
              }}
            >
              Go
            </button>
          </div>

          {callLogs.map((log, index) => (
            <div
              key={index}
              className="border rounded p-4 w-full mb-3 calllogdetails"
            >
              <div className="grid grid-cols-2 gap-2 mb-3">
                <p className="border p-2 rounded">
                  <span className="text-sm font-semibold flex flex-col">
                    Schedule Date:
                  </span>{" "}
                  {log.followUpDate
                    ? new Date(log.followUpDate).toLocaleString()
                    : "—"}
                </p>
                <p className="border p-2 rounded">
                  <span className="text-sm font-semibold flex flex-col">
                    Updated By:
                  </span>{" "}
                  {log.updatedBy}
                </p>
                <p className="border p-2 rounded">
                  <span className="text-sm font-semibold flex flex-col">
                    Lead Source:
                  </span>{" "}
                  {log.leadSource}
                </p>
                <p className="border p-2 rounded">
                  <span className="text-sm font-semibold flex flex-col">
                    Call Status:
                  </span>{" "}
                  {log.callStatus}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <h3 className="text-sm font-semibold">Notes:</h3>
                <p>{log.discussion}</p>
              </div>
            </div>
          ))}

          {/* {callLogs.map((log, index) => (
            <div
              key={index}
              className="border rounded p-4 w-full mb-3 calllogdetails"
            >
              <div className="grid grid-cols-2 gap-2 mb-3">
                <p className="border p-2 rounded">
                  <span className="text-sm font-semibold flex flex-col">
                    Schedule Date:
                  </span>{" "}
                  {log.followUpDate
                    ? new Date(log.followUpDate).toLocaleString()
                    : "—"}
                </p>
                <p className="border p-2 rounded">
                  <span className="text-sm font-semibold flex flex-col">
                    Updated By:
                  </span>{" "}
                  {log.updatedBy}
                </p>
                <p className="border p-2 rounded">
                  <span className="text-sm font-semibold flex flex-col">
                    Lead Source:
                  </span>{" "}
                  {log.leadSource}
                </p>
                <p className="border p-2 rounded">
                  <span className="text-sm font-semibold flex flex-col">
                    Call Status:
                  </span>{" "}
                  {log.callStatus}
                </p>

                {log.callStatus === "notinterested" && (
                  <p className="border p-2 rounded col-span-2">
                    <span className="text-sm font-semibold flex flex-col">
                      Not Interested Reason:
                    </span>{" "}
                    {log.notInterestedReason}
                  </p>
                )}

                {log.callStatus === "trial scheduled" && (
                  <>
                    <p className="border p-2 rounded">
                      <span className="text-sm font-semibold flex flex-col">
                        Trial Type:
                      </span>{" "}
                      {log.trialType}
                    </p>
                    <p className="border p-2 rounded">
                      <span className="text-sm font-semibold flex flex-col">
                        Trial Date/Time:
                      </span>{" "}
                      {log.trialDateTime
                        ? new Date(log.trialDateTime).toLocaleString()
                        : "—"}
                    </p>
                    <p className="border p-2 rounded col-span-2">
                      <span className="text-sm font-semibold flex flex-col">
                        Assigned Staff:
                      </span>{" "}
                      {log.staffName}
                    </p>
                  </>
                )}

                {log.callStatus !== "sale" &&
                  log.callStatus !== "notinterested" &&
                  log.callStatus !== "not relevant" &&
                  log.callStatus !== "did not put enquiry" &&
                  log.callStatus !== "invalid number" && (
                    <>
                      <p className="border p-2 rounded">
                        <span className="text-sm font-semibold flex flex-col">
                          Follow-Up For:
                        </span>{" "}
                        {log.scheduleFor}
                      </p>
                      <p className="border p-2 rounded">
                        <span className="text-sm font-semibold flex flex-col">
                          Follow-Up Date:
                        </span>{" "}
                        {log.followUpDate
                          ? new Date(log.followUpDate).toLocaleString()
                          : "—"}
                      </p>
                    </>
                  )}

                {(log.temperature || log.closureDate || log.amount) && (
                  <>
                    <p className="border p-2 rounded">
                      <span className="text-sm font-semibold flex flex-col">
                        Lead Temperature:
                      </span>{" "}
                      {log.temperature || "—"}
                    </p>
                    <p className="border p-2 rounded">
                      <span className="text-sm font-semibold flex flex-col">
                        Expected Closure:
                      </span>{" "}
                      {log.closureDate
                        ? new Date(log.closureDate).toLocaleDateString()
                        : "—"}
                    </p>
                    <p className="border p-2 rounded">
                      <span className="text-sm font-semibold flex flex-col">
                        Amount:
                      </span>{" "}
                      {log.amount || "—"}
                    </p>
                  </>
                )}
              </div>

              <div className="bg-gray-50 p-3 rounded">
                <h3 className="text-sm font-semibold">Discussion Notes:</h3>
                <p>{log.discussion || "No discussion entered."}</p>
              </div>
            </div>
          ))} */}
        </div>
      </div>
    </div>
  );
};

export default LeadFollowUp;
