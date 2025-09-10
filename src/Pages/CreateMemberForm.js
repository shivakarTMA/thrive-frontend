import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "react-phone-number-input/style.css";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { companies, centreInfo } from "../DummyData/DummyData";
import { selectIcon } from "../Helper/helper";
import { IoBan, IoCloseCircle } from "react-icons/io5";
import { useFormik } from "formik";
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
import {
  FaListCheck,
  FaLocationDot,
  FaRegImage,
  FaUserLarge,
} from "react-icons/fa6";
import ProductModal from "../components/modal/ProductDetails";
import { useDispatch, useSelector } from "react-redux";
import ConfirmUnderAge from "../components/modal/ConfirmUnderAge";
import { RiDiscountPercentFill } from "react-icons/ri";
import { IoIosTime } from "react-icons/io";
import { LuIndianRupee } from "react-icons/lu";
import { toast } from "react-toastify";
import { apiAxios } from "../config/config";
import { fetchOptionList } from "../Redux/Reducers/optionListSlice";
import Webcam from "react-webcam";
import { IoCheckmark, IoClose } from "react-icons/io5";

const voucherList = [
  { code: "FIT10", discount: 10 },
  { code: "WELCOME20", discount: 20 },
  { code: "SUMMER25", discount: 25 },
];

const stepValidationSchemas = [
  // ✅ Step 0: Full set of required fields
  Yup.object({
    full_name: Yup.string().required("First Name is required"),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    gender: Yup.string().required("Gender is required"),
   mobile: Yup.string()
        .required("Contact number is required")
        .test("is-valid-phone", "Invalid phone number", function (value) {
          const { country_code } = this.parent;
          if (!value || !country_code) return false;
          const phoneNumber = parsePhoneNumberFromString("+" + country_code + value);
          return phoneNumber?.isValid() || false;
        }),
    date_of_birth: Yup.string()
      .nullable()
      .required("Date of birth is required")
      .max(new Date(), "Date of birth cannot be in the future"),
    location: Yup.string().required("Location is required"),
    lead_source: Yup.string().required("Lead Source is required"),
    lead_type: Yup.string().required("Lead Type is required"),
    platform: Yup.string().when("lead_source", {
      is: (val) => ["Social Media", "Events/Campaigns"].includes(val),
      then: () => Yup.string().required("This is required"),
    }),
  }),
  Yup.object({
    company_name: Yup.string().required("Company is required"),
    emergencyContacts: Yup.array()
      .of(
        Yup.object({
          name: Yup.string().required("Name is required"),
          contact: Yup.string()
            .required("Contact number is required")
            .test("is-valid-phone", "Invalid phone number", function (value) {
              return isValidPhoneNumber(value || "");
            }),
          relationship: Yup.string().required("Relationship is required"),
        })
      )
      .min(1, "At least one emergency contact is required"),
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
  { value: "Facebook", label: "Facebook" },
  { value: "Instagram", label: "Instagram" },
  { value: "Others", label: "Others" },
];

const CreateMemberForm = ({ setMemberModal, selectedLeadMember }) => {
  console.log(selectedLeadMember,'selectedLeadMember')
  const [allLeads, setAllLeads] = useState([]);
  const [profileImage, setProfileImage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const webcamRef = useRef(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [step, setStep] = useState(0);
  const { user } = useSelector((state) => state.auth);
  const [companyOptions, setCompanyOptions] = useState([]);

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

  // Extract Redux lists
  const leadsSources = lists["LEAD_SOURCE"] || [];
  const leadTypes = lists["LEAD_TYPE"] || [];
  const servicesName = lists["INTERESTED_IN"] || [];
  const relationList = lists["RELATIONSHIP"] || [];

  const initialValues = {
    id: "",
    full_name: "",
    profile_pic: "",
    mobile: "",
    country_code: "",
    phoneFull: "",
    email: "",
    gender: "",
    date_of_birth: "",
    address: "",
    location: "",
    company_name: "",
    interested_in: "",
    lead_source: "",
    lead_type: "",
    platform: "",
    schedule: "",
    schedule_date_time: "",
    staff_name: "",
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
      leadOwner: "Shivakar",
      centre: "Gurugram",
      state: "Haryana",
      country: "India",
    },
    invoiceDetails: {
      invoiceDate: "",
      leadOwner: "Shivakar",
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
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (step === stepValidationSchemas.length - 1) {
        try {
          const formData = new FormData();
          Object.keys(values).forEach((key) => {
            formData.append(key, values[key]);
          });

          // If selectedLeadMember exists, update using PUT request
          if (selectedLeadMember && selectedLeadMember.id) {
           await apiAxios().put(`/member/convert/lead/${selectedLeadMember.id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
            toast.success("Member created successfully!");
          } else {
            // Otherwise handle as a normal new form submission
            console.log("Submitting full form", values);
            toast.success("Member created successfully!");
          }

          setMemberModal(false);
        } catch (error) {
          // toast.error("Failed to create member. Please try again.");
          console.log(error, "error");
          toast.error(error.response?.data?.message);
        }
      } else {
        setStep(step + 1);
      }
    },
  });

  useEffect(() => {
    if (selectedLeadMember) {
      const dobIso = selectedLeadMember.date_of_birth
        ? new Date(selectedLeadMember.date_of_birth).toISOString()
        : "";

      formik.setValues({
        id: selectedLeadMember.id || "",
        profile_pic: selectedLeadMember.profile_pic || "",
        full_name: selectedLeadMember.full_name || "",
        mobile: selectedLeadMember.country_code
          ? selectedLeadMember.mobile
          : "",
        country_code: selectedLeadMember.country_code || "",
        phoneFull: selectedLeadMember.country_code
          ? `+${selectedLeadMember.country_code}${selectedLeadMember.mobile}`
          : "",
        country_code: selectedLeadMember.country_code || "",
        email: selectedLeadMember.email || "",
        gender: selectedLeadMember.gender || "NOTDISCLOSE",
        date_of_birth: dobIso,
        address: selectedLeadMember.address || "",
        location: selectedLeadMember.location || "",
        company_name: selectedLeadMember.company_name || "",
        interested_in: selectedLeadMember.interested_in || "",
        lead_source: selectedLeadMember.lead_source || "",
        lead_type: selectedLeadMember.lead_type || "",
        platform: selectedLeadMember.platform || "",
        schedule: selectedLeadMember.schedule || "",
        schedule_date_time: selectedLeadMember.schedule_date_time
          ? new Date(selectedLeadMember.schedule_date_time).toISOString()
          : "",
        staff_name: selectedLeadMember.staff_name || "",
        membershipDetails: {
          leadOwner: "Shivakar",
          centre: "Gurugram",
          state: "Haryana",
          country: "India",
        },
        invoiceDetails: {
          invoiceDate: "",
          leadOwner: "Shivakar",
          memberName: selectedLeadMember.full_name,
        },
        productType: "membership plan",
      });
    }
  }, [selectedLeadMember]);

  console.log(selectedLeadMember,'SHIVAKAR')

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

  useEffect(() => {
    fetchLeadList();
    fetchCompanies();
  }, []);

  // Utility: Convert base64 to File
  const base64ToFile = (base64String, fileName) => {
    const arr = base64String.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], fileName, { type: mime });
  };

  // Capture from webcam
  const capturePhoto = () => {
    const imageSource = webcamRef.current.getScreenshot();
    if (imageSource) {
      const file = base64ToFile(imageSource, "profile_pic.jpg"); // Convert to file
      setProfileImage(URL.createObjectURL(file));
      formik.setFieldValue("profile_pic", file); // Set file in formik
      setShowModal(false);
    }
  };

  // Handle file upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
      formik.setFieldValue("profile_pic", file);
      setShowModal(false);
    }
  };

const handleNextStep = async () => {
    const errors = await formik.validateForm();

    if (Object.keys(errors).length === 0) {
      if (duplicateError) {
        setShowDuplicateModal(true);
        return;
      }

      if (step === stepValidationSchemas.length - 1) {
        formik.handleSubmit();
      } else {
        setStep(step + 1);
      }
    } else {
      // Mark all nested fields as touched
      const markTouched = (obj) => {
        if (Array.isArray(obj)) return obj.map((item) => markTouched(item));
        else if (typeof obj === "object" && obj !== null) {
          const touchedObj = {};
          Object.keys(obj).forEach((key) => {
            touchedObj[key] = markTouched(obj[key]);
          });
          return touchedObj;
        } else return true;
      };

      const touchedFields = markTouched(errors);
      formik.setTouched(touchedFields);
      return { errors, touched: touchedFields };
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
    const currentContacts = formik.values.emergencyContacts || [];
    formik.setFieldValue("emergencyContacts", [
      ...currentContacts,
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
    setDuplicateError(false);
  };

   const handlePhoneBlur = () => {
    const { id, mobile, country_code } = formik.values;
    if (!mobile || !country_code) return;

    const inputCode = country_code.replace("+", "");
    const inputMobile = mobile.replace(/\s/g, "");

    const matches = allLeads.filter((user) => {
      if (user.id === id) return false; // Skip current member
      const userCode = (user.country_code || "").replace("+", "");
      const userMobile = (user.mobile || "").replace(/\s/g, "");
      return userCode === inputCode && userMobile === inputMobile;
    });

    if (matches.length > 0) setDuplicateError(true);
  };


  const handleDobChange = (date) => {
    if (!date) return;

    formik.setFieldValue("date_of_birth", date);
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
      formik.setFieldValue("profile_pic", file);
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
        className="bg--blur create--lead--container overflow-auto hide--overflow fixed top-0 left-0 z-[999] w-full bg-black bg-opacity-60 h-full"
        onClick={handleOverlayClick}
      >
        <div
          className="min-h-[70vh]  w-[95%] max-w-5xl mx-auto mt-[100px] mb-[100px] container--leadbox rounded-[10px] flex flex-col"
          ref={leadBoxRef}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-t-[10px] flex gap-3 items-center justify-between py-4 px-4 border-b">
            <h2 className="text-xl font-semibold">{selectedLeadMember ? 'Convert a Member' : 'Create a Member'}</h2>
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
                        <div
                          className="max-w-[200px] h-[200px] w-full relative cursor-pointer"
                          onClick={() => setShowModal(true)}
                        >
                          {profileImage ? (
                            <img
                              name="profile_pic"
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
                              {/* <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                              /> */}
                            </label>
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
                                    <FaCamera /> Take Photo
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
                            {/* {!duplicateError && matchingUsers.length > 0 && (
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
                            )} */}

                            {duplicateError && showDuplicateModal && (
                              <div className="text-red-500 text-sm">
                                Duplicate Entry
                              </div>
                            )}

                            {formik.errors?.mobile &&
                              formik.touched?.mobile && (
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
                            <label className="mb-2 block">
                              Email<span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                                <FaEnvelope />
                              </span>
                              <input
                                type="email"
                                name="email"
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                className="custom--input w-full input--icon"
                              />
                            </div>
                            {formik.errors?.email && formik.touched?.email && (
                              <div className="text-red-500 text-sm">
                                {formik.errors.email}
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="mb-2 block font-medium text-gray-700">
                              Gender<span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-2 flex-wrap">
                              <label
                                className={`flex items-center gap-2 px-4 py-2 rounded-[10px] border cursor-pointer shadow-sm transition
                                                   ${
                                                     formik.values.gender ===
                                                     "MALE"
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
                                                     formik.values.gender ===
                                                     "FEMALE"
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
                                                     formik.values.gender ===
                                                     "NOTDISCLOSE"
                                                       ? "bg-black text-white border-black"
                                                       : "bg-white text-gray-700 border-gray-300"
                                                   }`}
                              >
                                <input
                                  type="radio"
                                  name="gender"
                                  value="NOTDISCLOSE"
                                  checked={
                                    formik.values.gender === "NOTDISCLOSE"
                                  }
                                  onChange={formik.handleChange}
                                  className="hidden"
                                />
                                <IoBan />
                                Not to Disclose
                              </label>
                            </div>
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
                            {formik.errors?.date_of_birth &&
                              formik.touched?.date_of_birth && (
                                <div className="text-red-500 text-sm">
                                  {formik.errors.date_of_birth}
                                </div>
                              )}
                          </div>

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
                            {formik.errors?.address &&
                              formik.touched?.address && (
                                <div className="text-red-500 text-sm">
                                  {formik.errors.address}
                                </div>
                              )}
                          </div>
                          <div>
                            <label className="mb-2 block">
                              Location<span className="text-red-500">*</span>
                            </label>
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
                            {formik.errors?.location &&
                              formik.touched?.location && (
                                <div className="text-red-500 text-sm">
                                  {formik.errors.location}
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
                          <label className="mb-2 block">Interested In</label>
                          <div className="relative">
                            <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                              <FaListCheck />
                            </span>
                            <Select
                              name="interested_in"
                              value={servicesName.find(
                                (opt) =>
                                  opt.value === formik.values.interested_in
                              )}
                              onChange={(option) =>
                                formik.setFieldValue(
                                  "interested_in",
                                  option.value
                                )
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
                                formik.setFieldValue(
                                  "lead_source",
                                  option.value
                                )
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
                        {/* <div>
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
                        )} */}
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
                                formik.values?.professionalInformation
                                  ?.designation
                              }
                              onChange={formik.handleChange}
                              className="custom--input w-full input--icon"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="mb-2 block">
                            Company<span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                              <FaBuilding />
                            </span>
                            <Select
                              name="company_name"
                              value={
                                companyOptions.find(
                                  (opt) =>
                                    opt.value === formik.values.company_name
                                ) ||
                                (formik.values.company_name && {
                                  value: formik.values.company_name,
                                  label: formik.values.company_name,
                                }) // ✅ fallback for raw string
                              }
                              onChange={(option) => {
                                formik.setFieldValue(
                                  "company_name",
                                  option.value
                                );
                              }}
                              options={companyOptions}
                              isLoading={loading}
                              styles={selectIcon}
                            />
                          </div>

                          {formik.errors?.company_name &&
                            formik.touched?.company_name && (
                              <div className="text-red-500 text-sm">
                                {formik.errors.company_name}
                              </div>
                            )}
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
                                formik.values?.professionalInformation
                                  ?.officialEmail
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
                      {formik.values?.emergencyContacts?.map(
                        (contact, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-3 gap-4 mb-4 border p-4 rounded-lg"
                          >
                            {/* Name Field */}
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
                              {formik.errors?.emergencyContacts?.[index]
                                ?.name &&
                                formik.touched?.emergencyContacts?.[index]
                                  ?.name && (
                                  <div className="text-red-500 text-sm">
                                    {
                                      formik.errors.emergencyContacts[index]
                                        .name
                                    }
                                  </div>
                                )}
                            </div>

                            {/* Contact Number Field */}
                            <div>
                              <label className="mb-2 block">Number</label>
                              <PhoneInput
                                name={`emergencyContacts.${index}.contact`}
                                value={contact?.contact}
                                onChange={(value) =>
                                  handleEmergancyPhone(value, index)
                                } // Ensure this function handles formik update
                                international
                                defaultCountry="IN"
                                countryCallingCodeEditable={false}
                                className="custom--input w-full custom--phone"
                              />
                              {formik.errors?.emergencyContacts?.[index]
                                ?.contact &&
                                formik.touched?.emergencyContacts?.[index]
                                  ?.contact && (
                                  <div className="text-red-500 text-sm">
                                    {
                                      formik.errors.emergencyContacts[index]
                                        .contact
                                    }
                                  </div>
                                )}
                            </div>

                            {/* Relationship Field */}
                            <div>
                              <label className="mb-2 block">Relationship</label>
                              <div className="custom--date dob-format relative">
                                <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                                  <FaLink />
                                </span>
                                <Select
                                  name={`emergencyContacts.${index}.relationship`}
                                  value={relationList.find(
                                    (opt) =>
                                      opt.value === formik.values.lead_source
                                  )}
                                  onChange={(option) =>
                                    formik.setFieldValue(
                                      `emergencyContacts.${index}.relationship`,
                                      option.value
                                    )
                                  }
                                  options={relationList}
                                  styles={selectIcon}
                                />
                              </div>
                              {formik.errors?.emergencyContacts?.[index]
                                ?.relationship &&
                                formik.touched?.emergencyContacts?.[index]
                                  ?.relationship && (
                                  <div className="text-red-500 text-sm">
                                    {
                                      formik.errors.emergencyContacts[index]
                                        .relationship
                                    }
                                  </div>
                                )}
                            </div>

                            {/* Remove Button */}
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
                        )
                      )}

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
                              value={
                                formik.values?.membershipDetails?.leadOwner
                              }
                              readOnly={true}
                              className="custom--input w-full input--icon bg-[#fafafa] pointer-events-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="mb-2 block">Club</label>

                          <div className="relative">
                            <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                              <FaBuilding />
                            </span>
                            <input
                              type="text"
                              name="membershipDetails.centre"
                              value={formik.values?.membershipDetails?.centre}
                              readOnly={true}
                              className="custom--input w-full input--icon bg-[#fafafa] pointer-events-none"
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
                              value={
                                formik.values?.membershipDetails?.leadOwner
                              }
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
