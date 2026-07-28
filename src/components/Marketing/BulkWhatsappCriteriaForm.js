import React, { useEffect, useMemo, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import { customStyles, formatText } from "../../Helper/helper";
import { toast } from "react-toastify";
import { IoClose } from "react-icons/io5";
import { authAxios } from "../../config/config";
import { useLocation, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";

const whatsappCategoryOption = [
  { label: "Marketing", value: "MARKETING" },
  { label: "Utility", value: "UTILITY" },
];

// ✅ Extract the unique {{n}} variable numbers used in a template body, in ascending order
const getTemplateVariables = (body) => {
  if (!body) return [];
  const matches = body.match(/\{\{\d+\}\}/g) || [];
  const unique = [...new Set(matches.map((m) => m.match(/\d+/)[0]))];
  return unique.sort((a, b) => Number(a) - Number(b));
};

// ✅ Validation Schema
const validationSchema = Yup.object({
  send_to: Yup.array().min(1, "Please select at least one recipient"),
  selectedTemplate: Yup.mixed().nullable().required("Please select a template"),
  scheduledAt: Yup.date()
    .nullable()
    .when("sendType", {
      is: "SCHEDULED",
      then: (schema) => schema.required("Schedule date & time is required"),
      otherwise: (schema) => schema.nullable(),
    }),
});

const BulkWhatsappCriteriaForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [templateOptions, setTemplateOptions] = useState([]);

  // ✅ CHANGE: category filter — drives which templates are available, same as
  // the main WhatsappCriteriaForm. null (not "") so react-select shows the placeholder.
  const [whatsappCategoryFilter, setWhatsappCategoryFilter] = useState(null);
  const [categoryTouched, setCategoryTouched] = useState(false);

  // ✅ NEW: is_editable flag per variable key, from the GET-by-ID template detail response
  const [templateVariablesMeta, setTemplateVariablesMeta] = useState([]);

  // ✅ NEW: preview-before-submit modal state
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Parse URL
  const params = new URLSearchParams(location.search);
  const currentType = params.get("type") || "member";
  const clubId = params.get("clubId") ? Number(params.get("clubId")) : null;
  const idsArray = params.get("ids")
    ? params.get("ids").split(",").map(Number)
    : [];

  // ✅ Formik
  const formik = useFormik({
    initialValues: {
      send_to: [],
      selectedTemplate: null,
      message: "",
      variables: {}, // ✅ NEW: holds { "1": "value", "2": "value" } for {{1}}, {{2}}, ...
      sendType: "NOW",
      scheduledAt: null,
      status: "",
    },
    validationSchema,
    // ✅ CHANGE: onSubmit no longer calls the API directly — it validates, checks
    // the category (which lives outside Formik), and opens the preview modal.
    // The actual API call now lives in submitCampaign(), triggered by "Confirm & Send".
    onSubmit: (values) => {
      if (!whatsappCategoryFilter) {
        setCategoryTouched(true);
        toast.error("Please select a category");
        return;
      }

      if (!values.send_to.length) {
        toast.error("No recipients found");
        return;
      }

      if (!clubId) {
        toast.error("Club is required");
        return;
      }

      setShowPreview(true);
    },
  });

  // ✅ NEW: builds the payload and calls the create API — called from the
  // preview modal's "Confirm & Send" button, not directly from the form.
  const submitCampaign = async (values) => {
    try {
      const ids = values.send_to.map((m) => m.id);

      const scheduledAt =
        values.sendType === "SCHEDULED" && values.scheduledAt
          ? values.scheduledAt
          : new Date();

      const formattedScheduledAt = scheduledAt
        .toLocaleString("sv-SE")
        .replace("T", " ");

      const selectedTemplate = values.selectedTemplate;

      // ✅ variables_json — skips non-editable variables entirely (they're never
      // sent, e.g. ['', 'cv'] -> ['cv']), in the same order they appear in the body
      const templateVariableKeys = getTemplateVariables(values.message);
      const editableKeys = templateVariableKeys.filter((key) => {
        const meta = templateVariablesMeta.find((m) => m.key === key);
        return meta ? meta.is_editable : true;
      });
      const variablesJson = editableKeys.map(
        (key) => values.variables?.[key] || "",
      );

      const payload = {
        club_id: clubId,
        campaign_name: "Personalize Campaign", // ✅ CHANGE: was "name"
        body_text: values.message, // ✅ CHANGE: was "body_html" (now plain text, not HTML)
        scheduled_at: formattedScheduledAt,
        // ✅ CHANGE: status reflects the "Schedule send" checkbox — SCHEDULED when
        // checked, SENT when sending immediately (was hardcoded to "SCHEDULED")
        status: values.sendType === "SCHEDULED" ? "SCHEDULED" : "SENT",
        member_ids: ids,
        // ✅ CHANGE: whatsapp_for instead of email_for
        whatsapp_for: currentType === "member" ? "MEMBER" : "LEAD",

        // ✅ CHANGE: template identifiers use the whatsapp_* keys instead of email_template_id
        ...(selectedTemplate?.value && {
          whatsapp_template_id: selectedTemplate.value,
        }),
        ...(selectedTemplate?.external_id && {
          whatsapp_external_id: selectedTemplate.external_id,
        }),
        ...(selectedTemplate?.template_name && {
          template_name: selectedTemplate.template_name,
        }),
        ...(selectedTemplate?.category && {
          category: selectedTemplate.category,
        }),
        // ✅ is_template — true when the selected template has a header, false otherwise
        is_template: selectedTemplate
          ? Boolean(selectedTemplate.header)
          : false,
        // ✅ variables_json — only sent when there's at least one editable {{n}} placeholder
        ...(editableKeys.length > 0 && { variables_json: variablesJson }),
      };

      setIsSubmitting(true);

      // ✅ CHANGE: endpoint moved from /emailcampaign/create to /whatsapp/campaign/create
      await authAxios().post("/whatsapp/campaign/create", payload);

      toast.success(
        values.sendType === "SCHEDULED"
          ? "Campaign scheduled successfully"
          : "Campaign sent successfully",
      );

      setShowPreview(false);
      formik.resetForm();
      navigate(currentType === "member" ? "/all-members" : "/all-leads", {
        replace: true,
      });
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ NEW: GET /whatsapp/templates/${template_id} — full template detail,
  // including header, is_template, and per-variable is_editable flags
  const fetchTemplateDetail = async (templateId) => {
    try {
      const res = await authAxios().get(`/whatsapp/templates/${templateId}`);
      return res.data?.data || null;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  // ✅ CHANGE: template list is now category-scoped (was a single flat
  // /emailtemplate/list fetched once on mount). It also always resets the
  // selected template/body/variables whenever the category changes.
  useEffect(() => {
    formik.setFieldValue("selectedTemplate", null);
    formik.setFieldValue("message", "");
    formik.setFieldValue("variables", {});
    setTemplateVariablesMeta([]);

    const categoryParam = whatsappCategoryFilter?.value;
    if (!categoryParam) {
      setTemplateOptions([]);
      return;
    }

    const fetchTemplates = async () => {
      try {
        const res = await authAxios().get(
          `/whatsapp/templates/list?category=${categoryParam}`,
        );
        const data = res.data?.data || [];

        const options = data.map((t) => ({
          value: t.template_id,
          label: formatText(t.template_name),
          template_name: t.template_name,
          body_html: t.body,
          external_id: t.external_id,
          category: t.category,
          header: t.header,
          is_template: t.is_template,
        }));
        setTemplateOptions(options);
      } catch (error) {
        console.log(error);
      }
    };
    fetchTemplates();
  }, [whatsappCategoryFilter]);

  // ✅ CHANGE: now async — fetches the full template detail (GET by ID) so we get
  // the authoritative header/is_template and each variable's is_editable + default value
  const handleTemplateSelect = async (option) => {
    formik.setFieldValue("selectedTemplate", option);
    formik.setFieldValue("variables", {});
    setTemplateVariablesMeta([]);

    if (!option) {
      formik.setFieldValue("message", "");
      return;
    }

    // Show the list-view body immediately, then refine once the detail call resolves
    formik.setFieldValue("message", option.body_html || "");

    const detail = await fetchTemplateDetail(option.value);
    if (!detail) return;

    formik.setFieldValue("message", detail.body || option.body_html || "");
    formik.setFieldValue("selectedTemplate", {
      ...option,
      header: detail.header,
      is_template: detail.is_template,
    });

    if (detail.variables?.length) {
      const meta = detail.variables.map((v) => ({
        key: v.key.match(/\d+/)[0],
        is_editable: v.is_editable,
      }));
      setTemplateVariablesMeta(meta);

      const initialVars = {};
      detail.variables.forEach((v) => {
        const num = v.key.match(/\d+/)[0];
        initialVars[num] = v.value || "";
      });
      formik.setFieldValue("variables", initialVars);
    }
  };

  // ✅ Remove recipient
  const handleRemoveFilter = (id) => {
    const updated = formik.values.send_to.filter((item) => item.id !== id);
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

        const filtered = list.filter((item) => idsArray.includes(item.id));

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

  const renderBodyWithVariables = (body) => {
    if (!body) return "--";

    const parts = body.split(/(\{\{\d+\}\})/g);

    return parts.map((part, idx) =>
      /^\{\{\d+\}\}$/.test(part) ? (
        <span
          key={idx}
          className="inline-block bg-[#E7F5EC] text-[#1F8A4C] font-medium px-1.5 py-0.5 rounded"
        >
          {part}
        </span>
      ) : (
        <span key={idx}>{part}</span>
      ),
    );
  };

  // ✅ NEW: variable numbers used by the currently selected template's body
  const templateVariables = useMemo(
    () => getTemplateVariables(formik.values.message),
    [formik.values.message],
  );

  // ✅ NEW: only the variables the template marks as editable — non-editable
  // ones (is_editable: false) are hidden from the form entirely
  const editableTemplateVariables = useMemo(
    () =>
      templateVariables.filter((key) => {
        const meta = templateVariablesMeta.find((m) => m.key === key);
        return meta ? meta.is_editable : true;
      }),
    [templateVariables, templateVariablesMeta],
  );

  // ✅ NEW: message with {{n}} placeholders swapped for the entered variable values,
  // used in the preview modal so the user sees exactly what will be sent
  const previewMessage = useMemo(() => {
    let text = formik.values.message || "";
    templateVariables.forEach((key) => {
      const value = formik.values.variables?.[key];
      text = text.replace(
        new RegExp(`\\{\\{${key}\\}\\}`, "g"),
        value ? value : `{{${key}}}`,
      );
    });
    return text;
  }, [formik.values.message, formik.values.variables, templateVariables]);

  const isSubmitDisabled =
    idsArray.length === 0 ||
    !clubId ||
    (formik.values.sendType === "SCHEDULED" && !formik.values.scheduledAt);

  return (
    <div className="page--content">
      <div className=" flex items-end justify-between gap-2 mb-6">
        <div className="title--breadcrumbs">
          <p className="text-sm">{`Home > ${
            currentType === "member" ? "Members" : "Leads"
          } > All ${
            currentType === "member" ? "Members" : "Leads"
          } > Send Whatsapp`}</p>
          <h1 className="text-3xl font-semibold">Send Whatsapp</h1>
        </div>
      </div>
      <div className="w-full p-3 border bg-white shadow-box rounded-[10px]">
        {/* ✅ Regular form tag using formik.handleSubmit */}
        <form onSubmit={formik.handleSubmit}>
          <p className="text-lg font-[600] text-black mb-3">
            Send Whatsapp To
          </p>

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

          {/* --- WHATSAPP TEMPLATE SECTION --- */}
          <div>
            <div className="grid grid-cols-2 gap-2">
              {/* Select Category */}
              <div>
                <label className="mb-2 block">
                  Select Category<span className="text-red-500">*</span>
                </label>
                <Select
                  placeholder="Select category"
                  value={whatsappCategoryFilter}
                  options={whatsappCategoryOption}
                  onChange={(option) => setWhatsappCategoryFilter(option)}
                  onBlur={() => setCategoryTouched(true)}
                  isClearable
                  styles={customStyles}
                />
                {categoryTouched && !whatsappCategoryFilter && (
                  <p className="text-red-500 text-sm mt-1">
                    Category is required
                  </p>
                )}
              </div>

              {/* Select Template */}
              <div>
                <label className="mb-2 block">
                  Select Template<span className="text-red-500">*</span>
                </label>
                <Select
                  value={formik.values.selectedTemplate}
                  onChange={handleTemplateSelect}
                  onBlur={() =>
                    formik.setFieldTouched("selectedTemplate", true)
                  }
                  options={templateOptions}
                  // ✅ CHANGE: template field disabled until a category is chosen
                  placeholder={
                    whatsappCategoryFilter
                      ? "Select template"
                      : "Select category first"
                  }
                  styles={customStyles}
                  isClearable
                  isDisabled={!whatsappCategoryFilter}
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
            <div className="mt-3">
              <label className="mb-2 block">Body</label>

              <div className="border border-[#c5c5c5] rounded-lg p-3 bg-gray-100">
                <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">
                  {renderBodyWithVariables(formik.values.message)}
                </p>
              </div>
            </div>

            {/* ✅ NEW: one input per editable {{n}} placeholder — non-editable ones are hidden */}
            {editableTemplateVariables.length > 0 && (
              <div className="mt-3">
                <label className="mb-2 block">Template Variables:</label>
                <div className="grid grid-cols-3 gap-2">
                  {editableTemplateVariables.map((key) => (
                    <div key={key}>
                      <label className="mb-1 block text-sm">{`{{${key}}}`}</label>
                      <input
                        type="text"
                        className="custom--input w-full"
                        value={formik.values.variables?.[key] || ""}
                        onChange={(e) =>
                          formik.setFieldValue(
                            `variables.${key}`,
                            e.target.value,
                          )
                        }
                        placeholder={`Value for {{${key}}}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

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

                        const roundTo15 = (d) => {
                          let minutes = d.getMinutes();
                          let rounded = Math.round(minutes / 15) * 15;

                          let hours = d.getHours();

                          if (rounded === 60) {
                            rounded = 0;
                            hours += 1;
                          }

                          d.setHours(hours, rounded, 0, 0);
                          return d;
                        };

                        const isToday =
                          selected.toDateString() === now.toDateString();

                        const isPastTime = selected.getTime() < now.getTime();

                        if (isToday && isPastTime) {
                          // move to next valid slot
                          let minutes = Math.ceil(now.getMinutes() / 15) * 15;
                          let hours = now.getHours();

                          if (minutes === 60) {
                            minutes = 0;
                            hours += 1;
                          }

                          selected.setHours(hours, minutes, 0, 0);
                        } else {
                          // snap user selection to nearest 15 min
                          roundTo15(selected);
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
                onClick={() => setCategoryTouched(true)}
                disabled={isSubmitDisabled}
                className="px-4 py-2 bg-black text-white rounded flex items-center gap-2 mt-4 disabled:opacity-50"
              >
                {/* ✅ CHANGE: this button now opens the preview modal instead of sending immediately */}
                Preview & Send
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ✅ NEW: preview-before-submit modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[10px] shadow-box w-full max-w-lg max-h-[90vh] overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Preview Campaign</h2>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                aria-label="Close preview"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex gap-6">
                <div>
                  <p className="text-xs text-gray-600">Sending To:</p>
                  <p className="font-medium">
                    {currentType === "member" ? "Members" : "Leads"} (
                    {formik.values.send_to.length})
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Send Time:</p>
                  <p className="font-medium">
                    {formik.values.sendType === "SCHEDULED" &&
                    formik.values.scheduledAt
                      ? formik.values.scheduledAt.toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "Immediately"}
                  </p>
                </div>
              </div>

              {formik.values.selectedTemplate && (
                <div>
                  <p className="text-xs text-gray-600">Template:</p>
                  <p className="font-medium">
                    {formatText(formik.values.selectedTemplate.template_name) || formatText(formik.values.selectedTemplate.label)}{" "}
                    {formik.values.selectedTemplate.category && (
                      <span className="text-gray-600 font-normal">
                        ({formatText(formik.values.selectedTemplate.category)})
                      </span>
                    )}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs text-gray-600 mb-1">
                  Message Preview:
                </p>
                <div className="border rounded p-3 bg-gray-50 whitespace-pre-line leading-relaxed">
                  {previewMessage || "--"}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 border rounded text-sm"
                disabled={isSubmitting}
              >
                Back to Edit
              </button>
              <button
                type="button"
                onClick={() => submitCampaign(formik.values)}
                className="px-4 py-2 bg-black text-white rounded text-sm disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Sending..."
                  : formik.values.sendType === "SCHEDULED"
                    ? "Confirm & Schedule"
                    : "Confirm & Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkWhatsappCriteriaForm;