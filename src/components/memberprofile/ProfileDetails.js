import React, { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import PhoneInput from "react-phone-number-input";
import DatePicker from "react-datepicker";
import Select from "react-select";
import { customStyles } from "../../Helper/helper";
import { useDispatch, useSelector } from "react-redux";
import { fetchOptionList } from "../../Redux/Reducers/optionListSlice";
import DummyProfile from "../../assets/images/dummy-profile.png";
import { CiCamera } from "react-icons/ci";
import Webcam from "react-webcam";
import { IoCheckmark, IoClose } from "react-icons/io5";
import { FaLink, FaRegImage } from "react-icons/fa";
import { apiAxios, phoneAxios } from "../../config/config";
import {
  parsePhoneNumberFromString,
  isPossiblePhoneNumber,
} from "libphonenumber-js";
import ConfirmUnderAge from "../modal/ConfirmUnderAge";
import { toast } from "react-toastify";
import { IoIosAddCircle, IoIosCloseCircle } from "react-icons/io";

// Lead source types
const genderOptions = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "NOTDISCLOSE", label: "Not to Disclose" },
];

const validationSchema = Yup.object({
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
  date_of_birth: Yup.date().required("Date of birth is required"),
  email: Yup.string().required("Email is required"),
  location: Yup.string().required("Location is required"),
});

const ProfileDetails = ({ member }) => {
  const [showModal, setShowModal] = useState(false);
  const [duplicateError, setDuplicateError] = useState("");
  const [duplicateEmailError, setDuplicateEmailError] = useState("");
  const [showDuplicateEmailModal, setShowDuplicateEmailModal] = useState(false);
  const [pendingDob, setPendingDob] = useState(null);
  const [showUnderageModal, setShowUnderageModal] = useState(false);
  const [companyOptions, setCompanyOptions] = useState([]);
  const webcamRef = useRef(null);

  console.log(member, "member");
  console.log(companyOptions, "companyOptions");

  const [showAddForm, setShowAddForm] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [newEmergencies, setNewEmergencies] = useState([]);
  const [errors, setErrors] = useState({});

  console.log(emergencyContacts, "emergencyContacts");

  // Fetch emergency contact list by member ID
  const fetchEmergencyContacts = async () => {
    try {
      const response = await apiAxios().get(
        `/member-emergency-contact/list?member_id=${member?.id}`
      );
      const res = response?.data?.data;
      setEmergencyContacts(res);
    } catch (error) {
      console.error("Error fetching emergency contacts:", error);
    }
  };

  // Fetch companies
  const fetchCompanies = async (search = "") => {
    try {
      const res = await apiAxios().get("/company/list", {
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
      setCompanyOptions(options);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch companies");
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchEmergencyContacts();
  }, []);

  // Redux state
  const dispatch = useDispatch();
  const { lists, loading } = useSelector((state) => state.optionList);

  // Fetch option lists
  useEffect(() => {
    dispatch(fetchOptionList("LEAD_SOURCE"));
    dispatch(fetchOptionList("LEAD_TYPE"));
    dispatch(fetchOptionList("INTERESTED_IN"));
    dispatch(fetchOptionList("RELATIONSHIP"));
  }, [dispatch]);

  console.log(member,'shivakar')

  // Extract Redux lists
  const leadsSources = lists["LEAD_SOURCE"] || [];
  const leadTypes = lists["LEAD_TYPE"] || [];
  const servicesName = lists["INTERESTED_IN"] || [];
  const genralTrainer = lists["GENRAL_TRAINER"] || [];
  const relationList = lists["RELATIONSHIP"] || [];

  const formik = useFormik({
    initialValues: {
      profileImage: member?.profile_pic || DummyProfile,
      country_code: member?.country_code || "",
      mobile: member?.mobile || "",
      phoneFull:
        member?.country_code && member?.mobile
          ? `+${member?.country_code}${member?.mobile}`
          : "",
      full_name: member?.full_name || "",
      date_of_birth: member?.date_of_birth || "",
      gender: member?.gender || "NOTDISCLOSE",
      email: member?.email || "",
      location: member?.location || "",
      address: member?.address || "",
      created_by: member?.created_by || "",
      leadType:
        leadTypes.find((g) => g.value === member?.lead_type) || null || "",
      leadSource: member?.lead_source || "",
      company_name: member?.company_name || "",
      designation: member?.designation || "",
      officialEmail: member?.official_email || "",
    },
    validationSchema,
    onSubmit: async (values) => {
      console.log(values, "values");
      let profilePayload = new FormData();

      // ✅ Normalize phone
      if (values.phoneFull) {
        const phoneNumber = parsePhoneNumberFromString(values.phoneFull);
        if (phoneNumber) {
          profilePayload.country_code = phoneNumber.countryCallingCode;
          profilePayload.mobile = phoneNumber.nationalNumber;
        }
      } else {
        profilePayload.country_code = null;
        profilePayload.mobile = null;
      }

      Object.entries(values).forEach(([key, value]) => {
        if (key !== "phoneFull") profilePayload.append(key, value || "");
      });

      const profileResponse = await apiAxios().put(
        `/member/update/${member.id}`,
        profilePayload
      );
      console.log("Profile updated successfully:", profileResponse.data);

      const allContacts = [...emergencyContacts, ...newEmergencies];

      // ----- Update Emergency Contacts -----
      for (let contact of allContacts) {
        const contactPayload = {
          member_id: member.id,
          name: contact.name,
          relationship: contact.relationship || "",
          phone: contact.phone || "",
          alt_phone: contact.alt_phone || "",
          email: contact.email || "",
          address: contact.address || "",
        };

        console.log(contact, "contact checking");

        // If contact has ID, update; else create
        if (contact.id) {
          await apiAxios().put(
            `/member-emergency-contact/${contact.id}`,
            contactPayload
          );
        } else {
          await apiAxios().post(`/member-emergency-contact/create`, contactPayload);
        }
      }

      toast.success("Profile updated successfully.");
      // ✅ Submit logic here (API call to save profile)
    },
  });

  const updateEmergencyContactField = (index, field, value) => {
    const updatedContacts = [...emergencyContacts];
    updatedContacts[index][field] = value;
    setEmergencyContacts(updatedContacts);
  };

  // Function to update a field in a new emergency contact
  const updateNewEmergencyField = (index, field, value) => {
    const updatedNew = [...newEmergencies];
    updatedNew[index][field] = value;
    setNewEmergencies(updatedNew);
  };

  // Function to add a blank newEmergency form
  const addNewEmergencyForm = () => {
    setNewEmergencies([
      ...newEmergencies,
      {
        name: "",
        phone: "",
        alt_phone: "",
        email: "",
        relationship: "",
        address: "",
      },
    ]);
  };

  // Remove an existing contact
  const removeEmergencyContact = async (index) => {
    const contact = emergencyContacts[index];
    if (!contact) return;
    try {
      if (contact.id) {
        await apiAxios().delete(`/member-emergency-contact/${contact.id}`);
        toast.success("Emergency contact removed successfully.");
      }
      const updated = emergencyContacts.filter((_, i) => i !== index);
      setEmergencyContacts(updated);
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast.error("Failed to remove emergency contact.");
    }
  };

  // Remove a new unsaved emergency form
  const removeNewEmergency = (index) => {
    const updated = newEmergencies.filter((_, i) => i !== index);
    setNewEmergencies(updated);
  };

  const capturePhoto = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;
    formik.setFieldValue("profileImage", imageSrc); // ✅ Now safe to call
    setShowModal(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const imageUrl = URL.createObjectURL(file);
    formik.setFieldValue("profileImage", imageUrl); // ✅ Safe
    setShowModal(false);
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

    console.log(payload.mobile);

    try {
      // ✅ Use POST method
      const endpoint = member?.id
        ? `/lead/verify/availability/${member?.id}` // If lead is selected, use verification endpoint
        : "/lead/check/unique";

      const response = await phoneAxios.post(endpoint, payload);

      console.log(response?.data?.status, "response");

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
      const endpoint = member?.id
        ? `/lead/verify/availability/${member?.id}` // If lead is selected, use verification endpoint
        : "/lead/check/unique";

      const response = await phoneAxios.post(endpoint, payload);

      console.log(response?.data?.status, "response");

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

  const fifteenYearsAgo = new Date();
  fifteenYearsAgo.setFullYear(fifteenYearsAgo.getFullYear() - 15);

  // Handle manual date selection
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

  console.log(formik?.values,'SHIVAKAR')

  return (
    <div className="min-h-screen">
      <form onSubmit={formik.handleSubmit} className="flex gap-5">
        {/* Left Sidebar */}
        <div className="w-full max-w-[280px]">
          <div className="bg-white p-4 rounded-[10px] w-full box--shadow">
            {/* Profile Image and Progress */}
            <div className="text-center mb-6">
              <div className="w-full bg-gray-100 rounded-lg mx-auto mb-4 overflow-hidden relative group">
                <img
                  src={formik.values.profileImage}
                  alt="Profile"
                  className="w-full h-[300px] object-cover"
                />
                <div
                  className="bg-black bg-opacity-25 flex items-center justify-center absolute w-full h-full top-0 left-0 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-300"
                  onClick={() => setShowModal(true)}
                >
                  <div className="bg-white bg-opacity-25 w-[60px] h-[60px] flex items-center justify-center rounded-full">
                    <CiCamera className="text-white text-4xl" />
                  </div>
                </div>
              </div>

              {/* Webcam Modal */}
              {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center">
                    {/* Webcam Preview */}
                    <Webcam
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      className="rounded-lg"
                      videoConstraints={{
                        facingMode: "user", // use front camera
                      }}
                    />

                    {/* Action buttons */}
                    <div className="flex gap-3 mt-4 items-center justify-between w-full">
                      <div className="flex gap-3 items-center">
                        <button
                          onClick={capturePhoto}
                          className="px-4 py-2 bg-black text-white rounded flex items-center gap-2"
                        >
                          <CiCamera /> Take Photo
                        </button>

                        <label className="px-4 py-2 bg-black text-white rounded flex items-center gap-2">
                          <FaRegImage /> Upload Image
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                      </div>

                      <button
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 bg-black text-white rounded flex items-center gap-2"
                      >
                        <IoClose /> Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-4 flex items-center gap-2 justify-between">
                <div className="text-lg font-bold text-gray-900">
                  Profile Completion
                </div>
                <div className="text-lg font-bold text-gray-900">40%</div>
              </div>

              <div className="progress--bar bg-[#E5E5E5] rounded-full h-[10px] w-full">
                <div
                  className="bg--color w-full rounded-full h-full"
                  style={{ width: "40%" }}
                ></div>
              </div>
            </div>

            {/* Details Section */}
            <div className="border-t border-t-[#D4D4D4] py-5">
              <div className="text-md font-semibold text-black mb-2">
                Details:
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#6F6F6F] font-[500] text-[15px]">
                    Membership ID:
                  </span>
                  <span className="text-[#6F6F6F] font-[500] text-[15px]">
                    {member?.membership_number || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6F6F6F] font-[500] text-[15px]">
                    Centre ID:
                  </span>
                  <span className="text-[#6F6F6F] font-[500] text-[15px]">
                    {member?.club_id || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6F6F6F] font-[500] text-[15px]">
                    Centre Name:
                  </span>
                  <span className="text-[#6F6F6F] font-[500] text-[15px]">
                    {member?.location || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Referred By Section */}
            <div className="border-t border-t-[#D4D4D4] pt-5">
              <div className="text-md font-semibold text-black mb-2">
                Referred By:
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#6F6F6F] font-[500] text-[15px]">
                    Name:
                  </span>
                  <span className="text-[#6F6F6F] font-[500] text-[15px]">
                    {member?.referred_by_name || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6F6F6F] font-[500] text-[15px]">
                    Referrer ID:
                  </span>
                  <span className="text-[#6F6F6F] font-[500] text-[15px]">
                    {member?.referred_by_id || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full">
          <div className="bg-white p-6 rounded-[10px] box--shadow w-full">
            {/* Basic Information */}
            <div className="border-b border-b[#D4D4D4] pb-5">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Basic Information
              </h2>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Contact Number<span className="text-red-500">*</span>
                  </label>
                  <PhoneInput
                    name="phoneFull"
                    value={formik.values.phoneFull}
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
                  <label className="block text-sm font-medium text-black mb-2">
                    Full Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    name="full_name"
                    value={formik.values.full_name}
                    onChange={formik.handleChange}
                    className="custom--input w-full"
                  />
                  {formik.errors?.full_name && formik.touched?.full_name && (
                    <div className="text-red-500 text-sm">
                      {formik.errors.full_name}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    DOB<span className="text-red-500">*</span>
                  </label>
                  <div className="custom--date dob-format relative">
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
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Gender<span className="text-red-500">*</span>
                  </label>
                  <Select
                    name="gender"
                    value={genderOptions.find(
                      (opt) => opt.value === formik.values.gender
                    )}
                    options={genderOptions}
                    onChange={(option) =>
                      formik.setFieldValue("gender", option.value)
                    }
                    styles={customStyles}
                    className="!capitalize"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Email<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={handleEmailBlur}
                    className="custom--input w-full"
                  />
                  {duplicateEmailError && showDuplicateEmailModal && (
                    <div className="text-red-500 text-sm">
                      {duplicateEmailError}
                    </div>
                  )}
                  {formik.errors?.email && formik.touched?.email && (
                    <div className="text-red-500 text-sm">
                      {formik.errors.email}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Location<span className="text-red-500">*</span>
                  </label>
                  <input
                  type="text"
                    name="location"
                    value={formik.values.location}
                    onChange={formik.handleChange}
                    className="custom--input w-full"
                  />
                  {formik.errors?.location && formik.touched?.location && (
                    <div className="text-red-500 text-sm">
                      {formik.errors.location}
                    </div>
                  )}
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-black mb-2">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formik.values.address}
                    onChange={formik.handleChange}
                    rows={1}
                    className="custom--input w-full"
                  />
                </div>
              </div>
            </div>

            {/* Lead Information */}
            <div className="border-b border-b[#D4D4D4] pb-5 pt-5">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Member Information
              </h2>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Sales Rep
                  </label>
                  <Select
                    name="created_by"
                    value={servicesName.find(
                      (opt) => opt.value === formik.values.created_by
                    )}
                    options={servicesName}
                    onChange={(option) =>
                      formik.setFieldValue("created_by", option.value)
                    }
                    styles={customStyles}
                    isDisabled={true}
                    className="!capitalize"
                    placeholder=""
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    General Trainer
                  </label>
                  <Select
                    name="gt"
                    styles={customStyles}
                    className="!capitalize"
                    value={genralTrainer.find(
                      (opt) => opt.value === formik.values.gt
                    )}
                    options={genralTrainer}
                    onChange={(option) =>
                      formik.setFieldValue("gt", option.value)
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Lead Source<span className="text-red-500">*</span>
                  </label>
                  <Select
                    name="leadSource"
                    styles={customStyles}
                    className="!capitalize"
                    isDisabled={true}
                    value={leadsSources.find(
                      (opt) => opt.value === formik.values.leadSource
                    )}
                    options={leadsSources}
                    onChange={(option) =>
                      formik.setFieldValue("leadSource", option.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Personal Trainer
                  </label>
                  <input
                    type="text"
                    name="personal_trainer"
                    value={formik.values.personal_trainer}
                    onChange={formik.handleChange}
                    className="custom--input w-full"
                    disabled={true}
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="border-b border-b[#D4D4D4] pb-5 pt-5">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Professional Information
              </h2>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Company<span className="text-red-500">*</span>
                  </label>
                  <Select
                    name="company_name"
                    // value={
                    //   companyOptions.find(
                    //     (opt) => opt.value === formik.values.company_name
                    //   ) ||
                    //   (formik.values.company_name && {
                    //     value: formik.values.company_name,
                    //     label: formik.values.company_name,
                    //   })
                    // }
                    value={
                            formik.values.company_name
                              ? companyOptions.find(
                                  (opt) =>
                                    opt.value === formik.values.company_name
                                ) || {
                                  label: formik.values.company_name,
                                  value: formik.values.company_name,
                                }
                              : null
                          }
                    onChange={(option) =>
                      formik.setFieldValue("company_name", option.value)
                    }
                    options={companyOptions}
                    isLoading={loading}
                    styles={customStyles}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Designation
                  </label>
                  <input
                    type="text"
                    name="designation"
                    value={formik.values.designation}
                    onChange={formik.handleChange}
                    className="custom--input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Official Email
                  </label>
                  <input
                    type="text"
                    name="officialEmail"
                    value={formik.values.officialEmail}
                    onChange={formik.handleChange}
                    className="custom--input w-full"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="pb-5 pt-5">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Emergency Contact
              </h2>

              {emergencyContacts.map((contact, index) => (
                <div className="relative flex items-center gap-2" key={index}>
                  <div className="grid grid-cols-4 gap-3 mb-3 items-end relative">
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Name<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={contact.name}
                        onChange={(e) =>
                          updateEmergencyContactField(
                            index,
                            "name",
                            e.target.value
                          )
                        }
                        className="custom--input w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Phone<span className="text-red-500">*</span>
                      </label>
                      <PhoneInput
                        value={contact.phone}
                        onChange={(value) =>
                          updateEmergencyContactField(index, "phone", value)
                        }
                        international
                        defaultCountry="IN"
                        countryCallingCodeEditable={false}
                        className="custom--input w-full custom--phone"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={contact.email}
                        onChange={(e) =>
                          updateEmergencyContactField(
                            index,
                            "email",
                            e.target.value
                          )
                        }
                        className="custom--input w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Relationship<span className="text-red-500">*</span>
                      </label>
                      <Select
                        options={relationList}
                        value={relationList.find(
                          (option) => option.value === contact.relationship
                        )}
                        onChange={(selectedOption) =>
                          updateEmergencyContactField(
                            index,
                            "relationship",
                            selectedOption.value
                          )
                        }
                        styles={customStyles}
                      />
                    </div>
                  </div>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => removeEmergencyContact(index)}
                      className="text-black font-bold"
                    >
                      <IoIosCloseCircle className="text-2xl mt-2" />
                    </button>
                  </div>
                </div>
              ))}

              {newEmergencies.map((contact, index) => (
                <div
                  className="relative flex items-center gap-2"
                  key={`new-${index}`}
                >
                  <div className="grid grid-cols-4 gap-3 mb-3 items-start">
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Name<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Name"
                        value={contact.name}
                        onChange={(e) =>
                          updateNewEmergencyField(index, "name", e.target.value)
                        }
                        className="custom--input w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Phone<span className="text-red-500">*</span>
                      </label>
                      <PhoneInput
                        placeholder="Phone"
                        value={contact.phone}
                        onChange={(value) =>
                          updateNewEmergencyField(index, "phone", value)
                        }
                        international
                        defaultCountry="IN"
                        countryCallingCodeEditable={false}
                        className="custom--input w-full custom--phone"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        placeholder="Email"
                        value={contact.email}
                        onChange={(e) =>
                          updateNewEmergencyField(
                            index,
                            "email",
                            e.target.value
                          )
                        }
                        className="custom--input w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Relationship<span className="text-red-500">*</span>
                      </label>
                      <Select
                        options={relationList}
                        value={relationList.find(
                          (option) => option.value === contact.relationship
                        )}
                        onChange={(selectedOption) =>
                          updateNewEmergencyField(
                            index,
                            "relationship",
                            selectedOption.value
                          )
                        }
                        styles={customStyles}
                      />
                    </div>
                  </div>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => removeNewEmergency(index)}
                      className="text-black font-bold"
                    >
                      <IoIosCloseCircle className="text-2xl mt-2" />
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addNewEmergencyForm}
                className="px-4 py-2 bg-gray-800 text-white rounded flex items-center gap-2 mb-4"
              >
                <IoIosAddCircle className="text-2xl" /> Add More
              </button>
            </div>

            {/* Profile Completion */}
            <div className="bg-[#F1F1F1] p-5 mt-5 rounded-[10px]">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b border-b-[#D4D4D4] pb-3">
                Profile Completion
              </h2>

              <div className="grid grid-cols-4 gap-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg--color flex items-center justify-center">
                    <IoCheckmark className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    Personal Information
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[#D4D4D4] flex items-center justify-center">
                    <IoCheckmark className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    Consent on terms
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg--color flex items-center justify-center">
                    <IoCheckmark className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    ParQ Information
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[#D4D4D4] flex items-center justify-center">
                    <IoCheckmark className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    KYC Submission
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Save Button */}
          <div className="flex justify-end mt-5">
            <button
              className="px-4 py-2 bg-black text-white rounded flex items-center gap-2"
              type="submit"
            >
              SAVE CHANGES
            </button>
          </div>
        </div>
      </form>

      {showUnderageModal && (
        <ConfirmUnderAge
          title="Underage Confirmation"
          message="This lead is a minor (under 18 years old). Do you still wish to proceed?"
          onConfirm={confirmDob}
          onCancel={cancelDob}
        />
      )}
    </div>
  );
};

export default ProfileDetails;
