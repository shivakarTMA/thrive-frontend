import React, { useEffect, useRef, useState } from "react";
import { IoCloseCircle } from "react-icons/io5";
import { useFormik } from "formik";
import * as Yup from "yup";
import ProductModal from "../components/modal/ProductDetails";
import { customStyles, formatText } from "../Helper/helper";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const voucherList = [
  { code: "FIT10", discount: 10 },
  { code: "WELCOME20", discount: 20 },
  { code: "SUMMER25", discount: 25 },
];

const validationSchema = Yup.object({
  productType: Yup.string().required("Product Type is required"),
});

const SendPaymentLink = ({ setSendPaymentModal, leadPaymentSend }) => {
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductIndex, setEditingProductIndex] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const selectedProductType = "Membership Plan";

  const leadBoxRef = useRef(null);

  const formik = useFormik({
    initialValues: {
      productType: "MEMBERSHIP_PLAN",
      title: "",
      duration_value: 0,
      duration_type: "",
      amount: 0,
      discount: 0,
      total_amount: 0,
      gst: 0,
      gst_amount: 0,
      final_amount: 0,
      startDate: "",
      endDate: "",
    },
    validationSchema,
    onSubmit: (values) => {
      console.log("Submitting full form", values);
    },
  });

  const addMonthsToDate = (date, months) => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + months);
    return newDate;
  };

  const handleStartDateChange = (date) => {
    formik.setFieldValue("startDate", date);
    if (formik.values.duration_value) {
      const endDate = addMonthsToDate(
        date,
        parseInt(formik.values.duration_value)
      );
      formik.setFieldValue("endDate", endDate);
    }
  };

  const handleVoucherApply = () => {
    const voucher = voucherList.find(
      (v) => v.code.toUpperCase() === formik.values.discountCode.toUpperCase()
    );
    if (voucher) {
      formik.setFieldValue("discountAmount", voucher.discount);
      formik.setFieldValue(
        "totalAmount",
        Math.max(formik.values.productAmount - voucher.discount, 0)
      );
      toast.success(`Voucher applied! You saved ₹${voucher.discount}`);
    } else {
      toast.error("Invalid voucher code");
      formik.setFieldValue("discountAmount", 0);
      formik.setFieldValue("totalAmount", formik.values.productAmount);
    }
  };

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      setSendPaymentModal(false);
    }
  };

  const handleProductSubmit = (product) => {
    formik.setFieldValue("title", product.title);
    formik.setFieldValue("duration_value", product.duration_value);
    formik.setFieldValue("duration_type", product.duration_type);
    formik.setFieldValue("amount", product.amount);
    formik.setFieldValue("discount", product.discount);
    formik.setFieldValue("total_amount", product.total_amount);
    formik.setFieldValue("gst", product.gst);
    formik.setFieldValue("gst_amount", product.gst_amount);
    formik.setFieldValue("final_amount", product.final_amount);
  };

  useEffect(() => {
    if (leadPaymentSend && formik.values.productType !== "MEMBERSHIP_PLAN") {
      formik.setFieldValue("productType", "MEMBERSHIP_PLAN");
    }
  }, [leadPaymentSend]);

  const calculateEndDate = (startDate, durationValue, durationType) => {
    if (!startDate || !durationValue || !durationType) return null;

    const newDate = new Date(startDate);

    if (durationType === "MONTH") {
      newDate.setMonth(newDate.getMonth() + parseInt(durationValue));
    } else if (durationType === "DAY") {
      newDate.setDate(newDate.getDate() + parseInt(durationValue));
    }

    return newDate;
  };

  useEffect(() => {
    const { startDate, duration_value, duration_type } = formik.values;

    if (startDate && duration_value && duration_type) {
      const endDate = calculateEndDate(
        startDate,
        duration_value,
        duration_type
      );
      formik.setFieldValue("endDate", endDate);
    } else {
      formik.setFieldValue("endDate", "");
    }
  }, [
    formik.values.startDate,
    formik.values.duration_value,
    formik.values.duration_type,
  ]);

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
                <div className="grid grid-cols-3 gap-4 mb-6 border pb-4 bg-gray-50 p-3 rounded mt-4">
                  {/* Product Type */}
                  <div>
                    <label className="mb-2 block">Product Type</label>
                    <input
                      name="productType"
                      value={formatText(formik.values?.productType)}
                      // onChange={handleInput}
                      readOnly={true}
                      className="custom--input w-full capitalize !bg-gray-100 pointer-events-none"
                      disabled={true}
                    />
                    {/* <Select
                      name="productType"
                      styles={customStyles}
                      value={formatText(formik.values?.productType)}
                      onChange={(option) =>
                        formik.setFieldValue("productType", option.value)
                      }
                      options={[
                        { value: "membership plan", label: "Membership Plan" },
                      ]}
                      isDisabled={true}
                    /> */}
                  </div>

                  {/* Variation */}
                  <div>
                    <label className="mb-2 block">Variation</label>
                    <div onClick={() => setShowProductModal(true)}>
                      <input
                        name="title"
                        value={formik.values.title}
                        className="custom--input w-full"
                        readOnly
                      />
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="flex gap-3">
                    <div>
                      <label className="mb-2 block">Start date</label>
                      <div className="custom--date">
                        <DatePicker
                          selected={formik.values.startDate}
                          onChange={handleStartDateChange}
                          dateFormat="dd MMM yyyy"
                          placeholderText="Select date"
                          readOnly={!formik.values.title}
                          minDate={new Date()}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block">Expiry date</label>
                      <div className="custom--date">
                        <DatePicker
                          selected={formik.values.endDate}
                          dateFormat="dd MMM yyyy"
                          readOnly
                          className="bg-[#fafafa] pointer-events-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="mb-2 block">Duration</label>
                    <input
                      name="duration_value"
                      value={formik.values?.duration_value ?? 0}
                      // onChange={formik.handleChange}
                      className="custom--input w-full !bg-gray-100 pointer-events-none"
                      readOnly={true}
                      disabled={true}
                    />
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="mb-2 block">Amount</label>
                    <input
                      name="amount"
                      value={formik.values?.amount ?? 0}
                      // onChange={formik.handleChange}
                      className="custom--input w-full !bg-gray-100 pointer-events-none"
                      readOnly={true}
                      disabled={true}
                    />
                  </div>

                  {/* Voucher Code */}
                  <div>
                    <label className="mb-2 block">Voucher Code</label>
                    <div className="flex gap-0">
                      <input
                        name="discountCode"
                        type="text"
                        value={formik.values.discountCode}
                        onChange={formik.handleChange}
                        placeholder="Enter voucher code"
                        className="!rounded-r-[0px] custom--input w-full"
                      />
                      <button
                        type="button"
                        // onClick={handleVoucherApply}
                        className="px-4 py-2 bg-black text-white rounded-r-[10px]"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-5 bg-[#f7f7f7] p-[20px] rounded-[10px]">
                  <h3 className="text-2xl font-semibold">Price Calculation</h3>
                  <div className="price--calculation2 my-5">
                    <div className="price--item">
                      <p className="flex items-center gap-2 justify-between mb-2 border-b pb-2">
                        Amount:{" "}
                        <span className="font-bold">
                          ₹{formik.values.amount ?? 0}
                        </span>
                      </p>
                    </div>
                    <div className="price--item">
                      <p className="flex items-center gap-2 justify-between mb-2 border-b pb-2">
                        Discount:{" "}
                        <span className="font-bold">
                          ₹{formik.values.discount ?? 0}
                        </span>
                      </p>
                    </div>
                    <div className="price--item">
                      <p className="flex items-center gap-2 justify-between mb-2 border-b pb-2">
                        Total Amount:{" "}
                        <span className="font-bold">
                          ₹{formik.values.total_amount ?? 0}
                        </span>
                      </p>
                    </div>
                    <div className="price--item">
                      <p className="flex items-center gap-2 justify-between mb-2 border-b pb-2">
                        GST:{" "}
                        <span className="font-bold">
                          ({formik.values.gst ?? 0}%) ₹
                          {formik.values.gst_amount ?? 0}
                        </span>
                      </p>
                    </div>
                  </div>
                  <p className="text-1xl font-semibold flex items-center gap-2 justify-between pb-2">
                    Final Amount:{" "}
                    <span className="font-bold">
                      ₹{formik.values.final_amount ?? 0}
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
                Make Payment
              </button>
            </div>
          </form>
        </div>
      </div>

      {showProductModal && (
        <ProductModal
          selectedType={formik.values?.productType}
          onClose={() => setShowProductModal(false)}
          onSubmit={handleProductSubmit}
        />
      )}
    </>
  );
};

export default SendPaymentLink;
