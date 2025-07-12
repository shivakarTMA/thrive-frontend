import React, { useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import { selectIcon } from "../../Helper/helper";
import { IoCloseCircle } from "react-icons/io5";
import { toast } from "react-toastify";
import { FaImage, FaListCheck } from "react-icons/fa6";
import { MdCurrencyRupee } from "react-icons/md";
import { PiCoinsFill } from "react-icons/pi";

// Options
const productTypeOptions = [
  { value: "physical", label: "Physical" },
  { value: "digital", label: "Digital" },
  { value: "service", label: "Service" },
];

const listingStatusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

// Validation Schema
const validationSchema = Yup.object({
  centreName: Yup.string().required("Centre Name is required"),
  productType: Yup.string().required("Product Type is required"),
  productName: Yup.string().required("Product Name is required"),
  productImage: Yup.mixed()
    .required("Product Image is required")
    .test("fileType", "Unsupported File Format", (value) => {
      return (
        value && ["image/jpeg", "image/png", "image/webp"].includes(value.type)
      );
    }),
  shortDescription: Yup.string().required("Short description is required"),
  longDescription: Yup.string().required("Long description is required"),
  quantity: Yup.number()
    .typeError("Quantity must be a number")
    .required("Quantity is required")
    .min(0, "Quantity cannot be negative"),
  mrp: Yup.number()
    .typeError("MRP must be a number")
    .required("MRP is required"),
  sellingPrice: Yup.number()
    .typeError("Selling Price must be a number")
    .required("Selling Price is required")
    .max(Yup.ref("mrp"), "Selling Price cannot be greater than MRP"),
  taxType: Yup.string().required("Tax Type is required"),
  thriveCoins: Yup.number()
    .typeError("Thrive Coins must be a number")
    .required("Thrive Coins is required")
    .min(0, "Thrive Coins cannot be negative"),
  listingStatus: Yup.string().required("Listing Status is required"),
});

const CreateProduct = ({ setShowModal, onProductCreated, initialData }) => {
  console.log(initialData, "initialData");
  const leadBoxRef = useRef(null);

  const formik = useFormik({
    initialValues: {
      centreName: initialData?.centreName || "",
      productType: initialData?.productType || "",
      productName: initialData?.productName || "",
      productImage: initialData?.productImage || "",
      shortDescription: initialData?.shortDescription || "",
      longDescription: initialData?.longDescription || "",
      quantity: initialData?.quantity || "",
      mrp: initialData?.mrp || "",
      sellingPrice: initialData?.sellingPrice || "",
      taxType: initialData?.taxType || "",
      thriveCoins: initialData?.thriveCoins || "",
      listingStatus: initialData?.listingStatus || "",
    },
    validationSchema,
    onSubmit: (values) => {
      // console.log("Form Submitted:", values);
      // console.log("Formik Errors (if any):", formik.errors);
      // setShowModal(false);
      // toast.success("Created Successfully");

      const dataToSend = {
        ...values,
        id: initialData?.id || Date.now(), // Preserve ID for edit mode
      };
      onProductCreated(dataToSend);
      setShowModal(false);
    },
  });

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      setShowModal(false);
    }
  };

  const handleLeadModal = () => {
    setShowModal(false);
  };

  return (
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
          <h2 className="text-xl font-semibold">Create a Product</h2>
          <div className="close--lead cursor-pointer" onClick={handleLeadModal}>
            <IoCloseCircle className="text-3xl" />
          </div>
        </div>
        <div className="flex-1s flexs">
          <form onSubmit={formik.handleSubmit}>
            <div className="flex bg-white rounded-b-[10px]">
              <div className="p-6 flex-1">
                <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-4">
                  {/* Centre Name */}
                  <div>
                    <label className="mb-2 block">
                      Centre Name<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <FaListCheck />
                      </span>
                      <input
                        type="text"
                        name="centreName"
                        className="custom--input w-full input--icon"
                        value={formik.values.centreName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                    </div>
                    {formik.touched.centreName && formik.errors.centreName && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.centreName}
                      </p>
                    )}
                  </div>

                  {/* Product Type (React Select) */}
                  <div>
                    <label className="mb-2 block">
                      Product Type<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <FaListCheck />
                      </span>
                      <Select
                        options={productTypeOptions}
                        value={productTypeOptions.find(
                          (option) => option.value === formik.values.productType
                        )}
                        onChange={(option) =>
                          formik.setFieldValue("productType", option?.value)
                        }
                        onBlur={() =>
                          formik.setFieldTouched("productType", true)
                        }
                        styles={selectIcon}
                      />
                    </div>
                    {formik.touched.productType &&
                      formik.errors.productType && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.productType}
                        </p>
                      )}
                  </div>

                  {/* Product Name */}
                  <div>
                    <label className="mb-2 block">
                      Product Name<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <FaListCheck />
                      </span>
                      <input
                        type="text"
                        name="productName"
                        className="custom--input w-full input--icon"
                        value={formik.values.productName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                    </div>
                    {formik.touched.productName &&
                      formik.errors.productName && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.productName}
                        </p>
                      )}
                  </div>

                  {/* Product Image */}
                  <div>
                    <label className="mb-2 block">
                      Product Image<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <FaImage />
                      </span>
                      <input
                        type="file"
                        name="productImage"
                        accept="image/*"
                        onChange={(event) => {
                          const file = event.currentTarget.files[0];
                          formik.setFieldValue("productImage", file);
                        }}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.productImage &&
                      formik.errors.productImage && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.productImage}
                        </p>
                      )}
                    {formik.values.productImage &&
                      typeof formik.values.productImage === "object" && (
                        <p className="text-sm text-gray-600 mt-1">
                          Selected: {formik.values.productImage.name}
                        </p>
                      )}
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="mb-2 block">
                      Quantity<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <FaListCheck />
                      </span>
                      <input
                        type="number"
                        name="quantity"
                        className="custom--input w-full input--icon"
                        value={formik.values.quantity}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                    </div>
                    {formik.touched.quantity && formik.errors.quantity && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.quantity}
                      </p>
                    )}
                  </div>

                  {/* MRP */}
                  <div>
                    <label className="mb-2 block">
                      MRP<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <MdCurrencyRupee />
                      </span>
                      <input
                        type="number"
                        name="mrp"
                        className="custom--input w-full input--icon"
                        value={formik.values.mrp}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                    </div>
                    {formik.touched.mrp && formik.errors.mrp && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.mrp}
                      </p>
                    )}
                  </div>

                  {/* Selling Price */}
                  <div>
                    <label className="mb-2 block">
                      Selling Price<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <MdCurrencyRupee />
                      </span>
                      <input
                        type="number"
                        name="sellingPrice"
                        className="custom--input w-full input--icon"
                        value={formik.values.sellingPrice}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                    </div>
                    {formik.touched.sellingPrice &&
                      formik.errors.sellingPrice && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.sellingPrice}
                        </p>
                      )}
                  </div>

                  {/* Tax Type */}
                  <div>
                    <label className="mb-2 block">
                      Tax Type<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <FaListCheck />
                      </span>
                      <input
                        type="text"
                        name="taxType"
                        className="custom--input w-full input--icon"
                        value={formik.values.taxType}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                    </div>
                    {formik.touched.taxType && formik.errors.taxType && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.taxType}
                      </p>
                    )}
                  </div>

                  {/* Thrive Coins */}
                  <div>
                    <label className="mb-2 block">
                      Thrive Coins<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <PiCoinsFill />
                      </span>
                      <input
                        type="number"
                        name="thriveCoins"
                        className="custom--input w-full input--icon"
                        value={formik.values.thriveCoins}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                    </div>
                    {formik.touched.thriveCoins &&
                      formik.errors.thriveCoins && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.thriveCoins}
                        </p>
                      )}
                  </div>

                  {/* Listing Status (React Select) */}
                  <div>
                    <label className="mb-2 block">
                      Listing Status<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <FaListCheck />
                      </span>

                      <Select
                        options={listingStatusOptions}
                        value={listingStatusOptions.find(
                          (option) =>
                            option.value === formik.values.listingStatus
                        )}
                        onChange={(option) =>
                          formik.setFieldValue("listingStatus", option?.value)
                        }
                        onBlur={() =>
                          formik.setFieldTouched("listingStatus", true)
                        }
                        styles={selectIcon}
                      />
                    </div>
                    {formik.touched.listingStatus &&
                      formik.errors.listingStatus && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.listingStatus}
                        </p>
                      )}
                  </div>
                  {/* Short Description */}
                  <div>
                    <label className="mb-2 block">
                      Short Description<span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="shortDescription"
                      className="custom--input w-full"
                      value={formik.values.shortDescription}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.shortDescription &&
                      formik.errors.shortDescription && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.shortDescription}
                        </p>
                      )}
                  </div>

                  {/* Long Description */}
                  <div>
                    <label className="mb-2 block">
                      Long Description<span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="longDescription"
                      className="custom--input w-full"
                      value={formik.values.longDescription}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.longDescription &&
                      formik.errors.longDescription && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.longDescription}
                        </p>
                      )}
                  </div>
                </div>
              </div>
            </div>
            {/* Submit Button */}
            <div className="flex gap-4 py-5 justify-end">
              <button
                type="button"
                className="px-4 py-2 bg-transparent border border-white text-white font-semibold rounded max-w-[150px] w-full"
                onClick={() => {
                  formik.resetForm();
                  setShowModal(false);
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-white text-black font-semibold rounded max-w-[150px] w-full"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProduct;
