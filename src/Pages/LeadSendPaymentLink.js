import React, { useEffect, useRef, useState } from "react";
import { IoCloseCircle } from "react-icons/io5";
import { useFormik } from "formik";
import * as Yup from "yup";
import ProductModal from "../components/modal/ProductDetails";
import { customStyles, formatText, selectIcon } from "../Helper/helper";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import { authAxios } from "../config/config";
import { FaCalendarDays, FaListCheck } from "react-icons/fa6";
import { RiDiscountPercentFill } from "react-icons/ri";

const planTypeOption = [
  { value: "DLF", label: "DLF" },
  { value: "NONDLF", label: "NONDLF" },
];

const validationSchema = Yup.object({
  productType: Yup.string().required("Product Type is required"),
});

const LeadSendPaymentLink = ({ setSendPaymentModal, selectedLeadMember }) => {
  console.log(selectedLeadMember, "selectedLeadMember");

  const [showProductModal, setShowProductModal] = useState(false);

  const [voucherInput, setVoucherInput] = useState("");
  const [voucherStatus, setVoucherStatus] = useState(null); // "success", "error", or null
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");
  const [orderNo, setOrderNo] = useState("");

  const leadBoxRef = useRef(null);

  const initialValues = {
    id: "",
    club_id: null,
    productType: "MEMBERSHIP_PLAN",
    plan_type: "", // ✅ ADD THIS
    start_date: new Date(), // ✅ ADD THIS
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
    validationSchema,
    onSubmit: async (values) => {
      // console.log("Submitting full form", values);

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

        const res = await authAxios().post("/payment/proceed", paymentPayload);

        if (res.data?.status) {
          const { paymentUrl, order_no } = res.data.response;

          setPaymentUrl(paymentUrl);
          setOrderNo(order_no);
          setPaymentModalOpen(true); // ✅ OPEN MODAL

          toast.success("Payment send successfully!");
        }
      }
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
          formik.setValues({
            id: data.id || "",
            club_id: data.club_id || null,
            productType: "MEMBERSHIP_PLAN",
            start_date: formik.values.start_date || new Date(),
          });
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch module details");
      }
    };

    fetchLeadById(selectedLeadMember);
  }, [selectedLeadMember]);

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      setSendPaymentModal(false);
    }
  };

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
          className="min-h-[70vh] w-[95%] max-w-5xl mx-auto mt-[100px] mb-[100px] container--leadbox rounded-[10px] flex flex-col"
          ref={leadBoxRef}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-t-[10px] flex gap-3 items-center justify-between py-4 px-4 border-b">
            <h2 className="text-xl font-semibold">Send Payment Link</h2>
            <div
              className="close--lead cursor-pointer"
              onClick={() => setSendPaymentModal(false)}
            >
              <IoCloseCircle className="text-3xl" />
            </div>
          </div>

          <form onSubmit={formik.handleSubmit}>
            <div className="flex bg-white rounded-b-[10px]">
              <div className="p-6 flex-1">
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
                    {formik.errors?.plan_type && formik.touched?.plan_type && (
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
                        value={formik.values?.productDetails?.title || ""}
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
                  <h3 className="text-2xl font-semibold">Price Calculation</h3>
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
                            {" "}
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

            <div className="flex gap-4 py-5 justify-end">
              <button
                type="button"
                className="px-4 py-2 bg-transparent border border-white text-white font-semibold rounded max-w-[150px] w-full"
                onClick={() => {
                  formik.resetForm();
                  setSendPaymentModal(false);
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-white text-black font-semibold rounded max-w-[150px] w-full"
              >
                Send Payment
              </button>
            </div>
          </form>
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
                  setSendPaymentModal(false);
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

export default LeadSendPaymentLink;
