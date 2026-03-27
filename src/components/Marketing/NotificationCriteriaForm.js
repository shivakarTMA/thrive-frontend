import React, { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import MemberEmailFilterPanel from "../FilterPanel/MemberEmailFilterPanel";
import {
  blockNonLettersAndNumbers,
  sanitizeTextWithNumbers,
} from "../../Helper/helper";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import { authAxios } from "../../config/config";
import { useNavigate, useParams } from "react-router-dom";

const NotificationCriteriaForm = () => {
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

  const { id } = useParams();
  const navigate = useNavigate();
  const [memberIds, setMemberIds] = useState([]);
  const [filterApplied, setFilterApplied] = useState(false);
  const [isFetchingCampaign, setIsFetchingCampaign] = useState(false);

  const validationSchema = Yup.object({
    heading: Yup.string().required("Heading is required"),

    name: Yup.string().required("Campaign Name is required"),

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
      body: Yup.string()
      .required("Message is required")
      .min(10, "Message must be at least 10 characters")
      .max(200, "Message cannot exceed 200 characters"),
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
      name: "",
      heading: "",
      body: "",
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
        name: values.name,
        heading: values.heading,
        body: values.body,
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
          await authAxios().put(`/notificationcampaign/${id}`, payload);
          toast.success("Notification updated successfully");
        } else {
          await authAxios().post("/notificationcampaign/create", payload);
          toast.success(
            values.sendType === "SCHEDULED"
              ? "Notification scheduled successfully"
              : "Notification sent successfully",
          );
        }

        navigate("/reports/marketing-reports/notification-list", { replace: true });
      } catch (error) {
        console.log(error)
      }
    },
  });

  // ✅ Fetch existing campaign data when editing
  useEffect(() => {
    if (!id) return;
    const fetchCampaign = async () => {
      setIsFetchingCampaign(true);
      try {
        const res = await authAxios().get(`/notificationcampaign/${id}`);
        const data = res.data?.data || res.data;

        // Core fields
        formik.setFieldValue("name", data.name || "");
        formik.setFieldValue("heading", data.heading || "");
        formik.setFieldValue("body", data.body || "");
        formik.setFieldValue("status", data.status || "");

        // ✅ Module / tab from email_for
        if (data.email_for) {
          const tab = data.email_for === "MEMBER" ? "Member" : "Enquiries";
          setActiveTab(tab);
          formik.setFieldValue("module", tab);
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
        console.log(error)
      } finally {
        setIsFetchingCampaign(false);
      }
    };
    fetchCampaign();
  }, [id]);

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

              <>
              {memberIds.length > 0  ? (
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
              ):null}
              </>
             
            )}

            <div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-2 block">
                    Campaign Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="custom--input w-full"
                    value={formik.values.name}
                    // onChange={formik.handleChange}
                    onKeyDown={blockNonLettersAndNumbers}
                    onChange={(e) => {
                      const cleaned = sanitizeTextWithNumbers(e.target.value);
                      formik.setFieldValue("name", cleaned);
                    }}
                    onBlur={formik.handleBlur}
                    placeholder="Enter Campaign"
                  />
                  {formik.touched.name &&
                    formik.errors.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.name}
                      </p>
                    )}
                </div>

                <div>
                  <label className="mb-2 block">
                    Heading<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="heading"
                    className="custom--input w-full"
                    value={formik.values.heading}
                    // onChange={formik.handleChange}
                    onKeyDown={blockNonLettersAndNumbers}
                    onChange={(e) => {
                      const cleaned = sanitizeTextWithNumbers(e.target.value);
                      formik.setFieldValue("heading", cleaned);
                    }}
                    onBlur={formik.handleBlur}
                    placeholder="Enter heading"
                  />
                  {formik.touched.heading && formik.errors.heading && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.heading}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-2 block">
                    Message<span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="body"
                    className="custom--input w-full h-[150px] resize-none"
                    value={formik.values.body}
                    // onChange={formik.handleChange}
                    onKeyDown={blockNonLettersAndNumbers}
                    onChange={(e) => {
                      const cleaned = sanitizeTextWithNumbers(e.target.value);
                      formik.setFieldValue("body", cleaned);
                    }}
                    onBlur={formik.handleBlur}
                    placeholder="Enter Message"
                  />
                {formik.touched.body && formik.errors.body && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.body}
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
                      // onChange={(date) => {
                      //   if (!date) return;

                      //   const now = new Date();
                      //   const selected = new Date(date);

                      //   if (selected.toDateString() === now.toDateString()) {
                      //     // Today: round to next 15-min interval
                      //     const minutes = Math.ceil(now.getMinutes() / 15) * 15;
                      //     selected.setHours(now.getHours(), minutes, 0, 0);
                      //   } else {
                      //     // Future date: default time 09:00 AM
                      //     selected.setHours(0, 0, 0, 0);
                      //   }

                      //   formik.setFieldValue("scheduledAt", selected);
                      // }}
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

                        const isPastTime =
                          selected.getTime() < now.getTime();

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

export default NotificationCriteriaForm;
