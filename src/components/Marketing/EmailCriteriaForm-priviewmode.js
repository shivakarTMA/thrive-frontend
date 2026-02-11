import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import MemberEmailFilterPanel from "../FilterPanel/MemberEmailFilterPanel";
import { customStyles } from "../../Helper/helper";
import RichTextEditor from "../common/RichTextEditor";
import { emailTemplates } from "../../DummyData/DummyData";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";

// ✅ Define available merge tags for email personalization
const MERGE_TAGS = [
  { label: "User Name", value: "{{user_name}}" },
  { label: "Email", value: "{{email}}" },
  { label: "Club Name", value: "{{club_name}}" },
  { label: "Phone Number", value: "{{phone}}" },
  { label: "Membership ID", value: "{{membership_id}}" },
  { label: "Expiry Date", value: "{{expiry_date}}" },
  { label: "Service Name", value: "{{service_name}}" },
];

const EmailCriteriaForm = ({ activeTab, onFilterDirtyChange }) => {
  const [showPreview, setShowPreview] = useState(false);

  // ✅ Preview sample data
  const previewData = {
    user_name: "John Doe",
    email: "john@example.com",
    club_name: "Fitness Pro Club",
    phone: "+1234567890",
    membership_id: "MEM001",
    expiry_date: "31/12/2025",
    service_name: "Premium Membership",
  };

  // ✅ Define validation schema using Yup
  const validationSchema = Yup.object({
    subject: Yup.string().required("Subject is required"),
    message: Yup.string().required("Message is required"),
    campaign_name: Yup.string().required("Campaign Name is required"),
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
    "filterServiceType",
    "filterServiceName",
    "filterLeadSource",
    "filterExpiryFrom",
    "filterExpiryTo",
  ];

  // ✅ Initialize Formik
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      module: activeTab,
      selectedTemplate: null,
      subject: "",
      message: "",
      campaign_name: "",
      filterClub: null,
      filterMemberValidity: null,
      filterLeadValidity: null,
      filterAgeGroup: null,
      filterGender: null,
      filterServiceType: null,
      filterServiceName: null,
      filterLeadSource: null,
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
          ? "Email scheduled successfully"
          : "Email sent successfully"
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

  // ✅ Derived value - check for filter errors
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

  const handleTemplateSelect = (option) => {
    formik.setFieldValue("selectedTemplate", option);
    if (option?.value && emailTemplates[option.value]) {
      const templateHtml = emailTemplates[option.value];
      formik.setFieldValue("message", templateHtml);
    }
  };

  // ✅ Insert merge tag into message
  const insertMergeTag = (tagValue) => {
    const currentMessage = formik.values.message || "";
    formik.setFieldValue("message", currentMessage + " " + tagValue);
  };

  // ✅ Insert merge tag into subject
  const insertMergeTagInSubject = (tagValue) => {
    const currentSubject = formik.values.subject || "";
    formik.setFieldValue("subject", currentSubject + " " + tagValue);
  };

  // ✅ Get preview content with replaced merge tags
  const getPreviewContent = () => {
    let preview = formik.values.message;
    Object.entries(previewData).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      preview = preview.replace(regex, `<strong>${value}</strong>`);
    });
    return preview;
  };

  // ✅ Get preview subject with replaced merge tags
  const getPreviewSubject = () => {
    let preview = formik.values.subject;
    Object.entries(previewData).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      preview = preview.replace(regex, value);
    });
    return preview;
  };

  return (
    <div className="w-full p-3 border bg-white shadow-box rounded-[10px]">
      {/* ✅ Form with formik.handleSubmit */}
      <form onSubmit={formik.handleSubmit}>
        {/* --- FILTER PANEL SECTION --- */}
        <div className="flex items-start gap-3 justify-between w-full mb-3 border-b border-b-[#D4D4D4] pb-3">
          <MemberEmailFilterPanel
            filterClub={formik.values.filterClub}
            filterMemberValidity={formik.values.filterMemberValidity}
            filterLeadValidity={formik.values.filterLeadValidity}
            filterAgeGroup={formik.values.filterAgeGroup}
            filterGender={formik.values.filterGender}
            filterServiceType={formik.values.filterServiceType}
            filterServiceName={formik.values.filterServiceName}
            filterLeadSource={formik.values.filterLeadSource}
            filterExpiryFrom={formik.values.filterExpiryFrom}
            filterExpiryTo={formik.values.filterExpiryTo}
            formik={formik}
            setFilterValue={(field, value) =>
              formik.setFieldValue(field, value)
            }
          />
        </div>

        {/* Show Filter errors */}
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

        {/* --- EMAIL TEMPLATE SECTION --- */}
        <div>
          <div className="grid grid-cols-3 gap-2">
            {/* Campaign Input */}
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

            {/* Select Template */}
            <div>
              <label className="mb-2 block">Select Email Template</label>
              <Select
                value={formik.values.selectedTemplate}
                onChange={handleTemplateSelect}
                options={[
                  { value: "welcome", label: "Welcome Template" },
                  { value: "renewal", label: "Renewal Template" },
                  { value: "promotion", label: "Promotion Template" },
                ]}
                placeholder="Select template"
                styles={customStyles}
              />
            </div>

            {/* Subject Input */}
            <div>
              <label className="mb-2 block">
                Subject<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="subject"
                className="custom--input w-full"
                value={formik.values.subject}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter subject (use merge tags for personalization)"
              />
              {/* Quick merge tag buttons for subject */}
              <div className="flex gap-1 mt-1 flex-wrap">
                {MERGE_TAGS.slice(0, 3).map((tag) => (
                  <button
                    key={tag.value}
                    type="button"
                    onClick={() => insertMergeTagInSubject(tag.value)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    + {tag.label}
                  </button>
                ))}
              </div>
              {formik.touched.subject && formik.errors.subject && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.subject}
                </p>
              )}
            </div>
          </div>

          {/* --- MESSAGE SECTION WITH MERGE TAGS --- */}
          <div className="mt-4">
            {/* ✅ Merge Tags Helper Panel */}
            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                <span>📌</span>
                Personalize your email - Click to insert:
              </p>
              <div className="flex flex-wrap gap-2">
                {MERGE_TAGS.map((tag) => (
                  <button
                    key={tag.value}
                    type="button"
                    onClick={() => insertMergeTag(tag.value)}
                    className="px-3 py-1.5 text-sm bg-white hover:bg-blue-100 border border-blue-300 rounded shadow-sm transition-colors"
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-2">
                💡 These tags will be replaced with actual user data when sending emails
              </p>
            </div>

            <RichTextEditor
              value={formik.values.message}
              label="Message"
              onChange={(content) => formik.setFieldValue("message", content)}
              placeholder="Enter your email message... Use merge tags like {{user_name}}, {{email}}, etc."
            />
            {formik.touched.message && formik.errors.message && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.message}
              </p>
            )}
          </div>

          {/* ✅ PREVIEW SECTION */}
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black rounded transition-colors"
            >
              {showPreview ? "Hide Preview" : "👁️ Preview Email"}
            </button>

            {showPreview && (
              <div className="mt-3 p-4 border-2 border-gray-300 rounded-lg bg-gray-50">
                <h3 className="font-semibold mb-3 text-lg border-b pb-2">
                  Email Preview (Sample Data):
                </h3>
                
                {/* Preview Subject */}
                {formik.values.subject && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-600 mb-1">Subject:</p>
                    <p className="text-base font-medium">{getPreviewSubject()}</p>
                  </div>
                )}

                {/* Preview Message */}
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">Message:</p>
                  <div 
                    className="bg-white p-3 rounded border"
                    dangerouslySetInnerHTML={{ __html: getPreviewContent() }} 
                  />
                </div>

                {/* Sample data info */}
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                  <p className="font-semibold mb-1">Sample data used:</p>
                  <p>User: {previewData.user_name} | Email: {previewData.email} | Club: {previewData.club_name}</p>
                </div>
              </div>
            )}
          </div>

          {/* --- SCHEDULE SEND --- */}
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
            className="px-4 py-2 bg-black text-white rounded flex items-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
          >
            {formik.values.sendType === "SCHEDULED"
              ? "📅 Schedule Email"
              : "✉️ Send Email Now"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmailCriteriaForm;