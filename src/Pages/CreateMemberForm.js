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
} from "../DummyData/DummyData";

import {
  convertToISODate,
  customStyles,
  formatDateTime,
  formatTime,
} from "../Helper/helper";
import { IoCloseCircle } from "react-icons/io5";
import { Formik, Field, Form, ErrorMessage, useFormik } from "formik";
import * as Yup from "yup";
import { FaCamera } from "react-icons/fa";
import { FaUserLarge } from "react-icons/fa6";
import ProductModal from "../components/modal/ProductDetails";
import { useSelector } from "react-redux";
import ConfirmUnderAge from "../components/modal/ConfirmUnderAge";

const voucherList = [
  { code: "FIT10", discount: 10 },
  { code: "WELCOME20", discount: 20 },
  { code: "SUMMER25", discount: 25 },
];

const stepValidationSchemas = [
  // ✅ Step 0: Full set of required fields
  Yup.object({
    leadInformation: Yup.object({
      leadSource: Yup.string().required("Lead Source is required"),
      leadType: Yup.string().required("Lead Type is required"),
    }),

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
    }),

    leadInformation: Yup.object({
      leadSource: Yup.string().required("Lead Source is required"),
      leadType: Yup.string().required("Lead Type is required"),
    }),

    professionalInformation: Yup.object({
      companyName: Yup.string().required("Company Name is required"),
    }),

    emergencyContact: Yup.object({
      contact: Yup.string()
        .nullable()
        .test("is-valid-phone", "Invalid phone number", function (value) {
          if (!value) return true; // allow empty but validate if present
          return isValidPhoneNumber(value);
        }),
    }),
  }),

  // ✅ Step 1: Invoice Info
  Yup.object({
    invoiceDetails: Yup.object({
      invoiceDate: Yup.string().required("Invoice Date is required"),
      leadOwner: Yup.string().required("Lead Owner is required"),
      memberName: Yup.string().required("Member Name is required"),
    }),
  }),
];

const CreateMemberForm = ({ setMemberModal }) => {
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
      leadType: "",
    },
    professionalInformation: {
      designation: "",
      companyName: "",
      officialEmail: "",
    },
    emergencyContact: {
      name: "",
      contact: "",
      relationship: "",
    },
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
      } else {
        setStep(step + 1);
      }
    },
  });

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

    const today = new Date();
    const birthDate = new Date(date);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    if (age < 18) {
      setPendingDob(date);
      setShowUnderageModal(true);
    } else {
      formik.setFieldValue("memberDetails.dob", date);
    }
  };

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

    formik.setFieldValue("leadInformation.leadSource", user.leadSource);

    // Set leadType as a single value (no need for an array)
    formik.setFieldValue("leadInformation.leadType", user.leadType);

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

  return (
    <>
      <div
        className="create--lead--container fixed top-0 left-0 z-[999] w-full bg-black bg-opacity-60 h-full"
        onClick={handleOverlayClick}
      >
        <div
          className="max-w-5xl border shadow bg-white ms-auto h-full overflow-auto hide--overflow container--leadbox"
          ref={leadBoxRef}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex gap-3 items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold">Create a Member</h2>
            <div
              className="close--lead cursor-pointer"
              onClick={handleLeadModal}
            >
              <IoCloseCircle className="text-3xl" />
            </div>
          </div>

          <div className="p-6">
            <div className="flex gap-2 mb-4">
              <button
                className={`px-4 py-2 rounded border ${
                  step === 0 ? "bg-black text-white" : "bg-white text-black"
                }`}
                type="button"
              >
                Personal Information
              </button>
              <button
                className={`px-4 py-2 rounded border ${
                  step === 1 ? "bg-black text-white" : "bg-white text-black"
                }`}
                type="button"
              >
                Invoice Information
              </button>
            </div>

            <form className="space-y-6" onSubmit={formik.handleSubmit}>
              {step === 0 && (
                <>
                  <h3 className="text-2xl font-semibold">Member Details</h3>
                  <div className="flex gap-4">
                    <div className="max-w-[200px] w-full relative">
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
                          Contact Number<span className="text-red-500">*</span>
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

                        {duplicateError
                          ? showDuplicateModal && (
                              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full text-center">
                                  <h2 className="text-lg font-semibold text-red-600 mb-4">
                                    Duplicate Entry
                                  </h2>
                                  <p className="text-sm text-gray-700 mb-6">
                                    {duplicateError}
                                  </p>
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
                            )
                          : matchingUsers.length > 0 && (
                              <div className="border mt-2 bg-white shadow rounded p-2 max-h-40 overflow-y-auto z-10 absolute w-full">
                                {matchingUsers.map((user) => (
                                  <div
                                    key={user.id}
                                    className="p-2 cursor-pointer text-sm flex items-center gap-2"
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

                        <input
                          name="memberDetails.name"
                          value={formik.values.memberDetails.name}
                          onChange={formik.handleChange}
                          className="custom--input w-full"
                        />
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
                        <input
                          type="email"
                          name="memberDetails.email"
                          value={formik.values.memberDetails.email}
                          onChange={formik.handleChange}
                          className="custom--input w-full"
                        />
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
                        <div className="flex gap-2">
                          <label className="custom--radio">
                            Male
                            <input
                              type="radio"
                              name="memberDetails.gender"
                              value="male"
                              checked={
                                formik.values.memberDetails.gender === "male"
                              }
                              className="w-4 h-4"
                              onChange={formik.handleChange}
                            />
                            <span className="radio-checkmark"></span>
                          </label>
                          <label className="custom--radio">
                            Female
                            <input
                              type="radio"
                              name="memberDetails.gender"
                              value="female"
                              checked={
                                formik.values.memberDetails.gender === "female"
                              }
                              className="w-4 h-4"
                              onChange={formik.handleChange}
                            />
                            <span className="radio-checkmark"></span>
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
                        <div className="custom--date dob-format">
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
                            maxDate={new Date()}
                            dateFormat="dd MMM yyyy"
                            dropdownMode="select"
                            placeholderText="Select date"
                          />

                          {formik.errors.memberDetails?.dob &&
                            formik.touched.memberDetails?.dob && (
                              <div className="text-red-500 text-sm">
                                {formik.errors.memberDetails.dob}
                              </div>
                            )}
                        </div>
                      </div>

                      <div className="col-span-3dd">
                        <label className="mb-2 block">Address</label>
                        <input
                          name="memberDetails.address"
                          value={formik.values.memberDetails.address}
                          onChange={formik.handleChange}
                          className="custom--input w-full"
                        />
                      </div>
                    </div>
                  </div>

                  <hr />
                  <h3 className="text-2xl font-semibold">Lead Information</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="mb-2 block">
                        Lead Source<span className="text-red-500">*</span>
                      </label>
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
                        styles={customStyles}
                      />
                      {formik.errors.leadInformation?.leadSource &&
                        formik.touched.leadInformation?.leadSource && (
                          <div className="text-red-500 text-sm">
                            {formik.errors.leadInformation.leadSource}
                          </div>
                        )}
                    </div>
                    <div>
                      <label className="mb-2 block">
                        Lead Type<span className="text-red-500">*</span>
                      </label>
                      <Select
                        name="leadInformation.leadType"
                        value={leadTypes.find(
                          (opt) =>
                            opt.value === formik.values.leadInformation.leadType
                        )}
                        onChange={(option) =>
                          formik.setFieldValue(
                            "leadInformation.leadType",
                            option.value
                          )
                        }
                        options={leadTypes}
                        styles={customStyles}
                      />
                      {formik.errors.leadInformation?.leadType &&
                        formik.touched.leadInformation?.leadType && (
                          <div className="text-red-500 text-sm">
                            {formik.errors.leadInformation.leadType}
                          </div>
                        )}
                    </div>
                  </div>
                  <hr />
                  <h3 className="text-2xl font-semibold">
                    Professional Information
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="mb-2 block">Designation</label>
                      <input
                        type="email"
                        name="professionalInformation.designation"
                        value={
                          formik.values.professionalInformation.designation
                        }
                        onChange={formik.handleChange}
                        className="custom--input w-full"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block">
                        Company<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="professionalInformation.companyName"
                        value={
                          formik.values.professionalInformation.companyName
                        }
                        onChange={formik.handleChange}
                        className="custom--input w-full"
                      />

                      {formik.errors.professionalInformation?.companyName &&
                        formik.touched.professionalInformation?.companyName && (
                          <div className="text-red-500 text-sm">
                            {formik.errors.professionalInformation.companyName}
                          </div>
                        )}
                    </div>
                    <div>
                      <label className="mb-2 block">Official Email Id</label>
                      <input
                        type="email"
                        name="professionalInformation.officialEmail"
                        value={
                          formik.values.professionalInformation.officialEmail
                        }
                        onChange={formik.handleChange}
                        className="custom--input w-full"
                      />
                    </div>
                  </div>

                  <hr />
                  <h3 className="text-2xl font-semibold">Emergency Contact</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="mb-2 block">Name</label>
                      <input
                        type="text"
                        name="emergencyContact.name"
                        value={formik.values.emergencyContact.name}
                        onChange={formik.handleChange}
                        className="custom--input w-full"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block">Number</label>
                      <PhoneInput
                        name="emergencyContact.contact"
                        value={formik.values.emergencyContact.contact}
                        onChange={formik.handleChange}
                        onBlur={() =>
                          formik.setFieldTouched(
                            "emergencyContact.contact ",
                            true
                          )
                        }
                        international
                        defaultCountry="IN"
                        countryCallingCodeEditable={false}
                        className="custom--input w-full custom--phone"
                      />
                      {formik.errors.emergencyContact?.contact &&
                        formik.touched.emergencyContact?.contact && (
                          <div className="text-red-500 text-sm">
                            {formik.errors.emergencyContact.contact}
                          </div>
                        )}
                    </div>
                    <div>
                      <label className="mb-2 block">Relationship</label>
                      <input
                        type="text"
                        name="emergencyContact.relationship"
                        value={formik.values.emergencyContact.relationship}
                        onChange={formik.handleChange}
                        className="custom--input w-full"
                      />
                    </div>
                  </div>
                  <hr />
                  <h3 className="text-2xl font-semibold">Membership Details</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="mb-2 block">Lead Owner</label>
                      <input
                        type="text"
                        name="membershipDetails.leadOwner"
                        value={formik.values.membershipDetails.leadOwner}
                        // onChange={formik.handleChange}
                        className="custom--input w-full"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block">Centre Details</label>
                      <Select
                        name="membershipDetails.centre"
                        value={leadTypes.find(
                          (opt) =>
                            opt.value === formik.values.membershipDetails.centre
                        )}
                        onChange={(option) =>
                          formik.setFieldValue(
                            "membershipDetails.centre",
                            option.value
                          )
                        }
                        options={leadTypes}
                        styles={customStyles}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block">State</label>
                      <Select
                        name="membershipDetails.state"
                        value={leadTypes.find(
                          (opt) =>
                            opt.value === formik.values.membershipDetails.state
                        )}
                        onChange={(option) =>
                          formik.setFieldValue(
                            "membershipDetails.state",
                            option.value
                          )
                        }
                        options={leadTypes}
                        styles={customStyles}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block">Country</label>
                      <Select
                        name="membershipDetails.country"
                        value={leadTypes.find(
                          (opt) =>
                            opt.value ===
                            formik.values.membershipDetails.country
                        )}
                        onChange={(option) =>
                          formik.setFieldValue(
                            "membershipDetails.country",
                            option.value
                          )
                        }
                        options={leadTypes}
                        styles={customStyles}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Professional tab is intentionally skipped as requested */}
              {step === 1 && (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="mb-2 block">Invoice Date</label>
                      <input
                        name="invoiceDetails.invoiceDate"
                        value={formik.values.invoiceDetails.invoiceDate}
                        readOnly={true}
                        className="custom--input w-full"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block">Lead Owner</label>
                      <input
                        name="invoiceDetails.leadOwner"
                        value={formik.values.invoiceDetails.leadOwner}
                        // onChange={handleInput}
                        className="custom--input w-full"
                        readOnly={true}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block">Member Name</label>
                      <input
                        name="invoiceDetails.memberName"
                        value={formik.values.invoiceDetails.memberName}
                        // onChange={handleInput}
                        className="custom--input w-full"
                        readOnly={true}
                      />
                    </div>
                  </div>
                  <hr />
                  <h3 className="text-2xl font-semibold">Description Field</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="mb-2 block">Product Type</label>
                      <input
                        name="productType"
                        value={formik.values.productType}
                        // onChange={handleInput}
                        readOnly={true}
                        className="custom--input w-full capitalize"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block">Product Name</label>
                      <div onClick={() => setShowProductModal(true)}>
                        <input
                          name="productDetails.productName"
                          value={formik.values.productDetails.productName}
                          // onChange={handleInput}
                          className="custom--input w-full"
                          readOnly={true}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block">Voucher Code</label>
                      <div className="flex gap-0">
                        <input
                          type="text"
                          value={voucherInput}
                          onChange={(e) => setVoucherInput(e.target.value)}
                          placeholder="Enter voucher code"
                          className={`!rounded-r-[0px] custom--input w-full ${
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
                          Voucher applied: {selectedVoucher.code} (
                          {selectedVoucher.discount}% off)
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
                      <input
                        name="productDetails.servicesDuration"
                        value={formik.values.productDetails.servicesDuration}
                        onChange={formik.handleChange}
                        className="custom--input w-full"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block">Service Fee</label>
                      <input
                        name="productDetails.amount"
                        value={formik.values.productDetails.amount}
                        readOnly={true}
                        className="custom--input w-full"
                      />
                    </div>
                  </div>
                  <hr />
                  <div className="bg-[#f7f7f7] p-[20px] rounded-[10px]">
                    <h3 className="text-2xl font-semibold">
                      Price Calculation
                    </h3>
                    <div className="price--calculation my-5">
                      <div className="price--item">
                        <p>
                          Reg Fee:{" "}
                          <span className="font-bold">
                            ₹{regFee.toFixed(2)}
                          </span>
                        </p>
                      </div>
                      <div className="price--item">
                        <p>
                          Service Fee:{" "}
                          <span className="font-bold">
                            ₹{serviceFee.toFixed(2)}
                          </span>
                        </p>
                      </div>
                      <div className="price--item">
                        <p>
                          CGST (9%):{" "}
                          <span className="font-bold">₹{cgst.toFixed(2)}</span>
                        </p>
                      </div>
                      <div className="price--item">
                        <p>
                          SGST (9%):{" "}
                          <span className="font-bold">₹{sgst.toFixed(2)}</span>
                        </p>
                      </div>
                      <div className="price--item">
                        <p>
                          Subtotal:{" "}
                          <span className="font-bold">
                            ₹{subtotal.toFixed(2)}
                          </span>
                        </p>
                      </div>
                      <div className="price--item">
                        <p>
                          Discount:{" "}
                          <span className="font-bold">
                            {discountPercent}% (₹
                            {discountAmount.toFixed(2)})
                          </span>
                        </p>
                      </div>
                    </div>
                    <p className="text-2xl font-semibold">
                      Total Payment:{" "}
                      <span className="font-bold">₹{total.toFixed(2)}</span>
                    </p>
                  </div>
                </>
              )}

              <div className="flex gap-4 justify-end">
                {step > 0 && (
                  <button
                    type="button"
                    className="px-4 py-2 border rounded"
                    onClick={() => setStep(step - 1)}
                  >
                    Back
                  </button>
                )}

                <button
                  type="button" // Always "button" — submission is handled in the function
                  className="px-4 py-2 bg-black text-white rounded"
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
    </>
  );
};

export default CreateMemberForm;
