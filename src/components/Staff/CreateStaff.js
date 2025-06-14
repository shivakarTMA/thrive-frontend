import React, { useRef, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import { IoAppsSharp, IoCloseCircle, IoPricetagSharp } from "react-icons/io5";
import { selectIcon } from "../../Helper/helper";
import CreatableSelect from "react-select/creatable";
import { toast } from "react-toastify";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import { FaEnvelope, FaListCheck, FaRegBuilding, FaUser } from "react-icons/fa6";
import { MdInsertPhoto } from "react-icons/md";

const roleOptions = [
  { value: "Admin", label: "Admin" },
  { value: "Manager", label: "Manager" },
  { value: "FOH", label: "FOH" },
  { value: "PT", label: "PT" },
  { value: "GT", label: "GT" },
  { value: "Nutritionist", label: "Nutritionist" },
  { value: "Spa", label: "Spa" },
  { value: "Salon", label: "Salon" },
  { value: "Housekeeping", label: "Housekeeping" },
  { value: "Others", label: "Others" },
];

const centerOptions = [
  { value: "Center1", label: "Center 1" },
  { value: "Center2", label: "Center 2" },
  { value: "Center3", label: "Center 3" },
];

const serviceOptions = [
  { value: "PT", label: "Personal Training" },
  { value: "BCA", label: "BCA" },
  { value: "Nutrition", label: "Nutrition" },
  { value: "Massage", label: "Massage" },
  { value: "Haircut", label: "Haircut" },
];

const tagOptions = [
  { value: "Weight Loss", label: "Weight Loss" },
  { value: "HIIT", label: "HIIT" },
  { value: "Strength", label: "Strength" },
  { value: "Wellness", label: "Wellness" },
  { value: "Cardio", label: "Cardio" },
];

const yesNoOptions = [
  { value: true, label: "Yes" },
  { value: false, label: "No" },
];

const roleAllowsAppFields = ["PT", "GT", "Nutritionist", "Spa", "Salon"];

const validationSchema = Yup.object({
  fullName: Yup.string().required("Full Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phoneNumber: Yup.string()
    .matches(/^\d{10}$/, "Enter a valid 10-digit phone number")
    .required("Phone number is required"),
  role: Yup.string().required("Role is required"),
  assignedCenters: Yup.array().min(1, "At least one center must be selected"),
  profilePicture: Yup.mixed().when("showOnApp", {
    is: true,
    then: () =>
      Yup.mixed()
        .required("Profile Picture is required")
        .test("fileType", "Unsupported format", (value) => {
          if (!value) return false;
          return ["image/jpeg", "image/png", "image/webp"].includes(value.type);
        }),
    otherwise: () => Yup.mixed().notRequired(),
  }),
  shortDescription: Yup.string().when("showOnApp", {
    is: true,
    then: () => Yup.string().required("Short Description is required"),
  }),
  longDescription: Yup.string().when("showOnApp", {
    is: true,
    then: () => Yup.string().required("Long Description is required"),
  }),
  tags: Yup.array().when("showOnApp", {
    is: true,
    then: () => Yup.array().of(Yup.string()).min(1, "Tags are required"),
  }),
  serviceMapping: Yup.array().when("showOnApp", {
    is: true,
    then: () =>
      Yup.array().of(Yup.string()).min(1, "Select at least one service"),
    otherwise: () => Yup.array().notRequired(),
  }),
});

const CreateStaff = ({ setShowModal }) => {
  const leadBoxRef = useRef(null);

  const initialValues = {
    fullName: "",
    email: "",
    phoneNumber: "",
    role: "",
    assignedCenters: [],
    showOnApp: false,
    profilePicture: null,
    shortDescription: "",
    longDescription: "",
    tags: [],
    serviceMapping: [],
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      console.log("Submitted Staff Data:", values);
      setShowModal(false);
      toast.success("Created Successfully");
    },
  });

  const showAppFields = roleAllowsAppFields.includes(formik.values.role);

  const handleOverlayClick = (e) => {
    if (leadBoxRef.current && !leadBoxRef.current.contains(e.target)) {
      setShowModal(false);
    }
  };

  const handleLeadModal = () => {
    setShowModal(false);
  };

  const handlePhoneChange = (value) => {
    formik.setFieldValue("phoneNumber", value);
  };

  return (
    <div
      className="create--lead--container overflow-auto hide--overflow fixed top-0 left-0 z-[999] w-full bg-black bg-opacity-60 h-full"
      onClick={handleOverlayClick}
    >
      <div
        className="min-h-[70vh] w-[95%] max-w-5xl mx-auto mt-[100px] mb-[100px] container--leadbox rounded-[10px] flex flex-col"
        ref={leadBoxRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-t-[10px] flex gap-3 items-center justify-between py-4 px-4 border-b">
          <h2 className="text-xl font-semibold">Create a Staff</h2>
          <div className="close--lead cursor-pointer" onClick={handleLeadModal}>
            <IoCloseCircle className="text-3xl" />
          </div>
        </div>
        <div className="flex-1s flexs">
          <form onSubmit={formik.handleSubmit}>
            <div className="flex bg-white rounded-b-[10px]">
              <div className="p-6 flex-1">
                <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="mb-2 block">Full Name</label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <FaUser />
                      </span>
                      <input
                        type="text"
                        name="fullName"
                        className="custom--input w-full input--icon"
                        value={formik.values.fullName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                    </div>
                    {formik.touched.fullName && formik.errors.fullName && (
                      <p className="text-red-500 text-sm">
                        {formik.errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-2 block">Email</label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <FaEnvelope />
                      </span>
                      <input
                        type="email"
                        name="email"
                        className="custom--input w-full input--icon"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                    </div>
                    {formik.touched.email && formik.errors.email && (
                      <p className="text-red-500 text-sm">
                        {formik.errors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="mb-2 block">Phone Number</label>
                    <PhoneInput
                      name="phoneNumber"
                      value={formik.values.phoneNumber}
                      onChange={handlePhoneChange}
                      international
                      defaultCountry="IN"
                      className="custom--input w-full custom--phone"
                    />
                    {formik.touched.phoneNumber &&
                      formik.errors.phoneNumber && (
                        <p className="text-red-500 text-sm">
                          {formik.errors.phoneNumber}
                        </p>
                      )}
                  </div>

                  {/* Role */}
                  <div>
                    <label className="mb-2 block">Role</label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <FaUser />
                      </span>
                      <Select
                        options={roleOptions}
                        onChange={(option) =>
                          formik.setFieldValue("role", option?.value)
                        }
                        onBlur={() => formik.setFieldTouched("role", true)}
                        styles={selectIcon}
                      />
                    </div>
                    {formik.touched.role && formik.errors.role && (
                      <p className="text-red-500 text-sm">
                        {formik.errors.role}
                      </p>
                    )}
                  </div>

                  {/* Assigned Centers */}
                  <div>
                    <label className="mb-2 block">Assigned Center(s)</label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <FaRegBuilding />
                      </span>
                      <Select
                        options={centerOptions}
                        isMulti
                        onChange={(selected) =>
                          formik.setFieldValue(
                            "assignedCenters",
                            selected.map((s) => s.value)
                          )
                        }
                        onBlur={() =>
                          formik.setFieldTouched("assignedCenters", true)
                        }
                        styles={selectIcon}
                      />
                    </div>
                    {formik.touched.assignedCenters &&
                      formik.errors.assignedCenters && (
                        <p className="text-red-500 text-sm">
                          {formik.errors.assignedCenters}
                        </p>
                      )}
                  </div>

                  {/* Show on App */}
                  {showAppFields && (
                    <div>
                      <label className="mb-2 block">Show on App</label>
                      <div className="relative">
                        <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                          <IoAppsSharp />
                        </span>
                        <Select
                          options={yesNoOptions}
                          value={yesNoOptions.find(
                            (o) => o.value === formik.values.showOnApp
                          )}
                          onChange={(option) =>
                            formik.setFieldValue("showOnApp", option.value)
                          }
                          styles={selectIcon}
                        />
                      </div>
                    </div>
                  )}

                  {/* Conditionally rendered fields */}
                  {showAppFields && formik.values.showOnApp && (
                    <>
                      {/* Profile Picture */}
                      <div>
                        <label className="mb-2 block">Profile Picture</label>
                        <div className="relative">
                          <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                            <MdInsertPhoto />
                          </span>
                          <input
                            type="file"
                            name="profilePicture"
                            accept="image/*"
                            onChange={(e) =>
                              formik.setFieldValue(
                                "profilePicture",
                                e.target.files[0]
                              )
                            }
                            className="custom--input w-full input--icon"
                          />
                        </div>
                        {formik.touched.profilePicture &&
                          formik.errors.profilePicture && (
                            <p className="text-red-500 text-sm">
                              {formik.errors.profilePicture}
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

                      {/* Service Mapping */}
                      <div>
                        <label className="mb-2 block">Service Mapping</label>
                        <div className="relative">
                          <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                            <FaListCheck />
                          </span>
                          <Select
                            options={serviceOptions}
                            isMulti
                            value={serviceOptions.filter((option) =>
                              formik.values.serviceMapping.includes(
                                option.value
                              )
                            )}
                            onChange={(selected) =>
                              formik.setFieldValue(
                                "serviceMapping",
                                selected.map((s) => s.value)
                              )
                            }
                            onBlur={() =>
                              formik.setFieldTouched("serviceMapping", true)
                            }
                            styles={selectIcon}
                          />
                        </div>
                        {formik.touched.serviceMapping &&
                          formik.errors.serviceMapping && (
                            <p className="text-red-500 text-sm">
                              {formik.errors.serviceMapping}
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
                            <p className="text-red-500 text-sm">
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
                            <p className="text-red-500 text-sm">
                              {formik.errors.longDescription}
                            </p>
                          )}
                      </div>
                    </>
                  )}
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

export default CreateStaff;
