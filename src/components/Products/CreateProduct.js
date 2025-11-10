import React, { useEffect, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import { customStyles, selectIcon } from "../../Helper/helper";
import { IoCloseCircle } from "react-icons/io5";
import { toast } from "react-toastify";
import { FaImage, FaListCheck } from "react-icons/fa6";
import { MdCurrencyRupee } from "react-icons/md";
import { PiCoinsFill } from "react-icons/pi";
import { authAxios } from "../../config/config";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

// Options
const productTypeOptions = [
  { value: "BEVERAGE", label: "Beverage" },
  { value: "SUPPLEMENT", label: "Supplement" },
  { value: "MERCHANDISE", label: "Merchandise" },
  { value: "EQUIPMENT", label: "Equipment" },
  { value: "OTHER", label: "Other" },
  { value: "SNACKS", label: "Snacks" },
];

// status type options for dropdown
const statusType = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
];

const CreateProduct = ({
  setShowModal,
  formik,
  editingOption,
  serviceOptions,
  productCategoryOptions,
}) => {
  const leadBoxRef = useRef(null);

  useEffect(() => {
    const fetchProductById = async (id) => {
      try {
        const res = await authAxios().get(`/product/${id}`);
        const data = res.data?.data || res.data || null;

        if (data) {
          formik.setValues({
            image: data?.image || "",
            service_id: data?.service_id || "",
            product_category_id: data?.product_category_id || "",
            product_category_id: data?.product_category_id || "",
            name: data?.name || "",
            caption: data?.caption || "",
            sku: data?.sku || "",
            product_type: data?.product_type || "",
            short_description: data?.short_description || "",
            description: data?.description || "",
            allergens: data?.allergens || "",
            hsn_sac_code: data?.hsn_sac_code || "",
            amount: data?.amount || "",
            discount: data?.discount || "",
            gst: data?.gst || "",
            stock_quantity: data?.stock_quantity || "",
            thrive_coins: data?.thrive_coins || "",
            position: data?.position || "",
            status: data?.status || "",
          });
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch package details");
      }
    };

    if (editingOption) {
      fetchProductById(editingOption);
    }
  }, [editingOption]);

  // Handle image file change and set preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      formik.setFieldValue("image", file); // ✅ store file in Formik state
    }
  };

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
                <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4">
                  {/* Image Upload */}
                  <div>
                    <label className="mb-2 block">
                      Image<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        name="image"
                        onChange={handleFileChange} // ✅ no value prop here
                        onBlur={() => formik.setFieldTouched("image", true)}
                        className="custom--input w-full"
                      />
                    </div>

                    {formik.touched.image && formik.errors.image && (
                      <div className="text-red-500 text-sm">
                        {formik.errors.image}
                      </div>
                    )}
                  </div>
                  {/* Product Name */}
                  <div>
                    <label className="mb-2 block">
                      Product Name<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="name"
                        className="custom--input w-full"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                    </div>
                    {formik.touched.name && formik.errors.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.name}
                      </p>
                    )}
                  </div>

                  {/* Caption */}
                  <div>
                    <label className="mb-2 block">
                      Caption<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="caption"
                        className="custom--input w-full"
                        value={formik.values.caption}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                    </div>
                    {formik.touched.caption && formik.errors.caption && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.caption}
                      </p>
                    )}
                  </div>

                  {/* Service */}
                  <div>
                    <label className="mb-2 block">
                      Service<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Select
                        options={serviceOptions}
                        value={serviceOptions.find(
                          (option) => option.value === formik.values.service_id
                        )}
                        onChange={(option) =>
                          formik.setFieldValue("service_id", option?.value)
                        }
                        onBlur={() =>
                          formik.setFieldTouched("service_id", true)
                        }
                        styles={customStyles}
                      />
                    </div>
                    {formik.touched.service_id && formik.errors.service_id && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.service_id}
                      </p>
                    )}
                  </div>
                  {/* Product Category */}
                  <div>
                    <label className="mb-2 block">
                      Product Category<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Select
                        options={productCategoryOptions}
                        value={productCategoryOptions.find(
                          (option) =>
                            option.value === formik.values.product_category_id
                        )}
                        onChange={(option) =>
                          formik.setFieldValue(
                            "product_category_id",
                            option?.value
                          )
                        }
                        onBlur={() =>
                          formik.setFieldTouched("product_category_id", true)
                        }
                        styles={customStyles}
                      />
                    </div>
                    {formik.touched.product_category_id &&
                      formik.errors.product_category_id && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.product_category_id}
                        </p>
                      )}
                  </div>

                  {/*  Product Type */}
                  <div>
                    <label className="mb-2 block">
                      Product Type<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Select
                        options={productTypeOptions}
                        value={productTypeOptions.find(
                          (option) =>
                            option.value === formik.values.product_type
                        )}
                        onChange={(option) =>
                          formik.setFieldValue("product_type", option?.value)
                        }
                        onBlur={() =>
                          formik.setFieldTouched("product_type", true)
                        }
                        styles={customStyles}
                      />
                    </div>
                    {formik.touched.product_type &&
                      formik.errors.product_type && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.product_type}
                        </p>
                      )}
                  </div>

                  {/* SKU */}
                  <div>
                    <label className="mb-2 block">
                      SKU<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="sku"
                        className="custom--input w-full"
                        value={formik.values.sku}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                    </div>
                    {formik.touched.sku && formik.errors.sku && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.sku}
                      </p>
                    )}
                  </div>
                  {/* Allergens */}
                  <div>
                    <label className="mb-2 block">
                      Allergens<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="allergens"
                        className="custom--input w-full"
                        value={formik.values.allergens}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                    </div>
                    {formik.touched.allergens && formik.errors.allergens && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.allergens}
                      </p>
                    )}
                  </div>

                  {/* HSC SAC Code */}
                  <div>
                    <label className="mb-2 block">
                      HSC SAC Code<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="hsn_sac_code"
                        value={formik.values.hsn_sac_code}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full"
                      />
                    </div>
                    {formik.touched.hsn_sac_code &&
                      formik.errors.hsn_sac_code && (
                        <div className="text-red-500 text-sm">
                          {formik.errors.hsn_sac_code}
                        </div>
                      )}
                  </div>

                  {/* Amount (₹) */}
                  <div>
                    <label className="mb-2 block">
                      Amount (₹)<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="amount"
                        className="custom--input w-full"
                        value={formik.values.amount}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                    </div>
                    {formik.touched.amount && formik.errors.amount && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.amount}
                      </p>
                    )}
                  </div>

                  {/* Discount (₹) */}
                  <div>
                    <label className="mb-2 block">
                      Discount (₹)<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="discount"
                        className="custom--input w-full"
                        value={formik.values.discount}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                    </div>
                    {formik.touched.discount && formik.errors.discount && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.discount}
                      </p>
                    )}
                  </div>

                  {/* GST (%) */}
                  <div>
                    <label className="mb-2 block">
                      GST (%)<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="gst"
                        className="custom--input w-full"
                        value={formik.values.gst}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                    </div>
                    {formik.touched.gst && formik.errors.gst && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.gst}
                      </p>
                    )}
                  </div>

                  {/* Stock Quantity */}
                  <div>
                    <label className="mb-2 block">
                      Stock Quantity<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="stock_quantity"
                        className="custom--input w-full"
                        value={formik.values.stock_quantity}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                    </div>
                    {formik.touched.stock_quantity &&
                      formik.errors.stock_quantity && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.stock_quantity}
                        </p>
                      )}
                  </div>

                  {/* Thrive Coins */}
                  <div>
                    <label className="mb-2 block">
                      Thrive Coins<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="thrive_coins"
                        className="custom--input w-full"
                        value={formik.values.thrive_coins}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                    </div>
                    {formik.touched.thrive_coins &&
                      formik.errors.thrive_coins && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.thrive_coins}
                        </p>
                      )}
                  </div>

                  {/* Position */}
                  <div>
                    <label className="mb-2 block">
                      Position<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="position"
                        value={formik.values.position}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full"
                      />
                    </div>
                    {formik.touched.position && formik.errors.position && (
                      <div className="text-red-500 text-sm">
                        {formik.errors.position}
                      </div>
                    )}
                  </div>
                  {/* Status */}
                  {editingOption && editingOption && (
                    <div>
                      <label className="mb-2 block">
                        Status<span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Select
                          name="status"
                          value={
                            statusType.find(
                              (opt) => opt.value === formik.values.status
                            ) || null
                          }
                          options={statusType}
                          onChange={(option) =>
                            formik.setFieldValue(
                              "status",
                              option ? option.value : ""
                            )
                          }
                          onBlur={() => formik.setFieldTouched("status", true)}
                          styles={customStyles}
                          placeholder="Select Status"
                        />
                      </div>
                      {formik.touched.status && formik.errors.status && (
                        <div className="text-red-500 text-sm">
                          {formik.errors.status}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Short Description */}
                  <div className="md:col-span-2">
                    <label className="mb-2 block">
                      Short Description<span className="text-red-500">*</span>
                    </label>
                    <CKEditor
                      editor={ClassicEditor}
                      data={formik.values.short_description || ""}
                      onChange={(event, editor) => {
                        const data = editor.getData(); // ✅ Get HTML string from editor
                        formik.setFieldValue("short_description", data);
                      }}
                      onBlur={() =>
                        formik.setFieldTouched("short_description", true)
                      }
                    />
                    {formik.touched.short_description &&
                      formik.errors.short_description && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.short_description}
                        </p>
                      )}
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="mb-2 block">
                      Description<span className="text-red-500">*</span>
                    </label>
                    <CKEditor
                      editor={ClassicEditor}
                      data={formik.values.description || ""}
                      onChange={(event, editor) => {
                        const data = editor.getData(); // ✅ Get HTML string from editor
                        formik.setFieldValue("description", data);
                      }}
                      onBlur={() => formik.setFieldTouched("description", true)}
                    />
                    {formik.touched.description &&
                      formik.errors.description && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.description}
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
