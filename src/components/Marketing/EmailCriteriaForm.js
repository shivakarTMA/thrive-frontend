import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import MemberEmailFilterPanel from "../FilterPanel/MemberEmailFilterPanel";
import { customStyles } from "../../Helper/helper";
import RichTextEditor from "../common/RichTextEditor";

// ✅ Define validation schema using Yup
const validationSchema = Yup.object({
  selectedTemplate: Yup.object().nullable().required("Template is required"),
  subject: Yup.string().required("Subject is required"),
  message: Yup.string().required("Message is required"),
});

const EmailCriteriaForm = () => {
  // ✅ Initialize Formik using the hook pattern
  const [textB, setTextB] = useState("<p>Second editor</p>");
  const formik = useFormik({
    initialValues: {
      selectedTemplate: null,
      subject: "",
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
      console.log("Form Submitted Data:", values?.message);
    },
  });

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

        {/* --- EMAIL TEMPLATE SECTION --- */}
        <div>
          <p className="text-lg font-[600] text-black mb-3">
            Customise your template
          </p>

          <div className="grid grid-cols-2 gap-2">
            {/* Select Template */}
            <div>
              <label className="mb-2 block">
                Select Email Template<span className="text-red-500">*</span>
              </label>
              <Select
                value={formik.values.selectedTemplate}
                onChange={(option) =>
                  formik.setFieldValue("selectedTemplate", option)
                }
                options={[
                  { value: "welcome", label: "Welcome Template" },
                  { value: "renewal", label: "Renewal Template" },
                  { value: "promotion", label: "Promotion Template" },
                ]}
                placeholder="Select template"
                styles={customStyles}
              />
              {formik.touched.selectedTemplate &&
                formik.errors.selectedTemplate && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.selectedTemplate}
                  </p>
                )}
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
                placeholder="Enter subject"
              />
              {formik.touched.subject && formik.errors.subject && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.subject}
                </p>
              )}
            </div>
          </div>

          {/* --- MESSAGE SECTION --- */}
          <div className="mt-4">
            <RichTextEditor
              value={formik.values.message}
              label="Message"
              onChange={(content) => formik.setFieldValue("message", content)}
              placeholder="Enter your email message..."
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
            disabled={formik.isSubmitting}
            className="px-4 py-2 bg-black text-white rounded flex items-center gap-2 mt-4"
          >
            Send Mail
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmailCriteriaForm;
