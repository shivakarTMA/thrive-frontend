import React, { useEffect } from "react";
import { IoCloseCircle, IoLocationOutline } from "react-icons/io5";
import { FaEnvelope, FaRegBuilding } from "react-icons/fa6";
import { GrDocument } from "react-icons/gr";
import { LuPlug } from "react-icons/lu";
import Select from "react-select";
import { selectIcon } from "../../Helper/helper";
import PhoneInput from "react-phone-number-input";
import { toast } from "react-toastify";
import { authAxios } from "../../config/config";
import { PiImageFill } from "react-icons/pi";

const CreateCompany = ({
  setShowModal,
  editingCompany,
  formik,
  handleOverlayClick,
  leadBoxRef,
  handlePhoneChange,
  indianStates,
}) => {
  // ✅ Fetch company details when selectedId changes
  useEffect(() => {
    if (!editingCompany) return;

    const fetchCompanyById = async (id) => {
      try {
        const res = await authAxios().get(`/company/${id}`);
        const data = res.data?.data || res.data || null;

        if (data) {
          // ✅ Prefill formik fields with fetched data
          formik.setValues({
            logo: data.logo || "",
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            address: data.address || "",
            city: data.city || "",
            state:
              typeof data.state === "string"
                ? { label: data.state, value: data.state }
                : data.state || "",
            country: data.country || "",
            zipcode: data.zipcode || "",
            gstno: data.gstno || "",
            status: data.status || "ACTIVE",
          });
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch module details");
      }
    };

    fetchCompanyById(editingCompany);
  }, [editingCompany]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewURL = URL.createObjectURL(file);

      formik.setFieldValue("logo", previewURL); // for preview
      formik.setFieldValue("logoFile", file); // actual file to upload
    }
  };

  return (
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
          <h2 className="text-xl font-semibold">
            {editingCompany ? "Edit Company" : "Create Company"}
          </h2>
          <div
            className="close--lead cursor-pointer"
            onClick={() => {
              formik.resetForm();
              setShowModal(false);
            }}
          >
            <IoCloseCircle className="text-3xl" />
          </div>
        </div>

        <div className="flex-1">
          <form onSubmit={formik.handleSubmit} className="p-0 space-y-0">
            <div className="flex bg-white rounded-b-[10px]">
              <div className="p-6 flex-1">
                <div className="grid md:grid-cols-4 grid-cols-1 gap-4 gap-y-2">
                  {/* Image Preview */}
                  <div className="row-span-2">
                    <div className="bg-gray-100 rounded-lg w-full h-[160px] overflow-hidden p-4">
                      {formik.values?.logo ? (
                        <img
                          src={formik.values?.logo}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                          <PiImageFill className="text-gray-300 text-7xl" />
                          <span className="text-gray-500 text-sm">
                            Upload Image
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block">Company Logo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      onBlur={() => formik.setFieldTouched("logo", true)}
                      className="custom--input w-full"
                    />
                    {/* {formik.values.logo && (
                      <div className="mt-2">
                        <img
                          src={formik.values.logo}
                          alt="Logo Preview"
                          className="w-32 h-32 object-cover rounded"
                        />
                      </div>
                    )} */}
                  </div>
                  {/* Company Name */}
                  <div>
                    <label className="mb-2 block">
                      Company Name<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                        <FaRegBuilding />
                      </span>
                      <input
                        type="text"
                        name="name"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.name && formik.errors.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-2 block">Company Email</label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                        <FaEnvelope />
                      </span>
                      <input
                        type="email"
                        name="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {/* {formik.touched.email && formik.errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.email}
                      </p>
                    )} */}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="mb-2 block">Contact Number</label>
                    <PhoneInput
                      name="phone"
                      value={formik.values.phone}
                      onChange={handlePhoneChange}
                      onBlur={() => formik.setFieldTouched("phone", true)}
                      international
                      defaultCountry="IN"
                      countryCallingCodeEditable={false}
                      className="custom--input w-full custom--phone"
                    />
                    {/* {formik.touched.phone && formik.errors.phone && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.phone}
                      </p>
                    )} */}
                  </div>

                  {/* City */}
                  <div>
                    <label className="mb-2 block">City</label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                        <IoLocationOutline />
                      </span>
                      <input
                        type="text"
                        name="city"
                        value={formik.values.city}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {/* {formik.touched.city && formik.errors.city && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.city}
                      </p>
                    )} */}
                  </div>

                  {/* State */}
                  <div>
                    <label className="mb-2 block">State/Province</label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <IoLocationOutline />
                      </span>
                      <Select
                        name="state"
                        value={formik.values.state} // ✅ should be an object { label, value }
                        options={indianStates}
                        onChange={(option) =>
                          formik.setFieldValue("state", option)
                        } // ✅ store whole object
                        onBlur={() => formik.setFieldTouched("state", true)}
                        styles={selectIcon}
                      />
                    </div>
                    {/* {formik.touched.state && formik.errors.state && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.state}
                      </p>
                    )} */}
                  </div>

                  {/* Country */}
                  <div>
                    <label className="mb-2 block">Country</label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                        <IoLocationOutline />
                      </span>
                      <input
                        type="text"
                        name="country"
                        value={formik.values.country}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {/* {formik.touched.country && formik.errors.country && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.country}
                      </p>
                    )} */}
                  </div>

                  {/* Zip */}
                  <div>
                    <label className="mb-2 block">Zip or Postal Code</label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                        <IoLocationOutline />
                      </span>
                      <input
                        type="text"
                        name="zipcode"
                        value={formik.values.zipcode}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {/* {formik.touched.zipcode && formik.errors.zipcode && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.zipcode}
                      </p>
                    )} */}
                  </div>

                  {/* GST */}
                  <div>
                    <label className="mb-2 block">Company GST No.</label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                        <GrDocument />
                      </span>
                      <input
                        type="text"
                        name="gstno"
                        value={formik.values.gstno}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {/* {formik.touched.gstno && formik.errors.gstno && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.gstno}
                      </p>
                    )} */}
                  </div>

                  {/* Status */}
                  <div>
                    <label className="mb-2 block">Company Status</label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <LuPlug />
                      </span>
                      <Select
                        name="status"
                        value={{
                          label: formik.values.status,
                          value: formik.values.status,
                        }}
                        options={[
                          { label: "Active", value: "ACTIVE" },
                          { label: "Inactive", value: "INACTIVE" },
                        ]}
                        onChange={(option) =>
                          formik.setFieldValue("status", option.value)
                        }
                        onBlur={() => formik.setFieldTouched("status", true)}
                        styles={selectIcon}
                        className="!capitalize"
                      />
                    </div>
                    {/* {formik.touched.status && formik.errors.status && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.status}
                      </p>
                    )} */}
                  </div>

                  {/* Address */}
                  <div className="md:col-span-4">
                    <label className="mb-2 block">Physical Address</label>
                    <div className="relative">
                      <span className="absolute top-[15px] left-[15px]">
                        <IoLocationOutline />
                      </span>
                      <textarea
                        name="address"
                        value={formik.values.address}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 py-5 justify-end">
              <button
                type="button"
                onClick={() => {
                  formik.resetForm();
                  setShowModal(false);
                }}
                className="px-4 py-2 bg-transparent border border-white text-white font-semibold rounded max-w-[150px] w-full"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-white text-black font-semibold rounded max-w-[150px] w-full"
              >
                {editingCompany ? "Update" : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCompany;
