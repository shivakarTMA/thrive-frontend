import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "react-phone-number-input/style.css";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";

import {
  servicesName,
  leadsSources,
  leadTypes,
  companies,
  trainerAvailability,
  mockData,
  leadSubTypes,
  centreInfo,
} from "../DummyData/DummyData";

import {
  convertToISODate,
  customStyles,
  formatDateTime,
  formatTime,
  selectIcon,
} from "../Helper/helper";
import { IoCloseCircle, IoDocumentSharp, IoKey } from "react-icons/io5";
import { Formik, Field, Form, ErrorMessage, useFormik } from "formik";
import * as Yup from "yup";
import {
  FaBirthdayCake,
  FaBriefcase,
  FaBuilding,
  FaCamera,
  FaEnvelope,
  FaFemale,
  FaLink,
  FaMale,
  FaUser,
  FaUserTie,
} from "react-icons/fa";
import { FaListCheck, FaLocationDot, FaUserLarge } from "react-icons/fa6";
import ProductModal from "../components/modal/ProductDetails";
import { useSelector } from "react-redux";
import ConfirmUnderAge from "../components/modal/ConfirmUnderAge";
import StepProgressBar from "../components/common/StepProgressBar";
import { RiDiscountPercentFill } from "react-icons/ri";
import { IoIosTime } from "react-icons/io";
import { LuIndianRupee } from "react-icons/lu";
import { toast } from "react-toastify";

const voucherList = [
  { code: "FIT10", discount: 10 },
  { code: "WELCOME20", discount: 20 },
  { code: "SUMMER25", discount: 25 },
];

const SelectOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

const stepValidationSchemas = [
  // ✅ Step 0: Full set of required fields
  Yup.object({
    memberDetails: Yup.object({
      name: Yup.string()
        .min(3, "Name must be at least 3 characters")
        .required("Name is required"),
      contactNumber: Yup.string()
        .required("Contact number is required")
        .test("is-valid-phone", "Invalid phone number", function (value) {
          return isValidPhoneNumber(value || "");
        }),
      email: Yup.string()
        .email("Invalid email format")
        .required("Email is required"),
      gender: Yup.string().required("Gender is required"),
      dob: Yup.string()
        .nullable()
        .required("Date of birth is required")
        .max(new Date(), "Date of birth cannot be in the future"),
      address: Yup.string().required("Address is required"),
    }),

    leadInformation: Yup.object({
      leadSource: Yup.string().required("Lead Source is required"),
      leadType: Yup.string().required("Lead Type is required"),
    }),

    leadInformation: Yup.object({
      leadSource: Yup.string().required("Lead Source is required"),
      leadType: Yup.string().required("Lead Type is required"),
      leadSourceType: Yup.string().when("leadSource", {
        is: (val) => ["social media", "events / campaigns"].includes(val),
        then: () => Yup.string().required("This is required"),
      }),
      otherSource: Yup.string().when("leadSourceType", {
        is: "others",
        then: () => Yup.string().required("This is required"),
      }),
    }),
  }),

  Yup.object({
    // professionalInformation: Yup.object({
    //   companyName: Yup.string().required("Company Name is required"),
    // }),

    emergencyContact: Yup.object({
      contact: Yup.string()
        .nullable()
        .test("is-valid-phone", "Invalid phone number", function (value) {
          if (!value) return true; // allow empty but validate if present
          return isValidPhoneNumber(value);
        }),
    }),
  }),
  Yup.object({
    invoiceDetails: Yup.object({
      invoiceDate: Yup.string().required("Invoice Date is required"),
      // leadOwner: Yup.string().required("Lead Owner is required"),
      memberName: Yup.string().required("Member Name is required"),
    }),
  }),
];

const leadSourceTypes = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "others", label: "Others" },
];
const kycDocumentsOptions = [
  { value: "Aadhar Card", label: "Aadhar Card" },
  { value: "PAN Card", label: "PAN Card" },
  { value: "Passport", label: "Passport" },
  { value: "Voter ID", label: "Voter ID" },
];

const CreateMemberForm = ({ setMemberModal, selectedLeadMember }) => {
  console.log(selectedLeadMember,'selectedLeadMember')
  const [activeTab, setActiveTab] = useState("personal");
  const [profileImage, setProfileImage] = useState("");
  const [showProductModal, setShowProductModal] = useState(false);
  const [step, setStep] = useState(0);
  const { user } = useSelector((state) => state.auth);

  const [voucherInput, setVoucherInput] = useState("");
  const [voucherStatus, setVoucherStatus] = useState(null); // "success", "error", or null
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  const leadBoxRef = useRef(null);
  const [matchingUsers, setMatchingUsers] = useState([]);
  const [duplicateError, setDuplicateError] = useState("");
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [hasDismissedDuplicateModal, setHasDismissedDuplicateModal] =
    useState(false);
  const [showUnderageModal, setShowUnderageModal] = useState(false);
  const [pendingDob, setPendingDob] = useState(null);

  const initialValues = {
    memberDetails: {
      profileImage: "",
      name: "",
      contactNumber: "",
      email: "",
      gender: "",
      dob: null,
      address: "",
    },
    leadInformation: {
      leadSource: "",
      leadSourceType: "",
      otherSource: "",
      leadType: "",
      multiClubAccess: "",
      kycSubmitted: "",
      kycDocuments: [],
    },
    professionalInformation: {
      designation: "",
      companyName: "",
      officialEmail: "",
    },
    emergencyContacts: [
      {
        name: "",
        contact: "",
        relationship: "",
      },
    ],
    membershipDetails: {
      leadOwner: user?.name,
      centre: "",
      state: "",
      country: "",
    },
    invoiceDetails: {
      invoiceDate: "",
      leadOwner: user?.name,
      memberName: "",
    },
    productType: "membership plan",
    productDetails: {
      productName: "",
      servicesDuration: "",
      shortDescription: "",
      amount: "",
      sessions: "",
    },
    voucherCode: "",
    discount: 0,
  };

  const formik = useFormik({
    initialValues,
    validationSchema: stepValidationSchemas[step],
    onSubmit: (values) => {
      if (step === stepValidationSchemas.length - 1) {
        console.log("Submitting full form", values);
         toast.success("Member created successfully!");
         setMemberModal(false)
      } else {
        setStep(step + 1);
      }
    },
  });

  useEffect(() => {
    if (selectedLeadMember) {
      formik.setValues({
        memberDetails: {
          profileImage: selectedLeadMember.profileImage || "",
          name: selectedLeadMember.name || "",
          contactNumber: selectedLeadMember.contact || "",
          email: selectedLeadMember.email || "",
          gender: selectedLeadMember.gender || "",
          dob: selectedLeadMember.dob || null,
          address: selectedLeadMember.address || "",
        },
        leadInformation: {
          leadSource: selectedLeadMember.leadSource || "",
          leadSourceType: selectedLeadMember.leadSourceType || "",
          otherSource: selectedLeadMember.otherSource || "",
          leadType: selectedLeadMember.leadType || "",
          multiClubAccess: selectedLeadMember.multiClubAccess || "",
          kycSubmitted: selectedLeadMember.kycSubmitted || "",
          kycDocuments: selectedLeadMember.kycDocuments || [],
        },
        professionalInformation: {
          designation: selectedLeadMember.designation || "",
          companyName: selectedLeadMember.companyName || "",
          officialEmail: selectedLeadMember.officialEmail || "",
        },
        productType: "membership plan",
      });
    }
  }, [selectedLeadMember]);

  const handleNextStep = async () => {
    const errors = await formik.validateForm();

    // ✅ Check for form validation errors
    if (Object.keys(errors).length === 0) {
      // ✅ Block if duplicateError exists
      if (duplicateError) {
        // console.warn("Duplicate number detected:", duplicateError);
        setShowDuplicateModal(true);
        return;
      }

      if (step === stepValidationSchemas.length - 1) {
        formik.handleSubmit();
      } else {
        setStep(step + 1);
      }
    } else {
      console.log("Validation Errors:", errors);

      // Mark current step fields as touched
      const touchedFields = {};
      Object.keys(errors).forEach((section) => {
        touchedFields[section] = {};
        Object.keys(errors[section] || {}).forEach((field) => {
          touchedFields[section][field] = true;
        });
      });

      formik.setTouched(touchedFields);
    }
  };

  const regFee = 10;
  const serviceFee = Number(formik?.values?.productDetails?.amount) || 0;
  const cgst = serviceFee * 0.09;
  const sgst = serviceFee * 0.09;
  const discountPercent = selectedVoucher ? selectedVoucher.discount : 0;
  const subtotal = regFee + serviceFee + cgst + sgst;
  const discountAmount = (subtotal * discountPercent) / 100;
  const total = subtotal - discountAmount;

  useEffect(() => {
    formik.setFieldValue(
      "invoiceDetails.invoiceDate",
      new Date().toISOString().split("T")[0]
    );
  }, []);

  useEffect(() => {
    if (formik?.values?.memberDetails?.name) {
      formik.setFieldValue(
        "invoiceDetails.memberName",
        formik?.values?.memberDetails?.name
      );
    }
  }, [formik?.values?.memberDetails?.name]);

  const handleProductSubmit = (product) => {
    formik.setFieldValue("productDetails.productName", product.productName);
    formik.setFieldValue(
      "productDetails.shortDescription",
      product.shortDescription
    );
    formik.setFieldValue(
      "productDetails.servicesDuration",
      product.servicesDuration
    );
    formik.setFieldValue("productDetails.amount", product.amount);
    formik.setFieldValue("productDetails.sessions", product.sessions);
  };

  const handleApplyVoucher = () => {
    const matched = voucherList.find(
      (v) => v.code.toLowerCase() === voucherInput.trim().toLowerCase()
    );

    if (matched) {
      setSelectedVoucher(matched);
      setVoucherStatus("success");
      formik.setFieldValue("voucherCode", matched.code);
      formik.setFieldValue("discount", matched.discount); // ensure discount exists in initialValues
    } else {
      setSelectedVoucher(null);
      setVoucherStatus("error");
      formik.setFieldValue("voucherCode", "");
      formik.setFieldValue("discount", 0);
    }
  };

  const handleAddContact = () => {
    formik.setFieldValue("emergencyContacts", [
      ...formik.values.emergencyContacts,
      { name: "", contact: "", relationship: "" },
    ]);
  };

  const handleRemoveContact = (index) => {
    const updated = [...formik.values.emergencyContacts];
    updated.splice(index, 1);
    formik.setFieldValue("emergencyContacts", updated);
  };

  const handleEmergancyPhone = (value, index) => {
    const updated = [...formik.values.emergencyContacts];
    updated[index].contact = value;
    formik.setFieldValue("emergencyContacts", updated);
  };

  const handlePhoneChange = (value) => {
    formik.setFieldValue("memberDetails.contactNumber", value);
    setHasDismissedDuplicateModal(false);
  };

  const handleCheckDublicate = () => {
    const inputValue = formik.values.memberDetails.contactNumber?.replace(
      /\s/g,
      ""
    );

    if (inputValue && inputValue.length >= 5) {
      const matches = mockData.filter((user) => {
        const userContact = user.contact?.replace(/\s/g, "");
        return userContact === inputValue;
      });

      setMatchingUsers(matches);

      const activeMatch = matches.find((user) => user.status === "active");

      if (activeMatch) {
        setDuplicateError(
          "That a member with this phone number already exists"
        );
        //   setDuplicateError(
        //   `Member "${activeMatch.name}" is already registered with this number`
        // );

        if (!hasDismissedDuplicateModal) {
          setShowDuplicateModal(true);
        }
      } else {
        setDuplicateError("");
      }
    } else {
      setMatchingUsers([]);
      setDuplicateError("");
    }
  };

  const handleDobChange = (date) => {
    if (!date) return;

    formik.setFieldValue("memberDetails.dob", date);
  };

  const fifteenYearsAgo = new Date();
  fifteenYearsAgo.setFullYear(fifteenYearsAgo.getFullYear() - 15);

  const confirmDob = () => {
    formik.setFieldValue("memberDetails.dob", pendingDob);
    setShowUnderageModal(false);
    setPendingDob(null);
  };

  const cancelDob = () => {
    formik.setFieldValue("memberDetails.dob", "");
    setShowUnderageModal(false);
    setPendingDob(null);
  };

  const handleUserSelect = (user) => {
    formik.setFieldValue("memberDetails.name", user.name);
    formik.setFieldValue("memberDetails.email", user.email);
    formik.setFieldValue("memberDetails.gender", user.gender);
    formik.setFieldValue("memberDetails.dob", user.dob);
    formik.setFieldValue("memberDetails.address", user.address);
    formik.setFieldValue("memberDetails.contactNumber", user.contact);

    formik.setFieldValue(
      "leadInformation.leadSource",
      user.leadSource.toLowerCase()
    );

    // Set leadType as a single value (no need for an array)
    formik.setFieldValue(
      "leadInformation.leadType",
      user.leadType.toLowerCase()
    );
    console.log(matchingUsers);
    console.log(user);

    setMatchingUsers([]);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
      formik.setFieldValue("memberDetails.profileImage", file);
    }
  };

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      setMemberModal(false);
    }
  };

  const handleLeadModal = () => {
    setMemberModal(false);
  };

  console.log(formik.values, 'formik')

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
            <h2 className="text-xl font-semibold">Create a Member</h2>
            <div
              className="close--lead cursor-pointer"
              onClick={handleLeadModal}
            >
              <IoCloseCircle className="text-3xl" />
            </div>
          </div>

          <div className="flex-1s flexs">
            <form
              // className="space-y-6 flex-1 flex flex-col justify-between"
              onSubmit={formik.handleSubmit}
            >
              <div className="flex bg-white rounded-b-[10px]">
                {/* <StepProgressBar
                  currentStep={step}
                  totalSteps={stepValidationSchemas.length}
                /> */}

                <div className="p-6 flex-1">
                  {step === 0 && (
                    <>
                      <h3 className="text-2xl font-semibold mb-2">
                        Member Details
                      </h3>
                      <div className="flex gap-4">
                        <div className="max-w-[200px] h-[200px] w-full relative">
                          {profileImage ? (
                            <img
                              src={profileImage} // optional fallback
                              alt="Profile Preview"
                              width={200}
                              height={200}
                              className="w-full h-[200px] object-cover object-center rounded-[10px]"
                            />
                          ) : (
                            <div className="bg-gray-100 h-full rounded-[10px] flex items-center justify-center">
                              <FaUserLarge className="text-5xl" />
                            </div>
                          )}

                          <div className="absolute bottom-[-10px] right-[-10px]">
                            <label className="cursor-pointer w-[45px] h-[45px] flex items-center justify-center bg-white text-sm px-2 py-1 rounded-full shadow">
                              <FaCamera className="text-2xl" />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="relative">
                            <label className="mb-2 block">
                              Contact Number
                              <span className="text-red-500">*</span>
                            </label>
                            <PhoneInput
                              name="memberDetails.contactNumber"
                              value={formik.values.memberDetails.contactNumber}
                              onChange={handlePhoneChange}
                              onBlur={handleCheckDublicate}
                              international
                              defaultCountry="IN"
                              countryCallingCodeEditable={false}
                              className="custom--input w-full custom--phone"
                            />
                            {!duplicateError && matchingUsers.length > 0 && (
                              <div className="border mt-2 bg-white shadow rounded p-2 max-h-40 overflow-y-auto z-10 absolute w-full">
                                {matchingUsers.map((user) => (
                                  <div
                                    key={user.id}
                                    className="p-2 cursor-pointer text-sm flex items-center gap-2 hover:bg-gray-100"
                                    onClick={() => handleUserSelect(user)}
                                  >
                                    <div>
                                      <div className="font-medium">
                                        {user.name}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {formik.errors.memberDetails?.contactNumber &&
                              formik.touched.memberDetails?.contactNumber && (
                                <div className="text-red-500 text-sm">
                                  {formik.errors.memberDetails.contactNumber}
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
                                name="memberDetails.name"
                                value={formik.values.memberDetails.name}
                                onChange={formik.handleChange}
                                className="custom--input w-full input--icon"
                              />
                            </div>
                            {formik.errors.memberDetails?.name &&
                              formik.touched.memberDetails?.name && (
                                <div className="text-red-500 text-sm">
                                  {formik.errors.memberDetails.name}
                                </div>
                              )}
                          </div>

                          <div>
                            <label className="mb-2 block">
                              Email<span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                                <FaEnvelope />
                              </span>
                              <input
                                type="email"
                                name="memberDetails.email"
                                value={formik.values.memberDetails.email}
                                onChange={formik.handleChange}
                                className="custom--input w-full input--icon"
                              />
                            </div>
                            {formik.errors.memberDetails?.email &&
                              formik.touched.memberDetails?.email && (
                                <div className="text-red-500 text-sm">
                                  {formik.errors.memberDetails.email}
                                </div>
                              )}
                          </div>

                          <div>
                            <label className="mb-2 block">
                              Gender<span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-2 flex-wrap">
                              <label
                                className={`flex items-center gap-2 px-4 py-2 rounded-[10px] border cursor-pointer shadow-sm transition ${
                                  formik.values.memberDetails.gender === "male"
                                    ? "bg-black text-white border-black"
                                    : "bg-white text-gray-700 border-gray-300"
                                }
                                `}
                              >
                                <input
                                  type="radio"
                                  name="memberDetails.gender"
                                  value="male"
                                  checked={
                                    formik.values.memberDetails.gender ===
                                    "male"
                                  }
                                  onChange={formik.handleChange}
                                  className="hidden"
                                />
                                <FaMale />
                                Male
                              </label>

                              <label
                                className={`flex items-center gap-2 px-4 py-2 rounded-[10px] border cursor-pointer shadow-sm transition ${
                                  formik.values.memberDetails.gender ===
                                  "female"
                                    ? "bg-black text-white border-black"
                                    : "bg-white text-gray-700 border-gray-300"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="memberDetails.gender"
                                  value="female"
                                  checked={
                                    formik.values.memberDetails.gender ===
                                    "female"
                                  }
                                  onChange={formik.handleChange}
                                  className="hidden"
                                />
                                <FaFemale />
                                Female
                              </label>
                            </div>
                            {formik.errors.memberDetails?.gender &&
                              formik.touched.memberDetails?.gender && (
                                <div className="text-red-500 text-sm">
                                  {formik.errors.memberDetails.gender}
                                </div>
                              )}
                          </div>

                          <div>
                            <label className="mb-2 block">
                              DOB<span className="text-red-500">*</span>
                            </label>
                            <div className="custom--date dob-format relative">
                              <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                                <FaBirthdayCake />
                              </span>

                              <DatePicker
                                selected={
                                  formik.values.memberDetails.dob
                                    ? convertToISODate(
                                        formik.values.memberDetails.dob
                                      )
                                    : null
                                }
                                onChange={handleDobChange}
                                showMonthDropdown
                                showYearDropdown
                                dropdownMode="select"
                                maxDate={fifteenYearsAgo} // 👈 allow dates only up to 15 years ago
                                dateFormat="dd MMM yyyy"
                                yearDropdownItemNumber={100} // 👈 show 100 years (optional)
                                placeholderText="Select date"
                                className="input--icon"
                              />
                              
                            </div>
                            {formik.errors.memberDetails?.dob &&
                                formik.touched.memberDetails?.dob && (
                                  <div className="text-red-500 text-sm">
                                    {formik.errors.memberDetails.dob}
                                  </div>
                                )}
                          </div>

                          <div className="col-span-3dd">
                            <label className="mb-2 block">
                              Address<span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                                <FaLocationDot />
                              </span>
                              <input
                                name="memberDetails.address"
                                value={formik.values.memberDetails.address}
                                onChange={formik.handleChange}
                                className="custom--input w-full input--icon"
                              />
                            </div>
                            {formik.errors.memberDetails?.address &&
                              formik.touched.memberDetails?.address && (
                                <div className="text-red-500 text-sm">
                                  {formik.errors.memberDetails.address}
                                </div>
                              )}
                          </div>
                        </div>
                      </div>

                      <hr className="my-5 mt-10" />
                      <h3 className="text-2xl font-semibold mb-2">
                        Lead Information
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="mb-2 block">
                            Lead Type<span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                              <FaListCheck />
                            </span>
                            <Select
                              name="leadInformation.leadType"
                              value={leadTypes.find(
                                (opt) =>
                                  opt.value ===
                                  formik.values.leadInformation.leadType
                              )}
                              onChange={(option) =>
                                formik.setFieldValue(
                                  "leadInformation.leadType",
                                  option.value
                                )
                              }
                              options={leadTypes}
                              styles={selectIcon}
                            />
                          </div>
                          {formik.errors.leadInformation?.leadType &&
                            formik.touched.leadInformation?.leadType && (
                              <div className="text-red-500 text-sm">
                                {formik.errors.leadInformation.leadType}
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
                              name="leadInformation.leadSource"
                              value={leadsSources.find(
                                (opt) =>
                                  opt.value ===
                                  formik.values.leadInformation.leadSource
                              )}
                              onChange={(option) =>
                                formik.setFieldValue(
                                  "leadInformation.leadSource",
                                  option.value
                                )
                              }
                              options={leadsSources}
                              styles={selectIcon}
                            />
                          </div>
                          {formik.errors.leadInformation?.leadSource &&
                            formik.touched.leadInformation?.leadSource && (
                              <div className="text-red-500 text-sm">
                                {formik.errors.leadInformation.leadSource}
                              </div>
                            )}
                        </div>
                        {formik.values.leadInformation.leadSource ===
                          "social media" && (
                          <div>
                            <label className="mb-2 block">
                              Social Media
                              <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                                <FaListCheck />
                              </span>
                              <Select
                                name="leadInformation.leadSourceType"
                                value={leadSourceTypes.find(
                                  (opt) =>
                                    opt.value ===
                                    formik.values.leadInformation.leadSourceType
                                )}
                                onChange={(option) =>
                                  formik.setFieldValue(
                                    "leadInformation.leadSourceType",
                                    option.value
                                  )
                                }
                                options={leadSourceTypes}
                                styles={selectIcon}
                              />
                            </div>
                            {formik.errors.leadInformation?.leadSourceType &&
                              formik.touched.leadInformation
                                ?.leadSourceType && (
                                <div className="text-red-500 text-sm">
                                  {formik.errors.leadInformation.leadSourceType}
                                </div>
                              )}
                          </div>
                        )}
                        <div>
                          <label className="mb-2 block">
                            Multi Club Access
                          </label>
                          <div className="relative">
                            <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                              <IoKey />
                            </span>
                            <Select
                              name="leadInformation.multiClubAccess"
                              value={SelectOptions.find(
                                (opt) =>
                                  opt.value ===
                                  formik.values.leadInformation.multiClubAccess
                              )}
                              onChange={(option) =>
                                formik.setFieldValue(
                                  "leadInformation.multiClubAccess",
                                  option.value
                                )
                              }
                              options={SelectOptions}
                              styles={selectIcon}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="mb-2 block">KYC Submitted ?</label>
                          <div className="relative">
                            <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                              <IoKey />
                            </span>
                            <Select
                              name="leadInformation.kycSubmitted"
                              value={SelectOptions.find(
                                (opt) =>
                                  opt.value ===
                                  formik.values.leadInformation.kycSubmitted
                              )}
                              onChange={(option) =>
                                formik.setFieldValue(
                                  "leadInformation.kycSubmitted",
                                  option.value
                                )
                              }
                              options={SelectOptions}
                              styles={selectIcon}
                            />
                          </div>
                        </div>
                        {formik.values.leadInformation.kycSubmitted ===
                          "yes" && (
                          <div>
                            <label className="mb-2 block">KYC Documents</label>
                            <div className="relative">
                              <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                                <IoDocumentSharp />
                              </span>
                              <Select
                                name="leadInformation.kycDocuments"
                                options={kycDocumentsOptions}
                                isMulti
                                value={kycDocumentsOptions.filter((option) =>
                                  formik.values.leadInformation.kycDocuments.includes(
                                    option.value
                                  )
                                )}
                                onChange={(selectedOptions) =>
                                  formik.setFieldValue(
                                    "leadInformation.kycDocuments",
                                    selectedOptions.map((opt) => opt.value)
                                  )
                                }
                                styles={selectIcon} // your existing styles
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {step === 1 && (
                    <>
                      <h3 className="text-2xl font-semibold mb-2">
                        Professional Information
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="mb-2 block">Designation</label>
                          <div className="relative">
                            <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                              <FaBriefcase />
                            </span>
                            <input
                              type="email"
                              name="professionalInformation.designation"
                              value={
                                formik.values?.professionalInformation?.designation
                              }
                              onChange={formik.handleChange}
                              className="custom--input w-full input--icon"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="mb-2 block">Company</label>
                          <div className="relative">
                            <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                              <FaBuilding />
                            </span>
                            <Select
                              name="professionalInformation.companyName"
                              value={companies.find(
                                (opt) =>
                                  opt.value ===
                                  formik.values?.professionalInformation?.companyName
                              )}
                              onChange={(option) =>
                                formik.setFieldValue(
                                  "professionalInformation.companyName",
                                  option.value
                                )
                              }
                              options={companies}
                              styles={selectIcon}
                            />
                          </div>

                          {/* {formik.errors.professionalInformation?.companyName &&
                          formik.touched.professionalInformation
                            ?.companyName && (
                            <div className="text-red-500 text-sm">
                              {
                                formik.errors.professionalInformation
                                  .companyName
                              }
                            </div>
                          )} */}
                        </div>
                        <div>
                          <label className="mb-2 block">
                            Official Email Id
                          </label>
                          <div className="custom--date dob-format relative">
                            <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                              <FaEnvelope />
                            </span>
                            <input
                              type="email"
                              name="professionalInformation.officialEmail"
                              value={
                                formik.values?.professionalInformation?.officialEmail
                              }
                              onChange={formik.handleChange}
                              className="custom--input w-full input--icon"
                            />
                          </div>
                        </div>
                      </div>

                      <hr className="my-5" />
                      <h3 className="text-2xl font-semibold mb-2">
                        Emergency Contact
                      </h3>
                      {formik.values?.emergencyContacts?.map((contact, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-3 gap-4 mb-4 border p-4 rounded-lg"
                        >
                          <div>
                            <label className="mb-2 block">Name</label>
                            <div className="custom--date dob-format relative">
                              <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                                <FaUser />
                              </span>
                              <input
                                type="text"
                                name={`emergencyContacts.${index}.name`}
                                value={contact?.name}
                                onChange={formik.handleChange}
                                className="custom--input w-full input--icon"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="mb-2 block">Number</label>
                            <PhoneInput
                              name={`emergencyContacts.${index}.contact`}
                              value={contact?.contact}
                              onChange={(value) =>
                                handleEmergancyPhone(value, index)
                              }
                              international
                              defaultCountry="IN"
                              countryCallingCodeEditable={false}
                              className="custom--input w-full custom--phone"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block">Relationship</label>
                            <div className="custom--date dob-format relative">
                              <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                                <FaLink />
                              </span>
                              <input
                                type="text"
                                name={`emergencyContacts.${index}.relationship`}
                                value={contact?.relationship}
                                onChange={formik.handleChange}
                                className="custom--input w-full input--icon"
                              />
                            </div>
                          </div>

                          <div className="col-span-3 flex justify-end mt-2">
                            {formik.values?.emergencyContacts?.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveContact(index)}
                                className="text-red-500"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={handleAddContact}
                        className="text-sm flex items-center gap-1 justify-end mx-auto bg-black text-white p-2 rounded-[5px]"
                      >
                        + Add Emergency Contact
                      </button>

                      <hr className="my-5" />
                      <h3 className="text-2xl font-semibold mb-2">
                        Membership Details
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="mb-2 block">Lead Owner</label>
                          <div className="custom--date dob-format relative">
                            <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                              <FaUserTie />
                            </span>
                            <input
                              type="text"
                              name="membershipDetails.leadOwner"
                              value={formik.values?.membershipDetails?.leadOwner}
                              onChange={formik.handleChange}
                              className="custom--input w-full input--icon"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="mb-2 block">Centre Details</label>
                          <div className="relative">
                            <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                              <FaBuilding />
                            </span>
                            <Select
                              name="membershipDetails.centre"
                              value={centreInfo.find(
                                (opt) =>
                                  opt.value ===
                                  formik.values?.membershipDetails?.centre
                              )}
                              onChange={(option) => {
                                formik.setFieldValue(
                                  "membershipDetails.centre",
                                  option.value
                                );
                                formik.setFieldValue(
                                  "membershipDetails.state",
                                  option.state
                                );
                                formik.setFieldValue(
                                  "membershipDetails.country",
                                  option.country
                                );
                              }}
                              options={centreInfo}
                              styles={selectIcon}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="mb-2 block">State</label>
                          <div className="relative">
                            <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                              <FaLocationDot />
                            </span>
                            <input
                              type="text"
                              name="membershipDetails.state"
                              value={formik.values?.membershipDetails?.state}
                              readOnly={true}
                              className="custom--input w-full input--icon bg-[#fafafa] pointer-events-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block">Country</label>
                          <div className="relative">
                            <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                              <FaLocationDot />
                            </span>
                            <input
                              type="text"
                              name="membershipDetails.country"
                              value={formik.values?.membershipDetails?.country}
                              readOnly={true}
                              className="custom--input w-full input--icon bg-[#fafafa] pointer-events-none"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <h3 className="text-2xl font-semibold mb-2">
                        Invoice Details
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="mb-2 block">Invoice Date</label>
                          <div className="relative">
                            <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                              <FaLocationDot />
                            </span>
                            <input
                              name="invoiceDetails.invoiceDate"
                              value={formik.values?.invoiceDetails?.invoiceDate}
                              readOnly={true}
                              className="custom--input w-full input--icon bg-[#fafafa] pointer-events-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="mb-2 block">Lead Owner</label>
                          <div className="relative">
                            <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                              <FaUserTie />
                            </span>
                            <input
                              name="membershipDetails.leadOwner"
                              value={formik.values?.membershipDetails?.leadOwner}
                              // onChange={handleInput}
                              className="custom--input w-full input--icon bg-[#fafafa] pointer-events-none"
                              readOnly={true}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block">Member Name</label>
                          <div className="relative">
                            <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                              <FaUser />
                            </span>
                            <input
                              name="invoiceDetails.memberName"
                              value={formik.values?.invoiceDetails?.memberName}
                              // onChange={handleInput}
                              className="custom--input w-full input--icon bg-[#fafafa] pointer-events-none"
                              readOnly={true}
                            />
                          </div>
                        </div>
                      </div>
                      <hr className="my-3 mt-5" />
                      <h3 className="text-2xl font-semibold mb-2">
                        Description Field
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="mb-2 block">Product Type</label>
                          <div className="relative">
                            <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                              <FaListCheck />
                            </span>
                            <input
                              name="productType"
                              value={formik.values?.productType}
                              // onChange={handleInput}
                              readOnly={true}
                              className="custom--input w-full capitalize input--icon bg-[#fafafa] pointer-events-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="mb-2 block">Product Name</label>
                          <div
                            className="relative"
                            onClick={() => setShowProductModal(true)}
                          >
                            <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                              <FaListCheck />
                            </span>
                            <input
                              name="productDetails.productName"
                              value={formik.values?.productDetails?.productName}
                              // onChange={handleInput}
                              className="custom--input w-full input--icon"
                              readOnly={true}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block">Voucher Code</label>
                          <div className="flex gap-0 relative">
                            <span className="absolute top-[50%] translate-y-[-50%] left-[12px]">
                              <RiDiscountPercentFill className="text-xl" />
                            </span>
                            <input
                              type="text"
                              value={voucherInput}
                              onChange={(e) => setVoucherInput(e.target.value)}
                              placeholder="Enter voucher code"
                              className={`input--icon !rounded-r-[0px] custom--input w-full ${
                                voucherStatus === "success"
                                  ? "border-green-500"
                                  : voucherStatus === "error"
                                  ? "border-red-500"
                                  : ""
                              }`}
                            />
                            <button
                              type="button"
                              onClick={handleApplyVoucher}
                              className="px-4 py-2 bg-black text-white rounded-r-[10px]"
                            >
                              Apply
                            </button>
                          </div>
                          {voucherStatus === "success" && (
                            <p className="text-green-600 text-sm mt-1">
                              Voucher applied: {selectedVoucher?.code} (
                              {selectedVoucher?.discount}% off)
                            </p>
                          )}
                          {voucherStatus === "error" && (
                            <p className="text-red-600 text-sm mt-1">
                              Invalid voucher code.
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="mb-2 block">Duration</label>
                          <div className="relative">
                            <span className="absolute top-[50%] translate-y-[-50%] left-[12px]">
                              <IoIosTime className="text-xl" />
                            </span>
                            <input
                              name="productDetails.servicesDuration"
                              value={
                                formik.values?.productDetails?.servicesDuration
                              }
                              onChange={formik.handleChange}
                              className="custom--input w-full input--icon bg-[#fafafa] pointer-events-none"
                              readOnly={true}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block">Service Fee</label>
                          <div className="relative">
                            <span className="absolute top-[50%] translate-y-[-50%] left-[12px]">
                              <LuIndianRupee className="text-xl" />
                            </span>
                            <input
                              name="productDetails.amount"
                              value={formik.values?.productDetails?.amount}
                              readOnly={true}
                              className="custom--input w-full input--icon bg-[#fafafa] pointer-events-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 bg-[#f7f7f7] p-[20px] rounded-[10px]">
                        <h3 className="text-2xl font-semibold">
                          Price Calculation
                        </h3>
                        <div className="price--calculation2 my-5">
                          <div className="price--item">
                            <p className="flex items-center gap-2 justify-between mb-2 border-b pb-2">
                              Reg Fee:{" "}
                              <span className="font-bold">
                                ₹{regFee.toFixed(2)}
                              </span>
                            </p>
                          </div>
                          <div className="price--item">
                            <p className="flex items-center gap-2 justify-between mb-2 border-b pb-2">
                              Service Fee:{" "}
                              <span className="font-bold">
                                ₹{serviceFee.toFixed(2)}
                              </span>
                            </p>
                          </div>
                          <div className="price--item">
                            <p className="flex items-center gap-2 justify-between mb-2 border-b pb-2">
                              CGST (9%):{" "}
                              <span className="font-bold">
                                ₹{cgst.toFixed(2)}
                              </span>
                            </p>
                          </div>
                          <div className="price--item">
                            <p className="flex items-center gap-2 justify-between mb-2 border-b pb-2">
                              SGST (9%):{" "}
                              <span className="font-bold">
                                ₹{sgst.toFixed(2)}
                              </span>
                            </p>
                          </div>
                          <div className="price--item">
                            <p className="flex items-center gap-2 justify-between mb-2 border-b pb-2">
                              Subtotal:{" "}
                              <span className="font-bold">
                                ₹{subtotal.toFixed(2)}
                              </span>
                            </p>
                          </div>
                          <div className="price--item">
                            <p className="flex items-center gap-2 justify-between mb-2 border-b pb-2">
                              Discount:{" "}
                              <span className="font-bold">
                                {discountPercent}% (₹
                                {discountAmount.toFixed(2)})
                              </span>
                            </p>
                          </div>
                        </div>
                        <p className="text-1xl font-semibold flex items-center gap-2 justify-between pb-2">
                          Total Payment:{" "}
                          <span className="font-bold">₹{total.toFixed(2)}</span>
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div
                className={`flex gap-4 py-5 ${
                  step > 0 ? "justify-between" : "justify-end"
                }`}
              >
                {step > 0 && (
                  <button
                    type="button"
                    className="bg-white text-black font-semibold px-4 py-2 border rounded max-w-[150px] w-full"
                    onClick={() => setStep(step - 1)}
                  >
                    Back
                  </button>
                )}

                <button
                  type="button"
                  className="px-4 py-2 bg-white text-black font-semibold rounded max-w-[150px] w-full"
                  onClick={handleNextStep}
                >
                  {step === stepValidationSchemas.length - 1
                    ? "Make Payment"
                    : "Next"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {showProductModal && (
        <ProductModal
          selectedType={formik.values?.productType}
          onClose={() => setShowProductModal(false)}
          onSubmit={handleProductSubmit}
        />
      )}

      {showUnderageModal && (
        <ConfirmUnderAge
          title="Underage Confirmation"
          message="Lead's age is less than 18. Do you still wish to continue?"
          onConfirm={confirmDob}
          onCancel={cancelDob}
        />
      )}

      {duplicateError && showDuplicateModal && (
        <div className="fixed h-full inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full text-center">
            <h2 className="text-lg font-semibold text-red-600 mb-4">
              Duplicate Entry
            </h2>
            <p className="text-sm text-gray-700 mb-6">{duplicateError}</p>
            <button
              onClick={() => {
                setShowDuplicateModal(false);
                setHasDismissedDuplicateModal(true);
              }}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateMemberForm;
