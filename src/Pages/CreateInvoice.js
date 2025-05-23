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

const CreateInvoice = ({ setInvoiceModal }) => {
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
    if (formik?.values?.memberDetails?.name) {
      formik.setFieldValue(
        "invoiceDetails.leadOwner",
        formik?.values?.memberDetails?.name
      );
      formik.setFieldValue(
        "invoiceDetails.memberName",
        formik?.values?.memberDetails?.name
      );
    }
  }, [formik?.values?.memberDetails?.name]);

  const handleProductSubmit = (product) => {
    const newItem = {
      ...formik.values.productInfo[editingProductIndex],
      productType: product.productName,
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

  const handleSearchInputChange = (e) => {
    const inputValue = e.target.value;
    formik.setFieldValue("invoiceDetails.memberName", inputValue);

    const trimmedInput = inputValue.trim();
    if (trimmedInput === "") {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }

    const isNumeric = /^\d+$/.test(trimmedInput);
    const normalizedInput = trimmedInput.toLowerCase();

    const filtered = mockData.filter((entry) => {
      const name = entry.name.toLowerCase().trim();
      const contact = entry.contact.replace(/\D/g, "");

      if (isNumeric) {
        return contact.includes(trimmedInput); // number match anywhere
      } else {
        return name.startsWith(normalizedInput); // name must start with input
      }
    });

    setSearchResults(filtered);
    setShowSuggestions(filtered.length > 0);
  };

  const handleSuggestionClick = (entry) => {
    formik.setFieldValue("invoiceDetails.memberName", entry.name);
    setSearchResults([]);
    setShowSuggestions(false);
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
        className="create--lead--container overflow-auto hide--overflow fixed top-0 left-0 z-[999] w-full bg-black bg-opacity-60 h-full"
        onClick={handleOverlayClick}
      >
        <div
          className="min-h-[70vh]  w-full max-w-5xl border shadow bg-white mx-auto mt-[100px] mb-[100px] container--leadbox rounded-[10px] flex flex-col"
          ref={leadBoxRef}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex gap-3 items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold">Create a Invoice</h2>
            <div
              className="close--lead cursor-pointer"
              onClick={handleLeadModal}
            >
              <IoCloseCircle className="text-3xl" />
            </div>
          </div>

          <div className="p-6">
            <form className="space-y-6" onSubmit={formik.handleSubmit}>
              <h3 className="text-2xl font-semibold">Invoice Details</h3>

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
                    // onChange={formik.handleChange}
                    className="custom--input w-full"
                    readOnly={true}
                  />
                  {formik.errors.invoiceDetails?.leadOwner &&
                    formik.touched.invoiceDetails?.leadOwner && (
                      <div className="text-red-500 text-sm">
                        {formik.errors.invoiceDetails?.leadOwner}
                      </div>
                    )}
                </div>

                <div className="relative">
                  <label className="mb-2 block">Name/Mobile Number</label>
                  <input
                    name="invoiceDetails.memberName"
                    value={formik.values.invoiceDetails.memberName}
                    onChange={handleSearchInputChange}
                    className="custom--input w-full"
                    autoComplete="off"
                  />
                  {formik.errors.invoiceDetails?.memberName &&
                    formik.touched.invoiceDetails?.memberName && (
                      <div className="text-red-500 text-sm">
                        {formik.errors.invoiceDetails?.memberName}
                      </div>
                    )}

                  {showSuggestions && (
                    <ul className="absolute z-10 bg-white border border-gray-300 mt-1 rounded shadow w-full max-h-60 overflow-auto">
                      {searchResults.map((entry) => (
                        <li
                          key={entry.id}
                          onClick={() => handleSuggestionClick(entry)}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                          <span className="font-medium">{entry.name}</span> 
                          {/* <span className="text-sm text-gray-500">
                            {entry.contact}
                          </span> */}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <hr />

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
                        (s) => s.value === product.productType
                      )}
                      onChange={(selected) =>
                        formik.setFieldValue(
                          `productInfo.${index}.productType`,
                          selected?.value || ""
                        )
                      }
                      options={servicesList}
                      styles={customStyles}
                    />
                  </div>

                  {/* Variation */}
                  <div>
                    <label className="mb-2 block">Variation</label>
                    <div
                      onClick={() => {
                        if (!product.productType) {
                          toast.warning("Please select a Product Type first.");
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
                          placeholderText="Select date"
                          readOnly={!product.serviceVariation}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block">Expiry date</label>
                      <div className="custom--date">
                        <DatePicker
                          selected={
                            product.endDate ? new Date(product.endDate) : null
                          }
                          dateFormat="dd MMM yyyy"
                          readOnly
                          placeholderText="End date"
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
                      className="custom--input w-full"
                    />
                  </div>

                  {/* Service Fee */}
                  <div>
                    <label className="mb-2 block">Service Fee</label>
                    <input
                      name={`productInfo.${index}.productAmount`}
                      value={product.productAmount}
                      className="custom--input w-full"
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

                  {product.voucherStatus === "success" && (
                    <div className="text-lg text-black">
                      Final Price after discount:{" "}
                      <strong>₹{product.finalAmount}</strong>
                    </div>
                  )}
                </div>
              ))}

              <button
                type="button"
                className="px-5 py-3 text-sm rounded bg-black text-white flex items-center justify-center gap-2"
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

              <hr />
              <div className="bg-[#f7f7f7] p-[20px] rounded-[10px]">
                <h3 className="text-2xl font-semibold">Price Calculation</h3>
                <div className="price--calculation my-5">
                  <div className="price--item">
                    <p>
                      Reg Fee:{" "}
                      <span className="font-bold">₹{regFee.toFixed(2)}</span>
                    </p>
                  </div>
                  <div className="price--item">
                    <p>
                      Total Service Fee:{" "}
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
                      <span className="font-bold">₹{subtotal.toFixed(2)}</span>
                    </p>
                  </div>
                </div>
                <p className="text-2xl font-semibold">
                  Total Payment:{" "}
                  <span className="font-bold">₹{total.toFixed(2)}</span>
                </p>
              </div>

              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  className="px-4 py-2 border rounded"
                  onClick={() => {
                    formik.resetForm();
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white rounded"
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
