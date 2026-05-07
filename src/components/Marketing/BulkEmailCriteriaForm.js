import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import { customStyles } from "../../Helper/helper";
import RichTextEditor from "../common/RichTextEditor";
import { toast } from "react-toastify";
import { IoClose } from "react-icons/io5";
import { authAxios } from "../../config/config";
import { useLocation, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import { sanitizeHtml } from "../../Helper/sanitizeHtml";

// ✅ Validation Schema
const validationSchema = Yup.object({
  send_to: Yup.array().min(1, "Please select at least one recipient"),
  subject: Yup.string().required("Subject is required"),
  message: Yup.string()
    .test(
      "not-empty",
      "Message is required",
      (value) =>
        value && value.replace(/<[^>]+>/g, "").trim().length > 0
    )
    .required("Message is required"),
  scheduledAt: Yup.date().nullable().when("sendType", {
    is: "SCHEDULED",
    then: (schema) => schema.required("Schedule date & time is required"),
    otherwise: (schema) => schema.nullable(),
  }),
});

const BulkEmailCriteriaForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [templateOptions, setTemplateOptions] = useState([]);

  // ✅ Parse URL
  const params = new URLSearchParams(location.search);
  const currentType = params.get("type") || "member";
  const clubId = params.get("clubId")
    ? Number(params.get("clubId"))
    : null;
  const idsArray = params.get("ids")
    ? params.get("ids").split(",").map(Number)
    : [];

  // ✅ Formik
  const formik = useFormik({
    initialValues: {
      send_to: [],
      selectedTemplate: null,
      subject: "",
      message: "",
      sendType: "NOW",
      scheduledAt: null,
      status: "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const ids = values.send_to.map((m) => m.id);

        if (!ids.length) {
          toast.error("No recipients found");
          return;
        }

        if (!clubId) {
          toast.error("Club is required");
          return;
        }

        const scheduledAt =
          values.sendType === "SCHEDULED" && values.scheduledAt
            ? values.scheduledAt
            : new Date();

        const formattedScheduledAt = scheduledAt
          .toLocaleString("sv-SE")
          .replace("T", " ");

        const payload = {
          club_id: clubId,
          email_template_id: values.selectedTemplate?.value || null,
          name: "Personalize Campaign",
          subject: values.subject,
          body_html: sanitizeHtml(values.message),
          scheduled_at: formattedScheduledAt,
          status:"SCHEDULED",
          member_ids: ids,
          email_for:
            currentType === "member" ? "MEMBER" : "LEAD",
        };

        console.log("Final Payload:", payload);

        // ✅ API Call
        await authAxios().post("/emailcampaign/create", payload);

        toast.success(
          values.sendType === "SCHEDULED"
            ? "Campaign scheduled successfully"
            : "Email sent successfully"
        );

        resetForm();
        navigate(currentType === "member" ? "/all-members" : "/all-leads", {
          replace: true,
        });

      } catch (error) {
        console.log(error);
        toast.error("Something went wrong");
      }
    },
  });

  // ✅ Fetch Templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await authAxios().get("/emailtemplate/list");
        const data = res.data?.data || [];
        const options = data.map((t) => ({
          value: t.id,
          label: t.name,
          subject: t.subject,
          body_html: t.body_html,
        }));
        setTemplateOptions(options);
      } catch (error) {
        console.log(error);
      }
    };
    fetchTemplates();
  }, []);

  // ✅ Template select
  const handleTemplateSelect = (option) => {
    formik.setFieldValue("selectedTemplate", option);
    if (option) {
      formik.setFieldValue("subject", option.subject || "");
      formik.setFieldValue("message", option.body_html || "");
    }
  };

  // ✅ Remove recipient
  const handleRemoveFilter = (id) => {
    const updated = formik.values.send_to.filter(
      (item) => item.id !== id
    );
    formik.setFieldValue("send_to", updated);
  };

  // ✅ Fetch Members/Leads from API
  useEffect(() => {
    const fetchList = async () => {
      try {
        let list = [];

        if (currentType === "member") {
          const res = await authAxios().get("/member/list");
          list = res.data?.data || [];
        } else {
          const res = await authAxios().get("/lead/list");
          list = res.data?.data || [];
        }

        const filtered = list.filter((item) =>
          idsArray.includes(item.id)
        );

        formik.setFieldValue("send_to", filtered);

        if (!filtered.length) {
          toast.error("No recipients found for given IDs");
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchList();
  }, [currentType]);

const isSubmitDisabled =
  idsArray.length === 0 ||
  !clubId;

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
            <div className="grid grid-cols-2 gap-2">
              {/* Select Template */}
              <div>
                <label className="mb-2 block">Select Email Template</label>
                <Select
                  value={formik.values.selectedTemplate}
                  onChange={handleTemplateSelect}
                  options={templateOptions} // ✅ dynamic from API
                  placeholder="Select template"
                  styles={customStyles}
                  isClearable
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
                // onChange={(content) => formik.setFieldValue("message", content)}
                emitOnChange={true} 
                  onChange={(content) => {
                    // formik.setFieldValue("message", sanitizeHtml(content));
                    // formik.setFieldTouched("message", true);
                    formik.setFieldValue("message", content);
                    formik.setFieldTouched("message", true);
                  }}
                placeholder="Enter your email message..."
                height={400}
              />

              {formik.touched.message && formik.errors.message && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.message}
                </p>
              )}
            </div>

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
                    onChange={(date) => {
                      if (!date) return;

                      const now = new Date();
                      const selected = new Date(date);

                      if (selected.toDateString() === now.toDateString()) {
                        // Today: round to next 15-min interval
                        const minutes = Math.ceil(now.getMinutes() / 15) * 15;
                        selected.setHours(now.getHours(), minutes, 0, 0);
                      } else {
                        // Future date: default time 09:00 AM
                        selected.setHours(0, 0, 0, 0);
                      }

                      formik.setFieldValue("scheduledAt", selected);
                    }}
                    showTimeSelect
                    timeIntervals={15}
                    dateFormat="dd/MM/yyyy hh:mm aa"
                    minDate={new Date()} // disable past dates
                    minTime={
                      formik.values.scheduledAt &&
                      formik.values.scheduledAt.toDateString() ===
                        new Date().toDateString()
                        ? new Date() // today: minTime is now
                        : new Date(new Date().setHours(0, 0, 0, 0)) // future: start of day
                    }
                    maxTime={new Date(new Date().setHours(23, 45, 0, 0))} // end of day
                    onKeyDown={(e) => {
                      e.preventDefault();
                    }}
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

            {formik.values.status !== "SENT" && (
                <button
                  type="submit"
                  disabled={isSubmitDisabled}
                  className="px-4 py-2 bg-black text-white rounded flex items-center gap-2 mt-4 disabled:opacity-50"
                >
                  {formik.values.sendType === "SCHEDULED"
                    ? "Schedule Email"
                    : "Send Email"}
                </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkEmailCriteriaForm;
