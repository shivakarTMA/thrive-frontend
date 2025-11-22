import React, { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import { customStyles } from "../../Helper/helper";
import RichTextEditor from "../common/RichTextEditor";
import { emailTemplates } from "../../DummyData/DummyData";
import { toast } from "react-toastify";
import { IoClose } from "react-icons/io5";
import { apiAxios } from "../../config/config";
import { useLocation, useNavigate } from "react-router-dom";

// ✅ Define validation schema using Yup
const validationSchema = Yup.object({
  send_to: Yup.array().min(1, "Please select at least one member"),
  selectedTemplate: Yup.object().nullable().required("Template is required"),
  subject: Yup.string().required("Subject is required"),
  message: Yup.string().required("Message is required"),
});

const BulkEmailCriteriaForm = () => {

  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Parse URL to get type (member/lead) and ids
  // Parse URL query params correctly
  const parseUrlParams = () => {
    const params = new URLSearchParams(location.search);

    return {
      type: params.get("type") || "member",
      idsArray: params.get("ids")
        ? params.get("ids").split(",").map(Number)
        : [],
    };
  };

  const { type: currentType, idsArray } = parseUrlParams();

  // ✅ Initialize Formik using the hook pattern
  const formik = useFormik({
    initialValues: {
      send_to: [],
      selectedTemplate: null,
      subject: "",
      message: "",
    },
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      if (values.send_to.length === 0) {
        toast.error("Please select at least one recipient");
        return;
      }

      const ids = values.send_to.map((m) => m.id);
      const emails = values.send_to.map((m) => m.email);

      const payload = {
        ids,
        emails,
        subject: values.subject,
        message: values.message,
        template: values.selectedTemplate?.value,
        type: currentType, // 'member' or 'lead'
      };

      console.log("API Payload:", payload);

      toast.success("Email sent successfully!");
      resetForm();
      // ⭐ Reset send-mail URL
      navigate("/send-mail", {
        replace: true,
      });
    },
  });

  console.log(formik.values?.send_to, "SHIVAKAR");

  const handleTemplateSelect = (option) => {
    formik.setFieldValue("selectedTemplate", option);

    if (option?.value && emailTemplates[option.value]) {
      const templateHtml = emailTemplates[option.value];

      // Insert template into the editor
      formik.setFieldValue("message", templateHtml);
    }
  };

  const handleRemoveFilter = (id) => {
    const updated = formik.values.send_to.filter((item) => item.id !== id);
    formik.setFieldValue("send_to", updated);
  };

  const fetchMemberList = async () => {
    try {
      let list = [];
      if (currentType === "member") {
        const res = await apiAxios().get("/member/list");
        list = res.data?.data || [];
      } else if (currentType === "lead") {
        const res = await apiAxios().get("/lead/list");
        list = res.data?.data || [];
      }

      // Filter based on URL ids
      if (idsArray.length > 0) {
        const filtered = list.filter((item) => idsArray.includes(item.id));
        formik.setFieldValue("send_to", filtered);

        if (filtered.length === 0) {
          toast.error(`No ${currentType} found for the given IDs.`);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch data");
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchMemberList();
  }, [currentType]);

  return (
    <div className="page--content">
      <div className=" flex items-end justify-between gap-2 mb-6">
        <div className="title--breadcrumbs">
          <p className="text-sm">{`Home > ${
            currentType === "member" ? "Members" : "Leads"
          } > All ${
            currentType === "member" ? "Members" : "Leads"
          } > Send Mail`}</p>
          <h1 className="text-3xl font-semibold">Send Mail</h1>
        </div>
      </div>
      <div className="w-full p-3 border bg-white shadow-box rounded-[10px]">
        {/* ✅ Regular form tag using formik.handleSubmit */}
        <form onSubmit={formik.handleSubmit}>
          <p className="text-lg font-[600] text-black mb-3">Send Mail To</p>

          <div className="flex items-start flex-wrap gap-2 border-[#c5c5c5] border-[0.5px] p-[10px] rounded-[10px] mb-3 min-h-[50px] max-h-[120px] overflow-auto">
            {formik.values.send_to.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-1 border rounded-full bg-[#EEEEEE] min-h-[30px] px-3 text-sm"
              >
                <span>{item.full_name}</span>
                <IoClose
                  onClick={() => handleRemoveFilter(item.id)}
                  className="cursor-pointer text-xl"
                />
              </div>
            ))}
          </div>

          {/* Validation for send_to */}
          {formik.errors.send_to && (
            <p className="text-red-500 text-sm -mt-2 mb-2">
              {formik.errors.send_to}
            </p>
          )}

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
                  // onChange={(option) =>
                  //   formik.setFieldValue("selectedTemplate", option)
                  // }
                  onChange={handleTemplateSelect}
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
              className="px-4 py-2 bg-black text-white rounded flex items-center gap-2 mt-4"
            >
              Send Mail
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkEmailCriteriaForm;
