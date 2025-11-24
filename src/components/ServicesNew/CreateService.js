// Import React
import React from "react";
// Import close icon
import { IoCloseCircle } from "react-icons/io5";
// Import icons for input fields
import { FaListUl } from "react-icons/fa6";
import { LuPlug } from "react-icons/lu";
// Import select component
import Select from "react-select";
// Import custom styles for select input
import { handleTextOnlyChange, selectIcon } from "../../Helper/helper";

// CreateService component
const CreateService = ({
  setShowModal,
  editingOption,
  formik,
  handleOverlayClick,
  leadBoxRef,
  clubOptions,
  studioOptions,
}) => {
  // Predefined services type options
  const servicesType = [
    { label: "Group Classes", value: "GROUP_CLASS" },
    { label: "Personal Trainer", value: "PERSONAL_TRAINER" },
    { label: "Recovery", value: "RECOVERY" },
    { label: "Recreation", value: "RECREATION" },
    { label: "Product", value: "PRODUCT" },
  ];

  return (
    // Modal overlay
    <div
      className="bg--blur create--lead--container overflow-auto hide--overflow fixed top-0 left-0 z-[999] w-full bg-black bg-opacity-60 h-full"
      onClick={handleOverlayClick}
    >
      {/* Modal container */}
      <div
        className="min-h-[70vh] w-[95%] max-w-xl mx-auto mt-[100px] mb-[100px] container--leadbox rounded-[10px] flex flex-col"
        ref={leadBoxRef}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="bg-white rounded-t-[10px] flex gap-3 items-center justify-between py-4 px-4 border-b">
          <h2 className="text-xl font-semibold">
            {editingOption ? "Edit Service" : "Create Service"}
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

        {/* Modal body */}
        <div className="flex-1">
          <form onSubmit={formik.handleSubmit} className="p-0 space-y-0">
            <div className="flex bg-white rounded-b-[10px]">
              <div className="p-6 flex-1">
                <div className="grid grid-cols-2 gap-4">
                  {/* Image Upload */}
                  <div>
                    <label className="mb-2 block">
                      Image<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={(event) =>
                          formik.setFieldValue(
                            "image",
                            event.currentTarget.files[0]
                          )
                        }
                        className="custom--input w-full"
                      />
                    </div>
                    {formik.touched.image && formik.errors.image && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.image}
                      </p>
                    )}
                  </div>

                  {/* Title Input */}
                  <div>
                    <label className="mb-2 block">
                      Title<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <FaListUl />
                      </span>
                      <input
                        type="text"
                        name="name"
                        value={formik.values.name}
                        onChange={(e) =>
                          handleTextOnlyChange(e, formik, "name")
                        }
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

                  {/* Club Dropdown */}
                  <div>
                    <label className="mb-2 block">
                      Club<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <FaListUl />
                      </span>
                      <Select
                        name="club_id"
                        value={
                          clubOptions.find(
                            (option) =>
                              option.value.toString() ===
                              formik.values.club_id?.toString()
                          ) || null
                        }
                        options={clubOptions}
                        onChange={(option) =>
                          formik.setFieldValue("club_id", option.value)
                        }
                        onBlur={() => formik.setFieldTouched("club_id", true)}
                        styles={selectIcon}
                        className="!capitalize"
                      />
                    </div>
                    {formik.touched.club_id && formik.errors.club_id && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.club_id}
                      </p>
                    )}
                  </div>

                  {/* Studio Dropdown */}
                  {/* <div>
                    <label className="mb-2 block">
                      Studio<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <FaListUl />
                      </span>
                      <Select
                        name="studio_id"
                        value={
                          studioOptions.find(
                            (option) =>
                              option.value.toString() ===
                              formik.values.studio_id?.toString()
                          ) || null
                        }
                        options={studioOptions}
                        onChange={(option) =>
                          formik.setFieldValue("studio_id", option.value)
                        }
                        onBlur={() =>
                          formik.setFieldTouched("studio_id", true)
                        }
                        styles={selectIcon}
                        className="!capitalize"
                      />
                    </div>
                    {formik.touched.studio_id && formik.errors.studio_id && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.studio_id}
                      </p>
                    )}
                  </div> */}

                  {/* Type Dropdown */}
                  <div>
                    <label className="mb-2 block">
                      Type<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <FaListUl />
                      </span>
                      <Select
                        name="type"
                        value={servicesType.find(
                          (opt) => opt.value === formik.values.type
                        )}
                        onChange={(option) =>
                          formik.setFieldValue("type", option.value)
                        }
                        options={servicesType}
                        styles={selectIcon}
                      />
                    </div>
                    {formik.touched.type && formik.errors.type && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.type}
                      </p>
                    )}
                  </div>

                  {/* Position Input */}
                  <div>
                    <label className="mb-2 block">
                      Position<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px]">
                        <FaListUl />
                      </span>
                      <input
                        type="number"
                        name="position"
                        value={formik.values.position}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full input--icon"
                      />
                    </div>
                    {formik.touched.position && formik.errors.position && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.position}
                      </p>
                    )}
                  </div>

                  {/* Status Dropdown */}
                  <div>
                    <label className="mb-2 block">
                      Status<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-[50%] translate-y-[-50%] left-[15px] z-[10]">
                        <LuPlug />
                      </span>
                      <Select
                        name="status"
                        value={
                          formik.values.status
                            ? {
                                label: formik.values.status,
                                value: formik.values.status,
                              }
                            : ""
                        }
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
                </div>
              </div>
            </div>

            {/* Modal action buttons */}
            <div className="flex gap-4 py-5 justify-end">
              <button
                type="button"
                onClick={() => {
                  formik.resetForm();
                  setShowModal(false);
                }}
                className="px-4 py-2 bg-transparent border border-gray-400 text-white  rounded max-w-[150px] w-full"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white  rounded max-w-[150px] w-full"
              >
                {editingOption ? "Update" : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateService;
