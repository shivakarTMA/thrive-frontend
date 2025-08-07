import React, { useEffect, useState } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useLocation, useParams } from "react-router-dom";
import { assignedLeadsData, mockData } from "../DummyData/DummyData";

import { customStyles } from "../Helper/helper";
import { useFormik } from "formik";
import * as Yup from "yup";

const callTypeOption = [
  { value: "cross-sell call", label: "Cross-sell Call" },
  { value: "feedback call", label: "Feedback Call" },
  { value: "induction call", label: "Induction Call" },
  { value: "assessment call", label: "Assessment Call" },
  { value: "welcome call", label: "Welcome Call" },
  { value: "courtesy call", label: "Courtesy Call" },
  { value: "upgrade call", label: "Upgrade Call" },
  { value: "payment call", label: "Payment Call" },
  { value: "renewal call", label: "Renewal Call" },
  { value: "birthday call", label: "Birthday Call" },
  { value: "inbound calls", label: "Inbound Calls" },
  { value: "anniversary calls", label: "Anniversary Calls" },
  { value: "irregular member", label: "Irregular Member" },
];

const crossSellCall = [
  {
    value: "cross-sales trial scheduled",
    label: "Cross-sales trial scheduled",
  },
  {
    value: "cross-sales trial follow-up",
    label: "Cross-sales trial follow-up",
  },
  { value: "not interested", label: "Not Interested" },
  { value: "future prospect", label: "Future Prospect" },
  { value: "callback", label: "Callback" },
  { value: "no answer", label: "No Answer" },
  {
    value: "switched-off / out of reach",
    label: "Switched-off / Out of Reach",
  },
  { value: "invalid number", label: "Invalid Number" },
  { value: "busy tone", label: "Busy Tone" },
];

const invoicesService = [
  {
    value: "membership plan - one month plan",
    label: "Membership Plan - One Month Plan",
  },
];

const feedbackCall = [
  { value: "successful", label: "Successful" },
  { value: "callback", label: "Callback" },
  { value: "no answer", label: "No answer" },
  { value: "switched off/ out of reach", label: "Switched Off/ Out of Reach" },
  { value: "busy tone", label: "Busy Tone" },
  { value: "invalid number", label: "Invalid number" },
];

const paymentCall = [
  { value: "collected", label: "Collected" },
  { value: "callback", label: "Callback" },
  { value: "busy tone", label: "Busy Tone" },
  { value: "switched off/ out of reach", label: "Switched Off/ Out of Reach" },
  { value: "no answer", label: "No answer" },
  { value: "invalid number", label: "Invalid number" },
];

const renewalCall = [
  { value: "renewed", label: "Renewed" },
  { value: "not interested", label: "Not Interested" },
  { value: "future prospect", label: "Future Prospect" },
  { value: "callback", label: "Callback" },
  { value: "no answer", label: "No answer" },
  { value: "switched off/ out of reach", label: "Switched Off/ Out of Reach" },
  { value: "invalid number", label: "Invalid number" },
  { value: "busy tone", label: "Busy Tone" },
];

const inboundCall = [
  { value: "complaint", label: "Complaint" },
  { value: "query", label: "Query" },
  { value: "query answered", label: "Query Answered" },
  { value: "callback", label: "Callback" },
  { value: "feedback", label: "Feedback" },
  { value: "others", label: "Others" },
];

const irregularCallType = [
  { value: "successful", label: "Successful" },
  { value: "callback", label: "Callback" },
  { value: "no answer", label: "No answer" },
  { value: "switched off/ out of reach", label: "Switched Off/ Out of Reach" },
  { value: "busy tone", label: "Busy Tone" },
  { value: "invalid number", label: "Invalid number" },
];

const callTypeStatusMap = {
  "cross-sell call": crossSellCall,
  "feedback call": feedbackCall,
  "induction call": feedbackCall,
  "assessment call": feedbackCall,
  "welcome call": feedbackCall,
  "courtesy call": feedbackCall,
  "upgrade call": feedbackCall,
  "payment call": paymentCall,
  "renewal call": renewalCall,
  "anniversary calls": feedbackCall,
  "inbound calls": inboundCall,
  "irregular member": irregularCallType,
  "birthday call": irregularCallType,
};

const showInvoiceForCallTypes = [
  "feedback call",
  "upgrade call",
  "payment call",
  "renewal call",
];

const validationSchema = Yup.object().shape({
  calledBy: Yup.string().required("Call by is required"),
  callType: Yup.string().required("Call Type is required"),
  callStatus: Yup.string().required("Lead Status is required"),
  serviceCard: Yup.string().when("callType", {
    is: (val) =>
      ["feedback call", "upgrade call", "payment call", "renewal call"].includes(val),
    then: () => Yup.string().required("Service Card is required"),
    otherwise: () => Yup.string().notRequired(),
  }),
  discussion: Yup.string().required("Discussion is required"),
});

const MemberCallLogs = () => {
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
  const [filteredLeadStatusOptions, setFilteredLeadStatusOptions] = useState(
    []
  );

  const formik = useFormik({
    initialValues: {
      callType: null,
      callStatus: null,
      serviceCard:'',
      calledBy: "Nitin",
      discussion: "",
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

  const shouldShowInvoice = showInvoiceForCallTypes.includes(
    formik.values.callType
  );

  const filteredLogs = callLogs.filter((log) => {
    const matchesStatus =
      !filterStatus || filterStatus.value === ""
        ? true
        : log.callType === filterStatus.value;

    const logDate = log.createdAt ? new Date(log.createdAt) : null;

    // Adjust endDate to include entire day (set to 23:59:59)
    const endOfDay = endDate
      ? new Date(endDate.setHours(23, 59, 59, 999))
      : null;

    const matchesStart = startDate ? logDate >= startDate : true;
    const matchesEnd = endOfDay ? logDate <= endOfDay : true;

    return matchesStatus && matchesStart && matchesEnd;
  });

  useEffect(() => {
    const selectedCallType = formik.values.callType;
    const statusOptions = callTypeStatusMap[selectedCallType] || [];
    setFilteredLeadStatusOptions(statusOptions);
    formik.setFieldValue("callStatus", "");
  }, [formik.values.callType]);

  return (
    <div className="page--content">
      <div className="flex items-end justify-between gap-2 mb-5">
        <div className="title--breadcrumbs">
          <p className="text-sm">Home &gt; Member calls</p>
          <h1 className="text-3xl font-semibold">Member Calls</h1>
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
                  className="custom--input w-full"
                  // readOnly={true}
                />
                {formik.errors.calledBy && formik.touched.calledBy && (
                  <div className="text-red-500 text-sm">
                    {formik.errors.calledBy}
                  </div>
                )}
              </div>

              <div>
                <label className="mb-2 block">
                  Call Type
                  <span className="text-red-500">*</span>
                </label>
                <Select
                  name="callType"
                  options={callTypeOption}
                  value={
                    callTypeOption.find(
                      (option) => option.value === formik.values.callType
                    ) || null
                  }
                  onChange={(option) =>
                    formik.setFieldValue("callType", option.value)
                  }
                  styles={customStyles}
                  placeholder="Call Type"
                />

                {formik.errors?.callType && formik.touched?.callType && (
                  <div className="text-red-500 text-sm">
                    {formik.errors?.callType}
                  </div>
                )}
              </div>

              {shouldShowInvoice && (
                <div>
                  <label className="mb-2 block">
                    Invoices<span className="text-red-500">*</span>
                  </label>

                  <Select
                    name="serviceCard"
                    options={invoicesService}
                    value={
                      invoicesService.find(
                        (option) => option.value === formik.values.serviceCard
                      ) || null
                    }
                    onChange={(option) =>
                      formik.setFieldValue("serviceCard", option.value)
                    }
                    styles={customStyles}
                    placeholder="Select Service Card"
                  />

                  {formik.errors?.serviceCard &&
                    formik.touched?.serviceCard && (
                      <div className="text-red-500 text-sm">
                        {formik.errors?.serviceCard}
                      </div>
                    )}
                </div>
              )}

              <div>
                <label className="mb-2 block">
                  Call Status<span className="text-red-500">*</span>
                </label>

                <Select
                  name="callStatus"
                  options={filteredLeadStatusOptions}
                  value={
                    filteredLeadStatusOptions.find(
                      (option) => option.value === formik.values.callStatus
                    ) || null
                  }
                  onChange={(option) =>
                    formik.setFieldValue("callStatus", option.value)
                  }
                  styles={customStyles}
                  placeholder="Call Status"
                />

                {formik.errors?.callStatus &&
                  formik.touched?.callStatus && (
                    <div className="text-red-500 text-sm">
                      {formik.errors?.callStatus}
                    </div>
                  )}
              </div>
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
                options={[{ value: "", label: "All" }, ...callTypeOption]}
                value={filterStatus}
                onChange={setFilterStatus}
                placeholder="Call Type"
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
                    Call Type
                  </span>{" "}
                  {log.callType}
                </p>
                <p className="border p-2 rounded">
                  <span className="text-sm font-semibold flex flex-col">
                    Call Status:
                  </span>{" "}
                  {log.callStatus}
                </p>
                <p className="border p-2 rounded">
                  <span className="text-sm font-semibold flex flex-col">
                    Service:
                  </span>{" "}
                  {log.serviceCard ? log.serviceCard : "N/A"}
                </p>
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

export default MemberCallLogs;
