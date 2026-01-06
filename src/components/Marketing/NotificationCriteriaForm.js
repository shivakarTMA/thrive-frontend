import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import NotificationFilterPanel from "../FilterPanel/NotificationFilterPanel";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";

const NotificationCriteriaForm = ({ activeTab, onFilterDirtyChange }) => {
  // ✅ Define validation schema
  const validationSchema = Yup.object({
    heading: Yup.string()
      .required("Heading is required")
      .min(5, "Heading must be at least 5 characters")
      .max(100, "Heading cannot exceed 100 characters"),
    campaign_name: Yup.string().required("Campaign Name is required"),

    description: Yup.string()
      .required("Description is required")
      .min(10, "Description must be at least 10 characters")
      .max(500, "Description cannot exceed 500 characters"),

    filterClub: Yup.string().nullable().required("Club is required"),

    filterMemberValidity: Yup.string().when("module", {
      is: "Member",
      then: (schema) => schema.required("Validity is required"),
      otherwise: (schema) => schema.nullable(),
    }),

    filterLeadValidity: Yup.string().when("module", {
      is: "Enquiries",
      then: (schema) => schema.required("Validity is required"),
      otherwise: (schema) => schema.nullable(),
    }),

    // filterAgeGroup: Yup.string().nullable().required("Age Group is required"),
    // filterGender: Yup.string().nullable().required("Gender is required"),
    // filterLeadSource: Yup.string().when("module", {
    //   is: "Enquiries",
    //   then: (schema) => schema.required("Lead Source is required"),
    //   otherwise: (schema) => schema.nullable(),
    // }),
    // filterServiceType: Yup.string().when("module", {
    //   is: "Member",
    //   then: (schema) => schema.required("Service Type is required"),
    //   otherwise: (schema) => schema.nullable(),
    // }),
    // filterServiceName: Yup.string().when("module", {
    //   is: "Member",
    //   then: (schema) => schema.required("Service Name is required"),
    //   otherwise: (schema) => schema.nullable(),
    // }),

    // filterExpiryFrom: Yup.date().when("module", {
    //   is: "Member",
    //   then: (schema) => schema.required("Expiry From is required"),
    //   otherwise: (schema) => schema.nullable(),
    // }),

    // filterExpiryTo: Yup.date().when("module", {
    //   is: "Member",
    //   then: (schema) => schema.required("Expiry To is required"),
    //   otherwise: (schema) => schema.nullable(),
    // }),

    sendType: Yup.string().oneOf(["NOW", "SCHEDULED"]),

    scheduledAt: Yup.date()
      .nullable()
      .when("sendType", {
        is: "SCHEDULED",
        then: (schema) =>
          schema
            .required("Schedule date & time is required")
            .min(new Date(), "Scheduled time must be in the future"),
        otherwise: (schema) => schema.nullable(),
      }),
  });

  const filterFields = [
    "filterClub",
    "filterMemberValidity",
    "filterLeadValidity",
    "filterAgeGroup",
    "filterGender",
    "filterLeadSource",
    "filterServiceType",
    "filterServiceName",
    "filterExpiryFrom",
    "filterExpiryTo",
  ];

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      module: activeTab,
      selectedTemplate: null,
      selectedGateway: null,
      heading: "",
       campaign_name: "",
      description: "",
      filterClub: null,
      filterMemberValidity: null,
      filterLeadValidity: null,
      filterAgeGroup: null,
      filterGender: null,
      filterLeadSource: null,
      filterServiceType: null,
      filterServiceName: null,
      filterExpiryFrom: null,
      filterExpiryTo: null,
      sendType: "NOW", // NOW | SCHEDULED
      scheduledAt: null,
    },
    validationSchema,
    onSubmit: (values) => {
      if (hasFilterErrors) {
        toast.error("Please complete all filter criteria");
        return;
      }

      const payload = {
        ...values,
        send_type: values.sendType,
        scheduled_at:
          values.sendType === "SCHEDULED" ? values.scheduledAt : null,
      };

      console.log("Final Payload:", payload);

      toast.success(
        values.sendType === "SCHEDULED"
          ? "Notification scheduled successfully"
          : "Notification sent successfully"
      );
    },
  });

  const resetFilters = () => {
    filterFields.forEach((field) => {
      formik.setFieldValue(field, null);
      formik.setFieldTouched(field, false);
    });
  };

  useEffect(() => {
    resetFilters();
    formik.setFieldValue("module", activeTab);
  }, [activeTab]);

  // ✅ Derived value (no extra state needed)
  const hasFilterErrors = filterFields.some(
    (field) => formik.touched[field] && formik.errors[field]
  );

  // ✅ Detect dirty filters (for tab change blocking)
  useEffect(() => {
    const hasAnyFilterValue = filterFields.some(
      (field) => formik.values[field] !== null && formik.values[field] !== ""
    );

    onFilterDirtyChange(hasAnyFilterValue);
  }, [formik.values, onFilterDirtyChange]);

  return (
    <div className="w-full p-3 border bg-white shadow-box rounded-[10px]">
      {/* ✅ Regular form tag using formik.handleSubmit */}
      <form onSubmit={formik.handleSubmit}>
        {/* --- FILTER PANEL SECTION --- */}
        <div className="flex items-start gap-3 justify-between w-full mb-3 border-b border-b-[#D4D4D4] pb-3">
          <NotificationFilterPanel
            filterClub={formik.values.filterClub}
            filterMemberValidity={formik.values.filterMemberValidity}
            filterLeadValidity={formik.values.filterLeadValidity}
            filterAgeGroup={formik.values.filterAgeGroup}
            filterGender={formik.values.filterGender}
            filterLeadSource={formik.values.filterLeadSource}
            filterServiceType={formik.values.filterServiceType}
            filterServiceName={formik.values.filterServiceName}
            filterExpiryFrom={formik.values.filterExpiryFrom}
            filterExpiryTo={formik.values.filterExpiryTo}
            formik={formik}
            setFilterValue={(field, value) =>
              formik.setFieldValue(field, value)
            }
          />
        </div>

        {/* Show FilterClub error */}
        {hasFilterErrors && (
          <div className="mb-3 flex gap-2 flex-wrap">
            <p className="text-sm font-[500]">Please Select the Criteria:</p>

            {filterFields.map((field, index) =>
              formik.touched[field] && formik.errors[field] ? (
                <p key={field} className="text-red-500 text-sm">
                  {formik.errors[field]}
                  {index < filterFields.length - 1 ? "," : ""}
                </p>
              ) : null
            )}
          </div>
        )}

        {/* --- Notification SECTION --- */}
        <div>
          <div className="grid grid-cols-2 gap-2">
            {/* campaign Input */}
            <div>
              <label className="mb-2 block">
                Campaign Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="campaign_name"
                className="custom--input w-full"
                value={formik.values.campaign_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter Campaign"
              />
              {formik.touched.campaign_name && formik.errors.campaign_name && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.campaign_name}
                </p>
              )}
            </div>

            {/* Heading */}
            <div>
              <label className="mb-2 block">
                Heading<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="heading"
                value={formik.values.heading ?? ""}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="custom--input w-full "
                placeholder="Enter Heading"
              />
              {formik.touched.heading && formik.errors.heading && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.heading}
                </p>
              )}
            </div>
          </div>
          {/* --- MESSAGE SECTION --- */}
          <div className="mt-4">
            <label className="block mb-2">
              Description
              <span className="text-red-500">*</span>
            </label>
            <textarea
              className="custom--input w-full h-40"
              value={formik.values.description}
              placeholder="Enter Message"
              onChange={(e) =>
                formik.setFieldValue("description", e.target.value)
              }
            />

            {formik.touched.description && formik.errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.description}
              </p>
            )}
          </div>

          {/* --- SCHEDULE SEND (Gmail-like using DatePicker) --- */}
          <div className="mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formik.values.sendType === "SCHEDULED"}
                onChange={(e) => {
                  if (e.target.checked) {
                    formik.setFieldValue("sendType", "SCHEDULED");
                  } else {
                    formik.setFieldValue("sendType", "NOW");
                    formik.setFieldValue("scheduledAt", null);
                  }
                }}
              />
              <span className="text-sm font-medium">Schedule send</span>
            </label>

            {formik.values.sendType === "SCHEDULED" && (
              <div className="mt-2 max-w-sm">
                <DatePicker
                  selected={formik.values.scheduledAt}
                  onChange={(date) => formik.setFieldValue("scheduledAt", date)}
                  showTimeSelect
                  timeIntervals={15}
                  dateFormat="dd/MM/yyyy hh:mm aa"
                  minDate={new Date()}
                  placeholderText="Select date & time"
                  className="custom--input w-full"
                />

                {formik.errors.scheduledAt && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.scheduledAt}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* --- SUBMIT BUTTON --- */}
          <button
            type="submit"
            disabled={
              hasFilterErrors ||
              (formik.values.sendType === "SCHEDULED" &&
                !formik.values.scheduledAt)
            }
            className="px-4 py-2 bg-black text-white rounded flex items-center gap-2 mt-4 disabled:opacity-50"
          >
            {formik.values.sendType === "SCHEDULED"
              ? "Schedule SMS"
              : "Send SMS"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NotificationCriteriaForm;
