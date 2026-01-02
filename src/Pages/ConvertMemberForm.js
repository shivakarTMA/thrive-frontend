import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "react-phone-number-input/style.css";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { formatText, selectIcon } from "../Helper/helper";
import { IoBan, IoCloseCircle } from "react-icons/io5";
import { PiGenderIntersex, PiGenderIntersexBold } from "react-icons/pi";
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
  FaCalendarDays,
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
import { authAxios, phoneAxios } from "../config/config";
import { fetchOptionList } from "../Redux/Reducers/optionListSlice";
import Webcam from "react-webcam";
import { IoCheckmark, IoClose } from "react-icons/io5";
import MultiSelect from "react-multi-select-component";

const planTypeOption = [
  { value: "DLF", label: "DLF" },
  { value: "NONDLF", label: "NONDLF" },
];
const genderOptions = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "NOTDISCLOSE", label: "Prefer Not To Say" },
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
        const phoneNumber = parsePhoneNumberFromString(
          "+" + country_code + value
        );
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
          phone: Yup.string()
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
    plan_type: Yup.string().required("Plan Type is required"),
    start_date: Yup.string().required("Start Date is required"),
    productDetails: Yup.object({
      title: Yup.string().required("Product is required"),
    }),
  }),
];

const ConvertMemberForm = ({
  setMemberModal,
  selectedLeadMember,
  onLeadUpdate,
}) => {
  const [allLeads, setAllLeads] = useState([]);
  const [profileImage, setProfileImage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const webcamRef = useRef(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [step, setStep] = useState(0);
  const { user } = useSelector((state) => state.auth);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [duplicateEmailError, setDuplicateEmailError] = useState("");
  const [showDuplicateEmailModal, setShowDuplicateEmailModal] = useState(false);

  const [voucherInput, setVoucherInput] = useState("");
  const [voucherStatus, setVoucherStatus] = useState(null); // "success", "error", or null
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [selected, setSelected] = useState([]);

  const leadBoxRef = useRef(null);
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
    dispatch(fetchOptionList("GOAL"));
    dispatch(fetchOptionList("RELATIONSHIP"));
    dispatch(fetchOptionList("SOCIAL_MEDIA"));
  }, [dispatch]);

  // Extract Redux lists
  const leadsSources = lists["LEAD_SOURCE"] || [];
  const leadTypes = lists["LEAD_TYPE"] || [];
  const servicesName = lists["GOAL"] || [];
  const relationList = lists["RELATIONSHIP"] || [];
  const socialList = lists["SOCIAL_MEDIA"] || [];

  const initialValues = {
    id: "",
    club_id: null,
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
    interested_in: [],
    lead_source: "",
    lead_type: "",
    platform: "",
    schedule: "",
    schedule_date_time: "",
    created_by: null,
    staff_name: "",
    professionalInformation: {
      designation: "",
      companyName: "",
      officialEmail: "",
    },
    emergencyContacts: [
      {
        name: "",
        phone: "",
        relationship: "",
      },
    ],
    lead_owner: "",
    club_data: {
      name: "",
      state: "",
      country: "",
    },
    invoiceDate: "",
    productType: "MEMBERSHIP_PLAN",
    plan_type: "",
    start_date: "",
    productDetails: {
      id: null,
      title: "",
      duration_value: 0,
      duration_type: "",
      amount: 0,
      discount: 0,
      total_amount: 0,
      gst: 0,
      gst_amount: 0,
      final_amount: 0,
    },
    coupon: "",
    discountAmount: 0,
    final_amount: 0,
    amount_pay: 0,
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

          // // ✅ Update existing member
          const memberResponse = await authAxios().put(
            `/member/convert/lead/${selectedLeadMember}`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
          );

          // // ✅ Get member_id from response (or use selectedLeadMember.id if API doesn't return)
          const memberId =
            memberResponse.data?.member_id || selectedLeadMember;

          if (values.emergencyContacts?.length > 0) {
            for (const contact of values.emergencyContacts) {
              if (contact.name && contact.phone) {
                await authAxios().post("/member-emergency-contact/create", {
                  member_id: memberId,
                  name: contact.name,
                  relationship: contact.relationship,
                  phone: contact.phone,
                  alt_phone: contact.alt_phone || "",
                  email: contact.email || "",
                  address: contact.address || "",
                });
              }
            }
          }

          // 3️⃣ Proceed to payment (IMPORTANT PART)
          if (values.productDetails?.id) {
            const paymentPayload = {
              subscription_plan_id: values.productDetails.id,
              order_type: "SUBSCRIPTION",
              start_date: values.start_date
                ? new Date(values.start_date).toISOString().split("T")[0]
                : null,
              coins: 0,
              coupon_code: values.coupon || "",
              applicable_ids: [values.productDetails.id],
              member_id: selectedLeadMember,
            };

            console.log("paymentPayload", paymentPayload);

            await authAxios().post("/payment/proceed", paymentPayload);
          }

          toast.success("Member created and payment initiated!");

          // toast.success("Member created successfully!");

          setMemberModal(false);
          onLeadUpdate();
        } catch (error) {
          // toast.error("Failed to create member. Please try again.");
          console.log(error, "error");
          toast.error(error.response?.data?.message);
        }
      } else {
        setStep(step + 1);
      }
      setStep(step + 1);
    },
  });

  // ✅ Fetch lead details when selectedId changes
  useEffect(() => {
    if (!selectedLeadMember) return;

    const fetchLeadById = async (id) => {
      try {
        const res = await authAxios().get(`/lead/${id}`);
        const data = res.data?.data || res.data || null;

        if (data) {
          // ✅ Prefill formik fields with fetched data
          const dobIso = data.date_of_birth
            ? new Date(data.date_of_birth).toISOString()
            : "";

          const interestedList = Array.isArray(data.interested_in)
            ? data.interested_in.map((v) => ({ label: v, value: v }))
            : [];

          const emergencyContacts =
            data.emergencyContacts && data.emergencyContacts.length > 0
              ? data.emergencyContacts
              : [
                  {
                    name: "",
                    phone: "",
                    relationship: "",
                  },
                ];

          formik.setValues({
            id: data.id || "",
            club_id: data.club_id || null,
            profile_pic: data.profile_pic || "",
            full_name: data.full_name || "",
            mobile: data.country_code ? data.mobile : "",
            country_code: data.country_code || "",
            phoneFull: data.country_code
              ? `+${data.country_code}${data.mobile}`
              : "",
            country_code: data.country_code || "",
            email: data.email || "",
            gender: data.gender || "NOTDISCLOSE",
            date_of_birth: dobIso,
            address: data.address || "",
            location: data.location || "",
            company_name: data.company_name || "",
            interested_in: interestedList.map((i) => i.value),
            lead_source: data.lead_source || "",
            lead_type: data.lead_type || "",
            platform: data.platform || "",
            schedule: data.schedule || "",
            invoiceDate:
              data.invoiceDate || new Date().toISOString().split("T")[0],
            schedule_date_time: data.schedule_date_time
              ? new Date(data.schedule_date_time).toISOString()
              : "",
            start_date: new Date(),
            created_by: data.created_by || null,
            staff_name: data.staff_name || "",
            emergencyContacts: emergencyContacts,
            lead_owner: data.lead_owner || "",
            club_data: data.club_data || { name: "", state: "", country: "" },
            productType: "MEMBERSHIP_PLAN",
          });
          setSelected(interestedList);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch module details");
      }
    };

    fetchLeadById(selectedLeadMember);
  }, [selectedLeadMember]);

  const fetchLeadList = async () => {
    try {
      const res = await authAxios().get("/lead/list");
      let data = res.data?.data || res.data || [];
      setAllLeads(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch lead");
    }
  };
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
        value: company.name,
        label: company.name,
      }));

      // ✅ Update state
      setCompanyOptions(options);
    } catch (err) {
      console.error("❌ Failed to fetch companies:", err);
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
      console.log("Validation errors:", errors);
      return { errors, touched: touchedFields };
    }
  };

  // const handleProductSubmit = (product) => {
  //   formik.setFieldValue("productDetails.title", product.title);
  //   formik.setFieldValue("productDetails.id", product.id);
  //   formik.setFieldValue(
  //     "productDetails.duration_value",
  //     product.duration_value
  //   );
  //   formik.setFieldValue("productDetails.duration_type", product.duration_type);
  //   formik.setFieldValue("productDetails.amount", product.amount);
  //   formik.setFieldValue("productDetails.total_amount", product.total_amount);
  //   formik.setFieldValue("productDetails.discount", product.discount);
  //   formik.setFieldValue("productDetails.gst", product.gst);
  //   formik.setFieldValue("productDetails.gst_amount", product.gst_amount);
  //   formik.setFieldValue("productDetails.final_amount", product.final_amount);
  // };

  const handleProductSubmit = (product) => {
    // Convert to numbers safely
    const amount = Number(product.amount) || 0;
    const discount = Number(product.discount) || 0;
    const gstPercent = Number(product.gst) || 0;

    // Base calculation
    const totalAmount = amount - discount;
    const gstAmount = (totalAmount * gstPercent) / 100;
    const finalAmount = totalAmount + gstAmount;

    // 🔥 Reset coupon when product changes
    setVoucherInput("");
    setVoucherStatus(null);
    setSelectedVoucher(null);

    formik.setValues({
      ...formik.values,
      productDetails: {
        id: product.id,
        title: product.title,
        duration_value: product.duration_value,
        duration_type: product.duration_type,
        amount,
        discount,
        total_amount: totalAmount,
        gst: gstPercent,
        gst_amount: gstAmount,
        final_amount: finalAmount,
      },
      coupon: "",
      discountAmount: 0,
      final_amount: finalAmount,
      amount_pay: finalAmount,
    });
  };

  const applyCoupon = async () => {
    if (!voucherInput.trim()) return;

    if (!formik.values.productDetails?.id) {
      toast.error("Please select a product before applying a coupon");
      return;
    }

    try {
      setVoucherStatus("loading");

      const payload = {
        coupon: voucherInput.trim(),
        applicable_ids: [formik.values.productDetails?.id],
        applicable_type: "SUBSCRIPTION",
        amount: formik.values.productDetails?.total_amount,
        club_id: formik.values.club_id,
      };

      const res = await authAxios().post("/coupon/applicable", payload);
      const data = res.data?.data;

      const couponDiscount = Number(data.discountAmount) || 0;

      const totalAmount =
        Number(formik.values.productDetails.total_amount) || 0;
      const gstPercent = Number(formik.values.productDetails.gst) || 0;

      const discountedTotal = totalAmount - couponDiscount;
      const gstAmount = (discountedTotal * gstPercent) / 100;
      const finalAmount = discountedTotal + gstAmount;

      setSelectedVoucher(data);
      setVoucherStatus("success");

      formik.setValues({
        ...formik.values,
        coupon: voucherInput,
        discountAmount: couponDiscount,
        productDetails: {
          ...formik.values.productDetails,
          gst_amount: gstAmount,
        },
        final_amount: finalAmount,
        amount_pay: finalAmount,
      });
    } catch (err) {
      setSelectedVoucher(null);
      setVoucherStatus("error");

      // ✅ SAFE fallback
      const originalFinal =
        Number(formik.values.productDetails?.final_amount) || 0;

      formik.setValues({
        ...formik.values,
        coupon: "",
        discountAmount: 0,
        final_amount: originalFinal,
        amount_pay: originalFinal,
      });

      toast.error(err?.response?.data?.message || "Invalid or expired coupon");
    }
  };

  const handleApplyVoucher = () => {
    applyCoupon();
  };

  const handleAddContact = () => {
    const currentContacts = formik.values.emergencyContacts || [];
    formik.setFieldValue("emergencyContacts", [
      ...currentContacts,
      { name: "", phone: "", relationship: "" },
    ]);
  };

  const handleRemoveContact = (index) => {
    const updated = [...formik.values.emergencyContacts];
    updated.splice(index, 1);
    formik.setFieldValue("emergencyContacts", updated);
  };

  const handleEmergancyPhone = (value, index) => {
    const updated = [...formik.values.emergencyContacts];
    updated[index].phone = value;
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
      const endpoint = selectedLeadMember
        ? `/lead/verify/availability/${selectedLeadMember}` // If lead is selected, use verification endpoint
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

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      setMemberModal(false);
    }
  };

  const handleLeadModal = () => {
    setMemberModal(false);
  };

  useEffect(() => {
    if (!formik.values.plan_type) return;

    formik.setValues({
      ...formik.values,
      productDetails: {
        id: null,
        title: "",
        duration_value: 0,
        duration_type: "",
        amount: 0,
        discount: 0,
        total_amount: 0,
        gst: 0,
        gst_amount: 0,
        final_amount: 0,
      },
      coupon: "",
      discountAmount: 0,
      final_amount: 0,
      amount_pay: 0,
    });

    // reset local UI state
    setVoucherInput("");
    setVoucherStatus(null);
    setSelectedVoucher(null);
  }, [formik.values.plan_type]);

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
              {selectedLeadMember ? "Convert a Member" : "Create a Member"}
            </h2>
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
                                onBlur={handleEmailBlur}
                                className="custom--input w-full input--icon"
                              />
                            </div>
                            {formik.errors?.email && formik.touched?.email && (
                              <div className="text-red-500 text-sm">
                                {formik.errors.email}
                              </div>
                            )}
                            {duplicateEmailError && showDuplicateEmailModal && (
                              <div className="text-red-500 text-sm">
                                {duplicateEmailError}
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="mb-2 block font-medium text-gray-700">
                              Gender<span className="text-red-500">*</span>
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

                          <div className="col-span-3">
                            <label className="mb-2 block">Address</label>
                            <div className="relative">
                              <input
                                name="address"
                                value={formik.values.address}
                                onChange={formik.handleChange}
                                className="custom--input w-full"
                              />
                            </div>
                            {formik.errors?.address &&
                              formik.touched?.address && (
                                <div className="text-red-500 text-sm">
                                  {formik.errors.address}
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

                            <MultiSelect
                              options={servicesName}
                              value={selected} // selected objects
                              onChange={(serviceList) => {
                                setSelected(serviceList); // UI needs objects
                                const values = serviceList.map(
                                  (opt) => opt.value
                                );
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
                                selected
                                  ? "cursor-not-allowed pointer-events-none !bg-gray-100"
                                  : ""
                              }`}
                              disabled={!!selected}
                            />

                            {/* <MultiSelect
                              options={servicesName}
                              value={selected} // selected objects
                              onChange={(servicesName) => {
                                setSelected(servicesName); // set objects
                                const values = servicesName.map(
                                  (opt) => opt.value
                                ); // only IDs
                                formik.setFieldValue("interested_in", values);
                              }}
                              labelledBy="Select..."
                              hasSelectAll={false}
                              disableSearch={true}
                              overrideStrings={{
                                selectSomeItems: "Select Interested...",
                                allItemsAreSelected: "All Interested Selected",
                                // search: "Search",
                              }}
                              className="custom--input w-full input--icon multi--select--new"
                            /> */}
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
                              type="text"
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
                      {formik.values?.emergencyContacts?.map((phone, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-3 gap-4 mb-4 border p-4 rounded-lg"
                        >
                          {/* Name Field */}
                          <div>
                            <label className="mb-2 block">
                              Name<span className="text-red-500">*</span>
                            </label>
                            <div className="custom--date dob-format relative">
                              <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                                <FaUser />
                              </span>
                              <input
                                type="text"
                                name={`emergencyContacts.${index}.name`}
                                value={phone?.name}
                                onChange={formik.handleChange}
                                className="custom--input w-full input--icon"
                              />
                            </div>
                            {formik.errors?.emergencyContacts?.[index]?.name &&
                              formik.touched?.emergencyContacts?.[index]
                                ?.name && (
                                <div className="text-red-500 text-sm">
                                  {formik.errors.emergencyContacts[index].name}
                                </div>
                              )}
                          </div>

                          {/* Contact Number Field */}
                          <div>
                            <label className="mb-2 block">
                              Number<span className="text-red-500">*</span>
                            </label>
                            <PhoneInput
                              name={`emergencyContacts.${index}.phone`}
                              value={phone?.phone}
                              onChange={(value) =>
                                handleEmergancyPhone(value, index)
                              } // Ensure this function handles formik update
                              international
                              defaultCountry="IN"
                              countryCallingCodeEditable={false}
                              className="custom--input w-full custom--phone"
                            />
                            {formik.errors?.emergencyContacts?.[index]?.phone &&
                              formik.touched?.emergencyContacts?.[index]
                                ?.phone && (
                                <div className="text-red-500 text-sm">
                                  {formik.errors.emergencyContacts[index].phone}
                                </div>
                              )}
                          </div>

                          {/* Relationship Field */}
                          <div>
                            <label className="mb-2 block">
                              Relationship
                              <span className="text-red-500">*</span>
                            </label>
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
                              name="lead_owner"
                              value={formik.values?.lead_owner}
                              readOnly={true}
                              disabled={true}
                              className="custom--input w-full input--icon !bg-gray-100 pointer-events-none"
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
                              name="club_data.name"
                              value={formik.values?.club_data?.name}
                              readOnly={true}
                              disabled={true}
                              className="custom--input w-full input--icon !bg-gray-100 pointer-events-none"
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
                              name="club_data.state"
                              value={formik.values?.club_data?.state}
                              readOnly={true}
                              disabled={true}
                              className="custom--input w-full input--icon !bg-gray-100 pointer-events-none"
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
                              name="club_data.country"
                              value={formik.values?.club_data?.country}
                              readOnly={true}
                              disabled={true}
                              className="custom--input w-full input--icon !bg-gray-100 pointer-events-none"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <h3 className="text-2xl font-semibold mb-2">
                        Subscription plan
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="mb-2 block">
                            Plan Type<span className="text-red-500">*</span>
                          </label>

                          <div className="relative">
                            <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                              <FaListCheck />
                            </span>
                            <Select
                              name="plan_type"
                              value={planTypeOption.find(
                                (opt) => opt.value === formik.values.plan_type
                              )}
                              options={planTypeOption}
                              onChange={(option) =>
                                formik.setFieldValue("plan_type", option.value)
                              }
                              styles={selectIcon}
                              className="!capitalize"
                            />
                          </div>
                          {formik.errors?.plan_type &&
                            formik.touched?.plan_type && (
                              <div className="text-red-500 text-sm">
                                {formik.errors?.plan_type}
                              </div>
                            )}
                        </div>
                        <div>
                          <label className="mb-2 block">
                            Product Name<span className="text-red-500">*</span>
                          </label>
                          <div
                            className="relative"
                            onClick={() => {
                              setShowProductModal(true);
                              // setSelectedType(formik.values.productType);
                            }}
                          >
                            <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                              <FaListCheck />
                            </span>
                            <input
                              name="productDetails.title"
                              value={formik.values?.productDetails?.title}
                              onChange={formik.handleChange}
                              className="custom--input w-full input--icon"
                              readOnly={true}
                            />
                          </div>
                          {formik.errors?.productDetails?.title &&
                            formik.touched?.productDetails?.title && (
                              <div className="text-red-500 text-sm">
                                {formik.errors?.productDetails?.title}
                              </div>
                            )}
                        </div>
                        <div>
                          <label className="mb-2 block">Start Date</label>
                          <div className="custom--date relative">
                            <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                              <FaCalendarDays />
                            </span>
                            <DatePicker
                              selected={
                                formik.values.start_date
                                  ? new Date(formik.values.start_date)
                                  : new Date() // ✅ fallback to today
                              }
                              onChange={(date) =>
                                formik.setFieldValue("start_date", date)
                              }
                              minDate={new Date()} // ❌ disables past dates
                              dateFormat="dd MMM yyyy"
                              yearDropdownItemNumber={100}
                              placeholderText="Select date"
                              className="input--icon"
                            />
                          </div>
                          {formik.errors?.start_date &&
                            formik.touched?.start_date && (
                              <div className="text-red-500 text-sm">
                                {formik.errors?.start_date}
                              </div>
                            )}
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
                              Voucher applied successfully
                            </p>
                          )}
                          {voucherStatus === "error" && (
                            <p className="text-red-600 text-sm mt-1">
                              Invalid voucher code.
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-5 bg-[#f7f7f7] p-[20px] rounded-[10px]">
                        <h3 className="text-2xl font-semibold">
                          Price Calculation
                        </h3>
                        <div className="price--calculation2 my-5">
                          <div className="price--item">
                            <p className="flex items-center gap-2 justify-between mb-2 border-b pb-2">
                              Duration:{" "}
                              <span className="font-bold">
                                {formik.values.productDetails?.duration_value ??
                                  0}{" "}
                                {formik.values.productDetails?.duration_type}
                              </span>
                            </p>
                          </div>
                          <div className="price--item">
                            <p className="flex items-center gap-2 justify-between mb-2 border-b pb-2">
                              Total:{" "}
                              <span className="font-bold flex items-center gap-2">
                                <del className="text-gray-500 text-sm">
                                  ₹{formik.values.productDetails?.amount ?? 0}
                                </del>{" "}
                                <span>
                                  {" "}
                                  ₹
                                  {formik.values.productDetails?.total_amount ??
                                    0}
                                </span>
                              </span>
                            </p>
                          </div>
                          <div className="price--item">
                            <p className="flex items-center gap-2 justify-between mb-2 border-b pb-2">
                              Discount Code Applied:{" "}
                              <span className="font-bold">
                                ₹{formik.values.discountAmount ?? 0}
                              </span>
                            </p>
                          </div>
                          <div className="price--item">
                            <p className="flex items-center gap-2 justify-between mb-2 border-b pb-2">
                              GST:{" "}
                              <span className="font-bold">
                                ₹{formik.values.productDetails?.gst_amount ?? 0}
                              </span>
                            </p>
                          </div>
                          <div className="price--item">
                            <p className="flex items-center gap-2 justify-between mb-2 border-b pb-2">
                              Grand Total:{" "}
                              <span className="font-bold">
                                ₹{formik.values.final_amount ?? 0}
                              </span>
                            </p>
                          </div>
                        </div>
                        <p className="text-2xl font-semibold flex items-center gap-2 justify-between pb-2">
                          To Pay:{" "}
                          <span className="font-bold">
                            ₹{formik.values.amount_pay ?? 0}
                          </span>
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

                <div className="flex gap-2 items-center justify-end flex-1">
                  <button
                    type="button"
                    className="px-4 py-2 bg-white text-black font-semibold rounded max-w-[150px] w-full"
                    onClick={handleNextStep}
                  >
                    {step === stepValidationSchemas.length - 1
                      ? "Offline Payment"
                      : "Next"}
                  </button>
                  {step === stepValidationSchemas.length - 1 && (
                    <button
                      type="button"
                      className="px-4 py-2 bg-black text-white font-semibold rounded max-w-[150px] w-full"
                    >
                      Online Payment
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {showProductModal && (
        <ProductModal
          selectedType={formik.values?.productType}
          planType={formik.values?.plan_type}
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

export default ConvertMemberForm;
