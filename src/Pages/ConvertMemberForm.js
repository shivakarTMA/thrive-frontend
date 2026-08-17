import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "react-phone-number-input/style.css";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import {
  allowLettersAndNumbers,
  allowOnlyLetters,
  allowOnlyNumbers,
  blockInvalidNumberKeys,
  blockNonLetters,
  blockNonLettersAndNumbers,
  blockNonNumbers,
  customStyles,
  formatIndianNumber,
  formatText,
  sanitizeAlphaNumeric,
  sanitizePositiveInteger,
  sanitizeText,
  sanitizeTextWithNumbers,
  selectIcon,
} from "../Helper/helper";
import { IoBan, IoCloseCircle, IoEyeOutline } from "react-icons/io5";
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
import { IoIosCloseCircle, IoIosTime } from "react-icons/io";
import { LuIndianRupee } from "react-icons/lu";
import { toast } from "react-toastify";
import { authAxios, phoneAxios } from "../config/config";
import { fetchOptionList } from "../Redux/Reducers/optionListSlice";
import Webcam from "react-webcam";
import { IoCheckmark, IoClose } from "react-icons/io5";
import MultiSelect from "react-multi-select-component";
import { CgFormatLineHeight } from "react-icons/cg";
import CreatableSelect from "react-select/creatable";
import { FiUpload } from "react-icons/fi";
import { MdModeEditOutline, MdOutlineFileDownload } from "react-icons/md";

const planTypeOption = [
  { value: "DLF", label: "DLF" },
  { value: "NONDLF", label: "NONDLF" },
];
const genderOptions = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "NOTDISCLOSE", label: "Prefer Not To Say" },
];

const paymentMethodOptions = [
  { value: "NET_BANKING", label: "Net Banking" },
  { value: "DEBIT_CARD", label: "Debit Card" },
  { value: "CREDIT_CARD", label: "Credit Card" },
  { value: "UPI_ICICI", label: "UPI" },
  // { value: "CHEQUE", label: "cheque" },
];

//  'CREDIT_CARD','DEBIT_CARD','UPI_ICICI','NET_BANKING'

const IMAGE_FILE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const DOCUMENT_FILE_TYPES = [
  ...IMAGE_FILE_TYPES,
  "application/pdf",
];

const stepValidationSchemas = [
  // ✅ Step 0: Full set of required fields
  Yup.object({
    full_name: Yup.string().required("First Name is required"),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    height: Yup.string().required("Height is required"),
    gender: Yup.string().required("Gender is required"),

    mobile: Yup.string()
      .required("Contact number is required")
      .test("valid-phone", "Invalid phone number", function (value) {
        if (!value) return false;

        // Add default country "IN"
        const phoneNumber = parsePhoneNumberFromString(value, "IN");

        if (!phoneNumber || !phoneNumber.isValid()) {
          return false;
        }

        const nationalNumber = phoneNumber.nationalNumber;

        // Block repeated digits like 1111111111
        if (/^(\d)\1+$/.test(nationalNumber)) {
          return false;
        }

        // Block simple sequences
        if (
          nationalNumber === "1234567890" ||
          nationalNumber === "0123456789"
        ) {
          return false;
        }

        return true;
      }),

    date_of_birth: Yup.string()
      .nullable()
      .required("Date of birth is required")
      .max(new Date(), "Date of birth cannot be in the future"),
    pincode: Yup.string().required("Pincode is required"),
    lead_source: Yup.string().required("Lead Source is required"),
    lead_type: Yup.string().required("Lead Type is required"),
    platform: Yup.string().when("lead_source", {
      is: (val) => ["Social Media", "Events/Campaigns"].includes(val),
      then: () => Yup.string().required("This is required"),
    }),
  }),
  Yup.object({
    company_name: Yup.string().required("Company is required"),
    member_emergency_contact: Yup.array()
      .of(
        Yup.object({
          name: Yup.string().required("Name is required"),
          // phone: Yup.string()
          //   .required("Contact number is required")
          //   .test("is-valid-phone", "Invalid phone number", function (value) {
          //     return isValidPhoneNumber(value || "");
          //   }),
          phone: Yup.string()
            .required("Contact number is required")
            .test("valid-phone", "Invalid phone number", function (value) {
              if (!value) return false;

              const phoneNumber = parsePhoneNumberFromString(value);

              // ❌ Not parsable
              if (!phoneNumber || !phoneNumber.isValid()) {
                return false;
              }

              const nationalNumber = phoneNumber.nationalNumber;

              // ❌ Block same digits (1111111111, 5555555555)
              if (/^(\d)\1+$/.test(nationalNumber)) {
                return false;
              }

              // ❌ Block simple sequences
              if (
                nationalNumber === "1234567890" ||
                nationalNumber === "0123456789"
              ) {
                return false;
              }

              return true;
            }),
          relationship: Yup.string().required("Relationship is required"),
        }),
      )
      .min(1, "At least one emergency contact is required"),
    id_proof_card_front: Yup.mixed()
      .required("Aadhar front is required")
      .test("fileType", "Only JPG, JPEG, PNG, WEBP and PDF files are allowed", (value) => {
        if (!value) return false;

        // ✅ allow existing image URL (edit mode)
        if (typeof value === "string") return true;

        return DOCUMENT_FILE_TYPES.includes(value.type);
      }),

    id_proof_card_back: Yup.mixed()
      .required("Aadhar back is required")
      .test("fileType", "Only JPG, JPEG, PNG, WEBP and PDF files are allowed", (value) => {
        if (!value) return false;
        if (typeof value === "string") return true;

        return DOCUMENT_FILE_TYPES.includes(value.type);
      }),

    passport_photo: Yup.mixed()
      .required("Passport photo is required")
      .test("fileType", "Only JPG, JPEG, PNG, WEBP allowed", (value) => {
        if (!value) return false;
        if (typeof value === "string") return true;

        return IMAGE_FILE_TYPES.includes(value.type);
      }),

    corporate_id: Yup.mixed().when("club_data", {
      is: (club_data) => club_data?.is_corporate_id === true,

      then: () =>
        Yup.mixed()
          .required("Corporate ID is required")
          .test(
            "fileType",
            "Only JPG, JPEG, PNG, WEBP and PDF files are allowed",
            (value) => {
              if (!value) return false;

              // existing image URL
              if (typeof value === "string") return true;

              return DOCUMENT_FILE_TYPES.includes(value.type);
            }
          ),

      otherwise: () =>
        Yup.mixed()
          .nullable()
          .test(
            "fileType",
            "Only JPG, JPEG, PNG, WEBP and PDF files are allowed",
            (value) => {
              // optional field
              if (!value) return true;

              // existing image URL
              if (typeof value === "string") return true;

              return DOCUMENT_FILE_TYPES.includes(value.type);
            }
          ),
    }),
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
  setLoading,
}) => {
  const [allLeads, setAllLeads] = useState([]);
  const [profileImage, setProfileImage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const webcamRef = useRef(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [step, setStep] = useState(0);
  const { user } = useSelector((state) => state.auth);
  const userRole = user.role;
  const [companyOptions, setCompanyOptions] = useState([]);
  const [duplicateEmailError, setDuplicateEmailError] = useState("");
  const [showDuplicateEmailModal, setShowDuplicateEmailModal] = useState(false);
  const [clubGstType, setClubGstType] = useState("");

  const [isEditingDocs, setIsEditingDocs] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [showDocumentCamera, setShowDocumentCamera] = useState(false);
  const [selectedDocumentField, setSelectedDocumentField] = useState("");
  const documentWebcamRef = useRef(null);

  const [offlinePaymentDetails, setOfflinePaymentDetails] = useState({
    method: null,
    transactionId: "",
  });
  const [offlineErrors, setOfflineErrors] = useState({
    method: "",
    transactionId: "",
  });
  const [showGstDetails, setShowGstDetails] = useState(false);
  const initialGstState = {
    gst_registration_number: "",
    gst_registered_company_name: "",
    gst_registered_company_address: "",
  };
  const [customerGstData, setCustomerGstData] = useState(initialGstState);

  const [gstErrors, setGstErrors] = useState({
    gst_registration_number: "",
    gst_registered_company_name: "",
    gst_registered_company_address: "",
  });
  const paymentModeRef = useRef("ONLINE");

  const [hasPlans, setHasPlans] = useState(false);
  const [checkingPlans, setCheckingPlans] = useState(false);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");
  const [orderNo, setOrderNo] = useState("");

  const [voucherInput, setVoucherInput] = useState("");
  const [voucherStatus, setVoucherStatus] = useState(null); // "success", "error", or null
  const [voucherMessage, setVoucherMessage] = useState("");
  const [selected, setSelected] = useState([]);

  const leadBoxRef = useRef(null);
  const [duplicateError, setDuplicateError] = useState("");
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [hasDismissedDuplicateModal, setHasDismissedDuplicateModal] =
    useState(false);
  const [showUnderageModal, setShowUnderageModal] = useState(false);
  const [pendingDob, setPendingDob] = useState(null);
  const [profileError, setProfileError] = useState("");

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

  // Customer GST
  const handleGstCheckbox = (e) => {
    const checked = e.target.checked;

    setShowGstDetails(checked);

    // Reset fields + errors when unchecked
    if (!checked) {
      setCustomerGstData(initialGstState);

      setGstErrors({
        gst_registration_number: "",
        gst_registered_company_name: "",
        gst_registered_company_address: "",
      });
    }
  };

  const validateGstFields = () => {
    let errors = {};

    if (showGstDetails) {
      if (!customerGstData.gst_registration_number.trim()) {
        errors.gst_registration_number = "GST Number is required";
      }

      if (!customerGstData.gst_registered_company_name.trim()) {
        errors.gst_registered_company_name = "Company Name is required";
      }

      if (!customerGstData.gst_registered_company_address.trim()) {
        errors.gst_registered_company_address = "Company Address is required";
      }
    }

    setGstErrors(errors);

    return Object.keys(errors).length === 0;
  };
  // Customer GST end

  const validateOfflinePayment = () => {
    let errors = {
      method: "",
      transactionId: "",
    };

    if (paymentModeRef.current === "OFFLINE") {
      if (!offlinePaymentDetails.method?.value) {
        errors.method = "Payment method is required";
      }

      if (!offlinePaymentDetails.transactionId) {
        errors.transactionId = "Transaction ID is required";
      }
    }

    setOfflineErrors(errors);

    // return true if no errors
    return !errors.method && !errors.transactionId;
  };

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
    height: "",
    address: "",
    pincode: "",

    interested_in: [],
    lead_source: "",
    lead_type: "",
    platform: "",
    schedule: "",
    schedule_date_time: "",
    created_by: null,
    staff_name: "",
    company_id: null,
    company_name: "",
    designation: "",
    official_email: "",
    member_emergency_contact: [
      {
        name: "",
        phone: "",
        relationship: "",
      },
    ],
    aadhar_doc_id: null,
    passport_doc_id: null,
    corporate_doc_id: null,
    id_proof_card_front: null,
    id_proof_card_back: null,
    passport_photo: null,
    corporate_id: null,
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

  const uploadDocuments = async ({ memberId, documents, values }) => {
    try {
     
      // ===============================
      // 1️⃣ AADHAR (FRONT + BACK)
      // ===============================
      if (documents.aadharFront || documents.aadharBack) {
        const formData = new FormData();

        formData.append("member_id", memberId);
        formData.append("document_type", "ID_PROOF");

        if (documents.aadharFront?.file) {
          formData.append(
            "document_front_file",
            documents.aadharFront.file
          );
        }

        if (documents.aadharBack?.file) {
          formData.append(
            "document_back_file",
            documents.aadharBack.file
          );
        }

        // UPDATE
        if (values.aadhar_doc_id) {
          await authAxios().put(
            `/kyc/document/${values.aadhar_doc_id}`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
        }

        // CREATE
        else {
          await authAxios().post(
            `/kyc/document/create`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
        }
      }

      // ===============================
      // 2️⃣ PASSPORT PHOTO
      // ===============================
      if (documents.passportPhoto?.file) {
        const formData = new FormData();

        formData.append("member_id", memberId);
        formData.append("document_type", "PHOTO");

        formData.append(
          "document_front_file",
          documents.passportPhoto.file
        );

        // UPDATE
        if (values.passport_doc_id) {
          await authAxios().put(
            `/kyc/document/${values.passport_doc_id}`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
        }

        // CREATE
        else {
          await authAxios().post(
            `/kyc/document/create`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
        }
      }

    // ===============================
    // 3️⃣ CORPORATE ID
    // ===============================

    const hasCorporateFile =
      documents.corporateId?.file;

    const hasCorporateDocId =
      values.corporate_doc_id;

    // ✅ ONLY RUN API IF:
    // 1. new file uploaded
    // OR
    // 2. existing document id exists
    if (hasCorporateFile || hasCorporateDocId) {
      // ❌ If no new file and only existing id
      // don't hit API
      if (!hasCorporateFile) {
        return;
      }

      const formData = new FormData();

      formData.append("member_id", memberId);

      formData.append(
        "document_type",
        "CORPORATE_ID"
      );

      formData.append(
        "document_front_file",
        documents.corporateId.file
      );

      // ✅ UPDATE EXISTING
      if (hasCorporateDocId) {
        await authAxios().put(
          `/kyc/document/${hasCorporateDocId}`,
          formData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );
      }

      // ✅ CREATE NEW
      else {
        await authAxios().post(
          `/kyc/document/create`,
          formData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );
      }
    }


      return true; // ✅ success
    } catch (err) {
      console.log("Document upload error", err);
      throw err; // ❗ let caller handle error
    }
  };

  const formik = useFormik({
    initialValues,
    validationSchema: stepValidationSchemas[step],
    enableReinitialize: true,
    onSubmit: async (values) => {
      setLoading(true);
      if (step === stepValidationSchemas.length - 1) {
        try {
          // ✅ OFFLINE FLOW
          if (paymentModeRef.current === "OFFLINE") {
            const isValid = validateOfflinePayment();

            if (!isValid) {
              setLoading(false);
              return;
            }
          }

          // ===============================
          // ✅ COMPANY HANDLING (SOURCE OF TRUTH)
          // ===============================
          let companyId = null;
          // let companyName = values.company_name?.trim() || "";
          let companyName = typeof values.company_name === "string"
              ? values.company_name.trim()
              : values.company_name?.label || "";

          const existingCompany = companyOptions.find(
            (opt) => opt.label.toLowerCase() === companyName.toLowerCase(),
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

            const createdCompany = res.data?.data || res.data;

            companyId = createdCompany?.id ?? null;
            companyName = createdCompany?.name || companyName;

            if (!companyId) {
              throw new Error("Company ID not received from API");
            }

            setCompanyOptions((prev) => [
              ...prev,
              { value: companyId, label: companyName },
            ]);
          }

          const formData = new FormData();
          // Append simple fields
          Object.keys(values).forEach((key) => {
            if (["company_id", "company_name"].includes(key)) return;

            const value = values[key];

            if (
              typeof value === "object" &&
              value !== null &&
              !(value instanceof File)
            ) {
              formData.append(key, JSON.stringify(value));
            } else {
              formData.append(key, value ?? "");
            }
          });

          // ✅ Append company LAST (source of truth)
          if (companyId !== null) {
            formData.set("company_id", companyId);
          }

          if (companyName) {
            formData.set("company_name", companyName);
          }

          // // ✅ Update existing member
          const memberResponse = await authAxios().put(
            `/member/convert/lead/${selectedLeadMember}`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } },
          );

          // // ✅ Get member_id from response (or use selectedLeadMember.id if API doesn't return)
          const memberId = memberResponse.data?.member_id || selectedLeadMember;

          if (values.member_emergency_contact?.length > 0) {
            for (const contact of values.member_emergency_contact) {
              if (!contact.id && contact.name && contact.phone) {
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

              // (Optional) UPDATE existing contacts
              if (contact.id) {
                await authAxios().put(
                  `/member-emergency-contact/${contact.id}`,
                  {
                    name: contact.name,
                    relationship: contact.relationship,
                    phone: contact.phone,
                  },
                );
              }
            }
          }

          // Document KYC
          const documents = {
            aadharFront:
              values.id_proof_card_front instanceof File
                ? { file: values.id_proof_card_front }
                : null,

            aadharBack:
              values.id_proof_card_back instanceof File
                ? { file: values.id_proof_card_back }
                : null,

            passportPhoto:
              values.passport_photo instanceof File
                ? { file: values.passport_photo }
                : null,

            corporateId:
              values.corporate_id instanceof File
                ? { file: values.corporate_id }
                : null,
          };

          const hasAnyNewFile =
            documents.aadharFront ||
            documents.aadharBack ||
            documents.passportPhoto ||
            documents.corporateId;

          // ✅ Call upload function
          if (hasAnyNewFile) {
            try {
              await uploadDocuments({ memberId, documents, values });
              toast.success("Documents uploaded successfully!");
            } catch (err) {
              toast.error("Document upload failed");
              setLoading(false);
              return;
            }
          }

          // Proceed to payment (IMPORTANT PART)
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
              paymentMode: paymentModeRef.current,
              mode_of_payment: offlinePaymentDetails.method?.value,
              transaction_id: offlinePaymentDetails.transactionId,
              // ✅ Add GST fields directly in payload
              ...(showGstDetails && {
                gst_registration_number:
                  customerGstData.gst_registration_number,

                gst_registered_company_name:
                  customerGstData.gst_registered_company_name,

                gst_registered_company_address:
                  customerGstData.gst_registered_company_address,
              }),
            };

            const res = await authAxios().post(
              "/payment/proceed",
              paymentPayload,
            );

            if (res.data?.status) {
              // ✅ ONLINE FLOW
              if (paymentModeRef.current === "ONLINE") {
                const { paymentUrl, order_no } = res.data.response || {};
                setPaymentUrl(paymentUrl);
                setOrderNo(order_no);
                setPaymentModalOpen(true);
                setLoading(false);
                toast.success("Payment send successfully!");
              }
              if (paymentModeRef.current === "OFFLINE") {
                if (
                  !offlinePaymentDetails.method ||
                  !offlinePaymentDetails.method.value ||
                  !offlinePaymentDetails.transactionId
                ) {
                  toast.error("Please fill all offline payment details");
                  setLoading(false);
                  return;
                }
                toast.success("Member created with offline payment!");
                setMemberModal(false);
                setLoading(false);
                onLeadUpdate();
              }
            }
          }
          
        } catch (error) {
          console.log(error, "error");
          toast.error(
            error.response?.data?.errors || error.response?.data?.message,
          );
          setLoading(false);
        }
      } else {
        setStep(step + 1);
        setLoading(false);
      }
    },
  });

  const handleFileUpload = (event, fieldName) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const imageOnlyFields = ["passport_photo"];

    const allowedTypes = imageOnlyFields.includes(fieldName)
      ? IMAGE_FILE_TYPES
      : DOCUMENT_FILE_TYPES;

    if (!allowedTypes.includes(file.type)) {
      toast.error(
        imageOnlyFields.includes(fieldName)
          ? "Passport Photo accepts only JPG, JPEG, PNG and WEBP."
          : "Only JPG, JPEG, PNG, WEBP and PDF files are allowed."
      );

      event.target.value = "";
      return;
    }

    formik.setFieldValue(fieldName, file);

    event.target.value = "";
  };

  const getPreview = (value) => {
    if (!value) return null;

    // ✅ If it's already a URL (API response)
    if (typeof value === "string") {
      return value;
    }

    // ✅ If it's a File (new upload)
    if (value instanceof File) {
      return URL.createObjectURL(value);
    }

    return null;
  };

  const hasExistingDocs =
    typeof formik.values.id_proof_card_front === "string" ||
    typeof formik.values.id_proof_card_back === "string" ||
    typeof formik.values.passport_photo === "string" ||
    typeof formik.values.corporate_id === "string";

  const handleFinalSubmit = async (mode) => {
    paymentModeRef.current = mode;

    const errors = await formik.validateForm();

    if (showGstDetails) {
      const isGstValid = validateGstFields();

      if (!isGstValid) {
        setLoading(false);
        return;
      }
    }

    if (Object.keys(errors).length > 0) {
      // mark all fields touched
      const touchedFields = {};
      Object.keys(errors).forEach((key) => {
        touchedFields[key] = true;
      });

      formik.setTouched(touchedFields);

      toast.error("Please fill all required fields");
      return;
    }

    // ✅ If valid → proceed
    if (mode === "OFFLINE") {
      setPaymentModalOpen(true); // open offline modal
    } else {
      formik.handleSubmit(); // continue normal flow
    }
  };

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
            data.member_emergency_contact &&
            data.member_emergency_contact.length > 0
              ? data.member_emergency_contact
              : [
                  {
                    id: null,
                    name: "",
                    phone: "",
                    relationship: "",
                  },
                ];

          const kycDocuments = data?.kyc_document || [];

          const aadharDoc = kycDocuments.find(
            (doc) => doc.document_type === "ID_PROOF"
          );

          const passportDoc = kycDocuments.find(
            (doc) => doc.document_type === "PHOTO"
          );

          const corporateDoc = kycDocuments.find(
            (doc) => doc.document_type === "CORPORATE_ID"
          );

          formik.setValues({
            id: data.id || "",
            club_id: data.club_id || null,
            profile_pic: "",
            full_name: data.full_name || "",
            mobile: data.country_code ? data.mobile : "",
            country_code: data.country_code || "",
            phoneFull: data.country_code
              ? `+${data.country_code}${data.mobile}`
              : "",
            country_code: data.country_code || "",
            email: data.email || "",
            gender: data.gender || "NOTDISCLOSE",
            height: data.height || "",
            date_of_birth: dobIso,
            address: data.address || "",
            pincode: data.pincode || "",
            company_name: data.company_name || "",
            designation: data.designation || "",
            official_email: data.official_email || "",
            interested_in: interestedList.map((i) => i.value),
            lead_source: data.lead_source || "",
            lead_type: data.lead_type || "",
            platform: data.platform || "Event",
            schedule: data.schedule || "",
            invoiceDate:
              data.invoiceDate || new Date().toISOString().split("T")[0],
            schedule_date_time: data.schedule_date_time
              ? new Date(data.schedule_date_time).toISOString()
              : "",
            start_date: new Date(),
            created_by: data.created_by || null,
            staff_name: data.staff_name || "",

            member_emergency_contact: emergencyContacts,

            // DOCUMENT IDS
            aadhar_doc_id: aadharDoc?.id || null,
            passport_doc_id: passportDoc?.id || null,
            corporate_doc_id: corporateDoc?.id || null,

            // DOCUMENT FILES
            id_proof_card_front:
              aadharDoc?.id_proof_card_front || null,

            id_proof_card_back:
              aadharDoc?.id_proof_card_back || null,

            passport_photo:
              passportDoc?.passport_photo || null,

            corporate_id:
              corporateDoc?.corporate_id || null,
            lead_owner: data.lead_owner || "",
            club_data: data.club_data || {
              name: "",
              state: "",
              country: "",
              is_corporate_id: false,
            },
            productType: "MEMBERSHIP_PLAN",
          });
          setSelected(interestedList);
          if (data.profile_pic) {
            setProfileImage(data.profile_pic);
          }
        }
      } catch (err) {
        console.error(err);
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
    }
  };

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
        (company) => company.status === "ACTIVE",
      );

      // ✅ Convert to dropdown-friendly format
      const options = activeCompanies.map((company) => ({
        value: company.id,
        label: company.name,
      }));

      // ✅ Update state
      // setCompanyOptions(options);
      setCompanyOptions((prev) => {
        const map = new Map();

        [...prev, ...options].forEach((opt) => {
          map.set(opt.value, opt);
        });

        return Array.from(map.values());
      });
    } catch (err) {
      console.error("❌ Failed to fetch companies:", err);
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

    if (!file) {
      setProfileError("Profile image is required");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    // const maxSize = 2 * 1024 * 1024; // 2MB

    // ❌ Invalid file type
    if (!allowedTypes.includes(file.type)) {
      setProfileError("Only JPG, PNG, or WEBP allowed");
      event.target.value = null;
      return;
    }

    // ❌ File too large
    // if (file.size > maxSize) {
    //   setProfileError("Image size must be less than 2MB");
    //   event.target.value = null;
    //   return;
    // }

    // ✅ Valid file
    setProfileError("");

    const imageUrl = URL.createObjectURL(file);
    setProfileImage(imageUrl);

    formik.setFieldValue("profile_pic", file);
    setShowModal(false);
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
        setStep((prev) => prev + 1);
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

  const checkPlansAvailability = async (planType, clubId, productType) => {
    if (!planType || !clubId || !productType) {
      setHasPlans(false);
      return;
    }

    setCheckingPlans(true);

    try {
      let response;

      const params = {
        plan_type: planType,
        club_id: clubId,
      };

      if (productType === "MEMBERSHIP_PLAN") {
        response = await authAxios().get("/subscription-plan/list", {
          params,
        });
      }

      const data = response?.data?.data || [];

      setHasPlans(data.length > 0); // ✅ KEY LINE
    } catch (err) {
      console.error(err);
      setHasPlans(false);
    }

    setCheckingPlans(false);
  };

  useEffect(() => {
    checkPlansAvailability(
      formik.values.plan_type,
      formik.values.club_id,
      formik.values.productType,
    );
  }, [
    formik.values.plan_type,
    formik.values.club_id,
    formik.values.productType,
  ]);

  useEffect(() => {
    if (!formik.values.club_id) return;

    authAxios()
      .get(`/club/${formik.values.club_id}`)
      .then((res) => {
        const data = res.data?.data?.gsttyp;
        console.log("Club data:", data);
        setClubGstType(data);
      })
      .catch(() => toast.error("Failed to fetch club"));
  }, [formik.values.club_id]);

  const handleProductSubmit = (product) => {
    // Convert to numbers safely
    const amount = Number(product.amount) || 0;
    const discount = Number(product.discount) || 0;
    const gstPercent = Number(product.gst) || 0;

    // Base calculation
    const totalAmount = Number(product.total_amount) || 0;
    // const gstAmount = Number(product.gst_amount) || 0;
    let igstAmount = 0;
    let cgstAmount = 0;
    let sgstAmount = 0;
    let gstAmount = 0;

    if (clubGstType === "IGST") {
      igstAmount = (totalAmount * gstPercent) / 100;
      gstAmount = igstAmount;
    } else {
      cgstAmount = (totalAmount * (gstPercent / 2)) / 100;
      sgstAmount = (totalAmount * (gstPercent / 2)) / 100;
      gstAmount =  Number(formatIndianNumber(cgstAmount).replace(/,/g, "")) + Number(formatIndianNumber(sgstAmount).replace(/,/g, ""));
    }
    const finalAmount = Number(product.final_amount) || 0;

    // 🔥 Reset coupon when product changes
    setVoucherInput("");
    setVoucherStatus(null);

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
        member_id: formik.values.id,
      };

      const res = await authAxios().post("/coupon/applicable", payload);

      const response = res.data;

      // ✅ CHECK API STATUS (IMPORTANT)
      if (!response?.status) {
        throw new Error(response?.message || "Invalid coupon");
      }

      const data = response?.data;

      const couponDiscount = Number(data?.discountAmount) || 0;
      const totalAmount =
        Number(formik.values.productDetails?.total_amount) || 0;
      const gstPercent = Number(formik.values.productDetails?.gst) || 0;

      const discountedTotal = totalAmount - couponDiscount;
      // const gstAmount = (discountedTotal * gstPercent) / 100;
      let igstAmount = 0;
      let cgstAmount = 0;
      let sgstAmount = 0;
      let gstAmount = 0;

      if (clubGstType === "IGST") {
        igstAmount = (discountedTotal * gstPercent) / 100;
        gstAmount = igstAmount;
      } else {
        cgstAmount = (discountedTotal * (gstPercent / 2)) / 100;
        sgstAmount = (discountedTotal * (gstPercent / 2)) / 100;

        gstAmount =
          Number(cgstAmount.toFixed(2)) +
          Number(sgstAmount.toFixed(2));
      }
      const finalAmount = discountedTotal + gstAmount;

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

      // toast.success(response?.message || "Coupon applied successfully");
      setVoucherMessage(response?.message);
    } catch (err) {
      setVoucherStatus("error");
      setVoucherMessage(err?.message || "Invalid or expired coupon");

      // const originalFinal =
      //   Number(formik.values.productDetails?.final_amount) || 0;

      // formik.setValues({
      //   ...formik.values,
      //   coupon: "",
      //   discountAmount: 0,
      //   final_amount: originalFinal,
      //   amount_pay: originalFinal,
      // });
      const totalAmount =
        Number(formik.values.productDetails?.total_amount) || 0;

      const gstPercent =
        Number(formik.values.productDetails?.gst) || 0;

      const discountedTotal = totalAmount; // ❌ no discount applied

      let igstAmount = 0;
      let cgstAmount = 0;
      let sgstAmount = 0;
      let gstAmount = 0;

      if (clubGstType === "IGST") {
        igstAmount = (discountedTotal * gstPercent) / 100;
        gstAmount = igstAmount;
      } else {
        cgstAmount = (discountedTotal * (gstPercent / 2)) / 100;
        sgstAmount = (discountedTotal * (gstPercent / 2)) / 100;

        gstAmount =
          Number(cgstAmount.toFixed(2)) +
          Number(sgstAmount.toFixed(2));
      }

      const finalAmount = discountedTotal + gstAmount;

      formik.setValues({
        ...formik.values,
        coupon: "",
        discountAmount: 0,
        productDetails: {
          ...formik.values.productDetails,
          gst_amount: gstAmount,
          cgst_amount: cgstAmount,
          sgst_amount: sgstAmount,
          igst_amount: igstAmount,
        },
        final_amount: finalAmount,
        amount_pay: finalAmount,
      });
    }
  };

  const handleApplyVoucher = () => {
    applyCoupon();
  };

  const handleAddContact = () => {
    const currentContacts = formik.values.member_emergency_contact || [];
    formik.setFieldValue("member_emergency_contact", [
      ...currentContacts,
      { id: null, name: "", phone: "", relationship: "" },
    ]);
  };

  const handleRemoveContact = async (index) => {
    const contact = formik.values.member_emergency_contact[index];

    // Delete from DB if exists
    if (contact?.id) {
      try {
        await authAxios().delete(`/member-emergency-contact/${contact.id}`);
        toast.success("Emergency contact removed");
      } catch (error) {
        console.error(error);
        return;
      }
    }

    // Remove by index
    const updatedContacts = formik.values.member_emergency_contact.filter(
      (_, i) => i !== index,
    );

    formik.setFieldValue(
      "member_emergency_contact",
      updatedContacts.length > 0
        ? updatedContacts
        : [{ id: null, name: "", phone: "", relationship: "" }],
    );
  };

  const handleEmergancyPhone = (value, index) => {
    const updated = [...formik.values.member_emergency_contact];
    updated[index].phone = value;
    formik.setFieldValue("member_emergency_contact", updated);
  };

  const handlePhoneChange = (value) => {
    formik.setFieldValue("phoneFull", value);
    if (!value) {
      formik.setFieldValue("mobile", "");
      formik.setFieldValue("country_code", "");
      return;
    }
    const phoneNumber = parsePhoneNumberFromString(value, "IN");
    if (phoneNumber) {
      formik.setFieldValue("mobile", phoneNumber.nationalNumber);
      formik.setFieldValue("country_code", phoneNumber.countryCallingCode);
    }
    setDuplicateError(false);
  };

  const handlePhoneBlur = async () => {
    formik.setFieldTouched("phoneFull", true);

    const rawPhone = formik.values.phoneFull;
    if (!rawPhone) {
      formik.setFieldError("phoneFull", "Phone number is required");
      return;
    }

    const phoneNumber = parsePhoneNumberFromString(rawPhone, "IN");
    if (!phoneNumber || !phoneNumber.isValid()) {
      formik.setFieldError("phoneFull", "Invalid phone number");
      return;
    }

    const payload = {
      mobile: phoneNumber.nationalNumber,
    };

    try {
      // ✅ Use POST method
      const endpoint = selectedLeadMember
        ? `/lead/verify/availability/${selectedLeadMember}` // If lead is selected, use verification endpoint
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
        error.response || error,
      );
      formik.setFieldError(
        "phoneFull",
        "Unable to check phone number. Please try again.",
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
        error.response || error,
      );
      formik.setFieldError(
        "Email",
        "Unable to check phone number. Please try again.",
      );
    }
  };

  const fifteenYearsAgo = new Date();
  fifteenYearsAgo.setFullYear(fifteenYearsAgo.getFullYear() - 15);

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
  }, [formik.values.plan_type]);

  // KYC Document WEB Cam
  const openDocumentOptions = (fieldName) => {
    setSelectedDocumentField(fieldName);
    setShowUploadOptions(true);
  };

  const documentInputRefs = {
    id_proof_card_front: useRef(null),
    id_proof_card_back: useRef(null),
    passport_photo: useRef(null),
    corporate_id: useRef(null),
  };

  const openDeviceUpload = () => {
    setShowUploadOptions(false);
    documentInputRefs[selectedDocumentField]?.current?.click();
  };

  const openDocumentCamera = () => {
    setShowUploadOptions(false);
    setShowDocumentCamera(true);
  };

  const captureDocument = () => {
    const imageSource = documentWebcamRef.current.getScreenshot();

    if (!imageSource) return;

    fetch(imageSource)
      .then((response) => response.blob())
      .then((blob) => {
        const file = new File(
          [blob],
          `${selectedDocumentField}-${Date.now()}.jpg`,
          {
            type: "image/jpeg",
          }
        );

        formik.setFieldValue(selectedDocumentField, file);

        setShowDocumentCamera(false);
      });
  };

  const isPdfFile = (file) => {
    if (!file) return false;

    // Newly selected file
    if (file instanceof File) {
      return file.type === "application/pdf";
    }

    // Existing URL from API
    if (typeof file === "string") {
      return file.toLowerCase().includes(".pdf");
    }

    return false;
  };

  return (
    <>
      <div
        className="bg--blur create--lead--container overflow-auto hide--overflow fixed top-0 left-0 z-[8] w-full bg-black bg-opacity-60 h-full"
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
            <form onSubmit={formik.handleSubmit}>
              <div className="flex bg-white rounded-b-[10px]">
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
                            <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col">
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
                                      accept="image/png, image/jpeg, image/webp"
                                      onChange={handleImageUpload}
                                      className="hidden"
                                    />
                                  </label>
                                </div>

                                <button
                                  onClick={() => {
                                    setShowModal(false); // close the modal
                                    setProfileError(""); // clear the image error
                                  }}
                                  className="px-4 py-2 bg-black text-white rounded flex items-center gap-2"
                                >
                                  <IoClose /> Cancel
                                </button>
                              </div>
                              {profileError && (
                                <p className="text-red-500 text-sm mt-2">
                                  {profileError}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-3 gap-4 w-full">
                          <div className="relative">
                            <label className="mb-2 block">
                              Contact Number
                              <span className="text-red-500">*</span>
                            </label>
                            <PhoneInput
                              name="phoneFull"
                              value={formik.values.phoneFull} // 👈 use phoneFull for UI binding
                              onChange={handlePhoneChange}
                              onBlur={() => {
                                formik.setFieldTouched("mobile", true);
                                handlePhoneBlur();
                              }}
                              international
                              defaultCountry="IN"
                              countryCallingCodeEditable={false}
                              className="custom--input w-full custom--phone"
                            />

                            {((formik.errors?.mobile &&
                              formik.touched?.mobile) ||
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
                                // onChange={formik.handleChange}
                                onKeyDown={blockNonLetters}
                                onChange={(e) => {
                                  const cleaned = allowOnlyLetters(
                                    e.target.value,
                                  );
                                  formik.setFieldValue("full_name", cleaned);
                                }}
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
                                  (opt) => opt.value === formik.values.gender,
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
                              Height (cm)<span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                                <CgFormatLineHeight />
                              </span>
                              <input
                                type="number"
                                name="height"
                                value={formik.values.height}
                                // onChange={formik.handleChange}
                                onKeyDown={blockInvalidNumberKeys} // ⛔ blocks typing -, e, etc.
                                onChange={(e) => {
                                  const cleanValue = sanitizePositiveInteger(
                                    e.target.value,
                                  );
                                  formik.setFieldValue("height", cleanValue);
                                }}
                                className="custom--input w-full input--icon number--appearance-none"
                              />
                            </div>
                            {formik.errors?.height &&
                              formik.touched?.height && (
                                <div className="text-red-500 text-sm">
                                  {formik.errors.height}
                                </div>
                              )}
                          </div>

                          <div>
                            <label className="mb-2 block">
                              Pincode<span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                                <FaLocationDot />
                              </span>
                              <input
                                type="text"
                                name="pincode"
                                value={formik.values.pincode}
                                // onChange={formik.handleChange}
                                onKeyDown={blockInvalidNumberKeys} // ⛔ blocks typing -, e, etc.
                                onChange={(e) => {
                                  // Keep only positive integers
                                  let cleanValue = sanitizePositiveInteger(
                                    e.target.value,
                                  );

                                  // Limit to max 6 digits
                                  if (cleanValue.length > 6) {
                                    cleanValue = cleanValue.slice(0, 6);
                                  }

                                  formik.setFieldValue("pincode", cleanValue);
                                }}
                                className="custom--input w-full input--icon"
                              />
                            </div>
                            {formik.errors?.pincode &&
                              formik.touched?.pincode && (
                                <div className="text-red-500 text-sm">
                                  {formik.errors.pincode}
                                </div>
                              )}
                          </div>

                          <div className="col-span-2">
                            <label className="mb-2 block">Address</label>
                            <div className="relative">
                              <input
                                name="address"
                                value={formik.values.address}
                                // onChange={formik.handleChange}
                                onKeyDown={blockNonLettersAndNumbers}
                                onChange={(e) => {
                                  const cleaned = sanitizeTextWithNumbers(
                                    e.target.value,
                                  );
                                  formik.setFieldValue("address", cleaned);
                                }}
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
                          <div className="relative hide-clear-icon">
                            <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                              <FaListCheck />
                            </span>

                            <MultiSelect
                              options={servicesName}
                              value={selected} // selected objects
                              onChange={(serviceList) => {
                                setSelected(serviceList); // UI needs objects
                                const values = serviceList.map(
                                  (opt) => opt.value,
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
                              className={`custom--input w-full input--icon multi--select--new !text-gray-500 ${
                                selected
                                  ? "cursor-not-allowed pointer-events-none !bg-gray-100"
                                  : ""
                              }`}
                              disabled={!!selected}
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
                                (opt) => opt.value === formik.values.lead_type,
                              )}
                              onChange={(option) =>
                                formik.setFieldValue("lead_type", option.value)
                              }
                              options={leadTypes}
                              styles={selectIcon}
                              isDisabled={true}
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
                                  (opt) => opt.value === formik.values.platform,
                                )}
                                onChange={(option) =>
                                  formik.setFieldValue("platform", option.value)
                                }
                                options={socialList}
                                styles={selectIcon}
                                readOnly={true}
                                isDisabled={true}
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
                                // onChange={formik.handleChange}
                                onKeyDown={blockNonLetters}
                                onChange={(e) => {
                                  const cleaned = allowOnlyLetters(
                                    e.target.value,
                                  );
                                  formik.setFieldValue("platform", cleaned);
                                }}
                                className="custom--input w-full input--icon  cursor-not-allowed pointer-events-none !bg-gray-100 !text-gray-500"
                                readOnly={true}
                                isDisabled={true}
                              />
                            </div>
                          </div>
                        )}
                      </div>

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
                              name="designation"
                              value={formik.values?.designation}
                              onKeyDown={blockNonLetters}
                              onChange={(e) => {
                                const cleaned = allowOnlyLetters(
                                  e.target.value,
                                );
                                formik.setFieldValue("designation", cleaned);
                              }}
                              // onChange={formik.handleChange}
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
                            {userRole === "ADMIN" ||
                            userRole === "CLUB_MANAGER" ||
                            // userRole === "FOH" ||
                            userRole === "MARKETING_MANAGER" ? (
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
                                          opt.value ===
                                          formik.values.company_id,
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
                                    formik.setFieldValue(
                                      "company_id",
                                      option.value,
                                    );
                                    formik.setFieldValue(
                                      "company_name",
                                      option.label,
                                    );
                                    return;
                                  }

                                  // ✅ Fallback safety (should not happen)
                                  formik.setFieldValue("company_id", null);
                                  formik.setFieldValue(
                                    "company_name",
                                    option.label,
                                  );
                                }}
                                /* ✅ sanitize created company name */
                                onCreateOption={(newValue) => {
                                  const cleaned = sanitizeText(newValue);

                                  formik.setFieldValue("company_id", null);
                                  formik.setFieldValue("company_name", cleaned);
                                }}
                                /* ✅ sanitize typing */
                                onInputChange={(inputValue, { action }) => {
                                  if (action === "input-change") {
                                    const cleaned =
                                      allowOnlyLetters(inputValue);

                                    if (cleaned.length >= 2) {
                                      fetchCompanies(cleaned);
                                    }

                                    return cleaned;
                                  }

                                  return inputValue;
                                }}
                                options={companyOptions} // must be [{ value: number, label: string }]
                                styles={selectIcon}
                              />
                            ) : (
                              // <Select
                              //   name="company_name"
                              //   value={
                              //     formik.values?.company_name
                              //       ? companyOptions.find(
                              //           (opt) =>
                              //             opt.value ===
                              //             formik.values?.company_name,
                              //         ) || {
                              //           label: formik.values?.company_name,
                              //           value: formik.values?.company_name,
                              //         }
                              //       : null
                              //   }
                              //   onChange={(option) =>
                              //     formik.setFieldValue(
                              //       "company_name",
                              //       option.value,
                              //     )
                              //   }
                              //   options={companyOptions}
                              //   isLoading={loading}
                              //   styles={selectIcon}
                              //   placeholder="Select Company"
                              // />
                              <Select
                                name="company_name"
                                value={
                                  formik.values?.company_id
                                    ? companyOptions.find(
                                        (opt) => opt.value === formik.values.company_id
                                      ) || null
                                    : null
                                }
                                onChange={(option) => {
                                  if (!option) {
                                    formik.setFieldValue("company_id", null);
                                    formik.setFieldValue("company_name", "");
                                    return;
                                  }

                                  formik.setFieldValue("company_id", option.value);
                                  formik.setFieldValue("company_name", option.label);
                                }}
                                options={companyOptions}
                                isLoading={loading}
                                styles={selectIcon}
                                placeholder="Select Company"
                              />
                            )}
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
                              name="official_email"
                              value={formik.values?.official_email}
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
                      {formik.values?.member_emergency_contact?.map(
                        (phone, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-3 gap-4 mb-4 border p-4 rounded-lg relative"
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
                                  name={`member_emergency_contact.${index}.name`}
                                  value={phone?.name}
                                  // onChange={formik.handleChange}
                                  onKeyDown={blockNonLetters}
                                  onChange={(e) => {
                                    const cleaned = allowOnlyLetters(
                                      e.target.value,
                                    );
                                    formik.setFieldValue(
                                      `member_emergency_contact.${index}.name`,
                                      cleaned,
                                    );
                                  }}
                                  className="custom--input w-full input--icon"
                                />
                              </div>
                              {formik.errors?.member_emergency_contact?.[index]
                                ?.name &&
                                formik.touched?.member_emergency_contact?.[
                                  index
                                ]?.name && (
                                  <div className="text-red-500 text-sm">
                                    {
                                      formik.errors.member_emergency_contact[
                                        index
                                      ].name
                                    }
                                  </div>
                                )}
                            </div>

                            {/* Contact Number Field */}
                            <div>
                              <label className="mb-2 block">
                                Number<span className="text-red-500">*</span>
                              </label>
                              <PhoneInput
                                name={`member_emergency_contact.${index}.phone`}
                                value={phone?.phone}
                                onChange={(value) =>
                                  handleEmergancyPhone(value, index)
                                } // Ensure this function handles formik update
                                onBlur={() =>
                                  formik.setFieldTouched(
                                    `member_emergency_contact.${index}.phone`,
                                    true,
                                  )
                                }
                                international
                                defaultCountry="IN"
                                countryCallingCodeEditable={false}
                                className="custom--input w-full custom--phone"
                              />
                              {formik.errors?.member_emergency_contact?.[index]
                                ?.phone &&
                                formik.touched?.member_emergency_contact?.[
                                  index
                                ]?.phone && (
                                  <div className="text-red-500 text-sm">
                                    {
                                      formik.errors.member_emergency_contact[
                                        index
                                      ].phone
                                    }
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
                                  name={`member_emergency_contact.${index}.relationship`}
                                  value={relationList.find(
                                    (opt) => opt.value === phone.relationship,
                                  )}
                                  onChange={(option) =>
                                    formik.setFieldValue(
                                      `member_emergency_contact.${index}.relationship`,
                                      option.value,
                                    )
                                  }
                                  options={relationList}
                                  styles={selectIcon}
                                />
                              </div>
                              {formik.errors?.member_emergency_contact?.[index]
                                ?.relationship &&
                                formik.touched?.member_emergency_contact?.[
                                  index
                                ]?.relationship && (
                                  <div className="text-red-500 text-sm">
                                    {
                                      formik.errors.member_emergency_contact[
                                        index
                                      ].relationship
                                    }
                                  </div>
                                )}
                            </div>

                            {/* Remove Button */}
                            <div className="absolute top-0 right-[10px]">
                              {formik.values?.member_emergency_contact?.length >
                                1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveContact(index)}
                                  className="text-black font-bold"
                                >
                                  <IoIosCloseCircle className="text-2xl mt-2" />
                                </button>
                              )}
                            </div>
                          </div>
                        ),
                      )}

                      <button
                        type="button"
                        onClick={handleAddContact}
                        className="text-sm flex items-center gap-1 justify-end mx-auto bg-black text-white p-2 rounded-[5px]"
                      >
                        + Add Emergency Contact
                      </button>

                      <hr className="my-5" />
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <h3 className="text-2xl font-semibold mb-2">
                          KYC Documents
                        </h3>
                        {/* {hasExistingDocs && !isEditingDocs && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditingDocs(true);

                              // ✅ Clear ALL document fields
                              formik.setFieldValue("id_proof_card_front", null);
                              formik.setFieldValue("id_proof_card_back", null);
                              formik.setFieldValue("passport_photo", null);
                              formik.setFieldValue("corporate_id", null);

                              // ✅ Reset touched (prevents instant errors)
                              formik.setFieldTouched(
                                "id_proof_card_front",
                                false,
                              );
                              formik.setFieldTouched(
                                "id_proof_card_back",
                                false,
                              );
                              formik.setFieldTouched("passport_photo", false);
                              formik.setFieldTouched("corporate_id", false);
                            }}
                            className="px-3 py-2 bg-black text-white rounded text-sm flex items-center gap-1"
                          >
                            <span>Edit Documents</span>
                            <MdModeEditOutline />
                          </button>
                        )} */}
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="mb-2 block">
                            Aadhar Card (Front)
                            <span className="text-red-500">*</span>
                          </label>

                          <div className="border rounded-lg p-2 bg-white">
                            <div className="flex items-center space-x-4">
                              {/* Preview box */}
                              <div className="relative w-[80px] h-[80px] bg-gray-100">
                                {formik.values.id_proof_card_front ? (
                                  <>
                                  {isPdfFile(formik.values.id_proof_card_front) ? (
                                    <div className="w-full h-full border rounded flex flex-col items-center justify-center bg-gray-50">
                                      <MdOutlineFileDownload size={40} />
                                      <span className="text-xs mt-2">PDF</span>
                                    </div>
                                  ) : (
                                    <img
                                      src={getPreview(formik.values.id_proof_card_front)}
                                      alt="Aadhar Front"
                                      className="w-full h-full object-cover rounded border"
                                    />
                                  )}
                                  </>
                                ) : (
                                  <div className="flex items-center justify-center w-full h-full text-xs text-gray-400">
                                    No Image
                                  </div>
                                )}
                              </div>

                              <div>
                                <h4 className="font-medium text-[12px] text-gray-900">
                                  Upload Document
                                </h4>

                                <div className="flex space-x-2 mt-2">
                                  {/* 👁 VIEW BUTTON */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!formik.values.id_proof_card_front) return;
                                      setPreviewImage(formik.values.id_proof_card_front);
                                      setShowPreviewModal(true);
                                    }}
                                    className="inline-flex items-center px-3 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md"
                                  >
                                    <IoEyeOutline />
                                  </button>

                                  {/* ✅ UPLOAD BUTTON (ONLY WHEN EDITING OR EMPTY) */}
                                  <input
                                      ref={documentInputRefs.id_proof_card_front}
                                      type="file"
                                      accept="image/*,.pdf"
                                      className="hidden"
                                      onChange={(event) => {
                                          const file = event.target.files?.[0];
                                          if (file) {
                                              handleFileUpload(event, "id_proof_card_front");
                                          }
                                          event.target.value = "";
                                      }}
                                    />
                                    <button
                                        type="button"
                                        className="inline-flex items-center px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md cursor-pointer"
                                        onClick={() => openDocumentOptions("id_proof_card_front")}
                                    >
                                        <FiUpload />
                                    </button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Error */}
                          {formik.touched.id_proof_card_front &&
                            formik.errors.id_proof_card_front && (
                              <p className="text-red-500 text-sm">
                                {formik.errors.id_proof_card_front}
                              </p>
                            )}
                        </div>

                        <div>
                          <label className="mb-2 block">
                            Aadhar Card (Back)
                            <span className="text-red-500">*</span>
                          </label>

                          <div className="border rounded-lg p-2 bg-white">
                            <div className="flex items-center space-x-4">
                              {/* Preview box */}
                              <div className="relative w-[80px] h-[80px] bg-gray-100">
                                {formik.values.id_proof_card_back ? (
                                  <>
                                  {isPdfFile(formik.values.id_proof_card_back) ? (
                                    <div className="w-full h-full border rounded flex flex-col items-center justify-center bg-gray-50">
                                      <MdOutlineFileDownload size={40} />
                                      <span className="text-xs mt-2">PDF</span>
                                    </div>
                                  ) : (
                                    <img
                                      src={getPreview(formik.values.id_proof_card_back)}
                                      alt="Aadhar Back"
                                      className="w-full h-full object-cover rounded border"
                                    />
                                  )}
                                  </>
                                ) : (
                                  <div className="flex items-center justify-center w-full h-full text-xs text-gray-400">
                                    No Image
                                  </div>
                                )}
                              </div>

                              <div>
                                <h4 className="font-medium text-[12px] text-gray-900">
                                  Upload Document
                                </h4>

                                <div className="flex space-x-2 mt-2">
                                  {/* 👁 VIEW BUTTON */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!formik.values.id_proof_card_back) return;
                                      setPreviewImage(formik.values.id_proof_card_back);
                                      setShowPreviewModal(true);
                                    }}
                                    className="inline-flex items-center px-3 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md"
                                  >
                                    <IoEyeOutline />
                                  </button>

                                  {/* ✅ UPLOAD BUTTON (ONLY WHEN EDITING OR EMPTY) */}
                                    <input
                                      ref={documentInputRefs.id_proof_card_back}
                                      type="file"
                                      accept="image/*,.pdf"
                                      className="hidden"
                                      onChange={(event) => {
                                          const file = event.target.files?.[0];
                                          if (file) {
                                              handleFileUpload(event, "id_proof_card_back");
                                          }
                                          event.target.value = "";
                                      }}
                                    />
                                    <button
                                        type="button"
                                        className="inline-flex items-center px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md cursor-pointer"
                                        onClick={() => openDocumentOptions("id_proof_card_back")}
                                    >
                                        <FiUpload />
                                    </button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Error */}
                          {formik.touched.id_proof_card_back &&
                            formik.errors.id_proof_card_back && (
                              <p className="text-red-500 text-sm">
                                {formik.errors.id_proof_card_back}
                              </p>
                            )}
                        </div>

                        <div>
                          <label className="mb-2 block">
                            Passport Photo
                            <span className="text-red-500">*</span>
                          </label>

                          <div className="border rounded-lg p-2 bg-white">
                            <div className="flex items-center space-x-4">
                              {/* Preview box */}
                              <div className="relative w-[80px] h-[80px] bg-gray-100">
                                {formik.values.passport_photo ? (
                                  <>
                                  {isPdfFile(formik.values.passport_photo) ? (
                                    <div className="w-full h-full border rounded flex flex-col items-center justify-center bg-gray-50">
                                      <MdOutlineFileDownload size={40} />
                                      <span className="text-xs mt-2">PDF</span>
                                    </div>
                                  ) : (
                                    <img
                                      src={getPreview(formik.values.passport_photo)}
                                      alt="Passport Photo"
                                      className="w-full h-full object-cover rounded border"
                                    />
                                  )}
                                  </>
                                ) : (
                                  <div className="flex items-center justify-center w-full h-full text-xs text-gray-400">
                                    No Image
                                  </div>
                                )}
                              </div>

                              <div>
                                <h4 className="font-medium text-[12px] text-gray-900">
                                  Upload Document
                                </h4>

                                <div className="flex space-x-2 mt-2">
                                  {/* 👁 VIEW BUTTON */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!formik.values.passport_photo) return;
                                      setPreviewImage(formik.values.passport_photo);
                                      setShowPreviewModal(true);
                                    }}
                                    className="inline-flex items-center px-3 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md"
                                  >
                                    <IoEyeOutline />
                                  </button>

                                  {/* ⬆ UPLOAD BUTTON */}
                                    <input
                                      ref={documentInputRefs.passport_photo}
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(event) => {
                                          const file = event.target.files?.[0];
                                          if (file) {
                                              handleFileUpload(event, "passport_photo");
                                          }
                                          event.target.value = "";
                                      }}
                                    />
                                    <button
                                        type="button"
                                        className="inline-flex items-center px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md cursor-pointer"
                                        onClick={() => openDocumentOptions("passport_photo")}
                                    >
                                        <FiUpload />
                                    </button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Error */}
                          {formik.touched.passport_photo &&
                            formik.errors.passport_photo && (
                              <p className="text-red-500 text-sm">
                                {formik.errors.passport_photo}
                              </p>
                            )}
                        </div>

                        <div>
                          <label className="mb-2 block">
                            Corporate ID
                            {formik.values.club_data?.is_corporate_id && (
                              <span className="text-red-500">*</span>
                            )}
                          </label>

                          <div className="border rounded-lg p-2 bg-white">
                            <div className="flex items-center space-x-4">
                              {/* Preview box */}
                              <div className="relative w-[80px] h-[80px] bg-gray-100">
                                {formik.values.corporate_id ? (
                                  <>
                                  {isPdfFile(formik.values.corporate_id) ? (
                                    <div className="w-full h-full border rounded flex flex-col items-center justify-center bg-gray-50">
                                      <MdOutlineFileDownload size={40} />
                                      <span className="text-xs mt-2">PDF</span>
                                    </div>
                                  ) : (
                                    <img
                                      src={getPreview(formik.values.corporate_id)}
                                      alt="Corporate ID"
                                      className="w-full h-full object-cover rounded border"
                                    />
                                  )}
                                  </>
                                ) : (
                                  <div className="flex items-center justify-center w-full h-full text-xs text-gray-400">
                                    No Image
                                  </div>
                                )}
                              </div>

                              <div>
                                <h4 className="font-medium text-[12px] text-gray-900">
                                  Upload Document
                                </h4>

                                <div className="flex space-x-2 mt-2">
                                  {/* 👁 VIEW BUTTON */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!formik.values.corporate_id) return;
                                      setPreviewImage(formik.values.corporate_id);
                                      setShowPreviewModal(true);
                                    }}
                                    className="inline-flex items-center px-3 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md"
                                  >
                                    <IoEyeOutline />
                                  </button>

                                  {/* ⬆ UPLOAD BUTTON */}
                                    <input
                                      ref={documentInputRefs.corporate_id}
                                      type="file"
                                      accept="image/*,.pdf"
                                      className="hidden"
                                      onChange={(event) => {
                                          const file = event.target.files?.[0];
                                          if (file) {
                                              handleFileUpload(event, "corporate_id");
                                          }
                                          event.target.value = "";
                                      }}
                                    />
                                    <button
                                        type="button"
                                        className="inline-flex items-center px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md cursor-pointer"
                                        onClick={() => openDocumentOptions("corporate_id")}
                                    >
                                        <FiUpload />
                                    </button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Error */}
                          {formik.touched.corporate_id &&
                            formik.errors.corporate_id && (
                              <p className="text-red-500 text-sm">
                                {formik.errors.corporate_id}
                              </p>
                            )}
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
                                (opt) => opt.value === formik.values.plan_type,
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
                            Plan Name<span className="text-red-500">*</span>
                          </label>
                          <div
                            className="relative"
                            // onClick={() => {
                            //   setShowProductModal(true);
                            // }}
                          >
                            <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                              <FaListCheck />
                            </span>
                            <input
                              name="productDetails.title"
                              value={formik.values?.productDetails?.title}
                              readOnly
                              disabled={!hasPlans || checkingPlans}
                              onClick={() => {
                                if (hasPlans) setShowProductModal(true);
                              }}
                              className={`custom--input w-full input--icon ${
                                !hasPlans
                                  ? "cursor-not-allowed pointer-events-none !bg-gray-100 text-gray-500"
                                  : "cursor-pointer"
                              }`}
                            />
                          </div>
                          {formik.errors?.productDetails?.title &&
                            formik.touched?.productDetails?.title && (
                              <div className="text-red-500 text-sm">
                                {formik.errors?.productDetails?.title}
                              </div>
                            )}
                          {!checkingPlans &&
                            !hasPlans &&
                            formik.values.plan_type && (
                              <p className="text-sm text-red-500">
                                No plans available for selected type & club
                              </p>
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
                              {voucherMessage}
                            </p>
                          )}

                          {voucherStatus === "error" && (
                            <p className="text-red-600 text-sm mt-1">
                              {voucherMessage}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={showGstDetails}
                          onChange={handleGstCheckbox}
                        />

                        <label>Add GST Details</label>
                      </div>

                      {showGstDetails && (
                        <>
                          <h3 className="text-2xl font-semibold mb-2 mt-4">
                            Add GST Details
                          </h3>

                          <div className="grid grid-cols-3 gap-4">
                            {/* GST Number */}
                            <div>
                              <label className="mb-2 block">
                                GST Number
                                <span className="text-red-500">*</span>
                              </label>

                              <input
                                type="text"
                                placeholder="GST Number"
                                className="custom--input w-full"
                                maxLength={15}
                                value={customerGstData.gst_registration_number}
                                onKeyDown={(e) => {
                                  const allowedKeys = [
                                    "Backspace",
                                    "Delete",
                                    "ArrowLeft",
                                    "ArrowRight",
                                    "Tab",
                                  ];

                                  // allow letters + numbers only
                                  if (
                                    !/^[a-zA-Z0-9]$/.test(e.key) &&
                                    !allowedKeys.includes(e.key)
                                  ) {
                                    e.preventDefault();
                                  }
                                }}
                                onChange={(e) => {
                                  const cleaned = sanitizeAlphaNumeric(
                                    e.target.value.toUpperCase(),
                                  );

                                  // limit 15 chars manually
                                  if (cleaned.length <= 15) {
                                    setCustomerGstData({
                                      ...customerGstData,
                                      gst_registration_number: cleaned,
                                    });

                                    setGstErrors({
                                      ...gstErrors,
                                      gst_registration_number: "",
                                    });
                                  }
                                }}
                              />

                              {gstErrors.gst_registration_number && (
                                <p className="text-red-500 text-sm mt-1">
                                  {gstErrors.gst_registration_number}
                                </p>
                              )}
                            </div>

                            {/* Company Name */}
                            <div>
                              <label className="mb-2 block">
                                Company Name
                                <span className="text-red-500">*</span>
                              </label>

                              <input
                                type="text"
                                placeholder="Company Name"
                                className="custom--input w-full"
                                value={
                                  customerGstData.gst_registered_company_name
                                }
                                onKeyDown={blockNonLettersAndNumbers}
                                onChange={(e) => {
                                  const cleaned = allowLettersAndNumbers(
                                    e.target.value,
                                  );

                                  setCustomerGstData({
                                    ...customerGstData,
                                    gst_registered_company_name: cleaned,
                                  });
                                }}
                              />

                              {gstErrors.gst_registered_company_name && (
                                <p className="text-red-500 text-sm mt-1">
                                  {gstErrors.gst_registered_company_name}
                                </p>
                              )}
                            </div>

                            {/* Company Address */}
                            <div>
                              <label className="mb-2 block">
                                Company Address
                                <span className="text-red-500">*</span>
                              </label>

                              <input
                                type="text"
                                placeholder="Company Address"
                                className="custom--input w-full"
                                value={
                                  customerGstData.gst_registered_company_address
                                }
                                onKeyDown={blockNonLettersAndNumbers}
                                onChange={(e) => {
                                  const cleaned = allowLettersAndNumbers(
                                    e.target.value,
                                  );

                                  setCustomerGstData({
                                    ...customerGstData,
                                    gst_registered_company_address: cleaned,
                                  });
                                }}
                              />

                              {gstErrors.gst_registered_company_address && (
                                <p className="text-red-500 text-sm mt-1">
                                  {gstErrors.gst_registered_company_address}
                                </p>
                              )}
                            </div>
                          </div>
                        </>
                      )}

                      <div className="mt-5 bg-[#f7f7f7] p-[20px] rounded-[10px]">
                        <h3 className="text-2xl font-semibold">
                          Price Calculation
                        </h3>
                        <div className="price--calculation2 my-5">
                          {/* <div className="price--item">
                            <p className="flex items-center gap-2 justify-between mb-2 border-b pb-2">
                              Duration:{" "}
                              <span className="font-bold">
                                {formik.values.productDetails?.duration_value ??
                                  0}{" "}
                                {formik.values.productDetails?.duration_type}
                              </span>
                            </p>
                          </div> */}
                          <div className="price--item">
                            <p className="flex items-center gap-2 justify-between mb-2 border-b pb-2">
                              Total:{" "}
                              <span className="font-bold flex items-center gap-2">
                                <del className="text-gray-500 text-sm">
                                  ₹
                                  {formatIndianNumber(
                                    formik.values.productDetails?.amount,
                                  ) ?? 0}
                                </del>{" "}
                                <span>
                                  {" "}
                                  ₹
                                  {formatIndianNumber(
                                    formik.values.productDetails?.total_amount,
                                  ) ?? 0}
                                </span>
                              </span>
                            </p>
                          </div>
                          <div className="price--item">
                            <p className="flex items-center gap-2 justify-between mb-2 border-b pb-2">
                              Discount Code Applied:{" "}
                              <span className="font-bold">
                                ₹
                                {formatIndianNumber(
                                  formik.values.discountAmount,
                                ) ?? 0}
                              </span>
                            </p>
                          </div>
                          <div className="price--item">
                            <p className="flex items-center gap-2 justify-between mb-2 border-b pb-2">
                              GST:{" "}
                              <span className="font-bold">
                                ₹
                                {formatIndianNumber(
                                  formik.values.productDetails?.gst_amount,
                                ) ?? 0}
                              </span>
                            </p>
                          </div>
                          <div className="price--item">
                            <p className="flex items-center gap-2 justify-between mb-2 border-b pb-2">
                              Grand Total:{" "}
                              <span className="font-bold">
                                ₹
                                {formatIndianNumber(
                                  formik.values.final_amount,
                                ) ?? 0}
                              </span>
                            </p>
                          </div>
                        </div>
                        <p className="text-2xl font-semibold flex items-center gap-2 justify-between pb-2">
                          To Pay:{" "}
                          <span className="font-bold">
                            ₹{formatIndianNumber(formik.values.amount_pay) ?? 0}
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
                  {step !== stepValidationSchemas.length - 1 && (
                    <button
                      type="button"
                      className="px-4 py-2 bg-white text-black font-semibold rounded max-w-[150px] w-full"
                      onClick={handleNextStep}
                    >
                      Next
                    </button>
                  )}

                  {step === stepValidationSchemas.length - 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleFinalSubmit("ONLINE")}
                        className="px-4 py-2 bg-black text-white font-semibold rounded max-w-[150px] w-full"
                      >
                        Pay Online
                      </button>

                      <button
                        type="button"
                        onClick={() => handleFinalSubmit("OFFLINE")}
                        className="px-4 py-2 border bg-white text-black font-semibold rounded max-w-[150px] w-full"
                      >
                        Pay Offline
                      </button>
                    </>
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
          clubId={formik.values?.club_id}
        />
      )}

      {showUnderageModal && (
        <ConfirmUnderAge
          title="Underage Confirmation"
          message="This lead is a minor (under 18 years old). Do you still wish to proceed?"
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

      {paymentModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[8]">
          <div className="bg-white rounded-lg w-[500px] p-6">
            {/* ✅ ONLINE UI */}
            {paymentModeRef.current === "ONLINE" && (
              <>
                <h2 className="text-lg font-semibold mb-2">
                  Complete Your Payment
                </h2>

                <p className="text-sm text-gray-600 mb-3">
                  Order No: <span className="font-medium">{orderNo}</span>
                </p>

                <textarea
                  readOnly
                  value={paymentUrl}
                  className="w-full h-[120px] border rounded p-2 text-sm"
                />

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(paymentUrl);
                      toast.success("Payment URL copied");
                    }}
                    className="px-4 py-2 bg-black text-white rounded"
                  >
                    Copy URL
                  </button>

                  <button
                    onClick={() => {
                      setPaymentModalOpen(false);
                      setMemberModal(false);
                    }}
                    className="px-4 py-2 border rounded"
                  >
                    Close
                  </button>
                </div>
              </>
            )}

            {/* ✅ OFFLINE UI */}
            {paymentModeRef.current === "OFFLINE" && (
              <>
                <h2 className="text-lg font-semibold mb-4">
                  Offline Payment Details
                </h2>

                {/* Payment Method */}
                <Select
                  options={paymentMethodOptions}
                  value={offlinePaymentDetails.method}
                  onChange={(option) => {
                    setOfflinePaymentDetails({
                      ...offlinePaymentDetails,
                      method: option,
                    });

                    setOfflineErrors((prev) => ({ ...prev, method: "" }));
                  }}
                  placeholder="Select Payment Method"
                  className="mb-3"
                  styles={{
                    ...customStyles,
                    menuPortal: (base) => ({
                      ...base,
                      zIndex: 9999,
                    }),
                  }}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                />

                {offlineErrors.method && (
                  <p className="text-red-500 text-sm">{offlineErrors.method}</p>
                )}

                {/* Transaction ID */}
                <input
                  type="text"
                  placeholder="Enter Transaction ID"
                  className="custom--input w-full mb-3"
                  value={offlinePaymentDetails.transactionId}
                  onChange={(e) => {
                    const cleaned = sanitizeAlphaNumeric(e.target.value);

                    setOfflinePaymentDetails({
                      ...offlinePaymentDetails,
                      transactionId: cleaned,
                    });

                    setOfflineErrors((prev) => ({
                      ...prev,
                      transactionId: "",
                    }));
                  }}
                />

                {offlineErrors.transactionId && (
                  <p className="text-red-500 text-sm">
                    {offlineErrors.transactionId}
                  </p>
                )}

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setPaymentModalOpen(false)}
                    className="px-4 py-2 border rounded"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() => formik.handleSubmit()}
                    className="px-4 py-2 bg-black text-white rounded"
                  >
                    Submit Payment
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* KYC Modal */}

      {showPreviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg relative max-w-lg w-full">
            {/* Close button */}
            <button
              className="absolute top-2 right-2 text-xl"
              onClick={() => setShowPreviewModal(false)}
            >
              <IoCloseCircle className="text-3xl" />
            </button>

            {isPdfFile(previewImage) ? (
                <iframe
                    src={getPreview(previewImage)}
                    title="PDF Preview"
                    className="w-full h-[600px]"
                />
            ) : (
                <img
                    src={getPreview(previewImage)}
                    alt="Preview"
                    className="max-w-full max-h-[80vh] object-contain"
                />
            )}
          </div>
        </div>
      )}
      {showUploadOptions && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-[380px] p-6">

                <h2 className="text-lg font-semibold mb-5 text-center">
                    Choose Upload Method
                </h2>

                <div className="space-y-3">
                    <button
                        onClick={openDeviceUpload}
                        className="w-full border rounded-lg py-3 flex items-center justify-center gap-2"
                    >
                        <FiUpload />
                        Upload From Device
                    </button>
                    <button
                        onClick={openDocumentCamera}
                        className="w-full border rounded-lg py-3 flex items-center justify-center gap-2"
                    >
                        <FaCamera />
                        Capture Using Camera
                    </button>
                </div>

                <button
                    onClick={() => setShowUploadOptions(false)}
                    className="mt-5 w-full bg-red-500 text-white rounded-lg py-2"
                >
                    Cancel
                </button>

            </div>
        </div>
      )}
      {showDocumentCamera && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-5">
                <Webcam
                    ref={documentWebcamRef}
                    screenshotFormat="image/jpeg"
                    className="rounded-lg"
                />
                <div className="flex gap-3 mt-4">
                    <button
                        onClick={captureDocument}
                        className="bg-black text-white px-4 py-2 rounded"
                    >
                        Capture
                    </button>
                    <button
                        onClick={() => setShowDocumentCamera(false)}
                        className="border px-4 py-2 rounded"
                    >
                        Cancel
                    </button>
                </div>

            </div>
        </div>
      )}
    </>
  );
};

export default ConvertMemberForm;
