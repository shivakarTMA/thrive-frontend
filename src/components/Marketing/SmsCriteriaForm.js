import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import MemberEmailFilterPanel from "../FilterPanel/MemberEmailFilterPanel";
import { customStyles } from "../../Helper/helper";
import { smsTemplates } from "../../DummyData/DummyData";
import { toast } from "react-toastify";

// ✅ Define validation schema using Yup
const validationSchema = Yup.object({
  selectedTemplate: Yup.object().nullable().required("Template is required"),
  selectedGateway: Yup.object().nullable().required("Gateway is required"),
  message: Yup.string().required("Message is required"),
  filterClub: Yup.string().nullable().required("Club is required"),
  filterValidity: Yup.string().nullable().required("Validity is required"),
  filterAgeGroup: Yup.string().nullable().required("Age Group is required"),
  filterGender: Yup.string().nullable().required("Gender is required"),
  filterService: Yup.string().nullable().required("Service is required"),
  filterServiceCategory: Yup.string()
    .nullable()
    .required("Service Category is required"),
  filterServiceVariation: Yup.string()
    .nullable()
    .required("Service Variation is required"),
  filterLeadSource: Yup.string().nullable().required("Lead Source is required"),
  filterExpiryFrom: Yup.date().nullable().required("Expiry From is required"),
  filterExpiryTo: Yup.date().nullable().required("Expiry To is required"),
});

const filterFields = [
  "filterClub",
  "filterValidity",
  "filterAgeGroup",
  "filterGender",
  "filterService",
  "filterServiceCategory",
  "filterServiceVariation",
  "filterLeadSource",
  "filterExpiryFrom",
  "filterExpiryTo",
];

const smsGateways = [
  { value: "twilio", label: "Twilio" },
  { value: "nexmo", label: "Nexmo / Vonage" },
  { value: "plivo", label: "Plivo" },
  { value: "msg91", label: "MSG91" },
  { value: "textmagic", label: "TextMagic" },
  { value: "clicksend", label: "ClickSend" },
  { value: "telesign", label: "Telesign" },
];

const SmsCriteriaForm = ({ activeTab }) => {
  // ✅ Initialize Formik using the hook pattern
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      module: activeTab,
      selectedTemplate: null,
      selectedGateway: null,
      message: "",
      filterClub: null,
      filterValidity: null,
      filterAgeGroup: null,
      filterGender: null,
      filterService: null,
      filterServiceCategory: null,
      filterServiceVariation: null,
      filterLeadSource: null,
      filterExpiryFrom: null,
      filterExpiryTo: null,
    },
    validationSchema,
    onSubmit: (values) => {
      console.log("Form Submitted Data:", values);
      toast.error(formik.errors);
    },
  });

  const handleTemplateSelect = (option) => {
    formik.setFieldValue("selectedTemplate", option);

    if (option?.value && smsTemplates[option.value]) {
      const templateHtml = smsTemplates[option.value];

      // Insert template into the editor
      formik.setFieldValue("message", templateHtml);
    }
  };

  const hasFilterErrors = filterFields.some(
    (field) => formik.touched[field] && formik.errors[field]
  );

  return (
    <div className="w-full p-3 border bg-white shadow-box rounded-[10px]">
      {/* ✅ Regular form tag using formik.handleSubmit */}
      <form onSubmit={formik.handleSubmit}>
        {/* --- FILTER PANEL SECTION --- */}
        <div className="flex items-start gap-3 justify-between w-full mb-3 border-b border-b-[#D4D4D4] pb-3">
          <MemberEmailFilterPanel
            filterClub={formik.values.filterClub}
            filterValidity={formik.values.filterValidity}
            filterAgeGroup={formik.values.filterAgeGroup}
            filterGender={formik.values.filterGender}
            filterService={formik.values.filterService}
            filterServiceCategory={formik.values.filterServiceCategory}
            filterServiceVariation={formik.values.filterServiceVariation}
            filterLeadSource={formik.values.filterLeadSource}
            filterExpiryFrom={formik.values.filterExpiryFrom}
            filterExpiryTo={formik.values.filterExpiryTo}
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

        {/* --- EMAIL TEMPLATE SECTION --- */}
        <div>
          <p className="text-lg font-[600] text-black mb-3">
            Customise your template
          </p>

          <div className="grid grid-cols-2 gap-2">
            {/* Gateway */}
            <div>
              <label className="mb-2 block">
                Gateway<span className="text-red-500">*</span>
              </label>
              <Select
                value={formik.values.selectedGateway}
                onChange={(option) =>
                  formik.setFieldValue("selectedGateway", option)
                }
                options={smsGateways}
                placeholder="Select SMS Type"
                styles={customStyles}
              />
              {formik.touched.selectedGateway &&
                formik.errors.selectedGateway && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.selectedGateway}
                  </p>
                )}
            </div>

            {/* SMS Template */}
            <div>
              <label className="mb-2 block">
                SMS Template<span className="text-red-500">*</span>
              </label>
              <Select
                value={formik.values.selectedTemplate}
                onChange={handleTemplateSelect}
                options={[
                  { value: "renewal", label: "Renewal Template" },
                  { value: "promotion", label: "Promotion Template" },
                  { value: "welcome", label: "Welcome Template" },
                  { value: "passwordReset", label: "Password Reset Template" },
                  {
                    value: "appointmentReminder",
                    label: "Appointment Reminder Template",
                  },
                ]}
                placeholder="Select Template"
                styles={customStyles}
              />
              {formik.touched.selectedTemplate &&
                formik.errors.selectedTemplate && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.selectedTemplate}
                  </p>
                )}
            </div>
          </div>

          {/* --- MESSAGE SECTION --- */}
          <div className="mt-4">
            <label className="block mb-2">
              Message
              <span className="text-red-500">*</span>
            </label>
            <textarea
              className="custom--input w-full h-40"
              value={formik.values.message}
              onChange={(e) => formik.setFieldValue("message", e.target.value)}
            />

            {formik.touched.message && formik.errors.message && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.message}
              </p>
            )}
          </div>

          {/* --- SUBMIT BUTTON --- */}
          <button
            type="submit"
            className="px-4 py-2 bg-black text-white rounded flex items-center gap-2 mt-4"
          >
            Send Mail
          </button>
        </div>
      </form>
    </div>
  );
};

export default SmsCriteriaForm;
