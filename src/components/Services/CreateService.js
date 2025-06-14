import React, { useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import { selectIcon } from "../../Helper/helper";
import { IoCloseCircle, IoPricetagSharp, IoTimeSharp } from "react-icons/io5";
import { toast } from "react-toastify";
import { FaListCheck } from "react-icons/fa6";
import { FaImage } from "react-icons/fa";
import CreatableSelect from "react-select/creatable";
import { MdCurrencyRupee } from "react-icons/md";
import { PiCoinsFill } from "react-icons/pi";

const serviceTypeOptions = [
  { value: "personal_training", label: "Personal Training" },
  { value: "group_class", label: "Group Class" },
  { value: "online_program", label: "Online Program" },
];
const taxTypeOptions = [
  { value: "gst", label: "GST (Goods and Services Tax)" },
  { value: "vat", label: "VAT (Value Added Tax)" },
  { value: "service_tax", label: "Service Tax" },
  { value: "sales_tax", label: "Sales Tax" },
  { value: "excise_duty", label: "Excise Duty" },
  { value: "custom_duty", label: "Custom Duty" },
  { value: "income_tax", label: "Income Tax" },
  { value: "withholding_tax", label: "Withholding Tax" },
  { value: "cess", label: "Cess" },
  { value: "none", label: "No Tax" },
];

const listingStatusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const tagOptions = [
  { value: "Weight Loss", label: "Weight Loss" },
  { value: "HIIT", label: "HIIT" },
  { value: "Strength", label: "Strength" },
  { value: "Wellness", label: "Wellness" },
  { value: "Cardio", label: "Cardio" },
];

const validationSchema = Yup.object({
  centreName: Yup.string().required("Centre Name is required"),
  serviceType: Yup.string().required("Service Type is required"),
  serviceName: Yup.string().required("Service Name is required"),
  serviceImage: Yup.mixed()
    .required("Service Image is required")
    .test("fileType", "Unsupported File Format", (value) => {
      return (
        value && ["image/jpeg", "image/png", "image/webp"].includes(value.type)
      );
    }),
  shortDescription: Yup.string().required("Short description is required"),
  longDescription: Yup.string().required("Long description is required"),
  duration: Yup.number()
    .typeError("Duration must be a number")
    .required("Duration is required"),
  sessions: Yup.number().typeError("Sessions must be a number").nullable(),
  tags: Yup.array().when("showOnApp", {
    is: true,
    then: () => Yup.array().of(Yup.string()).min(1, "Tags are required"),
  }),
  trainerName: Yup.string().nullable(),
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

const CreateService = ({ setShowModal }) => {
  const leadBoxRef = useRef(null);
  const formik = useFormik({
    initialValues: {
      centreName: "",
      serviceType: "",
      serviceName: "",
      serviceImage: "",
      shortDescription: "",
      longDescription: "",
      duration: "",
      sessions: "",
      tags: [],
      trainerName: "",
      mrp: "",
      sellingPrice: "",
      taxType: "",
      thriveCoins: "",
      listingStatus: "",
    },
    validationSchema,
    onSubmit: (values) => {
      console.log("Form Submitted:", {
        ...values,
        serviceImage: values.serviceImage?.name || "No file selected",
      });
      setShowModal(false);
      toast.success("Created Successfully");
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
      className="create--lead--container overflow-auto hide--overflow fixed top-0 left-0 z-[999] w-full bg-black bg-opacity-60 h-full"
      onClick={handleOverlayClick}
    >
      <div
        className="min-h-[70vh]  w-[95%] max-w-5xl mx-auto mt-[100px] mb-[100px] container--leadbox rounded-[10px] flex flex-col"
        ref={leadBoxRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-t-[10px] flex gap-3 items-center justify-between py-4 px-4 border-b">
          <h2 className="text-xl font-semibold">Create a Service</h2>
          <div className="close--lead cursor-pointer" onClick={handleLeadModal}>
            <IoCloseCircle className="text-3xl" />
          </div>
        </div>
        <div className="flex-1s flexs">
          <form onSubmit={formik.handleSubmit}>
            <div className="flex bg-white rounded-b-[10px]">
              <div className="p-6 flex-1">
                <div className="grid grid-cols-3 gap-4">
                  {/* Centre Name */}
                  <div>
                    <label className="mb-2 block">Centre Name</label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
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

                  {/* Service Type (React Select) */}
                  <div>
                    <label className="mb-2 block">Service Type</label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <FaListCheck />
                      </span>
                      <Select
                        options={serviceTypeOptions}
                        onChange={(option) =>
                          formik.setFieldValue("serviceType", option?.value)
                        }
                        onBlur={() =>
                          formik.setFieldTouched("serviceType", true)
                        }
                        styles={selectIcon}
                      />
                    </div>
                    {formik.touched.serviceType &&
                      formik.errors.serviceType && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.serviceType}
                        </p>
                      )}
                  </div>

                  {/* Service Name */}
                  <div>
                    <label className="mb-2 block">Service Name</label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                        <FaListCheck />
                      </span>
                      <input
                        type="text"
                        name="serviceName"
                        className="custom--input w-full"
                        value={formik.values.serviceName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                    </div>
                    {formik.touched.serviceName &&
                      formik.errors.serviceName && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.serviceName}
                        </p>
                      )}
                  </div>

                  {/* Service Image Upload */}
                  <div>
                    <label className="mb-2 block">Service Image</label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                        <FaImage />
                      </span>
                      <input
                        type="file"
                        name="serviceImage"
                        accept="image/*"
                        onChange={(event) => {
                          const file = event.currentTarget.files[0];
                          formik.setFieldValue("serviceImage", file);
                        }}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.serviceImage &&
                      formik.errors.serviceImage && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.serviceImage}
                        </p>
                      )}
                    {formik.values.serviceImage &&
                      typeof formik.values.serviceImage === "object" && (
                        <p className="text-sm text-gray-600 mt-1">
                          Selected: {formik.values.serviceImage.name}
                        </p>
                      )}
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="mb-2 block">
                      Service Duration (Days)
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                        <IoTimeSharp />
                      </span>
                      <input
                        type="number"
                        name="duration"
                        className="custom--input w-full"
                        value={formik.values.duration}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                    </div>
                    {formik.touched.duration && formik.errors.duration && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.duration}
                      </p>
                    )}
                  </div>

                  {/* No of Sessions */}
                  <div>
                    <label className="mb-2 block">
                      No of Sessions (Optional)
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                        <FaListCheck />
                      </span>
                      <input
                        type="number"
                        name="sessions"
                        className="custom--input w-full"
                        value={formik.values.sessions}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                    </div>
                    {formik.touched.sessions && formik.errors.sessions && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.sessions}
                      </p>
                    )}
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="mb-2 block">Tags</label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <IoPricetagSharp />
                      </span>
                    <CreatableSelect
                      isMulti
                      options={tagOptions}
                      value={formik.values.tags.map((tag) => ({
                        value: tag,
                        label: tag,
                      }))}
                      onChange={(selected) =>
                        formik.setFieldValue(
                          "tags",
                          selected.map((item) => item.value)
                        )
                      }
                      onBlur={() => formik.setFieldTouched("tags", true)}
                      styles={selectIcon}
                    />
                    </div>
                    
                    {formik.touched.tags && formik.errors.tags && (
                      <p className="text-red-500 text-sm">
                        {formik.errors.tags}
                      </p>
                    )}
                  </div>

                  {/* Trainer Name */}
                  <div>
                    <label className="mb-2 block">
                      Trainer Name (Optional)
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <FaListCheck />
                      </span>
                    <input
                      type="text"
                      name="trainerName"
                      className="custom--input w-full input--icon"
                      value={formik.values.trainerName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    </div>
                    {formik.touched.trainerName &&
                      formik.errors.trainerName && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.trainerName}
                        </p>
                      )}
                  </div>

                  {/* MRP */}
                  <div>
                    <label className="mb-2 block">MRP</label>
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
                    <label className="mb-2 block">Selling Price</label>
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
                    <label className="mb-2 block">Tax Type</label>
                   
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <FaListCheck />
                      </span>
                      <Select
                        options={taxTypeOptions}
                        onChange={(option) =>
                          formik.setFieldValue("taxType", option?.value)
                        }
                        onBlur={() =>
                          formik.setFieldTouched("taxType", true)
                        }
                        styles={selectIcon}
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
                    <label className="mb-2 block">Thrive Coins</label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <PiCoinsFill />
                      </span>
                    <input
                      type="number"
                      name="thriveCoins"
                      className="custom--input w-full"
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

                  {/* Listing Status */}
                  <div>
                    <label className="mb-2 block">Listing Status</label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <FaListCheck />
                      </span>
                    <Select
                      options={listingStatusOptions}
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
                    <label className="mb-2 block">Short Description</label>
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
                    <label className="mb-2 block">Long Description</label>
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

export default CreateService;
