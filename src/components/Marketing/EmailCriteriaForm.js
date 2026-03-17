import React, { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import MemberEmailFilterPanel from "../FilterPanel/MemberEmailFilterPanel";
import {
  allowOnlyLetters,
  blockNonLetters,
  customStyles,
} from "../../Helper/helper";
import RichTextEditor from "../common/RichTextEditor";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import { authAxios } from "../../config/config";
import { useNavigate, useParams } from "react-router-dom";
import { sanitizeHtml } from "../../Helper/sanitizeHtml";

const EmailCriteriaForm = () => {
  const [activeTab, setActiveTab] = useState("Member");
  const [isFilterDirty, setIsFilterDirty] = useState(false);

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
  const [isFetchingCampaign, setIsFetchingCampaign] = useState(false);
  const [templateOptions, setTemplateOptions] = useState([]);

  const validationSchema = Yup.object({
    subject: Yup.string().required("Subject is required"),

    campaign_name: Yup.string().required("Campaign Name is required"),

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

    // filterLeadValidity: id
    //   ? Yup.mixed().nullable()
    //   : Yup.mixed().when("module", {
    //       is: "Enquiries",
    //       then: (schema) => schema.required("Validity is required"),
    //       otherwise: (schema) => schema.nullable(),
    //     }),

    sendType: Yup.string().oneOf(["NOW", "SCHEDULED"]),
    scheduledAt: Yup.date()
      .nullable()
      .when("sendType", {
        is: "SCHEDULED",
        then: (schema) => schema.required("Schedule date & time is required"),
        otherwise: (schema) => schema.nullable(),
      }),
    message: Yup.string()
      .test(
        "not-empty",
        "Message is required",
        (value) => value && value.replace(/<[^>]+>/g, "").trim().length > 0,
      )
      .required("Message is required"),
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
      sendType: "NOW",
      scheduledAt: null,
      status: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      if (hasFilterErrors) {
        toast.error("Please complete all filter criteria");
        return;
      }

      // Block submission if filter returned no recipients
      if (!id && memberIds.length === 0) {
        toast.error("No users found with this criteria.");
        return;
      }

      const scheduledAt =
        values.sendType === "SCHEDULED" && values.scheduledAt
          ? values.scheduledAt
          : new Date();

      // Format to local time: "2026-03-10 10:00:00"
      const formattedScheduledAt = scheduledAt
        .toLocaleString("sv-SE")
        .replace("T", " ");

      const payload = {
        email_template_id: values.selectedTemplate?.value || null,
        name: values.campaign_name,
        subject: values.subject,
        body_html: values.message,
        scheduled_at: formattedScheduledAt,
        status: "SCHEDULED",
        member_ids: memberIds,
        email_for: values.module === "Member" ? "MEMBER" : "LEAD", // ✅ module → email_for

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

      try {
        if (id) {
          await authAxios().put(`/emailcampaign/${id}`, payload);
          toast.success("Campaign updated successfully");
        } else {
          await authAxios().post("/emailcampaign/create", payload);
          toast.success(
            values.sendType === "SCHEDULED"
              ? "Campaign scheduled successfully"
              : "Campaign sent successfully",
          );
        }

        navigate("/reports/marketing-reports/email-list", { replace: true });
      } catch (error) {
        toast.error(error?.response?.data?.message || "Something went wrong");
      }
    },
  });

  // ✅ Fetch existing campaign data when editing
  useEffect(() => {
    if (!id) return;
    const fetchCampaign = async () => {
      setIsFetchingCampaign(true);
      try {
        const res = await authAxios().get(`/emailcampaign/${id}`);
        const data = res.data?.data || res.data;

        // Core fields
        formik.setFieldValue("campaign_name", data.name || "");
        formik.setFieldValue("subject", data.subject || "");
        formik.setFieldValue("message", data.body_html || "");
        formik.setFieldValue("status", data.status || "");

        // ✅ Module / tab from email_for
        if (data.email_for) {
          const tab = data.email_for === "MEMBER" ? "Member" : "Enquiries";
          setActiveTab(tab);
          formik.setFieldValue("module", tab);
        }

        // ✅ Template
        if (data.email_template_id) {
          formik.setFieldValue("selectedTemplate", {
            value: data.email_template_id,
            label: data.template_name,
          });
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

        // validity maps to member or lead validity based on email_for
        // if (data.validity) {
        //   if (data.email_for === "MEMBER") {
        //     formik.setFieldValue("filterMemberValidity", data.validity ? data.validity : "All Members");
        //   } else {
        //     formik.setFieldValue("filterLeadValidity", data.validity ? data.validity : "");
        //   }
        // }

        if (data.email_for === "MEMBER") {
          formik.setFieldValue(
            "filterMemberValidity",
            data.validity || "All Members",
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
        toast.error("Failed to load campaign data");
      } finally {
        setIsFetchingCampaign(false);
      }
    };
    fetchCampaign();
  }, [id]);

  // ✅ Fetch templates and pre-match label once both are ready
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

        // ✅ If editing and selectedTemplate was pre-filled with a placeholder label,
        // replace it with the real label from the fetched list
        const currentTemplate = formik.values.selectedTemplate;
        if (currentTemplate) {
          const matched = options.find(
            (o) => o.value === currentTemplate.value,
          );
          if (matched) formik.setFieldValue("selectedTemplate", matched);
        }
      } catch {
        toast.error("Failed to fetch email templates");
      }
    };
    fetchTemplates();
  }, []);

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

  const hasFilterErrors = filterFields.some(
    (field) => formik.touched[field] && formik.errors[field],
  );

  useEffect(() => {
    const hasAnyFilterValue = filterFields.some(
      (field) => formik.values[field] !== null && formik.values[field] !== "",
    );
    setIsFilterDirty(hasAnyFilterValue);
  }, [formik.values, setIsFilterDirty]);

  const handleTemplateSelect = (option) => {
    formik.setFieldValue("selectedTemplate", option);
    if (option) {
      formik.setFieldValue("subject", option.subject || "");
      formik.setFieldValue("message", option.body_html || "");
    }
  };

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
                      ${activeTab === item ? "btn--tab" : ""}`}
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
              <div
                className={`mb-3 px-3 py-2 rounded text-sm border ${
                  memberIds.length > 0
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-red-50 border-red-200 text-red-600"
                }`}
              >
                {memberIds.length > 0 ? (
                  <>
                    📧 This campaign will be sent to{" "}
                    <strong>{memberIds.length}</strong>{" "}
                    {formik.values.module === "Member"
                      ? "member"
                      : "enquiry(ies)"}
                    {memberIds.length !== 1 ? "s" : ""}.
                  </>
                ) : (
                  <>
                    ⚠️ No{" "}
                    {formik.values.module === "Member"
                      ? "members"
                      : "enquiries"}{" "}
                    found for the selected criteria. Please adjust your filters.
                  </>
                )}
              </div>
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
                    className="custom--input w-full"
                    value={formik.values.campaign_name}
                    // onChange={formik.handleChange}
                    onKeyDown={blockNonLetters}
                    onChange={(e) => {
                      const cleaned = allowOnlyLetters(e.target.value);
                      formik.setFieldValue("campaign_name", cleaned);
                    }}
                    onBlur={formik.handleBlur}
                    placeholder="Enter Campaign"
                  />
                  {formik.touched.campaign_name &&
                    formik.errors.campaign_name && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.campaign_name}
                      </p>
                    )}
                </div>

                <div>
                  <label className="mb-2 block">Select Email Template</label>
                  <Select
                    value={formik.values.selectedTemplate}
                    onChange={handleTemplateSelect}
                    options={templateOptions}
                    placeholder="Select template"
                    styles={customStyles}
                    isClearable
                  />
                </div>

                <div>
                  <label className="mb-2 block">
                    Subject<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="subject"
                    className="custom--input w-full"
                    value={formik.values.subject}
                    // onChange={formik.handleChange}
                    onKeyDown={blockNonLetters}
                    onChange={(e) => {
                      const cleaned = allowOnlyLetters(e.target.value);
                      formik.setFieldValue("subject", cleaned);
                    }}
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

              <div className="mt-4">
                <RichTextEditor
                  ref={editorRef}
                  value={formik.values.message}
                  label="Message"
                  // onChange={(content) =>
                  //   formik.setFieldValue("message", content)
                  // }
                  onChange={(content) => {
                    formik.setFieldValue("message", sanitizeHtml(content));
                    formik.setFieldTouched("message", true);
                  }}
                  placeholder="Enter your email message..."
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
                      onChange={(date) =>
                        formik.setFieldValue("scheduledAt", date)
                      }
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

              {formik.values.status !== "SENT" && (
                <button
                  type="submit"
                  disabled={
                    hasFilterErrors ||
                    (!id && memberIds.length === 0) ||
                    (formik.values.sendType === "SCHEDULED" &&
                      !formik.values.scheduledAt)
                  }
                  className="px-4 py-2 bg-black text-white rounded flex items-center gap-2 mt-4 disabled:opacity-50"
                >
                  {id
                    ? "Send Email"
                    : formik.values.sendType === "SCHEDULED"
                      ? "Schedule Email"
                      : "Send Email"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmailCriteriaForm;
