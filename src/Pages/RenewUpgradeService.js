import React, { useEffect, useRef, useState } from "react";
import { IoCloseCircle } from "react-icons/io5";
import { useFormik } from "formik";
import * as Yup from "yup";
import ProductModal from "../components/modal/ProductDetails";
import { addMonthsToDate, customStyles } from "../Helper/helper";
import { mockData, servicesList } from "../DummyData/DummyData";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FieldArray } from "formik";
import { FaPlus } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const voucherList = [
  { code: "FIT10", discount: 10 },
  { code: "WELCOME20", discount: 20 },
  { code: "SUMMER25", discount: 25 },
];

const validationSchema = Yup.object({
  invoiceDetails: Yup.object({
    invoiceDate: Yup.string().required("Invoice Date is required"),
    leadOwner: Yup.string().required("Lead Owner is required"),
    memberName: Yup.string().required("Name/Mobile Number is required"),
  }),
  productType: Yup.string().required("Product Type is required"),
});

const CreateInvoice = ({
  setInvoiceModal,
  leadPaymentSend,
  upgradePlan,
  renewPlan,
}) => {
  console.log(upgradePlan, "upgradePlan");
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductIndex, setEditingProductIndex] = useState(null);
  const { user } = useSelector((state) => state.auth);

  const [voucherInput, setVoucherInput] = useState("");
  const [voucherStatus, setVoucherStatus] = useState(null); // "success", "error", or null
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [selectedProductType, setSelectedProductType] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const leadBoxRef = useRef(null);

  const initialValues = {
    invoiceDetails: {
      invoiceDate: "",
      leadOwner: user?.name,
      memberName: "",
    },

    productInfo: [
      {
        productType: "",
        serviceVariation: "",
        startDate: "",
        endDate: "",
        sacCode: "",
        duration: "",
        productAmount: "",
        discountCode: "",
        finalAmount: "",
        appliedVoucherCode: "",
        discountPercent: 0,
        voucherStatus: "",
      },
    ],

    totalAmount: "",
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      console.log("Submitting full form", values);
    },
  });

  const regFee = 10;

  const serviceFee = formik.values.productInfo.reduce((sum, item) => {
    const amount = parseFloat(item.finalAmount || item.productAmount) || 0;
    return sum + amount;
  }, 0);

  const cgst = serviceFee * 0.09;
  const sgst = serviceFee * 0.09;
  const subtotal = regFee + serviceFee + cgst + sgst;

  const discountPercent = selectedVoucher?.discount || 0;
  const discountAmount = (subtotal * discountPercent) / 100;
  const total = subtotal - discountAmount;

  useEffect(() => {
    formik.setFieldValue(
      "invoiceDetails.invoiceDate",
      new Date().toISOString().split("T")[0]
    );
  }, []);

  useEffect(() => {
    if (upgradePlan) {
      formik.setFieldValue("productInfo.0.productType", "membership plan");
    }
  }, [upgradePlan]);


  const handleProductSubmit = (product) => {
    const newItem = {
      ...formik.values.productInfo[editingProductIndex],
      productType: upgradePlan ? "membership plan" : product.productName,
      serviceVariation: product.shortDescription,
      duration: product.servicesDuration,
      productAmount: product.amount,
      month: product.month, // Ensure this is set
      // Optionally reset discountCode, productTotal, etc.
    };

    const updatedList = [...formik.values.productInfo];
    updatedList[editingProductIndex] = newItem;

    formik.setFieldValue("productInfo", updatedList);
    setEditingProductIndex(null);

    // Recalculate start and end date if the serviceVariation changes
    const months = parseInt(newItem.month) || 1;
    const updatedListWithDates = updatedList.map((item, index) => {
      if (index === editingProductIndex) {
        // If we have a startDate, recalculate endDate
        if (item.startDate) {
          item.endDate = addMonthsToDate(item.startDate, months);
        }
      }
      return item;
    });

    formik.setFieldValue("productInfo", updatedListWithDates);
  };

  const addMonthsToDate = (date, months) => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + months);
    return newDate;
  };

  const handleStartDateChange = (date, index) => {
    const updatedList = [...formik.values.productInfo];

    // ✅ Check if the user selected a product variation first
    if (!updatedList[index].serviceVariation) {
      toast.warning("Please select a product first.");
      return;
    }

    const months = parseInt(updatedList[index].month) || 1;
    updatedList[index].startDate = date;
    updatedList[index].endDate = addMonthsToDate(date, months);

    formik.setFieldValue("productInfo", updatedList);
  };

  useEffect(() => {
    if (editingProductIndex !== null) {
      const updatedList = [...formik.values.productInfo];
      const product = updatedList[editingProductIndex];

      // If the service variation changes, update start/end date
      if (product.serviceVariation) {
        const months = parseInt(product.month) || 1;
        if (product.startDate) {
          product.endDate = addMonthsToDate(product.startDate, months);
        }
      }
      formik.setFieldValue("productInfo", updatedList);
    }
  }, [formik.values.productInfo[editingProductIndex]?.serviceVariation]);

  const handleApplyVoucher = (index) => {
    const product = formik.values.productInfo[index];
    const enteredCode = product.discountCode.trim().toLowerCase();

    const matchedVoucher = voucherList.find(
      (v) => v.code.toLowerCase() === enteredCode
    );

    const updatedList = [...formik.values.productInfo];

    if (matchedVoucher) {
      const discount = matchedVoucher.discount;
      const amount = parseFloat(product.productAmount) || 0;
      const discountedAmount = amount - (amount * discount) / 100;

      updatedList[index] = {
        ...product,
        voucherStatus: "success",
        appliedVoucherCode: matchedVoucher.code,
        discountPercent: discount,
        finalAmount: discountedAmount.toFixed(2),
      };
    } else {
      updatedList[index] = {
        ...product,
        voucherStatus: "error",
        appliedVoucherCode: "",
        discountPercent: 0,
        finalAmount: product.productAmount,
      };
    }

    formik.setFieldValue("productInfo", updatedList);
  };

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      setInvoiceModal(false);
    }
  };

  const handleLeadModal = () => {
    setInvoiceModal(false);
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
              {upgradePlan ? "Upgrade Service": renewPlan ? "Renew Plan" : "" }
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
              <div className="flex bg-white rounded-b-[10px]">
                <div className="p-6 flex-1">

                  {formik.values.productInfo.map((product, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-3 gap-4 mb-6 border pb-4 bg-gray-50 p-3 rounded"
                    >
                      {/* Product Type */}
                      <div>
                        <label className="mb-2 block">Product Type</label>
                        <Select
                          name={`productInfo.${index}.productType`}
                          value={servicesList.find(
                            (s) =>
                              s.value ===
                              formik.values.productInfo?.[index]?.productType
                          )}
                          //                          value={
                          //   servicesList.find(
                          //     (s) => s.value === formik.values.productInfo?.[index]?.productType
                          //   ) || null
                          // }
                          onChange={(selected) =>
                            formik.setFieldValue(
                              `productInfo.${index}.productType`,
                              selected?.value || ""
                            )
                          }
                          options={
                            leadPaymentSend
                              ? [
                                  {
                                    value: "membership plan",
                                    label: "Membership Plan",
                                  },
                                ]
                              : servicesList
                          }
                          styles={customStyles}
                          isDisabled={upgradePlan ? true : false}
                        />
                      </div>

                      {/* Variation */}
                      <div>
                        <label className="mb-2 block">Variation</label>
                        <div
                          onClick={() => {
                            if (!product.productType) {
                              toast.warning(
                                "Please select a Product Type first."
                              );
                              return;
                            }

                            setSelectedProductType(product.productType); // <-- Track this for modal filtering
                            setEditingProductIndex(index);
                            setShowProductModal(true);
                          }}
                        >
                          <input
                            name={`productInfo.${index}.serviceVariation`}
                            value={product.serviceVariation}
                            className="custom--input w-full"
                            readOnly
                          />
                        </div>
                      </div>

                      {/* Start & Expiry Dates */}
                      <div className="flex gap-3">
                        <div>
                          <label className="mb-2 block">Start date</label>
                          <div className="custom--date">
                            <DatePicker
                              selected={
                                product.startDate
                                  ? new Date(product.startDate)
                                  : null
                              }
                              onChange={(date) =>
                                handleStartDateChange(date, index)
                              }
                              dateFormat="dd MMM yyyy"
                              placeholderText="Start date"
                              readOnly={!product.serviceVariation}
                              isDisabled={upgradePlan && !renewPlan ? true : false}
                              className={`${
                                upgradePlan && !renewPlan
                                  ? "bg-[#fafafa] pointer-events-none"
                                  : ""
                              }`}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block">Expiry date</label>
                          <div className="custom--date">
                            <DatePicker
                              selected={
                                product.endDate
                                  ? new Date(product.endDate)
                                  : null
                              }
                              dateFormat="dd MMM yyyy"
                              placeholderText="End date"
                              readOnly={true}
                              className="bg-[#fafafa] pointer-events-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Duration */}
                      <div>
                        <label className="mb-2 block">Duration</label>
                        <input
                          name={`productInfo.${index}.duration`}
                          value={product.duration}
                          onChange={(e) =>
                            formik.setFieldValue(
                              `productInfo.${index}.duration`,
                              e.target.value
                            )
                          }
                          readOnly={true}
                          className="custom--input w-full bg-[#fafafa] pointer-events-none"
                        />
                      </div>

                      {/* Service Fee */}
                      <div>
                        <label className="mb-2 block">Service Fee</label>
                        <input
                          name={`productInfo.${index}.productAmount`}
                          value={product.productAmount}
                          className="custom--input w-full bg-[#fafafa] pointer-events-none"
                          readOnly={true}
                        />
                      </div>

                      {/* Voucher Code (Per Product) */}
                      <div>
                        <label className="mb-2 block">Voucher Code</label>
                        <div className="flex gap-0">
                          <input
                            name={`productInfo.${index}.discountCode`}
                            type="text"
                            value={product.discountCode || ""}
                            onChange={(e) =>
                              formik.setFieldValue(
                                `productInfo.${index}.discountCode`,
                                e.target.value
                              )
                            }
                            placeholder="Enter voucher code"
                            className="!rounded-r-[0px] custom--input w-full"
                          />
                          <button
                            type="button"
                            onClick={() => handleApplyVoucher(index)}
                            className="px-4 py-2 bg-black text-white rounded-r-[10px]"
                          >
                            Apply
                          </button>
                        </div>
                        {product.voucherStatus === "success" && (
                          <p className="text-green-600 text-sm mt-1">
                            Voucher applied: {product.appliedVoucherCode} (
                            {product.discountPercent}% off)
                          </p>
                        )}
                        {product.voucherStatus === "error" && (
                          <p className="text-red-600 text-sm mt-1">
                            Invalid voucher code.
                          </p>
                        )}
                      </div>

                      {/* Remove Button */}
                      {index === 0 ? null : (
                        <div className="col-span-3 flex justify-between">
                          <button
                            type="button"
                            className="px-5 py-3 text-sm rounded bg-black text-white flex items-center justify-center gap-2"
                            onClick={() => {
                              const updated = [...formik.values.productInfo];
                              updated.splice(index, 1);
                              formik.setFieldValue("productInfo", updated);
                            }}
                          >
                            <RiDeleteBin6Line />
                            Remove
                          </button>
                        </div>
                      )}

                      {/* {product.voucherStatus === "success" && (
                        <div className="text-lg text-black">
                          Final Price after discount:{" "}
                          <strong>₹{product.finalAmount}</strong>
                        </div>
                      )} */}
                    </div>
                  ))}

                  {!leadPaymentSend && (
                    <button
                      type="button"
                      className={`px-5 py-3 text-sm rounded bg-black text-white items-center justify-center gap-2 ${
                        upgradePlan ? "hidden" : "flex"
                      }`}
                      onClick={() => {
                        const newProduct = {
                          productType: "",
                          serviceVariation: "",
                          startDate: "",
                          endDate: "",
                          sacCode: "",
                          duration: "",
                          productAmount: "",
                          discount: "",
                          productTotal: "",
                        };
                        formik.setFieldValue("productInfo", [
                          ...formik.values.productInfo,
                          newProduct,
                        ]);
                      }}
                    >
                      <FaPlus />
                      Add Another Product
                    </button>
                  )}

                  <div className="bg-[#f7f7f7] p-[20px] rounded-[10px] mt-4">
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
                          Total Service Fee:{" "}
                          <span className="font-bold">
                            ₹{serviceFee.toFixed(2)}
                          </span>
                        </p>
                      </div>
                      <div className="price--item">
                        <p className="flex items-center gap-2 justify-between mb-2 border-b pb-2">
                          CGST (9%):{" "}
                          <span className="font-bold">₹{cgst.toFixed(2)}</span>
                        </p>
                      </div>
                      <div className="price--item">
                        <p className="flex items-center gap-2 justify-between mb-2 border-b pb-2">
                          SGST (9%):{" "}
                          <span className="font-bold">₹{sgst.toFixed(2)}</span>
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
                    </div>
                    <p className="text-1xl font-semibold flex items-center gap-2 justify-between pb-2">
                      Total Payment:{" "}
                      <span className="font-bold">₹{total.toFixed(2)}</span>
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
                    setInvoiceModal(false);
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
      </div>

      {showProductModal && (
        <ProductModal
          selectedType={selectedProductType}
          onSubmit={handleProductSubmit}
          onClose={() => setShowProductModal(false)}
        />
      )}
    </>
  );
};

export default CreateInvoice;
