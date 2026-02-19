import React, { useEffect, useRef, useState } from "react";
import { IoCloseCircle } from "react-icons/io5";
import { useFormik } from "formik";
import * as Yup from "yup";
import InvoiceProductDetails from "../components/modal/InvoiceProductDetails";
import Select from "react-select";
import DatePicker from "react-datepicker";
import { useSelector } from "react-redux";
import { RiDiscountPercentFill } from "react-icons/ri";
import { FaCalendarDays, FaListCheck } from "react-icons/fa6";
import { selectIcon } from "../Helper/helper";
import { toast } from "react-toastify";
import { authAxios } from "../config/config";
import { GoClock } from "react-icons/go";

// Service types that require date/time fields
const SERVICES_WITH_DATETIME = ["PERSONAL TRAINING", "PILATES", "RECOVERY"];

const getTodayAtTime = (hours, minutes = 0) => {
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d;
};

const roundUpToNextInterval = (date, interval = 30) => {
  const d = new Date(date);
  const minutes = d.getMinutes();
  const remainder = minutes % interval;
  if (remainder !== 0) {
    d.setMinutes(minutes + (interval - remainder));
  }
  d.setSeconds(0);
  d.setMilliseconds(0);
  return d;
};

const isToday = (date) => {
  if (!date) return false;
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const parseTime = (timeString) => {
  if (!timeString) return null;
  let d = new Date();
  let [time, modifier] = timeString.split(" ");
  let [hours, minutes] = time.split(":");
  hours = parseInt(hours);
  minutes = parseInt(minutes);
  if (modifier) {
    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
  }
  d.setHours(hours, minutes, 0, 0);
  return d;
};

const formatDateTimeWithMicroseconds = (date) => {
  const pad = (num, size = 2) => String(num).padStart(size, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  // JavaScript only has milliseconds (3 digits)
  // Backend expects microseconds (6 digits)
  const milliseconds = pad(date.getMilliseconds(), 3);
  const microseconds = `${milliseconds}000`; // convert ms → μs

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${microseconds}`;
};

const buildPaymentPayload = ({ values, user, selectedPackageType }) => {
  const payload = {
    package_id: values.productDetails.id,
    order_type: "PACKAGE",
    package_type: selectedPackageType || "CLASS",
    applicable_ids: [values.productDetails.id],
    member_id: values.member_id || user?.id,
    club_id: values.club_id || user?.club_id,
  };

  if (values.coupon) payload.coupon_code = values.coupon;
  if (values.coins > 0) payload.coins = values.coins;

  // ✅ ADD start_date for ALL datetime-based services
  if (SERVICES_WITH_DATETIME.includes(values.service_name?.toUpperCase())) {
    const date = new Date(values.start_date);
    const [h, m] = values.start_time.split(":");
    date.setHours(+h, +m, 0, 0);

    payload.start_date = formatDateTimeWithMicroseconds(date);
  }

  // ✅ Recovery-only fields
  if (values.service_name?.toUpperCase() === "RECOVERY") {
    payload.package_type = "SESSION";
    payload.package_variation_id = values.variation.id;
  }

  return payload;
};

const CreateNewInvoice = ({ setInvoiceModal, selectedLeadMember, clubId }) => {
  const { user } = useSelector((state) => state.auth);

  const [service, setService] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showVariationModal, setShowVariationModal] = useState(false);
  const [selectedPackageType, setSelectedPackageType] = useState("");
  const [voucherInput, setVoucherInput] = useState("");
  const [voucherStatus, setVoucherStatus] = useState(null);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");
  const [orderNo, setOrderNo] = useState("");

  const leadBoxRef = useRef(null);

  /* ================= INITIAL VALUES ================= */

  const initialValues = {
    member_id: null,
    club_id: null,
    product_type: "",
    service_name: "",
    start_date: null,
    start_time: "",
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
    variation: null,
    coupon: "",
    discountAmount: 0,
    final_amount: 0,
    amount_pay: 0,
    coins: 0,
  };

  /* ================= VALIDATION ================= */

  const validationSchema = Yup.object({
    product_type: Yup.string().required("Product type is required"),

    productDetails: Yup.object({
      title: Yup.string().required("Product name is required"),
    }),

    start_date: Yup.date().when("service_name", {
      is: (name) =>
        ["PILATES", "RECOVERY", "PERSONAL TRAINING"].includes(
          name?.toUpperCase(),
        ),
      then: (schema) => schema.required("Start date is required"),
      otherwise: (schema) => schema.nullable(),
    }),

    start_time: Yup.string().when("service_name", {
      is: (name) =>
        ["PILATES", "RECOVERY", "PERSONAL TRAINING"].includes(
          name?.toUpperCase(),
        ),
      then: (schema) => schema.required("Start time is required"),
      otherwise: (schema) => schema.notRequired(),
    }),

    variation: Yup.mixed().when("service_name", {
      is: (name) => name?.toUpperCase() === "RECOVERY",
      then: (schema) => schema.required("Variation is required"),
      otherwise: (schema) => schema.nullable(),
    }),
  });

  /* ================= FORMIK ================= */

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    validateOnMount: true,
    onSubmit: async (values, helpers) => {
      console.log(values, "values");

      await helpers.validateForm();

      // ✅ FIXED: use formik.isValid (NOT helpers.isValid)
      if (!formik.isValid) {
        helpers.setTouched(
          {
            product_type: true,
            productDetails: { title: true },
            start_date: true,
            start_time: true,
            variation: true,
          },
          true,
        );
        return;
      }

      try {
        const payload = buildPaymentPayload({
          values,
          user,
          selectedPackageType,
          isRecovery: isRecoveryService(),
        });

        console.log("Payment payload:", payload);

        const res = await authAxios().post("/payment/proceed", payload);

        if (res.data?.status) {
          const { paymentUrl, order_no } = res.data.response;

          if (paymentUrl && order_no) {
            setPaymentUrl(paymentUrl);
            setOrderNo(order_no);
            setPaymentModalOpen(true); // ✅ OPEN PAYMENT MODAL
            toast.success("Payment initiated successfully");
          } else {
            // ❌ Status true but required data missing
            setInvoiceModal(false);
            toast.success("Service booked successfully");
          }
        } else {
          // ❌ API status false
          setInvoiceModal(false);
          toast.success("Service booked successfully");
        }

        // if (res.data?.status) {
        //   toast.success("Payment initiated successfully");
        //   helpers.resetForm();
        //   setInvoiceModal(false);
        // }
      } catch (err) {
        setInvoiceModal(false);
        toast.error(err?.response?.data?.message);
      }
    },
  });

  /* ================= DATA ================= */

  // useEffect(() => {
  //   authAxios()
  //     .get(`/service/list?club_id${clubId}`)
  //     .then((res) =>
  //       setService(res.data.data.filter((s) => s.status === "ACTIVE")),
  //     );
  // }, [clubId]);

  // ✅ Fetch lead details when selectedId changes
  useEffect(() => {
    if (!selectedLeadMember) return;

    const fetchMemberById = async (id) => {
      try {
        const res = await authAxios().get(`/member/${id}`);
        const data = res.data?.data || res.data || null;

        if (data) {
          formik.setFieldValue("member_id", data.id || null);
          formik.setFieldValue("club_id", data.club_id || null);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch module details");
      }
    };

    fetchMemberById(selectedLeadMember);
  }, [selectedLeadMember]);

  useEffect(() => {
    if (!selectedLeadMember) return;

    authAxios()
      .get(`/member/${selectedLeadMember}`)
      .then((res) => {
        const data = res.data?.data;
        if (data) {
          formik.setFieldValue("member_id", data.id);
          formik.setFieldValue("club_id", data.club_id);
        }
      })
      .catch(() => toast.error("Failed to fetch member"));
  }, [selectedLeadMember]);

  useEffect(() => {
    const selected = service.find((s) => s.id === formik.values.product_type);
    formik.setFieldValue("service_name", selected?.name || "");
  }, [formik.values.product_type, service]);

  /* ================= HELPERS ================= */

  const isRecoveryService = () =>
    formik.values.service_name.toUpperCase() === "RECOVERY";

  const shouldShowDateTime = () =>
    SERVICES_WITH_DATETIME.includes(formik.values.service_name.toUpperCase());

  const productTypeOptions =
    service
      ?.map((item) => ({
        label: item.name,
        value: item.id,
        type: item.type,
      }))
      .filter((item) => item.type !== "PRODUCT") || [];

  /* ================= PRODUCT ================= */

  const handleProductSubmit = (product) => {
    setSelectedPackageType(product.package_type || "CLASS");

    const total = product.amount - product.discount;
    const gstAmount = (total * product.gst) / 100;
    const finalAmount = total + gstAmount;

    formik.setValues({
      ...formik.values,
      productDetails: {
        id: product.id,
        title: product.name,
        duration_value: product.session_duration,
        duration_type: "minutes",
        amount: product.amount,
        discount: product.discount,
        total_amount: total,
        gst: product.gst,
        gst_amount: gstAmount,
        final_amount: finalAmount,
      },
      variation: null,
      final_amount: finalAmount,
      amount_pay: finalAmount,
    });

    if (isRecoveryService()) setShowVariationModal(true);
  };

  const handleVariationSubmit = (variation) => {
    const amount = Number(variation.amount) || 0;
    const discount = Number(variation.discount) || 0;
    const gstPercent = Number(variation.gst) || 0;

    const totalAmount = amount - discount;
    const gstAmount = (totalAmount * gstPercent) / 100;
    const finalAmount = totalAmount + gstAmount;

    // Update with variation pricing
    formik.setValues({
      ...formik.values,
      variation: {
        id: variation.id,
        name: variation.name,
        no_of_sessions: variation.no_of_sessions,
        session_duration: variation.session_duration,
        session_validity: variation.session_validity,
      },
      productDetails: {
        ...formik.values.productDetails,
        amount,
        discount,
        total_amount: totalAmount,
        gst: gstPercent,
        gst_amount: gstAmount,
        final_amount: finalAmount,
        duration_value: variation.session_duration,
        duration_type: "minutes",
      },
      final_amount: finalAmount,
      amount_pay: finalAmount,
    });

    // Mark field as touched and validate
    setTimeout(() => {
      formik.setFieldTouched("variation", true, true);
      formik.validateField("variation");
    }, 0);

    setShowVariationModal(false);
  };
  /* ================= COUPON ================= */

  const applyCoupon = async () => {
    if (!voucherInput.trim()) return;

    try {
      setVoucherStatus("loading");

      const payload = {
        coupon: voucherInput.trim(),
        applicable_ids: [formik.values.productDetails?.id],
        applicable_type: "PACKAGE",
        amount: formik.values.productDetails?.total_amount,
        club_id: formik.values.club_id,
        member_id: formik.values.member_id,
      };

      const res = await authAxios().post("/coupon/applicable", payload);
      const data = res.data?.data;

      const discount = Number(data.discountAmount) || 0;
      const total = formik.values.productDetails.total_amount - discount;
      const gst = (total * formik.values.productDetails.gst) / 100;

      const finalAmount = total + gst;

      setVoucherStatus("success");

      formik.setValues({
        ...formik.values,
        coupon: voucherInput,
        discountAmount: discount,
        final_amount: finalAmount,
        amount_pay: finalAmount,
      });
    } catch {
      setVoucherStatus("error");
    }
  };

 
  // Fetch services
  const fetchService = async (clubId = null) => {
    try {
      const params = {};
      if (clubId) params.club_id = clubId;
      const res = await authAxios().get("/service/list", { params });
      let data = res.data?.data || res.data || [];
      const activeService = data.filter((item) => item.status === "ACTIVE");
      setService(activeService);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch service");
    }
  };

  useEffect(() => {
    fetchService(clubId);
  }, [clubId]); // <-- dependency added

  // Re-validate when service changes
  useEffect(() => {
    if (formik.values.product_type && service.length > 0) {
      formik.validateForm();
    }
  }, [formik.values.product_type, service]);

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      setInvoiceModal(false);
    }
  };

  // useEffect(() => {
  //   console.log("Formik Errors:", formik.errors);
  //   console.log("Formik Touched:", formik.touched);
  //   console.log("Formik Values:", formik.values);
  // }, [formik.errors, formik.touched, formik.values]);

  return (
    <>
      <div
        className="bg--blur create--lead--container overflow-auto hide--overflow fixed top-0 left-0 z-[999] w-full bg-black bg-opacity-60 h-full"
        onClick={handleOverlayClick}
      >
        <div
          className="min-h-[70vh] w-[95%] max-w-5xl mx-auto mt-[100px] mb-[100px] container--leadbox rounded-[10px] flex flex-col"
          ref={leadBoxRef}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-t-[10px] flex gap-3 items-center justify-between py-4 px-4 border-b">
            <h2 className="text-xl font-semibold">Create a Invoice</h2>
            <div
              className="close--lead cursor-pointer"
              onClick={() => setInvoiceModal(false)}
            >
              <IoCloseCircle className="text-3xl" />
            </div>
          </div>

          <div className="flex-1">
            <form onSubmit={formik.handleSubmit}>
              <div className="flex bg-white rounded-b-[10px]">
                <div className="p-6 flex-1">
                  <div className="grid grid-cols-3 gap-4">
                    {/* Product Type */}
                    <div>
                      <label className="mb-2 block">
                        Product Type<span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                          <FaListCheck />
                        </span>
                        <Select
                          name="product_type"
                          options={productTypeOptions}
                          value={productTypeOptions.find(
                            (opt) => opt.value === formik.values.product_type,
                          )}
                          onChange={(option) => {
                            formik.setFieldValue("product_type", option.value);
                            formik.setFieldValue("service_name", option.label); // ✅ KEY
                            formik.setFieldValue(
                              "productDetails",
                              initialValues.productDetails,
                            );
                            formik.setFieldValue("variation", null);
                            formik.setFieldValue("start_date", null);
                            formik.setFieldValue("start_time", "");
                            setVoucherInput("");
                            setVoucherStatus("");
                          }}
                          styles={selectIcon}
                        />
                      </div>
                      {formik.errors.product_type &&
                        formik.touched.product_type && (
                          <div className="text-red-500 text-sm mt-1">
                            {formik.errors.product_type}
                          </div>
                        )}
                    </div>

                    {/* Product Name */}
                    <div>
                      <label className="mb-2 block">
                        Product Name<span className="text-red-500">*</span>
                      </label>
                      <div
                        className="relative cursor-pointer"
                        onClick={() => {
                          if (!formik.values.product_type) {
                            toast.error("Please select a product type first");
                            return;
                          }
                          setShowProductModal(true);
                        }}
                      >
                        <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                          <FaListCheck />
                        </span>
                        <input
                          name="productDetails.title"
                          value={formik.values?.productDetails?.title}
                          onBlur={() =>
                            formik.setFieldTouched("productDetails.title", true)
                          }
                          className="custom--input w-full input--icon cursor-pointer"
                          readOnly
                          placeholder="Select product"
                        />
                      </div>
                      {formik.errors?.productDetails?.title &&
                        formik.touched?.productDetails?.title && (
                          <div className="text-red-500 text-sm mt-1">
                            {formik.errors?.productDetails?.title}
                          </div>
                        )}
                    </div>

                    {/* Variation (Recovery only) */}
                    {isRecoveryService() &&
                      formik.values.productDetails?.id && (
                        <div>
                          <label className="mb-2 block">
                            Variation<span className="text-red-500">*</span>{" "}
                            {formik.values.variation && (
                              <span className="text-green-600">✓</span>
                            )}
                          </label>
                          <div
                            className="relative cursor-pointer"
                            onClick={() => setShowVariationModal(true)}
                          >
                            <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                              <FaListCheck />
                            </span>
                            <input
                              value={formik.values.variation?.name || ""}
                              onBlur={() =>
                                formik.setFieldTouched("variation", true)
                              }
                              className="custom--input w-full input--icon cursor-pointer"
                              readOnly
                              placeholder="Select variation"
                            />
                          </div>
                          {formik.errors?.variation &&
                            formik.touched?.variation && (
                              <div className="text-red-500 text-sm mt-1">
                                {typeof formik.errors.variation === "string"
                                  ? formik.errors.variation
                                  : "Variation is required"}
                              </div>
                            )}
                          {formik.values.variation && (
                            <div className="mt-1 text-xs text-gray-600">
                              <strong className="text-black">
                                {formik.values.variation.no_of_sessions}
                              </strong>{" "}
                              sessions /{" "}
                              <strong className="text-black">
                                {formik.values.variation.session_duration}
                              </strong>{" "}
                              mins / Valid for{" "}
                              <strong className="text-black">
                                {formik.values.variation.session_validity}
                              </strong>{" "}
                              days
                            </div>
                          )}
                        </div>
                      )}

                    {/* Conditional Date/Time for specific services */}
                    {shouldShowDateTime() && (
                      <>
                        {/* Start Date */}
                        <div>
                          <label className="mb-2 block">
                            Start Date<span className="text-red-500">*</span>
                          </label>
                          <div className="custom--date relative">
                            <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                              <FaCalendarDays />
                            </span>
                            <DatePicker
                              selected={formik.values.start_date}
                              onChange={(date) => {
                                formik.setFieldValue("start_date", date);
                                formik.setFieldValue("start_time", "");
                              }}
                              onBlur={() =>
                                formik.setFieldTouched("start_date", true, true)
                              }
                              minDate={new Date()}
                              dateFormat="dd MMM yyyy"
                              placeholderText="Select date"
                              className={`input--icon ${
                                formik.errors?.start_date &&
                                formik.touched?.start_date
                                  ? "border-red-500"
                                  : ""
                              }`}
                            />
                          </div>
                          {formik.errors?.start_date &&
                            formik.touched?.start_date && (
                              <div className="text-red-500 text-sm mt-1">
                                {formik.errors.start_date}
                              </div>
                            )}
                        </div>

                        {/* Start Time */}
                        <div>
                          <label className="mb-2 block">
                            Start Time<span className="text-red-500">*</span>
                          </label>
                          <div className="custom--date relative">
                            <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                              <GoClock />
                            </span>
                            <DatePicker
                              selected={
                                formik.values.start_time
                                  ? parseTime(formik.values.start_time)
                                  : null
                              }
                              onChange={(date) => {
                                if (date) {
                                  formik.setFieldValue(
                                    "start_time",
                                    date.toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: false,
                                    }),
                                  );
                                } else {
                                  formik.setFieldValue("start_time", "");
                                }
                                formik.setFieldTouched(
                                  "start_time",
                                  true,
                                  true,
                                );
                              }}
                              onBlur={() =>
                                formik.setFieldTouched("start_time", true, true)
                              }
                              /* ✅ 1. Disable if start date not selected */
                              disabled={!formik.values.start_date}
                              showTimeSelect
                              showTimeSelectOnly
                              timeIntervals={60}
                              dateFormat="hh:mm aa"
                              placeholderText="Select time"
                              isClearable
                              /* ✅ 3. Time range 9:00 AM – 8:00 PM */
                              minTime={
                                isToday(formik.values.start_date)
                                  ? roundUpToNextInterval(new Date())
                                  : getTodayAtTime(9, 0)
                              }
                              maxTime={getTodayAtTime(20, 0)}
                              /* Optional: prevent selecting past times even if user clicks */
                              filterTime={(time) => {
                                if (!isToday(formik.values.start_date))
                                  return true;
                                return time >= new Date();
                              }}
                              className={`custom--input w-full input--icon ${
                                formik.errors?.start_time &&
                                formik.touched?.start_time
                                  ? "border-red-500"
                                  : ""
                              }`}
                            />
                          </div>
                          {formik.errors?.start_time &&
                            formik.touched?.start_time && (
                              <div className="text-red-500 text-sm mt-1">
                                {formik.errors.start_time}
                              </div>
                            )}
                        </div>
                      </>
                    )}

                    {/* Voucher Code */}
                    <div>
                      <label className="mb-2 block">Voucher Code</label>
                      <div className="flex gap-0 relative">
                        <span className="absolute top-[50%] translate-y-[-50%] left-[12px] z-[1]">
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
                          onClick={applyCoupon}
                          disabled={voucherStatus === "loading"}
                          className="px-4 py-2 bg-black text-white rounded-r-[10px] hover:bg-gray-800 disabled:opacity-50"
                        >
                          {voucherStatus === "loading" ? "..." : "Apply"}
                        </button>
                      </div>
                      {voucherStatus === "success" && (
                        <p className="text-green-600 text-sm mt-1">
                          Voucher applied successfully
                        </p>
                      )}
                      {voucherStatus === "error" && (
                        <p className="text-red-600 text-sm mt-1">
                          Invalid voucher code
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Price Calculation */}
                  <div className="mt-5 bg-[#f7f7f7] p-[20px] rounded-[10px]">
                    <h3 className="text-2xl font-semibold">
                      Price Calculation
                    </h3>
                    <div className="price--calculation2 my-5">
                      <div className="price--item">
                        <p className="flex items-center gap-2 justify-between mb-2 border-b pb-2">
                          Duration:{" "}
                          <span className="font-bold">
                            {formik.values.productDetails?.duration_value ?? 0}{" "}
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
                              ₹{formik.values.productDetails?.total_amount ?? 0}
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
                </div>
              </div>

              <div className="flex gap-4 py-5 justify-end px-0">
                <button
                  type="button"
                  className="px-4 py-2 bg-transparent border border-white text-white font-semibold rounded max-w-[150px] w-full"
                  onClick={() => {
                    formik.resetForm();
                    setInvoiceModal(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-white text-black font-semibold rounded max-w-[150px] w-full hover:bg-gray-100"
                >
                  Make Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <InvoiceProductDetails
          serviceId={formik.values.product_type}
          onSubmit={handleProductSubmit}
          onClose={() => setShowProductModal(false)}
          clubId={clubId}
        />
      )}

      {/* Variation Modal (Recovery only) */}
      {showVariationModal && (
        <InvoiceProductDetails
          serviceId={formik.values.product_type}
          packageId={formik.values.productDetails?.id}
          isVariationModal={true}
          onSubmit={handleVariationSubmit}
          onClose={() => setShowVariationModal(false)}
          clubId={clubId}
        />
      )}

      {paymentModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg w-[500px] p-6">
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
                  formik.resetForm(); // optional
                }}
                className="px-4 py-2 border rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateNewInvoice;
