import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "react-phone-number-input/style.css";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import {
  FaMale,
  FaFemale,
  FaUser,
  FaEnvelope,
  FaBuilding,
  FaBirthdayCake,
} from "react-icons/fa";
import {
  trainerAvailability,
  companies,
  // leadSubTypes,
} from "../DummyData/DummyData";

import {
  convertToISODate,
  customStyles,
  getCompanyNameById,
  sanitizePayload,
  selectIcon,
} from "../Helper/helper";
import { IoBan, IoCloseCircle } from "react-icons/io5";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import ConfirmUnderAge from "../components/modal/ConfirmUnderAge";
import { FaCalendarDays, FaListCheck, FaLocationDot } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { fetchOptionList } from "../Redux/Reducers/optionListSlice";
import { apiAxios, authAxios } from "../config/config";

// Trainer assignment options
const assignTrainers = [
  { value: "shivakar", label: "Shivakar" },
  { value: "nitin", label: "Nitin" },
  { value: "esha", label: "Esha" },
  { value: "apporva", label: "Apporva" },
];

// Lead source types
const leadSourceTypes = [
  { value: "Facebook", label: "Facebook" },
  { value: "Instagram", label: "Instagram" },
  { value: "Others", label: "Others" },
];

const validationSchema = Yup.object({
  full_name: Yup.string().required("Full Name is required"),
  mobile: Yup.string()
    .required("Contact number is required")
    .test("is-valid-phone", "Invalid phone number", function (value) {
      const { country_code } = this.parent;
      if (!value || !country_code) return false;
      const phoneNumber = parsePhoneNumberFromString(
        "+" + country_code + value
      );
      return phoneNumber?.isValid() || false;
    }),
  lead_source: Yup.string().required("Lead Source is required"),
  lead_type: Yup.string().required("Lead Type is required"),
  platform: Yup.string().when("lead_source", {
    is: (val) => ["Social Media", "Events/Campaigns"].includes(val),
    then: () => Yup.string().required("This is required"),
  }),
  schedule: Yup.string().nullable(),
  schedule_date_time: Yup.date().when("schedule", {
    is: (val) => val === "Tour" || val === "Trial",
    then: (schema) => schema.required("Date & Time is required"),
  }),
  staff_name: Yup.string().when("schedule", {
    is: (val) => val === "Tour" || val === "Trial",
    then: (schema) => schema.required("Staff Name is required"),
  }),
});

const CreateLeadForm = ({ setLeadModal, selectedLead }) => {
  // Local state management
  const [allLeads, setAllLeads] = useState([]);
  const leadBoxRef = useRef(null);
  const [matchingUsers, setMatchingUsers] = useState([]);
  const now = new Date();
  const [showUnderageModal, setShowUnderageModal] = useState(false);
  const [pendingDob, setPendingDob] = useState(null);
  const [duplicateError, setDuplicateError] = useState("");
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateEmailError, setDuplicateEmailError] = useState("");
  const [showDuplicateEmailModal, setShowDuplicateEmailModal] = useState(false);
  const [hasDismissedDuplicateModal, setHasDismissedDuplicateModal] =
    useState(false);
  const [companyOptions, setCompanyOptions] = useState([]);

  // Fetch companies
  const fetchCompanies = async (search = "") => {
    try {
      const res = await apiAxios().get("/company/list", {
        params: search ? { search } : {},
      });
      const data = res.data?.data || [];
      const options = data.map((company) => ({
        value: company.id,
        label: company.name,
      }));
      setCompanyOptions(options);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch companies");
    }
  };

  // Fetch leads
  const fetchLeadList = async () => {
    try {
      const res = await apiAxios().get("/lead/list");
      let data = res.data?.data || res.data || [];
      setAllLeads(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch lead");
    }
  };

  // Initial load effect
  useEffect(() => {
    fetchCompanies();
    fetchLeadList();
  }, []);

  // Redux state
  const dispatch = useDispatch();
  const { lists, loading } = useSelector((state) => state.optionList);

  // Fetch option lists
  useEffect(() => {
    dispatch(fetchOptionList("LEAD_SOURCE"));
    dispatch(fetchOptionList("LEAD_TYPE"));
    dispatch(fetchOptionList("INTERESTED_IN"));
  }, [dispatch]);

  // Extract Redux lists
  const leadsSources = lists["LEAD_SOURCE"] || [];
  const leadTypes = lists["LEAD_TYPE"] || [];
  const servicesName = lists["INTERESTED_IN"] || [];

  // ✅ Initial form values
  const initialValues = {
    id: "",
    full_name:"",
    mobile: "",
    country_code: "",
    phoneFull: "",
    email: "",
    gender: "",
    date_of_birth: "",
    address: "",
    location: "",
    company_name: "",
    otherCompanyName: "",
    interested_in: "",
    lead_source: "",
    lead_type: "",
    platform: "",
    schedule: "",
    schedule_date_time: "",
    staff_name: "",
  };

  // ✅ Formik hook
  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true, // 👈 ensures selectedLead values re-populate
    onSubmit: async (values) => {
      if (duplicateError || duplicateEmailError) {
        setShowDuplicateModal(!!duplicateError);
        setShowDuplicateEmailModal(!!duplicateEmailError);
        return;
      }

      let companyName = "";
      let payload = {};
      try {
        if (values.company_name === "OTHER" && values.otherCompanyName) {
          // Create new company if Other selected
          const formData = new FormData();
          formData.append("name", values.otherCompanyName);
          const res = await apiAxios().post("/company/create", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          companyName = res.data?.name || values.otherCompanyName;
          const { otherCompanyName, ...rest } = values;
          payload = { ...rest, company_name: companyName };
        } else {
          // Use existing company
          companyName = getCompanyNameById(
            companyOptions,
            values.company_name,
            values.otherCompanyName
          );
          const { otherCompanyName, ...rest } = values;
          payload = { ...rest, company_name: companyName };
        }

        // ✅ Normalize dates
        payload.date_of_birth = values.date_of_birth
          ? new Date(values.date_of_birth).toISOString().split("T")[0] // YYYY-MM-DD
          : "";

        payload.schedule_date_time = values.schedule_date_time
          ? new Date(values.schedule_date_time).toISOString()
          : "";

        console.log(values, "valuesshivakar");

        // ✅ Update if id exists
        if (values.id) {
          await apiAxios().put(`/lead/${values.id}`, payload); // 👈 FIXED
          toast.success("Lead updated successfully!");
        } else {
          await authAxios().post("/lead/create", payload);
          toast.success("Lead created successfully!");
        }

        setLeadModal(false);
      } catch (err) {
        console.error("❌ API Error:", err.response?.data || err.message);
        toast.error("Something went wrong while saving lead!");
      }
    },
  });

  useEffect(() => {
    console.log(selectedLead, "dddde");
    if (selectedLead) {
      formik.setValues({
        id: selectedLead.id || "",
        full_name: selectedLead.full_name || "",
        mobile: selectedLead.mobile || "",
        country_code: selectedLead.country_code || "",
        phoneFull: selectedLead.country_code
          ? `+${selectedLead.country_code}${selectedLead.mobile}`
          : "",
        email: selectedLead.email || "",
        gender: selectedLead.gender || "",
        date_of_birth: selectedLead.date_of_birth
          ? new Date(selectedLead.date_of_birth).toISOString() // always ISO string
          : "",
        address: selectedLead.address || "",
        location: selectedLead.location || "",
        company_name: selectedLead.company_name || "",
        interested_in: selectedLead.interested_in || "",
        lead_source: selectedLead.lead_source || "",
        lead_type: selectedLead.lead_type || "",
        platform: selectedLead.platform || "",
        schedule: selectedLead.schedule || "",
        schedule_date_time: selectedLead.schedule_date_time
          ? new Date(selectedLead.schedule_date_time).toISOString()
          : "",
        staff_name: selectedLead.staff_name || "",
      });
    }
  }, [selectedLead]);

  const handleDobChange = (date) => {
    if (!date) return;
    const today = new Date();
    const age =
      today.getFullYear() -
      date.getFullYear() -
      (today < new Date(date.setFullYear(today.getFullYear())) ? 1 : 0);

    if (age < 15) {
      toast.error("Age must be at least 15 years");
      return;
    }
    if (age >= 15 && age < 18) {
      setPendingDob(date.toISOString());
      setShowUnderageModal(true);
    } else {
      formik.setFieldValue("date_of_birth", date.toISOString()); // store ISO string
    }
  };

  const fifteenYearsAgo = new Date();
  fifteenYearsAgo.setFullYear(fifteenYearsAgo.getFullYear() - 15);

  const confirmDob = () => {
    formik.setFieldValue("date_of_birth", pendingDob);
    setShowUnderageModal(false);
    setPendingDob(null);
  };

  const cancelDob = () => {
    formik.setFieldValue("date_of_birth", "");
    setShowUnderageModal(false);
    setPendingDob(null);
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    formik.setFieldValue(name, value);
  };

  // DateTime picker -> save as UTC ISO (with Z)
  const handleDateTrainerChange = (val) => {
    if (!val) return;
    formik.setFieldValue("schedule_date_time", val.toISOString());
  };
  // Staff select -> just the value/id
  const handleSelectSchedule = (_, selectedOption) => {
    formik.setFieldValue("staff_name", selectedOption?.value ?? "");
  };

  const minTime = new Date();
  minTime.setHours(6, 0, 0, 0); // Earliest selectable time = 6:00 AM

  const maxTime = new Date();
  maxTime.setHours(22, 0, 0, 0);

  const handlePhoneChange = (value) => {
    formik.setFieldValue("phoneFull", value);
    if (!value) {
      formik.setFieldValue("mobile", "");
      formik.setFieldValue("country_code", "");
      return;
    }
    const phoneNumber = parsePhoneNumberFromString(value);
    if (phoneNumber) {
      formik.setFieldValue("mobile", phoneNumber.nationalNumber);
      formik.setFieldValue("country_code", phoneNumber.countryCallingCode);
    }
  };

  const handlePhoneBlur = () => {
    const { mobile, country_code } = formik.values;
    if (!mobile || !country_code) return;
    const inputCode = country_code.replace("+", "");
    const inputMobile = mobile.replace(/\s/g, "");
    const matches = allLeads.filter((user) => {
      const userCode = (user.country_code || "").replace("+", "");
      const userMobile = (user.mobile || "").replace(/\s/g, "");
      return userCode === inputCode && userMobile === inputMobile;
    });
    setMatchingUsers(matches);
    if (matches.length > 0) {
      setDuplicateError("This phone number already exists");
      if (!hasDismissedDuplicateModal) {
        setShowDuplicateModal(true);
      }
    } else {
      setDuplicateError("");
      setShowDuplicateModal(false);
    }
  };

  const handleEmailBlur = () => {
    const inputValue = formik.values.email?.trim().toLowerCase();
    if (inputValue) {
      const matches = allLeads.filter(
        (user) => user.email?.trim().toLowerCase() === inputValue
      );
      if (matches.length > 0) {
        setDuplicateEmailError("This email already exists");
        if (!hasDismissedDuplicateModal) {
          setShowDuplicateEmailModal(true);
        }
      } else {
        setDuplicateEmailError("");
      }
    }
  };

  const getAvailableTrainers = () => {
    const dt = formik.values.schedule_date_time;
    if (!dt) return [];

    const selected = new Date(dt);
    if (isNaN(selected)) return [];

    return assignTrainers.filter((trainer) =>
      trainerAvailability[trainer.value]?.some((slot) => {
        const slotDt = new Date(slot.date_time);
        return slotDt.getTime() === selected.getTime();
      })
    );
  };

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      setLeadModal(false);
    }
  };

  const handleLeadModal = () => {
    setLeadModal(false);
  };

  // useEffect(() => {
  //   console.log("Selected lead:", selectedLead);
  // }, [selectedLead]);

  return (
    <>
      <div
        className="bg--blur create--lead--container overflow-auto hide--overflow fixed top-0 left-0 z-[999] w-full bg-black bg-opacity-60 h-full"
        onClick={handleOverlayClick}
      >
        <div
          className="min-h-[70vh]  w-[95%] max-w-5xl mx-auto mt-[100px] mb-[100px] container--leadbox rounded-[10px] flex flex-col"
          ref={leadBoxRef}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-t-[10px] flex gap-3 items-center justify-between py-4 px-4 border-b">
            <h2 className="text-xl font-semibold">
              {selectedLead ? "Edit Lead" : "Create a Lead"}
            </h2>
            <div
              className="close--lead cursor-pointer"
              onClick={handleLeadModal}
            >
              <IoCloseCircle className="text-3xl" />
            </div>
          </div>

          <div className="flex-1s flexs ">
            <form onSubmit={formik.handleSubmit}>
              <div div className="flex bg-white rounded-b-[10px]">
                <div className="p-6 flex-1">
                  <h3 className="text-2xl font-semibold mb-2">
                    Personal Details
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="relative">
                      <label className="mb-2 block">
                        Contact Number
                        <span className="text-red-500">*</span>
                      </label>
                      <PhoneInput
                        name="phoneFull"
                        value={formik.values.phoneFull} // 👈 use phoneFull for UI binding
                        onChange={handlePhoneChange}
                        onBlur={handlePhoneBlur}
                        international
                        defaultCountry="IN"
                        countryCallingCodeEditable={false}
                        className="custom--input w-full custom--phone"
                      />

                      {duplicateError && showDuplicateModal && (
                        <div className="text-red-500 text-sm">
                          Duplicate Entry
                        </div>
                      )}

                      {formik.errors?.mobile && formik.touched?.mobile && (
                        <div className="text-red-500 text-sm">
                          {formik.errors.mobile}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="mb-2 block">
                        Full Name<span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                          <FaUser />
                        </span>
                        <input
                          name="full_name"
                          value={formik.values.full_name}
                          onChange={formik.handleChange}
                          className="custom--input w-full input--icon"
                        />
                      </div>
                      {formik.errors?.full_name &&
                        formik.touched?.full_name && (
                          <div className="text-red-500 text-sm">
                            {formik.errors.full_name}
                          </div>
                        )}
                    </div>

                    <div>
                      <label className="mb-2 block">Email</label>
                      <div className="relative">
                        <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                          <FaEnvelope />
                        </span>
                        <input
                          type="email"
                          name="email"
                          value={formik.values.email}
                          onChange={formik.handleChange}
                          onBlur={handleEmailBlur}
                          className="custom--input w-full input--icon"
                        />
                      </div>
                      {duplicateEmailError && showDuplicateEmailModal && (
                        <div className="text-red-500 text-sm">
                          Duplicate email entry
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="mb-2 block">DOB</label>

                      <div className="custom--date dob-format relative">
                        <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                          <FaBirthdayCake />
                        </span>
                        <DatePicker
                          selected={
                            formik.values.date_of_birth
                              ? new Date(formik.values.date_of_birth) // convert back to Date here
                              : null
                          }
                          onChange={handleDobChange}
                          showMonthDropdown
                          showYearDropdown
                          dropdownMode="select"
                          maxDate={fifteenYearsAgo}
                          dateFormat="dd MMM yyyy"
                          yearDropdownItemNumber={100}
                          placeholderText="Select date"
                          className="input--icon"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block font-medium text-gray-700">
                        Gender
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        <label
                          className={`flex items-center gap-2 px-4 py-2 rounded-[10px] border cursor-pointer shadow-sm transition
                          ${
                            formik.values.gender === "MALE"
                              ? "bg-black text-white border-black"
                              : "bg-white text-gray-700 border-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="gender"
                            value="MALE"
                            checked={formik.values.gender === "MALE"}
                            onChange={formik.handleChange}
                            className="hidden"
                          />
                          <FaMale />
                          Male
                        </label>

                        <label
                          className={`flex items-center gap-2 px-4 py-2 rounded-[10px] border cursor-pointer shadow-sm transition
                          ${
                            formik.values.gender === "FEMALE"
                              ? "bg-black text-white border-black"
                              : "bg-white text-gray-700 border-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="gender"
                            value="FEMALE"
                            checked={formik.values.gender === "FEMALE"}
                            onChange={formik.handleChange}
                            className="hidden"
                          />
                          <FaFemale />
                          Female
                        </label>
                        <label
                          className={`flex items-center gap-2 px-4 py-2 rounded-[10px] border cursor-pointer shadow-sm transition
                          ${
                            formik.values.gender === "NOTDISCLOSE"
                              ? "bg-black text-white border-black"
                              : "bg-white text-gray-700 border-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="gender"
                            value="NOTDISCLOSE"
                            checked={formik.values.gender === "NOTDISCLOSE"}
                            onChange={formik.handleChange}
                            className="hidden"
                          />
                          <IoBan />
                          Not to Disclose
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block">Company</label>
                      <div className="relative">
                        <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                          <FaBuilding />
                        </span>

                        <Select
                          name="company_name"
                          value={
                            companyOptions.find(
                              (opt) => opt.value === formik.values.company_name
                            ) ||
                            (formik.values.company_name === "OTHER" && {
                              value: "OTHER",
                              label: "Other",
                            }) ||
                            (formik.values.company_name && {
                              value: formik.values.company_name,
                              label: formik.values.company_name,
                            }) // ✅ fallback for raw string
                          }
                          onChange={(option) => {
                            if (option.value === "OTHER") {
                              // Keep OTHER so Select shows it
                              formik.setFieldValue("company_name", "OTHER");
                            } else {
                              formik.setFieldValue(
                                "company_name",
                                option.value
                              );
                            }
                          }}
                          options={[
                            ...companyOptions,
                            { value: "OTHER", label: "Other" },
                          ]}
                          isLoading={loading}
                          styles={selectIcon}
                        />
                      </div>
                    </div>

                    {/* Show input only when OTHER is chosen */}
                    {formik.values.company_name === "OTHER" && (
                      <div>
                        <label className="mb-2 block">Add Company Name</label>
                        <div className="relative">
                          <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                            <FaBuilding />
                          </span>
                          <input
                            type="text"
                            className="custom--input w-full input--icon"
                            value={formik.values.otherCompanyName || ""}
                            onChange={(e) =>
                              formik.setFieldValue(
                                "otherCompanyName",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    )}

                    <div className="col-span-2">
                      <label className="mb-2 block">Address</label>
                      <div className="relative">
                        <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                          <FaLocationDot />
                        </span>
                        <input
                          name="address"
                          value={formik.values.address}
                          onChange={formik.handleChange}
                          className="custom--input w-full input--icon"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block">Location</label>
                      <div className="relative">
                        <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                          <FaLocationDot />
                        </span>
                        <input
                          name="location"
                          value={formik.values.location}
                          onChange={formik.handleChange}
                          className="custom--input w-full input--icon"
                        />
                      </div>
                    </div>
                  </div>

                  <hr className="my-3 mt-5" />

                  <h3 className="text-2xl font-semibold mb-2">
                    Lead Information
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="mb-2 block">Interested In</label>
                      <div className="relative">
                        <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                          <FaListCheck />
                        </span>
                        <Select
                          name="interested_in"
                          value={servicesName.find(
                            (opt) => opt.value === formik.values.interested_in
                          )}
                          onChange={(option) =>
                            formik.setFieldValue("interested_in", option.value)
                          }
                          options={servicesName}
                          styles={selectIcon}
                          className="pl-[]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block">
                        Lead Type<span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                          <FaListCheck />
                        </span>
                        <Select
                          name="lead_type"
                          value={leadTypes.find(
                            (opt) => opt.value === formik.values.lead_type
                          )}
                          onChange={(option) =>
                            formik.setFieldValue("lead_type", option.value)
                          }
                          options={leadTypes}
                          styles={selectIcon}
                        />
                      </div>
                      {formik.errors?.lead_type &&
                        formik.touched?.lead_type && (
                          <div className="text-red-500 text-sm">
                            {formik.errors.lead_type}
                          </div>
                        )}
                    </div>

                    <div>
                      <label className="mb-2 block">
                        Lead Source<span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                          <FaListCheck />
                        </span>
                        <Select
                          name="lead_source"
                          value={leadsSources.find(
                            (opt) => opt.value === formik.values.lead_source
                          )}
                          onChange={(option) =>
                            formik.setFieldValue("lead_source", option.value)
                          }
                          options={leadsSources}
                          styles={selectIcon}
                        />
                      </div>
                      {formik.errors?.lead_source &&
                        formik.touched?.lead_source && (
                          <div className="text-red-500 text-sm">
                            {formik.errors.lead_source}
                          </div>
                        )}
                    </div>

                    {formik.values.lead_source === "Social Media" && (
                      <div>
                        <label className="mb-2 block">
                          Lead Sub-Source
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                            <FaListCheck />
                          </span>
                          <Select
                            name="platform"
                            value={leadSourceTypes.find(
                              (opt) => opt.value === formik.values.platform
                            )}
                            onChange={(option) =>
                              formik.setFieldValue("platform", option.value)
                            }
                            options={leadSourceTypes}
                            styles={selectIcon}
                          />
                        </div>
                        {formik.errors?.platform &&
                          formik.touched?.platform && (
                            <div className="text-red-500 text-sm">
                              {formik.errors.platform}
                            </div>
                          )}
                      </div>
                    )}

                    {formik.values.lead_source === "Events/Campaigns" && (
                      <div>
                        <label className="mb-2 block">
                          Lead Sub-Source
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                            <FaListCheck />
                          </span>
                          <input
                            type="text"
                            name="platform"
                            value={formik.values.platform}
                            onChange={formik.handleChange}
                            className="custom--input w-full input--icon "
                          />
                        </div>
                        {formik.errors?.platform &&
                          formik.touched?.platform && (
                            <div className="text-red-500 text-sm">
                              {formik.errors.platform}
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                  {!selectedLead && (
                    <>
                      <hr className="my-3 mt-5" />

                      <h3 className="text-2xl font-semibold mb-2">Schedule</h3>
                      <div>
                        <div className="grid grid-cols-3 gap-4 mt-4">
                          {/* Schedule Radio */}
                          <div>
                            <label className="mb-2 block">Schedule</label>
                            <div className="flex gap-4">
                              <label className="custom--radio">
                                Tour
                                <input
                                  type="radio"
                                  name="schedule"
                                  value="Tour"
                                  checked={formik.values.schedule === "Tour"}
                                  onChange={handleInput}
                                  className="w-4 h-4 mr-1"
                                />
                                <span className="radio-checkmark"></span>
                              </label>
                              <label className="custom--radio">
                                Trial
                                <input
                                  type="radio"
                                  name="schedule"
                                  value="Trial"
                                  checked={formik.values.schedule === "Trial"}
                                  onChange={handleInput}
                                  className="w-4 h-4 mr-1"
                                />
                                <span className="radio-checkmark"></span>
                              </label>
                            </div>
                          </div>

                          {/* Date & Time Picker */}
                          <div>
                            <label className="mb-2 block">
                              Date & Time
                              {formik.values.schedule === "Trial" ||
                              formik.values.schedule === "Tour" ? (
                                <span className="text-red-500">*</span>
                              ) : (
                                ""
                              )}
                            </label>
                            <div className="custom--date flex-1">
                              <span className="absolute z-[1] mt-[15px] ml-[15px]">
                                <FaCalendarDays />
                              </span>
                              <DatePicker
                                selected={
                                  formik.values.schedule_date_time
                                    ? new Date(formik.values.schedule_date_time)
                                    : null
                                }
                                onChange={handleDateTrainerChange}
                                showTimeSelect
                                timeFormat="hh:mm aa"
                                dateFormat="MMMM d, yyyy hh:mm aa"
                                placeholderText="Select date & time"
                                className="border px-3 py-2 w-full input--icon"
                                minDate={now}
                                minTime={minTime}
                                maxTime={maxTime}
                                disabled={!formik.values.schedule}
                              />
                            </div>
                            {formik.touched.schedule_date_time &&
                              formik.errors.schedule_date_time && (
                                <p className="text-sm text-red-500 mt-1">
                                  {formik.errors.schedule_date_time}
                                </p>
                              )}
                          </div>

                          {/* Staff Name */}
                          <div className="mb-4">
                            <label className="mb-2 block">
                              Staff Name
                              {formik.values.schedule === "Trial" ||
                              formik.values.schedule === "Tour" ? (
                                <span className="text-red-500">*</span>
                              ) : (
                                ""
                              )}
                            </label>
                            <div className="relative">
                              <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                                <FaListCheck />
                              </span>
                              <Select
                                name="staff_name"
                                value={
                                  assignTrainers.find(
                                    (opt) =>
                                      opt.value === formik.values.staff_name
                                  ) || null
                                }
                                onChange={(option) =>
                                  handleSelectSchedule("staff_name", option)
                                }
                                options={getAvailableTrainers()}
                                placeholder="Select available trainer"
                                styles={selectIcon}
                                isDisabled={!formik.values.schedule}
                              />
                            </div>

                            {formik.values.schedule &&
                              formik.values.schedule_date_time &&
                              !getAvailableTrainers().length && (
                                <p className="text-sm text-red-500 mt-1">
                                  No trainers available at this date and time.
                                </p>
                              )}

                            {formik.touched.staff_name &&
                              formik.errors.staff_name && (
                                <p className="text-sm text-red-500 mt-1">
                                  {formik.errors.staff_name}
                                </p>
                              )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className={`flex gap-4 py-5 justify-end`}>
                <button
                  type="button"
                  onClick={handleLeadModal}
                  className="px-4 py-2 bg-transparent border border-white text-white font-semibold rounded max-w-[150px] w-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-white text-black font-semibold rounded max-w-[150px] w-full"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {showUnderageModal && (
        <ConfirmUnderAge
          title="Underage Confirmation"
          message="This lead is a minor (under 18 years old). Do you still wish to proceed?"
          onConfirm={confirmDob}
          onCancel={cancelDob}
        />
      )}
    </>
  );
};

export default CreateLeadForm;
