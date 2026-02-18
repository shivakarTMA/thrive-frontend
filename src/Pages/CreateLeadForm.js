import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "react-phone-number-input/style.css";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import {
  parsePhoneNumberFromString,
  isPossiblePhoneNumber,
} from "libphonenumber-js";
import { FaUser, FaEnvelope, FaBuilding, FaBirthdayCake } from "react-icons/fa";
import { trainerAvailability } from "../DummyData/DummyData";

import { filterActiveItems, selectIcon } from "../Helper/helper";
import { IoBan, IoCloseCircle } from "react-icons/io5";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import ConfirmUnderAge from "../components/modal/ConfirmUnderAge";
import { FaCalendarDays, FaListCheck, FaLocationDot } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { fetchOptionList } from "../Redux/Reducers/optionListSlice";
import { authAxios, phoneAxios } from "../config/config";
import { PiGenderIntersexBold } from "react-icons/pi";
import CreatableSelect from "react-select/creatable";
import MultiSelect from "react-multi-select-component";

// Trainer assignment options
const assignTrainers = [
  { value: "shivakar", label: "Shivakar" },
  { value: "nitin", label: "Nitin" },
  { value: "esha", label: "Esha" },
  { value: "apporva", label: "Apporva" },
];

const genderOptions = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "NOTDISCLOSE", label: "Prefer Not To Say" },
];

const validationSchema = Yup.object({
  club_id: Yup.string().required("Club Name is required"),
  full_name: Yup.string().required("Full Name is required"),
  mobile: Yup.string()
    .required("Contact number is required")
    .test("is-valid-phone", "Invalid phone number", function (value) {
      const { country_code } = this.parent;
      if (!value || !country_code) return false;

      // Combine country code and number to full international format
      const phoneNumberString = `+${country_code}${value}`;

      // First check if the number is even possible (not just valid)
      if (!isPossiblePhoneNumber(phoneNumberString)) return false;

      // Parse and check validity strictly according to country
      const phoneNumber = parsePhoneNumberFromString(phoneNumberString);
      return phoneNumber?.isValid() || false;
    }),
  interested_in: Yup.array()
    .of(Yup.string())
    .min(1, "Please select at least one interest")
    .required("Please select at least one interest"),
  lead_source: Yup.string().required("Lead Source is required"),
  lead_type: Yup.string().required("Lead Type is required"),
  platform: Yup.string().when("lead_source", {
    is: (val) => ["Social Media", "Events/Campaigns"].includes(val),
    then: () => Yup.string().required("This is required"),
  }),
  schedule: Yup.string().nullable(),
  schedule_date_time: Yup.date().when("schedule", {
    is: (val) => val === "TOUR" || val === "TRIAL",
    then: (schema) => schema.required("Date & Time is required"),
  }),
  assigned_staff_id: Yup.string().when("schedule", {
    is: (val) => val === "TOUR" || val === "TRIAL",
    then: (schema) => schema.required("Trainer is required"),
  }),
});

const CreateLeadForm = ({
  setLeadModal,
  selectedLead,
  handleLeadUpdate,
  leadModalPage,
}) => {
  console.log("selectedLead", selectedLead);
  const leadBoxRef = useRef(null);
  const now = new Date();
  const [showUnderageModal, setShowUnderageModal] = useState(false);
  const [pendingDob, setPendingDob] = useState(null);
  const [duplicateError, setDuplicateError] = useState("");
  const [duplicateEmailError, setDuplicateEmailError] = useState("");
  const [showDuplicateEmailModal, setShowDuplicateEmailModal] = useState(false);
  const [companyOptions, setCompanyOptions] = useState([]);
  const { user } = useSelector((state) => state.auth);

  const [club, setClub] = useState([]);
  const [staffList, setStaffList] = useState([]);

  const [selected, setSelected] = useState([]);

  // Redux state
  const dispatch = useDispatch();
  const { lists, loading } = useSelector((state) => state.optionList);

  // Fetch option lists
  useEffect(() => {
    dispatch(fetchOptionList("LEAD_SOURCE"));
    dispatch(fetchOptionList("LEAD_TYPE"));
    dispatch(fetchOptionList("GOAL"));
    dispatch(fetchOptionList("SOCIAL_MEDIA"));
  }, [dispatch]);

  // Extract Redux lists
  const leadsSources = lists["LEAD_SOURCE"] || [];
  const leadTypes = lists["LEAD_TYPE"] || [];
  const servicesName = lists["GOAL"] || [];
  const socialList = lists["SOCIAL_MEDIA"] || [];

  const filteredLeadSources =
    selectedLead === "APP"
      ? leadsSources
      : leadsSources.filter((item) => item.value !== "APP");

  useEffect(() => {
    if (selectedLead) {
      formik.setFieldValue("lead_source", selectedLead);
    }
  }, [selectedLead]);

  // ✅ Initial form values
  const initialValues = {
    id: "",
    club_id: "",
    full_name: "",
    mobile: "",
    country_code: "",
    phoneFull: "",
    email: "",
    gender: "",
    date_of_birth: "",
    address: "",
    location: "",
    company_id: null,
    company_name: "",
    otherCompanyName: "",
    interested_in: [],
    lead_source: "",
    lead_type: "",
    platform: "",
    schedule: "",
    schedule_date_time: "",
    assigned_staff_id: "",
  };

  // ✅ Formik hook
  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true, // 👈 ensures selectedLead values re-populate
    
    onSubmit: async (values) => {
      if (duplicateError || duplicateEmailError) {
        setShowDuplicateEmailModal(!!duplicateEmailError);
        return;
      }

      try {
        // ===============================
        // ✅ COMPANY HANDLING (SOURCE OF TRUTH)
        // ===============================
        let companyId = null;
        let companyName = values.company_name?.trim() || "";

        const existingCompany = companyOptions.find(
          (opt) => opt.label.toLowerCase() === companyName.toLowerCase()
        );

        if (existingCompany) {
          companyId = existingCompany.value;
          companyName = existingCompany.label;
        } else if (companyName) {
          const formData = new FormData();
          formData.append("name", companyName);

          const res = await authAxios().post("/company/create", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          companyId = res.data.id;

          // ✅ IMPORTANT LINE
          companyName = res.data.name || companyName;

          setCompanyOptions((prev) => [
            ...prev,
            { value: companyId, label: companyName },
          ]);
        }

        // ===============================
        // ✅ BUILD PAYLOAD (NO FORMik RACE)
        // ===============================
        const payload = {
          ...values,

          // 🔒 OVERRIDE EXPLICITLY
          company_id: companyId,
          company_name: companyName,
        };

        // Remove interested_in if editing
        if (selectedLead) {
          delete payload.interested_in;
        }

        // Normalize dates
        payload.date_of_birth = values.date_of_birth
          ? new Date(values.date_of_birth).toISOString().split("T")[0]
          : null;

        payload.schedule_date_time = values.schedule_date_time
          ? new Date(values.schedule_date_time).toISOString()
          : null;

        // Normalize phone
        if (values.phoneFull) {
          const phoneNumber = parsePhoneNumberFromString(values.phoneFull);
          if (phoneNumber) {
            payload.country_code = phoneNumber.countryCallingCode;
            payload.mobile = phoneNumber.nationalNumber;
          }
        } else {
          payload.country_code = null;
          payload.mobile = null;
        }

        console.log("✅ FINAL PAYLOAD:", payload);

        console.log({
          typed: values.company_name,
          final: companyName,
        });

        // ===============================
        // ✅ API CALL
        // ===============================
        if (selectedLead) {
          await authAxios().put(`/lead/${selectedLead}`, payload);
          toast.success("Lead updated successfully!");
        } else {
          await authAxios().post("/lead/create", payload);
          toast.success("Lead created successfully!");
        }

        setLeadModal(false);
        leadModalPage && handleLeadUpdate();
      } catch (err) {
        console.error("❌ API Error:", err.response?.data || err.message);
        toast.error(err.response?.data?.message || err.message);
      }
    },
  });

  // ✅ Fetch lead details when selectedId changes
  useEffect(() => {
    if (!selectedLead) return;

    const fetchLeadById = async (id) => {
      try {
        const res = await authAxios().get(`/lead/${id}`);
        const data = res.data?.data || res.data || null;

        if (data) {
          const interestedList = Array.isArray(data.interested_in)
            ? data.interested_in.map((v) => ({ label: v, value: v }))
            : [];
          // ✅ Prefill formik fields with fetched data
          formik.setValues({
            // id: data.id || "",
            club_id: data.club_id || "",
            full_name: data.full_name || "",
            mobile: data.mobile || "",
            country_code: data.country_code || "",
            phoneFull: data.country_code
              ? `+${data.country_code}${data.mobile}` // add the "+"
              : "",
            email: data.email || "",
            gender: data.gender || "NOTDISCLOSE",
            date_of_birth: data.date_of_birth
              ? new Date(data.date_of_birth).toISOString()
              : null,
            address: data.address || "",
            location: data.location || "",
            // ✅ VERY IMPORTANT
            company_id: data.company_id || null,
            company_name: data.company_name || "",
            interested_in: interestedList.map((i) => i.value),
            lead_source: data.lead_source
              ? data.lead_source.charAt(0).toUpperCase() +
                data.lead_source.slice(1).toLowerCase()
              : "",
            lead_type: data.lead_type || "",
            platform: data.platform || "",
            schedule: data.schedule || "",
            schedule_date_time: data.schedule_date_time
              ? new Date(data.schedule_date_time).toISOString()
              : "",
            assigned_staff_id: data.assigned_staff_id || "",
          });

          setSelected(interestedList);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch module details");
      }
    };

    fetchLeadById(selectedLead);
  }, [selectedLead]);

  // Fetch companies
  // ✅ Fetch companies (only ACTIVE ones)
  const fetchCompanies = async (search = "") => {
    try {
      const res = await authAxios().get("/company/list", {
        params: search ? { search } : {},
      });

      // ✅ Extract company data safely
      const data = res.data?.data || [];

      // ✅ Filter only active companies
      const activeCompanies = data.filter(
        (company) => company.status === "ACTIVE"
      );

      // ✅ Convert to dropdown-friendly format
      const options = activeCompanies.map((company) => ({
        value: company.id,
        label: company.name,
      }));

      // ✅ Update state

      setCompanyOptions((prev) => {
        const map = new Map();

        [...prev, ...options].forEach((opt) => {
          map.set(opt.value, opt);
        });

        return Array.from(map.values());
      });
    } catch (err) {
      console.error("❌ Failed to fetch companies:", err);
      toast.error("Failed to fetch companies");
    }
  };

  // 🚀 Fetch staff list from API
  const fetchStaff = async () => {
    try {
      const schedule = formik.values?.schedule;

      let url = "/staff/list?role=TRAINER";

      if (schedule === "TOUR") {
        url = "/staff/list?role=TRAINER&role=FOH";
      } else if (schedule === "TRIAL") {
        url = "/staff/list?role=TRAINER";
      }

      const res = await authAxios().get(url);

      // ✅ FILTER ACTIVE STAFF HERE
      const staff = (res.data?.data || []).filter(
        (item) => String(item?.status).toUpperCase() === "ACTIVE"
      );

      const foh = staff
        .filter((item) => item.role === "FOH")
        .map((item) => ({
          value: item.id,
          label: item.name,
        }));

      const trainer = staff
        .filter((item) => item.role === "TRAINER")
        .map((item) => ({
          value: item.id,
          label: item.name,
        }));

      const groupedOptions = [];

      if (foh.length) {
        groupedOptions.push({
          label: "FOH",
          options: foh,
        });
      }

      if (trainer.length) {
        groupedOptions.push({
          label: "TRAINER",
          options: trainer,
        });
      }

      setStaffList(groupedOptions);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch staff");
    }
  };

  // Function to fetch club list
  const fetchClub = async () => {
    try {
      const response = await authAxios().get("/club/list");
      const data = response.data?.data || [];
      const activeOnly = filterActiveItems(data);
      setClub(activeOnly);
    } catch (error) {
      toast.error("Failed to fetch clubs");
    }
  };
  // Function to fetch role list

  // Initial load effect
  useEffect(() => {
    fetchCompanies();
    fetchStaff();
    fetchClub();
  }, [formik.values.schedule]);

  // Club dropdown options
  const clubOptions =
    club?.map((item) => ({
      label: item.name,
      value: item.id,
    })) || [];

  // Staff dropdown options
  const trainerOptions =
    staffList?.map((item) => ({
      label: item.name,
      value: item.id,
    })) || [];

  // const fifteenYearsAgo = new Date();
  // fifteenYearsAgo.setFullYear(fifteenYearsAgo.getFullYear() - 15);

  const fifteenYearsAgo = new Date();
  fifteenYearsAgo.setFullYear(fifteenYearsAgo.getFullYear() - 15);
  fifteenYearsAgo.setMonth(11); // December
  fifteenYearsAgo.setDate(31);

  // Handle manual date selection
  const handleDobChange = (date) => {
    if (!date) return;
    const today = new Date();
    const birthDate = new Date(date);
    const age =
      today.getFullYear() -
      date.getFullYear() -
      (today < new Date(birthDate.setFullYear(today.getFullYear())) ? 1 : 0);

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

  const minTime = new Date();
  minTime.setHours(6, 0, 0, 0); // Earliest selectable time = 6:00 AM

  const maxTime = new Date();
  maxTime.setHours(22, 0, 0, 0);

  const baseMinTime = new Date();
  baseMinTime.setHours(6, 0, 0, 0); // 6:00 AM

  const baseMaxTime = new Date();
  baseMaxTime.setHours(22, 0, 0, 0); // 10:00 PM

  const getMinTime = (selectedDate) => {
    if (!selectedDate) return baseMinTime;

    const isToday = selectedDate.toDateString() === now.toDateString();

    // If today → disable past times but still enforce 6 AM
    if (isToday) {
      const current = new Date();
      const dynamicTime = current.getHours() < 6 ? baseMinTime : current;

      return dynamicTime;
    }

    // For future dates → use normal 6 AM
    return baseMinTime;
  };

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
    formik.setFieldError("mobile", "");
  };

  const handlePhoneBlur = async () => {
    formik.setFieldTouched("phoneFull", true);

    const rawPhone = formik.values.phoneFull;
    if (!rawPhone) {
      formik.setFieldError("phoneFull", "Phone number is required");
      return;
    }

    const phoneNumber = parsePhoneNumberFromString(rawPhone);
    if (!phoneNumber || !phoneNumber.isValid()) {
      formik.setFieldError("phoneFull", "Invalid phone number");
      return;
    }

    const payload = {
      mobile: phoneNumber.nationalNumber,
    };

    try {
      // ✅ Use POST method
      const endpoint = selectedLead
        ? `/lead/verify/availability/${selectedLead}` // If lead is selected, use verification endpoint
        : "/lead/check/unique";

      const response = await phoneAxios.post(endpoint, payload);

      if (response?.data?.status === true) {
        setDuplicateError(response?.data?.message);
      } else {
        setDuplicateError("");
      }
    } catch (error) {
      console.error(
        "Error checking phone uniqueness:",
        error.response || error
      );
      formik.setFieldError(
        "phoneFull",
        "Unable to check phone number. Please try again."
      );
    }
  };

  const handleEmailBlur = async () => {
    const inputValue = formik.values.email?.trim().toLowerCase();

    // Clear error if field is empty
    if (!inputValue) {
      setDuplicateEmailError("");
      setShowDuplicateEmailModal(false);
      return;
    }

    const payload = {
      email: inputValue,
    };

    // Check for duplicates excluding the current lead ID
    try {
      // ✅ Use POST method
      // ✅ Use POST method
      const endpoint = selectedLead
        ? `/lead/verify/availability/${selectedLead}` // If lead is selected, use verification endpoint
        : "/lead/check/unique";

      const response = await phoneAxios.post(endpoint, payload);

      if (response?.data?.status === true) {
        setDuplicateEmailError(response?.data?.message);
        setShowDuplicateEmailModal(true);
      } else {
        setDuplicateEmailError("");
        setShowDuplicateEmailModal(false);
      }
    } catch (error) {
      console.error(
        "Error checking phone uniqueness:",
        error.response || error
      );
      formik.setFieldError(
        "Email",
        "Unable to check phone number. Please try again."
      );
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
                    <div>
                      <label className="mb-2 block">
                        Club Name
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                          <FaListCheck />
                        </span>
                        <Select
                          name="club_id"
                          value={clubOptions.find(
                            (opt) => opt.value === formik.values.club_id
                          )}
                          onChange={(option) =>
                            formik.setFieldValue("club_id", option.value)
                          }
                          options={clubOptions}
                          styles={selectIcon}
                        />
                      </div>
                      {formik.errors?.club_id && formik.touched?.club_id && (
                        <div className="text-red-500 text-sm">
                          {formik.errors.club_id}
                        </div>
                      )}
                    </div>
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

                      {((formik.errors?.mobile && formik.touched?.mobile) ||
                        duplicateError) && (
                        <div className="text-red-500 text-sm">
                          {formik.errors?.mobile || duplicateError}
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
                          {duplicateEmailError}
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
                      <div className="relative">
                        <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                          <PiGenderIntersexBold />
                        </span>
                        <Select
                          name="gender"
                          value={genderOptions.find(
                            (opt) => opt.value === formik.values.gender
                          )}
                          options={genderOptions}
                          onChange={(option) =>
                            formik.setFieldValue("gender", option.value)
                          }
                          styles={selectIcon}
                          className="!capitalize"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block">Company</label>
                      <div className="relative">
                        <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                          <FaBuilding />
                        </span>

                        <CreatableSelect
                          name="company_name"
                          isClearable
                          isLoading={loading}
                          placeholder="Select or create a company"
                          /* ✅ SINGLE SOURCE OF TRUTH */
                          value={
                            formik.values.company_id
                              ? companyOptions.find(
                                  (opt) =>
                                    opt.value === formik.values.company_id
                                ) || null
                              : formik.values.company_name
                              ? {
                                  label: formik.values.company_name,
                                  value: "__new__", // ✅ NEVER use string as ID
                                }
                              : null
                          }
                          onChange={(option) => {
                            // Clear
                            if (!option) {
                              formik.setFieldValue("company_id", null);
                              formik.setFieldValue("company_name", "");
                              return;
                            }

                            // ✅ Existing company (ID is number)
                            if (typeof option.value === "number") {
                              formik.setFieldValue("company_id", option.value);
                              formik.setFieldValue(
                                "company_name",
                                option.label
                              );
                              return;
                            }

                            // ✅ Fallback safety (should not happen)
                            formik.setFieldValue("company_id", null);
                            formik.setFieldValue("company_name", option.label);
                          }}
                          onCreateOption={(newValue) => {
                            // ❌ DO NOT push fake value into options
                            // ❌ DO NOT assign string to company_id

                            formik.setFieldValue("company_id", null);
                            formik.setFieldValue("company_name", newValue);
                          }}
                          onInputChange={(inputValue) => {
                            if (inputValue.length >= 2) {
                              fetchCompanies(inputValue);
                            }
                          }}
                          options={companyOptions} // must be [{ value: number, label: string }]
                          styles={selectIcon}
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

                    <div className="col-span-2">
                      <label className="mb-2 block">Address</label>
                      <div className="relative">
                        <input
                          name="address"
                          value={formik.values.address}
                          onChange={formik.handleChange}
                          className="custom--input w-full"
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
                      <label className="mb-2 block">
                        Interested In<span className="text-red-500">*</span>
                      </label>
                      <div
                        className={`relative ${
                          selectedLead ? "hide-clear-icon" : ""
                        }`}
                      >
                        <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                          <FaListCheck />
                        </span>
                        <MultiSelect
                          options={servicesName}
                          value={selected} // selected objects
                          onChange={(serviceList) => {
                            setSelected(serviceList); // UI needs objects
                            const values = serviceList.map((opt) => opt.value);
                            formik.setFieldValue("interested_in", values); // Formik stores strings
                          }}
                          labelledBy="Select..."
                          hasSelectAll={false}
                          disableSearch={true}
                          overrideStrings={{
                            selectSomeItems: "Select Interested...",
                            allItemsAreSelected: "All Interested Selected",
                            // search: "Search",
                          }}
                          className={`custom--input w-full input--icon multi--select--new ${
                            selectedLead
                              ? "cursor-not-allowed pointer-events-none !bg-gray-100 !text-gray-500"
                              : ""
                          }`}
                          disabled={!!selectedLead}
                        />
                      </div>
                      {formik.errors?.interested_in &&
                        formik.touched?.interested_in && (
                          <div className="text-red-500 text-sm">
                            {formik.errors.interested_in}
                          </div>
                        )}
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
                          isDisabled={!!selectedLead}
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
                      {selectedLead && selectedLead ? (
                        <div className="relative">
                          <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                            <FaListCheck />
                          </span>
                          <input
                            name="lead_source"
                            value={formik.values.lead_source}
                            // onChange={formik.handleChange}
                            readOnly={true}
                            isDisabled={true}
                            className="custom--input w-full input--icon  cursor-not-allowed pointer-events-none !bg-gray-100 !text-gray-500"
                          />
                        </div>
                      ) : (
                        <div className="relative">
                          <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                            <FaListCheck />
                          </span>
                          <Select
                            name="lead_source"
                            value={
                              filteredLeadSources.find(
                                (opt) =>
                                  opt.value.toLowerCase() ===
                                  String(
                                    formik.values.lead_source || ""
                                  ).toLowerCase()
                              ) || null
                            }
                            onChange={(option) =>
                              formik.setFieldValue("lead_source", option.value)
                            }
                            options={filteredLeadSources}
                            styles={selectIcon}
                          />
                        </div>
                      )}

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
                            value={socialList.find(
                              (opt) => opt.value === formik.values.platform
                            )}
                            onChange={(option) =>
                              formik.setFieldValue("platform", option.value)
                            }
                            options={socialList}
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
                                  value="TOUR"
                                  checked={formik.values.schedule === "TOUR"}
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
                                  value="TRIAL"
                                  checked={formik.values.schedule === "TRIAL"}
                                  onChange={handleInput}
                                  className="w-4 h-4 mr-1"
                                />
                                <span className="radio-checkmark"></span>
                              </label>
                              <label className="custom--radio">
                                No Trial
                                <input
                                  type="radio"
                                  name="schedule"
                                  value="NOTRIAL"
                                  checked={formik.values.schedule === "NOTRIAL"}
                                  onChange={(e) => {
                                    formik.setFieldValue(
                                      "schedule",
                                      e.target.value
                                    );
                                    // Reset assigned_staff_id and schedule_date_time when NOTRIAL is selected
                                    formik.setFieldValue(
                                      "assigned_staff_id",
                                      ""
                                    );
                                    formik.setFieldValue(
                                      "schedule_date_time",
                                      ""
                                    );
                                  }}
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
                              {formik.values.schedule === "TRIAL" ||
                              formik.values.schedule === "TOUR" ? (
                                <span className="text-red-500">*</span>
                              ) : (
                                ""
                              )}
                            </label>
                            <div className="custom--date flex-1">
                              <span className="absolute z-[1] mt-[11px] ml-[15px]">
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
                                dateFormat="dd/MM/yyyy hh:mm aa"
                                placeholderText="Select date & time"
                                className="border px-3 py-2 w-full input--icon"
                                minDate={now} // Disable past dates
                                minTime={getMinTime(new Date())} // Calculate minTime for selected date dynamically
                                maxTime={baseMaxTime} // 10:00 PM limit
                                disabled={
                                  !formik.values.schedule ||
                                  formik.values.schedule === "NOTRIAL"
                                }
                              />
                            </div>
                            {formik.touched.schedule_date_time &&
                              formik.errors.schedule_date_time && (
                                <p className="text-sm text-red-500 mt-1">
                                  {formik.errors.schedule_date_time}
                                </p>
                              )}
                          </div>

                          {/* Trainer */}
                          <div className="mb-4">
                            <label className="mb-2 block">
                              {formik.values.schedule === "TOUR" ? (
                                <span>Trainer & FOH</span>
                              ) : (
                                <span>Trainer</span>
                              )}

                              {formik.values.schedule === "TRIAL" ||
                              formik.values.schedule === "TOUR" ? (
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
                                name="assigned_staff_id"
                                value={
                                  staffList
                                    .flatMap((group) => group.options)
                                    .find(
                                      (opt) =>
                                        opt.value ===
                                        formik.values.assigned_staff_id
                                    ) || null
                                }
                                options={staffList} // grouped options
                                onChange={(value) =>
                                  formik.setFieldValue(
                                    "assigned_staff_id",
                                    value?.value
                                  )
                                }
                                placeholder="Select staff"
                                styles={selectIcon}
                                isDisabled={
                                  !formik.values.schedule ||
                                  formik.values.schedule === "NOTRIAL"
                                }
                              />
                            </div>

                            {formik.touched.assigned_staff_id &&
                              formik.errors.assigned_staff_id && (
                                <p className="text-sm text-red-500 mt-1">
                                  {formik.errors.assigned_staff_id}
                                </p>
                              )}
                            {/* {formik.values.schedule &&
                              formik.values.schedule_date_time &&
                              !getAvailableTrainers().length && (
                                <p className="text-sm text-red-500 mt-1">
                                  No trainers available at this date and time.
                                </p>
                              )} */}
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
