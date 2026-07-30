import React, { useEffect, useMemo, useRef, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import MemberEmailFilterPanel from "../FilterPanel/MemberEmailFilterPanel";
import {
  allowOnlyLetters,
  blockNonLetters,
  blockNonLettersAndNumbers,
  customStyles,
  formatText,
  sanitizeTextWithNumbers,
} from "../../Helper/helper";
import RichTextEditor from "../common/RichTextEditor";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import { authAxios } from "../../config/config";
import { useNavigate, useParams } from "react-router-dom";
import { sanitizeHtml } from "../../Helper/sanitizeHtml";

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

const WhatsappCriteriaForm = () => {
  const [activeTab, setActiveTab] = useState("Member");
  const [isFilterDirty, setIsFilterDirty] = useState(false);
  // ✅ CHANGE: null instead of "" — react-select expects null/undefined for an empty value
  const [whatsappCategoryFilter, setWhatsappCategoryFilter] = useState(null);

  const tabs = ["Member", "Enquiries"];

  const handleTabClick = (tab) => {
    if (isFilterDirty) {
      toast.warning("Please clear filter criteria before switching tabs");
      return;
    }
    setActiveTab(tab);
  };

  const editorRef = useRef(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const [memberIds, setMemberIds] = useState([]);
  const [filterApplied, setFilterApplied] = useState(false);
  const [criteria, setCriteria] = useState([]);
  const [isFetchingCampaign, setIsFetchingCampaign] = useState(false);
  const [templateOptions, setTemplateOptions] = useState([]);
  // ✅ NEW: is_editable flag per variable key, from the GET-by-ID template detail response
  const [templateVariablesMeta, setTemplateVariablesMeta] = useState([]);
  // ✅ NEW: preview-before-submit modal state
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // ✅ NEW: when set, the category effect skips its "reset template/message/variables"
  // step — used when we set the category filter programmatically while loading an
  // existing campaign, so it doesn't wipe out the template/variables we just loaded
  // ✅ NEW: whatsappCategoryFilter lives outside Formik, so it needs its own
  // touched/error tracking for validation (Formik can't validate it directly)
  const [categoryTouched, setCategoryTouched] = useState(false);
  const skipCategoryResetRef = useRef(false);

  const validationSchema = Yup.object({
    campaign_name: Yup.string().required("Campaign Name is required"),

    // ✅ NEW: template selection is now required
    selectedTemplate: Yup.mixed()
      .nullable()
      .required("Please select a template"),

    filterClub: id
      ? Yup.mixed().nullable()
      : Yup.mixed().nullable().required("Club is required"),

    filterMemberValidity: id
      ? Yup.mixed().nullable()
      : Yup.mixed().when("module", {
          is: "Member",
          then: (schema) => schema.required("Validity is required"),
          otherwise: (schema) => schema.nullable(),
        }),

    sendType: Yup.string().oneOf(["NOW", "SCHEDULED"]),
    scheduledAt: Yup.date()
      .nullable()
      .when("sendType", {
        is: "SCHEDULED",
        then: (schema) => schema.required("Schedule date & time is required"),
        otherwise: (schema) => schema.nullable(),
      }),
  });

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

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      module: activeTab,
      selectedTemplate: null,
      message: "",
      variables: {}, // ✅ NEW: holds { "1": "value", "2": "value" } for {{1}}, {{2}}, ...
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
      sendType: "NOW",
      scheduledAt: null,
      status: "",
    },
    validationSchema,
    // ✅ CHANGE: onSubmit no longer calls the API directly — it just validates and
    // opens the preview modal. The actual API call now lives in submitCampaign(),
    // triggered by the "Confirm & Send" button inside the preview modal.
    onSubmit: (values) => {
      // ✅ NEW: category is local state, not a Formik field, so it needs its own check
      if (!whatsappCategoryFilter) {
        setCategoryTouched(true);
        toast.error("Please select a category");
        return;
      }

      if (hasFilterErrors) {
        toast.error("Please complete all filter criteria");
        return;
      }

      // Block submission if filter returned no recipients
      if (!id && memberIds.length === 0) {
        toast.error("No users found with this criteria.");
        return;
      }

      setShowPreview(true);
    },
  });

  // ✅ NEW: builds the payload and calls the create/update API — called from the
  // preview modal's "Confirm & Send" button, not directly from the form.
  const submitCampaign = async (values) => {
    const scheduledAt =
      values.sendType === "SCHEDULED" && values.scheduledAt
        ? values.scheduledAt
        : new Date();

    // Format to local time: "2026-03-10 10:00:00"
    const formattedScheduledAt = scheduledAt
      .toLocaleString("sv-SE")
      .replace("T", " ");

    const selectedTemplate = values.selectedTemplate;

    // ✅ CHANGE: variables_json now skips non-editable variables entirely instead of
    // sending them as empty-string placeholders, e.g. ['', 'cv'] -> ['cv']
    const templateVariableKeys = getTemplateVariables(values.message);
    const editableKeys = templateVariableKeys.filter((key) => {
      const meta = templateVariablesMeta.find((m) => m.key === key);
      return meta ? meta.is_editable : true;
    });
    const variablesJson = editableKeys.map(
      (key) => values.variables?.[key] || "",
    );

    const payload = {
      campaign_name: values.campaign_name, // ✅ CHANGE: was "name"
      body_text: values.message, // ✅ CHANGE: was "body_html"
      scheduled_at: formattedScheduledAt,
      // ✅ CHANGE: status now reflects the "Schedule send" checkbox —
      // SCHEDULED when checked, SENT when sending immediately (was hardcoded to "SCHEDULED")
      status: values.sendType === "SCHEDULED" ? "SCHEDULED" : "SENT",
      member_ids: memberIds,
      whatsapp_for: values.module === "Member" ? "MEMBER" : "LEAD",
      criteria, // ✅ human-readable filter labels for the campaign

      // ✅ CHANGE: template identifiers now use the whatsapp_* keys instead of email_template_id
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
      is_template: selectedTemplate ? Boolean(selectedTemplate.header) : false,
      // ✅ variables_json — only sent when there's at least one editable {{n}} placeholder
      ...(editableKeys.length > 0 && {
        variables_json: variablesJson,
      }),

      // Filter fields
      ...(values.filterClub && { club_id: values.filterClub }),
      ...(values.filterAgeGroup && { age_group: values.filterAgeGroup }),
      ...(values.filterGender && { gender: values.filterGender }),
      ...(values.filterServiceType && {
        service_type: values.filterServiceType,
      }),
      ...(values.filterServiceName && {
        service_name: values.filterServiceName,
      }),
      ...(values.filterLeadSource && {
        lead_source: values.filterLeadSource,
      }),
      ...(values.filterExpiryFrom && {
        membership_expiry_from: values.filterExpiryFrom
          .toISOString()
          .slice(0, 10),
      }),
      ...(values.filterExpiryTo && {
        membership_expiry_to: values.filterExpiryTo
          .toISOString()
          .slice(0, 10),
      }),

      // validity: send whichever is relevant based on module
      ...(values.module === "Member" &&
      values.filterMemberValidity &&
      values.filterMemberValidity !== "All Members"
        ? { validity: values.filterMemberValidity }
        : {}),

      ...(values.module === "Enquiries" && values.filterLeadValidity
        ? { validity: values.filterLeadValidity }
        : {}),
    };

    setIsSubmitting(true);
    try {
      if (id) {
        await authAxios().put(`/whatsapp/campaign/${id}`, payload);
        toast.success("Campaign updated successfully");
      } else {
        await authAxios().post("/whatsapp/campaign/create", payload);
        toast.success(
          values.sendType === "SCHEDULED"
            ? "Campaign scheduled successfully"
            : "Campaign sent successfully",
        );
      }

      setShowPreview(false);
      navigate("/whatsapp-template-list", { replace: true });
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Fetch existing campaign data when editing
  useEffect(() => {
    if (!id) return;
    const fetchCampaign = async () => {
      setIsFetchingCampaign(true);
      try {
        const res = await authAxios().get(`/whatsapp/campaign/${id}`);
        const data = res.data?.data || res.data;

        // Core fields — ✅ CHANGE: campaign_name / body_text instead of name / body_html
        formik.setFieldValue("campaign_name", data.campaign_name || "");
        formik.setFieldValue("message", data.body_text || "");
        formik.setFieldValue("status", data.status || "");

        // ✅ Module / tab from whatsapp_for
        if (data.whatsapp_for) {
          const tab = data.whatsapp_for === "MEMBER" ? "Member" : "Enquiries";
          setActiveTab(tab);
          formik.setFieldValue("module", tab);
        }

        // ✅ NEW: reflect the campaign's category in the category dropdown too.
        // Flagged via skipCategoryResetRef so the category-change effect (below)
        // fetches the template list for this category without wiping out the
        // template/message/variables we're about to load from whatsapp_template_id.
        if (data.category) {
          const matchedCategory = whatsappCategoryOption.find(
            (o) => o.value === data.category,
          );
          if (matchedCategory) {
            skipCategoryResetRef.current = true;
            setWhatsappCategoryFilter(matchedCategory);
          }
        }

        // ✅ CHANGE: Template — read from whatsapp_template_id / whatsapp_external_id / category
        if (data.whatsapp_template_id) {
          formik.setFieldValue("selectedTemplate", {
            value: data.whatsapp_template_id,
            label: formatText(data.template_name),
            template_name: data.template_name,
            body_html: data.body_text,
            external_id: data.whatsapp_external_id,
            category: data.category,
            is_template: data.is_template,
          });

          // ✅ NEW: GET the template by ID to learn which variables are editable,
          // then merge that with the campaign's own saved variables_json values
          const detail = await fetchTemplateDetail(data.whatsapp_template_id);
          if (detail?.variables?.length) {
            const meta = detail.variables.map((v) => ({
              key: v.key.match(/\d+/)[0],
              is_editable: v.is_editable,
            }));
            setTemplateVariablesMeta(meta);

            // ✅ FIX: variables_json only stores values for editable variables
            // (non-editable ones are skipped entirely on save — see submitCampaign),
            // so it must be matched positionally against just the editable subset
            // of detail.variables, not the full list. Matching against the full
            // list here caused values to shift onto the wrong {{n}} once any
            // variable was non-editable, e.g. saved ["wyryr"] landing on {{1}}
            // instead of the actual editable slot it belongs to.
            const editableVariables = detail.variables.filter(
              (v) => v.is_editable,
            );
            const savedValues = Array.isArray(data.variables_json)
              ? data.variables_json
              : [];

            const variableValues = {};
            detail.variables.forEach((v) => {
              const num = v.key.match(/\d+/)[0];
              if (v.is_editable) {
                const editableIdx = editableVariables.indexOf(v);
                variableValues[num] =
                  savedValues[editableIdx] ?? v.value ?? "";
              } else {
                // non-editable — always use the template's own default, never variables_json
                variableValues[num] = v.value || "";
              }
            });
            formik.setFieldValue("variables", variableValues);
          } else if (Array.isArray(data.variables_json) && data.body_text) {
            // Fallback if the template detail call fails: we have no is_editable info here,
            // so this assumes every {{n}} in the body is editable and lines up 1:1 with
            // variables_json — fine as a fallback, but won't be accurate if any variable
            // is actually non-editable.
            const varKeys = getTemplateVariables(data.body_text);
            const variableValues = {};
            varKeys.forEach((key, idx) => {
              variableValues[key] = data.variables_json[idx] ?? "";
            });
            formik.setFieldValue("variables", variableValues);
          }
        }

        // ✅ Schedule
        if (data.scheduled_at) {
          formik.setFieldValue("sendType", "SCHEDULED");
          formik.setFieldValue("scheduledAt", new Date(data.scheduled_at));
        }

        // ✅ member_ids
        if (data.member_ids) {
          setMemberIds(data.member_ids);
        }

        // ✅ Filter fields — map API response → formik filter fields
        if (data.club_id) formik.setFieldValue("filterClub", data.club_id);

        if (data.whatsapp_for === "MEMBER") {
          formik.setFieldValue(
            "filterMemberValidity",
            data.validity || "",
          );
        } else {
          formik.setFieldValue("filterLeadValidity", data.validity || "");
        }

        if (data.age_group)
          formik.setFieldValue("filterAgeGroup", data.age_group);
        if (data.gender) formik.setFieldValue("filterGender", data.gender);
        if (data.service_type)
          formik.setFieldValue("filterServiceType", data.service_type);
        if (data.service_name)
          formik.setFieldValue("filterServiceName", data.service_name);
        if (data.lead_source)
          formik.setFieldValue("filterLeadSource", data.lead_source);
        if (data.membership_expiry_from)
          formik.setFieldValue(
            "filterExpiryFrom",
            new Date(data.membership_expiry_from),
          );
        if (data.membership_expiry_to)
          formik.setFieldValue(
            "filterExpiryTo",
            new Date(data.membership_expiry_to),
          );
      } catch (error) {
        console.log(error);
      } finally {
        setIsFetchingCampaign(false);
      }
    };
    fetchCampaign();
  }, [id]);

  // ✅ CHANGE: template list only loads once a category is selected (was: fetched
  // once on mount with no category, then only refetched on later category changes).
  // Also always resets the selected template/body/variables when the category changes,
  // instead of only when the previous template no longer matches the new list.
  useEffect(() => {
    // ✅ CHANGE: skip the reset when this category change came from loading an
    // existing campaign (see skipCategoryResetRef above) — otherwise this would
    // immediately wipe out the template/message/variables we just loaded
    if (skipCategoryResetRef.current) {
      skipCategoryResetRef.current = false;
    } else {
      formik.setFieldValue("selectedTemplate", null);
      formik.setFieldValue("message", "");
      formik.setFieldValue("variables", {});
      setTemplateVariablesMeta([]);
    }

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

  const resetFilters = () => {
    filterFields.forEach((field) => {
      formik.setFieldValue(field, null);
      formik.setFieldTouched(field, false);
    });
  };

  useEffect(() => {
    resetFilters();
    setCriteria([]);
    formik.setFieldValue("module", activeTab);
  }, [activeTab]);

  const hasFilterErrors = filterFields.some(
    (field) => formik.touched[field] && formik.errors[field],
  );

  useEffect(() => {
    const hasAnyFilterValue = filterFields.some(
      (field) => formik.values[field] !== null && formik.values[field] !== "",
    );
    setIsFilterDirty(hasAnyFilterValue);
  }, [formik.values, setIsFilterDirty]);

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


  const editMode = formik.values.status === "SENT";

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

  if (isFetchingCampaign) {
    return (
      <div className="w-full p-6 border bg-white shadow-box rounded-[10px] flex items-center justify-center">
        <p className="text-gray-500">Loading campaign...</p>
      </div>
    );
  }

  return (
    <div className="flexs">
      <aside className="w-full">
        <div className="mt-6 flex flex-wrap items-center">
          <div className="mt-0 flex items-center border-b border-b-[#D4D4D4] overflow-auto buttons--overflow pr-6 w-full">
            {tabs.map((item, index) => (
              <div
                key={index}
                onClick={() => handleTabClick(item)}
                className={`w-fit min-w-[fit-content] cursor-pointer
                      ${activeTab === item ? "btn--tab" : ""} ${editMode ? "!pointer-events-none !cursor-not-allowed" : ""}`}
              >
                <div className="px-5 py-3 z-[1] relative text-[15px] font-[500]">
                  {item}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <div className="mt-4">
        <div className="w-full p-3 border bg-white shadow-box rounded-[10px]">
          <form onSubmit={formik.handleSubmit}>
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
                onMemberIdsFetched={(ids) => {
                  setMemberIds(ids);
                  setFilterApplied(true);
                }}
                onCriteriaChange={setCriteria}
                editMode={editMode}
              />
            </div>

            {hasFilterErrors && (
              <div className="mb-3 flex gap-2 flex-wrap">
                <p className="text-sm font-[500]">
                  Please Select the Criteria:
                </p>
                {filterFields.map((field, index) =>
                  formik.touched[field] && formik.errors[field] ? (
                    <p key={field} className="text-red-500 text-sm">
                      {formik.errors[field]}
                      {index < filterFields.length - 1 ? "," : ""}
                    </p>
                  ) : null,
                )}
              </div>
            )}

            {/* ✅ Recipient count message — shown after filter is applied */}
            {!id && filterApplied && (
              <>
                {memberIds.length > 0 ? (
                  <div
                    className={`mb-3 px-3 py-2 rounded text-sm border bg-green-50 border-green-200 text-green-700`}
                  >
                    This campaign will be sent to{" "}
                    <strong>{memberIds.length}</strong>{" "}
                    {formik.values.module === "Member"
                      ? "member"
                      : "enquiry(ies)"}
                    {memberIds.length !== 1 ? "s" : ""}.
                  </div>
                ) : null}
              </>
            )}

            <div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="mb-2 block">
                    Campaign Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="campaign_name"
                    value={formik.values.campaign_name}
                    onKeyDown={blockNonLettersAndNumbers}
                    onChange={(e) => {
                      const cleaned = sanitizeTextWithNumbers(e.target.value);
                      formik.setFieldValue("campaign_name", cleaned);
                    }}
                    onBlur={formik.handleBlur}
                    placeholder="Enter Campaign"
                    className={`custom--input w-full ${editMode ? "!bg-gray-100" : ""}`}
                    disabled={editMode}
                  />
                  {formik.touched.campaign_name &&
                    formik.errors.campaign_name && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.campaign_name}
                      </p>
                    )}
                </div>

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
                    isDisabled={editMode}
                  />
                  {categoryTouched && !whatsappCategoryFilter && (
                    <p className="text-red-500 text-sm mt-1">
                      Category is required
                    </p>
                  )}
                </div>
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
                    isDisabled={editMode || !whatsappCategoryFilter}
                  />
                  {formik.touched.selectedTemplate &&
                    formik.errors.selectedTemplate && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.selectedTemplate}
                      </p>
                    )}
                </div>
              </div>

              <div className="mt-3">
                <label className="mb-2 block">Body</label>

                <div className="border border-[#c5c5c5] rounded-lg p-3 bg-gray-100">
                  <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">
                    {renderBodyWithVariables(formik.values.message)}
                  </p>
                </div>
              </div>

              {/* ✅ CHANGE: only editable {{n}} placeholders are shown here — non-editable ones are hidden */}
              {editableTemplateVariables.length > 0 && (
                <div className="mt-3">
                  <label className="mb-2 block">Template Variables:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {editableTemplateVariables.map((key) => (
                      <div key={key}>
                        <label className="mb-1 block text-sm">{`{{${key}}}`}</label>
                        <input
                          type="text"
                          className={`custom--input w-full ${editMode ? "!bg-gray-100" : ""}`}
                          value={formik.values.variables?.[key] || ""}
                          onChange={(e) =>
                            formik.setFieldValue(
                              `variables.${key}`,
                              e.target.value,
                            )
                          }
                          placeholder={`Value for {{${key}}}`}
                          disabled={editMode}
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
                    disabled={editMode}
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
                      className={`custom--input w-full ${editMode ? "!bg-gray-100" : ""}`}
                      disabled={editMode}
                    />
                    {formik.errors.scheduledAt && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.scheduledAt}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {!editMode && (
                <button
                  type="submit"
                  onClick={() => setCategoryTouched(true)}
                  disabled={
                    hasFilterErrors ||
                    (!id && memberIds.length === 0) ||
                    (formik.values.sendType === "SCHEDULED" &&
                      !formik.values.scheduledAt)
                  }
                  className="px-4 py-2 bg-black text-white rounded flex items-center gap-2 mt-4 disabled:opacity-50"
                >
                  {/* ✅ CHANGE: this button now opens the preview modal (via formik's
                      onSubmit) instead of sending immediately */}
                  Preview & Send
                </button>
              )}
            </div>
          </form>
        </div>
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
              <div>
                <p className="text-xs text-gray-600">Campaign Name:</p>
                <p className="font-medium">{formik.values.campaign_name}</p>
              </div>

              <div className="flex gap-6">
                <div>
                  <p className="text-xs text-gray-600">Sending To:</p>
                  <p className="font-medium">
                    {formik.values.module === "Member" ? "Members" : "Enquiries"}{" "}
                    ({memberIds.length})
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

export default WhatsappCriteriaForm;