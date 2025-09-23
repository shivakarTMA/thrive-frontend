import React, { useRef, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import { IoAppsSharp, IoCloseCircle, IoPricetagSharp } from "react-icons/io5";
import { selectIcon } from "../../Helper/helper";
import CreatableSelect from "react-select/creatable";
import { toast } from "react-toastify";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import {
  FaEnvelope,
  FaListCheck,
  FaRegBuilding,
  FaUser,
} from "react-icons/fa6";
import { MdInsertPhoto } from "react-icons/md";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { LuPlug } from "react-icons/lu";

const roleOptions = [
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "foh", label: "FOH" },
  { value: "pt", label: "PT" },
  { value: "gt", label: "GT" },
  { value: "nutritionist", label: "Nutritionist" },
  { value: "spa", label: "Spa" },
  { value: "salon", label: "Salon" },
  { value: "housekeeping", label: "Housekeeping" },
  { value: "others", label: "Others" },
];

const centerOptions = [
  { value: "center1", label: "Center 1" },
  { value: "center2", label: "Center 2" },
  { value: "center3", label: "Center 3" },
];


const tagOptions = [
  { value: "weight Loss", label: "Weight Loss" },
  { value: "hiit", label: "HIIT" },
  { value: "strength", label: "Strength" },
  { value: "wellness", label: "Wellness" },
  { value: "cardio", label: "Cardio" },
];

const yesNoOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const validationSchema = Yup.object({
  fullName: Yup.string().required("Full Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phoneNumber: Yup.string()
    .required("Contact number is required")
    .test("is-valid-phone", "Invalid phone number", function (value) {
      return isValidPhoneNumber(value || "");
    }),
  role: Yup.string().required("Role is required"),
  assignedCenters: Yup.array().min(1, "At least one center must be selected"),
  profilePicture: Yup.mixed().when("showOnApp", {
    is: "active",
    then: () =>
      Yup.mixed()
        .required("Profile Picture is required")
        .test("fileType", "Unsupported format", (value) => {
          if (!value) return false;
          return ["image/jpeg", "image/png", "image/webp"].includes(value.type);
        }),
    otherwise: () => Yup.mixed().notRequired(),
  }),
  description: Yup.string().when("showOnApp", {
    is: "active",
    then: () => Yup.string().required("Long Description is required"),
  }),
  tags: Yup.array().when("showOnApp", {
    is: "active",
    then: () => Yup.array().of(Yup.string()).min(1, "Tags are required"),
  }),
});

const CreateStaff = ({ setShowModal, onExerciseCreated, initialData }) => {
  console.log(initialData, "initialData");
  const leadBoxRef = useRef(null);

  const initialValues = {
    fullName: initialData?.fullName || "",
    email: initialData?.email || "",
    phoneNumber: initialData?.phoneNumber || "",
    role: initialData?.role || "",
    assignedCenters: initialData?.assignedCenters || [],
    status: initialData?.status || "ACTIVE",
    showOnApp: initialData?.showOnApp || "inactive",
    profilePicture: initialData?.serviceImage || "",
    description: initialData?.description || "",
    status: initialData?.status || "",
    tags: initialData?.tags || [],
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      // console.log("Submitted Staff Data:", values);
      // setShowModal(false);
      // toast.success("Created Successfully");
      console.log("Formik Errors (if any):", formik.errors);
      const dataToSend = {
        ...values,
        id: initialData?.id || Date.now(), // Preserve ID for edit mode
      };
      onExerciseCreated(dataToSend);
      setShowModal(false);
    },
  });

  console.log(initialValues,'initialValues')

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
      className="bg--blur create--lead--container overflow-auto hide--overflow fixed top-0 left-0 z-[999] w-full bg-black bg-opacity-60 h-full"
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
                    <label className="mb-2 block">
                      Full Name<span className="text-red-500">*</span>
                    </label>
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
                    <label className="mb-2 block">
                      Email<span className="text-red-500">*</span>
                    </label>
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
                    <label className="mb-2 block">
                      Phone Number<span className="text-red-500">*</span>
                    </label>
                    <PhoneInput
                      name="phoneNumber"
                      value={formik.values.phoneNumber}
                      onChange={handlePhoneChange}
                      international
                      defaultCountry="IN"
                      className="custom--input w-full custom--phone"
                      countryCallingCodeEditable={false}
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
                    <label className="mb-2 block">
                      Role<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <FaUser />
                      </span>
                      <Select
                        options={roleOptions}
                        value={roleOptions.find(
                          (option) => option.value === formik.values.role
                        )}
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
                    <label className="mb-2 block">
                      Assigned Center(s)<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <FaRegBuilding />
                      </span>
                      <Select
                        isMulti
                        options={centerOptions}
                        value={centerOptions.filter((option) =>
                          formik.values.assignedCenters.includes(option.value)
                        )}
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

                  <div>
                    <label className="mb-2 block">
                      Show on App<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                        <IoAppsSharp />
                      </span>
                      <Select
                        options={yesNoOptions}
                        value={yesNoOptions.find(
                          (option) => option.value === formik.values.showOnApp
                        )}
                        onChange={(option) =>
                          formik.setFieldValue("showOnApp", option?.value)
                        }
                        onBlur={() => formik.setFieldTouched("showOnApp", true)}
                        styles={selectIcon}
                      />
                    </div>
                  </div>

                  {/* Conditionally rendered fields */}
                 {formik.values?.showOnApp === "active" && (
                    <>
                      {/* Profile Picture */}
                      <div>
                        <label className="mb-2 block">
                          Profile Picture<span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[1]">
                            <MdInsertPhoto />
                          </span>

                          <input
                            type="file"
                            name="profilePicture"
                            accept="image/*"
                            onChange={(event) => {
                              const file = event.currentTarget.files[0];
                              formik.setFieldValue("profilePicture", file);
                            }}
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
                        <label className="mb-2 block">
                          Tags<span className="text-red-500">*</span>
                        </label>
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

                      {/* Status */}
                      <div>
                        <label className="mb-2 block">
                          Staff Status<span className="text-red-500">*</span>
                        </label>
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
                        {formik.touched.status && formik.errors.status && (
                          <p className="text-red-500 text-sm mt-1">
                            {formik.errors.status}
                          </p>
                        )}
                      </div>

                      {/* Description */}
                      <div className="col-span-3">
                        <label className="mb-2 block">
                          Description
                          <span className="text-red-500">*</span>
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
                            <p className="text-red-500 text-sm">
                              {formik.errors.description}
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
